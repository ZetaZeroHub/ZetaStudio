import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, Scissors, Eraser, Check, ChevronDown, ChevronUp,
  Grid3X3, Trash2, ArrowRight, RotateCcw, ZoomIn, X, Settings,
} from 'lucide-react';
import styles from './SpriteProcessor.module.css';

/**
 * SpriteProcessor — 精灵图预处理工坊
 *
 * 工作流：
 *   上传图片 → 检测网格 → 切割(可调行列) → 设置背景色/容差(全局+单片) → 去背景 → 注入帧列表
 *
 * 每一步都可以独立回退和重新生成
 */

/* ── 自动检测网格 ── */
function detectGrid(imageData, width, height, bgColors, tolerance = 40) {
  const { data } = imageData;
  const isBackground = (r, g, b, a) => {
    if (a < 10) return true;
    for (let ci = 0; ci < bgColors.length; ci++) {
      const dr = Math.abs(r - bgColors[ci][0]);
      const dg = Math.abs(g - bgColors[ci][1]);
      const db = Math.abs(b - bgColors[ci][2]);
      if ((dr + dg + db) < tolerance) return true;
    }
    return false;
  };

  const rowBg = new Uint8Array(height);
  for (let y = 0; y < height; y++) {
    let allBg = true;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (!isBackground(data[i], data[i+1], data[i+2], data[i+3])) { allBg = false; break; }
    }
    rowBg[y] = allBg ? 1 : 0;
  }

  const colBg = new Uint8Array(width);
  for (let x = 0; x < width; x++) {
    let allBg = true;
    for (let y = 0; y < height; y++) {
      const i = (y * width + x) * 4;
      if (!isBackground(data[i], data[i+1], data[i+2], data[i+3])) { allBg = false; break; }
    }
    colBg[x] = allBg ? 1 : 0;
  }

  const findSegments = (arr) => {
    const segs = [];
    let inContent = false, start = 0;
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i] && !inContent) { inContent = true; start = i; }
      else if (arr[i] && inContent) { segs.push([start, i - 1]); inContent = false; }
    }
    if (inContent) segs.push([start, arr.length - 1]);
    return segs;
  };

  return { rows: findSegments(rowBg).length, cols: findSegments(colBg).length, rowSegs: findSegments(rowBg), colSegs: findSegments(colBg) };
}

