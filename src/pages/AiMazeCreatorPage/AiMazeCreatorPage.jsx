/* ========================================
   AiMazeCreatorPage — AI 创作迷宫
   v3: 多选标签 + 画布尺寸 + 角色/终点选择
   Play phase: directly reuses MazePathGame
   ======================================== */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateMazeFromPath, LOADING_PREVIEW_ASSETS,
  CANVAS_SIZES, PLAYER_CHARACTERS, GOAL_TYPES,
} from '../../utils/mazeGenerator';
import { MAZE_ASSETS } from '../../data/topDownLevels';
import MazePathGame from '../MazePathGame/MazePathGame';
import { playClickSound, playSelectSound, playBackSound } from '../../utils/gameUISound';
import styles from './AiMazeCreatorPage.module.css';

/* ── Asset paths ── */
const UI     = '/assets/kenney/kenney_ui-pack/PNG';
const BGE    = '/assets/kenney/kenney_background-elements-redux';
const BGI    = '/assets/kenney/kenney_board-game-icons/PNG/Default (64px)';
const ANIMAL = '/assets/kenney/kenney_animal-pack/PNG/Square';

/* ═══════════════════════════════════════════
   素材帮助目录
   ═══════════════════════════════════════════ */
const ASSET_CATALOG = [
  {
    category: '地图风格', desc: '改变整个迷宫的场景氛围',
    icon: `${BGI}/flag_triangle.png`, type: 'style',
    items: [
      { key: 'forest', name: '森林', img: MAZE_ASSETS.treePine, prompt: '森林风格的迷宫' },
      { key: 'autumn', name: '秋天', img: MAZE_ASSETS.treeOrange1, prompt: '秋天风格的迷宫' },
      { key: 'winter', name: '冬天', img: MAZE_ASSETS.treeSnowPine1, prompt: '冬天风格的迷宫' },
      { key: 'candy', name: '糖果', img: MAZE_ASSETS.lollipopRed, prompt: '糖果风格的迷宫' },
      { key: 'city', name: '城市', img: MAZE_ASSETS.blockHouseBlue, prompt: '城市风格的迷宫' },
      { key: 'village', name: '村庄', img: MAZE_ASSETS.blockCastle, prompt: '村庄风格的迷宫' },
      { key: 'racing', name: '赛车', img: MAZE_ASSETS.raceTentBlue, prompt: '赛车风格的迷宫' },
    ],
  },
  {
    category: '装饰素材', desc: '可多选添加到迷宫中', icon: MAZE_ASSETS.treePine, type: 'deco',
    items: [
      { key: 'treePine', name: '松树', img: MAZE_ASSETS.treePine, prompt: '松树' },
      { key: 'treeRound', name: '圆树', img: MAZE_ASSETS.treeRound, prompt: '圆树' },
      { key: 'flower', name: '红花', img: MAZE_ASSETS.flower, prompt: '红花' },
      { key: 'bush', name: '灌木', img: MAZE_ASSETS.bush, prompt: '灌木' },
      { key: 'rockSmall', name: '石头', img: MAZE_ASSETS.rockSmall, prompt: '石头' },
      { key: 'candyBlue', name: '蓝糖果', img: MAZE_ASSETS.candyBlue, prompt: '蓝色糖果' },
      { key: 'lollipopRed', name: '棒棒糖', img: MAZE_ASSETS.lollipopRed, prompt: '棒棒糖' },
      { key: 'heart', name: '爱心', img: MAZE_ASSETS.heart, prompt: '爱心' },
      { key: 'blockBoxTreasure', name: '宝箱', img: MAZE_ASSETS.blockBoxTreasure, prompt: '宝箱' },
      { key: 'blockCart', name: '推车', img: MAZE_ASSETS.blockCart, prompt: '推车' },
      { key: 'animalBee', name: '蜜蜂', img: MAZE_ASSETS.animalBee, prompt: '蜜蜂' },
      { key: 'animalFrog', name: '青蛙', img: MAZE_ASSETS.animalFrog, prompt: '青蛙' },
      { key: 'animalSnail', name: '蜗牛', img: MAZE_ASSETS.animalSnail, prompt: '蜗牛' },
      { key: 'bgHouse1', name: '大房子', img: MAZE_ASSETS.bgHouse1, prompt: '大房子' },
      { key: 'bgCastleSmall', name: '小城堡', img: MAZE_ASSETS.bgCastleSmall, prompt: '小城堡' },
      { key: 'raceCone', name: '路锥', img: MAZE_ASSETS.raceCone, prompt: '路锥' },
    ],
  },
];
const TOTAL_ASSETS = ASSET_CATALOG.reduce((sum, cat) => sum + cat.items.length, 0);

