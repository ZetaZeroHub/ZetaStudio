/**
 * AI Service - Mock implementation for MVP
 * In production, replace with real API calls to 火山引擎
 */

// Simulated delay to mimic network latency
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate game code based on user's natural language description
 * @param {string} prompt - User's description
 * @param {string} templateType - Current template type
 * @returns {Promise<{code: string, message: string}>}
 */
export async function generateGameCode(prompt, templateType) {
  await delay(1500 + Math.random() * 1000);

  const lower = prompt.toLowerCase();

  if (lower.includes('背景') || lower.includes('场景') || lower.includes('天空')) {
    return {
      message: '✅ 已为你生成背景场景代码！添加了渐变天空和地面装饰。',
      code: `// AI 生成: 背景场景
const sky = new PIXI.Graphics();
sky.rect(0, 0, 800, 600);
sky.fill({ color: 0x1a1a2e });
app.stage.addChild(sky);

// 星星粒子
for (let i = 0; i < 50; i++) {
  const star = new PIXI.Graphics();
  star.circle(0, 0, Math.random() * 2 + 1);
  star.fill({ color: 0xffffff, alpha: Math.random() * 0.8 + 0.2 });
  star.x = Math.random() * 800;
  star.y = Math.random() * 400;
  app.stage.addChild(star);
}

// 地面
const ground = new PIXI.Graphics();
ground.rect(0, 500, 800, 100);
ground.fill({ color: 0x2d5a27 });
app.stage.addChild(ground);`,
      elements: [
        { id: 'bg_sky', name: '夜空背景', type: 'shape', x: 400, y: 300, width: 800, height: 600, depth: 0, properties: { shapeType: 'rect', color: '#1a1a2e' } },
        { id: 'bg_ground', name: '地面', type: 'shape', x: 400, y: 550, width: 800, height: 100, depth: 1, properties: { shapeType: 'rect', color: '#2d5a27' } },
      ],
    };
  }

  if (lower.includes('玩家') || lower.includes('角色') || lower.includes('主角')) {
    return {
      message: '✅ 已生成玩家角色！带有基础移动控制（方向键控制）。',
      code: `// AI 生成: 玩家角色
const player = new PIXI.Graphics();
player.roundRect(-20, -30, 40, 60, 8);
player.fill({ color: 0x6366f1 });
player.x = 400;
player.y = 470;
app.stage.addChild(player);

// 眼睛
const eyeL = new PIXI.Graphics();
eyeL.circle(-8, -15, 4);
eyeL.fill({ color: 0xffffff });
player.addChild(eyeL);

const eyeR = new PIXI.Graphics();
eyeR.circle(8, -15, 4);
eyeR.fill({ color: 0xffffff });
player.addChild(eyeR);

// 键盘控制
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

app.ticker.add((ticker) => {
  if (keys['ArrowLeft']) player.x -= 4 * ticker.deltaTime;
  if (keys['ArrowRight']) player.x += 4 * ticker.deltaTime;
  if (keys['ArrowUp']) player.y -= 4 * ticker.deltaTime;
  if (keys['ArrowDown']) player.y += 4 * ticker.deltaTime;
  // 边界限制
  player.x = Math.max(20, Math.min(780, player.x));
  player.y = Math.max(30, Math.min(570, player.y));
});`,
      elements: [
        { id: 'player', name: '玩家角色', type: 'sprite', x: 400, y: 470, width: 40, height: 60, depth: 10, properties: { color: '#6366f1', controllable: true } },
      ],
    };
  }

  if (lower.includes('敌人') || lower.includes('怪物') || lower.includes('障碍')) {
    return {
      message: '✅ 已生成敌人！敌人会从顶部随机位置掉落。',
      code: `// AI 生成: 敌人生成系统
const enemies = [];

function spawnEnemy() {
  const enemy = new PIXI.Graphics();
  enemy.rect(-15, -15, 30, 30);
  enemy.fill({ color: 0xef4444 });
  enemy.x = Math.random() * 760 + 20;
  enemy.y = -20;
  enemy.speed = 1 + Math.random() * 2;
  app.stage.addChild(enemy);
  enemies.push(enemy);
}

// 每秒生成一个敌人
setInterval(spawnEnemy, 1000);

app.ticker.add((ticker) => {
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed * ticker.deltaTime;
    if (enemies[i].y > 620) {
      app.stage.removeChild(enemies[i]);
      enemies.splice(i, 1);
    }
  }
});`,
      elements: [
        { id: 'enemy_spawner', name: '敌人生成器', type: 'container', x: 400, y: 0, width: 800, height: 30, depth: 5, properties: { spawnRate: 1000, color: '#ef4444' } },
      ],
    };
  }

  if (lower.includes('得分') || lower.includes('分数') || lower.includes('计分')) {
    return {
      message: '✅ 已添加计分系统！击败敌人 +10 分。',
      code: `// AI 生成: 计分系统
let score = 0;
const scoreText = new PIXI.Text({
  text: '得分: 0',
  style: {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff,
    dropShadow: { color: 0x000000, blur: 4, distance: 2 },
  }
});
scoreText.x = 20;
scoreText.y = 20;
app.stage.addChild(scoreText);

function addScore(points) {
  score += points;
  scoreText.text = '得分: ' + score;
}`,
      elements: [
        { id: 'score_ui', name: '计分板', type: 'text', x: 20, y: 20, width: 150, height: 30, depth: 100, properties: { text: '得分: 0', fontSize: 24, color: '#ffffff' } },
      ],
    };
  }

  // Default response
  return {
    message: `🤖 AI 理解了你的需求: "${prompt}"\n\n已生成基础游戏框架代码。你可以继续描述需要添加的功能，例如：\n• "添加一个可控制的玩家角色"\n• "创建夜空背景和地面"\n• "添加从天上掉落的敌人"\n• "加入计分系统"`,
    code: `// AI 生成: 基于描述 "${prompt}"
// 初始化游戏画布
const bg = new PIXI.Graphics();
bg.rect(0, 0, 800, 600);
bg.fill({ color: 0x111827 });
app.stage.addChild(bg);

const title = new PIXI.Text({
  text: '${prompt}',
  style: {
    fontFamily: 'Arial',
    fontSize: 20,
    fill: 0x94a3b8,
    wordWrap: true,
    wordWrapWidth: 600,
    align: 'center',
  }
});
title.anchor.set(0.5);
title.x = 400;
title.y = 300;
app.stage.addChild(title);`,
    elements: [],
  };
}

/**
 * Generate a game sprite/image from text description (Mock)
 * @param {string} prompt - Description of the image to generate
 * @returns {Promise<{imageUrl: string, message: string}>}
 */
export async function generateSprite(prompt) {
  await delay(2000 + Math.random() * 1000);

  // Return a generated svg data URL as mock
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const svg = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="48" height="48" rx="8" fill="${color}" opacity="0.9"/>
    <circle cx="24" cy="28" r="4" fill="white"/>
    <circle cx="40" cy="28" r="4" fill="white"/>
    <path d="M 20 40 Q 32 50 44 40" stroke="white" stroke-width="2" fill="none"/>
  </svg>`;

  const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

  return {
    imageUrl: dataUrl,
    message: `✅ 已为你生成素材: "${prompt}"。你可以将它拖入画布使用。`,
  };
}
