/* ========================================
   游戏梦想家 — 俯视角 Tilemap 渲染器
   多图层渲染 + 视口裁剪 + 迷雾 + 实体
   ======================================== */

const TINY_TOWN_BASE = '/assets/kenney/kenney_tiny-town/Tiles';
const CHAR_BASE = '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Characters/Default';

/* ── 加载 Tile 纹理缓存 ── */
const tileCache = {};
function getTileImg(tileId) {
  if (tileId < 0) return null;
  if (tileCache[tileId]) return tileCache[tileId];
  const img = new Image();
  const num = String(tileId).padStart(4, '0');
  img.src = `${TINY_TOWN_BASE}/tile_${num}.png`;
  tileCache[tileId] = img;
  return img;
}

/* ── 角色纹理 ── */
const charCache = {};
function getCharImg(name) {
  if (charCache[name]) return charCache[name];
  const img = new Image();
  img.src = `${CHAR_BASE}/${name}.png`;
  charCache[name] = img;
  return img;
}

/* ── NPC 纹理 ── */
const NPC_TILES = [111, 112, 113, 114, 115, 116, 117, 118];
function getNpcTile(index) {
  return getTileImg(NPC_TILES[index % NPC_TILES.length]);
}

/* ── 预加载常用 ── */
export function preloadTiles(levelData) {
  const allTiles = new Set();
  ['ground', 'terrain', 'decoration'].forEach(layer => {
    const grid = levelData.layers[layer];
    if (!grid) return;
    grid.forEach(row => row.forEach(t => { if (t >= 0) allTiles.add(t); }));
  });
  allTiles.forEach(t => getTileImg(t));
  // Preload character sprites
  ['character_green_front', 'character_green_walk_a', 'character_green_walk_b',
   'character_pink_front', 'character_pink_walk_a', 'character_pink_walk_b'].forEach(getCharImg);
}

