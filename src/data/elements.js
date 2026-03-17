/* ========================================
   游戏梦想家 — 元素克制系统
   ======================================== */

export const ELEMENTS = {
  fire:  { id: 'fire',  name: '火',   color: 0xFF6B35, bubbleColor: 0xFF8A65, icon: '🔥', strong: 'grass', weak: 'water' },
  water: { id: 'water', name: '水',   color: 0x4FC3F7, bubbleColor: 0x81D4FA, icon: '💧', strong: 'fire',  weak: 'grass' },
  grass: { id: 'grass', name: '风',   color: 0x66BB6A, bubbleColor: 0xA5D6A7, icon: '🌿', strong: 'water', weak: 'fire'  },
  light: { id: 'light', name: '光',   color: 0xFFD54F, bubbleColor: 0xFFE082, icon: '⭐', strong: 'dark',  weak: null    },
  none:  { id: 'none',  name: '普通', color: 0x64B5F6, bubbleColor: 0xBBDEFB, icon: '🫧', strong: null,    weak: null    },
};

/**
 * Calculate damage multiplier based on attacker's element vs defender's element
 * @returns {number} 2 = super effective, 1 = normal, 0.5 = not very effective
 */
export function getElementMultiplier(attackElement, defenseElement) {
  if (!attackElement || attackElement === 'none') return 1;
  if (!defenseElement || defenseElement === 'none') return 1;
  const atk = ELEMENTS[attackElement];
  if (!atk) return 1;
  if (atk.strong === defenseElement) return 2;    // 克制
  if (atk.weak === defenseElement) return 0.5;     // 被克制
  return 1;
}

/**
 * Get the default unlocked elements (increases with difficulty)
 */
export function getUnlockedElements(difficulty) {
  switch (difficulty) {
    case 'easy':   return ['none'];                        // 3-4岁: 只有普通泡泡
    case 'medium': return ['none', 'fire', 'water'];       // 5-6岁: 火水
    case 'hard':   return ['none', 'fire', 'water', 'grass', 'light']; // 7-8岁: 全解锁
    default:       return ['none'];
  }
}
