import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import HomePage from './pages/HomePage/HomePage';
import EditorPage from './pages/EditorPage/EditorPage';
import KidsEditorPage from './pages/KidsEditorPage/KidsEditorPage';
import PlayPage from './pages/PlayPage/PlayPage';
import MazePlayPage from './pages/MazePlayPage/MazePlayPage';
import MazeHomePage from './pages/MazeHomePage/MazeHomePage';
import MazeLoadingPage from './pages/MazeLoadingPage/MazeLoadingPage';
import MazeDifficultyPage from './pages/MazeDifficultyPage/MazeDifficultyPage';
import MazeLevelSelectPage from './pages/MazeLevelSelectPage/MazeLevelSelectPage';
import MazeGamePage from './pages/MazeGamePage/MazeGamePage';
import TopDownGamePage from './pages/TopDownGamePage/TopDownGamePage';
import MazePathGame from './pages/MazePathGame/MazePathGame';
import GameEditorPage from './pages/GameEditorPage/GameEditorPage';
import CreatorModePage from './pages/CreatorModePage/CreatorModePage';
import CreatorLevelPage from './pages/CreatorLevelPage/CreatorLevelPage';
import AiMazeCreatorPage from './pages/AiMazeCreatorPage/AiMazeCreatorPage';
import SpriteEditorPage from './pages/SpriteEditorPage/SpriteEditorPage';
import ArtStudioPage from './pages/ArtStudioPage/ArtStudioPage';
import MobileApp from './mobile/MobileApp';
import useThemeStore from './stores/themeStore';
import './index.css';
import './styles/gameUI.css';
import './styles/kenneyUI.css';

/**
 * 检测当前设备是否应使用移动端视图
 * 规则：UA 包含手机标识 OR 窗口宽度 ≤ 768
 * 用户也可以通过 URL /m/ 前缀强制进入移动版
 */
function detectMobile() {
  const ua = navigator.userAgent;
  const isMobileUA = /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua);
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUA || isSmallScreen;
}

function App() {
  const theme = useThemeStore(s => s.theme);
  const isMobile = useMemo(() => detectMobile(), []);

  /* 将 theme 写入 <html> 节点，驱动全局 CSS 变量切换 */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    console.log('[App] 应用主题:', theme);
  }, [theme]);

  /* 移动端 viewport meta 适配 */
  useEffect(() => {
    if (isMobile) {
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no');
      }
      console.log('[App] 移动端模式已激活');
    }
  }, [isMobile]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* ══ 移动端路由 ══ */}
        <Route path="/m/*" element={<MobileApp />} />

        {/* ══ PC端路由 (保持不变) ══ */}
        <Route path="/" element={
          isMobile
            ? <Navigate to="/m/" replace />
            : <HomePage />
        } />
        <Route path="/editor/:projectId" element={<EditorPage />} />
        <Route path="/kids/editor/:projectId" element={<KidsEditorPage />} />
        <Route path="/play/:projectId" element={<PlayPage />} />
        <Route path="/play-maze/:gameType/:levelId" element={<MazePlayPage />} />
        {/* Game Dreamer routes */}
        <Route path="/maze" element={<MazeLoadingPage />} />
        <Route path="/maze/home" element={<MazeHomePage />} />
        <Route path="/maze/difficulty" element={<MazeDifficultyPage />} />
        <Route path="/maze/levels/:difficulty" element={<MazeLevelSelectPage />} />
        <Route path="/maze/play-topdown/:levelId" element={<MazePathGame />} />
        <Route path="/maze/play-draft/:draftId" element={<MazeGamePage />} />
        <Route path="/maze/play/:levelId" element={<MazeGamePage />} />
        {/* Game Editor routes */}
        <Route path="/maze/editor/:templateType/:levelId" element={<GameEditorPage />} />
        <Route path="/maze/editor/draft/:draftId" element={<GameEditorPage />} />
        {/* AI Creator routes */}
        <Route path="/maze/creator" element={<CreatorModePage />} />
        <Route path="/maze/creator/levels/:difficulty" element={<CreatorLevelPage />} />
        <Route path="/maze/ai-maze" element={<AiMazeCreatorPage />} />
        {/* Sprite Editor */}
        <Route path="/sprite-editor" element={<SpriteEditorPage />} />
        {/* Art Studio */}
        <Route path="/art-studio" element={<ArtStudioPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
