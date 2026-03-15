/* ========================================
   反应/经典 (Reaction) — 7 个新模板  
   迷宫 / 气球射击 / 俄罗斯方块 / 打砖块 /
   横版摩托车 / 跳跃闯关 / 射箭大作战
   ======================================== */

// 24. 迷宫 — 拖拽角色走出迷宫
export const maze = {
  name: '迷宫冒险',
  description: '帮小角色走出迷宫!',
  templateType: 'maze',
  dimension: '2D',
  category: 'reaction',
  icon: '🏰',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#EFEBE9', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 15, anchorX: 0.5 }, textContent: { text: '🏰 迷宫冒险 — 方向键移动!', fontSize: 22, color: '#4E342E', bold: true, align: 'center' } },
    { id: 'score', name: '信息', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 575, anchorX: 0.5 }, textContent: { text: '用方向键 ↑↓←→ 移动', fontSize: 16, color: '#6D4C41', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 迷宫
const scoreText = elements['score'];
// 0=path 1=wall 2=start 3=end
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,1,0,0,0,1,0,0,0,0,0,0,1],
  [1,1,0,1,0,1,0,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,3,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const cellSize = 36;
const offsetX = (800 - map[0].length * cellSize) / 2;
const offsetY = 45;
let playerR = 1, playerC = 1;
let moves = 0;

// Draw maze
const mazeGfx = new PIXI.Graphics();
map.forEach((row, r) => {
  row.forEach((cell, c) => {
    const x = offsetX + c * cellSize, y = offsetY + r * cellSize;
    if (cell === 1) { mazeGfx.beginFill(0x5D4037); mazeGfx.drawRect(x, y, cellSize, cellSize); mazeGfx.endFill(); }
    else if (cell === 3) { mazeGfx.beginFill(0x4CAF50, 0.5); mazeGfx.drawRect(x, y, cellSize, cellSize); mazeGfx.endFill(); }
    else { mazeGfx.beginFill(0xFFF8E1); mazeGfx.drawRect(x, y, cellSize, cellSize); mazeGfx.endFill(); }
  });
});
app.stage.addChild(mazeGfx);

// Exit marker
const exit = new PIXI.Text('🏁', { fontSize: 22 });
exit.anchor.set(0.5);
map.forEach((row, r) => row.forEach((cell, c) => { if (cell === 3) { exit.x = offsetX + c*cellSize + cellSize/2; exit.y = offsetY + r*cellSize + cellSize/2; } if (cell === 2) { playerR = r; playerC = c; } }));
app.stage.addChild(exit);

// Player
const player = new PIXI.Text('🐱', { fontSize: 22 });
player.anchor.set(0.5);
player.x = offsetX + playerC * cellSize + cellSize/2;
player.y = offsetY + playerR * cellSize + cellSize/2;
app.stage.addChild(player);

const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.code] = false; });

let moving = false;
function tryMove(dr, dc) {
  if (moving) return;
  const nr = playerR + dr, nc = playerC + dc;
  if (nr < 0 || nr >= map.length || nc < 0 || nc >= map[0].length) return;
  if (map[nr][nc] === 1) return;
  moving = true; playerR = nr; playerC = nc; moves++;
  const tx = offsetX + nc * cellSize + cellSize/2;
  const ty = offsetY + nr * cellSize + cellSize/2;
  // Smooth move
  const sx = player.x, sy = player.y;
  let t = 0;
  const anim = () => {
    t += 0.15; if (t > 1) t = 1;
    player.x = sx + (tx - sx) * t; player.y = sy + (ty - sy) * t;
    if (t >= 1) { app.ticker.remove(anim); moving = false;
      if (map[nr][nc] === 3) { scoreText.text = '🎉 逃出迷宫! 用了 ' + moves + ' 步!'; elements['title'].text = '🏆 恭喜通关!'; }
      else scoreText.text = '步数: ' + moves;
    }
  };
  app.ticker.add(anim);
}

app.ticker.add(() => {
  if (keys['ArrowUp'] || keys['KeyW']) tryMove(-1, 0);
  if (keys['ArrowDown'] || keys['KeyS']) tryMove(1, 0);
  if (keys['ArrowLeft'] || keys['KeyA']) tryMove(0, -1);
  if (keys['ArrowRight'] || keys['KeyD']) tryMove(0, 1);
});

// Mobile controls
const dirs = [{emoji:'⬆️',dr:-1,dc:0,x:400,y:460},{emoji:'⬇️',dr:1,dc:0,x:400,y:540},{emoji:'⬅️',dr:0,dc:-1,x:340,y:500},{emoji:'➡️',dr:0,dc:1,x:460,y:500}];
dirs.forEach(d => {
  const btn = new PIXI.Text(d.emoji, { fontSize: 28 });
  btn.anchor.set(0.5); btn.x = d.x; btn.y = d.y;
  btn.eventMode = 'static'; btn.cursor = 'pointer';
  btn.on('pointerdown', () => tryMove(d.dr, d.dc));
  app.stage.addChild(btn);
});
` }],
};

// 25. 气球射击 — 点击飞过的气球得分
export const balloonPop = {
  name: '气球射击',
  description: '点击气球得分!',
  templateType: 'balloonPop',
  dimension: '2D',
  category: 'reaction',
  icon: '🎈',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E1F5FE', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 20, anchorX: 0.5 }, textContent: { text: '🎈 戳破气球!', fontSize: 26, color: '#01579B', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 565, anchorX: 0.5 }, textContent: { text: '得分: 0 | 剩余: 30秒', fontSize: 20, color: '#0277BD', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 气球射击
const scoreText = elements['score'];
const balloonColors = [0xFF5252, 0x448AFF, 0x69F0AE, 0xFFD740, 0xE040FB, 0xFF6E40];
let score = 0, timeLeft = 30, combo = 0;
const balloons = [];

function spawnBalloon() {
  if (timeLeft <= 0) return;
  const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
  const isGolden = Math.random() < 0.1;
  const b = new PIXI.Graphics();
  b.beginFill(isGolden ? 0xFFD700 : color);
  b.drawEllipse(0, 0, 22, 30);
  b.endFill();
  // String
  b.lineStyle(1, 0x999); b.moveTo(0, 30); b.lineTo(0, 55);
  b.x = 30 + Math.random() * 740; b.y = 640;
  b._speed = 1 + Math.random() * 2;
  b._golden = isGolden;
  b._wobble = Math.random() * Math.PI * 2;
  b.eventMode = 'static'; b.cursor = 'pointer';
  
  b.on('pointerdown', () => {
    const pts = b._golden ? 5 : 1;
    score += pts; combo++;
    // Pop effect
    const pop = new PIXI.Text('+' + pts + (combo >= 3 ? ' x' + combo : ''), { fontSize: 16, fill: '#FF1744', fontWeight: 'bold' });
    pop.anchor.set(0.5); pop.x = b.x; pop.y = b.y;
    app.stage.addChild(pop);
    let t = 0;
    const anim = () => { t += 0.05; pop.y -= 2; pop.alpha = 1 - t; if (t >= 1) { app.ticker.remove(anim); app.stage.removeChild(pop); } };
    app.ticker.add(anim);
    
    app.stage.removeChild(b);
    balloons.splice(balloons.indexOf(b), 1);
    scoreText.text = '得分: ' + score + ' | 剩余: ' + timeLeft + '秒' + (combo >= 3 ? ' 🔥x' + combo : '');
  });
  
  app.stage.addChild(b);
  balloons.push(b);
}

// Animation
app.ticker.add(() => {
  for (let i = balloons.length - 1; i >= 0; i--) {
    const b = balloons[i];
    b.y -= b._speed;
    b._wobble += 0.03;
    b.x += Math.sin(b._wobble) * 0.5;
    if (b.y < -60) {
      combo = 0;
      app.stage.removeChild(b); balloons.splice(i, 1);
    }
  }
});

// Timer
const timer = setInterval(() => {
  timeLeft--;
  scoreText.text = '得分: ' + score + ' | 剩余: ' + timeLeft + '秒';
  if (timeLeft <= 0) {
    clearInterval(timer); clearInterval(spawner);
    elements['title'].text = '⏰ 时间到! 最终得分: ' + score;
    balloons.forEach(b => { b.eventMode = 'none'; });
  }
}, 1000);

const spawner = setInterval(spawnBalloon, 500);
spawnBalloon();
` }],
};

