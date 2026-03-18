import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLevelsByDifficulty, DIFFICULTY, getTheme } from '../../data/mazeLevels';
import { getTopDownLevelsByDifficulty } from '../../data/topDownLevels';
import { playClickSound, playSelectSound, playBackSound, playTapSound, playSwitchSound } from '../../utils/gameUISound';
import styles from './MazeLevelSelectPage.module.css';

const UI = '/assets/kenney/kenney_ui-pack/PNG';

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
  const [tab, setTab] = useState('official');

  // Load player drafts for platformer
  let playerDrafts = [];
  if (!isEasy) {
    try {
      const raw = localStorage.getItem('game_drafts_v1');
      const all = raw ? JSON.parse(raw) : [];
      playerDrafts = all.filter(d => d.templateType === 'platformer' && d.published).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } catch {}
  }

  const handleBack = () => {
    playBackSound();
    navigate('/maze/difficulty');
  };

  const handleLevelClick = (level) => {
    playSelectSound();
    navigate(isEasy ? `/maze/play-topdown/${level.id}` : `/maze/play/${level.id}`);
  };

  const handleEditClick = (e, level) => {
    e.stopPropagation();
    playClickSound();
    const tType = isEasy ? 'topdown' : 'platformer';
    navigate(`/maze/editor/${tType}/${level.id}`);
  };

  const renderStars = (count) => [1, 2, 3].map(i => (
    <img
      key={i}
      src={i <= count
        ? `${UI}/Green/Default/star.png`
        : `${UI}/Green/Default/star_outline.png`}
      alt=""
      className={styles.starIcon}
    />
  ));

  return (
    <div className={`${styles.page} gameUI`}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <img src={`${UI}/Yellow/Default/arrow_basic_w.png`} alt="" className={styles.arrowIcon} />
        </button>
        <h1 className={styles.topTitle}>{diffInfo.label}</h1>
        <div className={styles.topSpacer} />
      </header>

      <main className={styles.content}>
        {/* Info Banner */}
        <div className={styles.banner}>
          <img src={diffInfo.icon} alt="" className={styles.bannerIcon} />
          <span className={styles.bannerText}>{diffInfo.desc}</span>
        </div>

        {/* Tab bar (platformer only) */}
        {!isEasy && (
          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${tab === 'official' ? styles.tabBtnActive : ''}`}
              onClick={() => { playSwitchSound(); setTab('official'); }}
            >
              <img src={`${UI}/Green/Default/star.png`} alt="" className={styles.tabIcon} />
              官方关卡
            </button>
            <button
              className={`${styles.tabBtn} ${tab === 'player' ? styles.tabBtnActive : ''}`}
              onClick={() => { playSwitchSound(); setTab('player'); }}
            >
              <img src={`${UI}/Blue/Default/star.png`} alt="" className={styles.tabIcon} />
              我的创作
            </button>
          </div>
        )}

        {/* Level Cards Grid */}
        <div className={styles.cards}>
          {(tab === 'official' || isEasy) && levels.map((level, i) => (
            <button
              key={level.id}
              className={styles.card}
              onClick={() => handleLevelClick(level)}
              onMouseEnter={playTapSound}
            >
              <img
                src={`${UI}/Green/Double/button_rectangle_depth_gloss.png`}
                alt=""
                className={styles.cardBg}
              />
              <div className={styles.cardInner}>
                <div className={styles.cardNum}>{i + 1}</div>
                <div className={styles.cardName}>{cleanName(level.name)}</div>
                <div className={styles.cardStars}>{renderStars(level.stars || 0)}</div>
                <button
                  className={styles.editBtn}
                  onClick={(e) => handleEditClick(e, level)}
                >
                  <img src={`${UI}/Blue/Default/button_square_depth_gloss.png`} alt="" className={styles.editBtnBg} />
                  <span className={styles.editBtnText}>✏️</span>
                </button>
              </div>
            </button>
          ))}

          {/* Player drafts */}
          {tab === 'player' && !isEasy && (
            playerDrafts.length === 0 ? (
              <div className={styles.emptyCard}>
                <p>还没有创作哦！</p>
                <p className={styles.emptyHint}>去"创作工坊"设计你的关卡吧</p>
              </div>
            ) : (
              playerDrafts.map((d, i) => (
                <button
                  key={d.id}
                  className={styles.card}
                  onClick={() => { playSelectSound(); navigate(`/maze/editor/draft/${d.id}`); }}
                  onMouseEnter={playTapSound}
                >
                  <img
                    src={`${UI}/Blue/Double/button_rectangle_depth_gloss.png`}
                    alt=""
                    className={styles.cardBg}
                  />
                  <div className={styles.cardInner}>
                    <div className={styles.cardNum}>{i + 1}</div>
                    <div className={styles.cardName}>{d.name || '未命名'}</div>
                    <div className={styles.cardMeta}>
                      {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('zh-CN') : ''}
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound();
                        if (!confirm('确定删除这个作品吗？')) return;
                        try {
                          const raw = localStorage.getItem('game_drafts_v1');
                          const all = raw ? JSON.parse(raw) : [];
                          const filtered = all.filter(x => x.id !== d.id);
                          localStorage.setItem('game_drafts_v1', JSON.stringify(filtered));
                          window.location.reload();
                        } catch {}
                      }}
                    >🗑️</button>
                  </div>
                </button>
              ))
            )
          )}

          {/* Coming soon placeholder (official tab) */}
          {tab === 'official' && (
            <div className={styles.comingSoonCard}>
              <img
                src={`${UI}/Grey/Double/button_rectangle_depth_flat.png`}
                alt=""
                className={styles.cardBg}
              />
              <div className={styles.cardInner}>
                <div className={styles.cardNum}>?</div>
                <div className={styles.cardName} style={{ color: 'rgba(255,255,255,0.5)' }}>更多关卡</div>
                <div className={styles.cardMeta}>敬请期待</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
