import { PowerUpType, ShipSkin } from '../types';

export class Player {
  public x: number;
  public y: number;
  public targetX: number;
  public vx: number = 0;
  public speed: number = 420; // pixels per sec
  public width: number = 44;
  public height: number = 52;
  public radius: number = 22;
  public tilt: number = 0; // -1 to 1 for banking
  
  public skin: ShipSkin = 'CYAN_VIPER';
  public invulnerableTime: number = 0; // i-frames
  public shieldActive: boolean = false;
  public shieldTime: number = 0;
  public tripleShotTime: number = 0;
  public rapidFireTime: number = 0;
  public scoreBoostTime: number = 0;
  
  public fireCooldown: number = 0;
  public baseFireRate: number = 0.18; // seconds between shots
  public thrusterFlicker: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.targetX = x;
  }

  public update(dt: number, moveLeft: boolean, moveRight: boolean, canvasWidth: number) {
    // Horizontal control
    let dir = 0;
    if (moveLeft) dir -= 1;
    if (moveRight) dir += 1;

    // Smooth movement & banking
    const targetVx = dir * this.speed;
    this.vx += (targetVx - this.vx) * Math.min(1, dt * 14);
    this.x += this.vx * dt;

    // Clamping to canvas bounds
    const minX = this.width / 2 + 10;
    const maxX = canvasWidth - this.width / 2 - 10;
    if (this.x < minX) {
      this.x = minX;
      this.vx = 0;
    }
    if (this.x > maxX) {
      this.x = maxX;
      this.vx = 0;
    }

    // Tilt calculation
    const targetTilt = this.vx / this.speed;
    this.tilt += (targetTilt - this.tilt) * Math.min(1, dt * 12);

    // Timers
    if (this.invulnerableTime > 0) this.invulnerableTime -= dt;
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.shieldTime > 0) {
      this.shieldTime -= dt;
      this.shieldActive = true;
    } else {
      this.shieldActive = false;
    }
    if (this.tripleShotTime > 0) this.tripleShotTime -= dt;
    if (this.rapidFireTime > 0) this.rapidFireTime -= dt;
    if (this.scoreBoostTime > 0) this.scoreBoostTime -= dt;

    this.thrusterFlicker += dt * 30;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.tilt * 0.22); // Tilt angle

    // Invulnerability blink effect
    if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime * 20) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // Engine Thruster Flame
    this.drawThruster(ctx);

    // Ship Body Colors by Skin
    let primaryColor = '#00f3ff';
    let secondaryColor = '#0066ff';
    let cockpitColor = '#ffffff';

    if (this.skin === 'NEON_PHOENIX') {
      primaryColor = '#ff0055';
      secondaryColor = '#ff7700';
    } else if (this.skin === 'EMERALD_SPECTRE') {
      primaryColor = '#00ffaa';
      secondaryColor = '#008855';
    } else if (this.skin === 'SOLAR_FLARE') {
      primaryColor = '#ffcc00';
      secondaryColor = '#ff4400';
    }

    // Ship Vector Geometry
    ctx.shadowBlur = 15;
    ctx.shadowColor = primaryColor;
    ctx.lineWidth = 2.5;

    // Wing Left
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(-20, 18);
    ctx.lineTo(-12, 12);
    ctx.lineTo(-6, 20);
    ctx.lineTo(0, 14);
    ctx.strokeStyle = primaryColor;
    ctx.fillStyle = '#080d1a';
    ctx.fill();
    ctx.stroke();

    // Wing Right
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(20, 18);
    ctx.lineTo(12, 12);
    ctx.lineTo(6, 20);
    ctx.lineTo(0, 14);
    ctx.strokeStyle = primaryColor;
    ctx.fillStyle = '#080d1a';
    ctx.fill();
    ctx.stroke();

    // Center Fuselage
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(8, 6);
    ctx.lineTo(0, 16);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.strokeStyle = secondaryColor;
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.stroke();

    // Wing Cannon Tips
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-18, 6, 3, 10);
    ctx.fillRect(15, 6, 3, 10);

    // Glowing Cockpit Glass
    ctx.beginPath();
    ctx.ellipse(0, -6, 4, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = cockpitColor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.fill();

    // Active Force Shield Bubble
    if (this.shieldActive) {
      this.drawShieldAura(ctx);
    }

    ctx.restore();
  }

  private drawThruster(ctx: CanvasRenderingContext2D) {
    const flameHeight = 14 + Math.sin(this.thrusterFlicker) * 6;
    const gradient = ctx.createLinearGradient(0, 14, 0, 14 + flameHeight);
    gradient.addColorStop(0, '#00f3ff');
    gradient.addColorStop(0.5, '#0066ff');
    gradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#00f3ff';
    ctx.fillStyle = gradient;

    // Dual thrusters
    ctx.beginPath();
    ctx.moveTo(-7, 16);
    ctx.lineTo(-4, 16 + flameHeight);
    ctx.lineTo(-1, 16);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(1, 16);
    ctx.lineTo(4, 16 + flameHeight);
    ctx.lineTo(7, 16);
    ctx.fill();

    ctx.restore();
  }

  private drawShieldAura(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const pulse = Math.sin(Date.now() * 0.008) * 3;
    const shieldR = this.radius + 12 + pulse;

    ctx.beginPath();
    ctx.arc(0, 0, shieldR, 0, Math.PI * 2);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00f3ff';
    ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
    ctx.fill();
    ctx.stroke();

    // Rotating shield segments
    const angle = Date.now() * 0.003;
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, shieldR, angle + (i * Math.PI * 2) / 3, angle + (i * Math.PI * 2) / 3 + 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export class Bullet {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number = 3.5;
  public color: string;
  public damage: number = 1;
  public isPlayer: boolean = true;
  public trail: { x: number; y: number }[] = [];

  constructor(x: number, y: number, vx: number, vy: number, color: string = '#00f3ff', damage: number = 1, isPlayer: boolean = true) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.damage = damage;
    this.isPlayer = isPlayer;
  }

  public update(dt: number) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 4) this.trail.shift();

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;

    // Trail
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.radius * 0.9;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Glowing bullet head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