/* ── 主渲染函数 ── */
export function renderTopDown(ctx, gs, viewW, viewH, frame) {
  const ts = gs.tileSize;
  const camX = gs.camX;
  const camY = gs.camY;

  ctx.clearRect(0, 0, viewW, viewH);
  ctx.imageSmoothingEnabled = false;

  // 可见格子范围
  const startGx = Math.max(0, Math.floor(camX / ts) - 1);
  const startGy = Math.max(0, Math.floor(camY / ts) - 1);
  const endGx = Math.min(gs.gridW, Math.ceil((camX + viewW) / ts) + 1);
  const endGy = Math.min(gs.gridH, Math.ceil((camY + viewH) / ts) + 1);

  // ── Ground layer ──
  const groundGrid = gs.level.layers.ground;
  for (let gy = startGy; gy < endGy; gy++) {
    for (let gx = startGx; gx < endGx; gx++) {
      const tileId = groundGrid[gy]?.[gx];
      if (tileId === undefined || tileId < 0) continue;
      const img = getTileImg(tileId);
      if (img && img.complete) {
        const sx = gx * ts - camX;
        const sy = gy * ts - camY;
        ctx.drawImage(img, sx, sy, ts, ts);
      }
    }
  }

  // ── Terrain layer ──
  const terrainGrid = gs.level.layers.terrain;
  for (let gy = startGy; gy < endGy; gy++) {
    for (let gx = startGx; gx < endGx; gx++) {
      const tileId = terrainGrid[gy]?.[gx];
      if (tileId === undefined || tileId < 0) continue;
      const img = getTileImg(tileId);
      if (img && img.complete) {
        const sx = gx * ts - camX;
        const sy = gy * ts - camY;
        ctx.drawImage(img, sx, sy, ts, ts);
      }
    }
  }

  // ── Decoration layer ──
  const decoGrid = gs.level.layers.decoration;
  for (let gy = startGy; gy < endGy; gy++) {
    for (let gx = startGx; gx < endGx; gx++) {
      const tileId = decoGrid[gy]?.[gx];
      if (tileId === undefined || tileId < 0) continue;
      const img = getTileImg(tileId);
      if (img && img.complete) {
        const sx = gx * ts - camX;
        const sy = gy * ts - camY;
        ctx.drawImage(img, sx, sy, ts, ts);
      }
    }
  }

  // ── Entities ──
  gs.level.entities.forEach((e, i) => {
    if (e.collected || (e.opened && e.type === 'door') || (e.inWater)) return;
    const sx = e.gx * ts - camX;
    const sy = e.gy * ts - camY;

    // 只渲染视口内实体
    if (sx < -ts || sy < -ts || sx > viewW + ts || sy > viewH + ts) return;

    switch (e.type) {
      case 'star': {
        const float = Math.sin(frame * 0.08 + i) * 3;
        const starImg = getTileImg(3); // yellow star tile in tiny-town
        if (starImg?.complete) ctx.drawImage(starImg, sx + 4, sy + 4 + float, ts - 8, ts - 8);
        break;
      }
      case 'key': {
        const float = Math.sin(frame * 0.1 + i) * 2;
        ctx.fillStyle = '#FFD700';
        ctx.font = `${ts * 0.6}px serif`;
        ctx.fillText('🔑', sx + 4, sy + ts - 4 + float);
        break;
      }
      case 'npc': {
        const npcImg = getNpcTile(i);
        if (npcImg?.complete) ctx.drawImage(npcImg, sx, sy, ts, ts);
        // 头上叹号
        if (Math.abs(Math.floor(gs.px / ts) - e.gx) <= 2 &&
            Math.abs(Math.floor(gs.py / ts) - e.gy) <= 2) {
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('!', sx + ts / 2, sy - 4);
          ctx.textAlign = 'left';
        }
        break;
      }
      case 'door': {
        const doorImg = getTileImg(46); // fence as door
        if (doorImg?.complete) ctx.drawImage(doorImg, sx, sy, ts, ts);
        // 锁图标
        ctx.fillStyle = '#8B4513';
        ctx.font = `${ts * 0.5}px serif`;
        ctx.fillText('🔒', sx + 4, sy + ts / 2 + 4);
        break;
      }
      case 'pushBlock': {
        const blockImg = getTileImg(47); // chest/block
        if (blockImg?.complete) ctx.drawImage(blockImg, sx, sy, ts, ts);
        break;
      }
      case 'portal': {
        // 闪烁传送门
        const alpha = 0.5 + Math.sin(frame * 0.1) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#9C27B0';
        ctx.beginPath();
        ctx.arc(sx + ts / 2, sy + ts / 2, ts / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦', sx + ts / 2, sy + ts / 2 + 3);
        ctx.textAlign = 'left';
        break;
      }
      case 'exit': {
        const exitFloat = Math.sin(frame * 0.06) * 2;
        const exitImg = getTileImg(5); // flag-like tile
        if (exitImg?.complete) ctx.drawImage(exitImg, sx, sy + exitFloat, ts, ts);
        // 绿色光圈
        ctx.strokeStyle = '#58CC02';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx + ts / 2, sy + ts / 2, ts / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      default:
        break;
    }
  });

  // ── Player ──
  const playerSx = gs.px - ts / 2 - camX;
  const playerSy = gs.py - ts / 2 - camY;

  // Walking animation
  let charName = 'character_green_front';
  if (gs.pMoving) {
    const walkFrame = Math.floor(frame / 8) % 2 === 0 ? 'walk_a' : 'walk_b';
    charName = `character_green_${walkFrame}`;
  }
  const charImg = getCharImg(charName);
  if (charImg?.complete) {
    ctx.save();
    // Direction flip
    if (gs.pDir === 'left') {
      ctx.translate(playerSx + ts, playerSy);
      ctx.scale(-1, 1);
      ctx.drawImage(charImg, 0, 0, ts, ts);
    } else {
      ctx.drawImage(charImg, playerSx, playerSy, ts, ts);
    }
    ctx.restore();
  }

  // ── Fog of War ──
  if (gs.explored) {
    for (let gy = startGy; gy < endGy; gy++) {
      for (let gx = startGx; gx < endGx; gx++) {
        if (!gs.explored[gy]?.[gx]) {
          const sx = gx * ts - camX;
          const sy = gy * ts - camY;
          ctx.fillStyle = 'rgba(20, 30, 20, 0.75)';
          ctx.fillRect(sx, sy, ts, ts);
        }
      }
    }
  }

  // ── HUD ──
  renderHUD(ctx, gs, viewW);

  // ── Dialog ──
  if (gs.dialogText) {
    renderDialog(ctx, gs, viewW, viewH);
  }

  // ── Victory ──
  if (gs.completed) {
    renderVictory(ctx, viewW, viewH, gs);
  }
}

/* ── HUD ── */
function renderHUD(ctx, gs, viewW) {
  // Background bar
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, viewW, 36);

  ctx.font = 'bold 14px "Nunito", sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(`⭐ ${gs.stars} / ${gs.level.rules?.requiredStars ?? 0}`, 12, 24);

  if (gs.keys.length > 0) {
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`🔑 ×${gs.keys.length}`, 100, 24);
  }

  // Level name
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'right';
  ctx.fillText(gs.level.name, viewW - 12, 24);
  ctx.textAlign = 'left';
}

/* ── Dialog Box ── */
function renderDialog(ctx, gs, viewW, viewH) {
  const boxW = Math.min(viewW - 40, 320);
  const boxH = 80;
  const boxX = (viewW - boxW) / 2;
  const boxY = viewH - boxH - 20;

  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 13px "Nunito", sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(gs.dialogSpeaker, boxX + 16, boxY + 22);

  ctx.font = '12px "Nunito", sans-serif';
  ctx.fillStyle = '#fff';
  // Simple word wrap
  const maxW = boxW - 32;
  const words = gs.dialogText.split('');
  let line = '';
  let lineY = boxY + 42;
  words.forEach(ch => {
    if (ctx.measureText(line + ch).width > maxW) {
      ctx.fillText(line, boxX + 16, lineY);
      line = ch;
      lineY += 16;
    } else {
      line += ch;
    }
  });
  ctx.fillText(line, boxX + 16, lineY);
}

/* ── Victory Screen ── */
function renderVictory(ctx, viewW, viewH, gs) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.textAlign = 'center';
  ctx.font = 'bold 28px "Nunito", sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('🎉 通关成功！', viewW / 2, viewH / 2 - 20);

  ctx.font = '16px "Nunito", sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(`收集星星: ${gs.stars} / ${gs.level.rules?.requiredStars ?? 0}`, viewW / 2, viewH / 2 + 16);

  ctx.font = '14px "Nunito", sans-serif';
  ctx.fillStyle = '#A5D6A7';
  ctx.fillText('点击任意位置返回', viewW / 2, viewH / 2 + 48);
  ctx.textAlign = 'left';
}
