import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Play, Save, CheckCircle2, Rocket, Code2, ChevronUp, ChevronDown, Gamepad2, LayoutPanelLeft, Layers, Sparkles, PanelLeft, PanelBottom, PanelRight, Maximize2, Minimize2, History, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishName, setPublishName] = useState('');
  const [savesOpen, setSavesOpen] = useState(false);
  const [publishToast, setPublishToast] = useState('');
  // Mobile: which panel is active
  const [mobileTab, setMobileTab] = useState('canvas');
  // Tablet: left panel drawer open
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  // PC panel visibility toggles (VSCode-style)
  const [leftPanelVisible, setLeftPanelVisible] = useState(false);
  const [bottomPanelVisible, setBottomPanelVisible] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [codeFullscreen, setCodeFullscreen] = useState(false);
  // Resizable right panel
  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    const saved = localStorage.getItem('editorRightPanelWidth');
    return saved ? parseInt(saved, 10) : 360;
  });
  const isResizingRef = useRef(false);

  // Auto-switch to canvas tab on mobile when entering preview mode
  useEffect(() => {
    if (mode === 'preview') {
      setMobileTab('canvas');
    }
  }, [mode]);

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
    // Also save a snapshot for version history
    useEditorStore.getState().saveSnapshot();
    setTimeout(() => setSaving(false), 800);
  }, [currentProject, updateProject]);

  // Auto-save every 60 seconds
  useEffect(() => {
    if (!currentProject) return;
    const timer = setInterval(() => {
      const state = useEditorStore.getState();
      if (state.currentProject) {
        const data = state.getProjectData();
        updateProject(state.currentProject.id, data);
        state.saveSnapshot();
        console.log('[EditorPage] Auto-saved');
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [currentProject?.id, updateProject]);

  // Open publish modal
  const handlePublishClick = useCallback(() => {
    setPublishName(currentProject?.name || '');
    setPublishModalOpen(true);
  }, [currentProject]);

  // Confirm publish
  const handleConfirmPublish = useCallback(() => {
    if (!currentProject) return;
    const name = publishName.trim() || currentProject.name || '';
    const data = useEditorStore.getState().getProjectData();
    updateProject(currentProject.id, { ...data, name, published: true, publishedAt: Date.now() });
    useEditorStore.getState().saveSnapshot();
    setPublishModalOpen(false);
    setPublishToast('已发布到我的作品！');
    console.log('[EditorPage] Published:', currentProject.id, name);
    setTimeout(() => navigate('/'), 1500);
  }, [currentProject, updateProject, publishName, navigate]);

  // Snapshots for current project
  const currentSnapshots = useMemo(() => {
    return useEditorStore.getState().getSnapshotsForProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id, saving]);

  /* ── Right panel resize ── */
  const onResizeStart = useCallback((e) => {
    e.preventDefault();
    isResizingRef.current = true;
    const startX = e.clientX || e.touches?.[0]?.clientX;
    const startW = rightPanelWidth;
    const onMove = (ev) => {
      const x = ev.clientX || ev.touches?.[0]?.clientX;
      const newW = Math.max(260, Math.min(600, startW - (x - startX)));
      setRightPanelWidth(newW);
    };
    const onUp = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      setRightPanelWidth(w => { localStorage.setItem('editorRightPanelWidth', w); return w; });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onUp);
  }, [rightPanelWidth]);

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
    <div className={`${styles.editorPage} ${mode === 'preview' ? styles.previewMode : ''}`}>
      {/* Top Toolbar */}
      <Navbar hideBrand leftContent={
        <button className={styles.backToHome} onClick={() => navigate('/')}>← 返回</button>
      }>
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
          {/* VSCode-style panel toggle buttons */}
          <div className={styles.panelToggles}>
            <button
              className={`${styles.panelToggleBtn} ${leftPanelVisible ? styles.panelToggleBtnActive : ''}`}
              onClick={() => setLeftPanelVisible(v => !v)}
              title={t('editor.toggleLeftPanel') || '左侧面板'}
            >
              <PanelLeft size={16} />
            </button>
            <button
              className={`${styles.panelToggleBtn} ${bottomPanelVisible ? styles.panelToggleBtnActive : ''}`}
              onClick={() => setBottomPanelVisible(v => !v)}
              title={t('editor.toggleBottomPanel') || '底部面板'}
            >
              <PanelBottom size={16} />
            </button>
            <button
              className={`${styles.panelToggleBtn} ${rightPanelVisible ? styles.panelToggleBtnActive : ''}`}
              onClick={() => setRightPanelVisible(v => !v)}
              title={t('editor.toggleRightPanel') || '右侧面板'}
            >
              <PanelRight size={16} />
            </button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleSave}>
            {saving ? <CheckCircle2 size={16} className={styles.iconSuccess} /> : <Save size={16} />}
            <span className={styles.actionLabel}>{saving ? t('editor.saved') : t('editor.save')}</span>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSavesOpen(v => !v)} title="My Saves">
            <History size={16} />
            <span className={styles.actionLabel}>记录</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePublishClick}>
            <Upload size={16} />
            <span className={styles.actionLabel}>{t('editor.publish')}</span>
          </button>
        </div>
      </Navbar>

      {/* Editor Body */}
      <div className={styles.editorBody}>
        {/* Left Panel - Element Tree + Properties */}
        {/* Tablet: overlay drawer controlled by leftDrawerOpen */}
        {leftDrawerOpen && <div className={styles.drawerBackdrop} onClick={() => setLeftDrawerOpen(false)} />}
        <div className={`${styles.leftPanel} ${leftDrawerOpen ? styles.leftPanelOpen : ''} ${!leftPanelVisible ? styles.leftPanelHidden : ''}`}>
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

          {bottomPanelVisible && (
            <div className={`${styles.codeArea} ${codeCollapsed && mobileTab !== 'code' ? styles.codeAreaCollapsed : ''} ${mobileTab === 'code' ? styles.codeAreaFull : ''} ${codeFullscreen ? styles.codeAreaFullscreen : ''}`}>
              <div className={`${styles.codeAreaHeader} ${mobileTab === 'code' ? styles.mobileHidden : ''}`}>
                <div className={styles.headerTitle}>
                  <Code2 size={16} /> {t('editor.scriptsLabel')}
                </div>
                <div className={styles.headerActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setCodeFullscreen(f => !f); setCodeCollapsed(false); }} title={codeFullscreen ? '退出全屏' : '全屏编辑'}>
                    {codeFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setCodeCollapsed(!codeCollapsed)}>
                    {codeCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              <div className={styles.codeAreaBody}>
                <ScriptEditor />
              </div>
            </div>
          )}
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
          <AiPanel theme="pro" />
        </div>

        {/* Right Panel - AI Assistant (desktop/tablet) */}
        <div
          className={`${styles.rightPanel} ${!rightPanelVisible ? styles.rightPanelHidden : ''}`}
          style={rightPanelVisible ? { width: rightPanelWidth } : undefined}
        >
          <div
            className={styles.resizeHandle}
            onMouseDown={onResizeStart}
            onTouchStart={onResizeStart}
          />
          <AiPanel theme="pro" />
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className={styles.bottomTabBar}>
        {MOBILE_TABS
          .filter(({ key }) => mode === 'preview' ? key === 'canvas' : true)
          .map(({ key, icon: Icon }) => (
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
      {/* Saves panel */}
      <AnimatePresence>
        {savesOpen && (
          <motion.div
            className={styles.savesPanel}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className={styles.savesPanelHeader}>
              <h4 className={styles.savesPanelTitle}>My Saves</h4>
              <button className={styles.savesPanelClose} onClick={() => setSavesOpen(false)}><X size={14} /></button>
            </div>
            <div className={styles.savesList}>
              {currentSnapshots.length === 0 && (
                <div className={styles.savesEmpty}>No saves yet</div>
              )}
              {currentSnapshots.map(snap => (
                <button
                  key={snap.id}
                  className={styles.savesItem}
                  onClick={() => {
                    useEditorStore.getState().loadSnapshot(snap.id);
                    setSavesOpen(false);
                    setPublishToast('Loaded');
                    setTimeout(() => setPublishToast(''), 2000);
                  }}
                >
                  <span className={styles.savesItemName}>{snap.name}</span>
                  <span className={styles.savesItemTime}>{new Date(snap.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish modal */}
      <AnimatePresence>
        {publishModalOpen && (
          <motion.div
            className={styles.publishOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPublishModalOpen(false)}
          >
            <motion.div
              className={styles.publishModal}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className={styles.publishModalTitle}>Publish</h3>
              <p className={styles.publishModalDesc}>Name your game</p>
              <input
                type="text"
                className={styles.publishModalInput}
                value={publishName}
                onChange={e => setPublishName(e.target.value)}
                placeholder="Name"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleConfirmPublish()}
              />
              <div className={styles.publishModalActions}>
                <button className={styles.publishConfirmBtn} onClick={handleConfirmPublish}>
                  <Upload size={16} /> Publish
                </button>
                <button className={styles.publishCancelBtn} onClick={() => setPublishModalOpen(false)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {publishToast && (
          <motion.div
            className={styles.publishToast}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            {publishToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
