/* ========================================
   EditorCanvas — 关卡编辑画布
   使用 loadAllPlatformerAssets 预加载 spritesheet
   支持画笔/橡皮擦/选择工具 + 网格光标预览
   ======================================== */
import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { ALL_CATEGORIES, ENEMIES_ASSETS } from '../../data/editorAssets';
import useGameDraftStore from '../../stores/gameDraftStore';
import { loadAllPlatformerAssets } from '../../engine/AssetLoader';
import styles from './EditorCanvas.module.css';

const GRID = 32;
const TILE_SIZE = 64;

// Build a set of all enemy asset IDs for quick lookup
const ENEMY_IDS = new Set((ENEMIES_ASSETS?.items || []).map(e => e.id));
// Map enemy asset ID → enemyType for game engine binding
const ENEMY_ID_TO_TYPE = Object.fromEntries(
  (ENEMIES_ASSETS?.items || []).map(e => [e.id, e.enemyType || e.id])
);

export default function EditorCanvas({ zoom = 1, onElementSelect, onZoomChange }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const worldRef = useRef(null);
  const cursorRef = useRef(null);      // Grid cursor overlay
  const selGfxRef = useRef(null);      // Selection highlight graphics
  const panRef = useRef({ x: 0, y: 0 });
  const assetsRef = useRef(null);
  const toolRef = useRef('brush');     // Avoid stale closures
  const tileRef = useRef(null);
  const zoomRef = useRef(zoom);
  const modeRef = useRef('edit');
  const onSelectRef = useRef(null);    // Element select callback
  const [ready, setReady] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const initializedDraftRef = useRef(null); // Track which draft we've auto-centered on

  const {
    currentDraft, mode, selectedTool, selectedTile,
    addPlatform, addItem, addEnemy, addInteractable,
    updateLevelData,
  } = useGameDraftStore();

  // Keep refs in sync with props/state
  useEffect(() => { toolRef.current = selectedTool; }, [selectedTool]);
  useEffect(() => { tileRef.current = selectedTile; }, [selectedTile]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { onSelectRef.current = onElementSelect; }, [onElementSelect]);
  const onZoomRef = useRef(null);
  useEffect(() => { onZoomRef.current = onZoomChange; }, [onZoomChange]);

  // ── Init PixiJS + load assets ──
  useEffect(() => {
    if (!containerRef.current) return;
    const app = new PIXI.Application();
    let mounted = true;

    const init = async () => {
      try {
        await app.init({
          resizeTo: containerRef.current,
          background: 0xE8F5E9,
          antialias: true,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
        });
      } catch (e) {
        console.error('[EditorCanvas] PixiJS init failed:', e);
        return;
      }
      if (!mounted) { try { app.destroy(true); } catch (_) {} return; }

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(app.canvas);
      appRef.current = app;
      setReady(true);

      try {
        const assets = await loadAllPlatformerAssets();
        if (!mounted) return;
        assetsRef.current = assets;
        setAssetsLoaded(true);
      } catch (e) {
        console.error('[EditorCanvas] Asset loading failed:', e);
        setAssetsLoaded(true);
      }
    };
    init();

    // ResizeObserver to handle container resize (e.g. left panel collapse)
    const ro = new ResizeObserver(() => {
      if (appRef.current?.renderer) {
        appRef.current.resize();
      }
    });
    ro.observe(containerRef.current);

    return () => {
      mounted = false;
      setReady(false);
      setAssetsLoaded(false);
      ro.disconnect();
      try { app.destroy(true, { children: true }); } catch (_) {}
      appRef.current = null;
    };
  }, []);

  // ── Persistent interaction layer (doesn't re-mount on every state change) ──
  useEffect(() => {
    if (!ready || !appRef.current) return;
    const app = appRef.current;
    const canvas = app.canvas;

    let dragging = false, lastX = 0, lastY = 0;
    let didMove = false; // distinguish click from drag
    let isPainting = false; // continuous brush painting
    let lastPaintGx = -1, lastPaintGy = -1; // avoid repeat paint same cell
    let dragEl = null; // { kind, index, offsetX, offsetY } for element dragging

    // Helper: clamp pan so you can't drag beyond the world content area
    const clampPan = (px, py, z) => {
      const state = useGameDraftStore.getState();
      const ld = state.currentDraft?.levelData;
      const ww = ld?.worldWidth || 3800;
      const wh = ld?.worldHeight || 700;
      const rect = canvas.getBoundingClientRect();
      const canvasW = rect.width;
      const canvasH = rect.height;
      const margin = 50; // small margin
      // Don't allow scrolling past left/top edges
      const maxX = margin;
      const maxY = margin;
      // Don't allow scrolling past right/bottom edges
      const minX = canvasW - ww * z - margin;
      const minY = canvasH - wh * z - margin;
      return {
        x: Math.min(maxX, Math.max(minX, px)),
        y: Math.min(maxY, Math.max(minY, py)),
      };
    };

    // Helper: grid coords from pointer event
    const getGrid = (e) => {
      const world = worldRef.current;
      if (!world) return { gx: 0, gy: 0 };
      const z = zoomRef.current;
      const rect = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      const mx = (pt.clientX - rect.left - world.x) / z;
      const my = (pt.clientY - rect.top - world.y) / z;
      return { gx: Math.floor(mx / GRID) * GRID, gy: Math.floor(my / GRID) * GRID };
    };

    // Helper: check if a grid cell is occupied
    const isGridOccupied = (gx, gy, skipKind, skipIndex) => {
      const state = useGameDraftStore.getState();
      const ld = state.currentDraft?.levelData;
      if (!ld) return false;
      // Check platforms
      if ((ld.platforms || []).some((p, i) =>
        !(skipKind === 'platform' && skipIndex === i) &&
        gx >= (p.x || 0) && gx < (p.x || 0) + (p.w || TILE_SIZE) &&
        gy >= (p.y || 0) && gy < (p.y || 0) + TILE_SIZE
      )) return true;
      // Check items
      if ((ld.items || []).some((it, i) =>
        !(skipKind === 'item' && skipIndex === i) &&
        Math.abs((it.x || 0) - gx - 16) < GRID && Math.abs((it.y || 0) - gy - 16) < GRID
      )) return true;
      // Check interactables
      if ((ld.interactables || []).some((obj, i) =>
        !(skipKind === 'interactable' && skipIndex === i) &&
        gx >= (obj.x || 0) && gx < (obj.x || 0) + (obj.w || GRID) &&
        gy >= (obj.y || 0) && gy < (obj.y || 0) + (obj.h || GRID)
      )) return true;
      // Check enemies
      if ((ld.enemies || []).some((en, i) =>
        !(skipKind === 'enemy' && skipIndex === i) &&
        Math.abs((en.x || 0) - gx) < GRID && Math.abs((en.y || 0) - gy - GRID) < GRID
      )) return true;
      return false;
    };

    // Helper: hit-test elements at grid position, return {kind, index} or null
    const hitTestAt = (gx, gy) => {
      const state = useGameDraftStore.getState();
      const ld = state.currentDraft?.levelData;
      if (!ld) return null;
      // Items
      const itemIdx = (ld.items || []).findIndex(it =>
        Math.abs((it.x || 0) - gx - 16) < GRID && Math.abs((it.y || 0) - gy - 16) < GRID
      );
      if (itemIdx >= 0) return { kind: 'item', index: itemIdx };
      // Enemies
      const enemyIdx = (ld.enemies || []).findIndex(en =>
        Math.abs((en.x || 0) - gx) < GRID && Math.abs((en.y || 0) - gy - GRID) < GRID
      );
      if (enemyIdx >= 0) return { kind: 'enemy', index: enemyIdx };
      // Interactables
      const intIdx = (ld.interactables || []).findIndex(obj =>
        gx >= (obj.x || 0) && gx < (obj.x || 0) + (obj.w || GRID) &&
        gy >= (obj.y || 0) && gy < (obj.y || 0) + (obj.h || GRID)
      );
      if (intIdx >= 0) return { kind: 'interactable', index: intIdx };
      // Platforms (tileId only — user-placed single tiles)
      const platIdx = (ld.platforms || []).findIndex(p =>
        p.tileId &&
        gx >= (p.x || 0) && gx < (p.x || 0) + (p.w || TILE_SIZE) &&
        gy >= (p.y || 0) && gy < (p.y || 0) + TILE_SIZE
      );
      if (platIdx >= 0) return { kind: 'platform', index: platIdx };
      return null;
    };

    // --- pointer down ---
    const onDown = (e) => {
      const tool = toolRef.current;
      const m = modeRef.current;
      if (m !== 'edit') return;

      const { gx, gy } = getGrid(e);
      const pt = e.touches ? e.touches[0] : e;

      if (tool === 'select') {
        // Try hit-test for element dragging
        const hit = hitTestAt(gx, gy);
        if (hit) {
          dragEl = { ...hit, startGx: gx, startGy: gy };
          didMove = false;
          e.preventDefault?.();
          return;
        }
        // No element hit → pan
        dragging = true;
        didMove = false;
        lastX = pt.clientX; lastY = pt.clientY;
      } else if (tool === 'brush') {
        const bm = useGameDraftStore.getState().brushMode;
        if (bm === 'continuous') {
          isPainting = true;
          lastPaintGx = -1; lastPaintGy = -1;
          // Paint the first cell
          if (!isGridOccupied(gx, gy)) {
            const tile = tileRef.current || useGameDraftStore.getState().selectedTile;
            if (tile) { placeTileAtGrid(tile, gx, gy); lastPaintGx = gx; lastPaintGy = gy; }
          }
          e.preventDefault?.();
        }
        // single mode handled by onClick
      } else {
        // eraser or other — pan
        dragging = true;
        didMove = false;
        lastX = pt.clientX; lastY = pt.clientY;
      }
    };

    // --- pointer move ---
    const onMove = (e) => {
      const world = worldRef.current;
      if (!world) return;
      const z = zoomRef.current;
      const { gx, gy } = getGrid(e);
      const pt = e.touches ? e.touches[0] : e;

      // Update grid cursor overlay
      const cursor = cursorRef.current;
      if (cursor && modeRef.current === 'edit') {
        cursor.clear();
        const tool = toolRef.current;
        if (tool === 'brush') {
          cursor.lineStyle(2, 0x58CC02, 0.8);
          cursor.beginFill(0x58CC02, 0.15);
          cursor.drawRect(gx, gy, GRID, GRID);
          cursor.endFill();
          cursor.lineStyle(1.5, 0x58CC02, 0.6);
          cursor.moveTo(gx + GRID / 2, gy + 6);
          cursor.lineTo(gx + GRID / 2, gy + GRID - 6);
          cursor.moveTo(gx + 6, gy + GRID / 2);
          cursor.lineTo(gx + GRID - 6, gy + GRID / 2);
        } else if (tool === 'eraser') {
          cursor.lineStyle(2, 0xFF4444, 0.8);
          cursor.beginFill(0xFF4444, 0.15);
          cursor.drawRect(gx, gy, GRID, GRID);
          cursor.endFill();
          cursor.lineStyle(1.5, 0xFF4444, 0.6);
          cursor.moveTo(gx + 8, gy + 8);
          cursor.lineTo(gx + GRID - 8, gy + GRID - 8);
          cursor.moveTo(gx + GRID - 8, gy + 8);
          cursor.lineTo(gx + 8, gy + GRID - 8);
        } else if (tool === 'select') {
          cursor.lineStyle(1, 0x1CB0F6, 0.5);
          cursor.beginFill(0x1CB0F6, 0.05);
          cursor.drawRect(gx, gy, GRID, GRID);
          cursor.endFill();
        }
      }

      // Element dragging — draw preview ghost shadow at target position
      if (dragEl) {
        didMove = true;
        dragEl.currentGx = gx;
        dragEl.currentGy = gy;

        // 绘制拖拽预占阴影
        const cursor = cursorRef.current;
        if (cursor) {
          cursor.clear();
          // 阴影填充 — 半透明蓝色
          cursor.beginFill(0x1CB0F6, 0.18);
          cursor.drawRect(gx, gy, GRID, GRID);
          cursor.endFill();
          // 虚线边框效果 — 用短线段模拟
          cursor.lineStyle(2, 0x1CB0F6, 0.7);
          const dashLen = 4, gapLen = 3;
          // 上边
          for (let dx = 0; dx < GRID; dx += dashLen + gapLen) {
            cursor.moveTo(gx + dx, gy);
            cursor.lineTo(gx + Math.min(dx + dashLen, GRID), gy);
          }
          // 下边
          for (let dx = 0; dx < GRID; dx += dashLen + gapLen) {
            cursor.moveTo(gx + dx, gy + GRID);
            cursor.lineTo(gx + Math.min(dx + dashLen, GRID), gy + GRID);
          }
          // 左边
          for (let dy = 0; dy < GRID; dy += dashLen + gapLen) {
            cursor.moveTo(gx, gy + dy);
            cursor.lineTo(gx, gy + Math.min(dy + dashLen, GRID));
          }
          // 右边
          for (let dy = 0; dy < GRID; dy += dashLen + gapLen) {
            cursor.moveTo(gx + GRID, gy + dy);
            cursor.lineTo(gx + GRID, gy + Math.min(dy + dashLen, GRID));
          }
          // 中心十字标记
          cursor.lineStyle(1, 0x1CB0F6, 0.4);
          cursor.moveTo(gx + GRID / 2 - 6, gy + GRID / 2);
          cursor.lineTo(gx + GRID / 2 + 6, gy + GRID / 2);
          cursor.moveTo(gx + GRID / 2, gy + GRID / 2 - 6);
          cursor.lineTo(gx + GRID / 2, gy + GRID / 2 + 6);
        }
        return; // Don't pan while dragging
      }

      // Continuous brush painting
      if (isPainting) {
        if (gx !== lastPaintGx || gy !== lastPaintGy) {
          if (!isGridOccupied(gx, gy)) {
            const tile = tileRef.current || useGameDraftStore.getState().selectedTile;
            if (tile) placeTileAtGrid(tile, gx, gy);
          }
          lastPaintGx = gx; lastPaintGy = gy;
        }
        return;
      }

      // Pan
      if (dragging) {
        didMove = true;
        const dx = pt.clientX - lastX;
        const dy = pt.clientY - lastY;
        const z = zoomRef.current;
        const clamped = clampPan(world.x + dx, world.y + dy, z);
        world.x = clamped.x;
        world.y = clamped.y;
        panRef.current = { x: world.x, y: world.y };
        lastX = pt.clientX; lastY = pt.clientY;
      }
    };

    // --- pointer up ---
    const onUp = (e) => {
      // Finish element drag
      if (dragEl && didMove) {
        const gx = dragEl.currentGx ?? dragEl.startGx;
        const gy = dragEl.currentGy ?? dragEl.startGy;
        // Only move if target not occupied (skip self)
        if (!isGridOccupied(gx, gy, dragEl.kind, dragEl.index)) {
          const state = useGameDraftStore.getState();
          if (dragEl.kind === 'item') {
            state.updateItem(dragEl.index, { x: gx + 16, y: gy + 16 });
          } else if (dragEl.kind === 'enemy') {
            state.updateEnemy(dragEl.index, { x: gx, y: gy + GRID });
          } else if (dragEl.kind === 'interactable') {
            state.updateInteractable(dragEl.index, { x: gx, y: gy });
          } else if (dragEl.kind === 'platform') {
            state.updatePlatform(dragEl.index, { x: gx, y: gy });
          }
        }
        dragEl = null;
        didMove = false;
        return;
      }
      dragEl = null;
      isPainting = false;
      if (dragging && !didMove) {
        // Was a tap, not a drag
      }
      dragging = false;
    };

    // --- click (for brush single-mode & eraser & select) ---
    const onClick = (e) => {
      if (modeRef.current !== 'edit') return;
      const tool = toolRef.current;
      const world = worldRef.current;
      if (!world) return;

      const { gx, gy } = getGrid(e);

      if (tool === 'brush') {
        const bm = useGameDraftStore.getState().brushMode;
        if (bm === 'single') {
          if (!isGridOccupied(gx, gy)) {
            const tile = tileRef.current || useGameDraftStore.getState().selectedTile;
            if (tile) placeTileAtGrid(tile, gx, gy);
          }
          // Auto switch to select mode
          useGameDraftStore.getState().setSelectedTool('select');
        }
        // continuous mode handled by onDown/onMove
      } else if (tool === 'eraser') {
        eraseAtGrid(gx, gy);
      } else if (tool === 'select') {
        if (!didMove) selectElementAtGrid(gx, gy);
      }
    };

    // --- mouse leave: hide cursor ---
    const onLeave = () => {
      dragging = false;
      isPainting = false;
      dragEl = null;
      const cursor = cursorRef.current;
      if (cursor) cursor.clear();
    };

    // --- wheel zoom (Ctrl+wheel or trackpad pinch) ---
    const onWheel = (e) => {
      // Trackpad pinch or Ctrl+wheel
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) < 50) {
        e.preventDefault();
        const delta = -e.deltaY * 0.005;
        const oldZoom = zoomRef.current;
        const newZoom = Math.max(0.25, Math.min(3, oldZoom + delta));
        if (newZoom !== oldZoom) {
          zoomRef.current = newZoom;
          if (onZoomRef.current) onZoomRef.current(newZoom);
        }
      }
    };

    // --- Safari gesture events for pinch zoom ---
    let gestureStartScale = 1;
    const onGestureStart = (e) => {
      e.preventDefault();
      gestureStartScale = zoomRef.current;
    };
    const onGestureChange = (e) => {
      e.preventDefault();
      const newZoom = Math.max(0.25, Math.min(3, gestureStartScale * e.scale));
      zoomRef.current = newZoom;
      if (onZoomRef.current) onZoomRef.current(newZoom);
    };

    // --- touch: prevent default to avoid page scroll ---
    const onTouchStart = (e) => {
      if (e.touches.length >= 2) e.preventDefault();
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('gesturestart', onGestureStart, { passive: false });
    canvas.addEventListener('gesturechange', onGestureChange, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('gesturestart', onGestureStart);
      canvas.removeEventListener('gesturechange', onGestureChange);
      canvas.removeEventListener('touchstart', onTouchStart);
    };
  }, [ready]); // Only depends on ready — uses refs for everything else

  // ── Place tile (stores tileId for precise rendering) ──
  const placeTileAtGrid = useCallback((tile, gx, gy) => {
    if (!tile) return;
    const id = tile.id;
    if (ENEMY_IDS.has(id)) {
      const enemyType = ENEMY_ID_TO_TYPE[id] || id;
      addEnemy({ x: gx, y: gy + GRID, type: enemyType, enemyType: id, tileId: id });
    } else if (['coin', 'star', 'gem_blue', 'gem_green', 'gem_red', 'gem_yellow',
                'coin_silver', 'coin_bronze'].some(k => id.startsWith(k))) {
      const typeMap = { coin: 'coin', coin_silver: 'coin', coin_bronze: 'coin',
                        star: 'star', gem_blue: 'gem', gem_green: 'gem', gem_red: 'gem', gem_yellow: 'gem' };
      const type = Object.entries(typeMap).find(([k]) => id.startsWith(k))?.[1] || 'coin';
      addItem({ x: gx + 16, y: gy + 16, type, tileId: id });
    } else if (['hud_heart', 'heart', 'hud_key', 'key_', 'mushroom_', 'fireball'].some(k => id.startsWith(k))) {
      // Pickups (道具 - 拾取获得效果)
      const typeMap = { hud_heart: 'heart', heart: 'heart',
                        hud_key_blue: 'key', hud_key_red: 'key', hud_key_green: 'key', hud_key_yellow: 'key',
                        key_blue: 'key', key_red: 'key', key_green: 'key', key_yellow: 'key',
                        mushroom_red: 'powerup', mushroom_brown: 'powerup', fireball: 'powerup' };
      const type = Object.entries(typeMap).find(([k]) => id.startsWith(k))?.[1] || 'heart';
      addItem({ x: gx + 16, y: gy + 16, type, tileId: id });
    } else if (['block_exclamation', 'block_coin', 'block_strong', 'block_empty_warning',
                'switch_', 'spring', 'spikes', 'block_spikes', 'bomb', 'torch_', 'ladder', 'rope', 'chain',
                'lava', 'lava_top', 'water', 'water_top', 'conveyor', 'saw', 'ramp',
                'lock_', 'lever'].some(k => id.startsWith(k))) {
      // Interactable / special terrain (有物理效果)
      // 映射 tileId → physics engine type
      const BLOCK_TYPE_MAP = {
        block_coin: 'coinBlock',
        block_strong_coin: 'sturdyBlock',
        block_strong_exclamation: 'sturdyBlock',
        block_strong_danger: 'dangerBlock',
        block_strong: 'sturdyBlock',
        block_empty_warning: 'warningBlock',
        block_exclamation: 'questionBlock',
      };
      const mappedType = BLOCK_TYPE_MAP[id] || id;
      addInteractable({ x: gx, y: gy, w: GRID, h: GRID, type: mappedType, tileId: id });
    } else if (id.startsWith('char_')) {
      updateLevelData({ playerStart: { x: gx + 16, y: gy + GRID } });
    } else if (id.startsWith('door_') || id.startsWith('flag')) {
      updateLevelData({ exitDoor: { x: gx + 16, y: gy + GRID } });
    } else if (id.startsWith('bg_') && tile.isBg) {
      // Background image — one-click apply (no tile placement)
      updateLevelData({ background: tile.src });
      return; // Skip placement sound — background change is immediate
    } else {
      // Terrain / blocks / decor / bgd_* decorations → store tileId for precise texture
      addPlatform({ x: gx, y: gy, w: TILE_SIZE, tileId: id });
    }
    // Play feedback sound
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.setValueAtTime(880, ctx.currentTime);
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.08);
    } catch (_) {}

    // 每次放置后自动保存（去抖 500ms，避免连续刷时频繁写入）
    if (placeTileAtGrid._saveTimer) clearTimeout(placeTileAtGrid._saveTimer);
    placeTileAtGrid._saveTimer = setTimeout(() => {
      useGameDraftStore.getState().saveDraft();
      console.log('[EditorCanvas] Auto-saved after tile placement');
    }, 500);
  }, [addPlatform, addItem, addEnemy, addInteractable, updateLevelData]);

  // ── Erase at grid ──
  const eraseAtGrid = useCallback((gx, gy) => {
    const state = useGameDraftStore.getState();
    const draft = state.currentDraft;
    if (!draft) return;
    const ld = draft.levelData;

    // Check items (within GRID of click)
    const itemIdx = (ld.items || []).findIndex(it =>
      Math.abs((it.x || 0) - gx - 16) < GRID && Math.abs((it.y || 0) - gy - 16) < GRID
    );
    if (itemIdx >= 0) {
      state.removeItem(itemIdx);
      playEraseSound();
      return;
    }

    // Check enemies
    const enemyIdx = (ld.enemies || []).findIndex(en =>
      Math.abs((en.x || 0) - gx) < GRID && Math.abs((en.y || 0) - gy - GRID) < GRID
    );
    if (enemyIdx >= 0) {
      state.removeEnemy(enemyIdx);
      playEraseSound();
      return;
    }

    // Check interactables
    const intIdx = (ld.interactables || []).findIndex(obj =>
      gx >= (obj.x || 0) && gx < (obj.x || 0) + (obj.w || GRID) &&
      gy >= (obj.y || 0) && gy < (obj.y || 0) + (obj.h || GRID)
    );
    if (intIdx >= 0) {
      state.removeInteractable(intIdx);
      playEraseSound();
      return;
    }

    // Check platforms (smallest first to avoid removing ground)
    const platIdx = (ld.platforms || []).findIndex(p =>
      gx >= (p.x || 0) && gx < (p.x || 0) + (p.w || 100) &&
      gy >= (p.y || 0) && gy < (p.y || 0) + TILE_SIZE
    );
    if (platIdx >= 0) {
      state.removePlatform(platIdx);
      playEraseSound();
      return;
    }
  }, []);

  // ── Select element at grid (for property editing) ──
  const selectElementAtGrid = useCallback((gx, gy) => {
    const state = useGameDraftStore.getState();
    const draft = state.currentDraft;
    if (!draft) return;
    const cb = onSelectRef.current;
    if (!cb) return;
    const ld = draft.levelData;

    // Check playerStart
    if (ld.playerStart) {
      const px = ld.playerStart.x || 80, py = ld.playerStart.y || 300;
      if (Math.abs(px - gx - 16) < GRID && Math.abs(py - gy - GRID) < GRID) {
        const info = { kind: 'playerStart', index: 0, data: { x: px, y: py } };
        cb(info); drawSelectionHighlight(info);
        return;
      }
    }

    // Check exitDoor
    if (ld.exitDoor) {
      const ex = ld.exitDoor.x || 3650, ey = ld.exitDoor.y || 400;
      if (Math.abs(ex - gx - 16) < GRID && Math.abs(ey - gy - GRID) < GRID) {
        const info = { kind: 'exitDoor', index: 0, data: { x: ex, y: ey } };
        cb(info); drawSelectionHighlight(info);
        return;
      }
    }

    // Check items
    const item = (ld.items || []).find(it =>
      Math.abs((it.x || 0) - gx - 16) < GRID && Math.abs((it.y || 0) - gy - 16) < GRID
    );
    if (item) {
      const info = { kind: 'item', index: (ld.items || []).indexOf(item), data: { ...item } };
      cb(info); drawSelectionHighlight(info);
      return;
    }

    // Check enemies
    const enemy = (ld.enemies || []).find(en =>
      Math.abs((en.x || 0) - gx) < GRID && Math.abs((en.y || 0) - gy - GRID) < GRID
    );
    if (enemy) {
      const info = { kind: 'enemy', index: (ld.enemies || []).indexOf(enemy), data: { ...enemy } };
      cb(info); drawSelectionHighlight(info);
      return;
    }

    // Check interactables
    const inter = (ld.interactables || []).find(obj =>
      gx >= (obj.x || 0) && gx < (obj.x || 0) + (obj.w || GRID) &&
      gy >= (obj.y || 0) && gy < (obj.y || 0) + (obj.h || GRID)
    );
    if (inter) {
      const info = { kind: 'interactable', index: (ld.interactables || []).indexOf(inter), data: { ...inter } };
      cb(info); drawSelectionHighlight(info);
      return;
    }

    // Check platforms
    const plat = (ld.platforms || []).find(p =>
      gx >= (p.x || 0) && gx < (p.x || 0) + (p.w || 100) &&
      gy >= (p.y || 0) && gy < (p.y || 0) + TILE_SIZE
    );
    if (plat) {
      const info = { kind: 'platform', index: (ld.platforms || []).indexOf(plat), data: { ...plat } };
      cb(info); drawSelectionHighlight(info);
      return;
    }

    // Nothing hit - deselect
    cb(null);
    // Clear highlight
    if (selGfxRef.current) selGfxRef.current.clear();
  }, []);

  // ── Draw selection highlight around an element ──
  const drawSelectionHighlight = useCallback((info) => {
    const gfx = selGfxRef.current;
    if (!gfx) return;
    gfx.clear();
    if (!info) return;
    const state = useGameDraftStore.getState();
    const ld = state.currentDraft?.levelData;
    if (!ld) return;

    let x, y, w, h;
    if (info.kind === 'playerStart' && ld.playerStart) {
      x = (ld.playerStart.x || 80) - 20; y = (ld.playerStart.y || 300) - 36;
      w = 40; h = 40;
    } else if (info.kind === 'exitDoor' && ld.exitDoor) {
      x = (ld.exitDoor.x || 3650) - 20; y = (ld.exitDoor.y || 400) - 44;
      w = 40; h = 48;
    } else if (info.kind === 'item') {
      const it = (ld.items || [])[info.index];
      if (!it) return;
      x = (it.x || 0) - 20; y = (it.y || 0) - 20; w = 40; h = 40;
    } else if (info.kind === 'enemy') {
      const en = (ld.enemies || [])[info.index];
      if (!en) return;
      x = (en.x || 0) - 20; y = (en.y || 0) - 36; w = 40; h = 40;
    } else if (info.kind === 'interactable') {
      const obj = (ld.interactables || [])[info.index];
      if (!obj) return;
      x = (obj.x || 0) - 4; y = (obj.y || 0) - 4;
      w = (obj.w || GRID) + 8; h = (obj.h || GRID) + 8;
    } else if (info.kind === 'platform') {
      const p = (ld.platforms || [])[info.index];
      if (!p) return;
      x = (p.x || 0) - 2; y = (p.y || 0) - 2;
      w = (p.w || TILE_SIZE) + 4; h = TILE_SIZE + 4;
    } else return;

    // Draw highlight: animated dashed border + glow fill
    gfx.lineStyle(2.5, 0x1CB0F6, 0.9);
    gfx.beginFill(0x1CB0F6, 0.08);
    gfx.drawRoundedRect(x, y, w, h, 4);
    gfx.endFill();
    // Corner markers
    const m = 6;
    gfx.lineStyle(3, 0x1CB0F6, 1);
    // top-left
    gfx.moveTo(x, y + m); gfx.lineTo(x, y); gfx.lineTo(x + m, y);
    // top-right
    gfx.moveTo(x + w - m, y); gfx.lineTo(x + w, y); gfx.lineTo(x + w, y + m);
    // bottom-left
    gfx.moveTo(x, y + h - m); gfx.lineTo(x, y + h); gfx.lineTo(x + m, y + h);
    // bottom-right
    gfx.moveTo(x + w - m, y + h); gfx.lineTo(x + w, y + h); gfx.lineTo(x + w, y + h - m);
  }, []);

  // ── Render level ──
  useEffect(() => {
    if (!ready || !assetsLoaded || !appRef.current || !currentDraft) return;
    const app = appRef.current;
    const assets = assetsRef.current;
    const ld = currentDraft.levelData;
    const ww = ld.worldWidth || 3800;
    const wh = ld.worldHeight || 700;
    const theme = ld.theme || 'forest';

    // Clear stage
    while (app.stage.children.length > 0) app.stage.removeChildAt(0);

    const world = new PIXI.Container();
    worldRef.current = world;
    app.stage.addChild(world);
    world.scale.set(zoom);

    // Cinematic intro: zoom out to show whole level, then zoom into playerStart
    const draftId = currentDraft.id || currentDraft.levelId;
    let introTimer = null;
    if (draftId && initializedDraftRef.current !== draftId && ld.playerStart) {
      initializedDraftRef.current = draftId;
      const canvasW = app.canvas.width / (window.devicePixelRatio || 1);
      const canvasH = app.canvas.height / (window.devicePixelRatio || 1);

      const globalZoom = Math.min(canvasW / ww, canvasH / wh) * 0.9;
      const globalPan = {
        x: (canvasW - ww * globalZoom) / 2,
        y: (canvasH - wh * globalZoom) / 2,
      };
      const cx = ld.playerStart.x || 80;
      const cy = ld.playerStart.y || 300;
      const targetZoom = zoom;
      // Compute target pan centered on playerStart, then clamp to world bounds
      const rawTargetX = canvasW / 2 - cx * targetZoom;
      const rawTargetY = canvasH / 2 - cy * targetZoom;
      const margin = 50;
      const maxX = margin;
      const maxY = margin;
      const minX = canvasW - ww * targetZoom - margin;
      const minY = canvasH - wh * targetZoom - margin;
      const targetPan = {
        x: Math.min(maxX, Math.max(minX, rawTargetX)),
        y: Math.min(maxY, Math.max(minY, rawTargetY)),
      };

      world.scale.set(globalZoom);
      world.x = globalPan.x;
      world.y = globalPan.y;

      introTimer = setTimeout(() => {
        const startT = performance.now();
        const animate = (now) => {
          const t = Math.min((now - startT) / 1000, 1);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          world.scale.set(globalZoom + (targetZoom - globalZoom) * ease);
          world.x = globalPan.x + (targetPan.x - globalPan.x) * ease;
          world.y = globalPan.y + (targetPan.y - globalPan.y) * ease;
          if (t < 1) requestAnimationFrame(animate);
          else {
            panRef.current = { x: targetPan.x, y: targetPan.y };
            if (onZoomRef.current) onZoomRef.current(targetZoom);
          }
        };
        requestAnimationFrame(animate);
      }, 800);
    } else {
      world.x = panRef.current.x;
      world.y = panRef.current.y;
    }

    const material = theme === 'desert' ? 'sand'
      : theme === 'candy' ? 'purple'
      : theme === 'ocean' ? 'stone'
      : 'grass';

    const tiles = assets?.tiles || {};

    // Background — keep aspect ratio, cover height, tile horizontally
    if (assets?.backgrounds) {
      const bgKey = theme === 'desert' ? 'background_color_desert'
        : theme === 'candy' ? 'background_color_mushrooms'
        : theme === 'ocean' ? 'background_color_hills'
        : 'background_color_trees';
      const bgTex = assets.backgrounds[bgKey] || assets.backgrounds['background_color_trees'];
      if (bgTex) {
        // Scale to cover world height while preserving aspect ratio
        const texW = bgTex.width;
        const texH = bgTex.height;
        const scale = wh / texH; // stretch height to fill
        const tileW = texW * scale; // width per tile at this scale
        const tilesNeeded = Math.ceil(ww / tileW);

        for (let i = 0; i < tilesNeeded; i++) {
          const bgSpr = new PIXI.Sprite(bgTex);
          bgSpr.x = i * tileW;
          bgSpr.y = 0;
          bgSpr.width = tileW;
          bgSpr.height = wh;
          bgSpr.alpha = 0.5;
          world.addChild(bgSpr);
        }
      }
    }

    // Grid (edit mode)
    if (mode === 'edit') {
      const grid = new PIXI.Graphics();
      grid.lineStyle(1, 0x58CC02, 0.06);
      for (let x = 0; x <= ww; x += GRID) { grid.moveTo(x, 0); grid.lineTo(x, wh); }
      for (let y = 0; y <= wh; y += GRID) { grid.moveTo(0, y); grid.lineTo(ww, y); }
      world.addChild(grid);
    }

    const getTileTex = (name) => tiles[name] || null;
    const makeSprite = (tex, x, y, w, h, fallbackColor = 0x6D4C41) => {
      if (tex) {
        const s = new PIXI.Sprite(tex);
        s.x = x; s.y = y; s.width = w; s.height = h;
        return s;
      }
      const g = new PIXI.Graphics();
      g.beginFill(fallbackColor, 0.6);
      g.drawRect(0, 0, w, h);
      g.endFill();
      g.x = x; g.y = y;
      return g;
    };

    // Platforms
    (ld.platforms || []).forEach((p) => {
      const pw = p.w || 100;
      const isGround = (p.y || 0) >= 500;

      // User-placed tile with specific tileId → layered tiling (same as game)
      if (p.tileId) {
        const mat = p.tileId.replace(/_block.*|_cloud.*/, '') || material;
        const isCloud = p.tileId.includes('cloud');
        const cols = Math.max(1, Math.ceil(pw / TILE_SIZE));

        if (isCloud) {
          // Floating platform → cloud tiles, single row
          for (let col = 0; col < cols; col++) {
            let tn;
            if (cols === 1) tn = `terrain_${mat}_cloud`;
            else if (col === 0) tn = `terrain_${mat}_cloud_left`;
            else if (col === cols - 1) tn = `terrain_${mat}_cloud_right`;
            else tn = `terrain_${mat}_cloud_middle`;
            world.addChild(makeSprite(getTileTex(tn), (p.x || 0) + col * TILE_SIZE, p.y || 0, TILE_SIZE, TILE_SIZE * 0.6, 0x8D6E63));
          }
        } else if (isGround) {
          // Ground platform → top row + center fill
          const depth = Math.max(2, Math.ceil((wh - (p.y || 0) + 200) / TILE_SIZE));
          for (let col = 0; col < cols; col++) {
            for (let row = 0; row < depth; row++) {
              let tn;
              if (row === 0) {
                if (cols === 1) tn = `terrain_${mat}_block`;
                else if (col === 0) tn = `terrain_${mat}_block_top_left`;
                else if (col === cols - 1) tn = `terrain_${mat}_block_top_right`;
                else tn = `terrain_${mat}_block_top`;
              } else {
                if (cols === 1) tn = `terrain_${mat}_block_center`;
                else if (col === 0) tn = `terrain_${mat}_block_left`;
                else if (col === cols - 1) tn = `terrain_${mat}_block_right`;
                else tn = `terrain_${mat}_block_center`;
              }
              world.addChild(makeSprite(getTileTex(tn), (p.x || 0) + col * TILE_SIZE, (p.y || 0) + row * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0x4E7A3E));
            }
          }
        } else {
          // Non-ground, non-cloud → single row top tiles
          for (let col = 0; col < cols; col++) {
            let tn;
            if (cols === 1) tn = `terrain_${mat}_block`;
            else if (col === 0) tn = `terrain_${mat}_block_top_left`;
            else if (col === cols - 1) tn = `terrain_${mat}_block_top_right`;
            else tn = `terrain_${mat}_block_top`;
            world.addChild(makeSprite(getTileTex(tn), (p.x || 0) + col * TILE_SIZE, p.y || 0, TILE_SIZE, TILE_SIZE, 0x8D6E63));
          }
        }
        return;
      }

      // Legacy platforms (from level data, no tileId) → use theme tiling
      if (isGround) {
        const cols = Math.max(1, Math.ceil(pw / TILE_SIZE));
        const depth = Math.max(2, Math.ceil((wh - (p.y || 0) + 200) / TILE_SIZE));
        for (let col = 0; col < cols; col++) {
          for (let row = 0; row < depth; row++) {
            let tn;
            if (row === 0) {
              if (cols === 1) tn = `terrain_${material}_block`;
              else if (col === 0) tn = `terrain_${material}_block_top_left`;
              else if (col === cols - 1) tn = `terrain_${material}_block_top_right`;
              else tn = `terrain_${material}_block_top`;
            } else {
              if (cols === 1) tn = `terrain_${material}_block_center`;
              else if (col === 0) tn = `terrain_${material}_block_left`;
              else if (col === cols - 1) tn = `terrain_${material}_block_right`;
              else tn = `terrain_${material}_block_center`;
            }
            world.addChild(makeSprite(getTileTex(tn), (p.x || 0) + col * TILE_SIZE, (p.y || 0) + row * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0x4E7A3E));
          }
        }
      } else {
        const cols = Math.max(1, Math.ceil(pw / TILE_SIZE));
        for (let col = 0; col < cols; col++) {
          let tn;
          if (cols === 1) tn = `terrain_${material}_cloud`;
          else if (col === 0) tn = `terrain_${material}_cloud_left`;
          else if (col === cols - 1) tn = `terrain_${material}_cloud_right`;
          else tn = `terrain_${material}_cloud_middle`;
          world.addChild(makeSprite(getTileTex(tn), (p.x || 0) + col * TILE_SIZE, p.y || 0, TILE_SIZE, TILE_SIZE * 0.6, 0x8D6E63));
        }
      }
    });

    // Items (use tileId if available, else ITEM_MAP)
    const ITEM_MAP = { coin: 'coin_gold', coin_gold: 'coin_gold', coin_silver: 'coin_silver', coin_bronze: 'coin_bronze', star: 'star', heart: 'heart', key: 'key_blue', gem: 'gem_blue', gem_blue: 'gem_blue', gem_red: 'gem_red', gem_green: 'gem_green', gem_yellow: 'gem_yellow', spring: 'spring', weapon_fire: 'torch_on_a', weapon_water: 'gem_blue', mushroom_red: 'mushroom_red', mushroom_brown: 'mushroom_brown', fireball: 'fireball' };
    (ld.items || []).forEach((item) => {
      // Try tileId directly, then through ITEM_MAP, then item.type through ITEM_MAP
      const texName = getTileTex(item.tileId) ? item.tileId
        : (ITEM_MAP[item.tileId] || ITEM_MAP[item.type] || item.tileId || 'coin_gold');
      world.addChild(makeSprite(getTileTex(texName), (item.x || 0) - 16, (item.y || 0) - 16, 32, 32, 0xFFD700));
    });

    // Enemies (use id/enemyType for texture lookup from AssetLoader)
    const enemyAssets = assets?.enemies || {};
    // 构建 tileId(文件名) → assetId(ENEMIES_ASSETS.id) 的反向映射
    // 解决预置关卡中 tileId='slime_normal_rest' 但 enemyAssets 键为 'slime_normal' 的不匹配问题
    const ENEMY_TILE_TO_ASSET = {};
    (ENEMIES_ASSETS.items || []).forEach(item => {
      // 从 src 提取文件名（不含扩展名）作为 tileId 键
      const fileName = item.src.split('/').pop().replace('.png', '');
      ENEMY_TILE_TO_ASSET[fileName] = item.id;
      // 也用 enemyType 作为键
      if (item.enemyType) ENEMY_TILE_TO_ASSET[item.enemyType] = item.id;
    });
    (ld.enemies || []).forEach((en) => {
      // 查找顺序: enemyType → 直接匹配 → tileId反向映射 → type作为键 → 兜底slime_normal
      const lookupKey = en.enemyType
        || enemyAssets[en.tileId] && en.tileId
        || ENEMY_TILE_TO_ASSET[en.tileId]
        || ENEMY_TILE_TO_ASSET[en.type]
        || en.tileId
        || 'slime_normal';
      const tex = enemyAssets[lookupKey]?.textures?.default;
      world.addChild(makeSprite(tex, (en.x || 0) - 16, (en.y || 0) - 32, 32, 32, 0xFF4444));
    });

    // Interactables (use tileId directly for texture lookup)
    const INT_MAP = { questionBlock: 'block_exclamation', breakBlock: 'brick_brown', pushBox: 'box_item', portal: 'door_closed_top', switch: 'switch_blue', spring: 'spring', spikes: 'spikes', bomb: 'bomb', torch: 'torch_on_a', ladder: 'ladder', rope: 'rop_attached' };
    (ld.interactables || []).forEach((obj) => {
      const texName = obj.tileId || INT_MAP[obj.type] || 'block_exclamation';
      world.addChild(makeSprite(getTileTex(texName), obj.x || 0, obj.y || 0, obj.w || 32, obj.h || 32, 0xFFD740));
    });

    // Player start
    if (ld.playerStart) {
      const tex = assets?.characters?.green?.idle;
      const px = ld.playerStart.x || 80, py = ld.playerStart.y || 300;
      world.addChild(makeSprite(tex, px - 16, py - 32, 32, 32, 0x4CAF50));
      const label = new PIXI.Text({ text: '↓ START', style: { fontSize: 10, fill: '#58CC02', fontWeight: 'bold', fontFamily: 'Nunito, sans-serif' }});
      label.anchor.set(0.5, 1); label.x = px; label.y = py - 34;
      world.addChild(label);
    }

    // Exit door
    if (ld.exitDoor) {
      const ex = ld.exitDoor.x || 3650, ey = ld.exitDoor.y || 400;
      world.addChild(makeSprite(getTileTex('door_closed_top'), ex - 16, ey - 40, 32, 40, 0xFFD740));
      const label = new PIXI.Text({ text: '🚪 EXIT', style: { fontSize: 10, fill: '#FF9800', fontWeight: 'bold', fontFamily: 'Nunito, sans-serif' }});
      label.anchor.set(0.5, 1); label.x = ex; label.y = ey - 42;
      world.addChild(label);
    }

    // Cursor overlay (always on top)
    const cursor = new PIXI.Graphics();
    world.addChild(cursor);
    cursorRef.current = cursor;

    // Selection highlight overlay (above cursor)
    const selGfx = new PIXI.Graphics();
    world.addChild(selGfx);
    selGfxRef.current = selGfx;

    return () => { if (introTimer) clearTimeout(introTimer); };
  }, [ready, assetsLoaded, currentDraft, mode, zoom]);

  // ── Drag & Drop from TilePanel ──
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/editor-asset');
    if (!data || !worldRef.current || !appRef.current) return;
    const tile = JSON.parse(data);
    const rect = appRef.current.canvas.getBoundingClientRect();
    const world = worldRef.current;
    const z = zoomRef.current;
    const mx = (e.clientX - rect.left - world.x) / z;
    const my = (e.clientY - rect.top - world.y) / z;
    placeTileAtGrid(tile, Math.floor(mx / GRID) * GRID, Math.floor(my / GRID) * GRID);
  }, [placeTileAtGrid]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }, []);

  return (
    <div className={styles.canvas} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div ref={containerRef} className={styles.pixiContainer} />
      {!assetsLoaded && ready && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span>加载素材中...</span>
        </div>
      )}
      {mode === 'edit' && (
        <div className={styles.statusBar}>
          <span>
            {currentDraft?.levelData?.platforms?.length || 0} 平台 ·{' '}
            {currentDraft?.levelData?.items?.length || 0} 物品 ·{' '}
            {currentDraft?.levelData?.enemies?.length || 0} 敌人 ·{' '}
            {currentDraft?.levelData?.interactables?.length || 0} 机关
          </span>
          <span>
            {currentDraft?.levelData?.worldWidth || 0}×{currentDraft?.levelData?.worldHeight || 0}
          </span>
        </div>
      )}
    </div>
  );
}

function playEraseSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'square'; o.frequency.setValueAtTime(220, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.1);
  } catch (_) {}
}
