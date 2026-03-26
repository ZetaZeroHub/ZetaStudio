/* ========================================
   MazeDifficultyPage — 精选迷宫 + 我的游戏库
   Game-quality UI matching AiMazeCreatorPage style
   Kenney asset-driven, no default CSS feel
   ======================================== */
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pencil, Share2, Trash2 } from 'lucide-react';
import { playClickSound, playSelectSound, playBackSound } from '../../utils/gameUISound';
import styles from './MazeDifficultyPage.module.css';

const UI = '/assets/kenney/kenney_ui-pack/PNG';
const ANIMALS = '/assets/kenney/kenney_animal-pack/PNG/Round';
const DUCK = '/assets/custom/duck';
const CURSOR = '/assets/kenney/kenney_cursor-pixel-pack/Tiles';

/* ── Featured maze list (animals mapped to existing Round PNGs only) ── */
const FEATURED_MAZES = [
  // Maze type — 迷宫类
  { id: 'duck-pool',     name: '小鸭子找水池迷宫', emoji: '🦆', color: '#4FC3F7', cover: '/assets/custom/精选游戏-游戏封面-小鸭子找水池.jpg', playable: true,  type: 'maze' },
  { id: 'snow-white',    name: '白雪公主迷宫',     emoji: '👸', color: '#F48FB1', animal: `${ANIMALS}/parrot.png`,  playable: false, type: 'maze' },
  { id: 'cat-mouse',     name: '猫捉老鼠迷宫',     emoji: '🐱', color: '#FFB74D', animal: `${ANIMALS}/monkey.png`, playable: false, type: 'maze' },
  // { id: 'red-riding',    name: '小红帽迷宫',        emoji: '🐺', color: '#EF5350', animal: `${ANIMALS}/pig.png`,    playable: false, type: 'maze' },
  // { id: 'space-explore', name: '太空探险迷宫',      emoji: '🚀', color: '#5C6BC0', animal: `${ANIMALS}/penguin.png`,playable: false, type: 'maze' },
  // { id: 'dino-world',    name: '恐龙世界迷宫',      emoji: '🦕', color: '#66BB6A', animal: `${ANIMALS}/elephant.png`,playable: false, type: 'maze' },
  // { id: 'unicorn',       name: '独角兽迷宫',        emoji: '🦄', color: '#AB47BC', animal: `${ANIMALS}/giraffe.png`,playable: false, type: 'maze' },
  // Adventure type — 闯关冒险类 (last)
  // { id: 'medium-1',      name: '森林小径闯关',      emoji: '🌳', color: '#43A047', animal: `${ANIMALS}/panda.png`,  playable: true, type: 'adventure', levelId: 'medium-1' },
  // { id: 'medium-2',      name: '海滩寻宝闯关',      emoji: '🏖️', color: '#0097A7', animal: `${ANIMALS}/hippo.png`, playable: true, type: 'adventure', levelId: 'medium-2' },
  // { id: 'medium-3',      name: '糖果迷城闯关',      emoji: '🍬', color: '#E91E63', animal: `${ANIMALS}/rabbit.png`, playable: true, type: 'adventure', levelId: 'medium-3' },
  // { id: 'medium-4',      name: '沙漠绿洲闯关',      emoji: '🏜️', color: '#F57C00', animal: `${ANIMALS}/snake.png`, playable: true, type: 'adventure', levelId: 'medium-4' },
];

const STORAGE_KEY = 'game_drafts_v1';

