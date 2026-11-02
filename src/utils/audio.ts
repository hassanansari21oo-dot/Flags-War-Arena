class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastBounceTime: number = 0;

  constructor() {
    const saved = localStorage.getItem('flags_arena_muted');
    this.isMuted = saved === 'true';
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('flags_arena_muted', String(this.isMuted));
    return this.isMuted;
  }

  // Soft elastic bounce on wall or flag-to-flag collision
  public playBounce(velocityMag: number = 2) {
    if (this.isMuted) return;
    const now = performance.now();
    // throttle rapid fire bounces to avoid sound clutter
    if (now - this.lastBounceTime < 35) return;
    this.lastBounceTime = now;

    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const intensity = Math.min(Math.max((velocityMag - 1) / 8, 0.1), 1.0);
      const baseFreq = 160 + intensity * 120 + (Math.random() * 40 - 20);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08 * intensity, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.055);
    } catch {
      // AudioContext errors ignored
    }
  }

  // Metallic hit on spinning hazard bar
  public playBarHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.085);
    } catch {
      // ignore
    }
  }

  // Elimination blast
  public playElimination() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Sub bass impact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.25);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);

      // 2. High noise crackle / zap
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.15);
      filter.Q.value = 2;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.16, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(t);
    } catch {
      // ignore
    }
  }

  // Spawn / Flag Drop sound
  public playDrop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const t = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(650, t + 0.12);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.13);
    } catch {
      // ignore
    }
  }

  // Victory Fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
      const startTime = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const noteTime = startTime + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.36);
      });
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundEngine();
