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

/* ── 导出 (关卡暂空，等待后续设计) ── */
export const TOP_DOWN_LEVELS = [];

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

/* ══════════════════════════════════════════════
   走出迷宫 — 路径绘制型迷宫关卡系统
   Grid 值: 0=草地(不可走) 1=泥土路(可走) 2=水池(终点)
   ══════════════════════════════════════════════ */

/* ── 素材路径常量 ── */
const TANKS = '/assets/kenney/2.5d/kenney_top-down-tanks-redux/PNG/Default size';
const FOLIAGE = '/assets/kenney/2.5d/kenney_foliage-pack/PNG/Default size';
const DUCK_DIR = '/assets/kenney/2.5d/kenney_shooting-gallery/PNG/Objects';

export const MAZE_ASSETS = {
  grass: `${TANKS}/tileGrass1.png`,
  grass2: `${TANKS}/tileGrass2.png`,
  // Road tiles — auto-selected by resolveRoadTile
  roadH: `${TANKS}/tileGrass_roadEast.png`,
  roadV: `${TANKS}/tileGrass_roadNorth.png`,
  roadCross: `${TANKS}/tileGrass_roadCrossing.png`,
  cornerUL: `${TANKS}/tileGrass_roadCornerUL.png`,
  cornerUR: `${TANKS}/tileGrass_roadCornerUR.png`,
  cornerLL: `${TANKS}/tileGrass_roadCornerLL.png`,
  cornerLR: `${TANKS}/tileGrass_roadCornerLR.png`,
  splitN: `${TANKS}/tileGrass_roadSplitN.png`,
  splitS: `${TANKS}/tileGrass_roadSplitS.png`,
  splitE: `${TANKS}/tileGrass_roadSplitE.png`,
  splitW: `${TANKS}/tileGrass_roadSplitW.png`,
  // Duck — 8 directions + walking frames
  duckDown:      '/assets/custom/duck/duck_down.png',
  duckDown1:     '/assets/custom/duck/duck_down_1.png',
  duckDown2:     '/assets/custom/duck/duck_down_2.png',
  duckUp:        '/assets/custom/duck/duck_up.png',
  duckUp1:       '/assets/custom/duck/duck_up_1.png',
  duckUp2:       '/assets/custom/duck/duck_up_2.png',
  duckLeft:      '/assets/custom/duck/duck_left.png',
  duckLeft1:     '/assets/custom/duck/duck_left_1.png',
  duckLeft2:     '/assets/custom/duck/duck_left_2.png',
  duckRight:     '/assets/custom/duck/duck_right.png',
  duckRight1:    '/assets/custom/duck/duck_right_1.png',
  duckRight2:    '/assets/custom/duck/duck_right_2.png',
  duckUpLeft:    '/assets/custom/duck/duck_up_left.png',
  duckUpRight:   '/assets/custom/duck/duck_up_right.png',
  duckDownLeft:  '/assets/custom/duck/duck_down_left.png',
  duckDownRight: '/assets/custom/duck/duck_down_right.png',
  // Foliage decorations — expanded full catalog
  treePine: `${FOLIAGE}/foliagePack_005.png`,         // 针叶松树
  treeRound: `${FOLIAGE}/foliagePack_008.png`,        // 圆形绿树
  treeBig: `${FOLIAGE}/foliagePack_010.png`,          // 大圆绿树
  treeSlim: `${FOLIAGE}/foliagePack_006.png`,         // 细长绿树
  treeTall: `${FOLIAGE}/foliagePack_007.png`,         // 高绿树
  treeBroad: `${FOLIAGE}/foliagePack_009.png`,        // 宽阔绿树
  treeOrange1: `${FOLIAGE}/foliagePack_011.png`,      // 橙色针叶树
  treeOrange2: `${FOLIAGE}/foliagePack_012.png`,      // 橙色细树
  treeOrange3: `${FOLIAGE}/foliagePack_013.png`,      // 橙色圆树
  treeOrangeRound: `${FOLIAGE}/foliagePack_014.png`,  // 橙色大圆树
  treeOrangeBig: `${FOLIAGE}/foliagePack_015.png`,    // 橙色宽树
  treeOrangeBroad: `${FOLIAGE}/foliagePack_016.png`,  // 橙色宽阔树
  treeOrangeTall: `${FOLIAGE}/foliagePack_017.png`,   // 橙色高树
  treeSnowPine1: `${FOLIAGE}/foliagePack_042.png`,    // 雪松树A
  treeSnowPine2: `${FOLIAGE}/foliagePack_043.png`,    // 雪松树B
  treeSnowPine3: `${FOLIAGE}/foliagePack_044.png`,    // 雪松树C
  treeIcePine1: `${FOLIAGE}/foliagePack_047.png`,     // 冰蓝松树A
  treeIcePine2: `${FOLIAGE}/foliagePack_048.png`,     // 冰蓝松树B
  bush: `${FOLIAGE}/foliagePack_040.png`,             // 灌木
  bushSmall: `${FOLIAGE}/foliagePack_050.png`,        // 小灌木
  bushBig: `${FOLIAGE}/foliagePack_021.png`,          // 大灌木
  flower: `${FOLIAGE}/foliagePack_001.png`,           // 红花
  flowerWhite: `${FOLIAGE}/foliagePack_002.png`,      // 白花
  grassTuft: `${FOLIAGE}/foliagePack_020.png`,        // 草丛
  trunk1: `${FOLIAGE}/foliagePack_003.png`,           // 树干A
  trunk2: `${FOLIAGE}/foliagePack_004.png`,           // 树干B
  rockSmall: `${FOLIAGE}/foliagePack_060.png`,        // 小石头
  rockBig: `${FOLIAGE}/foliagePack_061.png`,          // 大石头
  // Racing-pack scene decorations
  raceTreeLarge: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/tree_large.png',
  raceTreeSmall: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/tree_small.png',
  raceRock1: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/rock1.png',
  raceRock2: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/rock2.png',
  raceRock3: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/rock3.png',
  raceTentBlue: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/tent_blue.png',
  raceTentRed: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/tent_red.png',
  raceBarrelBlue: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/barrel_blue.png',
  raceBarrelRed: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/barrel_red.png',
  raceCone: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/cone_straight.png',
  // Block-pack — buildings, characters, objects
  blockTreeGreen: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/foliageTree_green.png',
  blockTreeOrange: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/foliageTree_orange.png',
  blockTreeRed: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/foliageTree_red.png',
  blockBushLarge: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/foliageBush_large.png',
  blockBushSmall: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/foliageBush_small.png',
  blockMarketBlue: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/market_stallBlue.png',
  blockMarketRed: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/market_stallRed.png',
  blockFenceSingle: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/fence_single.png',
  blockFenceDouble: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/fence_double.png',
  blockCart: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/cart.png',
  blockCartHorse: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/cart_horse.png',
  blockBox: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/box.png',
  blockBoxWide: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/box_wide.png',
  blockBoxTreasure: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/box_treasure.png',
  blockDoor: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/door.png',
  blockDoorOpen: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/door_open.png',
  blockDoorGlass: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/door_glass.png',
  blockLadderLarge: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/ladder_large.png',
  blockLadderSmall: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/ladder_small.png',
  blockHouseBlue: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/tileBuilding_roofBluePoint.png',
  blockHouseRed: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/tileBuilding_roofRedPoint.png',
  blockCastle: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/tileCastle.png',
  blockCastleGate: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/tileCastle_gate.png',
  blockBridge: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/tileBridge.png',
  blockCharMan: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/character_man.png',
  blockCharWoman: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/character_woman.png',
  blockCharWizard: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/character_wizard.png',
  blockCharHorse: '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/character_horse.png',
  // Candy pack — sweets and treats
  candyBlue: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/candyBlue.png',
  candyRed: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/candyRed.png',
  candyGreen: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/candyGreen.png',
  candyYellow: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/candyYellow.png',
  lollipopRed: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/lollipopRed.png',
  lollipopGreen: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/lollipopGreen.png',
  lollipopFruitRed: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/lollipopFruitRed.png',
  lollipopFruitGreen: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/lollipopFruitGreen.png',
  lollipopFruitYellow: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/lollipopFruitYellow.png',
  cherry: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/cherry.png',
  cookieBrown: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/cookieBrown.png',
  cookieChoco: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/cookieChoco.png',
  cookiePink: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/cookiePink.png',
  cupCake: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/cupCake.png',
  heart: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/heart.png',
  canePink: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/canePink.png',
  canePinkSmall: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/canePinkSmall.png',
  waffleChoco: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/waffleChoco.png',
  wafflePink: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/wafflePink.png',
  creamChoco: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/creamChoco.png',
  creamPink: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/creamPink.png',
  gummyWormGreen: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/gummyWormGreenHead.png',
  gummyWormRed: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/gummyWormRedHead.png',
  // New-platformer animals/enemies (idle poses as decorations)
  animalBee: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/bee_rest.png',
  animalFrog: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/frog_idle.png',
  animalLadybug: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/ladybug_rest.png',
  animalSnail: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/snail_rest.png',
  animalMouse: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/mouse_rest.png',
  animalFishBlue: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/fish_blue_rest.png',
  animalFishYellow: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/fish_yellow_rest.png',
  animalWorm: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/worm_normal_rest.png',
  animalFly: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/fly_rest.png',
  // New-platformer characters (idle poses)
  npcGreen: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Characters/Double/character_green_idle.png',
  npcPink: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Characters/Double/character_pink_idle.png',
  npcYellow: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Characters/Double/character_yellow_idle.png',
  npcPurple: '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Characters/Double/character_purple_idle.png',
  // Background-elements decorations
  bgHouse1: '/assets/kenney/kenney_background-elements-redux/PNG/Default/house1.png',
  bgHouse2: '/assets/kenney/kenney_background-elements-redux/PNG/Default/house2.png',
  bgHouseSmall1: '/assets/kenney/kenney_background-elements-redux/PNG/Default/houseSmall1.png',
  bgHouseSmall2: '/assets/kenney/kenney_background-elements-redux/PNG/Default/houseSmall2.png',
  bgCastleSmall: '/assets/kenney/kenney_background-elements-redux/PNG/Default/castleSmall.png',
  bgTower: '/assets/kenney/kenney_background-elements-redux/PNG/Default/tower.png',
  bgTreePine: '/assets/kenney/kenney_background-elements-redux/PNG/Default/treePine.png',
  bgTreePalm: '/assets/kenney/kenney_background-elements-redux/PNG/Default/treePalm.png',
  bgTreeOrange: '/assets/kenney/kenney_background-elements-redux/PNG/Default/treeOrange.png',
  bgTreeFrozen: '/assets/kenney/kenney_background-elements-redux/PNG/Default/treeFrozen.png',
  bgFence: '/assets/kenney/kenney_background-elements-redux/PNG/Default/fence.png',
  bgSun: '/assets/kenney/kenney_background-elements-redux/PNG/Default/sun.png',
  bgMoon: '/assets/kenney/kenney_background-elements-redux/PNG/Default/moon.png',
  bgPyramid: '/assets/kenney/kenney_background-elements-redux/PNG/Default/pyramid.png',
  bgCloud1: '/assets/kenney/kenney_background-elements-redux/PNG/Default/cloud1.png',
  bgCloud2: '/assets/kenney/kenney_background-elements-redux/PNG/Default/cloud2.png',
};

