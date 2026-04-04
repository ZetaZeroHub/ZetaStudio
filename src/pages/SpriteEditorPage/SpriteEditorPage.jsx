import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, Download, Play, Pause,
  Pencil, Eraser, PaintBucket, Pipette,
  Minus, RotateCcw, FlipHorizontal, FlipVertical,
  Plus, Eye, EyeOff, Lock, Unlock, Trash2,
  Sparkles, Wand2, Check, ChevronRight, ChevronDown, Scissors,
  ZoomIn, ZoomOut, Layers, ArrowRight, X, CheckSquare,
  Heart, Copy, MessageCircle, ImageDown, Package, ThumbsUp, HelpCircle,
} from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import PuppetViewer from './PuppetViewer';
import SpriteProcessor from './SpriteProcessor';
import useThemeStore from '../../stores/themeStore';
import styles from './SpriteEditorPage.module.css';

/* ── 调色板 ── */
const PALETTES = {
  pico8:   { name: 'PICO-8',   colors: ['#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa'] },
  nes:     { name: 'NES',      colors: ['#000000','#fcfcfc','#f83800','#f87858','#a84400','#fca044','#e4a030','#f8d878','#00a844','#4cdc48','#0078f8','#3cbcfc','#6844fc','#b8b8f8','#d800cc','#f878f8'] },
  gameboy: { name: 'Game Boy', colors: ['#0f380f','#306230','#8bac0f','#9bbc0f'] },
};
const CANVAS_SIZES = [16, 32, 64, 128, 256, 512, 1024];
const TOOLS = [
  { id: 'pencil', icon: Pencil, label: '铅笔 (B)', help: '在画布上绘制像素，按住拖动可连续绘画' },
  { id: 'eraser', icon: Eraser, label: '橡皮 (E)', help: '擦除像素为透明，按住拖动可连续擦除' },
  { id: 'bucket', icon: PaintBucket, label: '填充 (G)', help: '点击区域填充颜色或擦除背景\n• 填充模式：用当前色填充相同色块\n• 擦除模式：将背景变透明\n• 容差：值越大，相近颜色也会被一起处理' },
  { id: 'picker', icon: Pipette, label: '取色 (I)', help: '点击画布上的像素拾取该颜色' },
  { id: 'line',   icon: Minus,  label: '直线 (L)', help: '点击起点并拖动到终点，松开绘制直线' },
];

/* 预置示例素材 — 用户可直接加载到画布 */
/* ── 素材库数据 ── */
const OFFICIAL_ASSETS = [
  // ── 人物 (3) ──
  { id: 'knight', name: '铠甲骑士', src: '/sprites/knight_sheet.png', type: 'official', category: '人物', needsProcess: true, likes: 256,
    prompt: 'Pixel art sprite sheet of an armored knight character, 4x4 grid showing idle, walk cycle, sword swing attack, and getting hit animations. Clean pixel art, 32px per frame, pure solid white (#FFFFFF) background, retro 16-bit RPG style.' },
  { id: 'mage', name: '紫袍法师', src: '/sprites/mage_sheet.png', type: 'official', category: '人物', needsProcess: true, likes: 198,
    prompt: 'Pixel art sprite sheet of a cute female mage with purple robes and staff, 4x4 grid showing 16 frames: idle, casting, walking, teleport, defeated. 32x32 per frame. Pure solid white (#FFFFFF) background. Clean pixel art, fantasy RPG style.' },
  { id: 'ninja', name: '暗影忍者', src: '/sprites/ninja_sheet.png', type: 'official', category: '人物', needsProcess: true, likes: 174,
    prompt: 'Pixel art sprite sheet of a dark ninja character, 4x3 grid showing 12 frames: stealth idle, running cycle, shuriken throw, jump flip, dodge roll. 32x32 per frame. Pure solid white (#FFFFFF) background. Clean pixel art.' },
  // ── 动物 (2) ──
  { id: 'cat', name: '橘猫', src: '/sprites/cat_sheet.png', type: 'official', category: '动物', needsProcess: true, likes: 312,
    prompt: 'Pixel art sprite sheet of a cute orange tabby cat, 4x3 grid showing 12 frames: sitting, walking, running, sleeping curled up, meowing. 32x32 per frame. Pure solid white (#FFFFFF) background. Clean pixel art, cute game style.' },
  { id: 'wolf', name: '灰狼', src: '/sprites/wolf_sheet.png', type: 'official', category: '动物', needsProcess: true, likes: 189,
    prompt: 'Pixel art sprite sheet of a grey wolf, 4x3 grid showing 12 frames: idle, walking, running, howling, attack bite, resting. 32x32 per frame. Pure solid white (#FFFFFF) background. Clean pixel art, RPG style.' },
  // ── 场景/物品 (6) ──
  { id: 'tree_wind', name: '风中之树', src: '/sprites/tree_wind_sheet.png', type: 'official', category: '场景', needsProcess: true, likes: 267,
    prompt: 'Pixel art sprite sheet of an oak tree swaying in wind, 4x2 grid showing 8 frames of breeze sway cycle. 64x64 per frame. Pure solid white (#FFFFFF) background. Clean pixel art, nature tileset style.' },
  { id: 'campfire', name: '野营篝火', src: '/sprites/campfire_sheet.png', type: 'official', category: '场景', needsProcess: true, likes: 234,
    prompt: 'Pixel art sprite sheet of a campfire, 4x2 grid showing 8 frames of flickering fire with rising embers. 32x32 per frame. Pure solid white (#FFFFFF) background. Clean pixel art, RPG prop style.' },
  { id: 'waterfall', name: '飞流瀑布', src: '/sprites/waterfall_sheet.png', type: 'official', category: '场景', needsProcess: true, likes: 203,
    prompt: 'Pixel art sprite sheet of a waterfall cascading down rocks, 4x2 grid showing 8 frames of flowing water animation. 64x64 per frame. Pure solid white (#FFFFFF) background. Clean pixel art, nature tileset.' },
  { id: 'treasure', name: '魔法宝箱', src: '/sprites/treasure_chest_sheet.png', type: 'official', category: '物品', needsProcess: true, likes: 345,
    prompt: 'Pixel art sprite sheet of a treasure chest opening sequence with gold coins, 4x2 grid showing 8 frames. 32x32 per frame. Pure solid white (#FFFFFF) background. Clean pixel art, RPG loot style.' },
  { id: 'crystal', name: '魔力水晶', src: '/sprites/crystal_sheet.png', type: 'official', category: '物品', needsProcess: true, likes: 278,
    prompt: 'Pixel art sprite sheet of a glowing crystal gem, 4x2 grid showing 8 frames of pulsing glow shifting blue to purple. 32x32 per frame. Pure solid white (#FFFFFF) background. Clean pixel art, RPG collectible.' },
  { id: 'flag', name: '王国战旗', src: '/sprites/flag_sheet.png', type: 'official', category: '物品', needsProcess: true, likes: 156,
    prompt: 'Pixel art sprite sheet of a medieval red banner flag on a pole waving in wind, 4x2 grid showing 8 frames. 32x64 per frame. Pure solid white (#FFFFFF) background. Clean pixel art, castle game style.' },
];
const COMMUNITY_ASSETS = [
];

/* ── 工具函数 ── */
function hexToRgba(hex) { return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255]; }
function rgbaToHex(r,g,b) { return '#'+[r,g,b].map(c=>c.toString(16).padStart(2,'0')).join(''); }

function floodFill(data,size,sx,sy,fill,tolerance=0) {
  const out=new Uint8Array(data);
  const gi=(x,y)=>(y*size+x)*4;
  const si=gi(sx,sy),tR=out[si],tG=out[si+1],tB=out[si+2],tA=out[si+3];
  if(tR===fill[0]&&tG===fill[1]&&tB===fill[2]&&tA===fill[3]) return out;
  // 颜色距离判断（欧氏距离）
  const tol2 = tolerance * tolerance;
  const match = (i) => {
    if (tolerance === 0) return out[i]===tR&&out[i+1]===tG&&out[i+2]===tB&&out[i+3]===tA;
    const dr=out[i]-tR, dg=out[i+1]-tG, db=out[i+2]-tB, da=out[i+3]-tA;
    return (dr*dr+dg*dg+db*db+da*da) <= tol2;
  };
  const stack=[[sx,sy]],visited=new Uint8Array(size*size);
  while(stack.length){
    const[x,y]=stack.pop();if(x<0||x>=size||y<0||y>=size)continue;
    const vi=y*size+x;if(visited[vi])continue;visited[vi]=1;
    const i=gi(x,y);if(!match(i))continue;
    out[i]=fill[0];out[i+1]=fill[1];out[i+2]=fill[2];out[i+3]=fill[3];
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  return out;
}

/* 从图片文件加载像素数据到指定大小画布 */
function loadImageToPixels(imgSrc, targetSize) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = targetSize; c.height = targetSize;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      const id = ctx.getImageData(0, 0, targetSize, targetSize);
      resolve(new Uint8Array(id.data));
    };
    img.onerror = () => resolve(new Uint8Array(targetSize * targetSize * 4));
    img.src = imgSrc;
  });
}

