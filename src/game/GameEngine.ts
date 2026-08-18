import { sound } from '../audio/soundEngine';
import { ActiveBuff, DifficultyMode, FloatingText, GameState, GameStats, Particle, PowerUpType, ShipSkin, Star } from '../types';
import { Asteroid, Bullet, Enemy, EnemyType, Player, PowerUpEntity } from './entities';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 600;
  private height: number = 800;

  // Game Entities
  public player: Player;
  public bullets: Bullet[] = [];
  public enemyBullets: Bullet[] = [];
  public asteroids: Asteroid[] = [];
  public enemies: Enemy[] = [];
  public powerUps: PowerUpEntity[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public stars: Star[] = [];

  // Controls & Inputs
  public keys: { [key: string]: boolean } = {};
  public isFiring: boolean = false;
  public touchX: number | null = null;
  public isTouchFiring: boolean = false;

  // Game Loop & State
  public state: GameState = 'START';
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  public difficulty: DifficultyMode = 'NORMAL';

  // Stats & Progress
  public score: number = 0;
  public highScore: number = 0;
  public lives: number = 3;
  public maxLives: number = 5;
  public wave: number = 1;
  public enemiesDestroyed: number = 0;
  public shotsFired: number = 0;
  public shotsHit: number = 0;
  public bossDefeatedCount: number = 0;
  public bombCount: number = 2;
  public maxBombs: number = 3;

  // Wave & Spawning Timers
  private asteroidTimer: number = 0;
  private enemyTimer: number = 0;
  private waveTimer: number = 0;
  private bossActive: boolean = false;
  private screenShake: number = 0;
  private nukeFlash: number = 0;

  // Callbacks to UI
  private onStatsUpdate?: (stats: GameStats) => void;
  private onStateChange?: (state: GameState) => void;

  constructor(
    canvas: HTMLCanvasElement,
    onStatsUpdate?: (stats: GameStats) => void,
    onStateChange?: (state: GameState) => void
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2d context');
    this.ctx = context;
    this.onStatsUpdate = onStatsUpdate;
    this.onStateChange = onStateChange;

    this.width = canvas.width;
    this.height = canvas.height;

    this.player = new Player(this.width / 2, this.height - 80);

    this.loadHighScore();
    this.initStars();
    this.setupListeners();
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('neon_space_defender_highscore');
      if (saved) {
        this.highScore = parseInt(saved, 10) || 0;
      }
    } catch {
      this.highScore = 0;
    }
  }

  private saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('neon_space_defender_highscore', this.highScore.toString());
      } catch {
        // storage ignored
      }
    }
  }

  private initStars() {
    this.stars = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      const layer = Math.random() < 0.6 ? 1 : (Math.random() < 0.85 ? 2 : 3);
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: layer === 1 ? 1 : (layer === 2 ? 1.8 : 2.6),
        speed: layer === 1 ? 40 : (layer === 2 ? 110 : 220),
        brightness: layer === 1 ? 0.35 : (layer === 2 ? 0.65 : 1.0),
        color: layer === 3 ? (Math.random() > 0.5 ? '#00f3ff' : '#ff007f') : '#ffffff',
        layer,
      });
    }
  }

  public setShipSkin(skin: ShipSkin) {
    this.player.skin = skin;
  }

  public setDifficulty(diff: DifficultyMode) {
    this.difficulty = diff;
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        this.isFiring = true;
        e.preventDefault();
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
      if (e.code === 'KeyB') {
        this.useBomb();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        this.isFiring = false;
      }
    });
  }

  public startNewGame(difficulty?: DifficultyMode) {
    sound.init();
    if (difficulty) this.difficulty = difficulty;

    this.score = 0;
    this.lives = this.difficulty === 'EASY' ? 4 : (this.difficulty === 'HARD' ? 2 : (this.difficulty === 'NIGHTMARE' ? 1 : 3));
    this.wave = 1;
    this.enemiesDestroyed = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.bossDefeatedCount = 0;
    this.bombCount = 2;
    this.bossActive = false;

    this.bullets = [];
    this.enemyBullets = [];
    this.asteroids = [];
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];
    this.floatingTexts = [];

    this.player.x = this.width / 2;
    this.player.y = this.height - 80;
    this.player.vx = 0;
    this.player.tilt = 0;
    this.player.shieldTime = 0;
    this.player.tripleShotTime = 0;
    this.player.rapidFireTime = 0;
    this.player.scoreBoostTime = 0;
    this.player.invulnerableTime = 2.0;

    this.asteroidTimer = 0;
    this.enemyTimer = 0;
    this.waveTimer = 0;
    this.screenShake = 0;
    this.nukeFlash = 0;

    this.setState('PLAYING');
    sound.startMusic();

    this.addFloatingText(this.width / 2, this.height / 2, 'MISSION START!', '#00f3ff', 2.0);
    this.emitStats();
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
      sound.stopMusic();
    } else if (this.state === 'PAUSED') {
      this.setState('PLAYING');
      sound.startMusic();
    }
  }

  public setState(newState: GameState) {
    this.state = newState;
    if (this.onStateChange) this.onStateChange(newState);
  }

  public useBomb() {
    if (this.state !== 'PLAYING' || this.bombCount <= 0) return;
    this.bombCount--;
    this.nukeFlash = 1.0;
    this.triggerScreenShake(14);
    sound.playBombBlast();

    // Wipe bullets
    this.enemyBullets = [];

    // Damage / destroy all asteroids
    this.asteroids.forEach((ast) => {
      this.createExplosion(ast.x, ast.y, ast.color, 16);
      this.score += ast.points;
      this.enemiesDestroyed++;
    });
    this.asteroids = [];

    // Damage enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.type === 'MOTHERSHIP') {
        e.health -= 15;
        this.createExplosion(e.x, e.y, '#ef4444', 20);
        if (e.health <= 0) {
          this.onEnemyKilled(e);
          this.enemies.splice(i, 1);
        }
      } else {
        this.onEnemyKilled(e);
        this.enemies.splice(i, 1);
      }
    }

    this.addFloatingText(this.player.x, this.player.y - 40, '💥 EMP CLEARED!', '#a855f7', 1.8);
    this.emitStats();
  }

  public startLoop() {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // --- UPDATE LOOP ---
  private update(dt: number) {
    // Starfield animation runs in all states for immersive visuals
    this.updateStars(dt);

    if (this.state !== 'PLAYING') return;

    if (this.screenShake > 0) {
      this.screenShake -= dt * 25;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    if (this.nukeFlash > 0) {
      this.nukeFlash -= dt * 2.5;
      if (this.nukeFlash < 0) this.nukeFlash = 0;
    }

    // Player Update
    const moveLeft = this.keys['ArrowLeft'] || this.keys['KeyA'];
    const moveRight = this.keys['ArrowRight'] || this.keys['KeyD'];

    // Touch controls override
    if (this.touchX !== null) {
      const dx = this.touchX - this.player.x;
      if (Math.abs(dx) > 6) {
        this.player.x += Math.sign(dx) * Math.min(Math.abs(dx), this.player.speed * 1.2 * dt);
      }
    } else {
      this.player.update(dt, moveLeft, moveRight, this.width);
    }

    // Firing check
    if (this.isFiring || this.isTouchFiring) {
      this.handlePlayerFire();
    }

    // Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.update(dt);
      if (b.y < -30 || b.y > this.height + 30 || b.x < -30 || b.x > this.width + 30) {
        this.bullets.splice(i, 1);
      }
    }

    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.update(dt);
      if (eb.y > this.height + 30 || eb.x < -30 || eb.x > this.width + 30) {
        this.enemyBullets.splice(i, 1);
      }
    }

    // Update Asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const ast = this.asteroids[i];
      ast.update(dt);
      if (ast.y > this.height + 50) {
        this.asteroids.splice(i, 1);
      }
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player.x, this.player.y, (bullet) => {
        this.enemyBullets.push(bullet);
      });

      if (enemy.y > this.height + 60 && enemy.type !== 'MOTHERSHIP') {
        this.enemies.splice(i, 1);
      }
    }

    // Update PowerUps
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      pu.update(dt);
      if (pu.y > this.height + 40) {
        this.powerUps.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= dt * 0.9;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Spawners & Wave Logic
    this.handleSpawning(dt);

    // Collisions
    this.handleCollisions();

    // Emit Stats every frame
    this.emitStats();
  }

  private handlePlayerFire() {
    const isRapid = this.player.rapidFireTime > 0;
    const isTriple = this.player.tripleShotTime > 0;
    const cooldownRate = isRapid ? this.player.baseFireRate * 0.5 : this.player.baseFireRate;

    if (this.player.fireCooldown <= 0) {
      this.player.fireCooldown = cooldownRate;
      this.shotsFired++;

      const laserColor = isRapid ? '#10b981' : (isTriple ? '#f59e0b' : '#00f3ff');
      sound.playLaser(isTriple, isRapid);

      if (isTriple) {
        // 3-way spread
        this.bullets.push(new Bullet(this.player.x, this.player.y - 18, 0, -680, laserColor));
        this.bullets.push(new Bullet(this.player.x - 12, this.player.y - 10, -110, -660, laserColor));
        this.bullets.push(new Bullet(this.player.x + 12, this.player.y - 10, 110, -660, laserColor));
      } else {
        // Dual laser cannons
        this.bullets.push(new Bullet(this.player.x - 14, this.player.y - 14, 0, -680, laserColor));
        this.bullets.push(new Bullet(this.player.x + 14, this.player.y - 14, 0, -680, laserColor));
      }

      // Muzzle spark
      this.createSparks(this.player.x, this.player.y - 20, laserColor, 4);
    }
  }

  private handleSpawning(dt: number) {
    this.waveTimer += dt;
    this.asteroidTimer += dt;
    this.enemyTimer += dt;

    // Wave Progression
    const waveThreshold = 30 + this.wave * 8;
    if (this.waveTimer > waveThreshold && !this.bossActive) {
      this.wave++;
      this.waveTimer = 0;
      sound.playWaveClear();
      this.addFloatingText(this.width / 2, this.height / 2 - 40, `WAVE ${this.wave}`, '#ffb800', 2.5);

      // Spawn Boss every 3 waves
      if (this.wave % 3 === 0) {
        this.spawnBoss();
      }
    }

    // Difficulty multipliers
    const diffMod = this.difficulty === 'EASY' ? 0.75 : (this.difficulty === 'HARD' ? 1.35 : (this.difficulty === 'NIGHTMARE' ? 1.75 : 1.0));

    // Spawn Asteroids
    const asteroidInterval = Math.max(0.9, (2.6 - this.wave * 0.12) / diffMod);
    if (this.asteroidTimer > asteroidInterval) {
      this.asteroidTimer = 0;
      const sizeRand = Math.random();
      const size = sizeRand < 0.4 ? 'LARGE' : (sizeRand < 0.75 ? 'MEDIUM' : 'SMALL');
      const x = 30 + Math.random() * (this.width - 60);
      this.asteroids.push(new Asteroid(x, -40, size));
    }

    // Spawn Enemies
    const enemyInterval = Math.max(1.2, (3.2 - this.wave * 0.15) / diffMod);
    if (this.enemyTimer > enemyInterval) {
      this.enemyTimer = 0;
      const x = 40 + Math.random() * (this.width - 80);
      const rand = Math.random();

      let type: EnemyType = 'SCOUT';
      if (this.wave >= 2 && rand > 0.45) {
        type = rand > 0.75 ? 'HUNTER' : 'SWARMER';
      }
      this.enemies.push(new Enemy(x, -40, type, this.wave));
    }
  }

  private spawnBoss() {
    this.bossActive = true;
    this.enemies.push(new Enemy(this.width / 2, -70, 'MOTHERSHIP', this.wave));
    this.addFloatingText(this.width / 2, 140, '⚠️ BOSS DETECTED ⚠️', '#ef4444', 3.0);
    this.triggerScreenShake(8);
  }

  private handleCollisions() {
    // 1. Player Bullets vs Asteroids
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      if (!b.isPlayer) continue;

      for (let ai = this.asteroids.length - 1; ai >= 0; ai--) {
        const ast = this.asteroids[ai];
        const dist = Math.hypot(b.x - ast.x, b.y - ast.y);

        if (dist < b.radius + ast.radius) {
          this.bullets.splice(bi, 1);
          this.shotsHit++;
          ast.health -= b.damage;

          this.createSparks(b.x, b.y, ast.color, 6);

          if (ast.health <= 0) {
            this.destroyAsteroid(ast, ai);
          }
          break;
        }
      }
    }

    // 2. Player Bullets vs Enemies
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      if (!b.isPlayer) continue;

      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const enemy = this.enemies[ei];
        const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);

        if (dist < b.radius + enemy.radius) {
          this.bullets.splice(bi, 1);
          this.shotsHit++;
          enemy.health -= b.damage;

          this.createSparks(b.x, b.y, enemy.color, 8);

          if (enemy.health <= 0) {
            this.onEnemyKilled(enemy);
            this.enemies.splice(ei, 1);
          }
          break;
        }
      }
    }

    // 3. Enemy Bullets vs Player
    for (let ebi = this.enemyBullets.length - 1; ebi >= 0; ebi--) {
      const eb = this.enemyBullets[ebi];
      const dist = Math.hypot(eb.x - this.player.x, eb.y - this.player.y);

      if (dist < eb.radius + this.player.radius) {
        this.enemyBullets.splice(ebi, 1);
        this.damagePlayer();
        break;
      }
    }

    // 4. Asteroids vs Player
    for (let ai = this.asteroids.length - 1; ai >= 0; ai--) {
      const ast = this.asteroids[ai];
      const dist = Math.hypot(ast.x - this.player.x, ast.y - this.player.y);

      if (dist < ast.radius + this.player.radius) {
        this.destroyAsteroid(ast, ai);
        this.damagePlayer();
        break;
      }
    }

    // 5. Enemies vs Player
    for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
      const enemy = this.enemies[ei];
      const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);

      if (dist < enemy.radius + this.player.radius) {
        if (enemy.type !== 'MOTHERSHIP') {
          this.onEnemyKilled(enemy);
          this.enemies.splice(ei, 1);
        }
        this.damagePlayer();
        break;
      }
    }

    // 6. PowerUps vs Player
    for (let pui = this.powerUps.length - 1; pui >= 0; pui--) {
      const pu = this.powerUps[pui];
      const dist = Math.hypot(pu.x - this.player.x, pu.y - this.player.y);

      if (dist < pu.radius + this.player.radius + 8) {
        this.applyPowerUp(pu);
        this.powerUps.splice(pui, 1);
      }
    }
  }

  private destroyAsteroid(ast: Asteroid, index: number) {
    this.asteroids.splice(index, 1);
    this.enemiesDestroyed++;
    
    const mult = this.player.scoreBoostTime > 0 ? 2 : 1;
    this.score += ast.points * mult;

    sound.playExplosion(ast.size === 'LARGE' ? 'medium' : 'small');
    this.createExplosion(ast.x, ast.y, ast.color, ast.size === 'LARGE' ? 22 : 14);
    this.addFloatingText(ast.x, ast.y, `+${ast.points * mult}`, ast.color, 1.2);

    // Split large/medium asteroids into fragments
    if (ast.size === 'LARGE') {
      this.asteroids.push(new Asteroid(ast.x - 12, ast.y, 'MEDIUM', -50 + Math.random() * 20, 80));
      this.asteroids.push(new Asteroid(ast.x + 12, ast.y, 'MEDIUM', 50 + Math.random() * 20, 80));
    } else if (ast.size === 'MEDIUM') {
      this.asteroids.push(new Asteroid(ast.x - 8, ast.y, 'SMALL', -40 + Math.random() * 20, 100));
      this.asteroids.push(new Asteroid(ast.x + 8, ast.y, 'SMALL', 40 + Math.random() * 20, 100));
    }

    // Rare powerup drop
    if (Math.random() < 0.08) {
      this.spawnRandomPowerUp(ast.x, ast.y);
    }
  }

  private onEnemyKilled(enemy: Enemy) {
    this.enemiesDestroyed++;
    const mult = this.player.scoreBoostTime > 0 ? 2 : 1;
    const pts = enemy.points * mult;
    this.score += pts;

    if (enemy.type === 'MOTHERSHIP') {
      this.bossActive = false;
      this.bossDefeatedCount++;
      sound.playExplosion('boss');
      this.createExplosion(enemy.x, enemy.y, '#ef4444', 45);
      this.triggerScreenShake(20);
      this.addFloatingText(enemy.x, enemy.y, `BOSS SLAIN +${pts}`, '#ef4444', 2.5);
      this.spawnRandomPowerUp(enemy.x, enemy.y);
      this.spawnRandomPowerUp(enemy.x + 30, enemy.y);
    } else {
      sound.playExplosion('small');
      this.createExplosion(enemy.x, enemy.y, enemy.color, 18);
      this.addFloatingText(enemy.x, enemy.y, `+${pts}`, enemy.color, 1.3);

      // Power-up chance
      if (Math.random() < 0.16) {
        this.spawnRandomPowerUp(enemy.x, enemy.y);
      }
    }
  }

  private spawnRandomPowerUp(x: number, y: number) {
    const types: PowerUpType[] = ['SHIELD', 'TRIPLE_SHOT', 'RAPID_FIRE', 'NUKE_BOMB', 'SCORE_BOOST', 'REPAIR_KIT'];
    const weights = [0.25, 0.25, 0.25, 0.10, 0.10, 0.05];
    const rand = Math.random();
    let accumulated = 0;
    let chosen: PowerUpType = 'SHIELD';

    for (let i = 0; i < types.length; i++) {
      accumulated += weights[i];
      if (rand <= accumulated) {
        chosen = types[i];
        break;
      }
    }

    this.powerUps.push(new PowerUpEntity(x, y, chosen));
  }

  private applyPowerUp(pu: PowerUpEntity) {
    sound.playPowerup(pu.type);
    this.addFloatingText(this.player.x, this.player.y - 30, pu.label, pu.color, 1.8);
    this.createExplosion(pu.x, pu.y, pu.color, 15);

    switch (pu.type) {
      case 'SHIELD':
        this.player.shieldTime = pu.duration;
        this.player.shieldActive = true;
        break;
      case 'TRIPLE_SHOT':
        this.player.tripleShotTime = pu.duration;
        break;
      case 'RAPID_FIRE':
        this.player.rapidFireTime = pu.duration;
        break;
      case 'NUKE_BOMB':
        if (this.bombCount < this.maxBombs) {
          this.bombCount++;
        } else {
          this.useBomb();
        }
        break;
      case 'REPAIR_KIT':
        if (this.lives < this.maxLives) {
          this.lives++;
        } else {
          this.score += 500;
        }
        break;
      case 'SCORE_BOOST':
        this.player.scoreBoostTime = pu.duration;
        break;
    }
  }

  private damagePlayer() {
    if (this.player.invulnerableTime > 0) return;

    if (this.player.shieldActive) {
      // Shield absorbs hit
      sound.playShieldHit();
      this.createExplosion(this.player.x, this.player.y, '#00f3ff', 16);
      this.triggerScreenShake(6);
      this.player.shieldTime = 0;
      this.player.shieldActive = false;
      this.player.invulnerableTime = 1.0;
      this.addFloatingText(this.player.x, this.player.y - 30, 'SHIELD BROKEN!', '#00f3ff', 1.5);
      return;
    }

    this.lives--;
    this.triggerScreenShake(15);
    sound.playPlayerHit();
    this.createExplosion(this.player.x, this.player.y, '#ff0055', 26);
    this.player.invulnerableTime = 2.2;

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.addFloatingText(this.player.x, this.player.y - 30, '⚠️ HULL BREACH!', '#ff0055', 1.8);
    }
  }

  private gameOver() {
    this.saveHighScore();
    this.setState('GAMEOVER');
    sound.stopMusic();
    sound.playGameOver();
  }

  private triggerScreenShake(amount: number) {
    this.screenShake = Math.max(this.screenShake, amount);
  }

  // --- FX / PARTICLES ---
  private updateStars(dt: number) {
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }
  }

  private createSparks(x: number, y: number, color: string, count: number = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.2 + Math.random() * 0.2,
        maxLife: 0.4,
        color,
        size: 1.5 + Math.random() * 2,
        shape: 'spark',
      });
    }
  }

  private createExplosion(x: number, y: number, color: string, count: number = 20) {
    // Shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.35,
      maxLife: 0.35,
      color,
      size: 6,
      shape: 'ring',
    });

    // Particle debris
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        color,
        size: 2 + Math.random() * 3.5,
        shape: 'circle',
        glow: true,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string, duration: number = 1.5) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1.0,
      scale: 1.0,
      vy: -40,
    });
  }

  private emitStats() {
    if (!this.onStatsUpdate) return;

    const activeBuffs: ActiveBuff[] = [];
    if (this.player.shieldActive && this.player.shieldTime > 0) {
      activeBuffs.push({
        type: 'SHIELD',
        timeLeft: this.player.shieldTime,
        maxDuration: 6.0,
        color: '#00f3ff',
        label: 'SHIELD',
      });
    }
    if (this.player.tripleShotTime > 0) {
      activeBuffs.push({
        type: 'TRIPLE_SHOT',
        timeLeft: this.player.tripleShotTime,
        maxDuration: 8.0,
        color: '#f59e0b',
        label: 'TRIPLE SHOT',
      });
    }
    if (this.player.rapidFireTime > 0) {
      activeBuffs.push({
        type: 'RAPID_FIRE',
        timeLeft: this.player.rapidFireTime,
        maxDuration: 8.0,
        color: '#10b981',
        label: 'RAPID FIRE',
      });
    }
    if (this.player.scoreBoostTime > 0) {
      activeBuffs.push({
        type: 'SCORE_BOOST',
        timeLeft: this.player.scoreBoostTime,
        maxDuration: 10.0,
        color: '#fbbf24',
        label: '2X SCORE',
      });
    }

    const accuracy = this.shotsFired > 0 ? Math.min(100, Math.round((this.shotsHit / this.shotsFired) * 100)) : 100;

    this.onStatsUpdate({
      score: this.score,
      highScore: Math.max(this.highScore, this.score),
      lives: this.lives,
      maxLives: this.maxLives,
      level: Math.floor(this.score / 1500) + 1,
      wave: this.wave,
      enemiesDestroyed: this.enemiesDestroyed,
      accuracy,
      shotsFired: this.shotsFired,
      shotsHit: this.shotsHit,
      bossDefeated: this.bossDefeatedCount,
      activeBuffs,
      bombCount: this.bombCount,
      maxBombs: this.maxBombs,
    });
  }

  // --- RENDER LOOP ---
  private render() {
    this.ctx.save();

    // Screen Shake offset
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    // Space Deep Background
    this.ctx.fillStyle = '#060713';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Starfield Parallax
    this.renderStars();

    // Render Asteroids
    for (const ast of this.asteroids) {
      ast.draw(this.ctx);
    }

    // Render Enemies
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }

    // Render PowerUps
    for (const pu of this.powerUps) {
      pu.draw(this.ctx);
    }

    // Render Player Bullets
    for (const b of this.bullets) {
      b.draw(this.ctx);
    }

    // Render Enemy Bullets
    for (const eb of this.enemyBullets) {
      eb.draw(this.ctx);
    }

    // Render Player
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.player.draw(this.ctx);
    }

    // Render Particles
    this.renderParticles();

    // Render Floating Text
    this.renderFloatingText();

    // EMP Nuke Flash overlay
    if (this.nukeFlash > 0) {
      this.ctx.fillStyle = `rgba(168, 85, 247, ${this.nukeFlash * 0.4})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    this.ctx.restore();
  }

  private renderStars() {
    for (const star of this.stars) {
      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = star.brightness;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }

  private renderParticles() {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;

      if (p.shape === 'ring') {
        const ringR = (1 - alpha) * 45;
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = p.color;
        if (p.glow) {
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = p.color;
        }
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  private renderFloatingText() {
    for (const ft of this.floatingTexts) {
      this.ctx.save();
      this.ctx.globalAlpha = ft.alpha;
      this.ctx.font = 'bold 16px Orbitron, sans-serif';
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = ft.color;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }
  }
}
