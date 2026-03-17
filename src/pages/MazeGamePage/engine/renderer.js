/* ========================================
   游戏梦想家 — 矢量渲染器
   所有 PixiJS Graphics 绘制函数
   ======================================== */

import { ELEMENTS } from '../../../data/elements';

/**
 * Draw the hero character — Q版萌系角色
 * @param {string} state - 'idle' | 'walk' | 'jump'
 * @param {number} vy - vertical velocity (for jump pose)
 */
export function drawKnight(gfx, x, y, facing, frame, isHurt, isAttacking, state, vy) {
  gfx.clear();
  const dir = facing === 'right' ? 1 : -1;
  state = state || 'idle';
  vy = vy || 0;

  // Hurt blink
  const alpha = isHurt && Math.floor(frame) % 6 < 3 ? 0.4 : 1;
  gfx.alpha = alpha;

  // ── State-specific animations ──
  let bodyY = 0;       // vertical offset for body
  let headTilt = 0;    // head rotation feel (simulated)
  let armAngleL = 0;   // left arm angle
  let armAngleR = 0;   // right arm angle
  let legOffsetL = 0;  // left leg X offset
  let legOffsetR = 0;  // right leg X offset
  let legSquash = 1;   // leg Y scale
  let eyeScale = 1;    // for blink
  let scarfWave = 0;   // scarf trailing

  if (state === 'walk') {
    // Bouncy walk cycle
    const walkT = frame * 0.22;
    bodyY = Math.abs(Math.sin(walkT)) * -3;
    legOffsetL = Math.sin(walkT) * 5;
    legOffsetR = Math.sin(walkT + Math.PI) * 5;
    armAngleL = Math.sin(walkT + Math.PI) * 12;
    armAngleR = Math.sin(walkT) * 12;
    scarfWave = Math.sin(walkT * 1.5) * 4;
  } else if (state === 'jump') {
    if (vy < -1) {
      // Rising — tuck legs, arms up
      bodyY = -2;
      legSquash = 0.6;
      armAngleL = -20;
      armAngleR = -20;
      scarfWave = 8; // scarf streams behind
    } else if (vy > 1) {
      // Falling — spread limbs
      bodyY = 1;
      legSquash = 1.2;
      armAngleL = 25;
      armAngleR = 25;
      scarfWave = -6;
    } else {
      // Peak of jump — float
      bodyY = -3;
      legSquash = 0.9;
      scarfWave = 3;
    }
  } else {
    // Idle — gentle breathing + shoulder shrug
    const breathe = Math.sin(frame * 0.06);
    bodyY = breathe * 1.5;
    armAngleL = breathe * 3;
    armAngleR = breathe * -3;
    scarfWave = Math.sin(frame * 0.04) * 2;
    // Blink every ~3 seconds
    const blinkCycle = frame % 180;
    if (blinkCycle > 170 && blinkCycle < 176) eyeScale = 0.15;
  }

  const by = bodyY;

  // ── Shadow ──
  const shadowScale = state === 'jump' ? 0.6 : 1;
  gfx.beginFill(0x000000, 0.12 * shadowScale);
  gfx.drawEllipse(0, 20, 11 * shadowScale, 3 * shadowScale);
  gfx.endFill();

  // ── Legs (short stubby) ──
  const legY = 12 + by;
  gfx.beginFill(0x5B8CFF);
  gfx.drawRoundedRect(-9 + legOffsetL, legY, 7, 9 * legSquash, 3);
  gfx.drawRoundedRect(2 + legOffsetR, legY, 7, 9 * legSquash, 3);
  gfx.endFill();
  // Tiny shoes
  gfx.beginFill(0xFF7043);
  gfx.drawRoundedRect(-10 + legOffsetL, legY + 6 * legSquash, 9, 4, 2);
  gfx.drawRoundedRect(1 + legOffsetR, legY + 6 * legSquash, 9, 4, 2);
  gfx.endFill();

  // ── Body (round, puffy) ──
  gfx.beginFill(0x64B5F6);
  gfx.drawRoundedRect(-12, -4 + by, 24, 18, 8);
  gfx.endFill();
  // Belly highlight
  gfx.beginFill(0x90CAF9, 0.6);
  gfx.drawEllipse(0, 4 + by, 8, 6);
  gfx.endFill();
  // Collar
  gfx.beginFill(0xFFFFFF, 0.7);
  gfx.drawEllipse(0, -3 + by, 10, 3);
  gfx.endFill();

  // ── Arms (tiny round) ──
  const armY = 2 + by;
  // Left arm
  gfx.beginFill(0x64B5F6);
  gfx.drawEllipse(-14 + armAngleL * dir * 0.15, armY + armAngleL * 0.1, 5, 4);
  gfx.endFill();
  // Right arm
  gfx.beginFill(0x64B5F6);
  gfx.drawEllipse(14 + armAngleR * dir * 0.15, armY + armAngleR * 0.1, 5, 4);
  gfx.endFill();

  // ── Attack wand ──
  if (isAttacking) {
    const wx = 16 * dir;
    // Magic wand
    gfx.beginFill(0xFFD740);
    gfx.drawRoundedRect(wx, -6 + by, 16 * dir, 3, 2);
    gfx.endFill();
    // Star tip
    gfx.beginFill(0xFFEB3B);
    gfx.drawCircle(wx + 16 * dir, -5 + by, 4);
    gfx.endFill();
    gfx.beginFill(0xFFFFFF, 0.7);
    gfx.drawCircle(wx + 16 * dir, -5 + by, 2);
    gfx.endFill();
  }

  // ── Head (big, round, kawaii) ──
  // Head circle (big relative to body for cuteness)
  gfx.beginFill(0xFFE0B2);
  gfx.drawCircle(0, -16 + by, 13);
  gfx.endFill();
  // Cheek blush
  gfx.beginFill(0xFFAB91, 0.45);
  gfx.drawEllipse(-9 * dir, -12 + by, 4, 2.5);
  gfx.drawEllipse(9 * dir, -12 + by, 4, 2.5);
  gfx.endFill();

  // ── Eyes (big, sparkly) ──
  const eDir = dir;
  const exL = -4 * eDir + 1 * eDir;
  const exR = 4 * eDir + 1 * eDir;
  const ey = -18 + by;
  // Eye whites
  gfx.beginFill(0xFFFFFF);
  gfx.drawEllipse(exL, ey, 4.5, 5 * eyeScale);
  gfx.drawEllipse(exR, ey, 4.5, 5 * eyeScale);
  gfx.endFill();
  if (eyeScale > 0.5) {
    // Pupils
    gfx.beginFill(0x37474F);
    gfx.drawCircle(exL + 1 * eDir, ey + 0.5, 2.5);
    gfx.drawCircle(exR + 1 * eDir, ey + 0.5, 2.5);
    gfx.endFill();
    // Eye sparkle (top-left highlight)
    gfx.beginFill(0xFFFFFF, 0.9);
    gfx.drawCircle(exL - 0.5, ey - 1.5, 1.2);
    gfx.drawCircle(exR - 0.5, ey - 1.5, 1.2);
    gfx.endFill();
  }

  // ── Mouth ──
  if (state === 'jump' && vy < -2) {
    // Excited open mouth when jumping up
    gfx.beginFill(0xF48FB1);
    gfx.drawEllipse(1 * eDir, -12 + by, 3, 2.5);
    gfx.endFill();
  } else {
    // Happy smile
    gfx.lineStyle(1.5, 0xBF8A60);
    gfx.arc(1 * eDir, -13 + by, 3, 0.2, Math.PI - 0.2);
    gfx.lineStyle(0);
  }

  // ── Hat (fluffy beret style) ──
  gfx.beginFill(0xEF5350);
  gfx.drawEllipse(0 + scarfWave * 0.3, -27 + by, 14, 6);
  gfx.endFill();
  gfx.beginFill(0xE53935);
  gfx.drawEllipse(0, -25 + by, 12, 4);
  gfx.endFill();
  // Pompom on top
  gfx.beginFill(0xFFFFFF);
  gfx.drawCircle(3 * dir + scarfWave * 0.5, -32 + by, 4);
  gfx.endFill();
  gfx.beginFill(0xFFFFFF, 0.5);
  gfx.drawCircle(3 * dir + scarfWave * 0.5 - 1, -33 + by, 2);
  gfx.endFill();

  // ── Scarf (trailing behind) ──
  const scarfX = -6 * dir + scarfWave * -dir * 0.3;
  gfx.beginFill(0xEF5350, 0.8);
  gfx.drawRoundedRect(scarfX - 4, -6 + by, 8, 10 + Math.abs(scarfWave), 3);
  gfx.endFill();
}

