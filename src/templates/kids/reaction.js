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
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 650, y: 100, anchorX: 0.5 }, textContent: { text: '得分: 0\n等级: 1\n行数: 0', fontSize: 16, color: '#C5CAE9', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 俄罗斯方块
const scoreText = elements['score'];
const COLS = 10, ROWS = 20, CELL = 26;
const boardX = 200, boardY = 35;
let score = 0, level = 1, lines = 0;
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const colors = [0, 0x00BCD4, 0xFFEB3B, 0x9C27B0, 0x4CAF50, 0xFF5722, 0x2196F3, 0xE91E63];

const shapes = [
  [[1,1,1,1]], // I
  [[1,1],[1,1]], // O
  [[0,1,0],[1,1,1]], // T
  [[1,0],[1,0],[1,1]], // L
  [[0,1],[0,1],[1,1]], // J
  [[0,1,1],[1,1,0]], // S
  [[1,1,0],[0,1,1]], // Z
];

const boardGfx = new PIXI.Graphics();
app.stage.addChild(boardGfx);

let currentPiece = null, px = 0, py = 0, pieceType = 0;
let gameOver = false, dropTimer = 0;

function newPiece() {
  pieceType = Math.floor(Math.random() * shapes.length) + 1;
  currentPiece = shapes[pieceType - 1].map(r => [...r]);
  px = Math.floor((COLS - currentPiece[0].length) / 2); py = 0;
  if (!canPlace(px, py, currentPiece)) { gameOver = true; elements['title'].text = '💀 游戏结束! 得分: ' + score; }
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

function placePiece() {
  for (let r = 0; r < currentPiece.length; r++)
    for (let c = 0; c < currentPiece[r].length; c++)
      if (currentPiece[r][c]) board[py + r][px + c] = pieceType;
  // Check lines
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(c => c !== 0)) {
      board.splice(r, 1); board.unshift(Array(COLS).fill(0));
      cleared++; r++;
    }
  }
  if (cleared > 0) {
    lines += cleared;
    score += [0, 100, 300, 500, 800][cleared] * level;
    level = Math.floor(lines / 10) + 1;
  }
  scoreText.text = '得分: ' + score + '\\n等级: ' + level + '\\n行数: ' + lines;
}

function rotate(piece) {
  const rows = piece.length, cols = piece[0].length;
  const rotated = Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (_, r) => piece[rows - 1 - r][c]));
  return rotated;
}

function draw() {
  boardGfx.clear();
  // Board border
  boardGfx.lineStyle(2, 0x3F51B5); boardGfx.drawRect(boardX - 1, boardY - 1, COLS * CELL + 2, ROWS * CELL + 2);
  // Board bg
  boardGfx.beginFill(0x0D1B2A); boardGfx.drawRect(boardX, boardY, COLS * CELL, ROWS * CELL); boardGfx.endFill();
  // Grid
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (board[r][c]) {
      boardGfx.beginFill(colors[board[r][c]]); boardGfx.drawRect(boardX + c*CELL+1, boardY + r*CELL+1, CELL-2, CELL-2); boardGfx.endFill();
    }
  }
  // Current piece
  if (currentPiece && !gameOver) {
    for (let r = 0; r < currentPiece.length; r++)
      for (let c = 0; c < currentPiece[r].length; c++)
        if (currentPiece[r][c]) {
          boardGfx.beginFill(colors[pieceType]); boardGfx.drawRect(boardX + (px+c)*CELL+1, boardY + (py+r)*CELL+1, CELL-2, CELL-2); boardGfx.endFill();
        }
  }
}

// Controls
const keys = {};
window.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.code === 'ArrowLeft' && canPlace(px-1, py, currentPiece)) px--;
  if (e.code === 'ArrowRight' && canPlace(px+1, py, currentPiece)) px++;
  if (e.code === 'ArrowDown') { if (canPlace(px, py+1, currentPiece)) py++; }
  if (e.code === 'ArrowUp') {
    const rotated = rotate(currentPiece);
    if (canPlace(px, py, rotated)) currentPiece = rotated;
  }
  if (e.code === 'Space') { while (canPlace(px, py+1, currentPiece)) py++; }
  e.preventDefault();
});

// Mobile buttons
const ctrls = [
  {label:'⬅️',x:620,y:250,fn:()=>{if(canPlace(px-1,py,currentPiece))px--;}},
  {label:'➡️',x:720,y:250,fn:()=>{if(canPlace(px+1,py,currentPiece))px++;}},
  {label:'🔄',x:670,y:200,fn:()=>{const r=rotate(currentPiece);if(canPlace(px,py,r))currentPiece=r;}},
  {label:'⬇️',x:670,y:300,fn:()=>{while(canPlace(px,py+1,currentPiece))py++;}},
];
ctrls.forEach(c => {
  const btn = new PIXI.Text(c.label, { fontSize: 28 });
  btn.anchor.set(0.5); btn.x = c.x; btn.y = c.y;
  btn.eventMode = 'static'; btn.cursor = 'pointer';
  btn.on('pointerdown', c.fn);
  app.stage.addChild(btn);
});

