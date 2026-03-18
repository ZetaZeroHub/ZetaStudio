/* ========================================
   游戏梦想家 — 横版冒险关卡数据
   4大中级主题关卡 — Kenney 素材驱动
   含BOSS战 + 旅行商人 + 差异化出生区
   ======================================== */

export const DIFFICULTY = {
  medium: { label: '横版闯关冒险', icon: '/assets/kenney/kenney_cursor-pixel-pack/Tiles/tile_0042.png', color: '#FFC800', desc: '经典横版平台跳跃，勇闯四大关卡', ageRange: '5-8岁', templateType: 'platformer' },
  easy: { label: '开放世界探索', icon: '/assets/kenney/kenney_cursor-pixel-pack/Tiles/tile_0043.png', color: '#58CC02', desc: '2.5D俯视角冒险，探索神秘小镇', ageRange: '3-6岁', templateType: 'topdown' },
};

export const THEMES = {
  forest: {
    name: '森林',
    skyTop: '#87CEEB', skyBottom: '#C8E6C9',
    groundColor: '#4E7A3E', groundDark: '#3D6130',
    platformColor: '#6D4C41', platformTop: '#8D6E63',
    bgMountain: '#81C784', bgTree: '#2E7D32',
    background: '/assets/kenney/kenney_background-elements-redux/Backgrounds/backgroundColorForest.png',
  },
  ocean: {
    name: '海洋',
    skyTop: '#4FC3F7', skyBottom: '#B3E5FC',
    groundColor: '#D4A76A', groundDark: '#BA8C50',
    platformColor: '#4DB6AC', platformTop: '#80CBC4',
    bgMountain: '#90CAF9', bgTree: '#0288D1',
    background: '/assets/kenney/kenney_background-elements-redux/Backgrounds/backgroundColorGrass.png',
  },
  candy: {
    name: '糖果',
    skyTop: '#F8BBD0', skyBottom: '#FCE4EC',
    groundColor: '#EC407A', groundDark: '#C2185B',
    platformColor: '#AB47BC', platformTop: '#CE93D8',
    bgMountain: '#F48FB1', bgTree: '#7B1FA2',
    background: '/assets/kenney/kenney_background-elements-redux/Backgrounds/backgroundColorFall.png',
  },
  desert: {
    name: '沙漠',
    skyTop: '#FFB74D', skyBottom: '#FFF3E0',
    groundColor: '#D4A76A', groundDark: '#BF8040',
    platformColor: '#A1887F', platformTop: '#BCAAA4',
    bgMountain: '#FFCC80', bgTree: '#E65100',
    background: '/assets/kenney/kenney_background-elements-redux/Backgrounds/backgroundColorDesert.png',
  },
};

export const ITEM_TYPES = {
  COIN:   { type: 'coin',   label: '金币',   score: 10, color: '#FFD700' },
  STAR:   { type: 'star',   label: '星星',   score: 50, color: '#FF6F00' },
  HEART:  { type: 'heart',  label: '红心',   heal: 1,   color: '#FF1744' },
  KEY:    { type: 'key',    label: '钥匙',   color: '#FFD740' },
  SPRING: { type: 'spring', label: '弹簧',   color: '#76FF03' },
  GEM:    { type: 'gem',    label: '宝石',   score: 100, color: '#2196F3' },
};

// ── 旅行商人道具 ──
export const MERCHANT_ITEMS = [
  { id: 'shield',    name: '护盾',     cost: 2, desc: '抵挡1次伤害', effect: 'shield' },
  { id: 'speed',     name: '疾风靴',    cost: 3, desc: '移速+50%持续15秒', effect: 'speed_boost' },
  { id: 'magnet',    name: '金币磁铁',  cost: 2, desc: '自动吸引附近金币', effect: 'coin_magnet' },
  { id: 'doubleJump', name: '二段跳',   cost: 4, desc: '空中再跳一次', effect: 'double_jump' },
  { id: 'heartUp',   name: '额外生命',  cost: 3, desc: '+1生命值', effect: 'extra_life' },
];