// ─────── 敌人绘制 ───────

export function drawSlime(gfx, frame, color) {
  gfx.clear();
  const squash = 1 + Math.sin(frame * 0.08) * 0.1;
  const squashY = 1 - Math.sin(frame * 0.08) * 0.08;

  gfx.beginFill(0x000000, 0.12);
  gfx.drawEllipse(0, 14, 14 * squash, 4);
  gfx.endFill();
  gfx.beginFill(color);
  gfx.drawEllipse(0, 0, 14 * squash, 14 * squashY);
  gfx.endFill();
  gfx.beginFill(0xFFFFFF, 0.25);
  gfx.drawEllipse(-4, -5, 5, 4);
  gfx.endFill();
  gfx.beginFill(0xFFFFFF);
  gfx.drawCircle(-4, -2, 4);
  gfx.drawCircle(5, -2, 4);
  gfx.endFill();
  gfx.beginFill(0x333333);
  gfx.drawCircle(-3, -1, 2);
  gfx.drawCircle(6, -1, 2);
  gfx.endFill();
}

export function drawBat(gfx, frame, color) {
  gfx.clear();
  const wingAng = Math.sin(frame * 0.2) * 0.4;
  gfx.beginFill(color);
  gfx.drawEllipse(0, 0, 8, 10);
  gfx.endFill();
  gfx.beginFill(color, 0.8);
  gfx.moveTo(-8, -2);
  gfx.lineTo(-24, -8 + wingAng * 20);
  gfx.lineTo(-18, 4);
  gfx.closePath();
  gfx.endFill();
  gfx.moveTo(8, -2);
  gfx.lineTo(24, -8 + wingAng * 20);
  gfx.lineTo(18, 4);
  gfx.closePath();
  gfx.endFill();
  gfx.beginFill(0xFF1744);
  gfx.drawCircle(-3, -3, 2.5);
  gfx.drawCircle(3, -3, 2.5);
  gfx.endFill();
  gfx.beginFill(0xFFFFFF);
  gfx.drawCircle(-2, -3.5, 1);
  gfx.drawCircle(4, -3.5, 1);
  gfx.endFill();
}

