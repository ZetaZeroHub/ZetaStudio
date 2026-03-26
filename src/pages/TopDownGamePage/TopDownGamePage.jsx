/* ========================================
   游戏梦想家 — 俯视角冒险页面
   初级模式 — Tiny Town 素材 — Canvas 渲染
   ======================================== */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getTopDownLevel } from '../../data/topDownLevels';
import { initTopDownState, updateTopDownPhysics } from './engine/topDownPhysics';
import { preloadTiles, renderTopDown } from './engine/topDownRenderer';
import styles from './TopDownGamePage.module.css';

export default function TopDownGamePage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const gsRef = useRef(null);
  const keysRef = useRef({});
  const frameRef = useRef(0);
  const runningRef = useRef(true);
  const [showControls, setShowControls] = useState(true);

  /* ── 键盘输入 ── */
  const handleKeyDown = useCallback((e) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') keysRef.current.up = true;
    if (k === 'arrowdown' || k === 's') keysRef.current.down = true;
    if (k === 'arrowleft' || k === 'a') keysRef.current.left = true;
    if (k === 'arrowright' || k === 'd') keysRef.current.right = true;
    if (k === 'e') keysRef.current.e = true;
    // 仅对游戏按键调用 preventDefault
    const gameKeys = ['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','e',' '];
    if (gameKeys.includes(k)) e.preventDefault();
  }, []);

  const handleKeyUp = useCallback((e) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') keysRef.current.up = false;
    if (k === 'arrowdown' || k === 's') keysRef.current.down = false;
    if (k === 'arrowleft' || k === 'a') keysRef.current.left = false;
    if (k === 'arrowright' || k === 'd') keysRef.current.right = false;
    if (k === 'e') keysRef.current.e = false;
  }, []);

  /* ── 虚拟摇杆触屏 ── */
  const handleJoystick = useCallback((direction, active) => {
    keysRef.current[direction] = active;
  }, []);

  /* ── 初始化 ── */
  useEffect(() => {
    const levelData = getTopDownLevel(levelId);
    if (!levelData) {
      navigate('/maze/difficulty');
      return;
    }

    // Deep clone level data (so entities can be mutated)
    const clonedLevel = JSON.parse(JSON.stringify(levelData));
    preloadTiles(clonedLevel);

    const gs = initTopDownState(clonedLevel);
    gsRef.current = gs;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Size
    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 点击胜利画面返回
    canvas.addEventListener('click', () => {
      if (gs.completed) navigate('/maze/levels/easy');
    });

    // 触屏 NPC 互动
    canvas.addEventListener('pointerdown', () => {
      keysRef.current.e = true;
      setTimeout(() => { keysRef.current.e = false; }, 200);
    });

    runningRef.current = true;
    frameRef.current = 0;

    function tick() {
      if (!runningRef.current) return;
      frameRef.current++;

      const viewW = canvas.width;
      const viewH = canvas.height;

      if (!gs.completed) {
        updateTopDownPhysics(gs, keysRef.current, viewW, viewH);
      }

      renderTopDown(ctx, gs, viewW, viewH, frameRef.current);

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);

    return () => {
      runningRef.current = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [levelId, navigate, handleKeyDown, handleKeyUp]);

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/maze/levels/easy')}>
          <ArrowLeft size={14} /> 返回
        </button>
      </header>

      {/* Game canvas */}
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} className={styles.gameCanvas} />
      </div>

      {/* Mobile joystick — Kenney dpad */}
      <div className={styles.joystick}>
        <button
          className={`${styles.joyBtn} ${styles.joyUp}`}
          onPointerDown={() => handleJoystick('up', true)}
          onPointerUp={() => handleJoystick('up', false)}
          onPointerLeave={() => handleJoystick('up', false)}
        ><img src="/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double/switch_dpad_up.png" alt="↑" className={styles.joyBtnImg} /></button>
        <div className={styles.joyRow}>
          <button
            className={`${styles.joyBtn} ${styles.joyLeft}`}
            onPointerDown={() => handleJoystick('left', true)}
            onPointerUp={() => handleJoystick('left', false)}
            onPointerLeave={() => handleJoystick('left', false)}
          ><img src="/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double/switch_dpad_left.png" alt="←" className={styles.joyBtnImg} /></button>
          <button
            className={`${styles.joyBtn} ${styles.joyCenter}`}
            onPointerDown={() => { keysRef.current.e = true; }}
            onPointerUp={() => { keysRef.current.e = false; }}
          ><img src="/assets/kenney/kenney_input-prompts_1.4.1/Generic/Double/generic_button_square.png" alt="E" className={styles.joyBtnImg} /><span className={styles.joyBtnLabel}>E</span></button>
          <button
            className={`${styles.joyBtn} ${styles.joyRight}`}
            onPointerDown={() => handleJoystick('right', true)}
            onPointerUp={() => handleJoystick('right', false)}
            onPointerLeave={() => handleJoystick('right', false)}
          ><img src="/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double/switch_dpad_right.png" alt="→" className={styles.joyBtnImg} /></button>
        </div>
        <button
          className={`${styles.joyBtn} ${styles.joyDown}`}
          onPointerDown={() => handleJoystick('down', true)}
          onPointerUp={() => handleJoystick('down', false)}
          onPointerLeave={() => handleJoystick('down', false)}
        ><img src="/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double/switch_dpad_down.png" alt="↓" className={styles.joyBtnImg} /></button>
      </div>
    </div>
  );
}
