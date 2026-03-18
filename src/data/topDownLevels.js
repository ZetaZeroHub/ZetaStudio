/* ========================================
   游戏梦想家 — 俯视角冒险关卡数据
   4大初级主题关卡 — Tiny Town 素材驱动
   DIY 数据底座：JSON 可序列化，编辑器可导入/导出
   ======================================== */

/* ── Tiny Town Tile 映射 (12列×11行 = 132 tiles) ──
   通过逐一查看每个tile_XXXX.png验证后的正确映射
   ──────────────────────────────────────── */
export const TILE = {
  // ═══ 地面 (Row 0-2, walkable) ═══
  GRASS:       0,   // 纯绿草地
  GRASS_ALT:   1,   // 草地变体(略深)
  GRASS_DARK:  2,   // 深色草地(林地)
  GRASS_EDGE:  12,  // 草地边缘
  SAND:        6,   // 沙地
  SAND_ALT:    7,   // 沙地变体
  DIRT:        8,   // 泥地

  // ═══ 道路 (Row 2-3, walkable) ═══
  PATH_H:     24,   // 横向石板路
  PATH_V:     25,   // 纵向石板路
  PATH_CROSS: 26,   // 十字路口
  PATH_TL:    27,   // 拐角左上
  PATH_TR:    28,   // 拐角右上
  PATH_BL:    29,   // 拐角左下
  PATH_BR:    30,   // 拐角右下
  COBBLE:     35,   // 铺石路

  // ═══ 树木/植物 (walkable=false) ═══
  TREE_GREEN_TOP:   10,   // 绿色圆树(上半)
  TREE_GREEN_BOT:   22,   // 绿色圆树(下半)
  TREE_PINE:         3,   // 小松树(整体)
  TREE_BIG:          5,   // 大树(深绿圆顶)
  TREE_AUTUMN:       9,   // 秋色大树(橙黄)
  TREE_AUTUMN2:     33,   // 秋色变种树
  BUSH:             34,   // 灌木丛
  FLOWER:           21,   // 弯曲植物/花草

  // ═══ 水面 (Row 6, walkable=false) ═══
  WATER:     78,   // 水面中心
  WATER_TL:  66,   // 水左上
  WATER_TR:  67,   // 水右上
  WATER_BL:  79,   // 水左下
  WATER_BR:  80,   // 水右下
  WATER_T:   77,   // 水上边
  WATER_B:   89,   // 水下边
  WATER_L:   68,   // 水左边
  WATER_R:   69,   // 水右边

  // ═══ 房屋 Type1 灰色屋顶 (Row 4-5) ═══
  HOUSE1_ROOF_L:  48,  // 灰色屋顶左
  HOUSE1_ROOF_R:  49,  // 灰色屋顶右
  HOUSE1_WALL_L:  60,  // 灰色地基/墙左
  HOUSE1_WALL_R:  61,  // 灰色地基/墙右

  // ═══ 房屋 Type2 蓝灰色屋顶 (Row 4-5) ═══
  HOUSE2_ROOF_L:  50,  // 蓝灰色屋顶左
  HOUSE2_ROOF_R:  51,  // 蓝灰色屋顶右
  HOUSE2_WALL_L:  62,  // 蓝灰色地基/墙左
  HOUSE2_WALL_R:  63,  // 红棕色底+门

  // ═══ 棕色房屋 (Row 7-8) ═══
  HOUSE3_WALL:    90,  // 棕色墙壁(无窗)
  HOUSE3_DOOR:    91,  // 棕色门
  HOUSE3_WINDOW:  102, // 紫墙+窗户左
  HOUSE3_WINDOW2: 103, // 紫墙+窗户右

  // ═══ 城堡 (Row 7-9) ═══
  CASTLE_TL:  84,  // 城堡左上
  CASTLE_T:   85,  // 城堡顶中
  CASTLE_TR:  86,  // 城堡右上
  CASTLE_L:   96,  // 城堡左墙
  CASTLE_C:   97,  // 城堡中心墙
  CASTLE_R:   98,  // 城堡右墙
  CASTLE_BL:  108, // 城堡左下
  CASTLE_B:   109, // 城堡底中
  CASTLE_BR:  110, // 城堡右下
  CASTLE_GATE:121, // 城门拱门
  CASTLE_TOWER_T: 72,  // 城堡塔楼顶
  CASTLE_TOWER_B: 83,  // 城堡塔楼底

  // ═══ 围栏 (blocked) ═══
  FENCE_H:   46,  // 横向栅栏
  FENCE_V:   57,  // 纵向栅栏
  FENCE_POST: 58, // 栅栏柱

  // ═══ 桥 (walkable over water) ═══
  BRIDGE_H:  45,  // 横向木桥
  BRIDGE_V:  56,  // 纵向木桥

  // ═══ 物品 (interactive) ═══
  CHEST:     47,   // 宝箱
  MUSHROOM:  92,   // 蘑菇
  COIN:      93,   // 金币(圆形)
  COIN_ALT:  94,   // 金币变体
  TARGET:    95,   // 红色靶标
  POTION:    104,  // 蓝色药水

  // ═══ NPC角色 (Row 9-10) ═══
  CHAR_1:   111,   // 骑士角色
  CHAR_2:   112,   // 角色2
  CHAR_3:   113,   // 角色3
  CHAR_4:   114,   // 角色4
  CHAR_5:   115,   // 角色5
  CHAR_6:   116,   // 角色6
  CHAR_7:   117,   // 角色7
  CHAR_8:   118,   // 角色8
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
[TILE.TREE_GREEN_TOP, TILE.TREE_GREEN_BOT, TILE.TREE_PINE,
 TILE.TREE_BIG, TILE.TREE_AUTUMN, TILE.TREE_AUTUMN2, TILE.BUSH].forEach(t => {
  TILE_PROPS[t] = { walkable: false, type: 'tree' };
});

// Buildings & castle: blocked
[TILE.HOUSE1_ROOF_L, TILE.HOUSE1_ROOF_R, TILE.HOUSE1_WALL_L, TILE.HOUSE1_WALL_R,
 TILE.HOUSE2_ROOF_L, TILE.HOUSE2_ROOF_R, TILE.HOUSE2_WALL_L, TILE.HOUSE2_WALL_R,
 TILE.HOUSE3_WALL, TILE.HOUSE3_DOOR, TILE.HOUSE3_WINDOW, TILE.HOUSE3_WINDOW2,
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
   教学关 — 移动 + 收集金币
   ══════════════════════════════════════ */
const level1Ground = fill(20, 15, TILE.GRASS);
// 石板路引导
for (let x = 1; x <= 18; x++) level1Ground[7][x] = TILE.COBBLE;
for (let y = 3; y <= 11; y++) level1Ground[y][10] = TILE.COBBLE;
// 泥地区域
for (let y = 4; y <= 6; y++) for (let x = 3; x <= 6; x++) level1Ground[y][x] = TILE.GRASS_ALT;

const level1Terrain = fill(20, 15, -1);
// 边界围栏
for (let x = 0; x < 20; x++) { level1Terrain[0][x] = TILE.FENCE_H; level1Terrain[14][x] = TILE.FENCE_H; }
for (let y = 0; y < 15; y++) { level1Terrain[y][0] = TILE.FENCE_V; level1Terrain[y][19] = TILE.FENCE_V; }
level1Terrain[0][0] = TILE.FENCE_POST; level1Terrain[0][19] = TILE.FENCE_POST;
level1Terrain[14][0] = TILE.FENCE_POST; level1Terrain[14][19] = TILE.FENCE_POST;

// 树木(用正确的上下两格拼接)
[[3,2],[5,14],[12,3],[14,16]].forEach(([y,x]) => {
  if (y > 0 && y < 13 && x > 0 && x < 19) {
    level1Terrain[y][x] = TILE.TREE_GREEN_TOP;
    level1Terrain[y+1][x] = TILE.TREE_GREEN_BOT;
  }
});
// 松树(单格)
[[3,4],[5,12],[12,5],[14,2]].forEach(([y,x]) => {
  if (y > 0 && y < 14 && x > 0 && x < 19) level1Terrain[y][x] = TILE.TREE_PINE;
});

// 灌木
[[6,3],[6,6],[8,3],[8,6]].forEach(([y,x]) => level1Terrain[y][x] = TILE.BUSH);

// 房屋 Type1 (灰色) — 正确的屋顶+墙壁拼接
level1Terrain[2][15] = TILE.HOUSE1_ROOF_L;
level1Terrain[2][16] = TILE.HOUSE1_ROOF_R;
level1Terrain[3][15] = TILE.HOUSE1_WALL_L;
level1Terrain[3][16] = TILE.HOUSE1_WALL_R;

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
    { type: 'npc', gx: 4, gy: 7, name: '村长', dialog: '欢迎来到绿野新村！用方向键移动，收集5颗金币吧！' },
    { type: 'npc', gx: 10, gy: 5, name: '花匠', dialog: '听说北边有颗金币藏在树丛里~' },
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
const level2Ground = fill(24, 15, TILE.GRASS);
// 石板路
for (let x = 1; x <= 22; x++) level2Ground[7][x] = TILE.COBBLE;
for (let y = 1; y <= 13; y++) { level2Ground[y][5] = TILE.COBBLE; level2Ground[y][18] = TILE.COBBLE; }

const level2Terrain = fill(24, 15, -1);
// 边界
for (let x = 0; x < 24; x++) { level2Terrain[0][x] = TILE.FENCE_H; level2Terrain[14][x] = TILE.FENCE_H; }
for (let y = 0; y < 15; y++) { level2Terrain[y][0] = TILE.FENCE_V; level2Terrain[y][23] = TILE.FENCE_V; }
level2Terrain[0][0] = TILE.FENCE_POST; level2Terrain[0][23] = TILE.FENCE_POST;
level2Terrain[14][0] = TILE.FENCE_POST; level2Terrain[14][23] = TILE.FENCE_POST;

// 河流 (vertical, splits map)
for (let y = 0; y <= 14; y++) {
  level2Terrain[y][11] = TILE.WATER;
  level2Terrain[y][12] = TILE.WATER;
}
// 河流左右边缘
for (let y = 1; y <= 13; y++) {
  level2Terrain[y][10] = TILE.WATER_L;
  level2Terrain[y][13] = TILE.WATER_R;
}
// 桥
level2Terrain[7][10] = -1; level2Terrain[7][11] = TILE.BRIDGE_H;
level2Terrain[7][12] = TILE.BRIDGE_H; level2Terrain[7][13] = -1;

// 房屋 Type1 (灰色) — 正确拼接
level2Terrain[2][2] = TILE.HOUSE1_ROOF_L;
level2Terrain[2][3] = TILE.HOUSE1_ROOF_R;
level2Terrain[3][2] = TILE.HOUSE1_WALL_L;
level2Terrain[3][3] = TILE.HOUSE1_WALL_R;

// 房屋 Type2 (蓝灰色) — 正确拼接
level2Terrain[10][15] = TILE.HOUSE2_ROOF_L;
level2Terrain[10][16] = TILE.HOUSE2_ROOF_R;
level2Terrain[11][15] = TILE.HOUSE2_WALL_L;
level2Terrain[11][16] = TILE.HOUSE2_WALL_R;

// 树木(正确上下拼接)
[[4,8],[4,14],[9,14],[2,20]].forEach(([y,x]) => {
  if (x < 24 && y < 13) {
    level2Terrain[y][x] = TILE.TREE_GREEN_TOP;
    level2Terrain[y+1][x] = TILE.TREE_GREEN_BOT;
  }
});
// 松树
[[9,8],[12,20]].forEach(([y,x]) => {
  if (x < 24) level2Terrain[y][x] = TILE.TREE_PINE;
});

// 门 (锁门 = 栅栏 placeholder)
level2Terrain[7][20] = TILE.FENCE_H;

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
const level3Ground = fill(24, 18, TILE.GRASS_DARK);
// 泥路
for (let x = 1; x <= 22; x++) level3Ground[9][x] = TILE.DIRT;
for (let y = 3; y <= 15; y++) { level3Ground[y][6] = TILE.DIRT; level3Ground[y][17] = TILE.DIRT; }

const level3Terrain = fill(24, 18, -1);
// 密林边界(用正确的树木上半)
for (let x = 0; x < 24; x++) { level3Terrain[0][x] = TILE.TREE_GREEN_TOP; level3Terrain[17][x] = TILE.TREE_GREEN_TOP; }
for (let y = 0; y < 18; y++) { level3Terrain[y][0] = TILE.TREE_GREEN_TOP; level3Terrain[y][23] = TILE.TREE_GREEN_TOP; }

// 密林内部(正确的上下双格树)
const treePositions3 = [
  [1,3],[1,8],[1,13],[1,18],[1,20],
  [3,3],[3,13],[3,20],
  [5,3],[5,10],[5,15],[5,20],
  [7,3],[7,10],[7,20],
  [11,3],[11,10],[11,20],
  [13,3],[13,10],[13,15],[13,20],
  [15,3],[15,13],[15,20],
];
treePositions3.forEach(([y,x]) => {
  if (y < 16 && x > 0 && x < 23) {
    level3Terrain[y][x] = TILE.TREE_GREEN_TOP;
    level3Terrain[y+1][x] = TILE.TREE_GREEN_BOT;
  }
});
// 松树点缀
[[2,8],[4,5],[6,8],[8,5],[10,8],[12,5],[14,8],[16,5]].forEach(([y,x]) => {
  if (y > 0 && y < 17 && x > 0 && x < 23) level3Terrain[y][x] = TILE.TREE_PINE;
});

// 水池 (需要推箱子堵住)
level3Terrain[9][12] = TILE.WATER;
level3Terrain[9][13] = TILE.WATER;

// 围栏门 (需钥匙)
level3Terrain[9][4] = TILE.FENCE_H;
level3Terrain[5][17] = TILE.FENCE_H;
level3Terrain[14][17] = TILE.FENCE_H;

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
const level4Ground = fill(28, 20, TILE.SAND);
// 石板路
for (let x = 1; x <= 13; x++) level4Ground[10][x] = TILE.COBBLE;
for (let x = 16; x <= 26; x++) level4Ground[10][x] = TILE.COBBLE;
for (let y = 4; y <= 16; y++) { level4Ground[y][7] = TILE.COBBLE; level4Ground[y][21] = TILE.COBBLE; }

const level4Terrain = fill(28, 20, -1);
// 外墙
for (let x = 0; x < 28; x++) { level4Terrain[0][x] = TILE.FENCE_H; level4Terrain[19][x] = TILE.FENCE_H; }
for (let y = 0; y < 20; y++) { level4Terrain[y][0] = TILE.FENCE_V; level4Terrain[y][27] = TILE.FENCE_V; }
level4Terrain[0][0] = TILE.FENCE_POST; level4Terrain[0][27] = TILE.FENCE_POST;
level4Terrain[19][0] = TILE.FENCE_POST; level4Terrain[19][27] = TILE.FENCE_POST;

// 城堡 (正确的3×3九宫格拼接)
level4Terrain[2][19] = TILE.CASTLE_TL; level4Terrain[2][20] = TILE.CASTLE_T;  level4Terrain[2][21] = TILE.CASTLE_T;  level4Terrain[2][22] = TILE.CASTLE_TR;
level4Terrain[3][19] = TILE.CASTLE_L;  level4Terrain[3][20] = TILE.CASTLE_C;  level4Terrain[3][21] = TILE.CASTLE_C;  level4Terrain[3][22] = TILE.CASTLE_R;
level4Terrain[4][19] = TILE.CASTLE_BL; level4Terrain[4][20] = TILE.CASTLE_B;  level4Terrain[4][21] = TILE.CASTLE_B;  level4Terrain[4][22] = TILE.CASTLE_BR;
// 城堡塔楼
level4Terrain[2][18] = TILE.CASTLE_TOWER_T; level4Terrain[3][18] = TILE.CASTLE_TOWER_B;
level4Terrain[2][23] = TILE.CASTLE_TOWER_T; level4Terrain[3][23] = TILE.CASTLE_TOWER_B;
// 城门
level4Terrain[5][20] = TILE.CASTLE_GATE; level4Terrain[5][21] = TILE.CASTLE_GATE;

// 护城河 (around castle)
for (let cx = 17; cx <= 24; cx++) { level4Terrain[1][cx] = TILE.WATER; level4Terrain[6][cx] = TILE.WATER; }
for (let cy = 1; cy <= 6; cy++) { level4Terrain[cy][17] = TILE.WATER; level4Terrain[cy][24] = TILE.WATER; }
// Bridge to castle
level4Terrain[6][20] = TILE.BRIDGE_H; level4Terrain[6][21] = TILE.BRIDGE_H;

// 废墟房屋 (正确拼接)
level4Terrain[13][3] = TILE.HOUSE1_ROOF_L; level4Terrain[13][4] = TILE.HOUSE1_ROOF_R;
level4Terrain[14][3] = TILE.HOUSE1_WALL_L; level4Terrain[14][4] = TILE.HOUSE1_WALL_R;

level4Terrain[15][8] = TILE.HOUSE2_ROOF_L; level4Terrain[15][9] = TILE.HOUSE2_ROOF_R;
level4Terrain[16][8] = TILE.HOUSE2_WALL_L; level4Terrain[16][9] = TILE.HOUSE2_WALL_R;

// 树木(正确拼接)
[[8,2],[8,12],[3,10]].forEach(([y,x]) => {
  if (y < 18) {
    level4Terrain[y][x] = TILE.TREE_GREEN_TOP;
    level4Terrain[y+1][x] = TILE.TREE_GREEN_BOT;
  }
});
[[8,5],[8,15],[12,25],[16,25],[3,13]].forEach(([y,x]) => {
  level4Terrain[y][x] = TILE.TREE_PINE;
});

// 围栏门
level4Terrain[10][14] = TILE.FENCE_H;
level4Terrain[10][15] = TILE.FENCE_H;

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
    { type: 'star', gx: 20, gy: 10 },
    { type: 'star', gx: 20, gy: 4 },
    { type: 'key', gx: 5, gy: 15, keyId: 'castleGate' },
    { type: 'key', gx: 12, gy: 8, keyId: 'innerGate' },
    { type: 'door', gx: 14, gy: 10, keyId: 'castleGate' },
    { type: 'npc', gx: 4, gy: 10, name: '旅人', dialog: '王城的大门被锁住了，钥匙似乎在南边废墟里...' },
    { type: 'npc', gx: 20, gy: 8, name: '守门人', dialog: '你找到了宝藏！快从城门逃出去吧！' },
    { type: 'portal', gx: 20, gy: 3, targetGx: 20, targetGy: 16, label: '密道入口' },
    { type: 'portal', gx: 20, gy: 16, targetGx: 20, targetGy: 3, label: '密道出口' },
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
