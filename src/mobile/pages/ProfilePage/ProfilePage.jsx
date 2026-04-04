import MobileNavBar from '../../components/MobileNavBar/MobileNavBar';
import { Settings, ChevronRight, Wallet, LogIn, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WORKS_MOCK = [
  { id: 1, title: '我的打地鼠', poster: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png', status: '已发布', likes: 87 },
  { id: 2, title: '太空冒险', poster: '/assets/custom/朋友们的游戏-游戏封面-迷宫冒险.png', status: '草稿', likes: 0 },
  { id: 3, title: '翻牌记忆', poster: '/assets/custom/朋友们的游戏-游戏封面-记忆翻牌.png', status: '已发布', likes: 234 },
];

// 精灵图切片 mock 数据（从精灵图编辑器保存过来的素材）
const SPRITE_ASSETS_MOCK = [
  { id: 's1', name: '角色行走动画', frames: 8, preview: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png', createdAt: '今天' },
  { id: 's2', name: '怪物攻击序列', frames: 6, preview: '/assets/custom/朋友们的游戏-游戏封面-坦克大战.png', createdAt: '昨天' },
];

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 'calc(var(--m-nav-height) + var(--m-safe-top))', paddingBottom: 'calc(var(--m-tab-height) + var(--m-safe-bottom))' },
  scroll: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  profileCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px var(--m-page-pad) 16px', gap: 8 },
  avatar: { width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', background: 'var(--bg-elevated)' },
  username: { fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' },
  bio: { fontSize: '0.8125rem', color: 'var(--text-secondary)', textAlign: 'center' },
  statsRow: { display: 'flex', justifyContent: 'center', gap: 32, padding: '0 0 16px', borderBottom: '1px solid var(--border-subtle)' },
  statCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statNum: { fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: '0.6875rem', color: 'var(--text-muted)' },
  tabs: { display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', padding: '0 var(--m-page-pad)' },
  tabBtn: { flex: 1, padding: '10px 0', border: 'none', background: 'none', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', textAlign: 'center', position: 'relative' },
  tabBtnActive: { color: 'var(--text-primary)', fontWeight: 600 },
  tabUnder: { position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, borderRadius: 1, background: 'var(--m-accent)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--m-card-gap)', padding: '12px var(--m-page-pad)' },
  workCard: { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--m-card-radius)', overflow: 'hidden', cursor: 'pointer' },
  workImg: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', background: 'var(--bg-elevated)' },
  workInfo: { padding: '8px 10px' },
  workTitle: { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  workStatus: { fontSize: '0.6875rem', marginTop: 3 },
  statusPublished: { color: 'var(--m-accent)' },
  statusDraft: { color: 'var(--text-muted)' },
  walletBtn: { display: 'flex', alignItems: 'center', gap: 10, margin: '12px var(--m-page-pad)', padding: '12px 14px', border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--bg-card)', cursor: 'pointer' },
  walletInfo: { flex: 1 },
  walletTitle: { fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' },
  walletAmount: { fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 1 },
  // 未登录状态
  loginCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '48px 32px', gap: 16,
  },
  loginEmoji: { fontSize: '3rem' },
  loginTitle: { fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' },
  loginDesc: { fontSize: '0.8125rem', color: 'var(--text-secondary)', textAlign: 'center' },
  loginBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '12px 32px', border: 'none', borderRadius: 'var(--radius-full)',
    background: 'var(--m-accent)', color: '#000',
    fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', fontWeight: 700,
    cursor: 'pointer',
  },
  // 素材区
  assetSection: { padding: '0 var(--m-page-pad) 12px' },
  assetTitle: { fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px' },
  assetCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)', borderRadius: 8,
    marginBottom: 6, cursor: 'pointer',
  },
  assetPreview: { width: 48, height: 48, borderRadius: 6, objectFit: 'cover', background: 'var(--bg-elevated)' },
  assetInfo: { flex: 1 },
  assetName: { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' },
  assetMeta: { fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 },
  editBtn: {
    padding: '4px 10px', border: '1px solid var(--border-default)', borderRadius: 4,
    background: 'none', color: 'var(--text-secondary)',
    fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', cursor: 'pointer',
  },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('works');
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('m_user'));
      setUser(saved);
    } catch { setUser(null); }
  }, []);

  const TABS = [
    { key: 'works', label: '作品' },
    { key: 'assets', label: '素材' },
    { key: 'fav', label: '收藏' },
    { key: 'liked', label: '喜欢' },
  ];

  const displayed = tab === 'works' ? WORKS_MOCK :
    tab === 'liked' ? WORKS_MOCK.filter(w => w.likes > 0) :
    tab === 'fav' ? WORKS_MOCK.slice(0, 2) :
    [];

  // 未登录状态
  if (!user) {
    return (
      <div style={s.page}>
        <MobileNavBar title="我的" />
        <div style={s.scroll}>
          <div style={s.loginCard}>
            <span style={s.loginEmoji}>🎮</span>
            <div style={s.loginTitle}>登录后解锁更多功能</div>
            <div style={s.loginDesc}>保存作品、关注创作者、参与社区互动</div>
            <button style={s.loginBtn} onClick={() => navigate('/m/login')}>
              <LogIn size={16} /> 登录 / 注册
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <MobileNavBar
        title="我的"
        rightContent={
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => navigate('/m/settings')}
          >
            <Settings size={18} />
          </button>
        }
      />

      <div style={s.scroll}>
        <div style={s.profileCard}>
          <div style={s.avatar}>{user.avatar || '🎨'}</div>
          <div style={s.username}>{user.name || '创作者'}</div>
          <div style={s.bio}>热爱用AI做小游戏的创作者</div>
        </div>

        <div style={s.statsRow}>
          <div style={s.statCol}><span style={s.statNum}>3</span><span style={s.statLabel}>作品</span></div>
          <div style={s.statCol}><span style={s.statNum}>234</span><span style={s.statLabel}>粉丝</span></div>
          <div style={s.statCol}><span style={s.statNum}>56</span><span style={s.statLabel}>关注</span></div>
        </div>

        <div style={s.tabs}>
          {TABS.map(t => (
            <button
              key={t.key}
              style={{ ...s.tabBtn, ...(tab === t.key ? s.tabBtnActive : {}) }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {tab === t.key && <span style={s.tabUnder} />}
            </button>
          ))}
        </div>

        {/* 作品/收藏/喜欢 网格 */}
        {tab !== 'assets' && (
          <div style={s.grid}>
            {displayed.map(w => (
              <div key={w.id} style={s.workCard}>
                <img src={w.poster} alt={w.title} style={s.workImg} loading="lazy" />
                <div style={s.workInfo}>
                  <div style={s.workTitle}>{w.title}</div>
                  <div style={{ ...s.workStatus, ...(w.status === '已发布' ? s.statusPublished : s.statusDraft) }}>
                    {w.status} {w.likes > 0 && `· ❤️ ${w.likes}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 素材Tab */}
        {tab === 'assets' && (
          <div style={s.assetSection}>
            <div style={s.assetTitle}>精灵图切片 ({SPRITE_ASSETS_MOCK.length})</div>
            {SPRITE_ASSETS_MOCK.map(a => (
              <div key={a.id} style={s.assetCard}>
                <img src={a.preview} alt={a.name} style={s.assetPreview} />
                <div style={s.assetInfo}>
                  <div style={s.assetName}>{a.name}</div>
                  <div style={s.assetMeta}>{a.frames}帧 · {a.createdAt}</div>
                </div>
                <button style={s.editBtn}><Pencil size={10} /> 编辑</button>
              </div>
            ))}
          </div>
        )}

        {/* 钱包入口 */}
        <div style={s.walletBtn}>
          <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,230,118,0.12)', color: '#00E676' }}>
            <Wallet size={18} />
          </div>
          <div style={s.walletInfo}>
            <div style={s.walletTitle}>创作者钱包</div>
            <div style={s.walletAmount}>余额: 1,000 积分</div>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </div>
  );
}
