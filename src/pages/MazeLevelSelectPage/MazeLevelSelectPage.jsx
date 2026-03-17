import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getLevelsByDifficulty, DIFFICULTY, getTheme } from '../../data/mazeLevels';
import { getTopDownLevelsByDifficulty } from '../../data/topDownLevels';
import styles from './MazeLevelSelectPage.module.css';

/* Kenney asset tiles for level icons */
const LEVEL_ICONS = [
  '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0067.png',
  '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0064.png',
  '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0060.png',
  '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0130.png',
];

/* Star asset */
const STAR_FILLED = '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0064.png';

/* Sound effects via Web Audio */
function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch (_) {}
}

function playLevelSelect() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (_) {}
}

function playHover() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch (_) {}
}

/* Strip emoji from level names */
function cleanName(name) {
  return name.replace(/[\u{1F300}-\u{1FAFF}\u{2702}-\u{27B0}\u{FE0F}]/gu, '').trim();
}

export default function MazeLevelSelectPage() {
  const { difficulty } = useParams();
  const navigate = useNavigate();
  const isEasy = difficulty === 'easy';
  const levels = isEasy ? getTopDownLevelsByDifficulty() : getLevelsByDifficulty(difficulty);
  const diffInfo = DIFFICULTY[difficulty] || DIFFICULTY.easy;
  const theme = getTheme(levels[0]?.theme || 'forest');

  const handleBack = () => {
    playClick();
    navigate('/maze/difficulty');
  };

  const handleLevelClick = (level) => {
    playLevelSelect();
    navigate(isEasy ? `/maze/play-topdown/${level.id}` : `/maze/play/${level.id}`);
  };

  const renderStars = (count) => {
    return [1, 2, 3].map(i => (
      <div key={i} className={styles.starWrap}>
        <img
          src={STAR_FILLED}
          alt=""
          className={styles.starIcon}
          style={{ opacity: i <= count ? 1 : 0.2, filter: i <= count ? 'none' : 'grayscale(1)' }}
        />
      </div>
    ));
  };

  return (
    <div
      className={styles.page}
      style={{
        '--sky-top': theme.skyTop,
        '--sky-bottom': theme.skyBottom,
        '--accent': diffInfo.color,
      }}
    >
      <div className={styles.skyBg} />

      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft size={16} /> 返回
        </button>
        <h1 className={styles.topTitle}>{diffInfo.label}</h1>
      </header>

      <div className={styles.pathContainer}>
        <motion.div
          className={styles.startBanner}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <img src={diffInfo.icon} alt="" className={styles.startIcon} />
          <h2 className={styles.startTitle}>{diffInfo.label}</h2>
          <p className={styles.startDesc}>{diffInfo.desc}</p>
        </motion.div>

        {levels.map((level, i) => {
          const iconSrc = LEVEL_ICONS[i % LEVEL_ICONS.length];
          return (
            <div key={level.id}>
              {i > 0 && (
                <div className={styles.connector}>
                  <div className={styles.connectorDot} />
                  <div className={styles.connectorLine} />
                  <div className={styles.connectorDot} />
                </div>
              )}

              <motion.div
                className={styles.levelNode}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.4 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.93, y: 2 }}
                onHoverStart={playHover}
                onClick={() => handleLevelClick(level)}
              >
                <div className={styles.levelCircle}>
                  <img src={iconSrc} alt="" className={styles.levelIcon} />
                  <div className={styles.levelNum}>{i + 1}</div>
                </div>
                <div className={styles.levelName}>{cleanName(level.name)}</div>
                <div className={styles.levelStars}>
                  {renderStars(level.stars)}
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* End — more coming */}
        <div className={styles.connector}>
          <div className={styles.connectorDot} />
          <div className={styles.connectorLine} style={{ opacity: 0.3 }} />
          <div className={styles.connectorDot} style={{ opacity: 0.3 }} />
        </div>
        <motion.div
          className={styles.levelNode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 0.6 }}
          style={{ pointerEvents: 'none' }}
        >
          <div className={styles.levelCircle} style={{ borderColor: '#bbb', background: 'rgba(255,255,255,0.5)' }}>
            <img
              src="/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0064.png"
              alt=""
              className={styles.levelIcon}
              style={{ opacity: 0.3, filter: 'grayscale(1)' }}
            />
          </div>
          <div className={styles.levelName} style={{ color: '#aaa' }}>更多关卡</div>
          <div className={styles.levelStars} style={{ color: '#ccc', fontSize: '0.7rem' }}>敬请期待</div>
        </motion.div>
      </div>
    </div>
  );
}
