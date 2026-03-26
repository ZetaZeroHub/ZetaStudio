/* ========================================
   游戏梦想家 — 战斗系统
   含元素泡泡、敌人AI、伤害计算
   三武器形态 + 属性克制 + 敌人射击
   ======================================== */

import * as PIXI from 'pixi.js';
import { ELEMENTS, getElementMultiplier } from '../../../data/elements';
import ENEMY_DEFS, { BOSS_DEFS } from '../../../data/enemies';
import { PHYSICS } from './physics';
import { drawBubble } from './renderer';
import { playSound } from './audioManager';

/* ── 三种武器形态定义 ── */
export const WEAPON_MODES = {
  bubble: {
    id: 'none', name: '泡泡', icon: '🫧',
    color: 0x64B5F6, desc: '困住敌人一段时间，不造成伤害',
    traps: true,
    trapDuration: 150,
    baseDmg: 0,
    unlocked: true,
    hasAmmo: false,     // 泡泡无限弹药
  },
  fire: {
    id: 'fire', name: '火焰', icon: '🔥',
    color: 0xFF6B35, desc: '对水系敌人伤害翻倍',
    traps: false,
    baseDmg: 1,
    unlocked: false,
    unlockItem: 'weapon_fire',
    hasAmmo: true,      // 有弹药限制
    ammoPerPickup: 20,  // 每次拾取+20发
  },
  water: {
    id: 'water', name: '水流', icon: '💧',
    color: 0x4FC3F7, desc: '对火系敌人伤害翻倍',
    traps: false,
    baseDmg: 1,
    unlocked: false,
    unlockItem: 'weapon_water',
    hasAmmo: true,
    ammoPerPickup: 20,
  },
};

export const WEAPON_ORDER = ['bubble', 'fire', 'water'];

/**
 * Create enemy sprite data from level definition
 * Supports both regular enemies and BOSSes
 */
export function createEnemySprite(en) {
  const isBoss = en.isBoss || en.type in BOSS_DEFS;
  const def = isBoss
    ? (BOSS_DEFS[en.type] || ENEMY_DEFS[en.type] || ENEMY_DEFS.slime)
    : (ENEMY_DEFS[en.type] || ENEMY_DEFS.slime);

  return {
    x: en.x,
    y: en.y,
    vx: 0,
    vy: 0,                          // 垂直速度（重力系统）
    onPlatform: false,               // 是否站在平台上
    gravityEnabled: !def.flying,     // 非飞行敌人启用重力
    hasLanded: false,                // 是否已首次着陆
    type: en.type,
    element: en.element || def.element,
    startX: en.x,
    startY: en.y,
    patrolRange: en.patrolRange || def.patrolDefault,
    dir: 1,
    alive: true,
    hp: def.hp,
    maxHp: def.hp,
    speed: def.speed,
    flying: !!def.flying,
    score: def.score,
    color: def.color,
    behavior: en.behavior || def.behavior,  // 允许覆盖行为
    isBoss: !!def.isBoss,
    bossPhase: 0,
    phaseThresholds: def.phaseThresholds || [],
    attackTimer: 0,
    attackCooldown: 80,
    // Behavior-specific state
    jumpTimer: 0,
    jumpPhase: 0,
    isShell: false,
    shellVx: 0,
    bounceTimer: 0,                  // bounce行为计时
    // BOSS-specific
    chargeVx: 0,
    isCharging: false,
    teleportTimer: 0,
    isBurrowed: false,
    slamPhase: 0,
    // Shooting
    shootTimer: def.shootCooldown || 150,
    canShoot: !!def.ranged,
    bulletDef: def.ranged ? {
      speed: def.bulletSpeed || 3,
      gravity: def.bulletGravity || 0,
      color: def.bulletColor || 0xFF0000,
      size: def.bulletSize || 5,
      cooldown: def.shootCooldown || 120,
      range: def.shootRange || 200,
    } : null,
    // Bubble trap state
    trapped: false,
    trappedTimer: 0,
    // Hit flash
    hitFlash: 0,
    weaknessFlash: 0,
    weaknessText: '',
  };
}

/**
 * Update enemy AI behavior (with gravity physics)
 * @param {object} enemy
 * @param {object} gs - game state
 * @param {number} delta
 * @param {Array} platforms - level platforms for gravity collision
 */