/* ── 检测背景色 ── */
function detectBgColors(imageData, width, height) {
  const { data } = imageData;
  const edgeSamples = [];
  const sampleEdge = (x, y) => {
    const i = (y * width + x) * 4;
    if (data[i+3] > 200) edgeSamples.push([data[i], data[i+1], data[i+2]]);
  };
  for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 20))) {
    sampleEdge(x, 0); sampleEdge(x, height - 1);
  }
  for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 20))) {
    sampleEdge(0, y); sampleEdge(width - 1, y);
  }

  const bucketSize = 20;
  const buckets = {};
  edgeSamples.forEach(([r, g, b]) => {
    const kr = Math.round(r / bucketSize) * bucketSize;
    const kg = Math.round(g / bucketSize) * bucketSize;
    const kb = Math.round(b / bucketSize) * bucketSize;
    const key = `${kr},${kg},${kb}`;
    if (!buckets[key]) buckets[key] = { sum: [0,0,0], count: 0 };
    buckets[key].sum[0] += r; buckets[key].sum[1] += g; buckets[key].sum[2] += b;
    buckets[key].count++;
  });

  const sorted = Object.values(buckets).sort((a, b) => b.count - a.count);
  const bgColors = sorted.slice(0, 3).filter(b => b.count >= 2).map(b => [
    Math.round(b.sum[0] / b.count), Math.round(b.sum[1] / b.count), Math.round(b.sum[2] / b.count),
  ]);
  if (bgColors.length === 0) bgColors.push([255, 255, 255]);

  const checkerColors = detectCheckerboard(data, width, height);
  if (checkerColors) checkerColors.forEach(cc => {
    if (!bgColors.some(bg => colorDist(bg, cc) < 30)) bgColors.push(cc);
  });

  const commonGrays = [
    [174, 174, 173], [228, 228, 228], [194, 198, 202], [118, 122, 126],
    [192, 192, 192], [128, 128, 128], [204, 204, 204], [153, 153, 153],
    [191, 191, 191], [127, 127, 127], [200, 200, 200], [160, 160, 160],
    [220, 220, 220], [180, 180, 180], [240, 240, 240], [170, 170, 170],
    [230, 230, 230], [176, 176, 176], [144, 144, 144], [210, 210, 210],
    [120, 120, 120], [196, 196, 196], [168, 168, 168], [136, 136, 136],
    [224, 224, 224], [248, 248, 248], [232, 232, 232], [216, 216, 216],
  ];

  // 通用主导色检测
  if (edgeSamples.length >= 4) {
    const hueBuckets = {};
    edgeSamples.forEach(([r, g, b]) => {
      const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
      const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
      if (sat < 0.15) return;
      let hue = 0;
      const d = maxC - minC;
      if (d > 0) {
        if (maxC === r) hue = ((g - b) / d) % 6;
        else if (maxC === g) hue = (b - r) / d + 2;
        else hue = (r - g) / d + 4;
        hue = Math.round(hue * 60);
        if (hue < 0) hue += 360;
      }
      const bucket = Math.floor(hue / 30) * 30;
      if (!hueBuckets[bucket]) hueBuckets[bucket] = [];
      hueBuckets[bucket].push([r, g, b]);
    });
    Object.entries(hueBuckets).forEach(([hueKey, samples]) => {
      if (samples.length >= edgeSamples.length * 0.3) {
        const avg = [0, 0, 0];
        samples.forEach(([r, g, b]) => { avg[0] += r; avg[1] += g; avg[2] += b; });
        avg[0] = Math.round(avg[0] / samples.length);
        avg[1] = Math.round(avg[1] / samples.length);
        avg[2] = Math.round(avg[2] / samples.length);
        samples.forEach(s => { if (!bgColors.some(bg => colorDist(bg, s) < 20)) bgColors.push(s); });
        for (let factor = 0.5; factor <= 1.5; factor += 0.1) {
          const variant = avg.map(c => Math.min(255, Math.max(0, Math.round(c * factor))));
          if (!bgColors.some(bg => colorDist(bg, variant) < 20)) bgColors.push(variant);
        }
        console.log(`[SpriteProcessor] Dominant hue ${hueKey}° detected (${samples.length}/${edgeSamples.length} samples)`);
      }
    });
  }

  edgeSamples.forEach(([r, g, b]) => {
    const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
    if ((maxC - minC) <= 12) {
      const alreadyKnown = commonGrays.some(gray => colorDist([r,g,b], gray) < 15)
                        || bgColors.some(bg => colorDist(bg, [r,g,b]) < 20);
      if (!alreadyKnown) bgColors.push([r, g, b]);
    }
  });
  edgeSamples.forEach(([r, g, b]) => {
    commonGrays.forEach(gray => {
      if (colorDist([r,g,b], gray) < 25 && !bgColors.some(bg => colorDist(bg, gray) < 20)) bgColors.push(gray);
    });
  });
  return bgColors;
}

function colorDist(a, b) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}

function detectCheckerboard(data, width, height) {
  const size = Math.min(16, width, height);
  let countA = 0, countB = 0;
  const sumA = [0,0,0], sumB = [0,0,0];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * width + x) * 4;
      if (data[i+3] < 200) continue;
      const isEven = (x + y) % 2 === 0;
      if (isEven) { sumA[0] += data[i]; sumA[1] += data[i+1]; sumA[2] += data[i+2]; countA++; }
      else { sumB[0] += data[i]; sumB[1] += data[i+1]; sumB[2] += data[i+2]; countB++; }
    }
  }
  if (countA < 4 || countB < 4) return null;
  const avgA = sumA.map(v => Math.round(v / countA));
  const avgB = sumB.map(v => Math.round(v / countB));
  const diff = colorDist(avgA, avgB);
  if (diff < 15 || diff > 300) return null;
  let devA = 0, devB = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * width + x) * 4;
      if (data[i+3] < 200) continue;
      const isEven = (x + y) % 2 === 0;
      const avg = isEven ? avgA : avgB;
      const d = Math.abs(data[i]-avg[0]) + Math.abs(data[i+1]-avg[1]) + Math.abs(data[i+2]-avg[2]);
      if (isEven) devA += d; else devB += d;
    }
  }
  if (devA / countA > 30 || devB / countB > 30) return null;
  return [avgA, avgB];
}