export function drawWorm(gfx, frame, color) {
  gfx.clear();
  const wave = Math.sin(frame * 0.12) * 3;
  // Shadow
  gfx.beginFill(0x000000, 0.1);
  gfx.drawEllipse(0, 8, 16, 3);
  gfx.endFill();
  // Body segments (wave motion)
  for (let i = 0; i < 4; i++) {
    const sx = (i - 1.5) * 7;
    const sy = Math.sin(frame * 0.12 + i * 0.8) * 2;
    const r = i === 0 || i === 3 ? 4 : 5;
    gfx.beginFill(color, i === 0 ? 1 : 0.8 - i * 0.1);
    gfx.drawCircle(sx + wave * (i - 1.5) * 0.2, sy, r);
    gfx.endFill();
  }
  // Eyes (on head, first segment)
  gfx.beginFill(0xFFFFFF);
  gfx.drawCircle(-12, -3, 3);
  gfx.endFill();
  gfx.beginFill(0x333333);
  gfx.drawCircle(-12, -3, 1.5);
  gfx.endFill();
  // Antennae
  gfx.lineStyle(1.5, color);
  gfx.moveTo(-13, -6);
  gfx.lineTo(-16, -12 + wave);
  gfx.moveTo(-10, -6);
  gfx.lineTo(-8, -13 + wave * 0.5);
  gfx.lineStyle(0);
}

export function drawFrog(gfx, frame, color, jumpPhase) {
  gfx.clear();
  const isJumping = jumpPhase > 0;
  const squash = isJumping ? 0.8 : 1 + Math.sin(frame * 0.06) * 0.05;
  const stretch = isJumping ? 1.3 : 1;
  // Shadow
  if (!isJumping) {
    gfx.beginFill(0x000000, 0.1);
    gfx.drawEllipse(0, 12, 12, 3);
    gfx.endFill();
  }
  // Body
  gfx.beginFill(color);
  gfx.drawEllipse(0, 0, 12 * squash, 10 * stretch);
  gfx.endFill();
  // Belly
  gfx.beginFill(0xE8F5E9, 0.6);
  gfx.drawEllipse(0, 3, 8, 6);
  gfx.endFill();
  // Eyes (big and bulging)
  gfx.beginFill(0xFFFFFF);
  gfx.drawCircle(-5, -8, 5);
  gfx.drawCircle(5, -8, 5);
  gfx.endFill();
  gfx.beginFill(0x333333);
  gfx.drawCircle(-5, -7, 2.5);
  gfx.drawCircle(5, -7, 2.5);
  gfx.endFill();
  // Mouth
  gfx.lineStyle(1.5, 0x2E7D32);
  gfx.arc(0, 0, 6, 0.2, Math.PI - 0.2);
  gfx.lineStyle(0);
  // Legs
  if (!isJumping) {
    gfx.beginFill(color, 0.8);
    gfx.drawEllipse(-10, 8, 5, 3);
    gfx.drawEllipse(10, 8, 5, 3);
    gfx.endFill();
  }
}

