/**
 * PixiJS 声明式渲染引擎
 * 读取 elements[] 数据 → 创建/更新 PixiJS 对象 → 实时渲染
 */
import * as PIXI from 'pixi.js';

// PixiJS 对象缓存 (element.id → PIXI DisplayObject)
let pixiObjectMap = new Map();

/**
 * 从 elements 数组渲染整个场景
 */
export function renderAll(app, elements, variables = {}, editMode = false) {
  // 清除旧对象
  destroyAll(app);
  pixiObjectMap = new Map();

  // 按 depth 排序
  const sorted = [...elements]
    .sort((a, b) => (a.transform?.depth || 0) - (b.transform?.depth || 0));

  for (const el of sorted) {
    // Skip non-visual elements (events and data are logical only)
    if (el.category === 'event' || el.category === 'data') continue;

    const pixiObj = createElement(el, variables);
    if (pixiObj) {
      // 保证 Pixi 对象本身的可见性与数据同步
      pixiObj.visible = el.visible !== false;
      
      // 编辑模式下启用交互
      if (editMode) {
        pixiObj.eventMode = 'static';
        pixiObj.cursor = 'pointer';
        // 存储元素 ID 以便点击识别
        pixiObj.__elementId = el.id;
      }
      app.stage.addChild(pixiObj);
      pixiObjectMap.set(el.id, pixiObj);
    }
  }

  return pixiObjectMap;
}

/**
 * 销毁所有 PixiJS 对象
 */
export function destroyAll(app) {
  if (!app || !app.stage) return;
  while (app.stage.children.length > 0) {
    const child = app.stage.children[0];
    app.stage.removeChild(child);
    try { child.destroy({ children: true }); } catch (e) { /* ignore */ }
  }
  pixiObjectMap.clear();
}

/**
 * 获取 PixiJS 对象映射
 */
export function getPixiObjectMap() {
  return pixiObjectMap;
}

/**
 * 局部同步 Elements，不销毁整个应用
 */
export function syncElements(app, elements, variables = {}, editMode = false) {
  if (!app || !app.stage) return pixiObjectMap;
  
  const currentIds = new Set(elements.map(e => e.id));
  
  // 1. Remove deleted
  for (const [id, obj] of Array.from(pixiObjectMap.entries())) {
    if (!currentIds.has(id)) {
      app.stage.removeChild(obj);
      obj.destroy({ children: true });
      pixiObjectMap.delete(id);
    }
  }

  // 2. Sort current elements by depth to preserve z-index
  const sorted = [...elements].sort((a, b) => (a.transform?.depth || 0) - (b.transform?.depth || 0));
  
  // Detach all and re-attach in correct order
  app.stage.removeChildren();

  // 3. Update or recreate
  for (const el of sorted) {
    // Skip non-visual elements (events and data are logical only)
    if (el.category === 'event' || el.category === 'data') continue;

    let obj = pixiObjectMap.get(el.id);
    let needsRecreate = !obj;

    if (obj && obj.__elementData) {
      const old = obj.__elementData;
      const sizeChanged = old.transform?.width !== el.transform?.width || old.transform?.height !== el.transform?.height;
      const styleChanged = JSON.stringify(old.style || {}) !== JSON.stringify(el.style || {});
      const textChanged = JSON.stringify(old.textContent || {}) !== JSON.stringify(el.textContent || {});
      
      if (sizeChanged || styleChanged || textChanged) {
        needsRecreate = true;
        obj.destroy({ children: true });
        pixiObjectMap.delete(el.id);
      } else {
        // Fast update
        updateElementVisual(el.id, { transform: el.transform, visible: el.visible }, variables);
        obj.__elementData = el;
      }
    }

    if (needsRecreate) {
      obj = createElement(el, variables);
      if (obj) {
        if (editMode) {
          obj.eventMode = 'static';
          obj.cursor = 'pointer';
          obj.__elementId = el.id;
        }
        pixiObjectMap.set(el.id, obj);
      }
    }

    if (obj) {
      obj.visible = el.visible !== false;
      app.stage.addChild(obj);
    }
  }
  
  return pixiObjectMap;
}

/**
 * 更新单个元素属性（无需全量重建）
 */
export function updateElementVisual(elementId, updates, variables = {}) {
  const obj = pixiObjectMap.get(elementId);
  if (!obj) return;

  if (updates.transform) {
    const t = updates.transform;
    if (t.x !== undefined) obj.x = t.x;
    if (t.y !== undefined) obj.y = t.y;
    if (t.rotation !== undefined) obj.rotation = (t.rotation * Math.PI) / 180;
    if (t.scaleX !== undefined) obj.scale.x = t.scaleX;
    if (t.scaleY !== undefined) obj.scale.y = t.scaleY;
    if (t.anchorX !== undefined && obj.anchor) obj.anchor.x = t.anchorX;
    if (t.anchorY !== undefined && obj.anchor) obj.anchor.y = t.anchorY;
  }

  if (updates.style) {
    // For Graphics objects, we need to redraw
    if (obj.__elementData) {
      const merged = { ...obj.__elementData, style: { ...obj.__elementData.style, ...updates.style } };
      obj.__elementData = merged;
      // Full redraw of this element needed
    }
  }

  if (updates.visible !== undefined) {
    obj.visible = updates.visible;
  }
}

