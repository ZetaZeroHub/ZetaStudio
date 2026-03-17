/* ========================================
   游戏梦想家 — 物理引擎
   ======================================== */

// Physics constants
export const PHYSICS = {
  GRAVITY: 0.45,
  JUMP_FORCE: -21,
  MOVE_SPEED: 3.5,
  FRICTION: 0.85,
  PLAYER_W: 28,      // Kenney sprite visual width
  PLAYER_H: 56,      // Kenney sprite 128px × scale 0.45 ≈ 58px, use 56 for tight fit
  TERMINAL_VELOCITY: 12,
};

/**
 * Three-tier jump thresholds (in frames of holding jump button)
 * Short press (≤8):  55% force — small hop
 * Medium press (8-18): 80% force — standard jump
 * Long press (≥18):  100% force — maximum height
 */
const JUMP_TIERS = {
  SHORT_THRESHOLD: 8,
  MEDIUM_THRESHOLD: 18,
  SHORT_MULT: 0.55,
  MEDIUM_MULT: 0.80,
  LONG_MULT: 1.0,
};

/**
 * Apply movement from input (with three-tier jump)
 */
export function applyInput(gs, delta) {
  const { MOVE_SPEED, FRICTION, JUMP_FORCE } = PHYSICS;
  if (gs.inputLeft)  { gs.vx -= MOVE_SPEED * 0.3; gs.facing = 'left'; }
  if (gs.inputRight) { gs.vx += MOVE_SPEED * 0.3; gs.facing = 'right'; }
  gs.vx *= FRICTION;
  if (Math.abs(gs.vx) < 0.1) gs.vx = 0;
  gs.vx = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, gs.vx));

  // Three-tier jump: track hold duration
  if (gs.jumpHoldFrames === undefined) gs.jumpHoldFrames = 0;
  if (gs.jumpReleased === undefined) gs.jumpReleased = true;

  if (gs.inputJump) {
    if (gs.onGround && gs.jumpReleased) {
      // Start holding — initial small impulse to leave ground
      gs.vy = JUMP_FORCE * JUMP_TIERS.SHORT_MULT;
      gs.onGround = false;
      gs.jumpHoldFrames = 0;
      gs.jumpReleased = false;
    }
    // While holding in air (and recently jumped), increase jump power
    if (!gs.onGround && !gs.jumpReleased && gs.jumpHoldFrames < JUMP_TIERS.MEDIUM_THRESHOLD) {
      gs.jumpHoldFrames += delta;
      // Boost upward force while holding
      const holdBoost = gs.jumpHoldFrames < JUMP_TIERS.SHORT_THRESHOLD
        ? 0.25  // still in short-jump phase, light boost
        : 0.35; // medium-jump phase, stronger boost
      gs.vy += JUMP_FORCE * holdBoost * 0.02 * delta;
      // Clamp to max jump force
      gs.vy = Math.max(JUMP_FORCE * JUMP_TIERS.LONG_MULT, gs.vy);
    }
  } else {
    // Released jump button
    if (!gs.jumpReleased && !gs.onGround) {
      gs.jumpReleased = true;
      // If released early, dampen upward velocity
      if (gs.jumpHoldFrames < JUMP_TIERS.SHORT_THRESHOLD && gs.vy < 0) {
        gs.vy *= 0.5; // cut short → short hop
      }
    }
    gs.jumpReleased = true;
  }

  // Reset hold frames when landing
  if (gs.onGround) {
    gs.jumpHoldFrames = 0;
  }
}

/**
 * Apply gravity
 */
export function applyGravity(gs, delta) {
  gs.vy += PHYSICS.GRAVITY * delta;
  if (gs.vy > PHYSICS.TERMINAL_VELOCITY) gs.vy = PHYSICS.TERMINAL_VELOCITY;
}

/**
 * Move player X with platform collisions
 */