/* ── 边缘泛洪去背景 ── */
function removeBackground(imageData, width, height, bgColors, tolerance = 80) {
  const data = new Uint8ClampedArray(imageData.data);
  const visited = new Uint8Array(width * height);
  const minDist = (r, g, b) => {
    let min = 999;
    for (let i = 0; i < bgColors.length; i++) {
      const dr = r - bgColors[i][0], dg = g - bgColors[i][1], db = b - bgColors[i][2];
      const d = Math.sqrt(dr*dr + dg*dg + db*db);
      if (d < min) min = d;
    }
    return min;
  };
  const stack = [];
  for (let x = 0; x < width; x++) { stack.push(x); stack.push(x + (height-1) * width); }
  for (let y = 1; y < height - 1; y++) { stack.push(y * width); stack.push(y * width + width - 1); }
  while (stack.length > 0) {
    const idx = stack.pop();
    if (visited[idx]) continue;
    visited[idx] = 1;
    const pi = idx * 4;
    const d = minDist(data[pi], data[pi+1], data[pi+2]);
    if (data[pi+3] < 10 || d < tolerance) {
      data[pi+3] = 0;
      const x = idx % width, y = Math.floor(idx / width);
      if (x > 0 && !visited[idx-1]) stack.push(idx-1);
      if (x < width-1 && !visited[idx+1]) stack.push(idx+1);
      if (y > 0 && !visited[idx-width]) stack.push(idx-width);
      if (y < height-1 && !visited[idx+width]) stack.push(idx+width);
    } else if (d < tolerance * 1.5) {
      const alpha = Math.round(255 * (d - tolerance) / (tolerance * 0.5));
      data[pi+3] = Math.min(data[pi+3], Math.max(0, alpha));
    }
  }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const pi = idx * 4;
      if (data[pi+3] === 0) continue;
      const d = minDist(data[pi], data[pi+1], data[pi+2]);
      if (d > tolerance * 1.3) continue;
      let transparentNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const ni = ((y+dy) * width + (x+dx)) * 4;
        if (data[ni+3] === 0) transparentNeighbors++;
      }
      if (transparentNeighbors >= 3) data[pi+3] = 0;
    }
  }
  return new ImageData(data, width, height);
}

function trimTransparent(imageData, width, height) {
  const { data } = imageData;
  let t = height, b = 0, l = width, r = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 10) {
      if (y < t) t = y; if (y > b) b = y;
      if (x < l) l = x; if (x > r) r = x;
    }
  }
  if (t > b || l > r) return { x: 0, y: 0, w: width, h: height };
  return { x: l, y: t, w: r - l + 1, h: b - t + 1 };
}

