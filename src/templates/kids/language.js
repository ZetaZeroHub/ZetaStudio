/* ========================================
   语言/识字 (Language) — 3 个新模板
   字母拼图 / 单词拼写 / 侦探破案小剧场
   ======================================== */

// 15. 字母拼图 — 拖拽笔画/字母拼字
export const letterPuzzle = {
  name: '字母拼图',
  description: '拖拽字母拼出正确的单词',
  templateType: 'letterPuzzle',
  dimension: '2D',
  category: 'language',
  icon: '🔤',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E8F5E9', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '🔤 拼出这个词!', fontSize: 26, color: '#2E7D32', bold: true, align: 'center' } },
    { id: 'picture', name: '图片', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 130, anchorX: 0.5 }, textContent: { text: '🍎', fontSize: 80 } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '得分: 0', fontSize: 20, color: '#388E3C', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 字母拼图
const picture = elements['picture'];
const scoreText = elements['score'];
const words = [
  { emoji: '🍎', word: 'APPLE', hint: '苹果' },
  { emoji: '🐱', word: 'CAT', hint: '猫' },
  { emoji: '🐶', word: 'DOG', hint: '狗' },
  { emoji: '🌻', word: 'SUN', hint: '太阳' },
  { emoji: '🐟', word: 'FISH', hint: '鱼' },
];
let score = 0, idx = 0;

function showWord() {
  app.stage.children.filter(c => c._isLetter || c._isSlot).forEach(c => app.stage.removeChild(c));
  if (idx >= words.length) {
    picture.text = '🎉'; elements['title'].text = '太棒了! 全部拼出!';
    scoreText.text = '最终得分: ' + score + '/' + words.length;
    return;
  }
  const w = words[idx];
  picture.text = w.emoji;
  elements['title'].text = '🔤 拼出: ' + w.hint;
  
  const letters = w.word.split('');
  const slotX = 400 - (letters.length * 50) / 2 + 25;
  
  // Create slots
  letters.forEach((l, i) => {
    const slot = new PIXI.Graphics();
    slot.beginFill(0xC8E6C9); slot.drawRoundedRect(-22, -22, 44, 44, 8); slot.endFill();
    slot.lineStyle(2, 0x81C784); slot.drawRoundedRect(-22, -22, 44, 44, 8);
    slot.x = slotX + i * 50; slot.y = 300; slot._slotIdx = i; slot._letter = l; slot._isSlot = true; slot._filled = false;
    app.stage.addChild(slot);
  });
  
  // Shuffled letter tiles
  const shuffled = [...letters].sort(() => Math.random() - 0.5);
  shuffled.forEach((l, i) => {
    const tile = new PIXI.Graphics();
    tile.beginFill(0x4CAF50); tile.drawRoundedRect(-20, -20, 40, 40, 8); tile.endFill();
    tile.x = slotX + i * 50; tile.y = 430;
    tile._startX = tile.x; tile._startY = tile.y;
    tile._letter = l; tile._isLetter = true;
    tile.eventMode = 'static'; tile.cursor = 'grab';
    const label = new PIXI.Text(l, { fontSize: 22, fill: '#fff', fontWeight: 'bold' });
    label.anchor.set(0.5); tile.addChild(label);
    
    tile.on('pointerdown', e => {
      if (tile._placed) return;
      tile._dragging = true;
      const p = e.data.global;
      tile._off = { x: tile.x - p.x, y: tile.y - p.y };
      tile.alpha = 0.7; tile.zIndex = 100;
    });
    app.stage.addChild(tile);
  });
}

app.stage.sortableChildren = true;
app.stage.eventMode = 'static';

app.stage.on('pointermove', e => {
  const tiles = app.stage.children.filter(c => c._isLetter && c._dragging);
  tiles.forEach(t => {
    const p = e.data.global;
    t.x = p.x + t._off.x; t.y = p.y + t._off.y;
  });
});

app.stage.on('pointerup', () => {
  const tiles = app.stage.children.filter(c => c._isLetter && c._dragging);
  tiles.forEach(t => {
    t._dragging = false; t.alpha = 1; t.zIndex = 0;
    const slots = app.stage.children.filter(c => c._isSlot && !c._filled);
    let snapped = false;
    slots.forEach(s => {
      const dx = t.x - s.x, dy = t.y - s.y;
      if (Math.sqrt(dx*dx+dy*dy) < 40 && t._letter === s._letter) {
        t.x = s.x; t.y = s.y;
        t._placed = true; t.eventMode = 'none'; s._filled = true;
        snapped = true;
        const allFilled = app.stage.children.filter(c => c._isSlot).every(c => c._filled);
        if (allFilled) {
          score++; idx++;
          scoreText.text = '✅ 正确! 得分: ' + score;
          setTimeout(showWord, 800);
        }
      }
    });
    if (!snapped) { t.x = t._startX; t.y = t._startY; }
  });
});

showWord();
` }],
};

// 16. 单词拼写 — 从字母池拼出单词
export const wordSpell = {
  name: '单词拼写',
  description: '听提示，从字母中拼出正确的词',
  templateType: 'wordSpell',
  dimension: '2D',
  category: 'language',
  icon: '📝',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#FFF8E1', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, anchorX: 0.5 }, textContent: { text: '📝 点击字母拼出正确的词!', fontSize: 24, color: '#E65100', bold: true, align: 'center' } },
    { id: 'hint', name: '提示', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 110, anchorX: 0.5 }, textContent: { text: '🐱 = ?', fontSize: 60 } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '得分: 0', fontSize: 20, color: '#F57C00', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 单词拼写
const hintText = elements['hint'];
const scoreText = elements['score'];
const words = [
  { emoji: '🐱', answer: '猫咪', letters: '猫鸟咪狗花' },
  { emoji: '🌺', answer: '花朵', letters: '花草朵树叶' },
  { emoji: '🌈', answer: '彩虹', letters: '彩云虹雨风' },
  { emoji: '🐟', answer: '小鱼', letters: '小大鱼鸟虫' },
  { emoji: '🌙', answer: '月亮', letters: '日月亮星光' },
];
let score = 0, idx = 0, selected = '';

function showQuestion() {
  app.stage.children.filter(c => c._isUI).forEach(c => app.stage.removeChild(c));
  selected = '';
  if (idx >= words.length) {
    hintText.text = '🎉'; elements['title'].text = '全部拼写正确!';
    scoreText.text = '最终得分: ' + score + '/' + words.length;
    return;
  }
  const w = words[idx];
  hintText.text = w.emoji + ' = ?';
  
  // Display area
  const display = new PIXI.Text('', { fontSize: 36, fill: '#E65100', fontWeight: 'bold' });
  display.anchor.set(0.5); display.x = 400; display.y = 250; display._isUI = true;
  app.stage.addChild(display);
  
  // Letter buttons (shuffled)
  const letters = w.letters.split('').sort(() => Math.random() - 0.5);
  letters.forEach((l, i) => {
    const btn = new PIXI.Graphics();
    btn.beginFill(0xFFB300); btn.drawRoundedRect(-25, -25, 50, 50, 10); btn.endFill();
    btn.x = 170 + i * 95; btn.y = 380;
    btn.eventMode = 'static'; btn.cursor = 'pointer'; btn._isUI = true;
    const label = new PIXI.Text(l, { fontSize: 24, fill: '#fff', fontWeight: 'bold' });
    label.anchor.set(0.5); btn.addChild(label);
    
    btn.on('pointerdown', () => {
      if (btn._used) return;
      btn._used = true; btn.alpha = 0.4;
      selected += l;
      display.text = selected;
      
      if (selected === w.answer) {
        score++; idx++;
        scoreText.text = '✅ 正确! 得分: ' + score;
        setTimeout(showQuestion, 800);
      } else if (selected.length >= w.answer.length) {
        scoreText.text = '❌ 正确答案: ' + w.answer;
        idx++;
        setTimeout(showQuestion, 1200);
      }
    });
    app.stage.addChild(btn);
  });
  
  // Clear button
  const clearBtn = new PIXI.Graphics();
  clearBtn.beginFill(0xEF5350); clearBtn.drawRoundedRect(-30, -18, 60, 36, 8); clearBtn.endFill();
  clearBtn.x = 400; clearBtn.y = 470; clearBtn.eventMode = 'static'; clearBtn.cursor = 'pointer';
  clearBtn._isUI = true;
  const clrLbl = new PIXI.Text('清除', { fontSize: 14, fill: '#fff', fontWeight: 'bold' });
  clrLbl.anchor.set(0.5); clearBtn.addChild(clrLbl);
  clearBtn.on('pointerdown', () => {
    selected = ''; display.text = '';
    app.stage.children.filter(c => c._isUI && c.alpha < 1).forEach(c => { c._used = false; c.alpha = 1; });
  });
  app.stage.addChild(clearBtn);
}

showQuestion();
` }],
};