export class Asteroid {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public size: 'LARGE' | 'MEDIUM' | 'SMALL';
  public radius: number;
  public health: number;
  public maxHealth: number;
  public points: number;
  public rotation: number = 0;
  public vRot: number;
  public vertices: { x: number; y: number }[] = [];
  public color: string = '#00e5ff';

  constructor(x: number, y: number, size: 'LARGE' | 'MEDIUM' | 'SMALL', vx?: number, vy?: number) {
    this.x = x;
    this.y = y;
    this.size = size;

    if (size === 'LARGE') {
      this.radius = 36;
      this.health = 4;
      this.points = 150;
      this.color = '#38bdf8';
    } else if (size === 'MEDIUM') {
      this.radius = 22;
      this.health = 2;
      this.points = 100;
      this.color = '#818cf8';
    } else {
      this.radius = 14;
      this.health = 1;
      this.points = 50;
      this.color = '#c084fc';
    }

    this.maxHealth = this.health;
    this.vx = vx !== undefined ? vx : (Math.random() - 0.5) * 60;
    this.vy = vy !== undefined ? vy : 65 + Math.random() * 55;
    this.vRot = (Math.random() - 0.5) * 2.5;

    // Generate irregular polygon vertices
    const numVertices = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * Math.PI * 2;
      const variation = 0.75 + Math.random() * 0.45;
      this.vertices.push({
        x: Math.cos(angle) * this.radius * variation,
        y: Math.sin(angle) * this.radius * variation,
      });
    }
  }

  public update(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.vRot * dt;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.color;
    ctx.fillStyle = '#0b1120';

    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crater / Internal cracks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.radius * 0.25, -this.radius * 0.2, this.radius * 0.25, 0, Math.PI * 2);
    ctx.stroke();

    // Damaged health indicator
    if (this.health < this.maxHealth) {
      ctx.fillStyle = '#ff0055';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ff0055';
      ctx.fillRect(-12, -this.radius - 8, 24 * (this.health / this.maxHealth), 3);
    }

    ctx.restore();
  }
}

