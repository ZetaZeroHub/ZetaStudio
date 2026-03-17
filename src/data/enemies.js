/* ========================================
   游戏梦想家 — 敌人类型定义
   含HP/远程攻击/属性/行为
   ======================================== */

export const ENEMY_DEFS = {
  // === 基本敌人 ===
  worm: {
    type: 'worm', name: '蠕虫', element: 'grass',
    hp: 2, speed: 0.5, score: 15, patrolDefault: 60,
    color: 0x8BC34A, ageMin: 3,
    behavior: 'crawl',
    width: 20, height: 10,
    ranged: false,
  },
  slime: {
    type: 'slime', name: '史莱姆', element: 'water',
    hp: 3, speed: 0.8, score: 20, patrolDefault: 100,
    color: 0x66BB6A, ageMin: 3,
    behavior: 'patrol',
    width: 28, height: 20,
    ranged: true,
    bulletType: 'slimeBall',    // 慢速黏液球
    bulletSpeed: 2.5,
    bulletGravity: 0.06,
    bulletColor: 0x26A69A,
    bulletSize: 5,
    shootCooldown: 150,         // 射击冷却帧
    shootRange: 200,            // 射击检测范围
  },
  frog: {
    type: 'frog', name: '跳跳蛙', element: 'water',
    hp: 2, speed: 0.3, score: 25, patrolDefault: 40,
    color: 0x26A69A, ageMin: 4,
    behavior: 'jump',
    width: 22, height: 18,
    ranged: false,
  },
  bat: {
    type: 'bat', name: '蝙蝠', element: 'dark',
    hp: 2, speed: 1.2, score: 30, patrolDefault: 120,
    color: 0x7E57C2, ageMin: 5,
    behavior: 'fly',
    width: 30, height: 16, flying: true,
    ranged: true,
    bulletType: 'sonicWave',    // 音波攻击
    bulletSpeed: 3.5,
    bulletGravity: 0,
    bulletColor: 0xCE93D8,
    bulletSize: 4,
    shootCooldown: 120,
    shootRange: 250,
  },
  turtle: {
    type: 'turtle', name: '龟壳兵', element: 'fire',
    hp: 5, speed: 0.6, score: 40, patrolDefault: 80,
    color: 0xD84315, ageMin: 6,
    behavior: 'armor',
    width: 26, height: 18,
    ranged: true,
    bulletType: 'fireSpit',     // 火焰吐息
    bulletSpeed: 4,
    bulletGravity: 0.02,
    bulletColor: 0xFF6B35,
    bulletSize: 6,
    shootCooldown: 100,
    shootRange: 220,
  },
  ghost: {
    type: 'ghost', name: '幽灵', element: 'dark',
    hp: 3, speed: 1.0, score: 35, patrolDefault: 150,
    color: 0x90A4AE, ageMin: 7,
    behavior: 'phase',
    width: 24, height: 28, flying: true,
    ranged: true,
    bulletType: 'shadowOrb',    // 暗影球
    bulletSpeed: 2.0,
    bulletGravity: -0.01,       // 轻微上飘
    bulletColor: 0x546E7A,
    bulletSize: 7,
    shootCooldown: 180,
    shootRange: 300,
  },
};

// ═══ BOSS 定义 ═══
export const BOSS_DEFS = {
  treant: {
    type: 'treant', name: '🌳 树精王', element: 'grass',
    hp: 12, speed: 0.8, score: 200, patrolDefault: 120,
    color: 0x33691E, ageMin: 5,
    behavior: 'charge',
    width: 48, height: 56, isBoss: true,
    attackPattern: 'charge_stomp',
    phaseThresholds: [0.5],
    ranged: true,
    bulletType: 'leafStorm',    // 叶刃风暴
    bulletSpeed: 3,
    bulletGravity: 0.04,
    bulletColor: 0x81C784,
    bulletSize: 5,
    shootCooldown: 90,
    shootRange: 350,
  },
  crab: {
    type: 'crab', name: '🦀 海王蟹', element: 'water',
    hp: 15, speed: 1.0, score: 250, patrolDefault: 150,
    color: 0xD32F2F, ageMin: 5,
    behavior: 'slam',
    width: 52, height: 40, isBoss: true,
    attackPattern: 'jump_slam',
    phaseThresholds: [0.6, 0.3],
    ranged: true,
    bulletType: 'waterJet',     // 水柱喷射
    bulletSpeed: 5,
    bulletGravity: 0.08,
    bulletColor: 0x4FC3F7,
    bulletSize: 5,
    shootCooldown: 80,
    shootRange: 300,
  },
  witch: {
    type: 'witch', name: '🧙 糖果巫师', element: 'dark',
    hp: 10, speed: 1.2, score: 300, patrolDefault: 200,
    color: 0x9C27B0, ageMin: 6,
    behavior: 'teleport',
    width: 36, height: 48, isBoss: true, flying: true,
    attackPattern: 'blink_barrage',
    phaseThresholds: [0.4],
    ranged: true,
    bulletType: 'candyBomb',    // 糖果弹
    bulletSpeed: 3.5,
    bulletGravity: 0.03,
    bulletColor: 0xF48FB1,
    bulletSize: 6,
    shootCooldown: 60,
    shootRange: 400,
  },
  scorpion: {
    type: 'scorpion', name: '🦂 沙漠蝎王', element: 'fire',
    hp: 20, speed: 0.9, score: 400, patrolDefault: 180,
    color: 0xF57F17, ageMin: 7,
    behavior: 'burrow',
    width: 56, height: 44, isBoss: true,
    attackPattern: 'burrow_strike',
    phaseThresholds: [0.7, 0.4, 0.15],
    ranged: true,
    bulletType: 'poisonSting',  // 毒刺连射
    bulletSpeed: 4.5,
    bulletGravity: 0.01,
    bulletColor: 0xAED581,
    bulletSize: 4,
    shootCooldown: 50,
    shootRange: 350,
  },
};

/**
 * Get all enemy types suitable for a given age range
 */
export function getEnemiesForDifficulty(difficulty) {
  const ageMap = { easy: 4, medium: 6, hard: 8 };
  const maxAge = ageMap[difficulty] || 4;
  return Object.values(ENEMY_DEFS).filter(e => e.ageMin <= maxAge);
}

export default ENEMY_DEFS;
