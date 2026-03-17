import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Github, Settings } from 'lucide-react';
import useI18nStore from '../../stores/i18nStore';
import SettingsModal from '../SettingsModal/SettingsModal';
import styles from './Navbar.module.css';

export default function Navbar({ children }) {
  const { language, setLanguage, t } = useI18nStore();
  const [showSettings, setShowSettings] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.navBrand}>
          <Sparkles className={styles.navLogo} size={20} strokeWidth={2.5} />
          <span>{t('nav.brand')}</span>
        </Link>
        <div className={styles.navRight}>
          <div className={styles.navActions}>
            {children}
          </div>
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
