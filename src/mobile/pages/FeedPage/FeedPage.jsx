import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, Repeat2, X, Send } from 'lucide-react';
import GameCanvas from '../../../components/GameCanvas/GameCanvas';
import useEditorStore from '../../../stores/editorStore';
import { getTemplate } from '../../../templates';
import styles from './FeedPage.module.css';

/* ── 分类标签 ── */
const FEED_CATEGORIES = [
  { key: 'all',       label: '推荐' },
  { key: '3d',        label: '3D' },
  { key: 'shooter',   label: '射击' },
  { key: 'action',    label: '动作' },
  { key: 'puzzle',    label: '益智' },
  { key: 'education', label: '教育' },
  { key: 'creative',  label: '创意' },
  { key: 'strategy',  label: '策略' },
  { key: 'casual',    label: '休闲' },
];

/* ── 全量推荐流 — Pro 2D/3D + Kids 全部模板 ── */
const ALL_FEED_ITEMS = [
  // ── Pro 2D ──
  { id: 'feed-shooter',      title: '太空射击',     templateType: 'shooter',       category: 'shooter',   author: '星际猎人',     authorAvatar: '🚀', likes: 3201, comments: 105, shares: 412 },
  { id: 'feed-platformer',   title: '平台跳跃',     templateType: 'platformer',    category: 'action',    author: '马里奥粉丝',   authorAvatar: '🏃', likes: 2780, comments: 88,  shares: 356 },
  { id: 'feed-quiz',         title: '知识竞赛',     templateType: 'quiz',          category: 'education', author: '学霸小王',     authorAvatar: '🧠', likes: 1950, comments: 73,  shares: 290 },
  { id: 'feed-galgame',      title: 'NPC剧情对话',  templateType: 'galgame',       category: 'casual',    author: '故事编织者',   authorAvatar: '💬', likes: 1680, comments: 94,  shares: 187 },
  // ── Pro 3D ──
  { id: 'feed-cube3d',       title: '3D魔方',       templateType: 'cube3d',        category: '3d',        author: '3D探索者',     authorAvatar: '📦', likes: 1120, comments: 32,  shares: 98  },
  { id: 'feed-solar3d',      title: '3D太阳系',     templateType: 'solar3d',       category: '3d',        author: '天文爱好者',   authorAvatar: '🪐', likes: 2540, comments: 67,  shares: 345 },
  { id: 'feed-fps3d',        title: '3D第一人称射击', templateType: 'fps3d',        category: '3d',        author: 'FPS老炮',      authorAvatar: '🎯', likes: 4100, comments: 156, shares: 520 },
  // ── Kids 原版 8款 ──
  { id: 'feed-shapematch',   title: '形状配对',     templateType: 'shapeMatch',    category: 'puzzle',    author: '幼教小李',     authorAvatar: '🧩', likes: 1230, comments: 44,  shares: 167 },
  { id: 'feed-memory',       title: '记忆翻牌',     templateType: 'memoryCard',    category: 'puzzle',    author: '戴眼镜的爸爸', authorAvatar: '👓', likes: 1324, comments: 45,  shares: 189 },
  { id: 'feed-counting',     title: '数数乐',       templateType: 'counting',      category: 'education', author: '妈妈程序员',   authorAvatar: '👩‍💻', likes: 2340, comments: 92,  shares: 378 },
  { id: 'feed-wordpicture',  title: '看图识字',     templateType: 'wordPicture',   category: 'education', author: '语文老师',     authorAvatar: '🅰️', likes: 1560, comments: 51,  shares: 203 },
  { id: 'feed-colorbook',    title: '涂色本',       templateType: 'colorBook',     category: 'creative',  author: '小画家',       authorAvatar: '🎨', likes: 1120, comments: 41,  shares: 156 },
  { id: 'feed-animalquiz',   title: '动物认知',     templateType: 'animalQuiz',    category: 'education', author: '动物园管理员', authorAvatar: '🐾', likes: 890,  comments: 27,  shares: 99  },
  { id: 'feed-whackmole',    title: '打地鼠',       templateType: 'whackMole',     category: 'casual',    author: 'AI玩家007',    authorAvatar: '🤖', likes: 1890, comments: 63,  shares: 245 },
  { id: 'feed-fruit',        title: '接水果',       templateType: 'fruitCatch',    category: 'casual',    author: '快乐小厨',     authorAvatar: '🧺', likes: 1567, comments: 58,  shares: 201 },
  // ── Kids 认知 ──
  { id: 'feed-colorsort',    title: '颜色分类',     templateType: 'colorSort',     category: 'puzzle',    author: '彩虹妈妈',     authorAvatar: '🌈', likes: 980,  comments: 35,  shares: 120 },
  { id: 'feed-spotdiff',     title: '找不同',       templateType: 'spotDiff',      category: 'puzzle',    author: '火眼金睛',     authorAvatar: '🔍', likes: 1340, comments: 48,  shares: 178 },
  { id: 'feed-shadowmatch',  title: '影子配对',     templateType: 'shadowMatch',   category: 'puzzle',    author: '影子猎手',     authorAvatar: '🌑', likes: 870,  comments: 29,  shares: 95  },
  // ── Kids 数学 ──
  { id: 'feed-mathbubble',   title: '加减法泡泡',   templateType: 'mathBubble',    category: 'education', author: '数学小天才',   authorAvatar: '🫧', likes: 1450, comments: 52,  shares: 198 },
  { id: 'feed-numbersort',   title: '数字排序',     templateType: 'numberSort',    category: 'education', author: '排队小能手',   authorAvatar: '🔢', likes: 960,  comments: 33,  shares: 112 },
  { id: 'feed-shapecount',   title: '图形计数',     templateType: 'shapeCount',    category: 'education', author: '几何达人',     authorAvatar: '📐', likes: 1080, comments: 38,  shares: 134 },
  // ── Kids 语言 ──
  { id: 'feed-letterpuzzle', title: '字母拼图',     templateType: 'letterPuzzle',  category: 'education', author: 'ABC老师',      authorAvatar: '🔤', likes: 1190, comments: 43,  shares: 155 },
  { id: 'feed-wordspell',    title: '单词拼写',     templateType: 'wordSpell',     category: 'education', author: '英语达人',     authorAvatar: '📝', likes: 1350, comments: 49,  shares: 182 },
  { id: 'feed-detective',    title: '侦探破案',     templateType: 'detective',     category: 'puzzle',    author: '福尔摩斯Jr',   authorAvatar: '🕵️', likes: 2100, comments: 78,  shares: 310 },
  // ── Kids 创意 ──
  { id: 'feed-dotconnect',   title: '简笔画连线',   templateType: 'dotConnect',    category: 'creative',  author: '线条艺术家',   authorAvatar: '✏️', likes: 1020, comments: 36,  shares: 128 },
  { id: 'feed-musicbeat',    title: '音乐节拍',     templateType: 'musicBeat',     category: 'creative',  author: '节奏大师',     authorAvatar: '🥁', likes: 1680, comments: 61,  shares: 223 },
  { id: 'feed-drawline',     title: '画线条',       templateType: 'drawLine',      category: 'creative',  author: '涂鸦小王子',   authorAvatar: '🖊️', likes: 940,  comments: 30,  shares: 105 },
  // ── Kids 科学 ──
  { id: 'feed-foodsort',     title: '食物分类',     templateType: 'foodSort',      category: 'education', author: '营养师阿姨',   authorAvatar: '🥗', likes: 1100, comments: 39,  shares: 143 },
  { id: 'feed-weatherdress', title: '天气穿衣',     templateType: 'weatherDress',  category: 'education', author: '气象小博士',   authorAvatar: '🌤️', likes: 1250, comments: 46,  shares: 168 },
  { id: 'feed-trashsort',    title: '垃圾分类',     templateType: 'trashSort',     category: 'education', author: '环保小卫士',   authorAvatar: '♻️', likes: 1380, comments: 50,  shares: 190 },
  // ── Kids 反应/经典 ──
  { id: 'feed-maze',         title: '迷宫冒险',     templateType: 'maze',          category: 'puzzle',    author: '迷宫大师',     authorAvatar: '🏁', likes: 1780, comments: 62,  shares: 234 },
  { id: 'feed-balloon',      title: '气球射击',     templateType: 'balloonPop',    category: 'shooter',   author: '游戏小王子',   authorAvatar: '🎈', likes: 980,  comments: 34,  shares: 88  },
  { id: 'feed-tetris',       title: '俄罗斯方块',   templateType: 'tetris',        category: 'casual',    author: '代码菜鸟',     authorAvatar: '🐣', likes: 2103, comments: 76,  shares: 320 },
  { id: 'feed-breakout',     title: '打砖块',       templateType: 'breakout',      category: 'casual',    author: '像素复古党',   authorAvatar: '🧱', likes: 1560, comments: 55,  shares: 198 },
  { id: 'feed-motorbike',    title: '摩托车冲刺',   templateType: 'motorbike',     category: 'action',    author: '极速飞车',     authorAvatar: '🏍️', likes: 2200, comments: 82,  shares: 312 },
  { id: 'feed-platformjump', title: '跳跃闯关',     templateType: 'platformJump',  category: 'action',    author: '蘑菇头',       authorAvatar: '🍄', likes: 1670, comments: 59,  shares: 215 },
  { id: 'feed-archery',      title: '射箭大作战',   templateType: 'archeryBattle', category: 'shooter',   author: '弓箭手Robin',  authorAvatar: '🏹', likes: 1920, comments: 71,  shares: 267 },
  // ── Kids 策略 ──
  { id: 'feed-tank',         title: '坦克大战',     templateType: 'tankBattle',    category: 'strategy',  author: '小明同学',     authorAvatar: '🎯', likes: 1456, comments: 89,  shares: 178 },
  { id: 'feed-angrybirds',   title: '愤怒的小鸟',   templateType: 'angryBirds',    category: 'strategy',  author: '弹弓少年',     authorAvatar: '🐦', likes: 3450, comments: 134, shares: 478 },
];