export function updateEnemyAI(enemy, gs, delta, platforms) {
  if (!enemy.alive) return;

  // ── Bubble trap: freeze enemy ──
  if (enemy.trapped) {
    enemy.trappedTimer -= delta;
    if (enemy.trappedTimer <= 0) {
      enemy.trapped = false;
      enemy.trappedTimer = 0;
    }
    return; // Skip all AI while trapped
  }

  // ── Weakness flash countdown ──
  if (enemy.weaknessFlash > 0) enemy.weaknessFlash -= delta;
  if (enemy.hitFlash > 0) enemy.hitFlash -= delta;

  // ── 重力物理系统（非飞行敌人） ──
  if (enemy.gravityEnabled && platforms) {
    // 应用重力
    enemy.vy = (enemy.vy || 0) + 0.35 * delta;
    if (enemy.vy > 10) enemy.vy = 10; // 终端速度
    enemy.y += enemy.vy * delta;
    enemy.onPlatform = false;

    // 平台碰撞检测
    const eW = 24; // 敌人碰撞宽度
    for (const p of platforms) {
      const pH = p.h || (p.y >= 500 ? 200 : 16);
      // 水平重叠检测
      if (enemy.x + eW / 2 > p.x + 4 && enemy.x - eW / 2 < p.x + p.w - 4) {
        // 着陆在平台顶部
        if (enemy.vy >= 0 && enemy.y >= p.y && enemy.y <= p.y + 20) {
          enemy.y = p.y;
          enemy.vy = 0;
          enemy.onPlatform = true;
          // 首次着陆后更新起始Y（用于巡逻高度基准）
          if (!enemy.hasLanded) {
            enemy.hasLanded = true;
            enemy.startY = enemy.y;
          }
        }
      }
    }

    // 坠落出世界 → 标记死亡
    if (enemy.y > (gs.worldHeight || 700) + 100) {
      enemy.alive = false;
      if (enemy.gfx) enemy.gfx.visible = false;
      return;
    }
  }

  switch (enemy.behavior) {
    case 'crawl':
      // Worm: slow direct crawl
      enemy.x += enemy.speed * enemy.dir * delta * 0.6;
      if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
      break;

    case 'patrol':
      // Slime: patrol with bounce
      enemy.x += enemy.speed * enemy.dir * delta;
      if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
      break;

    case 'bounce':
      // 巡逻+弹跳效果（如方块史莱姆）
      enemy.x += enemy.speed * enemy.dir * delta;
      if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
      enemy.bounceTimer = (enemy.bounceTimer || 0) + delta;
      if (enemy.bounceTimer > 40 && enemy.onPlatform) {
        enemy.vy = -5; // 小跳
        enemy.onPlatform = false;
        enemy.bounceTimer = 0;
      }
      break;

    case 'jump':
      // Frog: periodic high jumps
      enemy.jumpTimer += delta;
      if (enemy.jumpPhase === 0) {
        // On ground, waiting
        if (enemy.jumpTimer > 80) {
          enemy.jumpPhase = 1;
          enemy.jumpTimer = 0;
          enemy.jumpVy = -8;
        }
      } else {
        // In air
        enemy.jumpVy = (enemy.jumpVy || 0) + 0.3 * delta;
        enemy.y += enemy.jumpVy * delta;
        enemy.x += enemy.dir * enemy.speed * 2 * delta;
        if (enemy.y >= enemy.startY) {
          enemy.y = enemy.startY;
          enemy.jumpPhase = 0;
          enemy.jumpVy = 0;
          enemy.dir *= -1;
        }
      }
      break;

    case 'fly':
      // Bat: sine wave plus patrol
      enemy.x += enemy.speed * enemy.dir * delta;
      if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
      enemy.y = enemy.startY + Math.sin(gs.frame * 0.05 + enemy.startX) * 20;
      break;

    case 'armor':
      // Turtle: patrol normally, when hit once, becomes shell
      if (enemy.isShell) {
        enemy.x += enemy.shellVx * delta;
        // Bounce off world edges
        if (enemy.x < 20 || enemy.x > 3000) enemy.shellVx *= -1;
      } else {
        enemy.x += enemy.speed * enemy.dir * delta;
        if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
      }
      break;

    case 'phase':
      // Ghost: float and fade, sine wave movement
      enemy.x += enemy.speed * enemy.dir * delta;
      if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
      enemy.y = enemy.startY + Math.sin(gs.frame * 0.03 + enemy.startX) * 25;
      break;

    // ═══ BOSS Behaviors ═══
    case 'charge': {
      // Tree Boss: patrol → charge at player when close
      enemy.attackTimer += delta;
      const distToPlayer = gs.px - enemy.x;
      const inRange = Math.abs(distToPlayer) < 300;

      if (enemy.isCharging) {
        enemy.x += enemy.chargeVx * delta;
        enemy.attackTimer += delta;
        if (enemy.attackTimer > 60 || Math.abs(enemy.x - enemy.startX) > enemy.patrolRange * 2) {
          enemy.isCharging = false;
          enemy.attackTimer = 0;
          enemy.chargeVx = 0;
        }
      } else if (inRange && enemy.attackTimer > enemy.attackCooldown) {
        enemy.isCharging = true;
        enemy.chargeVx = distToPlayer > 0 ? enemy.speed * 5 : enemy.speed * -5;
        enemy.attackTimer = 0;
        enemy.dir = distToPlayer > 0 ? 1 : -1;
      } else {
        enemy.x += enemy.speed * enemy.dir * delta;
        if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
      }
      // Speed up in rage phase
      if (enemy.hp / enemy.maxHp < (enemy.phaseThresholds[0] || 0.5)) {
        enemy.attackCooldown = 40;
      }
      enemy.vx = enemy.isCharging ? enemy.chargeVx : enemy.speed * enemy.dir;
      break;
    }

    case 'slam': {
      // Crab Boss: patrol → jump slam when player is close
      enemy.attackTimer += delta;
      const crabDist = Math.abs(gs.px - enemy.x);

      if (enemy.slamPhase === 1) {
        // Rising
        enemy.jumpVy = (enemy.jumpVy || 0) + 0.25 * delta;
        enemy.y += enemy.jumpVy * delta;
        if (enemy.jumpVy > 0 && enemy.y >= enemy.startY) {
          enemy.y = enemy.startY;
          enemy.slamPhase = 0;
          enemy.jumpVy = 0;
        }
      } else if (crabDist < 200 && enemy.attackTimer > enemy.attackCooldown) {
        enemy.slamPhase = 1;
        enemy.jumpVy = -10;
        enemy.attackTimer = 0;
        // Move toward player during jump
        enemy.dir = gs.px > enemy.x ? 1 : -1;
        enemy.x += enemy.dir * 30;
      } else {
        enemy.x += enemy.speed * enemy.dir * delta;
        if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
      }
      // Rage: faster slams
      const ratio = enemy.hp / enemy.maxHp;
      enemy.attackCooldown = ratio < 0.3 ? 30 : ratio < 0.6 ? 50 : 80;
      enemy.vx = enemy.speed * enemy.dir;
      break;
    }

    case 'teleport': {
      // Witch Boss: teleport near player + shoot
      enemy.teleportTimer += delta;
      enemy.attackTimer += delta;

      if (enemy.teleportTimer > 120) {
        // Teleport near player
        const offset = (Math.random() > 0.5 ? 1 : -1) * (80 + Math.random() * 60);
        enemy.x = gs.px + offset;
        enemy.y = enemy.startY + (Math.random() - 0.5) * 40;
        enemy.teleportTimer = 0;
        enemy.dir = gs.px > enemy.x ? 1 : -1;
      }
      // Float
      enemy.y = enemy.startY + Math.sin(gs.frame * 0.04) * 20;
      enemy.vx = enemy.speed * enemy.dir * 0.3;
      break;
    }

    case 'burrow': {
      // Scorpion Boss: burrow underground → emerge under player
      enemy.attackTimer += delta;

      if (enemy.isBurrowed) {
        // Moving underground toward player
        const targetX = gs.px;
        const bDist = targetX - enemy.x;
        enemy.x += Math.sign(bDist) * enemy.speed * 3 * delta;
        if (Math.abs(bDist) < 20 || enemy.attackTimer > 60) {
          // Emerge!
          enemy.isBurrowed = false;
          enemy.y = enemy.startY;
          enemy.attackTimer = 0;
        }
      } else if (enemy.attackTimer > enemy.attackCooldown) {
        // Go underground
        enemy.isBurrowed = true;
        enemy.y = enemy.startY + 50; // below ground visual
        enemy.attackTimer = 0;
      } else {
        enemy.x += enemy.speed * enemy.dir * delta;
        if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
      }
      // Multi-phase rage
      const sRatio = enemy.hp / enemy.maxHp;
      enemy.attackCooldown = sRatio < 0.15 ? 25 : sRatio < 0.4 ? 40 : sRatio < 0.7 ? 60 : 80;
      enemy.vx = enemy.isBurrowed ? 0 : enemy.speed * enemy.dir;
      break;
    }

    default:
      enemy.x += enemy.speed * enemy.dir * delta;
      enemy.vx = enemy.speed * enemy.dir;
      if (Math.abs(enemy.x - enemy.startX) > enemy.patrolRange) enemy.dir *= -1;
  }
}