export function drawTurtle(gfx, frame, color, isShell) {
  gfx.clear();
  if (isShell) {
    // Shell mode — spinning
    const spin = frame * 0.3;
    gfx.beginFill(color);
    gfx.drawEllipse(0, 0, 13, 10);
    gfx.endFill();
    // Shell pattern
    gfx.lineStyle(2, 0xBF360C, 0.5);
    gfx.drawEllipse(0, 0, 8, 6);
    gfx.moveTo(-6, -4); gfx.lineTo(6, 4);
    gfx.moveTo(6, -4); gfx.lineTo(-6, 4);
    gfx.lineStyle(0);
    // Sparkle
    gfx.beginFill(0xFFD54F, 0.6);
    gfx.drawCircle(Math.cos(spin) * 8, Math.sin(spin) * 6, 2);
    gfx.endFill();
    return;
  }
  // Shadow
  gfx.beginFill(0x000000, 0.1);
  gfx.drawEllipse(0, 12, 14, 4);
  gfx.endFill();
  // Shell
  gfx.beginFill(color);
  gfx.drawEllipse(0, -2, 14, 12);
  gfx.endFill();
  // Shell pattern
  gfx.lineStyle(1.5, 0xBF360C, 0.3);
  gfx.drawEllipse(0, -2, 9, 8);
  gfx.lineStyle(0);
  // Head
  gfx.beginFill(0x4CAF50);
  gfx.drawCircle(-10, 2, 6);
  gfx.endFill();
  // Eyes
  gfx.beginFill(0xFFFFFF);
  gfx.drawCircle(-12, 0, 3);
  gfx.endFill();
  gfx.beginFill(0x333333);
  gfx.drawCircle(-12, 0, 1.5);
  gfx.endFill();
  // Feet
  gfx.beginFill(0x4CAF50, 0.8);
  gfx.drawEllipse(-8, 10, 4, 3);
  gfx.drawEllipse(8, 10, 4, 3);
  gfx.endFill();
}

export function drawGhost(gfx, frame, color) {
  gfx.clear();
  const float = Math.sin(frame * 0.05) * 4;
  const fade = 0.5 + Math.sin(frame * 0.03) * 0.3; // phase in/out
  gfx.alpha = fade;
  // Glow
  gfx.beginFill(0xFFFFFF, 0.08);
  gfx.drawCircle(0, float, 20);
  gfx.endFill();
  // Body
  gfx.beginFill(color, 0.7);
  gfx.moveTo(-12, -8 + float);
  gfx.quadraticCurveTo(-14, -20 + float, 0, -22 + float);
  gfx.quadraticCurveTo(14, -20 + float, 12, -8 + float);
  // Wavy bottom
  gfx.lineTo(12, 8 + float);
  gfx.quadraticCurveTo(8, 4 + float, 6, 10 + float);
  gfx.quadraticCurveTo(3, 4 + float, 0, 10 + float);
  gfx.quadraticCurveTo(-3, 4 + float, -6, 10 + float);
  gfx.quadraticCurveTo(-8, 4 + float, -12, 8 + float);
  gfx.closePath();
  gfx.endFill();
  // Eyes
  gfx.beginFill(0xFFFFFF, 0.9);
  gfx.drawEllipse(-4, -10 + float, 4, 5);
  gfx.drawEllipse(5, -10 + float, 4, 5);
  gfx.endFill();
  gfx.beginFill(0x1A237E);
  gfx.drawCircle(-4, -9 + float, 2);
  gfx.drawCircle(5, -9 + float, 2);
  gfx.endFill();
}

/**
 * Draw any enemy by type
 */
export function drawEnemy(gfx, type, frame, color, extra) {
  switch (type) {
    case 'worm':   drawWorm(gfx, frame, color); break;
    case 'slime':  drawSlime(gfx, frame, color); break;
    case 'frog':   drawFrog(gfx, frame, color, extra?.jumpPhase || 0); break;
    case 'bat':    drawBat(gfx, frame, color); break;
    case 'turtle': drawTurtle(gfx, frame, color, extra?.isShell || false); break;
    case 'ghost':  drawGhost(gfx, frame, color); break;
    default:       drawSlime(gfx, frame, color);
  }
}

// ─────── 道具绘制 ───────

