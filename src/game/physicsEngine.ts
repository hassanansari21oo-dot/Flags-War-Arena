import Matter from 'matter-js';
import { Country, FlagPlayer, Particle, Shockwave, FloatingText } from '../types/game';
import { getCircularFlagCanvas } from '../utils/flagRenderer';
import { sound } from '../utils/audio';

const { Engine, World, Bodies, Body, Events } = Matter;

export interface ArenaConfig {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  arenaRadius: number;
  dangerRadius: number;
}

export class FlagsPhysicsEngine {
  public engine: Matter.Engine;
  public world: Matter.World;
  public players: Map<number, FlagPlayer> = new Map(); // bodyId -> player
  public particles: Particle[] = [];
  public shockwaves: Shockwave[] = [];
  public floatingTexts: FloatingText[] = [];

  // Arena geometry
  public config: ArenaConfig;
  private wallBodies: Matter.Body[] = [];
  private hazardBars: { body: Matter.Body; speed: number; length: number; width: number; angle: number; color: string }[] = [];
  
  // Danger zone visuals
  public dangerAngle: number = 0;
  public arenaPulse: number = 0;
  public screenShake: number = 0;

  // Callbacks
  public onEliminated?: (player: FlagPlayer, remainingCount: number) => void;
  public onRoundWon?: (winner: FlagPlayer) => void;

  private isRunning: boolean = true;
  public isRoundOver: boolean = false;
  private lastTime: number = 0;
  private simulationSpeed: number = 1.0;

  constructor(width: number, height: number) {
    this.engine = Engine.create({
      gravity: { x: 0, y: 0, scale: 0 }, // Zero standard gravity, we use customized orbital/flow dynamics
    });
    this.world = this.engine.world;

    this.config = this.calculateArenaConfig(width, height);
    this.buildArena();
    this.setupCollisions();
  }

  public setSimulationSpeed(speed: number) {
    this.simulationSpeed = speed;
  }

  public resize(width: number, height: number) {
    const oldConfig = { ...this.config };
    this.config = this.calculateArenaConfig(width, height);

    // If center or radius changed substantially, rebuild arena walls and hazard bars
    const scaleFactor = this.config.arenaRadius / (oldConfig.arenaRadius || 1);

    // Reposition active flags proportionately
    this.players.forEach((player) => {
      const body = this.world.bodies.find((b) => b.id === player.bodyId);
      if (body) {
        const dx = body.position.x - oldConfig.centerX;
        const dy = body.position.y - oldConfig.centerY;
        const newX = this.config.centerX + dx * scaleFactor;
        const newY = this.config.centerY + dy * scaleFactor;
        Body.setPosition(body, { x: newX, y: newY });
      }
    });

    this.buildArena();
  }

  private calculateArenaConfig(width: number, height: number): ArenaConfig {
    // Keep portrait aspect or square fit within bounds
    const availableW = width;
    const availableH = height - 170; // reserve space for top HUD & bottom bar
    const minDim = Math.min(availableW * 0.94, availableH * 0.92);

    const arenaRadius = Math.max(140, Math.min(minDim / 2, 280));
    const centerX = width / 2;
    const centerY = Math.max(arenaRadius + 75, height / 2 - 20);
    const dangerRadius = Math.round(arenaRadius * 0.22); // ~35-55px danger zone

    return {
      width,
      height,
      centerX,
      centerY,
      arenaRadius,
      dangerRadius,
    };
  }