export default function MazeDifficultyPage() {
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [shareDialog, setShareDialog] = useState(null); // { draftId, step: 'confirm' | 'share' }
  const [toast, setToast] = useState('');

  /* ── 我的游戏库 — merge all draft types ── */
  const myGames = useMemo(() => {
    try {
      const gameDrafts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return gameDrafts
        .filter(d => d.updatedAt || d.createdAt)
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } catch { return []; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleDeleteWork = useCallback((e, id) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个作品吗？')) return;
    try {
      const drafts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = drafts.filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRefreshKey(k => k + 1);
      console.log('[MazeDifficultyPage] Deleted draft:', id);
    } catch {}
  }, []);

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个作品吗？`)) return;
    try {
      const drafts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = drafts.filter(d => !selectedIds.has(d.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSelectedIds(new Set());
      setSelectMode(false);
      setRefreshKey(k => k + 1);
      console.log('[MazeDifficultyPage] Batch deleted:', selectedIds.size);
    } catch {}
  }, [selectedIds]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBack = () => {
    playBackSound();
    navigate('/maze/home');
  };

  const handlePlayMaze = (maze) => {
    playSelectSound();
    if (!maze.playable) return;
    if (maze.type === 'maze' && maze.id === 'duck-pool') {
      // Duck maze — directly play the preset level via MazePathGame
      navigate('/maze/play-topdown/maze-1');
    } else if (maze.type === 'adventure' && maze.levelId) {
      // Platformer adventure — use the correct existing route
      navigate(`/maze/play/${maze.levelId}`);
    }
  };

  const handlePlayDraft = (draft) => {
    playSelectSound();
    if (draft.templateType === 'topdown') {
      // Full-screen game play via MazePathGame route
      navigate(`/maze/play-topdown/draft-${draft.id}`);
    } else {
      navigate(`/maze/play-draft/${draft.id}`);
    }
  };

  const handleEditDraft = (draft) => {
    playSelectSound();
    if (draft.templateType === 'topdown') {
      navigate(`/maze/ai-maze?draftId=${draft.id}`);
    } else {
      navigate(`/maze/editor/draft/${draft.id}?from=maze-home`);
    }
  };

  /* ── Share functionality ── */
  const handleShare = useCallback((e, draft) => {
    e.stopPropagation();
    playClickSound();
    // Check if already published
    const publishedKey = `published_${draft.id}`;
    if (localStorage.getItem(publishedKey)) {
      // Already published, show share dialog directly
      setShareDialog({ draftId: draft.id, draftName: draft.name, step: 'share' });
    } else {
      // First time: confirm publish
      setShareDialog({ draftId: draft.id, draftName: draft.name, step: 'confirm' });
    }
  }, []);

  const handleConfirmPublish = useCallback(() => {
    if (!shareDialog) return;
    localStorage.setItem(`published_${shareDialog.draftId}`, '1');
    setShareDialog(prev => ({ ...prev, step: 'share' }));
  }, [shareDialog]);

  const getShareUrl = useCallback(() => {
    if (!shareDialog) return '';
    return `${window.location.origin}/maze/play-topdown/draft-${shareDialog.draftId}`;
  }, [shareDialog]);

  const copyShareLink = useCallback(() => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setToast('✅ 链接已复制到剪贴板');
      setTimeout(() => setToast(''), 2000);
    }).catch(() => {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setToast('✅ 链接已复制');
      setTimeout(() => setToast(''), 2000);
    });
  }, [getShareUrl]);

  const shareToSocial = useCallback((platform) => {
    const url = encodeURIComponent(getShareUrl());
    const title = encodeURIComponent(`来玩我做的迷宫：${shareDialog?.draftName || '迷宫游戏'}`);
    let shareUrl = '';
    switch (platform) {
      case 'wechat':
        // WeChat can't open URL directly, copy link instead
        copyShareLink();
        setToast('📋 请粘贴链接到微信分享给好友');
        setTimeout(() => setToast(''), 3000);
        return;
      case 'qq':
        shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`;
        break;
      case 'weibo':
        shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${title}`;
        break;
      case 'douyin':
        copyShareLink();
        setToast('📋 请粘贴链接到抖音分享');
        setTimeout(() => setToast(''), 3000);
        return;
      default:
        copyShareLink();
        return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }, [getShareUrl, shareDialog, copyShareLink]);

  return (
    <div className={`${styles.page} gameUI`}>
      {/* Background */}
      <div className={styles.bgGradient} />

      {/* Top Bar */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <img src={`${UI}/Yellow/Default/arrow_basic_w.png`} alt="" className={styles.arrowIcon} />
        </button>
        <div className={styles.titleWrap}>
          <img src={`${CURSOR}/tile_0042.png`} alt="" className={styles.titleIcon} />
          <h1 className={styles.topTitle}>迷宫梦想家</h1>
        </div>
      </header>

      {/* Single scrollable content */}
      <main className={styles.content}>
        {/* ── Section 1: Featured Mazes ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <img src={`${UI}/Yellow/Default/icon_circle.png`} alt="" className={styles.sectionIcon} />
            <span className={styles.sectionTitle}>精选迷宫</span>
          </div>
          <div className={styles.scrollWrap}>
            <div className={styles.cardRow}>
              {FEATURED_MAZES.map((maze, i) => (
                <motion.button
                  key={maze.id}
                  className={styles.mazeCard}
                  style={{ '--card-color': maze.color }}
                  onClick={() => handlePlayMaze(maze)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={styles.cardBg}>
                    {maze.cover ? (
                      <img src={maze.cover} alt="" className={styles.cardCover} />
                    ) : (
                      <img src={maze.animal} alt="" className={styles.cardAnimal} />
                    )}
                    {maze.type === 'adventure' && (
                      <span className={styles.cardTypeBadge}>闯关</span>
                    )}
                    {!maze.playable && (
                      <div className={styles.comingSoon}>
                        <span>即将开放</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardLabel}>{maze.name}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 2: My Game Library ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <img src={`${UI}/Green/Default/icon_square.png`} alt="" className={styles.sectionIcon} />
            <span className={styles.sectionTitle}>我的游戏库</span>
            {myGames.length > 0 && <span className={styles.sectionBadge}>{myGames.length}</span>}

            {/* Toolbar inline with header */}
            {myGames.length > 0 && (
              <div className={styles.libraryToolbar}>
                <button
                  className={`${styles.toolBtn} ${selectMode ? styles.toolBtnActive : ''}`}
                  onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
                >
                  {selectMode ? '取消' : '管理'}
                </button>
                {selectMode && (
                  <>
                    <button
                      className={styles.toolBtn}
                      onClick={() => {
                        if (selectedIds.size === myGames.length) setSelectedIds(new Set());
                        else setSelectedIds(new Set(myGames.map(g => g.id)));
                      }}
                    >
                      {selectedIds.size === myGames.length ? '取消全选' : '全选'}
                    </button>
                    {selectedIds.size > 0 && (
                      <button className={`${styles.toolBtn} ${styles.toolBtnDanger}`} onClick={handleBatchDelete}>
                        删除 ({selectedIds.size})
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {myGames.length === 0 ? (
            <div className={styles.emptyState}>
              <img src={`${UI}/Green/Default/icon_square.png`} alt="" className={styles.emptyIcon} />
              <p className={styles.emptyText}>还没有创作作品哦</p>
              <button
                className={styles.emptyBtn}
                onClick={() => { playSelectSound(); navigate('/maze/ai-maze'); }}
              >
                去创作一个迷宫 →
              </button>
            </div>
          ) : (
            <div className={styles.libraryGrid}>
              {myGames.map((draft) => (
                <motion.div
                  key={draft.id}
                  className={`${styles.libraryCard} ${selectMode && selectedIds.has(draft.id) ? styles.libraryCardSelected : ''}`}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { if (selectMode) toggleSelect(draft.id); }}
                >
                  {selectMode && (
                    <div className={styles.checkArea}>
                      <div className={`${styles.checkbox} ${selectedIds.has(draft.id) ? styles.checkboxChecked : ''}`}>
                        {selectedIds.has(draft.id) && '✓'}
                      </div>
                    </div>
                  )}

                  <div className={styles.libraryCardThumb}>
                    <span className={styles.libraryCardEmoji}>
                      {draft.templateType === 'topdown' ? '🌍' : '🎮'}
                    </span>
                  </div>
                  <div className={styles.libraryCardInfo}>
                    <div className={styles.libraryCardName}>{draft.name || '未命名'}</div>
                    <div className={styles.libraryCardMeta}>
                      <span className={styles.libraryCardType}>
                        {draft.templateType === 'topdown' ? '迷宫' : '闯关'}
                      </span>
                      <span className={styles.libraryCardDate}>
                        {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString('zh-CN') : ''}
                      </span>
                    </div>
                  </div>

                  {!selectMode && (
                    <div className={styles.libraryCardActions}>
                      <button
                        className={styles.actionPlay}
                        onClick={(e) => { e.stopPropagation(); handlePlayDraft(draft); }}
                        title="游玩"
                      >
                        <Play size={16} fill="currentColor" strokeWidth={1.5} style={{ marginLeft: '2px' }} />
                      </button>
                      <button
                        className={styles.actionEdit}
                        onClick={(e) => { e.stopPropagation(); handleEditDraft(draft); }}
                        title="编辑"
                      >
                        <Pencil size={15} strokeWidth={2.5} />
                      </button>
                      <button
                        className={styles.actionShare}
                        onClick={(e) => handleShare(e, draft)}
                        title="分享"
                      >
                        <Share2 size={15} strokeWidth={2.5} />
                      </button>
                      <button
                        className={styles.actionDelete}
                        onClick={(e) => handleDeleteWork(e, draft.id)}
                        title="删除"
                      >
                        <Trash2 size={13} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Share Dialog ── */}
      <AnimatePresence>
        {shareDialog && (
          <motion.div
            className={styles.dialogOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShareDialog(null)}
          >
            <motion.div
              className={styles.dialogBox}
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {shareDialog.step === 'confirm' ? (
                <>
                  <h3 className={styles.dialogTitle}>📢 公开作品</h3>
                  <p className={styles.dialogText}>
                    分享后，你的作品「{shareDialog.draftName || '未命名'}」将对所有人可见。确认公开吗？
                  </p>
                  <div className={styles.dialogActions}>
                    <button className={styles.dialogBtnCancel} onClick={() => setShareDialog(null)}>取消</button>
                    <button className={styles.dialogBtnConfirm} onClick={handleConfirmPublish}>确认公开</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className={styles.dialogTitle}>🔗 分享作品</h3>
                  <div className={styles.shareLinkWrap}>
                    <input className={styles.shareLinkInput} value={getShareUrl()} readOnly onClick={e => e.target.select()} />
                    <button className={styles.shareCopyBtn} onClick={copyShareLink}>复制</button>
                  </div>
                  <div className={styles.socialRow}>
                    <button className={styles.socialBtn} onClick={() => shareToSocial('wechat')} style={{background: '#07C160'}}>微信</button>
                    <button className={styles.socialBtn} onClick={() => shareToSocial('qq')} style={{background: '#12B7F5'}}>QQ</button>
                    <button className={styles.socialBtn} onClick={() => shareToSocial('weibo')} style={{background: '#E6162D'}}>微博</button>
                    <button className={styles.socialBtn} onClick={() => shareToSocial('douyin')} style={{background: '#161823'}}>抖音</button>
                  </div>
                  <button className={styles.dialogBtnCancel} onClick={() => setShareDialog(null)} style={{marginTop: '10px', width: '100%'}}>关闭</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            onClick={() => setToast('')}
          >{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
