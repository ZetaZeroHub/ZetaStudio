/* ========================================
   游戏梦想家 — 俯视角冒险关卡数据
   4大初级主题关卡 — Tiny Town 素材驱动
   DIY 数据底座：JSON 可序列化，编辑器可导入/导出
   ======================================== */

/* ── Tiny Town Tile 映射 ── */
export const TILE = {
  // 地面 (walkable)
  GRASS:      0,
  GRASS_ALT:  1,
  GRASS_DARK: 2,
  SAND:       6,
  SAND_ALT:   7,
  DIRT:       8,
  // 道路 (walkable)
  PATH_H:    24,
  PATH_V:    25,
  PATH_CROSS:26,
  PATH_TL:   27,
  PATH_TR:   28,
  PATH_BL:   29,
  PATH_BR:   30,
  PATH_T:    31,
  PATH_B:    32,
  PATH_L:    33,
  PATH_R:    34,
  COBBLE:    35,
  COBBLE2:   36,
  // 水面 (blocked)
  WATER:     78,
  WATER_TL:  66,
  WATER_TR:  67,
  WATER_BL:  79,
  WATER_BR:  80,
  WATER_T:   77,
  WATER_B:   89,
  WATER_L:   68,
  WATER_R:   69,
  // 树木 (blocked)
  TREE_SM:   33,
  TREE_LG_T: 10,
  TREE_LG_B: 22,
  BUSH:      34,
  // 花草 (walkable decoration)
  FLOWER_R:  9,
  FLOWER_Y:  21,
  // 建筑 (blocked)
  HOUSE_TL:  48,
  HOUSE_TR:  49,
  HOUSE_BL:  60,
  HOUSE_BR:  61,
  HOUSE2_TL: 50,
  HOUSE2_TR: 51,
  HOUSE2_BL: 62,
  HOUSE2_BR: 63,
  // 城堡 (blocked)
  CASTLE_TL: 84,
  CASTLE_T:  85,
  CASTLE_TR: 86,
  CASTLE_L:  96,
  CASTLE_C:  97,
  CASTLE_R:  98,
  CASTLE_BL: 108,
  CASTLE_B:  109,
  CASTLE_BR: 110,
  CASTLE_GATE:121,
  CASTLE_TOWER_T: 72,
  CASTLE_TOWER_B: 83,
  // 围栏 (blocked)
  FENCE_H:   46,
  FENCE_V:   57,
  FENCE_POST:58,
  // 桥 (walkable over water)
  BRIDGE_H:  45,
  BRIDGE_V:  56,
  // 门/宝箱 (interactive)
  DOOR:      121,
  CHEST:     47,
  SIGN:      35,
};

/* ── Tile 属性表 ── */
export const TILE_PROPS = {};
// Default: all walkable
for (let i = 0; i < 132; i++) TILE_PROPS[i] = { walkable: true, type: 'ground' };

// Water: blocked
[TILE.WATER, TILE.WATER_TL, TILE.WATER_TR, TILE.WATER_BL, TILE.WATER_BR,
 TILE.WATER_T, TILE.WATER_B, TILE.WATER_L, TILE.WATER_R].forEach(t => {
  TILE_PROPS[t] = { walkable: false, type: 'water' };
});

// Trees: blocked
[TILE.TREE_LG_T, TILE.TREE_LG_B].forEach(t => {
  TILE_PROPS[t] = { walkable: false, type: 'tree' };
});

// Buildings & castle: blocked
[TILE.HOUSE_TL, TILE.HOUSE_TR, TILE.HOUSE_BL, TILE.HOUSE_BR,
 TILE.HOUSE2_TL, TILE.HOUSE2_TR, TILE.HOUSE2_BL, TILE.HOUSE2_BR,
 TILE.CASTLE_TL, TILE.CASTLE_T, TILE.CASTLE_TR,
 TILE.CASTLE_L, TILE.CASTLE_C, TILE.CASTLE_R,
 TILE.CASTLE_BL, TILE.CASTLE_B, TILE.CASTLE_BR,
 TILE.CASTLE_TOWER_T, TILE.CASTLE_TOWER_B,
 TILE.FENCE_H, TILE.FENCE_V, TILE.FENCE_POST].forEach(t => {
  TILE_PROPS[t] = { walkable: false, type: 'wall' };
});

/* ── Helper: 生成填充数组 ── */
function fill(w, h, val) {
  return Array.from({ length: h }, () => Array(w).fill(val));
}

