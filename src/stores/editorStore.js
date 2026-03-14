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
    directionalLight: { name: '平行光', transform: { x: 5, y: 10, z: 5 }, style: { color: '#ffffff', intensity: 1, castShadow: true } },
    pointLight: { name: '点光源', transform: { x: 0, y: 5, z: 0 }, style: { color: '#ffffff', intensity: 1, distance: 0 } },
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

const useEditorStore = create((set, get) => ({
  currentProject: null,
  dimension: '2D',
  elements: [],
  code: '', // kept for backwards compatibility but unused
  scripts: [],
  selectedElementId: null,
  activeScriptId: null,
  mode: 'edit',
  activeTab: 'sprite', // 'scene' | 'sprite' | 'event' | 'data'
  aiMessages: [],
  aiLoading: false,

  // Game variables (runtime)
  variables: {},

  initEditor: (project, templateData) => {
    const elements = project.elements?.length > 0
      ? project.elements
      : (templateData?.elements || []);
    
    // Load scripts or fallback
    const defaultScripts = [{ id: 's_main', name: 'main.js', content: '// 游戏主脚本\n\napp.ticker.add((ticker) => {\n  // 每帧更新逻辑\n});\n' }];
    const scripts = project.scripts?.length > 0 
      ? project.scripts 
      : (templateData?.scripts || defaultScripts);

    const dimension = project.dimension || templateData?.dimension || '2D';

    set({
      currentProject: project,
      dimension,
      elements,
      scripts,
      activeScriptId: scripts[0]?.id || null,
      code: '',
      selectedElementId: null,
      mode: 'edit',
      activeTab: 'sprite',
      aiMessages: [],
      aiLoading: false,
      variables: {},
    });
  },

  // Element operations
  setElements: (elements) => {
    set({ elements });
  },

  addElement: (element) => {
    set((state) => ({ elements: [...state.elements, element] }));
  },

  updateElement: (id, updates) => {
    set((state) => {
      const newElements = state.elements.map((el) => {
        if (el.id !== id) return el;
        // Deep merge for nested objects
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
      return { elements: newElements };
    });
  },

  removeElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    }));
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
      const idx = state.elements.findIndex(e => e.id === id);
      if (idx < 0) return state;
      const newElements = [...state.elements];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newElements.length) return state;
      [newElements[idx], newElements[targetIdx]] = [newElements[targetIdx], newElements[idx]];
      return { elements: newElements };
    });
  },

  selectElement: (id) => set({ selectedElementId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Script operations
  setActiveScriptId: (id) => set({ activeScriptId: id }),
  
  addScript: () => {
    const id = `s_${Date.now()}`;
    set((state) => {
      const copyNum = state.scripts.filter(s => s.name.startsWith('script')).length + 1;
      const newScript = { id, name: `script${copyNum}.js`, content: '// 新脚本\n' };
      return { 
        scripts: [...state.scripts, newScript],
        activeScriptId: id
      };
    });
  },

  updateScript: (id, updates) => {
    set((state) => ({
      scripts: state.scripts.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  },

  removeScript: (id) => {
    set((state) => {
      if (state.scripts.length <= 1) return state; // Prevent deleting last script
      const idx = state.scripts.findIndex(s => s.id === id);
      const newScripts = state.scripts.filter(s => s.id !== id);
      let newActiveId = state.activeScriptId;
      if (state.activeScriptId === id) {
         newActiveId = newScripts[Math.max(0, idx - 1)]?.id || newScripts[0]?.id;
      }
      return { scripts: newScripts, activeScriptId: newActiveId };
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
    currentProject: null, elements: [], scripts: [], activeScriptId: null, selectedElementId: null,
    mode: 'edit', activeTab: 'sprite', aiMessages: [], aiLoading: false, variables: {},
  }),

  getProjectData: () => {
    const { currentProject, elements, scripts } = get();
    return { ...currentProject, elements, scripts, updatedAt: Date.now() };
  },
}));

export default useEditorStore;
