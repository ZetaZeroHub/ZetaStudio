import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './MazeHomePage.module.css';

/* ── Asset paths ── */
const C = '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Characters/Double';
const T = '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Tiles/Double';
const R = '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles';
const CUR = '/assets/kenney/kenney_cursor-pixel-pack/Tiles';
const UI = '/assets/kenney/kenney_ui-pack-pixel-adventure/Tiles/Large tiles/Thick outline';

const ASSETS = {
  // Hero frames
  heroWalkA: `${C}/character_green_walk_a.png`,
  heroWalkB: `${C}/character_green_walk_b.png`,
  heroIdle:  `${C}/character_green_idle.png`,
  heroJump:  `${C}/character_green_jump.png`,
  // NPC frames
  npcWalkA:  `${C}/character_pink_walk_a.png`,
  npcWalkB:  `${C}/character_pink_walk_b.png`,
  npcIdle:   `${C}/character_pink_idle.png`,
  npcJump:   `${C}/character_pink_jump.png`,
  // Environment
  ground:  `${T}/block_green.png`,
  cloud1:  `${R}/tile_0231.png`,
  cloud2:  `${R}/tile_0232.png`,
  tree:    `${R}/tile_0198.png`,
  // Collectibles — cursor-pixel-pack icons
  gem:     `${CUR}/tile_0064.png`,   // diamond shape
  star:    `${CUR}/tile_0058.png`,   // hand/click icon
  key:     `${CUR}/tile_0068.png`,   // lock icon
  heart:   `${CUR}/tile_0057.png`,   // crosshair/target
  flag:    `${CUR}/tile_0150.png`,   // pencil/edit icon
  // Button icons — cursor-pixel-pack
  iconPlay:    `${CUR}/tile_0042.png`,  // pointing cursor
  iconCreate:  `${CUR}/tile_0043.png`,  // pointer alt
  iconArrow:   `${CUR}/tile_0072.png`,  // right arrow
  // UI panels
  panelBg:     `${UI}/tile_0000.png`,   // beige panel
  panelFrame:  `${UI}/tile_0006.png`,   // fancy frame
};

/* ── Preload images ── */
function loadImg(src) {
  const img = new Image();
  img.src = src;
  return img;
}

