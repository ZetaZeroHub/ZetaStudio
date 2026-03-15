import { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Application } from 'pixi.js';
import { renderAll, destroyAll, drawSelectionBox, clearSelectionBox, getPixiObjectMap } from '../../engine/pixiRenderer';

import useEditorStore from '../../stores/editorStore';
import useI18nStore from '../../stores/i18nStore';
import styles from './GameCanvas.module.css';

export default function GameCanvas({ mode, canvasBg }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const initIdRef = useRef(0);
  const [loading, setLoading] = useState(false);

  const elements = useEditorStore(s => s.elements);
  const selectedElementId = useEditorStore(s => s.selectedElementId);
  const variables = useEditorStore(s => s.variables);
  const activeSceneId = useEditorStore(s => s.activeSceneId);
  const scenes = useEditorStore(s => s.scenes);

  const destroyApp = useCallback(() => {
    if (appRef.current) {
      try {
        if (appRef.current.__ro) appRef.current.__ro.disconnect();
        destroyAll(appRef.current);
        appRef.current.destroy(true, { children: true });
      } catch (e) {
        console.warn('PixiJS cleanup:', e);
      }
      appRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  // Initialize PixiJS app
  const initApp = useCallback(async () => {
    destroyApp();
    if (!containerRef.current) return;

    const currentId = ++initIdRef.current;
    setLoading(true);

    try {
      const app = new Application();
      await app.init({
        width: 800,
        height: 600,
        backgroundColor: canvasBg || 0x111827,
        antialias: true,
      });

      if (currentId !== initIdRef.current) {
        app.destroy(true, { children: true });
        return;
      }

      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      // Apply scene background (canvasBg prop takes precedence as fallback)
      const sceneBackground = useEditorStore.getState().getActiveSceneBackground();
      if (sceneBackground) {
        if (sceneBackground.type === 'color' && sceneBackground.color) {
          // If canvasBg is provided and scene bg is the default dark color, use canvasBg instead
          const isDefaultDark = sceneBackground.color === '#111827' || sceneBackground.color === 0x111827;
          app.renderer.background.color = (canvasBg && isDefaultDark) ? canvasBg : sceneBackground.color;
        }
        if (sceneBackground.type === 'image' && sceneBackground.imageUrl) {
          try {
            const bgTexture = await PIXI.Assets.load(sceneBackground.imageUrl);
            const bgSprite = new PIXI.Sprite(bgTexture);
            bgSprite.width = app.screen.width;
            bgSprite.height = app.screen.height;
            bgSprite.zIndex = -1000;
            app.stage.addChildAt(bgSprite, 0);
          } catch (e) {
            console.warn('Failed to load background image:', e);
          }
        }
      }

      // Render elements
      const isEdit = mode === 'edit';
      const pixiMap = renderAll(app, elements, variables, isEdit);

      // Edit mode: enable unified interactions via stage delegation
      if (isEdit) {
        setupEditInteractions(app);
      }

      // Preview mode: execute user scripts
      if (mode === 'preview') {
        useEditorStore.getState().initVariables();
        
        const store = useEditorStore.getState();
        const scripts = store.scripts || [];
        
        // Execute scripts safely
        scripts.forEach(script => {
          try {
            // Build a function context providing Pixi and game globals
            const executor = new Function(
              'app',
              'PIXI',
              'elements',
              'store',
              'variables',
              'setVariable',
              'switchScene',
              'getCurrentSceneId',
              'getSceneList',
              script.content
            );
            
            // elements object where keys are element IDs and values are Pixi DisplayObjects
            const elementsObj = {};
            for (const [id, obj] of pixiMap.entries()) {
              elementsObj[id] = obj;
            }

            // Scene management API for scripts
            const switchScene = (sceneId) => {
              useEditorStore.getState().switchScene(sceneId);
            };
            const getCurrentSceneId = () => useEditorStore.getState().activeSceneId;
            const getSceneList = () => useEditorStore.getState().scenes.map(s => ({ id: s.id, name: s.name }));

            executor(appRef.current, PIXI, elementsObj, store, store.variables, store.setVariable, switchScene, getCurrentSceneId, getSceneList);
          } catch (err) {
            console.error(`Error executing script "${script.name}":`, err);
          }
        });
      }

      // Draw selection box for selected element
      if (isEdit && selectedElementId) {
        drawSelectionBox(app, selectedElementId);
      }
    } catch (e) {
      console.error('PixiJS initialization error:', e);
      if (containerRef.current) {
        const errDiv = document.createElement('div');
        errDiv.style.cssText = `
          position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          color:#ef4444;font-family:monospace;font-size:14px;padding:20px;text-align:center;background:rgba(0,0,0,0.8);
        `;
        errDiv.textContent = `❌ 渲染错误: ${e.message}`;
        containerRef.current.appendChild(errDiv);
      }
    } finally {
      setLoading(false);
    }
  }, [mode, destroyApp, canvasBg]); // Removed elements from dependencies!

  // Separate effect to sync elements gracefully without destroying the app
  useEffect(() => {
    if (!appRef.current) return;
    if (mode === 'preview') return; // Do not sync from store during preview, physics drives state
    import('../../engine/pixiRenderer').then(({ syncElements }) => {
      syncElements(appRef.current, elements, variables, true);
      if (selectedElementId) {
        drawSelectionBox(appRef.current, selectedElementId);
      }
    });
  }, [elements, variables, selectedElementId, mode]);

  // Setup edit mode interactions using Global Canvas Events
  const setupEditInteractions = (app) => {
    let mode = 'idle'; // 'drag', 'resize'
    let dragTarget = null;
    let dragElementId = null;
    let dragOffset = { x: 0, y: 0 };
    let initialBounds = null;
    let resizeDir = null;

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;

    app.stage.on('pointerdown', (event) => {
      const target = event.target;
      
      if (target.__isResizeHandle) {
        event.stopPropagation();
        mode = 'resize';
        resizeDir = target.__resizeDir;
        dragElementId = target.__targetId;
        dragTarget = getPixiObjectMap().get(dragElementId);
        
        if (dragTarget) {
          const t = dragTarget.__elementData.transform;
          initialBounds = { x: t.x || 0, y: t.y || 0, w: t.width || 60, h: t.height || 60 };
          dragOffset.x = event.global.x;
          dragOffset.y = event.global.y;
        }
      } 
      else if (target && target.__elementId) {
        event.stopPropagation();
        mode = 'drag';
        dragElementId = target.__elementId;
        dragTarget = target;
        
        useEditorStore.getState().selectElement(dragElementId);

        const global = event.global;
        dragOffset.x = dragTarget.x - global.x;
        dragOffset.y = dragTarget.y - global.y;
      }
      else if (target === app.stage) {
        useEditorStore.getState().selectElement(null);
        clearSelectionBox(app);
      }
    });

    app.stage.on('pointermove', (event) => {
      if (!dragTarget) return;

      if (mode === 'drag') {
        const newX = Math.round(event.global.x + dragOffset.x);
        const newY = Math.round(event.global.y + dragOffset.y);
        dragTarget.x = newX;
        dragTarget.y = newY;

        // Sync to Zustand
        useEditorStore.getState().updateElement(dragElementId, { transform: { x: newX, y: newY } });
        
        // Fast selection box update
        drawSelectionBox(app, dragElementId);
      } 
      else if (mode === 'resize') {
        const dx = event.global.x - dragOffset.x;
        const dy = event.global.y - dragOffset.y;
        
        let newX = initialBounds.x;
        let newY = initialBounds.y;
        let newW = initialBounds.w;
        let newH = initialBounds.h;

        // Calculate new bounds based on corner pulled
        if (resizeDir === 'tl') { newW -= dx; newH -= dy; newX += dx/2; newY += dy/2; }
        if (resizeDir === 'tr') { newW += dx; newH -= dy; newX += dx/2; newY += dy/2; }
        if (resizeDir === 'bl') { newW -= dx; newH += dy; newX += dx/2; newY += dy/2; }
        if (resizeDir === 'br') { newW += dx; newH += dy; newX += dx/2; newY += dy/2; }
        
        // Ensure positive size
        newW = Math.max(10, Math.round(newW));
        newH = Math.max(10, Math.round(newH));
        
        // Only update x/y if width/height wasn't clamped
        if (newW > 10) newX = Math.round(newX);
        if (newH > 10) newY = Math.round(newY);

        useEditorStore.getState().updateElement(dragElementId, { transform: { x: newX, y: newY, width: newW, height: newH } });
      }
    });

    const stopInteraction = () => {
      mode = 'idle';
      dragTarget = null;
    };
    
    app.stage.on('pointerup', stopInteraction);
    app.stage.on('pointerupoutside', stopInteraction);
  };

  // Re-render when mode changes
  useEffect(() => {
    initApp();
    return () => destroyApp();
  }, [mode, activeSceneId]);

  // Auto-focus canvas in preview mode
  useEffect(() => {
    if (mode === 'preview' && containerRef.current) {
      containerRef.current.focus();
    }
  }, [mode]);

  const { t } = useI18nStore();

  return (
    <div 
      className={styles.canvasWrapper}
      tabIndex={0}
      style={{ outline: 'none' }}
      ref={containerRef}
      id="game-canvas-container"
    >
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