/**
 * Element-specific projectile physics
 * Each element has different speed, gravity, size, and lifetime
 */
const PROJECTILE_PHYSICS = {
  none:  { speed: 6,  gravity: 0.08, life: 70,  size: 7,  trailRate: 4 },   // 普通泡泡：中等坠落
  fire:  { speed: 7,  gravity: -0.03, life: 50, size: 6,  trailRate: 2 },   // 火泡：轻微上飘，快速
  water: { speed: 5,  gravity: 0.15, life: 80,  size: 8,  trailRate: 3 },   // 水泡：重力弧线坠落
  grass: { speed: 5.5, gravity: 0.05, life: 65, size: 7,  trailRate: 3 },   // 风泡：轻微坠落+螺旋
  light: { speed: 9,  gravity: 0,    life: 45,  size: 5,  trailRate: 5 },   // 光泡：直线高速无坠落
};

/**
 * Fire a projectile in the given direction (360°)
 * @param {object} gs - game state
 * @param {PIXI.Container} worldLayer
 * @param {string} elementId - element type
 * @param {number} aimAngle - firing angle in radians (0=right, PI/2=down, -PI/2=up)
 * @returns projectile object
 */
export function fireProjectile(gs, worldLayer, elementId, aimAngle) {
  // ── 弹药消耗 ──
  const wKey = gs.currentWeapon || 'bubble';
  const wDef = WEAPON_MODES[wKey];
  if (wDef?.hasAmmo) {
    if (!gs.ammo) gs.ammo = {};
    const ammo = gs.ammo[wKey] || 0;
    if (ammo <= 0) {
      // 弹药耗尽，自动切回泡泡
      gs.currentWeapon = 'bubble';
      gs.currentElement = 'none';
      elementId = 'none';
    } else {
      gs.ammo[wKey] = ammo - 1;
    }
  }

  const phys = PROJECTILE_PHYSICS[elementId] || PROJECTILE_PHYSICS.none;

  // If no explicit angle, use facing direction
  if (aimAngle === undefined || aimAngle === null) {
    aimAngle = gs.facing === 'right' ? 0 : Math.PI;
  }

  const cosA = Math.cos(aimAngle);
  const sinA = Math.sin(aimAngle);

  const proj = {
    gfx: new PIXI.Graphics(),
    x: gs.px + cosA * 18,
    y: gs.py - 10 + sinA * 18,
    vx: cosA * phys.speed,
    vy: sinA * phys.speed,
    life: phys.life,
    maxLife: phys.life,
    element: elementId || 'none',
    gravity: phys.gravity,
    size: phys.size,
    trailRate: phys.trailRate,
    trailTimer: 0,
    angle: aimAngle,
    isParticle: false,
    isTrail: false,
  };

  drawBubble(proj.gfx, elementId);
  proj.gfx.x = proj.x;
  proj.gfx.y = proj.y;
  worldLayer.addChild(proj.gfx);
  return proj;
}

