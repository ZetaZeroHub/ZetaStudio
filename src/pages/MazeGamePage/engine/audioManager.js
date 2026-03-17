/* ========================================
   游戏梦想家 — 音效管理器
   Web Audio API 音效播放与缓存
   ======================================== */

const audioCache = {};
let audioContext = null;
let masterVolume = 0.5;

/**
 * Get or create AudioContext (lazy init on first user gesture)
 */
function getContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Load and cache an audio buffer
 */
async function loadBuffer(url) {
  if (audioCache[url]) return audioCache[url];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const ctx = getContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    audioCache[url] = audioBuffer;
    return audioBuffer;
  } catch (e) {
    console.warn(`[AudioManager] Failed to load: ${url}`, e);
    return null;
  }
}

/**
 * Play a sound effect
 * @param {string} id - sound ID from SOUNDS map
 * @param {number} volume - volume multiplier (0-1)
 * @returns {AudioBufferSourceNode|null}
 */
export function playSound(id, volume = 1.0) {
  const url = SOUNDS[id];
  if (!url) return null;

  const ctx = getContext();
  const buffer = audioCache[url];
  if (!buffer) {
    // Load async and play when ready
    loadBuffer(url).then(buf => {
      if (buf) _playBuffer(ctx, buf, volume);
    });
    return null;
  }
  return _playBuffer(ctx, buffer, volume);
}

function _playBuffer(ctx, buffer, volume) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gainNode = ctx.createGain();
  gainNode.gain.value = masterVolume * volume;
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start(0);
  return source;
}

/**
 * Preload essential sounds
 */
export async function preloadSounds() {
  const essentialSounds = [
    'jump', 'coin', 'hurt', 'shoot', 'spring',
    'shopOpen', 'buy', 'click', 'powerUp'
  ];
  await Promise.all(
    essentialSounds.map(id => {
      const url = SOUNDS[id];
      return url ? loadBuffer(url) : Promise.resolve();
    })
  );
}

/**
 * Set master volume
 */
export function setMasterVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v));
}

/**
 * Sound effect mapping — Kenney audio assets
 */
const BASE = '/assets/kenney/audio';
export const SOUNDS = {
  // Player actions
  jump:      `${BASE}/kenney_digital-audio/Audio/phaseJump1.ogg`,
  land:      `${BASE}/kenney_impact-sounds/Audio/footstep_concrete_000.ogg`,
  shoot:     `${BASE}/kenney_digital-audio/Audio/laser1.ogg`,
  hurt:      `${BASE}/kenney_impact-sounds/Audio/impactGeneric_light_000.ogg`,
  die:       `${BASE}/kenney_music-jingles/Audio/Hit jingles/jingles_HIT15.ogg`,

  // Collectibles
  coin:      `${BASE}/kenney_digital-audio/Audio/pepSound1.ogg`,
  gem:       `${BASE}/kenney_digital-audio/Audio/powerUp4.ogg`,
  star:      `${BASE}/kenney_digital-audio/Audio/powerUp2.ogg`,
  heart:     `${BASE}/kenney_digital-audio/Audio/powerUp7.ogg`,
  key:       `${BASE}/kenney_rpg-audio/Audio/metalLatch.ogg`,
  spring:    `${BASE}/kenney_digital-audio/Audio/phaseJump4.ogg`,

  // Merchant / shop
  shopOpen:  `${BASE}/kenney_rpg-audio/Audio/doorOpen_1.ogg`,
  shopClose: `${BASE}/kenney_rpg-audio/Audio/doorClose_1.ogg`,
  buy:       `${BASE}/kenney_rpg-audio/Audio/handleCoins.ogg`,
  noBuy:     `${BASE}/kenney_digital-audio/Audio/lowDown.ogg`,

  // UI
  click:     `${BASE}/kenney_ui-audio/Audio/click1.ogg`,
  powerUp:   `${BASE}/kenney_digital-audio/Audio/powerUp1.ogg`,

  // Events
  bossAppear: `${BASE}/kenney_music-jingles/Audio/8-Bit jingles/jingles_NES10.ogg`,
  levelWin:   `${BASE}/kenney_music-jingles/Audio/Pizzicato jingles/jingles_PIZZI11.ogg`,
  levelLose:  `${BASE}/kenney_music-jingles/Audio/Hit jingles/jingles_HIT08.ogg`,

  // Enemy
  enemyHit:   `${BASE}/kenney_impact-sounds/Audio/impactPlate_light_000.ogg`,
  enemyDie:   `${BASE}/kenney_digital-audio/Audio/zap1.ogg`,
};
