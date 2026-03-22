/* ========================================
   CreatorModePage — 创作工坊 · Kenney UI
   ======================================== */
import { useNavigate } from 'react-router-dom';
import { playClickSound, playSelectSound, playBackSound, playTapSound } from '../../utils/gameUISound';
import styles from './CreatorModePage.module.css';

const UI = '/assets/kenney/kenney_ui-pack/PNG';

const TEMPLATES = [
  {
    key: 'topdown',
    difficulty: 'easy',
    title: '走出迷宫',
    subtitle: '适合 1-5 岁宝宝',
    desc: '走迷宫、找出口，动动小脑瓜！',
    color: 'Blue',
    tags: ['迷宫', '益智', '寻宝'],
  },
  {
    key: 'platformer',
    difficulty: 'medium',
    title: '闯关冒险',
    subtitle: '适合 6-8 岁宝宝',
    desc: '跳跃闯关，打败怪物，成为小英雄！',
    color: 'Yellow',
    tags: ['闯关', '战斗', '成就'],
  },
];

export default function CreatorModePage() {
  const navigate = useNavigate();

  return (
    <div className={`${styles.page} gameUI`}>
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => { playBackSound(); navigate('/maze/home'); }}>
          <img src={`${UI}/Yellow/Default/arrow_basic_w.png`} alt="" className={styles.arrowIcon} />
        </button>
        <h1 className={styles.topTitle}>创作工坊</h1>
        <div className={styles.topSpacer} />
      </header>

      <main className={styles.content}>
        <div className={styles.banner}>
          <span className={styles.bannerText}>选一个开始创作吧！</span>
        </div>

        <div className={styles.cards}>
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              className={`${styles.card} ${t.disabled ? styles.cardDisabled : ''}`}
              style={t.color === 'Yellow' ? { '--card-text': '#5D4037', '--card-text-sub': '#795548' } : {}}
              onClick={() => {
                if (!t.disabled) {
                  playSelectSound();
                  if (t.key === 'topdown') navigate('/maze/ai-maze');
                  else navigate(`/maze/creator/levels/${t.difficulty}`);
                }
              }}
              onMouseEnter={() => !t.disabled && playTapSound()}
            >
              <img
                src={`${UI}/${t.color}/Double/button_rectangle_depth_gloss.png`}
                alt=""
                className={styles.cardBg}
              />
              {t.disabled && <div className={styles.comingSoonBadge}>敬请期待</div>}
              <div className={styles.cardInner}>
                <div className={styles.cardTitle}>{t.title}</div>
                <div className={styles.cardSub}>{t.subtitle}</div>
                <div className={styles.cardArrow}>
                  <img src={`${UI}/${t.color}/Default/arrow_basic_e.png`} alt="" className={styles.arrowSmall} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
