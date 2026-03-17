import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * LLM Provider Store
 * Manages LLM provider configurations, persisted to localStorage.
 * Supports OpenAI-compatible APIs (SiliconFlow, DeepSeek, etc.) and Ollama.
 */

const DEFAULT_PROVIDERS = [
  {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow',
    protocol: 'openai',       // 'openai' | 'ollama'
    apiBase: 'https://api.siliconflow.cn/v1',
    apiKey: '',
    models: ['Qwen/Qwen2.5-7B-Instruct'],
    defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
  },
];

const useLlmStore = create(
  persist(
    (set, get) => ({
      providers: [...DEFAULT_PROVIDERS],
      activeProviderId: 'siliconflow',
      activeModel: 'Qwen/Qwen2.5-7B-Instruct',
      aiMode: 'act', // 'plan' | 'act'

      // Conversation history per editor session (not persisted)
      conversationHistory: [],

      // ── Computed ──
      getActiveProvider: () => {
        const { providers, activeProviderId } = get();
        return providers.find(p => p.id === activeProviderId) || providers[0];
      },

      getActiveConfig: () => {
        const provider = get().getActiveProvider();
        if (!provider) return null;
        return {
          protocol: provider.protocol,
          apiBase: provider.apiBase,
          apiKey: provider.apiKey,
          model: get().activeModel,
        };
      },

      isConfigured: () => {
        const provider = get().getActiveProvider();
        if (!provider) return false;
        if (provider.protocol === 'ollama') return !!provider.apiBase;
        return !!provider.apiKey && !!provider.apiBase;
      },

      // ── Actions ──
      setAiMode: (mode) => set({ aiMode: mode }),

      addProvider: (provider) => {
        const id = `provider_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const newProvider = {
          id,
          name: provider.name || '新供应商',
          protocol: provider.protocol || 'openai',
          apiBase: provider.apiBase || '',
          apiKey: provider.apiKey || '',
          models: provider.models || [],
          defaultModel: provider.defaultModel || '',
        };
        set((state) => ({
          providers: [...state.providers, newProvider],
        }));
        return id;
      },

      updateProvider: (id, updates) => {
        set((state) => ({
          providers: state.providers.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      removeProvider: (id) => {
        const state = get();
        if (state.providers.length <= 1) return; // Keep at least one
        set((s) => ({
          providers: s.providers.filter(p => p.id !== id),
          activeProviderId: s.activeProviderId === id
            ? s.providers.find(p => p.id !== id)?.id
            : s.activeProviderId,
        }));
      },

      setActiveProvider: (id) => {
        const provider = get().providers.find(p => p.id === id);
        if (!provider) return;
        set({
          activeProviderId: id,
          activeModel: provider.defaultModel || provider.models[0] || '',
        });
      },

      setActiveModel: (model) => set({ activeModel: model }),

      // ── Conversation History ──
      addToHistory: (message) => {
        set((state) => ({
          conversationHistory: [...state.conversationHistory, message],
        }));
      },

      clearHistory: () => set({ conversationHistory: [] }),

      // Reset to defaults
      resetProviders: () => set({
        providers: [...DEFAULT_PROVIDERS],
        activeProviderId: 'siliconflow',
        activeModel: 'Qwen/Qwen2.5-7B-Instruct',
      }),
    }),
    {
      name: 'llm-settings-storage',
      // Only persist provider config, not conversation history
      partialize: (state) => ({
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        activeModel: state.activeModel,
        aiMode: state.aiMode,
      }),
    }
  )
);

export default useLlmStore;
