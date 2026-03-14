/**
 * 行为引擎 (Behavior Engine)
 * 将 elements 上的 behaviors[] 转化为运行时逻辑
 * 支持：键盘控制、碰撞检测、定时器、点击事件、物理重力
 */

// 运行时状态
let activeKeys = {};
let intervals = [];
let listeners = [];
let tickerCallbacks = [];

/**
 * 绑定所有 behaviors 并启动
 */
export function bindBehaviors(app, elements, pixiMap, variables, onVariableChange) {
  // 清除旧绑定
  cleanup();

  // 键盘监听
  const keydown = (e) => { activeKeys[e.key] = true; };
  const keyup = (e) => { activeKeys[e.key] = false; };
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  listeners.push({ type: 'keydown', fn: keydown });
  listeners.push({ type: 'keyup', fn: keyup });

  // 收集所有需要 ticker 处理的行为
  const tickerBehaviors = [];
  const collisionRules = [];
  const timerEvents = [];

  for (const el of elements) {
    if (!el.behaviors || el.behaviors.length === 0) continue;
    const pixiObj = pixiMap.get(el.id);
    if (!pixiObj) continue;

    for (const beh of el.behaviors) {
      switch (beh.trigger) {
        case 'keyboard':
          tickerBehaviors.push({ el, pixiObj, beh });
          break;
        case 'collision':
          collisionRules.push({ el, pixiObj, beh });
          break;
        case 'timer':
          timerEvents.push({ el, pixiObj, beh });
          break;
        case 'click':
          setupClickBehavior(pixiObj, beh, variables, onVariableChange);
          break;
        case 'physics':
          tickerBehaviors.push({ el, pixiObj, beh });
          break;
        default:
          break;
      }
    }
  }

  // Setup timers
  for (const { el, pixiObj, beh } of timerEvents) {
    const id = setInterval(() => {
      executeBehaviorAction(beh, pixiObj, el, elements, pixiMap, variables, onVariableChange, app);
    }, beh.interval || 1000);
    intervals.push(id);
  }

  // Main ticker callback
  const mainTicker = (ticker) => {
    const dt = ticker.deltaTime;

    // Process keyboard behaviors
    for (const { el, pixiObj, beh } of tickerBehaviors) {
      if (beh.trigger === 'keyboard') {
        if (activeKeys[beh.key]) {
          applyKeyboardAction(beh, pixiObj, dt);
        }
      }
      if (beh.trigger === 'physics') {
        applyPhysics(el, pixiObj, dt);
      }
    }

    // Process collision rules
    for (const { el, pixiObj, beh } of collisionRules) {
      const targets = findCollisionTargets(beh.target, elements, pixiMap);
      for (const { targetEl, targetObj } of targets) {
        if (testAABB(pixiObj, targetObj)) {
          executeBehaviorAction(beh, pixiObj, el, elements, pixiMap, variables, onVariableChange, app);
          // Mark for removal if action is 'destroy'
          if (beh.action === 'destroy' || beh.action === 'destroyBoth') {
            break;
          }
        }
      }
    }

    // Update variable-bound texts
    for (const el of elements) {
      if (el.dataBinding) {
        const obj = pixiMap.get(el.id);
        if (obj && obj instanceof PIXI.Text) {
          const varName = el.dataBinding.variable;
          const prefix = el.dataBinding.prefix || '';
          const val = variables[varName] !== undefined ? variables[varName] : 0;
          obj.text = prefix + val;
        }
      }
    }
  };

  app.ticker.add(mainTicker);
  tickerCallbacks.push(mainTicker);
}

import * as PIXI from 'pixi.js';

/**
 * AABB 碰撞检测
 */
function testAABB(obj1, obj2) {
  if (!obj1 || !obj2 || !obj1.parent || !obj2.parent) return false;
  try {
    const b1 = obj1.getBounds();
    const b2 = obj2.getBounds();
    return (
      b1.x < b2.x + b2.width &&
      b1.x + b1.width > b2.x &&
      b1.y < b2.y + b2.height &&
      b1.y + b1.height > b2.y
    );
  } catch {
    return false;
  }
}

/**
 * 键盘控制动作
 */
