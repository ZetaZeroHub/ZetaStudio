/* ========================================
   Kids Game Templates (PixiJS / 2D)
   8 educational game templates for ages 3-8
   ======================================== */

// 1. 形状配对 — 拖拽形状到轮廓
const shapeMatch = {
  name: '形状配对',
  description: '把形状拖到正确的位置',
  templateType: 'shapeMatch',
  dimension: '2D',
  category: 'cognitive',
  icon: '🧩',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E8F5E9', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 40, anchorX: 0.5 }, textContent: { text: '🧩 把形状拖到正确的位置!', fontSize: 28, color: '#2E7D32', bold: true, align: 'center' } },
    { id: 'shape_circle', name: '圆形', category: 'sprite', type: 'graphics', visible: true, transform: { x: 150, y: 450, width: 80, height: 80 }, style: { fillColor: '#FF5722', shape: 'circle', alpha: 1 } },
    { id: 'shape_square', name: '方形', category: 'sprite', type: 'graphics', visible: true, transform: { x: 350, y: 450, width: 80, height: 80 }, style: { fillColor: '#2196F3', shape: 'rect', alpha: 1 } },
    { id: 'shape_triangle', name: '三角形', category: 'sprite', type: 'graphics', visible: true, transform: { x: 550, y: 450, width: 80, height: 80 }, style: { fillColor: '#FFC107', shape: 'triangle', alpha: 1 } },
    { id: 'slot_circle', name: '圆形槽', category: 'sprite', type: 'graphics', visible: true, transform: { x: 200, y: 220, width: 100, height: 100 }, style: { fillColor: '#C8E6C9', shape: 'circle', alpha: 0.5, strokeColor: '#FF5722', strokeWidth: 3 } },
    { id: 'slot_square', name: '方形槽', category: 'sprite', type: 'graphics', visible: true, transform: { x: 400, y: 220, width: 100, height: 100 }, style: { fillColor: '#C8E6C9', shape: 'rect', alpha: 0.5, strokeColor: '#2196F3', strokeWidth: 3 } },
    { id: 'slot_triangle', name: '三角形槽', category: 'sprite', type: 'graphics', visible: true, transform: { x: 600, y: 220, width: 100, height: 100 }, style: { fillColor: '#C8E6C9', shape: 'triangle', alpha: 0.5, strokeColor: '#FFC107', strokeWidth: 3 } },
    { id: 'score_text', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 560, anchorX: 0.5 }, textContent: { text: '已匹配: 0/3', fontSize: 20, color: '#388E3C', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 形状配对游戏
const shapes = [
  { shape: elements['shape_circle'], slot: elements['slot_circle'], name: '圆形' },
  { shape: elements['shape_square'], slot: elements['slot_square'], name: '方形' },
  { shape: elements['shape_triangle'], slot: elements['slot_triangle'], name: '三角形' },
];
const scoreText = elements['score_text'];
let matched = 0;
let dragging = null;
let dragOffset = { x: 0, y: 0 };

shapes.forEach(({ shape, slot }) => {
  shape.eventMode = 'static';
  shape.cursor = 'grab';
  shape._startX = shape.x;
  shape._startY = shape.y;

  shape.on('pointerdown', (e) => {
    if (shape._matched) return;
    dragging = { shape, slot };
    const pos = e.data.global;
    dragOffset.x = shape.x - pos.x;
    dragOffset.y = shape.y - pos.y;
    shape.cursor = 'grabbing';
    shape.alpha = 0.7;
  });
});

app.stage.eventMode = 'static';
app.stage.on('pointermove', (e) => {
  if (!dragging) return;
  const pos = e.data.global;
  dragging.shape.x = pos.x + dragOffset.x;
  dragging.shape.y = pos.y + dragOffset.y;
});

app.stage.on('pointerup', () => {
  if (!dragging) return;
  const { shape, slot } = dragging;
  const dx = shape.x - slot.x;
  const dy = shape.y - slot.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 60) {
    shape.x = slot.x;
    shape.y = slot.y;
    shape._matched = true;
    shape.eventMode = 'none';
    shape.alpha = 1;
    matched++;
    scoreText.text = '已匹配: ' + matched + '/3';
    if (matched >= 3) {
      scoreText.text = '🎉 太棒了! 全部匹配!';
    }
  } else {
    shape.x = shape._startX;
    shape.y = shape._startY;
    shape.alpha = 1;
  }
  shape.cursor = 'grab';
  dragging = null;
});
` }],
};

// 2. 记忆翻牌
const memoryCard = {
  name: '记忆翻牌',
  description: '翻转卡片找到相同的一对',
  templateType: 'memoryCard',
  dimension: '2D',
  category: 'cognitive',
  icon: '🃏',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E3F2FD', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '🃏 记忆翻牌', fontSize: 28, color: '#1565C0', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '配对: 0/4  翻牌: 0', fontSize: 18, color: '#1976D2', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 记忆翻牌游戏
const emojis = ['🐶', '🐱', '🐸', '🦊'];
const pairs = [...emojis, ...emojis];
const scoreText = elements['score'];
let flipped = [];
let matched = 0;
let flips = 0;
let locked = false;

// Shuffle
for (let i = pairs.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
}

// Create cards
const cards = [];
const cols = 4, rows = 2;
const cardW = 100, cardH = 120, gap = 16;
const startX = 400 - ((cols * (cardW + gap) - gap) / 2) + cardW / 2;
const startY = 200;

pairs.forEach((emoji, idx) => {
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  const x = startX + col * (cardW + gap);
  const y = startY + row * (cardH + gap);

  // Card back
  const card = new PIXI.Graphics();
  card.beginFill(0x42A5F5);
  card.drawRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 12);
  card.endFill();
  card.x = x;
  card.y = y;
  card.eventMode = 'static';
  card.cursor = 'pointer';

  // Question mark
  const qMark = new PIXI.Text('?', { fontSize: 36, fill: '#fff', fontWeight: 'bold' });
  qMark.anchor.set(0.5);
  card.addChild(qMark);

  // Hidden emoji
  const emojiText = new PIXI.Text(emoji, { fontSize: 40 });
  emojiText.anchor.set(0.5);
  emojiText.visible = false;
  card.addChild(emojiText);

  card._emoji = emoji;
  card._qMark = qMark;
  card._emojiText = emojiText;
  card._flipped = false;
  card._matched = false;

  card.on('pointerdown', () => {
    if (locked || card._flipped || card._matched) return;
    card._flipped = true;
    card._qMark.visible = false;
    card._emojiText.visible = true;
    card.clear();
    card.beginFill(0xE3F2FD);
    card.drawRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 12);
    card.endFill();
    card.lineStyle(2, 0x42A5F5);
    card.drawRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 12);

    flipped.push(card);
    flips++;

    if (flipped.length === 2) {
      locked = true;
      const [a, b] = flipped;
      if (a._emoji === b._emoji) {
        a._matched = b._matched = true;
        matched++;
        scoreText.text = '配对: ' + matched + '/4  翻牌: ' + flips;
        if (matched >= 4) scoreText.text = '🎉 全部找到! 翻了 ' + flips + ' 次';
        flipped = [];
        locked = false;
      } else {
        setTimeout(() => {
          [a, b].forEach(c => {
            c._flipped = false;
            c._qMark.visible = true;
            c._emojiText.visible = false;
            c.clear();
            c.beginFill(0x42A5F5);
            c.drawRoundedRect(-cardW/2, -cardH/2, cardW, cardH, 12);
            c.endFill();
          });
          flipped = [];
          locked = false;
        }, 800);
      }
      scoreText.text = '配对: ' + matched + '/4  翻牌: ' + flips;
    }
  });

  app.stage.addChild(card);
  cards.push(card);
});
` }],
};