/* 程序化生成对称像素角色 */
function generateCharacter(size, seed) {
  const d = new Uint8Array(size*size*4);
  const rng=(s)=>{s=Math.sin(s)*43758.5453;return s-Math.floor(s);};
  const colors=[[245,90,70],[60,180,120],[80,130,240],[240,180,40],[180,80,200],[60,190,210]];
  const bc=colors[Math.floor(rng(seed+1)*colors.length)];
  const half=Math.floor(size/2);
  for(let y=Math.floor(size*0.15);y<Math.floor(size*0.88);y++){
    for(let x=Math.floor(size*0.25);x<=half;x++){
      if(rng(seed+x*100+y)>0.42){
        const mx=size-1-x;
        [[x,y],[mx,y]].forEach(([px,py])=>{
          const i=(py*size+px)*4;
          d[i]=bc[0];d[i+1]=bc[1];d[i+2]=bc[2];d[i+3]=255;
        });
      }
    }
  }
  const ey=Math.floor(size*0.32),el=Math.floor(size*0.38),er=size-1-el;
  [el,er].forEach(ex=>{const i=(ey*size+ex)*4;d[i]=240;d[i+1]=240;d[i+2]=245;d[i+3]=255;});
  return d;
}

function drawCheckerboard(ctx, size, isLight = false) {
  const c1 = isLight ? '#f5f5f5' : '#0f0f0f';
  const c2 = isLight ? '#e0e0e0' : '#141414';
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    ctx.fillStyle=(x+y)%2===0 ? c1 : c2;
    ctx.fillRect(x,y,1,1);
  }
}

/* 纯函数：图层合成 - 零闭包依赖 */
function doComposite(frame, layerList, cs) {
  if (!frame?.layerData) return frame?.data || new Uint8Array(cs*cs*4);
  const size = cs * cs * 4;
  const out = new Uint8Array(size);
  for (let li = 0; li < layerList.length; li++) {
    const layer = layerList[li];
    if (!layer.visible) continue;
    const ld = frame.layerData[layer.id];
    if (!ld) continue;
    const iterLen = Math.min(size, ld.length);
    for (let i = 0; i < iterLen; i += 4) {
      const srcA = ld[i+3];
      if (srcA === 0) continue;
      if (srcA === 255 || out[i+3] === 0) {
        out[i] = ld[i]; out[i+1] = ld[i+1]; out[i+2] = ld[i+2]; out[i+3] = srcA;
      } else {
        const dstA = out[i+3];
        const sa = srcA / 255, da = dstA / 255;
        const outA = sa + da * (1 - sa);
        if (outA > 0) {
          out[i]   = Math.round((ld[i]   * sa + out[i]   * da * (1 - sa)) / outA);
          out[i+1] = Math.round((ld[i+1] * sa + out[i+1] * da * (1 - sa)) / outA);
          out[i+2] = Math.round((ld[i+2] * sa + out[i+2] * da * (1 - sa)) / outA);
          out[i+3] = Math.round(outA * 255);
        }
      }
    }
  }
  return out;
}

