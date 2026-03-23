/* ========================================
   MazePathGame — 走出迷宫 · 路径绘制游戏
   触屏画路线 → 鸭子自动走 → 到水池胜利
   支持相机缩放 + 开场全景动画
   ======================================== */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMazeLevel, MAZE_ASSETS, resolveRoadTile } from '../../data/topDownLevels';
import { playClickSound, playSelectSound, playBackSound } from '../../utils/gameUISound';
import styles from './MazePathGame.module.css';

const UI = '/assets/kenney/kenney_ui-pack/PNG';

/* ── 游戏状态机 ── */
const PHASE = { INTRO: 'intro', DRAWING: 'drawing', WALKING: 'walking', VICTORY: 'victory' };

/* ── 场景装饰生成器 ── */

// Simple single-sprite decoration types
const DECO_TYPES = [
  // type key in MAZE_ASSETS, scale range, weight, layer
  { key: 'raceTreeLarge',  minS: 0.9, maxS: 1.4, weight: 20, layer: 'over' },
  { key: 'raceTreeSmall',  minS: 0.6, maxS: 1.0, weight: 15, layer: 'over' },
  { key: 'treePine',       minS: 0.5, maxS: 0.8, weight: 12, layer: 'over' },
  { key: 'treeRound',      minS: 0.5, maxS: 0.8, weight: 8,  layer: 'over' },
  { key: 'raceRock1',      minS: 0.3, maxS: 0.5, weight: 6,  layer: 'under' },
  { key: 'raceRock2',      minS: 0.3, maxS: 0.5, weight: 6,  layer: 'under' },
  { key: 'raceRock3',      minS: 0.3, maxS: 0.5, weight: 5,  layer: 'under' },
  { key: 'bush',           minS: 0.35, maxS: 0.55, weight: 8, layer: 'under' },
  { key: 'bushSmall',      minS: 0.25, maxS: 0.4, weight: 8,  layer: 'under' },
  { key: 'flower',         minS: 0.25, maxS: 0.4, weight: 6,  layer: 'under' },
  { key: 'grassTuft',      minS: 0.2, maxS: 0.35, weight: 10, layer: 'under' },
  { key: 'raceTentBlue',   minS: 0.6, maxS: 0.9, weight: 2,  layer: 'over' },
  { key: 'raceTentRed',    minS: 0.6, maxS: 0.9, weight: 2,  layer: 'over' },
  { key: 'raceBarrelBlue', minS: 0.3, maxS: 0.45, weight: 3, layer: 'under' },
  { key: 'raceBarrelRed',  minS: 0.3, maxS: 0.45, weight: 3, layer: 'under' },
  { key: 'raceCone',       minS: 0.25, maxS: 0.35, weight: 3, layer: 'under' },
  // Block-pack trees & plants
  { key: 'blockTreeGreen',   minS: 0.7, maxS: 1.1, weight: 8,  layer: 'over' },
  { key: 'blockTreeOrange',  minS: 0.7, maxS: 1.1, weight: 4,  layer: 'over' },
  { key: 'blockTreeRed',     minS: 0.7, maxS: 1.1, weight: 3,  layer: 'over' },
  { key: 'blockBushLarge',   minS: 0.4, maxS: 0.6, weight: 5,  layer: 'under' },
  { key: 'blockBushSmall',   minS: 0.3, maxS: 0.45, weight: 5, layer: 'under' },
  // Block-pack small objects
  { key: 'blockMarketBlue',  minS: 0.7, maxS: 1.0, weight: 2,  layer: 'over' },
  { key: 'blockMarketRed',   minS: 0.7, maxS: 1.0, weight: 2,  layer: 'over' },
  { key: 'blockFenceSingle', minS: 0.4, maxS: 0.6, weight: 3,  layer: 'under' },
  { key: 'blockFenceDouble', minS: 0.5, maxS: 0.7, weight: 3,  layer: 'under' },
  { key: 'blockCart',        minS: 0.5, maxS: 0.7, weight: 2,  layer: 'over' },
  { key: 'blockBox',         minS: 0.3, maxS: 0.45, weight: 3, layer: 'under' },
  { key: 'blockBoxTreasure', minS: 0.3, maxS: 0.45, weight: 2, layer: 'under' },
  // Characters (higher weight for liveliness!)
  { key: 'blockCharMan',     minS: 0.5, maxS: 0.7, weight: 8,  layer: 'over' },
  { key: 'blockCharWoman',   minS: 0.5, maxS: 0.7, weight: 8,  layer: 'over' },
  { key: 'blockCharWizard',  minS: 0.5, maxS: 0.7, weight: 5,  layer: 'over' },
  { key: 'blockCharHorse',   minS: 0.5, maxS: 0.7, weight: 5,  layer: 'over' },
];