/**
 * 根据相邻格子自动选择正确的道路 tile 图
 * @param {number[][]} grid - 地图数据
 * @param {number} x - 列
 * @param {number} y - 行
 * @returns {string} tile 图路径
 */
export function resolveRoadTile(grid, x, y, groundTiles) {
  const h = grid.length, w = grid[0].length;
  const isRoad = (gx, gy) => gx >= 0 && gy >= 0 && gx < w && gy < h && grid[gy][gx] > 0;
  // Use provided groundTiles or MAZE_ASSETS as default
  const tiles = groundTiles || MAZE_ASSETS;

  const N = isRoad(x, y - 1);
  const S = isRoad(x, y + 1);
  const E = isRoad(x + 1, y);
  const W = isRoad(x - 1, y);
  const count = [N, S, E, W].filter(Boolean).length;

  // 4-way crossing
  if (count >= 4) return tiles.roadCross;
  // T-junctions (3 connections)
  if (count === 3) {
    if (!N) return tiles.splitS;
    if (!S) return tiles.splitN;
    if (!E) return tiles.splitW;
    if (!W) return tiles.splitE;
  }
  // Corners (2 adj perpendicular connections)
  if (count === 2) {
    if (N && E) return tiles.cornerUR;
    if (N && W) return tiles.cornerUL;
    if (S && E) return tiles.cornerLR;
    if (S && W) return tiles.cornerLL;
    if (N && S) return tiles.roadV;
    if (E && W) return tiles.roadH;
  }
  // Dead-ends (1 connection)
  if (count === 1) {
    if (N || S) return tiles.roadV;
    return tiles.roadH;
  }
  // Isolated: default to crossing
  return tiles.roadCross;
}