export type EnemyType = 'SCOUT' | 'HUNTER' | 'SWARMER' | 'MOTHERSHIP';

export class Enemy {
  public id: string;
  public type: EnemyType;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number;
  public width: number;
  public height: number;
  public health: number;
  public maxHealth: number;
  public points: number;
  public color: string;
  public shootCooldown: number = 0;
  public shootInterval: number = 2.0;
  public timeAlive: number = 0;
  public initialX: number;

  constructor(x: number, y: number, type: EnemyType, wave: number = 1) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.type = type;
    this.x = x;
    this.y = y;
    this.initialX = x;

    const waveScaling = 1 + wave * 0.08;

    if (type === 'SCOUT') {
      this.width = 30;
      this.height = 30;
      this.radius = 16;
      this.health = Math.round(1 * waveScaling);
      this.points = 120;
      this.color = '#ff007f';
      this.vx = 80;
      this.vy = 120 + Math.random() * 40;
    } else if (type === 'HUNTER') {
      this.width = 44;
      this.height = 42;
      this.radius = 22;
      this.health = Math.round(3 * waveScaling);
      this.points = 250;
      this.color = '#f59e0b';
      this.vx = 45;
      this.vy = 85;
      this.shootInterval = Math.max(1.1, 2.2 - wave * 0.08);
      this.shootCooldown = 1.0 + Math.random();
    } else if (type === 'SWARMER') {
      this.width = 24;
      this.height = 24;
      this.radius = 13;
      this.health = Math.round(1 * waveScaling);
      this.points = 180;
      this.color = '#10b981';
      this.vx = 0;
      this.vy = 160 + Math.random() * 50;
    } else {
      // MOTHERSHIP (Boss)
      this.width = 96;
      this.height = 70;
      this.radius = 48;
      this.health = Math.round(30 + wave * 12);
      this.points = 1500;
      this.color = '#ef4444';
      this.vx = 60;
      this.vy = 28;
      this.shootInterval = 1.0;
      this.shootCooldown = 1.0;
    }

