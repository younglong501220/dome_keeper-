import { TileType } from './types';

export const TILE_SIZE = 36;
export const GRID_COLS = 28;
export const GRID_ROWS = 60;
export const GROUND_ROW = 7; // Surface ground starts at row 7

export interface TileDefinition {
  type: TileType;
  hp: number;
  color: string;
  borderColor: string;
  oreColor?: string;
  name: string;
  glowColor?: string;
  dropYield?: number;
}

export const TILE_DEFINITIONS: Record<TileType, TileDefinition> = {
  empty: {
    type: 'empty',
    hp: 0,
    color: '#0e111a',
    borderColor: '#0e111a',
    name: '空洞',
  },
  soil: {
    type: 'soil',
    hp: 1.0,
    color: '#433426',
    borderColor: '#34261a',
    name: '表層軟土',
  },
  rock: {
    type: 'rock',
    hp: 2.2,
    color: '#323744',
    borderColor: '#232733',
    name: '玄武岩',
  },
  hard_rock: {
    type: 'hard_rock',
    hp: 4.5,
    color: '#282b36',
    borderColor: '#191b24',
    name: '深層花崗岩',
  },
  obsidian: {
    type: 'obsidian',
    hp: 9.0,
    color: '#1a1924',
    borderColor: '#100f18',
    name: '黑曜極岩',
  },
  iron: {
    type: 'iron',
    hp: 2.5,
    color: '#4e3b32',
    borderColor: '#392921',
    oreColor: '#e0a96d',
    glowColor: 'rgba(224, 169, 109, 0.4)',
    name: '鐵礦石',
    dropYield: 2,
  },
  water: {
    type: 'water',
    hp: 2.0,
    color: '#22384a',
    borderColor: '#142634',
    oreColor: '#4ea8de',
    glowColor: 'rgba(78, 168, 222, 0.45)',
    name: '地下水泉',
    dropYield: 2,
  },
  cobalt: {
    type: 'cobalt',
    hp: 4.0,
    color: '#382346',
    borderColor: '#261430',
    oreColor: '#c743cb',
    glowColor: 'rgba(199, 67, 203, 0.5)',
    name: '高能鈷礦',
    dropYield: 1,
  },
  relic: {
    type: 'relic',
    hp: 7.5,
    color: '#3d3420',
    borderColor: '#2b2314',
    oreColor: '#ffd166',
    glowColor: 'rgba(255, 209, 102, 0.8)',
    name: '古代遺跡核心',
    dropYield: 1,
  },
  gadget_chest: {
    type: 'gadget_chest',
    hp: 4.0,
    color: '#1e3838',
    borderColor: '#112222',
    oreColor: '#06d6a0',
    glowColor: 'rgba(6, 214, 160, 0.6)',
    name: '先驅者科技艙',
    dropYield: 1,
  },
};

export const UPGRADE_CONFIG = {
  drill: [
    { level: 1, costIron: 0, costWater: 0, multiplier: 1.0, desc: '標準鑽頭，適合開鑿表土' },
    { level: 2, costIron: 3, costWater: 0, multiplier: 1.8, desc: '硬質合金鑽頭，挖掘速度 +80%' },
    { level: 3, costIron: 6, costWater: 1, multiplier: 2.9, desc: '震波旋轉鑽頭，挖掘速度 +190%' },
    { level: 4, costIron: 10, costWater: 3, multiplier: 4.5, desc: '高能離子電弧鑽，破壞堅硬岩層' },
    { level: 5, costIron: 16, costWater: 5, multiplier: 7.0, desc: '反物質衝擊鑽，如入無人之境' },
  ],
  jetpack: [
    { level: 1, costIron: 0, costWater: 0, speed: 175, desc: '基礎推力背包' },
    { level: 2, costIron: 3, costWater: 0, speed: 220, desc: '增壓氣閥，移動速度 +25%' },
    { level: 3, costIron: 6, costWater: 1, speed: 270, desc: '雙向向量噴射口，移動速度 +55%' },
    { level: 4, costIron: 10, costWater: 2, speed: 330, desc: '高純燃料混合器，移動速度 +90%' },
    { level: 5, costIron: 15, costWater: 4, speed: 400, desc: '超重力懸浮引擎，極致穿梭' },
  ],
  carryCapacity: [
    { level: 1, costIron: 0, costWater: 0, maxTether: 3, dragFactor: 0.18, desc: '最多拖曳 3 個礦物' },
    { level: 2, costIron: 3, costWater: 0, maxTether: 5, dragFactor: 0.14, desc: '牽引繩強化，可拖曳 5 個礦物' },
    { level: 3, costIron: 6, costWater: 1, maxTether: 8, dragFactor: 0.10, desc: '磁吸牽引束，可拖曳 8 個礦物' },
    { level: 4, costIron: 10, costWater: 2, maxTether: 12, dragFactor: 0.07, desc: '慣性阻尼鎖鏈，可拖曳 12 個礦物' },
    { level: 5, costIron: 15, costWater: 4, maxTether: 18, dragFactor: 0.04, desc: '反重力拖曳網，負重幾乎無感' },
  ],
  laserDamage: [
    { level: 1, costIron: 0, costWater: 0, dps: 55, beamWidth: 4, desc: '基礎脈衝雷射 (55 DPS)' },
    { level: 2, costIron: 4, costWater: 1, dps: 90, beamWidth: 6, desc: '雙頻聚焦透鏡 (90 DPS)' },
    { level: 3, costIron: 8, costWater: 2, dps: 145, beamWidth: 8, desc: '重水冷卻光子腔 (145 DPS)' },
    { level: 4, costIron: 14, costWater: 4, dps: 220, beamWidth: 10, desc: '連鎖電漿爆發 (220 DPS)' },
    { level: 5, costIron: 22, costWater: 7, dps: 340, beamWidth: 14, desc: '滅絕級聚能死光 (340 DPS)' },
  ],
  laserTurn: [
    { level: 1, costIron: 0, costWater: 0, turnSpeed: 1.6, desc: '標準旋轉轉軸' },
    { level: 2, costIron: 3, costWater: 1, turnSpeed: 2.4, desc: '磁懸浮轉動座，轉向靈敏度 +50%' },
    { level: 3, costIron: 6, costWater: 2, turnSpeed: 3.4, desc: '神經元伺服馬達，轉向靈敏度 +110%' },
    { level: 4, costIron: 10, costWater: 3, turnSpeed: 4.6, desc: '超導陀螺轉軸，瞬間鎖定目標' },
  ],
  shield: [
    { level: 0, costIron: 0, costWater: 0, costCobalt: 0, maxShield: 0, desc: '尚未安裝' },
    { level: 1, costIron: 6, costWater: 3, costCobalt: 1, maxShield: 50, desc: '啟用電磁能量護盾 (50 點過載護盾)' },
    { level: 2, costIron: 12, costWater: 5, costCobalt: 2, maxShield: 100, desc: '超導護盾發生器 (100 點過載護盾)' },
    { level: 3, costIron: 18, costWater: 8, costCobalt: 3, maxShield: 160, desc: '等離子力場覆蓋 (160 點過載護盾)' },
  ],
  teleportBeacon: [
    { level: 0, costIron: 0, costWater: 0, costCobalt: 0, desc: '未解鎖' },
    { level: 1, costIron: 10, costWater: 4, costCobalt: 2, desc: '地底量子傳送光柱：在基地正下方深層自動將礦物傳輸至穹頂！' }
  ],
  repair: {
    costCobalt: 1,
    healAmount: 40,
    desc: '使用 1 顆珍貴鈷礦修復穹頂外殼 40 點生命值'
  }
};
