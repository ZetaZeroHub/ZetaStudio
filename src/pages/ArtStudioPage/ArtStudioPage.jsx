import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Image, Box, Type, ImagePlus, Wand2, Upload, X, Download,
  Heart, Star, MessageCircle, Search, ChevronDown, Trash2,
  Sparkles, Loader2, Send, Copy, Bookmark, Gamepad2, Eye,
  RotateCcw, Settings, Grid3X3, Scissors, Bone, ExternalLink,
  Layers, Package, FileImage, ChevronRight, Palette, Users,
  PanelLeft, PanelLeftClose, Edit3, Share2,
} from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import {
  COMMUNITY_ASSETS, COMMUNITY_CATEGORIES, SORT_OPTIONS,
  ART_STYLES, SIZE_PRESETS, MODEL_QUALITY, POSE_PRESETS,
  SPRITE_ASSETS, GLB_ASSETS,
} from '../../data/artCommunityData';
import GLBPreview from './GLBPreview';
import SpriteProcessor from '../SpriteEditorPage/SpriteProcessor';
import PuppetViewer from '../SpriteEditorPage/PuppetViewer';
import SpriteEditorPage from '../SpriteEditorPage/SpriteEditorPage';
import styles from './ArtStudioPage.module.css';

/* ── 2大类目 + 子模式 ── */
const CATEGORIES = [
  { key: '2d', label: '2D 素材', icon: Layers },
  { key: '3d', label: '3D 模型', icon: Package },
];

const SUB_MODES = {
  '2d': [
    { key: 'text2img', label: '文生图', icon: Type, desc: '文字描述生成 2D 图像' },
    { key: 'img2img', label: '图生图', icon: ImagePlus, desc: '参考图 + 提示词生成变体' },
    { key: 'skeleton', label: '骨骼控制', icon: Bone, desc: '姿态生成精灵图' },
  ],
  '3d': [
    { key: 'text3d', label: '文生3D', icon: Box, desc: '文字生成 3D 模型' },
    { key: 'img3d', label: '图生3D', icon: Image, desc: '参考图生成 3D 模型' },
  ],
};

/* ── 生成步骤 ── */
const GEN_STEPS_2D = ['正在理解提示词...', '生成图像变体中...', '优化细节与质量...', '后处理与导出...'];
const GEN_STEPS_3D = ['正在理解描述...', '生成粗模草稿中...', '细化几何与纹理...', '烘焙材质与法线...', '优化拓扑结构...'];
const PLACEHOLDER_COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#533483'];

const LOADING_GLYPHS = [
  '◈','◇','△','▽','◎','⬡','⬢','⬣','⟐','⟡','⊕','⊗','⊛','⊘',
  '⟁','⟐','◉','◬','⬟','⬠','⏣','⏢','⟠','⟡','✦','✧','⊹','⊸',
  'α','β','γ','δ','ε','ζ','η','θ','λ','μ','ξ','π','σ','φ','ψ','ω',
  '∮','∯','∰','⊿','⋰','⋱',
];

/* ── localStorage ── */
const LS_MY_KEY = 'zeta_my_art_assets';
const LS_LIKES = 'zeta_art_likes';
const LS_FAVS = 'zeta_art_favs';
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const loadSet = (k) => new Set(load(k, []));
const saveSet = (k, s) => save(k, [...s]);

/* ════════════════════════════════════
   ArtStudioPage — AI 美术资产平台
   ════════════════════════════════════ */