// 3. 数数乐
const counting = {
  name: '数数乐',
  description: '数一数有多少个，点击正确数字',
  templateType: 'counting',
  dimension: '2D',
  category: 'math',
  icon: '🔢',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#FFF8E1', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '🔢 数一数有几个苹果?', fontSize: 26, color: '#E65100', bold: true, align: 'center' } },
    { id: 'result', name: '结果', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 560, anchorX: 0.5 }, textContent: { text: '得分: 0', fontSize: 20, color: '#F57C00', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 数数乐
const titleText = elements['title'];
const resultText = elements['result'];
const items = ['🍎', '🍊', '🍇', '🌟', '🐻'];
let score = 0;
let round = 0;

function newRound() {
  // Clear old items
  app.stage.children.filter(c => c._isItem || c._isBtn).forEach(c => app.stage.removeChild(c));

  const emoji = items[round % items.length];
  const count = Math.floor(Math.random() * 5) + 2; // 2-6
  titleText.text = '数一数有几个 ' + emoji + ' ?';

  // Place items randomly
  for (let i = 0; i < count; i++) {
    const t = new PIXI.Text(emoji, { fontSize: 48 });
    t.anchor.set(0.5);
    t.x = 120 + Math.random() * 560;
    t.y = 120 + Math.random() * 250;
    t._isItem = true;
    app.stage.addChild(t);
  }

  // Answer buttons
  const answers = new Set();
  answers.add(count);
  while (answers.size < 4) answers.add(Math.floor(Math.random() * 7) + 1);
  const shuffled = [...answers].sort(() => Math.random() - 0.5);

  shuffled.forEach((num, idx) => {
    const btn = new PIXI.Graphics();
    btn.beginFill(num === count ? 0x66BB6A : 0x78909C);
    // all look same color initially
    btn.clear();
    btn.beginFill(0x42A5F5);
    btn.drawRoundedRect(-40, -25, 80, 50, 12);
    btn.endFill();
    btn.x = 200 + idx * 130;
    btn.y = 460;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn._isBtn = true;

    const label = new PIXI.Text(String(num), { fontSize: 24, fill: '#fff', fontWeight: 'bold' });
    label.anchor.set(0.5);
    btn.addChild(label);

    btn.on('pointerdown', () => {
      if (num === count) {
        score++;
        resultText.text = '✅ 正确! 得分: ' + score;
        round++;
        setTimeout(newRound, 1000);
      } else {
        resultText.text = '❌ 再试试! 正确答案是 ' + count;
        btn.alpha = 0.3;
      }
    });

    app.stage.addChild(btn);
  });
}

newRound();
` }],
};

// 4. 看图识字
const wordPicture = {
  name: '看图识字',
  description: '看图片选出正确的文字',
  templateType: 'wordPicture',
  dimension: '2D',
  category: 'language',
  icon: '🅰️',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#F3E5F5', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '🅰️ 这是什么？', fontSize: 28, color: '#6A1B9A', bold: true, align: 'center' } },
    { id: 'picture', name: '图片', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 200, anchorX: 0.5 }, textContent: { text: '🐶', fontSize: 100 } },
    { id: 'result', name: '结果', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 560, anchorX: 0.5 }, textContent: { text: '得分: 0', fontSize: 20, color: '#7B1FA2', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 看图识字
const picture = elements['picture'];
const resultText = elements['result'];
const data = [
  { emoji: '🐶', answer: '小狗', options: ['小猫', '小狗', '小鸟', '小鱼'] },
  { emoji: '🌻', answer: '向日葵', options: ['玫瑰', '向日葵', '菊花', '荷花'] },
  { emoji: '🚗', answer: '汽车', options: ['飞机', '轮船', '汽车', '火车'] },
  { emoji: '🍉', answer: '西瓜', options: ['苹果', '香蕉', '西瓜', '葡萄'] },
  { emoji: '🌙', answer: '月亮', options: ['太阳', '星星', '月亮', '云朵'] },
];
let score = 0;
let idx = 0;

function showQuestion() {
  app.stage.children.filter(c => c._isBtn).forEach(c => app.stage.removeChild(c));
  if (idx >= data.length) {
    picture.text = '🎉';
    resultText.text = '太棒了! 全部答对! 得分: ' + score + '/' + data.length;
    return;
  }
  const q = data[idx];
  picture.text = q.emoji;

  q.options.forEach((opt, i) => {
    const btn = new PIXI.Graphics();
    btn.beginFill(0xAB47BC);
    btn.drawRoundedRect(-80, -22, 160, 44, 10);
    btn.endFill();
    btn.x = (i < 2) ? 250 + i * 300 : 250 + (i - 2) * 300;
    btn.y = (i < 2) ? 380 : 450;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn._isBtn = true;

    const label = new PIXI.Text(opt, { fontSize: 20, fill: '#fff', fontWeight: 'bold' });
    label.anchor.set(0.5);
    btn.addChild(label);

    btn.on('pointerdown', () => {
      if (opt === q.answer) {
        score++;
        resultText.text = '✅ 正确! 得分: ' + score;
      } else {
        resultText.text = '❌ 正确答案是: ' + q.answer;
      }
      idx++;
      setTimeout(showQuestion, 1000);
    });

    app.stage.addChild(btn);
  });
}
showQuestion();
` }],
};

