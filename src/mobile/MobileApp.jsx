import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileTabBar from './components/MobileTabBar/MobileTabBar';
import './styles/mobile.css';

/* ── 路由懒加载 ── */
const FeedPage           = lazy(() => import('./pages/FeedPage/FeedPage'));
const DiscoverPage       = lazy(() => import('./pages/DiscoverPage/DiscoverPage'));
const GameDetailPage     = lazy(() => import('./pages/GameDetailPage/GameDetailPage'));
const NotifyPage         = lazy(() => import('./pages/NotifyPage/NotifyPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage/ProfilePage'));
const AiChatPage         = lazy(() => import('./pages/AiChatPage/AiChatPage'));
const PromptGalleryPage  = lazy(() => import('./pages/PromptGalleryPage/PromptGalleryPage'));
const TemplateBrowserPage = lazy(() => import('./pages/TemplateBrowserPage/TemplateBrowserPage'));
const SearchPage         = lazy(() => import('./pages/SearchPage/SearchPage'));
const UserProfilePage    = lazy(() => import('./pages/UserProfilePage/UserProfilePage'));
const LoginPage          = lazy(() => import('./pages/LoginPage/LoginPage'));
const SettingsPage       = lazy(() => import('./pages/SettingsPage/SettingsPage'));

function MobileLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', color: 'var(--text-muted)', fontSize: '0.8125rem',
      gap: 6,
    }}>
      <span className="m-spinner" />
    </div>
  );
}

export default function MobileApp() {
  return (
    <div className="mobile-root">
      <Suspense fallback={<MobileLoader />}>
        <Routes>
          {/* Tab页 */}
          <Route index element={<FeedPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="notify" element={<NotifyPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* 详情 */}
          <Route path="game/:gameId" element={<GameDetailPage />} />
          <Route path="user/:userId" element={<UserProfilePage />} />

          {/* 创作 */}
          <Route path="ai-chat" element={<AiChatPage />} />
          <Route path="prompts" element={<PromptGalleryPage />} />
          <Route path="templates" element={<TemplateBrowserPage />} />

          {/* 系统 */}
          <Route path="search" element={<SearchPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route path="*" element={<Navigate to="/m/" replace />} />
        </Routes>
      </Suspense>
      <MobileTabBar notifyCount={2} />
    </div>
  );
}
