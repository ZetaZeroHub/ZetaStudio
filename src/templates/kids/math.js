/* ========================================
   数学启蒙 (Math) — 3 个新模板
   加减法泡泡 / 数字排序 / 图形计数
   ======================================== */

// 12. 加减法泡泡 — 泡泡浮上来带算式，点击正确答案
export const mathBubble = {
  name: '加减法泡泡',
  description: '点击带正确答案的泡泡',
  templateType: 'mathBubble',
  dimension: '2D',
  category: 'math',
  icon: '🫧',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E0F7FA', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '🫧 点击正确答案的泡泡!', fontSize: 24, color: '#006064', bold: true, align: 'center' } },
    { id: 'question', name: '题目', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 80, anchorX: 0.5 }, textContent: { text: '1 + 1 = ?', fontSize: 36, color: '#00838F', bold: true } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '得分: 0 | 连对: 0', fontSize: 20, color: '#00897B', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 加减法泡泡
const questionText = elements['question'];
const scoreText = elements['score'];
let score = 0, streak = 0, level = 1;
let bubbles = [];
let correctAnswer = 0;

function newQuestion() {
  // Clear old bubbles
  bubbles.forEach(b => app.stage.removeChild(b));
  bubbles = [];
  
  // Generate question based on level
  let a, b, op, answer;
  if (level <= 3) {
    a = Math.floor(Math.random() * 5) + 1;
    b = Math.floor(Math.random() * 5) + 1;
    op = '+'; answer = a + b;
  } else {
    a = Math.floor(Math.random() * 8) + 3;
    b = Math.floor(Math.random() * a);
    op = Math.random() > 0.5 ? '+' : '-';
    answer = op === '+' ? a + b : a - b;
  }
  
  questionText.text = a + ' ' + op + ' ' + b + ' = ?';
  correctAnswer = answer;
  
  // Generate answer bubbles
  const answers = new Set([answer]);
  while (answers.size < 4) answers.add(Math.floor(Math.random() * 15) + 1);
  const shuffled = [...answers].sort(() => Math.random() - 0.5);
  
  shuffled.forEach((num, i) => {
    const bubble = new PIXI.Graphics();
    bubble.beginFill(0x4DD0E1, 0.6);
    bubble.drawCircle(0, 0, 40);
    bubble.endFill();
    bubble.lineStyle(2, 0x00BCD4);
    bubble.drawCircle(0, 0, 40);
    bubble.x = 130 + i * 180;
    bubble.y = 350 + Math.random() * 80;
    bubble._answer = num;
    bubble._baseY = bubble.y;
    bubble._phase = Math.random() * Math.PI * 2;
    bubble.eventMode = 'static'; bubble.cursor = 'pointer';
    
    const label = new PIXI.Text(String(num), { fontSize: 24, fill: '#006064', fontWeight: 'bold' });
    label.anchor.set(0.5); bubble.addChild(label);
    
    bubble.on('pointerdown', () => {
      if (num === correctAnswer) {
        score++; streak++;
        if (streak % 3 === 0) level++;
        scoreText.text = '得分: ' + score + ' | 连对: ' + streak + (level > 1 ? ' ⭐Lv' + level : '');
        // Correct animation
        bubble.clear();
        bubble.beginFill(0x66BB6A, 0.8);
        bubble.drawCircle(0, 0, 40);
        bubble.endFill();
        setTimeout(newQuestion, 600);
      } else {
        streak = 0;
        scoreText.text = '❌ 正确答案是 ' + correctAnswer + ' | 得分: ' + score;
        bubble.alpha = 0.3;
        setTimeout(newQuestion, 1200);
      }
    });
    
    app.stage.addChild(bubble);
    bubbles.push(bubble);
  });
}

// Bubble floating animation
app.ticker.add(() => {
  bubbles.forEach(b => {
    b._phase += 0.02;
    b.y = b._baseY + Math.sin(b._phase) * 15;
  });
});

newQuestion();
` }],
};

// 13. 数字排序 — 拖拽数字到正确顺序
export const numberSort = {
  name: '数字排序',
  description: '把打乱的数字拖到正确位置',
  templateType: 'numberSort',
  dimension: '2D',
  category: 'math',
  icon: '🔢',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#F3E5F5', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '🔢 把数字排成正确的顺序!', fontSize: 24, color: '#6A1B9A', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '拖拽数字到下方的格子里', fontSize: 18, color: '#7B1FA2', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 数字排序
const scoreText = elements['score'];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
const shuffled = [...numbers].sort(() => Math.random() - 0.5);
const slotY = 350, numY = 160;
const startX = 120, gap = 85;
let placed = 0;

// Create slots
const slots = numbers.map((n, i) => {
  const slot = new PIXI.Graphics();
  slot.beginFill(0xE1BEE7, 0.5);
  slot.drawRoundedRect(-30, -30, 60, 60, 10);
  slot.endFill();
  slot.lineStyle(2, 0xCE93D8);
  slot.drawRoundedRect(-30, -30, 60, 60, 10);
  slot.x = startX + i * gap; slot.y = slotY;
  const label = new PIXI.Text(String(n), { fontSize: 16, fill: '#CE93D8' });
  label.anchor.set(0.5); slot.addChild(label);
  slot._slotNum = n; slot._filled = false;
  app.stage.addChild(slot);
  return slot;
});

// Create draggable numbers
const numBlocks = shuffled.map((n, i) => {
  const block = new PIXI.Graphics();
  block.beginFill(0xAB47BC);
  block.drawRoundedRect(-28, -28, 56, 56, 10);
  block.endFill();
  block.x = startX + i * gap; block.y = numY;
  block._startX = block.x; block._startY = block.y;
  block._num = n;
  block.eventMode = 'static'; block.cursor = 'grab';
  const label = new PIXI.Text(String(n), { fontSize: 26, fill: '#fff', fontWeight: 'bold' });
  label.anchor.set(0.5); block.addChild(label);
  app.stage.addChild(block);
  return block;
});

let dragging = null, dragOff = { x: 0, y: 0 };

numBlocks.forEach(block => {
  block.on('pointerdown', e => {
    if (block._placed) return;
    dragging = block;
    const p = e.data.global;
    dragOff.x = block.x - p.x; dragOff.y = block.y - p.y;
    block.cursor = 'grabbing'; block.alpha = 0.7; block.zIndex = 100;
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
  const block = dragging;
  let snapped = false;
  slots.forEach(slot => {
    if (slot._filled) return;
    const dx = block.x - slot.x, dy = block.y - slot.y;
    if (Math.sqrt(dx*dx + dy*dy) < 50 && block._num === slot._slotNum) {
      block.x = slot.x; block.y = slot.y;
      block._placed = true; block.eventMode = 'none';
      slot._filled = true; placed++;
      snapped = true;
      if (placed >= numbers.length) scoreText.text = '🎉 排列正确! 太棒了!';
      else scoreText.text = '已排好: ' + placed + '/' + numbers.length;
    }
  });
  if (!snapped) { block.x = block._startX; block.y = block._startY; }
  block.alpha = 1; block.cursor = 'grab'; block.zIndex = 0;
  dragging = null;
});
` }],
};