  private buildArena() {
    // 1. Remove old wall bodies and hazard bars
    this.wallBodies.forEach((b) => World.remove(this.world, b));
    this.wallBodies = [];

    this.hazardBars.forEach((bar) => World.remove(this.world, bar.body));
    this.hazardBars = [];

    const { centerX, centerY, arenaRadius, dangerRadius } = this.config;

    // 2. Build circular segmented boundary (36 segments for smooth bounce)
    const segments = 36;
    const wallThickness = 40;
    const step = (Math.PI * 2) / segments;
    const segmentLength = (Math.PI * 2 * (arenaRadius + wallThickness / 2)) / segments + 4;

    for (let i = 0; i < segments; i++) {
      const angle = i * step;
      const x = centerX + Math.cos(angle) * (arenaRadius + wallThickness / 2);
      const y = centerY + Math.sin(angle) * (arenaRadius + wallThickness / 2);

      const segment = Bodies.rectangle(x, y, segmentLength, wallThickness, {
        isStatic: true,
        angle: angle + Math.PI / 2,
        restitution: 0.92,
        friction: 0.05,
        render: { visible: false },
      });

      this.wallBodies.push(segment);
      World.add(this.world, segment);
    }

    // 3. Build rotating hazard bars
    // Bar 1: Center dual-sweeper blade pivoted near danger zone
    const bar1Length = arenaRadius * 0.82;
    const bar1Width = 14;
    const bar1Body = Bodies.rectangle(centerX, centerY, bar1Length, bar1Width, {
      isStatic: true,
      restitution: 1.15, // extra bounce kick!
      friction: 0.1,
      render: { visible: false },
    });
    World.add(this.world, bar1Body);
    this.hazardBars.push({
      body: bar1Body,
      speed: 0.016, // clockwise rotation
      length: bar1Length,
      width: bar1Width,
      angle: 0,
      color: '#06b6d4', // cyan-teal neon
    });

    // Bar 2: Second counter-rotating cross blade (shorter, faster)
    const bar2Length = arenaRadius * 0.65;
    const bar2Width = 12;
    const bar2Body = Bodies.rectangle(centerX, centerY, bar2Length, bar2Width, {
      isStatic: true,
      restitution: 1.2,
      friction: 0.1,
      render: { visible: false },
    });
    World.add(this.world, bar2Body);
    this.hazardBars.push({
      body: bar2Body,
      speed: -0.024, // counter-clockwise
      length: bar2Length,
      width: bar2Width,
      angle: Math.PI / 2,
      color: '#c084fc', // neon purple
    });

    // Bar 3: Outer orbital bumper blade
    const bar3Length = arenaRadius * 0.45;
    const bar3Width = 10;
    const bar3Body = Bodies.rectangle(centerX, centerY, bar3Length, bar3Width, {
      isStatic: true,
      restitution: 1.25,
      friction: 0.1,
      render: { visible: false },
    });
    World.add(this.world, bar3Body);
    this.hazardBars.push({
      body: bar3Body,
      speed: 0.035, // fast sweep
      length: bar3Length,
      width: bar3Width,
      angle: Math.PI / 4,
      color: '#f43f5e', // neon rose
    });
  }

