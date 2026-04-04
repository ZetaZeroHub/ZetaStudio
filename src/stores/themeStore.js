import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * themeStore — 全局昼夜主题管理
 * 'dark' = 默认暗色模式
 * 'light' = Apple/OpenAI 风格纯白模式
 */
const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        console.log('[ThemeStore] 切换主题:', next);
        set({ theme: next });
      },
      setTheme: (theme) => {
        console.log('[ThemeStore] 设置主题:', theme);
        set({ theme });
      },
    }),
    {
      name: 'zeta-theme',
    }
  )
);

export default useThemeStore;
