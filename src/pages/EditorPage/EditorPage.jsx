import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Play, Save, CheckCircle2, Rocket, Code2, ChevronUp, ChevronDown, Gamepad2, LayoutPanelLeft } from 'lucide-react';
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

  const handleSave = () => {
    if (!currentProject) return;
    setSaving(true);
    const data = useEditorStore.getState().getProjectData();
    updateProject(currentProject.id, data);
    setTimeout(() => setSaving(false), 800);
  };

  const handlePublish = () => {
    handleSave();
    navigate(`/play/${currentProject.id}`);
  };

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
          {currentProject.name}
        </span>

        <div className={styles.segmentedControl}>
          <button
            className={`${styles.segmentBtn} ${mode === 'edit' ? styles.segmentBtnActive : ''}`}
            onClick={() => setMode('edit')}
          >
            <Pencil size={14} strokeWidth={2} /> {t('editor.edit')}
          </button>
          <button
            className={`${styles.segmentBtn} ${mode === 'preview' ? styles.segmentBtnActive : ''}`}
            onClick={() => setMode('preview')}
          >
            <Play size={14} strokeWidth={2.5} /> {t('editor.preview')}
          </button>
        </div>

        <div className={styles.actionGroup}>
          <button className="btn btn-secondary btn-sm" onClick={handleSave}>
            {saving ? <CheckCircle2 size={16} className={styles.iconSuccess} /> : <Save size={16} />}
            {saving ? t('editor.saved') : t('editor.save')}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePublish}>
            <Rocket size={16} /> {t('editor.publish')}
          </button>
        </div>
      </Navbar>

      {/* Editor Body */}
      <div className={styles.editorBody}>
        {/* Left Panel - Element Tree + Properties */}
        <div className={styles.leftPanel}>
          <div className={styles.elementPanelArea}>
            <ElementPanel />
          </div>
          <div className={styles.propertyArea}>
            <PropertyEditor />
          </div>
        </div>

        {/* Center Panel - Canvas + Code */}
        <div className={styles.centerPanel}>
          <div className={styles.canvasArea}>
            <GameCanvas mode={mode} />
          </div>

          <div className={`${styles.codeArea} ${codeCollapsed ? styles.codeAreaCollapsed : ''}`}>
            <div className={styles.codeAreaHeader}>
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

        {/* Right Panel - AI Assistant */}
        <div className={styles.rightPanel}>
          <AiPanel />
        </div>
      </div>
    </div>
  );
}
