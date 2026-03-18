/* ========================================
   CreatorLevelPage — 关卡模板列表 · Kenney UI
   ======================================== */
import { useParams, useNavigate } from 'react-router-dom';
import { getLevelsByDifficulty, DIFFICULTY } from '../../data/mazeLevels';
import { getTopDownLevelsByDifficulty } from '../../data/topDownLevels';
import { playClickSound, playSelectSound, playBackSound, playTapSound } from '../../utils/gameUISound';
import styles from './CreatorLevelPage.module.css';

const UI = '/assets/kenney/kenney_ui-pack/PNG';
const CARD_COLORS = ['Green', 'Blue', 'Yellow', 'Red'];

function cleanName(name) {
  return name.replace(/[\u{1F300}-\u{1FAFF}\u{2702}-\u{27B0}\u{FE0F}]/gu, '').trim();
}

export default function CreatorLevelPage() {
  const { difficulty } = useParams();
  const navigate = useNavigate();
  const isEasy = difficulty === 'easy';
  const levels = isEasy ? getTopDownLevelsByDifficulty() : getLevelsByDifficulty(difficulty);
  const diffInfo = DIFFICULTY[difficulty] || DIFFICULTY.easy;

  return (
    <div className={`${styles.page} gameUI`}>
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => { playBackSound(); navigate('/maze/creator'); }}>
          <img src={`${UI}/Yellow/Default/arrow_basic_w.png`} alt="" className={styles.arrowIcon} />
        </button>
        <h1 className={styles.topTitle}>选择关卡模板</h1>
        <div className={styles.topSpacer} />
      </header>

      <main className={styles.content}>
        <div className={styles.banner}>
          <img src={diffInfo.icon} alt="" className={styles.bannerIcon} />
          <span className={styles.bannerText}>{diffInfo.label} — 选择一个预设关卡作为基础进行创作</span>
        </div>

        <div className={styles.cards}>
          {levels.map((level, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <button
                key={level.id}
                className={styles.card}
                onClick={() => {
                  playSelectSound();
                  const tType = isEasy ? 'topdown' : 'platformer';
                  navigate(`/maze/editor/${tType}/${level.id}`);
                }}
                onMouseEnter={playTapSound}
              >
                <img
                  src={`${UI}/${color}/Double/button_rectangle_depth_gloss.png`}
                  alt=""
                  className={styles.cardBg}
                />
                <div className={styles.cardInner}>
                  <div className={styles.cardNum}>{i + 1}</div>
                  <div className={styles.cardName}>{cleanName(level.name)}</div>
                  <div className={styles.cardStats}>
                    <span>{level.platforms?.length || 0} 平台</span>
                    <span>·</span>
                    <span>{level.enemies?.length || 0} 敌人</span>
                  </div>
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
