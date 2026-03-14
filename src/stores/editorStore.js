import { create } from 'zustand';

// Element factory
const MESH_TYPES = ['box', 'sphere', 'plane', 'cylinder', 'importedModel'];
export function createNewElement(category, type, overrides = {}) {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const actualCategory = MESH_TYPES.includes(type) ? 'mesh' : category;
  const defaults = getElementDefaults(actualCategory, type);
  return { id, category: actualCategory, type, ...defaults, ...overrides };
}

function getElementDefaults(category, type) {
  const base = {
    name: '新元素',
    visible: true,
    locked: false,
    transform: { x: 400, y: 300, width: 60, height: 60, rotation: 0, scaleX: 1, scaleY: 1, anchorX: 0.5, anchorY: 0.5, depth: 10 },
    style: { fillColor: '#6366f1', alpha: 1, shape: 'rect', borderRadius: 0, strokeColor: '', strokeWidth: 0 },
    textContent: { text: '', fontSize: 20, fontFamily: 'Arial', color: '#ffffff', align: 'left', bold: false },
    physics: { velocityX: 0, velocityY: 0, gravity: 0, mass: 1, friction: 0, bounce: 0, floorY: 540 },
    behaviors: [],
  };

  const typeDefaults = {
    background: { name: '背景', transform: { ...base.transform, x: 0, y: 0, width: 800, height: 600, depth: 0 }, style: { ...base.style, fillColor: '#111827' } },
    tilingBg: { name: '滚动背景', transform: { ...base.transform, x: 0, y: 0, width: 800, height: 600, depth: 1 }, style: { ...base.style, fillColor: '#0a0e1a', scrollSpeedX: 1, scrollSpeedY: 0 } },
    particles: { name: '粒子效果', transform: { ...base.transform, x: 0, y: 0, width: 800, height: 600, depth: 2 }, style: { ...base.style, fillColor: '#ffffff', particleCount: 50, particleSize: 2 } },
    graphics: { name: '图形', style: { ...base.style, shape: 'rect' } },
    image: { name: '图片', style: { ...base.style, fillColor: '#06b6d4' } },
    text: { name: '文字', textContent: { ...base.textContent, text: '文字内容' }, transform: { ...base.transform, depth: 50 } },
    container: { name: '容器' },
    animatedSprite: { name: '动画精灵', style: { ...base.style, fillColor: '#f59e0b', frameCount: 4, animSpeed: 0.5 } },
    // 3D element defaults
    box: { name: '3D方块', transform: { x: 0, y: 0, z: 0, width: 1, height: 1, depth: 1, rotationX: 0, rotationY: 0, rotationZ: 0 }, style: { color: '#00afcc', material: 'standard' } },
    sphere: { name: '3D球体', transform: { x: 0, y: 0, z: 0, radius: 1, rotationX: 0, rotationY: 0, rotationZ: 0 }, style: { color: '#00afcc', material: 'standard' } },
    perspectiveCamera: { name: '3D摄像机', transform: { x: 0, y: 5, z: 10, targetX: 0, targetY: 0, targetZ: 0 }, style: { fov: 75, near: 0.1, far: 1000 } },
    ambientLight: { name: '环境光', transform: { x: 0, y: 0, z: 0 }, style: { color: '#ffffff', intensity: 0.5 } },
    directionalLight: { name: '平行光', transform: { x: 5, y: 10, z: 5 }, style: { color: '#ffffff', intensity: 1, castShadow: true, shadowMapSize: 1024, shadowBias: -0.001, shadowRadius: 2, shadowCameraBounds: 20, shadowCameraFar: 100, targetX: 0, targetY: 0, targetZ: 0 } },
    pointLight: { name: '点光源', transform: { x: 0, y: 5, z: 0 }, style: { color: '#ffffff', intensity: 1, distance: 0, decay: 2, castShadow: false } },
    spotLight: { name: '聚光灯', transform: { x: 0, y: 10, z: 0 }, style: { color: '#ffffff', intensity: 1, distance: 0, angle: 45, penumbra: 0.1, decay: 2, castShadow: true, targetX: 0, targetY: 0, targetZ: 0 } },
    hemisphereLight: { name: '半球光', transform: { x: 0, y: 0, z: 0 }, style: { color: '#87ceeb', groundColor: '#362907', intensity: 0.6 } },
    skybox: { name: '天空盒', transform: { x: 0, y: 0, z: 0 }, style: { skyType: 'color', skyColor: '#111827', imageUrl: '' } },
    plane: { name: '3D平面', transform: { x: 0, y: 0, z: 0, width: 10, height: 10, rotationX: -1.5708, rotationY: 0, rotationZ: 0 }, style: { color: '#808080', material: 'standard' } },
    cylinder: { name: '3D圆柱', transform: { x: 0, y: 0, z: 0, radiusTop: 0.5, radiusBottom: 0.5, height: 2, rotationX: 0, rotationY: 0, rotationZ: 0 }, style: { color: '#00afcc', material: 'standard' } },
    importedModel: { name: '导入模型', transform: { x: 0, y: 0, z: 0, scaleX: 1, scaleY: 1, scaleZ: 1, rotationX: 0, rotationY: 0, rotationZ: 0 }, style: { modelUrl: '', modelFileName: '', material: 'standard' } },
    button: { name: '按钮', textContent: { ...base.textContent, text: '按钮', fontSize: 16 }, transform: { ...base.transform, width: 120, height: 40, depth: 60 }, style: { ...base.style, borderRadius: 8 } },
    keyboardEvent: { name: '键盘事件' },
    collisionRule: { name: '碰撞规则' },
    timerEvent: { name: '定时器' },
    clickEvent: { name: '点击事件' },
    variable: { name: 'score', dataValue: 0 },
    uiBinding: { name: 'UI绑定' },
  };

  return { ...base, ...(typeDefaults[type] || {}) };
}