/* ══════════════════════════════════════
   关卡 1: 小鸭子找水池
   适合 1-3 岁，简单路径
   ══════════════════════════════════════ */
const maze1 = {
  id: 'maze-1',
  name: '🦆 小鸭子找水池',
  desc: '帮小鸭子画出一条路，走到水池去游泳吧！',
  gridW: 20,
  gridH: 12,
  tileSize: 64,
  grid: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  playerStart: { gx: 1, gy: 1 },
  decorations: [
    // 顶部树木带
    { type: 'treePine',  gx: 0,  gy: 0 },
    { type: 'treeRound', gx: 5,  gy: 0 },
    { type: 'treeBig',   gx: 12, gy: 0 },
    { type: 'treePine',  gx: 14, gy: 0 },
    { type: 'treePine',  gx: 19, gy: 0 },
    // 左侧
    { type: 'bush',      gx: 0,  gy: 4 },
    { type: 'flower',    gx: 1,  gy: 4 },
    { type: 'treePine',  gx: 0,  gy: 6 },
    // 中间装饰
    { type: 'bush',      gx: 5,  gy: 2 },
    { type: 'grassTuft', gx: 8,  gy: 4 },
    { type: 'flower',    gx: 6,  gy: 5 },
    { type: 'treePine',  gx: 14, gy: 4 },
    { type: 'bush',      gx: 7,  gy: 6 },
    { type: 'treeRound', gx: 16, gy: 6 },
    // 底部装饰
    { type: 'treeBig',   gx: 0,  gy: 9 },
    { type: 'flower',    gx: 3,  gy: 10 },
    { type: 'bush',      gx: 6,  gy: 10 },
    { type: 'treePine',  gx: 9,  gy: 10 },
    { type: 'grassTuft', gx: 4,  gy: 11 },
    { type: 'treePine',  gx: 12, gy: 10 },
    { type: 'bush',      gx: 15, gy: 10 },
    { type: 'flower',    gx: 18, gy: 10 },
    { type: 'treePine',  gx: 19, gy: 11 },
  ],
  stars: { s3: 35, s2: 50, s1: 80 },
};

/* ── 迷宫关卡导出 ── */
export const MAZE_LEVELS = [maze1];

export function getMazeLevel(id) {
  // Support draft-prefixed IDs: load from localStorage
  if (id && id.startsWith('draft-')) {
    const draftId = id.replace('draft-', '');
    try {
      const drafts = JSON.parse(localStorage.getItem('game_drafts_v1') || '[]');
      const draft = drafts.find(d => d.id === draftId);
      if (draft && draft.levelData) {
        console.log('[getMazeLevel] Loaded draft:', draftId);
        return draft.levelData;
      }
    } catch (e) { console.error('[getMazeLevel] Draft load error:', e); }
    return null;
  }
  return MAZE_LEVELS.find(l => l.id === id);
}

export function getMazeLevels() {
  return MAZE_LEVELS.map(l => ({
    id: l.id,
    name: l.name,
    desc: l.desc,
    stars: 0,
  }));
}