// ── 商人NPC图像 (kenney animal-pack) ──
export const MERCHANT_SPRITES = {
  forest:  '/assets/kenney/kenney_animal-pack/PNG/Round/panda.png',
  ocean:   '/assets/kenney/kenney_animal-pack/PNG/Round/penguin.png',
  candy:   '/assets/kenney/kenney_animal-pack/PNG/Round/rabbit.png',
  desert:  '/assets/kenney/kenney_animal-pack/PNG/Round/elephant.png',
};

const mazeLevels = [
  // ═══════════════════════════════════════════════
  // 中级关卡1 — 🌳 森林小径 (教学引导关)
  // ═══════════════════════════════════════════════
  {
    id: 'medium-1',
    name: '🌳 森林小径',
    difficulty: 'medium',
    theme: 'forest',
    stars: 0,
    worldWidth: 3800,
    worldHeight: 700,
    playerStart: { x: 80, y: 300 },
    exitDoor: { x: 3650, y: 400 },
    platforms: [
      // START: High hilltop → slope down
      { x: 0, y: 350, w: 200, tileId: 'grass_block_top' },
      { x: 180, y: 400, w: 150, tileId: 'grass_block_top' },
      { x: 310, y: 450, w: 200, tileId: 'grass_block_top' },
      { x: 450, y: 520, w: 600, tileId: 'grass_block_top' },
      // MID ground
      { x: 1150, y: 520, w: 500, tileId: 'grass_block_top' },
      { x: 1800, y: 520, w: 400, tileId: 'grass_block_top' },
      // MERCHANT area
      { x: 2300, y: 520, w: 400, tileId: 'grass_block_top' },
      // BOSS arena
      { x: 2800, y: 520, w: 1000, tileId: 'grass_block_top' },
      // Floating platforms
      { x: 300, y: 340, w: 100, tileId: 'grass_cloud' },
      { x: 600, y: 400, w: 120, tileId: 'grass_cloud' },
      { x: 850, y: 340, w: 100, tileId: 'grass_cloud' },
      { x: 1100, y: 440, w: 80, tileId: 'grass_cloud' },
      { x: 1300, y: 380, w: 130, tileId: 'grass_cloud' },
      { x: 1550, y: 310, w: 100, tileId: 'grass_cloud' },
      { x: 1700, y: 440, w: 80, tileId: 'grass_cloud' },
      { x: 1950, y: 370, w: 120, tileId: 'grass_cloud' },
      { x: 2150, y: 300, w: 100, tileId: 'grass_cloud' },
    ],
    items: [
      // Tutorial trail
      { type: 'coin', x: 100, y: 310, tileId: 'coin' },
      { type: 'coin', x: 200, y: 310, tileId: 'coin' },
      { type: 'coin', x: 280, y: 360, tileId: 'coin' },
      { type: 'coin', x: 380, y: 410, tileId: 'coin' },
      { type: 'coin', x: 500, y: 480, tileId: 'coin' },
      { type: 'coin', x: 550, y: 480, tileId: 'coin' },
      // Encouragement cluster
      { type: 'coin', x: 620, y: 360, tileId: 'coin' },
      { type: 'coin', x: 660, y: 360, tileId: 'coin' },
      { type: 'coin', x: 870, y: 300, tileId: 'coin' },
      { type: 'star', x: 1560, y: 270, tileId: 'star' },
      // Merchant area
      { type: 'heart', x: 2350, y: 480, tileId: 'hud_heart' },
      // High gem reward
      { type: 'gem', x: 2160, y: 260, tileId: 'gem_blue' },
      // Weapon pickups
      { type: 'weapon_fire', x: 2600, y: 480 },
      { type: 'weapon_fire', x: 2900, y: 480 },
      // BOSS arena items
      { type: 'heart', x: 3000, y: 480, tileId: 'hud_heart' },
      { type: 'heart', x: 3200, y: 480, tileId: 'hud_heart' },
    ],
    enemies: [
      { type: 'worm', x: 700, y: 520, patrolRange: 60, tileId: 'enemy_c_idle' },
      { type: 'slime', x: 1300, y: 520, patrolRange: 100, tileId: 'enemy_d_idle' },
      { type: 'worm', x: 1900, y: 520, patrolRange: 60, tileId: 'enemy_c_idle' },
    ],
    boss: { type: 'treant', x: 3300, y: 520, patrolRange: 200 },
    merchant: { x: 2480, y: 520, name: '🐼 熊猫商人', sprite: 'forest' },
    mechanisms: [],
    interactables: [
      // 教学关：问号砖 + 推箱子 + 尖刺
      { type: 'questionBlock', x: 480, y: 440, w: 32, h: 32, contents: 'coin', tileId: 'block_exclamation' },
      { type: 'questionBlock', x: 860, y: 300, w: 32, h: 32, contents: 'heart', tileId: 'block_exclamation' },
      { type: 'pushBox', x: 1050, y: 488, w: 32, h: 32, tileId: 'block_brown' },
      { type: 'questionBlock', x: 1960, y: 330, w: 32, h: 32, contents: 'weapon_fire', tileId: 'block_coin' },
      // 教学尖刺
      { type: 'spikes', x: 1080, y: 504, w: 32, h: 16, tileId: 'spikes' },
      // 弹簧
      { type: 'spring', x: 1080, y: 488, w: 32, h: 32, tileId: 'spring' },
    ],
    parTime: 90,
    parScore: 350,
  },

  // ═══════════════════════════════════════════════
  // 中级关卡2 — 🏖️ 海滩寻宝 (水坑弹簧挑战)
  // ═══════════════════════════════════════════════
  {
    id: 'medium-2',
    name: '🏖️ 海滩寻宝',
    difficulty: 'medium',
    theme: 'ocean',
    stars: 0,
    worldWidth: 4000,
    worldHeight: 700,
    playerStart: { x: 60, y: 480 },
    exitDoor: { x: 3850, y: 400 },
    platforms: [
      // START: Cave exit
      { x: 0, y: 520, w: 350, tileId: 'sand_block' },
      // Beach segments
      { x: 500, y: 520, w: 300, tileId: 'sand_block' },
      { x: 950, y: 520, w: 350, tileId: 'sand_block' },
      { x: 1450, y: 520, w: 300, tileId: 'sand_block' },
      // Mid section
      { x: 1900, y: 520, w: 450, tileId: 'sand_block' },
      // Merchant high platform area
      { x: 2500, y: 520, w: 350, tileId: 'sand_block' },
      { x: 2500, y: 350, w: 180, tileId: 'sand_cloud' },
      // BOSS arena
      { x: 3000, y: 520, w: 1000, tileId: 'sand_block' },
      // Floating coral platforms
      { x: 380, y: 440, w: 80, tileId: 'sand_cloud' },
      { x: 830, y: 400, w: 100, tileId: 'sand_cloud' },
      { x: 1330, y: 430, w: 80, tileId: 'sand_cloud' },
      { x: 1780, y: 390, w: 100, tileId: 'sand_cloud' },
      // High exploration platforms
      { x: 200, y: 380, w: 100, tileId: 'sand_cloud' },
      { x: 600, y: 340, w: 120, tileId: 'sand_cloud' },
      { x: 1050, y: 360, w: 100, tileId: 'sand_cloud' },
      { x: 1550, y: 310, w: 100, tileId: 'sand_cloud' },
      { x: 2050, y: 370, w: 120, tileId: 'sand_cloud' },
      { x: 2300, y: 290, w: 100, tileId: 'sand_cloud' },
    ],
    items: [
      // Guide across water
      { type: 'coin', x: 400, y: 400, tileId: 'coin' },
      { type: 'coin', x: 850, y: 360, tileId: 'coin' },
      { type: 'coin', x: 1000, y: 480, tileId: 'coin' },
      { type: 'coin', x: 1350, y: 390, tileId: 'coin' },
      // Treasures
      { type: 'gem', x: 1560, y: 270, tileId: 'gem_blue' },
      { type: 'star', x: 2310, y: 250, tileId: 'star' },
      { type: 'star', x: 620, y: 300, tileId: 'star' },
      // Weapons
      { type: 'weapon_water', x: 1700, y: 480 },
      { type: 'weapon_water', x: 2200, y: 480 },
      { type: 'weapon_fire', x: 3100, y: 480 },
      // Health
      { type: 'heart', x: 1100, y: 480, tileId: 'hud_heart' },
      { type: 'heart', x: 2100, y: 480, tileId: 'hud_heart' },
      { type: 'heart', x: 3200, y: 480, tileId: 'hud_heart' },
      { type: 'heart', x: 3500, y: 480, tileId: 'hud_heart' },
    ],
    enemies: [
      { type: 'frog', x: 550, y: 520, patrolRange: 50, tileId: 'enemy_a_idle' },
      { type: 'frog', x: 1500, y: 520, patrolRange: 60, tileId: 'enemy_a_idle' },
      { type: 'slime', x: 1000, y: 520, patrolRange: 80, tileId: 'enemy_d_idle' },
      { type: 'slime', x: 2000, y: 520, patrolRange: 80, tileId: 'enemy_d_idle' },
      { type: 'frog', x: 2600, y: 520, patrolRange: 40, tileId: 'enemy_a_idle' },
    ],
    boss: { type: 'crab', x: 3500, y: 520, patrolRange: 250 },
    merchant: { x: 2570, y: 350, name: '🐧 企鹅商人', sprite: 'ocean' },
    mechanisms: [],
    interactables: [
      // 水域（编辑器可编辑的水tile）
      { type: 'water_top', x: 360, y: 520, w: 130, h: 32, tileId: 'water_top' },
      { type: 'water', x: 360, y: 552, w: 130, h: 100, tileId: 'water' },
      { type: 'water_top', x: 810, y: 520, w: 130, h: 32, tileId: 'water_top' },
      { type: 'water', x: 810, y: 552, w: 130, h: 100, tileId: 'water' },
      { type: 'water_top', x: 1310, y: 520, w: 130, h: 32, tileId: 'water_top' },
      { type: 'water', x: 1310, y: 552, w: 130, h: 100, tileId: 'water' },
      { type: 'water_top', x: 1760, y: 520, w: 130, h: 32, tileId: 'water_top' },
      { type: 'water', x: 1760, y: 552, w: 130, h: 100, tileId: 'water' },
      // 可破砖 + 推箱子
      { type: 'breakBlock', x: 620, y: 440, w: 32, h: 32, contents: 'coin', tileId: 'brick_brown' },
      { type: 'breakBlock', x: 652, y: 440, w: 32, h: 32, contents: 'coin', tileId: 'brick_brown' },
      { type: 'breakBlock', x: 684, y: 440, w: 32, h: 32, contents: 'gem', tileId: 'brick_brown' },
      { type: 'pushBox', x: 760, y: 488, w: 32, h: 32, tileId: 'block_brown' },
      { type: 'questionBlock', x: 1600, y: 380, w: 32, h: 32, contents: 'weapon_water', tileId: 'block_coin' },
      { type: 'pushBox', x: 2100, y: 488, w: 32, h: 32, tileId: 'block_brown' },
      { type: 'questionBlock', x: 2800, y: 400, w: 32, h: 32, contents: 'heart', tileId: 'block_exclamation' },
      // 弹簧
      { type: 'spring', x: 450, y: 488, w: 32, h: 32, tileId: 'spring' },
      { type: 'spring', x: 900, y: 488, w: 32, h: 32, tileId: 'spring' },
      { type: 'spring', x: 1400, y: 488, w: 32, h: 32, tileId: 'spring' },
      { type: 'spring', x: 2450, y: 488, w: 32, h: 32, tileId: 'spring' },
    ],
    parTime: 100,
    parScore: 400,
  },

  // ═══════════════════════════════════════════════
  // 中级关卡3 — 🍬 糖果迷城 (传送门谜题)
  // ═══════════════════════════════════════════════
  {
    id: 'medium-3',
    name: '🍬 糖果迷城',
    difficulty: 'medium',
    theme: 'candy',
    stars: 0,
    worldWidth: 4200,
    worldHeight: 700,
    playerStart: { x: 120, y: 480 },
    exitDoor: { x: 4050, y: 370 },
    platforms: [
      // START: Castle gate
      { x: 0, y: 520, w: 300, tileId: 'purple_block' },
      { x: 0, y: 380, w: 60, tileId: 'purple_block' },
      { x: 240, y: 380, w: 60, tileId: 'purple_block' },
      // Maze sections
      { x: 400, y: 520, w: 350, tileId: 'purple_block' },
      { x: 850, y: 520, w: 400, tileId: 'purple_block' },
      { x: 1350, y: 520, w: 350, tileId: 'purple_block' },
      { x: 1800, y: 520, w: 400, tileId: 'purple_block' },
      // Secret room
      { x: 2300, y: 520, w: 350, tileId: 'purple_block' },
      { x: 2300, y: 340, w: 250, tileId: 'purple_cloud' },
      // Puzzle corridor
      { x: 2750, y: 520, w: 400, tileId: 'purple_block' },
      // BOSS arena
      { x: 3250, y: 520, w: 1000, tileId: 'purple_block' },
      // Multi-level maze platforms
      { x: 100, y: 300, w: 120, tileId: 'purple_cloud' },
      { x: 450, y: 400, w: 100, tileId: 'purple_cloud' },
      { x: 650, y: 320, w: 120, tileId: 'purple_cloud' },
      { x: 900, y: 400, w: 100, tileId: 'purple_cloud' },
      { x: 1100, y: 280, w: 130, tileId: 'purple_cloud' },
      { x: 1400, y: 380, w: 120, tileId: 'purple_cloud' },
      { x: 1650, y: 300, w: 100, tileId: 'purple_cloud' },
      { x: 1900, y: 400, w: 120, tileId: 'purple_cloud' },
      { x: 2100, y: 300, w: 100, tileId: 'purple_cloud' },
      { x: 2550, y: 250, w: 100, tileId: 'purple_cloud' },
      { x: 2850, y: 380, w: 120, tileId: 'purple_cloud' },
      { x: 3050, y: 290, w: 100, tileId: 'purple_cloud' },
      { x: 3500, y: 400, w: 150, tileId: 'purple_cloud' },
    ],
    items: [
      { type: 'coin', x: 470, y: 360, tileId: 'coin' },
      { type: 'coin', x: 510, y: 360, tileId: 'coin' },
      { type: 'key', x: 670, y: 280, tileId: 'hud_key_blue' },
      { type: 'gem', x: 2110, y: 260, tileId: 'gem_red' },
      { type: 'gem', x: 2560, y: 210, tileId: 'gem_yellow' },
      { type: 'star', x: 1660, y: 260, tileId: 'star' },
      { type: 'star', x: 3060, y: 250, tileId: 'star' },
      { type: 'heart', x: 1420, y: 340, tileId: 'hud_heart' },
      { type: 'heart', x: 2870, y: 340, tileId: 'hud_heart' },
      { type: 'coin', x: 920, y: 360, tileId: 'coin' },
      { type: 'coin', x: 960, y: 360, tileId: 'coin' },
      { type: 'coin', x: 1920, y: 360, tileId: 'coin' },
      { type: 'coin', x: 1960, y: 360, tileId: 'coin' },
      // BOSS arena
      { type: 'heart', x: 3400, y: 480, tileId: 'hud_heart' },
      { type: 'heart', x: 3600, y: 480, tileId: 'hud_heart' },
      // Weapons
      { type: 'weapon_fire', x: 1500, y: 480 },
      { type: 'weapon_water', x: 2500, y: 480 },
      { type: 'weapon_fire', x: 3300, y: 480 },
    ],
    enemies: [
      { type: 'bat', x: 500, y: 300, patrolRange: 120, tileId: 'enemy_b_idle' },
      { type: 'spider', x: 950, y: 520, patrolRange: 80, tileId: 'enemy_e_idle' },
      { type: 'bat', x: 1200, y: 280, patrolRange: 100, tileId: 'enemy_b_idle' },
      { type: 'spider', x: 1500, y: 520, patrolRange: 60, tileId: 'enemy_e_idle' },
      { type: 'bat', x: 2000, y: 300, patrolRange: 100, tileId: 'enemy_b_idle' },
      { type: 'slime', x: 2850, y: 520, patrolRange: 80, tileId: 'enemy_d_idle' },
    ],
    boss: { type: 'witch', x: 3700, y: 350, patrolRange: 300 },
    merchant: { x: 2400, y: 300, name: '🐰 兔子商人', sprite: 'candy' },
    mechanisms: [
      // Portal network
      { type: 'portal', x: 140, y: 280, targetX: 2300, targetY: 320, color: 0x7C4DFF },
      { type: 'portal', x: 1140, y: 260, targetX: 3050, targetY: 270, color: 0xFFAB00 },
    ],
    interactables: [
      // 尖刺陷阱
      { type: 'spikes', x: 400, y: 504, w: 32, h: 16, tileId: 'spikes' },
      { type: 'spikes', x: 432, y: 504, w: 32, h: 16, tileId: 'spikes' },
      // 锁门
      { type: 'lock_blue', x: 3250, y: 488, w: 32, h: 32, tileId: 'lock_blue' },
      // 可破砖墙
      { type: 'breakBlock', x: 900, y: 440, w: 32, h: 32, contents: 'coin', tileId: 'brick_brown' },
      { type: 'breakBlock', x: 900, y: 408, w: 32, h: 32, contents: 'coin', tileId: 'brick_brown' },
      { type: 'breakBlock', x: 900, y: 376, w: 32, h: 32, contents: 'heart', tileId: 'brick_brown' },
      { type: 'pushBox', x: 1400, y: 488, w: 32, h: 32, tileId: 'block_brown' },
      { type: 'pushBox', x: 1500, y: 488, w: 32, h: 32, tileId: 'block_brown' },
      { type: 'switch', x: 1650, y: 500, w: 32, h: 20, spawnPlatform: { x: 1700, y: 380, w: 120 }, tileId: 'switch_blue' },
      { type: 'questionBlock', x: 1800, y: 340, w: 32, h: 32, contents: 'star', tileId: 'block_coin' },
      { type: 'questionBlock', x: 2200, y: 360, w: 32, h: 32, contents: 'coin', tileId: 'block_exclamation' },
      // 弹簧
      { type: 'spring', x: 2200, y: 488, w: 32, h: 32, tileId: 'spring' },
      // 炸弹
      { type: 'bomb', x: 2750, y: 488, w: 32, h: 32, tileId: 'bomb' },
    ],
    parTime: 130,
    parScore: 500,
  },

  // ═══════════════════════════════════════════════
  // 中级关卡4 — 🏜️ 沙漠绿洲 (终极BOSS战)
  // ═══════════════════════════════════════════════
  {
    id: 'medium-4',
    name: '🏜️ 沙漠绿洲',
    difficulty: 'medium',
    theme: 'desert',
    stars: 0,
    worldWidth: 5000,
    worldHeight: 700,
    playerStart: { x: 100, y: 480 },
    exitDoor: { x: 4850, y: 400 },
    platforms: [
      // START: Oasis
      { x: 0, y: 520, w: 500, tileId: 'sand_block' },
      // Phase 1: Rising dunes
      { x: 600, y: 520, w: 250, tileId: 'sand_block' },
      { x: 950, y: 480, w: 200, tileId: 'sand_block' },
      { x: 1250, y: 440, w: 200, tileId: 'sand_block' },
      { x: 1550, y: 400, w: 200, tileId: 'sand_block' },
      // Phase 2: Sky walk
      { x: 1850, y: 360, w: 250, tileId: 'stone_cloud' },
      // Phase 3: Merchant oasis
      { x: 2200, y: 520, w: 500, tileId: 'sand_block' },
      // Phase 4: Sprint section
      { x: 2850, y: 520, w: 200, tileId: 'sand_block' },
      { x: 3150, y: 520, w: 200, tileId: 'sand_block' },
      { x: 3450, y: 520, w: 200, tileId: 'sand_block' },
      // BOSS arena
      { x: 3800, y: 520, w: 1200, tileId: 'sand_block' },
      // Floating platforms
      { x: 520, y: 450, w: 80, tileId: 'sand_cloud' },
      { x: 750, y: 420, w: 80, tileId: 'sand_cloud' },
      { x: 870, y: 370, w: 80, tileId: 'sand_cloud' },
      { x: 1100, y: 340, w: 100, tileId: 'sand_cloud' },
      { x: 1400, y: 300, w: 80, tileId: 'sand_cloud' },
      { x: 1700, y: 280, w: 100, tileId: 'sand_cloud' },
      { x: 1950, y: 300, w: 60, tileId: 'sand_cloud' },
      { x: 2060, y: 350, w: 80, tileId: 'sand_cloud' },
      { x: 2770, y: 440, w: 80, tileId: 'sand_cloud' },
      { x: 3070, y: 440, w: 80, tileId: 'sand_cloud' },
      { x: 3370, y: 440, w: 80, tileId: 'sand_cloud' },
      { x: 2400, y: 380, w: 120, tileId: 'sand_cloud' },
      { x: 2600, y: 300, w: 100, tileId: 'sand_cloud' },
      { x: 4000, y: 380, w: 100, tileId: 'stone_cloud' },
      { x: 4300, y: 350, w: 100, tileId: 'stone_cloud' },
      { x: 4600, y: 380, w: 100, tileId: 'stone_cloud' },
    ],
    items: [
      // Oasis start
      { type: 'coin', x: 150, y: 480, tileId: 'coin' },
      { type: 'coin', x: 200, y: 480, tileId: 'coin' },
      { type: 'coin', x: 250, y: 480, tileId: 'coin' },
      { type: 'coin', x: 300, y: 480, tileId: 'coin' },
      { type: 'heart', x: 400, y: 480, tileId: 'hud_heart' },
      // Rising dunes rewards
      { type: 'gem', x: 880, y: 330, tileId: 'gem_red' },
      { type: 'coin', x: 1120, y: 300, tileId: 'coin' },
      { type: 'coin', x: 1150, y: 300, tileId: 'coin' },
      { type: 'star', x: 1420, y: 260, tileId: 'star' },
      { type: 'gem', x: 1710, y: 240, tileId: 'gem_yellow' },
      // Sky walk rewards
      { type: 'coin', x: 1870, y: 320, tileId: 'coin' },
      { type: 'coin', x: 1910, y: 320, tileId: 'coin' },
      // Merchant area
      { type: 'heart', x: 2300, y: 480, tileId: 'hud_heart' },
      { type: 'star', x: 2420, y: 340, tileId: 'star' },
      // Secret
      { type: 'gem', x: 2610, y: 260, tileId: 'gem_green' },
      // BOSS arena health
      { type: 'heart', x: 4000, y: 480, tileId: 'hud_heart' },
      { type: 'heart', x: 4300, y: 480, tileId: 'hud_heart' },
      // Weapons
      { type: 'weapon_fire', x: 1300, y: 480 },
      { type: 'weapon_fire', x: 2600, y: 480 },
      { type: 'weapon_water', x: 1800, y: 480 },
      { type: 'weapon_water', x: 3600, y: 480 },
      { type: 'heart', x: 4600, y: 480, tileId: 'hud_heart' },
      // Key for exit
      { type: 'key', x: 2610, y: 260, tileId: 'hud_key_red' },
    ],
    enemies: [
      { type: 'worm', x: 650, y: 520, patrolRange: 60, tileId: 'enemy_c_idle' },
      { type: 'slime', x: 1000, y: 480, patrolRange: 80, tileId: 'enemy_d_idle' },
      { type: 'bat', x: 1600, y: 280, patrolRange: 120, tileId: 'enemy_b_idle' },
      { type: 'bat', x: 1900, y: 260, patrolRange: 80, tileId: 'enemy_b_idle' },
      { type: 'frog', x: 2900, y: 520, patrolRange: 50, tileId: 'enemy_a_idle' },
      { type: 'turtle', x: 3200, y: 520, patrolRange: 60, tileId: 'enemy_mushroom_idle' },
      { type: 'spider', x: 3500, y: 520, patrolRange: 50, tileId: 'enemy_e_idle' },
      { type: 'bat', x: 3900, y: 300, patrolRange: 100, tileId: 'enemy_b_idle' },
      { type: 'slime', x: 4200, y: 520, patrolRange: 80, tileId: 'enemy_d_idle' },
    ],
    boss: { type: 'scorpion', x: 4500, y: 520, patrolRange: 300 },
    merchant: { x: 2450, y: 520, name: '🐘 大象商人', sprite: 'desert' },
    mechanisms: [
      // Shortcut portal
      { type: 'portal', x: 1950, y: 280, targetX: 3800, targetY: 490, color: 0xFF6D00 },
    ],
    interactables: [
      // 岩浆池
      { type: 'lava_top', x: 510, y: 520, w: 80, h: 32, tileId: 'lava_top' },
      { type: 'lava', x: 510, y: 552, w: 80, h: 100, tileId: 'lava' },
      // 尖刺区
      { type: 'spikes', x: 2710, y: 504, w: 32, h: 16, tileId: 'spikes' },
      { type: 'spikes', x: 2742, y: 504, w: 32, h: 16, tileId: 'spikes' },
      { type: 'spikes', x: 3010, y: 504, w: 32, h: 16, tileId: 'spikes' },
      { type: 'spikes', x: 3042, y: 504, w: 32, h: 16, tileId: 'spikes' },
      { type: 'spikes', x: 3310, y: 504, w: 32, h: 16, tileId: 'spikes' },
      { type: 'spikes', x: 3342, y: 504, w: 32, h: 16, tileId: 'spikes' },
      // 锁门
      { type: 'lock_red', x: 3800, y: 488, w: 32, h: 32, tileId: 'lock_red' },
      // 可破砖
      { type: 'breakBlock', x: 300, y: 440, w: 32, h: 32, contents: 'coin', tileId: 'brick_brown' },
      { type: 'breakBlock', x: 332, y: 440, w: 32, h: 32, contents: 'coin', tileId: 'brick_brown' },
      { type: 'pushBox', x: 700, y: 488, w: 32, h: 32, tileId: 'block_brown' },
      { type: 'pushBox', x: 750, y: 488, w: 32, h: 32, tileId: 'block_brown' },
      { type: 'questionBlock', x: 1100, y: 380, w: 32, h: 32, contents: 'coin', tileId: 'block_exclamation' },
      { type: 'questionBlock', x: 1200, y: 340, w: 32, h: 32, contents: 'star', tileId: 'block_coin' },
      { type: 'breakBlock', x: 1600, y: 440, w: 32, h: 32, contents: 'heart', tileId: 'brick_brown' },
      { type: 'breakBlock', x: 1600, y: 408, w: 32, h: 32, contents: 'gem', tileId: 'brick_brown' },
      { type: 'breakBlock', x: 1632, y: 440, w: 32, h: 32, contents: 'coin', tileId: 'brick_brown' },
      { type: 'breakBlock', x: 1632, y: 408, w: 32, h: 32, contents: 'coin', tileId: 'brick_brown' },
      { type: 'switch', x: 2000, y: 500, w: 32, h: 20, spawnPlatform: { x: 2100, y: 350, w: 150 }, tileId: 'switch_red' },
      { type: 'pushBox', x: 2050, y: 488, w: 32, h: 32, tileId: 'block_brown' },
      { type: 'questionBlock', x: 3400, y: 380, w: 32, h: 32, contents: 'heart', tileId: 'block_exclamation' },
      { type: 'questionBlock', x: 3500, y: 380, w: 32, h: 32, contents: 'heart', tileId: 'block_exclamation' },
      // 弹簧（用于跨越间隙）
      { type: 'spring', x: 540, y: 488, w: 32, h: 32, tileId: 'spring' },
      { type: 'spring', x: 1520, y: 368, w: 32, h: 32, tileId: 'spring' },
      { type: 'spring', x: 2790, y: 488, w: 32, h: 32, tileId: 'spring' },
      { type: 'spring', x: 3090, y: 488, w: 32, h: 32, tileId: 'spring' },
      { type: 'spring', x: 3390, y: 488, w: 32, h: 32, tileId: 'spring' },
      // 锯齿 (BOSS区域)
      { type: 'saw', x: 4100, y: 488, w: 32, h: 32, tileId: 'saw' },
      { type: 'saw', x: 4400, y: 488, w: 32, h: 32, tileId: 'saw' },
      // 炸弹
      { type: 'bomb', x: 3700, y: 488, w: 32, h: 32, tileId: 'bomb' },
    ],
    parTime: 180,
    parScore: 700,
  },
];

export function getLevelsByDifficulty(difficulty) {
  return mazeLevels.filter(l => l.difficulty === difficulty);
}

export function getLevelById(id) {
  return mazeLevels.find(l => l.id === id);
}

export function getTheme(themeKey) {
  return THEMES[themeKey] || THEMES.forest;
}

export default mazeLevels;
