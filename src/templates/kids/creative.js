/* ========================================
   创意/艺术 (Creative) — 3 个新模板
   简笔画连线 / 音乐节拍 / 画线条
   ======================================== */

// 18. 简笔画连线 — 按数字顺序连线画出动物轮廓
export const dotConnect = {
  name: '简笔画连线',
  description: '按数字顺序连线画出图案',
  templateType: 'dotConnect',
  dimension: '2D',
  category: 'creative',
  icon: '✏️',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#FFFDE7', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '✏️ 按数字顺序连线!', fontSize: 24, color: '#F57F17', bold: true, align: 'center' } },
    { id: 'score', name: '结果', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '点击数字 1 开始', fontSize: 18, color: '#FF8F00', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 简笔画连线 - 画出一条鱼
const scoreText = elements['score'];
// Fish shape dots
const dots = [
  { x: 200, y: 300 }, { x: 260, y: 220 }, { x: 350, y: 200 },
  { x: 450, y: 220 }, { x: 530, y: 250 }, { x: 580, y: 300 },
  { x: 530, y: 350 }, { x: 450, y: 380 }, { x: 350, y: 400 },
  { x: 260, y: 380 }, { x: 200, y: 300 }, // closes the shape
  // Tail
  { x: 160, y: 260 }, { x: 120, y: 230 },
];
let currentDot = 0;
const lines = new PIXI.Graphics();
lines.lineStyle(3, 0xFF8F00);
app.stage.addChild(lines);

// Draw numbered dots
dots.forEach((d, i) => {
  if (i >= dots.length - 2) return; // Skip tail dots initially
  const circle = new PIXI.Graphics();
  circle.beginFill(0xFFB300); circle.drawCircle(0, 0, 16); circle.endFill();
  circle.x = d.x; circle.y = d.y;
  circle.eventMode = 'static'; circle.cursor = 'pointer';
  const label = new PIXI.Text(String(i + 1), { fontSize: 12, fill: '#fff', fontWeight: 'bold' });
  label.anchor.set(0.5); circle.addChild(label);
  circle._dotIdx = i;
  
  circle.on('pointerdown', () => {
    if (i !== currentDot) return;
    if (currentDot === 0) {
      lines.moveTo(d.x, d.y);
    } else {
      lines.lineTo(d.x, d.y);
    }
    circle.clear(); circle.beginFill(0x4CAF50); circle.drawCircle(0, 0, 16); circle.endFill();
    circle.scale.set(1.3);
    setTimeout(() => circle.scale.set(1), 150);
    currentDot++;
    
    if (currentDot >= dots.length - 2) {
      // Auto-draw remaining dots
      lines.lineTo(dots[dots.length-2].x, dots[dots.length-2].y);
      lines.lineTo(dots[dots.length-1].x, dots[dots.length-1].y);
      scoreText.text = '🎉 你画出了一条鱼! 🐟';
      // Draw eye
      const eye = new PIXI.Graphics();
      eye.beginFill(0x333333); eye.drawCircle(0, 0, 6); eye.endFill();
      eye.x = 480; eye.y = 280;
      app.stage.addChild(eye);
    } else {
      scoreText.text = '连接第 ' + (currentDot + 1) + ' 个点';
    }
  });
  
  app.stage.addChild(circle);
});
` }],
};

// 19. 音乐节拍 — 按节奏点击乐器图标
export const musicBeat = {
  name: '音乐节拍',
  description: '按节奏点击正确的乐器',
  templateType: 'musicBeat',
  dimension: '2D',
  category: 'creative',
  icon: '🥁',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#EDE7F6', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '🥁 跟着节拍点击!', fontSize: 26, color: '#4527A0', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '得分: 0 | 连击: 0', fontSize: 20, color: '#5E35B1', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 音乐节拍
const scoreText = elements['score'];
const instruments = ['🥁', '🎸', '🎹', '🎺'];
let score = 0, combo = 0, beatIdx = 0;
let activeTarget = null;

// Create instrument pads
const pads = instruments.map((inst, i) => {
  const pad = new PIXI.Graphics();
  pad.beginFill([0xE91E63, 0x2196F3, 0x4CAF50, 0xFFC107][i]);
  pad.drawRoundedRect(-55, -55, 110, 110, 20);
  pad.endFill();
  pad.x = 160 + i * 170; pad.y = 420;
  pad.eventMode = 'static'; pad.cursor = 'pointer';
  
  const label = new PIXI.Text(inst, { fontSize: 44 });
  label.anchor.set(0.5); pad.addChild(label);
  
  pad._inst = i;
  pad.on('pointerdown', () => {
    // Visual feedback
    pad.scale.set(0.85);
    setTimeout(() => pad.scale.set(1), 100);
    
    if (activeTarget && activeTarget._inst === i) {
      score++; combo++;
      scoreText.text = '🎵 得分: ' + score + ' | 连击: ' + combo + (combo >= 5 ? ' 🔥' : '');
      activeTarget._hit = true;
    } else {
      combo = 0;
      scoreText.text = '得分: ' + score + ' | 连击: 0';
    }
  });
  
  app.stage.addChild(pad);
  return pad;
});

// Beat sequence
const sequence = [];
for (let i = 0; i < 30; i++) sequence.push(Math.floor(Math.random() * 4));

// Falling notes
function dropNote() {
  if (beatIdx >= sequence.length) {
    elements['title'].text = '🎉 演奏完成! 得分: ' + score + '/' + sequence.length;
    return;
  }
  
  const targetPad = sequence[beatIdx];
  const note = new PIXI.Graphics();
  note.beginFill([0xE91E63, 0x2196F3, 0x4CAF50, 0xFFC107][targetPad], 0.8);
  note.drawCircle(0, 0, 25);
  note.endFill();
  note.x = pads[targetPad].x; note.y = 80;
  note._inst = targetPad; note._hit = false;
  
  const noteLabel = new PIXI.Text(instruments[targetPad], { fontSize: 24 });
  noteLabel.anchor.set(0.5); note.addChild(noteLabel);
  
  app.stage.addChild(note);
  activeTarget = note;
  
  // Animate falling
  const speed = Math.max(2, 4 - score * 0.05);
  const ticker = () => {
    note.y += speed;
    if (note.y >= pads[targetPad].y - 30) {
      app.ticker.remove(ticker);
      if (!note._hit) { combo = 0; scoreText.text = '得分: ' + score + ' | 连击: 0'; }
      app.stage.removeChild(note);
      beatIdx++;
      setTimeout(dropNote, 300);
    }
  };
  app.ticker.add(ticker);
}

// Start
setTimeout(dropNote, 1000);
` }],
};