// 5. 涂色本
const colorBook = {
  name: '涂色本',
  description: '选择颜色给图案涂色',
  templateType: 'colorBook',
  dimension: '2D',
  category: 'creative',
  icon: '🎨',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#FAFAFA', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '🎨 选择颜色，点击区域涂色!', fontSize: 24, color: '#333', bold: true, align: 'center' } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 涂色本
const colors = [0xFF5722, 0x2196F3, 0x4CAF50, 0xFFC107, 0x9C27B0, 0xE91E63, 0x00BCD4, 0xFF9800];
let selectedColor = colors[0];

// Color palette
colors.forEach((c, i) => {
  const swatch = new PIXI.Graphics();
  swatch.beginFill(c);
  swatch.drawCircle(0, 0, 18);
  swatch.endFill();
  swatch.x = 100 + i * 80;
  swatch.y = 550;
  swatch.eventMode = 'static';
  swatch.cursor = 'pointer';

  if (i === 0) {
    swatch.lineStyle(3, 0x333333);
    swatch.drawCircle(0, 0, 20);
  }

  swatch.on('pointerdown', () => {
    selectedColor = c;
    // Update selection indicator
    app.stage.children.filter(ch => ch._isPalette).forEach(ch => {
      ch.clear();
      ch.beginFill(ch._color);
      ch.drawCircle(0, 0, 18);
      ch.endFill();
    });
    swatch.lineStyle(3, 0x333333);
    swatch.drawCircle(0, 0, 20);
  });

  swatch._isPalette = true;
  swatch._color = c;
  app.stage.addChild(swatch);
});

// Draw colorable regions (simple house)
const regions = [
  { x: 400, y: 280, w: 200, h: 160, label: '墙壁' },   // wall
  { x: 400, y: 170, w: 240, h: 80, label: '屋顶' },     // roof
  { x: 360, y: 330, w: 50, h: 80, label: '门' },         // door
  { x: 460, y: 290, w: 40, h: 40, label: '窗户' },       // window
  { x: 550, y: 380, w: 60, h: 60, label: '树干' },       // trunk
  { x: 550, y: 320, w: 90, h: 70, label: '树冠' },       // leaves
];

regions.forEach(r => {
  const g = new PIXI.Graphics();
  g.beginFill(0xDDDDDD);
  g.drawRoundedRect(-r.w/2, -r.h/2, r.w, r.h, 6);
  g.endFill();
  g.lineStyle(2, 0xBBBBBB);
  g.drawRoundedRect(-r.w/2, -r.h/2, r.w, r.h, 6);
  g.x = r.x;
  g.y = r.y;
  g.eventMode = 'static';
  g.cursor = 'pointer';

  const label = new PIXI.Text(r.label, { fontSize: 12, fill: '#999' });
  label.anchor.set(0.5);
  g.addChild(label);

  g.on('pointerdown', () => {
    g.clear();
    g.beginFill(selectedColor);
    g.drawRoundedRect(-r.w/2, -r.h/2, r.w, r.h, 6);
    g.endFill();
    g.lineStyle(2, 0x666666);
    g.drawRoundedRect(-r.w/2, -r.h/2, r.w, r.h, 6);
    label.style.fill = '#fff';
  });

  app.stage.addChild(g);
});
` }],
};

// 6. 动物认知
const animalQuiz = {
  name: '动物认知',
  description: '认识动物，选择正确答案',
  templateType: 'animalQuiz',
  dimension: '2D',
  category: 'science',
  icon: '🐾',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E8F5E9', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '🐾 这个动物住在哪里?', fontSize: 26, color: '#2E7D32', bold: true, align: 'center' } },
    { id: 'animal', name: '动物', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 180, anchorX: 0.5 }, textContent: { text: '🐧', fontSize: 80 } },
    { id: 'result', name: '结果', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 560, anchorX: 0.5 }, textContent: { text: '得分: 0', fontSize: 20, color: '#388E3C', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 动物认知
const animal = elements['animal'];
const resultText = elements['result'];
const quiz = [
  { emoji: '🐧', q: '企鹅住在哪里?', answer: '南极', options: ['森林', '沙漠', '南极', '海洋'] },
  { emoji: '🐪', q: '骆驼住在哪里?', answer: '沙漠', options: ['森林', '沙漠', '南极', '草原'] },
  { emoji: '🐒', q: '猴子住在哪里?', answer: '森林', options: ['森林', '沙漠', '南极', '海洋'] },
  { emoji: '🐳', q: '鲸鱼住在哪里?', answer: '海洋', options: ['森林', '沙漠', '草原', '海洋'] },
  { emoji: '🦁', q: '狮子住在哪里?', answer: '草原', options: ['草原', '沙漠', '南极', '海洋'] },
];
let score = 0, idx = 0;

function show() {
  app.stage.children.filter(c => c._isBtn).forEach(c => app.stage.removeChild(c));
  if (idx >= quiz.length) {
    animal.text = '🎉';
    elements['title'].text = '太棒了! 你是动物专家!';
    resultText.text = '最终得分: ' + score + '/' + quiz.length;
    return;
  }
  const q = quiz[idx];
  animal.text = q.emoji;
  elements['title'].text = q.q;

  q.options.forEach((opt, i) => {
    const btn = new PIXI.Graphics();
    btn.beginFill(0x66BB6A);
    btn.drawRoundedRect(-70, -22, 140, 44, 10);
    btn.endFill();
    btn.x = (i < 2) ? 250 + i * 300 : 250 + (i - 2) * 300;
    btn.y = (i < 2) ? 370 : 440;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn._isBtn = true;
    const label = new PIXI.Text(opt, { fontSize: 18, fill: '#fff', fontWeight: 'bold' });
    label.anchor.set(0.5);
    btn.addChild(label);
    btn.on('pointerdown', () => {
      if (opt === q.answer) { score++; resultText.text = '✅ 正确! 得分: ' + score; }
      else resultText.text = '❌ 答案是: ' + q.answer;
      idx++;
      setTimeout(show, 1000);
    });
    app.stage.addChild(btn);
  });
}
show();
` }],
};