/* ══════════════════════════════════════
   关卡 1: 绿野新村 (Green Meadow)
   教学关 — 移动 + 收集
   ══════════════════════════════════════ */
const level1Ground = fill(20, 15, 0);
// 加入石板路引导
for (let x = 1; x <= 18; x++) level1Ground[7][x] = 35; // 横向主路
for (let y = 3; y <= 11; y++) level1Ground[y][10] = 35; // 纵向分支

const level1Terrain = fill(20, 15, -1); // -1 = empty/air
// 边界围栏
for (let x = 0; x < 20; x++) { level1Terrain[0][x] = 46; level1Terrain[14][x] = 46; }
for (let y = 0; y < 15; y++) { level1Terrain[y][0] = 57; level1Terrain[y][19] = 57; }
// 树木装饰
[[3,2],[3,4],[5,12],[5,14],[12,3],[12,5],[14,2],[14,16]].forEach(([y,x]) => {
  if (y > 0 && y < 14 && x > 0 && x < 19) level1Terrain[y][x] = 10;
});
// 花园
[[6,4],[6,5],[8,4],[8,5]].forEach(([y,x]) => level1Terrain[y][x] = 9);

const level1 = {
  id: 'easy-1',
  name: '绿野新村',
  theme: 'meadow',
  difficulty: 'easy',
  gridW: 20, gridH: 15,
  tileSize: 32,
  layers: {
    ground:     level1Ground,
    terrain:    level1Terrain,
    decoration: fill(20, 15, -1),
  },
  entities: [
    { type: 'player_spawn', gx: 2, gy: 7 },
    { type: 'star', gx: 5, gy: 3 },
    { type: 'star', gx: 8, gy: 11 },
    { type: 'star', gx: 15, gy: 5 },
    { type: 'star', gx: 13, gy: 10 },
    { type: 'star', gx: 17, gy: 7 },
    { type: 'npc', gx: 4, gy: 7, name: '村长', dialog: '欢迎来到绿野新村！用方向键移动，收集5颗星星吧！' },
    { type: 'npc', gx: 10, gy: 5, name: '花匠', dialog: '听说北边有颗星星藏在花丛里~' },
    { type: 'exit', gx: 18, gy: 7 },
  ],
  rules: {
    requiredStars: 5,
    hasKeys: false,
    hasFog: false,
    hasPushBlock: false,
    timeLimit: 0,
  },
};

/* ══════════════════════════════════════
   关卡 2: 清溪小镇 (River Town)
   钥匙-门解谜 — 河流障碍
   ══════════════════════════════════════ */
const level2Ground = fill(24, 15, 0);
// 石板路
for (let x = 1; x <= 22; x++) level2Ground[7][x] = 35;
for (let y = 1; y <= 13; y++) { level2Ground[y][5] = 35; level2Ground[y][18] = 35; }

const level2Terrain = fill(24, 15, -1);
// 边界
for (let x = 0; x < 24; x++) { level2Terrain[0][x] = 46; level2Terrain[14][x] = 46; }
for (let y = 0; y < 15; y++) { level2Terrain[y][0] = 57; level2Terrain[y][23] = 57; }

// 河流 (vertical, splits map)
for (let y = 0; y <= 14; y++) {
  level2Terrain[y][11] = 78;
  level2Terrain[y][12] = 78;
}
// 桥
level2Terrain[7][11] = 45;
level2Terrain[7][12] = 45;

// 房屋
[[2,2,48],[2,3,49],[3,2,60],[3,3,61]].forEach(([y,x,t]) => level2Terrain[y][x] = t);
[[10,15,50],[10,16,51],[11,15,62],[11,16,63]].forEach(([y,x,t]) => level2Terrain[y][x] = t);

// 树木
[[4,8],[4,14],[9,8],[9,14],[2,20],[12,20]].forEach(([y,x]) => {
  if (x < 24) level2Terrain[y][x] = 10;
});

// 门 (locked gate on right side)
level2Terrain[7][20] = 46; // fence as locked gate placeholder

