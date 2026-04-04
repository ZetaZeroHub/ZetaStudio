import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './BottomSheet.module.css';

export default function BottomSheet({ open, onClose, title, children }) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className={`${styles.overlay} ${open ? styles.open : ''}`}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.handle}>
          <div className={styles.handleBar} />
        </div>
        {title && (
          <div className={styles.sheetHeader}>
            <h2 className={styles.sheetTitle}>{title}</h2>
            <button className={styles.sheetClose} onClick={onClose} aria-label="关闭">
              <X size={16} />
            </button>
          </div>
        )}
        <div className={styles.sheetBody}>
          {children}
        </div>
      </div>
    </div>
  );
}