// 26. 俄罗斯方块
export const tetris = {
  name: '俄罗斯方块',
  description: '经典俄罗斯方块!',
  templateType: 'tetris',
  dimension: '2D',
  category: 'reaction',
  icon: '🧱',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#1A237E', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 10, anchorX: 0.5 }, textContent: { text: '🧱 俄罗斯方块', fontSize: 22, color: '#E8EAF6', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 650, y: 100, anchorX: 0.5 }, textContent: { text: '得分: 0  等级: 1  行数: 0', fontSize: 14, color: '#C5CAE9', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 俄罗斯方块 — 自动下落+积分+升级
const scoreText = elements['score'];
const COLS = 10, ROWS = 20, CELL = 26;
const boardX = 200, boardY = 35;
let score = 0, level = 1, totalLines = 0;
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const colors = [0, 0x00BCD4, 0xFFEB3B, 0x9C27B0, 0x4CAF50, 0xFF5722, 0x2196F3, 0xE91E63];

const shapes = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0],[1,0],[1,1]],
  [[0,1],[0,1],[1,1]],
  [[0,1,1],[1,1,0]],
  [[1,1,0],[0,1,1]],
];

const boardGfx = new PIXI.Graphics();
app.stage.addChild(boardGfx);

let currentPiece = null, nextType = 0, px = 0, py = 0, pieceType = 0;
let gameOver = false, paused = false, dropTimer = 0;
let flashLines = [], flashTimer = 0;

nextType = Math.floor(Math.random() * shapes.length) + 1;

function newPiece() {
  pieceType = nextType;
  nextType = Math.floor(Math.random() * shapes.length) + 1;
  currentPiece = shapes[pieceType - 1].map(r => [...r]);
  px = Math.floor((COLS - currentPiece[0].length) / 2); py = 0;
  if (!canPlace(px, py, currentPiece)) {
    gameOver = true;
    elements['title'].text = '💀 游戏结束! 得分: ' + score + ' (等级' + level + ')';
  }
}

function canPlace(cx, cy, piece) {
  for (let r = 0; r < piece.length; r++)
    for (let c = 0; c < piece[r].length; c++)
      if (piece[r][c]) {
        const nr = cy + r, nc = cx + c;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc]) return false;
      }
  return true;
}

function getGhostY() {
  let gy = py;
  while (canPlace(px, gy + 1, currentPiece)) gy++;
  return gy;
}

function placePiece() {
  for (let r = 0; r < currentPiece.length; r++)
    for (let c = 0; c < currentPiece[r].length; c++)
      if (currentPiece[r][c]) board[py + r][px + c] = pieceType;
  let cleared = 0;
  flashLines = [];
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(c => c !== 0)) {
      flashLines.push(r);
      cleared++;
    }
  }
  if (cleared > 0) {
    flashTimer = 15;
    totalLines += cleared;
    const pts = [0, 100, 300, 500, 800][Math.min(cleared, 4)];
    score += pts * level;
    level = Math.floor(totalLines / 10) + 1;
    if (level > 1 && totalLines % 10 === 0) {
      elements['title'].text = '⬆️ 升级! 等级 ' + level;
      setTimeout(() => { if (!gameOver) elements['title'].text = '🧱 俄罗斯方块'; }, 2000);
    }
  }
  updateHud();
}

function clearFlashLines() {
  flashLines.sort((a,b) => b - a);
  flashLines.forEach(r => {
    board.splice(r, 1);
    board.unshift(Array(COLS).fill(0));
  });
  flashLines = [];
}

function updateHud() {
  scoreText.text = '得分: ' + score + '  等级: ' + level + '  行: ' + totalLines;
}

function rotate(piece) {
  const rows = piece.length, cols = piece[0].length;
  return Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (_, r) => piece[rows - 1 - r][c]));
}

function draw() {
  boardGfx.clear();
  boardGfx.lineStyle(2, 0x3F51B5);
  boardGfx.drawRect(boardX - 1, boardY - 1, COLS * CELL + 2, ROWS * CELL + 2);
  boardGfx.beginFill(0x0D1B2A); boardGfx.drawRect(boardX, boardY, COLS * CELL, ROWS * CELL); boardGfx.endFill();
  // Grid lines
  boardGfx.lineStyle(1, 0x1A2744, 0.3);
  for (let r = 1; r < ROWS; r++) { boardGfx.moveTo(boardX, boardY + r*CELL); boardGfx.lineTo(boardX + COLS*CELL, boardY + r*CELL); }
  for (let c = 1; c < COLS; c++) { boardGfx.moveTo(boardX + c*CELL, boardY); boardGfx.lineTo(boardX + c*CELL, boardY + ROWS*CELL); }
  boardGfx.lineStyle(0);
  // Placed blocks
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (board[r][c]) {
      const flashing = flashLines.includes(r) && flashTimer > 0;
      boardGfx.beginFill(flashing ? 0xFFFFFF : colors[board[r][c]]);
      boardGfx.drawRect(boardX + c*CELL+1, boardY + r*CELL+1, CELL-2, CELL-2);
      boardGfx.endFill();
    }
  }
  if (currentPiece && !gameOver) {
    // Ghost
    const gy = getGhostY();
    for (let r = 0; r < currentPiece.length; r++)
      for (let c = 0; c < currentPiece[r].length; c++)
        if (currentPiece[r][c]) {
          boardGfx.beginFill(colors[pieceType], 0.2);
          boardGfx.drawRect(boardX + (px+c)*CELL+1, boardY + (gy+r)*CELL+1, CELL-2, CELL-2);
          boardGfx.endFill();
        }
    // Active piece
    for (let r = 0; r < currentPiece.length; r++)
      for (let c = 0; c < currentPiece[r].length; c++)
        if (currentPiece[r][c]) {
          boardGfx.beginFill(colors[pieceType]);
          boardGfx.drawRect(boardX + (px+c)*CELL+1, boardY + (py+r)*CELL+1, CELL-2, CELL-2);
          boardGfx.endFill();
        }
  }
  // Next piece preview
  boardGfx.beginFill(0x1A237E); boardGfx.drawRoundedRect(590, 350, 120, 100, 8); boardGfx.endFill();
  boardGfx.lineStyle(1, 0x3F51B5); boardGfx.drawRoundedRect(590, 350, 120, 100, 8); boardGfx.lineStyle(0);
  const np = shapes[nextType - 1];
  const npOffX = 650 - (np[0].length * 14) / 2;
  const npOffY = 400 - (np.length * 14) / 2;
  for (let r = 0; r < np.length; r++)
    for (let c = 0; c < np[r].length; c++)
      if (np[r][c]) {
        boardGfx.beginFill(colors[nextType]);
        boardGfx.drawRect(npOffX + c*14, npOffY + r*14, 12, 12);
        boardGfx.endFill();
      }
}

