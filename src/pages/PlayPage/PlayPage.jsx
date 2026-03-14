import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import GameCanvas from '../../components/GameCanvas/GameCanvas';
import useProjectStore from '../../stores/projectStore';
import styles from './PlayPage.module.css';

export default function PlayPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { loadAllProjects, getProject } = useProjectStore();
  const [project, setProject] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAllProjects();
  }, []);

  useEffect(() => {
    const p = getProject(projectId);
    if (p) setProject(p);
  }, [projectId, useProjectStore.getState().projects.length]);

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!project) {
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
      <Navbar>
        <div className={styles.playHeader}>
          <span className={styles.gameTitle}>🎮 {project.name}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/editor/${project.id}`)}>
            ✏️ 编辑
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            🏠 首页
          </button>
        </div>
      </Navbar>

      <div className={styles.gameWrapper}>
        <div className={styles.gameFrame}>
          <GameCanvas code={project.code} mode="preview" />
        </div>
      </div>

      <div className={styles.shareSection}>
        <p className={styles.shareInfo}>🎉 游戏已发布！分享链接给好友一起玩：</p>
        <div className={styles.shareUrl}>
          <input
            className={`input ${styles.shareUrlInput}`}
            value={window.location.href}
            readOnly
          />
          <button className="btn btn-primary btn-sm" onClick={handleCopy}>
            {copied ? '✅ 已复制' : '📋 复制'}
          </button>
        </div>
      </div>
    </div>
  );
}