export function moveX(gs, delta, platforms, worldWidth) {
  const { PLAYER_W, PLAYER_H } = PHYSICS;
  gs.px += gs.vx * delta;
  gs.px = Math.max(10, Math.min(worldWidth - 10, gs.px));

  platforms.forEach(p => {
    const pH = p.h || (p.y >= 500 ? 200 : 16);
    // Character body: top = gs.py - PLAYER_H, bottom = gs.py
    // Platform body: top = p.y, bottom = p.y + pH
    // Vertical overlap check (bottom-anchor)
    const charTop = gs.py - PLAYER_H;
    const charBot = gs.py;
    if (charBot > p.y + 2 && charTop < p.y + pH - 2) {
      if (gs.px + PLAYER_W / 2 > p.x && gs.px - PLAYER_W / 2 < p.x + p.w) {
        const prevX = gs.px - gs.vx * delta;
        if (prevX + PLAYER_W / 2 <= p.x) { gs.px = p.x - PLAYER_W / 2; gs.vx = 0; }
        else if (prevX - PLAYER_W / 2 >= p.x + p.w) { gs.px = p.x + p.w + PLAYER_W / 2; gs.vx = 0; }
      }
    }
  });
}

/**
 * Move player Y with platform collisions
 */
export function moveY(gs, delta, platforms, canvasH) {
  const { PLAYER_W, PLAYER_H } = PHYSICS;
  gs.py += gs.vy * delta;
  gs.onGround = false;

  platforms.forEach(p => {
    const pH = p.h || (p.y >= 500 ? canvasH : 16);
    if (gs.px + PLAYER_W / 2 > p.x + 4 && gs.px - PLAYER_W / 2 < p.x + p.w - 4) {
      // Landing on top — sprite anchor is at bottom center, so gs.py = bottom of character
      if (gs.vy >= 0 && gs.py >= p.y && gs.py <= p.y + 20) {
        gs.py = p.y;
        gs.vy = 0;
        gs.onGround = true;
      } else if (p.y < 500 && gs.vy < 0 && gs.py - PLAYER_H <= p.y + pH && gs.py - PLAYER_H >= p.y) {
        // Head bump on platform from below
        gs.py = p.y + pH + PLAYER_H;
        gs.vy = 1;
      }
    }
  });
}

/**
 * Check fall death
 */
export function checkFallDeath(gs, worldHeight) {
  return gs.py > worldHeight + 100;
}

/**
 * Update camera position
 */
export function updateCamera(gs, W, H, level) {
  const GAME_VIEW_HEIGHT = 320;
  const worldScale = Math.min(H / GAME_VIEW_HEIGHT, 2.5);

  const targetCamX = gs.px - W / (worldScale * 3);
  gs.cameraX += (targetCamX - gs.cameraX) * 0.08;
  gs.cameraX = Math.max(0, Math.min(level.worldWidth - W / worldScale, gs.cameraX));

  const targetCamY = gs.py - GAME_VIEW_HEIGHT * 0.6;
  if (gs.cameraY === undefined) gs.cameraY = targetCamY;
  gs.cameraY += (targetCamY - gs.cameraY) * 0.08;
  gs.cameraY = Math.max(0, Math.min(level.worldHeight - GAME_VIEW_HEIGHT, gs.cameraY));

  return { worldScale, camX: gs.cameraX, camY: gs.cameraY };
}

/* ══════════════════════════════════════
   互动实体系统
   推箱子 / 可破砖块 / 传送门 / 开关
   ══════════════════════════════════════ */

/**
 * Initialize interactable objects from level data
 * Called once at level load
 */
export function initInteractables(level) {
  if (!level.interactables) level.interactables = [];
  return level.interactables.map(def => ({
    ...def,
    alive: true,
    vy: 0,           // for pushable boxes gravity
    vx: 0,
    onGround: false,
    activated: false, // for switches
    timer: 0,         // general timer
    contents: def.contents || null, // what drops from breakable
    linked: def.linked || null,     // linked entity id
  }));
}

/**
 * Update all interactable entities
 * @param {Array} interactables - live interactable state
 * @param {object} gs - game state
 * @param {number} delta - frame delta  
 * @param {Array} platforms - level platforms
 * @param {Function} onDrop - callback(type, x, y) when breakable drops item
 * @param {Function} onTeleport - callback(targetX, targetY) when player uses portal
 */