export function drawCoin(gfx, frame) {
  gfx.clear();
  const scale = Math.abs(Math.sin(frame * 0.06));
  gfx.beginFill(0xFFD700);
  gfx.drawEllipse(0, 0, 8 * Math.max(scale, 0.3), 8);
  gfx.endFill();
  gfx.beginFill(0xFFA000, 0.6);
  gfx.drawEllipse(0, 0, 5 * Math.max(scale, 0.3), 5);
  gfx.endFill();
}

export function drawStar(gfx, frame) {
  gfx.clear();
  const rot = frame * 0.02;
  const pulse = 1 + Math.sin(frame * 0.1) * 0.15;
  gfx.beginFill(0xFF6F00, 0.2);
  gfx.drawCircle(0, 0, 14 * pulse);
  gfx.endFill();
  gfx.beginFill(0xFFB300);
  _drawStarShape(gfx, 0, 0, 5, 10 * pulse, 5 * pulse, rot);
  gfx.endFill();
}

function _drawStarShape(gfx, cx, cy, points, outerR, innerR, rot) {
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / points + rot;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) gfx.moveTo(x, y); else gfx.lineTo(x, y);
  }
  gfx.closePath();
}

export function drawHeart(gfx, frame) {
  gfx.clear();
  const pulse = 1 + Math.sin(frame * 0.12) * 0.1;
  gfx.beginFill(0xFF1744);
  gfx.moveTo(0, 4 * pulse);
  gfx.bezierCurveTo(-8 * pulse, -4 * pulse, -10 * pulse, -10 * pulse, 0, -6 * pulse);
  gfx.bezierCurveTo(10 * pulse, -10 * pulse, 8 * pulse, -4 * pulse, 0, 4 * pulse);
  gfx.endFill();
}

export function drawKey(gfx, frame) {
  gfx.clear();
  const swing = Math.sin(frame * 0.08) * 8;
  const glow = 0.3 + Math.sin(frame * 0.1) * 0.15;
  // Glow
  gfx.beginFill(0xFFD740, glow);
  gfx.drawCircle(0, 0, 14);
  gfx.endFill();
  // Key ring
  gfx.lineStyle(3, 0xFFD740);
  gfx.drawCircle(0, -4, 5);
  gfx.lineStyle(0);
  // Key shaft
  gfx.beginFill(0xFFD740);
  gfx.drawRect(-1.5, 1, 3, 12);
  gfx.endFill();
  // Key teeth
  gfx.beginFill(0xFFC107);
  gfx.drawRect(1.5, 10, 4, 3);
  gfx.drawRect(1.5, 7, 3, 2);
  gfx.endFill();
}

export function drawSpring(gfx) {
  gfx.clear();
  gfx.beginFill(0x757575);
  gfx.drawRect(-10, 4, 20, 6);
  gfx.endFill();
  gfx.lineStyle(3, 0x76FF03);
  for (let i = 0; i < 4; i++) {
    const y = 2 - i * 4;
    gfx.moveTo(-8, y); gfx.lineTo(8, y - 2);
  }
  gfx.lineStyle(0);
  gfx.beginFill(0x9E9E9E);
  gfx.drawRect(-10, -14, 20, 4);
  gfx.endFill();
}

export function drawDoor(gfx) {
  gfx.clear();
  gfx.beginFill(0x8D6E63);
  gfx.drawRoundedRect(-20, -50, 40, 55, 4);
  gfx.endFill();
  gfx.beginFill(0x5D4037);
  gfx.drawRoundedRect(-16, -46, 32, 50, 3);
  gfx.endFill();
  gfx.beginFill(0x4E342E);
  gfx.drawEllipse(0, -46, 16, 10);
  gfx.endFill();
  gfx.beginFill(0xFFD740);
  gfx.drawCircle(10, -22, 3);
  gfx.endFill();
  gfx.beginFill(0xFFD740, 0.15);
  gfx.drawCircle(0, -24, 30);
  gfx.endFill();
}

// ─────── 环境机关绘制 ───────

export function drawWaterPit(gfx, frame, width) {
  gfx.clear();
  const wave = Math.sin(frame * 0.05) * 2;
  // Water body
  gfx.beginFill(0x29B6F6, 0.6);
  gfx.drawRect(0, 0, width, 30);
  gfx.endFill();
  // Waves — start at radius offset to avoid left overflow
  gfx.beginFill(0x4FC3F7, 0.4);
  for (let x = 6; x < width - 4; x += 12) {
    const wy = Math.sin(frame * 0.06 + x * 0.1) * 3;
    gfx.drawCircle(x, wy - 2, 6);
  }
  gfx.endFill();
  // Bubbles
  gfx.beginFill(0xE1F5FE, 0.5);
  gfx.drawCircle(width * 0.3, 10 + wave, 3);
  gfx.drawCircle(width * 0.7, 15 - wave, 2);
  gfx.endFill();
}

