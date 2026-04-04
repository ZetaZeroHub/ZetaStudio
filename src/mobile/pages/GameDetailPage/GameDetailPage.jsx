import { useState, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, MessageCircle, Share2, Bookmark,
  Repeat2, X, Send, Play,
} from 'lucide-react';
import GameCanvas from '../../../components/GameCanvas/GameCanvas';
import useEditorStore from '../../../stores/editorStore';
import { getTemplate } from '../../../templates';
import styles from './GameDetailPage.module.css';

/* ── 海报路径映射 ── */
const P = (n) => `/assets/custom/${n}`;
const POSTER_MAP = {
  shooter:       P('游戏模板-游戏封面-太空射击.png'),
  platformer:    P('游戏模板-游戏封面-平台跳跃.png'),
  quiz:          P('游戏模板-游戏封面-知识竞赛.png'),
  galgame:       P('游戏模板-游戏封面-NPC剧情对话.png'),
  cube3d:        P('游戏模板-游戏封面-3D魔方.png'),
  solar3d:       P('游戏模板-游戏封面-3D太阳系.png'),
  fps3d:         P('游戏模板-游戏封面-3D第一人称射击.png'),
  shapeMatch:    P('朋友们的游戏-游戏封面-打地鼠.png'),
  memoryCard:    P('朋友们的游戏-游戏封面-记忆翻牌.png'),
  counting:      P('朋友们的游戏-游戏封面-数数乐.png'),
  wordPicture:   P('朋友们的游戏-游戏封面-动物认知.png'),
  colorBook:     P('朋友们的游戏-游戏封面-涂色本.png'),
  animalQuiz:    P('朋友们的游戏-游戏封面-动物认知.png'),
  whackMole:     P('朋友们的游戏-游戏封面-打地鼠.png'),
  fruitCatch:    P('朋友们的游戏-游戏封面-接水果.png'),
  colorSort:     P('朋友们的游戏-游戏封面-记忆翻牌.png'),
  spotDiff:      P('朋友们的游戏-游戏封面-打砖块.png'),
  shadowMatch:   P('朋友们的游戏-游戏封面-迷宫冒险.png'),
  mathBubble:    P('朋友们的游戏-游戏封面-气球射击.png'),
  numberSort:    P('朋友们的游戏-游戏封面-数数乐.png'),
  shapeCount:    P('朋友们的游戏-游戏封面-打砖块.png'),
  letterPuzzle:  P('朋友们的游戏-游戏封面-记忆翻牌.png'),
  wordSpell:     P('朋友们的游戏-游戏封面-涂色本.png'),
  detective:     P('朋友们的游戏-游戏封面-迷宫冒险.png'),
  dotConnect:    P('朋友们的游戏-游戏封面-涂色本.png'),
  musicBeat:     P('朋友们的游戏-游戏封面-气球射击.png'),
  drawLine:      P('朋友们的游戏-游戏封面-涂色本.png'),
  foodSort:      P('朋友们的游戏-游戏封面-接水果.png'),
  weatherDress:  P('朋友们的游戏-游戏封面-动物认知.png'),
  trashSort:     P('朋友们的游戏-游戏封面-接水果.png'),
  maze:          P('朋友们的游戏-游戏封面-迷宫冒险.png'),
  balloonPop:    P('朋友们的游戏-游戏封面-气球射击.png'),
  tetris:        P('朋友们的游戏-游戏封面-俄罗斯方块.png'),
  breakout:      P('朋友们的游戏-游戏封面-打砖块.png'),
  motorbike:     P('朋友们的游戏-游戏封面-坦克大战.png'),
  platformJump:  P('游戏模板-游戏封面-平台跳跃.png'),
  archeryBattle: P('游戏模板-游戏封面-太空射击.png'),
  tankBattle:    P('朋友们的游戏-游戏封面-坦克大战.png'),
  angryBirds:    P('朋友们的游戏-游戏封面-气球射击.png'),
};

