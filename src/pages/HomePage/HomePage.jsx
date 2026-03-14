import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Gamepad2, Rocket, Brain, MessageSquare, Box, Layers, Cpu, ArrowRight, Crosshair, Github, ExternalLink } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import ParticleField from '../../components/ParticleField/ParticleField';
import useProjectStore from '../../stores/projectStore';
import useI18nStore from '../../stores/i18nStore';
import { getAllTemplates, getTemplate } from '../../templates';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { projects, loadAllProjects, createProject, deleteProject } = useProjectStore();
  const { t, language } = useI18nStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState('2D');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [projectName, setProjectName] = useState('');

  useEffect(() => { loadAllProjects(); }, []);

  const templates = getAllTemplates();

  const handleCreate = () => {
    if (!selectedTemplate || !projectName.trim()) return;
    const template = getTemplate(selectedTemplate);
    const project = createProject(projectName.trim(), selectedTemplate, selectedDimension);
    useProjectStore.getState().updateProject(project.id, {
      elements: template.elements,
      scripts: template.scripts,
    });
    setShowModal(false);
    setProjectName('');
    setSelectedTemplate(null);
    navigate(`/editor/${project.id}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const confirmMsg = language === 'zh' ? '确定删除这个项目吗？' : 'Are you sure you want to delete this project?';
    if (window.confirm(confirmMsg)) deleteProject(id);
  };

  const renderTemplateIcon = (type, size = 24) => {
    switch(type) {
      case 'shooter': return <Rocket size={size} strokeWidth={1.5} />;
      case 'platformer': return <Gamepad2 size={size} strokeWidth={1.5} />;
      case 'quiz': return <Brain size={size} strokeWidth={1.5} />;
      case 'galgame': return <MessageSquare size={size} strokeWidth={1.5} />;
      case 'cube3d': return <Box size={size} strokeWidth={1.5} />;
      case 'solar3d': return <Rocket size={size} strokeWidth={1.5} />;
      case 'fps3d': return <Crosshair size={size} strokeWidth={1.5} />;
      default: return <Gamepad2 size={size} strokeWidth={1.5} />;
    }
  };

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const filteredTemplates = templates.filter(t => (t.dimension || '2D') === selectedDimension);

  const features = [
    { icon: <Layers size={20} strokeWidth={1.5} />, titleKey: 'feature2dTitle', descKey: 'feature2dDesc' },
    { icon: <Box size={20} strokeWidth={1.5} />, titleKey: 'feature3dTitle', descKey: 'feature3dDesc' },
    { icon: <Cpu size={20} strokeWidth={1.5} />, titleKey: 'featureAiTitle', descKey: 'featureAiDesc' },
  ];

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero */}
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
            <button className={`btn btn-primary btn-lg ${styles.heroCta}`} onClick={() => setShowModal(true)}>
              {t('home.createProject')} <ArrowRight size={16} strokeWidth={2} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.25, 1, 0.5, 1] }}
            className={styles.featureItem}
          >
            <div className={styles.featureIcon}>{f.icon}</div>
            <div>
              <h3 className={styles.featureTitle}>{t(`home.${f.titleKey}`)}</h3>
              <p className={styles.featureDesc}>{t(`home.${f.descKey}`)}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Projects */}
      <section className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('home.recentProjects')}</h2>
          <span className={styles.count}>{projects.length}</span>
        </div>

        {projects.length > 0 ? (
          <div className={styles.projectsGrid}>
            {projects.map((p, i) => (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 1, 0.5, 1] }}
                key={p.id}
                className={styles.projectCard}
                onClick={() => navigate(`/editor/${p.id}`)}
              >
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
                    <button className={styles.delBtn} onClick={(e) => handleDelete(e, p.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>{t('home.noProjects')}</p>
            <button className="btn btn-secondary" onClick={() => setShowModal(true)} style={{ marginTop: 12 }}>
              <Plus size={14} /> {t('home.createProject')}
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLinks}>
            <a href="https://zzh.app/" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              <ExternalLink size={14} />
              <span>{language === 'zh' ? '了解我们' : 'About Us'}</span>
            </a>
            <span className={styles.footerDot}>·</span>
            <a href="https://github.com/ZetaZeroHub" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              <Github size={14} />
              <span>GitHub</span>
            </a>
            <span className={styles.footerDot}>·</span>
            <a href="https://github.com/ZetaZeroHub/ZetaStudio" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              <Github size={14} />
              <span>{language === 'zh' ? '开源仓库' : 'Source Code'}</span>
            </a>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} ZetaZeroHub · Apache 2.0 License</p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className={styles.modal}
            onClick={e => e.stopPropagation()}
          >
            <h2 className={styles.modalTitle}>{t('home.chooseDimension')}</h2>

            <div className={styles.dimToggle}>
              <button className={`${styles.dimBtn} ${selectedDimension === '2D' ? styles.dimActive : ''}`}
                onClick={() => { setSelectedDimension('2D'); setSelectedTemplate(null); }}>
                {t('home.dimension2D')}
              </button>
              <button className={`${styles.dimBtn} ${selectedDimension === '3D' ? styles.dimActive : ''}`}
                onClick={() => { setSelectedDimension('3D'); setSelectedTemplate(null); }}>
                {t('home.dimension3D')}
              </button>
            </div>

            <h3 className={styles.modalSub}>{t('home.chooseTemplate')}</h3>

            <div className={styles.tplGrid}>
              {filteredTemplates.length > 0 ? filteredTemplates.map(tpl => (
                <div key={tpl.templateType}
                  className={`${styles.tplCard} ${selectedTemplate === tpl.templateType ? styles.tplActive : ''}`}
                  onClick={() => setSelectedTemplate(tpl.templateType)}>
                  <div className={styles.tplIcon}>{renderTemplateIcon(tpl.templateType, 24)}</div>
                  <div className={styles.tplName}>{language === 'zh' ? tpl.name : tpl.templateType}</div>
                  <div className={styles.tplDesc}>{language === 'zh' ? tpl.description : tpl.templateType + ' template'}</div>
                </div>
              )) : (
                <div className={styles.tplEmpty}>No templates for {selectedDimension}.</div>
              )}
            </div>

            <input type="text" className={`input ${styles.nameInput}`}
              placeholder={t('home.projectName')} value={projectName}
              onChange={e => setProjectName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus />

            <div className={styles.modalFooter}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>{t('home.cancel')}</button>
              <button className="btn btn-primary" onClick={handleCreate}
                disabled={!selectedTemplate || !projectName.trim()}>
                {t('home.continue')} <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
