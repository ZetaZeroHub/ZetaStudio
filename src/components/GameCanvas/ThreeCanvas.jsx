import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { renderAll, destroyAll, syncElements, drawSelectionBox, clearSelectionBox, getThreeObjectMap } from '../../engine/threeRenderer';
import useEditorStore from '../../stores/editorStore';
import useI18nStore from '../../stores/i18nStore';
import styles from './GameCanvas.module.css';

export default function ThreeCanvas({ mode }) {
  const containerRef = useRef(null);
  const canvasMountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const transformRef = useRef(null);
  const keyHandlerRef = useRef(null);
  const modeRef = useRef(mode);
  const initIdRef = useRef(0);
  const reqIdRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const elements = useEditorStore(s => s.elements);
  const selectedElementId = useEditorStore(s => s.selectedElementId);
  const variables = useEditorStore(s => s.variables);
  const { t, language } = useI18nStore();

  // Keep modeRef in sync + guard against pointer lock in edit mode
  modeRef.current = mode;
  useEffect(() => {
    const guardPointerLock = () => {
      if (modeRef.current === 'edit' && document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
    document.addEventListener('pointerlockchange', guardPointerLock);
    return () => document.removeEventListener('pointerlockchange', guardPointerLock);
  }, []);

  const destroyApp = useCallback(() => {
    if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    if (sceneRef.current) destroyAll(sceneRef.current);
    if (transformRef.current) transformRef.current.dispose();
    if (rendererRef.current) rendererRef.current.dispose();
    if (controlsRef.current) controlsRef.current.dispose();
    // Remove keyboard handler
    if (keyHandlerRef.current && containerRef.current) {
      containerRef.current.removeEventListener('keydown', keyHandlerRef.current);
      keyHandlerRef.current = null;
    }
    // Exit pointer lock if active (FPS scripts may have locked it)
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    // Remove any script-injected DOM elements from containerRef
    // (FPS scripts append HUD, crosshair, flash divs to #game-canvas-three)
    if (containerRef.current) {
      const injected = containerRef.current.querySelectorAll('div[style*="z-index"], div[style*="pointer-events"]');
      injected.forEach(el => {
        // Only remove non-React elements (those without data-reactroot or __reactFiber)
        if (!el.className && !el.dataset.reactroot) {
          el.remove();
        }
      });
    }
    if (canvasMountRef.current) canvasMountRef.current.innerHTML = '';
    sceneRef.current = null;
    rendererRef.current = null;
    cameraRef.current = null;
    controlsRef.current = null;
    transformRef.current = null;
  }, []);

  const initApp = useCallback(async () => {
    destroyApp();
    if (!canvasMountRef.current) return;

    const currentId = ++initIdRef.current;
    setLoading(true);

    try {
      const w = canvasMountRef.current.clientWidth || 800;
      const h = canvasMountRef.current.clientHeight || 600;

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
      // Enable shadow mapping for realistic lighting
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      canvasMountRef.current.appendChild(renderer.domElement);

      sceneRef.current = scene;
      rendererRef.current = renderer;

      let camera = null;
      const threeMap = renderAll(scene, elements, variables, mode === 'edit');
      
      // Process skybox elements
      for (const [, obj] of threeMap) {
        if (obj.__isSkybox && obj.__skyboxData) {
          const skyData = obj.__skyboxData;
          if (skyData.skyType === 'image' && skyData.imageUrl) {
            const loader = new THREE.TextureLoader();
            loader.load(skyData.imageUrl, (texture) => {
              texture.mapping = THREE.EquirectangularReflectionMapping;
              scene.background = texture;
              scene.environment = texture;
            });
          } else {
            scene.background = new THREE.Color(skyData.skyColor || '#111827');
          }
        }
      }
      
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

      // OrbitControls ONLY in edit mode — not in preview!
      if (mode === 'edit') {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controlsRef.current = controls;

        // TransformControls for gizmo
        const transformControls = new TransformControls(camera, renderer.domElement);
        transformControls.__isHelper = true;
        scene.add(transformControls);
        transformRef.current = transformControls;

        // Disable OrbitControls while dragging gizmo
        transformControls.addEventListener('dragging-changed', (event) => {
          controls.enabled = !event.value;
        });

        // Sync transform back to store on change
        const safeFloat = (v, fallback = 0) => {
          const n = parseFloat(v);
          return (Number.isFinite(n)) ? parseFloat(n.toFixed(3)) : fallback;
        };
        transformControls.addEventListener('objectChange', () => {
          const obj = transformControls.object;
          if (!obj || !obj.__elementId) return;
          const store = useEditorStore.getState();
          store.updateElement(obj.__elementId, {
            transform: {
              ...store.elements.find(e => e.id === obj.__elementId)?.transform,
              x: safeFloat(obj.position.x),
              y: safeFloat(obj.position.y),
              z: safeFloat(obj.position.z),
              rotationX: safeFloat(obj.rotation.x),
              rotationY: safeFloat(obj.rotation.y),
              rotationZ: safeFloat(obj.rotation.z),
              scaleX: safeFloat(obj.scale.x, 1),
              scaleY: safeFloat(obj.scale.y, 1),
              scaleZ: safeFloat(obj.scale.z, 1),
            }
          });
        });

        setupEditInteractions(scene, camera, renderer.domElement, threeMap, transformControls);
        setupKeyboardShortcuts(transformControls, camera, controls);

        if (selectedElementId) {
          attachGizmoToObject(selectedElementId, threeMap, transformControls, scene);
        }
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

      const animate = () => {
        if (currentId !== initIdRef.current) return;
        reqIdRef.current = requestAnimationFrame(animate);
        
        customApp.ticker.tasks.forEach(task => task());
        // Only update OrbitControls in edit mode
        if (mode === 'edit' && controlsRef.current) controlsRef.current.update();
        
        renderer.render(scene, camera);
      };
      
      animate();

    } catch (e) {
      console.error('ThreeJS initialization error:', e);
    } finally {
      if (currentId === initIdRef.current) setLoading(false);
    }
  }, [elements, mode, destroyApp]);

  const attachGizmoToObject = (elementId, objMap, tc, scene) => {
    if (!tc || !scene) return;
    const obj = objMap ? objMap.get(elementId) : getThreeObjectMap().get(elementId);
    if (obj) {
      tc.attach(obj);
      clearSelectionBox(scene);
      drawSelectionBox(scene, elementId);
    } else {
      tc.detach();
    }
  };

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

  const setupKeyboardShortcuts = (transformControls, camera, orbitControls) => {
    const onKeyDown = (event) => {
      // Don't intercept when typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      switch (event.key.toLowerCase()) {
        case 'g': // Grab/Move
          transformControls.setMode('translate');
          event.preventDefault();
          break;
        case 'r': // Rotate
          transformControls.setMode('rotate');
          event.preventDefault();
          break;
        case 's': // Scale
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            transformControls.setMode('scale');
          }
          break;
        case 'x': // X axis constraint
          event.preventDefault();
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
          event.preventDefault();
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
          event.preventDefault();
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
          event.preventDefault();
          const store = useEditorStore.getState();
          if (store.selectedElementId) {
            transformControls.detach();
            store.removeElement(store.selectedElementId);
          }
          break;
        }
        case '1': // Front view
          event.preventDefault();
          camera.position.set(0, 0, 10);
          camera.lookAt(0, 0, 0);
          orbitControls.target.set(0, 0, 0);
          break;
        case '3': // Right view
          event.preventDefault();
          camera.position.set(10, 0, 0);
          camera.lookAt(0, 0, 0);
          orbitControls.target.set(0, 0, 0);
          break;
        case '7': // Top view
          event.preventDefault();
          camera.position.set(0, 10, 0);
          camera.lookAt(0, 0, 0);
          orbitControls.target.set(0, 0, 0);
          break;
      }
    };

    // Attach to the outer container which has tabIndex and gets focus
    if (containerRef.current) {
      containerRef.current.addEventListener('keydown', onKeyDown);
      keyHandlerRef.current = onKeyDown;
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (rendererRef.current && canvasMountRef.current && cameraRef.current) {
         const w = canvasMountRef.current.clientWidth;
         const h = canvasMountRef.current.clientHeight;
         rendererRef.current.setSize(w, h);
         cameraRef.current.aspect = w / h;
         cameraRef.current.updateProjectionMatrix();
      }
    });
    if (canvasMountRef.current) resizeObserver.observe(canvasMountRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    initApp();
    return () => destroyApp();
  }, [mode]);

  // Sync elements without destroying — use direct import (not dynamic)
  useEffect(() => {
    if (!sceneRef.current) return;
    if (mode === 'preview') return;
    
    syncElements(sceneRef.current, elements, variables, true);
    
    if (selectedElementId && transformRef.current) {
      attachGizmoToObject(selectedElementId, null, transformRef.current, sceneRef.current);
    }
  }, [elements, variables, selectedElementId, mode]);

  useEffect(() => {
    if (sceneRef.current && mode === 'edit') {
      clearSelectionBox(sceneRef.current);
      if (selectedElementId) {
        if (transformRef.current) {
          attachGizmoToObject(selectedElementId, null, transformRef.current, sceneRef.current);
        }
      } else if (transformRef.current) {
        transformRef.current.detach();
      }
    }
  }, [selectedElementId, mode]);

  const SHORTCUTS = language === 'zh' ? [
    ['G', '移动模式'], ['R', '旋转模式'], ['S', '缩放模式'],
    ['X/Y/Z', '轴约束'], ['Del', '删除'],
    ['1/3/7', '前/右/顶视角'],
    ['鼠标左键', '选择/拖拽'], ['中键拖拽', '平移视角'], ['滚轮', '缩放视角'],
    ['右键拖拽', '旋转视角'],
  ] : [
    ['G', 'Move'], ['R', 'Rotate'], ['S', 'Scale'],
    ['X/Y/Z', 'Axis Lock'], ['Del', 'Delete'],
    ['1/3/7', 'Front/Right/Top'],
    ['Left Click', 'Select/Drag'], ['Mid Drag', 'Pan'], ['Scroll', 'Zoom'],
    ['Right Drag', 'Orbit'],
  ];

  return (
    <div className={styles.canvasWrapper} tabIndex={0} ref={containerRef} id="game-canvas-three" style={{ outline: 'none' }}>
      <div ref={canvasMountRef} style={{ width: '100%', height: '100%' }} />
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
            ⌨ {language === 'zh' ? '操作指南' : 'Controls'} {showHelp ? '▾' : '▸'}
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