// =============================================
//  Element Creation Functions (by type)
// =============================================

function createElement(el, variables) {
  switch (el.type) {
    case 'background': return createBackground(el);
    case 'tilingBg': return createTilingBg(el);
    case 'particles': return createParticles(el);
    case 'graphics': return createGraphics(el);
    case 'image': return createImage(el);
    case 'text': return createText(el, variables);
    case 'container': return createContainer(el);
    case 'animatedSprite': return createAnimatedSprite(el);
    case 'button': return createButton(el);
    default: return createGraphics(el); // fallback
  }
}

/**
 * 背景元素
 */
function createBackground(el) {
  const g = new PIXI.Graphics();
  const t = el.transform || {};
  const s = el.style || {};
  const w = t.width || 800;
  const h = t.height || 600;
  const color = parseColor(s.fillColor || '#111827');

  if (s.gradientTo) {
    // 简易渐变：上下两个半屏
    g.rect(0, 0, w, h / 2);
    g.fill({ color: color });
    g.rect(0, h / 2, w, h / 2);
    g.fill({ color: parseColor(s.gradientTo) });
  } else {
    g.rect(0, 0, w, h);
    g.fill({ color: color, alpha: s.alpha ?? 1 });
  }

  g.x = 0;
  g.y = 0;
  g.__elementData = el;
  return g;
}

/**
 * 滚动背景元素 (TilingSprite placeholder)
 */
function createTilingBg(el) {
  const g = new PIXI.Graphics();
  const t = el.transform || {};
  const s = el.style || {};
  const w = t.width || 800;
  const h = t.height || 600;
  const color = parseColor(s.fillColor || '#0a0e1a');

  g.rect(0, 0, w, h);
  g.fill({ color });

  // 画一些装饰线来表示它是滚动背景
  const lineCount = Math.floor(w / 40);
  for (let i = 0; i < lineCount; i++) {
    g.moveTo(i * 40, 0);
    g.lineTo(i * 40, h);
    g.stroke({ width: 0.5, color: 0xffffff, alpha: 0.05 });
  }

  g.x = 0;
  g.y = 0;
  g.__elementData = el;
  return g;
}

/**
 * 粒子效果
 */
function createParticles(el) {
  const container = new PIXI.Container();
  const t = el.transform || {};
  const s = el.style || {};
  const count = s.particleCount || 50;
  const color = parseColor(s.fillColor || '#ffffff');
  const w = t.width || 800;
  const h = t.height || 600;

  for (let i = 0; i < count; i++) {
    const p = new PIXI.Graphics();
    const radius = (s.particleSize || 2) * (Math.random() * 0.8 + 0.5);
    p.circle(0, 0, radius);
    p.fill({ color, alpha: Math.random() * 0.7 + 0.2 });
    p.x = Math.random() * w;
    p.y = Math.random() * h;
    container.addChild(p);
  }

  container.x = 0;
  container.y = 0;
  container.__elementData = el;
  return container;
}

/**
 * 基础几何图形
 */
function createGraphics(el) {
  const g = new PIXI.Graphics();
  const t = el.transform || {};
  const s = el.style || {};
  const w = t.width || 40;
  const h = t.height || 40;
  const color = parseColor(s.fillColor || '#6366f1');
  const alpha = s.alpha ?? 1;
  const radius = s.borderRadius || 0;

  switch (s.shape) {
    case 'circle':
      g.circle(0, 0, w / 2);
      g.fill({ color, alpha });
      break;
    case 'ellipse':
      g.ellipse(0, 0, w / 2, h / 2);
      g.fill({ color, alpha });
      break;
    case 'triangle': {
      g.moveTo(0, -h / 2);
      g.lineTo(-w / 2, h / 2);
      g.lineTo(w / 2, h / 2);
      g.closePath();
      g.fill({ color, alpha });
      break;
    }
    case 'star': {
      g.star(0, 0, s.starPoints || 5, w / 2, w / 4);
      g.fill({ color, alpha });
      break;
    }
    default: // rect
      if (radius > 0) {
        g.roundRect(-w / 2, -h / 2, w, h, radius);
      } else {
        g.rect(-w / 2, -h / 2, w, h);
      }
      g.fill({ color, alpha });
      break;
  }

  if (s.strokeColor && s.strokeWidth) {
    // Re-draw with stroke
    const strokeColor = parseColor(s.strokeColor);
    g.stroke({ width: s.strokeWidth, color: strokeColor });
  }

  // Eyes for character-like shapes
  if (s.hasEyes) {
    g.circle(-w * 0.2, -h * 0.15, w * 0.08);
    g.fill({ color: 0xffffff });
    g.circle(w * 0.2, -h * 0.15, w * 0.08);
    g.fill({ color: 0xffffff });
  }

  g.x = t.x || 0;
  g.y = t.y || 0;
  if (t.rotation) g.rotation = (t.rotation * Math.PI) / 180;
  if (t.scaleX) g.scale.x = t.scaleX;
  if (t.scaleY) g.scale.y = t.scaleY;
  g.__elementData = el;
  return g;
}

