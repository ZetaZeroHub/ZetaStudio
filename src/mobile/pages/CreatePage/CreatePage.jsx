import styles from './CreatePage.module.css';
import MobileNavBar from '../../components/MobileNavBar/MobileNavBar';
import {
  Sparkles, Mic, MicOff, ArrowRight, Image, Music, Smile, Palette,
  Zap, ChevronRight, Flame, LayoutTemplate, BookOpen,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PROMPT_CHIPS = [
  '做一个打地鼠游戏', '像素跳跃冒险', '太空射击大战',
  '知识问答挑战', '记忆翻牌游戏', '接水果小游戏',
  '迷宫大冒险', '涂色画板', '动物认知问答',
];

const ASSET_BTNS = [
  { icon: Image, label: '图片' },
  { icon: Music, label: '音效' },
  { icon: Smile, label: '素材' },
  { icon: Palette, label: '做图' },
];

const HOT_PROMPTS = [
  { title: '横版闯关冒险', hot: 2847, icon: '🏃' },
  { title: '金币竞速挑战', hot: 1563, icon: '💰' },
  { title: '打地鼠', hot: 1890, icon: '🎯' },
  { title: 'BOSS突袭战', hot: 980, icon: '⚔️' },
];

const TPL_PREVIEWS = [
  { id: 1, title: '横版闯关', poster: '/assets/custom/游戏模板-游戏封面-平台跳跃.png', tag: '2D' },
  { id: 2, title: '太空射击', poster: '/assets/custom/游戏模板-游戏封面-太空射击.png', tag: '2D' },
  { id: 3, title: '知识竞赛', poster: '/assets/custom/游戏模板-游戏封面-知识竞赛.png', tag: '2D' },
  { id: 4, title: '3D太阳系', poster: '/assets/custom/游戏模板-游戏封面-3D太阳系.png', tag: '3D' },
];

export default function CreatePage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    navigate(`/m/ai-chat?prompt=${encodeURIComponent(input.trim())}`);
  };

  const handleChipClick = (chip) => {
    navigate(`/m/ai-chat?prompt=${encodeURIComponent(chip)}`);
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'zh-CN';
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e) => {
      const text = Array.from(e.results).map(x => x[0].transcript).join('');
      setInput(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  return (
    <div className={styles.page}>
      <MobileNavBar
        brandMode
        rightContent={
          <div className={styles.coins}>
            <Zap size={14} />
            <span>1000</span>
          </div>
        }
      />

      <div className={styles.scroll}>
        {/* AI输入区 */}
        <div className={styles.inputSection}>
          <div className={styles.inputBox}>
            <textarea
              className={styles.aiInput}
              placeholder="告诉AI你想做什么游戏..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={4}
            />
            <div className={styles.inputActions}>
              <button
                className={styles.inspirBtn}
                onClick={() => navigate('/m/prompts')}
              >
                <Sparkles size={16} />
              </button>
              <div className={styles.inputActionsRight}>
                <button
                  className={`${styles.micBtn} ${listening ? styles.micBtnListening : ''}`}
                  onClick={toggleVoice}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button className={styles.sendBtn} disabled={!input.trim()} onClick={handleSend}>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 素材快捷栏 */}
        <div className={styles.assetBar}>
          {ASSET_BTNS.map(a => (
            <button key={a.label} className={styles.assetBtn}>
              <a.icon size={16} />
              <span>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Prompt灵感芯片 */}
        <div className={styles.chipSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>🔥 创作灵感</h3>
            <button className={styles.moreBtn} onClick={() => navigate('/m/prompts')}>
              更多 <ChevronRight size={14} />
            </button>
          </div>
          <div className={styles.chipGrid}>
            {PROMPT_CHIPS.map(chip => (
              <button
                key={chip}
                className={styles.chip}
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* 热门 Prompt 排行 */}
        <div className={styles.chipSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>🏆 热门排行</h3>
          </div>
          <div className={styles.hotList}>
            {HOT_PROMPTS.map((p, i) => (
              <button key={p.title} className={styles.hotItem} onClick={() => handleChipClick(p.title)}>
                <span className={styles.hotRank}>{i + 1}</span>
                <span className={styles.hotIcon}>{p.icon}</span>
                <span className={styles.hotTitle}>{p.title}</span>
                <span className={styles.hotCount}><Flame size={10} /> {p.hot}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 模板库入口 */}
        <div className={styles.chipSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>📦 游戏模板</h3>
            <button className={styles.moreBtn} onClick={() => navigate('/m/templates')}>
              全部 <ChevronRight size={14} />
            </button>
          </div>
          <div className={styles.tplScroll}>
            {TPL_PREVIEWS.map(tpl => (
              <div key={tpl.id} className={styles.tplCard} onClick={() => navigate('/m/templates')}>
                <img src={tpl.poster} alt={tpl.title} className={styles.tplImg} loading="lazy" />
                <div className={styles.tplInfo}>
                  <span className={styles.tplName}>{tpl.title}</span>
                  <span className={styles.tplTag}>{tpl.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
