import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Plus, Bell, User } from 'lucide-react';
import styles from './MobileTabBar.module.css';

/* ── 抖音双排icon样式 ── */
function FeedIcon({ size = 20, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="3" width="7" height="18" rx="1" />
    </svg>
  );
}

const TABS = [
  { key: 'feed',     path: '/m/',         icon: FeedIcon,  label: '推荐' },
  { key: 'discover', path: '/m/discover', icon: Compass,   label: '发现' },
  { key: 'fab',      path: '/m/ai-chat',  icon: Plus,      label: '' },
  { key: 'notify',   path: '/m/notify',   icon: Bell,      label: '通知' },
  { key: 'profile',  path: '/m/profile',  icon: User,      label: '我的' },
];

export default function MobileTabBar({ notifyCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  // 在全屏页面中隐藏 TabBar
  const hiddenPaths = ['/m/ai-chat', '/m/login', '/m/search', '/m/game/'];
  const isHidden = hiddenPaths.some(p => location.pathname.startsWith(p));
  if (isHidden) return null;

  // 推荐页 — 暗色底栏
  const isFeedPage = location.pathname === '/m/' || location.pathname === '/m';
  const isDark = isFeedPage;

  const currentTab = (() => {
    const p = location.pathname;
    if (p.startsWith('/m/discover')) return 'discover';
    if (p.startsWith('/m/notify')) return 'notify';
    if (p.startsWith('/m/profile') || p.startsWith('/m/settings')) return 'profile';
    return 'feed';
  })();

  const handleTabClick = (tab) => {
    if (tab.path && location.pathname !== tab.path) {
      navigate(tab.path);
    }
  };

  return (
    <nav className={`${styles.tabBar} ${isDark ? styles.tabBarDark : ''}`}>
      {TABS.map(tab => {
        if (tab.key === 'fab') {
          return (
            <div key="fab" className={styles.fabWrap}>
              <button
                className={styles.fabBtn}
                onClick={() => navigate('/m/ai-chat')}
                aria-label="创建"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </div>
          );
        }

        const isActive = currentTab === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
            onClick={() => handleTabClick(tab)}
            aria-label={tab.label}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} active={isActive} />
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.key === 'notify' && notifyCount > 0 && (
              <span className={styles.tabDot} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