/**
 * 图片精灵 (placeholder with colored rect)
 */
function createImage(el) {
  const t = el.transform || {};
  const s = el.style || {};
  const w = t.width || 64;
  const h = t.height || 64;

  // Use a Container so we can async-load the image
  const container = new PIXI.Container();
  container.x = t.x || 0;
  container.y = t.y || 0;
  if (t.rotation) container.rotation = (t.rotation * Math.PI) / 180;
  container.__elementData = el;

  // Create placeholder first
  const placeholder = new PIXI.Graphics();
  const color = parseColor(s.fillColor || '#06b6d4');
  placeholder.roundRect(-w / 2, -h / 2, w, h, 4);
  placeholder.fill({ color, alpha: s.alpha ?? 0.5 });
  placeholder.moveTo(-w * 0.2, 0);
  placeholder.lineTo(0, -h * 0.15);
  placeholder.lineTo(w * 0.2, 0);
  placeholder.stroke({ width: 1.5, color: 0xffffff, alpha: 0.5 });
  placeholder.circle(w * 0.15, -h * 0.2, w * 0.06);
  placeholder.fill({ color: 0xffffff, alpha: 0.5 });
  container.addChild(placeholder);

  // Async load the actual image
  if (s.src) {
    const src = s.src;
    // Use a unique key for the asset to avoid cache conflicts
    const assetKey = 'img_' + (el.id || src);
    
    PIXI.Assets.load({ alias: assetKey, src }).then((texture) => {
      if (!texture) return;
      const sprite = new PIXI.Sprite(texture);
      sprite.width = w;
      sprite.height = h;
      sprite.anchor.set(0.5);
      sprite.alpha = s.alpha ?? 1;
      // Remove placeholder, add real sprite
      container.removeChild(placeholder);
      placeholder.destroy();
      container.addChild(sprite);
    }).catch((err) => {
      console.warn('Failed to load image:', src, err);
      // Placeholder stays visible
    });
  }

  return container;
}

/**
 * 文字元素
 */
function createText(el, variables = {}) {
  const t = el.transform || {};
  const tc = el.textContent || {};

  let displayText = tc.text || el.name || '';

  // Variable binding: replace {{varName}} with variable value
  if (el.dataBinding) {
    const varName = el.dataBinding.variable;
    const prefix = el.dataBinding.prefix || '';
    const val = variables[varName] !== undefined ? variables[varName] : 0;
    displayText = prefix + val;
  }

  const text = new PIXI.Text({
    text: displayText,
    style: {
      fontFamily: tc.fontFamily || 'Arial',
      fontSize: tc.fontSize || 20,
      fill: parseColor(tc.color || '#ffffff'),
      fontWeight: tc.bold ? 'bold' : 'normal',
      fontStyle: tc.italic ? 'italic' : 'normal',
      wordWrap: tc.wordWrap || false,
      wordWrapWidth: t.width || 300,
      align: tc.align || 'left',
      dropShadow: tc.shadow ? { color: 0x000000, blur: 4, distance: 2 } : undefined,
    },
  });

  text.x = t.x || 0;
  text.y = t.y || 0;
  if (t.anchorX !== undefined) text.anchor.x = t.anchorX;
  if (t.anchorY !== undefined) text.anchor.y = t.anchorY;
  if (t.rotation) text.rotation = (t.rotation * Math.PI) / 180;
  text.__elementData = el;
  return text;
}

/**
 * 容器 (group)
 */
function createContainer(el) {
  const c = new PIXI.Container();
  const t = el.transform || {};
  c.x = t.x || 0;
  c.y = t.y || 0;
  if (t.rotation) c.rotation = (t.rotation * Math.PI) / 180;

  // Visual indicator in edit mode
  const outline = new PIXI.Graphics();
  const w = t.width || 60;
  const h = t.height || 60;
  outline.rect(-w / 2, -h / 2, w, h);
  outline.stroke({ width: 1, color: 0x6366f1, alpha: 0.4 });
  c.addChild(outline);

  c.__elementData = el;
  return c;
}