// Controls
const keys = {};
window.addEventListener('keydown', e => {
  if (gameOver) { if (e.code === 'Space') { restartGame(); } return; }
  if (e.code === 'ArrowLeft' && canPlace(px-1, py, currentPiece)) px--;
  if (e.code === 'ArrowRight' && canPlace(px+1, py, currentPiece)) px++;
  if (e.code === 'ArrowDown') { if (canPlace(px, py+1, currentPiece)) { py++; score += 1; dropTimer = 0; } }
  if (e.code === 'ArrowUp') { const r = rotate(currentPiece); if (canPlace(px, py, r)) currentPiece = r; }
  if (e.code === 'Space') { while (canPlace(px, py+1, currentPiece)) { py++; score += 2; } dropTimer = 0; }
  e.preventDefault();
});

function restartGame() {
  for (let r = 0; r < ROWS; r++) board[r].fill(0);
  score = 0; level = 1; totalLines = 0; gameOver = false; dropTimer = 0;
  flashLines = []; flashTimer = 0;
  nextType = Math.floor(Math.random() * shapes.length) + 1;
  elements['title'].text = '🧱 俄罗斯方块';
  updateHud(); newPiece();
}

// Mobile buttons
const ctrls = [
  {label:'⬅️',x:620,y:230,fn:()=>{if(!gameOver&&canPlace(px-1,py,currentPiece))px--;}},
  {label:'➡️',x:720,y:230,fn:()=>{if(!gameOver&&canPlace(px+1,py,currentPiece))px++;}},
  {label:'🔄',x:670,y:180,fn:()=>{if(!gameOver){const r=rotate(currentPiece);if(canPlace(px,py,r))currentPiece=r;}}},
  {label:'⬇️',x:670,y:280,fn:()=>{if(!gameOver)while(canPlace(px,py+1,currentPiece)){py++;score+=2;}}},
];
ctrls.forEach(c => {
  const btn = new PIXI.Text(c.label, { fontSize: 28 });
  btn.anchor.set(0.5); btn.x = c.x; btn.y = c.y;
  btn.eventMode = 'static'; btn.cursor = 'pointer';
  btn.on('pointerdown', c.fn);
  app.stage.addChild(btn);
});

// Next label
const nxtLbl = new PIXI.Text('下一个', { fontSize: 13, fill: '#7986CB', fontWeight: 'bold' });
nxtLbl.anchor.set(0.5); nxtLbl.x = 650; nxtLbl.y = 340;
app.stage.addChild(nxtLbl);

newPiece();

app.ticker.add((ticker) => {
  const delta = ticker.deltaTime;
  if (gameOver) { draw(); return; }
  // Flash animation
  if (flashTimer > 0) {
    flashTimer -= delta;
    if (flashTimer <= 0) clearFlashLines();
    draw(); return;
  }
  dropTimer += delta;
  const speed = Math.max(3, 20 - level * 2);
  if (dropTimer >= speed) {
    dropTimer = 0;
    if (canPlace(px, py+1, currentPiece)) py++;
    else { placePiece(); newPiece(); }
  }
  draw();
});
` }],
};

// 27. 打砖块
export const breakout = {
  name: '打砖块',
  description: '经典打砖块消除!',
  templateType: 'breakout',
  dimension: '2D',
  category: 'reaction',
  icon: '🧱',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#212121', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 10, anchorX: 0.5 }, textContent: { text: '🧱 打砖块', fontSize: 22, color: '#fff', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 580, anchorX: 0.5 }, textContent: { text: '得分: 0 | ❤️❤️❤️', fontSize: 18, color: '#fff', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 打砖块
const scoreText = elements['score'];
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);
let score = 0, lives = 3, level = 1;

// Paddle
let paddleX = 400, paddleW = 100, paddleH = 14;
// Ball
let ballX = 400, ballY = 500, ballDX = 3, ballDY = -3, ballR = 8;
let launched = false;

// Bricks
const brickRows = 5, brickCols = 10, brickW = 68, brickH = 20, brickGap = 4;
const brickStartX = 50, brickStartY = 50;
const brickColors = [0xFF5252, 0xFF9800, 0xFFEB3B, 0x4CAF50, 0x2196F3];
let bricks = [];

function initBricks() {
  bricks = [];
  for (let r = 0; r < brickRows; r++)
    for (let c = 0; c < brickCols; c++)
      bricks.push({ x: brickStartX + c * (brickW + brickGap), y: brickStartY + r * (brickH + brickGap), w: brickW, h: brickH, color: brickColors[r], alive: true, hits: r < 2 ? 2 : 1 });
}

initBricks();

// Controls
app.stage.eventMode = 'static';
app.stage.on('pointermove', e => { paddleX = Math.max(paddleW/2, Math.min(800-paddleW/2, e.data.global.x)); });
const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') launched = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

function resetBall() {
  ballX = paddleX; ballY = 530 - paddleH - ballR;
  ballDX = 3 * (Math.random() > 0.5 ? 1 : -1); ballDY = -3;
  launched = false;
}

app.ticker.add(() => {
  // Keyboard
  if (keys['ArrowLeft']) paddleX = Math.max(paddleW/2, paddleX - 7);
  if (keys['ArrowRight']) paddleX = Math.min(800-paddleW/2, paddleX + 7);
  
  if (!launched) { ballX = paddleX; ballY = 530 - paddleH - ballR; }
  else {
    ballX += ballDX * (1 + level * 0.2);
    ballY += ballDY * (1 + level * 0.2);
    
    // Wall bounce
    if (ballX < ballR || ballX > 800-ballR) ballDX = -ballDX;
    if (ballY < ballR) ballDY = -ballDY;
    
    // Paddle bounce
    if (ballY + ballR > 530 - paddleH && ballY < 530 && ballX > paddleX - paddleW/2 && ballX < paddleX + paddleW/2) {
      ballDY = -Math.abs(ballDY);
      ballDX = ((ballX - paddleX) / (paddleW/2)) * 4;
    }
    
    // Miss
    if (ballY > 610) {
      lives--;
      scoreText.text = '得分: ' + score + ' | ' + '❤️'.repeat(Math.max(0,lives));
      if (lives <= 0) { elements['title'].text = '💀 游戏结束! 得分: ' + score; launched = false; return; }
      resetBall();
    }
    
    // Brick collision
    bricks.forEach(b => {
      if (!b.alive) return;
      if (ballX + ballR > b.x && ballX - ballR < b.x + b.w && ballY + ballR > b.y && ballY - ballR < b.y + b.h) {
        b.hits--;
        if (b.hits <= 0) { b.alive = false; score += 10 * level; }
        ballDY = -ballDY;
        scoreText.text = '得分: ' + score + ' | ' + '❤️'.repeat(lives);
      }
    });
    
    // Level complete
    if (bricks.every(b => !b.alive)) {
      level++; initBricks(); resetBall();
      elements['title'].text = '🧱 第 ' + level + ' 关!';
    }
  }
  
  // Draw
  gfx.clear();
  // Paddle
  gfx.beginFill(0xE0E0E0); gfx.drawRoundedRect(paddleX - paddleW/2, 530 - paddleH, paddleW, paddleH, 4); gfx.endFill();
  // Ball
  gfx.beginFill(0xFFFFFF); gfx.drawCircle(ballX, ballY, ballR); gfx.endFill();
  // Bricks
  bricks.forEach(b => {
    if (!b.alive) return;
    gfx.beginFill(b.color, b.hits > 1 ? 1 : 0.7); gfx.drawRoundedRect(b.x, b.y, b.w, b.h, 3); gfx.endFill();
  });
});
` }],
};