/**
 * Update projectiles: physics (gravity drop), trail spawning, lifetime, enemy hits, terrain collision
 */
export function updateProjectiles(projectiles, enemies, gs, delta, worldLayer, setScore, platforms, interactables) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const b = projectiles[i];

    if (b.isParticle || b.isTrail) {
      // Particle/trail physics
      b.x += (b.vx || 0) * delta;
      b.y += (b.vy || 0) * delta;
      if (b.isParticle) b.vy += 0.2;
      b.life -= delta;
      b.gfx.x = b.x;
      b.gfx.y = b.y;
      const fadeBase = b.isTrail ? 15 : 30;
      b.gfx.alpha = Math.max(0, b.life / fadeBase);
      if (b.isTrail) b.gfx.scale.set(Math.max(0.2, b.life / fadeBase));
      if (b.life <= 0) {
        worldLayer.removeChild(b.gfx);
        projectiles.splice(i, 1);
      }
      continue;
    }

    // ── Projectile physics ──
    // Apply element-specific gravity
    b.vy += b.gravity * delta;

    // Grass element: spiral wobble
    if (b.element === 'grass') {
      b.vy += Math.sin(gs.frame * 0.3 + b.angle) * 0.06;
    }

    // Clamp vertical speed
    if (b.vy > 6) b.vy = 6;
    if (b.vy < -3) b.vy = -3;

    b.x += b.vx * delta;
    b.y += b.vy * delta;
    b.life -= delta;
    b.gfx.x = b.x;
    b.gfx.y = b.y;

    // Rotate bubble graphic to face velocity direction
    b.gfx.rotation = Math.atan2(b.vy, b.vx);

    // Alpha fade near end of life
    if (b.life < 15) {
      b.gfx.alpha = Math.max(0.2, b.life / 15);
    }

    // ── Spawn trail particles ──
    b.trailTimer += delta;
    if (b.trailTimer >= b.trailRate) {
      b.trailTimer = 0;
      const elem = ELEMENTS[b.element] || ELEMENTS.none;
      const trail = {
        gfx: new PIXI.Graphics(),
        x: b.x, y: b.y,
        vx: 0, vy: 0,
        life: 15,
        isParticle: false,
        isTrail: true,
      };
      trail.gfx.beginFill(elem.bubbleColor, 0.5);
      trail.gfx.drawCircle(0, 0, b.size * 0.4);
      trail.gfx.endFill();
      trail.gfx.x = b.x;
      trail.gfx.y = b.y;
      worldLayer.addChild(trail.gfx);
      projectiles.push(trail);
    }

    // ── Out-of-bounds / lifetime removal ──
    if (b.life <= 0 || b.x < gs.cameraX - 100 || b.x > gs.cameraX + 1200 ||
        b.y < gs.cameraY - 200 || b.y > gs.cameraY + 800) {
      worldLayer.removeChild(b.gfx);
      projectiles.splice(i, 1);
      continue;
    }

    // ── Terrain collision — bullets blocked by platforms ──
    if (platforms) {
      let hitTerrain = false;
      for (const p of platforms) {
        const pH = p.h || (p.y >= 500 ? 200 : 16);
        if (b.x > p.x && b.x < p.x + p.w && b.y > p.y && b.y < p.y + pH) {
          hitTerrain = true;
          break;
        }
      }
      if (hitTerrain) {
        // Impact particles
        for (let sp = 0; sp < 3; sp++) {
          const spark = {
            gfx: new PIXI.Graphics(),
            x: b.x, y: b.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 2 - 1,
            life: 15,
            isParticle: true,
          };
          const elem = ELEMENTS[b.element] || ELEMENTS.none;
          spark.gfx.beginFill(elem.bubbleColor || 0xCCCCCC, 0.7);
          spark.gfx.drawCircle(0, 0, 2);
          spark.gfx.endFill();
          spark.gfx.x = b.x;
          spark.gfx.y = b.y;
          worldLayer.addChild(spark.gfx);
          projectiles.push(spark);
        }
        worldLayer.removeChild(b.gfx);
        projectiles.splice(i, 1);
        continue;
      }
    }

    // ── Interactable collision — bullets break sturdy/danger blocks ──
    if (interactables) {
      let hitBlock = false;
      for (const obj of interactables) {
        if (!obj.alive || !obj.isBulletBreakable) continue;
        const bW = obj.w || 32;
        const bH = obj.h || 32;
        if (b.x > obj.x && b.x < obj.x + bW && b.y > obj.y && b.y < obj.y + bH) {
          hitBlock = true;
          if (obj.type === 'sturdyBlock') {
            // 破碎 + 掉落奖励
            obj.alive = false;
            obj.breakAnim = 20;
            gs.score += 10;
            if (setScore) setScore(s => s + 10);
          } else if (obj.type === 'dangerBlock') {
            // 触发爆炸
            obj.exploding = true;
            obj.explodeTimer = 0;
          }
          break;
        }
      }
      if (hitBlock) {
        // Impact particles
        for (let sp = 0; sp < 4; sp++) {
          const spark = {
            gfx: new PIXI.Graphics(),
            x: b.x, y: b.y,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 1,
            life: 20,
            isParticle: true,
          };
          spark.gfx.beginFill(0xFF8800, 0.8);
          spark.gfx.drawCircle(0, 0, 3);
          spark.gfx.endFill();
          spark.gfx.x = b.x;
          spark.gfx.y = b.y;
          worldLayer.addChild(spark.gfx);
          projectiles.push(spark);
        }
        worldLayer.removeChild(b.gfx);
        projectiles.splice(i, 1);
        playSound('enemyHit', 0.3);
        continue;
      }
    }

    // ── Check enemy hits ──
    for (const en of enemies) {
      if (!en.alive) continue;
      if (Math.abs(b.x - en.x) < 20 && Math.abs(b.y - en.y) < 20) {
        const mult = getElementMultiplier(b.element, en.element);
        const weaponMode = WEAPON_MODES[gs.currentWeapon || 'bubble'];
        const baseDmg = weaponMode?.baseDmg ?? 1;
        let damage = Math.ceil(baseDmg * mult);

        // ── 泡泡困敌：零伤害，纯困住 + 动画效果 ──
        if (b.element === 'none' && weaponMode?.traps && !en.isBoss) {
          en.trapped = true;
          en.trappedTimer = weaponMode.trapDuration || 150;
          // 泡泡不造成伤害
          en.hitFlash = 12;
          playSound('bubble', 0.3);
        }
        // ── 属性衰减回显 ──
        else if (mult < 1) {
          // 不匹配：极少伤害 + 明显衰减回显
          damage = Math.max(1, Math.floor(baseDmg * 0.2));
          en.hp -= damage;
          en.weaknessFlash = 30;  // 闪白30帧
          en.weaknessText = '效果微弱!';
          en.hitFlash = 8;
          playSound('weakHit', 0.3);
        }
        // ── 属性克制 ──
        else if (mult > 1) {
          damage = Math.ceil(baseDmg * 2.5);
          en.hp -= damage;
          en.hitFlash = 15;
          playSound('critHit', 0.5);
        }
        // ── 普通命中 ──
        else {
          en.hp -= damage;
          en.hitFlash = 10;
          playSound('enemyHit', 0.4);
        }

        // Armor special
        if (en.behavior === 'armor' && !en.isShell && en.hp <= 0) {
          en.isShell = true;
          en.hp = 1;
          en.shellVx = b.vx > 0 ? 4 : -4;
        }

        // Death check
        if (en.hp <= 0 && !(en.behavior === 'armor' && en.isShell)) {
          en.alive = false;
          if (en.gfx) en.gfx.visible = false;
          const bonusScore = mult > 1 ? en.score * 2 : en.score;
          gs.score += bonusScore;
          if (setScore) setScore(s => s + bonusScore);
          spawnDeathParticles(projectiles, worldLayer, en.x, en.y, en.color, mult > 1);
          playSound('enemyDie', 0.4);
        }

        worldLayer.removeChild(b.gfx);
        projectiles.splice(i, 1);
        break;
      }
    }
  }
}

