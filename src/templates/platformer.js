export default {
  name: '像素冒险',
  description: '经典平台跳跃冒险游戏，收集星星获取分数',
  templateType: 'platformer',
  icon: '🏃',
  elements: [
    { id: 'bg', name: '蓝天背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600, depth: 0 }, style: { fillColor: '#1e3a5f', gradientTo: '#87ceeb', alpha: 1 } },
    { id: 'ground', name: '地面', category: 'sprite', type: 'graphics', visible: true, transform: { x: 400, y: 580, width: 800, height: 40, depth: 5 }, style: { fillColor: '#4a7c3f', shape: 'rect' } },
    { id: 'p1', name: '平台 1', category: 'sprite', type: 'graphics', visible: true, transform: { x: 200, y: 440, width: 160, height: 20, depth: 5 }, style: { fillColor: '#8b6914', shape: 'rect', borderRadius: 4 } },
    { id: 'p2', name: '平台 2', category: 'sprite', type: 'graphics', visible: true, transform: { x: 500, y: 340, width: 140, height: 20, depth: 5 }, style: { fillColor: '#8b6914', shape: 'rect', borderRadius: 4 } },
    { id: 'hero', name: '主角', category: 'sprite', type: 'graphics', visible: true, transform: { x: 100, y: 500, width: 32, height: 40, depth: 10 }, style: { fillColor: '#3b82f6', shape: 'rect', borderRadius: 6, hasEyes: true } },
    { id: 'star_1', name: '星星 1', category: 'sprite', type: 'graphics', visible: true, transform: { x: 200, y: 400, width: 24, height: 24, depth: 8 }, style: { fillColor: '#fbbf24', shape: 'star', starPoints: 5 } },
    { id: 'star_2', name: '星星 2', category: 'sprite', type: 'graphics', visible: true, transform: { x: 500, y: 300, width: 24, height: 24, depth: 8 }, style: { fillColor: '#fbbf24', shape: 'star', starPoints: 5 } },
    { id: 'score_text', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 20, y: 16, depth: 50 }, textContent: { text: '⭐ 0', fontSize: 24, color: '#fbbf24', bold: true } },
    { id: 'var_score', name: 'score', category: 'data', type: 'variable', visible: true, dataValue: 0 }
  ],
  scripts: [
    {
      id: 's_main',
      name: 'main.js',
      content: `// 平台跳跃脚本逻辑
const hero = elements['hero'];
const grounds = [elements['ground'], elements['p1'], elements['p2']];
const stars = [elements['star_1'], elements['star_2']];
const scoreUI = elements['score_text'];

let vy = 0;
const gravity = 0.6;
const jumpForce = -12;
const speed = 5;
let isGrounded = false;

// 键盘控制
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// AABB 碰撞检测
function hitTest(r1, r2) {
  const b1 = r1.getBounds();
  const b2 = r2.getBounds();
  return b1.x < b2.x + b2.width - 2 && b1.x + b1.width > b2.x + 2 &&
         b1.y < b2.y + b2.height && b1.y + b1.height > b2.y;
}

// 粒子特效系统
const particles = [];
function createCollectEffect(x, y) {
  for(let i=0; i<8; i++) {
    const p = new PIXI.Graphics();
    p.circle(0, 0, 4);
    p.fill({ color: 0xfbbf24 });
    p.x = x;
    p.y = y;
    const angle = (Math.PI * 2 / 8) * i;
    const speed = 2 + Math.random() * 2;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.life = 1.0;
    app.stage.addChild(p);
    particles.push(p);
  }
}

app.ticker.add(() => {
  // 水平移动
  if (keys['ArrowLeft']) hero.x -= speed;
  if (keys['ArrowRight']) hero.x += speed;

  // 重力和跳跃
  vy += gravity;
  hero.y += vy;
  
  if (keys['ArrowUp'] && isGrounded) {
    vy = jumpForce;
    isGrounded = false;
  }

  // 平台碰撞 (让脚踩在平台上)
  isGrounded = false;
  grounds.forEach(g => {
    if (hitTest(hero, g)) {
      if (vy > 0 && hero.y < g.y) {
        // 踩在上面
        hero.y = g.y - (hero.height / 2) - (g.height / 2);
        vy = 0;
        isGrounded = true;
      }
    }
  });
  
  // 防止掉出屏幕
  if (hero.y > 650) { hero.x = 100; hero.y = 100; vy = 0; }

  // 更新粒子
  for(let i=particles.length-1; i>=0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha = p.life;
    p.life -= 0.05;
    if(p.life <= 0) {
      app.stage.removeChild(p);
      p.destroy();
      particles.splice(i, 1);
    }
  }

  // 收集星星
  stars.forEach(star => {
    if (star.visible && hitTest(hero, star)) {
      star.visible = false;
      
      const newScore = (variables.score || 0) + 1;
      setVariable('score', newScore);
      
      // 更新UI显示
      if (scoreUI.children && scoreUI.children[0]) {
        scoreUI.children[0].text = '⭐ ' + newScore;
      }
      
      // 触发爆点特效
      createCollectEffect(star.x, star.y);
    }
  });
});`
    }
  ]
};
