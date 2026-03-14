/**
 * Preset Asset Library
 * 3D Models: Khronos glTF Sample Assets (CC0 / permissive license)
 * 2D Sprites: AI-generated pixel art (free to use)
 */

// ── 3D Models ──

export const PRESET_MODELS = [
  {
    id: 'duck',
    name: 'Duck',
    nameZh: '鸭子',
    category: 'character',
    categoryZh: '角色',
    path: '/assets/models/duck.glb',
    icon: '🦆',
    tags: ['animal', 'character', 'cute'],
  },
  {
    id: 'fox',
    name: 'Fox',
    nameZh: '狐狸',
    category: 'character',
    categoryZh: '角色',
    path: '/assets/models/fox.glb',
    icon: '🦊',
    tags: ['animal', 'character', 'animated'],
  },
  {
    id: 'cesium_man',
    name: 'Human',
    nameZh: '人物',
    category: 'character',
    categoryZh: '角色',
    path: '/assets/models/cesium_man.glb',
    icon: '🧑',
    tags: ['human', 'character', 'animated'],
  },
  {
    id: 'box',
    name: 'Crate',
    nameZh: '箱子',
    category: 'props',
    categoryZh: '道具',
    path: '/assets/models/box.glb',
    icon: '📦',
    tags: ['box', 'crate', 'prop'],
  },
  {
    id: 'box_animated',
    name: 'Animated Box',
    nameZh: '动态箱',
    category: 'props',
    categoryZh: '道具',
    path: '/assets/models/box_animated.glb',
    icon: '🎁',
    tags: ['box', 'animated', 'prop'],
  },
  {
    id: 'milk_truck',
    name: 'Truck',
    nameZh: '卡车',
    category: 'vehicle',
    categoryZh: '载具',
    path: '/assets/models/milk_truck.glb',
    icon: '🚚',
    tags: ['vehicle', 'truck', 'car'],
  },
];

export const MODEL_CATEGORIES = [
  { key: 'all', name: 'All', nameZh: '全部' },
  { key: 'character', name: 'Characters', nameZh: '角色' },
  { key: 'props', name: 'Props', nameZh: '道具' },
  { key: 'vehicle', name: 'Vehicles', nameZh: '载具' },
];

// ── 2D Sprites ──

export const PRESET_SPRITES = [
  {
    id: 'sprite_coin',
    name: 'Coin',
    nameZh: '金币',
    category: 'item',
    categoryZh: '道具',
    path: '/assets/sprites/coin.png',
    icon: '🪙',
    tags: ['coin', 'gold', 'collectible'],
  },
  {
    id: 'sprite_heart',
    name: 'Heart',
    nameZh: '爱心',
    category: 'item',
    categoryZh: '道具',
    path: '/assets/sprites/heart.png',
    icon: '❤️',
    tags: ['heart', 'health', 'life'],
  },
  {
    id: 'sprite_star',
    name: 'Star',
    nameZh: '星星',
    category: 'item',
    categoryZh: '道具',
    path: '/assets/sprites/star.png',
    icon: '⭐',
    tags: ['star', 'power', 'bonus'],
  },
  {
    id: 'sprite_gem',
    name: 'Gem',
    nameZh: '宝石',
    category: 'item',
    categoryZh: '道具',
    path: '/assets/sprites/gem.png',
    icon: '💎',
    tags: ['gem', 'diamond', 'jewel'],
  },
  {
    id: 'sprite_chest',
    name: 'Chest',
    nameZh: '宝箱',
    category: 'prop',
    categoryZh: '场景',
    path: '/assets/sprites/chest.png',
    icon: '🧰',
    tags: ['chest', 'treasure', 'box'],
  },
  {
    id: 'sprite_tree',
    name: 'Tree',
    nameZh: '树木',
    category: 'prop',
    categoryZh: '场景',
    path: '/assets/sprites/tree.png',
    icon: '🌳',
    tags: ['tree', 'nature', 'environment'],
  },
  {
    id: 'sprite_potion',
    name: 'Potion',
    nameZh: '药水',
    category: 'item',
    categoryZh: '道具',
    path: '/assets/sprites/potion.png',
    icon: '🧪',
    tags: ['potion', 'magic', 'heal'],
  },
  {
    id: 'sprite_key',
    name: 'Key',
    nameZh: '钥匙',
    category: 'item',
    categoryZh: '道具',
    path: '/assets/sprites/key.png',
    icon: '🔑',
    tags: ['key', 'unlock', 'door'],
  },
];

export const SPRITE_CATEGORIES = [
  { key: 'all', name: 'All', nameZh: '全部' },
  { key: 'item', name: 'Items', nameZh: '道具' },
  { key: 'prop', name: 'Scene', nameZh: '场景' },
];

// Default export for backward compatibility
export default PRESET_MODELS;