/**
 * Spawn particle effects when enemy dies
 */
export function spawnDeathParticles(projectiles, worldLayer, x, y, color, isSuper) {
  const count = isSuper ? 10 : 6;
  for (let p = 0; p < count; p++) {
    const particle = {
      gfx: new PIXI.Graphics(),
      x, y,
      vx: (Math.random() - 0.5) * (isSuper ? 6 : 4),
      vy: -Math.random() * (isSuper ? 7 : 5),
      life: isSuper ? 40 : 30,
      isParticle: true,
    };
    const c = isSuper ? 0xFFD54F : color;
    particle.gfx.beginFill(c);
    particle.gfx.drawCircle(0, 0, isSuper ? 4 : 3);
    particle.gfx.endFill();
    particle.gfx.x = x;
    particle.gfx.y = y;
    worldLayer.addChild(particle.gfx);
    projectiles.push(particle);
  }
}

/**
 * Check player-enemy collisions (stomp or get hurt)
 */
export function checkEnemyCollisions(enemies, gs, delta, setHp, setScore, setGameOver) {
  const { PLAYER_H, JUMP_FORCE } = PHYSICS;
  if (gs.invincible > 0 || gs.hurtTimer > 0) return;

  for (const en of enemies) {
    if (!en.alive) continue;
    // Ghost collision: only valid when visible (alpha > 0.4)
    if (en.behavior === 'phase') {
      const ghostAlpha = 0.5 + Math.sin(gs.frame * 0.03) * 0.3;
      if (ghostAlpha < 0.35) continue; // phased out, not collidable
    }

    const dx = gs.px - en.x;
    const dy = (gs.py - PLAYER_H / 2) - en.y;
    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) {
      // Stomp from above
      if (gs.vy > 0 && dy < -5) {
        if (en.behavior === 'armor' && !en.isShell) {
          // Turtle: first stomp = shell mode
          en.isShell = true;
          en.speed = 0;
          gs.vy = JUMP_FORCE * 0.6;
        } else {
          en.alive = false;
          if (en.gfx) en.gfx.visible = false;
          gs.vy = JUMP_FORCE * 0.6;
          gs.score += en.score;
          if (setScore) setScore(s => s + en.score);
          playSound('enemyHit', 0.4);
        }
      } else {
        // Player takes damage
        gs.hp--;
        gs.hurtTimer = 60;
        gs.invincible = 90;
        if (setHp) setHp(h => Math.max(h - 1, 0));
        playSound('hurt', 0.5);
        gs.vx = dx > 0 ? 4 : -4;
        gs.vy = -4;
        if (gs.hp <= 0) { gs.dead = true; if (setGameOver) setGameOver(true); }
      }
      break; // Only 1 collision per frame
    }
  }
}

