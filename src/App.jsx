import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import './index.css';
import './styles/gameUI.css';
import './styles/kenneyUI.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;

