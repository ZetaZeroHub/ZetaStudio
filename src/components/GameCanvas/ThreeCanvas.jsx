import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { renderAll, destroyAll, drawSelectionBox, clearSelectionBox, getThreeObjectMap } from '../../engine/threeRenderer';
import useEditorStore from '../../stores/editorStore';
import useI18nStore from '../../stores/i18nStore';
import styles from './GameCanvas.module.css';

export default function ThreeCanvas({ mode }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const transformRef = useRef(null);
  const initIdRef = useRef(0);
  const reqIdRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const elements = useEditorStore(s => s.elements);
  const selectedElementId = useEditorStore(s => s.selectedElementId);
  const variables = useEditorStore(s => s.variables);
  const { t, language } = useI18nStore();

  const destroyApp = useCallback(() => {
    if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    if (sceneRef.current) destroyAll(sceneRef.current);
    if (transformRef.current) transformRef.current.dispose();
    if (rendererRef.current) rendererRef.current.dispose();
    if (controlsRef.current) controlsRef.current.dispose();
    if (containerRef.current) containerRef.current.innerHTML = '';
    sceneRef.current = null;
    rendererRef.current = null;
    cameraRef.current = null;
    controlsRef.current = null;
    transformRef.current = null;
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

      // Grid helper for edit mode
      if (mode === 'edit') {
        const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x222222);
        gridHelper.__isHelper = true;
        scene.add(gridHelper);
      }

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

      // OrbitControls for camera
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controlsRef.current = controls;

      // TransformControls for gizmo (edit mode only)
      if (mode === 'edit') {
        const transformControls = new TransformControls(camera, renderer.domElement);
        transformControls.__isHelper = true;
        scene.add(transformControls);
        transformRef.current = transformControls;

        // Disable OrbitControls while dragging gizmo
        transformControls.addEventListener('dragging-changed', (event) => {
          controls.enabled = !event.value;
        });

        // Sync transform back to store on change
        transformControls.addEventListener('objectChange', () => {
          const obj = transformControls.object;
          if (!obj || !obj.__elementId) return;
          const store = useEditorStore.getState();
          store.updateElement(obj.__elementId, {
            transform: {
              ...store.elements.find(e => e.id === obj.__elementId)?.transform,
              x: parseFloat(obj.position.x.toFixed(3)),
              y: parseFloat(obj.position.y.toFixed(3)),
              z: parseFloat(obj.position.z.toFixed(3)),
              rotationX: parseFloat(obj.rotation.x.toFixed(3)),
              rotationY: parseFloat(obj.rotation.y.toFixed(3)),
              rotationZ: parseFloat(obj.rotation.z.toFixed(3)),
              scaleX: parseFloat(obj.scale.x.toFixed(3)),
              scaleY: parseFloat(obj.scale.y.toFixed(3)),
              scaleZ: parseFloat(obj.scale.z.toFixed(3)),
            }
          });
        });

        setupEditInteractions(scene, camera, renderer.domElement, threeMap, transformControls);
        setupKeyboardShortcuts(renderer.domElement, transformControls, camera, controls);
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
        attachGizmo(selectedElementId);
      }

      const animate = () => {
        if (currentId !== initIdRef.current) return;
        reqIdRef.current = requestAnimationFrame(animate);
        
        customApp.ticker.tasks.forEach(task => task());
        if (controlsRef.current) controlsRef.current.update();
        
        renderer.render(scene, camera);
      };
      
      animate();

    } catch (e) {
      console.error('ThreeJS initialization error:', e);
    } finally {
      if (currentId === initIdRef.current) setLoading(false);
    }
  }, [elements, mode, destroyApp]);

  const attachGizmo = useCallback((elementId) => {
    const tc = transformRef.current;
    if (!tc || !sceneRef.current) return;
    
    const objMap = getThreeObjectMap();
    const obj = objMap.get(elementId);
    
    if (obj) {
      tc.attach(obj);
      clearSelectionBox(sceneRef.current);
      drawSelectionBox(sceneRef.current, elementId);
    } else {
      tc.detach();
    }
  }, []);

  const setupEditInteractions = (scene, camera, domElement, threeMap, transformControls) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onClick = (event) => {
      const rect = domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      // Get all clickable objects (meshes and groups with __elementId)
      const allObjects = [];
      scene.traverse((child) => {
        if (child.__elementId && (child.isMesh || child.isGroup)) {
          allObjects.push(child);
        }
      });
      const intersects = raycaster.intersectObjects(allObjects, true);

      if (intersects.length > 0) {
        // Walk up to find the object with __elementId
        let selected = intersects[0].object;
        while (selected && !selected.__elementId) {
          selected = selected.parent;
        }
        if (selected && selected.__elementId) {
          useEditorStore.getState().selectElement(selected.__elementId);
          clearSelectionBox(scene);
          drawSelectionBox(scene, selected.__elementId);
          transformControls.attach(selected);
        }
      } else {
        useEditorStore.getState().selectElement(null);
        clearSelectionBox(scene);
        transformControls.detach();
      }
    };

    domElement.addEventListener('click', onClick);
  };

  const setupKeyboardShortcuts = (domElement, transformControls, camera, orbitControls) => {
    const onKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      switch (event.key.toLowerCase()) {
        case 'g': // Grab/Move
          transformControls.setMode('translate');
          break;
        case 'r': // Rotate
          transformControls.setMode('rotate');
          break;
        case 's': // Scale
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            transformControls.setMode('scale');
          }
          break;
        case 'x': // X axis constraint
          transformControls.showX = true;
          transformControls.showY = false;
          transformControls.showZ = false;
          setTimeout(() => {
            transformControls.showX = true;
            transformControls.showY = true;
            transformControls.showZ = true;
          }, 2000);
          break;
        case 'y': // Y axis constraint
          transformControls.showX = false;
          transformControls.showY = true;
          transformControls.showZ = false;
          setTimeout(() => {
            transformControls.showX = true;
            transformControls.showY = true;
            transformControls.showZ = true;
          }, 2000);
          break;
        case 'z': // Z axis constraint
          transformControls.showX = false;
          transformControls.showY = false;
          transformControls.showZ = true;
          setTimeout(() => {
            transformControls.showX = true;
            transformControls.showY = true;
            transformControls.showZ = true;
          }, 2000);
          break;
        case 'delete':
        case 'backspace': {
          const store = useEditorStore.getState();
          if (store.selectedElementId) {
            transformControls.detach();
            store.removeElement(store.selectedElementId);
          }
          break;
        }
        case '1': // Front view (numpad)
          if (event.code === 'Numpad1') {
            camera.position.set(0, 0, 10);
            camera.lookAt(0, 0, 0);
            orbitControls.target.set(0, 0, 0);
          }
          break;
        case '3': // Right view
          if (event.code === 'Numpad3') {
            camera.position.set(10, 0, 0);
            camera.lookAt(0, 0, 0);
            orbitControls.target.set(0, 0, 0);
          }
          break;
        case '7': // Top view
          if (event.code === 'Numpad7') {
            camera.position.set(0, 10, 0);
            camera.lookAt(0, 0, 0);
            orbitControls.target.set(0, 0, 0);
          }
          break;
      }
    };

    // Listen on the container for focus
    const wrapper = domElement.parentElement;
    if (wrapper) {
      wrapper.addEventListener('keydown', onKeyDown);
    }
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
  }, [mode]);

  // Sync elements without destroying
  useEffect(() => {
    if (!sceneRef.current) return;
    if (mode === 'preview') return;
    import('../../engine/threeRenderer').then(({ syncElements }) => {
      syncElements(sceneRef.current, elements, variables, true);
      if (selectedElementId) {
        attachGizmo(selectedElementId);
      }
    });
  }, [elements, variables, selectedElementId, mode]);

  useEffect(() => {
    if (sceneRef.current && mode === 'edit') {
      clearSelectionBox(sceneRef.current);
      if (selectedElementId) {
        attachGizmo(selectedElementId);
      } else if (transformRef.current) {
        transformRef.current.detach();
      }
    }
  }, [selectedElementId, mode]);

  const SHORTCUTS = language === 'zh' ? [
    ['G', '移动模式'], ['R', '旋转模式'], ['S', '缩放模式'],
    ['X/Y/Z', '轴约束'], ['Del', '删除'],
    ['鼠标左键', '选择/拖拽'], ['中键拖拽', '平移视角'], ['滚轮', '缩放视角'],
    ['右键拖拽', '旋转视角'],
  ] : [
    ['G', 'Move'], ['R', 'Rotate'], ['S', 'Scale'],
    ['X/Y/Z', 'Axis Lock'], ['Del', 'Delete'],
    ['Left Click', 'Select/Drag'], ['Mid Drag', 'Pan'], ['Scroll', 'Zoom'],
    ['Right Drag', 'Orbit'],
  ];

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
      {mode === 'edit' && (
        <div className={styles.controlsHelp}>
          <button
            className={styles.controlsToggle}
            onClick={() => setShowHelp(!showHelp)}
          >
            ⌨ {showHelp ? '▾' : '▸'}
          </button>
          {showHelp && (
            <div className={styles.controlsList}>
              {SHORTCUTS.map(([key, desc]) => (
                <div key={key} className={styles.shortcutRow}>
                  <kbd className={styles.kbd}>{key}</kbd>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
