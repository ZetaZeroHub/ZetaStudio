import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Gamepad2, Rocket, Brain, MessageSquare, Box, Crosshair, ArrowRight, Sparkles, Bot, X, Loader2, CheckSquare, Square, ArrowUpDown, Filter, Swords, Map, Layers, Cpu, Wallet, Coins, TrendingUp, Eye, Heart, MessageCircle, Link2, Palette, GraduationCap, Trophy, BookOpen, User, Star } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import ParticleField from '../../components/ParticleField/ParticleField';
import useProjectStore from '../../stores/projectStore';
import useAppStore from '../../stores/appStore';
import useI18nStore from '../../stores/i18nStore';
import { getAllTemplates, getTemplate, getKidsTemplates } from '../../templates';
import styles from './HomePage.module.css';

/* ── Skeleton Image: 图片加载前显示骨架动画 ── */
function SkeletonImg({ src, alt, className, style }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={styles.skeletonWrap} style={style}>
      {!loaded && <div className={styles.skeletonPulse} />}
      <img
        src={src}
        alt={alt || ''}
        className={className}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

/* ── 精品游戏 ── */
const FEATURED_GAMES = [
  {
    id: 'featured-maze',
    title: '横版闯关',
    titleEn: 'Side-Scroll Adventure',
    desc: '打败怪物、收集宝物、挑战 Boss，成为小英雄',
    descEn: 'Defeat enemies, collect treasures, challenge bosses',
    poster: '/assets/custom/精选游戏-游戏封面-横版闯关.png',
    templateType: 'mazeAdventure',
    dimension: '2D',
    tag: '2D',
    route: '/play-maze/platformer/medium-1',
  },
  {
    id: 'featured-duck',
    title: '小鸭子找水池',
    titleEn: 'Duck Finds Pond',
    desc: '用手指帮小鸭子画出一条路，走到水池去游泳',
    descEn: 'Draw a path for the little duck to reach the pond',
    poster: '/assets/custom/精选游戏-游戏封面-小鸭子找水池.jpg',
    templateType: 'duckPond',
    dimension: '2D',
    tag: '2D',
    route: '/play-maze/topdown/maze-1',
  },
  {
    id: 'featured-tank',
    title: '坦克大战',
    titleEn: 'Tank Battle',
    desc: '驾驶坦克击破敌方阵地，保卫基地',
    descEn: 'Drive your tank, destroy enemies and protect the base',
    poster: '/assets/custom/朋友们的游戏-游戏封面-坦克大战.png',
    templateType: 'tankBattle',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-balloon',
    title: '气球射击',
    titleEn: 'Balloon Pop',
    desc: '瞄准天空中飘过的气球，比拼你的反应速度',
    descEn: 'Pop the balloons floating across the sky',
    poster: '/assets/custom/朋友们的游戏-游戏封面-气球射击.png',
    templateType: 'balloonPop',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-tetris',
    title: '俄罗斯方块',
    titleEn: 'Tetris',
    desc: '经典俄罗斯方块，消除整行方块拿高分',
    descEn: 'Classic Tetris — clear rows and chase the high score',
    poster: '/assets/custom/朋友们的游戏-游戏封面-俄罗斯方块.png',
    templateType: 'tetris',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-breakout',
    title: '打砖块',
    titleEn: 'Breakout',
    desc: '用弹球击碎所有砖块，考验你的操控精度',
    descEn: 'Smash all the bricks with a bouncing ball',
    poster: '/assets/custom/朋友们的游戏-游戏封面-打砖块.png',
    templateType: 'breakout',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-memory',
    title: '记忆翻牌',
    titleEn: 'Memory Card',
    desc: '翻开卡片配对相同图案，训练你的记忆力',
    descEn: 'Flip cards and match pairs to train your memory',
    poster: '/assets/custom/朋友们的游戏-游戏封面-记忆翻牌.png',
    templateType: 'memoryCard',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-whackmole',
    title: '打地鼠',
    titleEn: 'Whack-a-Mole',
    desc: '地鼠冒头就打，手速越快分数越高',
    descEn: 'Whack the moles as they pop up — speed is key',
    poster: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png',
    templateType: 'whackMole',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-fruitcatch',
    title: '接水果',
    titleEn: 'Fruit Catch',
    desc: '用篮子接住掉落的水果，别让它们落地',
    descEn: 'Catch the falling fruits with your basket',
    poster: '/assets/custom/朋友们的游戏-游戏封面-接水果.png',
    templateType: 'fruitCatch',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-counting',
    title: '数数乐',
    titleEn: 'Counting Fun',
    desc: '和可爱动物一起学数数，寓教于乐',
    descEn: 'Learn counting with cute animals',
    poster: '/assets/custom/朋友们的游戏-游戏封面-数数乐.png',
    templateType: 'counting',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-colorbook',
    title: '涂色本',
    titleEn: 'Color Book',
    desc: '发挥想象力，给各种图案涂上喜欢的颜色',
    descEn: 'Color beautiful patterns with your imagination',
    poster: '/assets/custom/朋友们的游戏-游戏封面-涂色本.png',
    templateType: 'colorBook',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-animalquiz',
    title: '动物认知',
    titleEn: 'Animal Quiz',
    desc: '认识各种动物，看看你能答对多少',
    descEn: 'Identify animals and test your knowledge',
    poster: '/assets/custom/朋友们的游戏-游戏封面-动物认知.png',
    templateType: 'animalQuiz',
    dimension: '2D',
    tag: '2D',
  },
  {
    id: 'featured-maze',
    title: '迷宫冒险',
    titleEn: 'Maze Adventure',
    desc: '在迷宫中寻找出口，挑战你的方向感',
    descEn: 'Find your way out of the maze',
    poster: '/assets/custom/朋友们的游戏-游戏封面-迷宫冒险.png',
    templateType: 'maze',
    dimension: '2D',
    tag: '2D',
  },
];

/* ── 朋友们的游戏 (已合并入精选) ──
const FRIENDS_GAME_PICKS = [
  { type: 'whackMole', poster: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png' },
  { type: 'fruitCatch', poster: '/assets/custom/朋友们的游戏-游戏封面-接水果.png' },
  { type: 'counting', poster: '/assets/custom/朋友们的游戏-游戏封面-数数乐.png' },
  { type: 'colorBook', poster: '/assets/custom/朋友们的游戏-游戏封面-涂色本.png' },
  { type: 'animalQuiz', poster: '/assets/custom/朋友们的游戏-游戏封面-动物认知.png' },
  { type: 'wordPicture', poster: '/assets/posters/wordpicture_poster.png' },
  { type: 'maze', poster: '/assets/custom/朋友们的游戏-游戏封面-迷宫冒险.png' },
];
*/

/* ── 模板海报映射 ── */
const TEMPLATE_POSTERS = {
  shooter: '/assets/custom/游戏模板-游戏封面-太空射击.png',
  platformer: '/assets/custom/游戏模板-游戏封面-平台跳跃.png',
  quiz: '/assets/custom/游戏模板-游戏封面-知识竞赛.png',
  galgame: '/assets/custom/游戏模板-游戏封面-NPC剧情对话.png',
  solar3d: '/assets/custom/游戏模板-游戏封面-3D太阳系.png',
  fps3d: '/assets/custom/游戏模板-游戏封面-3D第一人称射击.png',
  mazeAdventure: '/assets/custom/游戏模板-游戏封面-横版闯关（地图编辑器）.png',
  duckPond: '/assets/custom/精选游戏-游戏封面-小鸭子找水池.jpg',
  topdown: '/assets/custom/精选游戏-游戏封面-小鸭子找水池.jpg',
};

/* ── AI placeholder ── */
const AI_PLACEHOLDERS_ZH = [
  '开发一个像素跳跃小游戏',
  '开发一个生动感人的剧情对话游戏',
  '开发一个带有问题和四个答案的知识竞赛小游戏',
  '开发一个第一人称射击小游戏',
  '开发一个太空飞船射击游戏',
  '开发一个有敌人和Boss的横版动作游戏',
];
const AI_PLACEHOLDERS_EN = [
  'Build a pixel adventure platformer',
  'Build a visual novel with emotional story',
  'Build a quiz game with 4 answer choices',
  'Build a first-person shooter game',
  'Build a space shooter game',
  'Build a side-scrolling action game with bosses',
];

const GEN_STEPS = [
  { zh: '正在生成游戏逻辑...', en: 'Generating game logic...' },
  { zh: '导入素材资源中...', en: 'Importing assets...' },
  { zh: '导入脚本资源...', en: 'Loading scripts...' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { projects, loadAllProjects, createProject, deleteProject } = useProjectStore();
  const { t, language } = useI18nStore();
  const { appMode, setAppMode } = useAppStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [activeTab, setActiveTab] = useState('featured');
  const [tplCategory, setTplCategory] = useState('all'); // all | adventure | 2d | 3d
  // Project management
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | name
  const [filterDim, setFilterDim] = useState('all'); // all | 2D | 3D
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => { loadAllProjects(); }, []);

  // Sorted & filtered projects
  const filteredProjects = useMemo(() => {
    // Merge maze drafts from game_drafts_v1 as virtual project entries
    let mazeDrafts = [];
    try {
      const raw = JSON.parse(localStorage.getItem('game_drafts_v1') || '[]');
      mazeDrafts = raw.filter(d => d.templateType === 'topdown' && d.published).map(d => ({
        id: d.id,
        name: d.name || 'AI迷宫',
        templateType: 'topdown',
        dimension: '2D',
        published: true,
        createdAt: d.publishedAt || d.updatedAt || Date.now(),
        updatedAt: d.updatedAt || Date.now(),
        _isMazeDraft: true,
      }));
    } catch (e) { /* ignore */ }
    let list = [...projects, ...mazeDrafts];
    if (filterDim !== 'all') {
      list = list.filter(p => (p.dimension || '2D') === filterDim);
    }
    switch (sortBy) {
      case 'oldest': list.sort((a, b) => a.createdAt - b.createdAt); break;
      case 'name': list.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
      case 'newest': default: list.sort((a, b) => b.createdAt - a.createdAt); break;
    }
    return list;
  }, [projects, sortBy, filterDim]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    const msg = language === 'zh'
      ? `确定删除选中的 ${selectedIds.size} 个项目吗？`
      : `Delete ${selectedIds.size} selected projects?`;
    if (window.confirm(msg)) {
      selectedIds.forEach(id => deleteProject(id));
      setSelectedIds(new Set());
      setSelectMode(false);
    }
  };

  const templates = getAllTemplates();
  const drawerTemplates = [
    {
      templateType: 'mazeAdventure',
      name: '横版闯关',
      description: '带有敌人、Boss、商人系统的横版平台冒险（地图编辑器）',
      dimension: '2D',
      editorCategory: 'adventure',
      route: '/maze/editor/platformer/medium-2?from=pro',
    },
    {
      templateType: 'topdown',
      name: 'AI迷宫创作',
      description: 'AI辅助创作俯视角迷宫游戏，画路线、选风格、一键生成',
      dimension: '2D',
      editorCategory: 'adventure',
      route: '/maze/ai-maze?from=pro',
    },
    ...templates.filter(t => t.templateType !== 'cube3d').map(t => ({
      ...t,
      editorCategory: (t.dimension === '3D') ? '3d' : '2d',
    })),
  ];

  const TPL_CATEGORIES = [
    { key: 'all', zh: '全部', en: 'All' },
    { key: 'adventure', zh: '儿童益智', en: 'Kids' },
    { key: '2d', zh: '2D 游戏', en: '2D Games' },
    { key: '3d', zh: '3D 游戏', en: '3D Games' },
  ];

  const filteredDrawerTemplates = tplCategory === 'all'
    ? drawerTemplates
    : drawerTemplates.filter(t => t.editorCategory === tplCategory);

  const kidsTemplates = getKidsTemplates();
  /* friendsGames — commented out, all merged into FEATURED_GAMES
  const friendsGames = useMemo(() => {
    return FRIENDS_GAME_PICKS.map((pick) => {
      const tpl = kidsTemplates.find(t => t.templateType === pick.type);
      if (!tpl) return null;
      return { ...tpl, poster: pick.poster };
    }).filter(Boolean);
  }, [kidsTemplates]);
  */

  const placeholder = useMemo(() => {
    const list = language === 'zh' ? AI_PLACEHOLDERS_ZH : AI_PLACEHOLDERS_EN;
    return list[Math.floor(Math.random() * list.length)];
  }, [language, drawerOpen]);

  const renderTemplateIcon = (type, size = 24) => {
    switch(type) {
      case 'shooter': return <Rocket size={size} strokeWidth={1.5} />;
      case 'platformer': return <Gamepad2 size={size} strokeWidth={1.5} />;
      case 'quiz': return <Brain size={size} strokeWidth={1.5} />;
      case 'galgame': return <MessageSquare size={size} strokeWidth={1.5} />;
      case 'cube3d': return <Box size={size} strokeWidth={1.5} />;
      case 'solar3d': return <Rocket size={size} strokeWidth={1.5} />;
      case 'fps3d': return <Crosshair size={size} strokeWidth={1.5} />;
      case 'mazeAdventure': return <Swords size={size} strokeWidth={1.5} />;
      case 'duckPond': return <Map size={size} strokeWidth={1.5} />;
      case 'topdown': return <Map size={size} strokeWidth={1.5} />;
      default: return <Gamepad2 size={size} strokeWidth={1.5} />;
    }
  };

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const handleTemplateCreate = (tpl) => {
    // Special route for maze/topdown games
    if (tpl.route) {
      setDrawerOpen(false);
      navigate(tpl.route);
      return;
    }
    const name = language === 'zh' ? tpl.name : tpl.templateType;
    const dim = tpl.dimension || '2D';
    const project = createProject(name, tpl.templateType, dim);
    const template = getTemplate(tpl.templateType);
    useProjectStore.getState().updateProject(project.id, {
      elements: template.elements,
      scripts: template.scripts,
    });
    setDrawerOpen(false);
    navigate(`/editor/${project.id}`);
  };

  const handleFeaturedPlay = (game) => {
    // Special route for maze/topdown games
    if (game.route) {
      navigate(game.route);
      return;
    }
    const name = language === 'zh' ? game.title : game.titleEn;
    const project = createProject(name, game.templateType, game.dimension);
    const template = getTemplate(game.templateType);
    useProjectStore.getState().updateProject(project.id, {
      elements: template.elements,
      scripts: template.scripts,
    });
    navigate(`/play/${project.id}`);
  };

  const handleFriendsPlay = (tpl) => {
    const name = language === 'zh' ? tpl.name : tpl.templateType;
    const project = createProject(name, tpl.templateType, '2D');
    const template = getTemplate(tpl.templateType);
    useProjectStore.getState().updateProject(project.id, {
      elements: template.elements,
      scripts: template.scripts,
    });
    navigate(`/play/${project.id}`);
  };

  const handleAiGenerate = async () => {
    if (!aiInput.trim()) return;
    setGenerating(true);
    setGenStep(0);
    for (let i = 0; i < GEN_STEPS.length; i++) {
      setGenStep(i);
      await new Promise(r => setTimeout(r, 1200));
    }
    const project = createProject(aiInput.trim().slice(0, 20), 'platformer', '2D');
    const template = getTemplate('platformer');
    useProjectStore.getState().updateProject(project.id, {
      elements: template.elements,
      scripts: template.scripts,
    });
    setGenerating(false);
    setDrawerOpen(false);
    setAiInput('');
    navigate(`/editor/${project.id}`);
  };

  const deleteMazeDraft = (id) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('game_drafts_v1') || '[]');
      const updated = drafts.filter(d => d.id !== id);
      localStorage.setItem('game_drafts_v1', JSON.stringify(updated));
    } catch (e) { /* ignore */ }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const confirmMsg = language === 'zh' ? '确定删除这个项目吗？' : 'Are you sure you want to delete this project?';
    if (window.confirm(confirmMsg)) {
      // Check if this is a maze draft
      const proj = filteredProjects.find(p => p.id === id);
      if (proj && (proj._isMazeDraft || id.startsWith('ai_maze_'))) {
        deleteMazeDraft(id);
      } else {
        deleteProject(id);
      }
    }
  };

  // Always use pro mode — no mode selector
  if (appMode === null || appMode === 'simple' || appMode === 'maze') {
    setAppMode('pro');
  }

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <ParticleField className={styles.particleCanvas} />
        <div className={styles.heroInner}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            className={styles.heroContent}
          >
            <p className={styles.heroLabel}>{t('home.heroTagline')}</p>
            <h1 className={styles.heroTitle}>{t('home.heroTitle')}</h1>
            <p className={styles.heroSub}>{t('home.heroSub')}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className={styles.capabilities}>
        <div className={styles.capItem} style={{ '--cap-accent': '#e8a020' }}>
          <span className={styles.capNum}>01</span>
          <div>
            <h3 className={styles.capTitle}>{t('home.feature2dTitle')}</h3>
            <p className={styles.capDesc}>{t('home.feature2dDesc')}</p>
          </div>
        </div>
        <div className={styles.capItem} style={{ '--cap-accent': '#5b7ee5' }}>
          <span className={styles.capNum}>02</span>
          <div>
            <h3 className={styles.capTitle}>{t('home.feature3dTitle')}</h3>
            <p className={styles.capDesc}>{t('home.feature3dDesc')}</p>
          </div>
        </div>
        <div className={styles.capItem} style={{ '--cap-accent': '#46a758' }}>
          <span className={styles.capNum}>03</span>
          <div>
            <h3 className={styles.capTitle}>{t('home.featureAiTitle')}</h3>
            <p className={styles.capDesc}>{t('home.featureAiDesc')}</p>
          </div>
        </div>
      </section>

      {/* ── Prominent CTA ── */}
      <section className={styles.heroAction}>
        <button className={styles.ctaBtn} onClick={() => setDrawerOpen(true)}>
          <Sparkles size={18} />
          <span>{t('home.createProject')}</span>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Featured + My Works Section (Tabbed) ── */}
      <section className={styles.featuredSection}>
        <div className={styles.featuredHeader}>
          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'featured' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('featured')}
            >
              {language === 'zh' ? '精选游戏' : 'Featured'}
            </button>
            <span className={styles.tabDivider}>/</span>
            <button
              className={`${styles.tabBtn} ${activeTab === 'myworks' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('myworks')}
            >
              {language === 'zh' ? '我的作品' : 'My Works'}
              {projects.length > 0 && <span className={styles.tabCount}>{projects.length}</span>}
            </button>
          </div>
        </div>

        {/* ── Featured Games: Hero + Grid ── */}
        {activeTab === 'featured' && (
          <div className={styles.featuredPane}>
            {/* Hero row — top 2 flagship games */}
            <div className={styles.featuredHeroRow}>
              {FEATURED_GAMES.slice(0, 2).map((game) => (
                <div
                  key={game.id}
                  className={styles.featuredCardHero}
                  onClick={() => handleFeaturedPlay(game)}
                >
                  <div className={styles.featuredPosterHero}>
                    <SkeletonImg src={game.poster} alt={game.title} className={styles.featuredImg} />
                    <div className={styles.featuredOverlayHero}>
                      <span className={styles.featuredTag}>{game.tag}</span>
                      <div className={styles.heroTextBlock}>
                        <h3 className={styles.heroGameTitle}>{language === 'zh' ? game.title : game.titleEn}</h3>
                        <p className={styles.heroGameDesc}>{language === 'zh' ? game.desc : game.descEn}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compact grid — remaining games */}
            <div className={styles.featuredCompactGrid}>
              {FEATURED_GAMES.slice(2).map((game) => (
                <div
                  key={game.id}
                  className={styles.featuredCardCompact}
                  onClick={() => handleFeaturedPlay(game)}
                >
                  <div className={styles.compactPoster}>
                    <SkeletonImg src={game.poster} alt={game.title} className={styles.featuredImg} />
                  </div>
                  <div className={styles.compactBody}>
                    <h4 className={styles.compactTitle}>{language === 'zh' ? game.title : game.titleEn}</h4>
                    <p className={styles.compactDesc}>{language === 'zh' ? game.desc : game.descEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── My Works Tab ── */}
        {activeTab === 'myworks' && (
          <div className={styles.myWorksPane}>
            {/* Toolbar */}
            {projects.length > 0 && (
              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  <button
                    className={`${styles.toolBtn} ${selectMode ? styles.toolBtnActive : ''}`}
                    onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
                  >
                    <CheckSquare size={14} />
                    {language === 'zh' ? '选择' : 'Select'}
                  </button>

                  {selectMode && (
                    <>
                      <button className={styles.toolBtn} onClick={toggleSelectAll}>
                        {selectedIds.size === filteredProjects.length
                          ? (language === 'zh' ? '取消全选' : 'Deselect All')
                          : (language === 'zh' ? '全选' : 'Select All')}
                      </button>
                      {selectedIds.size > 0 && (
                        <button className={`${styles.toolBtn} ${styles.toolBtnDanger}`} onClick={handleBatchDelete}>
                          <Trash2 size={13} />
                          {language === 'zh' ? `删除 (${selectedIds.size})` : `Delete (${selectedIds.size})`}
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.toolbarRight}>
                  <div className={styles.toolSelect}>
                    <ArrowUpDown size={12} />
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                      <option value="newest">{language === 'zh' ? '最近创建' : 'Newest'}</option>
                      <option value="oldest">{language === 'zh' ? '最早创建' : 'Oldest'}</option>
                      <option value="name">{language === 'zh' ? '按名称' : 'By Name'}</option>
                    </select>
                  </div>
                  <div className={styles.toolSelect}>
                    <Filter size={12} />
                    <select value={filterDim} onChange={e => setFilterDim(e.target.value)}>
                      <option value="all">{language === 'zh' ? '全部' : 'All'}</option>
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {filteredProjects.length > 0 ? (
              <div className={styles.projectsGrid}>
                {filteredProjects.map((p, i) => (
                  <div
                    key={p.id}
                    className={`${styles.projectCard} ${selectedIds.has(p.id) ? styles.projectCardSelected : ''}`}
                    onClick={() => {
                      if (selectMode) { toggleSelect(p.id); return; }
                      if (p.templateType === 'mazeAdventure') {
                        if (p.gameDraftId) {
                          navigate(`/maze/editor/draft/${p.gameDraftId}?from=pro`);
                        } else {
                          navigate(`/maze/editor/platformer/${p.baseLevelId || 'medium-1'}?from=pro`);
                        }
                      } else if (p.templateType === 'topdown' || p._isMazeDraft) {
                        navigate(`/maze/ai-maze?draftId=${p.id}&from=pro`);
                      } else {
                        navigate(`/editor/${p.id}`);
                      }
                    }}
                  >
                    {selectMode && (
                      <div className={styles.checkboxArea}>
                        {selectedIds.has(p.id)
                          ? <CheckSquare size={16} className={styles.checked} />
                          : <Square size={16} className={styles.unchecked} />
                        }
                      </div>
                    )}
                    <div className={styles.projectThumb}>
                      {renderTemplateIcon(p.templateType, 36)}
                    </div>
                    <div className={styles.projectBody}>
                      <div className={styles.projectName}>
                        {p.name}
                        <span className={styles.dimBadge}>{p.dimension || '2D'}</span>
                      </div>
                      <div className={styles.projectMeta}>
                        <span>{formatDate(p.updatedAt)}</span>
                        {!selectMode && (
                          <button className={styles.delBtn} onClick={(e) => handleDelete(e, p.id)}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p>{projects.length > 0
                  ? (language === 'zh' ? '没有匹配的项目' : 'No matching projects')
                  : t('home.noProjects')
                }</p>
                {projects.length === 0 && (
                  <button className="btn btn-secondary" onClick={() => setDrawerOpen(true)} style={{ marginTop: 12 }}>
                    <Plus size={14} /> {t('home.createProject')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Community Hub (Steam-style) — 暂时隐藏 ── */}
      {false && (
      <section className={styles.communitySection}>
        <div className={styles.communityHeader}>
          <h2 className={styles.communityTitle}>
            <MessageSquare size={16} strokeWidth={2} />
            {language === 'zh' ? '社区中心' : 'Community Hub'}
          </h2>
          <span className={styles.communityOnline}>
            <span className={styles.onlineDot} />
            {language === 'zh' ? '1,247 人在线' : '1,247 online'}
          </span>
        </div>

        <div className={styles.communityLayout}>
          {/* ── Left Sidebar ── */}
          <aside className={styles.communitySidebar}>
            <nav className={styles.sidebarNav}>
              <span className={styles.sidebarLabel}>{language === 'zh' ? '分类浏览' : 'Categories'}</span>
              {[
                { key: 'all', label: '全部讨论', labelEn: 'All Discussions', count: 342, icon: <MessageSquare size={14} /> },
                { key: 'share', label: '作品分享', labelEn: 'Showcase', count: 86, icon: <Palette size={14} /> },
                { key: 'guide', label: '攻略教程', labelEn: 'Guides', count: 54, icon: <BookOpen size={14} /> },
                { key: 'review', label: '游戏测评', labelEn: 'Reviews', count: 28, icon: <Gamepad2 size={14} /> },
                { key: 'suggest', label: '功能建议', labelEn: 'Suggestions', count: 67, icon: <Sparkles size={14} /> },
                { key: 'official', label: '官方公告', labelEn: 'Announcements', count: 12, icon: <Trophy size={14} /> },
              ].map(cat => (
                <button key={cat.key} className={`${styles.sidebarItem} ${cat.key === 'all' ? styles.sidebarItemActive : ''}`}>
                  {cat.icon}
                  <span>{language === 'zh' ? cat.label : cat.labelEn}</span>
                  <span className={styles.sidebarCount}>{cat.count}</span>
                </button>
              ))}
            </nav>

            <div className={styles.sidebarBlock}>
              <span className={styles.sidebarLabel}>{language === 'zh' ? '热门标签' : 'Trending'}</span>
              <div className={styles.tagCloud}>
                {['迷宫创作', '赛车主题', 'Boss设计', '像素画', 'AI生成', '亲子游戏', '关卡编辑', '新手求助'].map(tag => (
                  <span key={tag} className={styles.trendTag}># {tag}</span>
                ))}
              </div>
            </div>

            <div className={styles.sidebarBlock}>
              <span className={styles.sidebarLabel}>{language === 'zh' ? '本周数据' : 'This Week'}</span>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}><span className={styles.statVal}>342</span><span className={styles.statKey}>{language === 'zh' ? '新帖' : 'Posts'}</span></div>
                <div className={styles.statItem}><span className={styles.statVal}>1.2k</span><span className={styles.statKey}>{language === 'zh' ? '回复' : 'Replies'}</span></div>
                <div className={styles.statItem}><span className={styles.statVal}>89</span><span className={styles.statKey}>{language === 'zh' ? '新作品' : 'Works'}</span></div>
                <div className={styles.statItem}><span className={styles.statVal}>3.4k</span><span className={styles.statKey}>{language === 'zh' ? '点赞' : 'Likes'}</span></div>
              </div>
            </div>
          </aside>

          {/* ── Main Feed ── */}
          <div className={styles.communityFeed}>
            {[
              {
                id: 'c1', author: '小明同学', icon: <Palette size={15} />, iconColor: '#c89b3c', time: '2小时前',
                content: '分享一下我做的恐龙迷宫！用了AI生成的沙漠地图风格，配上赛车角色，感觉非常酷',
                likes: 42, comments: 8, tag: '作品分享', pinned: false,
                replies: [
                  { author: '果果', content: '好酷！赛车怎么设置转弯的？', time: '1小时前' },
                  { author: '小杰', content: '沙漠主题太帅了～', time: '45分钟前' },
                ],
              },
              {
                id: 'c3', author: '创客少年团', icon: <Trophy size={15} />, iconColor: '#c89b3c', time: '1天前',
                content: '本周最佳作品投票开始啦！参赛作品已更新到精选区，大家快来投票支持你最喜欢的创作者吧',
                likes: 256, comments: 67, tag: '官方活动', pinned: true,
                replies: [
                  { author: '皮皮', content: '投了3号作品！太空迷宫做得惊艳', time: '20小时前' },
                  { author: '小花', content: '已投票！支持花园主题的～', time: '18小时前' },
                  { author: '大白', content: '恐龙迷宫必须第一名！', time: '12小时前' },
                ],
              },
              {
                id: 'c2', author: '乐乐老师', icon: <GraduationCap size={15} />, iconColor: '#67c1f5', time: '5小时前',
                content: '给各位家长推荐，用"小鸭子找水池"这个模板可以锻炼孩子的空间规划能力，3-5岁孩子玩得特别开心',
                likes: 128, comments: 23, tag: '教育分享', pinned: false,
                replies: [
                  { author: '宝妈Amy', content: '太实用了，谢谢老师！我家5岁小朋友反复玩了好多次', time: '4小时前' },
                ],
              },
              {
                id: 'c4', author: '技术小达人', icon: <BookOpen size={15} />, iconColor: '#67c1f5', time: '2天前',
                content: '教程：如何让AI生成的迷宫更复杂——在描述中加入"森林"、"冰雪"等关键词，AI会自动匹配对应的风格瓷砖哦',
                likes: 89, comments: 15, tag: '攻略教程', pinned: false,
                replies: [
                  { author: '新手小白', content: '原来描述词这么重要！感谢分享', time: '1天前' },
                ],
              },
              {
                id: 'c5', author: '游戏测评员', icon: <Gamepad2 size={15} />, iconColor: '#a4d007', time: '3天前',
                content: '玩了十几个社区作品，发现横版闯关的Boss设计越来越有创意了！特别是那个会分裂的史莱姆Boss，太惊喜了',
                likes: 64, comments: 11, tag: '游戏测评', pinned: false,
                replies: [],
              },
              {
                id: 'c6', author: '美术小能手', icon: <Sparkles size={15} />, iconColor: '#a4d007', time: '4天前',
                content: '建议新增像素画编辑器！让大家能自己画游戏角色，这样每个人的迷宫都会更独特',
                likes: 203, comments: 34, tag: '功能建议', pinned: false,
                replies: [
                  { author: '官方团队', content: '好建议！已经在规划中了，敬请期待～', time: '3天前' },
                ],
              },
            ].map(post => (
              <div key={post.id} className={`${styles.postRow} ${post.pinned ? styles.postPinned : ''}`}>
                {/* Avatar */}
                <div className={styles.postAvatar} style={{color: post.iconColor}}>{post.icon}</div>

                {/* Body */}
                <div className={styles.postBody}>
                  <div className={styles.postMeta}>
                    <span className={styles.postAuthor}>{post.author}</span>
                    <span className={styles.postTagBadge} data-tag={post.tag}>{post.tag}</span>
                    {post.pinned && <span className={styles.postPin}>{language === 'zh' ? '置顶' : 'Pinned'}</span>}
                    <span className={styles.postTime}>{post.time}</span>
                  </div>
                  <p className={styles.postText}>{post.content}</p>

                  {/* Replies */}
                  {post.replies.length > 0 && (
                    <div className={styles.postReplies}>
                      {post.replies.slice(0, 2).map((r, ri) => (
                        <div key={ri} className={styles.postReplyRow}>
                          <User size={11} strokeWidth={2.5} className={styles.postReplyIcon} />
                          <span className={styles.postReplyAuthor}>{r.author}</span>
                          <span className={styles.postReplyText}>{r.content}</span>
                          <span className={styles.postReplyTime}>{r.time}</span>
                        </div>
                      ))}
                      {post.replies.length > 2 && (
                        <button className={styles.postReplyMore}>
                          {language === 'zh' ? `查看全部 ${post.replies.length} 条回复` : `View all ${post.replies.length} replies`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className={styles.postActions}>
                    <button className={styles.postActionBtn}><Heart size={12} /> {post.likes}</button>
                    <button className={styles.postActionBtn}><MessageCircle size={12} /> {post.comments}</button>
                    <button className={styles.postActionBtn}><Link2 size={12} /> {language === 'zh' ? '分享' : 'Share'}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── Fullscreen Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className={styles.drawerBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className={styles.drawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className={styles.drawerHeader}>
                <h2 className={styles.drawerTitle}>{language === 'zh' ? '创作工作台' : 'Creator Workbench'}</h2>
                <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              <div className={styles.drawerContent}>
                {/* ── Section 1: AI Smart Assistant ── */}
                <div className={styles.wbSection}>
                  <div className={styles.wbSectionHeader}>
                    <div className={styles.wbSectionIcon}><Cpu size={16} /></div>
                    <div>
                      <h3 className={styles.wbSectionTitle}>{language === 'zh' ? 'AI 智能助手' : 'AI Smart Assistant'}</h3>
                      <p className={styles.wbSectionSub}>{language === 'zh' ? '核心生产力入口 · 描述你的游戏创意' : 'Core productivity — describe your game idea'}</p>
                    </div>
                  </div>
                  <div className={styles.aiInputWrap}>
                    <textarea
                      className={styles.aiInput}
                      placeholder={placeholder}
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <button
                    className={`btn btn-primary ${styles.aiGenBtn}`}
                    onClick={handleAiGenerate}
                    disabled={!aiInput.trim() || generating}
                  >
                    <Sparkles size={16} />
                    {language === 'zh' ? 'AI 生成游戏' : 'AI Generate Game'}
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* ── Section 2: Wallet & Income ── */}
                <div className={styles.walletSection}>
                  <div className={styles.wbSectionHeader}>
                    <div className={`${styles.wbSectionIcon} ${styles.wbIconGold}`}><Wallet size={16} /></div>
                    <div>
                      <h3 className={styles.wbSectionTitle}>{language === 'zh' ? '创作者钱包' : 'Creator Wallet'}</h3>
                      <p className={styles.wbSectionSub}>{language === 'zh' ? '创作即价值 · 社区化运营激励' : 'Create value · Community incentives'}</p>
                    </div>
                  </div>
                  <div className={styles.walletGrid}>
                    <div className={styles.walletCard}>
                      <div className={styles.walletCardIcon}><Coins size={18} /></div>
                      <div className={styles.walletCardInfo}>
                        <span className={styles.walletCardLabel}>{language === 'zh' ? '虚拟余额' : 'Balance'}</span>
                        <span className={styles.walletCardValue}>0.00</span>
                      </div>
                    </div>
                    <div className={styles.walletCard}>
                      <div className={`${styles.walletCardIcon} ${styles.walletIconGreen}`}><TrendingUp size={18} /></div>
                      <div className={styles.walletCardInfo}>
                        <span className={styles.walletCardLabel}>{language === 'zh' ? '累计收益' : 'Earnings'}</span>
                        <span className={styles.walletCardValue}>0.00</span>
                      </div>
                    </div>
                    <div className={styles.walletCard}>
                      <div className={`${styles.walletCardIcon} ${styles.walletIconBlue}`}><Eye size={18} /></div>
                      <div className={styles.walletCardInfo}>
                        <span className={styles.walletCardLabel}>{language === 'zh' ? '作品播放量' : 'Views'}</span>
                        <span className={styles.walletCardValue}>0</span>
                      </div>
                    </div>
                    <div className={styles.walletCard}>
                      <div className={`${styles.walletCardIcon} ${styles.walletIconPurple}`}><Gamepad2 size={18} /></div>
                      <div className={styles.walletCardInfo}>
                        <span className={styles.walletCardLabel}>{language === 'zh' ? '已发布作品' : 'Published'}</span>
                        <span className={styles.walletCardValue}>{filteredProjects.length}</span>
                      </div>
                    </div>
                  </div>
                  <p className={styles.walletHint}>
                    {language === 'zh'
                      ? '💡 优质作品将获得社区推荐与虚拟收益——创作即价值'
                      : '💡 Quality works earn community recommendations & virtual rewards'}
                  </p>
                </div>

                {/* ── Section 3: Game Templates ── */}
                <div className={styles.wbSection}>
                  <div className={styles.wbSectionHeader}>
                    <div className={`${styles.wbSectionIcon} ${styles.wbIconTeal}`}><Layers size={16} /></div>
                    <div>
                      <h3 className={styles.wbSectionTitle}>{language === 'zh' ? '海量益智游戏模板' : 'Game Templates'}</h3>
                      <p className={styles.wbSectionSub}>{language === 'zh' ? '在成熟框架上发起二次创作' : 'Build upon proven frameworks'}</p>
                    </div>
                  </div>
                </div>

                {/* Template cards with posters */}
                <div className={styles.drawerTplGrid}>
                  {drawerTemplates.map(tpl => (
                    <div
                      key={tpl.templateType}
                      className={styles.drawerTplCard}
                      onClick={() => handleTemplateCreate(tpl)}
                    >
                      <div className={styles.drawerTplPoster}>
                        {TEMPLATE_POSTERS[tpl.templateType] ? (
                          <SkeletonImg src={TEMPLATE_POSTERS[tpl.templateType]} alt="" className={styles.drawerTplImg} />
                        ) : (
                          <div className={styles.drawerTplIconFallback}>{renderTemplateIcon(tpl.templateType, 32)}</div>
                        )}
                      </div>
                      <div className={styles.drawerTplInfo}>
                        <div className={styles.drawerTplName}>
                          {language === 'zh' ? tpl.name : tpl.templateType}
                          <span className={styles.drawerTplDim}>{tpl.dimension || '2D'}</span>
                        </div>
                        <div className={styles.drawerTplDesc}>
                          {language === 'zh' ? tpl.description : `${tpl.templateType} template`}
                        </div>
                      </div>
                      <ArrowRight size={16} className={styles.drawerTplArrow} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Generation Progress */}
      <AnimatePresence>
        {generating && (
          <motion.div className={styles.genOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.genCard} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Loader2 size={28} className={styles.genSpinner} />
              <p className={styles.genText}>
                {language === 'zh' ? GEN_STEPS[genStep].zh : GEN_STEPS[genStep].en}
              </p>
              <div className={styles.genProgress}>
                {GEN_STEPS.map((_, i) => (
                  <div key={i} className={`${styles.genDot} ${i <= genStep ? styles.genDotActive : ''}`} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
