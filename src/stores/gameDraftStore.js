/* ========================================
   gameDraftStore — AI游戏创作编辑器草稿管理
   基于 Zustand，兼容 projectStore 数据模式
   ======================================== */
import { create } from 'zustand';

const STORAGE_KEY = 'game_drafts_v1';
const SAVES_KEY = 'game_saves_v1';

function loadDraftsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function loadSavesFromStorage() {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistSaves(saves) {
  try {
    localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
  } catch (e) {
    console.warn('Failed to persist saves', e);
  }
}

function persistDrafts(drafts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (e) {
    console.warn('Failed to persist drafts', e);
  }
}

const useGameDraftStore = create((set, get) => ({
  drafts: [],
  saves: [],  // separate save records (not shown in level list)
  currentDraft: null,
  mode: 'edit', // 'edit' | 'preview'
  selectedTool: 'select', // 'select' | 'brush' | 'eraser'
  brushMode: 'continuous', // 'continuous' (drag paint) | 'single' (place one, switch to select)
  selectedTile: null,    // current tile being painted
  selectedEntity: null,  // current entity type being placed

  // ── Load all drafts + saves from localStorage ──
  loadDrafts: () => {
    const drafts = loadDraftsFromStorage();
    const saves = loadSavesFromStorage();
    set({ drafts, saves });
  },

  // ── Create a new draft from a base level ──
  createDraft: (name, templateType, baseLevelData) => {
    const draft = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name || '我的关卡',
      templateType, // 'platformer' | 'topdown'
      baseLevelId: baseLevelData?.id || null,
      levelData: JSON.parse(JSON.stringify(baseLevelData || {})),
      thumbnail: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const drafts = [...get().drafts, draft];
    set({ drafts, currentDraft: draft });
    persistDrafts(drafts);
    return draft;
  },

  // ── Open a draft for editing ──
  openDraft: (draftId) => {
    const draft = get().drafts.find(d => d.id === draftId);
    if (draft) {
      set({ currentDraft: JSON.parse(JSON.stringify(draft)), mode: 'edit' });
    }
    return draft;
  },

  // ── Save current draft (deep clone to ensure independence) ──
  saveDraft: () => {
    const { currentDraft } = get();
    if (!currentDraft) return;
    // Deep clone the entire draft to break all shared references
    const updated = JSON.parse(JSON.stringify({ ...currentDraft, updatedAt: Date.now() }));
    console.log('[gameDraftStore] Saving draft:', updated.id, updated.name);
    const drafts = get().drafts.map(d =>
      d.id === updated.id ? updated : d
    );
    // If not in drafts list yet, add it
    if (!drafts.find(d => d.id === updated.id)) {
      drafts.push(updated);
    }
    set({ drafts, currentDraft: updated });
    persistDrafts(drafts);
  },

  // ── Delete a draft ──
  deleteDraft: (draftId) => {
    const drafts = get().drafts.filter(d => d.id !== draftId);
    set({
      drafts,
      currentDraft: get().currentDraft?.id === draftId ? null : get().currentDraft,
    });
    persistDrafts(drafts);
  },

  // ── Save record (separate storage, auto-naming) ──
  saveRecord: (customName) => {
    const { currentDraft, saves } = get();
    if (!currentDraft) return;
    // Auto-generate name if not provided: "关卡名-1", "关卡名-2"...
    const baseName = customName || currentDraft.name || '我的关卡';
    const existingCount = saves.filter(s => s.name && s.name.startsWith(baseName.replace(/-\d+$/, ''))).length;
    const saveName = customName || `${baseName.replace(/-\d+$/, '')}-${existingCount + 1}`;

    const saveEntry = {
      id: `save_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      draftId: currentDraft.id,
      name: saveName,
      templateType: currentDraft.templateType,
      baseLevelId: currentDraft.baseLevelId,
      levelData: JSON.parse(JSON.stringify(currentDraft.levelData)),
      createdAt: Date.now(),
    };
    const newSaves = [saveEntry, ...saves];
    set({ saves: newSaves });
    persistSaves(newSaves);
    // Also update the draft in main storage
    get().saveDraft();
    console.log('[gameDraftStore] Saved record:', saveName);
    return saveName;
  },

  // ── Load a save record into current draft ──
  loadSaveRecord: (saveId) => {
    const save = get().saves.find(s => s.id === saveId);
    if (!save) return;
    const { currentDraft } = get();
    if (!currentDraft) return;
    set({
      currentDraft: {
        ...currentDraft,
        levelData: JSON.parse(JSON.stringify(save.levelData)),
        name: save.name,
      },
    });
    console.log('[gameDraftStore] Loaded save record:', save.name);
  },

  // ── Delete a save record ──
  deleteSave: (saveId) => {
    const saves = get().saves.filter(s => s.id !== saveId);
    set({ saves });
    persistSaves(saves);
  },

  // ── Publish (mark as published + save) ──
  publishDraft: (name) => {
    const { currentDraft } = get();
    if (!currentDraft) return;
    set({
      currentDraft: {
        ...currentDraft,
        name: name || currentDraft.name,
        published: true,
        publishedAt: Date.now(),
      },
    });
    get().saveDraft();
    console.log('[gameDraftStore] Published:', currentDraft.id);
  },

  // ── Update level data ──
  updateLevelData: (updates) => {
    set((state) => {
      if (!state.currentDraft) return state;
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, ...updates },
        },
      };
    });
  },

  // ── Platform operations ──
  addPlatform: (platform) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const platforms = [...(state.currentDraft.levelData.platforms || []), platform];
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, platforms },
        },
      };
    });
  },

  removePlatform: (index) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const platforms = (state.currentDraft.levelData.platforms || []).filter((_, i) => i !== index);
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, platforms },
        },
      };
    });
  },

  updatePlatform: (index, updates) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const platforms = (state.currentDraft.levelData.platforms || []).map((p, i) =>
        i === index ? { ...p, ...updates } : p
      );
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, platforms },
        },
      };
    });
  },

  // ── Item operations ──
  addItem: (item) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const items = [...(state.currentDraft.levelData.items || []), item];
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, items },
        },
      };
    });
  },

  removeItem: (index) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const items = (state.currentDraft.levelData.items || []).filter((_, i) => i !== index);
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, items },
        },
      };
    });
  },

  updateItem: (index, updates) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const items = (state.currentDraft.levelData.items || []).map((it, i) =>
        i === index ? { ...it, ...updates } : it
      );
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, items },
        },
      };
    });
  },

  // ── Enemy operations ──
  addEnemy: (enemy) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const enemies = [...(state.currentDraft.levelData.enemies || []), enemy];
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, enemies },
        },
      };
    });
  },

  removeEnemy: (index) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const enemies = (state.currentDraft.levelData.enemies || []).filter((_, i) => i !== index);
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, enemies },
        },
      };
    });
  },

  updateEnemy: (index, updates) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const enemies = (state.currentDraft.levelData.enemies || []).map((en, i) =>
        i === index ? { ...en, ...updates } : en
      );
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, enemies },
        },
      };
    });
  },

  // ── Interactable operations ──
  addInteractable: (interactable) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const interactables = [...(state.currentDraft.levelData.interactables || []), interactable];
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, interactables },
        },
      };
    });
  },

  removeInteractable: (index) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const interactables = (state.currentDraft.levelData.interactables || []).filter((_, i) => i !== index);
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, interactables },
        },
      };
    });
  },

  updateInteractable: (index, updates) => {
    set((state) => {
      if (!state.currentDraft) return state;
      const interactables = (state.currentDraft.levelData.interactables || []).map((obj, i) =>
        i === index ? { ...obj, ...updates } : obj
      );
      return {
        currentDraft: {
          ...state.currentDraft,
          levelData: { ...state.currentDraft.levelData, interactables },
        },
      };
    });
  },

  // ── Editor state ──
  setMode: (mode) => set({ mode }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setBrushMode: (brushMode) => set({ brushMode }),
  setSelectedTile: (tile) => set({ selectedTile: tile }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),

  // ── Cleanup ──
  closeDraft: () => set({ currentDraft: null, mode: 'edit', selectedTool: 'select', brushMode: 'continuous', selectedTile: null, selectedEntity: null }),
}));

export default useGameDraftStore;
