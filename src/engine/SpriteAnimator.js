/* ========================================
   游戏梦想家 — 精灵动画状态机
   基于 PIXI.AnimatedSprite 的角色/敌人动画控制
   ======================================== */

import * as PIXI from 'pixi.js';

/**
 * SpriteAnimator — wraps PIXI.AnimatedSprite with state machine
 *
 * Usage:
 *   const anim = new SpriteAnimator(characterTextures.animations);
 *   stage.addChild(anim.sprite);
 *   anim.setState('walk');
 *   anim.setFacing('left');
 */
export class SpriteAnimator {
  /**
   * @param {Object} animations - { idle: [Texture, ...], walk: [...], jump: [...], ... }
   * @param {Object} opts
   * @param {number} opts.animationSpeed - frames per tick (default 0.12)
   * @param {number} opts.scale - display scale (default 0.5 for 128→64 display)
   * @param {string} opts.defaultState - initial state (default 'idle')
   * @param {boolean} opts.anchorCenter - anchor at center-bottom (default true)
   */
  constructor(animations, opts = {}) {
    this.animations = animations;
    this.currentState = null;

    const speed = opts.animationSpeed ?? 0.12;
    const scale = opts.scale ?? 0.5;
    const defaultState = opts.defaultState ?? 'idle';
    const anchorCenter = opts.anchorCenter ?? true;

    // Find first valid animation to create initial sprite
    const firstAnims = animations[defaultState] || Object.values(animations)[0];
    this.sprite = new PIXI.AnimatedSprite(firstAnims);
    this.sprite.animationSpeed = speed;
    this.sprite.loop = true;

    if (anchorCenter) {
      this.sprite.anchor.set(0.5, 1.0); // center-bottom anchor
    }

    this.sprite.scale.set(scale);
    this.sprite.play();
    this.currentState = defaultState;

    this._facing = 'right';
  }

  /**
   * Switch animation state (only changes if different)
   * @param {string} state - 'idle' | 'walk' | 'jump' | 'duck' | 'hit' | 'climb' | 'fly' | 'rest' etc
   * @param {boolean} loop - whether to loop (default true)
   */
  setState(state, loop = true) {
    if (state === this.currentState) return;
    const frames = this.animations[state];
    if (!frames || frames.length === 0) return;

    this.currentState = state;
    this.sprite.textures = frames;
    this.sprite.loop = loop;
    this.sprite.gotoAndPlay(0);
  }

  /**
   * Set facing direction (flips sprite horizontally)
   * @param {'left' | 'right'} dir
   */
  setFacing(dir) {
    if (dir === this._facing) return;
    this._facing = dir;
    this.sprite.scale.x = dir === 'left'
      ? -Math.abs(this.sprite.scale.x)
      : Math.abs(this.sprite.scale.x);
  }

  /**
   * Set position
   */
  setPosition(x, y) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  /**
   * Set visibility
   */
  setVisible(visible) {
    this.sprite.visible = visible;
  }

  /**
   * Set alpha (for hurt blink etc)
   */
  setAlpha(alpha) {
    this.sprite.alpha = alpha;
  }

  /**
   * Get current facing
   */
  get facing() {
    return this._facing;
  }

  /**
   * Destroy the sprite
   */
  destroy() {
    this.sprite.destroy();
  }
}

/**
 * Create a character SpriteAnimator from loaded character textures
 * @param {Object} charTextures - from loadCharacters()[color]
 * @param {Object} opts - SpriteAnimator options
 */
export function createCharacterAnimator(charTextures, opts = {}) {
  return new SpriteAnimator(charTextures.animations, {
    scale: 0.45,  // 128px → ~58px display
    animationSpeed: 0.12,
    defaultState: 'idle',
    ...opts,
  });
}

/**
 * Create an enemy SpriteAnimator from loaded enemy textures
 * @param {Object} enemyData - from loadEnemies()[type]
 * @param {Object} opts - SpriteAnimator options
 */
export function createEnemyAnimator(enemyData, opts = {}) {
  // Determine default state: walk > fly > move > idle > rest
  const defaultState = enemyData.animations.walk ? 'walk'
    : enemyData.animations.fly ? 'fly'
    : enemyData.animations.move ? 'move'
    : enemyData.animations.idle ? 'idle'
    : 'rest';

  return new SpriteAnimator(enemyData.animations, {
    scale: 0.65,  // 64px → ~42px display
    animationSpeed: 0.08,
    defaultState,
    ...opts,
  });
}

/**
 * Determine character animation state from game state
 * @param {Object} gs - game state with onGround, vx, vy, hurtTimer, inputAttack
 * @returns {string} animation state name
 */
export function getCharacterState(gs) {
  if (gs.hurtTimer > 0) return 'hit';
  if (gs.inputAttack && gs.attackTimer > 5) return 'duck'; // using duck as attack pose
  if (!gs.onGround) return 'jump';
  if (Math.abs(gs.vx) > 0.3) return 'walk';
  return 'idle';
}
