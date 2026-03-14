import { Link } from 'react-router-dom';
import { Sparkles, Globe } from 'lucide-react';
import useI18nStore from '../../stores/i18nStore';
import styles from './Navbar.module.css';

export default function Navbar({ children }) {
  const { language, setLanguage, t } = useI18nStore();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navBrand}>
        <Sparkles className={styles.navLogo} size={20} strokeWidth={2.5} />
        <span>{t('nav.brand')}</span>
      </Link>
      <div className={styles.navRight}>
        <div className={styles.navActions}>
          {children}
        </div>
        <button className={styles.langToggle} onClick={toggleLanguage} title={language === 'zh' ? 'Switch to English' : '切换到中文'}>
          <Globe size={18} strokeWidth={2} />
          <span>{language === 'zh' ? 'EN' : '中'}</span>
        </button>
      </div>
    </nav>
  );
}
