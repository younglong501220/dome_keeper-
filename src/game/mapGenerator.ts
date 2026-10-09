import { GRID_COLS, GRID_ROWS, GROUND_ROW, TILE_DEFINITIONS } from './constants';
import { Tile, TileType } from './types';

export function generateWorld(): { grid: (Tile | null)[][]; relicLoc: { r: number; c: number } } {
  const grid: (Tile | null)[][] = [];
  const centerCol = Math.floor(GRID_COLS / 2);

  // Initialize empty grid
  for (let r = 0; r < GRID_ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      grid[r][c] = null;
    }
  }

  // 1. Fill ground tiles
  for (let r = GROUND_ROW; r < GRID_ROWS; r++) {
    const depth = r - GROUND_ROW;
    for (let c = 0; c < GRID_COLS; c++) {
      // Dome base opening and entrance shaft (clear columns centerCol-1 to centerCol+1 for easy descent)
      if (r <= GROUND_ROW + 2 && c >= centerCol - 1 && c <= centerCol + 1) {
        grid[r][c] = null;
        continue;
      }

      // Base rock layer determination based on depth
      let baseType: TileType = 'soil';
      if (depth < 12) {
        baseType = Math.random() < 0.25 + depth * 0.02 ? 'rock' : 'soil';
      } else if (depth < 26) {
        baseType = Math.random() < 0.4 ? 'hard_rock' : 'rock';
      } else if (depth < 42) {
        baseType = Math.random() < 0.45 ? 'obsidian' : 'hard_rock';
      } else {
        baseType = Math.random() < 0.7 ? 'obsidian' : 'hard_rock';
      }

      const def = TILE_DEFINITIONS[baseType];
      grid[r][c] = {
        type: baseType,
        hp: def.hp,
        maxHp: def.hp,
        revealed: false,
      };
    }
  }

  // 2. Generate Mineral Clusters (Iron, Water, Cobalt)
  // Helper to place cluster
  const placeCluster = (centerR: number, centerC: number, type: TileType, radius: number) => {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const nr = centerR + dr;
        const nc = centerC + dc;
        if (
          nr >= GROUND_ROW + 1 &&
          nr < GRID_ROWS &&
          nc >= 0 &&
          nc < GRID_COLS &&
          grid[nr][nc] !== null &&
          grid[nr][nc]?.type !== 'relic' &&
          grid[nr][nc]?.type !== 'gadget_chest'
        ) {
          if (Math.hypot(dr, dc) <= radius + 0.3 && Math.random() < 0.75) {
            const def = TILE_DEFINITIONS[type];
            grid[nr][nc] = {
              type,
              hp: def.hp,
              maxHp: def.hp,
              revealed: false,
            };
          }
        }
      }
    }
  };

  // Iron veins (plentiful, across all depths)
  const numIronVeins = 18;
  for (let i = 0; i < numIronVeins; i++) {
    const vr = GROUND_ROW + 3 + Math.floor(Math.random() * (GRID_ROWS - GROUND_ROW - 5));
    const vc = Math.floor(Math.random() * GRID_COLS);
    placeCluster(vr, vc, 'iron', Math.random() < 0.6 ? 1 : 2);
  }

  // Water deposits (concentrated around mid depth)
  const numWaterVeins = 10;
  for (let i = 0; i < numWaterVeins; i++) {
    const vr = GROUND_ROW + 6 + Math.floor(Math.random() * (GRID_ROWS - GROUND_ROW - 10));
    const vc = Math.floor(Math.random() * GRID_COLS);
    placeCluster(vr, vc, 'water', 1);
  }

  // Cobalt crystals (rare, deep)
  const numCobaltVeins = 7;
  for (let i = 0; i < numCobaltVeins; i++) {
    const vr = GROUND_ROW + 16 + Math.floor(Math.random() * (GRID_ROWS - GROUND_ROW - 18));
    const vc = Math.floor(Math.random() * GRID_COLS);
    placeCluster(vr, vc, 'cobalt', 1);
  }

  // 3. Precursor Gadget Chest (Row 22 - 32)
  const gadgetR = GROUND_ROW + 18 + Math.floor(Math.random() * 10);
  const gadgetC = Math.max(3, Math.min(GRID_COLS - 4, Math.floor(Math.random() * GRID_COLS)));
  const gDef = TILE_DEFINITIONS.gadget_chest;
  grid[gadgetR][gadgetC] = {
    type: 'gadget_chest',
    hp: gDef.hp,
    maxHp: gDef.hp,
    revealed: false,
  };

  // 4. Ancient Relic Chamber (Deep abyss, rows 48-55)
  const relicR = GRID_ROWS - 6 - Math.floor(Math.random() * 4);
  const relicC = Math.max(4, Math.min(GRID_COLS - 5, Math.floor(Math.random() * GRID_COLS)));
  const rDef = TILE_DEFINITIONS.relic;
  grid[relicR][relicC] = {
    type: 'relic',
    hp: rDef.hp,
    maxHp: rDef.hp,
    revealed: false,
  };

  // Surround relic with a small mysterious vault wall of obsidian
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const nr = relicR + dr;
      const nc = relicC + dc;
      if (nr >= GROUND_ROW && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
        if (nr === relicR && nc === relicC) continue;
        if (Math.hypot(dr, dc) <= 2.2 && grid[nr][nc]?.type !== 'relic') {
          const obsDef = TILE_DEFINITIONS.obsidian;
          grid[nr][nc] = {
            type: 'obsidian',
            hp: obsDef.hp,
            maxHp: obsDef.hp,
            revealed: false,
          };
        }
      }
    }
  }

  // Pre-reveal tiles adjacent to dome entrance
  for (let r = GROUND_ROW; r <= GROUND_ROW + 3; r++) {
    for (let c = centerCol - 3; c <= centerCol + 3; c++) {
      if (r < GRID_ROWS && c >= 0 && c < GRID_COLS && grid[r][c]) {
        grid[r][c]!.revealed = true;
      }
    }
  }

  return { grid, relicLoc: { r: relicR, c: relicC } };
}
