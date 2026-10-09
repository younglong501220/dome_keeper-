export type ResourceType = 'iron' | 'water' | 'cobalt';

export type TileType = 
  | 'empty'
  | 'soil'
  | 'rock'
  | 'hard_rock'
  | 'obsidian'
  | 'iron'
  | 'water'
  | 'cobalt'
  | 'relic'
  | 'gadget_chest';

export interface Tile {
  type: TileType;
  hp: number;
  maxHp: number;
  revealed: boolean;
  glow?: number;
}

export interface ItemDrop {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: ResourceType | 'relic' | 'gadget';
  weight: number;
  attached: boolean;
  tetherIndex?: number;
}

export type EnemyType = 'crawler' | 'flyer' | 'spitter' | 'behemoth';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  dps: number;
  facing: number;
  attackCooldown: number;
  shootCooldown?: number;
  isFlyer: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  isHostile: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  glow?: boolean;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface Upgrades {
  drill: number;          // 1-5: Mining damage
  jetpack: number;        // 1-5: Movement speed
  carryCapacity: number;  // 1-5: Max items carried without heavy drag
  laserDamage: number;    // 1-5: Laser beam DPS & width
  laserTurn: number;      // 1-5: Laser rotation sensitivity
  laserAutoAim: number;   // 0-2: Slight auto tracking assist
  shield: number;         // 0-3: Dome energy overshield
  teleportBeacon: number; // 0-1: Teleports carried minerals to dome when in beacon zone
}

export interface GameStats {
  ironCollected: number;
  waterCollected: number;
  cobaltCollected: number;
  tilesMined: number;
  enemiesDefeated: number;
  maxDepthReached: number;
  wavesSurvived: number;
  timeElapsed: number;
  relicExtracted: boolean;
}

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export type GameDifficulty = 'EASY' | 'NORMAL' | 'HARD';