newPiece();

app.ticker.add((delta) => {
  if (gameOver) return;
  dropTimer += delta;
  const speed = Math.max(5, 30 - level * 3);
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

// 28. 横版摩托车
export const motorbike = {
  name: '摩托车冲刺',
  description: '驾驶摩托车跳跃障碍!',
  templateType: 'motorbike',
  dimension: '2D',
  category: 'reaction',
  icon: '🏍️',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#87CEEB', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 15, anchorX: 0.5 }, textContent: { text: '🏍️ 摩托车冲刺 — 空格跳跃!', fontSize: 22, color: '#1A237E', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 570, anchorX: 0.5 }, textContent: { text: '距离: 0m | 最远: 0m', fontSize: 18, color: '#333', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 摩托车冲刺
const scoreText = elements['score'];
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);
const groundY = 420;
let distance = 0, bestDistance = 0, speed = 5, gameOver = false;
let bikeY = groundY, bikeVY = 0, isJumping = false;
const gravity = 0.6;
const obstacles = [];
let nextObstacle = 100;

// Jump
window.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    if (!isJumping && !gameOver) { bikeVY = -12; isJumping = true; }
    if (gameOver) { gameOver = false; distance = 0; speed = 5; obstacles.length = 0; nextObstacle = 100; bikeY = groundY; }
    e.preventDefault();
  }
});
app.stage.eventMode = 'static';
app.stage.on('pointerdown', () => {
  if (!isJumping && !gameOver) { bikeVY = -12; isJumping = true; }
  if (gameOver) { gameOver = false; distance = 0; speed = 5; obstacles.length = 0; nextObstacle = 100; bikeY = groundY; }
});