/* ── Fisher-Yates 洗牌 ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── 专属评论库 ── */
const MOCK_COMMENTS = {
  'feed-shooter':      [
    { id: 'sh1', user: '星际迷', avatar: '🌟', text: '飞船操控手感太好了', time: '2分钟前', likes: 33 },
    { id: 'sh2', user: '老玩家', avatar: '🎮', text: '有小时候街机的感觉', time: '18分钟前', likes: 67 },
    { id: 'sh3', user: '设计师', avatar: '✨', text: '星空粒子背景好美', time: '1小时前', likes: 21 },
  ],
  'feed-platformer':   [
    { id: 'pl1', user: '跳跳虎', avatar: '🐯', text: '跳跃手感很流畅', time: '5分钟前', likes: 28 },
    { id: 'pl2', user: '速通玩家', avatar: '⚡', text: '42秒通关！谁来挑战', time: '25分钟前', likes: 89 },
    { id: 'pl3', user: '新人', avatar: '🌱', text: '第三关好难跳过去', time: '2小时前', likes: 12 },
  ],
  'feed-quiz':         [
    { id: 'qz1', user: '学霸', avatar: '📚', text: '全对！题目出得好', time: '3分钟前', likes: 45 },
    { id: 'qz2', user: '历史迷', avatar: '🏛️', text: '希望加更多历史题', time: '40分钟前', likes: 23 },
    { id: 'qz3', user: '小学生', avatar: '🧒', text: '好多不会但学到了', time: '1小时前', likes: 56 },
  ],
  'feed-galgame':      [
    { id: 'gl1', user: '剧情党', avatar: '📖', text: '对话写得太有感觉了', time: '8分钟前', likes: 52 },
    { id: 'gl2', user: '声优控', avatar: '🎤', text: '期待加配音', time: '35分钟前', likes: 18 },
    { id: 'gl3', user: '全收集', avatar: '💯', text: '三个结局都拿到了', time: '3小时前', likes: 71 },
  ],
  'feed-cube3d':       [
    { id: 'cb1', user: '3D爱好者', avatar: '🧊', text: '旋转效果好酷', time: '6分钟前', likes: 14 },
    { id: 'cb2', user: '程序员', avatar: '💻', text: 'Three.js用得好', time: '1小时前', likes: 29 },
  ],
  'feed-solar3d':      [
    { id: 'sl1', user: '天文迷', avatar: '🔭', text: '地球公转好真实', time: '4分钟前', likes: 38 },
    { id: 'sl2', user: '科学老师', avatar: '👨‍🏫', text: '拿来上课用了', time: '50分钟前', likes: 92 },
    { id: 'sl3', user: '小朋友', avatar: '🧒', text: '月亮绕着地球转！', time: '2小时前', likes: 45 },
  ],
  'feed-fps3d':        [
    { id: 'fp1', user: 'CS老兵', avatar: '🔫', text: 'WASD+鼠标射击太爽了', time: '1分钟前', likes: 78 },
    { id: 'fp2', user: '手残党', avatar: '🤕', text: '好难瞄准但好上瘾', time: '15分钟前', likes: 34 },
    { id: 'fp3', user: '硬核玩家', avatar: '💀', text: '希望加更多敌人和关卡', time: '1小时前', likes: 56 },
  ],
  'feed-whackmole':    [
    { id: 'wm1', user: '小红', avatar: '🧑‍🎨', text: '打了98分！', time: '3分钟前', likes: 24 },
    { id: 'wm2', user: '游戏达人', avatar: '🎮', text: '地鼠速度越来越快', time: '12分钟前', likes: 8 },
    { id: 'wm3', user: '妈妈', avatar: '👩', text: '孩子特别喜欢', time: '1小时前', likes: 45 },
  ],
  'feed-tetris':       [
    { id: 'tt1', user: '方块大师', avatar: '🟦', text: '消四行特别爽', time: '5分钟前', likes: 31 },
    { id: 'tt2', user: '怀旧玩家', avatar: '👴', text: '满满的回忆', time: '20分钟前', likes: 56 },
    { id: 'tt3', user: '小白兔', avatar: '🐰', text: '堆不好但停不下来', time: '45分钟前', likes: 12 },
  ],
  'feed-counting':     [
    { id: 'ct1', user: '幼师', avatar: '👩‍🏫', text: '班上孩子们抢着玩', time: '10分钟前', likes: 67 },
    { id: 'ct2', user: '宝妈', avatar: '🤱', text: '寓教于乐太赞了', time: '30分钟前', likes: 43 },
  ],
  'feed-tank':         [
    { id: 'tk1', user: '坦克迷', avatar: '🪖', text: '打爆敌人基地！', time: '7分钟前', likes: 35 },
    { id: 'tk2', user: '策略党', avatar: '🧠', text: '要守住自己基地才行', time: '25分钟前', likes: 48 },
    { id: 'tk3', user: '怀旧FC', avatar: '📺', text: '小霸王经典再现', time: '2小时前', likes: 89 },
  ],
  'feed-memory':       [
    { id: 'mm1', user: '记忆王', avatar: '🏆', text: '12次翻完全部', time: '4分钟前', likes: 22 },
    { id: 'mm2', user: '奶奶', avatar: '👵', text: '锻炼记忆力的好游戏', time: '1小时前', likes: 37 },
  ],
  'feed-angrybirds':   [
    { id: 'ab1', user: '弹弓手', avatar: '🏹', text: '一发全灭！', time: '2分钟前', likes: 55 },
    { id: 'ab2', user: '物理学家', avatar: '⚛️', text: '抛物线算得很准', time: '30分钟前', likes: 41 },
    { id: 'ab3', user: '怀旧党', avatar: '📱', text: '想起了10年前玩手机的日子', time: '3小时前', likes: 103 },
  ],
  'feed-maze':         [
    { id: 'mz1', user: '迷宫控', avatar: '🧭', text: '终于走出来了！', time: '6分钟前', likes: 19 },
    { id: 'mz2', user: '挑战者', avatar: '🏃‍♂️', text: '每次迷宫都不一样', time: '40分钟前', likes: 33 },
  ],
  'feed-balloon':      [
    { id: 'bn1', user: '气球控', avatar: '🎪', text: '颜色好好看', time: '5分钟前', likes: 16 },
    { id: 'bn2', user: '速度党', avatar: '⚡', text: '手速要快！', time: '20分钟前', likes: 27 },
  ],
  'feed-breakout':     [
    { id: 'bk1', user: '复古游戏迷', avatar: '👾', text: '经典永不过时', time: '8分钟前', likes: 42 },
    { id: 'bk2', user: '新玩家', avatar: '🌱', text: '球反弹角度好讲究', time: '45分钟前', likes: 18 },
  ],
  'feed-motorbike':    [
    { id: 'mb1', user: '飙车族', avatar: '🏎️', text: '跑了3000米！', time: '3分钟前', likes: 38 },
    { id: 'mb2', user: '手残', avatar: '😅', text: '第一个障碍就撞了', time: '15分钟前', likes: 64 },
  ],
  'feed-detective':    [
    { id: 'dt1', user: '推理迷', avatar: '🔎', text: '线索收集好烧脑', time: '10分钟前', likes: 47 },
    { id: 'dt2', user: '作家', avatar: '📝', text: '剧情反转太精彩了', time: '1小时前', likes: 73 },
    { id: 'dt3', user: '小侦探', avatar: '🕵️', text: '我猜对了凶手！', time: '3小时前', likes: 29 },
  ],
  'feed-musicbeat':    [
    { id: 'mu1', user: '鼓手', avatar: '🥁', text: '节拍好带感', time: '4分钟前', likes: 31 },
    { id: 'mu2', user: '音乐迷', avatar: '🎵', text: '希望加更多乐器', time: '30分钟前', likes: 22 },
  ],
  'feed-archery':      [
    { id: 'ar1', user: '神射手', avatar: '🎯', text: '全部爆头！', time: '2分钟前', likes: 44 },
    { id: 'ar2', user: '后羿', avatar: '🌞', text: '瞄准系统做得很好', time: '20分钟前', likes: 36 },
  ],
};

