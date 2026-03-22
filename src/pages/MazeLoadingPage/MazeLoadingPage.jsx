/* ========================================
   MazeLoadingPage — 游戏梦想家加载界面
   预加载所有首页 UI 素材后进入主界面
   ======================================== */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MazeLoadingPage.module.css';

/* ── 需要预加载的素材 ── */
const KENNEY = '/assets/kenney';
const CHARS = `${KENNEY}/kenney_new-platformer-pack-1.1/Sprites/Characters/Double`;
const TILES = `${KENNEY}/kenney_new-platformer-pack-1.1/Sprites/Tiles/Double`;
const REDUX = `${KENNEY}/kenney_platformer-art-pixel-redux/Tiles`;
const UI_PACK = `${KENNEY}/kenney_ui-pack/PNG`;
const INPUT = `${KENNEY}/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double`;

const PRELOAD_IMAGES = [
  // ── MazeHomePage 角色 ──
  `${CHARS}/character_green_walk_a.png`,
  `${CHARS}/character_green_walk_b.png`,
  `${CHARS}/character_green_idle.png`,
  `${CHARS}/character_green_jump.png`,
  `${CHARS}/character_pink_walk_a.png`,
  `${CHARS}/character_pink_walk_b.png`,
  `${CHARS}/character_pink_idle.png`,
  `${CHARS}/character_pink_jump.png`,
  // ── 环境 ──
  `${TILES}/block_green.png`,
  `${REDUX}/tile_0231.png`,
  `${REDUX}/tile_0232.png`,
  `${REDUX}/tile_0198.png`,
  // ── 收集物 & 图标 (kenney_ui-pack) ──
  `${UI_PACK}/Blue/Default/icon_circle.png`,
  `${UI_PACK}/Yellow/Default/icon_circle.png`,
  `${UI_PACK}/Green/Default/icon_circle.png`,
  `${UI_PACK}/Red/Default/icon_circle.png`,
  `${UI_PACK}/Yellow/Default/icon_square.png`,
  `${UI_PACK}/Extra/Default/icon_play_light.png`,
  `${UI_PACK}/Extra/Default/icon_repeat_light.png`,
  `${UI_PACK}/Yellow/Default/arrow_basic_e.png`,
  // ── Input Prompts (方向键+摇杆) ──
  `${INPUT}/switch_dpad.png`,
  `${INPUT}/switch_dpad_left.png`,
  `${INPUT}/switch_dpad_right.png`,
  `${INPUT}/switch_dpad_up.png`,
  `${INPUT}/switch_stick_r.png`,
  `${INPUT}/switch_stick_r_up.png`,
  `${INPUT}/switch_stick_r_down.png`,
  `${INPUT}/switch_stick_r_left.png`,
  `${INPUT}/switch_stick_r_right.png`,
  // ── Spritesheet PNGs (主包) ──
  `${KENNEY}/kenney_new-platformer-pack-1.1/Spritesheets/spritesheet-characters-default.png`,
  `${KENNEY}/kenney_new-platformer-pack-1.1/Spritesheets/spritesheet-enemies-default.png`,
  `${KENNEY}/kenney_new-platformer-pack-1.1/Spritesheets/spritesheet-tiles-default.png`,
  // ── 背景 ──
  `${KENNEY}/kenney_new-platformer-pack-1.1/Sprites/Backgrounds/Default/background_color_trees.png`,
  `${KENNEY}/kenney_new-platformer-pack-1.1/Sprites/Backgrounds/Default/background_color_hills.png`,
  `${KENNEY}/kenney_new-platformer-pack-1.1/Sprites/Backgrounds/Default/background_color_desert.png`,
  `${KENNEY}/kenney_new-platformer-pack-1.1/Sprites/Backgrounds/Default/background_color_mushrooms.png`,
];

const PRELOAD_DATA = [
  // XML spritesheets metadata
  `${KENNEY}/kenney_new-platformer-pack-1.1/Spritesheets/spritesheet-characters-default.xml`,
  `${KENNEY}/kenney_new-platformer-pack-1.1/Spritesheets/spritesheet-enemies-default.xml`,
  `${KENNEY}/kenney_new-platformer-pack-1.1/Spritesheets/spritesheet-tiles-default.xml`,
];

const LOADING_TIPS = [
  '欢迎来到游戏梦想家!',
  '冒险即将开始...',
  '收集星星和宝石可以解锁新能力!',
  '提示: 撞墙不会 Game Over 哦!',
  '在创作工坊编辑属于你的关卡!',
  '用元素泡泡克制不同属性的敌人!',
  '三段跳! 试试连按三次跳跃!',
  '每个关卡都有独特的 BOSS 等你!',
];

