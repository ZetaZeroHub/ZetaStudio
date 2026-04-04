import { useRef, useEffect, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * GLBPreview — 在 canvas 中渲染 GLB 模型的缩略/预览组件
 * 
 * @param {string} src - GLB 文件路径 (如 /assets/models/duck.glb)
 * @param {number} width - canvas 宽度
 * @param {number} height - canvas 高度
 * @param {boolean} autoRotate - 是否自动旋转 (默认 true)
 * @param {string} className - 外部 CSS class
 */
function GLBPreviewInner({ src, width = 200, height = 150, autoRotate = true, className = '' }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;

    console.log('[GLBPreview] 开始加载模型:', src);

    let disposed = false;

    // ── 创建渲染器 ──
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // ── 场景 ──
    const scene = new THREE.Scene();

    // ── 相机 ──
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);

    // ── 光照 (三点照明) ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc4d4ff, 0.4);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd4a0, 0.3);
    rimLight.position.set(0, -1, -2);
    scene.add(rimLight);

    // ── 加载 GLB ──
    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        console.log('[GLBPreview] 模型加载成功:', src);

        const model = gltf.scene;

        // 自动缩放 + 居中
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // 归一化到尺寸 2
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);

        // 居中到原点
        model.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale
        );

        scene.add(model);

        // 相机定位
        camera.position.set(1.8, 1.2, 2.5);
        camera.lookAt(0, 0, 0);

        setLoading(false);

        // ── 动画循环 ──
        let frameId;
        let angle = 0;
        const animate = () => {
          if (disposed) return;
          frameId = requestAnimationFrame(animate);

          if (autoRotate) {
            angle += 0.008;
            model.rotation.y = angle;
          }

          renderer.render(scene, camera);
        };
        animate();

        cleanupRef.current = () => {
          disposed = true;
          cancelAnimationFrame(frameId);
          renderer.dispose();
          // 清理几何体和材质
          model.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        };
      },
      (progress) => {
        // 加载进度
        if (progress.total > 0) {
          console.log('[GLBPreview] 加载进度:', src, Math.round(progress.loaded / progress.total * 100) + '%');
        }
      },
      (err) => {
        if (disposed) return;
        console.error('[GLBPreview] 模型加载失败:', src, err);
        setError('加载失败');
        setLoading(false);
        renderer.dispose();
      }
    );

    return () => {
      disposed = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      } else {
        renderer.dispose();
      }
    };
  }, [src, width, height, autoRotate]);

  return (
    <div className={className} style={{ position: 'relative', width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
        }}
      />
      {loading && !error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 16, height: 16,
            border: '2px solid rgba(255,255,255,0.1)',
            borderTop: '2px solid var(--text-muted)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.6rem',
        }}>
          {error}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const GLBPreview = memo(GLBPreviewInner);
export default GLBPreview;
