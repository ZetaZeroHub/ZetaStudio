import { create } from 'zustand';

const useAppStore = create((set) => ({
  // 'simple' = 儿童简易模式, 'pro' = 专业模式
  appMode: localStorage.getItem('zetaAppMode') || null, // null = 未选择，显示选择器
  
  setAppMode: (mode) => {
    localStorage.setItem('zetaAppMode', mode);
    set({ appMode: mode });
  },
}));

export default useAppStore;
