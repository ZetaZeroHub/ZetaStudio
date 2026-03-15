/* ========================================
   认知类 (Cognitive) — 3 个新模板
   颜色分类 / 找不同 / 影子配对
   ======================================== */

// 9. 颜色分类 — 拖拽物品到对应颜色篮子
export const colorSort = {
  name: '颜色分类',
  description: '把彩色球拖进对应颜色的篮子',
  templateType: 'colorSort',
  dimension: '2D',
  category: 'cognitive',
  icon: '🎨',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#FFF3E0', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '🎨 把彩球拖进对应颜色的篮子!', fontSize: 24, color: '#E65100', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '已分类: 0/9', fontSize: 20, color: '#F57C00', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 颜色分类
const scoreText = elements['score'];
const basketColors = [
  { color: 0xFF5722, label: '红', x: 160 },
  { color: 0x2196F3, label: '蓝', x: 400 },
  { color: 0x4CAF50, label: '绿', x: 640 },
];
let sorted = 0;
const totalBalls = 9;

// Draw baskets
basketColors.forEach(b => {
  const basket = new PIXI.Graphics();
  basket.beginFill(b.color, 0.3);
  basket.drawRoundedRect(-60, -40, 120, 80, 12);
  basket.endFill();
  basket.lineStyle(3, b.color);
  basket.drawRoundedRect(-60, -40, 120, 80, 12);
  basket.x = b.x; basket.y = 420;
  const label = new PIXI.Text('🧺 ' + b.label, { fontSize: 18, fill: b.color, fontWeight: 'bold' });
  label.anchor.set(0.5); basket.addChild(label);
  basket._color = b.color;
  basket._isBasket = true;
  app.stage.addChild(basket);
});

// Create balls (3 per color)
const balls = [];
basketColors.forEach(b => {
  for (let i = 0; i < 3; i++) {
    const ball = new PIXI.Graphics();
    ball.beginFill(b.color);
    ball.drawCircle(0, 0, 22);
    ball.endFill();
    ball.x = 80 + Math.random() * 640;
    ball.y = 130 + Math.random() * 150;
    ball._ballColor = b.color;
    ball._startX = ball.x; ball._startY = ball.y;
    ball.eventMode = 'static'; ball.cursor = 'grab';
    balls.push(ball);
    app.stage.addChild(ball);
  }
});

// Shuffle positions
balls.sort(() => Math.random() - 0.5);
balls.forEach((b, i) => {
  b.x = 80 + (i % 5) * 155;
  b.y = 140 + Math.floor(i / 5) * 90;
  b._startX = b.x; b._startY = b.y;
});

let dragging = null;
let dragOff = { x: 0, y: 0 };

balls.forEach(ball => {
  ball.on('pointerdown', e => {
    if (ball._sorted) return;
    dragging = ball;
    const p = e.data.global;
    dragOff.x = ball.x - p.x; dragOff.y = ball.y - p.y;
    ball.cursor = 'grabbing'; ball.alpha = 0.7;
  });
});

app.stage.eventMode = 'static';
app.stage.on('pointermove', e => {
  if (!dragging) return;
  const p = e.data.global;
  dragging.x = p.x + dragOff.x; dragging.y = p.y + dragOff.y;
});

app.stage.on('pointerup', () => {
  if (!dragging) return;
  const ball = dragging;
  // Check if over correct basket
  const baskets = app.stage.children.filter(c => c._isBasket);
  let matched = false;
  baskets.forEach(bsk => {
    const dx = ball.x - bsk.x, dy = ball.y - bsk.y;
    if (Math.sqrt(dx*dx + dy*dy) < 70 && ball._ballColor === bsk._color) {
      ball.x = bsk.x + (Math.random() - 0.5) * 60;
      ball.y = bsk.y + (Math.random() - 0.5) * 30;
      ball._sorted = true; ball.eventMode = 'none'; ball.alpha = 1;
      sorted++;
      scoreText.text = sorted >= totalBalls ? '🎉 全部分类完成!' : '已分类: ' + sorted + '/' + totalBalls;
      matched = true;
    }
  });
  if (!matched) { ball.x = ball._startX; ball.y = ball._startY; }
  ball.alpha = 1; ball.cursor = 'grab'; dragging = null;
});
` }],
};

// 10. 找不同 — 两张图找出差异
export const spotDiff = {
  name: '找不同',
  description: '找出两张图的不同之处',
  templateType: 'spotDiff',
  dimension: '2D',
  category: 'cognitive',
  icon: '🔍',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E8EAF6', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '🔍 找出 5 处不同!', fontSize: 26, color: '#283593', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '找到: 0/5', fontSize: 20, color: '#3949AB', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 找不同
const scoreText = elements['score'];
let found = 0;
const total = 5;

// Scene objects for both sides
const sceneItems = [
  { emoji: '🏠', x: 80, y: 100 }, { emoji: '🌳', x: 180, y: 130 },
  { emoji: '☀️', x: 250, y: 80 }, { emoji: '🐦', x: 120, y: 80 },
  { emoji: '🌻', x: 60, y: 160 }, { emoji: '⛅', x: 300, y: 70 },
  { emoji: '🐶', x: 160, y: 180 }, { emoji: '🚗', x: 240, y: 190 },
];

// Differences: items that differ between left and right
const diffs = [
  { leftEmoji: '🐦', rightEmoji: '🦋', x: 120, y: 80 },
  { leftEmoji: '🌻', rightEmoji: '🌹', x: 60, y: 160 },
  { leftEmoji: '🐶', rightEmoji: '🐱', x: 160, y: 180 },
  { leftEmoji: '🚗', rightEmoji: '🚌', x: 240, y: 190 },
  { leftEmoji: '☀️', rightEmoji: '🌙', x: 250, y: 80 },
];

const leftX = 55, rightX = 455;
const panelW = 310, panelH = 250;

// Draw panels
[leftX, rightX].forEach(px => {
  const panel = new PIXI.Graphics();
  panel.beginFill(0xFFFFFF);
  panel.drawRoundedRect(0, 0, panelW, panelH, 12);
  panel.endFill();
  panel.lineStyle(2, 0xCCCCCC);
  panel.drawRoundedRect(0, 0, panelW, panelH, 12);
  panel.x = px; panel.y = 70;
  app.stage.addChild(panel);
});

// Labels
const lbl1 = new PIXI.Text('图 A', { fontSize: 14, fill: '#999', fontWeight: 'bold' });
lbl1.x = leftX + 10; lbl1.y = 72; app.stage.addChild(lbl1);
const lbl2 = new PIXI.Text('图 B', { fontSize: 14, fill: '#999', fontWeight: 'bold' });
lbl2.x = rightX + 10; lbl2.y = 72; app.stage.addChild(lbl2);

// Non-diff items on both sides
const nonDiffItems = sceneItems.filter(si => !diffs.find(d => d.x === si.x && d.y === si.y));
nonDiffItems.forEach(si => {
  [leftX, rightX].forEach(px => {
    const t = new PIXI.Text(si.emoji, { fontSize: 36 });
    t.x = px + si.x; t.y = si.y + 70; t.anchor.set(0.5);
    app.stage.addChild(t);
  });
});

// Diff items
diffs.forEach((d, idx) => {
  // Left side
  const lt = new PIXI.Text(d.leftEmoji, { fontSize: 36 });
  lt.x = leftX + d.x; lt.y = d.y + 70; lt.anchor.set(0.5);
  app.stage.addChild(lt);

  // Right side (different)
  const rt = new PIXI.Text(d.rightEmoji, { fontSize: 36 });
  rt.x = rightX + d.x; rt.y = d.y + 70; rt.anchor.set(0.5);
  rt.eventMode = 'static'; rt.cursor = 'pointer';
  rt._diffIdx = idx; rt._found = false;

  rt.on('pointerdown', () => {
    if (rt._found) return;
    rt._found = true;
    found++;
    // Mark with circle
    [lt, rt].forEach(t => {
      const circle = new PIXI.Graphics();
      circle.lineStyle(3, 0xFF1744);
      circle.drawCircle(0, 0, 28);
      circle.x = t.x; circle.y = t.y;
      app.stage.addChild(circle);
    });
    scoreText.text = found >= total ? '🎉 全部找到!' : '找到: ' + found + '/' + total;
  });
  app.stage.addChild(rt);

  // Also make left clickable
  lt.eventMode = 'static'; lt.cursor = 'pointer';
  lt.on('pointerdown', () => {
    if (rt._found) return;
    rt._found = true;
    found++;
    [lt, rt].forEach(t => {
      const circle = new PIXI.Graphics();
      circle.lineStyle(3, 0xFF1744);
      circle.drawCircle(0, 0, 28);
      circle.x = t.x; circle.y = t.y;
      app.stage.addChild(circle);
    });
    scoreText.text = found >= total ? '🎉 全部找到!' : '找到: ' + found + '/' + total;
  });
});

// Hint text
const hint = new PIXI.Text('💡 提示: 仔细对比两张图', { fontSize: 14, fill: '#999' });
hint.anchor.set(0.5); hint.x = 400; hint.y = 345;
app.stage.addChild(hint);
` }],
};

