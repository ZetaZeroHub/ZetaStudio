/* ========================================
   游戏梦想家 — 俯视角物理引擎
   八方向移动 + 网格碰撞 + 摄像机跟随
   ======================================== */

import { TILE_PROPS } from '../../../data/topDownLevels';

/* ── 常量 ── */
const MOVE_SPEED = 3;          // px/frame
const DIAG_FACTOR = 0.707;     // 1/√2
const CAMERA_LERP = 0.1;       // 平滑跟随系数
const PLAYER_SIZE = 24;        // 碰撞盒 (px)
const PUSH_COOLDOWN = 15;      // 推箱子冷却帧数

/* ── 初始化游戏状态 ── */
export function initTopDownState(levelData) {
  const spawn = levelData.entities.find(e => e.type === 'player_spawn');
  const ts = levelData.tileSize;

  return {
    // 玩家
    px: (spawn?.gx ?? 2) * ts + ts / 2,
    py: (spawn?.gy ?? 2) * ts + ts / 2,
    pDir: 'down',        // up/down/left/right
    pMoving: false,
    pSpeed: MOVE_SPEED,

    // 摄像机
    camX: 0,
    camY: 0,

    // 道具栏
    inventory: [],       // [{type, id, ...}]
    keys: [],            // ['gate1', ...]
    stars: 0,

    // 关卡引用
    level: levelData,
    tileSize: ts,
    gridW: levelData.gridW,
    gridH: levelData.gridH,

    // 推箱子
    pushCooldown: 0,

    // 迷雾 (explored tiles)
    explored: levelData.rules?.hasFog
      ? Array.from({ length: levelData.gridH }, () => Array(levelData.gridW).fill(false))
      : null,

    // 传送门冷却
    portalCooldown: 0,

    // 游戏状态
    completed: false,
    dialogText: null,
    dialogSpeaker: null,
  };
}

/* ── 输入处理 ── */
export function processTopDownInput(gs, keys) {
  let dx = 0, dy = 0;

  if (keys.up || keys.w) dy = -1;
  if (keys.down || keys.s) dy = 1;
  if (keys.left || keys.a) dx = -1;
  if (keys.right || keys.d) dx = 1;

  // 对角线归一化
  if (dx !== 0 && dy !== 0) {
    dx *= DIAG_FACTOR;
    dy *= DIAG_FACTOR;
  }

  gs.pMoving = dx !== 0 || dy !== 0;

  // 方向
  if (dy < 0) gs.pDir = 'up';
  else if (dy > 0) gs.pDir = 'down';
  if (dx < 0) gs.pDir = 'left';
  else if (dx > 0) gs.pDir = 'right';

  return { dx: dx * gs.pSpeed, dy: dy * gs.pSpeed };
}

/* ── Tile 碰撞检测 ── */
function isTileWalkable(gs, gx, gy) {
  if (gx < 0 || gy < 0 || gx >= gs.gridW || gy >= gs.gridH) return false;
  const terrainTile = gs.level.layers.terrain[gy]?.[gx];
  if (terrainTile !== undefined && terrainTile >= 0) {
    const props = TILE_PROPS[terrainTile];
    if (props && !props.walkable) return false;
  }
  // Check pushBlocks positions
  const pushBlocks = gs.level.entities.filter(e => e.type === 'pushBlock');
  for (const pb of pushBlocks) {
    if (pb.gx === gx && pb.gy === gy) return false;
  }
  return true;
}

/* ── 门检测 ── */
function checkDoors(gs, gx, gy) {
  const doors = gs.level.entities.filter(e => e.type === 'door');
  for (const door of doors) {
    if (door.gx === gx && door.gy === gy) {
      if (gs.keys.includes(door.keyId)) {
        // 开门: 移除 terrain 障碍
        door.opened = true;
        gs.level.layers.terrain[door.gy][door.gx] = -1;
        gs.keys = gs.keys.filter(k => k !== door.keyId);
        return true;
      }
      return false; // blocked
    }
  }
  return true; // no door here
}

/* ── 推箱子 ── */
function tryPushBlock(gs, gx, gy, dirX, dirY) {
  if (gs.pushCooldown > 0) return false;
  const pushBlocks = gs.level.entities.filter(e => e.type === 'pushBlock');
  for (const pb of pushBlocks) {
    if (pb.gx === gx && pb.gy === gy) {
      const newGx = pb.gx + dirX;
      const newGy = pb.gy + dirY;
      // Check if target is walkable or water
      if (newGx < 0 || newGy < 0 || newGx >= gs.gridW || newGy >= gs.gridH) return false;
      const targetTerrain = gs.level.layers.terrain[newGy]?.[newGx];
      // Can push into water (fills it)
      if (targetTerrain >= 0 && TILE_PROPS[targetTerrain]?.type === 'water') {
        pb.gx = newGx;
        pb.gy = newGy;
        // Fill water: make it walkable
        gs.level.layers.terrain[newGy][newGx] = 45; // bridge tile
        pb.inWater = true;
        gs.pushCooldown = PUSH_COOLDOWN;
        return true;
      }
      // Check if target is empty
      if (isTileWalkable(gs, newGx, newGy)) {
        pb.gx = newGx;
        pb.gy = newGy;
        gs.pushCooldown = PUSH_COOLDOWN;
        return true;
      }
      return false;
    }
  }
  return false;
}