/**
 * Process item collection
 */
export function collectItems(itemSprites, levelItems, gs, setCoins, setScore, setHp) {
  const { PLAYER_H, JUMP_FORCE } = PHYSICS;
  itemSprites.forEach((item, i) => {
    if (item._collected) return;
    const dx = gs.px - item.x;
    const dy = (gs.py - PLAYER_H / 2) - item.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      const def = levelItems[i];
      item._collected = true;
      item.visible = false;
      switch (def.type) {
        case 'coin':
          gs.coins++; gs.score += 10;
          if (setCoins) setCoins(c => c + 1);
          if (setScore) setScore(s => s + 10);
          playSound('coin', 0.3);
          break;
        case 'star':
          gs.stars = (gs.stars || 0) + 1;
          gs.score += 50; gs.invincible = 180;
          if (setScore) setScore(s => s + 50);
          playSound('star', 0.5);
          break;
        case 'gem':
          gs.score += 100;
          if (setScore) setScore(s => s + 100);
          playSound('gem', 0.5);
          break;
        case 'heart':
          if (gs.hp < 5) { gs.hp++; if (setHp) setHp(h => Math.min(h + 1, 5)); }
          playSound('heart', 0.4);
          break;
        case 'key':
          gs.hasKey = true;
          gs.score += 20;
          if (setScore) setScore(s => s + 20);
          playSound('key', 0.5);
          break;
        case 'spring':
          gs.vy = JUMP_FORCE * 1.6;
          gs.onGround = false;
          item._collected = false;
          item.visible = true;
          playSound('spring', 0.4);
          break;
        case 'weapon_fire':
          if (unlockWeapon(gs, 'fire')) {
            // 首次解锁，给初始弹药
          }
          if (!gs.ammo) gs.ammo = {};
          gs.ammo.fire = (gs.ammo.fire || 0) + 20;
          playSound('star', 0.6);
          break;
        case 'weapon_water':
          if (unlockWeapon(gs, 'water')) {
            // 首次解锁
          }
          if (!gs.ammo) gs.ammo = {};
          gs.ammo.water = (gs.ammo.water || 0) + 20;
          playSound('star', 0.6);
          break;
      }
    }
  });
}

