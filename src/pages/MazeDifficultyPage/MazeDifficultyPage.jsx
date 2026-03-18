import { useNavigate } from 'react-router-dom';
import { DIFFICULTY } from '../../data/mazeLevels';
import { playClickSound, playSelectSound, playBackSound } from '../../utils/gameUISound';
import styles from './MazeDifficultyPage.module.css';

const UI = '/assets/kenney/kenney_ui-pack/PNG';

const TEMPLATE_ORDER = ['easy', 'medium'];

export default function MazeDifficultyPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    playBackSound();
    navigate('/maze');
  };

  const handleSelect = (key) => {
    playSelectSound();
    navigate(`/maze/levels/${key}`);
  };

  return (
    <div className={`${styles.page} gameUI`}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <img src={`${UI}/Yellow/Default/arrow_basic_w.png`} alt="" className={styles.arrowIcon} />
        </button>
        <h1 className={styles.topTitle}>选择游戏模式</h1>
        <div className={styles.topSpacer} />
      </header>

      {/* Main Content — no scroll */}
      <main className={styles.content}>
        {/* Info banner */}
        <div className={styles.banner}>
          <span className={styles.bannerText}>选一个去冒险吧！</span>
        </div>

        {/* Cards grid */}
        <div className={styles.cards}>
          {TEMPLATE_ORDER.map((key) => {
            const d = DIFFICULTY[key];
            const isDisabled = key === 'easy';
            const color = key === 'easy' ? 'Blue' : 'Green';
            return (
              <button
                key={key}
                className={`${styles.card} ${isDisabled ? styles.cardDisabled : ''}`}
                onClick={() => !isDisabled && handleSelect(key)}
                onMouseEnter={playClickSound}
              >
                {/* Card background using Kenney button */}
                <img
                  src={`${UI}/${color}/Double/button_rectangle_depth_gloss.png`}
                  alt=""
                  className={styles.cardBg}
                />
                {isDisabled && <div className={styles.comingSoonBadge}>敬请期待</div>}
                <div className={styles.cardInner}>
                  <div className={styles.cardIconWrap}>
                    <img src={d.icon} alt="" className={styles.cardIconImg} />
                  </div>
                  <div className={styles.cardLabel}>{d.label}</div>
                  <div className={styles.cardArrow}>
                    <img src={`${UI}/${color}/Default/arrow_basic_e.png`} alt="" className={styles.arrowSmall} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
