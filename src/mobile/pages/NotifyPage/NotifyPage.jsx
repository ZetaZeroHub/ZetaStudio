import MobileNavBar from '../../components/MobileNavBar/MobileNavBar';
import { Bell, MessageCircle, Heart, Pencil, Award } from 'lucide-react';
import { useState } from 'react';

const NOTIFICATIONS = [
  { id: 1, type: 'like', user: '小游戏达人', avatar: '🎮', content: '赞了你的作品', target: '绿洲大冒险', time: '2h', read: false },
  { id: 2, type: 'comment', user: '代码菜鸟', avatar: '🐣', content: '评论了你的作品', target: '"画面很精致!"', time: '5h', read: false },
  { id: 3, type: 'remix', user: 'AI玩家007', avatar: '🤖', content: 'Remix了你的作品', target: '打地鼠 Pro版', time: '1d', read: true },
  { id: 4, type: 'system', user: '系统', avatar: '🎉', content: '恭喜达到100粉丝', target: '', time: '2d', read: true },
  { id: 5, type: 'like', user: '妈妈程序员', avatar: '👩‍💻', content: '赞了你的作品', target: '宝宝学数字', time: '3d', read: true },
];

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 'calc(var(--m-nav-height) + var(--m-safe-top))', paddingBottom: 'calc(var(--m-tab-height) + var(--m-safe-bottom))' },
  tabs: { display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', padding: '0 var(--m-page-pad)' },
  tabBtn: { flex: 1, padding: '10px 0', border: 'none', background: 'none', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', textAlign: 'center', position: 'relative' },
  tabBtnActive: { color: 'var(--text-primary)', fontWeight: 600 },
  tabUnderline: { position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, borderRadius: 1, background: 'var(--m-accent)' },
  scroll: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  item: { display: 'flex', gap: 10, padding: '12px var(--m-page-pad)', borderBottom: '1px solid var(--border-subtle)' },
  itemUnread: { background: 'var(--m-accent-glow)' },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', background: 'var(--bg-elevated)', flexShrink: 0 },
  body: { flex: 1, minWidth: 0 },
  text: { fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 },
  user: { fontWeight: 600 },
  target: { color: 'var(--text-secondary)' },
  time: { fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)', gap: 8 },
};

export default function NotifyPage() {
  const [tab, setTab] = useState('all');

  const filtered = tab === 'all' ? NOTIFICATIONS : NOTIFICATIONS.filter(n => {
    if (tab === 'interact') return ['like', 'comment', 'remix'].includes(n.type);
    if (tab === 'system') return n.type === 'system';
    return true;
  });

  const TABS = [
    { key: 'all', label: '全部' },
    { key: 'interact', label: '互动' },
    { key: 'system', label: '系统' },
  ];

  return (
    <div style={styles.page}>
      <MobileNavBar title="通知" />

      <div style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...styles.tabBtn, ...(tab === t.key ? styles.tabBtnActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {tab === t.key && <span style={styles.tabUnderline} />}
          </button>
        ))}
      </div>

      <div style={styles.scroll}>
        {filtered.length > 0 ? filtered.map(n => (
          <div key={n.id} style={{ ...styles.item, ...(n.read ? {} : styles.itemUnread) }}>
            <div style={styles.avatar}>{n.avatar}</div>
            <div style={styles.body}>
              <p style={styles.text}>
                <span style={styles.user}>{n.user}</span>{' '}
                {n.content}{' '}
                {n.target && <span style={styles.target}>{n.target}</span>}
              </p>
              <div style={styles.time}>{n.time}</div>
            </div>
          </div>
        )) : (
          <div style={styles.empty}>
            <Bell size={32} style={{ opacity: 0.3 }} />
            <span>暂无通知</span>
          </div>
        )}
      </div>
    </div>
  );
}