export default function ArtStudioPage() {
  const navigate = useNavigate();

  /* ── 核心状态 ── */
  const [activeTab, setActiveTab] = useState('community');
  const [category, setCategory] = useState('2d');
  const [subMode, setSubMode] = useState('text2img');

  // 创作参数
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [sizePreset, setSizePreset] = useState('1024x1024');
  const [count, setCount] = useState(4);
  const [quality, setQuality] = useState('standard');
  const [similarity, setSimilarity] = useState(70);
  const [symmetry, setSymmetry] = useState(false);
  const [selectedPose, setSelectedPose] = useState('idle');
  const [refImage, setRefImage] = useState(null);
  const refInputRef = useRef(null);

  // 生成
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [results, setResults] = useState([]);

  // 社区
  const [communityFilter, setCommunityFilter] = useState('all');
  const [communitySort, setCommunitySort] = useState('hot');
  const [communitySearch, setCommunitySearch] = useState('');
  const [likes, setLikes] = useState(() => loadSet(LS_LIKES));
  const [favs, setFavs] = useState(() => loadSet(LS_FAVS));

  // 我的
  const [myAssets, setMyAssets] = useState(() => load(LS_MY_KEY, []));
  const [detailAsset, setDetailAsset] = useState(null);
  const [commentText, setCommentText] = useState('');

  // 排队机制
  const [queuePosition, setQueuePosition] = useState(0);
  const [queueEta, setQueueEta] = useState('');

  // 全屏 loading overlay
  const [showGenOverlay, setShowGenOverlay] = useState(false);
  const [overlayGlyphs, setOverlayGlyphs] = useState([]);

  // 精灵图预处理
  const [showProcessor, setShowProcessor] = useState(false);
  const [processorInitImage, setProcessorInitImage] = useState(null);
  // 待注入到精灵图编辑器的帧数据
  const [pendingInjectFrames, setPendingInjectFrames] = useState(null);

  // AI 面板拖拽宽度 + 折叠
  const [sidebarW, setSidebarW] = useState(() => {
    const c = localStorage.getItem('art_studio_sidebar_w'); return c ? +c : 320;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarResizing = useRef(false);
  const sidebarStartX = useRef(0);
  const sidebarStartW = useRef(320);

  const startSidebarResize = useCallback((e) => {
    sidebarResizing.current = true;
    sidebarStartX.current = e.clientX;
    sidebarStartW.current = sidebarW;
    const onMove = (ev) => {
      if (!sidebarResizing.current) return;
      const delta = ev.clientX - sidebarStartX.current;
      const newW = Math.max(220, Math.min(500, sidebarStartW.current + delta));
      setSidebarW(newW);
    };
    const onUp = () => {
      sidebarResizing.current = false;
      // 用函数形式获取最新值缓存
      setSidebarW(cur => { localStorage.setItem('art_studio_sidebar_w', String(cur)); return cur; });
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [sidebarW]);

  // 保存精灵图到“我的”
  const handleSpriteToMine = useCallback((spriteData) => {
    setMyAssets(prev => {
      // 更新已有或新增
      const existing = prev.findIndex(a => a.type === 'sprite' && a.title === spriteData.title);
      let next;
      if (existing >= 0) {
        next = [...prev]; next[existing] = { ...next[existing], ...spriteData };
      } else {
        next = [spriteData, ...prev];
      }
      save(LS_MY_KEY, next);
      return next;
    });
    setActiveTab('mine');
  }, []);

  // 再编辑精灵图
  const handleEditSprite = useCallback((asset) => {
    // 加载 sprite_editor_save 并切换到编辑器
    setActiveTab('editor');
  }, []);

  /* ── category 切换时重置 subMode ── */
  useEffect(() => {
    setSubMode(SUB_MODES[category][0].key);
    setResults([]);
  }, [category]);

  /* ── 社区过滤 ── */
  const filteredCommunity = useMemo(() => {
    let list = [...COMMUNITY_ASSETS];
    console.log('[ArtStudio] 社区数据总量:', list.length,
      '| 2D Image:', list.filter(i => i.type === '2d-image').length,
      '| Sprite:', list.filter(i => i.type === '2d-sprite').length,
      '| 3D:', list.filter(i => i.type === '3d').length
    );
    if (communityFilter !== 'all') {
      list = list.filter(a => a.type === communityFilter);
      console.log('[ArtStudio] 筛选后:', communityFilter, '->', list.length, '条');
    }
    if (communitySearch.trim()) {
      const q = communitySearch.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.prompt.toLowerCase().includes(q) ||
        a.tags?.some(t => t.includes(q))
      );
    }
    switch (communitySort) {
      case 'newest': list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case 'favorites': list.sort((a, b) => b.favorites - a.favorites); break;
      case 'downloads': list.sort((a, b) => b.downloads - a.downloads); break;
      default: list.sort((a, b) => b.likes - a.likes); break;
    }
    return list;
  }, [communityFilter, communitySort, communitySearch]);

  /* ── 图片上传 ── */
  const handleRefUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRefImage({ url: URL.createObjectURL(file), file });
  };

  /* ── 选择素材库图片作为参考 ── */
  const selectSpriteAsRef = (sp) => {
    setRefImage({ url: sp.src, file: null });
    setSubMode('img2img');
    setPrompt(sp.prompt || '');
  };

  /* ── 模拟生成 ── */
  const is3DMode = subMode === 'text3d' || subMode === 'img3d';
  const needsRef = subMode === 'img2img' || subMode === 'img3d';
  const canGenerate = (() => {
    if (subMode === 'skeleton') return false;
    if (needsRef) return !!refImage;
    return prompt.trim().length > 0;
  })();

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setGenStep(0);
    setGenProgress(0);
    setResults([]);

    /* 1. 显示炫酷全屏 Loading Overlay */
    setShowGenOverlay(true);
    const particles = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      char: LOADING_GLYPHS[Math.floor(Math.random() * LOADING_GLYPHS.length)],
      x: Math.random() * 100, y: Math.random() * 100,
      size: 14 + Math.random() * 32,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
    setOverlayGlyphs(particles);

    /* 2. 排队等待阶段 */
    const fakePeople = Math.floor(Math.random() * 15) + 3;
    const etaHours = (fakePeople * 0.3 + Math.random() * 0.5).toFixed(1);
    setQueuePosition(fakePeople);
    setQueueEta(`${etaHours} 小时`);
    for (let q = fakePeople; q > 0; q--) {
      setQueuePosition(q);
      await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
    }
    setQueuePosition(0);

    /* 3. 生成进度 */
    const steps = is3DMode ? GEN_STEPS_3D : GEN_STEPS_2D;
    for (let i = 0; i < steps.length; i++) {
      setGenStep(i);
      const dur = 800 + Math.random() * 600;
      for (let s = 0; s < 10; s++) {
        await new Promise(r => setTimeout(r, dur / 10));
        setGenProgress(((i * 10 + s + 1) / (steps.length * 10)) * 100);
      }
    }

    /* 4. 创建待处理资产卡片 → 切到“我的” */
    const resultCount = is3DMode ? 1 : count;
    const newPendingAssets = Array.from({ length: resultCount }, (_, i) => ({
      id: `pending_${Date.now()}_${i}`,
      type: is3DMode ? '3d' : '2d',
      title: `${prompt.slice(0, 30) || '参考图生成'}${resultCount > 1 ? ` #${i + 1}` : ''}`,
      prompt: prompt || '(from reference)',
      style,
      color: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
      createdAt: new Date().toISOString().slice(0, 10),
      savedAt: new Date().toISOString(),
      pending: true,
      queuePosition: Math.floor(Math.random() * 20) + 5,
      queueEta: `${(Math.random() * 2 + 0.5).toFixed(1)} 小时`,
    }));

    setResults(newPendingAssets.map(a => ({ ...a, pending: false })));
    const updAssets = [...newPendingAssets, ...myAssets];
    setMyAssets(updAssets);
    save(LS_MY_KEY, updAssets);

    setShowGenOverlay(false);
    setOverlayGlyphs([]);
    setGenerating(false);
    setQueueEta('');
    setActiveTab('mine');
  }, [canGenerate, prompt, is3DMode, count, style, myAssets]);

  /* ── 资产操作 ── */
  const saveToMy = useCallback((item) => {
    const a = { ...item, id: `my_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, savedAt: new Date().toISOString() };
    const upd = [a, ...myAssets];
    setMyAssets(upd);
    save(LS_MY_KEY, upd);
  }, [myAssets]);

  const deleteMy = useCallback((id) => {
    const upd = myAssets.filter(a => a.id !== id);
    setMyAssets(upd);
    save(LS_MY_KEY, upd);
  }, [myAssets]);

  const toggleLike = useCallback((id) => {
    setLikes(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); saveSet(LS_LIKES, n); return n; });
  }, []);
  const toggleFav = useCallback((id) => {
    setFavs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); saveSet(LS_FAVS, n); return n; });
  }, []);

  /* ── 3D canvas ── */
  const canvas3dRef = useRef(null);
  const animRef = useRef(null);
  const puppetRef = useRef(null);
  useEffect(() => {
    const c = canvas3dRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width = c.offsetWidth * 2;
    const H = c.height = c.offsetHeight * 2;
    ctx.scale(2, 2);
    let angle = 0;
    const draw = () => {
      const w = W / 2, h = H / 2;
      ctx.clearRect(0, 0, w, h);
      angle += 0.008;
      const cx = w / 2, cy = h / 2, size = Math.min(w, h) * 0.25;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const cosY = Math.cos(angle * 0.7), sinY = Math.sin(angle * 0.7);
      const verts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([x,y,z]) => {
        let x2 = x*cos-z*sin, z2 = x*sin+z*cos, y2 = y*cosY-z2*sinY; z2 = y*sinY+z2*cosY;
        const s = 1.5/(3+z2); return [cx+x2*size*s, cy+y2*size*s, z2];
      });
      const faces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];
      const colors = ['rgba(255,255,255,0.06)','rgba(255,255,255,0.03)','rgba(255,255,255,0.05)','rgba(255,255,255,0.04)','rgba(255,255,255,0.07)','rgba(255,255,255,0.02)'];
      faces.map((f,i)=>({f,c:colors[i],z:f.reduce((s,v)=>s+verts[v][2],0)/4})).sort((a,b)=>a.z-b.z).forEach(({f,c})=>{
        ctx.beginPath(); ctx.moveTo(verts[f[0]][0],verts[f[0]][1]);
        for(let i=1;i<f.length;i++) ctx.lineTo(verts[f[i]][0],verts[f[i]][1]);
        ctx.closePath(); ctx.fillStyle=c; ctx.fill(); ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=0.5; ctx.stroke();
      });
      ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='10px "JetBrains Mono"'; ctx.fillText('3D Preview',8,h-8);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [results, generating, activeTab, subMode]);

  const genSteps = is3DMode ? GEN_STEPS_3D : GEN_STEPS_2D;

  /* ────────────── RENDER ────────────── */
  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.pageBody}>
        {/* ═════ 左侧面板 ═════ */}
        <aside className={styles.sidebar} style={sidebarCollapsed ? {width:0,minWidth:0,padding:0,overflow:'hidden',borderRight:'none'} : {width:sidebarW}}>
          {/* 类目切换 */}
          <div className={styles.categoryBar}>
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                className={`${styles.categoryBtn} ${category === c.key ? styles.categoryBtnActive : ''}`}
                onClick={() => setCategory(c.key)}
              >
                <c.icon size={14} strokeWidth={1.5} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* 子模式列表 */}
          <div className={styles.subModeList}>
            {SUB_MODES[category].map(m => (
              <button
                key={m.key}
                className={`${styles.subModeBtn} ${subMode === m.key ? styles.subModeBtnActive : ''}`}
                onClick={() => { setSubMode(m.key); setResults([]); }}
                title={m.desc}
              >
                <m.icon size={14} strokeWidth={1.5} />
                <span>{m.label}</span>
                <ChevronRight size={11} className={styles.subModeArrow} />
              </button>
            ))}
          </div>

          {/* ── 参数面板（按子模式动态） ── */}
          <div className={styles.paramPanel}>

            {/* ========= 文生图 / 图生图 通用参数 ========= */}
            {(subMode === 'text2img' || subMode === 'img2img') && (
              <>
                {/* 参考图 (img2img) */}
                {subMode === 'img2img' && (
                  <div className={styles.paramGroup}>
                    <div className={styles.paramLabel}><Upload size={11} /> 参考图</div>
                    {refImage ? (
                      <div className={styles.uploadedPreview}>
                        <img src={refImage.url} alt="ref" />
                        <button className={styles.uploadedClear} onClick={() => setRefImage(null)}><X size={12} /></button>
                      </div>
                    ) : (
                      <div className={styles.uploadDrop} onClick={() => refInputRef.current?.click()}>
                        <Upload size={18} strokeWidth={1.5} />
                        <span>点击上传 / 从素材库选择</span>
                      </div>
                    )}
                    <input ref={refInputRef} type="file" accept="image/*" onChange={handleRefUpload} style={{ display: 'none' }} />
                  </div>
                )}
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}><Wand2 size={11} /> 提示词</div>
                  <textarea className={styles.paramTextarea} placeholder="描述你想生成的图像..." value={prompt} onChange={e => setPrompt(e.target.value)} />
                </div>
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}><Sparkles size={11} /> 风格</div>
                  <div className={styles.styleChips}>
                    {ART_STYLES.map(s => (
                      <button key={s.key} className={`${styles.styleChip} ${style === s.key ? styles.styleChipActive : ''}`}
                        onClick={() => setStyle(s.key)}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}><Grid3X3 size={11} /> 尺寸</div>
                  <div className={styles.selectWrap}>
                    <select className={styles.selectInput} value={sizePreset} onChange={e => setSizePreset(e.target.value)}>
                      {SIZE_PRESETS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                    <ChevronDown size={12} className={styles.selectArrow} />
                  </div>
                </div>
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}><Image size={11} /> 数量</div>
                  <div className={styles.sliderRow}>
                    <input type="range" min={1} max={4} value={count} onChange={e => setCount(+e.target.value)} className={styles.sliderInput} />
                    <span className={styles.sliderValue}>{count}</span>
                  </div>
                </div>
                {subMode === 'img2img' && (
                  <div className={styles.paramGroup}>
                    <div className={styles.paramLabel}><Eye size={11} /> 相似度</div>
                    <div className={styles.sliderRow}>
                      <input type="range" min={10} max={100} value={similarity} onChange={e => setSimilarity(+e.target.value)} className={styles.sliderInput} />
                      <span className={styles.sliderValue}>{similarity}%</span>
                    </div>
                  </div>
                )}
                <button className={styles.generateBtn} onClick={handleGenerate} disabled={!canGenerate || generating}>
                  {generating ? <><Loader2 size={16} className={styles.spinning} /> 生成中...</> : <><Sparkles size={16} /> 开始生成</>}
                </button>
              </>
            )}

            {/* ========= 素材库 ========= */}
            {subMode === 'sprite-lib' && (
              <div className={styles.spriteLibPanel}>
                <div className={styles.paramLabel}><FileImage size={11} /> 官方精灵图素材</div>
                <p className={styles.spriteLibHint}>选择素材后可直接进入图生图模式，或跳转到精灵图编辑器进行预处理</p>
                <div className={styles.spriteGrid}>
                  {SPRITE_ASSETS.map(sp => (
                    <div key={sp.id} className={styles.spriteItem} onClick={() => selectSpriteAsRef(sp)}>
                      <div className={styles.spriteThumb}>
                        <img src={sp.src} alt={sp.name} />
                      </div>
                      <div className={styles.spriteItemName}>{sp.name}</div>
                      <div className={styles.spriteItemCategory}>{sp.category}</div>
                      <div className={styles.spriteItemActions}>
                        <button className={styles.spriteActionBtn} onClick={e => { e.stopPropagation(); selectSpriteAsRef(sp); }} title="用作参考图">
                          <ImagePlus size={10} />
                        </button>
                        <button className={styles.spriteActionBtn} onClick={e => { e.stopPropagation(); navigate('/sprite-editor'); }} title="去编辑器">
                          <ExternalLink size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========= 骨骼控制 ========= */}
            {subMode === 'skeleton' && (
              <>
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}><Bone size={11} /> 预设姿势</div>
                  <div className={styles.poseGrid}>
                    {POSE_PRESETS.map(p => (
                      <button key={p.key} className={`${styles.poseBtn} ${selectedPose === p.key ? styles.poseBtnActive : ''}`}
                        onClick={() => setSelectedPose(p.key)}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}><Wand2 size={11} /> 提示词</div>
                  <textarea className={styles.paramTextarea} placeholder="描述你想要的角色姿态细节..." value={prompt} onChange={e => setPrompt(e.target.value)} />
                </div>
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}><Sparkles size={11} /> 风格</div>
                  <div className={styles.styleChips}>
                    {ART_STYLES.slice(0, 4).map(s => (
                      <button key={s.key} className={`${styles.styleChip} ${style === s.key ? styles.styleChipActive : ''}`}
                        onClick={() => setStyle(s.key)}>{s.label}</button>
                    ))}
                  </div>
                </div>
                <button className={styles.generateBtn} onClick={handleGenerate} disabled={!prompt.trim() || generating}>
                  {generating ? <><Loader2 size={16} className={styles.spinning} /> 生成中...</> : <><Bone size={16} /> 生成姿态</>}
                </button>
                {/* 3D 骨骼控制面板 — 内嵌在左侧 */}
                <div className={styles.skeletonInline}>
                  <PuppetViewer ref={puppetRef} compact onPoseCapture={(pose) => {
                    console.log('[ArtStudio] Pose captured:', pose);
                  }} />
                </div>
              </>
            )}

            {/* ========= 3D 模式 ========= */}
            {(subMode === 'text3d' || subMode === 'img3d') && (
              <>
                {subMode === 'img3d' && (
                  <div className={styles.paramGroup}>
                    <div className={styles.paramLabel}><Upload size={11} /> 参考图</div>
                    {refImage ? (
                      <div className={styles.uploadedPreview}>
                        <img src={refImage.url} alt="ref" />
                        <button className={styles.uploadedClear} onClick={() => setRefImage(null)}><X size={12} /></button>
                      </div>
                    ) : (
                      <div className={styles.uploadDrop} onClick={() => refInputRef.current?.click()}>
                        <Upload size={18} strokeWidth={1.5} />
                        <span>上传参考图像</span>
                      </div>
                    )}
                    <input ref={refInputRef} type="file" accept="image/*" onChange={handleRefUpload} style={{ display: 'none' }} />
                  </div>
                )}
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}><Wand2 size={11} /> 提示词</div>
                  <textarea className={styles.paramTextarea} placeholder="描述你想生成的 3D 模型..." value={prompt} onChange={e => setPrompt(e.target.value)} />
                </div>
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}><Settings size={11} /> 模型质量</div>
                  <div className={styles.selectWrap}>
                    <select className={styles.selectInput} value={quality} onChange={e => setQuality(e.target.value)}>
                      {MODEL_QUALITY.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
                    </select>
                    <ChevronDown size={12} className={styles.selectArrow} />
                  </div>
                </div>
                <div className={styles.paramGroup}>
                  <div className={styles.paramLabel}>对称性</div>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={symmetry} onChange={e => setSymmetry(e.target.checked)} />
                    启用对称生成
                  </label>
                </div>
                <button className={styles.generateBtn} onClick={handleGenerate} disabled={!canGenerate || generating}>
                  {generating ? <><Loader2 size={16} className={styles.spinning} /> 生成中...</> : <><Sparkles size={16} /> 开始生成</>}
                </button>
              </>
            )}
          </div>
        </aside>
        {/* 侧边栏拖拽手柄 */}
        {!sidebarCollapsed && (
          <div className={styles.sidebarResizeHandle} onMouseDown={startSidebarResize} />
        )}
        {/* 折叠按钮 */}
        <button className={styles.sidebarToggle} onClick={() => setSidebarCollapsed(v => !v)}
          title={sidebarCollapsed ? '展开AI面板' : '折叠AI面板'}>
          {sidebarCollapsed ? <PanelLeft size={14}/> : <PanelLeftClose size={14}/>}
        </button>

        {/* ═════ 右侧主区域 ═════ */}
        <main className={styles.mainArea}>
          {/* ── 生成状态区（排队 / 进度 / 结果）── */}
          {(generating || results.length > 0) && (
            <div className={styles.studioContent}>
              {/* 排队等待 */}
              {generating && queuePosition > 0 && (
                <div className={styles.queueArea}>
                  <div className={styles.emptyIcon}><Users size={24} strokeWidth={1.5} /></div>
                  <div className={styles.queueText}>前方排队 <strong>{queuePosition}</strong> 人</div>
                  {queueEta && <div className={styles.queueEta}>预计等待 {queueEta} 完成</div>}
                  <div className={styles.progressBarWrap}><div className={styles.progressBarFill} style={{ width: '100%', animation: 'pulse 1.5s ease-in-out infinite' }} /></div>
                </div>
              )}
              {/* 生成进度 */}
              {generating && queuePosition === 0 && (
                <div className={styles.generating}>
                  <div className={styles.emptyIcon}><Loader2 size={28} strokeWidth={1.5} className={styles.spinning} /></div>
                  <div className={styles.genStepText}>{genSteps[genStep]}</div>
                  <div className={styles.progressBarWrap}><div className={styles.progressBarFill} style={{ width: `${genProgress}%` }} /></div>
                </div>
              )}
              {/* 2D 结果 */}
              {!generating && results.length > 0 && !is3DMode && (
                <div className={styles.resultGrid}>
                  {results.map(r => (
                    <div key={r.id} className={styles.resultCard}>
                      <div style={{ width: '100%', height: '100%', background: r.color }} />
                      <div className={styles.resultActions}>
                        <button className={styles.resultActionBtn} onClick={() => saveToMy(r)}><Download size={10} /> 保存</button>
                        <button className={styles.resultActionBtn} onClick={() => navigator.clipboard?.writeText(r.prompt)}><Copy size={10} /> 提示词</button>
                        <button className={styles.resultActionBtn} onClick={() => { setProcessorInitImage(r.src || r.color); setShowProcessor(true); }}><Scissors size={10} /> 预处理</button>
                        <button className={styles.resultActionBtn}><Gamepad2 size={10} /> 应用</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* 3D 结果 */}
              {!generating && results.length > 0 && is3DMode && (
                <div className={styles.preview3d}>
                  <canvas ref={canvas3dRef} className={styles.preview3dCanvas} />
                  <div className={styles.preview3dActions}>
                    <button className={styles.resultActionBtn} onClick={() => saveToMy(results[0])}><Download size={10} /> 保存</button>
                    <button className={styles.resultActionBtn}><RotateCcw size={10} /> 重新生成</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.tabBar}>
            {[
              { key: 'community', label: '社区' },
              { key: 'editor', label: '精灵图编辑器' },
              { key: 'mine', label: '我的' },
            ].map(t => (
              <button key={t.key} className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.key)}>
                {t.label}
                {t.key === 'mine' && myAssets.length > 0 && <span className={styles.tabCount}>{myAssets.length}</span>}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>

            {/* ── 社区 ── */}
            {activeTab === 'community' && (
              <>
                <div className={styles.communityHeader}>
                  <div className={styles.communityFilters}>
                    {COMMUNITY_CATEGORIES.map(c => (
                      <button key={c.key} className={`${styles.filterChip} ${communityFilter === c.key ? styles.filterChipActive : ''}`}
                        onClick={() => setCommunityFilter(c.key)}>{c.label}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div className={styles.communitySearch}>
                      <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <input className={styles.communitySearchInput} placeholder="搜索素材..." value={communitySearch} onChange={e => setCommunitySearch(e.target.value)} />
                    </div>
                    <select className={styles.sortSelect} value={communitySort} onChange={e => setCommunitySort(e.target.value)}>
                      {SORT_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.waterfallGrid}>
                  {filteredCommunity.map(asset => (
                    <div key={asset.id} className={styles.assetCard} onClick={() => setDetailAsset(asset)}>
                      <div className={styles.assetThumb} style={{ aspectRatio: asset.type === '3d' ? '4/3' : asset.src ? '1/1' : undefined }}>
                        {asset.type === '3d' && asset.file ? (
                          <GLBPreview src={asset.file} width={240} height={180} className={styles.assetThumbGlb} />
                        ) : asset.src ? (
                          <img src={asset.src} alt={asset.title} className={styles.assetThumbImg} />
                        ) : (
                          <div className={styles.assetThumbColor} style={{ background: asset.color || '#1a1a2e' }} />
                        )}
                        <span className={styles.assetThumbType}>
                          {asset.type === '2d-sprite' ? 'SPRITE' : asset.type === '2d-image' ? '2D' : '3D'}
                        </span>
                        {asset.type !== '3d' && !asset.src && <div className={styles.assetThumbLabel}>{asset.prompt?.slice(0, 60)}...</div>}
                        {asset.type === '3d' && asset.vertices && (
                          <span className={styles.model3dBadge}>
                            <Box size={9} /> {asset.vertices} verts
                          </span>
                        )}
                      </div>
                      <div className={styles.assetBody}>
                        <div className={styles.assetTitle}>{asset.title}</div>
                        <div className={styles.assetMeta}>
                          <span className={styles.assetAuthor}>{asset.author}</span>
                          <span>·</span>
                          <span>{asset.createdAt}</span>
                        </div>
                        <div className={styles.assetStats}>
                          <span className={styles.assetStat}><Heart size={10} /> {asset.likes}</span>
                          <span className={styles.assetStat}><Star size={10} /> {asset.favorites}</span>
                          <span className={styles.assetStat}><Download size={10} /> {asset.downloads}</span>
                        </div>
                        {asset.tags && (
                          <div className={styles.assetTags}>
                            {asset.tags.slice(0, 3).map(t => <span key={t} className={styles.assetTag}>{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── 我的 ── */}
            {activeTab === 'mine' && (
              myAssets.length === 0 ? (
                <div className={styles.myEmptyState}>
                  <div className={styles.emptyIcon}><Sparkles size={24} strokeWidth={1.5} /></div>
                  <span>还没有保存的素材</span>
                  <span className={styles.emptyHint}>生成素材后保存到这里，或从社区收藏喜欢的作品</span>
                </div>
              ) : (
                <div className={styles.myAssetsGrid}>
                  {myAssets.map(asset => (
                    <div key={asset.id}
                      className={`${styles.myAssetCard} ${asset.pending ? styles.myAssetCardPending : ''}`}
                      onClick={() => !asset.pending && setDetailAsset(asset)}>
                      <div className={styles.myAssetThumb}>
                        {asset.pending ? (
                          <div className={styles.pendingThumb}>
                            <div className={styles.pendingSkeleton} />
                            <Loader2 size={22} className={styles.pendingSpinner} />
                          </div>
                        ) : (asset.src || asset.thumbnail) ? (
                          <img src={asset.thumbnail || asset.src} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: asset.type === 'sprite' ? 'pixelated' : 'auto' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: asset.color || '#1a1a2e' }} />
                        )}
                        {!asset.pending && (
                          <div className={styles.myAssetActions}>
                            {asset.type === 'sprite' && (
                              <button className={styles.myActionBtn} onClick={e => { e.stopPropagation(); handleEditSprite(asset); }} title="再编辑">
                                <Edit3 size={11}/>
                              </button>
                            )}
                            <button className={styles.myActionBtn} onClick={e => { e.stopPropagation(); /* TODO: publish */ }} title="发布到社区">
                              <Share2 size={11}/>
                            </button>
                            <button className={styles.myActionBtn} onClick={e => { e.stopPropagation(); deleteMy(asset.id); }} title="删除">
                              <Trash2 size={11}/>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className={styles.myAssetBody}>
                        <div className={styles.myAssetTitle}>{asset.title}</div>
                        {asset.pending ? (
                          <div className={styles.pendingInfo}>
                            <span className={styles.pendingQueue}>⏳ 排队 {asset.queuePosition} 人</span>
                            <span className={styles.pendingEta}>预计 {asset.queueEta}</span>
                          </div>
                        ) : (
                          <div className={styles.myAssetDate}>
                            {asset.type === 'sprite' && <span style={{marginRight:6,fontSize:'0.625rem',color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{asset.frameCount}帧 · {asset.canvasSize}px</span>}
                            {asset.savedAt?.slice(0, 10) || asset.createdAt}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            {/* ── 精灵图编辑器（内嵌） ── */}
            {activeTab === 'editor' && (
              <div className={styles.embeddedEditor}>
                <SpriteEditorPage embedded pendingFrames={pendingInjectFrames} onPendingConsumed={() => setPendingInjectFrames(null)} onSaveToMine={handleSpriteToMine} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ═════ 详情弹窗 ═════ */}
      {detailAsset && (
        <div className={styles.detailOverlay} onClick={() => setDetailAsset(null)}>
          <div className={styles.detailModal} onClick={e => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <span className={styles.detailHeaderTitle}>素材详情</span>
              <button className={styles.detailCloseBtn} onClick={() => setDetailAsset(null)}><X size={16} /></button>
            </div>
            <div className={styles.detailBody}>
              <div className={styles.detailPreview}>
                {detailAsset.type === '3d' && detailAsset.file ? (
                  <GLBPreview src={detailAsset.file} width={480} height={360} className={styles.detailGlbPreview} />
                ) : detailAsset.src ? (
                  <img src={detailAsset.src} alt={detailAsset.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <div className={styles.detailPreviewColor} style={{ background: detailAsset.color || '#1a1a2e' }} />
                )}
              </div>
              <div className={styles.detailInfo}>
                <div className={styles.detailTitle}>{detailAsset.title}</div>
                {detailAsset.author && (
                  <div className={styles.detailAuthorRow}>
                    <div className={styles.detailAuthorBadge}>{detailAsset.author?.charAt(0)}</div>
                    <span>{detailAsset.author}</span>
                    {detailAsset.license && <span className={styles.licenseBadge}>{detailAsset.license}</span>}
                    <span className={styles.detailDate}>{detailAsset.createdAt}</span>
                  </div>
                )}

                {/* 3D 模型信息 */}
                {detailAsset.vertices && (
                  <div className={styles.modelInfoRow}>
                    <span>顶点: {detailAsset.vertices}</span>
                    <span>格式: {detailAsset.format}</span>
                  </div>
                )}

                <div className={styles.detailInteractRow}>
                  <button className={`${styles.interactBtn} ${likes.has(detailAsset.id) ? styles.interactBtnActive : ''}`}
                    onClick={() => toggleLike(detailAsset.id)}><Heart size={13} /> {(detailAsset.likes || 0) + (likes.has(detailAsset.id) ? 1 : 0)}</button>
                  <button className={`${styles.interactBtn} ${favs.has(detailAsset.id) ? styles.interactBtnActive : ''}`}
                    onClick={() => toggleFav(detailAsset.id)}><Bookmark size={13} /> 收藏</button>
                  <button className={styles.interactBtn} onClick={() => saveToMy(detailAsset)}><Download size={13} /> 下载</button>
                  {(detailAsset.type === '2d-sprite' || detailAsset.type === '2d-image') && detailAsset.src && (
                    <button className={`${styles.interactBtn} ${styles.interactBtnPrimary}`}
                      onClick={() => { setProcessorInitImage(detailAsset.src); setDetailAsset(null); setShowProcessor(true); }}><Scissors size={13} /> 去预处理</button>
                  )}
                  <button className={`${styles.interactBtn} ${styles.interactBtnPrimary}`}><Gamepad2 size={13} /> 应用到游戏</button>
                </div>

                {detailAsset.prompt && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailSectionLabel}><Wand2 size={11} /> {detailAsset.type === '3d' ? '描述' : '提示词'}</div>
                    <div className={styles.detailPromptText}>{detailAsset.prompt}</div>
                  </div>
                )}

                {detailAsset.tags?.length > 0 && (
                  <div className={styles.detailTags}>
                    {detailAsset.tags.map(t => <span key={t} className={styles.detailTag}>{t}</span>)}
                  </div>
                )}

                {detailAsset.comments && (
                  <div className={styles.commentsSection}>
                    <div className={styles.detailSectionLabel}><MessageCircle size={11} /> 评论 ({detailAsset.comments.length})</div>
                    {detailAsset.comments.map((c, i) => (
                      <div key={i} className={styles.commentItem}>
                        <div className={styles.commentAvatar}>{c.user?.charAt(0)}</div>
                        <div className={styles.commentBody}>
                          <span className={styles.commentUser}>{c.user}</span>
                          <span className={styles.commentText}>{c.text}</span>
                          <span className={styles.commentTime}>{c.time}</span>
                        </div>
                      </div>
                    ))}
                    <div className={styles.commentInput}>
                      <input className={styles.commentInputField} placeholder="写下你的评论..."
                        value={commentText} onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && commentText.trim()) setCommentText(''); }} />
                      <button className={styles.commentSendBtn} onClick={() => { if (commentText.trim()) setCommentText(''); }}><Send size={13} /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════ 精灵图预处理弹窗 ═════ */}
      {showProcessor && (
        <div className={styles.processorOverlay} onClick={() => setShowProcessor(false)}>
          <div className={styles.processorDrawer} onClick={e => e.stopPropagation()}>
            <div className={styles.processorDrawerHeader}>
              <span><Scissors size={16} /> 精灵图预处理</span>
              <button className={styles.detailCloseBtn} onClick={() => setShowProcessor(false)}><X size={16} /></button>
            </div>
            <div className={styles.processorDrawerBody}>
              <SpriteProcessor canvasSize={64} initialImage={processorInitImage} onInjectFrames={(newFrames) => {
                console.log('[ArtStudio] 预处理完成，注入帧数:', newFrames.length);
                // 通过 state 传递帧数据给嵌入的精灵图编辑器
                setPendingInjectFrames(newFrames);
                setShowProcessor(false);
                setProcessorInitImage(null);
                // 切换到精灵图编辑器 tab
                setActiveTab('editor');
              }} />
            </div>
          </div>
        </div>
      )}
      {/* ═════ 炫酷生成 Loading Overlay ═════ */}
      {showGenOverlay && (
        <div className={styles.genOverlay}>
          <div className={styles.genOverlayBg}>
            {overlayGlyphs.map(g => (
              <span key={g.id} className={styles.genGlyph}
                style={{
                  left: `${g.x}%`, top: `${g.y}%`,
                  fontSize: `${g.size}px`,
                  animationDuration: `${g.duration}s`,
                  animationDelay: `${g.delay}s`,
                }}>{g.char}</span>
            ))}
          </div>
          <div className={styles.genOverlayContent}>
            <div className={styles.genOverlayIcon}>
              <Loader2 size={40} className={styles.spinning} />
            </div>
            <div className={styles.genOverlayTitle}>AI 正在创作中</div>
            {queuePosition > 0 ? (
              <div className={styles.genOverlayStatus}>
                <span>前方排队 <strong>{queuePosition}</strong> 人</span>
                {queueEta && <span className={styles.genOverlayEta}>预计等待 {queueEta}</span>}
              </div>
            ) : (
              <div className={styles.genOverlayStatus}>
                <span>{(is3DMode ? GEN_STEPS_3D : GEN_STEPS_2D)[genStep]}</span>
              </div>
            )}
            <div className={styles.genOverlayProgress}>
              <div className={styles.genOverlayProgressFill} style={{ width: `${queuePosition > 0 ? 15 : genProgress}%` }} />
            </div>
            <div className={styles.genOverlayHint}>生成完成后将自动跳转到「我的」</div>
          </div>
        </div>
      )}
    </div>
  );
}