// 20. 画线条 — 用鼠标画出指定形状
export const drawLine = {
  name: '画线条',
  description: '用手指画出指定的形状',
  templateType: 'drawLine',
  dimension: '2D',
  category: 'creative',
  icon: '🖌️',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#FFFFFF', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '🖌️ 自由画板 — 释放创造力!', fontSize: 24, color: '#333', bold: true, align: 'center' } },
    { id: 'info', name: '信息', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '选择颜色和粗细，开始画画!', fontSize: 16, color: '#999' } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 画线条 - 自由画板
const colors = [0x333333, 0xFF5722, 0x2196F3, 0x4CAF50, 0xFFC107, 0x9C27B0, 0xE91E63, 0x00BCD4];
const sizes = [3, 6, 12, 20];
let currentColor = colors[0];
let currentSize = sizes[1];
let isDrawing = false;
let graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

// Color palette
colors.forEach((c, i) => {
  const swatch = new PIXI.Graphics();
  swatch.beginFill(c); swatch.drawCircle(0, 0, 14); swatch.endFill();
  if (i === 0) { swatch.lineStyle(2, 0x333); swatch.drawCircle(0, 0, 16); }
  swatch.x = 80 + i * 40; swatch.y = 560;
  swatch.eventMode = 'static'; swatch.cursor = 'pointer';
  swatch._c = c; swatch._isPalette = true;
  swatch.on('pointerdown', () => {
    currentColor = c;
    app.stage.children.filter(ch => ch._isPalette).forEach(ch => {
      ch.clear(); ch.beginFill(ch._c); ch.drawCircle(0, 0, 14); ch.endFill();
    });
    swatch.lineStyle(2, 0x333); swatch.drawCircle(0, 0, 16);
  });
  app.stage.addChild(swatch);
});

// Size buttons
sizes.forEach((s, i) => {
  const btn = new PIXI.Graphics();
  btn.beginFill(0x666); btn.drawCircle(0, 0, s/2 + 4); btn.endFill();
  btn.x = 500 + i * 45; btn.y = 560;
  btn.eventMode = 'static'; btn.cursor = 'pointer';
  btn.on('pointerdown', () => { currentSize = s; });
  app.stage.addChild(btn);
});

// Clear button
const clearBtn = new PIXI.Graphics();
clearBtn.beginFill(0xEF5350); clearBtn.drawRoundedRect(-30, -14, 60, 28, 8); clearBtn.endFill();
clearBtn.x = 720; clearBtn.y = 560;
clearBtn.eventMode = 'static'; clearBtn.cursor = 'pointer';
const clrLbl = new PIXI.Text('清除', { fontSize: 12, fill: '#fff', fontWeight: 'bold' });
clrLbl.anchor.set(0.5); clearBtn.addChild(clrLbl);
clearBtn.on('pointerdown', () => {
  app.stage.removeChild(graphics);
  graphics = new PIXI.Graphics(); app.stage.addChildAt(graphics, 1);
});
app.stage.addChild(clearBtn);

// Drawing area
const drawArea = new PIXI.Graphics();
drawArea.beginFill(0xFFFFFF, 0.01);
drawArea.drawRect(0, 60, 800, 490);
drawArea.endFill();
drawArea.eventMode = 'static';
app.stage.addChildAt(drawArea, 0);

let lastPos = null;
drawArea.on('pointerdown', e => {
  isDrawing = true;
  const p = e.data.global;
  lastPos = { x: p.x, y: p.y };
  graphics.lineStyle(currentSize, currentColor, 1);
  graphics.moveTo(p.x, p.y);
});

drawArea.on('pointermove', e => {
  if (!isDrawing) return;
  const p = e.data.global;
  graphics.lineStyle(currentSize, currentColor, 1);
  graphics.lineTo(p.x, p.y);
  lastPos = { x: p.x, y: p.y };
});

drawArea.on('pointerup', () => { isDrawing = false; lastPos = null; });
drawArea.on('pointerupoutside', () => { isDrawing = false; lastPos = null; });
` }],
};
