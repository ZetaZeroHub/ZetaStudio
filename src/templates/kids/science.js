/* ========================================
   常识/科学 (Science) — 3 个新模板
   食物分类 / 天气穿衣 / 垃圾分类
   ======================================== */

// 21. 食物分类 — 水果vs蔬菜
export const foodSort = {
  name: '食物分类',
  description: '把食物分到正确的类别',
  templateType: 'foodSort',
  dimension: '2D',
  category: 'science',
  icon: '🥗',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#F1F8E9', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '🥗 水果还是蔬菜?', fontSize: 26, color: '#33691E', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '已分类: 0/10', fontSize: 20, color: '#558B2F', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 食物分类
const scoreText = elements['score'];
const foods = [
  { emoji: '🍎', type: 'fruit' }, { emoji: '🥕', type: 'veggie' },
  { emoji: '🍌', type: 'fruit' }, { emoji: '🥦', type: 'veggie' },
  { emoji: '🍇', type: 'fruit' }, { emoji: '🌽', type: 'veggie' },
  { emoji: '🍓', type: 'fruit' }, { emoji: '🍆', type: 'veggie' },
  { emoji: '🍊', type: 'fruit' }, { emoji: '🥬', type: 'veggie' },
];
let sorted = 0, currentFood = null, foodIdx = 0;
const shuffled = [...foods].sort(() => Math.random() - 0.5);

// Draw baskets
const baskets = [
  { label: '🍎 水果', type: 'fruit', x: 200, color: 0xFF7043 },
  { label: '🥬 蔬菜', type: 'veggie', x: 600, color: 0x66BB6A },
];
baskets.forEach(b => {
  const bsk = new PIXI.Graphics();
  bsk.beginFill(b.color, 0.3); bsk.drawRoundedRect(-80, -50, 160, 100, 16); bsk.endFill();
  bsk.lineStyle(3, b.color); bsk.drawRoundedRect(-80, -50, 160, 100, 16);
  bsk.x = b.x; bsk.y = 440;
  const lbl = new PIXI.Text(b.label, { fontSize: 20, fill: b.color, fontWeight: 'bold' });
  lbl.anchor.set(0.5); bsk.addChild(lbl);
  bsk._type = b.type; bsk._isBasket = true;
  bsk.eventMode = 'static'; bsk.cursor = 'pointer';
  bsk.on('pointerdown', () => {
    if (!currentFood) return;
    if (currentFood._foodType === b.type) {
      sorted++;
      scoreText.text = sorted >= foods.length ? '🎉 全部分类正确!' : '✅ 正确! 已分类: ' + sorted + '/' + foods.length;
    } else {
      scoreText.text = '❌ 再想想! ' + currentFood.text + ' 不是' + b.label.slice(2);
    }
    app.stage.removeChild(currentFood);
    currentFood = null;
    if (sorted < foods.length) setTimeout(showFood, 500);
  });
  app.stage.addChild(bsk);
});

function showFood() {
  if (foodIdx >= shuffled.length) return;
  const f = shuffled[foodIdx++];
  const food = new PIXI.Text(f.emoji, { fontSize: 64 });
  food.anchor.set(0.5); food.x = 400; food.y = 220;
  food._foodType = f.type;
  currentFood = food;
  // Bounce in animation
  food.scale.set(0);
  app.stage.addChild(food);
  let t = 0;
  const anim = () => {
    t += 0.08; const s = Math.min(1, t * 1.2);
    food.scale.set(s + Math.sin(t * 10) * Math.max(0, 0.2 - t * 0.1));
    if (t >= 1) { app.ticker.remove(anim); food.scale.set(1); }
  };
  app.ticker.add(anim);
}

showFood();
` }],
};

// 22. 天气穿衣 — 看天气给小人配衣服
export const weatherDress = {
  name: '天气穿衣',
  description: '看天气给小朋友选衣服',
  templateType: 'weatherDress',
  dimension: '2D',
  category: 'science',
  icon: '🌤️',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E3F2FD', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '🌤️ 今天穿什么?', fontSize: 26, color: '#0D47A1', bold: true, align: 'center' } },
    { id: 'weather', name: '天气', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 100, anchorX: 0.5 }, textContent: { text: '☀️', fontSize: 80 } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '得分: 0', fontSize: 20, color: '#1565C0', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 天气穿衣
const weatherText = elements['weather'];
const scoreText = elements['score'];
const rounds = [
  { weather: '☀️ 晴天', correct: '👕', options: ['👕', '🧥', '☂️', '🧤'], tip: '晴天穿短袖!' },
  { weather: '🌧️ 下雨', correct: '☂️', options: ['👕', '🩳', '☂️', '🕶️'], tip: '下雨带伞!' },
  { weather: '❄️ 下雪', correct: '🧥', options: ['👕', '🧥', '🩳', '👒'], tip: '下雪穿厚外套!' },
  { weather: '🌬️ 大风', correct: '🧣', options: ['🧣', '🩳', '👕', '🕶️'], tip: '大风天围围巾!' },
  { weather: '🌡️ 炎热', correct: '🩳', options: ['🧥', '🩳', '🧣', '🧤'], tip: '热天穿短裤!' },
];
let score = 0, idx = 0;

// Person
const person = new PIXI.Text('🧒', { fontSize: 60 });
person.anchor.set(0.5); person.x = 400; person.y = 250;
app.stage.addChild(person);

function showRound() {
  app.stage.children.filter(c => c._isBtn).forEach(c => app.stage.removeChild(c));
  if (idx >= rounds.length) {
    weatherText.text = '🎉';
    elements['title'].text = '你是穿衣小达人!';
    scoreText.text = '最终得分: ' + score + '/' + rounds.length;
    return;
  }
  const r = rounds[idx];
  weatherText.text = r.weather;
  
  r.options.forEach((opt, i) => {
    const btn = new PIXI.Graphics();
    btn.beginFill(0x42A5F5); btn.drawRoundedRect(-35, -35, 70, 70, 14); btn.endFill();
    btn.x = 200 + i * 140; btn.y = 430;
    btn.eventMode = 'static'; btn.cursor = 'pointer'; btn._isBtn = true;
    const lbl = new PIXI.Text(opt, { fontSize: 32 });
    lbl.anchor.set(0.5); btn.addChild(lbl);
    
    btn.on('pointerdown', () => {
      if (opt === r.correct) {
        score++;
        scoreText.text = '✅ ' + r.tip + ' 得分: ' + score;
        person.text = '🧒' + opt;
      } else {
        scoreText.text = '❌ ' + r.tip;
      }
      idx++;
      setTimeout(showRound, 1200);
    });
    app.stage.addChild(btn);
  });
}

showRound();
` }],
};