// 28. 横版摩托车竞速
export const motorbike = {
  name: '摩托车冲刺',
  description: '跳跃障碍, 超越对手冲刺!',
  templateType: 'motorbike',
  dimension: '2D',
  category: 'reaction',
  icon: '🏍️',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#ECEFF1', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 10, anchorX: 0.5 }, textContent: { text: '🏍️ 摩托车竞速 — 点击跳跃!', fontSize: 22, color: '#1A237E', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 570, anchorX: 0.5 }, textContent: { text: '第1名 | 距离: 0m', fontSize: 16, color: '#333', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 摩托车竞速 — 带竞争对手
const scoreText = elements['score'];
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);
const groundY = 400;
let distance = 0;
let playerSpeed = 5, baseSpeed = 5;
let bikeY = groundY, bikeVY = 0, isJumping = false;
const gravity = 0.55;
const obstacles = [];
let nextObstacle = 200;
let stunTimer = 0, boostTimer = 0;

// 竞争对手
const rivals = [
  { name: '小红', color: 0xFF5252, x: 300, speed: 4.2, baseSpeed: 4.2, y: groundY - 40, vy: 0, jumping: false, stun: 0 },
  { name: '小蓝', color: 0x2196F3, x: 250, speed: 4.5, baseSpeed: 4.5, y: groundY, vy: 0, jumping: false, stun: 0 },
  { name: '小绿', color: 0x4CAF50, x: 200, speed: 4.0, baseSpeed: 4.0, y: groundY + 40, vy: 0, jumping: false, stun: 0 },
];
const laneYs = [groundY - 40, groundY, groundY + 40];

// 跳跃
function jump() { if (!isJumping) { bikeVY = -11; isJumping = true; } }
window.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { jump(); e.preventDefault(); }
});
app.stage.eventMode = 'static';
app.stage.on('pointerdown', jump);

