import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Copy, Check, ArrowLeft, Share2, Heart, MessageCircle, Eye, Star, Send, ThumbsUp, Clock, User, Bookmark, Flag } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import GameCanvas from '../../components/GameCanvas/GameCanvas';
import useProjectStore from '../../stores/projectStore';
import useEditorStore from '../../stores/editorStore';
import { getTemplate } from '../../templates';
import styles from './PlayPage.module.css';

/* ── MOCK 社区互动数据 ── */
const MOCK_COMMENTS = [
  {
    id: 1,
    user: '小游戏达人',
    avatar: '🎮',
    content: '这个游戏太好玩了！关卡设计得很巧妙，第三关卡了我好久 😂',
    time: '2 小时前',
    likes: 24,
    liked: false,
  },
  {
    id: 2,
    user: '代码菜鸟',
    avatar: '🐣',
    content: '画面很精致，操作也很流畅，期待更多关卡！',
    time: '5 小时前',
    likes: 18,
    liked: true,
  },
  {
    id: 3,
    user: '戴眼镜的爸爸',
    avatar: '👓',
    content: '给女儿玩了一下午，她非常喜欢！已经收藏准备二次创作了',
    time: '1 天前',
    likes: 42,
    liked: false,
  },
  {
    id: 4,
    user: 'AI玩家007',
    avatar: '🤖',
    content: '用 AI 改了一下配色，效果出乎意料的好，推荐大家试试编辑功能',
    time: '2 天前',
    likes: 15,
    liked: false,
  },
  {
    id: 5,
    user: '妈妈程序员',
    avatar: '👩‍💻',
    content: '这个平台太棒了，孩子自己就能做游戏，寓教于乐！',
    time: '3 天前',
    likes: 56,
    liked: true,
  },
];

const MOCK_STATS = {
  views: 2847,
  likes: 386,
  comments: 52,
  shares: 128,
  bookmarks: 73,
  rating: 4.6,
  ratingCount: 89,
};

const MOCK_CREATOR = {
  name: '新手小白',
  avatar: '🎨',
  bio: '热爱用 AI 做小游戏的创作者',
  works: 12,
  followers: 234,
};

export default function PlayPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { loadAllProjects, getProject } = useProjectStore();
  const [project, setProject] = useState(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  // 社区互动状态
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(MOCK_STATS.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    loadAllProjects();
  }, []);

  useEffect(() => {
    const p = getProject(projectId);
    if (p) {
      setProject(p);
      // Initialize editorStore so GameCanvas can read elements/scripts/dimension
      const template = getTemplate(p.templateType);
      useEditorStore.getState().initEditor(p, template);
      // Force preview mode
      useEditorStore.getState().setMode('preview');
      setReady(true);
    }

    return () => {
      useEditorStore.getState().clearEditor();
    };
  }, [projectId, useProjectStore.getState().projects.length]);

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

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleCommentLike = (id) => {
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      user: '我',
      avatar: '😊',
      content: newComment.trim(),
      time: '刚刚',
      likes: 0,
      liked: false,
    };
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  const formatCount = (n) => {
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n;
  };

  if (!project || !ready) {
    return (
      <div className={styles.playPage}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playPage}>
      <Navbar hideBrand leftContent={
        <button className={styles.backBtn} onClick={() => navigate('/')}><ArrowLeft size={14} /> 返回首页</button>
      }>
        <span className={styles.gameTitle}>{project.name}</span>
      </Navbar>

      <div className={styles.mainContent}>
        {/* ── 左侧：游戏画面 + 操作 ── */}
        <div className={styles.gameColumn}>
          <div className={styles.gameFrame}>
            <GameCanvas mode="preview" />
          </div>

          {/* 游戏下方操作栏 */}
          <div className={styles.actionBar}>
            <div className={styles.actionLeft}>
              <button className={`${styles.actionBtn} ${liked ? styles.actionBtnActive : ''}`} onClick={handleLike}>
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {formatCount(likeCount)}
              </button>
              <button className={styles.actionBtn}>
                <MessageCircle size={16} /> {MOCK_STATS.comments}
              </button>
              <button className={`${styles.actionBtn} ${bookmarked ? styles.actionBtnActive : ''}`} onClick={handleBookmark}>
                <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} /> 收藏
              </button>
            </div>
            <div className={styles.actionRight}>
              <button className={styles.editBtn} onClick={() => navigate(`/editor/${project.id}`)}>
                <Pencil size={14} /> 编辑关卡
              </button>
              <button className={styles.shareBtn} onClick={handleCopy}>
                {copied ? <><Check size={14} /> 已复制</> : <><Share2 size={14} /> 分享链接</>}
              </button>
            </div>
          </div>

          {/* 游戏数据看板 */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <Eye size={13} />
              <span>{formatCount(MOCK_STATS.views)} 次浏览</span>
            </div>
            <div className={styles.statItem}>
              <Star size={13} fill="currentColor" />
              <span>{MOCK_STATS.rating} 分 ({MOCK_STATS.ratingCount} 人评)</span>
            </div>
            <div className={styles.statItem}>
              <Clock size={13} />
              <span>3 天前发布</span>
            </div>
          </div>
        </div>

        {/* ── 右侧：创作者信息 + 评论区 ── */}
        <div className={styles.socialColumn}>
          {/* 创作者卡片 */}
          <div className={styles.creatorCard}>
            <div className={styles.creatorHeader}>
              <div className={styles.creatorAvatar}>{MOCK_CREATOR.avatar}</div>
              <div className={styles.creatorInfo}>
                <div className={styles.creatorName}>{MOCK_CREATOR.name}</div>
                <div className={styles.creatorBio}>{MOCK_CREATOR.bio}</div>
              </div>
            </div>
            <div className={styles.creatorStats}>
              <div className={styles.creatorStatItem}>
                <span className={styles.creatorStatVal}>{MOCK_CREATOR.works}</span>
                <span className={styles.creatorStatLabel}>作品</span>
              </div>
              <div className={styles.creatorStatItem}>
                <span className={styles.creatorStatVal}>{MOCK_CREATOR.followers}</span>
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
              <button
                className={styles.commentSend}
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
              >
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
              <button
                className={styles.showMoreBtn}
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? '收起评论' : `查看全部 ${comments.length} 条评论`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
