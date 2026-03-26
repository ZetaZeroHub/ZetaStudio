import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Settings, ArrowRight, Copy, Play, Flame } from 'lucide-react';
import useProjectStore from '../../stores/projectStore';
import useAppStore from '../../stores/appStore';
import { getKidsTemplates, getTemplate } from '../../templates';
import styles from './KidsHomePage.module.css';

/* Popularity ranking — lower rank = more popular, shown first */
const POPULARITY_ORDER = [
  'tetris', 'breakout', 'platformJump', 'archeryBattle', 'motorbike',   // Top 5 ⭐
  'detective', 'whackMole', 'memoryCard', 'fruitCatch', 'balloonPop',   // Top 10
  'maze', 'musicBeat', 'mathBubble', 'colorBook', 'drawLine',
  'shapeMatch', 'counting', 'spotDiff', 'shadowMatch', 'colorSort',
  'numberSort', 'letterPuzzle', 'wordSpell', 'dotConnect', 'animalQuiz',
  'foodSort', 'weatherDress', 'trashSort', 'shapeCount', 'wordPicture',
];
const TOP_COUNT = 5; // top N get highlighted

const TEMPLATE_EMOJIS = {
  shapeMatch: '🧩', memoryCard: '🃏', counting: '🔢', wordPicture: '🅰️',
  colorBook: '🎨', animalQuiz: '🐾', whackMole: '🐹', fruitCatch: '🧺',
  colorSort: '🎯', spotDiff: '🔍', shadowMatch: '👤',
  mathBubble: '🫧', numberSort: '🔢', shapeCount: '📐',
  letterPuzzle: '🔤', wordSpell: '📝', detective: '🕵️',
  dotConnect: '✏️', musicBeat: '🥁', drawLine: '🖌️',
  foodSort: '🥗', weatherDress: '🌤️', trashSort: '♻️',
  maze: '🏰', balloonPop: '🎈', tetris: '🧱', breakout: '🧱',
  motorbike: '🏍️', platformJump: '🦘', archeryBattle: '🏹',
};

/* Colors for community game cards by template type */
const TEMPLATE_COLORS = {
  shapeMatch: '#FF6B6B', memoryCard: '#4ECDC4', counting: '#45B7D1', wordPicture: '#FFEAA7',
  colorBook: '#DDA0DD', animalQuiz: '#96CEB4', whackMole: '#FFB347', fruitCatch: '#A29BFE',
  colorSort: '#FF7043', spotDiff: '#5C6BC0', shadowMatch: '#EC407A',
  mathBubble: '#26C6DA', numberSort: '#AB47BC', shapeCount: '#FFA726',
  letterPuzzle: '#66BB6A', wordSpell: '#FFB300', detective: '#455A64',
  dotConnect: '#FFD54F', musicBeat: '#7E57C2', drawLine: '#78909C',
  foodSort: '#8BC34A', weatherDress: '#42A5F5', trashSort: '#26A69A',
  maze: '#8D6E63', balloonPop: '#EF5350', tetris: '#1A237E', breakout: '#424242',
  motorbike: '#E53935', platformJump: '#1565C0', archeryBattle: '#2E7D32',
};

/* "Author" names for community feel */
const FAKE_AUTHORS = [
  '小明', '花花', '大壮', '甜甜', '乐乐', '小鱼', '圆圆', '星星',
  '猫猫', '皮皮', '果果', '小雨', '阳阳', '豆豆', '糖糖', '小宝',
  '贝贝', '冰冰', '飞飞', '露露', '点点', '妮妮', '瓜瓜', '蛋蛋',
  '奇奇', '多多', '可可', '小草', '月月', '晨晨',
];

const CATEGORY_LABELS = {
  cognitive: '🧠 认知类', math: '🔢 数学启蒙', language: '🅰️ 语言识字',
  creative: '🎨 创意艺术', science: '🌍 常识科学', reaction: '⚡ 反应逻辑',
};