/* ── 游戏数据 (全量 Pro + Kids 编辑器游戏) ── */
const _GAMES = [
  // Pro 2D
  { ids: ['disc-shooter','feed-shooter'],           title: '太空射击',       templateType: 'shooter',       author: '星际猎人',     authorAvatar: '🚀', likes: 3201, comments: 105, shares: 412 },
  { ids: ['disc-platformer','feed-platformer'],     title: '平台跳跃',       templateType: 'platformer',    author: '马里奥粉丝',   authorAvatar: '🏃', likes: 2780, comments: 88,  shares: 356 },
  { ids: ['disc-quiz','feed-quiz'],                 title: '知识竞赛',       templateType: 'quiz',          author: '学霸小王',     authorAvatar: '🧠', likes: 1950, comments: 73,  shares: 290 },
  { ids: ['disc-galgame','feed-galgame'],           title: 'NPC剧情对话',    templateType: 'galgame',       author: '故事编织者',   authorAvatar: '💬', likes: 1680, comments: 94,  shares: 187 },
  // Pro 3D
  { ids: ['disc-cube3d','feed-cube3d'],             title: '3D魔方',         templateType: 'cube3d',        author: '3D探索者',     authorAvatar: '📦', likes: 1120, comments: 32,  shares: 98  },
  { ids: ['disc-solar3d','feed-solar3d'],           title: '3D太阳系',       templateType: 'solar3d',       author: '天文爱好者',   authorAvatar: '🪐', likes: 2540, comments: 67,  shares: 345 },
  { ids: ['disc-fps3d','feed-fps3d'],               title: '3D第一人称射击', templateType: 'fps3d',         author: 'FPS老炮',      authorAvatar: '🎯', likes: 4100, comments: 156, shares: 520 },
  // Kids 原版
  { ids: ['disc-shapematch','feed-shapematch'],     title: '形状配对',       templateType: 'shapeMatch',    author: '幼教小李',     authorAvatar: '🧩', likes: 1230, comments: 44,  shares: 167 },
  { ids: ['disc-memory','feed-memory','featured-memory'],           title: '记忆翻牌',       templateType: 'memoryCard',    author: '戴眼镜的爸爸', authorAvatar: '👓', likes: 1324, comments: 45,  shares: 189 },
  { ids: ['disc-counting','feed-counting','featured-counting'],     title: '数数乐',         templateType: 'counting',      author: '妈妈程序员',   authorAvatar: '👩‍💻', likes: 2340, comments: 92,  shares: 378 },
  { ids: ['disc-wordpicture','feed-wordpicture'],   title: '看图识字',       templateType: 'wordPicture',   author: '语文老师',     authorAvatar: '🅰️', likes: 1560, comments: 51,  shares: 203 },
  { ids: ['disc-colorbook','feed-colorbook','featured-colorbook'],   title: '涂色本',         templateType: 'colorBook',     author: '小画家',       authorAvatar: '🎨', likes: 1120, comments: 41,  shares: 156 },
  { ids: ['disc-animalquiz','feed-animalquiz','featured-animalquiz'], title: '动物认知',       templateType: 'animalQuiz',    author: '科学小队长',   authorAvatar: '🔬', likes: 890,  comments: 27,  shares: 99  },
  { ids: ['disc-whackmole','feed-whackmole','featured-whackmole'],   title: '打地鼠',         templateType: 'whackMole',     author: 'AI玩家007',    authorAvatar: '🤖', likes: 1890, comments: 63,  shares: 245 },
  { ids: ['disc-fruitcatch','feed-fruit','featured-fruitcatch'],     title: '接水果',         templateType: 'fruitCatch',    author: '快乐小厨',     authorAvatar: '🧺', likes: 1567, comments: 58,  shares: 201 },
  // Kids 认知
  { ids: ['disc-colorsort','feed-colorsort'],       title: '颜色分类',       templateType: 'colorSort',     author: '彩虹妈妈',     authorAvatar: '🌈', likes: 980,  comments: 35,  shares: 120 },
  { ids: ['disc-spotdiff','feed-spotdiff'],         title: '找不同',         templateType: 'spotDiff',      author: '火眼金睛',     authorAvatar: '🔍', likes: 1340, comments: 48,  shares: 178 },
  { ids: ['disc-shadowmatch','feed-shadowmatch'],   title: '影子配对',       templateType: 'shadowMatch',   author: '影子猎手',     authorAvatar: '🌑', likes: 870,  comments: 29,  shares: 95  },
  // Kids 数学
  { ids: ['disc-mathbubble','feed-mathbubble'],     title: '加减法泡泡',     templateType: 'mathBubble',    author: '数学小天才',   authorAvatar: '🫧', likes: 1450, comments: 52,  shares: 198 },
  { ids: ['disc-numbersort','feed-numbersort'],     title: '数字排序',       templateType: 'numberSort',    author: '排队小能手',   authorAvatar: '🔢', likes: 960,  comments: 33,  shares: 112 },
  { ids: ['disc-shapecount','feed-shapecount'],     title: '图形计数',       templateType: 'shapeCount',    author: '几何达人',     authorAvatar: '📐', likes: 1080, comments: 38,  shares: 134 },
  // Kids 语言
  { ids: ['disc-letterpuzzle','feed-letterpuzzle'], title: '字母拼图',       templateType: 'letterPuzzle',  author: 'ABC老师',      authorAvatar: '🔤', likes: 1190, comments: 43,  shares: 155 },
  { ids: ['disc-wordspell','feed-wordspell'],       title: '单词拼写',       templateType: 'wordSpell',     author: '英语达人',     authorAvatar: '📝', likes: 1350, comments: 49,  shares: 182 },
  { ids: ['disc-detective','feed-detective'],       title: '侦探破案',       templateType: 'detective',     author: '福尔摩斯Jr',   authorAvatar: '🕵️', likes: 2100, comments: 78,  shares: 310 },
  // Kids 创意
  { ids: ['disc-dotconnect','feed-dotconnect'],     title: '简笔画连线',     templateType: 'dotConnect',    author: '线条艺术家',   authorAvatar: '✏️', likes: 1020, comments: 36,  shares: 128 },
  { ids: ['disc-musicbeat','feed-musicbeat'],       title: '音乐节拍',       templateType: 'musicBeat',     author: '节奏大师',     authorAvatar: '🥁', likes: 1680, comments: 61,  shares: 223 },
  { ids: ['disc-drawline','feed-drawline'],         title: '画线条',         templateType: 'drawLine',      author: '涂鸦小王子',   authorAvatar: '🖊️', likes: 940,  comments: 30,  shares: 105 },
  // Kids 科学
  { ids: ['disc-foodsort','feed-foodsort'],         title: '食物分类',       templateType: 'foodSort',      author: '营养师阿姨',   authorAvatar: '🥗', likes: 1100, comments: 39,  shares: 143 },
  { ids: ['disc-weatherdress','feed-weatherdress'], title: '天气穿衣',       templateType: 'weatherDress',  author: '气象小博士',   authorAvatar: '🌤️', likes: 1250, comments: 46,  shares: 168 },
  { ids: ['disc-trashsort','feed-trashsort'],       title: '垃圾分类',       templateType: 'trashSort',     author: '环保小卫士',   authorAvatar: '♻️', likes: 1380, comments: 50,  shares: 190 },
  // Kids 反应/经典
  { ids: ['disc-maze','feed-maze','featured-maze2'],               title: '迷宫冒险',       templateType: 'maze',          author: '迷宫大师',     authorAvatar: '🏁', likes: 1780, comments: 62,  shares: 234 },
  { ids: ['disc-balloon','feed-balloon','featured-balloon'],       title: '气球射击',       templateType: 'balloonPop',    author: '游戏小王子',   authorAvatar: '🎈', likes: 980,  comments: 34,  shares: 88  },
  { ids: ['disc-tetris','feed-tetris','featured-tetris'],           title: '俄罗斯方块',     templateType: 'tetris',        author: '代码菜鸟',     authorAvatar: '🐣', likes: 2103, comments: 76,  shares: 320 },
  { ids: ['disc-breakout','feed-breakout','featured-breakout'],     title: '打砖块',         templateType: 'breakout',      author: '像素复古党',   authorAvatar: '🧱', likes: 1560, comments: 55,  shares: 198 },
  { ids: ['disc-motorbike','feed-motorbike'],       title: '摩托车冲刺',     templateType: 'motorbike',     author: '极速飞车',     authorAvatar: '🏍️', likes: 2200, comments: 82,  shares: 312 },
  { ids: ['disc-platformjump','feed-platformjump'], title: '跳跃闯关',       templateType: 'platformJump',  author: '蘑菇头',       authorAvatar: '🍄', likes: 1670, comments: 59,  shares: 215 },
  { ids: ['disc-archery','feed-archery'],           title: '射箭大作战',     templateType: 'archeryBattle', author: '弓箭手Robin',  authorAvatar: '🏹', likes: 1920, comments: 71,  shares: 267 },
  // Kids 策略
  { ids: ['disc-tank','feed-tank','featured-tank'],                 title: '坦克大战',       templateType: 'tankBattle',    author: '小明同学',     authorAvatar: '🎯', likes: 1456, comments: 89,  shares: 178 },
  { ids: ['disc-angrybirds','feed-angrybirds'],     title: '愤怒的小鸟',     templateType: 'angryBirds',    author: '弹弓少年',     authorAvatar: '🐦', likes: 3450, comments: 134, shares: 478 },
];
// 构建 id → game 映射表（自动注入 poster）
const GAME_DB = {};
_GAMES.forEach(g => {
  const { ids, ...data } = g;
  data.poster = POSTER_MAP[data.templateType] || P('朋友们的游戏-游戏封面-打地鼠.png');
  ids.forEach(id => { GAME_DB[id] = data; });
});