/* ── Multi-selectable quick tags (shown below description input) ── */
const QUICK_TAGS = [
  { key: 'treePine', name: '松树', img: MAZE_ASSETS.treePine },
  { key: 'flower', name: '红花', img: MAZE_ASSETS.flower },
  { key: 'animalBee', name: '蜜蜂', img: MAZE_ASSETS.animalBee },
  { key: 'animalFrog', name: '青蛙', img: MAZE_ASSETS.animalFrog },
  { key: 'heart', name: '爱心', img: MAZE_ASSETS.heart },
  { key: 'lollipopRed', name: '棒棒糖', img: MAZE_ASSETS.lollipopRed },
  { key: 'blockBoxTreasure', name: '宝箱', img: MAZE_ASSETS.blockBoxTreasure },
  { key: 'rockSmall', name: '石头', img: MAZE_ASSETS.rockSmall },
  { key: 'bgHouse1', name: '房子', img: MAZE_ASSETS.bgHouse1 },
  { key: 'raceCone', name: '路锥', img: MAZE_ASSETS.raceCone },
];

/* ── Style options ── */
const STYLE_OPTIONS = [
  { key: 'forest', label: '森林', icon: `${BGE}/PNG/Default/treePine.png` },
  { key: 'autumn', label: '秋天', icon: `${BGE}/PNG/Default/treeOrange.png` },
  { key: 'winter', label: '冬天', icon: `${BGE}/PNG/Default/treeFrozen.png` },
  { key: 'candy', label: '糖果', icon: '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/lollipopRed.png' },
  { key: 'city', label: '城市', icon: `${BGE}/PNG/Default/house1.png` },
  { key: 'village', label: '村庄', icon: `${BGE}/PNG/Default/castleSmall.png` },
  { key: 'racing', label: '赛车', icon: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Cars/car_red_1.png' },
];

/* ── Phases ── */
const PHASE = { DRAW: 'draw', LOADING: 'loading', PLAY: 'play' };

export default function AiMazeCreatorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');
  const canvasRef = useRef(null);

  const [phase, setPhase] = useState(PHASE.DRAW);
  const [selectedStyle, setSelectedStyle] = useState('forest');
  const [canvasSize, setCanvasSize] = useState('small');
  const [selectedChar, setSelectedChar] = useState('duck');
  const [selectedGoal, setSelectedGoal] = useState('pool');
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [userPath, setUserPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [generatedLevel, setGeneratedLevel] = useState(null);
  const [loadingAssetIdx, setLoadingAssetIdx] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [editingDraftId, setEditingDraftId] = useState(null);

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishName, setPublishName] = useState('');
  const [toast, setToast] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  /* ── Load draft for editing ── */
  useEffect(() => {
    if (!draftId) return;
    try {
      const drafts = JSON.parse(localStorage.getItem('game_drafts_v1') || '[]');
      const draft = drafts.find(d => d.id === draftId);
      if (!draft) { console.warn('[AiMaze] Draft not found:', draftId); return; }
      console.log('[AiMaze] Loading draft for editing:', draftId);
      setEditingDraftId(draftId);
      if (draft.levelData) setGeneratedLevel(draft.levelData);
      if (draft.creationContext) {
        const ctx = draft.creationContext;
        if (ctx.textInput) setTextInput(ctx.textInput);
        if (ctx.selectedStyle) setSelectedStyle(ctx.selectedStyle);
        if (ctx.canvasSize) setCanvasSize(ctx.canvasSize);
        if (ctx.selectedChar) setSelectedChar(ctx.selectedChar);
        if (ctx.selectedGoal) setSelectedGoal(ctx.selectedGoal);
        if (ctx.selectedTags) setSelectedTags(new Set(ctx.selectedTags));
        if (ctx.userPath && ctx.userPath.length > 0) setUserPath(ctx.userPath);
      }
    } catch (e) { console.error('[AiMaze] Draft load error:', e); }
  }, [draftId]);

  const isEditing = !!editingDraftId;

  const sizeConf = CANVAS_SIZES[canvasSize];
  const GRID_W = sizeConf.gridW;
  const GRID_H = sizeConf.gridH;
  const CELL_SIZE = sizeConf.cellSize;

  /* ═════ DRAWING ═════ */
  const drawGrid = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const w = GRID_W * CELL_SIZE;
    const h = GRID_H * CELL_SIZE;
    cvs.width = w; cvs.height = h;

    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(139,90,43,0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_W; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL_SIZE, 0); ctx.lineTo(x * CELL_SIZE, h); ctx.stroke();
    }
    for (let y = 0; y <= GRID_H; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL_SIZE); ctx.lineTo(w, y * CELL_SIZE); ctx.stroke();
    }

    userPath.forEach((p, i) => {
      const isEnd = i === userPath.length - 1 && userPath.length > 1;
      const isStart = i === 0;
      ctx.fillStyle = isEnd ? '#c0392b' : isStart ? '#27ae60' : '#d4a574';
      ctx.fillRect(p.gx * CELL_SIZE + 1, p.gy * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      if (isStart || isEnd) {
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(8, CELL_SIZE * 0.28)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(isStart ? '入口' : '出口', p.gx * CELL_SIZE + CELL_SIZE / 2, p.gy * CELL_SIZE + CELL_SIZE / 2);
      }
    });

    if (userPath.length > 1) {
      ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(userPath[0].gx * CELL_SIZE + CELL_SIZE / 2, userPath[0].gy * CELL_SIZE + CELL_SIZE / 2);
      for (let i = 1; i < userPath.length; i++)
        ctx.lineTo(userPath[i].gx * CELL_SIZE + CELL_SIZE / 2, userPath[i].gy * CELL_SIZE + CELL_SIZE / 2);
      ctx.stroke(); ctx.setLineDash([]);
    }
  }, [userPath, GRID_W, GRID_H, CELL_SIZE]);

  useEffect(() => { if (phase === PHASE.DRAW) drawGrid(); }, [phase, drawGrid]);

  const getCellFromEvent = (e) => {
    const cvs = canvasRef.current;
    if (!cvs) return null;
    const rect = cvs.getBoundingClientRect();
    const scaleX = cvs.width / rect.width;
    const scaleY = cvs.height / rect.height;
    let cx, cy;
    if (e.touches) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = e.clientX; cy = e.clientY; }
    const gx = Math.floor((cx - rect.left) * scaleX / CELL_SIZE);
    const gy = Math.floor((cy - rect.top) * scaleY / CELL_SIZE);
    if (gx < 1 || gx >= GRID_W - 1 || gy < 1 || gy >= GRID_H - 1) return null;
    return { gx, gy };
  };

  const isAdjacent = (a, b) => !a || !b ? false : Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy) === 1;

  const handleDrawStart = (e) => { e.preventDefault(); const c = getCellFromEvent(e); if (c) { setIsDrawing(true); setUserPath([c]); } };
  const handleDrawMove = (e) => {
    e.preventDefault(); if (!isDrawing) return;
    const c = getCellFromEvent(e); if (!c) return;
    setUserPath(prev => {
      if (!prev.length) return [c];
      const last = prev[prev.length - 1];
      if (last.gx === c.gx && last.gy === c.gy) return prev;
      if (!isAdjacent(last, c)) return prev;
      if (prev.some(p => p.gx === c.gx && p.gy === c.gy)) return prev;
      return [...prev, c];
    });
  };
  const handleDrawEnd = () => setIsDrawing(false);

  /* ── Tag toggle ── */
  const toggleTag = useCallback((key) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    playClickSound();
  }, []);

  const fillPrompt = useCallback((prompt) => {
    setTextInput(prev => prev ? `${prev}，${prompt}` : prompt);
    playClickSound();
  }, []);

  /* ═════ GENERATE ═════ */
  const handleGenerate = useCallback(() => {
    if (userPath.length < 3) { setToast('请至少画3格路'); setTimeout(() => setToast(''), 2000); return; }
    playSelectSound();
    setPhase(PHASE.LOADING);
    setLoadingAssetIdx(0);
    const timer = setInterval(() => setLoadingAssetIdx(prev => (prev + 1) % LOADING_PREVIEW_ASSETS.length), 700);
    setTimeout(() => {
      clearInterval(timer);
      const level = generateMazeFromPath(userPath, GRID_W, GRID_H, selectedStyle, {
        character: selectedChar,
        goalType: selectedGoal,
        extraDecoKeys: [...selectedTags],
      });
      setGeneratedLevel(level);
      setPhase(PHASE.PLAY);
    }, 2200 + Math.random() * 800);
  }, [userPath, selectedStyle, selectedChar, selectedGoal, selectedTags, GRID_W, GRID_H]);

  /* ── Save/Publish from DRAW phase ── */
  const buildCreationContext = useCallback(() => ({
    textInput, selectedStyle, canvasSize, selectedChar, selectedGoal,
    selectedTags: [...selectedTags], userPath,
  }), [textInput, selectedStyle, canvasSize, selectedChar, selectedGoal, selectedTags, userPath]);

  const handleSaveOrPublish = useCallback(() => {
    if (userPath.length < 3) { setToast('请至少画3格路'); setTimeout(() => setToast(''), 2000); return; }
    playSelectSound();
    const level = generateMazeFromPath(userPath, GRID_W, GRID_H, selectedStyle, {
      character: selectedChar, goalType: selectedGoal, extraDecoKeys: [...selectedTags],
    });
    setGeneratedLevel(level);

    if (isEditing) {
      // Save in-place for drafts
      try {
        const drafts = JSON.parse(localStorage.getItem('game_drafts_v1') || '[]');
        const idx = drafts.findIndex(d => d.id === editingDraftId);
        if (idx >= 0) {
          drafts[idx].levelData = level;
          drafts[idx].creationContext = buildCreationContext();
          drafts[idx].updatedAt = Date.now();
          localStorage.setItem('game_drafts_v1', JSON.stringify(drafts));
        }
      } catch (e) { console.error('[AiMaze] Save error', e); }
      setToast('已保存'); setTimeout(() => setToast(''), 2000);
    } else {
      // New creation: open publish modal
      setPublishOpen(true); setPublishName('');
    }
  }, [userPath, selectedStyle, selectedChar, selectedGoal, selectedTags, GRID_W, GRID_H, isEditing, editingDraftId, buildCreationContext]);

  /* ── Publish (for new creations) / Save (for drafts from victory) ── */
  const handlePublish = useCallback(() => { setPublishOpen(true); setPublishName(''); }, []);
  const doPublish = useCallback(() => {
    if (!generatedLevel) return;
    const name = publishName.trim() || '我的迷宫';
    const creationCtx = buildCreationContext();

    if (isEditing) {
      // Update existing draft
      try {
        const drafts = JSON.parse(localStorage.getItem('game_drafts_v1') || '[]');
        const idx = drafts.findIndex(d => d.id === editingDraftId);
        if (idx >= 0) {
          drafts[idx].name = name;
          drafts[idx].levelData = generatedLevel;
          drafts[idx].creationContext = creationCtx;
          drafts[idx].updatedAt = Date.now();
          localStorage.setItem('game_drafts_v1', JSON.stringify(drafts));
        }
      } catch (e) { console.error('[AiMaze] Save error', e); }
      setPublishOpen(false); setToast('已保存');
      setTimeout(() => { setToast(''); navigate('/maze/home'); }, 1500);
    } else {
      // Create new draft
      const draft = {
        id: `ai_maze_${Date.now()}`, name, templateType: 'topdown',
        published: true, publishedAt: Date.now(), updatedAt: Date.now(),
        levelData: generatedLevel, creationContext: creationCtx,
      };
      try { const d = JSON.parse(localStorage.getItem('game_drafts_v1') || '[]'); d.unshift(draft); localStorage.setItem('game_drafts_v1', JSON.stringify(d)); } catch (e) { console.error('[AiMaze] Save error', e); }
      setPublishOpen(false); setToast('发布成功');
      setTimeout(() => { setToast(''); navigate('/maze/home'); }, 1500);
    }
  }, [generatedLevel, publishName, navigate, isEditing, editingDraftId, buildCreationContext]);

  /* ═════ HELP MODAL ═════ */
  const renderHelpModal = () => (
    <AnimatePresence>
      {helpOpen && (
        <motion.div className={styles.helpOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHelpOpen(false)}>
          <motion.div className={styles.helpModal} initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 30 }} onClick={e => e.stopPropagation()}>
            <div className={styles.helpHeader}>
              <img src={`${BGI}/book_open.png`} alt="" className={styles.helpHeaderIcon} />
              <div><h3 className={styles.helpTitle}>素材百科</h3><p className={styles.helpSubtitle}>共 {TOTAL_ASSETS} 个素材可用</p></div>
              <button className={styles.helpCloseBtn} onClick={() => setHelpOpen(false)}>
                <img src={`${UI}/Red/Default/button_square_depth_flat.png`} alt="" className={styles.helpCloseBg} />
                <span className={styles.helpCloseX}>×</span>
              </button>
            </div>
            <div className={styles.helpTip}><img src={`${ANIMAL}/rabbit.png`} alt="" className={styles.helpTipIcon} /><p>点击 <b>+</b> 按钮写入描述框。也可以选择左面板中的快捷标签！</p></div>
            <div className={styles.helpCatalog}>
              {ASSET_CATALOG.map(cat => (
                <div key={cat.category} className={styles.helpCatSection}>
                  <div className={styles.helpCatHead}>
                    <img src={cat.icon} alt="" className={styles.helpCatIcon} />
                    <span className={styles.helpCatName}>{cat.category}</span>
                    <span className={styles.helpCatCount}>{cat.items.length}个</span>
                  </div>
                  <p className={styles.helpCatDesc}>{cat.desc}</p>
                  <div className={styles.helpItemGrid}>
                    {cat.items.map(item => (
                      <div key={item.key} className={styles.helpItem}>
                        <img src={item.img} alt="" className={styles.helpItemImg} />
                        <span className={styles.helpItemName}>{item.name}</span>
                        <button className={styles.helpFillBtn} onClick={() => fillPrompt(item.prompt)} title={`填入: ${item.prompt}`}>
                          <img src={`${UI}/Green/Default/button_square_depth_gloss.png`} alt="" className={styles.helpFillBtnBg} />
                          <span className={styles.helpFillBtnIcon}>+</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ═════ DRAW PHASE ═════ */
  if (phase === PHASE.DRAW) {
    return (
      <div className={`${styles.page} gameUI`}>
        <div className={styles.bgLayer} style={{ backgroundImage: `url(${BGE}/Backgrounds/backgroundColorForest.png)` }} />
        <div className={styles.bgClouds}><img src={`${BGE}/Backgrounds/Elements/cloudLayer1.png`} alt="" className={styles.cloudImg} /></div>

        <header className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => { playBackSound(); navigate(-1); }}>
            <img src={`${UI}/Yellow/Default/arrow_basic_w.png`} alt="" className={styles.arrowIcon} />
          </button>
          <div className={styles.titleWrap}><img src={`${BGI}/hand.png`} alt="" className={styles.titleIcon} /><h1 className={styles.topTitle}>创作迷宫</h1></div>
          <div className={styles.topActions}>
            <button className={styles.helpBtn} onClick={() => { setHelpOpen(true); playClickSound(); }}>
              <img src={`${UI}/Blue/Default/button_square_depth_gloss.png`} alt="" className={styles.helpBtnBg} />
              <span className={styles.helpBtnQ}>?</span>
            </button>
            <button className={`${styles.topActionBtn} ${userPath.length < 3 ? styles.btnDisabled : ''}`} onClick={handleSaveOrPublish} disabled={userPath.length < 3}>
              <img src={`${UI}/Yellow/Default/button_rectangle_depth_gloss.png`} alt="" className={styles.topActionBg} />
              <span className={styles.topActionLabel}>{isEditing ? '保存' : '发布'}</span>
            </button>
            <button className={`${styles.topActionBtn} ${userPath.length < 3 ? styles.btnDisabled : ''}`} onClick={handleGenerate} disabled={userPath.length < 3}>
              <img src={`${UI}/Green/Default/button_rectangle_depth_gloss.png`} alt="" className={styles.topActionBg} />
              <span className={styles.topActionLabel}>开始体验</span>
            </button>
          </div>
        </header>

        <main className={styles.drawMain}>
          <div className={`${styles.leftPanel} kenneyPanelBeige`}>
            {/* Description */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><img src={`${BGI}/book_open.png`} alt="" className={styles.sectionIcon} /><span className={styles.sectionLabel}>描述</span></div>
              <input type="text" className={styles.textInput} placeholder="小鸭子找水池..." value={textInput} onChange={e => setTextInput(e.target.value)} />
            </div>

            {/* Quick tags (multi-select) */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><img src={`${BGI}/hand.png`} alt="" className={styles.sectionIcon} /><span className={styles.sectionLabel}>添加元素</span></div>
              <div className={styles.tagGrid}>
                {QUICK_TAGS.map(t => (
                  <button key={t.key} className={`${styles.tagChip} ${selectedTags.has(t.key) ? styles.tagActive : ''}`} onClick={() => toggleTag(t.key)}>
                    <img src={t.img} alt="" className={styles.tagImg} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><img src={`${BGI}/flag_triangle.png`} alt="" className={styles.sectionIcon} /><span className={styles.sectionLabel}>风格</span></div>
              <div className={styles.styleGrid}>
                {STYLE_OPTIONS.map(s => (
                  <button key={s.key} className={`${styles.styleCard} ${selectedStyle === s.key ? styles.styleCardActive : ''}`} onClick={() => { setSelectedStyle(s.key); playClickSound(); }}>
                    <img src={s.icon} alt="" className={styles.styleCardIcon} />
                    <span className={styles.styleCardLabel}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Character */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><img src={MAZE_ASSETS.duckDown} alt="" className={styles.sectionIcon} /><span className={styles.sectionLabel}>主角</span></div>
              <div className={styles.charGrid}>
                {PLAYER_CHARACTERS.slice(0, 8).map(c => (
                  <button key={c.key} className={`${styles.charCard} ${selectedChar === c.key ? styles.charCardActive : ''}`} onClick={() => { setSelectedChar(c.key); playClickSound(); }}>
                    <img src={c.img} alt="" className={styles.charImg} />
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><img src={`${BGI}/flag_triangle.png`} alt="" className={styles.sectionIcon} /><span className={styles.sectionLabel}>终点</span></div>
              <div className={styles.charGrid}>
                {GOAL_TYPES.map(g => (
                  <button key={g.key} className={`${styles.charCard} ${selectedGoal === g.key ? styles.charCardActive : ''}`} onClick={() => { setSelectedGoal(g.key); playClickSound(); }}>
                    {g.img ? <img src={g.img} alt="" className={styles.charImg} /> : <span className={styles.poolIcon}></span>}
                    <span className={styles.charName}>{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas size */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><img src={`${BGI}/dice_3D.png`} alt="" className={styles.sectionIcon} /><span className={styles.sectionLabel}>画布</span></div>
              <div className={styles.sizeRow}>
                {Object.entries(CANVAS_SIZES).map(([k, v]) => (
                  <button key={k} className={`${styles.sizeBtn} ${canvasSize === k ? styles.sizeBtnActive : ''}`}
                    onClick={() => { setCanvasSize(k); setUserPath([]); playClickSound(); }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actionsRow}>
              <button className={styles.clearGameBtn} onClick={() => { setUserPath([]); playClickSound(); }}>
                <img src={`${UI}/Red/Double/button_rectangle_depth_flat.png`} alt="" className={styles.gameBtnBg} />
                <span className={styles.gameBtnLabel}>清除</span>
              </button>
              <button className={`${styles.generateGameBtn} ${userPath.length < 3 ? styles.btnDisabled : ''}`} onClick={handleGenerate} disabled={userPath.length < 3}>
                <img src={`${UI}/Green/Double/button_rectangle_depth_gloss.png`} alt="" className={styles.gameBtnBg} />
                <span className={styles.gameBtnLabel}>生成</span>
              </button>
            </div>
          </div>

          <div className={styles.canvasArea}>
            <div className={styles.canvasFrame}>
              <canvas ref={canvasRef} className={styles.drawCanvas}
                onMouseDown={handleDrawStart} onMouseMove={handleDrawMove} onMouseUp={handleDrawEnd} onMouseLeave={handleDrawEnd}
                onTouchStart={handleDrawStart} onTouchMove={handleDrawMove} onTouchEnd={handleDrawEnd} />
              {userPath.length === 0 && (
                <div className={styles.canvasHint}><img src={`${BGI}/hand.png`} alt="" className={styles.canvasHintIcon} /><span>拖动画路线</span></div>
              )}
            </div>
          </div>
        </main>

        {renderHelpModal()}
        <AnimatePresence>
          {publishOpen && (
            <motion.div className={styles.publishOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPublishOpen(false)}>
              <motion.div className={`${styles.publishModal} kenneyPanelFancy`} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className={styles.publishHeader}><img src={`${BGI}/flag_triangle.png`} alt="" className={styles.publishHeaderIcon} /><h3 className={styles.publishTitle}>发布迷宫</h3></div>
                <p className={styles.publishDesc}>给你的迷宫起个名字</p>
                <input type="text" className={styles.publishInput} placeholder="我的超酷迷宫" value={publishName} onChange={e => setPublishName(e.target.value)} onKeyDown={e => e.key === 'Enter' && doPublish()} autoFocus />
                <div className={styles.publishActions}>
                  <button className={styles.publishGameBtn} onClick={() => setPublishOpen(false)}><img src={`${UI}/Red/Default/button_rectangle_depth_flat.png`} alt="" className={styles.gameBtnBgSm} /><span className={styles.gameBtnLabelSm}>取消</span></button>
                  <button className={styles.publishGameBtn} onClick={doPublish}><img src={`${UI}/Green/Default/button_rectangle_depth_gloss.png`} alt="" className={styles.gameBtnBgSm} /><span className={styles.gameBtnLabelSm}>发布</span></button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>{toast && (<motion.div className={styles.toast} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>{toast}</motion.div>)}</AnimatePresence>
      </div>
    );
  }

  /* ═════ LOADING ═════ */
  if (phase === PHASE.LOADING) {
    return (
      <div className={`${styles.page} ${styles.loadingPage}`}>
        <div className={styles.bgLayer} style={{ backgroundImage: `url(${BGE}/Backgrounds/backgroundColorForest.png)` }} />
        <motion.div className={`${styles.loadingCard} kenneyPanelFancy`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className={styles.loadingSpin}><img src={`${BGI}/dice_3D.png`} alt="" className={styles.loadingDice} /></div>
          <h2 className={styles.loadingTitle}>创作中...</h2>
          <p className={styles.loadingDesc}>正在为你生成迷宫世界</p>
          <div className={styles.loadingPreviewWrap}>
            <AnimatePresence mode="wait">
              <motion.img key={loadingAssetIdx} src={LOADING_PREVIEW_ASSETS[loadingAssetIdx]} className={styles.loadingPreview}
                initial={{ opacity: 0, scale: 0.6, rotate: -15 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.6, rotate: 15 }} transition={{ duration: 0.35 }} />
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ═════ PLAY ═════ */
  return (
    <div className={styles.playWrap}>
      <MazePathGame level={generatedLevel} onBack={() => { setPhase(PHASE.DRAW); setGeneratedLevel(null); }} onPublish={handlePublish} hidePublish={isEditing} />
      <AnimatePresence>
        {publishOpen && (
          <motion.div className={styles.publishOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPublishOpen(false)}>
            <motion.div className={`${styles.publishModal} kenneyPanelFancy`} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className={styles.publishHeader}><img src={`${BGI}/flag_triangle.png`} alt="" className={styles.publishHeaderIcon} /><h3 className={styles.publishTitle}>发布迷宫</h3></div>
              <p className={styles.publishDesc}>给你的迷宫起个名字</p>
              <input type="text" className={styles.publishInput} placeholder="我的超酷迷宫" value={publishName} onChange={e => setPublishName(e.target.value)} onKeyDown={e => e.key === 'Enter' && doPublish()} autoFocus />
              <div className={styles.publishActions}>
                <button className={styles.publishGameBtn} onClick={() => setPublishOpen(false)}><img src={`${UI}/Red/Default/button_rectangle_depth_flat.png`} alt="" className={styles.gameBtnBgSm} /><span className={styles.gameBtnLabelSm}>取消</span></button>
                <button className={styles.publishGameBtn} onClick={doPublish}><img src={`${UI}/Green/Default/button_rectangle_depth_gloss.png`} alt="" className={styles.gameBtnBgSm} /><span className={styles.gameBtnLabelSm}>发布</span></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && (<motion.div className={styles.toast} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>{toast}</motion.div>)}</AnimatePresence>
    </div>
  );
}
