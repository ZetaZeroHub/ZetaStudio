/* ========================================
   游戏梦想家 — 横版冒险关卡数据
   4大中级主题关卡 — Kenney 素材驱动
   含BOSS战 + 旅行商人 + 差异化出生区
   ======================================== */

export const DIFFICULTY = {
  easy: { label: '开放世界探索', icon: '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0198.png', color: '#58CC02', desc: '2.5D俯视角冒险，探索神秘小镇', ageRange: '3-6岁', templateType: 'topdown' },
  medium: { label: '横版闯关冒险', icon: '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0067.png', color: '#FFC800', desc: '经典横版平台跳跃，勇闯四大关卡', ageRange: '5-8岁', templateType: 'platformer' },
};

export const THEMES = {
  forest: {
    name: '森林',
    skyTop: '#87CEEB', skyBottom: '#C8E6C9',
    groundColor: '#4E7A3E', groundDark: '#3D6130',
    platformColor: '#6D4C41', platformTop: '#8D6E63',
    bgMountain: '#81C784', bgTree: '#2E7D32',
  },
  ocean: {
    name: '海洋',
    skyTop: '#4FC3F7', skyBottom: '#B3E5FC',
    groundColor: '#D4A76A', groundDark: '#BA8C50',
    platformColor: '#4DB6AC', platformTop: '#80CBC4',
    bgMountain: '#90CAF9', bgTree: '#0288D1',
  },
  candy: {
    name: '糖果',
    skyTop: '#F8BBD0', skyBottom: '#FCE4EC',
    groundColor: '#EC407A', groundDark: '#C2185B',
    platformColor: '#AB47BC', platformTop: '#CE93D8',
    bgMountain: '#F48FB1', bgTree: '#7B1FA2',
  },
  desert: {
    name: '沙漠',
    skyTop: '#FFB74D', skyBottom: '#FFF3E0',
    groundColor: '#D4A76A', groundDark: '#BF8040',
    platformColor: '#A1887F', platformTop: '#BCAAA4',
    bgMountain: '#FFCC80', bgTree: '#E65100',
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

const mazeLevels = [
  // ═══════════════════════════════════════════════
  // 中级关卡1 — 🌳 森林小径 (教学引导关)
  //
  // 设计理论：心流入门————低挑战+高指引
  // · 出生区：山顶远景，角色从高处缓坡滑下进入森林
  // · 前半段：金币引导路径，教跳跃和攻击
  // · 中段：旅行商人出现（教购买系统）
  // · 末段：BOSS — 树精王（charge冲锋，教闪避）
  // ═══════════════════════════════════════════════
  {
    id: 'medium-1',
    name: '🌳 森林小径',
    difficulty: 'medium',
    theme: 'forest',
    stars: 0,
    worldWidth: 3800,
    worldHeight: 700,
    // ── 独特出生区：高台远眺 ──
    playerStart: { x: 80, y: 300 },
    exitDoor: { x: 3650, y: 400 },
    platforms: [
      // START: High hilltop → slope down (teaches movement)
      { x: 0, y: 350, w: 200 },           // Birth hilltop
      { x: 180, y: 400, w: 150 },         // Step down
      { x: 310, y: 450, w: 200 },         // Another step
      { x: 450, y: 520, w: 600 },         // Main ground starts
      // MID ground
      { x: 1150, y: 520, w: 500 },
      { x: 1800, y: 520, w: 400 },
      // MERCHANT area (wide safe zone)
      { x: 2300, y: 520, w: 400 },
      // BOSS arena (flat, wide)
      { x: 2800, y: 520, w: 1000 },
      // Floating platforms
      { x: 300, y: 340, w: 100 },         // Ledge above start slope
      { x: 600, y: 400, w: 120 },         // Over ground
      { x: 850, y: 340, w: 100 },         // High coin platform
      { x: 1100, y: 440, w: 80 },         // Gap jumper
      { x: 1300, y: 380, w: 130 },        // Mid air
      { x: 1550, y: 310, w: 100 },        // High star
      { x: 1700, y: 440, w: 80 },         // Step to next island
      { x: 1950, y: 370, w: 120 },        // High path
      { x: 2150, y: 300, w: 100 },        // Gem platform
    ],
    items: [
      // Tutorial trail (coins guide downhill — placed 30px above platform surface)
      { type: 'coin', x: 100, y: 310 },     // on birth hilltop (y:350 - 40)
      { type: 'coin', x: 200, y: 310 },     // on birth hilltop
      { type: 'coin', x: 280, y: 360 },     // on step down (y:400 - 40)
      { type: 'coin', x: 380, y: 410 },     // on another step (y:450 - 40)
      { type: 'coin', x: 500, y: 480 },     // on main ground (y:520 - 40)
      { type: 'coin', x: 550, y: 480 },     // on main ground
      // Encouragement cluster
      { type: 'coin', x: 620, y: 360 },
      { type: 'coin', x: 660, y: 360 },
      { type: 'coin', x: 870, y: 300 },
      { type: 'star', x: 1560, y: 270 },
      // Merchant area
      { type: 'heart', x: 2350, y: 480 },
      // High gem reward
      { type: 'gem', x: 2160, y: 260 },
      // 武器弹药补给
      { type: 'weapon_fire', x: 2600, y: 480 },
      { type: 'weapon_fire', x: 2900, y: 480 },
      // BOSS arena items
      { type: 'heart', x: 3000, y: 480 },
      { type: 'heart', x: 3200, y: 480 },
      { type: 'spring', x: 1080, y: 520 },
    ],
    enemies: [
      // Gentle introduction — y=520 = ground surface
      { type: 'worm', x: 700, y: 520, patrolRange: 60 },
      { type: 'slime', x: 1300, y: 520, patrolRange: 100 },
      { type: 'worm', x: 1900, y: 520, patrolRange: 60 },
    ],
    // ── BOSS at end ──
    boss: { type: 'treant', x: 3300, y: 520, patrolRange: 200 },
    // ── 旅行商人 ──
    merchant: { x: 2480, y: 520, name: '🧙‍♂️ 旅行者小秋' },
    mechanisms: [],
    interactables: [
      // 关1 教学关：简单介绍问号砖和推箱子
      { type: 'questionBlock', x: 480, y: 440, w: 32, h: 32, contents: 'coin' },
      { type: 'questionBlock', x: 860, y: 300, w: 32, h: 32, contents: 'heart' },
      // 推箱子到此处可以踏跳上高台拿宝物
      { type: 'pushBox', x: 1050, y: 488, w: 32, h: 32 },
      // 火焰武器拾取点（藏在中段高台上）
      { type: 'questionBlock', x: 1960, y: 330, w: 32, h: 32, contents: 'weapon_fire' },
    ],
    parTime: 90,
    parScore: 350,
  },

  // ═══════════════════════════════════════════════
  // 中级关卡2 — 🏖️ 海滩寻宝 (水坑弹簧挑战)
  //
  // 设计理论：心流递进————加入水坑危险+弹簧操控
  // · 出生区：沙滩洞穴出口，阳光从右射入
  // · 特色：大量水坑+弹簧跳台，节奏明快
  // · 中段：商人藏在高台上（需跳跃到达）
  // · 末段：BOSS — 海王蟹（slam砸地攻击）
  // ═══════════════════════════════════════════════
  {
    id: 'medium-2',
    name: '🏖️ 海滩寻宝',
    difficulty: 'medium',
    theme: 'ocean',
    stars: 0,
    worldWidth: 4000,
    worldHeight: 700,
    // ── 独特出生区：洞穴出口 ──
    playerStart: { x: 60, y: 480 },
    exitDoor: { x: 3850, y: 400 },
    platforms: [
      // START: Cave exit (low ceiling feel → narrow passage)
      { x: 0, y: 520, w: 350 },
      // Beach segments with water between
      { x: 500, y: 520, w: 300 },
      { x: 950, y: 520, w: 350 },
      { x: 1450, y: 520, w: 300 },
      // Mid section — wider
      { x: 1900, y: 520, w: 450 },
      // Merchant high platform area
      { x: 2500, y: 520, w: 350 },
      { x: 2500, y: 350, w: 180 },        // Merchant perch (need spring to reach)
      // BOSS arena
      { x: 3000, y: 520, w: 1000 },
      // Floating coral platforms (stepping stones over water)
      { x: 380, y: 440, w: 80 },          // Over gap 1
      { x: 830, y: 400, w: 100 },         // Over gap 2
      { x: 1330, y: 430, w: 80 },         // Over gap 3
      { x: 1780, y: 390, w: 100 },        // Over gap 4
      // High exploration platforms
      { x: 200, y: 380, w: 100 },
      { x: 600, y: 340, w: 120 },
      { x: 1050, y: 360, w: 100 },
      { x: 1550, y: 310, w: 100 },        // High gem
      { x: 2050, y: 370, w: 120 },
      { x: 2300, y: 290, w: 100 },        // High star
    ],
    items: [
      // Guide across water
      { type: 'coin', x: 400, y: 400 },
      { type: 'coin', x: 850, y: 360 },
      { type: 'coin', x: 1000, y: 480 },
      { type: 'coin', x: 1350, y: 390 },
      // Springs — core mechanic
      { type: 'spring', x: 450, y: 520 },
      { type: 'spring', x: 900, y: 520 },
      { type: 'spring', x: 1400, y: 520 },
      { type: 'spring', x: 2450, y: 520 },   // Launch to merchant
      // Treasures
      { type: 'gem', x: 1560, y: 270 },
      { type: 'star', x: 2310, y: 250 },
      { type: 'star', x: 620, y: 300 },
      // 武器弹药补给
      { type: 'weapon_water', x: 1700, y: 480 },
      { type: 'weapon_water', x: 2200, y: 480 },
      { type: 'weapon_fire', x: 3100, y: 480 },
      // Health for water damage
      { type: 'heart', x: 1100, y: 480 },
      { type: 'heart', x: 2100, y: 480 },
      // BOSS arena
      { type: 'heart', x: 3200, y: 480 },
      { type: 'heart', x: 3500, y: 480 },
    ],
    enemies: [
      // Water-themed enemies — y=520 = ground surface
      { type: 'frog', x: 550, y: 520, patrolRange: 50 },
      { type: 'frog', x: 1500, y: 520, patrolRange: 60 },
      { type: 'slime', x: 1000, y: 520, patrolRange: 80 },
      { type: 'slime', x: 2000, y: 520, patrolRange: 80 },
      { type: 'frog', x: 2600, y: 520, patrolRange: 40 },
    ],
    boss: { type: 'crab', x: 3500, y: 520, patrolRange: 250 },
    merchant: { x: 2570, y: 350, name: '🐚 海螺商人' },  // on platform at y=350
    mechanisms: [
      { type: 'waterPit', x: 360, y: 520, width: 130 },
      { type: 'waterPit', x: 810, y: 520, width: 130 },
      { type: 'waterPit', x: 1310, y: 520, width: 130 },
      { type: 'waterPit', x: 1760, y: 520, width: 130 },
    ],
    interactables: [
      // 关2 海滩：可破砖 + 推箱子过水坑 + 水流武器
      { type: 'breakBlock', x: 620, y: 440, w: 32, h: 32, contents: 'coin' },
      { type: 'breakBlock', x: 652, y: 440, w: 32, h: 32, contents: 'coin' },
      { type: 'breakBlock', x: 684, y: 440, w: 32, h: 32, contents: 'gem' },
      { type: 'pushBox', x: 760, y: 488, w: 32, h: 32 },
      { type: 'questionBlock', x: 1600, y: 380, w: 32, h: 32, contents: 'weapon_water' },
      { type: 'pushBox', x: 2100, y: 488, w: 32, h: 32 },
      { type: 'questionBlock', x: 2800, y: 400, w: 32, h: 32, contents: 'heart' },
    ],
    parTime: 100,
    parScore: 400,
  },

  // ═══════════════════════════════════════════════
  // 中级关卡3 — 🍬 糖果迷城 (传送门谜题)
  //
  // 设计理论：心流巅峰————探索+解谜+战斗三维挑战
  // · 出生区：糖果城堡大门，两扇旗门之间
  // · 特色：传送门网络+钥匙开锁+多层立体探索
  // · 商人藏在传送门背后的秘密房间
  // · 末段：BOSS — 糖果巫师（teleport闪现攻击）
  // ═══════════════════════════════════════════════
  {
    id: 'medium-3',
    name: '🍬 糖果迷城',
    difficulty: 'medium',
    theme: 'candy',
    stars: 0,
    worldWidth: 4200,
    worldHeight: 700,
    // ── 独特出生区：城堡大门 ──
    playerStart: { x: 120, y: 480 },
    exitDoor: { x: 4050, y: 370 },
    platforms: [
      // START: Castle gate (symmetric, grand)
      { x: 0, y: 520, w: 300 },
      { x: 0, y: 380, w: 60 },            // Left gate tower
      { x: 240, y: 380, w: 60 },           // Right gate tower
      // Maze sections
      { x: 400, y: 520, w: 350 },
      { x: 850, y: 520, w: 400 },
      { x: 1350, y: 520, w: 350 },
      { x: 1800, y: 520, w: 400 },
      // Secret room (accessible via portal)
      { x: 2300, y: 520, w: 350 },
      { x: 2300, y: 340, w: 250 },         // Merchant chamber
      // Puzzle corridor
      { x: 2750, y: 520, w: 400 },
      // BOSS arena
      { x: 3250, y: 520, w: 1000 },
      // Multi-level maze platforms
      { x: 100, y: 300, w: 120 },          // Portal A entrance
      { x: 450, y: 400, w: 100 },
      { x: 650, y: 320, w: 120 },          // Key on high
      { x: 900, y: 400, w: 100 },
      { x: 1100, y: 280, w: 130 },         // Portal B entrance
      { x: 1400, y: 380, w: 120 },
      { x: 1650, y: 300, w: 100 },         // Star platform
      { x: 1900, y: 400, w: 120 },
      { x: 2100, y: 300, w: 100 },         // High gem
      { x: 2550, y: 250, w: 100 },         // Super high secret
      { x: 2850, y: 380, w: 120 },
      { x: 3050, y: 290, w: 100 },         // Portal C landing
      { x: 3500, y: 400, w: 150 },         // BOSS approach
    ],
    items: [
      { type: 'coin', x: 470, y: 360 },
      { type: 'coin', x: 510, y: 360 },
      { type: 'key', x: 670, y: 280 },     // Gate key
      { type: 'gem', x: 2110, y: 260 },
      { type: 'gem', x: 2560, y: 210 },    // Secret gem
      { type: 'star', x: 1660, y: 260 },
      { type: 'star', x: 3060, y: 250 },
      { type: 'heart', x: 1420, y: 340 },
      { type: 'heart', x: 2870, y: 340 },
      { type: 'coin', x: 920, y: 360 },
      { type: 'coin', x: 960, y: 360 },
      { type: 'coin', x: 1920, y: 360 },
      { type: 'coin', x: 1960, y: 360 },
      // BOSS arena
      { type: 'heart', x: 3400, y: 480 },
      { type: 'heart', x: 3600, y: 480 },
      { type: 'spring', x: 2200, y: 520 },
      // 武器弹药补给
      { type: 'weapon_fire', x: 1500, y: 480 },
      { type: 'weapon_water', x: 2500, y: 480 },
      { type: 'weapon_fire', x: 3300, y: 480 },
    ],
    enemies: [
      { type: 'bat', x: 500, y: 300, patrolRange: 120 },   // flying
      { type: 'spider', x: 950, y: 520, patrolRange: 80 },
      { type: 'bat', x: 1200, y: 280, patrolRange: 100 },  // flying
      { type: 'spider', x: 1500, y: 520, patrolRange: 60 },
      { type: 'bat', x: 2000, y: 300, patrolRange: 100 },  // flying
      { type: 'slime', x: 2850, y: 520, patrolRange: 80 },
    ],
    boss: { type: 'witch', x: 3700, y: 350, patrolRange: 300 },  // flying boss
    merchant: { x: 2400, y: 300, name: '🍭 糖果先生' },
    mechanisms: [
      // Portal network
      { type: 'portal', x: 140, y: 280, targetX: 2300, targetY: 320, color: 0x7C4DFF },
      { type: 'portal', x: 1140, y: 260, targetX: 3050, targetY: 270, color: 0xFFAB00 },
      // Locked door
      { type: 'lockedDoor', x: 3250, y: 400 },
      // Water pits
      { type: 'waterPit', x: 310, y: 520, width: 80 },
      { type: 'waterPit', x: 1710, y: 520, width: 80 },
    ],
    interactables: [
      // 关3 糖果：推箱子 + 开关 + 可破砖墙
      { type: 'breakBlock', x: 900, y: 440, w: 32, h: 32, contents: 'coin' },
      { type: 'breakBlock', x: 900, y: 408, w: 32, h: 32, contents: 'coin' },
      { type: 'breakBlock', x: 900, y: 376, w: 32, h: 32, contents: 'heart' },
      { type: 'pushBox', x: 1400, y: 488, w: 32, h: 32 },
      { type: 'pushBox', x: 1500, y: 488, w: 32, h: 32 },
      { type: 'switch', x: 1650, y: 500, w: 32, h: 20, spawnPlatform: { x: 1700, y: 380, w: 120 } },
      { type: 'questionBlock', x: 1800, y: 340, w: 32, h: 32, contents: 'star' },
      { type: 'questionBlock', x: 2200, y: 360, w: 32, h: 32, contents: 'coin' },
    ],
    parTime: 130,
    parScore: 500,
  },

  // ═══════════════════════════════════════════════
  // 中级关卡4 — 🏜️ 沙漠绿洲 (终极BOSS战)
  //
  // 设计理论：心流终章————高挑战+高回报
  // · 出生区：绿洲池塘边，远处沙丘起伏
  // · 特色：弹簧连锁跳+空中平台迷宫+全种类敌人
  // · 平台设计：阶梯式上升→高空→快速下降→BOSS战
  // · 商人在安全绿洲区
  // · 末段：BOSS — 沙漠蝎王（burrow钻地追踪）
  // ═══════════════════════════════════════════════
  {
    id: 'medium-4',
    name: '🏜️ 沙漠绿洲',
    difficulty: 'medium',
    theme: 'desert',
    stars: 0,
    worldWidth: 5000,
    worldHeight: 700,
    // ── 独特出生区：绿洲池塘 ──
    playerStart: { x: 100, y: 480 },
    exitDoor: { x: 4850, y: 400 },
    platforms: [
      // START: Oasis (lush, wide, safe)
      { x: 0, y: 520, w: 500 },
      // Phase 1: Rising dunes (ascending staircase)
      { x: 600, y: 520, w: 250 },
      { x: 950, y: 480, w: 200 },          // Rising
      { x: 1250, y: 440, w: 200 },         // Higher
      { x: 1550, y: 400, w: 200 },         // Peak
      // Phase 2: Sky walk (high floating path)
      { x: 1850, y: 360, w: 250 },
      // Phase 3: Merchant oasis (safe wide zone)
      { x: 2200, y: 520, w: 500 },
      // Phase 4: Sprint section (narrow, fast)
      { x: 2850, y: 520, w: 200 },
      { x: 3150, y: 520, w: 200 },
      { x: 3450, y: 520, w: 200 },
      // BOSS arena (wide, flat)
      { x: 3800, y: 520, w: 1200 },
      // ── Meaningful floating platforms ──
      // Phase 1 jump helpers (guide the ascent)
      { x: 520, y: 450, w: 80 },           // Launch pad
      { x: 750, y: 420, w: 80 },           // Step 1
      { x: 870, y: 370, w: 80 },           // Step 2 (gem reward)
      { x: 1100, y: 340, w: 100 },         // Air bridge
      { x: 1400, y: 300, w: 80 },          // High coin cluster
      { x: 1700, y: 280, w: 100 },         // Sky bridge to peak
      // Phase 2 sky platforms (crucial — only way forward)
      { x: 1950, y: 300, w: 60 },          // Narrow step!
      { x: 2060, y: 350, w: 80 },          // Landing
      // Phase 3 gap helpers (between sprint islands)
      { x: 2770, y: 440, w: 80 },          // Over gap
      { x: 3070, y: 440, w: 80 },          // Over gap
      { x: 3370, y: 440, w: 80 },          // Over gap
      // High secrets
      { x: 2400, y: 380, w: 120 },         // Over merchant
      { x: 2600, y: 300, w: 100 },         // Secret gem
      // BOSS arena high platforms (dodge points)
      { x: 4000, y: 380, w: 100 },
      { x: 4300, y: 350, w: 100 },
      { x: 4600, y: 380, w: 100 },
    ],
    items: [
      // Oasis start (generosity before hardship)
      { type: 'coin', x: 150, y: 480 },
      { type: 'coin', x: 200, y: 480 },
      { type: 'coin', x: 250, y: 480 },
      { type: 'coin', x: 300, y: 480 },
      { type: 'heart', x: 400, y: 480 },
      // Rising dunes rewards
      { type: 'gem', x: 880, y: 330 },     // High risk, high reward
      { type: 'coin', x: 1120, y: 300 },
      { type: 'coin', x: 1150, y: 300 },
      { type: 'star', x: 1420, y: 260 },   // Peak star
      { type: 'gem', x: 1710, y: 240 },    // Sky bridge gem
      // Sky walk rewards
      { type: 'coin', x: 1870, y: 320 },
      { type: 'coin', x: 1910, y: 320 },
      // Merchant area (generous)
      { type: 'heart', x: 2300, y: 480 },
      { type: 'star', x: 2420, y: 340 },
      // Secret
      { type: 'gem', x: 2610, y: 260 },
      // Springs (essential for platforming)
      { type: 'spring', x: 540, y: 520 },  // Launch to phase 1
      { type: 'spring', x: 1520, y: 400 }, // On platform at y=400
      { type: 'spring', x: 2790, y: 520 }, // Cross gaps
      { type: 'spring', x: 3090, y: 520 },
      { type: 'spring', x: 3390, y: 520 },
      // BOSS arena health
      { type: 'heart', x: 4000, y: 480 },
      { type: 'heart', x: 4300, y: 480 },
      // 武器弹药补给
      { type: 'weapon_fire', x: 1300, y: 480 },
      { type: 'weapon_fire', x: 2600, y: 480 },
      { type: 'weapon_water', x: 1800, y: 480 },
      { type: 'weapon_water', x: 3600, y: 480 },
      { type: 'heart', x: 4600, y: 480 },
      // Key for exit
      { type: 'key', x: 2610, y: 260 },
    ],
    enemies: [
      // Phase 1: gentle — y matches platform surface
      { type: 'worm', x: 650, y: 520, patrolRange: 60 },
      { type: 'slime', x: 1000, y: 480, patrolRange: 80 },  // platform at y=480
      // Phase 2: sky danger
      { type: 'bat', x: 1600, y: 280, patrolRange: 120 },  // flying
      { type: 'bat', x: 1900, y: 260, patrolRange: 80 },   // flying
      // Phase 3: gauntlet
      { type: 'frog', x: 2900, y: 520, patrolRange: 50 },
      { type: 'turtle', x: 3200, y: 520, patrolRange: 60 },
      { type: 'spider', x: 3500, y: 520, patrolRange: 50 },
      // Pre-BOSS guards
      { type: 'bat', x: 3900, y: 300, patrolRange: 100 },  // flying
      { type: 'slime', x: 4200, y: 520, patrolRange: 80 },
    ],
    boss: { type: 'scorpion', x: 4500, y: 520, patrolRange: 300 },
    merchant: { x: 2450, y: 520, name: '🐪 骆驼商人' },
    mechanisms: [
      // Phase gaps
      { type: 'waterPit', x: 510, y: 520, width: 80 },
      { type: 'waterPit', x: 2710, y: 520, width: 130 },
      { type: 'waterPit', x: 3010, y: 520, width: 130 },
      { type: 'waterPit', x: 3310, y: 520, width: 130 },
      // Shortcut portal (reward for sky walkers)
      { type: 'portal', x: 1950, y: 280, targetX: 3800, targetY: 490, color: 0xFF6D00 },
      // Locked door before BOSS
      { type: 'lockedDoor', x: 3800, y: 400 },
    ],
    interactables: [
      // 关4 沙漠：综合所有机制
      { type: 'breakBlock', x: 300, y: 440, w: 32, h: 32, contents: 'coin' },
      { type: 'breakBlock', x: 332, y: 440, w: 32, h: 32, contents: 'coin' },
      { type: 'pushBox', x: 700, y: 488, w: 32, h: 32 },
      { type: 'pushBox', x: 750, y: 488, w: 32, h: 32 },
      { type: 'questionBlock', x: 1100, y: 380, w: 32, h: 32, contents: 'coin' },
      { type: 'questionBlock', x: 1200, y: 340, w: 32, h: 32, contents: 'star' },
      { type: 'breakBlock', x: 1600, y: 440, w: 32, h: 32, contents: 'heart' },
      { type: 'breakBlock', x: 1600, y: 408, w: 32, h: 32, contents: 'gem' },
      { type: 'breakBlock', x: 1632, y: 440, w: 32, h: 32, contents: 'coin' },
      { type: 'breakBlock', x: 1632, y: 408, w: 32, h: 32, contents: 'coin' },
      { type: 'switch', x: 2000, y: 500, w: 32, h: 20, spawnPlatform: { x: 2100, y: 350, w: 150 } },
      { type: 'pushBox', x: 2050, y: 488, w: 32, h: 32 },
      { type: 'questionBlock', x: 3400, y: 380, w: 32, h: 32, contents: 'heart' },
      { type: 'questionBlock', x: 3500, y: 380, w: 32, h: 32, contents: 'heart' },
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