// 11. 影子配对 — 把物品拖到影子轮廓
export const shadowMatch = {
  name: '影子配对',
  description: '把物品拖到对应的影子上',
  templateType: 'shadowMatch',
  dimension: '2D',
  category: 'cognitive',
  icon: '👤',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#FCE4EC', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '👤 把物品拖到对应的影子上!', fontSize: 24, color: '#880E4F', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '已匹配: 0/5', fontSize: 20, color: '#AD1457', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 影子配对
const scoreText = elements['score'];
const items = [
  { emoji: '🚀', shadow: '🚀' }, { emoji: '🌟', shadow: '🌟' },
  { emoji: '🎈', shadow: '🎈' }, { emoji: '🐠', shadow: '🐠' },
  { emoji: '🍄', shadow: '🍄' },
];
let matched = 0;

// Create shadow slots (dark silhouettes)
const shadows = items.map((item, i) => {
  const s = new PIXI.Text(item.shadow, { fontSize: 50 });
  s.anchor.set(0.5);
  s.x = 130 + i * 140; s.y = 380;
  s.alpha = 0.2; s.tint = 0x000000;
  s._idx = i;
  app.stage.addChild(s);
  return s;
});

// Create draggable items (shuffled)
const shuffled = [...items].sort(() => Math.random() - 0.5);
const draggables = shuffled.map((item, i) => {
  const d = new PIXI.Text(item.emoji, { fontSize: 50 });
  d.anchor.set(0.5);
  d.x = 130 + i * 140; d.y = 160;
  d._startX = d.x; d._startY = d.y;
  d._origIdx = items.indexOf(item);
  d.eventMode = 'static'; d.cursor = 'grab';
  app.stage.addChild(d);
  return d;
});

let dragging = null;
let dragOff = { x: 0, y: 0 };

draggables.forEach(d => {
  d.on('pointerdown', e => {
    if (d._matched) return;
    dragging = d;
    const p = e.data.global;
    dragOff.x = d.x - p.x; dragOff.y = d.y - p.y;
    d.cursor = 'grabbing'; d.alpha = 0.7;
    d.zIndex = 100;
  });
});

app.stage.sortableChildren = true;
app.stage.eventMode = 'static';
app.stage.on('pointermove', e => {
  if (!dragging) return;
  const p = e.data.global;
  dragging.x = p.x + dragOff.x; dragging.y = p.y + dragOff.y;
});

app.stage.on('pointerup', () => {
  if (!dragging) return;
  const d = dragging;
  // Check if on correct shadow
  const shadow = shadows[d._origIdx];
  const dx = d.x - shadow.x, dy = d.y - shadow.y;
  if (Math.sqrt(dx*dx + dy*dy) < 60) {
    d.x = shadow.x; d.y = shadow.y;
    d._matched = true; d.eventMode = 'none'; d.alpha = 1;
    shadow.alpha = 0.6;
    matched++;
    scoreText.text = matched >= items.length ? '🎉 全部配对成功!' : '已匹配: ' + matched + '/' + items.length;
  } else {
    d.x = d._startX; d.y = d._startY;
  }
  d.alpha = 1; d.cursor = 'grab'; d.zIndex = 0;
  dragging = null;
});
` }],
};
