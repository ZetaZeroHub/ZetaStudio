import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { renderAll, destroyAll, drawSelectionBox, clearSelectionBox } from '../../engine/threeRenderer';
import useEditorStore from '../../stores/editorStore';
import useI18nStore from '../../stores/i18nStore';
import styles from './GameCanvas.module.css';

export default function ThreeCanvas({ mode }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const initIdRef = useRef(0);
  const reqIdRef = useRef(0);
  const [loading, setLoading] = useState(false);

  const elements = useEditorStore(s => s.elements);
  const selectedElementId = useEditorStore(s => s.selectedElementId);
  const variables = useEditorStore(s => s.variables);
  const { t } = useI18nStore();

  const destroyApp = useCallback(() => {
    if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    if (sceneRef.current) destroyAll(sceneRef.current);
    if (rendererRef.current) rendererRef.current.dispose();
    if (controlsRef.current) controlsRef.current.dispose();
    if (containerRef.current) containerRef.current.innerHTML = '';
    sceneRef.current = null;
    rendererRef.current = null;
    cameraRef.current = null;
    controlsRef.current = null;
  }, []);

  const initApp = useCallback(async () => {
    destroyApp();
    if (!containerRef.current) return;

    const currentId = ++initIdRef.current;
    setLoading(true);

    try {
      const w = containerRef.current.clientWidth || 800;
      const h = containerRef.current.clientHeight || 600;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111827);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);

      sceneRef.current = scene;
      rendererRef.current = renderer;

      let camera = null;
      const threeMap = renderAll(scene, elements, variables, mode === 'edit');
      
      const camEl = [...threeMap.values()].find(c => c.isPerspectiveCamera);
      if (camEl) {
        camera = camEl;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      } else {
        camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
      }
      cameraRef.current = camera;

      const controls = new OrbitControls(camera, renderer.domElement);
      controlsRef.current = controls;

      if (mode === 'edit') {
        setupEditInteractions(scene, camera, renderer.domElement, threeMap);
      }

      // App object to mimic pixi app.ticker for scripts
      const customApp = {
        ticker: {
          tasks: [],
          add: (fn) => customApp.ticker.tasks.push(fn),
          remove: (fn) => { customApp.ticker.tasks = customApp.ticker.tasks.filter(t => t !== fn); }
        }
      };

      if (mode === 'preview') {
        useEditorStore.getState().initVariables();
        const store = useEditorStore.getState();
        const scripts = store.scripts || [];
        
        scripts.forEach(script => {
          try {
            const executor = new Function(
              'app', 'THREE', 'elements', 'store', 'variables', 'setVariable', script.content
            );
            
            const elementsObj = {};
            for (const [id, obj] of threeMap.entries()) elementsObj[id] = obj;

            executor(customApp, THREE, elementsObj, store, store.variables, store.setVariable);
          } catch (err) {
            console.error(`Error executing script "${script.name}":`, err);
          }
        });
      }

      if (mode === 'edit' && selectedElementId) {
        drawSelectionBox(scene, selectedElementId);
      }

      const animate = () => {
        if (currentId !== initIdRef.current) return;
        reqIdRef.current = requestAnimationFrame(animate);
        
        customApp.ticker.tasks.forEach(task => task());
        if (controlsRef.current && mode === 'edit') controlsRef.current.update();
        
        renderer.render(scene, camera);
      };
      
      animate();

    } catch (e) {
      console.error('ThreeJS initialization error:', e);
    } finally {
      if (currentId === initIdRef.current) setLoading(false);
    }
  }, [elements, mode, destroyApp]);

  const setupEditInteractions = (scene, camera, domElement, threeMap) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onClick = (event) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactables = [...threeMap.values()].filter(o => o.isMesh);
      const intersects = raycaster.intersectObjects(interactables);

      if (intersects.length > 0) {
        const selected = intersects[0].object;
        if (selected.__elementId) {
          useEditorStore.getState().selectElement(selected.__elementId);
          clearSelectionBox(scene);
          drawSelectionBox(scene, selected.__elementId);
        }
      } else {
        useEditorStore.getState().selectElement(null);
        clearSelectionBox(scene);
      }
    };

    domElement.addEventListener('click', onClick);
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (rendererRef.current && containerRef.current && cameraRef.current) {
         const w = containerRef.current.clientWidth;
         const h = containerRef.current.clientHeight;
         rendererRef.current.setSize(w, h);
         cameraRef.current.aspect = w / h;
         cameraRef.current.updateProjectionMatrix();
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    initApp();
    return () => destroyApp();
  }, [mode]); // Removed elements dependency!

  // Separate effect to sync elements gracefully without destroying the app
  useEffect(() => {
    if (!sceneRef.current) return;
    if (mode === 'preview') return; // Do not sync from store during preview, physics drives state
    import('../../engine/threeRenderer').then(({ syncElements }) => {
      syncElements(sceneRef.current, elements, variables, true);
      if (selectedElementId) {
        drawSelectionBox(sceneRef.current, selectedElementId);
      }
    });
  }, [elements, variables, selectedElementId, mode]);

  useEffect(() => {
    if (sceneRef.current && mode === 'edit') {
      clearSelectionBox(sceneRef.current);
      if (selectedElementId) {
        drawSelectionBox(sceneRef.current, selectedElementId);
      }
    }
  }, [selectedElementId, mode]);

  return (
    <div className={styles.canvasWrapper} tabIndex={0} ref={containerRef} id="game-canvas-three" style={{ outline: 'none' }}>
      <span className={`${styles.modeLabel} ${mode === 'edit' ? styles.modeEdit : styles.modePreview}`}>
        {mode === 'edit' ? t('gameCanvas.editMode') : t('gameCanvas.previewMode')}
      </span>
      {loading && (
        <div className={styles.loadingOverlay}>
          <span className={`${styles.loadingText} animate-pulse`}>{t('gameCanvas.rendering')}</span>
        </div>
      )}
    </div>
  );
}