app.ticker.add(() => {
  distance++;
  // 速度恢复
  if (stunTimer > 0) { stunTimer--; playerSpeed = Math.max(2, baseSpeed * 0.5); }
  else if (boostTimer > 0) { boostTimer--; playerSpeed = Math.min(12, baseSpeed * 1.5); }
  else { playerSpeed += (baseSpeed - playerSpeed) * 0.05; }
  baseSpeed = 5 + Math.floor(distance / 300) * 0.3;
  
  // 跳跃物理
  if (isJumping) {
    bikeVY += gravity; bikeY += bikeVY;
    if (bikeY >= groundY) { bikeY = groundY; isJumping = false; bikeVY = 0; }
  }
  
  // 障碍物生成 — 间距大
  nextObstacle -= playerSpeed;
  if (nextObstacle <= 0) {
    const h = 20 + Math.random() * 25;
    obstacles.push({ x: 830, h, type: Math.random() > 0.3 ? 'rock' : 'ramp' });
    nextObstacle = 250 + Math.random() * 300;
  }
  obstacles.forEach(o => { o.x -= playerSpeed; });
  while (obstacles.length > 0 && obstacles[0].x < -60) obstacles.shift();
  
  // 玩家碰撞
  obstacles.forEach(o => {
    if (o.x > 100 && o.x < 165) {
      if (!isJumping || bikeY + 15 > groundY - o.h) {
        if (o.type === 'ramp' && isJumping) {
          boostTimer = 60; o.x = -100;
        } else if (!o._hit) {
          o._hit = true; stunTimer = 40;
        }
      } else if (!o._cleared) {
        o._cleared = true; boostTimer = 20;
      }
    }
  });
  
  // AI 对手
  rivals.forEach(r => {
    if (r.stun > 0) { r.stun--; r.speed = r.baseSpeed * 0.4; }
    else { r.speed += (r.baseSpeed + Math.random() * 0.3 - 0.15 - r.speed) * 0.03; }
    r.baseSpeed = r.baseSpeed + (distance / 5000) * 0.01;
    r.x += (r.speed - playerSpeed) * 0.8;
    r.x = Math.max(-100, Math.min(900, r.x));
    
    // AI 跳跃
    obstacles.forEach(o => {
      const relX = o.x - r.x;
      if (relX > 0 && relX < 80 && !r.jumping && Math.random() > 0.15) {
        r.vy = -10; r.jumping = true;
      }
    });
    if (r.jumping) {
      r.vy += gravity; r.y += r.vy;
      const homeY = laneYs[rivals.indexOf(r)];
      if (r.y >= homeY) { r.y = homeY; r.jumping = false; r.vy = 0; }
    }
    
    // AI 碰撞
    obstacles.forEach(o => {
      const ri = rivals.indexOf(r);
      if (Math.abs(o.x - r.x) < 30 && (!r.jumping || r.y + 10 > laneYs[ri] - o.h)) {
        if (!o['_rh' + ri]) { o['_rh' + ri] = true; r.stun = 50; }
      }
    });
  });
  
  // 排名
  const allR = [{name:'你', x: 150, isPlayer: true}, ...rivals];
  allR.sort((a, b) => b.x - a.x);
  const rank = allR.findIndex(r => r.isPlayer) + 1;
  const medals = ['🥇','🥈','🥉','4️⃣'];
  scoreText.text = medals[rank-1] + ' 第' + rank + '名 | ' + Math.floor(distance/10) + 'm' + (stunTimer > 0 ? ' 💥减速!' : '') + (boostTimer > 0 ? ' 🚀加速!' : '');
  
  // 绘制
  gfx.clear();
  gfx.beginFill(0x87CEEB); gfx.drawRect(0, 0, 800, groundY + 70); gfx.endFill();
  // 远山
  [100, 300, 550, 700].forEach((mx, i) => {
    gfx.beginFill(0xB0BEC5, 0.4);
    gfx.moveTo(mx - 80, groundY - 20); gfx.lineTo(mx, groundY - 80 - i*15); gfx.lineTo(mx + 80, groundY - 20);
    gfx.closePath(); gfx.endFill();
  });
  // 地面和路面
  gfx.beginFill(0x8D6E63); gfx.drawRect(0, groundY + 70, 800, 130); gfx.endFill();
  gfx.beginFill(0x607D8B); gfx.drawRect(0, groundY - 50, 800, 125); gfx.endFill();
  // 车道线
  for (let i = 0; i < 12; i++) {
    const lx = ((i * 80 - distance * 2) % 960 + 960) % 960 - 80;
    gfx.beginFill(0xFFFFFF, 0.4); gfx.drawRect(lx, groundY - 2, 35, 3); gfx.endFill();
    gfx.beginFill(0xFFFFFF, 0.3); gfx.drawRect(lx, groundY + 38, 35, 3); gfx.endFill();
  }
  gfx.beginFill(0xFFFFFF, 0.6); gfx.drawRect(0, groundY - 52, 800, 3); gfx.drawRect(0, groundY + 73, 800, 3); gfx.endFill();
  
  // 障碍物
  obstacles.forEach(o => {
    const oy = groundY + 15;
    if (o.type === 'ramp') {
      gfx.beginFill(0xFFC107);
      gfx.moveTo(o.x, oy); gfx.lineTo(o.x + 25, oy); gfx.lineTo(o.x + 12, oy - o.h);
      gfx.closePath(); gfx.endFill();
    } else {
      gfx.beginFill(0x795548);
      gfx.moveTo(o.x, oy); gfx.lineTo(o.x + 22, oy); gfx.lineTo(o.x + 11, oy - o.h);
      gfx.closePath(); gfx.endFill();
    }
  });
  
  // 对手
  rivals.forEach(r => {
    if (r.x < -80 || r.x > 850) return;
    gfx.beginFill(r.color); gfx.drawRoundedRect(r.x - 22, r.y - 8, 44, 16, 4); gfx.endFill();
    gfx.beginFill(0x333); gfx.drawCircle(r.x - 18, r.y + 10, 8); gfx.drawCircle(r.x + 18, r.y + 10, 8); gfx.endFill();
    gfx.beginFill(r.color, 0.8); gfx.drawRect(r.x - 6, r.y - 16, 12, 10); gfx.endFill();
    gfx.beginFill(0xFFCC80); gfx.drawCircle(r.x, r.y - 22, 6); gfx.endFill();
    if (r.stun > 0 && r.stun % 4 < 2) {
      gfx.beginFill(0xFFFFFF, 0.4); gfx.drawCircle(r.x, r.y - 5, 20); gfx.endFill();
    }
  });
  
  // 玩家
  const bAlpha = stunTimer > 0 && stunTimer % 4 < 2 ? 0.5 : 1;
  gfx.beginFill(0xE53935, bAlpha); gfx.drawRoundedRect(128, bikeY - 10, 50, 20, 5); gfx.endFill();
  gfx.beginFill(0x333, bAlpha); gfx.drawCircle(133, bikeY + 12, 10); gfx.drawCircle(173, bikeY + 12, 10); gfx.endFill();
  gfx.beginFill(0x333, bAlpha); gfx.drawRect(156, bikeY - 18, 4, 10); gfx.endFill();
  gfx.beginFill(0xFFCC80, bAlpha); gfx.drawCircle(148, bikeY - 25, 8); gfx.endFill();
  gfx.beginFill(0x1565C0, bAlpha); gfx.drawRect(140, bikeY - 18, 16, 12); gfx.endFill();
  if (boostTimer > 0) {
    gfx.beginFill(0xFF9800, 0.8); gfx.drawEllipse(120, bikeY, 12, 6); gfx.endFill();
    gfx.beginFill(0xFFEB3B, 0.6); gfx.drawEllipse(115, bikeY, 8, 4); gfx.endFill();
  }
  
  // 云
  [150, 400, 650].forEach((cx, i) => {
    const cy = 60 + i * 20;
    gfx.beginFill(0xFFFFFF, 0.6); gfx.drawEllipse(cx, cy, 40, 15); gfx.drawEllipse(cx + 25, cy - 8, 30, 12); gfx.endFill();
  });
  
  // 排名板
  gfx.beginFill(0x000, 0.3); gfx.drawRoundedRect(640, 40, 150, 90, 8); gfx.endFill();
});

const rankText = new PIXI.Text('排名', { fontSize: 13, fill: '#FFD54F', fontWeight: 'bold' });
rankText.x = 650; rankText.y = 42; app.stage.addChild(rankText);
const rankList = new PIXI.Text('加载中...', { fontSize: 11, fill: '#fff' });
rankList.x = 650; rankList.y = 60; app.stage.addChild(rankList);

