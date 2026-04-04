import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, MoreHorizontal } from 'lucide-react';
import MobileNavBar from '../../components/MobileNavBar/MobileNavBar';
import GameCard from '../../components/GameCard/GameCard';

const USER_DB = {
  u1: { name: '管理员', avatar: '👑', bio: '官方精选内容团队', followers: 5200, following: 12, works: [
    { id: 'featured-maze', title: '绿洲大冒险', poster: '/assets/custom/精选游戏-游戏封面-绿洲大冒险.jpeg', tag: '官方精选', author: '管理员', authorAvatar: '👑', likes: 2847, views: 15200 },
    { id: 'featured-duck', title: '小鸭子找水池', poster: '/assets/custom/精选游戏-游戏封面-小鸭子找水池.jpg', tag: '官方精选', author: '管理员', authorAvatar: '👑', likes: 1893, views: 9800 },
  ]},
  u2: { name: '小明同学', avatar: '🎯', bio: '热爱游戏开发的大学生', followers: 890, following: 45, works: [
    { id: 'featured-tank', title: '坦克小游戏', poster: '/assets/custom/朋友们的游戏-游戏封面-坦克大战.png', tag: '社区', author: '小明同学', authorAvatar: '🎯', likes: 1456, views: 7340 },
  ]},
  u3: { name: '游戏小王子', avatar: '🎈', bio: '每天摸鱼做小游戏', followers: 456, following: 88, works: [
    { id: 'featured-balloon', title: '打气球', poster: '/assets/custom/朋友们的游戏-游戏封面-气球射击.png', tag: '社区', author: '游戏小王子', authorAvatar: '🎈', likes: 980, views: 5200 },
  ]},
  u4: { name: '代码菜鸟', avatar: '🐣', bio: '今天也在努力写Bug', followers: 1230, following: 67, works: [
    { id: 'featured-tetris', title: '俄罗斯方块', poster: '/assets/custom/朋友们的游戏-游戏封面-俄罗斯方块.png', tag: '社区', author: '代码菜鸟', authorAvatar: '🐣', likes: 2103, views: 11400 },
  ]},
  u5: { name: '戴眼镜的爸爸', avatar: '👓', bio: '工程师+暖爸', followers: 678, following: 23, works: [
    { id: 'featured-memory', title: '记忆翻牌', poster: '/assets/custom/朋友们的游戏-游戏封面-记忆翻牌.png', tag: '社区', author: '戴眼镜的爸爸', authorAvatar: '👓', likes: 1324, views: 6900 },
  ]},
  u6: { name: 'AI玩家007', avatar: '🤖', bio: '让AI帮我做游戏', followers: 2100, following: 34, works: [
    { id: 'featured-whackmole', title: '打地鼠', poster: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png', tag: '社区', author: 'AI玩家007', authorAvatar: '🤖', likes: 1890, views: 10200 },
  ]},
  u7: { name: '妈妈程序员', avatar: '👩‍💻', bio: '给女儿做教育小游戏', followers: 3400, following: 56, works: [
    { id: 'featured-counting', title: '宝宝学数字', poster: '/assets/custom/朋友们的游戏-游戏封面-数数乐.png', tag: '教育', author: '妈妈程序员', authorAvatar: '👩‍💻', likes: 2340, views: 12800 },
  ]},
  u8: { name: '小游戏达人', avatar: '🎮', bio: '休闲游戏爱好者', followers: 345, following: 120, works: [
    { id: 'featured-fruitcatch', title: '接水果', poster: '/assets/custom/朋友们的游戏-游戏封面-接水果.png', tag: '社区', author: '小游戏达人', authorAvatar: '🎮', likes: 670, views: 3200 },
  ]},
};

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 'calc(var(--m-nav-height) + var(--m-safe-top))', paddingBottom: 'calc(var(--m-tab-height) + var(--m-safe-bottom))' },
  scroll: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px var(--m-page-pad) 16px', gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--bg-elevated)' },
  name: { fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' },
  bio: { fontSize: '0.8125rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 240 },
  stats: { display: 'flex', justifyContent: 'center', gap: 32, padding: '0 0 16px' },
  statCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statNum: { fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: '0.6875rem', color: 'var(--text-muted)' },
  btnRow: { display: 'flex', gap: 8, padding: '0 var(--m-page-pad) 16px', justifyContent: 'center' },
  followBtn: {
    padding: '9px 32px', border: 'none', borderRadius: 'var(--radius-full)',
    background: 'var(--m-accent)', color: '#000', fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
  },
  followBtnActive: {
    background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)',
  },
  msgBtn: {
    padding: '9px 20px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)',
    background: 'none', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem', cursor: 'pointer',
  },
  worksTitle: {
    padding: '12px var(--m-page-pad) 8px', fontFamily: 'var(--font-display)',
    fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)',
    borderTop: '1px solid var(--border-subtle)',
  },
  grid: { columnCount: 2, columnGap: 'var(--m-card-gap)', padding: '0 var(--m-page-pad) 16px' },
};

const fmt = n => n >= 10000 ? (n / 10000).toFixed(1) + 'w' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const user = USER_DB[userId] || USER_DB.u1;
  const [following, setFollowing] = useState(false);

  return (
    <div style={s.page}>
      <MobileNavBar
        showBack
        title={user.name}
        rightContent={
          <button style={{ background: 'none', border: 'none', color: 'var(--text-primary)', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MoreHorizontal size={18} />
          </button>
        }
      />
      <div style={s.scroll}>
        <div style={s.header}>
          <div style={s.avatar}>{user.avatar}</div>
          <div style={s.name}>{user.name}</div>
          <div style={s.bio}>{user.bio}</div>
        </div>

        <div style={s.stats}>
          <div style={s.statCol}><span style={s.statNum}>{user.works.length}</span><span style={s.statLabel}>作品</span></div>
          <div style={s.statCol}><span style={s.statNum}>{fmt(user.followers)}</span><span style={s.statLabel}>粉丝</span></div>
          <div style={s.statCol}><span style={s.statNum}>{user.following}</span><span style={s.statLabel}>关注</span></div>
        </div>

        <div style={s.btnRow}>
          <button
            style={{ ...s.followBtn, ...(following ? s.followBtnActive : {}) }}
            onClick={() => setFollowing(!following)}
          >{following ? '已关注' : '关注'}</button>
          <button style={s.msgBtn}>私信</button>
        </div>

        <div style={s.worksTitle}>Ta的作品 ({user.works.length})</div>
        <div style={s.grid}>
          {user.works.map(w => (
            <GameCard key={w.id} game={w} onClick={() => navigate(`/m/game/${w.id}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}