app.ticker.add(() => {
  if (gameOver) return;
  distance++; speed = 5 + Math.floor(distance / 200) * 0.5;
  
  // Jump physics
  if (isJumping) {
    bikeVY += gravity; bikeY += bikeVY;
    if (bikeY >= groundY) { bikeY = groundY; isJumping = false; bikeVY = 0; }
  }
  
  // Obstacles
  nextObstacle -= speed;
  if (nextObstacle <= 0) {
    const h = 25 + Math.random() * 35;
    obstacles.push({ x: 820, h, type: Math.random() > 0.5 ? 'rock' : 'box' });
    nextObstacle = 150 + Math.random() * 200;
  }
  
  obstacles.forEach(o => { o.x -= speed; });
  // Remove off-screen
  while (obstacles.length > 0 && obstacles[0].x < -50) obstacles.shift();
  
  // Collision
  obstacles.forEach(o => {
    if (o.x > 100 && o.x < 170 && bikeY + 20 > groundY - o.h) {
      gameOver = true;
      bestDistance = Math.max(bestDistance, Math.floor(distance / 10));
      elements['title'].text = '💥 撞了! 点击重来';
    }
  });
  
  scoreText.text = '距离: ' + Math.floor(distance/10) + 'm | 最远: ' + bestDistance + 'm';
  
  // Draw
  gfx.clear();
  // Sky gradient (simple)
  gfx.beginFill(0x87CEEB); gfx.drawRect(0, 0, 800, groundY + 30); gfx.endFill();
  // Ground
  gfx.beginFill(0x8D6E63); gfx.drawRect(0, groundY + 30, 800, 170); gfx.endFill();
  gfx.beginFill(0x4CAF50); gfx.drawRect(0, groundY + 25, 800, 8); gfx.endFill();
  // Road line
  for (let i = 0; i < 10; i++) {
    const lx = ((i * 100 - distance * speed * 0.3) % 800 + 800) % 800;
    gfx.beginFill(0xBCAAA4); gfx.drawRect(lx, groundY + 28, 40, 3); gfx.endFill();
  }
  // Bike
  gfx.beginFill(0xE53935); gfx.drawRoundedRect(120, bikeY - 10, 50, 20, 5); gfx.endFill();
  gfx.beginFill(0x333); gfx.drawCircle(125, bikeY + 15, 10); gfx.drawCircle(165, bikeY + 15, 10); gfx.endFill();
  gfx.beginFill(0x333); gfx.drawRect(148, bikeY - 18, 4, 10); gfx.endFill(); // handlebar
  // Rider
  gfx.beginFill(0xFFCC80); gfx.drawCircle(140, bikeY - 25, 8); gfx.endFill(); // head
  gfx.beginFill(0x1565C0); gfx.drawRect(132, bikeY - 18, 16, 12); gfx.endFill(); // body
  
  // Obstacles
  obstacles.forEach(o => {
    if (o.type === 'rock') {
      gfx.beginFill(0x795548);
      gfx.moveTo(o.x, groundY + 25); gfx.lineTo(o.x + 20, groundY + 25); gfx.lineTo(o.x + 10, groundY + 25 - o.h); gfx.closePath();
      gfx.endFill();
    } else {
      gfx.beginFill(0xFF8F00); gfx.drawRect(o.x, groundY + 25 - o.h, 25, o.h); gfx.endFill();
    }
  });
  
  // Clouds (decorative)
  [150, 400, 650].forEach((cx, i) => {
    const cy = 80 + i * 20;
    gfx.beginFill(0xFFFFFF, 0.7); gfx.drawEllipse(cx, cy, 40, 15); gfx.drawEllipse(cx + 25, cy - 8, 30, 12); gfx.endFill();
  });
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

// 30. 射箭大作战
export const archeryBattle = {
  name: '射箭大作战',
  description: '射击靶心，升级装备!',
  templateType: 'archeryBattle',
  dimension: '2D',
  category: 'reaction',
  icon: '🏹',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#1B5E20', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 15, anchorX: 0.5 }, textContent: { text: '🏹 射箭大作战', fontSize: 24, color: '#FFD54F', bold: true, align: 'center' } },
    { id: 'score', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 570, anchorX: 0.5 }, textContent: { text: '得分: 0 | 🏹 等级 1 | 箭: 10', fontSize: 16, color: '#C8E6C9', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 射箭大作战 (俯视角)
const scoreText = elements['score'];
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);

let score = 0, arrows = 10, level = 1, xp = 0;
const xpPerLevel = [10, 25, 50, 80, 120];
let playerX = 400, playerY = 500, playerAngle = -Math.PI/2;
let arrowsFlying = [];
let targets = [];
let powerups = [];
let upgradeMsg = '';
let upgradeMsgTimer = 0;

// Weapon upgrades
const weapons = [
  { name: '木弓', speed: 6, damage: 1, color: 0x8D6E63 },
  { name: '铁弓', speed: 8, damage: 1, color: 0x607D8B },
  { name: '银弓', speed: 9, damage: 2, color: 0xBDBDBD },
  { name: '金弓', speed: 10, damage: 2, color: 0xFFD700 },
  { name: '传说之弓', speed: 12, damage: 3, color: 0xE040FB },
];

function getWeapon() { return weapons[Math.min(level - 1, weapons.length - 1)]; }

// Spawn targets
function spawnTarget() {
  const isElite = Math.random() < 0.15 * level;
  targets.push({
    x: 100 + Math.random() * 600,
    y: 60 + Math.random() * 300,
    r: isElite ? 22 : 16,
    hp: isElite ? 3 : 1,
    maxHp: isElite ? 3 : 1,
    speed: 0.3 + Math.random() * 0.5 + level * 0.1,
    angle: Math.random() * Math.PI * 2,
    isElite,
    pts: isElite ? 5 : 1,
  });
}

for (let i = 0; i < 5 + level; i++) spawnTarget();

// Spawn arrow powerup
function spawnPowerup() {
  powerups.push({ x: 100 + Math.random() * 600, y: 80 + Math.random() * 300, type: 'arrows' });
}
spawnPowerup();

// Aim
app.stage.eventMode = 'static';
app.stage.on('pointermove', e => {
  const dx = e.data.global.x - playerX;
  const dy = e.data.global.y - playerY;
  playerAngle = Math.atan2(dy, dx);
});

// Shoot
function shoot() {
  if (arrows <= 0) return;
  arrows--;
  const w = getWeapon();
  arrowsFlying.push({
    x: playerX, y: playerY,
    dx: Math.cos(playerAngle) * w.speed,
    dy: Math.sin(playerAngle) * w.speed,
    damage: w.damage,
    color: w.color,
  });
}

app.stage.on('pointerdown', shoot);
window.addEventListener('keydown', e => { if (e.code === 'Space') shoot(); });

// Level up
function checkLevelUp() {
  const needed = xpPerLevel[Math.min(level - 1, xpPerLevel.length - 1)];
  if (xp >= needed && level < weapons.length) {
    level++; xp = 0;
    const w = getWeapon();
    upgradeMsg = '⬆️ 升级! ' + w.name + '!';
    upgradeMsgTimer = 120;
    arrows += 5;
    // Spawn more targets for new level
    for (let i = 0; i < 3; i++) spawnTarget();
    spawnPowerup();
  }
}

app.ticker.add(() => {
  // Update arrows
  for (let i = arrowsFlying.length - 1; i >= 0; i--) {
    const a = arrowsFlying[i];
    a.x += a.dx; a.y += a.dy;
    if (a.x < -10 || a.x > 810 || a.y < -10 || a.y > 610) { arrowsFlying.splice(i, 1); continue; }
    
    // Hit targets
    for (let j = targets.length - 1; j >= 0; j--) {
      const t = targets[j];
      const dx = a.x - t.x, dy = a.y - t.y;
      if (Math.sqrt(dx*dx + dy*dy) < t.r + 4) {
        t.hp -= a.damage;
        arrowsFlying.splice(i, 1);
        if (t.hp <= 0) {
          score += t.pts; xp += t.pts;
          targets.splice(j, 1);
          checkLevelUp();
          if (targets.length < 3) { for (let k = 0; k < 3 + level; k++) spawnTarget(); spawnPowerup(); }
        }
        break;
      }
    }
  }
  
  // Move targets
  targets.forEach(t => {
    t.angle += 0.02;
    t.x += Math.cos(t.angle) * t.speed;
    t.y += Math.sin(t.angle) * t.speed * 0.6;
    if (t.x < 30) t.x = 30; if (t.x > 770) t.x = 770;
    if (t.y < 50) t.y = 50; if (t.y > 380) t.y = 380;
  });
  
  // Collect powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    const dx = playerX - p.x, dy = playerY - p.y;
    if (Math.sqrt(dx*dx + dy*dy) < 30) {
      arrows += 5; powerups.splice(i, 1);
    }
  }
  
  // Upgrade message timer
  if (upgradeMsgTimer > 0) upgradeMsgTimer--;
  
  const w = getWeapon();
  const needed = xpPerLevel[Math.min(level - 1, xpPerLevel.length - 1)];
  scoreText.text = '得分: ' + score + ' | 🏹 ' + w.name + ' Lv' + level + ' | 箭: ' + arrows + ' | XP: ' + xp + '/' + needed;
  
  // Draw
  gfx.clear();
  // Grass bg
  gfx.beginFill(0x2E7D32); gfx.drawRect(0, 0, 800, 600); gfx.endFill();
  // Grass texture
  for (let i = 0; i < 60; i++) {
    gfx.beginFill(0x388E3C, 0.3);
    gfx.drawCircle(Math.random()*800, Math.random()*600, 2);
    gfx.endFill();
  }
  
  // Targets
  targets.forEach(t => {
    const c = t.isElite ? 0xFF1744 : 0xFF5722;
    gfx.beginFill(c);
    gfx.drawCircle(t.x, t.y, t.r);
    gfx.endFill();
    gfx.beginFill(0xFFFFFF);
    gfx.drawCircle(t.x, t.y, t.r * 0.6);
    gfx.endFill();
    gfx.beginFill(c);
    gfx.drawCircle(t.x, t.y, t.r * 0.3);
    gfx.endFill();
    // HP bar for elites
    if (t.isElite) {
      gfx.beginFill(0x333, 0.5); gfx.drawRect(t.x - 15, t.y - t.r - 8, 30, 4); gfx.endFill();
      gfx.beginFill(0x4CAF50); gfx.drawRect(t.x - 15, t.y - t.r - 8, 30 * (t.hp / t.maxHp), 4); gfx.endFill();
    }
  });
  
  // Powerups
  powerups.forEach(p => {
    gfx.beginFill(0xFFD700, 0.8); gfx.drawCircle(p.x, p.y, 12); gfx.endFill();
    const pLabel = new PIXI.Text('🏹', { fontSize: 14 });
    // Use simple circle instead
  });
  
  // Arrows flying
  arrowsFlying.forEach(a => {
    gfx.lineStyle(2, a.color);
    gfx.moveTo(a.x, a.y);
    gfx.lineTo(a.x - a.dx * 2, a.y - a.dy * 2);
  });
  
  // Player
  gfx.beginFill(0x1565C0); gfx.drawCircle(playerX, playerY, 14); gfx.endFill();
  gfx.beginFill(0xFFCC80); gfx.drawCircle(playerX, playerY - 2, 6); gfx.endFill();
  // Bow direction
  gfx.lineStyle(3, w.color);
  gfx.moveTo(playerX, playerY);
  gfx.lineTo(playerX + Math.cos(playerAngle) * 25, playerY + Math.sin(playerAngle) * 25);
  
  // Upgrade message
  if (upgradeMsgTimer > 0) {
    const alpha = Math.min(1, upgradeMsgTimer / 30);
    gfx.beginFill(0x000, 0.6 * alpha);
    gfx.drawRoundedRect(250, 250, 300, 50, 12);
    gfx.endFill();
  }
});
` }],
};
