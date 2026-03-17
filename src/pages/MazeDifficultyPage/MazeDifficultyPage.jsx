import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { DIFFICULTY } from '../../data/mazeLevels';
import styles from './MazeDifficultyPage.module.css';

/* Kenney asset-based decorations */
const TILES = {
  topdown: '/assets/kenney/kenney_tiny-town/Tilemap/tilemap_packed.png',
  platformer: '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0040.png',
  tree: '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0198.png',
  gem: '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0067.png',
};

const TEMPLATE_ORDER = ['easy', 'medium'];

/* Simple click sound using Web Audio API */
function playClickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

function playSelectSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1047, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (_) {}
}

export default function MazeDifficultyPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    playClickSound();
    navigate('/maze');
  };

  const handleSelect = (key) => {
    playSelectSound();
    navigate(`/maze/levels/${key}`);
  };

  return (
    <div className={styles.page}>
      {/* Sky gradient background with floating clouds */}
      <div className={styles.skyBg} />

      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft size={16} /> 返回
        </button>
        <h1 className={styles.topTitle}>选择游戏模式</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.heading}>
          <motion.img
            src={TILES.tree}
            alt=""
            className={styles.headingIcon}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.h2
            className={styles.headingTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            选择你的冒险
          </motion.h2>
          <p className={styles.headingSub}>两种截然不同的游戏体验等你来探索</p>
        </div>

        <div className={styles.cards}>
          {TEMPLATE_ORDER.map((key, i) => {
            const d = DIFFICULTY[key];
            return (
              <motion.div
                key={key}
                className={styles.card}
                style={{
                  '--card-color': d.color,
                  '--card-bg': d.color + '12',
                  '--card-border': d.color + '40',
                  '--card-shadow': d.color + '30',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97, y: 2 }}
                onClick={() => handleSelect(key)}
              >
                <div className={styles.cardIconWrap}>
                  <img src={d.icon} alt="" className={styles.cardIconImg} />
                  <div className={styles.cardBadge}>{d.ageRange}</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardLabel}>{d.label}</div>
                  <div className={styles.cardDesc}>{d.desc}</div>
                  <div className={styles.cardLevelCount}>
                    <img src={TILES.gem} alt="" className={styles.miniIcon} />
                    4 个关卡
                  </div>
                </div>
                <div className={styles.cardArrow}>
                  <img
                    src="/assets/kenney/kenney_ui-pack-pixel-adventure/Tiles/tile_0002.png"
                    alt=""
                    className={styles.arrowIcon}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ground decoration */}
        <div className={styles.groundDeco} />
      </div>
    </div>
  );
}