const level2 = {
  id: 'easy-2',
  name: '清溪小镇',
  theme: 'river',
  difficulty: 'easy',
  gridW: 24, gridH: 15,
  tileSize: 32,
  layers: {
    ground:     level2Ground,
    terrain:    level2Terrain,
    decoration: fill(24, 15, -1),
  },
  entities: [
    { type: 'player_spawn', gx: 2, gy: 7 },
    { type: 'star', gx: 4, gy: 5 },
    { type: 'star', gx: 8, gy: 3 },
    { type: 'star', gx: 8, gy: 11 },
    { type: 'star', gx: 16, gy: 4 },
    { type: 'star', gx: 16, gy: 10 },
    { type: 'key', gx: 9, gy: 12, keyId: 'gate1' },
    { type: 'door', gx: 20, gy: 7, keyId: 'gate1' },
    { type: 'npc', gx: 3, gy: 5, name: '渔夫', dialog: '河水很深，只能从桥上过去哦！' },
    { type: 'npc', gx: 15, gy: 7, name: '铁匠', dialog: '东边大门的钥匙好像掉在南边了...' },
    { type: 'exit', gx: 22, gy: 7 },
  ],
  rules: {
    requiredStars: 3,
    hasKeys: true,
    hasFog: false,
    hasPushBlock: false,
    timeLimit: 0,
  },
};

/* ══════════════════════════════════════
   关卡 3: 迷雾森林 (Misty Forest)
   推箱子 + 迷雾 + 岔路
   ══════════════════════════════════════ */
const level3Ground = fill(24, 18, 2); // dark grass
// 泥路
for (let x = 1; x <= 22; x++) level3Ground[9][x] = 8;
for (let y = 3; y <= 15; y++) { level3Ground[y][6] = 8; level3Ground[y][17] = 8; }

const level3Terrain = fill(24, 18, -1);
// 密林边界
for (let x = 0; x < 24; x++) { level3Terrain[0][x] = 10; level3Terrain[17][x] = 10; }
for (let y = 0; y < 18; y++) { level3Terrain[y][0] = 10; level3Terrain[y][23] = 10; }

// 大量树木填充 (密林)
const treePositions3 = [
  [1,1],[1,3],[1,5],[1,8],[1,10],[1,13],[1,15],[1,18],[1,20],[1,22],
  [3,1],[3,3],[3,8],[3,13],[3,20],[3,22],
  [5,1],[5,3],[5,8],[5,10],[5,13],[5,15],[5,20],[5,22],
  [7,1],[7,3],[7,10],[7,13],[7,20],[7,22],
  [11,1],[11,3],[11,10],[11,13],[11,20],[11,22],
  [13,1],[13,3],[13,8],[13,10],[13,13],[13,15],[13,20],[13,22],
  [15,1],[15,3],[15,8],[15,13],[15,20],[15,22],
  [16,1],[16,5],[16,10],[16,15],[16,20],[16,22],
];
treePositions3.forEach(([y,x]) => { level3Terrain[y][x] = 10; });

// 水池 (需要推箱子堵住)
level3Terrain[9][12] = 78;
level3Terrain[9][13] = 78;

// 围栏门 (需钥匙)
level3Terrain[9][4] = 46;
level3Terrain[5][17] = 46;
level3Terrain[14][17] = 46;

const level3 = {
  id: 'easy-3',
  name: '迷雾森林',
  theme: 'forest',
  difficulty: 'easy',
  gridW: 24, gridH: 18,
  tileSize: 32,
  layers: {
    ground:     level3Ground,
    terrain:    level3Terrain,
    decoration: fill(24, 18, -1),
  },
  entities: [
    { type: 'player_spawn', gx: 2, gy: 9 },
    { type: 'star', gx: 6, gy: 3 },
    { type: 'star', gx: 17, gy: 3 },
    { type: 'star', gx: 12, gy: 15 },
    { type: 'star', gx: 20, gy: 9 },
    { type: 'star', gx: 6, gy: 15 },
    { type: 'key', gx: 6, gy: 14, keyId: 'forestGate1' },
    { type: 'key', gx: 20, gy: 4, keyId: 'forestGate2' },
    { type: 'key', gx: 12, gy: 16, keyId: 'forestGate3' },
    { type: 'door', gx: 4, gy: 9, keyId: 'forestGate1' },
    { type: 'door', gx: 17, gy: 5, keyId: 'forestGate2' },
    { type: 'door', gx: 17, gy: 14, keyId: 'forestGate3' },
    { type: 'pushBlock', gx: 10, gy: 9 },
    { type: 'pushBlock', gx: 14, gy: 9 },
    { type: 'npc', gx: 6, gy: 9, name: '猎人', dialog: '箱子可以推到水里过河哦！按住方向键推动。' },
    { type: 'exit', gx: 21, gy: 9 },
  ],
  rules: {
    requiredStars: 3,
    hasKeys: true,
    hasFog: true,
    hasPushBlock: true,
    timeLimit: 0,
  },
};