// Compound stacked building blueprints (bottom-to-top layer keys)
// Each layer is drawn as a block stacked vertically with a fixed vertical offset
const BUILDING_BLUEPRINTS = [
  // 2-story stone house with blue roof
  { layers: ['blockWallStone', 'blockRoofBlue'], weight: 4, scale: 0.9 },
  // 2-story stone house with red roof
  { layers: ['blockWallStone', 'blockRoofRed'], weight: 4, scale: 0.9 },
  // 2-story sand house with blue roof
  { layers: ['blockWallSand', 'blockRoofBlue'], weight: 3, scale: 0.9 },
  // 2-story sand house with red roof
  { layers: ['blockWallSand', 'blockRoofRed'], weight: 3, scale: 0.9 },
  // 3-story stone building (wall + wall + roof)
  { layers: ['blockWallStone', 'blockWallStone', 'blockHouseBlue'], weight: 2, scale: 0.9 },
  { layers: ['blockWallSand', 'blockWallSand', 'blockHouseRed'], weight: 2, scale: 0.9 },
  // Castle: gate + castle + castle top
  { layers: ['blockCastleGate', 'blockCastle', 'blockCastleTopRoof'], weight: 1, scale: 1.0 },
  // Small: frame + pointed roof
  { layers: ['blockWallFrame', 'blockHouseBlue'], weight: 3, scale: 0.85 },
  { layers: ['blockWallFrame', 'blockHouseRed'], weight: 3, scale: 0.85 },
];

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateSceneDecorations(level) {
  const T = level.tileSize;
  const rand = seededRandom(42 + level.gridW * 1000 + level.gridH);
  const totalSimpleWeight = DECO_TYPES.reduce((s, d) => s + d.weight, 0);
  const totalBuildingWeight = BUILDING_BLUEPRINTS.reduce((s, b) => s + b.weight, 0);

  function pickSimpleType() {
    let r = rand() * totalSimpleWeight;
    for (const dt of DECO_TYPES) {
      r -= dt.weight;
      if (r <= 0) return dt;
    }
    return DECO_TYPES[0];
  }

  function pickBuilding() {
    let r = rand() * totalBuildingWeight;
    for (const b of BUILDING_BLUEPRINTS) {
      r -= b.weight;
      if (r <= 0) return b;
    }
    return BUILDING_BLUEPRINTS[0];
  }

  const decos = [];
  const pad = 8;
  for (let gy = -pad; gy < level.gridH + pad; gy++) {
    for (let gx = -pad; gx < level.gridW + pad; gx++) {
      // Skip road/water tiles inside grid
      if (gx >= 0 && gx < level.gridW && gy >= 0 && gy < level.gridH) {
        if (level.grid[gy][gx] > 0) continue;
        const distToStart = Math.abs(gx - level.playerStart.gx) + Math.abs(gy - level.playerStart.gy);
        if (distToStart <= 1) continue;
      }
      const isOutside = gx < 0 || gx >= level.gridW || gy < 0 || gy >= level.gridH;
      const chance = isOutside ? 0.25 : 0.18;
      if (rand() > chance) continue;

      // 12% chance to place a compound building instead of a simple deco
      if (rand() < 0.12) {
        const bp = pickBuilding();
        const sc = bp.scale + (rand() - 0.5) * 0.15;
        const offsetX = (rand() - 0.5) * T * 0.3;
        const baseWx = gx * T + T / 2 + offsetX;
        const baseWy = gy * T + T;
        // blockH = vertical height of one block layer in pixel
        const blockH = T * sc * 0.55; // ~55% of tile for vertical stacking
        decos.push({
          type: 'compound',
          sprites: bp.layers.map((key, i) => ({
            asset: MAZE_ASSETS[key],
            // Each layer drawn at: baseY - i * blockH
            yOff: -i * blockH,
          })),
          scale: sc,
          wx: baseWx,
          wy: baseWy,
          layer: 'over',
        });
      } else {
        const dt = pickSimpleType();
        const scale = dt.minS + rand() * (dt.maxS - dt.minS);
        const offsetX = (rand() - 0.5) * T * 0.6;
        const offsetY = (rand() - 0.5) * T * 0.4;
        decos.push({
          type: 'simple',
          asset: MAZE_ASSETS[dt.key],
          scale,
          wx: gx * T + T / 2 + offsetX,
          wy: gy * T + T + offsetY,
          layer: dt.layer,
        });
      }
    }
  }
  return decos;
}

