import { audio } from './audio';
import { GRID_COLS, GRID_ROWS, GROUND_ROW, TILE_DEFINITIONS, TILE_SIZE, UPGRADE_CONFIG } from './constants';
import { generateWorld } from './mapGenerator';
import {
  Enemy,
  FloatingText,
  GameDifficulty,
  GameState,
  GameStats,
  ItemDrop,
  Particle,
  Projectile,
  Tile,
  TileType,
  Upgrades,
} from './types';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public state: GameState = 'TITLE';
  public difficulty: GameDifficulty = 'NORMAL';

  public grid: (Tile | null)[][] = [];
  public relicLoc: { r: number; c: number } = { r: 0, c: 0 };
  public relicExcavated: boolean = false;
  public relicDelivered: boolean = false;

  public dome = {
    x: (GRID_COLS * TILE_SIZE) / 2,
    y: GROUND_ROW * TILE_SIZE,
    radius: 58,
    hp: 150,
    maxHp: 150,
    shield: 0,
    maxShield: 0,
    laserAngle: -Math.PI / 2,
  };

  public player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 13,
    facing: 1,
    inDome: true,
    controllingLaser: false,
    carriedItems: [] as ItemDrop[],
    digAnimTimer: 0,
  };

  public resources = {
    iron: 4,
    water: 2,
    cobalt: 1,
  };

  public upgrades: Upgrades = {
    drill: 1,
    jetpack: 1,
    carryCapacity: 1,
    laserDamage: 1,
    laserTurn: 1,
    laserAutoAim: 0,
    shield: 0,
    teleportBeacon: 0,
  };

  public items: ItemDrop[] = [];
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  public wave: number = 1;
  public waveTimer: number = 55;
  public waveActive: boolean = false;
  public waveEnemiesToSpawn: number = 0;
  public waveTotalEnemies: number = 0;
  public lastSpawnTime: number = 0;
  public lastAlarmSecond: number = -1;

  public camera = {
    x: 0,
    y: 0,
    targetY: 0,
    shake: 0,
  };

  public stats: GameStats = {
    ironCollected: 0,
    waterCollected: 0,
    cobaltCollected: 0,
    tilesMined: 0,
    enemiesDefeated: 0,
    maxDepthReached: 0,
    wavesSurvived: 0,
    timeElapsed: 0,
    relicExtracted: false,
  };

  public keys: Record<string, boolean> = {};
  public mousePos = { x: 0, y: 0, isDown: false };
  public virtualInput = { x: 0, y: 0 };

  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private lastUiNotifyTime: number = 0;

  public onStateChange?: (state: GameState) => void;
  public onStatsUpdate?: () => void;
  public onRelicFound?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resetGame();
  }

  public resetGame() {
    const { grid, relicLoc } = generateWorld();
    this.grid = grid;
    this.relicLoc = relicLoc;
    this.relicExcavated = false;
    this.relicDelivered = false;

    const centerCol = Math.floor(GRID_COLS / 2);
    this.dome.x = (centerCol + 0.5) * TILE_SIZE;
    this.dome.y = GROUND_ROW * TILE_SIZE;
    this.dome.hp = 150;
    this.dome.maxHp = 150;
    this.dome.shield = 0;
    this.dome.maxShield = 0;
    this.dome.laserAngle = -Math.PI / 2;

    this.player.x = this.dome.x;
    this.player.y = this.dome.y - 10;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.inDome = true;
    this.player.controllingLaser = false;
    this.player.carriedItems = [];

    this.resources = {
      iron: this.difficulty === 'EASY' ? 8 : 4,
      water: this.difficulty === 'EASY' ? 4 : 2,
      cobalt: 1,
    };

    this.upgrades = {
      drill: 1,
      jetpack: 1,
      carryCapacity: 1,
      laserDamage: 1,
      laserTurn: 1,
      laserAutoAim: 0,
      shield: 0,
      teleportBeacon: 0,
    };

    this.items = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];

    this.wave = 1;
    this.waveTimer = this.difficulty === 'EASY' ? 65 : (this.difficulty === 'HARD' ? 45 : 55);
    this.waveActive = false;
    this.waveEnemiesToSpawn = 0;
    this.waveTotalEnemies = 0;
    this.lastAlarmSecond = -1;

    this.camera.y = 0;
    this.camera.targetY = 0;
    this.camera.shake = 0;

    this.stats = {
      ironCollected: 0,
      waterCollected: 0,
      cobaltCollected: 0,
      tilesMined: 0,
      enemiesDefeated: 0,
      maxDepthReached: 0,
      wavesSurvived: 0,
      timeElapsed: 0,
      relicExtracted: false,
    };

    audio.stopLaserLoop();
  }

  public start() {
    this.state = 'PLAYING';
    this.lastTime = performance.now();
    if (this.onStateChange) this.onStateChange(this.state);
    audio.init();
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  public pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      audio.stopLaserLoop();
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  public resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      if (this.onStateChange) this.onStateChange(this.state);
      if (this.animationFrameId === null) {
        this.animationFrameId = requestAnimationFrame(this.loop);
      }
    }
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    audio.stopLaserLoop();
  }

  private loop = (now: number) => {
    if (this.state !== 'PLAYING') {
      this.animationFrameId = null;
      return;
    }

    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  // --- Main Update ---

  public update(dt: number) {
    this.stats.timeElapsed += dt;

    // 1. Wave timer & Spawning
    this.updateWave(dt);

    // 2. Player or Laser controls
    if (this.player.controllingLaser) {
      this.updateLaserControl(dt);
    } else {
      this.updatePlayerControl(dt);
    }

    // 3. Carried items tether & physics
    this.updateTetheredItems();

    // 4. Free drops physics
    this.updateFreeItems(dt);

    // 5. Enemies update
    this.updateEnemies(dt);

    // 6. Projectiles
    this.updateProjectiles(dt);

    // 7. Particles & floating texts
    this.updateParticlesAndTexts(dt);

    // 8. Camera tracking
    this.updateCamera(dt);

    // 9. Teleport beacon
    if (this.upgrades.teleportBeacon > 0) {
      this.checkTeleportBeacon();
    }

    // 10. Win / Loss Check
    if (this.dome.hp <= 0 && this.state === 'PLAYING') {
      this.state = 'GAME_OVER';
      audio.playGameOver();
      if (this.onStateChange) this.onStateChange(this.state);
    }

    // Throttle React UI updates to ~6 times a second to prevent React render storms!
    const now = performance.now();
    if (now - this.lastUiNotifyTime > 160) {
      this.lastUiNotifyTime = now;
      if (this.onStatsUpdate) {
        this.onStatsUpdate();
      }
    }
  }

  // --- Wave Management ---

  private updateWave(dt: number) {
    if (!this.waveActive) {
      this.waveTimer -= dt;

      // Siren warning: only play once per discrete second in last 7 seconds
      const currentSec = Math.ceil(this.waveTimer);
      if (currentSec <= 7 && currentSec > 0 && currentSec !== this.lastAlarmSecond) {
        this.lastAlarmSecond = currentSec;
        audio.playAlarmBeep();
      }

      if (this.waveTimer <= 0) {
        this.startWave();
      }
    } else {
      // Wave active: spawn enemies with cooldown
      if (this.waveEnemiesToSpawn > 0 && performance.now() - this.lastSpawnTime > 1400) {
        this.spawnEnemy();
        this.waveEnemiesToSpawn--;
        this.lastSpawnTime = performance.now();
      }

      // Check wave clear
      if (this.waveEnemiesToSpawn <= 0 && this.enemies.length === 0) {
        this.endWave();
      }
    }
  }

  private startWave() {
    this.waveActive = true;
    this.lastAlarmSecond = -1;

    const baseCount = this.difficulty === 'EASY' ? 2 : (this.difficulty === 'HARD' ? 5 : 3);
    const waveMult = this.difficulty === 'HARD' ? 2.5 : 2;
    this.waveEnemiesToSpawn = Math.floor(baseCount + this.wave * waveMult);
    this.waveTotalEnemies = this.waveEnemiesToSpawn;
    this.lastSpawnTime = performance.now();

    this.addFloatingText(this.dome.x, this.dome.y - 70, `⚠ 第 ${this.wave} 波襲擊開始！`, '#ff4444');
  }

  private endWave() {
    this.waveActive = false;
    this.stats.wavesSurvived++;
    this.wave++;

    const baseTimer = this.difficulty === 'EASY' ? 65 : (this.difficulty === 'HARD' ? 45 : 55);
    this.waveTimer = Math.max(30, baseTimer - (this.wave - 1) * 3);
    this.lastAlarmSecond = -1;

    if (this.upgrades.shield > 0 && this.dome.shield < this.dome.maxShield) {
      this.dome.shield = Math.min(this.dome.maxShield, this.dome.shield + 25);
    }

    this.addFloatingText(this.dome.x, this.dome.y - 70, `✓ 第 ${this.wave - 1} 波防禦成功！`, '#4ade80');
    audio.playUpgradeSuccess();

    if (this.relicDelivered && !this.stats.relicExtracted) {
      this.stats.relicExtracted = true;
      this.state = 'VICTORY';
      audio.playVictory();
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  private spawnEnemy() {
    const fromLeft = Math.random() < 0.5;
    const spawnX = fromLeft ? -50 : GRID_COLS * TILE_SIZE + 50;

    const roll = Math.random();
    let type: 'crawler' | 'flyer' | 'spitter' | 'behemoth' = 'crawler';

    if (this.wave >= 4 && roll < 0.15) {
      type = 'behemoth';
    } else if (this.wave >= 3 && roll < 0.35) {
      type = 'spitter';
    } else if (roll < 0.6) {
      type = 'flyer';
    }

    const groundY = GROUND_ROW * TILE_SIZE - 12;
    const isFlyer = type === 'flyer' || type === 'spitter';
    const spawnY = isFlyer ? Math.random() * (groundY - 120) + 40 : groundY;

    let hp = 60 + this.wave * 15;
    let radius = 15;
    let speed = 44;
    let dps = 12 + this.wave * 2;

    if (type === 'flyer') {
      hp = 45 + this.wave * 12;
      radius = 13;
      speed = 60;
      dps = 10 + this.wave * 1.5;
    } else if (type === 'spitter') {
      hp = 70 + this.wave * 16;
      radius = 16;
      speed = 36;
      dps = 8;
    } else if (type === 'behemoth') {
      hp = 220 + this.wave * 45;
      radius = 24;
      speed = 26;
      dps = 28 + this.wave * 4;
    }

    if (this.difficulty === 'HARD') hp *= 1.3;
    if (this.difficulty === 'EASY') hp *= 0.8;

    this.enemies.push({
      id: Math.random().toString(),
      type,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      radius,
      hp,
      maxHp: hp,
      speed,
      dps,
      facing: fromLeft ? 1 : -1,
      attackCooldown: 0,
      shootCooldown: 1.5,
      isFlyer,
    });
  }

  // --- Player Movement & Mining ---

  private updatePlayerControl(dt: number) {
    const jetConfig = UPGRADE_CONFIG.jetpack[this.upgrades.jetpack - 1];
    const carryConfig = UPGRADE_CONFIG.carryCapacity[this.upgrades.carryCapacity - 1];

    const totalWeight = this.player.carriedItems.reduce((acc, it) => acc + it.weight, 0);
    const weightPenalty = totalWeight * carryConfig.dragFactor * 35;
    const effectiveSpeed = Math.max(75, jetConfig.speed - weightPenalty);

    const keys = this.keys;
    let mx = 0;
    let my = 0;

    if (keys['ArrowUp'] || keys['KeyW'] || keys['w'] || keys['W']) my -= 1;
    if (keys['ArrowDown'] || keys['KeyS'] || keys['s'] || keys['S']) my += 1;
    if (keys['ArrowLeft'] || keys['KeyA'] || keys['a'] || keys['A']) mx -= 1;
    if (keys['ArrowRight'] || keys['KeyD'] || keys['d'] || keys['D']) mx += 1;

    if (this.virtualInput.x !== 0 || this.virtualInput.y !== 0) {
      mx = this.virtualInput.x;
      my = this.virtualInput.y;
    }

    const mag = Math.hypot(mx, my);
    if (mag > 1) {
      mx /= mag;
      my /= mag;
    }

    if (mx > 0.1) this.player.facing = 1;
    if (mx < -0.1) this.player.facing = -1;

    const targetX = this.player.x + mx * effectiveSpeed * dt;
    const targetY = this.player.y + my * effectiveSpeed * dt;

    this.handlePlayerCollision(targetX, targetY, dt);

    this.player.x = Math.max(this.player.radius, Math.min(GRID_COLS * TILE_SIZE - this.player.radius, this.player.x));
    // Player can fly inside the dome up to ceiling (dome.y - 48) and deep underground
    this.player.y = Math.max(this.dome.y - 48, Math.min(GRID_ROWS * TILE_SIZE - this.player.radius, this.player.y));

    const currentDepth = Math.max(0, Math.floor((this.player.y - GROUND_ROW * TILE_SIZE) / TILE_SIZE));
    if (currentDepth > this.stats.maxDepthReached) {
      this.stats.maxDepthReached = currentDepth;
    }

    // Inside dome sanctuary or entrance airlock
    this.player.inDome =
      Math.abs(this.player.x - this.dome.x) < this.dome.radius + 16 &&
      this.player.y <= this.dome.y + 36;

    this.revealFogAroundPlayer();

    if (this.player.inDome && this.player.carriedItems.length > 0) {
      this.deliverCarriedItems();
    }

    this.checkItemTethering(carryConfig.maxTether);
  }

  private handlePlayerCollision(targetX: number, targetY: number, dt: number) {
    const drillConfig = UPGRADE_CONFIG.drill[this.upgrades.drill - 1];
    const drillDps = drillConfig.multiplier * 3.6;
    const r = this.player.radius - 1; // 12px for responsive navigation in 36px tunnels

    // 1. Horizontal movement & mining
    if (targetX !== this.player.x) {
      const dirX = Math.sign(targetX - this.player.x);
      const edgeX = targetX + dirX * r;
      const targetCol = Math.floor(edgeX / TILE_SIZE);

      const rowTop = Math.floor((this.player.y - r * 0.7) / TILE_SIZE);
      const rowBottom = Math.floor((this.player.y + r * 0.7) / TILE_SIZE);

      let blocked = false;
      for (let row = rowTop; row <= rowBottom; row++) {
        if (this.isSolidTile(row, targetCol)) {
          this.mineTile(row, targetCol, drillDps * dt);
          blocked = true;
        }
      }

      if (!blocked) {
        this.player.x = targetX;
      }
    }

    // 2. Vertical movement & mining
    if (targetY !== this.player.y) {
      const dirY = Math.sign(targetY - this.player.y);
      const edgeY = targetY + dirY * r;
      const targetRow = Math.floor(edgeY / TILE_SIZE);

      const colLeft = Math.floor((this.player.x - r * 0.7) / TILE_SIZE);
      const colRight = Math.floor((this.player.x + r * 0.7) / TILE_SIZE);

      let blocked = false;
      for (let col = colLeft; col <= colRight; col++) {
        if (this.isSolidTile(targetRow, col)) {
          this.mineTile(targetRow, col, drillDps * dt);
          blocked = true;
        }
      }

      if (!blocked) {
        this.player.y = targetY;
      }
    }
  }

  private isSolidTile(r: number, c: number): boolean {
    if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return false;
    return !!(this.grid[r] && this.grid[r][c] !== null);
  }

  private mineTile(r: number, c: number, damage: number) {
    const tile = this.grid[r][c];
    if (!tile) return;

    tile.hp -= damage;
    tile.revealed = true;

    this.player.digAnimTimer += 0.1;
    if (Math.random() < 0.25) {
      const depth = Math.max(0, r - GROUND_ROW);
      audio.playDig(depth);
      const def = TILE_DEFINITIONS[tile.type];
      this.createSparks((c + 0.5) * TILE_SIZE, (r + 0.5) * TILE_SIZE, def.color, 2);
    }

    if (tile.hp <= 0) {
      this.finishMinedTile(r, c, tile.type);
      this.grid[r][c] = null;
    }
  }

  private finishMinedTile(r: number, c: number, type: TileType) {
    audio.playMineComplete();
    this.stats.tilesMined++;
    const centerX = (c + 0.5) * TILE_SIZE;
    const centerY = (r + 0.5) * TILE_SIZE;

    this.createSparks(centerX, centerY, '#ffffff', 8);

    const def = TILE_DEFINITIONS[type];
    if (def.oreColor) {
      this.createSparks(centerX, centerY, def.oreColor, 10);
    }

    if (type === 'iron') {
      const count = def.dropYield || 2;
      for (let i = 0; i < count; i++) {
        this.items.push({
          id: Math.random().toString(),
          x: centerX + (Math.random() - 0.5) * 8,
          y: centerY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 20,
          vy: -25,
          type: 'iron',
          weight: 1,
          attached: false,
        });
      }
      this.addFloatingText(centerX, centerY, `+${count} 鐵`, '#e0a96d');
    } else if (type === 'water') {
      const count = def.dropYield || 2;
      for (let i = 0; i < count; i++) {
        this.items.push({
          id: Math.random().toString(),
          x: centerX + (Math.random() - 0.5) * 8,
          y: centerY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 20,
          vy: -25,
          type: 'water',
          weight: 1,
          attached: false,
        });
      }
      this.addFloatingText(centerX, centerY, `+${count} 水`, '#4ea8de');
    } else if (type === 'cobalt') {
      this.items.push({
        id: Math.random().toString(),
        x: centerX,
        y: centerY,
        vx: 0,
        vy: -30,
        type: 'cobalt',
        weight: 1.5,
        attached: false,
      });
      this.addFloatingText(centerX, centerY, `+1 鈷`, '#c743cb');
    } else if (type === 'relic') {
      this.relicExcavated = true;
      audio.playRelicDiscovered();
      this.items.push({
        id: 'ancient_relic_core',
        x: centerX,
        y: centerY,
        vx: 0,
        vy: -20,
        type: 'relic',
        weight: 4.5,
        attached: false,
      });
      this.addFloatingText(centerX, centerY, '★ 發現古代遺跡核心！★', '#ffd166');
      if (this.onRelicFound) this.onRelicFound();
    } else if (type === 'gadget_chest') {
      audio.playUpgradeSuccess();
      this.resources.iron += 5;
      this.resources.water += 2;
      this.resources.cobalt += 1;
      this.addFloatingText(centerX, centerY, '科技艙已開啟！獲得大量資源！', '#06d6a0');
    }
  }

  private revealFogAroundPlayer() {
    const centerC = Math.floor(this.player.x / TILE_SIZE);
    const centerR = Math.floor(this.player.y / TILE_SIZE);
    const viewDist = 3;

    for (let dr = -viewDist; dr <= viewDist; dr++) {
      for (let dc = -viewDist; dc <= viewDist; dc++) {
        const nr = centerR + dr;
        const nc = centerC + dc;
        if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
          if (this.grid[nr] && this.grid[nr][nc]) {
            this.grid[nr][nc]!.revealed = true;
          }
        }
      }
    }
  }

  // --- Tether & Item Drops Physics ---

  private checkItemTethering(maxCarry: number) {
    if (this.player.carriedItems.length >= maxCarry) return;

    this.items.forEach(it => {
      if (!it.attached) {
        const dist = Math.hypot(this.player.x - it.x, this.player.y - it.y);
        if (dist < 32 && this.player.carriedItems.length < maxCarry) {
          it.attached = true;
          this.player.carriedItems.push(it);
          audio.playTetherAttach();
        }
      }
    });
  }

  private updateTetheredItems() {
    let leader = { x: this.player.x, y: this.player.y };

    for (let i = 0; i < this.player.carriedItems.length; i++) {
      const it = this.player.carriedItems[i];
      const dx = leader.x - it.x;
      const dy = leader.y - it.y;
      const dist = Math.hypot(dx, dy);

      const targetDistance = 18;
      if (dist > targetDistance) {
        const force = (dist - targetDistance) * 0.22;
        it.vx += (dx / dist) * force;
        it.vy += (dy / dist) * force;
      }

      it.vx *= 0.74;
      it.vy *= 0.74;
      it.x += it.vx;
      it.y += it.vy;

      leader = { x: it.x, y: it.y };
    }
  }

  private updateFreeItems(dt: number) {
    this.items.forEach(it => {
      if (!it.attached) {
        it.vy += 320 * dt;
        it.vx *= 0.9;
        it.x += it.vx * dt;
        it.y += it.vy * dt;

        const r = Math.floor((it.y + 7) / TILE_SIZE);
        const c = Math.floor(it.x / TILE_SIZE);
        if (this.isSolidTile(r, c)) {
          it.y = r * TILE_SIZE - 7;
          it.vy = 0;
          it.vx = 0;
        }
      }
    });
  }

  private deliverCarriedItems() {
    this.player.carriedItems.forEach(it => {
      if (it.type === 'iron') {
        this.resources.iron++;
        this.stats.ironCollected++;
        audio.playResourceDeliver('iron');
      } else if (it.type === 'water') {
        this.resources.water++;
        this.stats.waterCollected++;
        audio.playResourceDeliver('water');
      } else if (it.type === 'cobalt') {
        this.resources.cobalt++;
        this.stats.cobaltCollected++;
        audio.playResourceDeliver('cobalt');
      } else if (it.type === 'relic') {
        this.relicDelivered = true;
        audio.playResourceDeliver('relic');
        this.addFloatingText(this.dome.x, this.dome.y - 40, '★ 遺跡已回傳穹頂！啟動核心過載！★', '#ffd166');
        if (!this.waveActive) {
          this.waveTimer = 5;
        }
      }

      this.createSparks(this.dome.x, this.dome.y, '#ffffff', 6);
      this.items = this.items.filter(item => item !== it);
    });

    this.player.carriedItems = [];
  }

  private checkTeleportBeacon() {
    const centerCol = Math.floor(GRID_COLS / 2);
    const pCol = Math.floor(this.player.x / TILE_SIZE);
    if (Math.abs(pCol - centerCol) <= 1 && this.player.carriedItems.length > 0) {
      if (Math.random() < 0.08) {
        const item = this.player.carriedItems.pop();
        if (item) {
          this.items = this.items.filter(i => i !== item);
          if (item.type === 'iron') { this.resources.iron++; this.stats.ironCollected++; }
          if (item.type === 'water') { this.resources.water++; this.stats.waterCollected++; }
          if (item.type === 'cobalt') { this.resources.cobalt++; this.stats.cobaltCollected++; }
          if (item.type === 'relic') { this.relicDelivered = true; }
          audio.playResourceDeliver(item.type);
          this.createSparks(this.player.x, this.player.y, '#06d6a0', 8);
        }
      }
    }
  }

  // --- Laser Defense ---

  public toggleLaserMode() {
    if (!this.player.inDome) return;
    this.player.controllingLaser = !this.player.controllingLaser;
    if (this.player.controllingLaser) {
      this.player.x = this.dome.x;
      this.player.y = this.dome.y + 4;
      audio.startLaserLoop();
    } else {
      audio.stopLaserLoop();
    }
  }

  private updateLaserControl(dt: number) {
    const laserTurnCfg = UPGRADE_CONFIG.laserTurn[this.upgrades.laserTurn - 1];
    const turnRate = laserTurnCfg.turnSpeed;

    const keys = this.keys;
    if (keys['ArrowLeft'] || keys['KeyA'] || keys['a'] || keys['A']) {
      this.dome.laserAngle -= turnRate * dt;
    }
    if (keys['ArrowRight'] || keys['KeyD'] || keys['d'] || keys['D']) {
      this.dome.laserAngle += turnRate * dt;
    }

    if ((this.mousePos.x !== 0 || this.mousePos.y !== 0) && !isNaN(this.mousePos.x) && !isNaN(this.mousePos.y)) {
      const worldMouseY = this.mousePos.y + this.camera.y;
      const dx = this.mousePos.x - this.dome.x;
      const dy = worldMouseY - (this.dome.y - 12);
      const mouseAngle = Math.atan2(dy, dx);
      if (!isNaN(mouseAngle)) {
        const clampedAngle = Math.max(-Math.PI + 0.08, Math.min(-0.08, mouseAngle));
        const diff = clampedAngle - this.dome.laserAngle;
        if (Math.abs(diff) > 0.01) {
          this.dome.laserAngle += Math.sign(diff) * Math.min(Math.abs(diff), turnRate * dt * 3.5);
        }
      }
    }

    this.dome.laserAngle = Math.max(-Math.PI + 0.08, Math.min(-0.08, this.dome.laserAngle));
    this.fireLaser(dt);
  }

  private fireLaser(dt: number) {
    const laserDmgCfg = UPGRADE_CONFIG.laserDamage[this.upgrades.laserDamage - 1];
    const dps = laserDmgCfg.dps;

    const lx = this.dome.x;
    const ly = this.dome.y - 12;
    const dirX = Math.cos(this.dome.laserAngle);
    const dirY = Math.sin(this.dome.laserAngle);
    const maxRange = 750;

    let hitOccurred = false;

    this.enemies.forEach(en => {
      const toEnX = en.x - lx;
      const toEnY = en.y - ly;
      const proj = toEnX * dirX + toEnY * dirY;

      if (proj > 0 && proj < maxRange) {
        const perpX = toEnX - proj * dirX;
        const perpY = toEnY - proj * dirY;
        const dist = Math.hypot(perpX, perpY);

        if (dist < en.radius + laserDmgCfg.beamWidth / 2 + 6) {
          en.hp -= dps * dt;
          hitOccurred = true;
          this.createSparks(en.x, en.y, '#ff4444', 2);
        }
      }
    });

    this.projectiles = this.projectiles.filter(proj => {
      if (!proj.isHostile) return true;
      const toProjX = proj.x - lx;
      const toProjY = proj.y - ly;
      const pDot = toProjX * dirX + toProjY * dirY;
      if (pDot > 0 && pDot < maxRange) {
        const perpX = toProjX - pDot * dirX;
        const perpY = toProjY - pDot * dirY;
        if (Math.hypot(perpX, perpY) < proj.radius + 8) {
          this.createSparks(proj.x, proj.y, '#a855f7', 4);
          return false;
        }
      }
      return true;
    });

    if (hitOccurred) {
      audio.playLaserHit();
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      if (en.hp <= 0) {
        this.stats.enemiesDefeated++;
        audio.playEnemyDeath(en.isFlyer);
        this.createSparks(en.x, en.y, en.isFlyer ? '#c084fc' : '#ef4444', 12);
        this.enemies.splice(i, 1);
      }
    }
  }

  // --- Enemies & Projectiles ---

  private updateEnemies(dt: number) {
    this.enemies.forEach(en => {
      const targetX = this.dome.x;
      const targetY = this.dome.y - 10;
      const dx = targetX - en.x;
      const dy = targetY - en.y;
      const dist = Math.hypot(dx, dy);

      en.facing = dx > 0 ? 1 : -1;

      if (en.type === 'spitter') {
        const desiredDist = 220;
        if (dist > desiredDist + 20) {
          en.x += (dx / dist) * en.speed * dt;
          en.y += (dy / dist) * en.speed * dt;
        } else if (dist < desiredDist - 20) {
          en.x -= (dx / dist) * en.speed * dt * 0.5;
        }

        en.shootCooldown = (en.shootCooldown || 1.5) - dt;
        if (en.shootCooldown <= 0) {
          en.shootCooldown = 2.2;
          this.projectiles.push({
            id: Math.random().toString(),
            x: en.x,
            y: en.y,
            vx: (dx / dist) * 150,
            vy: (dy / dist) * 150,
            radius: 5,
            damage: 15 + this.wave * 2,
            color: '#a855f7',
            isHostile: true,
          });
        }
      } else {
        const hitDistance = this.dome.radius + en.radius - 6;
        if (dist > hitDistance) {
          en.x += (dx / dist) * en.speed * dt;
          en.y += (dy / dist) * en.speed * dt;
        } else {
          this.damageDome(en.dps * dt);
          if (Math.random() < 0.1) {
            audio.playDomeDamage();
            this.camera.shake = Math.min(6, this.camera.shake + 1.2);
            this.createSparks(this.dome.x + (Math.random() - 0.5) * 35, this.dome.y - Math.random() * 20, '#ff7700', 3);
          }
        }
      }
    });
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const distToDome = Math.hypot(p.x - this.dome.x, p.y - (this.dome.y - 10));
      if (distToDome < this.dome.radius + p.radius) {
        this.damageDome(p.damage);
        audio.playDomeDamage();
        this.createSparks(p.x, p.y, p.color, 6);
        this.camera.shake = 2.5;
        this.projectiles.splice(i, 1);
      }
    }
  }

  private damageDome(amount: number) {
    if (this.dome.shield > 0) {
      if (this.dome.shield >= amount) {
        this.dome.shield -= amount;
        return;
      } else {
        const remaining = amount - this.dome.shield;
        this.dome.shield = 0;
        this.dome.hp = Math.max(0, this.dome.hp - remaining);
        return;
      }
    }
    this.dome.hp = Math.max(0, this.dome.hp - amount);
  }

  public repairDome() {
    if (this.resources.cobalt >= 1 && this.dome.hp < this.dome.maxHp) {
      this.resources.cobalt -= 1;
      this.dome.hp = Math.min(this.dome.maxHp, this.dome.hp + UPGRADE_CONFIG.repair.healAmount);
      audio.playUpgradeSuccess();
      this.addFloatingText(this.dome.x, this.dome.y - 40, `+${UPGRADE_CONFIG.repair.healAmount} HP 修復完成`, '#38bdf8');
    }
  }

  public createSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 110,
        vy: (Math.random() - 0.5) * 110,
        size: Math.random() * 3 + 1,
        color,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      life: 1.2,
    });
  }

  private updateParticlesAndTexts(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 22 * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private updateCamera(dt: number) {
    if (this.player.controllingLaser || this.player.inDome) {
      this.camera.targetY = 0;
    } else {
      const maxCameraY = (GRID_ROWS * TILE_SIZE) - this.canvas.height;
      this.camera.targetY = Math.max(0, Math.min(maxCameraY, this.player.y - this.canvas.height / 2));
    }

    this.camera.y += (this.camera.targetY - this.camera.y) * 5 * dt;

    if (this.camera.shake > 0) {
      this.camera.shake = Math.max(0, this.camera.shake - 10 * dt);
    }
  }

  // --- Rendering ---

  public render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    const shakeX = (Math.random() - 0.5) * this.camera.shake * 2;
    const shakeY = (Math.random() - 0.5) * this.camera.shake * 2;
    ctx.translate(shakeX, -this.camera.y + shakeY);

    this.renderSkyAndSurface(ctx, w);
    this.renderTiles(ctx);
    this.renderRelicChamberMarker(ctx);
    this.renderDome(ctx);
    this.renderItemsAndTether(ctx);
    this.renderEnemiesAndProjectiles(ctx);

    if (!this.player.controllingLaser) {
      this.renderPlayer(ctx);
    }

    this.renderParticles(ctx);
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  private renderSkyAndSurface(ctx: CanvasRenderingContext2D, w: number) {
    const surfaceY = GROUND_ROW * TILE_SIZE;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, surfaceY);
    skyGrad.addColorStop(0, '#090b14');
    skyGrad.addColorStop(0.65, '#141829');
    skyGrad.addColorStop(1, '#272a3d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, surfaceY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const stars = [
      [120, 45, 1.5], [260, 70, 1.2], [480, 30, 2], [710, 85, 1.4], [890, 50, 1.8],
      [180, 120, 1], [390, 140, 1.6], [620, 110, 1.2], [820, 130, 1.5]
    ];
    stars.forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#1c1f2e';
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(80, surfaceY - 55);
    ctx.lineTo(190, surfaceY - 20);
    ctx.lineTo(340, surfaceY - 65);
    ctx.lineTo(520, surfaceY - 15);
    ctx.lineTo(680, surfaceY - 58);
    ctx.lineTo(840, surfaceY - 25);
    ctx.lineTo(w, surfaceY - 45);
    ctx.lineTo(w, surfaceY);
    ctx.closePath();
    ctx.fill();

    if (this.waveActive || (this.waveTimer <= 7 && !this.waveActive)) {
      const pulseAlpha = Math.sin(performance.now() * 0.006) * 0.12 + 0.15;
      ctx.fillStyle = `rgba(239, 68, 68, ${pulseAlpha})`;
      ctx.fillRect(0, 0, w, surfaceY);
    }
  }

  private renderTiles(ctx: CanvasRenderingContext2D) {
    const startRow = Math.max(GROUND_ROW, Math.floor(this.camera.y / TILE_SIZE));
    const endRow = Math.min(GRID_ROWS, Math.ceil((this.camera.y + this.canvas.height) / TILE_SIZE) + 1);

    for (let r = startRow; r < endRow; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const tile = this.grid[r][c];
        const tx = c * TILE_SIZE;
        const ty = r * TILE_SIZE;

        if (tile) {
          const def = TILE_DEFINITIONS[tile.type];

          if (!tile.revealed) {
            ctx.fillStyle = '#0b0d14';
            ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
            continue;
          }

          ctx.fillStyle = def.color;
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);

          ctx.strokeStyle = def.borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(tx + 0.5, ty + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

          if (def.oreColor) {
            ctx.fillStyle = def.oreColor;
            ctx.beginPath();
            ctx.arc(tx + TILE_SIZE * 0.32, ty + TILE_SIZE * 0.36, 4, 0, Math.PI * 2);
            ctx.arc(tx + TILE_SIZE * 0.68, ty + TILE_SIZE * 0.64, 4.5, 0, Math.PI * 2);
            ctx.arc(tx + TILE_SIZE * 0.45, ty + TILE_SIZE * 0.72, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          if (tile.type === 'relic') {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(tx + 6, ty + 6, TILE_SIZE - 12, TILE_SIZE - 12);
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(tx + TILE_SIZE / 2, ty + TILE_SIZE / 2, 7, 0, Math.PI * 2);
            ctx.fill();
          }

          if (tile.type === 'gadget_chest') {
            ctx.fillStyle = '#06d6a0';
            ctx.fillRect(tx + 8, ty + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(tx + 8, ty + 8, TILE_SIZE - 16, TILE_SIZE - 16);
          }

          if (tile.hp < tile.maxHp) {
            const crackOpacity = Math.max(0, 0.75 * (1 - tile.hp / tile.maxHp));
            ctx.fillStyle = `rgba(0, 0, 0, ${crackOpacity})`;
            ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
          }
        } else {
          ctx.fillStyle = '#0d1017';
          ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  private renderRelicChamberMarker(ctx: CanvasRenderingContext2D) {
    if (this.relicExcavated) return;
    const rx = (this.relicLoc.c + 0.5) * TILE_SIZE;
    const ry = (this.relicLoc.r + 0.5) * TILE_SIZE;

    const distToPlayer = Math.hypot(this.player.x - rx, this.player.y - ry);
    if (distToPlayer < 240) {
      const pulse = Math.sin(performance.now() * 0.005) * 0.2 + 0.3;
      ctx.save();
      ctx.strokeStyle = `rgba(251, 191, 36, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rx, ry, 28 + Math.sin(performance.now() * 0.008) * 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderDome(ctx: CanvasRenderingContext2D) {
    const gx = this.dome.x;
    const gy = this.dome.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(gx, gy, this.dome.radius, Math.PI, 0, false);
    ctx.fillStyle = 'rgba(96, 165, 250, 0.22)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#60a5fa';
    ctx.stroke();

    if (this.dome.shield > 0) {
      const shieldRatio = this.dome.shield / Math.max(1, this.dome.maxShield);
      ctx.beginPath();
      ctx.arc(gx, gy, this.dome.radius + 6, Math.PI, 0, false);
      ctx.fillStyle = `rgba(168, 85, 247, ${0.15 + shieldRatio * 0.15})`;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#c084fc';
      ctx.stroke();
    }

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(gx - this.dome.radius - 12, gy - 3, (this.dome.radius + 12) * 2, 10);
    ctx.fillStyle = '#334155';
    ctx.fillRect(gx - this.dome.radius - 8, gy + 3, (this.dome.radius + 8) * 2, 6);

    ctx.beginPath();
    ctx.arc(gx, gy - 12, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    const barrelLen = 24;
    const bx = gx + Math.cos(this.dome.laserAngle) * barrelLen;
    const by = (gy - 12) + Math.sin(this.dome.laserAngle) * barrelLen;

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(gx, gy - 12);
    ctx.lineTo(bx, by);
    ctx.stroke();

    if (this.player.controllingLaser) {
      const beamLen = 900;
      const ex = gx + Math.cos(this.dome.laserAngle) * beamLen;
      const ey = (gy - 12) + Math.sin(this.dome.laserAngle) * beamLen;

      const laserDmgCfg = UPGRADE_CONFIG.laserDamage[this.upgrades.laserDamage - 1];
      const beamW = laserDmgCfg.beamWidth;

      ctx.save();
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = beamW + 4;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, beamW / 2);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
    }

    const barW = 84;
    const barH = 7;
    const hpRatio = Math.max(0, this.dome.hp / this.dome.maxHp);
    const barX = gx - barW / 2;
    const barY = gy - this.dome.radius - 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.4 ? '#22c55e' : (hpRatio > 0.2 ? '#f59e0b' : '#ef4444');
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.restore();
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.player.x, this.player.y);

    const isMoving = this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['ArrowDown'] || this.keys['KeyS'] ||
      this.keys['ArrowLeft'] || this.keys['KeyA'] || this.keys['ArrowRight'] || this.keys['KeyD'] ||
      (this.virtualInput.x !== 0 || this.virtualInput.y !== 0);

    if (isMoving) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, this.player.radius + 3, 5 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#eab308';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#a16207';
    ctx.stroke();

    const eyeOffset = this.player.facing * 3;
    ctx.beginPath();
    ctx.arc(eyeOffset, -2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeOffset + this.player.facing, -2, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    if (this.player.digAnimTimer > 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(this.player.facing * (this.player.radius + 6), -4);
      ctx.lineTo(this.player.facing * (this.player.radius + 12), 0);
      ctx.lineTo(this.player.facing * (this.player.radius + 6), 4);
      ctx.closePath();
      ctx.fill();
      this.player.digAnimTimer = Math.max(0, this.player.digAnimTimer - 0.05);
    }

    ctx.restore();
  }

  private renderItemsAndTether(ctx: CanvasRenderingContext2D) {
    if (this.player.carriedItems.length > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.player.x, this.player.y);
      this.player.carriedItems.forEach(it => {
        ctx.lineTo(it.x, it.y);
      });
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    this.items.forEach(it => {
      ctx.save();
      ctx.translate(it.x, it.y);

      if (it.type === 'iron') {
        ctx.fillStyle = '#e0a96d';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else if (it.type === 'water') {
        ctx.fillStyle = '#4ea8de';
        ctx.beginPath();
        ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else if (it.type === 'cobalt') {
        ctx.fillStyle = '#c743cb';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      } else if (it.type === 'relic') {
        const pulse = Math.sin(performance.now() * 0.008) * 2;
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(0, 0, 11 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  private renderEnemiesAndProjectiles(ctx: CanvasRenderingContext2D) {
    this.enemies.forEach(en => {
      ctx.save();
      ctx.translate(en.x, en.y);

      if (en.type === 'crawler') {
        ctx.fillStyle = '#dc2626';
      } else if (en.type === 'flyer') {
        ctx.fillStyle = '#9333ea';
      } else if (en.type === 'spitter') {
        ctx.fillStyle = '#059669';
      } else if (en.type === 'behemoth') {
        ctx.fillStyle = '#7f1d1d';
      }

      ctx.beginPath();
      ctx.arc(0, 0, en.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      if (en.isFlyer) {
        const flap = Math.sin(performance.now() * 0.015) * 6;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.ellipse(-en.radius * 0.6, -flap, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(en.radius * 0.6, -flap, 10, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      const eBarW = en.radius * 2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(-en.radius, -en.radius - 7, eBarW, 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-en.radius, -en.radius - 7, eBarW * (en.hp / en.maxHp), 3);

      ctx.restore();
    });

    this.projectiles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    });
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.max(0, ft.life / 1.2);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }
}
