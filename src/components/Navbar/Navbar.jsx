import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Globe, Github, Settings, Sun, Moon } from 'lucide-react';
import useI18nStore from '../../stores/i18nStore';
import useThemeStore from '../../stores/themeStore';
import SettingsModal from '../SettingsModal/SettingsModal';
import styles from './Navbar.module.css';

const NAV_TABS = [
  { key: '/', label: '游戏开发', labelEn: 'Home' },
  { key: '/art-studio', label: '美术资产', labelEn: 'AI Art Studio' },
];

export default function Navbar({ children, hideBrand = false, leftContent }) {
  const { language, setLanguage, t } = useI18nStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <>
      <nav className={styles.navbar}>
        {hideBrand ? (
          leftContent || null
        ) : (
          <div className={styles.navLeft}>
            <Link to="/" className={styles.navBrand}>
              <Sparkles className={styles.navLogo} size={20} strokeWidth={2.5} />
              <span>{t('nav.brand')}</span>
            </Link>
            <div className={styles.navTabs}>
              {NAV_TABS.map(tab => (
                <Link
                  key={tab.key}
                  to={tab.key}
                  className={`${styles.navTab} ${location.pathname === tab.key ? styles.navTabActive : ''}`}
                >
                  {language === 'zh' ? tab.label : tab.labelEn}
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className={styles.navRight}>
          <div className={styles.navActions}>
            {children}
          </div>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            title={theme === 'dark' ? '切换到白天模式' : '切换到暗色模式'}
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>
          <button
            className={styles.settingsBtn}
            onClick={() => setShowSettings(true)}
            title={language === 'zh' ? 'AI 模型设置' : 'AI Settings'}
          >
            <Settings size={18} strokeWidth={2} />
          </button>
          <a
            href="https://github.com/ZetaZeroHub/ZetaStudio"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            title="GitHub"
          >
            <Github size={18} strokeWidth={2} />
          </a>
          <button className={styles.langToggle} onClick={toggleLanguage} title={language === 'zh' ? 'Switch to English' : '切换到中文'}>
            <Globe size={18} strokeWidth={2} />
            <span>{language === 'zh' ? 'EN' : '中'}</span>
          </button>
        </div>
      </nav>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