/* ═══════════════════════════════════ */
export default function SpriteProcessor({ canvasSize = 64, onInjectFrames, initialImage = null }) {
  const fileInputRef = useRef(null);
  const [sourceImg, setSourceImg] = useState(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [grid, setGrid] = useState(null);
  const [manualRows, setManualRows] = useState(0);
  const [manualCols, setManualCols] = useState(0);
  const [slices, setSlices] = useState([]);              // [{id, label, canvas, dataUrl, width, height}]
  const [processed, setProcessed] = useState([]);        // [{...slice, dataUrl(processed), pixels}]
  const [step, setStep] = useState(0);                   // 0=上传 1=检测 2=切割 3=去背景 4=完成
  const [expanded, setExpanded] = useState(true);

  // ── 全局背景色/容差（切片后设置） ──
  const [globalBgHex, setGlobalBgHex] = useState('#ffffff');
  const [globalTolerance, setGlobalTolerance] = useState(80);

  // ── 每切片独立设置 { [sliceId]: { bgHex, tolerance } } ──
  const [sliceSettings, setSliceSettings] = useState({});
  // 追踪哪个切片正在展开编辑
  const [editingSliceId, setEditingSliceId] = useState(null);

  /* ── 回退到指定步骤 ── */
  const goToStep = useCallback((targetStep) => {
    if (targetStep >= step) return; // 只能回退
    console.log(`[SpriteProcessor] 回退: step ${step} → ${targetStep}`);
    if (targetStep < 3) setProcessed([]);
    if (targetStep < 2) setSlices([]);
    setStep(targetStep);
  }, [step]);

  /* ── 自动加载 initialImage ── */
  useEffect(() => {
    if (!initialImage) return;
    console.log('[SpriteProcessor] auto-loading initialImage:', initialImage);
    const img = new Image();
    // 只对跨域 URL 设 crossOrigin，同源路径不设（避免 nginx 无 CORS 头时的预检延迟）
    const isExternal = /^https?:\/\//i.test(initialImage) && !initialImage.startsWith(window.location.origin);
    if (isExternal) img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log('[SpriteProcessor] initialImage loaded:', img.width, 'x', img.height);
      setSourceImg(img);
      setSourceUrl(initialImage);
      try {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const bgColorArr = detectBgColors(imageData, img.width, img.height);
        setGlobalBgHex('#' + bgColorArr[0].map(v => v.toString(16).padStart(2, '0')).join(''));
        const g = detectGrid(imageData, img.width, img.height, bgColorArr);
        setGrid(g);
        setManualRows(g.rows);
        setManualCols(g.cols);
        setStep(1);
        setSlices([]);
        setProcessed([]);
      } catch (err) {
        console.error('[SpriteProcessor] initialImage canvas processing failed (tainted?):', err);
        // 即使 getImageData 失败，也让用户看到预览图
        setStep(1);
      }
    };
    img.onerror = (e) => {
      console.error('[SpriteProcessor] initialImage load failed:', e, 'url:', initialImage);
      // 如果加载失败且有 crossOrigin，尝试去掉 crossOrigin 重试
      if (img.crossOrigin) {
        console.log('[SpriteProcessor] retrying without crossOrigin...');
        const img2 = new Image();
        img2.onload = img.onload;
        img2.onerror = () => console.error('[SpriteProcessor] retry also failed');
        img2.src = initialImage;
      }
    };
    img.src = initialImage;
  }, [initialImage]);

  /* ── Step 0→1: 上传图片 ── */
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSourceImg(img);
      setSourceUrl(url);
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const bgColorArr = detectBgColors(imageData, img.width, img.height);
      setGlobalBgHex('#' + bgColorArr[0].map(v => v.toString(16).padStart(2, '0')).join(''));
      const g = detectGrid(imageData, img.width, img.height, bgColorArr);
      setGrid(g); setManualRows(g.rows); setManualCols(g.cols);
      setStep(1); setSlices([]); setProcessed([]);
    };
    img.src = url;
  }, []);

  /* ── Step 1→2: 执行切割 ── */
  const executeSplit = useCallback(() => {
    if (!sourceImg || !grid) return;
    const rows = manualRows || grid.rows;
    const cols = manualCols || grid.cols;
    if (rows <= 0 || cols <= 0) return;

    const rowSegs = grid.rowSegs.length === rows ? grid.rowSegs :
      Array.from({ length: rows }, (_, i) => {
        const h = Math.floor(sourceImg.height / rows);
        return [i * h, Math.min((i + 1) * h - 1, sourceImg.height - 1)];
      });
    const colSegs = grid.colSegs.length === cols ? grid.colSegs :
      Array.from({ length: cols }, (_, i) => {
        const w = Math.floor(sourceImg.width / cols);
        return [i * w, Math.min((i + 1) * w - 1, sourceImg.width - 1)];
      });

    const results = [];
    for (let r = 0; r < rowSegs.length; r++) {
      for (let c = 0; c < colSegs.length; c++) {
        const sx = colSegs[c][0], sy = rowSegs[r][0];
        const sw = colSegs[c][1] - sx + 1, sh = rowSegs[r][1] - sy + 1;
        const canvas = document.createElement('canvas');
        canvas.width = sw; canvas.height = sh;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, sw, sh);
        results.push({
          id: `slice_${r}_${c}`,
          label: `R${r+1}C${c+1}`,
          canvas, dataUrl: canvas.toDataURL(),
          width: sw, height: sh,
        });
      }
    }
    setSlices(results);
    setSliceSettings({}); // 清空单片设置
    setProcessed([]);
    setStep(2);
  }, [sourceImg, grid, manualRows, manualCols]);

  /* ── 删除切片 ── */
  const deleteSlice = useCallback((sliceId) => {
    setSlices(prev => prev.filter(s => s.id !== sliceId));
    setSliceSettings(prev => { const n = {...prev}; delete n[sliceId]; return n; });
    // 如果已有处理结果也删除对应
    setProcessed(prev => prev.filter(p => p.id !== sliceId));
  }, []);

  /* ── 更新单片设置 ── */
  const updateSliceSetting = useCallback((sliceId, field, value) => {
    setSliceSettings(prev => ({
      ...prev,
      [sliceId]: { ...(prev[sliceId] || {}), [field]: value },
    }));
  }, []);

  /* ── 清除单片自定义设置（恢复使用全局） ── */
  const clearSliceSetting = useCallback((sliceId) => {
    setSliceSettings(prev => { const n = {...prev}; delete n[sliceId]; return n; });
  }, []);

  /* ── Step 2→3: 去背景（全局+单片设置） ── */
  const executeRemoveBg = useCallback(() => {
    if (slices.length === 0) return;
    const globalBgColor = globalBgHex.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16));

    const results = slices.map(slice => {
      // 决定使用哪个设置：单片覆盖 or 全局
      const settings = sliceSettings[slice.id];
      const useBgHex = settings?.bgHex || globalBgHex;
      const useTolerance = settings?.tolerance ?? globalTolerance;
      const userBgColor = useBgHex.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16));

      const { canvas, width, height } = slice;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, width, height);

      const sliceBgColors = detectBgColors(imageData, width, height);
      if (!sliceBgColors.some(c => colorDist(c, userBgColor) < 30)) sliceBgColors.push(userBgColor);

      const cleaned = removeBackground(imageData, width, height, sliceBgColors, useTolerance);
      const bounds = trimTransparent(cleaned, width, height);

      const outCanvas = document.createElement('canvas');
      outCanvas.width = canvasSize; outCanvas.height = canvasSize;
      const outCtx = outCanvas.getContext('2d');

      const cleanedCanvas = document.createElement('canvas');
      cleanedCanvas.width = width; cleanedCanvas.height = height;
      cleanedCanvas.getContext('2d').putImageData(cleaned, 0, 0);

      outCtx.imageSmoothingEnabled = false;
      const scale = Math.min(canvasSize / bounds.w, canvasSize / bounds.h);
      const dw = Math.round(bounds.w * scale);
      const dh = Math.round(bounds.h * scale);
      const dx = Math.floor((canvasSize - dw) / 2);
      const dy = Math.floor((canvasSize - dh) / 2);
      outCtx.drawImage(cleanedCanvas, bounds.x, bounds.y, bounds.w, bounds.h, dx, dy, dw, dh);

      const outData = outCtx.getImageData(0, 0, canvasSize, canvasSize);
      return {
        ...slice,
        dataUrl: outCanvas.toDataURL(),
        pixels: new Uint8Array(outData.data),
      };
    });

    setProcessed(results);
    setStep(3);
  }, [slices, globalBgHex, globalTolerance, sliceSettings, canvasSize]);

  /* ── 对单个切片重新去背景（预览） ── */
  const reprocessOne = useCallback((sliceId) => {
    const slice = slices.find(s => s.id === sliceId);
    if (!slice) return;

    const settings = sliceSettings[sliceId];
    const useBgHex = settings?.bgHex || globalBgHex;
    const useTolerance = settings?.tolerance ?? globalTolerance;
    const userBgColor = useBgHex.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16));

    const { canvas, width, height } = slice;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);

    const sliceBgColors = detectBgColors(imageData, width, height);
    if (!sliceBgColors.some(c => colorDist(c, userBgColor) < 30)) sliceBgColors.push(userBgColor);

    const cleaned = removeBackground(imageData, width, height, sliceBgColors, useTolerance);
    const bounds = trimTransparent(cleaned, width, height);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = canvasSize; outCanvas.height = canvasSize;
    const outCtx = outCanvas.getContext('2d');
    const cleanedCanvas = document.createElement('canvas');
    cleanedCanvas.width = width; cleanedCanvas.height = height;
    cleanedCanvas.getContext('2d').putImageData(cleaned, 0, 0);
    outCtx.imageSmoothingEnabled = false;
    const scale = Math.min(canvasSize / bounds.w, canvasSize / bounds.h);
    const dw = Math.round(bounds.w * scale), dh = Math.round(bounds.h * scale);
    const dx = Math.floor((canvasSize - dw) / 2), dy = Math.floor((canvasSize - dh) / 2);
    outCtx.drawImage(cleanedCanvas, bounds.x, bounds.y, bounds.w, bounds.h, dx, dy, dw, dh);

    const outData = outCtx.getImageData(0, 0, canvasSize, canvasSize);
    setProcessed(prev => prev.map(p => p.id === sliceId ? {
      ...slice, dataUrl: outCanvas.toDataURL(), pixels: new Uint8Array(outData.data),
    } : p));
  }, [slices, sliceSettings, globalBgHex, globalTolerance, canvasSize]);

  /* ── Step 3→4: 注入帧列表 ── */
  const injectAll = useCallback(() => {
    if (processed.length === 0 || !onInjectFrames) return;
    onInjectFrames(processed.map((p, i) => ({
      id: `proc_${Date.now()}_${i}`,
      name: p.label || `sprite_${i}`,
      isKey: i === 0, source: 'processed', data: p.pixels,
    })));
    setStep(4);
  }, [processed, onInjectFrames]);

  const injectOne = useCallback((idx) => {
    if (!processed[idx] || !onInjectFrames) return;
    const p = processed[idx];
    onInjectFrames([{
      id: `proc_${Date.now()}_${idx}`,
      name: p.label || `sprite_${idx}`,
      isKey: false, source: 'processed', data: p.pixels,
    }]);
  }, [processed, onInjectFrames]);

  /* ── 粘贴支持 ── */
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            setSourceImg(img); setSourceUrl(url);
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const bgColorArr = detectBgColors(imageData, img.width, img.height);
            setGlobalBgHex('#' + bgColorArr[0].map(v => v.toString(16).padStart(2, '0')).join(''));
            const g = detectGrid(imageData, img.width, img.height, bgColorArr);
            setGrid(g); setManualRows(g.rows); setManualCols(g.cols);
            setStep(1); setSlices([]); setProcessed([]);
          };
          img.src = url;
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  /* ── 步骤指示器 ── */
  const STEPS = [
    { label: '上传新的素材', icon: Upload },
    { label: '检测', icon: Grid3X3 },
    { label: '切割', icon: Scissors },
    { label: '去背景', icon: Eraser },
    { label: '完成', icon: Check },
  ];

  return (
    <div className={styles.processor}>
      {/* 步骤条 — 可点击回退 */}
      <div className={styles.stepBar}>
        {STEPS.map((s, i) => (
          <div key={i}
            className={`${styles.stepDot} ${i <= step ? styles.stepDotDone : ''} ${i === step ? styles.stepDotActive : ''}`}
            onClick={() => { if (i < step) goToStep(i); }}
            style={{ cursor: i < step ? 'pointer' : 'default' }}
            title={i < step ? `回退到「${s.label}」` : ''}
          >
            <s.icon size={12} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 0: 上传区（全幅） */}
      {step === 0 && (
        <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
          <Upload size={28} strokeWidth={1.5} />
          <span>拖入或点击上传精灵图</span>
          <span className={styles.uploadHint}>支持粘贴 (Ctrl+V)</span>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </div>
      )}

      {/* Step >= 1: 左右双栏布局 */}
      {step >= 1 && (
        <div className={styles.splitLayout}>
          {/* ── 左侧：原图预览（固定） ── */}
          <div className={styles.leftPanel}>
            <div className={styles.leftPanelHeader}>
              <span>原图预览</span>
              {sourceImg && <span className={styles.imgDimension}>{sourceImg.width}×{sourceImg.height}</span>}
            </div>
            <div className={styles.leftPreviewArea}>
              {sourceUrl ? (
                <img src={sourceUrl} alt="source" className={styles.leftPreviewImg} />
              ) : (
                <div className={styles.leftPreviewPlaceholder}>暂无图片</div>
              )}
            </div>
            {/* 重新上传入口 */}
            <button className={styles.reuploadBtn} onClick={() => { goToStep(0); fileInputRef.current?.click(); }}>
              <Upload size={12} /> 更换图片
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </button>
          </div>

          {/* ── 右侧：操作面板（可滚动） ── */}
          <div className={styles.rightPanel}>
            {/* 网格检测 */}
            {grid && (
              <div className={styles.section}>
                <div className={styles.sectionHead}>
                  <span><Grid3X3 size={13} /> 网格检测</span>
                  {step === 1 && <span className={styles.autoTag}>自动</span>}
                </div>
                <div className={styles.controlRow}>
                  <label className={styles.controlLabel}>行</label>
                  <input className={styles.controlInput} type="number" min={1} max={20} value={manualRows}
                    onChange={e => setManualRows(Math.max(1, +e.target.value))} />
                  <label className={styles.controlLabel}>列</label>
                  <input className={styles.controlInput} type="number" min={1} max={20} value={manualCols}
                    onChange={e => setManualCols(Math.max(1, +e.target.value))} />
                </div>
                {step >= 1 && step < 3 && (
                  <button className={styles.actionBtn} onClick={executeSplit}>
                    <Scissors size={13} /> {step === 1 ? '切割' : '重新切割'} ({manualRows}×{manualCols} = {manualRows * manualCols} 切片)
                  </button>
                )}
              </div>
            )}

            {/* 切片预览 + 背景色/容差设置 */}
            {step >= 2 && slices.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHead}>
                  <span><Scissors size={13} /> 切片 ({slices.length})</span>
                </div>

                {/* 全局背景设置 */}
                <div className={styles.bgSettingsBlock}>
                  <div className={styles.bgSettingsTitle}>
                    <Settings size={12} />
                    <span>全局去背景设置</span>
                  </div>
                  <div className={styles.controlRow}>
                    <label className={styles.controlLabel}>背景色</label>
                    <input type="color" value={globalBgHex} onChange={e => setGlobalBgHex(e.target.value)}
                      className={styles.colorPick} />
                    <label className={styles.controlLabel}>容差</label>
                    <input type="range" min={10} max={200} value={globalTolerance}
                      onChange={e => setGlobalTolerance(+e.target.value)} style={{width:80,accentColor:'var(--border-accent)'}} />
                    <input className={styles.controlInput} type="number" min={10} max={200} value={globalTolerance}
                      onChange={e => setGlobalTolerance(+e.target.value)} />
                  </div>
                </div>

                <div className={styles.sliceGrid}>
                  {slices.map((s) => {
                    const hasCustom = !!sliceSettings[s.id];
                    const isEditing = editingSliceId === s.id;
                    return (
                      <div key={s.id} className={`${styles.sliceCard} ${hasCustom ? styles.sliceCardCustom : ''}`}>
                        <img src={s.dataUrl} alt={s.label} />
                        <span className={styles.sliceLabel}>{s.label}</span>
                        <button className={styles.sliceDeleteBtn} onClick={(e) => { e.stopPropagation(); deleteSlice(s.id); }}
                          title="删除此切片"><X size={9} /></button>
                        <button className={`${styles.sliceSettingBtn} ${hasCustom ? styles.sliceSettingBtnActive : ''}`}
                          onClick={(e) => { e.stopPropagation(); setEditingSliceId(isEditing ? null : s.id); }}
                          title="单独设置背景色/容差"><Settings size={9} /></button>
                        {isEditing && (
                          <div className={styles.sliceSettingsPanel} onClick={e => e.stopPropagation()}>
                            <div className={styles.controlRow}>
                              <label className={styles.controlLabel}>色</label>
                              <input type="color" value={sliceSettings[s.id]?.bgHex || globalBgHex}
                                onChange={e => updateSliceSetting(s.id, 'bgHex', e.target.value)}
                                className={styles.colorPick} />
                              <label className={styles.controlLabel}>容差</label>
                              <input className={styles.controlInput} type="number" min={10} max={200}
                                value={sliceSettings[s.id]?.tolerance ?? globalTolerance}
                                onChange={e => updateSliceSetting(s.id, 'tolerance', +e.target.value)} />
                            </div>
                            {hasCustom && (
                              <button className={styles.sliceResetBtn} onClick={() => clearSliceSetting(s.id)}>
                                <RotateCcw size={9} /> 恢复全局
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {step === 2 && (
                  <button className={styles.actionBtn} onClick={executeRemoveBg}>
                    <Eraser size={13} /> 一键去背景
                  </button>
                )}
              </div>
            )}

            {/* 去背景结果 */}
            {step >= 3 && processed.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHead}>
                  <span><Check size={13} /> 处理完成 ({processed.length})</span>
                </div>
                <div className={styles.sliceGrid}>
                  {processed.map((p, i) => {
                    const hasCustom = !!sliceSettings[p.id];
                    const isEditing = editingSliceId === `result_${p.id}`;
                    return (
                      <div key={p.id} className={`${styles.sliceCard} ${hasCustom ? styles.sliceCardCustom : ''}`}>
                        <div className={styles.checkerBg}>
                          <img src={p.dataUrl} alt={p.label} onClick={() => injectOne(i)} title="点击注入单帧" />
                        </div>
                        <span className={styles.sliceLabel}>{p.label}</span>
                        <button className={styles.sliceDeleteBtn} onClick={(e) => {
                          e.stopPropagation();
                          setProcessed(prev => prev.filter(pp => pp.id !== p.id));
                          deleteSlice(p.id);
                        }} title="删除此帧"><X size={9} /></button>
                        <button className={`${styles.sliceSettingBtn} ${hasCustom ? styles.sliceSettingBtnActive : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSliceId(isEditing ? null : `result_${p.id}`);
                          }} title="调整并重新处理"><Settings size={9} /></button>
                        {isEditing && (
                          <div className={styles.sliceSettingsPanel} onClick={e => e.stopPropagation()}>
                            <div className={styles.controlRow}>
                              <label className={styles.controlLabel}>色</label>
                              <input type="color" value={sliceSettings[p.id]?.bgHex || globalBgHex}
                                onChange={e => updateSliceSetting(p.id, 'bgHex', e.target.value)}
                                className={styles.colorPick} />
                              <label className={styles.controlLabel}>容差</label>
                              <input className={styles.controlInput} type="number" min={10} max={200}
                                value={sliceSettings[p.id]?.tolerance ?? globalTolerance}
                                onChange={e => updateSliceSetting(p.id, 'tolerance', +e.target.value)} />
                            </div>
                            <button className={styles.actionBtn} onClick={() => { reprocessOne(p.id); setEditingSliceId(null); }}
                              style={{marginTop:4,padding:'5px 8px',fontSize:'0.75rem'}}>
                              <RotateCcw size={10} /> 重新处理
                            </button>
                            {hasCustom && (
                              <button className={styles.sliceResetBtn} onClick={() => clearSliceSetting(p.id)}>
                                <RotateCcw size={9} /> 恢复全局
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button className={styles.actionBtnPrimary} onClick={injectAll}>
                  <ArrowRight size={14} /> 全部注入帧列表 ({processed.length} 帧)
                </button>
                <button className={styles.actionBtn} onClick={executeRemoveBg} style={{marginTop:6}}>
                  <RotateCcw size={12} /> 全部重新去背景
                </button>
              </div>
            )}

            {/* 完成 */}
            {step === 4 && (
              <div className={styles.doneMsg}>
                <Check size={20} />
                <span>已注入 {processed.length} 帧到编辑器</span>
                <button className={styles.resetBtn} onClick={() => goToStep(0)}>
                  <RotateCcw size={12} /> 处理新图片
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