export function drawLockedDoor(gfx, frame, isLocked) {
  gfx.clear();
  if (!isLocked) return; // invisible when unlocked
  // Door block
  gfx.beginFill(0x795548);
  gfx.drawRoundedRect(-15, -40, 30, 45, 3);
  gfx.endFill();
  // Metal bars
  gfx.lineStyle(3, 0x9E9E9E);
  gfx.moveTo(-8, -38); gfx.lineTo(-8, 4);
  gfx.moveTo(0, -38);  gfx.lineTo(0, 4);
  gfx.moveTo(8, -38);  gfx.lineTo(8, 4);
  gfx.moveTo(-14, -20); gfx.lineTo(14, -20);
  gfx.lineStyle(0);
  // Lock
  const lockGlow = 0.5 + Math.sin(frame * 0.1) * 0.3;
  gfx.beginFill(0xFFD740, lockGlow);
  gfx.drawCircle(0, -10, 8);
  gfx.endFill();
  gfx.beginFill(0xFFC107);
  gfx.drawCircle(0, -10, 5);
  gfx.endFill();
  gfx.beginFill(0x333333);
  gfx.drawRect(-2, -12, 4, 5);
  gfx.endFill();
}

export function drawPortal(gfx, frame, color) {
  gfx.clear();
  const pulse = 1 + Math.sin(frame * 0.08) * 0.2;
  const rot = frame * 0.03;
  // Outer glow
  gfx.beginFill(color, 0.15);
  gfx.drawCircle(0, 0, 22 * pulse);
  gfx.endFill();
  // Swirl rings
  for (let i = 0; i < 3; i++) {
    const a = rot + (i * Math.PI * 2) / 3;
    const rx = Math.cos(a) * 12 * pulse;
    const ry = Math.sin(a) * 12 * pulse;
    gfx.beginFill(color, 0.5 - i * 0.1);
    gfx.drawCircle(rx, ry, 4);
    gfx.endFill();
  }
  // Center
  gfx.beginFill(color, 0.6);
  gfx.drawCircle(0, 0, 8 * pulse);
  gfx.endFill();
  gfx.beginFill(0xFFFFFF, 0.4);
  gfx.drawCircle(-2, -2, 3);
  gfx.endFill();
}

// ─────── 弹药绘制 ───────

export function drawBubble(gfx, elementId) {
  gfx.clear();
  const elem = ELEMENTS[elementId] || ELEMENTS.none;
  // Outer bubble
  gfx.beginFill(elem.bubbleColor, 0.6);
  gfx.drawCircle(0, 0, 7);
  gfx.endFill();
  // Inner core
  gfx.beginFill(elem.color, 0.8);
  gfx.drawCircle(0, 0, 4);
  gfx.endFill();
  // Highlight
  gfx.beginFill(0xFFFFFF, 0.6);
  gfx.drawCircle(-2, -2, 2);
  gfx.endFill();
}

/**
 * Draw item by type
 */
export function drawItem(gfx, type, frame) {
  switch (type) {
    case 'coin':   drawCoin(gfx, frame); break;
    case 'star':   drawStar(gfx, frame); break;
    case 'heart':  drawHeart(gfx, frame); break;
    case 'key':    drawKey(gfx, frame); break;
    case 'spring': drawSpring(gfx); break;
    case 'weapon_fire': drawWeaponPickup(gfx, 'fire', frame); break;
    case 'weapon_water': drawWeaponPickup(gfx, 'water', frame); break;
    case 'gem':    drawGem(gfx, frame); break;
    default:       drawCoin(gfx, frame);
  }
}

