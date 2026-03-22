import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Gamepad2, Rocket, Brain, MessageSquare, Box, Crosshair, ArrowRight, Sparkles, Bot, X, Loader2, CheckSquare, Square, ArrowUpDown, Filter, Swords, Map, Layers, Cpu } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import ParticleField from '../../components/ParticleField/ParticleField';
import ModeSelectorOverlay from '../../components/ModeSelectorOverlay/ModeSelectorOverlay';
import KidsHomePage from '../../pages/KidsHomePage/KidsHomePage';
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
];

/* ── 朋友们的游戏 ── */
const FRIENDS_GAME_PICKS = [
  { type: 'whackMole', poster: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png' },
  { type: 'memoryCard', poster: '/assets/custom/朋友们的游戏-游戏封面-记忆翻牌.png' },
  { type: 'fruitCatch', poster: '/assets/custom/朋友们的游戏-游戏封面-接水果.png' },
  { type: 'counting', poster: '/assets/custom/朋友们的游戏-游戏封面-数数乐.png' },
  { type: 'colorBook', poster: '/assets/custom/朋友们的游戏-游戏封面-涂色本.png' },
  { type: 'balloonPop', poster: '/assets/custom/朋友们的游戏-游戏封面-气球射击.png' },
  { type: 'tetris', poster: '/assets/custom/朋友们的游戏-游戏封面-俄罗斯方块.png' },
  { type: 'breakout', poster: '/assets/custom/朋友们的游戏-游戏封面-打砖块.png' },
  { type: 'animalQuiz', poster: '/assets/custom/朋友们的游戏-游戏封面-动物认知.png' },
  { type: 'wordPicture', poster: '/assets/posters/wordpicture_poster.png' },
  { type: 'maze', poster: '/assets/custom/朋友们的游戏-游戏封面-迷宫冒险.png' },
  { type: 'tankBattle', poster: '/assets/custom/朋友们的游戏-游戏封面-坦克大战.png' },
];

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
    let list = [...projects.filter(p => p.published), ...mazeDrafts];
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
    ...templates.filter(t => t.templateType !== 'cube3d').map(t => ({
      ...t,
      editorCategory: (t.dimension === '3D') ? '3d' : '2d',
    })),
    // 游戏梦想家 special entries
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
  const friendsGames = useMemo(() => {
    return FRIENDS_GAME_PICKS.map((pick) => {
      const tpl = kidsTemplates.find(t => t.templateType === pick.type);
      if (!tpl) return null;
      return { ...tpl, poster: pick.poster };
    }).filter(Boolean);
  }, [kidsTemplates]);

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

  if (appMode === null) return <ModeSelectorOverlay onSelect={setAppMode} />;
  if (appMode === 'simple') return <KidsHomePage onSwitchToPro={() => setAppMode('pro')} />;
  if (appMode === 'maze') setAppMode('pro');

  return (
    <div className={styles.page}>
      <Navbar>
        <button className={styles.modeSwitchBtn} onClick={() => setAppMode('simple')} title="切换到简易模式">
          <Sparkles size={14} /> 简易模式
        </button>
      </Navbar>

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

      {/* ── Featured Section ── */}
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
              className={`${styles.tabBtn} ${activeTab === 'friends' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              {language === 'zh' ? '朋友们的游戏' : "Community Games"}
            </button>
          </div>
        </div>

        {activeTab === 'featured' && (
          <div className={styles.scrollContainer}>
            <div className={styles.featuredGrid}>
              {FEATURED_GAMES.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] }}
                  className={styles.featuredCard}
                  onClick={() => handleFeaturedPlay(game)}
                >
                  <div className={styles.featuredPoster}>
                    <SkeletonImg src={game.poster} alt={game.title} className={styles.featuredImg} />
                    <div className={styles.featuredOverlay}>
                      <span className={styles.featuredTag}>{game.tag}</span>
                    </div>
                  </div>
                  <div className={styles.featuredBody}>
                    <h3 className={styles.featuredGameTitle}>{language === 'zh' ? game.title : game.titleEn}</h3>
                    <p className={styles.featuredDesc}>{language === 'zh' ? game.desc : game.descEn}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className={styles.scrollContainer}>
            <div className={styles.friendsGrid}>
              {friendsGames.map((game, i) => (
                <motion.div
                  key={game.templateType}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className={styles.friendsCard}
                  onClick={() => handleFriendsPlay(game)}
                >
                  <div className={styles.friendsPoster}>
                    <SkeletonImg src={game.poster} alt={game.name} className={styles.friendsImg} />
                  </div>
                  <div className={styles.friendsBody}>
                    <h4 className={styles.friendsName}>{game.name}</h4>
                    <p className={styles.friendsDesc}>{game.description}</p>
                    <span className={styles.friendsAuthor}>
                      {language === 'zh' ? '匿名创作者' : 'Anonymous'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Projects ── */}
      <section className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.recentProjects')}</h2>
          <span className={styles.count}>{filteredProjects.length}</span>
        </div>

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
              {/* Sort */}
              <div className={styles.toolSelect}>
                <ArrowUpDown size={12} />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">{language === 'zh' ? '最近创建' : 'Newest'}</option>
                  <option value="oldest">{language === 'zh' ? '最早创建' : 'Oldest'}</option>
                  <option value="name">{language === 'zh' ? '按名称' : 'By Name'}</option>
                </select>
              </div>

              {/* Dimension filter */}
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
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
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
              </motion.div>
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
      </section>

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
                <h2 className={styles.drawerTitle}>{t('home.createProject')}</h2>
                <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              <div className={styles.drawerContent}>
                {/* AI Input */}
                <div className={styles.aiSection}>
                  <div className={styles.aiLabel}>
                    <Bot size={20} strokeWidth={1.8} />
                    <span>{language === 'zh' ? '你想创建什么？' : 'What do you want to create?'}</span>
                  </div>
                  <textarea
                    className={styles.aiInput}
                    placeholder={placeholder}
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    rows={3}
                  />
                  <button
                    className={`btn btn-primary ${styles.aiGenBtn}`}
                    onClick={handleAiGenerate}
                    disabled={!aiInput.trim() || generating}
                  >
                    <Sparkles size={16} />
                    {language === 'zh' ? 'AI 生成' : 'AI Generate'}
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className={styles.drawerDivider}>
                  <span>{language === 'zh' ? '或' : 'or'}</span>
                </div>

                {/* Template section — same level as AI */}
                <div className={styles.aiSection}>
                  <div className={styles.aiLabel}>
                    <Gamepad2 size={20} strokeWidth={1.8} />
                    <span>{language === 'zh' ? '选择模板' : 'Choose a game template'}</span>
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