const MOCK_COMMENTS = [
  { id: 'dc1', user: '小游戏达人', avatar: '🎮', text: '画面好精致！', time: '2小时前', likes: 12 },
  { id: 'dc2', user: '代码菜鸟',   avatar: '🐣', text: '玩了好几遍超级上瘾', time: '5小时前', likes: 8 },
  { id: 'dc3', user: 'AI玩家007',   avatar: '🤖', text: '这个关卡设计很有想法', time: '1天前', likes: 23 },
  { id: 'dc4', user: '戴眼镜的爸爸', avatar: '👓', text: '给女儿玩了，她很喜欢', time: '2天前', likes: 5 },
  { id: 'dc5', user: '妈妈程序员',  avatar: '👩‍💻', text: '学到了很多技巧', time: '3天前', likes: 3 },
];

const SHARE_OPTIONS = [
  { icon: '💬', label: '微信', bg: '#07C160' },
  { icon: '📱', label: '朋友圈', bg: '#07C160' },
  { icon: '🐦', label: '微博', bg: '#E6162D' },
  { icon: '🔗', label: '复制链接', bg: '#666' },
];

const fmt = n => n >= 10000 ? (n / 10000).toFixed(1) + 'w' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

export default function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const game = GAME_DB[gameId] || Object.values(GAME_DB)[0];

  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [localComments, setLocalComments] = useState([]);
  const [likedComments, setLikedComments] = useState(new Set());

  const allComments = [...MOCK_COMMENTS, ...localComments];

  /* ── 初始化游戏引擎 ── */
  useLayoutEffect(() => {
    if (!playing || !game.templateType) return;
    const template = getTemplate(game.templateType);
    if (template) {
      const virtualProject = {
        id: `detail_${gameId}`,
        name: game.title,
        templateType: game.templateType,
        dimension: template.dimension || '2D',
        elements: [],
        code: '',
      };
      console.log('[GameDetail] 初始化游戏:', game.title);
      useEditorStore.getState().initEditor(virtualProject, template);
      useEditorStore.setState({ mode: 'preview' });
    }
    return () => { useEditorStore.getState().clearEditor(); };
  }, [playing, gameId]);

  /* ── 发送评论 ── */
  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    setLocalComments(prev => [...prev, {
      id: `user_${Date.now()}`,
      user: '我',
      avatar: '😊',
      text: commentInput.trim(),
      time: '刚刚',
      likes: 0,
    }]);
    setCommentInput('');
  };

  const toggleCommentLike = (id) => setLikedComments(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className={styles.page}>
      {/* 返回 */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
      </button>

      {/* 游戏区 */}
      <div className={styles.gameCanvas}>
        {playing ? (
          <GameCanvas mode="preview" />
        ) : (
          <>
            <img src={game.poster} alt={game.title} className={styles.gamePoster} />
            <button className={styles.playBtn} onClick={() => setPlaying(true)}>
              <Play size={28} fill="#fff" />
              <span>开始游玩</span>
            </button>
          </>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className={styles.bottomBar}>
        <div className={styles.authorInfo}>
          <div className={styles.avatar}>{game.authorAvatar}</div>
          <div>
            <div className={styles.authorName}>{game.author}</div>
            <div className={styles.gameTitle}>{game.title}</div>
          </div>
        </div>

        <div className={styles.barActions}>
          <button
            className={`${styles.barBtn} ${liked ? styles.barBtnActive : ''}`}
            onClick={() => setLiked(!liked)}
          >
            <Heart size={20} fill={liked ? '#FF3B30' : 'none'} />
            <span className={styles.barCount}>{fmt(game.likes + (liked ? 1 : 0))}</span>
          </button>
          <button
            className={`${styles.barBtn} ${saved ? styles.barBtnActive : ''}`}
            onClick={() => setSaved(!saved)}
          >
            <Bookmark size={20} fill={saved ? '#FF3B30' : 'none'} />
          </button>
          <button className={styles.barBtn} onClick={() => setDrawer('comments')}>
            <MessageCircle size={20} />
            <span className={styles.barCount}>{fmt(allComments.length)}</span>
          </button>
          <button className={styles.barBtn} onClick={() => setDrawer('share')}>
            <Share2 size={20} />
          </button>
          <button
            className={`${styles.barBtn} ${styles.barBtnRemix}`}
            onClick={() => navigate(`/m/ai-chat?prompt=${encodeURIComponent('Remix: ' + game.title)}`)}
          >
            <Repeat2 size={20} />
          </button>
        </div>
      </div>

      {/* ── 评论抽屉 ── */}
      {drawer === 'comments' && (
        <div className={styles.drawer}>
          <div className={styles.drawerBackdrop} onClick={() => setDrawer(null)} />
          <div className={styles.drawerContent}>
            <div className={styles.drawerHandle} />
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>{allComments.length} 条评论</span>
              <button className={styles.drawerClose} onClick={() => setDrawer(null)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.drawerScroll}>
              {allComments.map(c => (
                <div key={c.id} className={styles.commentItem}>
                  <div className={styles.commentAvatar}>{c.avatar}</div>
                  <div className={styles.commentBody}>
                    <span className={styles.commentUser}>{c.user}</span>
                    <span className={styles.commentTime}>{c.time}</span>
                    <div className={styles.commentText}>{c.text}</div>
                    <button
                      className={`${styles.commentLikeBtn} ${likedComments.has(c.id) ? styles.commentLiked : ''}`}
                      onClick={() => toggleCommentLike(c.id)}
                    >
                      <Heart size={12} fill={likedComments.has(c.id) ? 'currentColor' : 'none'} />
                      <span>{(c.likes || 0) + (likedComments.has(c.id) ? 1 : 0) || ''}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.commentInputRow}>
              <input
                className={styles.commentInput}
                placeholder="说点什么..."
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendComment()}
              />
              <button
                className={styles.commentSendBtn}
                onClick={handleSendComment}
                disabled={!commentInput.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 分享抽屉 ── */}
      {drawer === 'share' && (
        <div className={styles.drawer}>
          <div className={styles.drawerBackdrop} onClick={() => setDrawer(null)} />
          <div className={styles.drawerContent}>
            <div className={styles.drawerHandle} />
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>分享</span>
              <button className={styles.drawerClose} onClick={() => setDrawer(null)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.drawerScroll}>
              <div className={styles.shareGrid}>
                {SHARE_OPTIONS.map(opt => (
                  <div key={opt.label} className={styles.shareItem} onClick={() => setDrawer(null)}>
                    <div className={styles.shareIcon} style={{ background: opt.bg + '18', color: opt.bg }}>
                      {opt.icon}
                    </div>
                    <span className={styles.shareLabel}>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
