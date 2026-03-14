import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import zh from '../locales/zh';
import en from '../locales/en';

const dictionaries = { zh, en };

const useI18nStore = create(
  persist(
    (set, get) => ({
      language: 'zh', // default language
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const { language } = get();
        const dict = dictionaries[language] || dictionaries['zh'];
        const keys = key.split('.');
        let result = dict;
        for (const k of keys) {
          if (result && result[k] !== undefined) {
            result = result[k];
          } else {
            return key; // Fallback to key if translation not found
          }
        }
        return result;
      },
    }),
    {
      name: 'i18n-storage',
    }
  )
);

export default useI18nStore;