// 通用评论池 — 为没有专属评论的游戏随机组合
const GENERIC_POOL = [
  { user: '热心玩家', avatar: '⭐', text: '这个游戏做得真棒！', likes: 15 },
  { user: '小明', avatar: '🧒', text: '玩了好几遍停不下来', likes: 22 },
  { user: '创作者', avatar: '✨', text: '感谢大家的支持！', likes: 38 },
  { user: '新手玩家', avatar: '🌱', text: '操作简单容易上手', likes: 9 },
  { user: '收藏家', avatar: '💎', text: '已收藏，期待更新', likes: 12 },
  { user: '家长', avatar: '👨‍👧', text: '很适合孩子玩', likes: 34 },
  { user: '学生党', avatar: '🎒', text: '课间玩一局刚好', likes: 19 },
  { user: '设计爱好者', avatar: '🎨', text: '画面风格好喜欢', likes: 26 },
  { user: '深夜玩家', avatar: '🌙', text: '半夜偷偷玩到停不下来', likes: 41 },
  { user: '推荐官', avatar: '📢', text: '强烈推荐给朋友了', likes: 17 },
];
const TIME_POOL = ['刚刚', '3分钟前', '10分钟前', '28分钟前', '1小时前', '2小时前', '5小时前', '昨天'];

