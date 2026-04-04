/**
 * artCommunityData.js — 美术资产社区数据
 * 整合 2D/3D 分类 + 精灵图素材复用 + GLB 模型映射
 */

/* ── 风格选项 ── */
export const ART_STYLES = [
  { key: 'realistic', label: '写实', labelEn: 'Realistic' },
  { key: 'pixel', label: '像素', labelEn: 'Pixel Art' },
  { key: 'anime', label: '动漫', labelEn: 'Anime' },
  { key: 'oilpaint', label: '油画', labelEn: 'Oil Painting' },
  { key: 'watercolor', label: '水彩', labelEn: 'Watercolor' },
  { key: 'lowpoly', label: '低面', labelEn: 'Low Poly' },
  { key: 'concept', label: '概念艺术', labelEn: 'Concept Art' },
  { key: 'cartoon', label: '卡通', labelEn: 'Cartoon' },
];

/* ── 尺寸预设 ── */
export const SIZE_PRESETS = [
  { key: '512x512', label: '512×512', w: 512, h: 512 },
  { key: '768x768', label: '768×768', w: 768, h: 768 },
  { key: '1024x1024', label: '1024×1024', w: 1024, h: 1024 },
  { key: '1024x576', label: '1024×576 (16:9)', w: 1024, h: 576 },
  { key: '576x1024', label: '576×1024 (9:16)', w: 576, h: 1024 },
];

/* ── 3D 质量 ── */
export const MODEL_QUALITY = [
  { key: 'standard', label: '标准', labelEn: 'Standard' },
  { key: 'lowpoly', label: '低面数', labelEn: 'Low Poly' },
  { key: 'hd', label: '高精度', labelEn: 'High Detail' },
];

/* ── 骨骼预设姿势 ── */
export const POSE_PRESETS = [
  { key: 'idle', label: '站立', labelEn: 'Idle' },
  { key: 'run', label: '奔跑', labelEn: 'Run' },
  { key: 'jump', label: '跳跃', labelEn: 'Jump' },
  { key: 'attack', label: '攻击', labelEn: 'Attack' },
  { key: 'crouch', label: '蹲下', labelEn: 'Crouch' },
  { key: 'wave', label: '挥手', labelEn: 'Wave' },
];