export function updateInteractables(interactables, gs, delta, platforms, onDrop, onTeleport) {
  const { PLAYER_W, PLAYER_H } = PHYSICS;

  for (const obj of interactables) {
    if (!obj.alive) continue;

    switch (obj.type) {
      // ══════ 推箱子 ══════
      case 'pushBox': {
        const bW = obj.w || 32;
        const bH = obj.h || 32;

        // Gravity for box
        obj.vy += PHYSICS.GRAVITY * delta * 0.6;
        if (obj.vy > 8) obj.vy = 8;
        obj.y += obj.vy * delta;
        obj.onGround = false;

        // Box-platform collision (land on platforms)
        for (const p of platforms) {
          const pH = p.h || (p.y >= 500 ? 200 : 16);
          if (obj.x + bW > p.x + 4 && obj.x < p.x + p.w - 4) {
            if (obj.vy >= 0 && obj.y + bH >= p.y && obj.y + bH <= p.y + 20) {
              obj.y = p.y - bH;
              obj.vy = 0;
              obj.onGround = true;
            }
          }
        }

        // Player pushes box horizontally
        const charLeft = gs.px - PLAYER_W / 2;
        const charRight = gs.px + PLAYER_W / 2;
        const charTop = gs.py - PLAYER_H;
        const charBot = gs.py;

        // Overlap check
        if (charRight > obj.x && charLeft < obj.x + bW &&
            charBot > obj.y + 4 && charTop < obj.y + bH - 4) {
          // Push direction
          if (gs.vx > 0 && charRight > obj.x && charRight < obj.x + bW / 2 + 8) {
            // Push right
            obj.x += gs.vx * delta * 0.6;
            gs.vx *= 0.4; // slow player down while pushing
          } else if (gs.vx < 0 && charLeft < obj.x + bW && charLeft > obj.x + bW / 2 - 8) {
            // Push left
            obj.x += gs.vx * delta * 0.6;
            gs.vx *= 0.4;
          }
          // Prevent overlap
          if (gs.px > obj.x + bW / 2) {
            gs.px = Math.max(gs.px, obj.x + bW + PLAYER_W / 2);
          } else {
            gs.px = Math.min(gs.px, obj.x - PLAYER_W / 2);
          }
        }

        // Box acts as platform for player (stand on top)
        if (gs.vy >= 0 && gs.px + PLAYER_W / 2 > obj.x + 4 && gs.px - PLAYER_W / 2 < obj.x + bW - 4) {
          if (gs.py >= obj.y && gs.py <= obj.y + 10) {
            gs.py = obj.y;
            gs.vy = 0;
            gs.onGround = true;
          }
        }

        // Friction
        obj.vx *= 0.9;
        if (Math.abs(obj.vx) < 0.1) obj.vx = 0;
        obj.x += obj.vx * delta;
        break;
      }

      // ══════ 可破坏砖块 ══════
      case 'breakBlock': {
        const bW = obj.w || 32;
        const bH = obj.h || 32;

        // Player stands on top (acts as platform)
        if (gs.vy >= 0 && gs.px + PLAYER_W / 2 > obj.x + 4 && gs.px - PLAYER_W / 2 < obj.x + bW - 4) {
          if (gs.py >= obj.y && gs.py <= obj.y + 10) {
            gs.py = obj.y;
            gs.vy = 0;
            gs.onGround = true;
          }
        }

        // Head bump from below — break and drop contents
        if (gs.vy < 0) {
          const headY = gs.py - PLAYER_H;
          if (gs.px + PLAYER_W / 2 > obj.x + 4 && gs.px - PLAYER_W / 2 < obj.x + bW - 4) {
            if (headY <= obj.y + bH && headY >= obj.y + bH - 12) {
              // Break!
              gs.vy = 1; // stop upward
              if (obj.contents && onDrop) {
                onDrop(obj.contents, obj.x + bW / 2, obj.y - 10);
              }
              obj.alive = false;
              obj.breakAnim = 20; // animation frames
            }
          }
        }

        // Side collision (wall)
        if (gs.py > obj.y + 4 && gs.py - PLAYER_H < obj.y + bH - 4) {
          if (gs.px + PLAYER_W / 2 > obj.x && gs.px - PLAYER_W / 2 < obj.x + bW) {
            if (gs.vx > 0 && gs.px < obj.x + bW / 2) {
              gs.px = obj.x - PLAYER_W / 2;
              gs.vx = 0;
            } else if (gs.vx < 0 && gs.px > obj.x + bW / 2) {
              gs.px = obj.x + bW + PLAYER_W / 2;
              gs.vx = 0;
            }
          }
        }
        break;
      }

      // ══════ 问号砖块（撞击后变空+掉落物） ══════
      case 'questionBlock': {
        const bW = obj.w || 32;
        const bH = obj.h || 32;

        // Platform behavior on top
        if (gs.vy >= 0 && gs.px + PLAYER_W / 2 > obj.x + 4 && gs.px - PLAYER_W / 2 < obj.x + bW - 4) {
          if (gs.py >= obj.y && gs.py <= obj.y + 10) {
            gs.py = obj.y;
            gs.vy = 0;
            gs.onGround = true;
          }
        }

        // Head bump → activate (only once)
        if (!obj.activated && gs.vy < 0) {
          const headY = gs.py - PLAYER_H;
          if (gs.px + PLAYER_W / 2 > obj.x + 4 && gs.px - PLAYER_W / 2 < obj.x + bW - 4) {
            if (headY <= obj.y + bH && headY >= obj.y + bH - 12) {
              obj.activated = true;
              gs.vy = 1;
              obj.timer = 10; // bounce animation
              if (obj.contents && onDrop) {
                onDrop(obj.contents, obj.x + bW / 2, obj.y - 10);
              }
            }
          }
        }

        // Bounce animation
        if (obj.timer > 0) {
          obj.timer -= delta;
        }

        // Side collision
        if (gs.py > obj.y + 4 && gs.py - PLAYER_H < obj.y + bH - 4) {
          if (gs.px + PLAYER_W / 2 > obj.x && gs.px - PLAYER_W / 2 < obj.x + bW) {
            if (gs.vx > 0 && gs.px < obj.x + bW / 2) {
              gs.px = obj.x - PLAYER_W / 2;
              gs.vx = 0;
            } else if (gs.vx < 0 && gs.px > obj.x + bW / 2) {
              gs.px = obj.x + bW + PLAYER_W / 2;
              gs.vx = 0;
            }
          }
        }
        break;
      }

      // ══════ 传送门 ══════
      case 'portal': {
        obj.timer += delta;
        const dist = Math.sqrt(
          (gs.px - (obj.x + 16)) ** 2 +
          ((gs.py - PLAYER_H / 2) - (obj.y + 16)) ** 2
        );
        if (dist < 30 && obj.targetX !== undefined && onTeleport) {
          onTeleport(obj.targetX, obj.targetY);
        }
        break;
      }

      // ══════ 开关 ══════
      case 'switch': {
        if (obj.activated) break;
        const dist = Math.sqrt(
          (gs.px - (obj.x + 16)) ** 2 +
          ((gs.py - PLAYER_H / 2) - (obj.y + 16)) ** 2
        );
        // Stomp or touch to activate
        if (dist < 28) {
          obj.activated = true;
          // Find linked entity and trigger it
          if (obj.linked) {
            for (const other of interactables) {
              if (other.id === obj.linked) {
                other.triggered = true;
              }
            }
          }
          // Linked platform movement (add platform to level)
          if (obj.spawnPlatform && gs._addPlatform) {
            gs._addPlatform(obj.spawnPlatform);
          }
        }
        break;
      }
    }
  }

  // Remove dead breakable blocks
  return interactables.filter(o => o.alive || o.breakAnim > 0);
}