app.ticker.add(() => {
  const allR = [{name:'你', x: 150, isPlayer: true}, ...rivals];
  allR.sort((a, b) => b.x - a.x);
  rankList.text = allR.map((r, i) => (i+1) + '. ' + r.name + (r.isPlayer ? ' ⭐' : '')).join('\\n');
});
` }],
};

// 29. 跳跃闯关
export const platformJump = {
  name: '跳跃闯关',
  description: '跳上平台，收集星星!',
  templateType: 'platformJump',
  dimension: '2D',
  category: 'reaction',
  icon: '🦘',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#E3F2FD', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 10, anchorX: 0.5 }, textContent: { text: '🦘 跳跃闯关 — 收集星星!', fontSize: 22, color: '#0D47A1', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 575, anchorX: 0.5 }, textContent: { text: '⭐ 0 | 第 1 关', fontSize: 18, color: '#1565C0', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 跳跃闯关
const scoreText = elements['score'];
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);

let playerX = 100, playerY = 400, vy = 0;
const playerW = 24, playerH = 30;
const gravity = 0.5, jumpForce = -10;
let onGround = false, stars = 0, level = 1;

// Generate platforms and stars
let platforms = [], starItems = [], scrollX = 0;

function generateLevel() {
  platforms = [{ x: 0, y: 460, w: 200 }];
  starItems = [];
  let lastX = 150, lastY = 460;
  for (let i = 0; i < 15 + level * 3; i++) {
    const gap = 60 + Math.random() * 80;
    const dy = (Math.random() - 0.5) * 80;
    lastX += gap + 60;
    lastY = Math.max(200, Math.min(480, lastY + dy));
    const pw = 60 + Math.random() * 80;
    platforms.push({ x: lastX, y: lastY, w: pw });
    // Star on some platforms
    if (Math.random() > 0.3) starItems.push({ x: lastX + pw/2, y: lastY - 30, collected: false });
  }
  // Finish flag
  platforms.push({ x: lastX + 150, y: 460, w: 200 });
  starItems.push({ x: lastX + 250, y: 430, collected: false, isFlag: true });
}

generateLevel();

// Controls
const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.code] = false; });

// Touch controls
const touchBtns = [
  { label: '⬅️', x: 60, y: 540, key: 'left' },
  { label: '➡️', x: 160, y: 540, key: 'right' },
  { label: '⬆️', x: 700, y: 540, key: 'jump' },
];
const touchState = { left: false, right: false, jump: false };
touchBtns.forEach(b => {
  const btn = new PIXI.Text(b.label, { fontSize: 32 });
  btn.anchor.set(0.5); btn.x = b.x; btn.y = b.y;
  btn.eventMode = 'static'; btn.cursor = 'pointer';
  btn.on('pointerdown', () => { touchState[b.key] = true; });
  btn.on('pointerup', () => { touchState[b.key] = false; });
  btn.on('pointerupoutside', () => { touchState[b.key] = false; });
  app.stage.addChild(btn);
});

app.ticker.add(() => {
  // Movement
  const moveLeft = keys['ArrowLeft'] || keys['KeyA'] || touchState.left;
  const moveRight = keys['ArrowRight'] || keys['KeyD'] || touchState.right;
  const doJump = keys['ArrowUp'] || keys['Space'] || keys['KeyW'] || touchState.jump;
  
  if (moveLeft) playerX -= 4;
  if (moveRight) playerX += 4;
  if (doJump && onGround) { vy = jumpForce; onGround = false; }
  
  // Gravity
  vy += gravity; playerY += vy;
  onGround = false;
  
  // Platform collision
  platforms.forEach(p => {
    if (playerX + playerW > p.x - scrollX && playerX < p.x - scrollX + p.w &&
        playerY + playerH > p.y && playerY + playerH < p.y + 15 && vy >= 0) {
      playerY = p.y - playerH; vy = 0; onGround = true;
    }
  });
  
  // Fall off
  if (playerY > 620) { playerX = 100; playerY = 400; vy = 0; scrollX = 0; }
  
  // Camera scroll
  if (playerX > 350) { scrollX += playerX - 350; playerX = 350; }
  
  // Collect stars
  starItems.forEach(s => {
    if (s.collected) return;
    const dx = playerX + playerW/2 - (s.x - scrollX);
    const dy = playerY + playerH/2 - s.y;
    if (Math.sqrt(dx*dx+dy*dy) < 25) {
      s.collected = true;
      if (s.isFlag) {
        level++; stars += 5;
        scoreText.text = '⭐ ' + stars + ' | 🎉 第 ' + level + ' 关!';
        playerX = 100; playerY = 400; vy = 0; scrollX = 0;
        generateLevel();
      } else {
        stars++;
        scoreText.text = '⭐ ' + stars + ' | 第 ' + level + ' 关';
      }
    }
  });
  
  // Draw
  gfx.clear();
  // Sky
  gfx.beginFill(0x87CEEB); gfx.drawRect(0, 0, 800, 600); gfx.endFill();
  // Platforms
  platforms.forEach(p => {
    const px = p.x - scrollX;
    if (px > -200 && px < 1000) {
      gfx.beginFill(0x4CAF50); gfx.drawRoundedRect(px, p.y, p.w, 12, 4); gfx.endFill();
      gfx.beginFill(0x795548); gfx.drawRect(px + 5, p.y + 12, p.w - 10, 6); gfx.endFill();
    }
  });
  // Stars
  starItems.forEach(s => {
    if (s.collected) return;
    const sx = s.x - scrollX;
    if (sx > -30 && sx < 830) {
      if (s.isFlag) {
        gfx.beginFill(0xFF1744); gfx.drawRect(sx, s.y - 20, 4, 40); gfx.endFill();
        gfx.beginFill(0xFF1744); gfx.drawRect(sx, s.y - 20, 20, 12); gfx.endFill();
      } else {
        gfx.beginFill(0xFFD700); gfx.drawCircle(sx, s.y, 8); gfx.endFill();
        gfx.beginFill(0xFFF176); gfx.drawCircle(sx, s.y, 4); gfx.endFill();
      }
    }
  });
  // Player
  gfx.beginFill(0x2196F3); gfx.drawRoundedRect(playerX, playerY, playerW, playerH, 4); gfx.endFill();
  gfx.beginFill(0xFFCC80); gfx.drawCircle(playerX + playerW/2, playerY - 6, 8); gfx.endFill();
  // Eyes
  gfx.beginFill(0x333); gfx.drawCircle(playerX + playerW/2 + 3, playerY - 7, 2); gfx.endFill();
});
` }],
};

// 30. 射箭大作战 — 俯视角竞技场
export const archeryBattle = {
  name: '射箭大作战',
  description: '消灭所有NPC敌人，闯过每一关!',
  templateType: 'archeryBattle',
  dimension: '2D',
  category: 'reaction',
  icon: '🏹',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#1B5E20', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 8, anchorX: 0.5 }, textContent: { text: '🏹 射箭大作战', fontSize: 22, color: '#FFD54F', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 575, anchorX: 0.5 }, textContent: { text: '❤️ 5/5 | 第 1 关 | 敌人: 3', fontSize: 15, color: '#C8E6C9', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 射箭大作战 — 完整竞技场
const scoreText = elements['score'];
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);

// ─── 游戏状态 ───
let level = 1, gameState = 'ready'; // ready | playing | won | lost
const W = 800, H = 600;
const TILE = 40;
const COLS = W / TILE; // 20
const ROWS = H / TILE; // 15

// ─── 关卡地图 (0=空地 1=墙 2=矮墙) ───
const MAPS = [
  // 第1关 — 简单四角掩体
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,2,0,0,0,0,0,0,0,0,0,2,2,0,0,0,1],
    [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
    [1,0,0,2,2,0,0,0,0,0,0,0,0,0,2,2,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // 第2关 — 十字迷宫
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,0,0,1,0,0,0,0,0,0,1,0,0,2,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,0,0,2,2,0,0,1,1,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,0,0,2,2,0,0,1,1,1,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,2,0,0,1,0,0,0,0,0,0,1,0,0,2,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // 第3关 — 复杂要塞
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0,0,1],
    [1,1,1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,2,0,0,1,1,0,0,0,0,1,1,0,0,2,0,0,1],
    [1,0,0,2,0,0,1,0,0,0,0,0,0,1,0,0,2,0,0,1],
    [1,0,0,2,0,0,1,1,0,0,0,0,1,1,0,0,2,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1,1,1],
    [1,0,0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
];

let map = [];
let player = { x: 80, y: 300, hp: 5, maxHp: 5, angle: 0, speed: 2.5, shootCD: 0 };
let npcs = [];
let playerArrows = [];
let npcArrows = [];
let particles = [];
let dmgFlash = 0;

// ─── 碰撞检测: 点是否撞墙 ───
function hitWall(px, py, r) {
  const c1 = Math.floor((px - r) / TILE), c2 = Math.floor((px + r) / TILE);
  const r1 = Math.floor((py - r) / TILE), r2 = Math.floor((py + r) / TILE);
  for (let rr = r1; rr <= r2; rr++)
    for (let cc = c1; cc <= c2; cc++)
      if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && map[rr][cc] >= 1) return true;
  return false;
}

// 线段是否有墙阻挡 (简单射线)
function lineBlocked(x1, y1, x2, y2) {
  const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
  const steps = Math.ceil(dist / 15);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = x1 + (x2-x1)*t, py = y1 + (y2-y1)*t;
    const c = Math.floor(px / TILE), r = Math.floor(py / TILE);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && map[r][c] === 1) return true;
  }
  return false;
}