// 23. 垃圾分类 — 拖拽垃圾到正确分类桶
export const trashSort = {
  name: '垃圾分类',
  description: '把垃圾扔进正确的桶里',
  templateType: 'trashSort',
  dimension: '2D',
  category: 'science',
  icon: '♻️',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E0F2F1', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '♻️ 垃圾分类小能手!', fontSize: 26, color: '#004D40', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '已分类: 0/8', fontSize: 20, color: '#00695C', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 垃圾分类
const scoreText = elements['score'];
const bins = [
  { label: '可回收', color: 0x2196F3, type: 'recycle', x: 160 },
  { label: '厨余', color: 0x4CAF50, type: 'kitchen', x: 370 },
  { label: '有害', color: 0xFF5722, type: 'hazard', x: 570 },
];
const trash = [
  { emoji: '📰', type: 'recycle' }, { emoji: '🍌', type: 'kitchen' },
  { emoji: '🔋', type: 'hazard' }, { emoji: '🥫', type: 'recycle' },
  { emoji: '🍎', type: 'kitchen' }, { emoji: '💊', type: 'hazard' },
  { emoji: '📦', type: 'recycle' }, { emoji: '🥚', type: 'kitchen' },
];
let sorted = 0;

// Draw bins
bins.forEach(b => {
  const bin = new PIXI.Graphics();
  bin.beginFill(b.color, 0.3); bin.drawRoundedRect(-55, -45, 110, 90, 12); bin.endFill();
  bin.lineStyle(3, b.color); bin.drawRoundedRect(-55, -45, 110, 90, 12);
  bin.x = b.x; bin.y = 440;
  const lbl = new PIXI.Text('🗑️ ' + b.label, { fontSize: 14, fill: b.color, fontWeight: 'bold' });
  lbl.anchor.set(0.5); bin.addChild(lbl);
  bin._binType = b.type; bin._isBin = true;
  app.stage.addChild(bin);
});

// Create trash items
const shuffled = [...trash].sort(() => Math.random() - 0.5);
const items = shuffled.map((t, i) => {
  const item = new PIXI.Text(t.emoji, { fontSize: 40 });
  item.anchor.set(0.5);
  item.x = 100 + (i % 4) * 180; item.y = 150 + Math.floor(i / 4) * 100;
  item._startX = item.x; item._startY = item.y;
  item._trashType = t.type;
  item.eventMode = 'static'; item.cursor = 'grab';
  app.stage.addChild(item);
  return item;
});

let dragging = null, dragOff = { x: 0, y: 0 };
items.forEach(item => {
  item.on('pointerdown', e => {
    if (item._sorted) return;
    dragging = item;
    const p = e.data.global;
    dragOff.x = item.x - p.x; dragOff.y = item.y - p.y;
    item.alpha = 0.7; item.zIndex = 100;
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
  const item = dragging;
  let matched = false;
  app.stage.children.filter(c => c._isBin).forEach(bin => {
    const dx = item.x - bin.x, dy = item.y - bin.y;
    if (Math.sqrt(dx*dx+dy*dy) < 70 && item._trashType === bin._binType) {
      item.x = bin.x + (Math.random()-0.5)*40; item.y = bin.y;
      item._sorted = true; item.eventMode = 'none'; item.alpha = 0.5;
      sorted++; matched = true;
      scoreText.text = sorted >= trash.length ? '🎉 全部分类正确! 你是环保小达人!' : '已分类: ' + sorted + '/' + trash.length;
    }
  });
  if (!matched) { item.x = item._startX; item.y = item._startY; }
  item.alpha = item._sorted ? 0.5 : 1; item.zIndex = 0;
  dragging = null;
});
` }],
};
