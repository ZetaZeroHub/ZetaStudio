import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Zap, Star, Trophy, Leaf, ArrowRight } from 'lucide-react';
import MobileNavBar from '../../components/MobileNavBar/MobileNavBar';

/* ── Prompt 模板数据 (简化版，复用PC端核心) ── */
const PROMPTS = [
  {
    id: 'platformer',
    title: '横版闯关冒险',
    desc: '马里奥式闯关，三段跳+射击+收金币+BOSS战',
    hot: 2847, tag: '最受欢迎', icon: '🏃', color: '#FF6B6B',
    prompt: '我要做一个类似马里奥的横版闯关冒险游戏，主角可以跳跃和射击，有金币收集和BOSS战',
  },
  {
    id: 'coin-speedrun',
    title: '金币竞速挑战',
    desc: '限时收集金币，纯跳跃+计分，无敌人',
    hot: 1563, tag: '热门', icon: '💰', color: '#FFD93D',
    prompt: '做一个限时金币收集竞速游戏，没有敌人，纯平台跳跃挑战，90秒内收集尽量多的金币',
  },
  {
    id: 'obstacle',
    title: '平台跳跃障碍赛',
    desc: '浮台间隙跳跃，宝石奖励+计步挑战',
    hot: 1204, tag: '精选', icon: '🎪', color: '#6BCB77',
    prompt: '设计一个纯平台跳跃障碍赛，大量间隙需要跳跃通过，高处有宝石奖励',
  },
  {
    id: 'boss-rush',
    title: 'BOSS 突袭战',
    desc: '竞技场BOSS战，多种攻击模式+道具辅助',
    hot: 980, tag: '挑战', icon: '⚔️', color: '#E74C3C',
    prompt: '设计一个BOSS突袭战，开场即为空旷竞技场，BOSS有多种攻击模式，场地有弹簧和回血道具',
  },
  {
    id: 'garden',
    title: '探索采集花园',
    desc: '开放式探索，多种收集品+隐藏区域',
    hot: 756, tag: '休闲', icon: '🌺', color: '#A8E6CF',
    prompt: '设计一个开放式探索花园，主打探索和收集，有金币宝石星星钥匙等多种收集品',
  },
  {
    id: 'whack-mole',
    title: '打地鼠',
    desc: '经典打地鼠，限时+连击+多难度',
    hot: 1890, tag: '热门', icon: '🎯', color: '#FF8C00',
    prompt: '做一个打地鼠游戏，9个洞位随机冒头，30秒限时，有连击加分和三种难度',
  },
  {
    id: 'memory-card',
    title: '记忆翻牌',
    desc: '4x4记忆配对，翻转动画+最少步数挑战',
    hot: 1324, tag: '教育', icon: '🃏', color: '#9B59B6',
    prompt: '做一个记忆翻牌游戏，4x4共8对卡牌，有翻转动画和配对成功特效，最少步数挑战',
  },
  {
    id: 'fruit-catch',
    title: '接水果',
    desc: '水果掉落接住+炸弹闪避+难度递增',
    hot: 670, tag: '休闲', icon: '🍎', color: '#2ECC71',
    prompt: '做一个接水果小游戏，水果从顶部随机掉落，篮子左右移动接住，有炸弹要避开',
  },
  {
    id: 'space-shooter',
    title: '太空射击',
    desc: '自机移动射击，波次敌机+Power-up+Boss',
    hot: 1100, tag: '动作', icon: '🚀', color: '#3498DB',
    prompt: '做一个太空射击大战，自机在底部左右移动射击，敌机从上方波次出现，每5波有BOSS',
  },
  {
    id: 'quiz',
    title: '知识问答',
    desc: '多选题模式，限时+连对combo+分类题库',
    hot: 890, tag: '教育', icon: '🧠', color: '#F39C12',
    prompt: '做一个知识问答挑战，4选1答题，每题15秒倒计时，答对加分连对有combo加成',
  },
];

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 'calc(var(--m-nav-height) + var(--m-safe-top))', paddingBottom: 'calc(var(--m-tab-height) + var(--m-safe-bottom))' },
  scroll: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 0' },
  subtitle: { padding: '0 var(--m-page-pad) 10px', fontSize: '0.75rem', color: 'var(--text-muted)' },
  list: { display: 'flex', flexDirection: 'column', gap: 8, padding: '0 var(--m-page-pad)' },
  card: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 14px', background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--m-card-radius)',
    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
    transition: 'transform 80ms ease',
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.25rem', flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  title: { fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 },
  desc: { fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  tag: { fontSize: '0.5625rem', fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: 'var(--m-accent-glow)', color: 'var(--m-accent)' },
  hot: { display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.6875rem', color: 'var(--text-muted)' },
  arrow: { color: 'var(--text-muted)' },
};

export default function PromptGalleryPage() {
  const navigate = useNavigate();

  const handleSelect = (p) => {
    navigate(`/m/ai-chat?prompt=${encodeURIComponent(p.prompt)}`);
  };

  return (
    <div style={s.page}>
      <MobileNavBar showBack title="Prompt 灵感广场" />
      <div style={s.scroll}>
        <p style={s.subtitle}>选择一个模板，AI 帮你快速生成游戏 ✨</p>
        <div style={s.list}>
          {PROMPTS.map(p => (
            <div key={p.id} style={s.card} onClick={() => handleSelect(p)}>
              <div style={{ ...s.iconWrap, background: p.color + '18' }}>{p.icon}</div>
              <div style={s.info}>
                <div style={s.title}>{p.title}</div>
                <div style={s.desc}>{p.desc}</div>
              </div>
              <div style={s.right}>
                <span style={s.tag}>{p.tag}</span>
                <span style={s.hot}><Flame size={10} /> {p.hot}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
