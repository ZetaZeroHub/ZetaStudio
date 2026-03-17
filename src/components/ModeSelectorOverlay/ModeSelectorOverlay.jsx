import { motion } from 'framer-motion';
import { Sparkles, Settings, Castle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ModeSelectorOverlay.module.css';

export default function ModeSelectorOverlay({ onSelect }) {
  const navigate = useNavigate();
  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      >
        <div className={styles.mascot}>🦉</div>
        <h1 className={styles.title}>欢迎来到 Zeta Studio!</h1>
        <p className={styles.subtitle}>选择你的创作模式</p>

        <div className={styles.options}>
          <motion.button
            className={styles.optionSimple}
            onClick={() => onSelect('simple')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className={styles.optionIcon}>
              <Sparkles size={32} />
            </div>
            <div className={styles.optionLabel}>简易模式</div>
            <div className={styles.optionDesc}>适合 3-8 岁小朋友<br />拖拖拽拽，轻松创作</div>
            <div className={styles.optionBadge}>推荐</div>
          </motion.button>

          <motion.button
            className={styles.optionPro}
            onClick={() => onSelect('pro')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className={styles.optionIcon}>
              <Settings size={32} />
            </div>
            <div className={styles.optionLabel}>专业模式</div>
            <div className={styles.optionDesc}>完整编辑器<br />代码 · 2D/3D · AI 助手</div>
          </motion.button>

          <motion.button
            className={styles.optionMaze}
            onClick={() => { onSelect('simple'); navigate('/maze'); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className={styles.optionIcon}>
              <Castle size={32} />
            </div>
            <div className={styles.optionLabel}>游戏梦想家</div>
            <div className={styles.optionDesc}>AI 迷宫冒险<br />创造 · 挑战 · 分享</div>
            <div className={styles.optionBadgeMaze}>NEW</div>
          </motion.button>
        </div>

        <p className={styles.hint}>随时可以在顶栏切换模式</p>
      </motion.div>
    </div>
  );
}