/* ── 武器弹药拾取渲染 ── */
function drawWeaponPickup(gfx, element, frame) {
  gfx.clear();
  const pulse = Math.sin(frame * 0.08) * 0.15 + 1;
  const bob = Math.sin(frame * 0.06) * 3;

  // Glow circle
  const color = element === 'fire' ? 0xFF6B35 : 0x4FC3F7;
  const glowAlpha = 0.2 + Math.sin(frame * 0.1) * 0.1;
  gfx.beginFill(color, glowAlpha);
  gfx.drawCircle(0, bob, 14 * pulse);
  gfx.endFill();

  // Base circle
  gfx.beginFill(color, 0.9);
  gfx.drawCircle(0, bob, 10);
  gfx.endFill();

  // Inner icon
  if (element === 'fire') {
    // Fire shape
    gfx.beginFill(0xFFD740);
    gfx.moveTo(0, bob - 7);
    gfx.lineTo(4, bob + 2);
    gfx.lineTo(1, bob);
    gfx.lineTo(3, bob + 6);
    gfx.lineTo(0, bob + 3);
    gfx.lineTo(-3, bob + 6);
    gfx.lineTo(-1, bob);
    gfx.lineTo(-4, bob + 2);
    gfx.closePath();
    gfx.endFill();
  } else {
    // Water drop
    gfx.beginFill(0xE3F2FD);
    gfx.moveTo(0, bob - 6);
    gfx.quadraticCurveTo(5, bob + 1, 0, bob + 6);
    gfx.quadraticCurveTo(-5, bob + 1, 0, bob - 6);
    gfx.endFill();
  }

  // "x20" label
  gfx.beginFill(0xFFFFFF, 0.9);
  gfx.drawRoundedRect(-10, bob + 10, 20, 8, 3);
  gfx.endFill();
  gfx.beginFill(color);
  gfx.drawCircle(-4, bob + 14, 1.5);
  gfx.drawCircle(0, bob + 14, 1.5);
  gfx.drawCircle(4, bob + 14, 1.5);
  gfx.endFill();
}

/* ── 宝石渲染 ── */
function drawGem(gfx, frame) {
  gfx.clear();
  const bob = Math.sin(frame * 0.07) * 3;
  gfx.beginFill(0x9C27B0);
  gfx.moveTo(0, bob - 8);
  gfx.lineTo(7, bob - 2);
  gfx.lineTo(4, bob + 8);
  gfx.lineTo(-4, bob + 8);
  gfx.lineTo(-7, bob - 2);
  gfx.closePath();
  gfx.endFill();
  gfx.beginFill(0xE1BEE7, 0.5);
  gfx.moveTo(0, bob - 6);
  gfx.lineTo(4, bob - 1);
  gfx.lineTo(0, bob + 2);
  gfx.lineTo(-3, bob - 1);
  gfx.closePath();
  gfx.endFill();
}

/* ══════════════════════════════════════
   互动实体渲染
   ══════════════════════════════════════ */

/**
 * Draw an interactable entity onto a PIXI.Graphics
 */
