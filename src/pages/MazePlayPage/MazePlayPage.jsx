/* ========================================
   MazePlayPage — 在专业模式的 PlayPage 外壳中
   嵌入游戏梦想家的游戏（横版冒险/小鸭子）
   ======================================== */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import { Pencil, Copy, Check, ArrowLeft, Share2 } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import styles from '../PlayPage/PlayPage.module.css';
import mStyles from './MazePlayPage.module.css';

const MazeGamePage = lazy(() => import('../MazeGamePage/MazeGamePage'));
const MazePathGame = lazy(() => import('../MazePathGame/MazePathGame'));

const GAME_NAMES = {
  platformer: { zh: '横版冒险闯关', en: 'Side-Scroll Adventure' },
  topdown: { zh: '小鸭子找水池', en: 'Duck Finds Pond' },
};

export default function MazePlayPage() {
  const { gameType } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const gameName = GAME_NAMES[gameType]?.zh || '游戏';

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.playPage}>
      <Navbar hideBrand leftContent={
        <button className={styles.backBtn} onClick={() => navigate('/')}><ArrowLeft size={14} /> 返回首页</button>
      }>
        <span className={styles.gameTitle}>{gameName}</span>
      </Navbar>

      <div className={styles.gameWrapper}>
        <div className={`${styles.gameFrame} ${mStyles.mazeFrame}`}>
          <Suspense fallback={
            <div className={mStyles.loading}>加载中...</div>
          }>
            {gameType === 'topdown' ? <MazePathGame /> : <MazeGamePage />}
          </Suspense>
        </div>
        <div className={styles.belowCanvasActions}>
          {gameType === 'platformer' ? (
            <button className={styles.editBtn} onClick={() => navigate('/maze/editor/platformer/medium-2?from=pro')}>
              <Pencil size={14} /> 编辑关卡
            </button>
          ) : (
            <button className={styles.editBtn} disabled style={{ opacity: 0.4, cursor: 'not-allowed' }} title="暂无自定义编辑器">
              <Pencil size={14} /> 编辑关卡（暂未开放）
            </button>
          )}
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