// Helper: create a default scene object
function createDefaultScene(name = '场景 1', elements = [], scripts = null) {
  const id = `scene_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const defaultScripts = scripts || [{ id: 's_main', name: 'main.js', content: '// 游戏主脚本\n\napp.ticker.add((ticker) => {\n  // 每帧更新逻辑\n});\n' }];
  return {
    id,
    name,
    background: { type: 'color', color: '#111827', imageUrl: '' },
    elements: elements,
    scripts: defaultScripts,
  };
}

// Helper: get active scene from state
function getActiveScene(state) {
  return state.scenes.find(s => s.id === state.activeSceneId) || state.scenes[0];
}

// Helper: update active scene with a modification function
function updateActiveScene(state, modifier) {
  const newScenes = state.scenes.map(s => {
    if (s.id === state.activeSceneId) {
      return modifier(s);
    }
    return s;
  });
  const active = newScenes.find(s => s.id === state.activeSceneId) || newScenes[0];
  return {
    scenes: newScenes,
    // Keep elements/scripts in sync for backward compatibility
    elements: active.elements,
    scripts: active.scripts,
  };
}

const useEditorStore = create((set, get) => ({
  currentProject: null,
  dimension: '2D',
  
  // === Multi-scene state ===
  scenes: [],
  activeSceneId: null,
  
  // === Backward-compatible flat accessors (always mirror active scene) ===
  elements: [],
  scripts: [],
  
  code: '', // kept for backwards compatibility but unused
  selectedElementId: null,
  activeScriptId: null,
  mode: 'edit',
  activeTab: 'sprite', // 'scene' | 'sprite' | 'event' | 'data'
  aiMessages: [],
  aiLoading: false,

  // Game variables (runtime)
  variables: {},

  initEditor: (project, templateData) => {
    const rawElements = project.elements?.length > 0
      ? project.elements
      : (templateData?.elements || []);
    
    // Load scripts or fallback
    const defaultScripts = [{ id: 's_main', name: 'main.js', content: '// 游戏主脚本\n\napp.ticker.add((ticker) => {\n  // 每帧更新逻辑\n});\n' }];
    const rawScripts = project.scripts?.length > 0 
      ? project.scripts 
      : (templateData?.scripts || defaultScripts);

    const dimension = project.dimension || templateData?.dimension || '2D';

    // === Backward-compatible migration ===
    // If project already has scenes array, use it; otherwise, migrate flat format
    let scenes;
    if (project.scenes?.length > 0) {
      scenes = project.scenes;
    } else {
      scenes = [createDefaultScene('场景 1', rawElements, rawScripts)];
    }

    const activeSceneId = scenes[0].id;
    const activeScene = scenes[0];

    set({
      currentProject: project,
      dimension,
      scenes,
      activeSceneId,
      elements: activeScene.elements,
      scripts: activeScene.scripts,
      activeScriptId: activeScene.scripts[0]?.id || null,
      code: '',
      selectedElementId: null,
      mode: 'edit',
      activeTab: 'sprite',
      aiMessages: [],
      aiLoading: false,
      variables: {},
    });
  },

  // ========== Scene Management ==========

  addScene: (name) => {
    const newScene = createDefaultScene(name || `场景 ${get().scenes.length + 1}`);
    set((state) => ({
      scenes: [...state.scenes, newScene],
    }));
    // Optionally auto-switch to the new scene
    get().switchScene(newScene.id);
  },

  removeScene: (id) => {
    const state = get();
    if (state.scenes.length <= 1) return; // Prevent deleting last scene
    const idx = state.scenes.findIndex(s => s.id === id);
    const newScenes = state.scenes.filter(s => s.id !== id);
    let newActiveId = state.activeSceneId;
    if (state.activeSceneId === id) {
      newActiveId = newScenes[Math.max(0, idx - 1)]?.id || newScenes[0]?.id;
    }
    const active = newScenes.find(s => s.id === newActiveId) || newScenes[0];
    set({
      scenes: newScenes,
      activeSceneId: newActiveId,
      elements: active.elements,
      scripts: active.scripts,
      activeScriptId: active.scripts[0]?.id || null,
      selectedElementId: null,
    });
  },

  switchScene: (id) => {
    const state = get();
    const target = state.scenes.find(s => s.id === id);
    if (!target) return;
    set({
      activeSceneId: id,
      elements: target.elements,
      scripts: target.scripts,
      activeScriptId: target.scripts[0]?.id || null,
      selectedElementId: null,
    });
  },

  renameScene: (id, newName) => {
    set((state) => ({
      scenes: state.scenes.map(s => s.id === id ? { ...s, name: newName } : s),
    }));
  },

  updateSceneBackground: (bgUpdates) => {
    set((state) => {
      const newScenes = state.scenes.map(s => {
        if (s.id === state.activeSceneId) {
          return { ...s, background: { ...s.background, ...bgUpdates } };
        }
        return s;
      });
      return { scenes: newScenes };
    });
  },

  getActiveSceneBackground: () => {
    const state = get();
    const scene = state.scenes.find(s => s.id === state.activeSceneId);
    return scene?.background || { type: 'color', color: '#111827', imageUrl: '' };
  },

  // ========== Element Operations (operate on active scene) ==========

  setElements: (elements) => {
    set((state) => updateActiveScene(state, (s) => ({ ...s, elements })));
  },

  addElement: (element) => {
    set((state) => updateActiveScene(state, (s) => ({
      ...s,
      elements: [...s.elements, element],
    })));
  },

  updateElement: (id, updates) => {
    set((state) => {
      const modifier = (s) => {
        const newElements = s.elements.map((el) => {
          if (el.id !== id) return el;
          const merged = { ...el };
          for (const key of Object.keys(updates)) {
            if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && updates[key] !== null && el[key]) {
              merged[key] = { ...el[key], ...updates[key] };
            } else {
              merged[key] = updates[key];
            }
          }
          return merged;
        });
        return { ...s, elements: newElements };
      };
      return updateActiveScene(state, modifier);
    });
  },

  removeElement: (id) => {
    set((state) => {
      const result = updateActiveScene(state, (s) => ({
        ...s,
        elements: s.elements.filter((el) => el.id !== id),
      }));
      return {
        ...result,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      };
    });
  },

  duplicateElement: (id) => {
    const el = get().elements.find(e => e.id === id);
    if (!el) return;
    const newEl = {
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: el.name + ' (副本)',
      transform: { ...el.transform, x: (el.transform?.x || 0) + 20, y: (el.transform?.y || 0) + 20 },
    };
    get().addElement(newEl);
  },

  moveElement: (id, direction) => {
    set((state) => {
      const modifier = (s) => {
        const idx = s.elements.findIndex(e => e.id === id);
        if (idx < 0) return s;
        const newElements = [...s.elements];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= newElements.length) return s;
        [newElements[idx], newElements[targetIdx]] = [newElements[targetIdx], newElements[idx]];
        return { ...s, elements: newElements };
      };
      return updateActiveScene(state, modifier);
    });
  },

  selectElement: (id) => set({ selectedElementId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ========== Script Operations (operate on active scene) ==========

  setActiveScriptId: (id) => set({ activeScriptId: id }),
  
  addScript: () => {
    const id = `s_${Date.now()}`;
    set((state) => {
      const scene = getActiveScene(state);
      const copyNum = scene.scripts.filter(s => s.name.startsWith('script')).length + 1;
      const newScript = { id, name: `script${copyNum}.js`, content: '// 新脚本\n' };
      const result = updateActiveScene(state, (s) => ({
        ...s,
        scripts: [...s.scripts, newScript],
      }));
      return { ...result, activeScriptId: id };
    });
  },

  updateScript: (id, updates) => {
    set((state) => updateActiveScene(state, (s) => ({
      ...s,
      scripts: s.scripts.map(sc => sc.id === id ? { ...sc, ...updates } : sc),
    })));
  },

  removeScript: (id) => {
    set((state) => {
      const scene = getActiveScene(state);
      if (scene.scripts.length <= 1) return state; // Prevent deleting last script
      const idx = scene.scripts.findIndex(s => s.id === id);
      const result = updateActiveScene(state, (s) => ({
        ...s,
        scripts: s.scripts.filter(sc => sc.id !== id),
      }));
      let newActiveId = state.activeScriptId;
      if (state.activeScriptId === id) {
        const remaining = scene.scripts.filter(sc => sc.id !== id);
        newActiveId = remaining[Math.max(0, idx - 1)]?.id || remaining[0]?.id;
      }
      return { ...result, activeScriptId: newActiveId };
    });
  },

  setMode: (mode) => set({ mode }),
  toggleMode: () => set((state) => ({ mode: state.mode === 'edit' ? 'preview' : 'edit' })),

  // Variables
  setVariable: (name, value) => set((state) => ({ variables: { ...state.variables, [name]: value } })),
  initVariables: () => {
    const vars = {};
    get().elements.filter(e => e.category === 'data' && e.type === 'variable').forEach(e => {
      vars[e.name] = e.dataValue ?? 0;
    });
    set({ variables: vars });
  },

  // AI messages
  addAiMessage: (msg) => set((state) => ({ aiMessages: [...state.aiMessages, msg] })),
  setAiLoading: (loading) => set({ aiLoading: loading }),
  clearAiMessages: () => set({ aiMessages: [] }),

  clearEditor: () => set({
    currentProject: null, scenes: [], activeSceneId: null,
    elements: [], scripts: [], activeScriptId: null, selectedElementId: null,
    mode: 'edit', activeTab: 'sprite', aiMessages: [], aiLoading: false, variables: {},
  }),

  getProjectData: () => {
    const { currentProject, scenes } = get();
    // Save in the new scenes format
    return { ...currentProject, scenes, updatedAt: Date.now() };
  },
}));

export default useEditorStore;