export default function MazeLoadingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [done, setDone] = useState(false);
  const animRef = useRef(null);

  // Cycle tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx(i => (i + 1) % LOADING_TIPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Preload assets
  useEffect(() => {
    let cancelled = false;
    const total = PRELOAD_IMAGES.length + PRELOAD_DATA.length;
    let loaded = 0;

    const tick = () => {
      loaded++;
      if (!cancelled) {
        setProgress(Math.min(loaded / total, 1));
      }
    };

    // Load images
    const imgPromises = PRELOAD_IMAGES.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = () => { tick(); resolve(); };
      img.onerror = () => { tick(); resolve(); }; // don't block on failures
      img.src = src;
    }));

    // Fetch XML/data files
    const dataPromises = PRELOAD_DATA.map(url =>
      fetch(url)
        .then(r => r.text())
        .catch(() => {})
        .finally(() => tick())
    );

    Promise.all([...imgPromises, ...dataPromises]).then(() => {
      if (!cancelled) {
        setProgress(1);
        setTimeout(() => {
          if (!cancelled) setDone(true);
        }, 600); // Short pause at 100%
      }
    });

    return () => { cancelled = true; };
  }, []);

  // Navigate once done
  useEffect(() => {
    if (done) {
      navigate('/maze/home', { replace: true });
    }
  }, [done, navigate]);

  // ── Pixel art canvas animation ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let running = true;
    let frame = 0;

    // Load hero sprites for animation
    const heroA = new Image(); heroA.src = `${CHARS}/character_green_walk_a.png`;
    const heroB = new Image(); heroB.src = `${CHARS}/character_green_walk_b.png`;
    const ground = new Image(); ground.src = `${TILES}/block_green.png`;
    const cloud = new Image(); cloud.src = `${REDUX}/tile_0231.png`;
    const gem = new Image(); gem.src = `${UI_PACK}/Yellow/Default/icon_circle.png`;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 180;
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      if (!running) return;
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      const groundY = h - 40;

      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1a1a2e');
      grad.addColorStop(0.5, '#16213e');
      grad.addColorStop(1, '#0f3460');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 30; i++) {
        const sx = (i * 127 + frame * 0.15) % w;
        const sy = (i * 73) % (groundY - 10);
        const sr = Math.sin(frame * 0.05 + i) * 0.3 + 0.7;
        ctx.globalAlpha = sr * 0.6;
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.globalAlpha = 1;

      // Scrolling clouds
      if (cloud.complete) {
        ctx.globalAlpha = 0.2;
        ctx.imageSmoothingEnabled = false;
        const cx1 = (frame * 0.3) % (w + 48) - 48;
        const cx2 = (frame * 0.2 + w * 0.5) % (w + 64) - 64;
        ctx.drawImage(cloud, cx1, 20, 48, 28);
        ctx.drawImage(cloud, cx2, 45, 56, 32);
        ctx.globalAlpha = 1;
      }

      // Ground tiles
      if (ground.complete) {
        ctx.imageSmoothingEnabled = false;
        const tileW = 40;
        const scrollX = (frame * 1.5) % tileW;
        for (let x = -tileW; x < w + tileW; x += tileW) {
          ctx.drawImage(ground, x - scrollX, groundY, tileW, 40);
        }
      } else {
        ctx.fillStyle = '#4E7A3E';
        ctx.fillRect(0, groundY, w, 40);
      }

      // Walking hero
      const heroFrame = Math.floor(frame / 12) % 2 === 0 ? heroA : heroB;
      if (heroFrame.complete) {
        ctx.imageSmoothingEnabled = false;
        const hx = w * 0.35;
        const hy = groundY - 40;
        // Bounce
        const bounce = Math.sin(frame * 0.2) * 2;
        ctx.drawImage(heroFrame, hx, hy + bounce, 36, 40);
      }

      // Floating collectibles
      if (gem.complete) {
        ctx.imageSmoothingEnabled = false;
        for (let i = 0; i < 3; i++) {
          const gx = (w * 0.55 + i * 60 + frame * 1.2) % (w + 30) - 30;
          const gy = groundY - 50 - Math.sin(frame * 0.06 + i * 2) * 12;
          const ga = Math.sin(frame * 0.04 + i) * 0.3 + 0.7;
          ctx.globalAlpha = ga;
          ctx.drawImage(gem, gx, gy, 20, 20);
        }
        ctx.globalAlpha = 1;
      }

      // Particles (sparkle trail behind hero)
      for (let i = 0; i < 5; i++) {
        const px = w * 0.35 - 10 - i * 10 + Math.sin(frame * 0.1 + i) * 3;
        const py = groundY - 20 + Math.cos(frame * 0.15 + i * 2) * 6;
        const pa = 0.5 - i * 0.1;
        const ps = 3 - i * 0.4;
        ctx.globalAlpha = Math.max(0, pa);
        ctx.fillStyle = '#58CC02';
        ctx.fillRect(px, py, ps, ps);
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const pct = Math.round(progress * 100);

  return (
    <div className={styles.page}>
      {/* Animated scene — gray-blue Kenney frame */}
      <div className={`${styles.canvasWrap} kenneyFrameGray`}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      {/* Logo — fancy Kenney panel with corner studs */}
      <div className={`${styles.logo} kenneyPanelFancy`}>
        <span className={styles.logoText}>游戏梦想家</span>
      </div>

      {/* Progress bar */}
      <div className={styles.barWrap}>
        <div className={`${styles.barTrack} kenneyPanelDarkBrown`}>
          <div
            className={styles.barFill}
            style={{ width: `${pct}%` }}
          />
          {/* Sparkle at leading edge */}
          <div
            className={styles.barSparkle}
            style={{ left: `${pct}%` }}
          />
        </div>
        <div className={styles.barPct}>{pct}%</div>
      </div>

      {/* Status text */}
      <div className={styles.status}>
        {pct < 100 ? '正在加载资源...' : '准备就绪!'}
      </div>

      {/* Tips — brown Kenney panel */}
      <div className={`${styles.tip} kenneyPanelBrown`} key={tipIdx}>
        {LOADING_TIPS[tipIdx]}
      </div>

      {/* Decorative ground */}
      <div className={styles.ground} />
    </div>
  );
}
