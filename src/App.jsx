import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import EditorPage from './pages/EditorPage/EditorPage';
import KidsEditorPage from './pages/KidsEditorPage/KidsEditorPage';
import PlayPage from './pages/PlayPage/PlayPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
        <Route path="/kids/editor/:projectId" element={<KidsEditorPage />} />
        <Route path="/play/:projectId" element={<PlayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