/* ══════════════════════════════════════
   渲染辅助：血条 + 特效
   ══════════════════════════════════════ */

/**
 * Render enemy HP bar above enemy sprite
 * @param {CanvasRenderingContext2D|PIXI.Graphics} ctx - render context  
 * @param {object} en - enemy data
 * @param {number} camX - camera X offset
 * @param {number} camY - camera Y offset
 */
export function renderEnemyHpBar(gfx, en) {
  if (!en.alive || en.maxHp <= 1) return;
  
  const barW = Math.min(40, en.maxHp * 8);
  const barH = 4;
  const barX = -barW / 2;
  const barY = -20;
  const ratio = Math.max(0, en.hp / en.maxHp);

  // Background
  gfx.beginFill(0x333333, 0.7);
  gfx.drawRoundedRect(barX - 1, barY - 1, barW + 2, barH + 2, 2);
  gfx.endFill();

  // HP fill (green→yellow→red)
  let color;
  if (ratio > 0.6) color = 0x58CC02;
  else if (ratio > 0.3) color = 0xFFC800;
  else color = 0xFF4B4B;

  gfx.beginFill(color, 0.9);
  gfx.drawRoundedRect(barX, barY, barW * ratio, barH, 2);
  gfx.endFill();
}

/**
 * Render enemy visual effects: bubble trap, weakness flash, hit flash
 */