/* ── 从精灵图编辑器复用的官方 2D 素材 ── */
export const SPRITE_ASSETS = [
  { id: 'sp-knight', name: '铠甲骑士', src: '/sprites/knight_sheet.png', category: '人物',
    prompt: 'Pixel art sprite sheet of an armored knight character, 4x4 grid, idle/walk/attack/hit animations, 32px per frame, white background', likes: 256, downloads: 189, favorites: 134 },
  { id: 'sp-mage', name: '紫袍法师', src: '/sprites/mage_sheet.png', category: '人物',
    prompt: 'Pixel art sprite sheet of a cute female mage with purple robes and staff, 4x4 grid, idle/casting/walking/teleport, 32px, white background', likes: 198, downloads: 156, favorites: 112 },
  { id: 'sp-ninja', name: '暗影忍者', src: '/sprites/ninja_sheet.png', category: '人物',
    prompt: 'Pixel art sprite sheet of a dark ninja character, 4x3 grid, stealth/running/shuriken throw/jump/dodge, 32px, white background', likes: 174, downloads: 143, favorites: 98 },
  { id: 'sp-cat', name: '橘猫', src: '/sprites/cat_sheet.png', category: '动物',
    prompt: 'Pixel art sprite sheet of a cute orange tabby cat, 4x3 grid, sitting/walking/running/sleeping/meowing, 32px, white background', likes: 312, downloads: 267, favorites: 201 },
  { id: 'sp-wolf', name: '灰狼', src: '/sprites/wolf_sheet.png', category: '动物',
    prompt: 'Pixel art sprite sheet of a grey wolf, 4x3 grid, idle/walking/running/howling/attack, 32px, white background', likes: 189, downloads: 145, favorites: 89 },
  { id: 'sp-tree', name: '风中之树', src: '/sprites/tree_wind_sheet.png', category: '场景',
    prompt: 'Pixel art sprite sheet of an oak tree swaying in wind, 4x2 grid, 8 frames breeze cycle, 64px, white background', likes: 267, downloads: 198, favorites: 156 },
  { id: 'sp-campfire', name: '野营篝火', src: '/sprites/campfire_sheet.png', category: '场景',
    prompt: 'Pixel art sprite sheet of a campfire, 4x2 grid, 8 frames flickering fire with embers, 32px, white background', likes: 234, downloads: 178, favorites: 134 },
  { id: 'sp-waterfall', name: '飞流瀑布', src: '/sprites/waterfall_sheet.png', category: '场景',
    prompt: 'Pixel art sprite sheet of a waterfall, 4x2 grid, 8 frames flowing water, 64px, white background', likes: 203, downloads: 165, favorites: 112 },
  { id: 'sp-treasure', name: '魔法宝箱', src: '/sprites/treasure_chest_sheet.png', category: '物品',
    prompt: 'Pixel art sprite sheet of a treasure chest opening with gold coins, 4x2 grid, 8 frames, 32px, white background', likes: 345, downloads: 289, favorites: 223 },
  { id: 'sp-crystal', name: '魔力水晶', src: '/sprites/crystal_sheet.png', category: '物品',
    prompt: 'Pixel art sprite sheet of a glowing crystal gem, 4x2 grid, 8 frames pulsing blue-purple glow, 32px, white background', likes: 278, downloads: 212, favorites: 167 },
  { id: 'sp-flag', name: '王国战旗', src: '/sprites/flag_sheet.png', category: '物品',
    prompt: 'Pixel art sprite sheet of a medieval red banner flag waving in wind, 4x2 grid, 8 frames, 32x64, white background', likes: 156, downloads: 123, favorites: 78 },
];

/* ── 本地 GLB 模型资产 ── */
export const GLB_ASSETS = [
  { id: 'glb-duck', name: '经典黄鸭', file: '/assets/models/duck.glb', category: '展示模型',
    desc: 'Khronos Group 经典 glTF 示例模型，橡皮鸭展示物', vertices: '2.4K', format: 'GLB',
    source: 'Khronos glTF Samples', license: 'CC0', likes: 1567, downloads: 1234, favorites: 890 },
  { id: 'glb-fox', name: '低面狐狸', file: '/assets/models/fox.glb', category: '角色',
    desc: '带骨骼动画的低面数狐狸角色，适合游戏角色原型', vertices: '1.8K', format: 'GLB',
    source: 'glTF Samples', license: 'CC-BY', likes: 2345, downloads: 1890, favorites: 1234 },
  { id: 'glb-cesium', name: '行走人物', file: '/assets/models/cesium_man.glb', category: '角色',
    desc: '带完整行走动画的人物模型，适合动作游戏测试', vertices: '6.3K', format: 'GLB',
    source: 'Cesium / Khronos', license: 'CC-BY', likes: 1890, downloads: 1567, favorites: 978 },
  { id: 'glb-truck', name: '牛奶卡车', file: '/assets/models/milk_truck.glb', category: '载具',
    desc: '复古风格牛奶运送卡车，带材质贴图', vertices: '4.1K', format: 'GLB',
    source: 'glTF Samples', license: 'CC0', likes: 1234, downloads: 978, favorites: 567 },
  { id: 'glb-box', name: '基础立方体', file: '/assets/models/box.glb', category: '基础几何',
    desc: '最简单的 glTF 立方体，适合测试渲染管线', vertices: '36', format: 'GLB',
    source: 'Khronos', license: 'CC0', likes: 456, downloads: 890, favorites: 234 },
  { id: 'glb-boxanim', name: '旋转立方体', file: '/assets/models/box_animated.glb', category: '基础几何',
    desc: '带旋转动画的立方体，测试动画系统', vertices: '36', format: 'GLB',
    source: 'Khronos', license: 'CC0', likes: 567, downloads: 678, favorites: 345 },
  { id: 'glb-avocado', name: '写实牛油果', file: '/assets/models/avocado.glb', category: '物品',
    desc: '高精度 PBR 材质牛油果模型，Metal/Rough 工作流', vertices: '406', format: 'GLB',
    source: 'Microsoft / Khronos', license: 'CC0', likes: 2890, downloads: 2345, favorites: 1678 },
  { id: 'glb-lantern', name: '古典提灯', file: '/assets/models/lantern.glb', category: '物品',
    desc: '精致复古提灯模型，适合中世纪/奇幻场景', vertices: '10.2K', format: 'GLB',
    source: 'Microsoft / Khronos', license: 'CC0', likes: 3456, downloads: 2890, favorites: 2123 },
  { id: 'glb-helmet', name: '战损头盔', file: '/assets/models/damaged_helmet.glb', category: '装备',
    desc: '经典 PBR 战损飞行头盔，法线/粗糙度/金属度贴图', vertices: '14.6K', format: 'GLB',
    source: 'theblueturtle_ / Khronos', license: 'CC-BY', likes: 4123, downloads: 3456, favorites: 2678 },
  { id: 'glb-bottle', name: '水壶', file: '/assets/models/water_bottle.glb', category: '物品',
    desc: '高精度 PBR 不锈钢水壶，金属质感示范', vertices: '13.5K', format: 'GLB',
    source: 'Microsoft / Khronos', license: 'CC0', likes: 1890, downloads: 1567, favorites: 1023 },
];

