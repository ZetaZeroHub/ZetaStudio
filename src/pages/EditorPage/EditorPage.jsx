import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Play, Save, CheckCircle2, Rocket, Code2, ChevronUp, ChevronDown, Gamepad2, LayoutPanelLeft, Layers, Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import GameCanvas from '../../components/GameCanvas/GameCanvas';
import ElementPanel from '../../components/ElementPanel/ElementPanel';
import PropertyEditor from '../../components/PropertyEditor/PropertyEditor';
import AiPanel from '../../components/AiPanel/AiPanel';
import useProjectStore from '../../stores/projectStore';
import useEditorStore from '../../stores/editorStore';
import useI18nStore from '../../stores/i18nStore';
import { getTemplate } from '../../templates';
import ScriptEditor from '../../components/ScriptEditor/ScriptEditor';
import styles from './EditorPage.module.css';

const MOBILE_TABS = [
  { key: 'canvas', icon: Gamepad2 },
  { key: 'elements', icon: Layers },
  { key: 'code', icon: Code2 },
  { key: 'ai', icon: Sparkles },
];

export default function EditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { loadAllProjects, getProject, updateProject } = useProjectStore();
  const {
    currentProject, mode,
    initEditor, setMode,
  } = useEditorStore();
  const { t } = useI18nStore();

  const [codeCollapsed, setCodeCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  // Mobile: which panel is active
  const [mobileTab, setMobileTab] = useState('canvas');
  // Tablet: left panel drawer open
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);

  useEffect(() => {
    loadAllProjects();
  }, []);

  useEffect(() => {
    const project = getProject(projectId);
    if (project) {
      const template = getTemplate(project.templateType);
      initEditor(project, template);
    }

    return () => {
      useEditorStore.getState().clearEditor();
    };
  }, [projectId]);

  const handleSave = useCallback(() => {
    if (!currentProject) return;
    setSaving(true);
    const data = useEditorStore.getState().getProjectData();
    updateProject(currentProject.id, data);
    setTimeout(() => setSaving(false), 800);
  }, [currentProject, updateProject]);

  const handlePublish = useCallback(() => {
    handleSave();
    navigate(`/play/${currentProject.id}`);
  }, [handleSave, currentProject, navigate]);

  if (!currentProject) {
    return (
      <div className={styles.editorPage}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
          {t('editor.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editorPage}>
      {/* Top Toolbar */}
      <Navbar>
        <span className={styles.projectTitle}>
          <LayoutPanelLeft size={16} className={styles.projectIcon} strokeWidth={2} />
          <span className={styles.projectName}>{currentProject.name}</span>
        </span>

        <div className={styles.segmentedControl}>
          <button
            className={`${styles.segmentBtn} ${mode === 'edit' ? styles.segmentBtnActive : ''}`}
            onClick={() => setMode('edit')}
          >
            <Pencil size={14} strokeWidth={2} />
            <span className={styles.segmentLabel}>{t('editor.edit')}</span>
          </button>
          <button
            className={`${styles.segmentBtn} ${mode === 'preview' ? styles.segmentBtnActive : ''}`}
            onClick={() => setMode('preview')}
          >
            <Play size={14} strokeWidth={2.5} />
            <span className={styles.segmentLabel}>{t('editor.preview')}</span>
          </button>
        </div>

        <div className={styles.actionGroup}>
          {/* Tablet: left panel toggle */}
          <button className={`btn btn-ghost btn-sm ${styles.tabletDrawerToggle}`} onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}>
            {leftDrawerOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleSave}>
            {saving ? <CheckCircle2 size={16} className={styles.iconSuccess} /> : <Save size={16} />}
            <span className={styles.actionLabel}>{saving ? t('editor.saved') : t('editor.save')}</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePublish}>
            <Rocket size={16} />
            <span className={styles.actionLabel}>{t('editor.publish')}</span>
          </button>
        </div>
      </Navbar>

      {/* Editor Body */}
      <div className={styles.editorBody}>
        {/* Left Panel - Element Tree + Properties */}
        {/* Tablet: overlay drawer controlled by leftDrawerOpen */}
        {leftDrawerOpen && <div className={styles.drawerBackdrop} onClick={() => setLeftDrawerOpen(false)} />}
        <div className={`${styles.leftPanel} ${leftDrawerOpen ? styles.leftPanelOpen : ''}`}>
          <div className={styles.elementPanelArea}>
            <ElementPanel />
          </div>
          <div className={styles.propertyArea}>
            <PropertyEditor />
          </div>
        </div>

        {/* Center Panel - Canvas + Code */}
        <div className={`${styles.centerPanel} ${mobileTab !== 'canvas' && mobileTab !== 'code' ? styles.mobileHidden : ''}`}>
          <div className={`${styles.canvasArea} ${mobileTab === 'code' ? styles.mobileHidden : ''}`}>
            <GameCanvas mode={mode} />
          </div>

          <div className={`${styles.codeArea} ${codeCollapsed && mobileTab !== 'code' ? styles.codeAreaCollapsed : ''} ${mobileTab === 'code' ? styles.codeAreaFull : ''}`}>
            <div className={`${styles.codeAreaHeader} ${mobileTab === 'code' ? styles.mobileHidden : ''}`}>
              <div className={styles.headerTitle}>
                <Code2 size={16} /> {t('editor.scriptsLabel')}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setCodeCollapsed(!codeCollapsed)}>
                {codeCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            <div className={styles.codeAreaBody}>
              <ScriptEditor />
            </div>
          </div>
        </div>

        {/* Mobile: Elements panel */}
        <div className={`${styles.mobilePanel} ${mobileTab === 'elements' ? styles.mobilePanelActive : ''}`}>
          <div className={styles.elementPanelArea}>
            <ElementPanel />
          </div>
          <div className={styles.propertyArea}>
            <PropertyEditor />
          </div>
        </div>

        {/* Mobile: AI panel */}
        <div className={`${styles.mobilePanel} ${mobileTab === 'ai' ? styles.mobilePanelActive : ''}`}>
          <AiPanel />
        </div>

        {/* Right Panel - AI Assistant (desktop/tablet) */}
        <div className={styles.rightPanel}>
          <AiPanel />
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className={styles.bottomTabBar}>
        {MOBILE_TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            className={`${styles.bottomTab} ${mobileTab === key ? styles.bottomTabActive : ''}`}
            onClick={() => setMobileTab(key)}
          >
            <Icon size={20} />
            <span className={styles.bottomTabLabel}>{t(`editor.mobileTab.${key}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