const getComments = (id) => {
  if (MOCK_COMMENTS[id]) return MOCK_COMMENTS[id];
  // 根据 id 的 hashCode 稳定选取 3-5 条通用评论
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  const count = 3 + Math.abs(hash) % 3;
  const picked = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.abs(hash + i * 7) % GENERIC_POOL.length;
    const tIdx = Math.abs(hash + i * 3) % TIME_POOL.length;
    const c = GENERIC_POOL[idx];
    picked.push({ id: `gc_${id}_${i}`, user: c.user, avatar: c.avatar, text: c.text, time: TIME_POOL[tIdx], likes: c.likes + Math.abs(hash + i) % 20 });
  }
  return picked;
};

const fmt = n => n >= 10000 ? (n / 10000).toFixed(1) + 'w' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

export default function FeedPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(new Set());
  const [saved, setSaved] = useState(new Set());
  const [dragY, setDragY] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState({});
  const [likedComments, setLikedComments] = useState(new Set());
  const touchRef = useRef({ startY: 0, valid: false, moving: false });

  /* ── 按分类筛选 + 洗牌 ── */
  const FEED_ITEMS = useMemo(() => {
    const base = activeTab === 'all' ? ALL_FEED_ITEMS : ALL_FEED_ITEMS.filter(g => g.category === activeTab);
    return shuffle(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const item = FEED_ITEMS[currentIndex] || FEED_ITEMS[0];

  // 获取当前游戏的评论（mock + 用户新增）
  const currentComments = item ? [...getComments(item.id), ...(localComments[item.id] || [])] : [];

  /* ── 初始化当前游戏 ── */
  useLayoutEffect(() => {
    if (!FEED_ITEMS.length) return;
    const idx = Math.min(currentIndex, FEED_ITEMS.length - 1);
    const currentItem = FEED_ITEMS[idx];
    if (!currentItem) return;
    const template = getTemplate(currentItem.templateType);
    if (template) {
      const virtualProject = {
        id: `feed_${currentItem.id}`,
        name: currentItem.title,
        templateType: currentItem.templateType,
        dimension: template.dimension || '2D',
        elements: [],
        code: '',
      };
      console.log('[FeedPage] 初始化游戏:', currentItem.title, 'tab:', activeTab);
      useEditorStore.getState().initEditor(virtualProject, template);
      useEditorStore.setState({ mode: 'preview' });
    }
    return () => { useEditorStore.getState().clearEditor(); };
  }, [currentIndex, activeTab, FEED_ITEMS]);

  /* ── 手势: touchStart ── */
  const handleTouchStart = useCallback((e) => {
    if (animating || commentOpen) return;
    if (e.target.tagName === 'CANVAS' || e.target.closest('#game-canvas-three') || e.target.closest('.pixi-canvas-wrapper')) { touchRef.current.valid = false; return; }
    touchRef.current.startY = e.touches[0].clientY;
    touchRef.current.valid = true;
    touchRef.current.moving = false;
  }, [animating, commentOpen]);

  /* ── 手势: touchMove ── */
  const handleTouchMove = useCallback((e) => {
    if (!touchRef.current.valid || animating || commentOpen) return;
    const dy = e.touches[0].clientY - touchRef.current.startY;
    const damped = dy > 0 ? Math.sqrt(dy) * 6 : -Math.sqrt(-dy) * 6;
    const atTop = currentIndex === 0 && dy > 0;
    const atBottom = currentIndex === FEED_ITEMS.length - 1 && dy < 0;
    setDragY((atTop || atBottom) ? damped * 0.3 : damped);
    touchRef.current.moving = true;
  }, [currentIndex, animating, commentOpen]);

  /* ── 手势: touchEnd ── */
  const handleTouchEnd = useCallback(() => {
    if (!touchRef.current.valid || animating || commentOpen) return;
    const threshold = 80;
    if (dragY < -threshold && currentIndex < FEED_ITEMS.length - 1) {
      setAnimating(true);
      setDragY(-window.innerHeight);
      setTimeout(() => { setCurrentIndex(p => p + 1); setDragY(0); setAnimating(false); }, 350);
    } else if (dragY > threshold && currentIndex > 0) {
      setAnimating(true);
      setDragY(window.innerHeight);
      setTimeout(() => { setCurrentIndex(p => p - 1); setDragY(0); setAnimating(false); }, 350);
    } else {
      setDragY(0);
    }
    touchRef.current.valid = false;
    touchRef.current.moving = false;
  }, [dragY, currentIndex, animating, commentOpen]);

  /* ── 发送评论 ── */
  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: `user_${Date.now()}`,
      user: '我',
      avatar: '😊',
      text: commentText.trim(),
      time: '刚刚',
      likes: 0,
    };
    setLocalComments(prev => ({
      ...prev,
      [item.id]: [...(prev[item.id] || []), newComment],
    }));
    setCommentText('');
  };

  const toggleLike = (id) => setLiked(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });
  const toggleSave = (id) => setSaved(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const cardStyle = {
    transform: `translateY(${dragY}px)`,
    transition: touchRef.current.moving ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  if (!item) return <div className={styles.feed}><div style={{color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>加载中...</div></div>;

  return (
    <div
      className={styles.feed}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 分类导航 */}
      <div className={styles.categoryBar}>
        {FEED_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`${styles.catTab} ${activeTab === cat.key ? styles.catTabActive : ''}`}
            onClick={() => { setActiveTab(cat.key); setCurrentIndex(0); }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 整个卡片 — 游戏+信息+操作 作为一体拖动 */}
      <div className={styles.card} style={cardStyle} key={`game-${activeTab}-${currentIndex}`}>
        {/* 游戏画布 */}
        <div className={styles.gameArea}>
          <GameCanvas mode="preview" />
        </div>

        {/* 底部: 用户信息 + 横向操作栏 */}
        <div className={styles.bottomBar}>
          <div className={styles.infoRow}>
            <span className={styles.authorAvatar}>{item.authorAvatar}</span>
            <span className={styles.authorName}>@{item.author}</span>
            <span className={styles.gameTitle}>{item.title}</span>
          </div>

          <div className={styles.actions}>
            <button className={`${styles.actionBtn} ${liked.has(item.id) ? styles.liked : ''}`} onClick={() => toggleLike(item.id)}>
              <Heart size={18} fill={liked.has(item.id) ? 'currentColor' : 'none'} />
              <span className={styles.actionCount}>{fmt(item.likes + (liked.has(item.id) ? 1 : 0))}</span>
            </button>
            <button className={styles.actionBtn} onClick={() => setCommentOpen(true)}>
              <MessageCircle size={18} />
              <span className={styles.actionCount}>{fmt(currentComments.length)}</span>
            </button>
            <button className={`${styles.actionBtn} ${saved.has(item.id) ? styles.saved : ''}`} onClick={() => toggleSave(item.id)}>
              <Bookmark size={18} fill={saved.has(item.id) ? 'currentColor' : 'none'} />
            </button>
            <button className={styles.actionBtn}>
              <Share2 size={18} />
              <span className={styles.actionCount}>{fmt(item.shares)}</span>
            </button>
            <button className={`${styles.actionBtn} ${styles.remix}`} onClick={() => navigate(`/m/ai-chat?prompt=${encodeURIComponent('Remix: ' + item.title)}`)}>
              <Repeat2 size={18} />
            </button>
          </div>
        </div>

        {/* 右侧进度指示 */}
        {FEED_ITEMS.length <= 15 && (
          <div className={styles.progress}>
            {FEED_ITEMS.map((_, i) => (
              <div key={i} className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`} />
            ))}
          </div>
        )}
      </div>

      {/* ═══ 评论抽屉 ═══ */}
      {commentOpen && <div className={styles.drawerBackdrop} onClick={() => setCommentOpen(false)} />}
      <div className={`${styles.drawer} ${commentOpen ? styles.drawerOpen : ''}`}>
        {/* 抽屉头部 */}
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>{currentComments.length} 条评论</span>
          <button className={styles.drawerClose} onClick={() => setCommentOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* 评论列表 */}
        <div className={styles.commentList}>
          {currentComments.map(c => (
            <div className={styles.commentItem} key={c.id}>
              <span className={styles.commentAvatar}>{c.avatar}</span>
              <div className={styles.commentBody}>
                <div className={styles.commentUser}>{c.user}</div>
                <div className={styles.commentText}>{c.text}</div>
                <div className={styles.commentMeta}>
                  <span>{c.time}</span>
                  <button
                    className={`${styles.commentLikeBtn} ${likedComments.has(c.id) ? styles.commentLiked : ''}`}
                    onClick={() => setLikedComments(prev => {
                      const next = new Set(prev);
                      next.has(c.id) ? next.delete(c.id) : next.add(c.id);
                      return next;
                    })}
                  >
                    <Heart size={12} fill={likedComments.has(c.id) ? 'currentColor' : 'none'} />
                    <span>{(c.likes || 0) + (likedComments.has(c.id) ? 1 : 0) || ''}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 评论输入 */}
        <div className={styles.commentInput}>
          <input
            type="text"
            placeholder="说点什么..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendComment()}
            className={styles.commentField}
          />
          <button
            className={`${styles.commentSend} ${commentText.trim() ? styles.commentSendActive : ''}`}
            onClick={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
