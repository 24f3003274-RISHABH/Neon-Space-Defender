export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type DifficultyMode = 'EASY' | 'NORMAL' | 'HARD' | 'NIGHTMARE';

export type ShipSkin = 'CYAN_VIPER' | 'NEON_PHOENIX' | 'EMERALD_SPECTRE' | 'SOLAR_FLARE';

export type PowerUpType = 'SHIELD' | 'TRIPLE_SHOT' | 'RAPID_FIRE' | 'NUKE_BOMB' | 'REPAIR_KIT' | 'SCORE_BOOST';

export interface PowerUpItem {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  duration: number; // in seconds
  color: string;
  label: string;
  symbol: string;
  pulsePhase: number;
}

export interface ActiveBuff {
  type: PowerUpType;
  timeLeft: number;
  maxDuration: number;
  color: string;
  label: string;
}

export interface GameStats {
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  level: number;
  wave: number;
  enemiesDestroyed: number;
  accuracy: number;
  shotsFired: number;
  shotsHit: number;
  bossDefeated: number;
  activeBuffs: ActiveBuff[];
  bombCount: number;
  maxBombs: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  glow?: boolean;
  shape?: 'circle' | 'spark' | 'ring' | 'line';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  color: string;
  layer: number;
}

export interface AudioSettings {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number;
}