// ─── 初始化关卡 ───
function initLevel() {
  gameState = 'ready';
  const mi = (level - 1) % MAPS.length;
  map = MAPS[mi].map(r => [...r]);
  player.x = 80; player.y = 300;
  player.hp = player.maxHp;
  player.shootCD = 0;
  npcs = [];
  playerArrows = [];
  npcArrows = [];
  particles = [];

  // 生成 NPC (数量随关卡增加)
  const npcCount = 2 + level;
  const spots = [];
  for (let r = 1; r < ROWS-1; r++)
    for (let c = 10; c < COLS-1; c++)
      if (map[r][c] === 0) spots.push([c, r]);
  for (let i = 0; i < npcCount && spots.length > 0; i++) {
    const idx = Math.floor(Math.random() * spots.length);
    const [c, r] = spots.splice(idx, 1)[0];
    npcs.push({
      x: c * TILE + TILE/2,
      y: r * TILE + TILE/2,
      hp: 2 + Math.floor(level / 2),
      maxHp: 2 + Math.floor(level / 2),
      angle: Math.random() * Math.PI * 2,
      speed: 0.8 + level * 0.15,
      shootCD: 60 + Math.random() * 60,
      state: 'patrol', // patrol | chase | shoot
      patrolAngle: Math.random() * Math.PI * 2,
      color: [0xF44336, 0xFF9800, 0x9C27B0, 0x00BCD4, 0xFF5722][i % 5],
    });
  }

  elements['title'].text = '🏹 第 ' + level + ' 关 — 消灭 ' + npcs.length + ' 个敌人!';
  updateHud();
}

function updateHud() {
  const hearts = '❤️'.repeat(Math.max(0, player.hp));
  const empty = '🖤'.repeat(Math.max(0, player.maxHp - player.hp));
  scoreText.text = hearts + empty + ' | 第 ' + level + ' 关 | 敌人: ' + npcs.length;
}

// 粒子效果
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    particles.push({ x, y, dx: Math.cos(a) * (1 + Math.random()*2), dy: Math.sin(a) * (1 + Math.random()*2), life: 20 + Math.random()*10, color });
  }
}

// ─── 控制 ───
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space' || e.code === 'KeyR') {
    if (gameState === 'ready') gameState = 'playing';
    if (gameState === 'won') { level++; initLevel(); }
    if (gameState === 'lost') { level = 1; player.maxHp = 5; initLevel(); }
  }
  e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

// 指针瞄准
app.stage.eventMode = 'static';
app.stage.on('pointermove', e => {
  if (gameState !== 'playing') return;
  const dx = e.data.global.x - player.x;
  const dy = e.data.global.y - player.y;
  player.angle = Math.atan2(dy, dx);
});

// 点击/按空格射击
function playerShoot() {
  if (gameState === 'ready') { gameState = 'playing'; return; }
  if (gameState === 'won') { level++; initLevel(); return; }
  if (gameState === 'lost') { level = 1; player.maxHp = 5; initLevel(); return; }
  if (gameState !== 'playing' || player.shootCD > 0) return;
  player.shootCD = 15;
  const spd = 7;
  playerArrows.push({
    x: player.x + Math.cos(player.angle) * 14,
    y: player.y + Math.sin(player.angle) * 14,
    dx: Math.cos(player.angle) * spd,
    dy: Math.sin(player.angle) * spd,
    life: 80,
  });
}
app.stage.on('pointerdown', playerShoot);
window.addEventListener('keydown', e => { if (e.code === 'Space') playerShoot(); });

// 移动触控按钮
const touchState = { up:false, down:false, left:false, right:false };
const dpad = [
  { emoji:'⬆️', x:60, y:500, key:'up' },
  { emoji:'⬇️', x:60, y:560, key:'down' },
  { emoji:'⬅️', x:25, y:530, key:'left' },
  { emoji:'➡️', x:95, y:530, key:'right' },
];
dpad.forEach(d => {
  const btn = new PIXI.Text(d.emoji, { fontSize: 22 });
  btn.anchor.set(0.5); btn.x = d.x; btn.y = d.y; btn.alpha = 0.6;
  btn.eventMode = 'static'; btn.cursor = 'pointer';
  btn.on('pointerdown', () => { touchState[d.key] = true; });
  btn.on('pointerup', () => { touchState[d.key] = false; });
  btn.on('pointerupoutside', () => { touchState[d.key] = false; });
  app.stage.addChild(btn);
});

initLevel();

// ─── 主循环 ───
app.ticker.add(() => {
  if (gameState !== 'playing') { drawAll(); return; }

  // ── 玩家移动 ──
  let dx = 0, dy = 0;
  if (keys['ArrowUp'] || keys['KeyW'] || touchState.up) dy = -1;
  if (keys['ArrowDown'] || keys['KeyS'] || touchState.down) dy = 1;
  if (keys['ArrowLeft'] || keys['KeyA'] || touchState.left) dx = -1;
  if (keys['ArrowRight'] || keys['KeyD'] || touchState.right) dx = 1;
  if (dx || dy) {
    const len = Math.sqrt(dx*dx+dy*dy);
    const nx = player.x + (dx/len) * player.speed;
    const ny = player.y + (dy/len) * player.speed;
    if (!hitWall(nx, player.y, 10)) player.x = nx;
    if (!hitWall(player.x, ny, 10)) player.y = ny;
  }
  if (player.shootCD > 0) player.shootCD--;
  if (dmgFlash > 0) dmgFlash--;

  // ── 玩家箭矢更新 ──
  for (let i = playerArrows.length - 1; i >= 0; i--) {
    const a = playerArrows[i];
    a.x += a.dx; a.y += a.dy; a.life--;
    // 撞墙
    const c = Math.floor(a.x/TILE), r = Math.floor(a.y/TILE);
    if (a.life <= 0 || c < 0 || c >= COLS || r < 0 || r >= ROWS || map[r][c] === 1) {
      spawnParticles(a.x, a.y, 0xFFD54F, 3);
      playerArrows.splice(i, 1); continue;
    }
    // 打中NPC
    for (let j = npcs.length - 1; j >= 0; j--) {
      const n = npcs[j];
      if (Math.hypot(a.x - n.x, a.y - n.y) < 16) {
        n.hp--;
        spawnParticles(n.x, n.y, n.color, 6);
        playerArrows.splice(i, 1);
        if (n.hp <= 0) {
          spawnParticles(n.x, n.y, 0xFFFFFF, 12);
          npcs.splice(j, 1);
          updateHud();
          // 胜利检查
          if (npcs.length === 0) {
            gameState = 'won';
            elements['title'].text = '🎉 第 ' + level + ' 关通过! 点击进入下一关';
          }
        }
        break;
      }
    }
  }

  // ── NPC AI ──
  npcs.forEach(n => {
    const distToPlayer = Math.hypot(n.x - player.x, n.y - player.y);
    const canSee = !lineBlocked(n.x, n.y, player.x, player.y);

    if (canSee && distToPlayer < 300) {
      n.state = distToPlayer < 150 ? 'shoot' : 'chase';
    } else {
      n.state = 'patrol';
    }

    if (n.state === 'patrol') {
      n.patrolAngle += (Math.random() - 0.5) * 0.1;
      const nx = n.x + Math.cos(n.patrolAngle) * n.speed * 0.5;
      const ny = n.y + Math.sin(n.patrolAngle) * n.speed * 0.5;
      if (!hitWall(nx, ny, 10)) { n.x = nx; n.y = ny; }
      else n.patrolAngle += Math.PI * 0.5;
    } else if (n.state === 'chase') {
      const angle = Math.atan2(player.y - n.y, player.x - n.x);
      n.angle = angle;
      const nx = n.x + Math.cos(angle) * n.speed;
      const ny = n.y + Math.sin(angle) * n.speed;
      if (!hitWall(nx, ny, 10)) { n.x = nx; n.y = ny; }
    } else {
      // shoot — face player and fire
      n.angle = Math.atan2(player.y - n.y, player.x - n.x);
    }

    // NPC 射击
    n.shootCD--;
    if (n.shootCD <= 0 && canSee && distToPlayer < 350) {
      n.shootCD = Math.max(40, 80 - level * 5);
      const sa = Math.atan2(player.y - n.y, player.x - n.x) + (Math.random()-0.5)*0.3;
      npcArrows.push({
        x: n.x + Math.cos(sa) * 14,
        y: n.y + Math.sin(sa) * 14,
        dx: Math.cos(sa) * 4,
        dy: Math.sin(sa) * 4,
        life: 70,
        color: n.color,
      });
    }
  });

  // ── NPC 箭矢 ──
  for (let i = npcArrows.length - 1; i >= 0; i--) {
    const a = npcArrows[i];
    a.x += a.dx; a.y += a.dy; a.life--;
    const c = Math.floor(a.x/TILE), r = Math.floor(a.y/TILE);
    if (a.life <= 0 || c < 0 || c >= COLS || r < 0 || r >= ROWS || map[r][c] === 1) {
      npcArrows.splice(i, 1); continue;
    }
    // 打中玩家
    if (Math.hypot(a.x - player.x, a.y - player.y) < 14) {
      player.hp--;
      dmgFlash = 10;
      spawnParticles(player.x, player.y, 0xFF1744, 5);
      npcArrows.splice(i, 1);
      updateHud();
      if (player.hp <= 0) {
        gameState = 'lost';
        elements['title'].text = '💀 你被击败了! 点击重来';
      }
    }
  }

  // 粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.dx; p.y += p.dy; p.dx *= 0.95; p.dy *= 0.95; p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  drawAll();
});