/* ── 社区 2D 艺术素材 ── */
const PALETTE = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#0d1117', '#161b22', '#21262d',
  '#1b2838', '#2a475e', '#1e3a5f', '#0e4429',
  '#26a641', '#39d353', '#2d333b', '#444c56',
];

export const COMMUNITY_2D_ART = [
  {
    id: 'c2d-001', type: '2d-image', title: '赛博朋克都市夜景', style: 'concept',
    src: '/assets/art-previews/cyberpunk_city.png',
    prompt: 'A stunning cyberpunk city at night, neon lights reflecting on wet streets, holographic billboards, flying cars, ultra detailed',
    author: 'NeonArtist', likes: 1847, favorites: 623, downloads: 412, color: PALETTE[0], createdAt: '2026-03-28',
    tags: ['赛博朋克', '城市', '夜景'],
    comments: [{ user: 'PixelKing', text: '氛围感拉满了！', time: '2h ago' }, { user: 'GameDev42', text: '直接用在我的赛博朋克游戏里', time: '5h ago' }],
  },
  {
    id: 'c2d-002', type: '2d-image', title: '像素风格魔法森林', style: 'pixel',
    src: '/assets/art-previews/pixel_forest.png',
    prompt: 'Pixel art magical forest, glowing mushrooms, fairy lights, ancient trees with mystical aura, 16-bit retro style',
    author: 'RetroPixel', likes: 2103, favorites: 891, downloads: 567, color: PALETTE[11], createdAt: '2026-03-27',
    tags: ['像素', '森林', '魔法'],
    comments: [{ user: 'IndieGamer', text: '太适合做RPG地图了', time: '1d ago' }],
  },
  {
    id: 'c2d-003', type: '2d-image', title: '日式动漫角色立绘', style: 'anime',
    src: '/assets/art-previews/anime_mage.png',
    prompt: 'Anime style character portrait, silver-haired female mage, ornate staff, flowing cape, detailed shading',
    author: 'AnimeDraw', likes: 3456, favorites: 1205, downloads: 823, color: PALETTE[3], createdAt: '2026-03-28',
    tags: ['动漫', '角色', '立绘'],
    comments: [{ user: 'MangaFan', text: '画风好棒！', time: '3h ago' }, { user: 'ArtStudent', text: '配色方案很值得学习', time: '1d ago' }],
  },
  {
    id: 'c2d-004', type: '2d-image', title: '水彩风景·樱花小径', style: 'watercolor',
    src: '/assets/art-previews/watercolor_cherry.png',
    prompt: 'Watercolor painting of a cherry blossom path in spring, petals floating, soft warm light, dreamy atmosphere',
    author: 'WaterLily', likes: 1567, favorites: 734, downloads: 289, color: '#f5e6d3', createdAt: '2026-03-26',
    tags: ['水彩', '风景', '樱花'],
    comments: [{ user: 'ArtLover', text: '好治愈的画风', time: '4h ago' }],
  },
  {
    id: 'c2d-005', type: '2d-image', title: '油画·暴风雨前的海岸', style: 'oilpaint',
    src: '/assets/art-previews/oil_painting_sea.png',
    prompt: 'Oil painting style dramatic seascape, dark storm clouds over rocky coastline, crashing waves, moody lighting',
    author: 'ClassicArt', likes: 1234, favorites: 567, downloads: 334, color: PALETTE[8], createdAt: '2026-03-27',
    tags: ['油画', '海景', '暴风雨'],
    comments: [{ user: 'PainterPro', text: '笔触质感太真实了', time: '8h ago' }],
  },
  {
    id: 'c2d-006', type: '2d-image', title: '卡通风格宠物合集', style: 'cartoon',
    src: '/assets/art-previews/cartoon_pets.png',
    prompt: 'Cute cartoon style pets collection, cat dog bunny hamster, chibi proportions, pastel colors, kawaii',
    author: 'KawaiiLab', likes: 4521, favorites: 2103, downloads: 1456, color: '#f0e0ef', createdAt: '2026-03-28',
    tags: ['卡通', '宠物', '可爱'],
    comments: [{ user: 'PetLover', text: '每一只都想要！', time: '2h ago' }, { user: 'StickerMaker', text: '做成贴纸了', time: '5h ago' }],
  },
  {
    id: 'c2d-007', type: '2d-image', title: '动漫风·机甲战斗场景', style: 'anime',
    src: '/assets/art-previews/anime_mecha.png',
    prompt: 'Anime style mecha battle scene, giant robots fighting in a destroyed city, energy beams, explosions',
    author: 'MechaOtaku', likes: 2345, favorites: 1023, downloads: 678, color: PALETTE[4], createdAt: '2026-03-28',
    tags: ['动漫', '机甲', '战斗'],
    comments: [{ user: 'GundamFan', text: '给力！机甲细节超多', time: '4h ago' }],
  },
  {
    id: 'c2d-008', type: '2d-image', title: '概念艺术·外星丛林', style: 'concept',
    src: '/assets/art-previews/alien_jungle.png',
    prompt: 'Alien jungle concept art, bioluminescent plants, bizarre creatures, thick fog, otherworldly atmosphere',
    author: 'AlienWorlds', likes: 1456, favorites: 623, downloads: 345, color: PALETTE[12], createdAt: '2026-03-24',
    tags: ['概念艺术', '外星', '丛林'],
    comments: [],
  },
  {
    id: 'c2d-009', type: '2d-image', title: '写实风格中世纪城堡', style: 'realistic',
    src: '/assets/art-previews/medieval_castle.png',
    prompt: 'Photorealistic medieval castle on hilltop, dramatic sunset, eagles flying, mist in valley, 4K detail',
    author: 'RealistPro', likes: 1678, favorites: 789, downloads: 456, color: PALETTE[9], createdAt: '2026-03-25',
    tags: ['写实', '城堡', '中世纪'],
    comments: [{ user: 'HistoryBuff', text: '像真的一样', time: '6h ago' }],
  },
  {
    id: 'c2d-010', type: '2d-image', title: '游戏UI套件·科幻风', style: 'concept',
    src: '/assets/art-previews/scifi_game_ui.png',
    prompt: 'Sci-fi game UI kit, health bars progress bars buttons menus, holographic style, blue cyan glow',
    author: 'UIForge', likes: 3210, favorites: 1890, downloads: 2678, color: PALETTE[2], createdAt: '2026-03-27',
    tags: ['UI', '科幻', '游戏'],
    comments: [{ user: 'UXDesigner', text: '终于不用自己画UI了', time: '4h ago' }],
  },
  {
    id: 'c2d-011', type: '2d-image', title: '水彩·日系小镇街道', style: 'watercolor',
    src: '/assets/art-previews/japanese_town.png',
    prompt: 'Watercolor Japanese small town street, traditional houses, lanterns, autumn leaves, peaceful morning',
    author: 'JapanSketch', likes: 1890, favorites: 845, downloads: 523, color: '#e8d5c4', createdAt: '2026-03-27',
    tags: ['水彩', '日本', '街道'],
    comments: [{ user: 'TravelBug', text: '好想去这种地方住', time: '3h ago' }],
  },
  {
    id: 'c2d-012', type: '2d-image', title: '像素·地下城地图集', style: 'pixel',
    src: '/assets/art-previews/pixel_dungeon.png',
    prompt: 'Pixel art dungeon tileset, stone walls torches doors treasure chests, top-down RPG tiles, 32px grid',
    author: 'DungeonMaster', likes: 5678, favorites: 3456, downloads: 4123, color: PALETTE[6], createdAt: '2026-03-28',
    tags: ['像素', '地下城', '地图'],
    comments: [{ user: 'RPGMaker', text: '史诗级素材包', time: '30m ago' }, { user: 'IndieStudio', text: '省了我们团队一周工作量', time: '2h ago' }],
  },
];

