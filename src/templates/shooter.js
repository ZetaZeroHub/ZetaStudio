export default {
  name: '太空射击',
  description: '经典太空射击游戏，控制飞船消灭敌人',
  templateType: 'shooter',
  icon: '🚀',
  elements: [
    { id: 'bg', name: '太空背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600, depth: 0 }, style: { fillColor: '#0a0e1a', gradientTo: '#1a1040', alpha: 1 } },
    { id: 'stars', name: '星空粒子', category: 'scene', type: 'particles', visible: true, transform: { x: 0, y: 0, width: 800, height: 600, depth: 1 }, style: { fillColor: '#ffffff', particleCount: 80, particleSize: 1.5, alpha: 1 } },
    { id: 'player', name: '玩家飞船', category: 'sprite', type: 'graphics', visible: true, transform: { x: 400, y: 520, width: 36, height: 36, depth: 10 }, style: { fillColor: '#6366f1', shape: 'triangle', alpha: 1 } },
    { id: 'bullet_tpl', name: '子弹(模板)', category: 'sprite', type: 'graphics', visible: false, transform: { x: -100, y: -100, width: 6, height: 18, depth: 8 }, style: { fillColor: '#22d3ee', shape: 'rect', alpha: 1, borderRadius: 2 } },
    { id: 'enemy_1', name: '敌机 1', category: 'sprite', type: 'graphics', visible: true, transform: { x: 200, y: -60, width: 32, height: 32, depth: 9 }, style: { fillColor: '#ef4444', shape: 'rect', alpha: 1, borderRadius: 4 } },
    { id: 'enemy_2', name: '敌机 2', category: 'sprite', type: 'graphics', visible: true, transform: { x: 400, y: -130, width: 32, height: 32, depth: 9 }, style: { fillColor: '#f97316', shape: 'rect', alpha: 1, borderRadius: 4 } },
    { id: 'enemy_3', name: '敌机 3', category: 'sprite', type: 'graphics', visible: true, transform: { x: 600, y: -290, width: 32, height: 32, depth: 9 }, style: { fillColor: '#ec4899', shape: 'circle', alpha: 1 } },
    { id: 'score_label', name: '得分显示', category: 'sprite', type: 'text', visible: true, transform: { x: 20, y: 16, width: 200, height: 30, depth: 50 }, textContent: { text: 'Score: 0', fontSize: 22, fontFamily: 'Arial', color: '#ffffff', bold: true } },
    { id: 'var_score', name: 'score', category: 'data', type: 'variable', visible: true, dataValue: 0 }
  ],
  scripts: [
    {
      id: 's_main',
      name: 'main.js',
      content: `// 太空射击游戏逻辑
const player = elements['player'];
const bulletTpl = elements['bullet_tpl'];
const scoreLabel = elements['score_label'];
const enemies = [elements['enemy_1'], elements['enemy_2'], elements['enemy_3']];
const bullets = [];
let score = 0;

// 键盘控制
const keys = {};
window.addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault(); 
    }
  }
  keys[e.code] = true;
});
window.addEventListener('keyup', e => keys[e.code] = false);

// 爆炸特效生成器 (Particle System)
function explode(x, y, color) {
  const container = new PIXI.Container();
  container.x = x;
  container.y = y;
  app.stage.addChild(container);
  
  // 生成碎块粒子
  for (let i = 0; i < 15; i++) {
    const p = new PIXI.Graphics();
    p.circle(0, 0, Math.random() * 3 + 1);
    p.fill({ color: color });
    p.vx = (Math.random() - 0.5) * 12;
    p.vy = (Math.random() - 0.5) * 12;
    p.life = 1.0;
    container.addChild(p);
  }
  
  // 每帧更新粒子
  const ticker = () => {
    container.children.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = p.life;
      p.life -= 0.04;
    });
    // 生命周期结束清理
    if (container.children.length > 0 && container.children[0].life <= 0) {
      app.ticker.remove(ticker);
      app.stage.removeChild(container);
      container.destroy({ children: true });
    }
  };
  app.ticker.add(ticker);
}

// 发射子弹
let lastShot = 0;
function shoot() {
  const now = Date.now();
  if (now - lastShot < 200) return;
  lastShot = now;
  
  const b = new PIXI.Graphics(bulletTpl.geometry);
  b.fill({ color: 0x22d3ee }).roundRect(-3, -9, 6, 18, 2).fill();
  b.x = player.x;
  b.y = player.y - 18;
  app.stage.addChild(b);
  bullets.push(b);
}

// 碰撞检测 (AABB)
function hitTest(r1, r2) {
  const b1 = r1.getBounds();
  const b2 = r2.getBounds();
  return b1.x < b2.x + b2.width && b1.x + b1.width > b2.x &&
         b1.y < b2.y + b2.height && b1.y + b1.height > b2.y;
}

app.ticker.add(() => {
  // 玩家移动限制
  if (keys['ArrowLeft'] && player.x > 20) player.x -= 7;
  if (keys['ArrowRight'] && player.x < 780) player.x += 7;
  if (keys['ArrowUp'] && player.y > 20) player.y -= 7;
  if (keys['ArrowDown'] && player.y < 580) player.y += 7;
  
  if (keys['Space']) shoot();

  // 更新子弹
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y -= 12;
    if (b.y < -50) {
      app.stage.removeChild(b);
      bullets.splice(i, 1);
    }
  }

  // 敌机掉落 & 碰撞
  enemies.forEach(enemy => {
    if (!enemy) return;
    enemy.y += 3;
    if (enemy.y > 650) {
      enemy.y = -50; 
      enemy.x = Math.random() * 700 + 50;
      enemy.alpha = 1; // 恢复显示
    }

    // 检测子弹打中敌机
    bullets.forEach((b, bIdx) => {
      if (enemy.alpha === 1 && hitTest(b, enemy)) {
        app.stage.removeChild(b);
        bullets.splice(bIdx, 1);
        
        enemy.alpha = 0; // 隐藏敌机代表死亡
        
        // 触发爆炸粒子特效
        const enemyColorConfig = enemy.__elementData?.style?.fillColor;
        const colorVal = typeof enemyColorConfig === 'string' ? parseInt(enemyColorConfig.replace('#', ''), 16) : 0xffaa00;
        explode(enemy.x, enemy.y, colorVal);

        // 更新游戏分数
        score += 10;
        setVariable('score', score);
        scoreLabel.text = 'Score: ' + score;
        
        // 延时重置敌机
        setTimeout(() => {
          enemy.y = -50;
          enemy.x = Math.random() * 700 + 50;
          enemy.alpha = 1;
        }, 1000);
      }
    });
  });
});
`
    }
  ]
};