export default function SpriteEditorPage({ embedded = false, pendingFrames = null, onPendingConsumed = null, onSaveToMine = null }) {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  /* ═══ 同步从 localStorage 恢复所有编辑器状态（避免 useEffect 时序问题）═══ */
  const savedRef = useRef(null);
  if (savedRef.current === null) {
    try {
      const raw = localStorage.getItem('sprite_editor_save');
      savedRef.current = raw ? JSON.parse(raw) : {};
    } catch(e) { savedRef.current = {}; }
  }
  const _saved = savedRef.current;

  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const puppetRef = useRef(null);

  const [canvasSize, setCanvasSize] = useState(() => _saved.canvasSize || 128);
  const canvasSizeRef = useRef(canvasSize);
  canvasSizeRef.current = canvasSize;
  const [zoom, setZoom] = useState(() => {
    const s = _saved.canvasSize || 128;
    return s<=32?12:s<=64?8:s<=128?4:2;
  });
  const [activeTool, setActiveTool] = useState('pencil');
  const [currentColor, setCurrentColor] = useState('#F5F5F5');
  const [paletteId, setPaletteId] = useState(() => _saved.paletteId || 'pico8');
  const [projectName, setProjectName] = useState(() => _saved.name || '未命名精灵');
  const [statusMsg, setStatusMsg] = useState('');
  const [showProcessor, setShowProcessor] = useState(false);
  const [skeletonExpanded, setSkeletonExpanded] = useState(false);
  const [processorInitImage, setProcessorInitImage] = useState(null);

  /* 画笔粗细 */
  const [brushSize, setBrushSize] = useState(1);
  const [bucketErase, setBucketErase] = useState(false);
  const [fillTolerance, setFillTolerance] = useState(0);

  /* 批量多选帧 */
  const [selectedFrames, setSelectedFrames] = useState(new Set());

  /* 画布平移 */
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const spaceDown = useRef(false);

  /* 可拖拽面板宽度（缓存） */
  const [leftPanelW, setLeftPanelW] = useState(()=>{
    const c = localStorage.getItem('sprite_editor_left_w'); return c ? +c : 200;
  });
  const [rightPanelW, setRightPanelW] = useState(()=>{
    const c = localStorage.getItem('sprite_editor_right_w'); return c ? +c : 280;
  });
  /* 素材详情弹窗 */
  const [detailAsset, setDetailAsset] = useState(null);
  const resizingPanel = useRef(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  const [layers, setLayers] = useState(() => _saved.layers || [{ id:'l1', name:'主图层', visible:true, locked:false }]);
  const [activeLayer, setActiveLayer] = useState(0);

  /* 帧状态：同步初始化，确保 canvasSize 和 layerData 尺寸一致 */
  const [frames, setFrames] = useState(() => {
    const cs = _saved.canvasSize || 256;
    const lyrs = _saved.layers || [{ id:'l1', name:'主图层', visible:true, locked:false }];
    if (_saved.frames?.length) {
      return _saved.frames.map(f => {
        const ld = {};
        if (f.layerData) Object.keys(f.layerData).forEach(k => { ld[k] = new Uint8Array(f.layerData[k]); });
        return {...f, data: new Uint8Array(f.data), layerData: Object.keys(ld).length > 0 ? ld : {l1: new Uint8Array(f.data)}};
      });
    }
    // 没存档 → 创建初始帧，canvasSize 已同步确定
    const emptyLD = {};
    lyrs.forEach(l => { emptyLD[l.id] = new Uint8Array(cs*cs*4); });
    return [{
      id: `f${Date.now()}`, name: 'frame_0', isKey: true, source: 'manual',
      data: new Uint8Array(cs*cs*4), layerData: emptyLD
    }];
  });
  const [activeFrame, setActiveFrame] = useState(0);

  /* helper: 获取当前图层的id */
  const activeLayerId = layers[activeLayer]?.id || 'l1';
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(() => _saved.fps || 8);
  const playTimer = useRef(null);

  /* ── 从父组件接收待注入帧（社区预处理器等） ── */
  useEffect(() => {
    if (!pendingFrames || !Array.isArray(pendingFrames) || pendingFrames.length === 0) return;
    const cs = canvasSizeRef.current;
    const lid = layers[0]?.id || 'l1';
    const wrappedFrames = pendingFrames.map((f, i) => {
      let pixelData = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data);
      // 检测源数据的实际尺寸，如果与编辑器 canvasSize 不一致则缩放
      const srcSize = Math.round(Math.sqrt(pixelData.length / 4));
      if (srcSize > 0 && srcSize !== cs) {
        // 用临时 canvas 缩放像素数据
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = srcSize; srcCanvas.height = srcSize;
        const srcCtx = srcCanvas.getContext('2d');
        const srcImgData = srcCtx.createImageData(srcSize, srcSize);
        srcImgData.data.set(pixelData.slice(0, srcSize * srcSize * 4));
        srcCtx.putImageData(srcImgData, 0, 0);
        const dstCanvas = document.createElement('canvas');
        dstCanvas.width = cs; dstCanvas.height = cs;
        const dstCtx = dstCanvas.getContext('2d');
        dstCtx.imageSmoothingEnabled = false;
        dstCtx.drawImage(srcCanvas, 0, 0, cs, cs);
        pixelData = new Uint8Array(dstCtx.getImageData(0, 0, cs, cs).data);
      }
      const emptyLD = {};
      layers.forEach(l => { emptyLD[l.id] = new Uint8Array(cs * cs * 4); });
      emptyLD[lid] = pixelData;
      return {
        id: f.id || `proc_${Date.now()}_${i}`,
        name: f.name || `sprite_${i}`,
        isKey: f.isKey ?? (i === 0),
        source: f.source || 'processed',
        data: doComposite({ layerData: emptyLD }, layers, cs),
        layerData: emptyLD,
      };
    });
    setFrames(prev => [...prev, ...wrappedFrames]);
    console.log(`[SpriteEditor] 已注入预处理帧: ${wrappedFrames.length}`);
    if (onPendingConsumed) onPendingConsumed();
  }, [pendingFrames]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 空格键 = 平移模式 ── */
  useEffect(() => {
    const down = (e) => { if (e.code === 'Space' && !e.repeat) { spaceDown.current = true; e.preventDefault(); } };
    const up = (e) => { if (e.code === 'Space') { spaceDown.current = false; isPanning.current = false; } };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  /* ── 滚轮缩放 ── */
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      setZoom(z => {
        const next = Math.max(0.25, Math.min(z + delta * (z < 2 ? 0.25 : z < 4 ? 0.5 : 1), 32));
        return Math.round(next * 4) / 4;
      });
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  /* ── 面板拖拽调整 ── */
  useEffect(() => {
    const handleMove = (e) => {
      if (!resizingPanel.current) return;
      const dx = e.clientX - resizeStartX.current;
      if (resizingPanel.current === 'left') {
        setLeftPanelW(Math.max(140, Math.min(400, resizeStartW.current + dx)));
      } else {
        setRightPanelW(Math.max(200, Math.min(500, resizeStartW.current - dx)));
      }
    };
    const handleUp = () => {
      resizingPanel.current = null; document.body.style.cursor = ''; document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, []);

  const startResize = useCallback((panel, e) => {
    resizingPanel.current = panel;
    resizeStartX.current = e.clientX;
    resizeStartW.current = panel === 'left' ? leftPanelW : rightPanelW;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [leftPanelW, rightPanelW]);

  /* 面板宽度缓存：值变化时写入 localStorage */
  useEffect(() => {
    localStorage.setItem('sprite_editor_left_w', String(leftPanelW));
    localStorage.setItem('sprite_editor_right_w', String(rightPanelW));
  }, [leftPanelW, rightPanelW]);

  /* 素材库统一状态 */
  const [assets, setAssets] = useState([...OFFICIAL_ASSETS, ...COMMUNITY_ASSETS]);
  const [assetFilter, setAssetFilter] = useState('all'); // all | ai | community | official
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const palette = PALETTES[paletteId] || PALETTES.pico8;
  const showStatus = useCallback((msg,ms=2500)=>{setStatusMsg(msg);setTimeout(()=>setStatusMsg(''),ms);},[]);

  /* ── 画布渲染（合成所有可见图层） ── */
  const renderCanvas = useCallback(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');
    canvas.width=canvasSize;canvas.height=canvasSize;
    drawCheckerboard(ctx,canvasSize,isLight);
    const frame=frames[activeFrame];
    if(frame){
      const composited = doComposite(frame, layers, canvasSizeRef.current);
      const imgData=ctx.createImageData(canvasSize,canvasSize);
      for(let i=0;i<composited.length;i+=4){
        if(composited[i+3]>0){
          imgData.data[i]=composited[i];imgData.data[i+1]=composited[i+1];
          imgData.data[i+2]=composited[i+2];imgData.data[i+3]=composited[i+3];
        }
      }
      const tc=document.createElement('canvas');tc.width=canvasSize;tc.height=canvasSize;
      tc.getContext('2d').putImageData(imgData,0,0);
      ctx.drawImage(tc,0,0);
    }
  },[frames,activeFrame,canvasSize,layers,isLight]);
  useEffect(()=>{renderCanvas();},[renderCanvas]);

  /* ── 鼠标 → 像素 ── */
  const getPixelPos = useCallback((e)=>{
    const c=canvasRef.current;if(!c)return null;
    const r=c.getBoundingClientRect();
    const cs=canvasSizeRef.current;
    const px=Math.floor((e.clientX-r.left)*cs/r.width);
    const py=Math.floor((e.clientY-r.top)*cs/r.height);
    return(px>=0&&px<cs&&py>=0&&py<cs)?{x:px,y:py}:null;
  },[]);

  const setPixel = useCallback((x,y,color,size=1)=>{
    if(layers[activeLayer]?.locked){showStatus('图层已锁定');return;}
    const lid = activeLayerId;
    setFrames(prev=>{
      const cs = canvasSizeRef.current;
      const nf=[...prev];const f={...nf[activeFrame]};
      const ld = {...(f.layerData||{})};
      const d=new Uint8Array(ld[lid] || new Uint8Array(cs*cs*4));
      const half=Math.floor(size/2);
      for(let dy=-half;dy<size-half;dy++){
        for(let dx=-half;dx<size-half;dx++){
          const px=x+dx,py=y+dy;
          if(px>=0&&px<cs&&py>=0&&py<cs){
            const i=(py*cs+px)*4;
            d[i]=color[0];d[i+1]=color[1];d[i+2]=color[2];d[i+3]=color[3];
          }
        }
      }
      ld[lid]=d;nf[activeFrame]={...f,layerData:ld,data:doComposite({...f,layerData:ld},layers,canvasSizeRef.current)};
      return nf;
    });
  },[activeFrame,activeLayerId,layers,activeLayer,showStatus]);

  const drawLine = useCallback((x0,y0,x1,y1,color,size=1)=>{
    if(layers[activeLayer]?.locked)return;
    const lid = activeLayerId;
    const ps=[];const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0);
    const sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx-dy;
    while(true){ps.push([x0,y0]);if(x0===x1&&y0===y1)break;
    const e2=2*err;if(e2>-dy){err-=dy;x0+=sx;}if(e2<dx){err+=dx;y0+=sy;}}
    setFrames(prev=>{
    const cs = canvasSizeRef.current;
    const nf=[...prev];const f={...nf[activeFrame]};
    const ld = {...(f.layerData||{})};
    const d=new Uint8Array(ld[lid] || new Uint8Array(cs*cs*4));
    const half=Math.floor(size/2);
    ps.forEach(([lx,ly])=>{
      for(let bdy=-half;bdy<size-half;bdy++){
        for(let bdx=-half;bdx<size-half;bdx++){
          const px=lx+bdx,py=ly+bdy;
          if(px>=0&&px<cs&&py>=0&&py<cs){
            const i=(py*cs+px)*4;
            d[i]=color[0];d[i+1]=color[1];d[i+2]=color[2];d[i+3]=color[3];
          }
        }
      }
    });
    ld[lid]=d;nf[activeFrame]={...f,layerData:ld,data:doComposite({...f,layerData:ld},layers,canvasSizeRef.current)};return nf;});
  },[activeFrame,activeLayerId,layers,activeLayer]);

  const handleMouseDown = useCallback((e)=>{
    e.preventDefault();
    if(spaceDown.current)return;
    const pos=getPixelPos(e);if(!pos)return;const{x,y}=pos;const rgba=hexToRgba(currentColor);
    if(activeTool==='pencil'){isDrawing.current=true;lastPos.current=pos;setPixel(x,y,rgba,brushSize);}
    else if(activeTool==='eraser'){isDrawing.current=true;lastPos.current=pos;setPixel(x,y,[0,0,0,0],brushSize);}
    else if(activeTool==='bucket'){if(layers[activeLayer]?.locked){showStatus('图层已锁定');return;}const fillColor=bucketErase?[0,0,0,0]:rgba;const lid=activeLayerId;setFrames(prev=>{const cs=canvasSizeRef.current;const nf=[...prev];const f={...nf[activeFrame]};const ld={...(f.layerData||{})};const srcData=ld[lid]||new Uint8Array(cs*cs*4);ld[lid]=floodFill(srcData,cs,x,y,fillColor,fillTolerance);nf[activeFrame]={...f,layerData:ld,data:doComposite({...f,layerData:ld},layers,canvasSizeRef.current)};return nf;});}
    else if(activeTool==='picker'){const cs=canvasSizeRef.current;const f=frames[activeFrame];if(f){const comp=doComposite(f,layers,canvasSizeRef.current);const i=(y*cs+x)*4;if(comp[i+3]>0){setCurrentColor(rgbaToHex(comp[i],comp[i+1],comp[i+2]));showStatus(`取色: ${rgbaToHex(comp[i],comp[i+1],comp[i+2])}`);}}}
    else if(activeTool==='line'){isDrawing.current=true;lastPos.current=pos;}
  },[getPixelPos,currentColor,activeTool,setPixel,activeFrame,frames,showStatus,brushSize,bucketErase,fillTolerance,layers,activeLayer,activeLayerId]);

  const handleMouseMove = useCallback((e)=>{
    e.preventDefault();
    if(!isDrawing.current)return;const pos=getPixelPos(e);if(!pos)return;
    if(activeTool==='pencil'){if(lastPos.current)drawLine(lastPos.current.x,lastPos.current.y,pos.x,pos.y,hexToRgba(currentColor),brushSize);lastPos.current=pos;}
    else if(activeTool==='eraser'){if(lastPos.current)drawLine(lastPos.current.x,lastPos.current.y,pos.x,pos.y,[0,0,0,0],brushSize);lastPos.current=pos;}
  },[getPixelPos,currentColor,activeTool,drawLine,brushSize]);

  const handleMouseUp = useCallback((e)=>{
    if(!isDrawing.current)return;
    if(activeTool==='line'&&lastPos.current){const pos=getPixelPos(e);if(pos)drawLine(lastPos.current.x,lastPos.current.y,pos.x,pos.y,hexToRgba(currentColor),brushSize);}
    isDrawing.current=false;lastPos.current=null;
  },[activeTool,getPixelPos,drawLine,currentColor,brushSize]);

  /* ── 快捷键 ── */
  useEffect(()=>{
    const h=(e)=>{
      if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
      ({b:'pencil',e:'eraser',g:'bucket',i:'picker',l:'line'}[e.key.toLowerCase()]&&setActiveTool({b:'pencil',e:'eraser',g:'bucket',i:'picker',l:'line'}[e.key.toLowerCase()]));
    };
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  },[]);

  /* ── 帧管理 ── */
  const addFrame = useCallback(()=>{
    const cs = canvasSizeRef.current;
    const emptyLD = {}; layers.forEach(l => { emptyLD[l.id] = new Uint8Array(cs*cs*4); });
    setFrames(prev=>[...prev,{id:`f${Date.now()}`,name:`frame_${prev.length}`,isKey:false,source:'manual',data:new Uint8Array(cs*cs*4),layerData:emptyLD}]);
    setActiveFrame(frames.length);showStatus('已新增帧');
  },[frames.length,showStatus,layers]);
  const duplicateFrame = useCallback(()=>{
    const cur=frames[activeFrame];if(!cur)return;
    const newLD = {};
    if(cur.layerData) Object.keys(cur.layerData).forEach(k => { newLD[k] = new Uint8Array(cur.layerData[k]); });
    setFrames(prev=>{const nf=[...prev];nf.splice(activeFrame+1,0,{...cur,id:`f${Date.now()}`,name:`${cur.name}_cp`,data:new Uint8Array(cur.data),layerData:newLD});return nf;});
    setActiveFrame(activeFrame+1);showStatus('已复制帧');
  },[frames,activeFrame,showStatus]);
  const deleteFrame = useCallback((idx)=>{
    setFrames(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      // 用 updater 调整 activeFrame，避免闭包过期
      setActiveFrame(af => Math.min(af, next.length - 1));
      return next;
    });
    showStatus('已删除帧');
  },[showStatus]);

  /* ── 图层 ── */
  const addLayer = useCallback(()=>{
    const newId = `l${Date.now()}`;
    setLayers(prev=>[...prev,{id:newId,name:`图层 ${prev.length+1}`,visible:true,locked:false}]);
    // 为每一帧添加新图层的空像素数据
    setFrames(prev=>prev.map(f=>({
      ...f,
      layerData:{...(f.layerData||{}), [newId]:new Uint8Array(canvasSize*canvasSize*4)}
    })));
    showStatus('已新增图层');
  },[showStatus,canvasSize]);
  const toggleVis = useCallback((i)=>{
    setLayers(prev=>{
      const n=[...prev];n[i]={...n[i],visible:!n[i].visible};
      const newLayers = n;
      setFrames(fPrev => fPrev.map(f => ({...f, data: doComposite(f, newLayers, canvasSizeRef.current)})));
      return n;
    });
  },[]);
  const toggleLock = useCallback((i)=>{setLayers(prev=>{const n=[...prev];n[i]={...n[i],locked:!n[i].locked};return n;});},[]);
  const deleteLayer = useCallback((i)=>{
    if(layers.length<=1)return;
    const removedId = layers[i].id;
    setLayers(prev=>prev.filter((_,j)=>j!==i));
    // 从每一帧中删除该图层的像素数据，并重新合成
    const remainingLayers = layers.filter((_,j)=>j!==i);
    setFrames(prev=>prev.map(f=>{
      const ld = {...(f.layerData||{})};
      delete ld[removedId];
      return {...f,layerData:ld,data:doComposite({...f,layerData:ld},remainingLayers,canvasSizeRef.current)};
    }));
    if(activeLayer>=layers.length-1)setActiveLayer(Math.max(0,layers.length-2));
    showStatus('已删除图层');
  },[layers,activeLayer,showStatus]);

  /* ── 变换 ── */
  const flipH = useCallback(()=>{const cs=canvasSizeRef.current;const lid=activeLayerId;setFrames(prev=>{const nf=[...prev];const f={...nf[activeFrame]};const ld={...(f.layerData||{})};const d=ld[lid];if(!d)return prev;const o=new Uint8Array(d.length);for(let y=0;y<cs;y++)for(let x=0;x<cs;x++){const s=(y*cs+x)*4,t=(y*cs+(cs-1-x))*4;o[t]=d[s];o[t+1]=d[s+1];o[t+2]=d[s+2];o[t+3]=d[s+3];}ld[lid]=o;nf[activeFrame]={...f,layerData:ld,data:doComposite({...f,layerData:ld},layers,canvasSizeRef.current)};return nf;});showStatus('水平翻转');},[activeFrame,showStatus,activeLayerId,layers]);
  const flipV = useCallback(()=>{const cs=canvasSizeRef.current;const lid=activeLayerId;setFrames(prev=>{const nf=[...prev];const f={...nf[activeFrame]};const ld={...(f.layerData||{})};const d=ld[lid];if(!d)return prev;const o=new Uint8Array(d.length);for(let y=0;y<cs;y++)for(let x=0;x<cs;x++){const s=(y*cs+x)*4,t=((cs-1-y)*cs+x)*4;o[t]=d[s];o[t+1]=d[s+1];o[t+2]=d[s+2];o[t+3]=d[s+3];}ld[lid]=o;nf[activeFrame]={...f,layerData:ld,data:doComposite({...f,layerData:ld},layers,canvasSizeRef.current)};return nf;});showStatus('垂直翻转');},[activeFrame,showStatus,activeLayerId,layers]);
  const rotate90 = useCallback(()=>{const cs=canvasSizeRef.current;const lid=activeLayerId;setFrames(prev=>{const nf=[...prev];const f={...nf[activeFrame]};const ld={...(f.layerData||{})};const d=ld[lid];if(!d)return prev;const o=new Uint8Array(d.length);for(let y=0;y<cs;y++)for(let x=0;x<cs;x++){const s=(y*cs+x)*4,t=(x*cs+(cs-1-y))*4;o[t]=d[s];o[t+1]=d[s+1];o[t+2]=d[s+2];o[t+3]=d[s+3];}ld[lid]=o;nf[activeFrame]={...f,layerData:ld,data:doComposite({...f,layerData:ld},layers,canvasSizeRef.current)};return nf;});showStatus('旋转 90°');},[activeFrame,showStatus,activeLayerId,layers]);

  /* ── 分辨率切换 ── */
  const changeSize = useCallback((s)=>{
    setCanvasSize(s);
    setFrames(prev=>prev.map(f=>{
      const newLD = {}; layers.forEach(l => { newLD[l.id] = new Uint8Array(s*s*4); });
      return {...f,data:new Uint8Array(s*s*4),layerData:newLD};
    }));
    setActiveFrame(0);
    setZoom(s<=32?12:s<=64?8:s<=128?4:2);
    showStatus(`画布: ${s}×${s}`);
  },[showStatus,layers]);

  /* ── 播放 ── */
  useEffect(()=>{
    if(isPlaying&&frames.length>1){playTimer.current=setInterval(()=>setActiveFrame(p=>(p+1)%frames.length),1000/fps);}
    return()=>{if(playTimer.current)clearInterval(playTimer.current);};
  },[isPlaying,frames.length,fps]);

  /* ── 导出 ── */
  const exportPNG = useCallback(()=>{
    const ec=document.createElement('canvas');ec.width=canvasSize;ec.height=canvasSize;
    const ctx=ec.getContext('2d');const f=frames[activeFrame];
    if(f){const comp=doComposite(f,layers,canvasSizeRef.current);const id=ctx.createImageData(canvasSize,canvasSize);id.data.set(comp);ctx.putImageData(id,0,0);}
    ec.toBlob(b=>{const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`${projectName}_${frames[activeFrame]?.name||'frame'}.png`;a.click();URL.revokeObjectURL(u);});
    showStatus('已导出 PNG');
  },[frames,activeFrame,canvasSize,projectName,showStatus,layers]);

  const exportSheet = useCallback(()=>{
    const ec=document.createElement('canvas');ec.width=canvasSize*frames.length;ec.height=canvasSize;
    const ctx=ec.getContext('2d');frames.forEach((f,i)=>{const comp=doComposite(f,layers,canvasSizeRef.current);const id=ctx.createImageData(canvasSize,canvasSize);id.data.set(comp);const tc=document.createElement('canvas');tc.width=canvasSize;tc.height=canvasSize;tc.getContext('2d').putImageData(id,0,0);ctx.drawImage(tc,i*canvasSize,0);});
    ec.toBlob(b=>{const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`${projectName}_sheet.png`;a.click();URL.revokeObjectURL(u);});
    showStatus('已导出 Spritesheet');
  },[frames,canvasSize,projectName,showStatus,layers]);

  /* ── 保存/读取 ── */
  const handleSave = useCallback(()=>{
    const cs = canvasSizeRef.current;
    const saveFrames = frames.map(f=>{
      const ld = {};
      if(f.layerData) Object.keys(f.layerData).forEach(k => { ld[k] = Array.from(f.layerData[k]); });
      return {...f, data: Array.from(f.data), layerData: ld};
    });
    const saveData = {name:projectName,canvasSize:cs,fps,paletteId,frames:saveFrames,layers,savedAt:new Date().toISOString()};
    localStorage.setItem('sprite_editor_save',JSON.stringify(saveData));
    // 生成第一帧缩略图作为封面
    if (onSaveToMine && frames.length > 0) {
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = cs; thumbCanvas.height = cs;
      const tCtx = thumbCanvas.getContext('2d');
      const tId = tCtx.createImageData(cs, cs);
      tId.data.set(frames[0].data);
      tCtx.putImageData(tId, 0, 0);
      // 合成序列条图作为封面（最多显示前8帧）
      const previewCount = Math.min(frames.length, 8);
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = cs * previewCount; sheetCanvas.height = cs;
      const sCtx = sheetCanvas.getContext('2d');
      frames.slice(0, previewCount).forEach((f, i) => {
        const c2 = document.createElement('canvas'); c2.width = cs; c2.height = cs;
        const ctx2 = c2.getContext('2d');
        const id2 = ctx2.createImageData(cs, cs); id2.data.set(f.data); ctx2.putImageData(id2, 0, 0);
        sCtx.drawImage(c2, i * cs, 0);
      });
      onSaveToMine({
        id: `sprite_${Date.now()}`,
        title: projectName,
        type: 'sprite',
        thumbnail: thumbCanvas.toDataURL('image/png'),
        sheet: sheetCanvas.toDataURL('image/png'),
        frameCount: frames.length,
        canvasSize: cs,
        fps,
        savedAt: new Date().toISOString(),
      });
    }
    showStatus('已保存');
  },[projectName,canvasSize,fps,paletteId,frames,layers,showStatus,onSaveToMine]);




  /* ── 注入项目 ── */
  const handleInject = useCallback(()=>{
    const ec=document.createElement('canvas');ec.width=canvasSize*frames.length;ec.height=canvasSize;
    const ctx=ec.getContext('2d');frames.forEach((f,i)=>{const comp=doComposite(f,layers,canvasSizeRef.current);const id=ctx.createImageData(canvasSize,canvasSize);id.data.set(comp);const tc=document.createElement('canvas');tc.width=canvasSize;tc.height=canvasSize;tc.getContext('2d').putImageData(id,0,0);ctx.drawImage(tc,i*canvasSize,0);});
    const dataUrl=ec.toDataURL('image/png');
    const existing=JSON.parse(localStorage.getItem('custom_sprites')||'[]');
    existing.push({id:`sprite_${Date.now()}`,name:projectName,nameZh:projectName,category:'custom',categoryZh:'自定义',path:dataUrl,icon:'🎨',tags:['custom'],frameCount:frames.length,frameWidth:canvasSize,frameHeight:canvasSize,fps,createdAt:new Date().toISOString()});
    localStorage.setItem('custom_sprites',JSON.stringify(existing));
    showStatus(`"${projectName}" 已注入素材库`);
  },[frames,canvasSize,projectName,fps,showStatus,layers]);

  /* ═════════════════════════════
     AI 一键生成 → 结果入库
     ═════════════════════════════ */
  const aiGenerate = useCallback(async ()=>{
    if(!aiPrompt.trim()||aiGenerating) return;
    setAiGenerating(true);
    showStatus('AI 生成中…');

    // 插入骨架占位
    const placeholderId = `gen_${Date.now()}`;
    setAssets(prev => [...prev, {
      id: placeholderId, name: aiPrompt.slice(0, 12), src: '', type: 'ai',
      prompt: aiPrompt, likes: 0, status: 'generating',
    }]);

    // 模拟 1.5s 延迟
    await new Promise(r=>setTimeout(r,1500));

    // 生成结果替换占位
    const data = generateCharacter(canvasSize, Date.now());
    const tc = document.createElement('canvas'); tc.width = canvasSize; tc.height = canvasSize;
    const ctx = tc.getContext('2d'); const id = ctx.createImageData(canvasSize, canvasSize);
    id.data.set(data); ctx.putImageData(id, 0, 0);
    const src = tc.toDataURL('image/png');

    setAssets(prev => prev.map(a => a.id === placeholderId ? {
      ...a, src, status: 'ready', data, needsProcess: false,
    } : a));
    setAiGenerating(false);
    showStatus(`已生成 → 已加入素材库`);
  },[aiPrompt,aiGenerating,canvasSize,showStatus]);

  /* 素材库交互 */
  const handleAssetLike = useCallback((assetId) => {
    setAssets(prev => prev.map(a => a.id === assetId ? {...a, likes: a.likes + 1} : a));
  }, []);
  const handleCopyPrompt = useCallback((prompt) => {
    navigator.clipboard?.writeText(prompt).then(() => showStatus('提示词已复制'));
  }, [showStatus]);

  /* 素材智能路由：小图直接加载，大图弹预处理 */
  /* 素材点击 → 打开详情弹窗 */
  const handleAssetClick = useCallback((asset)=>{
    if (asset.status === 'generating') return;
    setDetailAsset(asset);
  },[]);

  /* 详情弹窗：直接使用 */
  const handleDirectUse = useCallback(async ()=>{
    if (!detailAsset) return;
    setDetailAsset(null);
    showStatus(`加载 "${detailAsset.name}"…`);
    try {
      if (detailAsset.data) {
        const pixData = new Uint8Array(detailAsset.data);
        setFrames(prev=>{const nf=[...prev];const f={...nf[activeFrame]};const ld={...(f.layerData||{})};ld[activeLayerId]=pixData;nf[activeFrame]={...f,layerData:ld,data:doComposite({...f,layerData:ld},layers,canvasSizeRef.current),source:'ai'};return nf;});
      } else {
        const data = await loadImageToPixels(detailAsset.src, canvasSize);
        setFrames(prev=>{const nf=[...prev];const f={...nf[activeFrame]};const ld={...(f.layerData||{})};ld[activeLayerId]=data;nf[activeFrame]={...f,layerData:ld,data:doComposite({...f,layerData:ld},layers,canvasSizeRef.current),source:'sample'};return nf;});
      }
      showStatus(`"${detailAsset.name}" 已加载到画布`);
    } catch(e) {
      console.error('[handleDirectUse]', e);
      showStatus('加载失败');
    }
  },[detailAsset,activeFrame,canvasSize,showStatus,activeLayerId,layers]);

  /* 详情弹窗：预处理后使用 */
  const handlePreprocessUse = useCallback(()=>{
    if (!detailAsset) return;
    setProcessorInitImage(detailAsset.src);
    setDetailAsset(null);
    setShowProcessor(true);
    showStatus(`已打开预处理 — ${detailAsset.name}`);
  },[detailAsset,showStatus]);

  /* 骨骼回调 */
  const handlePoseCapture = useCallback((pose)=>{
    const data=generateCharacter(canvasSize,Date.now());
    const emptyLD = {}; layers.forEach(l => { emptyLD[l.id] = new Uint8Array(canvasSize*canvasSize*4); });
    emptyLD[activeLayerId] = data;
    setFrames(prev=>[...prev,{id:`f${Date.now()}`,name:`pose_${prev.length}`,isKey:true,source:'ai',data,layerData:emptyLD}]);
    setActiveFrame(frames.length);
    showStatus('已捕获 Pose → 生成帧');
  },[canvasSize,frames.length,showStatus]);

  const handleActionSelect = useCallback(async (actionKey)=>{
    setAiGenerating(true);
    showStatus(`生成 "${actionKey}" 动画…`);
    await new Promise(r=>setTimeout(r,1200));
    const base=frames[activeFrame]?.data||new Uint8Array(canvasSize*canvasSize*4);
    const count={idle:2,walk:4,run:4,jump:3,attack:4,hit:2}[actionKey]||4;
    const newFrames=[];
    for(let i=0;i<count;i++){
      const oy=Math.round(Math.sin(i*Math.PI/count)*3);
      const r=new Uint8Array(canvasSize*canvasSize*4);
      for(let y=0;y<canvasSize;y++) for(let x=0;x<canvasSize;x++){
        const sy=y-oy;if(sy>=0&&sy<canvasSize){const si=(sy*canvasSize+x)*4,di=(y*canvasSize+x)*4;r[di]=base[si];r[di+1]=base[si+1];r[di+2]=base[si+2];r[di+3]=base[si+3];}
      }
      const emptyLD = {}; layers.forEach(l => { emptyLD[l.id] = new Uint8Array(canvasSize*canvasSize*4); });
      emptyLD[activeLayerId] = r;
      newFrames.push({id:`f${Date.now()}_${i}`,name:`${actionKey}_${i}`,isKey:i===0,source:'ai',data:r,layerData:emptyLD});
    }
    setFrames(prev=>[...prev,...newFrames]);
    setAiGenerating(false);
    showStatus(`已生成 ${count} 帧 "${actionKey}" 动作`);
  },[frames,activeFrame,canvasSize,showStatus]);

  /* ── 帧缩略图 ── */
  const renderThumb = useCallback((data)=>{
    const c=document.createElement('canvas');c.width=canvasSize;c.height=canvasSize;
    const ctx=c.getContext('2d');const id=ctx.createImageData(canvasSize,canvasSize);id.data.set(data);ctx.putImageData(id,0,0);return c.toDataURL();
  },[canvasSize]);

  const animations = useMemo(()=>{
    const g={};frames.forEach(f=>{const p=f.name.split('_')[0]||'default';if(!g[p])g[p]={id:p,name:p,count:0};g[p].count++;});
    return Object.values(g);
  },[frames]);

  /* ══════════ RENDER ══════════ */
  return (
    <>
      {!embedded && <Navbar />}
      <div className={styles.page} style={embedded ? { height: '100%', marginTop: 0 } : undefined}>
        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          {TOOLS.map(t=>(
            <div key={t.id} className={styles.toolWrap}>
              <button className={`${styles.toolBtn} ${activeTool===t.id?styles.toolBtnActive:''}`} title={t.label} onClick={()=>setActiveTool(t.id)}>
                <t.icon size={15} strokeWidth={1.5}/>
              </button>
              <div className={styles.toolHelpBubble}>
                <div className={styles.toolHelpTitle}>{t.label}</div>
                <div className={styles.toolHelpText}>{t.help}</div>
              </div>
            </div>
          ))}
          <div className={styles.toolDivider}/>
          <button className={styles.toolBtn} title="水平翻转" onClick={flipH}><FlipHorizontal size={15} strokeWidth={1.5}/></button>
          <button className={styles.toolBtn} title="垂直翻转" onClick={flipV}><FlipVertical size={15} strokeWidth={1.5}/></button>
          <button className={styles.toolBtn} title="旋转90°" onClick={rotate90}><RotateCcw size={15} strokeWidth={1.5}/></button>
          <div className={styles.toolDivider}/>
          <button className={styles.toolBtn} title="放大" onClick={()=>setZoom(z=>Math.min(z+(z<2?0.5:z<4?1:2),32))}><ZoomIn size={15} strokeWidth={1.5}/></button>
          <button className={styles.toolBtn} title="缩小" onClick={()=>setZoom(z=>Math.max(z-(z<=2?0.25:z<=4?0.5:1),0.25))}><ZoomOut size={15} strokeWidth={1.5}/></button>
          <div className={styles.toolDivider}/>
          <div style={{position:'relative'}}>
            <input type="color" value={currentColor} onChange={e=>setCurrentColor(e.target.value)} style={{position:'absolute',width:22,height:22,opacity:0,cursor:'pointer'}}/>
            <div style={{width:22,height:22,background:currentColor,borderRadius:2,border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer'}} title={currentColor}/>
          </div>
          <div className={styles.toolDivider}/>
          <div className={styles.brushSizeControl}>
            <span className={styles.brushSizeLabel}>{brushSize}</span>
            <input type="range" min="1" max="16" value={brushSize} onChange={e=>setBrushSize(+e.target.value)} className={styles.brushSizeSlider} title={`画笔大小: ${brushSize}px`}/>
          </div>
          {activeTool==='bucket' && (
            <>
              <div className={styles.toolDivider}/>
              <div className={styles.bucketModeSwitch}>
                <button
                  className={`${styles.bucketModeBtn} ${!bucketErase ? styles.bucketModeBtnActive : ''}`}
                  onClick={() => setBucketErase(false)} title="填充当前色">
                  <PaintBucket size={13}/>
                </button>
                <button
                  className={`${styles.bucketModeBtn} ${bucketErase ? styles.bucketModeBtnActive : ''}`}
                  onClick={() => setBucketErase(true)} title="擦除为透明">
                  <Eraser size={13}/>
                </button>
              </div>
              <div className={styles.bucketToleranceCol}>
                <span className={styles.bucketToleranceValue}>{fillTolerance}</span>
                <input type="range" min="0" max="128" value={fillTolerance}
                  onChange={e => setFillTolerance(+e.target.value)}
                  className={styles.brushSizeSlider} title={`色彩容差: ${fillTolerance}\n容差越大，相近颜色也被一起处理`}/>
                <span className={styles.bucketToleranceLabel}>差</span>
              </div>
              {/* 填充模式帮助气泡 */}
              <div className={styles.toolWrap}>
                <button className={styles.toolHelpTrigger}>
                  <HelpCircle size={12} strokeWidth={1.5}/>
                </button>
                <div className={styles.toolHelpBubble}>
                  <div className={styles.toolHelpTitle}>填充工具说明</div>
                  <div className={styles.toolHelpText}>
                    {bucketErase ? '当前: 擦除背景模式' : '当前: 填充颜色模式'}{"\n"}
                    {bucketErase ? '点击背景区域将其变为透明' : '点击区域用当前色填充'}{"\n\n"}
                    容差={fillTolerance}{"\n"}
                    {fillTolerance === 0 ? '只处理完全相同的颜色' : `颜色差异≤${fillTolerance}的像素都会被处理`}{"\n"}
                    适合清除AI生成图的杂色背景
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Main Body (vertical: content row + timeline) ── */}
        <div className={styles.mainBody}>
          <div className={styles.contentRow}>

        {/* ── Sidebar ── */}
        <div className={styles.sidebar} style={{width:leftPanelW}}>
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span className={styles.sideSectionTitle}>帧 ({frames.length})</span>
              <div style={{display:'flex',gap:3,alignItems:'center'}}>
                {selectedFrames.size>0&&(
                  <button className={styles.sideSectionAdd} title={`删除已选 ${selectedFrames.size} 帧`}
                    onClick={()=>{
                      setFrames(prev=>{
                        const next=prev.filter((_,i)=>!selectedFrames.has(i));
                        if(next.length===0)return prev;
                        setActiveFrame(af=>Math.min(af,next.length-1));
                        return next;
                      });
                      setSelectedFrames(new Set());
                      showStatus(`已删除 ${selectedFrames.size} 帧`);
                    }}
                    style={{color:'var(--accent-danger,#ff3b30)'}}>
                    <Trash2 size={9}/><span style={{fontSize:'0.6rem',marginLeft:2}}>{selectedFrames.size}</span>
                  </button>
                )}
                <button className={styles.sideSectionAdd} title="复制帧" onClick={duplicateFrame}><Layers size={9}/></button>
                <button className={styles.sideSectionAdd} title="新增帧" onClick={addFrame}><Plus size={11}/></button>
              </div>
            </div>
            <div className={styles.frameList}>
              {frames.map((frame,idx)=>{
                const isSel = selectedFrames.has(idx);
                return (
                  <div key={frame.id}
                    className={`${styles.frameItem} ${idx===activeFrame?styles.frameItemActive:''} ${isSel?styles.frameItemSelected:''}`}
                    onClick={(e)=>{
                      if(e.ctrlKey||e.metaKey){
                        setSelectedFrames(prev=>{
                          const next=new Set(prev);
                          next.has(idx)?next.delete(idx):next.add(idx);
                          return next;
                        });
                      } else {
                        if(!isPlaying)setActiveFrame(idx);
                        setSelectedFrames(new Set());
                      }
                    }}>
                    <div className={styles.frameThumbnail}>
                      {isSel && <div className={styles.frameCheckmark}><CheckSquare size={10}/></div>}
                      {frame.data.some(v=>v>0)?<img src={renderThumb(frame.data)} alt="" style={{width:'100%',height:'100%',imageRendering:'pixelated'}}/>:<span style={{fontSize:8,color:'var(--text-muted)'}}>{idx+1}</span>}
                    </div>
                    <div className={styles.frameInfo}>
                      <div className={styles.frameName}>{frame.name}</div>
                      <div className={styles.frameSource}>{frame.source==='ai'?'🤖 AI':frame.source==='sample'?'📦 素材':'✏️ 手绘'}</div>
                    </div>
                    {frame.isKey&&<div className={styles.keyframeBadge}/>}
                    {frames.length>1&&<button className={styles.frameDeleteBtn} onClick={e=>{e.stopPropagation();deleteFrame(idx);}}><Trash2 size={9}/></button>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.sideSection}>
            <div className={styles.sideSectionHeader}>
              <span className={styles.sideSectionTitle}>图层 ({layers.length})</span>
              <button className={styles.sideSectionAdd} onClick={addLayer}><Plus size={11}/></button>
            </div>
            <div className={styles.frameList}>
              {layers.map((layer,idx)=>(
                <div key={layer.id} className={`${styles.layerItem} ${idx===activeLayer?styles.layerItemActive:''}`} onClick={()=>setActiveLayer(idx)}>
                  <span className={styles.layerVisibility} onClick={e=>{e.stopPropagation();toggleVis(idx);}}>{layer.visible?<Eye size={11}/>:<EyeOff size={11}/>}</span>
                  <span style={{flex:1}}>{layer.name}</span>
                  <span className={styles.layerVisibility} onClick={e=>{e.stopPropagation();toggleLock(idx);}}>{layer.locked?<Lock size={10}/>:<Unlock size={10}/>}</span>
                  {layers.length>1&&<button className={styles.frameDeleteBtn} onClick={e=>{e.stopPropagation();deleteLayer(idx);}}><Trash2 size={9}/></button>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Left Resize Handle ── */}
        <div className={styles.resizeHandle} onMouseDown={e=>startResize('left',e)}/>

        {/* ── Canvas ── */}
        <div className={styles.canvasArea} ref={canvasContainerRef}
          onMouseDown={e=>{
            if(spaceDown.current||e.button===1){
              isPanning.current=true;
              panStart.current={x:e.clientX-panOffset.x,y:e.clientY-panOffset.y};
              e.preventDefault();
            }
          }}
          onMouseMove={e=>{
            if(isPanning.current){
              setPanOffset({x:e.clientX-panStart.current.x,y:e.clientY-panStart.current.y});
            }
          }}
          onMouseUp={()=>{isPanning.current=false;}}
        >
          <div className={styles.canvasGrid}/>
          {/* ── 顶部播放栏 + 工具条 ── */}
          <div className={styles.canvasTopBarWrap}>
            {/* 动画播放栏 */}
            {frames.length > 0 && (
              <div className={`${styles.playerBar} ${isPlaying ? styles.playerBarPlaying : ''}`}>
                <div className={styles.playerBarPreview}>
                  {frames[activeFrame]?.data.some(v=>v>0) ? (
                    <img src={renderThumb(frames[activeFrame].data)} alt="preview"
                      style={{width:'100%',height:'100%',imageRendering:'pixelated'}}/>
                  ) : (
                    <span style={{fontSize:8,color:'var(--text-muted)'}}>{activeFrame+1}</span>
                  )}
                </div>
                <button className={styles.playerBarPlayBtn} onClick={()=>setIsPlaying(!isPlaying)} title={isPlaying?'暂停':'播放'}>
                  {isPlaying ? <Pause size={11}/> : <Play size={11} style={{marginLeft:1}}/>}
                </button>
                <div className={styles.playerBarTrack}>
                  {frames.map((frame,idx)=>(
                    <div key={frame.id}
                      className={`${styles.playerBarFrame} ${idx===activeFrame ? styles.playerBarFrameActive : ''}`}
                      onClick={()=>{if(!isPlaying)setActiveFrame(idx);}}
                      title={frame.name}>
                      {frame.data.some(v=>v>0) ? (
                        <img src={renderThumb(frame.data)} alt="" style={{width:'100%',height:'100%',imageRendering:'pixelated'}}/>
                      ) : (
                        <span style={{fontSize:6,color:'var(--text-muted)'}}>{idx+1}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.playerBarMeta}>
                  <span className={styles.playerBarFps}>
                    <input type="number" value={fps} onChange={e=>setFps(Math.max(1,Math.min(30,+e.target.value||8)))} min={1} max={30}/>
                    fps
                  </span>
                  <span style={{fontSize:'0.6rem',color:'var(--text-muted)',fontFamily:'var(--font-mono)'}}>{activeFrame+1}/{frames.length}</span>
                </div>
              </div>
            )}
            {/* 工具条 */}
            <div className={styles.canvasTopBar}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <input className={styles.projectName} value={projectName} onChange={e=>setProjectName(e.target.value)}/>
                <select className={styles.sizeSelector} value={canvasSize} onChange={e=>changeSize(+e.target.value)}>
                  {CANVAS_SIZES.map(s=><option key={s} value={s}>{s}×{s}</option>)}
                </select>
                {statusMsg&&<span className={styles.statusMsg}>{statusMsg}</span>}
              </div>
              <div className={styles.canvasTopBarRight}>
                <button className={styles.topBtn} onClick={exportPNG}><Download size={12}/><span>导出帧</span></button>
                <button className={styles.topBtn} onClick={exportSheet}><Download size={12}/><span>导出表</span></button>
                <button className={`${styles.topBtn} ${styles.topBtnPrimary}`} onClick={handleSave}><Save size={12}/><span>保存</span></button>
              </div>
            </div>
          </div>
          <div style={{transform:`translate(${panOffset.x}px,${panOffset.y}px)`,willChange:'transform'}}>
            <canvas ref={canvasRef} className={styles.pixelCanvas}
              style={{width:canvasSize*zoom,height:canvasSize*zoom,cursor:spaceDown.current?'grab':'crosshair'}}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
              onMouseLeave={()=>{isDrawing.current=false;lastPos.current=null;}}/>
          </div>
          <span className={styles.canvasZoomLabel}>{canvasSize}×{canvasSize} · {zoom < 1 ? zoom.toFixed(2) : zoom}x</span>
        </div>

        {/* ── Right Resize Handle ── */}
        <div className={styles.resizeHandle} onMouseDown={e=>startResize('right',e)}/>

        {/* ── AI Panel (一栏式心流面板) ── */}
        <div className={styles.aiPanel} style={{width:rightPanelW}}>
          <div className={styles.aiPanelContent}>

            {/* ❶ AI 文生精灵 */}
            <div className={styles.aiBlock}>
              <div className={styles.aiBlockTitle}><Sparkles size={11}/> AI 文生精灵</div>
              <textarea className={styles.aiTextarea} value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="描述角色外观，例如: 一只戴红色围巾的白色猫咪" rows={2}/>
              <button className={styles.aiGenerateBtn} onClick={aiGenerate} disabled={aiGenerating||!aiPrompt.trim()}>
                {aiGenerating?<><span className={styles.genSpinner}/>生成中…</>:<><Wand2 size={12}/>一键生成</>}
              </button>
            </div>

            {/* ❷ 素材库（统一分类） */}
            <div className={styles.aiBlock}>
              <div className={styles.aiBlockTitle}>素材库</div>
              <div className={styles.filterPills}>
                {[['all','全部'],['ai','AI生成'],['community','社区'],['official','官方']].map(([k,label])=>(
                  <button key={k} className={`${styles.filterPill} ${assetFilter===k?styles.filterPillActive:''}`} onClick={()=>setAssetFilter(k)}>{label}</button>
                ))}
              </div>
              <div className={styles.sampleGrid}>
                {assets.filter(a => assetFilter==='all' || a.type===assetFilter).map(a=>(
                  <div key={a.id} className={`${styles.assetCard} ${a.status==='generating'?styles.assetCardGenerating:''}`}>
                    {a.status==='generating' ? (
                      <div className={styles.assetSkeleton}>
                        <span className={styles.skeletonPulse}/>
                        <span className={styles.skeletonLabel}>生成中…</span>
                      </div>
                    ) : (
                      <>
                        <div className={styles.assetThumb} onClick={()=>handleAssetClick(a)} title={`点击查看 "${a.name}"`}>
                          <img src={a.src} alt={a.name}/>
                          {a.needsProcess && <span className={styles.assetBadge}><Scissors size={7}/></span>}
                          <span className={styles.assetTypeBadge} data-type={a.type}>{a.type==='ai'?'AI':a.type==='community'?'社区':'官方'}</span>
                          <div className={styles.assetOverlay}>
                            <button className={styles.overlayBtn} onClick={e=>{e.stopPropagation();handleAssetLike(a.id)}} title="点赞"><Heart size={12}/></button>
                            {a.prompt && <button className={styles.overlayBtn} onClick={e=>{e.stopPropagation();handleCopyPrompt(a.prompt)}} title="复制提示词"><Copy size={11}/></button>}
                          </div>
                        </div>
                        <div className={styles.assetMeta}>
                          <span className={styles.assetName}>{a.name}</span>
                          <span className={styles.assetLikes}><Heart size={9}/> {a.likes||0}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ❸ 骨骼姿态控制（折叠区） */}
            <div className={styles.aiBlock}>
              <div className={styles.aiBlockTitleCollapsible} onClick={()=>setSkeletonExpanded(!skeletonExpanded)}>
                <span><Layers size={11}/> 骨骼姿态控制</span>
                <ChevronDown size={12} style={{transform:skeletonExpanded?'rotate(180deg)':'rotate(0)',transition:'transform 0.2s'}}/>
              </div>
              {skeletonExpanded&&(
                <div className={styles.collapseBody}>
                  <PuppetViewer ref={puppetRef} onPoseCapture={(pose)=>{
                    // 骨骼捕获 → 生成到素材库
                    const data = generateCharacter(canvasSize, Date.now());
                    const tc = document.createElement('canvas'); tc.width=canvasSize; tc.height=canvasSize;
                    const ctx=tc.getContext('2d'); const imgD=ctx.createImageData(canvasSize,canvasSize);
                    imgD.data.set(data); ctx.putImageData(imgD,0,0);
                    setAssets(prev=>[...prev,{
                      id:`pose_${Date.now()}`, name:`姿态_${prev.filter(x=>x.type==='ai').length+1}`,
                      src:tc.toDataURL(), type:'ai', likes:0, status:'ready', data, needsProcess:false,
                    }]);
                    showStatus('已捕获 Pose → 加入素材库');
                  }} onActionSelect={handleActionSelect}/>
                </div>
              )}
            </div>

            {/* ❹ 调色板（始终可见） */}
            <div className={styles.aiBlock}>
              <div className={styles.aiBlockTitle}>调色板</div>
              <div className={styles.styleRow}>
                <span className={styles.styleLabel}>预设</span>
                <select className={styles.styleSelect} value={paletteId} onChange={e=>setPaletteId(e.target.value)}>
                  {Object.entries(PALETTES).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
                </select>
              </div>
              <div className={styles.paletteRow}>
                {palette.colors.map((c,i)=>(
                  <div key={i} className={styles.paletteSwatch}
                    style={{background:c,outline:c===currentColor?'2px solid var(--text-primary)':'none',outlineOffset:1}}
                    onClick={()=>setCurrentColor(c)} title={c}/>
                ))}
              </div>
            </div>

          </div>
        </div>


          </div>{/* end contentRow */}
        </div>{/* end mainBody */}
      </div>

      {/* ── 素材详情弹窗 ── */}
      {detailAsset&&(
        <div className={styles.processorOverlay} onClick={()=>setDetailAsset(null)}>
          <div className={styles.detailModal} onClick={e=>e.stopPropagation()}>
            <div className={styles.processorModalHeader}>
              <span>素材详情</span>
              <button className={styles.processorCloseBtn} onClick={()=>setDetailAsset(null)}><X size={16}/></button>
            </div>
            <div className={styles.detailBody}>
              {/* 图片预览 */}
              <div className={styles.detailPreview}>
                {detailAsset.src ? <img src={detailAsset.src} alt={detailAsset.name}/> : <div className={styles.detailPlaceholder}>暂无图片</div>}
              </div>
              {/* 信息区 */}
              <div className={styles.detailInfo}>
                <div className={styles.detailInfoRow}>
                  <h3 className={styles.detailName}>{detailAsset.name}</h3>
                  <span className={styles.detailType} data-type={detailAsset.type}>{detailAsset.type==='ai'?'AI 生成':detailAsset.type==='community'?'社区':detailAsset.type==='official'?'官方预置':detailAsset.type}</span>
                </div>
                {/* 点赞 */}
                <div className={styles.detailLikes}>
                  <button className={styles.detailLikeBtn} onClick={()=>handleAssetLike(detailAsset.id)}><Heart size={14}/> {detailAsset.likes||0}</button>
                  {detailAsset.prompt && <button className={styles.detailCopyBtn} onClick={()=>handleCopyPrompt(detailAsset.prompt)}><Copy size={13}/> 复制提示词</button>}
                </div>
                {/* 提示词 */}
                {detailAsset.prompt && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailSectionTitle}><Wand2 size={13}/> 生成提示词</div>
                    <div className={styles.detailPromptText}>{detailAsset.prompt}</div>
                  </div>
                )}
                {/* 描述 */}
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionTitle}><Package size={13}/> 描述</div>
                  <div className={styles.detailDescText}>{detailAsset.type==='official'?'官方精选精灵图素材，适用于像素风格游戏开发。':detailAsset.type==='community'?'由社区创作者贡献的热门素材，已被广泛使用。':'AI 自动生成的精灵图素材。'}</div>
                </div>
                {/* 评论 */}
                <div className={styles.detailSection}>
                  <div className={styles.detailSectionTitle}><MessageCircle size={13}/> 评论</div>
                  <div className={styles.detailComments}>
                    <div className={styles.detailComment}><span className={styles.commentUser}>PixelMaster</span><span className={styles.commentText}>很棒的素材！</span></div>
                    <div className={styles.detailComment}><span className={styles.commentUser}>GameDev42</span><span className={styles.commentText}>用在了我的项目里，效果超赞</span></div>
                  </div>
                </div>
                {/* 操作按钮 */}
                <div className={styles.detailActions}>
                  <button className={styles.detailDirectBtn} onClick={handleDirectUse}><ImageDown size={15}/> 直接插入画布</button>
                  <button className={styles.detailProcessBtn} onClick={handlePreprocessUse}><Scissors size={14}/> 预处理后使用</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 预处理弹窗 ── */}
      {showProcessor&&(
        <div className={styles.processorOverlay} onClick={()=>setShowProcessor(false)}>
          <div className={styles.processorModal} onClick={e=>e.stopPropagation()}>
            <div className={styles.processorModalHeader}>
              <span><Scissors size={16}/> 精灵图预处理</span>
              <button className={styles.processorCloseBtn} onClick={()=>setShowProcessor(false)}><X size={16}/></button>
            </div>
            <SpriteProcessor canvasSize={canvasSize} initialImage={processorInitImage} onInjectFrames={(newFrames)=>{
              const cs = canvasSizeRef.current;
              const wrappedFrames = newFrames.map(f => {
                const emptyLD = {}; layers.forEach(l => { emptyLD[l.id] = new Uint8Array(cs*cs*4); });
                emptyLD[activeLayerId] = f.data;
                return {...f, data: doComposite({ layerData: emptyLD }, layers, cs), layerData: emptyLD};
              });
              setFrames(prev=>[...prev,...wrappedFrames]);
              setShowProcessor(false);
              setProcessorInitImage(null);
              showStatus(`已注入 ${newFrames.length} 帧`);
            }}/>
          </div>
        </div>
      )}
    </>
  );
}
