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
    title: '开放世界探索',
    subtitle: '2.5D 俯视角',
    desc: '探索神秘小镇，收集宝藏，解开谜题',
    color: 'Blue',
    tags: ['解谜', '寻宝', '探索'],
    disabled: true,
  },
  {
    key: 'platformer',
    difficulty: 'medium',
    title: '横版闯关冒险',
    subtitle: '经典横版跳跃',
    desc: '勇闯四大主题关卡，击败强力BOSS',
    color: 'Yellow',
    tags: ['闯关', '战斗', '成就'],
  },
];

export default function CreatorModePage() {
  const navigate = useNavigate();

  return (
    <div className={`${styles.page} gameUI`}>
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => { playBackSound(); navigate('/maze'); }}>
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
                if (!t.disabled) { playSelectSound(); navigate(`/maze/creator/levels/${t.difficulty}`); }
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
