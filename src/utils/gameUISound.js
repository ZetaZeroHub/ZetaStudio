/* ========================================
   gameUISound — Kenney UI Pack 音效工具
   统一管理所有界面交互音效
   ======================================== */

const SOUND_BASE = '/assets/kenney/kenney_ui-pack/Sounds/';

// Audio cache to avoid re-creating
const audioCache = {};

function getAudio(file) {
  if (!audioCache[file]) {
    audioCache[file] = new Audio(SOUND_BASE + file);
    audioCache[file].volume = 0.4;
  }
  return audioCache[file];
}

function playSound(file) {
  try {
    const audio = getAudio(file);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (_) {}
}

/** 按钮点击音效 */
export function playClickSound() { playSound('click-a.ogg'); }

/** 卡片/选项选中音效 */
export function playSelectSound() { playSound('click-b.ogg'); }

/** 切换/滑动音效 */
export function playSwitchSound() { playSound('switch-a.ogg'); }

/** 轻触音效 */
export function playTapSound() { playSound('tap-a.ogg'); }

/** 返回音效 */
export function playBackSound() { playSound('tap-b.ogg'); }

/** 确认/成功音效 */
export function playConfirmSound() { playSound('switch-b.ogg'); }