export default function MazeHomePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Responsive size
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Load all images
    const imgs = {};
    Object.entries(ASSETS).forEach(([k, src]) => { imgs[k] = loadImg(src); });

    // ── Scene state ──
    const W = () => canvas.width;
    const H = () => canvas.height;
    const groundH = 48;

    // Clouds
    const clouds = [
      { img: 'cloud1', x: 0, y: 0.08, speed: 0.3, size: 48, alpha: 0.5 },
      { img: 'cloud2', x: 0.4, y: 0.14, speed: 0.22, size: 56, alpha: 0.35 },
      { img: 'cloud1', x: 0.7, y: 0.22, speed: 0.35, size: 40, alpha: 0.45 },
      { img: 'cloud2', x: 0.2, y: 0.1, speed: 0.18, size: 52, alpha: 0.3 },
    ];

    // Ground scroll
    let groundX = 0;
    let treeX = 0;

    // Hero state
    const hero = {
      x: 0.22, groundY: 0, vy: 0,
      state: 'walk', // walk, idle, jump
      stateTimer: 0, walkFrame: 0, walkTimer: 0,
      shootTimer: 0, isJumping: false,
    };

    // NPC
    const npcs = [];
    let npcSpawnTimer = 180; // frames till next NPC

    // Bullets
    const bullets = [];

    // Collectibles
    const collectibles = [];
    let collectTimer = 120;

    let frame = 0;
    let running = true;

    function spawnNPC() {
      npcs.push({
        x: W() + 30,
        groundY: 0,
        vy: 0,
        state: 'walk',
        stateTimer: 0,
        walkFrame: 0,
        walkTimer: 0,
        isJumping: false,
        jumpChance: Math.random(),
        speed: 0.8 + Math.random() * 0.5,
      });
    }

    function spawnCollectible() {
      const types = ['star', 'gem', 'heart', 'key'];
      collectibles.push({
        type: types[Math.floor(Math.random() * types.length)],
        x: W() + 20,
        y: H() - groundH - 40 - Math.random() * 80,
      });
    }

    function tick() {
      if (!running) return;
      const w = W(), h = H();
      const gY = h - groundH;
      hero.groundY = gY;
      frame++;

      ctx.clearRect(0, 0, w, h);

      // ── Sky gradient ──
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#87CEEB');
      grad.addColorStop(0.4, '#B6E8FF');
      grad.addColorStop(0.7, '#C8E6C9');
      grad.addColorStop(1, '#4E7A3E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // ── Clouds ──
      clouds.forEach(c => {
        c.x += c.speed;
        if (c.x > w + c.size) c.x = -c.size;
        ctx.globalAlpha = c.alpha;
        ctx.imageSmoothingEnabled = false;
        const ci = imgs[c.img];
        if (ci.complete) ctx.drawImage(ci, c.x, h * c.y, c.size, c.size * 0.6);
      });
      // Init cloud x
      if (frame === 1) clouds.forEach((c, i) => { c.x = w * c.x; });
      ctx.globalAlpha = 1;

      // ── Trees (parallax) ──
      treeX -= 0.5;
      const treeSpacing = 100;
      const treeImg = imgs.tree;
      if (treeImg.complete) {
        for (let i = 0; i < 8; i++) {
          const tx = ((treeX + i * treeSpacing) % (treeSpacing * 8) + treeSpacing * 8) % (treeSpacing * 8) - treeSpacing;
          ctx.globalAlpha = 0.6;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(treeImg, tx, gY - 36, 36, 36);
        }
      }
      ctx.globalAlpha = 1;

      // ── Ground scroll ──
      groundX -= 1.5;
      const groundImg = imgs.ground;
      if (groundImg.complete) {
        ctx.imageSmoothingEnabled = false;
        for (let i = -1; i < w / groundH + 2; i++) {
          const gx = ((groundX + i * groundH) % groundH + groundH) % groundH + (i - 1) * groundH;
          ctx.drawImage(groundImg, gx, gY, groundH, groundH);
        }
      }

      // ── Hero logic ──
      hero.stateTimer--;
      hero.walkTimer++;

      // State machine
      if (hero.stateTimer <= 0 && !hero.isJumping) {
        const r = Math.random();
        if (r < 0.55) {
          hero.state = 'walk';
          hero.stateTimer = 90 + Math.random() * 120;
        } else if (r < 0.75) {
          hero.state = 'idle';
          hero.stateTimer = 40 + Math.random() * 60;
        } else {
          // Jump
          hero.state = 'jump';
          hero.isJumping = true;
          hero.vy = -6;
          hero.stateTimer = 999;
        }
      }

      // Walk animation frame
      if (hero.walkTimer % 12 === 0) hero.walkFrame = 1 - hero.walkFrame;

      // Gravity
      if (hero.isJumping) {
        hero.vy += 0.3;
        hero.groundY += hero.vy;
        if (hero.groundY >= gY) {
          hero.groundY = gY;
          hero.isJumping = false;
          hero.vy = 0;
          hero.stateTimer = 0; // pick new state
        }
      } else {
        hero.groundY = gY;
      }

      // Shooting
      hero.shootTimer--;
      if (hero.shootTimer <= 0 && hero.state === 'walk') {
        hero.shootTimer = 45 + Math.random() * 30;
        bullets.push({ x: w * hero.x + 28, y: hero.groundY - 24, vx: 4 + Math.random() * 2 });
      }

      // Draw hero
      let heroImg;
      if (hero.isJumping) heroImg = imgs.heroJump;
      else if (hero.state === 'idle') heroImg = imgs.heroIdle;
      else heroImg = hero.walkFrame ? imgs.heroWalkA : imgs.heroWalkB;
      if (heroImg && heroImg.complete) {
        ctx.imageSmoothingEnabled = false;
        const sz = 52;
        ctx.drawImage(heroImg, w * hero.x - sz / 2, hero.groundY - sz, sz, sz);
      }

      // ── Bullets ──
      bullets.forEach((b, i) => {
        b.x += b.vx;
        ctx.fillStyle = '#FF9800';
        ctx.shadowColor = 'rgba(255,152,0,0.6)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (b.x > w + 20) bullets.splice(i, 1);
      });

      // ── NPCs ──
      npcSpawnTimer--;
      if (npcSpawnTimer <= 0) {
        spawnNPC();
        npcSpawnTimer = 200 + Math.random() * 200;
      }

      npcs.forEach((npc, i) => {
        npc.x -= npc.speed;
        npc.walkTimer = (npc.walkTimer || 0) + 1;
        if (npc.walkTimer % 14 === 0) npc.walkFrame = 1 - npc.walkFrame;

        // Random jump
        if (!npc.isJumping && Math.random() < 0.005 && npc.jumpChance > 0.4) {
          npc.isJumping = true;
          npc.vy = -5;
          npc.state = 'jump';
        }

        // Gravity
        if (npc.isJumping) {
          npc.vy += 0.3;
          npc.groundY += npc.vy;
          if (npc.groundY >= 0) {
            npc.groundY = 0;
            npc.isJumping = false;
            npc.vy = 0;
            npc.state = 'walk';
          }
        }

        // Decide state
        npc.stateTimer = (npc.stateTimer || 0) - 1;
        if (npc.stateTimer <= 0 && !npc.isJumping) {
          const r = Math.random();
          if (r < 0.7) { npc.state = 'walk'; npc.stateTimer = 60 + Math.random() * 60; }
          else { npc.state = 'idle'; npc.stateTimer = 30 + Math.random() * 40; npc.speed = 0; }
          if (npc.state === 'walk') npc.speed = 0.8 + Math.random() * 0.5;
        }

        let npcImg;
        if (npc.isJumping) npcImg = imgs.npcJump;
        else if (npc.state === 'idle') npcImg = imgs.npcIdle;
        else npcImg = npc.walkFrame ? imgs.npcWalkA : imgs.npcWalkB;

        if (npcImg && npcImg.complete) {
          ctx.imageSmoothingEnabled = false;
          const sz = 44;
          // NPC faces left (flip)
          ctx.save();
          ctx.translate(npc.x, gY - sz + npc.groundY);
          ctx.scale(-1, 1);
          ctx.drawImage(npcImg, -sz / 2, 0, sz, sz);
          ctx.restore();
        }

        if (npc.x < -50) npcs.splice(i, 1);
      });

      // ── Collectibles ──
      collectTimer--;
      if (collectTimer <= 0) {
        spawnCollectible();
        collectTimer = 90 + Math.random() * 120;
      }

      collectibles.forEach((c, i) => {
        c.x -= 1.2;
        const ci = imgs[c.type];
        if (ci && ci.complete) {
          ctx.imageSmoothingEnabled = false;
          const float = Math.sin(frame * 0.05 + c.x * 0.01) * 4;
          ctx.drawImage(ci, c.x, c.y + float, 24, 24);
        }
        if (c.x < -30) collectibles.splice(i, 1);
      });

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={styles.page}>
      {/* Animated canvas scene */}
      <canvas ref={canvasRef} className={styles.sceneCanvas} />

      {/* Content Overlay */}
      <div className={styles.contentOverlay}>
        <motion.div
          className={styles.titleBlock}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.titlePanel} style={{ backgroundImage: `url(${ASSETS.panelFrame})` }}>
            <h1 className={styles.heroTitle}>游戏梦想家</h1>
          </div>
          <p className={styles.heroSub}>AI 驱动创作 · 用想象力生成你的游戏世界</p>
        </motion.div>

        <div className={styles.actions}>
          <motion.button
            className={styles.btnPrimary}
            onClick={() => navigate('/maze/difficulty')}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.96 }}
          >
            <img src={ASSETS.iconPlay} alt="" className={styles.btnIcon} />
            <span>开始冒险</span>
            <img src={ASSETS.iconArrow} alt="" className={styles.btnIconSmall} />
          </motion.button>

          <motion.button
            className={styles.btnSecondary}
            onClick={() => navigate('/maze/creator')}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.96 }}
          >
            <img src={ASSETS.iconCreate} alt="" className={styles.btnIcon} />
            <span>创作游戏</span>
          </motion.button>
        </div>

        {/* User works section */}
        {(() => {
          const STORAGE_KEY = 'game_drafts_v1';
          let drafts = [];
          try { drafts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch {}
          const recent = drafts.filter(d => d.published).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 3);
          if (recent.length === 0) return null;
          return (
            <motion.div
              className={styles.worksSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className={styles.worksSectionTitle}>我的作品</h3>
              <div className={styles.worksGrid}>
                {recent.map((d) => (
                  <div
                    key={d.id}
                    className={styles.workCard}
                    onClick={() => navigate(`/maze/editor/${d.templateType || 'platformer'}/${d.baseLevelId || d.id}`)}
                  >
                    <div className={styles.workCardType}>
                      {d.templateType === 'topdown' ? '🌍 2.5D' : '🎮 横版'}
                    </div>
                    <div className={styles.workCardName}>{d.name || '未命名'}</div>
                    <div className={styles.workCardTime}>
                      {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('zh-CN') : ''}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}