  private setupCollisions() {
    Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const playerA = this.players.get(bodyA.id);
        const playerB = this.players.get(bodyB.id);

        // Flag to Flag collision
        if (playerA && playerB) {
          const speedA = Math.hypot(bodyA.velocity.x, bodyA.velocity.y);
          const speedB = Math.hypot(bodyB.velocity.x, bodyB.velocity.y);
          const relSpeed = speedA + speedB;
          if (relSpeed > 1.5) {
            sound.playBounce(relSpeed);
            // Spawn tiny collision spark
            const midX = (bodyA.position.x + bodyB.position.x) / 2;
            const midY = (bodyA.position.y + bodyB.position.y) / 2;
            this.spawnSparks(midX, midY, 3, '#38bdf8');
          }
        }

        // Flag hitting Hazard Bar
        const isBar = this.hazardBars.some((hb) => hb.body === bodyA || hb.body === bodyB);
        if ((playerA || playerB) && isBar) {
          sound.playBarHit();
          const pBody = playerA ? bodyA : bodyB;
          this.spawnSparks(pBody.position.x, pBody.position.y, 6, '#f43f5e');
          // Add extra impulse kick away from bar
          const kickDirX = (pBody.position.x - this.config.centerX) * 0.005;
          const kickDirY = (pBody.position.y - this.config.centerY) * 0.005;
          Body.applyForce(pBody, pBody.position, { x: kickDirX, y: kickDirY });
        }
      });
    });
  }

  // Check if a country code is currently active in arena
  public isCountryActive(code: string): boolean {
    for (const player of this.players.values()) {
      if (player.code.toUpperCase() === code.toUpperCase() && player.isAlive) {
        return true;
      }
    }
    return false;
  }

  // Add a new country flag player into the arena
  public addPlayer(country: Country): boolean {
    if (this.isCountryActive(country.code)) {
      return false; // ignore duplicates
    }

    const { centerX, centerY, arenaRadius, dangerRadius } = this.config;
    const flagRadius = Math.max(16, Math.min(Math.round(arenaRadius * 0.088), 22));

    // Spawn point: Safe perimeter at top or randomized angle
    const spawnAngle = -Math.PI / 2 + (Math.random() * 0.9 - 0.45);
    const spawnDistance = arenaRadius * (0.65 + Math.random() * 0.2);
    const x = centerX + Math.cos(spawnAngle) * spawnDistance;
    const y = centerY + Math.sin(spawnAngle) * spawnDistance;

    const body = Bodies.circle(x, y, flagRadius, {
      restitution: 0.88,
      friction: 0.04,
      frictionAir: 0.002,
      density: 0.003,
      render: { visible: false },
    });

    // Give an initial fun drop impulse
    const angleToCenter = Math.atan2(centerY - y, centerX - x);
    const speed = 2.5 + Math.random() * 2;
    Body.setVelocity(body, {
      x: Math.cos(angleToCenter) * speed + (Math.random() * 2 - 1),
      y: Math.sin(angleToCenter) * speed + 1,
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);

    World.add(this.world, body);

    const player: FlagPlayer = {
      id: `${country.code}_${Date.now()}_${Math.random()}`,
      code: country.code,
      name: country.name,
      flag: country.flag,
      bodyId: body.id,
      radius: flagRadius,
      isAlive: true,
      kills: 0,
    };

    this.players.set(body.id, player);

    // Spawn visual feedback & sound
    this.spawnDropEffect(x, y, country.flag);
    sound.playDrop();

    return true;
  }

  // Add multiple countries (e.g. 30 random flags)
  public addMultiple(countries: Country[], clearFirst: boolean = false) {
    this.isRoundOver = false;
    if (clearFirst) {
      this.clearAllFlags();
    }

    countries.forEach((country, index) => {
      // Stagger drops slightly for great visual cascade
      setTimeout(() => {
        if (this.isRunning) {
          this.addPlayer(country);
        }
      }, index * 45);
    });
  }

  public clearAllFlags() {
    this.isRoundOver = false;
    this.players.forEach((player) => {
      const body = this.world.bodies.find((b) => b.id === player.bodyId);
      if (body) {
        World.remove(this.world, body);
      }
    });
    this.players.clear();
    this.particles = [];
    this.shockwaves = [];
  }

  public getAlivePlayers(): FlagPlayer[] {
    return Array.from(this.players.values()).filter((p) => p.isAlive);
  }

  // Visual effects
  private spawnDropEffect(x: number, y: number, flagEmoji: string) {
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: 38,
      alpha: 0.85,
      color: '#38bdf8',
      lineWidth: 2.5,
    });
    this.spawnSparks(x, y, 10, '#38bdf8');
  }

  private spawnSparks(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2,
        color,
        alpha: 1,
        decay: 0.03 + Math.random() * 0.04,
        life: 0,
        maxLife: 25 + Math.random() * 15,
        shape: 'spark',
      });
    }
  }

  private spawnEliminationExplosion(x: number, y: number, countryName: string, flagEmoji: string) {
    // 1. Shockwaves
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 75,
      alpha: 1,
      color: '#f43f5e',
      lineWidth: 4,
    });
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: 45,
      alpha: 0.9,
      color: '#c084fc',
      lineWidth: 2,
    });

    // 2. High density neon explosion particles
    const colors = ['#f43f5e', '#ec4899', '#c084fc', '#38bdf8', '#fbbf24', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
        life: 0,
        maxLife: 30 + Math.random() * 25,
        shape: Math.random() > 0.4 ? 'circle' : 'spark',
      });
    }

    // 3. Floating elimination label
    this.floatingTexts.push({
      id: `${Date.now()}_${Math.random()}`,
      text: `${flagEmoji} ${countryName}`,
      x,
      y: y - 10,
      alpha: 1,
      color: '#ff4d6d',
      scale: 1,
    });

    // 4. Screen micro shake
    this.screenShake = 6.0;

    // 5. Sound
    sound.playElimination();
  }

  // Physics update step
  public update(dt: number) {
    if (!this.isRunning) return;

    // Clamp dt
    const clampedDt = Math.min(dt, 0.05) * 1000 * this.simulationSpeed;
    Engine.update(this.engine, clampedDt);

    const { centerX, centerY, arenaRadius, dangerRadius } = this.config;

    // Rotate hazard bars
    this.hazardBars.forEach((bar) => {
      bar.angle += bar.speed * this.simulationSpeed;
      Body.setAngle(bar.body, bar.angle);
      // Keep bar position pinned to center
      Body.setPosition(bar.body, { x: centerX, y: centerY });
    });

    // Danger zone visual rotation & pulse
    this.dangerAngle += 0.03 * this.simulationSpeed;
    this.arenaPulse = (this.arenaPulse + 0.03) % (Math.PI * 2);

    // Screen shake decay
    if (this.screenShake > 0.05) {
      this.screenShake *= 0.88;
    } else {
      this.screenShake = 0;
    }

    // Danger zone ambient embers
    if (Math.random() < 0.35) {
      const emberAngle = Math.random() * Math.PI * 2;
      const dist = dangerRadius * (0.4 + Math.random() * 0.6);
      this.particles.push({
        x: centerX + Math.cos(emberAngle) * dist,
        y: centerY + Math.sin(emberAngle) * dist,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.6 - Math.random() * 1.2,
        radius: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#f43f5e' : '#ec4899',
        alpha: 0.9,
        decay: 0.035,
        life: 0,
        maxLife: 20 + Math.random() * 10,
        shape: 'spark',
      });
    }

    // Process flags: check danger zone elimination & soft orbital currents
    const aliveBefore = this.getAlivePlayers().length;

    this.players.forEach((player) => {
      if (!player.isAlive) return;

      const body = this.world.bodies.find((b) => b.id === player.bodyId);
      if (!body) return;

      const dx = body.position.x - centerX;
      const dy = body.position.y - centerY;
      const distToCenter = Math.hypot(dx, dy);

      // 1. ELIMINATION CHECK: Touching danger zone
      if (distToCenter <= dangerRadius + player.radius) {
        player.isAlive = false;
        player.eliminatedAt = Date.now();

        // Remove from Matter world
        World.remove(this.world, body);

        // Visual + audio explosion
        this.spawnEliminationExplosion(body.position.x, body.position.y, player.name, player.flag);

        const aliveAfter = this.getAlivePlayers().length;
        if (this.onEliminated) {
          this.onEliminated(player, aliveAfter);
        }

        // Check if only 1 remaining (Winner!)
        if (aliveAfter === 1 && !this.isRoundOver) {
          this.isRoundOver = true;
          const winner = this.getAlivePlayers()[0];
          if (winner && this.onRoundWon) {
            this.onRoundWon(winner);
          }
        }
        return;
      }

      // 2. SAFETY CLAMP: If somehow tunneled outside arena wall, bounce back in
      if (distToCenter > arenaRadius - player.radius) {
        const nx = dx / distToCenter;
        const ny = dy / distToCenter;
        const clampedDist = arenaRadius - player.radius - 1;
        Body.setPosition(body, {
          x: centerX + nx * clampedDist,
          y: centerY + ny * clampedDist,
        });
        // Inward velocity bounce
        const inwardV = Math.abs(body.velocity.x * nx + body.velocity.y * ny) + 1.5;
        Body.setVelocity(body, {
          x: -nx * inwardV,
          y: -ny * inwardV,
        });
      }

      // 3. GENTLE SWIRL & INWARD FLOW: Keeps gameplay dynamic & prevents camping
      // Tangential velocity + tiny inward pull
      const tangentX = -dy / distToCenter;
      const tangentY = dx / distToCenter;
      const inwardForce = 0.000035 * body.mass;
      const swirlForce = 0.000045 * body.mass;

      Body.applyForce(body, body.position, {
        x: (-dx / distToCenter) * inwardForce + tangentX * swirlForce,
        y: (-dy / distToCenter) * inwardForce + tangentY * swirlForce,
      });
    });

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay;
      p.life++;
      if (p.alpha <= 0 || p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.16;
      sw.alpha -= 0.04;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius - 1) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.8;
      ft.alpha -= 0.02;
      ft.scale = Math.min(ft.scale + 0.02, 1.25);
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // Canvas Render Loop
  public render(ctx: CanvasRenderingContext2D) {
    const { width, height, centerX, centerY, arenaRadius, dangerRadius } = this.config;

    ctx.save();

    // 1. Clear background: deep dark space-blue
    ctx.fillStyle = '#060914';
    ctx.fillRect(0, 0, width, height);

    // Apply Screen Shake if active
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // 2. Draw Arena Floor: concentric ambient grid & subtle glow
    const floorGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      dangerRadius * 1.2,
      centerX,
      centerY,
      arenaRadius
    );
    floorGrad.addColorStop(0, '#0a102b');
    floorGrad.addColorStop(0.5, '#070b1c');
    floorGrad.addColorStop(1, '#050713');

    ctx.beginPath();
    ctx.arc(centerX, centerY, arenaRadius, 0, Math.PI * 2);
    ctx.fillStyle = floorGrad;
    ctx.fill();

    // Arena subtle radar rings
    ctx.save();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.lineWidth = 1;
    [0.4, 0.65, 0.85].forEach((pct) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, arenaRadius * pct, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX - arenaRadius * 0.9, centerY);
    ctx.lineTo(centerX + arenaRadius * 0.9, centerY);
    ctx.moveTo(centerX, centerY - arenaRadius * 0.9);
    ctx.lineTo(centerX, centerY + arenaRadius * 0.9);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.06)';
    ctx.stroke();
    ctx.restore();

    // 3. Draw Rotating Hazard Bars
    this.hazardBars.forEach((bar) => {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(bar.angle);

      // Bar shadow / neon glow
      ctx.shadowColor = bar.color;
      ctx.shadowBlur = 12;

      // Outer neon stroke
      ctx.fillStyle = bar.color;
      ctx.beginPath();
      ctx.roundRect(-bar.length / 2, -bar.width / 2, bar.length, bar.width, bar.width / 2);
      ctx.fill();

      // Inner bright core
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-bar.length / 2 + 3, -bar.width / 2 + 2, bar.length - 6, bar.width - 4, (bar.width - 4) / 2);
      ctx.fill();

      // Bumper end caps
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-bar.length / 2 + bar.width / 2, 0, bar.width * 0.35, 0, Math.PI * 2);
      ctx.arc(bar.length / 2 - bar.width / 2, 0, bar.width * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 4. Draw Center Rotating DANGER ZONE
    ctx.save();
    ctx.translate(centerX, centerY);

    // Hazard warning pulsing perimeter ring
    const pulseOffset = Math.sin(this.arenaPulse) * 3;
    const currentDangerR = dangerRadius + pulseOffset;

    // Glowing electric aura
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 24;

    const dangerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentDangerR);
    dangerGrad.addColorStop(0, '#4c0519');
    dangerGrad.addColorStop(0.5, '#9f1239');
    dangerGrad.addColorStop(0.9, '#f43f5e');
    dangerGrad.addColorStop(1, '#ff0055');

    ctx.fillStyle = dangerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, currentDangerR, 0, Math.PI * 2);
    ctx.fill();

    // Rotating serrated vortex blades inside danger zone
    ctx.rotate(this.dangerAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const a = (i * Math.PI * 2) / teeth;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * (currentDangerR - 2), Math.sin(a) * (currentDangerR - 2));
      ctx.stroke();
    }

    // Center skull or hazard core emblem
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(dangerRadius * 0.72)}px sans-serif`;
    ctx.fillText('⚡', 0, 0);

    // Hazard outer boundary dash ring
    ctx.rotate(-this.dangerAngle * 2);
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, currentDangerR + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();

    // 5. Draw Outer Glowing Cyan Wall
    ctx.save();
    // Cyan Wall Neon Outer Glow
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, arenaRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner bright white laser core
    ctx.shadowBlur = 4;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, arenaRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Pulsing outer barrier ring
    const barrierR = arenaRadius + 8 + Math.sin(this.arenaPulse * 1.5) * 2;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, barrierR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 6. Draw Flags (Round players)
    this.players.forEach((player) => {
      if (!player.isAlive) return;

      const body = this.world.bodies.find((b) => b.id === player.bodyId);
      if (!body) return;

      const { x, y } = body.position;
      const angle = body.angle;
      const diameter = player.radius * 2;

      ctx.save();
      ctx.translate(x, y);

      // Flag drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      // Rotate with physics body angle
      ctx.rotate(angle);

      // Render pre-rendered cached flag canvas
      const flagCanvas = getCircularFlagCanvas(player.code, player.flag, diameter);
      ctx.drawImage(flagCanvas, -player.radius, -player.radius, diameter, diameter);

      ctx.restore();

      // Country label under flag (keeps upright regardless of rotation for legibility)
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 4;
      ctx.fillText(player.code, 0, player.radius + 12);
      ctx.restore();
    });

    // 7. Draw Shockwaves
    this.shockwaves.forEach((sw) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.lineWidth;
      ctx.globalAlpha = sw.alpha;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    });

    // 8. Draw Particles
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;

      if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 9. Draw Floating Elimination Texts
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    });

    ctx.restore();
  }
}