/* ══════════════════════════════════════
   关卡 4: 王城遗迹 (Castle Ruins)
   综合考验 — 多区域 + 传送门
   ══════════════════════════════════════ */
const level4Ground = fill(28, 20, 6); // 沙地底色
// 石板路
for (let x = 1; x <= 13; x++) level4Ground[10][x] = 35;
for (let x = 16; x <= 26; x++) level4Ground[10][x] = 35;
for (let y = 4; y <= 16; y++) { level4Ground[y][7] = 35; level4Ground[y][21] = 35; }

const level4Terrain = fill(28, 20, -1);
// 外墙
for (let x = 0; x < 28; x++) { level4Terrain[0][x] = 46; level4Terrain[19][x] = 46; }
for (let y = 0; y < 20; y++) { level4Terrain[y][0] = 57; level4Terrain[y][27] = 57; }

// 城堡 (center-right, 5x4)
for (let cy = 2; cy <= 5; cy++) {
  for (let cx = 18; cx <= 24; cx++) {
    level4Terrain[cy][cx] = 97; // castle wall
  }
}
level4Terrain[5][21] = -1; // castle gate (entry)

// 护城河 (around castle)
for (let cx = 17; cx <= 25; cx++) { level4Terrain[1][cx] = 78; level4Terrain[6][cx] = 78; }
for (let cy = 1; cy <= 6; cy++) { level4Terrain[cy][17] = 78; level4Terrain[cy][25] = 78; }
// Bridge to castle
level4Terrain[6][21] = 45;

// 废墟区域 (south)
[[13,3],[13,4],[14,3],[14,4]].forEach(([y,x]) => level4Terrain[y][x] = 48);
[[15,8],[15,9],[16,8],[16,9]].forEach(([y,x]) => level4Terrain[y][x] = 50);

// 树木
[[8,2],[8,5],[8,12],[8,15],[12,25],[16,25],[3,10],[3,13]].forEach(([y,x]) => {
  level4Terrain[y][x] = 10;
});

// 围栏门
level4Terrain[10][14] = 46;
level4Terrain[10][15] = 46;

const level4 = {
  id: 'easy-4',
  name: '王城遗迹',
  theme: 'castle',
  difficulty: 'easy',
  gridW: 28, gridH: 20,
  tileSize: 32,
  layers: {
    ground:     level4Ground,
    terrain:    level4Terrain,
    decoration: fill(28, 20, -1),
  },
  entities: [
    { type: 'player_spawn', gx: 2, gy: 10 },
    { type: 'star', gx: 7, gy: 4 },
    { type: 'star', gx: 7, gy: 16 },
    { type: 'star', gx: 13, gy: 3 },
    { type: 'star', gx: 13, gy: 17 },
    { type: 'star', gx: 21, gy: 10 },
    { type: 'star', gx: 21, gy: 4 },
    { type: 'key', gx: 5, gy: 15, keyId: 'castleGate' },
    { type: 'key', gx: 12, gy: 8, keyId: 'innerGate' },
    { type: 'door', gx: 14, gy: 10, keyId: 'castleGate' },
    { type: 'npc', gx: 4, gy: 10, name: '旅人', dialog: '王城的大门被锁住了，钥匙似乎在南边废墟里...' },
    { type: 'npc', gx: 21, gy: 8, name: '守门人', dialog: '你找到了宝藏！快从城门逃出去吧！' },
    { type: 'portal', gx: 21, gy: 3, targetGx: 21, targetGy: 16, label: '密道入口' },
    { type: 'portal', gx: 21, gy: 16, targetGx: 21, targetGy: 3, label: '密道出口' },
    { type: 'exit', gx: 26, gy: 10 },
  ],
  rules: {
    requiredStars: 4,
    hasKeys: true,
    hasFog: true,
    hasPushBlock: false,
    timeLimit: 0,
  },
};

/* ── 导出 ── */
export const TOP_DOWN_LEVELS = [level1, level2, level3, level4];

export function getTopDownLevel(id) {
  return TOP_DOWN_LEVELS.find(l => l.id === id);
}

export function getTopDownLevelsByDifficulty() {
  return TOP_DOWN_LEVELS.map(l => ({
    id: l.id,
    name: l.name,
    theme: l.theme,
    stars: 0,
    character: '',
  }));
}