/**
 * 动画精灵 (placeholder)
 */
function createAnimatedSprite(el) {
  const container = new PIXI.Container();
  const t = el.transform || {};
  const s = el.style || {};
  const w = t.width || 48;
  const h = t.height || 48;
  const color = parseColor(s.fillColor || '#f59e0b');

  // Draw multiple overlapping frames to indicate animation
  for (let f = 0; f < 3; f++) {
    const frame = new PIXI.Graphics();
    frame.roundRect(-w / 2 + f * 3, -h / 2 + f * 3, w, h, 4);
    frame.fill({ color, alpha: 0.3 + f * 0.25 });
    container.addChild(frame);
  }

  // "▶" play indicator
  const playIcon = new PIXI.Graphics();
  playIcon.moveTo(-6, -8);
  playIcon.lineTo(8, 0);
  playIcon.lineTo(-6, 8);
  playIcon.closePath();
  playIcon.fill({ color: 0xffffff, alpha: 0.8 });
  container.addChild(playIcon);

  container.x = t.x || 0;
  container.y = t.y || 0;
  container.__elementData = el;
  return container;
}

/**
 * 交互按钮
 */
function createButton(el) {
  const container = new PIXI.Container();
  const t = el.transform || {};
  const s = el.style || {};
  const tc = el.textContent || {};
  const w = t.width || 120;
  const h = t.height || 40;
  const color = parseColor(s.fillColor || '#6366f1');

  const bg = new PIXI.Graphics();
  bg.roundRect(-w / 2, -h / 2, w, h, s.borderRadius || 8);
  bg.fill({ color, alpha: s.alpha ?? 1 });
  container.addChild(bg);

  if (tc.text) {
    const txt = new PIXI.Text({
      text: tc.text,
      style: {
        fontFamily: tc.fontFamily || 'Arial',
        fontSize: tc.fontSize || 16,
        fill: parseColor(tc.color || '#ffffff'),
        fontWeight: 'bold',
      },
    });
    txt.anchor.set(0.5);
    container.addChild(txt);
  }

  container.x = t.x || 0;
  container.y = t.y || 0;
  container.__elementData = el;
  return container;
}

// =============================================
//  Utility
// =============================================

function parseColor(color) {
  if (typeof color === 'number') return color;
  if (typeof color === 'string' && color.startsWith('#')) {
    return parseInt(color.replace('#', ''), 16);
  }
  return 0xffffff;
}

/**
 * 选中高亮框，包括交互式的四角缩放句柄
 */
export function drawSelectionBox(app, elementId) {
  // Remove any existing selection box
  clearSelectionBox(app);

  const obj = pixiObjectMap.get(elementId);
  if (!obj) return;

  const bounds = obj.getBounds();
  
  // Container to hold all selection visuals
  const selContainer = new PIXI.Container();
  selContainer.__isSelectionBox = true;
  selContainer.__targetId = elementId;

  // Main outline box
  const sel = new PIXI.Graphics();
  sel.rect(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);
  sel.stroke({ width: 2, color: 0x6366f1, alpha: 0.8 });
  selContainer.addChild(sel);

  // Corner handles
  const handleSize = 8;
  const corners = [
    { dir: 'tl', cursor: 'nwse-resize', cx: bounds.x - 2, cy: bounds.y - 2 },
    { dir: 'tr', cursor: 'nesw-resize', cx: bounds.x + bounds.width + 2, cy: bounds.y - 2 },
    { dir: 'bl', cursor: 'nesw-resize', cx: bounds.x - 2, cy: bounds.y + bounds.height + 2 },
    { dir: 'br', cursor: 'nwse-resize', cx: bounds.x + bounds.width + 2, cy: bounds.y + bounds.height + 2 },
  ];
  
  corners.forEach(corner => {
    const handle = new PIXI.Graphics();
    handle.rect(corner.cx - handleSize / 2, corner.cy - handleSize / 2, handleSize, handleSize);
    handle.fill({ color: 0xffffff });
    handle.stroke({ width: 2, color: 0x6366f1 });
    
    // Make interactive
    handle.eventMode = 'static';
    handle.cursor = corner.cursor;
    
    // Tag metadata for global drag listener
    handle.__isResizeHandle = true;
    handle.__resizeDir = corner.dir;
    handle.__targetId = elementId;
    
    selContainer.addChild(handle);
  });

  app.stage.addChild(selContainer);
}

export function clearSelectionBox(app) {
  if (!app || !app.stage) return;
  const toRemove = app.stage.children.filter(c => c.__isSelectionBox);
  toRemove.forEach(c => {
    app.stage.removeChild(c);
    c.destroy({ children: true });
  });
}
