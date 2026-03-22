/* ========================================
   GameEditorPage — AI游戏创作关卡编辑器
   支持横版(platformer) + 2.5D(topdown)
   移动端优化 + 属性编辑 + 开始游戏
   ======================================== */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Save, CheckCircle2, Pencil, Play, MousePointer,
  PaintBucket, Eraser, ZoomIn, ZoomOut, PanelLeftClose, PanelLeft,
  Sparkles, ChevronDown, ChevronRight, X, Gamepad2, Upload, FileDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameDraftStore from '../../stores/gameDraftStore';
import useProjectStore from '../../stores/projectStore';
import { getLevelById } from '../../data/mazeLevels';
import TilePanel from '../../components/TilePanel/TilePanel';
import EditorCanvas from '../../components/EditorCanvas/EditorCanvas';
import AiPanel from '../../components/AiPanel/AiPanel';
import LlmSettingsModal from '../../components/LlmSettingsModal/LlmSettingsModal';
import styles from './GameEditorPage.module.css';

/* Sound effects */
function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
  } catch (_) {}
}

function playSaveSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.15);
    });
  } catch (_) {}
}

const TOOLS = [
  { key: 'select', icon: MousePointer, label: '选择', tip: '点击选中 / 拖动平移' },
  { key: 'brush', icon: PaintBucket, label: '画笔', tip: '点击放置素材' },
  { key: 'eraser', icon: Eraser, label: '擦除', tip: '点击删除元素' },
];

/* Property labels by type */
const PROP_LABELS = {
  platform: { label: '🟫 地形', props: ['x', 'y', 'w', 'theme'] },
  item: { label: '⭐ 物品', props: ['type', 'x', 'y'] },
  enemy: { label: '👾 敌人', props: ['enemyType', 'x', 'y', 'patrol'] },
  interactable: { label: '⚙️ 机关', props: ['type', 'x', 'y', 'w', 'h'] },
  playerStart: { label: '🧑 出生点', props: ['x', 'y'] },
  exitDoor: { label: '🚪 出口', props: ['x', 'y'] },
};