function applyKeyboardAction(beh, obj, dt) {
  const speed = (beh.params?.speed || 5) * dt;
  switch (beh.action) {
    case 'move':
      if (beh.params?.axis === 'x') obj.x += speed;
      if (beh.params?.axis === 'y') obj.y += speed;
      break;
    case 'jump':
      if (obj.__vy === undefined) obj.__vy = 0;
      if (obj.__onGround) {
        obj.__vy = beh.params?.force || -10;
        obj.__onGround = false;
      }
      break;
    case 'shoot': {
      // Spawn a bullet
      if (!obj.__lastShot || Date.now() - obj.__lastShot > (beh.params?.cooldown || 200)) {
        obj.__lastShot = Date.now();
        // Emit event for game to handle
        obj.__pendingShoot = true;
      }
      break;
    }
    default:
      break;
  }
}

/**
 * 物理模拟(重力)
 */
function applyPhysics(el, obj, dt) {
  const physics = el.physics || {};
  const gravity = physics.gravity || 0;

  if (obj.__vy === undefined) obj.__vy = physics.velocityY || 0;
  if (obj.__vx === undefined) obj.__vx = physics.velocityX || 0;

  obj.__vy += gravity * dt;
  obj.x += obj.__vx * dt;
  obj.y += obj.__vy * dt;

  // Ground check (simple floor at y=540)
  const floorY = physics.floorY || 540;
  if (obj.y >= floorY) {
    obj.y = floorY;
    obj.__vy = 0;
    obj.__onGround = true;
  }

  // Boundaries
  obj.x = Math.max(20, Math.min(780, obj.x));
}

/**
 * 点击行为
 */
function setupClickBehavior(obj, beh, variables, onVariableChange) {
  obj.eventMode = 'static';
  obj.cursor = 'pointer';
  obj.on('pointerdown', () => {
    if (beh.action === 'addScore') {
      const varName = beh.params?.variable || 'score';
      const amount = beh.params?.amount || 1;
      variables[varName] = (variables[varName] || 0) + amount;
      if (onVariableChange) onVariableChange(varName, variables[varName]);
    }
    if (beh.action === 'navigate') {
      // Navigate to a dialog node or scene
    }
  });
}

/**
 * 执行行为动作
 */
function executeBehaviorAction(beh, obj, el, elements, pixiMap, variables, onVariableChange, app) {
  switch (beh.action) {
    case 'addScore': {
      const varName = beh.params?.variable || 'score';
      const amount = beh.params?.amount || 10;
      variables[varName] = (variables[varName] || 0) + amount;
      if (onVariableChange) onVariableChange(varName, variables[varName]);
      break;
    }
    case 'destroy': {
      if (obj.parent) {
        obj.parent.removeChild(obj);
        pixiMap.delete(el.id);
      }
      break;
    }
    case 'destroyBoth': {
      // Destroy self
      if (obj.parent) {
        obj.parent.removeChild(obj);
        pixiMap.delete(el.id);
      }
      break;
    }
    case 'spawn': {
      // Spawn a new element from template
      const templateId = beh.params?.templateId;
      const template = elements.find(e => e.id === templateId);
      if (template) {
        const spawnEl = {
          ...template,
          id: `${template.id}_${Date.now()}`,
          transform: {
            ...template.transform,
            x: beh.params?.spawnX ?? (Math.random() * 760 + 20),
            y: beh.params?.spawnY ?? -20,
          },
        };
        // Would need to add to elements and re-render
      }
      break;
    }
    case 'subtractHP': {
      const varName = beh.params?.variable || 'hp';
      const amount = beh.params?.amount || 1;
      variables[varName] = Math.max(0, (variables[varName] || 0) - amount);
      if (onVariableChange) onVariableChange(varName, variables[varName]);
      break;
    }
    default:
      break;
  }
}

/**
 * 找碰撞目标对象
 */
function findCollisionTargets(targetPattern, elements, pixiMap) {
  const results = [];
  if (!targetPattern) return results;

  for (const el of elements) {
    // Match by pattern: exact id or wildcard prefix
    if (targetPattern.endsWith('*')) {
      const prefix = targetPattern.slice(0, -1);
      if (el.id.startsWith(prefix)) {
        const obj = pixiMap.get(el.id);
        if (obj) results.push({ targetEl: el, targetObj: obj });
      }
    } else if (el.id === targetPattern || el.name === targetPattern) {
      const obj = pixiMap.get(el.id);
      if (obj) results.push({ targetEl: el, targetObj: obj });
    }
  }
  return results;
}

/**
 * 清除所有运行时绑定
 */
export function cleanup() {
  intervals.forEach(clearInterval);
  intervals = [];
  listeners.forEach(({ type, fn }) => window.removeEventListener(type, fn));
  listeners = [];
  activeKeys = {};
  tickerCallbacks = [];
}