// 17. 侦探破案小剧场 — 互动叙事推理
export const detective = {
  name: '侦探破案',
  description: '收集线索，找出真凶!',
  templateType: 'detective',
  dimension: '2D',
  category: 'language',
  icon: '🕵️',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#263238', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 25, anchorX: 0.5 }, textContent: { text: '🕵️ 小侦探出动!', fontSize: 28, color: '#FFD54F', bold: true, align: 'center' } },
    { id: 'story', name: '剧情', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 80, anchorX: 0.5 }, textContent: { text: '', fontSize: 18, color: '#ECEFF1' } },
    { id: 'clue', name: '线索', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 560, anchorX: 0.5 }, textContent: { text: '🔍 线索: 0/3', fontSize: 16, color: '#FFD54F', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 侦探破案小剧场
const storyText = elements['story'];
const clueText = elements['clue'];
let cluesFound = 0;
let stage = 0;

const scenes = [
  {
    text: '🏫 学校里的蛋糕不见了!\\n小明、小红、小刚都在场。\\n你需要找到 3 条线索来破案!',
    items: [
      { emoji: '👣', x: 200, y: 350, clue: '发现巧克力脚印通向教室后门', found: false },
      { emoji: '🧤', x: 500, y: 300, clue: '桌上有一只沾了奶油的手套', found: false },
      { emoji: '📝', x: 350, y: 400, clue: '小红的日记: "今天想吃蛋糕"', found: false },
    ],
  },
  {
    text: '🤔 分析线索:\\n1. 巧克力脚印 → 去了后门\\n2. 奶油手套 → 碰过蛋糕\\n3. 小红的日记 → 有动机\\n\\n谁是嫌疑人?',
    choices: [
      { text: '小明', correct: false, reason: '小明有不在场证明' },
      { text: '小红', correct: true, reason: '线索都指向小红!' },
      { text: '小刚', correct: false, reason: '小刚当时在操场' },
    ],
  },
  {
    text: '🎉 案件侦破!\\n\\n小红承认是她偷吃了蛋糕，\\n因为实在太好吃了!\\n\\n🏆 你是一名出色的小侦探!',
    choices: null,
  },
];

function showScene() {
  app.stage.children.filter(c => c._isUI).forEach(c => app.stage.removeChild(c));
  const scene = scenes[stage];
  storyText.text = scene.text;
  
  if (scene.items) {
    scene.items.forEach(item => {
      const obj = new PIXI.Text(item.emoji, { fontSize: 40 });
      obj.anchor.set(0.5); obj.x = item.x; obj.y = item.y;
      obj.eventMode = 'static'; obj.cursor = 'pointer'; obj._isUI = true;
      obj.alpha = 0.6;
      
      // Pulsing animation
      let phase = Math.random() * Math.PI * 2;
      const ticker = () => { phase += 0.05; obj.scale.set(1 + Math.sin(phase) * 0.1); };
      app.ticker.add(ticker);
      
      obj.on('pointerdown', () => {
        if (item.found) return;
        item.found = true; obj.alpha = 1;
        cluesFound++;
        clueText.text = '🔍 线索 ' + cluesFound + '/3: ' + item.clue;
        
        // Flash effect
        obj.scale.set(1.5);
        setTimeout(() => { obj.scale.set(1); }, 200);
        
        if (cluesFound >= 3) {
          setTimeout(() => { stage = 1; showScene(); }, 1500);
        }
      });
      app.stage.addChild(obj);
    });
  }
  
  if (scene.choices) {
    scene.choices.forEach((choice, i) => {
      const btn = new PIXI.Graphics();
      btn.beginFill(0x455A64); btn.drawRoundedRect(-100, -22, 200, 44, 10); btn.endFill();
      btn.lineStyle(1, 0x607D8B); btn.drawRoundedRect(-100, -22, 200, 44, 10);
      btn.x = 400; btn.y = 400 + i * 60;
      btn.eventMode = 'static'; btn.cursor = 'pointer'; btn._isUI = true;
      const label = new PIXI.Text(choice.text, { fontSize: 18, fill: '#fff', fontWeight: 'bold' });
      label.anchor.set(0.5); btn.addChild(label);
      
      btn.on('pointerdown', () => {
        if (choice.correct) {
          clueText.text = '✅ ' + choice.reason;
          stage = 2;
          setTimeout(showScene, 1500);
        } else {
          clueText.text = '❌ ' + choice.reason + ' 再想想!';
          btn.alpha = 0.3; btn.eventMode = 'none';
        }
      });
      app.stage.addChild(btn);
    });
  }
  
  if (!scene.items && !scene.choices) {
    // Final scene — show badge
    const badge = new PIXI.Text('🏆', { fontSize: 80 });
    badge.anchor.set(0.5); badge.x = 400; badge.y = 420; badge._isUI = true;
    badge.scale.set(0);
    app.stage.addChild(badge);
    // Animate badge
    let t = 0;
    const anim = () => {
      t += 0.05;
      const s = Math.min(1, t);
      badge.scale.set(s);
      badge.rotation = Math.sin(t * 3) * 0.1;
      if (t >= 1) { app.ticker.remove(anim); badge.rotation = 0; }
    };
    app.ticker.add(anim);
    clueText.text = '🕵️ 案件侦破! 你获得了侦探徽章!';
  }
}

showScene();
` }],
};