export function renderEnemyEffects(gfx, en, frame) {
  if (!en.alive) return;

  // ── Bubble trap visualization ──
  if (en.trapped) {
    const pulseR = 18 + Math.sin(frame * 0.15) * 3;
    gfx.beginFill(0x64B5F6, 0.2);
    gfx.drawCircle(0, 0, pulseR);
    gfx.endFill();
    gfx.lineStyle(2, 0x64B5F6, 0.6);
    gfx.drawCircle(0, 0, pulseR);
    gfx.lineStyle(0);
    // Small bubbles
    for (let i = 0; i < 3; i++) {
      const bx = Math.sin(frame * 0.1 + i * 2) * 10;
      const by = -8 + Math.cos(frame * 0.08 + i) * 6;
      gfx.beginFill(0x90CAF9, 0.5);
      gfx.drawCircle(bx, by, 3);
      gfx.endFill();
    }
  }

  // ── Weakness flash (attribute mismatch) ──
  if (en.weaknessFlash > 0) {
    // White flash overlay
    const flashAlpha = (Math.sin(frame * 0.5) * 0.5 + 0.5) * 0.4;
    gfx.beginFill(0xFFFFFF, flashAlpha);
    gfx.drawRoundedRect(-15, -15, 30, 30, 4);
    gfx.endFill();

    // "效果微弱!" text indicator
    // (Rendered as colored bar since PIXI.Graphics can't do text easily)
    gfx.beginFill(0xFFEB3B, 0.8);
    gfx.drawRoundedRect(-22, -32, 44, 12, 3);
    gfx.endFill();
    // Dark dot pattern to suggest "weak" 
    gfx.beginFill(0x795548, 0.7);
    gfx.drawCircle(-12, -26, 2);
    gfx.drawCircle(-4, -26, 2);
    gfx.drawCircle(4, -26, 2);
    gfx.drawCircle(12, -26, 2);
    gfx.endFill();
  }

  // ── Hit flash ──
  if (en.hitFlash > 0) {
    const alpha = en.hitFlash / 15 * 0.5;
    gfx.beginFill(0xFFFFFF, alpha);
    gfx.drawCircle(0, 0, 16);
    gfx.endFill();
  }
}

/**
 * Switch to next weapon mode (only cycle through unlocked weapons)
 */
export function cycleWeapon(gs) {
  const unlockedWeapons = WEAPON_ORDER.filter(w => {
    if (w === 'bubble') return true; // 泡泡始终可用
    return gs.unlockedWeapons?.includes(w);
  });
  const current = gs.currentWeapon || 'bubble';
  const idx = unlockedWeapons.indexOf(current);
  gs.currentWeapon = unlockedWeapons[(idx + 1) % unlockedWeapons.length];
  return gs.currentWeapon;
}

/**
 * Unlock a weapon by type
 */
export function unlockWeapon(gs, weaponKey) {
  if (!gs.unlockedWeapons) gs.unlockedWeapons = [];
  if (!gs.unlockedWeapons.includes(weaponKey)) {
    gs.unlockedWeapons.push(weaponKey);
    gs.currentWeapon = weaponKey; // 自动切换到新武器
    return true;
  }
  return false;
}