// ─── 渲染 ───
function drawAll() {
  gfx.clear();

  // 地图
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE, y = r * TILE;
      if (map[r][c] === 1) {
        gfx.beginFill(0x4E342E); gfx.drawRect(x, y, TILE, TILE); gfx.endFill();
        // 砖纹
        gfx.lineStyle(1, 0x3E2723, 0.3);
        gfx.moveTo(x, y + TILE/2); gfx.lineTo(x + TILE, y + TILE/2);
        gfx.moveTo(x + TILE/2, y); gfx.lineTo(x + TILE/2, y + TILE/2);
        gfx.lineStyle(0);
      } else if (map[r][c] === 2) {
        gfx.beginFill(0x8D6E63, 0.7); gfx.drawRect(x+2, y+2, TILE-4, TILE-4); gfx.endFill();
      } else {
        gfx.beginFill(0x2E7D32); gfx.drawRect(x, y, TILE, TILE); gfx.endFill();
        // 草地纹理
        if ((r + c) % 3 === 0) {
          gfx.beginFill(0x388E3C, 0.4); gfx.drawCircle(x + TILE/2, y + TILE/2, 3); gfx.endFill();
        }
      }
    }
  }

  // NPC 箭矢 (红色系)
  npcArrows.forEach(a => {
    gfx.lineStyle(2, 0xFF5252);
    gfx.moveTo(a.x, a.y);
    gfx.lineTo(a.x - a.dx*2, a.y - a.dy*2);
    gfx.lineStyle(0);
  });

  // 玩家箭矢 (金色)
  playerArrows.forEach(a => {
    gfx.lineStyle(2, 0xFFD54F);
    gfx.moveTo(a.x, a.y);
    gfx.lineTo(a.x - a.dx*2, a.y - a.dy*2);
    gfx.lineStyle(0);
  });

  // NPC
  npcs.forEach(n => {
    // 身体
    gfx.beginFill(n.color); gfx.drawCircle(n.x, n.y, 12); gfx.endFill();
    gfx.beginFill(0x333); gfx.drawCircle(n.x, n.y, 5); gfx.endFill();
    // 弓方向
    gfx.lineStyle(2, 0x333);
    gfx.moveTo(n.x, n.y);
    gfx.lineTo(n.x + Math.cos(n.angle)*18, n.y + Math.sin(n.angle)*18);
    gfx.lineStyle(0);
    // HP 条
    const barW = 24;
    gfx.beginFill(0x333, 0.6); gfx.drawRect(n.x-barW/2, n.y-20, barW, 4); gfx.endFill();
    gfx.beginFill(0x4CAF50); gfx.drawRect(n.x-barW/2, n.y-20, barW*(n.hp/n.maxHp), 4); gfx.endFill();
  });

  // 玩家
  const flashAlpha = dmgFlash > 0 && dmgFlash % 3 === 0 ? 0.4 : 1;
  gfx.beginFill(0x1565C0, flashAlpha); gfx.drawCircle(player.x, player.y, 14); gfx.endFill();
  gfx.beginFill(0xFFCC80, flashAlpha); gfx.drawCircle(player.x, player.y-2, 6); gfx.endFill();
  // 弓方向
  gfx.lineStyle(3, 0xFFD54F);
  gfx.moveTo(player.x, player.y);
  gfx.lineTo(player.x + Math.cos(player.angle)*22, player.y + Math.sin(player.angle)*22);
  gfx.lineStyle(0);
  // 玩家 HP 条
  const phBarW = 30;
  gfx.beginFill(0x333, 0.6); gfx.drawRect(player.x-phBarW/2, player.y-24, phBarW, 4); gfx.endFill();
  gfx.beginFill(0x4CAF50); gfx.drawRect(player.x-phBarW/2, player.y-24, phBarW*(player.hp/player.maxHp), 4); gfx.endFill();

  // 粒子
  particles.forEach(p => {
    gfx.beginFill(p.color, p.life / 30);
    gfx.drawCircle(p.x, p.y, 2);
    gfx.endFill();
  });

  // 开始/结束覆盖层
  if (gameState === 'ready') {
    gfx.beginFill(0x000, 0.5); gfx.drawRect(0, 0, W, H); gfx.endFill();
    gfx.beginFill(0x000, 0.7); gfx.drawRoundedRect(200, 200, 400, 160, 16); gfx.endFill();
  }
  if (gameState === 'won') {
    gfx.beginFill(0x1B5E20, 0.6); gfx.drawRect(0, 0, W, H); gfx.endFill();
    gfx.beginFill(0x000, 0.7); gfx.drawRoundedRect(150, 220, 500, 120, 16); gfx.endFill();
  }
  if (gameState === 'lost') {
    gfx.beginFill(0x7f0000, 0.6); gfx.drawRect(0, 0, W, H); gfx.endFill();
    gfx.beginFill(0x000, 0.7); gfx.drawRoundedRect(200, 220, 400, 120, 16); gfx.endFill();
  }
}
` }],
};