export default function MazePathGame({ level: levelProp, onBack, onPublish, hidePublish } = {}) {
  const { levelId } = useParams();
  const navigate = useNavigate();
  // Stabilize level reference — getMazeLevel(draft-id) creates new objects from localStorage each call,
  // which would cause useEffect([level]) to re-fire infinitely. Cache it in state.
  const [cachedLevel, setCachedLevel] = useState(null);
  useEffect(() => {
    if (levelProp) { setCachedLevel(levelProp); return; }
    if (levelId) {
      const loaded = getMazeLevel(levelId);
      setCachedLevel(loaded);
    }
  }, [levelProp, levelId]);
  const level = cachedLevel;

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const imagesRef = useRef({});
  const gameRef = useRef(null);
  const rafRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [steps, setSteps] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [starCount, setStarCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const showHintRef = useRef(false);

  /* ── 预加载图片 ── */
  useEffect(() => {
    if (!level) return;
    const srcs = new Set(Object.values(MAZE_ASSETS));
    // Also preload the touch hint icon
    srcs.add('/assets/kenney/kenney_input-prompts_1.4.1/Touch/Double/touch_swipe_move.png');
    // Goal marker icons
    srcs.add('/assets/kenney/kenney_board-game-icons/PNG/Default (64px)/flag_triangle.png');
    srcs.add('/assets/kenney/kenney_board-game-icons/PNG/Default (64px)/award.png');
    // Preload custom ground tiles if present
    if (level.groundTiles) {
      Object.values(level.groundTiles).forEach(v => { if (typeof v === 'string' && v.endsWith('.png')) srcs.add(v); });
    }
    // Preload custom goal sprite if present
    if (level.goalDef && level.goalDef.img) srcs.add(level.goalDef.img);
    // Preload custom character sprite if present
    if (level.characterDef) {
      if (level.characterDef.img) srcs.add(level.characterDef.img);
      if (level.characterDef.frames) {
        Object.values(level.characterDef.frames).forEach(arr => { if (Array.isArray(arr)) arr.forEach(s => srcs.add(s)); });
      }
    }

    const allSrcs = [...srcs];
    let count = 0;
    const imgs = {};
    allSrcs.forEach(src => {
      const img = new Image();
      img.onload = () => { count++; if (count === allSrcs.length) setLoaded(true); };
      img.onerror = () => { console.warn('[MazePathGame] load fail:', src); count++; if (count === allSrcs.length) setLoaded(true); };
      img.src = src;
      imgs[src] = img;
    });
    imagesRef.current = imgs;
  }, [level]);

  /* ── 初始化游戏状态 ── */
  useEffect(() => {
    if (!loaded || !level) return;
    const T = level.tileSize;
    const mapW = level.gridW * T;
    const mapH = level.gridH * T;

    gameRef.current = {
      phase: PHASE.INTRO,
      path: [],
      footprints: [],
      duck: {
        gx: level.playerStart.gx,
        gy: level.playerStart.gy,
        px: level.playerStart.gx * T + T / 2,
        py: level.playerStart.gy * T + T / 2,
        dir: 'right',
        walkIdx: 0,
        bobT: 0,
      },
      steps: 0,
      startTime: 0,
      walkSpeed: 2.5,
      // Camera — start centered on duck with a close-up zoom
      cam: { x: level.playerStart.gx * T + T / 2, y: level.playerStart.gy * T + T / 2, zoom: 1.5 },
      camTarget: { x: level.playerStart.gx * T + T / 2, y: level.playerStart.gy * T + T / 2, zoom: 1.5 },
      introStart: Date.now(),
      introDuration: 2500,
      // Interaction
      _isDrawing: false,
      _isPanning: false,
      _panLastX: 0,
      _panLastY: 0,
      // Random scene decorations
      sceneDecorations: generateSceneDecorations(level),
    };
    setSteps(0);
    setElapsed(0);
    setPhase(PHASE.INTRO);
    setStarCount(0);
    setShowHint(false); showHintRef.current = false;
  }, [loaded, level]);

  /* ── 主渲染循环 ── */
  useEffect(() => {
    if (!loaded || !level) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    const T = level.tileSize;
    const mapW = level.gridW * T;
    const mapH = level.gridH * T;

    const render = () => {
      const gs = gameRef.current;
      if (!gs) { rafRef.current = requestAnimationFrame(render); return; }
      const imgs = imagesRef.current;

      // Resize canvas to container
      const rect = wrap.getBoundingClientRect();
      const cw = Math.floor(rect.width * devicePixelRatio);
      const ch = Math.floor(rect.height * devicePixelRatio);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const viewW = rect.width;
      const viewH = rect.height;

      // ── Intro: close-up on duck → zoom out to full map ──
      if (gs.phase === PHASE.INTRO) {
        const t = Math.min(1, (Date.now() - gs.introStart) / gs.introDuration);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad

        // Full-map zoom (see entire maze including start and end)
        const fitZoom = Math.min(viewW / mapW, viewH / mapH) * 0.92;
        // Start close to duck (2× fit zoom)
        const closeUpZoom = fitZoom * 2.5;
        const duckCx = gs.duck.px;
        const duckCy = gs.duck.py;

        // Zoom: close-up → full map
        gs.cam.zoom = closeUpZoom + (fitZoom - closeUpZoom) * ease;
        // Position: duck center → map center
        gs.cam.x = duckCx + (mapW / 2 - duckCx) * ease;
        gs.cam.y = duckCy + (mapH / 2 - duckCy) * ease;

        if (t >= 1) {
          gs.phase = PHASE.DRAWING;
          gs.startTime = Date.now();
          gs.camTarget = { x: mapW / 2, y: mapH / 2, zoom: fitZoom };
          setPhase(PHASE.DRAWING);
          // Show hint after a brief delay so user sees the full map first
          setTimeout(() => { showHintRef.current = true; setShowHint(true); }, 500);
        }
      }

      // ── Camera smooth follow ──
      if (gs.phase !== PHASE.INTRO) {
        const lerpSpeed = 0.06;
        gs.cam.x += (gs.camTarget.x - gs.cam.x) * lerpSpeed;
        gs.cam.y += (gs.camTarget.y - gs.cam.y) * lerpSpeed;
        gs.cam.zoom += (gs.camTarget.zoom - gs.cam.zoom) * lerpSpeed;
      }

      // ── Apply camera transform ──
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, viewW, viewH);

      // Ground base color (style-dependent)
      ctx.fillStyle = (level.groundTiles && level.groundTiles.bgColor) || '#4a7c3f';
      ctx.fillRect(0, 0, viewW, viewH);

      const z = gs.cam.zoom;
      const offX = viewW / 2 - gs.cam.x * z;
      const offY = viewH / 2 - gs.cam.y * z;
      ctx.translate(offX, offY);
      ctx.scale(z, z);

      // ── Layer 1: Extended grass base (fills entire camera viewport) ──
      const invZ = 1 / z;
      const camLeft = -offX * invZ;
      const camTop = -offY * invZ;
      const camRight = camLeft + viewW * invZ;
      const camBot = camTop + viewH * invZ;
      const grassMinGx = Math.floor(camLeft / T) - 1;
      const grassMinGy = Math.floor(camTop / T) - 1;
      const grassMaxGx = Math.ceil(camRight / T) + 1;
      const grassMaxGy = Math.ceil(camBot / T) + 1;
      const _base1 = (level.groundTiles && level.groundTiles.base1) || MAZE_ASSETS.grass;
      const _base2 = (level.groundTiles && level.groundTiles.base2) || MAZE_ASSETS.grass2;
      for (let gy = grassMinGy; gy <= grassMaxGy; gy++) {
        for (let gx = grassMinGx; gx <= grassMaxGx; gx++) {
          const grassImg = (((gx % 3) + 3) % 3 + ((gy % 3) + 3) % 3) % 3 === 0
            ? imgs[_base2] : imgs[_base1];
          if (grassImg) ctx.drawImage(grassImg, gx * T, gy * T, T, T);
        }
      }

      // ── Layer 1b: Under-layer decorations (rocks, bushes, flowers on extended grass) ──
      if (gs.sceneDecorations) {
        gs.sceneDecorations.filter(d => d.layer === 'under').forEach(d => {
          if (d.type === 'simple') {
            const dImg = imgs[d.asset];
            if (!dImg) return;
            const dw = T * d.scale;
            const dh = dw * (dImg.naturalHeight / dImg.naturalWidth);
            ctx.drawImage(dImg, d.wx - dw / 2, d.wy - dh, dw, dh);
          }
        });
      }

      // ── Layer 2: Roads (auto tile, style-aware) ──
      for (let gy = 0; gy < level.gridH; gy++) {
        for (let gx = 0; gx < level.gridW; gx++) {
          if (level.grid[gy][gx] === 1) {
            const tileSrc = resolveRoadTile(level.grid, gx, gy, level.groundTiles);
            const tileImg = imgs[tileSrc];
            if (tileImg) ctx.drawImage(tileImg, gx * T, gy * T, T, T);
          }
        }
      }

      // ── Layer 3: Goal tile (grid=2) ──
      const goalDef = level.goalDef || { render: 'pool' };
      for (let gy = 0; gy < level.gridH; gy++) {
        for (let gx = 0; gx < level.gridW; gx++) {
          if (level.grid[gy][gx] === 2) {
            // Draw road tile under goal
            const tileSrc = resolveRoadTile(level.grid, gx, gy, level.groundTiles);
            const tileImg = imgs[tileSrc];
            if (tileImg) ctx.drawImage(tileImg, gx * T, gy * T, T, T);

            const cx = gx * T + T / 2;
            const cy = gy * T + T / 2;

            if (goalDef.render === 'pool') {
              // Water pool (default)
              const r = T * 0.65;
              ctx.save();
              ctx.beginPath();
              ctx.ellipse(cx, cy, r, r * 0.85, 0, 0, Math.PI * 2);
              ctx.fillStyle = '#5BC0DE';
              ctx.fill();
              const rippleT = Date.now() / 800;
              ctx.strokeStyle = 'rgba(255,255,255,0.4)';
              ctx.lineWidth = 1.5;
              for (let i = 0; i < 3; i++) {
                const rr = r * 0.3 + (rippleT + i * 2.1) % 3 * (r * 0.25);
                const alpha = 1 - ((rippleT + i * 2.1) % 3) / 3;
                ctx.globalAlpha = alpha * 0.5;
                ctx.beginPath();
                ctx.ellipse(cx, cy - 2, rr, rr * 0.7, 0, 0, Math.PI * 2);
                ctx.stroke();
              }
              ctx.globalAlpha = 1;
              ctx.beginPath();
              ctx.ellipse(cx - r * 0.2, cy - r * 0.3, r * 0.15, r * 0.1, -0.3, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255,255,255,0.5)';
              ctx.fill();
              ctx.restore();
            } else if (goalDef.render === 'sprite' && goalDef.img) {
              // Sprite-based goal (treasure, castle, heart, etc)
              const goalImg = imgs[goalDef.img];
              if (goalImg) {
                const dw = T * 1.2;
                const dh = dw * (goalImg.naturalHeight / goalImg.naturalWidth);
                // Pulsing glow
                ctx.save();
                const pulse = 0.85 + Math.sin(Date.now() / 400) * 0.15;
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.ellipse(cx, cy, T * 0.6 * pulse, T * 0.45 * pulse, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.drawImage(goalImg, cx - dw / 2, cy - dh + dh * 0.15, dw, dh);
                ctx.restore();
              }
            }

          }
        }
      }

      // ── Layer 4: Decorations (level-defined + random scene) ──
      // Collect all decorations with Y-sort key
      const allDecos = [];
      (level.decorations || []).forEach(d => {
        const dImg = imgs[MAZE_ASSETS[d.type]];
        if (!dImg) return;
        const dw = T * 0.7;
        const dh = dw * (dImg.naturalHeight / dImg.naturalWidth);
        const dx = d.gx * T + (T - dw) / 2;
        const dy = d.gy * T + T - dh;
        allDecos.push({ img: dImg, dx, dy, dw, dh, sortY: d.gy * T + T });
      });
      // Random scene decorations (above-road layer: trees, buildings, characters)
      if (gs.sceneDecorations) {
        gs.sceneDecorations.filter(d => d.layer === 'over').forEach(d => {
          if (d.type === 'compound') {
            // Stacked building: collect as deferred draw for Y-sorting
            const dw = T * d.scale;
            allDecos.push({
              sortY: d.wy,
              drawFn: () => {
                d.sprites.forEach(sp => {
                  const sImg = imgs[sp.asset];
                  if (!sImg) return;
                  const sh = dw * (sImg.naturalHeight / sImg.naturalWidth);
                  ctx.drawImage(sImg, d.wx - dw / 2, d.wy - sh + sp.yOff, dw, sh);
                });
              },
            });
          } else {
            const dImg = imgs[d.asset];
            if (!dImg) return;
            const dw = T * d.scale;
            const dh = dw * (dImg.naturalHeight / dImg.naturalWidth);
            const dx = d.wx - dw / 2;
            const dy = d.wy - dh;
            allDecos.push({ img: dImg, dx, dy, dw, dh, sortY: d.wy });
          }
        });
      }
      // Y-sort and draw all decorations (both simple and compound)
      allDecos.sort((a, b) => a.sortY - b.sortY);
      allDecos.forEach(d => {
        if (d.drawFn) d.drawFn();
        else if (d.img) ctx.drawImage(d.img, d.dx, d.dy, d.dw, d.dh);
      });

      // ── Layer 5: Path highlight ──
      if (gs.path.length > 0) {
        gs.path.forEach((p, i) => {
          ctx.fillStyle = i === 0 ? 'rgba(255, 200, 0, 0.5)' : 'rgba(255, 220, 50, 0.35)';
          ctx.beginPath();
          ctx.roundRect(p.gx * T + 4, p.gy * T + 4, T - 8, T - 8, 8);
          ctx.fill();
        });
        for (let i = 0; i < gs.path.length - 1; i++) {
          const a = gs.path[i], b = gs.path[i + 1];
          ctx.beginPath();
          ctx.arc(
            (a.gx * T + T / 2 + b.gx * T + T / 2) / 2,
            (a.gy * T + T / 2 + b.gy * T + T / 2) / 2,
            3, 0, Math.PI * 2
          );
          ctx.fillStyle = 'rgba(255, 180, 0, 0.7)';
          ctx.fill();
        }
      }

      // ── Layer 6: Footprints ──
      gs.footprints.forEach(fp => {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#666';
        const fx = fp.gx * T + T / 2;
        const fy = fp.gy * T + T / 2;
        ctx.beginPath();
        ctx.ellipse(fx - 4, fy + 2, 3, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(fx + 4, fy + 2, 3, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ── Layer 7: Player character (8-direction + walking animation + shadow) ──
      {
        const dir = gs.duck.dir || 'down';
        const isWalking = gs.phase === PHASE.WALKING;
        const charDef = level.characterDef;

        // Choose frames: use characterDef.frames if available (duck), else single sprite
        let spriteSrc;
        let frameIdx = 0;
        if (charDef && charDef.frames) {
          const frames = charDef.frames[dir] || charDef.frames.down || [charDef.img];
          if (isWalking && frames.length > 1) {
            const cycle = Math.floor(gs.duck.bobT * 6) % 4;
            frameIdx = cycle === 1 ? 1 : cycle === 3 ? 2 : 0;
          }
          spriteSrc = frames[frameIdx] || frames[0];
        } else if (charDef && charDef.single && charDef.img) {
          spriteSrc = charDef.img;
        } else {
          // Default duck frames
          const DUCK_FRAMES = {
            down:      [MAZE_ASSETS.duckDown, MAZE_ASSETS.duckDown1, MAZE_ASSETS.duckDown2],
            up:        [MAZE_ASSETS.duckUp, MAZE_ASSETS.duckUp1, MAZE_ASSETS.duckUp2],
            left:      [MAZE_ASSETS.duckLeft, MAZE_ASSETS.duckLeft1, MAZE_ASSETS.duckLeft2],
            right:     [MAZE_ASSETS.duckRight, MAZE_ASSETS.duckRight1, MAZE_ASSETS.duckRight2],
            upLeft:    [MAZE_ASSETS.duckUpLeft], upRight: [MAZE_ASSETS.duckUpRight],
            downLeft:  [MAZE_ASSETS.duckDownLeft], downRight: [MAZE_ASSETS.duckDownRight],
          };
          const frames = DUCK_FRAMES[dir] || DUCK_FRAMES.down;
          if (isWalking && frames.length > 1) {
            const cycle = Math.floor(gs.duck.bobT * 6) % 4;
            frameIdx = cycle === 1 ? 1 : cycle === 3 ? 2 : 0;
          }
          spriteSrc = frames[frameIdx] || frames[0];
        }

        const charImg = imgs[spriteSrc];
        if (charImg) {
          // Per-character scale: default 1.0, cars use 0.5 etc.
          const charScale = (charDef && charDef.scale) || 1.0;
          const dw = T * 1.1 * charScale;
          const dh = dw * (charImg.naturalHeight / charImg.naturalWidth);
          const isCenterAnchored = charDef && charDef.anchor === 'center';
          const bob = isWalking && !isCenterAnchored ? Math.sin(gs.duck.bobT * 8) * 2 : 0;

          // ── Shadow ──
          ctx.save();
          ctx.translate(gs.duck.px, gs.duck.py);
          const shadowRx = dw * 0.32;
          const shadowDeform = isWalking ? (frameIdx === 0 ? 1.0 : (frameIdx === 1 ? 1.15 : 0.9)) : 1.0;
          const shadowRy = shadowRx * 0.4 * shadowDeform;
          const shadowAlpha = isWalking ? (0.22 + Math.sin(gs.duck.bobT * 8) * 0.05) : 0.2;
          ctx.globalAlpha = shadowAlpha;
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.ellipse(0, 0, shadowRx * shadowDeform, shadowRy, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // ── Character sprite ──
          ctx.save();
          ctx.translate(gs.duck.px, gs.duck.py + bob);

          // If character uses rotation (e.g. car), rotate the canvas
          if (charDef && charDef.rotate) {
            const DIR_ANGLES = {
              up: 0, upRight: Math.PI * 0.25, right: Math.PI * 0.5,
              downRight: Math.PI * 0.75, down: Math.PI,
              downLeft: -Math.PI * 0.75, left: -Math.PI * 0.5,
              upLeft: -Math.PI * 0.25,
            };
            const angle = DIR_ANGLES[dir] || 0;
            ctx.rotate(angle);
          }

          if (isCenterAnchored) {
            // Center-anchored: draw centered on position (vehicles, top-down sprites)
            ctx.drawImage(charImg, -dw / 2, -dh / 2, dw, dh);
          } else {
            // Foot-anchored: draw above position (characters standing up)
            ctx.drawImage(charImg, -dw / 2, -dh, dw, dh);
          }
          ctx.restore();
        }
      }

      // ── Layer 8: Finger hint on canvas (overlaying duck, zoom-independent size) ──
      if (gs.phase === PHASE.DRAWING && showHintRef.current) {
        const hx = gs.duck.px;
        const hy = gs.duck.py;
        ctx.save();
        ctx.globalAlpha = 0.8;
        // Move to duck position and counter-scale so hint stays fixed screen size
        ctx.translate(hx, hy);
        const invZ = 1 / z;
        ctx.scale(invZ, invZ);

        // Touch icon overlaying the duck, sliding left-right (screen pixels now)
        const touchImg = imgs['/assets/kenney/kenney_input-prompts_1.4.1/Touch/Double/touch_swipe_move.png'];
        if (touchImg) {
          const iconSize = 56;
          const slideOffset = Math.sin(Date.now() / 600) * 16;
          ctx.drawImage(touchImg, -iconSize / 2 + slideOffset, -iconSize / 2, iconSize, iconSize);
        }

        // Text label above the icon (screen pixels)
        const text = '滑动主角';
        const labelY = -44;
        ctx.font = 'bold 14px sans-serif';
        const tm = ctx.measureText(text);
        const pw = tm.width + 16;
        const ph = 24;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.roundRect(-pw / 2, labelY - ph / 2, pw, ph, ph / 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, labelY);

        ctx.restore();
      }

      // ── Layer 9: Goal marker overlay (top-most world layer, never occluded) ──
      for (let gy = 0; gy < level.gridH; gy++) {
        for (let gx = 0; gx < level.gridW; gx++) {
          if (level.grid[gy][gx] !== 2) continue;
          const gcx = gx * T + T / 2;
          const gcy = gy * T + T / 2;
          const now = Date.now();
          ctx.save();

          // Bright pulsing concentric rings
          for (let ri = 0; ri < 4; ri++) {
            const ringT = ((now / 1000) + ri * 0.25) % 1;
            const ringR = T * 0.45 + ringT * T * 0.65;
            const ringAlpha = (1 - ringT) * 0.55;
            ctx.globalAlpha = ringAlpha;
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3.5 - ringT * 2;
            ctx.beginPath();
            ctx.ellipse(gcx, gcy, ringR, ringR * 0.75, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;

          // Glowing base circle
          const glowPulse = 0.5 + Math.sin(now / 600) * 0.3;
          ctx.globalAlpha = glowPulse;
          ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(gcx, gcy, T * 0.5, T * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;

          // Bouncing flag icon above goal
          const flagImg = imgs['/assets/kenney/kenney_board-game-icons/PNG/Default (64px)/flag_triangle.png'];
          if (flagImg) {
            const bounce = Math.sin(now / 280) * 10;
            const fw = T * 1.5;
            const fh = fw * (flagImg.naturalHeight / flagImg.naturalWidth || 1);
            ctx.globalAlpha = 0.3;
            ctx.drawImage(flagImg, gcx - fw / 2 + 3, gcy - T * 1.6 + bounce + 4, fw, fh);
            ctx.globalAlpha = 1;
            ctx.drawImage(flagImg, gcx - fw / 2, gcy - T * 1.6 + bounce, fw, fh);
          }

          // Award badge at bottom-right corner
          const awardImg = imgs['/assets/kenney/kenney_board-game-icons/PNG/Default (64px)/award.png'];
          if (awardImg) {
            const aw = T * 0.32;
            const ah = aw * (awardImg.naturalHeight / awardImg.naturalWidth || 1);
            const sway = Math.sin(now / 500) * 0.15;
            ctx.save();
            ctx.translate(gcx + T * 0.35, gcy + T * 0.25);
            ctx.rotate(sway);
            const sc = 0.9 + Math.sin(now / 400) * 0.1;
            ctx.scale(sc, sc);
            ctx.drawImage(awardImg, -aw / 2, -ah / 2, aw, ah);
            ctx.restore();
          }

          ctx.restore();
        }
      }

      ctx.restore(); // pop camera transform

      // ── Walking logic ──
      if (gs.phase === PHASE.WALKING && gs.path.length > 0) {
        const target = gs.path[gs.duck.walkIdx];
        if (!target) {
          gs.phase = PHASE.DRAWING;
          gs.path = [];
          setPhase(PHASE.DRAWING);
        } else {
          const tx = target.gx * T + T / 2;
          const ty = target.gy * T + T / 2;
          const dx = tx - gs.duck.px;
          const dy = ty - gs.duck.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Determine raw movement direction
          const angle = Math.atan2(dy, dx);
          const PI = Math.PI;
          let newDir;
          if (angle > -PI/8 && angle <= PI/8) newDir = 'right';
          else if (angle > PI/8 && angle <= 3*PI/8) newDir = 'downRight';
          else if (angle > 3*PI/8 && angle <= 5*PI/8) newDir = 'down';
          else if (angle > 5*PI/8 && angle <= 7*PI/8) newDir = 'downLeft';
          else if (angle > 7*PI/8 || angle <= -7*PI/8) newDir = 'left';
          else if (angle > -7*PI/8 && angle <= -5*PI/8) newDir = 'upLeft';
          else if (angle > -5*PI/8 && angle <= -3*PI/8) newDir = 'up';
          else newDir = 'upRight';

          // ── Smooth turn transition: insert diagonal for a few frames ──
          if (!gs.duck.turnTimer) gs.duck.turnTimer = 0;
          if (gs.duck.prevDir && gs.duck.prevDir !== newDir && gs.duck.turnTimer <= 0) {
            // Determine if this is a 90° turn and pick the right diagonal
            const TURN_MAP = {
              'right_down': 'downRight', 'right_up': 'upRight',
              'left_down': 'downLeft',   'left_up': 'upLeft',
              'down_right': 'downRight', 'down_left': 'downLeft',
              'up_right': 'upRight',     'up_left': 'upLeft',
            };
            const turnKey = `${gs.duck.prevDir}_${newDir}`;
            const transitionDir = TURN_MAP[turnKey];
            if (transitionDir) {
              gs.duck.dir = transitionDir;
              gs.duck.turnTimer = 6; // show diagonal for ~6 frames
            } else {
              gs.duck.dir = newDir;
            }
          } else if (gs.duck.turnTimer > 0) {
            gs.duck.turnTimer--;
            // Keep the diagonal direction during transition
          } else {
            gs.duck.dir = newDir;
          }
          gs.duck.prevDir = newDir;
          gs.duck.bobT += 0.016;

          if (dist < gs.walkSpeed) {
            gs.duck.px = tx;
            gs.duck.py = ty;
            gs.duck.gx = target.gx;
            gs.duck.gy = target.gy;
            gs.footprints.push({ gx: target.gx, gy: target.gy });
            gs.steps++;
            setSteps(gs.steps);
            gs.duck.walkIdx++;

            // Follow camera
            gs.camTarget.x = gs.duck.px;
            gs.camTarget.y = gs.duck.py;

            // Check victory
            if (level.grid[target.gy][target.gx] === 2) {
              gs.phase = PHASE.VICTORY;
              setPhase(PHASE.VICTORY);
              const s = gs.steps;
              const stars = s <= level.stars.s3 ? 3 : s <= level.stars.s2 ? 2 : 1;
              setStarCount(stars);
              playSelectSound();
            }
          } else {
            gs.duck.px += (dx / dist) * gs.walkSpeed;
            gs.duck.py += (dy / dist) * gs.walkSpeed;
          }
        }
      }

      // Timer
      if (gs.phase !== PHASE.VICTORY && gs.phase !== PHASE.INTRO && gs.startTime) {
        setElapsed(Math.floor((Date.now() - gs.startTime) / 1000));
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [loaded, level]);

  /* ── 触屏 → 世界坐标 ── */
  const screenToWorld = useCallback((clientX, clientY) => {
    const wrap = wrapRef.current;
    const gs = gameRef.current;
    if (!wrap || !gs || !level) return null;
    const rect = wrap.getBoundingClientRect();
    const z = gs.cam.zoom;
    const offX = rect.width / 2 - gs.cam.x * z;
    const offY = rect.height / 2 - gs.cam.y * z;
    const wx = (clientX - rect.left - offX) / z;
    const wy = (clientY - rect.top - offY) / z;
    const gx = Math.floor(wx / level.tileSize);
    const gy = Math.floor(wy / level.tileSize);
    if (gx < 0 || gy < 0 || gx >= level.gridW || gy >= level.gridH) return null;
    return { gx, gy };
  }, [level]);

  const isAdjacent = (a, b) => Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy) === 1;

  const pointersRef = useRef(new Map());

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const gs = gameRef.current;
    if (!gs || !level) return;
    if (gs.phase === PHASE.INTRO) return;

    if (pointersRef.current.size === 1) {
      const pos = screenToWorld(e.clientX, e.clientY);
      // Try to start drawing
      if (gs.phase === PHASE.DRAWING && pos) {
        const duckPos = { gx: gs.duck.gx, gy: gs.duck.gy };
        const onDuck = pos.gx === duckPos.gx && pos.gy === duckPos.gy;
        const adjRoad = isAdjacent(pos, duckPos) && level.grid[pos.gy][pos.gx] > 0;
        if (onDuck || adjRoad) {
          gs.path = onDuck ? [pos] : [duckPos, pos];
          gs._isDrawing = true;
          gs._isPanning = false;
          setShowHint(false); showHintRef.current = false;
          return;
        }
      }
      // Otherwise, start panning
      gs._isPanning = true;
      gs._isDrawing = false;
      gs._panLastX = e.clientX;
      gs._panLastY = e.clientY;
    } else if (pointersRef.current.size === 2) {
      gs._isDrawing = false;
      gs._isPanning = false;
      const pts = Array.from(pointersRef.current.values());
      gs._initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      gs._initialZoomResult = gs.cam.zoom;
    }
  }, [level, screenToWorld]);

  const onPointerMove = useCallback((e) => {
    e.preventDefault();
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const gs = gameRef.current;
    if (!gs || !level) return;

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (gs._initialPinchDist > 0) {
        const scale = currentDist / gs._initialPinchDist;
        const T = level.tileSize;
        const rect = wrapRef.current?.getBoundingClientRect() || { width: 400, height: 300 };
        const minZoom = Math.min(rect.width / (level.gridW * T), rect.height / (level.gridH * T)) * 0.9;
        const maxZoom = 3;
        const targetZoom = Math.max(minZoom, Math.min(maxZoom, gs._initialZoomResult * scale));
        
        gs.camTarget.zoom = targetZoom;
        gs.cam.zoom = targetZoom;
      }
      return;
    }

    if (pointersRef.current.size === 1) {
      // Drawing mode
      if (gs._isDrawing && gs.phase === PHASE.DRAWING) {
        const pos = screenToWorld(e.clientX, e.clientY);
        if (!pos) return;
        if (level.grid[pos.gy][pos.gx] === 0) return;
        const last = gs.path[gs.path.length - 1];
        if (!isAdjacent(pos, last)) return;
        if (gs.path.some(p => p.gx === pos.gx && p.gy === pos.gy)) return;
        gs.path.push(pos);
        return;
      }
      // Panning mode
      if (gs._isPanning) {
        const dx = e.clientX - gs._panLastX;
        const dy = e.clientY - gs._panLastY;
        gs._panLastX = e.clientX;
        gs._panLastY = e.clientY;
        const z = gs.cam.zoom;
        gs.camTarget.x -= dx / z;
        gs.camTarget.y -= dy / z;
        gs.cam.x -= dx / z;
        gs.cam.y -= dy / z;
      }
    }
  }, [level, screenToWorld]);

  const onPointerUp = useCallback((e) => {
    e.preventDefault();
    pointersRef.current.delete(e.pointerId);

    const gs = gameRef.current;
    if (!gs) return;

    if (pointersRef.current.size === 0) {
      if (gs._isDrawing) {
        gs._isDrawing = false;
        if (gs.path.length >= 2) {
          gs.duck.walkIdx = 1;
          gs.phase = PHASE.WALKING;
          setPhase(PHASE.WALKING);
        }
      }
      gs._isPanning = false;
    } else if (pointersRef.current.size === 1) {
      const remainingPt = Array.from(pointersRef.current.values())[0];
      gs._panLastX = remainingPt.x;
      gs._panLastY = remainingPt.y;
      gs._isPanning = true;
      gs._isDrawing = false;
      gs._initialPinchDist = 0;
    }
  }, []);

  /* ── Pinch-to-zoom ── */
  const onWheel = useCallback((e) => {
    const gs = gameRef.current;
    if (!gs || gs.phase === PHASE.INTRO) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const T = level.tileSize;
    const minZoom = Math.min(
      (wrapRef.current?.getBoundingClientRect().width || 400) / (level.gridW * T),
      (wrapRef.current?.getBoundingClientRect().height || 300) / (level.gridH * T)
    ) * 0.9;
    const maxZoom = 3;
    gs.camTarget.zoom = Math.max(minZoom, Math.min(maxZoom, gs.camTarget.zoom * delta));
  }, [level]);

  /* ── 重新开始 ── */
  const restart = useCallback(() => {
    if (!level) return;
    playClickSound();
    const T = level.tileSize;
    const mapW = level.gridW * T;
    const mapH = level.gridH * T;
    gameRef.current = {
      phase: PHASE.INTRO,
      path: [],
      footprints: [],
      duck: {
        gx: level.playerStart.gx,
        gy: level.playerStart.gy,
        px: level.playerStart.gx * T + T / 2,
        py: level.playerStart.gy * T + T / 2,
        dir: 'right',
        walkIdx: 0,
        bobT: 0,
      },
      steps: 0,
      startTime: 0,
      walkSpeed: 2.5,
      cam: { x: level.playerStart.gx * T + T / 2, y: level.playerStart.gy * T + T / 2, zoom: 1.5 },
      camTarget: { x: level.playerStart.gx * T + T / 2, y: level.playerStart.gy * T + T / 2, zoom: 1.5 },
      introStart: Date.now(),
      introDuration: 2500,
      _isDrawing: false,
      _isPanning: false,
      _panLastX: 0,
      _panLastY: 0,
      // Random scene decorations
      sceneDecorations: generateSceneDecorations(level),
    };
    setSteps(0);
    setElapsed(0);
    setPhase(PHASE.INTRO);
    setStarCount(0);
  }, [level]);

  if (!level) {
    return <div className={styles.page}><div className={styles.loading}>关卡不存在</div></div>;
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  /* Kenney UI asset paths */
  const ICON_REPEAT = `${UI}/Extra/Default/icon_repeat_light.png`;
  const BTN_SQ_YELLOW = `${UI}/Yellow/Default/button_square_depth_gloss.png`;
  const BTN_RECT_GREEN = `${UI}/Green/Default/button_rectangle_depth_gloss.png`;
  const BTN_RECT_YELLOW = `${UI}/Yellow/Default/button_rectangle_depth_gloss.png`;
  const BTN_SQ_BLUE = `${UI}/Blue/Default/button_square_depth_gloss.png`;

  return (
    <div className={`${styles.page} gameUI`}>
      {/* ── Top HUD Bar ── */}
      <header className={styles.hud}>
        {/* Back button */}
        <button className={styles.hudBtn} onClick={() => { playBackSound(); onBack ? onBack() : navigate(-1); }}>
          <img src={BTN_SQ_YELLOW} alt="" className={styles.hudBtnBg} />
          <img src={`${UI}/Yellow/Default/arrow_basic_w.png`} alt="返回" className={styles.hudBtnIcon} />
        </button>

        {/* Title */}
        <div className={styles.hudTitle}>
          <span className={styles.hudTitleText}>{level.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()}</span>
        </div>

        {/* Stats */}
        <div className={styles.hudStats}>
          <div className={styles.hudStatBox}>
            <span className={styles.hudStatLabel}>步数</span>
            <span className={styles.hudStatVal}>{steps}</span>
          </div>
          <div className={styles.hudStatBox}>
            <span className={styles.hudStatLabel}>时间</span>
            <span className={styles.hudStatVal}>{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Restart button */}
        <button className={styles.hudBtn} onClick={restart}>
          <img src={BTN_SQ_BLUE} alt="" className={styles.hudBtnBg} />
          <img src={ICON_REPEAT} alt="重新开始" className={styles.hudBtnIcon} />
        </button>
      </header>

      {/* ── Instruction Ribbon ── */}
      {phase !== PHASE.VICTORY && (
        <div className={styles.ribbon}>
          {phase === PHASE.INTRO && '正在查看地图...'}
          {phase === PHASE.DRAWING && '用手指拖动主角前进！'}
          {phase === PHASE.WALKING && '主角正在行动中...'}
        </div>
      )}

      {/* ── Game Canvas ── */}
      {!loaded && <div className={styles.loading}>加载素材中...</div>}
      <div className={styles.canvasWrap} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={styles.gameCanvas}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        />
      </div>

      {/* Finger hint is now drawn directly on canvas */}

      {/* ── Victory Overlay ── */}
      {phase === PHASE.VICTORY && (
        <div className={styles.victoryOverlay}>
          <div className={styles.victoryCard}>
            <div className={styles.victoryTitle}>太棒了!</div>
            <div className={styles.victorySubtitle}>你通关了!</div>
            <div className={styles.victoryStars}>
              {[1, 2, 3].map(i => (
                <img
                  key={i}
                  src={`${UI}/${i <= starCount ? 'Yellow' : 'Blue'}/Default/icon_circle.png`}
                  alt=""
                  className={`${styles.starIcon} ${i <= starCount ? styles.starFilled : styles.starEmpty}`}
                />
              ))}
            </div>
            <div className={styles.victoryStats}>
              <div className={styles.victoryStatItem}>
                <span className={styles.victoryStatLabel}>步数</span>
                <span className={styles.victoryStatVal}>{steps}</span>
              </div>
              <div className={styles.victoryStatItem}>
                <span className={styles.victoryStatLabel}>时间</span>
                <span className={styles.victoryStatVal}>{formatTime(elapsed)}</span>
              </div>
            </div>
            <div className={styles.victoryActions}>
              <button className={styles.victoryBtn} onClick={restart}>
                <img src={BTN_RECT_GREEN} alt="" className={styles.victoryBtnBg} />
                <span className={styles.victoryBtnText}>再玩一次</span>
              </button>
              {onPublish && !hidePublish && (
                <button className={styles.victoryBtn} onClick={onPublish}>
                  <img src={BTN_RECT_GREEN} alt="" className={styles.victoryBtnBg} />
                  <span className={styles.victoryBtnText}>发布</span>
                </button>
              )}
              <button className={styles.victoryBtn} onClick={() => { playBackSound(); onBack ? onBack() : navigate(-1); }}>
                <img src={BTN_RECT_YELLOW} alt="" className={styles.victoryBtnBg} />
                <span className={styles.victoryBtnText}>退出</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