export default function KidsHomePage({ onSwitchToPro }) {
  const navigate = useNavigate();
  const { projects, loadAllProjects, createProject, deleteProject } = useProjectStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [projectName, setProjectName] = useState('');
  /* Fork dialog state */
  const [forkTarget, setForkTarget] = useState(null);
  const [forkName, setForkName] = useState('');

  useEffect(() => { loadAllProjects(); }, []);

  const kidsTemplates = getKidsTemplates();

  /* Build community games from real templates, sorted by popularity */
  const communityGames = kidsTemplates
    .map((tpl, i) => ({
      templateType: tpl.templateType,
      name: tpl.name,
      emoji: TEMPLATE_EMOJIS[tpl.templateType] || '🎮',
      color: TEMPLATE_COLORS[tpl.templateType] || '#58CC02',
      author: FAKE_AUTHORS[i % FAKE_AUTHORS.length],
      category: tpl.category,
    }))
    .sort((a, b) => {
      const ra = POPULARITY_ORDER.indexOf(a.templateType);
      const rb = POPULARITY_ORDER.indexOf(b.templateType);
      return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb);
    });

  /* Sort templates in modal by same ranking */
  const sortedTemplates = [...kidsTemplates].sort((a, b) => {
    const ra = POPULARITY_ORDER.indexOf(a.templateType);
    const rb = POPULARITY_ORDER.indexOf(b.templateType);
    return (ra === -1 ? 999 : ra) - (rb === -1 ? 999 : rb);
  });

  const handleCreate = () => {
    if (!selectedTemplate) return;
    const tpl = getTemplate(selectedTemplate);
    const name = projectName.trim() || tpl.name;
    const project = createProject(name, selectedTemplate, '2D');
    useProjectStore.getState().updateProject(project.id, {
      elements: tpl.elements,
      scripts: tpl.scripts,
    });
    setShowTemplates(false);
    setProjectName('');
    setSelectedTemplate(null);
    navigate(`/kids/editor/${project.id}`);
  };

  /* Fork a community game → copy as user's own draft */
  const handleFork = () => {
    if (!forkTarget) return;
    const tpl = getTemplate(forkTarget.templateType);
    if (!tpl) return;
    const name = forkName.trim() || `${forkTarget.name} (我的版本)`;
    const project = createProject(name, forkTarget.templateType, '2D');
    useProjectStore.getState().updateProject(project.id, {
      elements: tpl.elements,
      scripts: tpl.scripts,
    });
    setForkTarget(null);
    setForkName('');
    navigate(`/kids/editor/${project.id}`);
  };

  /* Open fork dialog for a community game */
  const handleCommunityClick = (game) => {
    setForkTarget(game);
    setForkName(`${game.name} (我的版本)`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('确定删除吗？')) deleteProject(id);
  };

  // Filter for kids-mode projects only (kids templates)
  const kidsProjects = projects.filter(p =>
    Object.keys(TEMPLATE_EMOJIS).includes(p.templateType)
  );

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🦉</span>
          <span className={styles.logoText}>Zeta Kids</span>
        </div>
        <button className={styles.proBtn} onClick={onSwitchToPro}>
          <Settings size={14} /> 专业模式
        </button>
      </header>

      {/* Community Games — grid layout, sorted by popularity */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🌍 朋友们的游戏</h2>
        <div className={styles.communityGrid}>
          {communityGames.map((g, i) => {
            const isHot = POPULARITY_ORDER.indexOf(g.templateType) < TOP_COUNT;
            return (
              <motion.div
                key={g.templateType}
                className={`${styles.communityCard} ${isHot ? styles.communityCardHot : ''}`}
                style={{ background: g.color }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCommunityClick(g)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {isHot && <div className={styles.hotBadge}>🔥</div>}
                <div className={styles.communityEmoji}>{g.emoji}</div>
                <div className={styles.communityName}>{g.name}</div>
                <div className={styles.communityAuthor}>by {g.author}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Create Game CTA */}
      <section className={styles.ctaSection}>
        <motion.button
          className={styles.createBtn}
          onClick={() => setShowTemplates(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={24} strokeWidth={3} />
          <span>✨ 创作游戏</span>
        </motion.button>
      </section>

      {/* My Drafts */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📝 我的作品</h2>
        {kidsProjects.length > 0 ? (
          <div className={styles.draftsGrid}>
            {kidsProjects.map((p, i) => (
              <motion.div
                key={p.id}
                className={styles.draftCard}
                onClick={() => navigate(`/kids/editor/${p.id}`)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className={styles.draftEmoji}>
                  {TEMPLATE_EMOJIS[p.templateType] || '🎮'}
                </div>
                <div className={styles.draftName}>{p.name}</div>
                <button className={styles.draftDel} onClick={e => handleDelete(e, p.id)}>
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyDrafts}>
            <p>还没有作品，快来创作吧！</p>
          </div>
        )}
      </section>

      {/* Fork Dialog — when user clicks a community game */}
      <AnimatePresence>
        {forkTarget && (
          <div className={styles.overlay} onClick={() => setForkTarget(null)}>
            <motion.div
              className={styles.forkModal}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.forkHeader} style={{ background: forkTarget.color }}>
                <span className={styles.forkEmoji}>{forkTarget.emoji}</span>
                <h3 className={styles.forkTitle}>{forkTarget.name}</h3>
                <p className={styles.forkAuthor}>by {forkTarget.author}</p>
              </div>
              <div className={styles.forkBody}>
                <p className={styles.forkDesc}>
                  🎉 想玩这个游戏吗？复制一份到你的草稿，还可以自由修改！
                </p>
                <input
                  type="text"
                  className={styles.nameInput}
                  placeholder="给你的版本起个名字 ✏️"
                  value={forkName}
                  onChange={e => setForkName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFork()}
                  autoFocus
                />
                <div className={styles.forkActions}>
                  <button className={styles.cancelBtn} onClick={() => setForkTarget(null)}>
                    取消
                  </button>
                  <button className={styles.forkBtn} onClick={handleFork}>
                    <Copy size={16} /> 复制并编辑
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className={styles.overlay} onClick={() => setShowTemplates(false)}>
          <motion.div
            className={styles.modal}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className={styles.modalTitle}>🎮 选择游戏类型</h2>

            <div className={styles.tplScrollArea}>
              <div className={styles.tplGrid}>
                {sortedTemplates.map((tpl, i) => {
                  const isHot = POPULARITY_ORDER.indexOf(tpl.templateType) < TOP_COUNT;
                  return (
                    <motion.div
                      key={tpl.templateType}
                      className={`${styles.tplCard} ${selectedTemplate === tpl.templateType ? styles.tplCardActive : ''} ${isHot ? styles.tplCardHot : ''}`}
                      onClick={() => { setSelectedTemplate(tpl.templateType); setProjectName(tpl.name); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isHot && <div className={styles.hotBadge}>🔥</div>}
                      <div className={styles.tplEmoji}>
                        {TEMPLATE_EMOJIS[tpl.templateType] || '🎮'}
                      </div>
                      <div className={styles.tplName}>{tpl.name}</div>
                      <div className={styles.tplCategory}>
                        {CATEGORY_LABELS[tpl.category] || tpl.category}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className={styles.modalBottom}>
              <input
                type="text"
                className={styles.nameInput}
                placeholder="给游戏起个名字吧 ✏️"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowTemplates(false)}>取消</button>
                <button
                  className={styles.startBtn}
                  onClick={handleCreate}
                  disabled={!selectedTemplate}
                >
                  开始创作 <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