// 7. 打地鼠
const whackMole = {
  name: '打地鼠',
  description: '快速点击冒出的地鼠!',
  templateType: 'whackMole',
  dimension: '2D',
  category: 'reaction',
  icon: '🐹',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#8BC34A', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '🐹 打地鼠! 点击它们!', fontSize: 26, color: '#fff', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '得分: 0 | 剩余: 30秒', fontSize: 20, color: '#fff', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 打地鼠
const scoreText = elements['score'];
let score = 0;
let timeLeft = 30;

// Create holes
const holes = [];
const positions = [
  { x: 200, y: 200 }, { x: 400, y: 200 }, { x: 600, y: 200 },
  { x: 200, y: 350 }, { x: 400, y: 350 }, { x: 600, y: 350 },
  { x: 200, y: 500 }, { x: 400, y: 500 }, { x: 600, y: 500 },
];

positions.forEach(pos => {
  // Hole
  const hole = new PIXI.Graphics();
  hole.beginFill(0x5D4037);
  hole.drawEllipse(0, 0, 50, 25);
  hole.endFill();
  hole.x = pos.x;
  hole.y = pos.y;
  app.stage.addChild(hole);

  // Mole
  const mole = new PIXI.Text('🐹', { fontSize: 40 });
  mole.anchor.set(0.5);
  mole.x = pos.x;
  mole.y = pos.y - 20;
  mole.visible = false;
  mole.eventMode = 'static';
  mole.cursor = 'pointer';
  mole._active = false;

  mole.on('pointerdown', () => {
    if (!mole._active) return;
    score++;
    mole._active = false;
    mole.text = '💥';
    scoreText.text = '得分: ' + score + ' | 剩余: ' + timeLeft + '秒';
    setTimeout(() => { mole.visible = false; mole.text = '🐹'; }, 300);
  });

  app.stage.addChild(mole);
  holes.push({ hole, mole });
});

// Mole popup logic
function popMole() {
  if (timeLeft <= 0) return;
  const h = holes[Math.floor(Math.random() * holes.length)];
  if (h.mole._active) return;
  h.mole.visible = true;
  h.mole._active = true;
  const dur = Math.max(500, 1200 - score * 30);
  setTimeout(() => {
    if (h.mole._active) {
      h.mole._active = false;
      h.mole.visible = false;
    }
  }, dur);
}

// Game timer
const timerInterval = setInterval(() => {
  timeLeft--;
  scoreText.text = '得分: ' + score + ' | 剩余: ' + timeLeft + '秒';
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    clearInterval(moleInterval);
    elements['title'].text = '⏰ 时间到! 最终得分: ' + score;
    holes.forEach(h => { h.mole.visible = false; h.mole._active = false; });
  }
}, 1000);