    this.maxHealth = this.health;
  }

  public update(dt: number, playerX: number, playerY: number, onShoot?: (b: Bullet) => void) {
    this.timeAlive += dt;

    if (this.type === 'SCOUT') {
      // Zig-zag motion
      this.x = this.initialX + Math.sin(this.timeAlive * 4.5) * 80;
      this.y += this.vy * dt;
    } else if (this.type === 'HUNTER') {
      this.x += Math.sin(this.timeAlive * 2) * this.vx * dt * 2;
      this.y += this.vy * dt;

      // Shooting logic
      this.shootCooldown -= dt;
      if (this.shootCooldown <= 0 && onShoot) {
        this.shootCooldown = this.shootInterval;
        onShoot(new Bullet(this.x, this.y + 20, 0, 240, '#ff3366', 1, false));
      }
    } else if (this.type === 'SWARMER') {
      // Homing dive towards player
      const dx = playerX - this.x;
      this.x += Math.sign(dx) * Math.min(Math.abs(dx), 110 * dt);
      this.y += this.vy * dt;
    } else if (this.type === 'MOTHERSHIP') {
      // Boss floats and sweeps horizontally at top
      if (this.y < 90) {
        this.y += this.vy * dt;
      }
      this.x += Math.sin(this.timeAlive * 1.5) * this.vx * dt * 2.5;

      // Boss multi-shot attacks
      this.shootCooldown -= dt;
      if (this.shootCooldown <= 0 && onShoot) {
        this.shootCooldown = this.shootInterval;
        // Dual laser + spread
        onShoot(new Bullet(this.x - 28, this.y + 25, -40, 220, '#ff0055', 1, false));
        onShoot(new Bullet(this.x, this.y + 35, 0, 250, '#ff4400', 1, false));
        onShoot(new Bullet(this.x + 28, this.y + 25, 40, 220, '#ff0055', 1, false));
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.shadowBlur = 14;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.fillStyle = '#090d16';
    ctx.lineWidth = 2.5;

    if (this.type === 'SCOUT') {
      // Dart drone
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(-14, -14);
      ctx.lineTo(0, -6);
      ctx.lineTo(14, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing core
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'HUNTER') {
      // Cruiser
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(-20, -10);
      ctx.lineTo(-10, -20);
      ctx.lineTo(10, -20);
      ctx.lineTo(20, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cannons
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-16, 4, 4, 8);
      ctx.fillRect(12, 4, 4, 8);

      // Core
      ctx.fillStyle = this.color;
      ctx.fillRect(-5, -6, 10, 8);
    } else if (this.type === 'SWARMER') {
      // Diamond diver
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.lineTo(-12, 0);
      ctx.lineTo(0, -14);
      ctx.lineTo(12, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Boss Mothership
      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(-44, 10);
      ctx.lineTo(-40, -24);
      ctx.lineTo(-20, -32);
      ctx.lineTo(20, -32);
      ctx.lineTo(40, -24);
      ctx.lineTo(44, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wing glow lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-35, 0);
      ctx.lineTo(-15, 15);
      ctx.moveTo(35, 0);
      ctx.lineTo(15, 15);
      ctx.stroke();

      // Giant glowing reactor core
      const pulse = Math.sin(Date.now() * 0.01) * 3;
      ctx.fillStyle = '#ff0055';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff0055';
      ctx.beginPath();
      ctx.arc(0, -2, 14 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Boss Health Bar on top
      const barW = 80;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(-barW / 2, -45, barW, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-barW / 2, -45, barW * (this.health / this.maxHealth), 6);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barW / 2, -45, barW, 6);
    }

    // Health bar for standard damaged enemies
    if (this.type !== 'MOTHERSHIP' && this.health < this.maxHealth) {
      const barW = this.width * 0.8;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2, -this.height / 2 - 6, barW, 3);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-barW / 2, -this.height / 2 - 6, barW * (this.health / this.maxHealth), 3);
    }

    ctx.restore();
  }
}

export class PowerUpEntity {
  public id: string;
  public type: PowerUpType;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number = 18;
  public duration: number;
  public color: string;
  public label: string;
  public symbol: string;
  public pulsePhase: number = 0;

  constructor(x: number, y: number, type: PowerUpType) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 30;
    this.vy = 80;

    switch (type) {
      case 'SHIELD':
        this.color = '#00f3ff';
        this.label = 'SHIELD';
        this.symbol = '🛡️';
        this.duration = 6.0;
        break;
      case 'TRIPLE_SHOT':
        this.color = '#f59e0b';
        this.label = 'TRIPLE SHOT';
        this.symbol = '🔱';
        this.duration = 8.0;
        break;
      case 'RAPID_FIRE':
        this.color = '#10b981';
        this.label = 'RAPID FIRE';
        this.symbol = '⚡';
        this.duration = 8.0;
        break;
      case 'NUKE_BOMB':
        this.color = '#a855f7';
        this.label = 'MEGA NUKE';
        this.symbol = '💥';
        this.duration = 0;
        break;
      case 'REPAIR_KIT':
        this.color = '#ec4899';
        this.label = '+1 LIFE';
        this.symbol = '❤️';
        this.duration = 0;
        break;
      case 'SCORE_BOOST':
        this.color = '#fbbf24';
        this.label = '2X SCORE';
        this.symbol = '⭐';
        this.duration = 10.0;
        break;
    }
  }

  public update(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.pulsePhase += dt * 5;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const pulse = Math.sin(this.pulsePhase) * 3;
    const currentR = this.radius + pulse;

    // Glowing halo
    ctx.shadowBlur = 18;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;

    ctx.fillStyle = '#060913';
    ctx.beginPath();
    ctx.arc(0, 0, currentR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rotating dashed outer ring
    ctx.save();
    ctx.rotate(Date.now() * 0.003);
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, currentR + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Icon symbol / label
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, 0, 1);

    ctx.restore();
  }
}
