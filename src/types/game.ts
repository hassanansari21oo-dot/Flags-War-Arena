export interface Country {
  code: string;
  name: string;
  flag: string;
  aliases?: string[];
}

export interface FlagPlayer {
  id: string; // unique instance id
  code: string;
  name: string;
  flag: string;
  color?: string;
  bodyId: number;
  radius: number;
  isAlive: boolean;
  eliminatedAt?: number;
  kills?: number;
}

export interface LeaderboardEntry {
  code: string;
  name: string;
  flag: string;
  score: number; // number of wins
  participations: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'spark' | 'ring';
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
  scale: number;
}

export type GameState = 'LOBBY' | 'PLAYING' | 'CYCLE_SUMMARY';