// 14. 图形计数 — 数画面中的图形数量
export const shapeCount = {
  name: '图形计数',
  description: '数一数画面里有几个图形',
  templateType: 'shapeCount',
  dimension: '2D',
  category: 'math',
  icon: '📐',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#FFFDE7', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '📐 数一数有几个三角形?', fontSize: 24, color: '#F57F17', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '得分: 0', fontSize: 20, color: '#FF8F00', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 图形计数
const titleText = elements['title'];
const scoreText = elements['score'];
let score = 0, round = 0;

const shapeTypes = [
  { name: '三角形', draw: (g, s) => { g.moveTo(0, -s); g.lineTo(s, s); g.lineTo(-s, s); g.closePath(); } },
  { name: '圆形', draw: (g, s) => { g.drawCircle(0, 0, s); } },
  { name: '方形', draw: (g, s) => { g.drawRect(-s, -s, s*2, s*2); } },
  { name: '星星', draw: (g, s) => { for(let i=0;i<5;i++){const a=Math.PI/2+i*Math.PI*2/5;const b=a+Math.PI/5;g.lineTo(Math.cos(a)*s,Math.sin(a)*s);g.lineTo(Math.cos(b)*s*0.4,Math.sin(b)*s*0.4);}g.closePath(); } },
];
const colors = [0xFF5722, 0x2196F3, 0x4CAF50, 0xFFC107, 0x9C27B0, 0xE91E63];

function newRound() {
  app.stage.children.filter(c => c._isShape || c._isBtn).forEach(c => app.stage.removeChild(c));
  
  const targetType = shapeTypes[round % shapeTypes.length];
  const targetCount = Math.floor(Math.random() * 4) + 2; // 2-5
  const otherCount = Math.floor(Math.random() * 5) + 3;
  titleText.text = '📐 数一数有几个' + targetType.name + '?';
  
  // Draw target shapes
  for (let i = 0; i < targetCount; i++) {
    const g = new PIXI.Graphics();
    const color = colors[Math.floor(Math.random() * colors.length)];
    g.beginFill(color);
    targetType.draw(g, 18 + Math.random() * 12);
    g.endFill();
    g.x = 80 + Math.random() * 640; g.y = 120 + Math.random() * 280;
    g._isShape = true;
    app.stage.addChild(g);
  }
  
  // Draw other shapes as distractors
  for (let i = 0; i < otherCount; i++) {
    const otherType = shapeTypes.filter(s => s !== targetType)[Math.floor(Math.random() * (shapeTypes.length-1))];
    const g = new PIXI.Graphics();
    g.beginFill(colors[Math.floor(Math.random() * colors.length)], 0.7);
    otherType.draw(g, 15 + Math.random() * 10);
    g.endFill();
    g.x = 80 + Math.random() * 640; g.y = 120 + Math.random() * 280;
    g._isShape = true;
    app.stage.addChild(g);
  }
  
  // Answer buttons
  const answers = new Set([targetCount]);
  while (answers.size < 4) answers.add(Math.floor(Math.random() * 7) + 1);
  [...answers].sort(() => Math.random() - 0.5).forEach((num, idx) => {
    const btn = new PIXI.Graphics();
    btn.beginFill(0xFFB300);
    btn.drawRoundedRect(-35, -25, 70, 50, 10);
    btn.endFill();
    btn.x = 200 + idx * 140; btn.y = 480;
    btn.eventMode = 'static'; btn.cursor = 'pointer'; btn._isBtn = true;
    const label = new PIXI.Text(String(num), { fontSize: 22, fill: '#fff', fontWeight: 'bold' });
    label.anchor.set(0.5); btn.addChild(label);
    btn.on('pointerdown', () => {
      if (num === targetCount) {
        score++; round++;
        scoreText.text = '✅ 正确! 得分: ' + score;
        setTimeout(newRound, 800);
      } else {
        scoreText.text = '❌ 正确答案是 ' + targetCount;
        btn.alpha = 0.3;
      }
    });
    app.stage.addChild(btn);
  });
}

newRound();
` }],
};
