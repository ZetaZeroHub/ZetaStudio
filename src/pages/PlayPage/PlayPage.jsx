import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Copy, Check, ArrowLeft, Share2 } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import GameCanvas from '../../components/GameCanvas/GameCanvas';
import useProjectStore from '../../stores/projectStore';
import useEditorStore from '../../stores/editorStore';
import { getTemplate } from '../../templates';
import styles from './PlayPage.module.css';

export default function PlayPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { loadAllProjects, getProject } = useProjectStore();
  const [project, setProject] = useState(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadAllProjects();
  }, []);

  useEffect(() => {
    const p = getProject(projectId);
    if (p) {
      setProject(p);
      // Initialize editorStore so GameCanvas can read elements/scripts/dimension
      const template = getTemplate(p.templateType);
      useEditorStore.getState().initEditor(p, template);
      // Force preview mode
      useEditorStore.getState().setMode('preview');
      setReady(true);
    }

    return () => {
      useEditorStore.getState().clearEditor();
    };
  }, [projectId, useProjectStore.getState().projects.length]);

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!project || !ready) {
    return (
      <div className={styles.playPage}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playPage}>
      <Navbar hideBrand leftContent={
        <button className={styles.backBtn} onClick={() => navigate('/')}><ArrowLeft size={14} /> 返回首页</button>
      }>
        <span className={styles.gameTitle}>{project.name}</span>
      </Navbar>

      <div className={styles.gameWrapper}>
        <div className={styles.gameFrame}>
          <GameCanvas mode="preview" />
        </div>
        <div className={styles.belowCanvasActions}>
          <button className={styles.editBtn} onClick={() => navigate(`/editor/${project.id}`)}>
            <Pencil size={14} /> 编辑关卡
          </button>
        </div>
      </div>

      <div className={styles.shareSection}>
        <p className={styles.shareInfo}><Share2 size={14} style={{display:'inline',verticalAlign:'-2px'}} /> 游戏已发布，分享链接给好友一起玩：</p>
        <div className={styles.shareUrl}>
          <input
            className={`input ${styles.shareUrlInput}`}
            value={window.location.href}
            readOnly
          />
          <button className="btn btn-primary btn-sm" onClick={handleCopy}>
            {copied ? <><Check size={13} /> 已复制</> : <><Copy size={13} /> 复制</>}
          </button>
        </div>
      </div>
    </div>
  );
}

