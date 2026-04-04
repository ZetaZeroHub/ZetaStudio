import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileNavBar from '../../components/MobileNavBar/MobileNavBar';
import GameCard from '../../components/GameCard/GameCard';
import styles from './DiscoverPage.module.css';

/* ── 分类列表 ── */
const CATEGORIES = [
  { key: 'hot',       label: '热门' },
  { key: 'latest',    label: '最新' },
  { key: 'puzzle',    label: '益智' },
  { key: 'action',    label: '动作' },
  { key: 'casual',    label: '休闲' },
  { key: '3d',        label: '3D' },
  { key: 'education', label: '教育' },
  { key: 'strategy',  label: '策略' },
  { key: 'creative',  label: '创意' },
];

/* ── 社区游戏 — 全量覆盖 Pro + Kids 全模板 ── */
const COMMUNITY_GAMES = [
  // ── Pro 2D ──
  { id: 'disc-shooter',      title: '星际大冒险·太空射击',   poster: '/assets/custom/游戏模板-游戏封面-太空射击.png',            tag: '精选', authorTag: 'official', author: '星际猎人',     authorAvatar: '🚀', likes: 3201, views: 16800, category: 'action',    templateType: 'shooter' },
  { id: 'disc-platformer',   title: '马里奥式平台跳跃',     poster: '/assets/custom/游戏模板-游戏封面-平台跳跃.png',            tag: '精选', authorTag: 'official', author: '马里奥粉丝',   authorAvatar: '🏃', likes: 2780, views: 14500, category: 'action',    templateType: 'platformer' },
  { id: 'disc-quiz',         title: '最强大脑·知识竞赛',     poster: '/assets/custom/游戏模板-游戏封面-知识竞赛.png',            tag: '精选', authorTag: 'official', author: '学霸小王',     authorAvatar: '🧠', likes: 1950, views: 9800,  category: 'education', templateType: 'quiz' },
  { id: 'disc-galgame',      title: '樱花树下·剧情对话',     poster: '/assets/custom/游戏模板-游戏封面-NPC剧情对话.png',         tag: '精选', authorTag: 'official', author: '故事编织者',   authorAvatar: '💬', likes: 1680, views: 8400,  category: 'casual',    templateType: 'galgame' },
  // ── Pro 3D ──
  { id: 'disc-cube3d',       title: '3D魔方旋转体验',       poster: '/assets/custom/游戏模板-游戏封面-3D魔方.png',              tag: '3D',   authorTag: 'official', author: '3D探索者',     authorAvatar: '📦', likes: 1120, views: 5600,  category: '3d',        templateType: 'cube3d' },
  { id: 'disc-solar3d',      title: '3D太阳系星球模型',     poster: '/assets/custom/游戏模板-游戏封面-3D太阳系.png',             tag: '3D',   authorTag: 'official', author: '天文爱好者',   authorAvatar: '🪐', likes: 2540, views: 13200, category: '3d',        templateType: 'solar3d' },
  { id: 'disc-fps3d',        title: '3D射击·战术突围',       poster: '/assets/custom/游戏模板-游戏封面-3D第一人称射击.png',       tag: '3D',   authorTag: 'official', author: 'FPS老炮',      authorAvatar: '🎯', likes: 4100, views: 21500, category: '3d',        templateType: 'fps3d' },
  // ── Kids 原版 8款 ──
  { id: 'disc-shapematch',   title: '宝宝形状配对',         poster: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png',          tag: '社区作品', authorTag: 'user', author: '幼教小李',     authorAvatar: '🧩', likes: 1230, views: 6400,  category: 'puzzle',    templateType: 'shapeMatch' },
  { id: 'disc-memory',       title: '给女儿做的记忆翻牌',   poster: '/assets/custom/朋友们的游戏-游戏封面-记忆翻牌.png',        tag: '社区作品', authorTag: 'user', author: '戴眼镜的爸爸', authorAvatar: '👓', likes: 1324, views: 6900,  category: 'puzzle',    templateType: 'memoryCard' },
  { id: 'disc-counting',     title: '宝宝学数字',           poster: '/assets/custom/朋友们的游戏-游戏封面-数数乐.png',          tag: '社区作品', authorTag: 'user', author: '妈妈程序员',   authorAvatar: '👩‍💻', likes: 2340, views: 12800, category: 'education', templateType: 'counting' },
  { id: 'disc-wordpicture',  title: '趣味看图识字',         poster: '/assets/custom/朋友们的游戏-游戏封面-动物认知.png',        tag: '社区作品', authorTag: 'user', author: '语文老师',     authorAvatar: '🅰️', likes: 1560, views: 8100,  category: 'education', templateType: 'wordPicture' },
  { id: 'disc-colorbook',    title: '我的涂色乐园',         poster: '/assets/custom/朋友们的游戏-游戏封面-涂色本.png',          tag: '社区作品', authorTag: 'user', author: '小画家',       authorAvatar: '🎨', likes: 890,  views: 4500,  category: 'creative',  templateType: 'colorBook' },
  { id: 'disc-animalquiz',   title: '动物认知小课堂',       poster: '/assets/custom/朋友们的游戏-游戏封面-动物认知.png',        tag: '社区作品', authorTag: 'user', author: '科学小队长',   authorAvatar: '🔬', likes: 560,  views: 2900,  category: 'education', templateType: 'animalQuiz' },
  { id: 'disc-whackmole',    title: '超好玩的打地鼠！',     poster: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png',          tag: '社区作品', authorTag: 'user', author: 'AI玩家007',    authorAvatar: '🤖', likes: 1890, views: 10200, category: 'casual',    templateType: 'whackMole' },
  { id: 'disc-fruitcatch',   title: '接水果小游戏v2',       poster: '/assets/custom/朋友们的游戏-游戏封面-接水果.png',          tag: '社区作品', authorTag: 'user', author: '小游戏达人',   authorAvatar: '🎮', likes: 670,  views: 3200,  category: 'casual',    templateType: 'fruitCatch' },
  // ── Kids 认知 ──
  { id: 'disc-colorsort',    title: '彩色球分类大挑战',     poster: '/assets/custom/朋友们的游戏-游戏封面-记忆翻牌.png',        tag: '社区作品', authorTag: 'user', author: '彩虹妈妈',     authorAvatar: '🌈', likes: 980,  views: 5100,  category: 'puzzle',    templateType: 'colorSort' },
  { id: 'disc-spotdiff',     title: '火眼金睛·找不同',       poster: '/assets/custom/朋友们的游戏-游戏封面-打砖块.png',          tag: '社区作品', authorTag: 'user', author: '火眼金睛',     authorAvatar: '🔍', likes: 1340, views: 7000,  category: 'puzzle',    templateType: 'spotDiff' },
  { id: 'disc-shadowmatch',  title: '影子对对碰',           poster: '/assets/custom/朋友们的游戏-游戏封面-迷宫冒险.png',        tag: '社区作品', authorTag: 'user', author: '影子猎手',     authorAvatar: '🌑', likes: 870,  views: 4200,  category: 'puzzle',    templateType: 'shadowMatch' },
  // ── Kids 数学 ──
  { id: 'disc-mathbubble',   title: '加减法泡泡大战',       poster: '/assets/custom/朋友们的游戏-游戏封面-气球射击.png',        tag: '社区作品', authorTag: 'user', author: '数学小天才',   authorAvatar: '🫧', likes: 1450, views: 7600,  category: 'education', templateType: 'mathBubble' },
  { id: 'disc-numbersort',   title: '数字排排站',           poster: '/assets/custom/朋友们的游戏-游戏封面-数数乐.png',          tag: '社区作品', authorTag: 'user', author: '排队小能手',   authorAvatar: '🔢', likes: 960,  views: 4800,  category: 'education', templateType: 'numberSort' },
  { id: 'disc-shapecount',   title: '图形数一数',           poster: '/assets/custom/朋友们的游戏-游戏封面-打砖块.png',          tag: '社区作品', authorTag: 'user', author: '几何达人',     authorAvatar: '📐', likes: 1080, views: 5500,  category: 'education', templateType: 'shapeCount' },
  // ── Kids 语言 ──
  { id: 'disc-letterpuzzle', title: '字母拼图闯关',         poster: '/assets/custom/朋友们的游戏-游戏封面-记忆翻牌.png',        tag: '社区作品', authorTag: 'user', author: 'ABC老师',      authorAvatar: '🔤', likes: 1190, views: 6200,  category: 'education', templateType: 'letterPuzzle' },
  { id: 'disc-wordspell',    title: '看图拼单词',           poster: '/assets/custom/朋友们的游戏-游戏封面-涂色本.png',          tag: '社区作品', authorTag: 'user', author: '英语达人',     authorAvatar: '📝', likes: 1350, views: 7100,  category: 'education', templateType: 'wordSpell' },
  { id: 'disc-detective',    title: '小侦探破案记',         poster: '/assets/custom/朋友们的游戏-游戏封面-迷宫冒险.png',        tag: '社区作品', authorTag: 'user', author: '福尔摩斯Jr',   authorAvatar: '🕵️', likes: 2100, views: 11000, category: 'puzzle',    templateType: 'detective' },
  // ── Kids 创意 ──
  { id: 'disc-dotconnect',   title: '数字连线画画',         poster: '/assets/custom/朋友们的游戏-游戏封面-涂色本.png',          tag: '社区作品', authorTag: 'user', author: '线条艺术家',   authorAvatar: '✏️', likes: 1020, views: 5300,  category: 'creative',  templateType: 'dotConnect' },
  { id: 'disc-musicbeat',    title: '音乐节拍大师',         poster: '/assets/custom/朋友们的游戏-游戏封面-气球射击.png',        tag: '社区作品', authorTag: 'user', author: '节奏大师',     authorAvatar: '🥁', likes: 1680, views: 8800,  category: 'creative',  templateType: 'musicBeat' },
  { id: 'disc-drawline',     title: '神笔马良·画线条',       poster: '/assets/custom/朋友们的游戏-游戏封面-涂色本.png',          tag: '社区作品', authorTag: 'user', author: '涂鸦小王子',   authorAvatar: '🖊️', likes: 940,  views: 4700,  category: 'creative',  templateType: 'drawLine' },
  // ── Kids 科学 ──
  { id: 'disc-foodsort',     title: '健康饮食大分类',       poster: '/assets/custom/朋友们的游戏-游戏封面-接水果.png',          tag: '社区作品', authorTag: 'user', author: '营养师阿姨',   authorAvatar: '🥗', likes: 1100, views: 5700,  category: 'education', templateType: 'foodSort' },
  { id: 'disc-weatherdress', title: '天气预报穿衣服',       poster: '/assets/custom/朋友们的游戏-游戏封面-动物认知.png',        tag: '社区作品', authorTag: 'user', author: '气象小博士',   authorAvatar: '🌤️', likes: 1250, views: 6500,  category: 'education', templateType: 'weatherDress' },
  { id: 'disc-trashsort',    title: '环保小卫士·垃圾分类',   poster: '/assets/custom/朋友们的游戏-游戏封面-接水果.png',          tag: '社区作品', authorTag: 'user', author: '环保小卫士',   authorAvatar: '♻️', likes: 1380, views: 7200,  category: 'education', templateType: 'trashSort' },
  // ── Kids 反应/经典 ──
  { id: 'disc-maze',         title: '迷宫大挑战（超难）',   poster: '/assets/custom/朋友们的游戏-游戏封面-迷宫冒险.png',        tag: '社区作品', authorTag: 'user', author: '迷宫爱好者',   authorAvatar: '🧩', likes: 1780, views: 9300,  category: 'puzzle',    templateType: 'maze' },
  { id: 'disc-balloon',      title: '午休时做的打气球',     poster: '/assets/custom/朋友们的游戏-游戏封面-气球射击.png',        tag: '社区作品', authorTag: 'user', author: '游戏小王子',   authorAvatar: '🎈', likes: 980,  views: 5200,  category: 'casual',    templateType: 'balloonPop' },
  { id: 'disc-tetris',       title: '复刻经典俄罗斯方块',   poster: '/assets/custom/朋友们的游戏-游戏封面-俄罗斯方块.png',      tag: '社区作品', authorTag: 'user', author: '代码菜鸟',     authorAvatar: '🐣', likes: 2103, views: 11400, category: 'casual',    templateType: 'tetris' },
  { id: 'disc-breakout',     title: '像素风打砖块',         poster: '/assets/custom/朋友们的游戏-游戏封面-打砖块.png',          tag: '社区作品', authorTag: 'user', author: '像素复古党',   authorAvatar: '🧱', likes: 1560, views: 8200,  category: 'casual',    templateType: 'breakout' },
  { id: 'disc-motorbike',    title: '极速摩托冲刺',         poster: '/assets/custom/朋友们的游戏-游戏封面-坦克大战.png',        tag: '社区作品', authorTag: 'user', author: '极速飞车',     authorAvatar: '🏍️', likes: 2200, views: 11500, category: 'action',    templateType: 'motorbike' },
  { id: 'disc-platformjump', title: '蘑菇头跳跃闯关',       poster: '/assets/custom/游戏模板-游戏封面-平台跳跃.png',            tag: '社区作品', authorTag: 'user', author: '蘑菇头',       authorAvatar: '🍄', likes: 1670, views: 8700,  category: 'action',    templateType: 'platformJump' },
  { id: 'disc-archery',      title: '射箭大作战·弓箭手',     poster: '/assets/custom/游戏模板-游戏封面-太空射击.png',            tag: '社区作品', authorTag: 'user', author: '弓箭手Robin',  authorAvatar: '🏹', likes: 1920, views: 10000, category: 'action',    templateType: 'archeryBattle' },
  // ── Kids 策略 ──
  { id: 'disc-tank',         title: '练习封装的坦克小游戏', poster: '/assets/custom/朋友们的游戏-游戏封面-坦克大战.png',        tag: '社区作品', authorTag: 'user', author: '小明同学',     authorAvatar: '🎯', likes: 1456, views: 7340,  category: 'strategy',  templateType: 'tankBattle' },
  { id: 'disc-angrybirds',   title: '愤怒的小鸟弹弓版',     poster: '/assets/custom/朋友们的游戏-游戏封面-气球射击.png',        tag: '社区作品', authorTag: 'user', author: '弹弓少年',     authorAvatar: '🐦', likes: 3450, views: 18000, category: 'strategy',  templateType: 'angryBirds' },
];

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('hot');

  const filteredGames = useMemo(() => {
    let list = COMMUNITY_GAMES;

    // 分类过滤
    if (activeCategory !== 'hot' && activeCategory !== 'latest') {
      list = list.filter(g => g.category === activeCategory);
    }

    // 排序
    if (activeCategory === 'latest') {
      return [...list].reverse();
    }

    // 热门按点赞排序
    return [...list].sort((a, b) => b.likes - a.likes);
  }, [activeCategory]);

  const handleGameClick = (game) => {
    navigate(game.route || `/m/game/${game.id}`);
  };

  return (
    <div className={styles.page}>
      <MobileNavBar title="发现" />

      {/* 搜索栏 */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBar} onClick={() => navigate('/m/search')} style={{ cursor: 'pointer' }}>
          <Search size={16} />
          <span className={styles.searchInput} style={{ color: 'var(--text-muted)', userSelect: 'none' }}>
            搜索游戏和创作者...
          </span>
        </div>
      </div>

      {/* 分类标签 */}
      <div className={styles.categoryBar}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`${styles.catBtn} ${activeCategory === cat.key ? styles.catBtnActive : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 双列瀑布流 */}
      <div className={styles.feedScroll}>
        {filteredGames.length > 0 ? (
          <div className={styles.waterfall}>
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} onClick={handleGameClick} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔍</span>
            <span>暂无匹配的游戏</span>
          </div>
        )}

        <div className={styles.loadMore}>— 到底了 —</div>
      </div>
    </div>
  );
}

