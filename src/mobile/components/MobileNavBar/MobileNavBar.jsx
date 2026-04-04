import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './MobileNavBar.module.css';

export default function MobileNavBar({
  title,
  transparent = false,
  showBack = false,
  leftContent,
  rightContent,
  brandMode = false,
  children,
}) {
  const navigate = useNavigate();

  return (
    <header className={`${styles.navBar} ${transparent ? styles.navBarTransparent : ''}`}>
      <div className={styles.navLeft}>
        {showBack && (
          <button className={styles.navBtn} onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
        )}
        {brandMode && (
          <div className={styles.navBrand}>
            <span className={styles.navLogo}>🎮</span>
            <span className={styles.navBrandText}>Zeta Zero</span>
          </div>
        )}
        {leftContent}
      </div>

      <div className={styles.navCenter}>
        {title && <h1 className={styles.navTitle}>{title}</h1>}
        {children}
      </div>

      <div className={styles.navRight}>
        {rightContent}
      </div>
    </header>
  );
}