/* ── 主物理更新 ── */
export function updateTopDownPhysics(gs, keys, viewW, viewH) {
  // 冷却减少
  if (gs.pushCooldown > 0) gs.pushCooldown--;
  if (gs.portalCooldown > 0) gs.portalCooldown--;

  // 输入
  const { dx, dy } = processTopDownInput(gs, keys);

  const ts = gs.tileSize;
  const half = PLAYER_SIZE / 2;

  // X轴移动
  if (dx !== 0) {
    const newX = gs.px + dx;
    const gxL = Math.floor((newX - half) / ts);
    const gxR = Math.floor((newX + half - 1) / ts);
    const gyT = Math.floor((gs.py - half) / ts);
    const gyB = Math.floor((gs.py + half - 1) / ts);

    let canMove = true;
    for (let gy = gyT; gy <= gyB; gy++) {
      for (let gx = gxL; gx <= gxR; gx++) {
        if (!isTileWalkable(gs, gx, gy)) {
          // 尝试推箱子
          const dirX = dx > 0 ? 1 : -1;
          tryPushBlock(gs, gx, gy, dirX, 0);
          if (!checkDoors(gs, gx, gy)) canMove = false;
          else if (!isTileWalkable(gs, gx, gy)) canMove = false;
        }
      }
    }
    if (canMove) gs.px = newX;
  }

  // Y轴移动
  if (dy !== 0) {
    const newY = gs.py + dy;
    const gxL = Math.floor((gs.px - half) / ts);
    const gxR = Math.floor((gs.px + half - 1) / ts);
    const gyT = Math.floor((newY - half) / ts);
    const gyB = Math.floor((newY + half - 1) / ts);

    let canMove = true;
    for (let gy = gyT; gy <= gyB; gy++) {
      for (let gx = gxL; gx <= gxR; gx++) {
        if (!isTileWalkable(gs, gx, gy)) {
          const dirY = dy > 0 ? 1 : -1;
          tryPushBlock(gs, gx, gy, 0, dirY);
          if (!checkDoors(gs, gx, gy)) canMove = false;
          else if (!isTileWalkable(gs, gx, gy)) canMove = false;
        }
      }
    }
    if (canMove) gs.py = newY;
  }

  // 边界限制
  gs.px = Math.max(half, Math.min(gs.gridW * ts - half, gs.px));
  gs.py = Math.max(half, Math.min(gs.gridH * ts - half, gs.py));

  // 当前格
  const pgx = Math.floor(gs.px / ts);
  const pgy = Math.floor(gs.py / ts);

  // ── 收集道具 ──
  gs.level.entities.forEach(e => {
    if (e.collected || e.opened) return;
    if (e.gx === pgx && e.gy === pgy) {
      if (e.type === 'star') { gs.stars++; e.collected = true; }
      if (e.type === 'key') { gs.keys.push(e.keyId); gs.inventory.push({ type: 'key', id: e.keyId }); e.collected = true; }
    }
  });

  // ── 传送门 ──
  if (gs.portalCooldown <= 0) {
    const portal = gs.level.entities.find(e => e.type === 'portal' && e.gx === pgx && e.gy === pgy);
    if (portal) {
      gs.px = portal.targetGx * ts + ts / 2;
      gs.py = portal.targetGy * ts + ts / 2;
      gs.portalCooldown = 30;
    }
  }

  // ── NPC 交互 — 靠近自动显示对话，常驻到离开范围 ──
  const nearNpc = gs.level.entities.find(e =>
    e.type === 'npc' && Math.abs(e.gx - pgx) <= 2 && Math.abs(e.gy - pgy) <= 2
  );
  if (nearNpc) {
    gs.dialogText = nearNpc.dialog;
    gs.dialogSpeaker = nearNpc.name;
  } else {
    gs.dialogText = null;
    gs.dialogSpeaker = null;
  }

  // ── 迷雾探索 ──
  if (gs.explored) {
    const fogRadius = 3;
    for (let fy = -fogRadius; fy <= fogRadius; fy++) {
      for (let fx = -fogRadius; fx <= fogRadius; fx++) {
        const ey = pgy + fy, ex = pgx + fx;
        if (ey >= 0 && ey < gs.gridH && ex >= 0 && ex < gs.gridW) {
          gs.explored[ey][ex] = true;
        }
      }
    }
  }

  // ── 出口检测 ──
  const exit = gs.level.entities.find(e => e.type === 'exit');
  if (exit && exit.gx === pgx && exit.gy === pgy) {
    if (gs.stars >= (gs.level.rules?.requiredStars ?? 0)) {
      gs.completed = true;
    }
  }

  // ── 摄像机跟随 ──
  const targetCamX = gs.px - viewW / 2;
  const targetCamY = gs.py - viewH / 2;
  gs.camX += (targetCamX - gs.camX) * CAMERA_LERP;
  gs.camY += (targetCamY - gs.camY) * CAMERA_LERP;

  // 限制摄像机
  const maxCamX = gs.gridW * ts - viewW;
  const maxCamY = gs.gridH * ts - viewH;
  gs.camX = Math.max(0, Math.min(maxCamX, gs.camX));
  gs.camY = Math.max(0, Math.min(maxCamY, gs.camY));
}