export function drawInteractable(gfx, obj, frame) {
  gfx.clear();
  const w = obj.w || 32;
  const h = obj.h || 32;

  switch (obj.type) {
    // ── 推箱子 ──
    case 'pushBox': {
      // Wooden crate
      gfx.beginFill(0xA67C4A);
      gfx.drawRect(0, 0, w, h);
      gfx.endFill();
      // Planks
      gfx.lineStyle(1, 0x8B6914, 0.6);
      gfx.moveTo(0, h / 3); gfx.lineTo(w, h / 3);
      gfx.moveTo(0, h * 2 / 3); gfx.lineTo(w, h * 2 / 3);
      gfx.moveTo(w / 2, 0); gfx.lineTo(w / 2, h);
      gfx.lineStyle(0);
      // Border
      gfx.lineStyle(2, 0x6D4C1D, 0.8);
      gfx.drawRect(1, 1, w - 2, h - 2);
      gfx.lineStyle(0);
      // Nails
      gfx.beginFill(0x333333);
      gfx.drawCircle(4, 4, 2);
      gfx.drawCircle(w - 4, 4, 2);
      gfx.drawCircle(4, h - 4, 2);
      gfx.drawCircle(w - 4, h - 4, 2);
      gfx.endFill();
      break;
    }

    // ── 可破坏砖块 ──
    case 'breakBlock': {
      if (!obj.alive) {
        // Break animation: particles scatter
        if (obj.breakAnim > 0) {
          const t = 20 - obj.breakAnim;
          for (let i = 0; i < 4; i++) {
            const bx = (i % 2 === 0 ? -1 : 1) * (4 + t * 2);
            const by = -t * 1.5 + (i < 2 ? -4 : 4);
            gfx.beginFill(0x8B4513, Math.max(0, 1 - t / 20));
            gfx.drawRect(w / 2 + bx - 4, h / 2 + by - 4, 8, 8);
            gfx.endFill();
          }
        }
        break;
      }
      // Brown brick
      gfx.beginFill(0x8B4513);
      gfx.drawRect(0, 0, w, h);
      gfx.endFill();
      // Brick pattern
      gfx.lineStyle(1, 0x6D3310, 0.5);
      gfx.moveTo(0, h / 2); gfx.lineTo(w, h / 2);
      gfx.moveTo(w / 3, 0); gfx.lineTo(w / 3, h / 2);
      gfx.moveTo(w * 2 / 3, h / 2); gfx.lineTo(w * 2 / 3, h);
      gfx.lineStyle(0);
      // Crack
      gfx.lineStyle(1, 0x4a2510, 0.4);
      gfx.moveTo(w / 2 - 3, h / 2 - 5);
      gfx.lineTo(w / 2, h / 2);
      gfx.lineTo(w / 2 + 4, h / 2 + 6);
      gfx.lineStyle(0);
      break;
    }

    // ── 问号砖块 ──
    case 'questionBlock': {
      const bounceY = obj.timer > 0 ? -Math.sin(obj.timer / 10 * Math.PI) * 4 : 0;
      const isActive = !obj.activated;

      // Block body
      gfx.beginFill(isActive ? 0xFFD740 : 0x8B8B8B);
      gfx.drawRoundedRect(0, bounceY, w, h, 3);
      gfx.endFill();
      // Border
      gfx.lineStyle(2, isActive ? 0xE6A800 : 0x666666, 0.8);
      gfx.drawRoundedRect(1, bounceY + 1, w - 2, h - 2, 3);
      gfx.lineStyle(0);

      if (isActive) {
        // "?" character (drawn as dots)
        const cx = w / 2;
        const cy = bounceY + h / 2;
        gfx.beginFill(0xFFF9C4);
        // ? top curve
        gfx.drawCircle(cx + 3, cy - 6, 3);
        gfx.drawCircle(cx + 4, cy - 2, 2.5);
        gfx.drawCircle(cx, cy + 1, 2.5);
        // ? dot
        gfx.drawCircle(cx, cy + 6, 2);
        gfx.endFill();
        // Shimmer
        const shimmer = Math.sin(frame * 0.1) * 0.3 + 0.3;
        gfx.beginFill(0xFFFFFF, shimmer);
        gfx.drawRect(3, bounceY + 3, 6, 3);
        gfx.endFill();
      } else {
        // Empty block — X pattern
        gfx.lineStyle(1, 0x555555, 0.5);
        gfx.moveTo(8, bounceY + 8); gfx.lineTo(w - 8, bounceY + h - 8);
        gfx.moveTo(w - 8, bounceY + 8); gfx.lineTo(8, bounceY + h - 8);
        gfx.lineStyle(0);
      }
      break;
    }

    // ── 传送门 ──
    case 'portal': {
      const portalH = obj.h || 48;
      const t = (obj.timer || 0);
      const color = obj.color || 0x7C4DFF;

      // Outer glow
      const glowR = 18 + Math.sin(t * 0.05) * 3;
      gfx.beginFill(color, 0.15);
      gfx.drawEllipse(w / 2, portalH / 2, glowR, portalH / 2 + 4);
      gfx.endFill();

      // Ring
      gfx.lineStyle(3, color, 0.8);
      gfx.drawEllipse(w / 2, portalH / 2, 14, portalH / 2 - 2);
      gfx.lineStyle(0);

      // Inner swirl
      gfx.beginFill(color, 0.4);
      gfx.drawEllipse(w / 2, portalH / 2, 10, portalH / 2 - 6);
      gfx.endFill();

      // Particles
      for (let i = 0; i < 3; i++) {
        const px = w / 2 + Math.sin(t * 0.08 + i * 2) * 8;
        const py = portalH / 2 + Math.cos(t * 0.06 + i * 2.5) * 12;
        gfx.beginFill(0xFFFFFF, 0.6);
        gfx.drawCircle(px, py, 2);
        gfx.endFill();
      }
      break;
    }

    // ── 开关 ──
    case 'switch': {
      const switchH = obj.h || 20;
      const isOn = obj.activated;

      // Base plate
      gfx.beginFill(0x555555);
      gfx.drawRoundedRect(0, 0, w, switchH, 4);
      gfx.endFill();

      // Button
      gfx.beginFill(isOn ? 0x4CAF50 : 0xF44336);
      gfx.drawCircle(w / 2, switchH / 2, 8);
      gfx.endFill();

      // Highlight
      gfx.beginFill(0xFFFFFF, 0.3);
      gfx.drawCircle(w / 2 - 2, switchH / 2 - 2, 3);
      gfx.endFill();

      if (isOn) {
        // Checkmark
        gfx.lineStyle(2, 0xFFFFFF, 0.8);
        gfx.moveTo(w / 2 - 4, switchH / 2);
        gfx.lineTo(w / 2 - 1, switchH / 2 + 3);
        gfx.lineTo(w / 2 + 4, switchH / 2 - 3);
        gfx.lineStyle(0);
      }
      break;
    }
  }
}
