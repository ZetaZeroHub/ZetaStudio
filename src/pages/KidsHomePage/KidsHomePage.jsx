import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Settings, Sparkles, ArrowRight } from 'lucide-react';
import useProjectStore from '../../stores/projectStore';
import useAppStore from '../../stores/appStore';
import { getKidsTemplates, getTemplate } from '../../templates';
import styles from './KidsHomePage.module.css';

const TEMPLATE_EMOJIS = {
  shapeMatch: '🧩', memoryCard: '🃏', counting: '🔢', wordPicture: '🅰️',
  colorBook: '🎨', animalQuiz: '🐾', whackMole: '🐹', fruitCatch: '🧺',
};

const CATEGORY_LABELS = {
  cognitive: '🧠 认知类', math: '🔢 数学启蒙', language: '🅰️ 语言识字',
  creative: '🎨 创意艺术', science: '🌍 常识科学', reaction: '⚡ 反应逻辑',
};

/* Placeholder community games */
const COMMUNITY_GAMES = [
  { id: 'c1', name: '小猫钓鱼', emoji: '🐱', color: '#FF6B6B' },
  { id: 'c2', name: '数字冒险', emoji: '🔢', color: '#4ECDC4' },
  { id: 'c3', name: '恐龙涂色', emoji: '🦕', color: '#45B7D1' },
  { id: 'c4', name: '水果消消乐', emoji: '🍎', color: '#96CEB4' },
  { id: 'c5', name: '字母跳跳', emoji: '🅰️', color: '#FFEAA7' },
  { id: 'c6', name: '太空探索', emoji: '🚀', color: '#A29BFE' },
];

export default function KidsHomePage({ onSwitchToPro }) {
  const navigate = useNavigate();
  const { projects, loadAllProjects, createProject, deleteProject } = useProjectStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [projectName, setProjectName] = useState('');

  useEffect(() => { loadAllProjects(); }, []);

  const kidsTemplates = getKidsTemplates();

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

      {/* Community Games */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🌍 朋友们的游戏</h2>
        <div className={styles.communityScroll}>
          {COMMUNITY_GAMES.map(g => (
            <motion.div
              key={g.id}
              className={styles.communityCard}
              style={{ background: g.color }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={styles.communityEmoji}>{g.emoji}</div>
              <div className={styles.communityName}>{g.name}</div>
            </motion.div>
          ))}
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
        <h2 className={styles.sectionTitle}>📝 我的草稿</h2>
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

            <div className={styles.tplGrid}>
              {kidsTemplates.map(tpl => (
                <motion.div
                  key={tpl.templateType}
                  className={`${styles.tplCard} ${selectedTemplate === tpl.templateType ? styles.tplCardActive : ''}`}
                  onClick={() => { setSelectedTemplate(tpl.templateType); setProjectName(tpl.name); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={styles.tplEmoji}>
                    {TEMPLATE_EMOJIS[tpl.templateType] || '🎮'}
                  </div>
                  <div className={styles.tplName}>{tpl.name}</div>
                  <div className={styles.tplCategory}>
                    {CATEGORY_LABELS[tpl.category] || tpl.category}
                  </div>
                </motion.div>
              ))}
            </div>

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
          </motion.div>
        </div>
      )}
    </div>
  );
}
