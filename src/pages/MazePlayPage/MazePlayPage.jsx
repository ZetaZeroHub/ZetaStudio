/* ========================================
   MazePlayPage — 在专业模式的 PlayPage 外壳中
   嵌入游戏梦想家的游戏（横版冒险/小鸭子）
   包含社区互动功能（创作者卡片、点赞、评论区等）
   ======================================== */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import { Pencil, ArrowLeft, Share2, Heart, MessageCircle, Eye, Star, Send, ThumbsUp, Clock, Bookmark, Check, Copy } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import styles from '../PlayPage/PlayPage.module.css';
import mStyles from './MazePlayPage.module.css';

const MazeGamePage = lazy(() => import('../MazeGamePage/MazeGamePage'));
const MazePathGame = lazy(() => import('../MazePathGame/MazePathGame'));

const GAME_NAMES = {
  platformer: { zh: '横版冒险闯关', en: 'Side-Scroll Adventure' },
  topdown: { zh: '小鸭子找水池', en: 'Duck Finds Pond' },
};

/* ── MOCK 社区互动数据 ── */
const MOCK_DATA = {
  platformer: {
    stats: { views: 5213, likes: 728, comments: 96, rating: 4.8, ratingCount: 156 },
    creator: { name: '管理员', avatar: '🎯', bio: 'AI 益智游戏开放平台官方团队', works: 6, followers: 1024 },
    comments: [
      { id: 1, user: '小游戏达人', avatar: '🎮', content: '画面很精致，敌人AI做得很好，BOSS战很有挑战性！', time: '1 小时前', likes: 45, liked: false },
      { id: 2, user: '妈妈程序员', avatar: '👩‍💻', content: '给孩子玩了，他说比马里奥还好玩哈哈', time: '3 小时前', likes: 32, liked: true },
      { id: 3, user: '新手小白', avatar: '🐣', content: '商人系统太有意思了，可以买护盾和回血！', time: '6 小时前', likes: 21, liked: false },
      { id: 4, user: '迷宫爱好者', avatar: '🧩', content: '三段跳+泡泡弹的操作手感很棒，关卡设计也很有层次', time: '1 天前', likes: 38, liked: false },
      { id: 5, user: '科学小队长', avatar: '🔬', content: '已经用编辑器做了自己的关卡，期待更多素材！', time: '2 天前', likes: 17, liked: false },
    ],
  },
  topdown: {
    stats: { views: 3891, likes: 512, comments: 73, rating: 4.9, ratingCount: 112 },
    creator: { name: '管理员', avatar: '🦆', bio: 'AI 益智游戏开放平台官方团队', works: 6, followers: 1024 },
    comments: [
      { id: 1, user: '戴眼镜的爸爸', avatar: '👓', content: '小鸭子太可爱了！女儿画了一下午的迷宫路线', time: '2 小时前', likes: 56, liked: true },
      { id: 2, user: 'AI玩家007', avatar: '🤖', content: '手指划线操控的创意很新颖，沉浸感很强', time: '4 小时前', likes: 28, liked: false },
      { id: 3, user: '幼教小李', avatar: '🍎', content: '非常适合幼儿园小朋友玩，锻炼空间思维能力', time: '8 小时前', likes: 41, liked: true },
      { id: 4, user: '代码菜鸟', avatar: '🐣', content: '用 AI 创建了一个沙漠越野版的，太有意思了', time: '1 天前', likes: 19, liked: false },
      { id: 5, user: '游戏小王子', avatar: '👑', content: '金币收集系统很上瘾，已经全部通关了！', time: '3 天前', likes: 34, liked: false },
    ],
  },
};

