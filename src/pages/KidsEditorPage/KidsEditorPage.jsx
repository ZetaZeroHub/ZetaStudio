import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, CheckCircle2, ArrowLeft, Pencil, Play } from 'lucide-react';
import GameCanvas from '../../components/GameCanvas/GameCanvas';
import AiPanel from '../../components/AiPanel/AiPanel';
import useProjectStore from '../../stores/projectStore';
import useEditorStore from '../../stores/editorStore';
import { getTemplate } from '../../templates';
import styles from './KidsEditorPage.module.css';

export default function KidsEditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { loadAllProjects, getProject, updateProject } = useProjectStore();
  const { currentProject, mode, initEditor, setMode } = useEditorStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAllProjects(); }, []);

  // Override body dark background for kids mode
  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
    document.body.setAttribute('data-kids-mode', 'true');
    return () => {
      document.body.style.backgroundColor = '';
      document.body.removeAttribute('data-kids-mode');
    };
  }, []);

  useEffect(() => {
    const project = getProject(projectId);
    if (project) {
      const template = getTemplate(project.templateType);
      initEditor(project, template);
      // Kids mode: default to play instead of edit
      setMode('preview');
    }
    return () => { useEditorStore.getState().clearEditor(); };
  }, [projectId]);

  const handleSave = useCallback(() => {
    if (!currentProject) return;
    setSaving(true);
    const data = useEditorStore.getState().getProjectData();
    updateProject(currentProject.id, data);
    setTimeout(() => setSaving(false), 800);
  }, [currentProject, updateProject]);

  if (!currentProject) {
    return (
      <div className={styles.page} data-kids-mode>
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${mode === 'preview' ? styles.previewMode : ''}`} data-kids-mode>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> 返回
        </button>
        <div className={styles.projectName}>
          <span className={styles.projectEmoji}>🎮</span>
          {currentProject.name}
        </div>
        <button className={styles.saveBtn} onClick={handleSave}>
          {saving ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? '已保存' : '保存'}
        </button>
      </header>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left: AI Panel — hidden on mobile in preview mode */}
        <div className={`${styles.aiPanel} ${mode === 'preview' ? styles.aiPanelHiddenMobile : ''}`}>
          <AiPanel theme="kids" />
        </div>

        {/* Right: Game Canvas */}
        <div className={styles.gamePanel}>
          {/* Mode Toggle */}
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeBtn} ${mode === 'edit' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('edit')}
            >
              <Pencil size={14} /> 编辑游戏
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'preview' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('preview')}
            >
              <Play size={14} /> 开始游戏
            </button>
          </div>
          <div className={styles.canvasWrap} style={{ '--canvas-bg': '#e8f5e9' }}>
            <GameCanvas mode={mode} canvasBg={0xe8f5e9} />
          </div>
        </div>
      </div>
    </div>
  );
}