const moleInterval = setInterval(popMole, 600);
popMole();
` }],
};

// 8. 接水果
const fruitCatch = {
  name: '接水果',
  description: '移动篮子接住掉落的水果',
  templateType: 'fruitCatch',
  dimension: '2D',
  category: 'reaction',
  icon: '🧺',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E1F5FE', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 20, anchorX: 0.5 }, textContent: { text: '🧺 接水果! 左右移动篮子', fontSize: 24, color: '#0277BD', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '得分: 0 | ❤️❤️❤️', fontSize: 20, color: '#0288D1', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 接水果
const scoreText = elements['score'];
const fruits = ['🍎', '🍊', '🍇', '🍌', '🍓', '🍑'];
const badItems = ['💣'];
let score = 0;
let lives = 3;
let gameOver = false;

// Basket
const basket = new PIXI.Text('🧺', { fontSize: 48 });
basket.anchor.set(0.5);
basket.x = 400;
basket.y = 520;
app.stage.addChild(basket);

// Keyboard controls
const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

// Touch/mouse control
app.stage.eventMode = 'static';
app.stage.on('pointermove', (e) => {
  if (gameOver) return;
  basket.x = Math.max(40, Math.min(760, e.data.global.x));
});

// Falling items
const fallingItems = [];

function spawnFruit() {
  if (gameOver) return;
  const isBad = Math.random() < 0.15;
  const emoji = isBad ? badItems[0] : fruits[Math.floor(Math.random() * fruits.length)];
  const item = new PIXI.Text(emoji, { fontSize: 36 });
  item.anchor.set(0.5);
  item.x = 50 + Math.random() * 700;
  item.y = -20;
  item._speed = 2 + Math.random() * 2 + score * 0.05;
  item._isBad = isBad;
  app.stage.addChild(item);
  fallingItems.push(item);
}

// Game loop
app.ticker.add(() => {
  if (gameOver) return;

  // Keyboard movement
  if (keys['ArrowLeft'] || keys['KeyA']) basket.x = Math.max(40, basket.x - 6);
  if (keys['ArrowRight'] || keys['KeyD']) basket.x = Math.min(760, basket.x + 6);

  // Update falling items
  for (let i = fallingItems.length - 1; i >= 0; i--) {
    const item = fallingItems[i];
    item.y += item._speed;

    // Check catch
    if (item.y > 500 && Math.abs(item.x - basket.x) < 45) {
      if (item._isBad) {
        lives--;
      } else {
        score++;
      }
      app.stage.removeChild(item);
      fallingItems.splice(i, 1);
      updateScore();
      continue;
    }

    // Missed (fell off screen)
    if (item.y > 620) {
      if (!item._isBad) lives--; // Missing a good fruit costs a life
      app.stage.removeChild(item);
      fallingItems.splice(i, 1);
      updateScore();
    }
  }
});

function updateScore() {
  const heartsStr = '❤️'.repeat(Math.max(0, lives));
  scoreText.text = '得分: ' + score + ' | ' + (heartsStr || '💔');
  if (lives <= 0) {
    gameOver = true;
    elements['title'].text = '💔 游戏结束! 最终得分: ' + score;
  }
}

// Spawn timer
setInterval(spawnFruit, 800);
spawnFruit();
` }],
};

export const kidsTemplateList = [
  shapeMatch, memoryCard, counting, wordPicture,
  colorBook, animalQuiz, whackMole, fruitCatch,
];

export default kidsTemplateList;