export default function MazePlayPage() {
  const { gameType } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // 社区互动状态
  const mockData = MOCK_DATA[gameType] || MOCK_DATA.platformer;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(mockData.stats.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState(mockData.comments);
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const gameName = GAME_NAMES[gameType]?.zh || '游戏';

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => setBookmarked(!bookmarked);

  const handleCommentLike = (id) => {
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [{
      id: Date.now(), user: '我', avatar: '😊',
      content: newComment.trim(), time: '刚刚', likes: 0, liked: false,
    }, ...prev]);
    setNewComment('');
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  const formatCount = (n) => {
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n;
  };

  return (
    <div className={styles.playPage}>
      <Navbar hideBrand leftContent={
        <button className={styles.backBtn} onClick={() => navigate('/')}><ArrowLeft size={14} /> 返回首页</button>
      }>
        <span className={styles.gameTitle}>{gameName}</span>
      </Navbar>

      <div className={styles.mainContent}>
        {/* ── 左侧：游戏画面 + 操作 ── */}
        <div className={styles.gameColumn}>
          <div className={`${styles.gameFrame} ${mStyles.mazeFrame}`}>
            <Suspense fallback={
              <div className={mStyles.loading}>加载中...</div>
            }>
              {gameType === 'topdown' ? <MazePathGame /> : <MazeGamePage />}
            </Suspense>
          </div>

          {/* 操作栏 */}
          <div className={styles.actionBar}>
            <div className={styles.actionLeft}>
              <button className={`${styles.actionBtn} ${liked ? styles.actionBtnActive : ''}`} onClick={handleLike}>
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {formatCount(likeCount)}
              </button>
              <button className={styles.actionBtn}>
                <MessageCircle size={16} /> {mockData.stats.comments}
              </button>
              <button className={`${styles.actionBtn} ${bookmarked ? styles.actionBtnActive : ''}`} onClick={handleBookmark}>
                <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} /> 收藏
              </button>
            </div>
            <div className={styles.actionRight}>
              {gameType === 'platformer' ? (
                <button className={styles.editBtn} onClick={() => navigate('/maze/editor/platformer/medium-2?from=pro')}>
                  <Pencil size={14} /> 编辑关卡
                </button>
              ) : (
                <button className={styles.editBtn} disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
                  <Pencil size={14} /> 编辑关卡（暂未开放）
                </button>
              )}
              <button className={styles.shareBtn} onClick={handleCopy}>
                {copied ? <><Check size={14} /> 已复制</> : <><Share2 size={14} /> 分享链接</>}
              </button>
            </div>
          </div>

          {/* 数据看板 */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <Eye size={13} />
              <span>{formatCount(mockData.stats.views)} 次浏览</span>
            </div>
            <div className={styles.statItem}>
              <Star size={13} fill="currentColor" />
              <span>{mockData.stats.rating} 分 ({mockData.stats.ratingCount} 人评)</span>
            </div>
            <div className={styles.statItem}>
              <Clock size={13} />
              <span>官方出品</span>
            </div>
          </div>
        </div>

        {/* ── 右侧：创作者信息 + 评论区 ── */}
        <div className={styles.socialColumn}>
          {/* 创作者卡片 */}
          <div className={styles.creatorCard}>
            <div className={styles.creatorHeader}>
              <div className={styles.creatorAvatar}>{mockData.creator.avatar}</div>
              <div className={styles.creatorInfo}>
                <div className={styles.creatorName}>{mockData.creator.name}</div>
                <div className={styles.creatorBio}>{mockData.creator.bio}</div>
              </div>
            </div>
            <div className={styles.creatorStats}>
              <div className={styles.creatorStatItem}>
                <span className={styles.creatorStatVal}>{mockData.creator.works}</span>
                <span className={styles.creatorStatLabel}>作品</span>
              </div>
              <div className={styles.creatorStatItem}>
                <span className={styles.creatorStatVal}>{mockData.creator.followers}</span>
                <span className={styles.creatorStatLabel}>粉丝</span>
              </div>
            </div>
          </div>

          {/* 评论区 */}
          <div className={styles.commentSection}>
            <div className={styles.commentHeader}>
              <h3 className={styles.commentTitle}>
                <MessageCircle size={16} /> 评论 ({comments.length})
              </h3>
            </div>

            {/* 发表评论 */}
            <div className={styles.commentInput}>
              <input
                className={styles.commentField}
                placeholder="说点什么..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmitComment(); }}
              />
              <button className={styles.commentSend} onClick={handleSubmitComment} disabled={!newComment.trim()}>
                <Send size={14} />
              </button>
            </div>

            {/* 评论列表 */}
            <div className={styles.commentList}>
              {displayedComments.map(c => (
                <div key={c.id} className={styles.commentItem}>
                  <div className={styles.commentAvatar}>{c.avatar}</div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentMeta}>
                      <span className={styles.commentUser}>{c.user}</span>
                      <span className={styles.commentTime}>{c.time}</span>
                    </div>
                    <p className={styles.commentText}>{c.content}</p>
                    <button
                      className={`${styles.commentLike} ${c.liked ? styles.commentLikeActive : ''}`}
                      onClick={() => handleCommentLike(c.id)}
                    >
                      <ThumbsUp size={12} /> {c.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {comments.length > 3 && (
              <button className={styles.showMoreBtn} onClick={() => setShowAllComments(!showAllComments)}>
                {showAllComments ? '收起评论' : `查看全部 ${comments.length} 条评论`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