/* ── 合并精灵图为社区条目 ── */
export const COMMUNITY_SPRITES = SPRITE_ASSETS.map(sp => ({
  id: `comm-${sp.id}`,
  type: '2d-sprite',
  title: sp.name,
  prompt: sp.prompt,
  style: 'pixel',
  author: '官方素材库',
  authorTag: 'official',
  src: sp.src,
  likes: sp.likes,
  favorites: sp.favorites,
  downloads: sp.downloads,
  color: null, // has real image
  createdAt: '2026-03-20',
  category: sp.category,
  tags: ['精灵图', sp.category, '像素'],
  comments: [],
}));

/* ── 合并 GLB 为社区条目 ── */
export const COMMUNITY_3D = GLB_ASSETS.map(m => ({
  id: `comm-${m.id}`,
  type: '3d',
  title: m.name,
  prompt: m.desc,
  style: 'lowpoly',
  author: m.source,
  authorTag: 'official',
  file: m.file,
  vertices: m.vertices,
  format: m.format,
  license: m.license,
  likes: m.likes,
  favorites: m.favorites,
  downloads: m.downloads,
  color: PALETTE[GLB_ASSETS.indexOf(m) % PALETTE.length],
  createdAt: '2026-03-25',
  category: m.category,
  tags: ['3D', m.category, m.format],
  comments: [],
}));

/* ── 全部社区数据合并 ── */
export const COMMUNITY_ASSETS = [
  ...COMMUNITY_2D_ART,
  ...COMMUNITY_SPRITES,
  ...COMMUNITY_3D,
];

/* ── 社区筛选选项 ── */
export const COMMUNITY_CATEGORIES = [
  { key: 'all', label: '全部', labelEn: 'All' },
  { key: '2d-image', label: '2D 图像', labelEn: '2D Art' },
  { key: '2d-sprite', label: '精灵图', labelEn: 'Sprites' },
  { key: '3d', label: '3D 模型', labelEn: '3D Models' },
];

export const SORT_OPTIONS = [
  { key: 'hot', label: '最热', labelEn: 'Hot' },
  { key: 'newest', label: '最新', labelEn: 'Newest' },
  { key: 'favorites', label: '收藏最多', labelEn: 'Most Favorited' },
  { key: 'downloads', label: '下载最多', labelEn: 'Most Downloaded' },
];