export default function GameEditorPage() {
  const { templateType, levelId, draftId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Detect if entered from pro mode (URL contains query param or referrer)
  const fromPro = location.search?.includes('from=pro');
  const {
    currentDraft, mode, selectedTool, selectedTile, brushMode, drafts, saves,
    loadDrafts, createDraft, openDraft, saveDraft, closeDraft,
    setMode, setSelectedTool, setBrushMode, setSelectedTile,
    saveRecord, loadSaveRecord, deleteSave, publishDraft,
  } = useGameDraftStore();

  const [saving, setSaving] = useState(false);
  // Desktop: default AI panel open; read cached width
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const [rightPanelOpen, setRightPanelOpen] = useState(isDesktop);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  // AI panel resizable width
  const cachedW = typeof window !== 'undefined' ? parseInt(localStorage.getItem('gameEditorAiWidth') || '320', 10) : 320;
  const [aiPanelWidth, setAiPanelWidth] = useState(Math.max(200, Math.min(cachedW, 600)));
  const resizingRef = useRef(false);
  // Section collapse states
  const [sectionsOpen, setSectionsOpen] = useState({ tools: true, tiles: true });
  // Selected element for property editing
  const [selectedElement, setSelectedElement] = useState(null);

  // Load drafts on mount
  useEffect(() => { loadDrafts(); }, []);

  // Initialize: open existing draft or create NEW independent draft from level template
  useEffect(() => {
    // Default tool to select
    setSelectedTool('select');
    if (draftId) {
      // Opening an existing draft for re-editing
      console.log('[GameEditorPage] Opening existing draft:', draftId);
      openDraft(draftId);
    } else if (templateType && levelId) {
      // Always create a NEW independent draft from the level template
      // Never reuse existing drafts — each creation is independent
      const baseLevel = getLevelById(levelId);
      if (baseLevel) {
        console.log('[GameEditorPage] Creating NEW independent draft from template:', levelId);
        createDraft(`${baseLevel.name} - 编辑版`, templateType, baseLevel);
      }
    }
    return () => closeDraft();
  }, [draftId, templateType, levelId]);

  // Keep panel open by default for discoverability

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [publishToast, setPublishToast] = useState('');
  const [savesOpen, setSavesOpen] = useState(false);

  // Filter saves for current draft
  const currentSaves = saves.filter(s => s.draftId === currentDraft?.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  // ── Auto-save every 60 seconds ──
  useEffect(() => {
    if (!currentDraft) return;
    const timer = setInterval(() => {
      const draft = useGameDraftStore.getState().currentDraft;
      if (draft) {
        useGameDraftStore.getState().saveRecord();
        console.log('[GameEditorPage] Auto-saved');
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [currentDraft?.id]);

  const handlePublishClick = useCallback(() => {
    setSaveName(currentDraft?.name || '我的关卡');
    setSaveModalOpen(true);
  }, [currentDraft]);

  // Manual save — no popup, directly save
  const handleManualSave = useCallback(() => {
    saveRecord();
    playSaveSound();
    setPublishToast('✅ 已保存');
    setTimeout(() => setPublishToast(''), 2000);
  }, [saveRecord]);

  // Publish
  const handlePublishLevel = useCallback(() => {
    const name = saveName.trim() || currentDraft?.name || '我的关卡';
    if (fromPro) {
      // Publish to pro mode's projectStore ("我的作品")
      const project = useProjectStore.getState().createProject(name, 'mazeAdventure', '2D');
      useProjectStore.getState().updateProject(project.id, {
        mazeLevelData: currentDraft?.levelData,
        baseLevelId: levelId,
        gameDraftId: currentDraft?.id, // link to gameDraftStore draft
      });
      publishDraft(name); // also keep in draft store
      playSaveSound();
      setSaveModalOpen(false);
      setPublishToast('🎉 已发布到我的作品！');
      console.log('[GameEditorPage] Published to pro projectStore:', project.id);
      setTimeout(() => navigate('/'), 1500);
    } else {
      publishDraft(name);
      playSaveSound();
      setSaveModalOpen(false);
      setPublishToast('🎉 作品已发布！（模拟）');
      console.log('[GameEditorPage] Level published (simulated):', currentDraft?.id);
      setTimeout(() => setPublishToast(''), 3000);
    }
  }, [saveName, publishDraft, currentDraft, fromPro, levelId, navigate]);

  const handleLoadSave = useCallback((saveId) => {
    loadSaveRecord(saveId);
    playClick();
    setSavesOpen(false);
    setPublishToast('📂 已加载保存记录');
    setTimeout(() => setPublishToast(''), 2000);
  }, [loadSaveRecord]);

  const handleBack = () => {
    playClick();
    if (currentDraft) saveDraft();
    if (fromPro) {
      navigate('/');
      return;
    }
    // If navigated from maze-home (my works), go back in history
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'maze-home') {
      navigate(-1);
      return;
    }
    const tType = currentDraft?.templateType;
    const diff = tType === 'topdown' ? 'easy' : 'medium';
    navigate(`/maze/creator/levels/${diff}`);
  };

  const handlePlayTest = () => {
    playClick();
    if (currentDraft) saveDraft();
    // Use draft ID route to play the draft, NOT the baseLevelId
    // This prevents drafts from overriding official levels
    const draftIdToPlay = currentDraft?.id;
    if (draftIdToPlay) {
      console.log('[GameEditorPage] Play testing draft:', draftIdToPlay);
      navigate(`/maze/play-draft/${draftIdToPlay}`);
    }
  };

  const toggleSection = (key) => {
    playClick();
    setSectionsOpen(s => ({ ...s, [key]: !s[key] }));
  };

  if (!currentDraft) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span>加载关卡编辑器...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ═══ Top Bar ═══ */}
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <button className={styles.backBtn} onClick={handleBack}>
            <ArrowLeft size={16} />
          </button>
          <div className={styles.draftName}>{currentDraft.name}</div>
          <div className={styles.templateBadge}>
            {currentDraft.templateType === 'platformer' ? '横版' : '2.5D'}
          </div>
        </div>

        <div className={styles.topRight}>
          <button
            className={`${styles.modeBtn} ${styles.playBtn}`}
            onClick={handlePlayTest}
          >
            <Gamepad2 size={14} /> <span>开始体验</span>
          </button>
          {/* My Saves dropdown */}
          <div className={styles.savesDropdownWrap}>
            <button className={styles.savesToggle} onClick={() => { playClick(); setSavesOpen(!savesOpen); }}>
              <FileDown size={14} /> <span>我的保存 {currentSaves.length > 0 && `(${currentSaves.length})`}</span>
            </button>
            {savesOpen && (
              <div className={styles.savesDropdown}>
                {currentSaves.length === 0 ? (
                  <div className={styles.savesEmpty}>暂无保存记录</div>
                ) : (
                  currentSaves.map(s => (
                    <div key={s.id} className={styles.saveItem} onClick={() => handleLoadSave(s.id)}>
                      <span className={styles.saveItemName}>{s.name}</span>
                      <span className={styles.saveItemTime}>{new Date(s.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <button className={styles.saveItemDel} onClick={(e) => { e.stopPropagation(); deleteSave(s.id); playClick(); }}>✕</button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* Save button — direct save, no popup */}
          <button className={styles.quickSaveBtn} onClick={handleManualSave}>
            <Save size={14} /> <span>保存</span>
          </button>
          <button className={styles.saveBtn} onClick={handlePublishClick}>
            {saving ? <CheckCircle2 size={16} /> : <Upload size={16} />}
            <span>{saving ? '已发布' : '发布'}</span>
          </button>
          <button
            className={`${styles.aiBtn} ${rightPanelOpen ? styles.aiBtnActive : ''}`}
            onClick={() => { playClick(); setRightPanelOpen(!rightPanelOpen); }}
          >
            <Sparkles size={16} />
            <span>✨ AI助手帮你设计</span>
          </button>
        </div>
      </header>

      {/* ═══ Editor Body ═══ */}
      <div className={styles.editorBody}>
        {/* Left Panel */}
        <AnimatePresence>
          {mode === 'edit' && leftPanelOpen && (
            <motion.div
              className={styles.leftPanel}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25 }}
            >

              {/* ── Tools (compact row) ── */}
              <div className={styles.section}>
                <button className={styles.sectionHeader} onClick={() => toggleSection('tools')}>
                  <span className={styles.sectionLabel}>🛠 工具</span>
                  {sectionsOpen.tools ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                {sectionsOpen.tools && (
                  <div className={styles.toolRow}>
                    {TOOLS.map(({ key, icon: Icon, label, tip }) => (
                      <button
                        key={key}
                        className={`${styles.toolChip} ${selectedTool === key ? styles.toolChipActive : ''}`}
                        onClick={() => {
                          playClick();
                          setSelectedTool(key);
                          if (key === 'brush' && !selectedTile) {
                            setSelectedTile({ id: 'terrain_grass_block_top', name: '草地', src: '' });
                          }
                        }}
                        title={tip}
                      >
                        <Icon size={14} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {sectionsOpen.tools && selectedTool === 'brush' && (
                  <div className={styles.brushModeRow}>
                    <button
                      className={`${styles.brushModeBtn} ${brushMode === 'continuous' ? styles.brushModeBtnActive : ''}`}
                      onClick={() => { playClick(); setBrushMode('continuous'); }}
                      title="按住拖拽连续绘制多个格子"
                    >
                      🖌 连续绘制
                    </button>
                    <button
                      className={`${styles.brushModeBtn} ${brushMode === 'single' ? styles.brushModeBtnActive : ''}`}
                      onClick={() => { playClick(); setBrushMode('single'); }}
                      title="放置一个后自动切换为选择模式"
                    >
                      📍 单次放置
                    </button>
                  </div>
                )}
              </div>

              {/* ── Tile Panel (collapsible, fills remaining space) ── */}
              <div className={`${styles.section} ${styles.sectionFill}`}>
                <button className={styles.sectionHeader} onClick={() => toggleSection('tiles')}>
                  <span className={styles.sectionLabel}>🎨 素材库</span>
                  {sectionsOpen.tiles ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                {sectionsOpen.tiles && (
                  <div className={styles.tilePanelWrap}>
                    <TilePanel templateType={currentDraft.templateType} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent toggle tab — always rendered, CSS-animated position */}
        {mode === 'edit' && (
          <button
            className={`${styles.panelToggleTab} ${leftPanelOpen ? styles.panelToggleTabOpen : ''}`}
            onClick={() => { playClick(); setLeftPanelOpen(!leftPanelOpen); }}
            title={leftPanelOpen ? '收起面板' : '展开素材面板'}
          >
            {leftPanelOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
          </button>
        )}

        <div className={styles.centerPanel}>
          {/* Controls overlay */}
          {mode === 'edit' && (
            <div className={styles.canvasControls}>
              <button className={styles.ctrlBtn} onClick={() => setZoom(z => Math.min(z + 0.25, 3))}>
                <ZoomIn size={14} />
              </button>
              <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
              <button className={styles.ctrlBtn} onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))}>
                <ZoomOut size={14} />
              </button>
            </div>
          )}

          <EditorCanvas
            zoom={zoom}
            onElementSelect={(el) => setSelectedElement(el)}
            onZoomChange={(newZoom) => setZoom(newZoom)}
          />

          {/* Property editor (bottom sheet on select) */}
          <AnimatePresence>
            {selectedElement && mode === 'edit' && (
              <motion.div
                className={styles.propSheet}
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className={styles.propHeader}>
                  <span>{PROP_LABELS[selectedElement.kind]?.label || '元素'} 属性</span>
                  <button onClick={() => setSelectedElement(null)}><X size={14} /></button>
                </div>
                <div className={styles.propBody}>
                  {selectedElement.kind === 'platform' && (
                    <div className={styles.propHint}>
                      💡 可修改位置(x,y)、宽度(w)、主题(theme)
                    </div>
                  )}
                  {selectedElement.kind === 'item' && (
                    <div className={styles.propHint}>
                      💡 类型: {selectedElement.data?.type || 'coin'} · 可修改坐标或删除
                    </div>
                  )}
                  {selectedElement.kind === 'enemy' && (
                    <div className={styles.propHint}>
                      💡 敌人类型: {selectedElement.data?.enemyType || '史莱姆'} · 可设置巡逻范围
                    </div>
                  )}
                  {selectedElement.kind === 'interactable' && (
                    <div className={styles.propHint}>
                      💡 机关类型: {selectedElement.data?.type || '问号砖'} · 可修改尺寸和触发行为
                    </div>
                  )}
                  {selectedElement.kind === 'playerStart' && (
                    <div className={styles.propHint}>
                      💡 玩家出生位置，拖动角色或输入精确坐标
                    </div>
                  )}
                  {selectedElement.kind === 'exitDoor' && (
                    <div className={styles.propHint}>
                      💡 关卡出口位置，到达此处即通关
                    </div>
                  )}
                  <div className={styles.propGrid}>
                    {Object.entries(selectedElement.data || {}).map(([k, v]) => (
                      <div key={k} className={styles.propField}>
                        <label>{k}</label>
                        <input
                          type={typeof v === 'number' ? 'number' : 'text'}
                          value={v ?? ''}
                          readOnly
                          className={styles.propInput}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: AI Panel */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              className={styles.rightPanel}
              style={{ width: aiPanelWidth }}
              initial={{ x: aiPanelWidth }}
              animate={{ x: 0 }}
              exit={{ x: aiPanelWidth }}
              transition={{ duration: 0.25 }}
            >
              {/* Drag resize handle */}
              <div
                className={styles.resizeHandle}
                onMouseDown={(e) => {
                  e.preventDefault();
                  resizingRef.current = true;
                  const startX = e.clientX;
                  const startW = aiPanelWidth;
                  const onMove = (ev) => {
                    if (!resizingRef.current) return;
                    const delta = startX - ev.clientX;
                    const newW = Math.max(200, Math.min(startW + delta, 600));
                    setAiPanelWidth(newW);
                  };
                  const onUp = () => {
                    resizingRef.current = false;
                    localStorage.setItem('gameEditorAiWidth', String(aiPanelWidth));
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                  };
                  document.addEventListener('mousemove', onMove);
                  document.addEventListener('mouseup', onUp);
                }}
              />
              <div className={styles.aiPanelHeader}>
                <Sparkles size={16} />
                <span>AI 关卡设计助手</span>
                <button
                  className={styles.aiSettingsBtn}
                  onClick={() => setSettingsOpen(true)}
                  title="配置 AI 模型"
                >⚙️</button>
              </div>
              <AiPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Publish modal (only publish, no save draft) */}
      <AnimatePresence>
        {saveModalOpen && (
          <motion.div
            className={styles.saveOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSaveModalOpen(false)}
          >
            <motion.div
              className={styles.saveModal}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={styles.saveModalTitle}>🚀 发布作品</h3>
              <p className={styles.saveModalDesc}>发布后将在「我的创作」中展示</p>
              <input
                type="text"
                className={styles.saveModalInput}
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="作品名称"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handlePublishLevel()}
              />
              <div className={styles.saveModalActions}>
                <button className={styles.publishBtn} onClick={handlePublishLevel}>
                  <Upload size={16} /> 发布作品
                </button>
                <button className={styles.saveModalCancel} onClick={() => setSaveModalOpen(false)}>取消</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Publish toast notification */}
      <AnimatePresence>
        {publishToast && (
          <motion.div
            style={{
              position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
              background: '#2E3A2F', color: '#fff', padding: '10px 24px',
              borderRadius: 12, fontWeight: 700, fontSize: '0.85rem',
              zIndex: 2000, boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {publishToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LLM Settings Modal */}
      <LlmSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
