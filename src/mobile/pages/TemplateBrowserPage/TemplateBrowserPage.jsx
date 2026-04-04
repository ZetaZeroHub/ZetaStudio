import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNavBar from '../../components/MobileNavBar/MobileNavBar';

const TEMPLATES = [
  {
    id: 'mazeAdventure', title: '横版闯关', desc: '经典马里奥式平台跳跃冒险',
    poster: '/assets/custom/游戏模板-游戏封面-平台跳跃.png',
    tags: ['2D', '动作'], difficulty: '中等',
  },
  {
    id: 'spaceShooter', title: '太空射击', desc: '自机移动射击，波次挑战',
    poster: '/assets/custom/游戏模板-游戏封面-太空射击.png',
    tags: ['2D', '射击'], difficulty: '中等',
  },
  {
    id: 'quiz', title: '知识竞赛', desc: '4选1答题，限时计分',
    poster: '/assets/custom/游戏模板-游戏封面-知识竞赛.png',
    tags: ['2D', '教育'], difficulty: '简单',
  },
  {
    id: 'npcDialogue', title: 'NPC剧情对话', desc: '交互式剧情体验',
    poster: '/assets/custom/游戏模板-游戏封面-NPC剧情对话.png',
    tags: ['2D', '剧情'], difficulty: '简单',
  },
  {
    id: 'mapEditor', title: '横版闯关(地图编辑器)', desc: '自定义地图+角色+敌人',
    poster: '/assets/custom/游戏模板-游戏封面-横版闯关（地图编辑器）.png',
    tags: ['2D', '创作'], difficulty: '高级',
  },
  {
    id: '3dSolar', title: '3D太阳系', desc: '探索3D行星系统',
    poster: '/assets/custom/游戏模板-游戏封面-3D太阳系.png',
    tags: ['3D', '教育'], difficulty: '中等',
  },
  {
    id: '3dFps', title: '3D第一人称射击', desc: '沉浸式FPS体验',
    poster: '/assets/custom/游戏模板-游戏封面-3D第一人称射击.png',
    tags: ['3D', '射击'], difficulty: '高级',
  },
];

const FILTER_TABS = [
  { key: 'all', label: '全部' },
  { key: '2D', label: '2D' },
  { key: '3D', label: '3D' },
  { key: '教育', label: '教育' },
  { key: '动作', label: '动作' },
];

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 'calc(var(--m-nav-height) + var(--m-safe-top))', paddingBottom: 'calc(var(--m-tab-height) + var(--m-safe-bottom))' },
  tabs: {
    display: 'flex', gap: 4, padding: '8px var(--m-page-pad) 6px',
    overflowX: 'auto', WebkitOverflowScrolling: 'touch',
  },
  tabBtn: {
    flexShrink: 0, padding: '5px 14px', border: 'none', background: 'none',
    color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)',
    fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
    borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    color: '#000', background: 'var(--m-accent)', fontWeight: 600,
  },
  scroll: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px var(--m-page-pad)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--m-card-gap)' },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--m-card-radius)', overflow: 'hidden', cursor: 'pointer',
  },
  cardImg: { width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block', background: 'var(--bg-elevated)' },
  cardBody: { padding: '10px 10px 12px' },
  cardTitle: { fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 },
  cardDesc: { fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tagRow: { display: 'flex', gap: 4, marginTop: 6 },
  tag: { fontSize: '0.5625rem', padding: '2px 6px', borderRadius: 3, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 500 },
  diffTag: { fontSize: '0.5625rem', padding: '2px 6px', borderRadius: 3, fontWeight: 600 },
  startBtn: {
    display: 'block', width: '100%', marginTop: 8, padding: '8px',
    border: '1px solid var(--m-accent)', borderRadius: 'var(--radius-md)',
    background: 'none', color: 'var(--m-accent)',
    fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600,
    cursor: 'pointer', textAlign: 'center',
  },
};

const diffColors = { '简单': '#22C55E', '中等': '#F59E0B', '高级': '#EF4444' };

export default function TemplateBrowserPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.tags.includes(filter));

  const handleStart = (tpl) => {
    const prompt = `我想用「${tpl.title}」模板创建一个游戏：${tpl.desc}`;
    navigate(`/m/ai-chat?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div style={s.page}>
      <MobileNavBar showBack title="游戏模板库" />

      <div style={s.tabs}>
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            style={{ ...s.tabBtn, ...(filter === t.key ? s.tabBtnActive : {}) }}
            onClick={() => setFilter(t.key)}
          >{t.label}</button>
        ))}
      </div>

      <div style={s.scroll}>
        <div style={s.grid}>
          {filtered.map(tpl => (
            <div key={tpl.id} style={s.card}>
              <img src={tpl.poster} alt={tpl.title} style={s.cardImg} loading="lazy" />
              <div style={s.cardBody}>
                <div style={s.cardTitle}>{tpl.title}</div>
                <div style={s.cardDesc}>{tpl.desc}</div>
                <div style={s.tagRow}>
                  {tpl.tags.map(tag => <span key={tag} style={s.tag}>{tag}</span>)}
                  <span style={{ ...s.diffTag, background: (diffColors[tpl.difficulty] || '#888') + '18', color: diffColors[tpl.difficulty] }}>
                    {tpl.difficulty}
                  </span>
                </div>
                <button style={s.startBtn} onClick={() => handleStart(tpl)}>使用此模板</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
