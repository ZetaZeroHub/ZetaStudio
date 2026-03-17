import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import EditorPage from './pages/EditorPage/EditorPage';
import KidsEditorPage from './pages/KidsEditorPage/KidsEditorPage';
import PlayPage from './pages/PlayPage/PlayPage';
import MazeHomePage from './pages/MazeHomePage/MazeHomePage';
import MazeDifficultyPage from './pages/MazeDifficultyPage/MazeDifficultyPage';
import MazeLevelSelectPage from './pages/MazeLevelSelectPage/MazeLevelSelectPage';
import MazeGamePage from './pages/MazeGamePage/MazeGamePage';
import TopDownGamePage from './pages/TopDownGamePage/TopDownGamePage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
        <Route path="/kids/editor/:projectId" element={<KidsEditorPage />} />
        <Route path="/play/:projectId" element={<PlayPage />} />
        {/* Game Dreamer routes */}
        <Route path="/maze" element={<MazeHomePage />} />
        <Route path="/maze/difficulty" element={<MazeDifficultyPage />} />
        <Route path="/maze/levels/:difficulty" element={<MazeLevelSelectPage />} />
        <Route path="/maze/play-topdown/:levelId" element={<TopDownGamePage />} />
        <Route path="/maze/play/:levelId" element={<MazeGamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

