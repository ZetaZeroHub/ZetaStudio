import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  X, Clock, Mic, MicOff, ThumbsUp, ThumbsDown,
  Image, Music, Shapes, PenTool, Gamepad2, Lightbulb,
  TrendingUp, Target, Rocket, Layers, Brain, Apple,
  Coins, Swords, User, Bot, Send, ChevronDown, Repeat2,
} from 'lucide-react';
import styles from './AiChatPage.module.css';
import useEditorStore from '../../../stores/editorStore';
import { getTemplate } from '../../../templates';
import GameCanvas from '../../../components/GameCanvas/GameCanvas';

/* ═══════════════════════════════════
   数据
   ═══════════════════════════════════ */

/* 模板名到 templateType 的映射 */
const TITLE_TO_TEMPLATE = {
  '超好玩的打地鼠': 'whackMole',
  '复刻经典俄罗斯方块': 'tetris',
  '午休做的打气球': 'balloonPop',
  '给女儿做的记忆翻牌': 'memoryCard',
  '打砖块小游戏': 'breakout',
  '接水果 v2': 'fruitCatch',
  '宝宝学数字': 'counting',
  '坦克小游戏': 'tankBattle',
};

const AI_REPLIES = [
  { trigger: '打地鼠', reply: '收到，正在构建 **打地鼠游戏** 方案\n\n— 9 个洞位，随机冒头\n— 30 秒倒计时 + 连击计分\n— 三档难度可选\n\n你偏好哪种视觉风格？', templateType: 'whackMole' },
  { trigger: '跳跃', reply: '方案确认：**像素跳跃冒险**\n\n— 左右移动 + 跳跃操作\n— 程序化生成平台\n— 金币收集 + 计分系统\n\n主角形象你有想法吗？', templateType: null },
  { trigger: '射击', reply: '正在构思 **太空射击** 方案\n\n— 自机底部移动射击\n— 敌机波次出现\n— 三种增强道具\n\n需要排行榜功能吗？', templateType: 'balloonPop' },
  { trigger: '问答', reply: '**知识问答挑战** 方案如下\n\n— 随机出题，四选一\n— 每题 15 秒倒计时\n— 连对 combo 加成\n\n题目类别你想选哪些？', templateType: 'animalQuiz' },
  { trigger: '记忆', reply: '**记忆翻牌** 方案已就绪\n\n— 4x4 共 8 对卡牌\n— 翻转动画 + 配对特效\n— 最少步数挑战模式\n\n卡面想用什么图案？', templateType: 'memoryCard' },
  { trigger: '水果', reply: '**接水果** 方案开始设计\n\n— 水果从顶部随机掉落\n— 篮子左右接住\n— 炸弹需要避开\n\n需要生命值系统吗？', templateType: 'fruitCatch' },
  { trigger: '俄罗斯方块', reply: '**俄罗斯方块** 经典复刻方案\n\n— 7 种标准方块\n— 旋转 + 硬降操作\n— 消行计分 + 加速\n\n要加主题换肤吗？', templateType: 'tetris' },
  { trigger: '打砖块', reply: '**打砖块** 方案如下\n\n— 弹球物理碰撞\n— 多色砖块耐久\n— 道具掉落\n\n需要多人模式吗？', templateType: 'breakout' },
  { trigger: '坦克', reply: '**坦克大战** 方案确认\n\n— 8 方向移动 + 射击\n— 地形遮挡系统\n— 敌方 AI 追踪\n\n画风偏好？', templateType: 'tankBattle' },
];
const DEFAULT_REPLY = '收到你的创意。我正在分析需求，很快给你一个可玩的初版。\n\n你可以继续补充：\n— 视觉风格偏好\n— 操作方式\n— 是否需要计分 / 排行榜';

function getAiReply(input) {
  const lower = input.toLowerCase();
  const match = AI_REPLIES.find(r => lower.includes(r.trigger));
  return match || { reply: DEFAULT_REPLY, templateType: null };
}

const COMMUNITY_TEMPLATES = [
  { id: 't1', title: '超好玩的打地鼠', poster: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png', author: 'AI玩家007', likes: 1890 },
  { id: 't2', title: '复刻经典俄罗斯方块', poster: '/assets/custom/朋友们的游戏-游戏封面-俄罗斯方块.png', author: '代码菜鸟', likes: 2103 },
  { id: 't3', title: '午休做的打气球', poster: '/assets/custom/朋友们的游戏-游戏封面-气球射击.png', author: '游戏小王子', likes: 980 },
  { id: 't4', title: '给女儿做的记忆翻牌', poster: '/assets/custom/朋友们的游戏-游戏封面-记忆翻牌.png', author: '戴眼镜的爸爸', likes: 1324 },
  { id: 't5', title: '打砖块小游戏', poster: '/assets/custom/朋友们的游戏-游戏封面-打砖块.png', author: '新手小白', likes: 756 },
  { id: 't6', title: '接水果 v2', poster: '/assets/custom/朋友们的游戏-游戏封面-接水果.png', author: '小游戏达人', likes: 670 },
  { id: 't7', title: '宝宝学数字', poster: '/assets/custom/朋友们的游戏-游戏封面-数数乐.png', author: '妈妈程序员', likes: 2340 },
  { id: 't8', title: '坦克小游戏', poster: '/assets/custom/朋友们的游戏-游戏封面-坦克大战.png', author: '小明同学', likes: 1456 },
];

const PROMPT_ICON_MAP = { p1: Target, p2: Target, p3: Rocket, p4: Layers, p5: Brain, p6: Apple, p7: Coins, p8: Swords };
const INSPIRATION_PROMPTS = [
  { id: 'p1', color: '#E8453C', title: '横版闯关冒险', hot: 2847,
    template: '做一个{style}风格的横版闯关游戏，主角可以{action}，有{collectible}收集和BOSS战',
    slots: { style: { label: '风格', options: ['像素', '卡通', '暗黑', '赛博'] }, action: { label: '动作', options: ['跳跃+射击', '三段跳', '滑行+攀爬', '飞行'] }, collectible: { label: '收集品', options: ['金币', '星星', '宝石', '钥匙'] } } },
  { id: 'p2', color: '#D97706', title: '打地鼠挑战', hot: 1890,
    template: '做一个{grid}宫格的打地鼠游戏，{time}秒限时，有{feature}',
    slots: { grid: { label: '宫格', options: ['3x3', '4x4', '5x5'] }, time: { label: '时间', options: ['30', '45', '60', '90'] }, feature: { label: '特色', options: ['连击加分', '黄金地鼠', '炸弹惩罚', '道具buff'] } } },
  { id: 'p3', color: '#2563EB', title: '太空射击大战', hot: 1100,
    template: '做一个太空射击游戏，{ship}是主角飞船，敌人是{enemy}，每{waves}波有BOSS',
    slots: { ship: { label: '飞船', options: ['战斗机', '宇宙飞艇', '外星飞碟', '喷气背包'] }, enemy: { label: '敌人', options: ['外星虫群', '机械军团', '陨石群', '暗黑势力'] }, waves: { label: '波次', options: ['3', '5', '7', '10'] } } },
  { id: 'p4', color: '#7C3AED', title: '记忆翻牌', hot: 1324,
    template: '做一个{size}格的记忆翻牌游戏，卡面用{face}，限制在{limit}内完成',
    slots: { size: { label: '格数', options: ['3x4', '4x4', '4x5', '5x6'] }, face: { label: '卡面', options: ['动物', '水果', '数字', '国旗'] }, limit: { label: '限制', options: ['60秒', '90秒', '30步', '无限'] } } },
  { id: 'p5', color: '#D97706', title: '知识问答', hot: 890,
    template: '做一个{category}类的知识问答，{mode}模式，每题{time}秒',
    slots: { category: { label: '类别', options: ['科学', '历史', '动漫', '地理', '混合'] }, mode: { label: '模式', options: ['4选1', '判断题', '填空', '看图猜'] }, time: { label: '限时', options: ['10', '15', '20', '30'] } } },
  { id: 'p6', color: '#059669', title: '接物小游戏', hot: 670,
    template: '做一个接{item}的小游戏，篮子{control}控制，有{danger}需要避开',
    slots: { item: { label: '物品', options: ['水果', '礼物', '雨滴', '星星'] }, control: { label: '操控', options: ['左右滑动', '重力感应', '触碰移动'] }, danger: { label: '危险物', options: ['炸弹', '仙人掌', '闪电', '毒蘑菇'] } } },
];

const ASSET_CHIPS = [
  { icon: Image, label: '图片' },
  { icon: Music, label: '音效' },
  { icon: Shapes, label: '素材' },
  { icon: PenTool, label: '绘制' },
];

const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

/* ═══════════════════════════════════
   组件
   ═══════════════════════════════════ */

export default function AiChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [mode, setMode] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [inspirationOn, setInspirationOn] = useState(false);
  const [slotSelections, setSlotSelections] = useState({});
  const [activeTemplateType, setActiveTemplateType] = useState(null);
  const [gameReady, setGameReady] = useState(false);
  const chatRef = useRef(null);
  const scrollRef = useRef(null);
  const galleryRef = useRef(null);
  const recognitionRef = useRef(null);
  const sentRef = useRef(false);

  useEffect(() => {
    if (initialPrompt && !sentRef.current) { sentRef.current = true; handleSend(initialPrompt); }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // 只在内容实际溢出时才自动滚底，避免消息少时被滚走
    if (el.scrollHeight > el.clientHeight) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing]);

  /* 初始化游戏引擎 — 当有 activeTemplateType 时 */
  useEffect(() => {
    if (!activeTemplateType) {
      setGameReady(false);
      return;
    }
    const template = getTemplate(activeTemplateType);
    if (template) {
      // 先清理旧的
      useEditorStore.getState().clearEditor?.();
      setGameReady(false);

      const project = {
        id: `preview_${activeTemplateType}_${Date.now()}`,
        name: `Preview: ${activeTemplateType}`,
        templateType: activeTemplateType,
        dimension: template.dimension || '2D',
        elements: [], code: '',
      };
      console.log('[AiChat] 初始化预览游戏:', activeTemplateType);
      useEditorStore.getState().initEditor(project, template);
      useEditorStore.setState({ mode: 'preview' });

      // 等 store 更新后标记就绪
      requestAnimationFrame(() => setGameReady(true));
    }
    return () => {
      useEditorStore.getState().clearEditor?.();
      setGameReady(false);
    };
  }, [activeTemplateType]);

  const handleToggle = () => {
    setInspirationOn(prev => !prev);
    requestAnimationFrame(() => {
      galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSend = useCallback((text, extra) => {
    const content = text || input.trim();
    if (!content) return;
    const userMsg = {
      id: Date.now(), role: 'user', content,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      ...(extra || {}),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setHasContent(true);
    setTyping(true);

    // 查找 Remix 的 templateType
    let resolvedTemplate = null;
    if (extra?.card) {
      resolvedTemplate = TITLE_TO_TEMPLATE[extra.card.title] || null;
    }

    setTimeout(() => {
      const result = getAiReply(content);
      const tType = resolvedTemplate || result.templateType;

      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai',
        content: result.reply,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        feedback: null,
      }]);
      setTyping(false);

      // 加载游戏到预览
      if (tType) {
        setActiveTemplateType(tType);
      }
    }, 800 + Math.random() * 1200);
  }, [input]);

  const handleRemix = (tpl) => {
    const card = { poster: tpl.poster, title: tpl.title, author: tpl.author, likes: tpl.likes };
    handleSend(`基于「${tpl.title}」进行 Remix，保留核心玩法并加入我的创意`, { card });
  };

  const handleFeedback = (msgId, type) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m));
  };

  const buildPromptFromTemplate = (prompt) => {
    const sel = slotSelections[prompt.id] || {};
    let text = prompt.template;
    for (const [key, slot] of Object.entries(prompt.slots)) {
      text = text.replace(`{${key}}`, sel[key] || slot.options[0]);
    }
    return text;
  };

  const handleSlotChange = (pid, key, val) => {
    setSlotSelections(prev => ({ ...prev, [pid]: { ...(prev[pid] || {}), [key]: val } }));
  };

  /* 灵感生成 → 关闭开关 + 弹回聊天 */
  const handleInspirationSend = (prompt) => {
    const text = buildPromptFromTemplate(prompt);
    setInspirationOn(false);
    handleSend(text);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const toggleVoice = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR(); r.lang = 'zh-CN'; r.continuous = false; r.interimResults = true;
    r.onresult = (e) => setInput(Array.from(e.results).map(x => x[0].transcript).join(''));
    r.onend = () => setListening(false); r.onerror = () => setListening(false);
    recognitionRef.current = r; r.start(); setListening(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <button className={styles.closeBtn} onClick={() => navigate(-1)} aria-label="返回"><X size={18} strokeWidth={2} /></button>
        <div className={styles.modeSwitch}>
          <button className={`${styles.modeTab} ${mode === 'chat' ? styles.modeTabActive : ''}`} onClick={() => setMode('chat')}>Chat</button>
          <button className={`${styles.modeTab} ${mode === 'preview' ? styles.modeTabActive : ''}`} onClick={() => setMode('preview')}>
            Preview{activeTemplateType ? ' ●' : ''}
          </button>
        </div>
        <div className={styles.topRight}>
          <button className={styles.historyBtn} aria-label="历史"><Clock size={15} /></button>
          <button className={styles.postBtn} disabled={!hasContent} onClick={() => setShowPublish(true)}>发布</button>
        </div>
      </header>

      <div className={styles.scrollBody} ref={scrollRef}>

        {/* 聊天区 */}
        {mode === 'chat' && (
          <div className={styles.chatArea} ref={chatRef}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <Gamepad2 size={36} strokeWidth={1.2} className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>描述你想做的游戏</p>
                <p className={styles.emptySub}>或选择下方社区模板开始 Remix</p>
                <ChevronDown size={16} className={styles.emptyArrow} />
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={styles.msgBlock}>
                <div className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : styles.msgRowAi}`}>
                  <div className={`${styles.msgAvatar} ${msg.role === 'user' ? styles.avatarUser : styles.avatarAi}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`${styles.msgBubble} ${msg.role === 'user' ? styles.msgBubbleUser : styles.msgBubbleAi}`}>
                    {msg.card && (
                      <div className={styles.remixCard}>
                        <img src={msg.card.poster} alt={msg.card.title} className={styles.remixImg} />
                        <div className={styles.remixInfo}>
                          <span className={styles.remixTitle}>{msg.card.title}</span>
                          <span className={styles.remixAuthor}>{msg.card.author}</span>
                        </div>
                        <Repeat2 size={14} className={styles.remixBadge} />
                      </div>
                    )}
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.startsWith('**') && line.endsWith('**')
                          ? <strong>{line.slice(2, -2)}</strong>
                          : line.startsWith('— ')
                            ? <span className={styles.listItem}>{line}</span>
                            : line}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
                {msg.role === 'ai' && (
                  <div className={styles.msgMeta}>
                    <span className={styles.msgTime}>{msg.time}</span>
                    <div className={styles.msgFeedback}>
                      <button className={`${styles.feedbackBtn} ${msg.feedback === 'up' ? styles.feedbackActive : ''}`} onClick={() => handleFeedback(msg.id, 'up')}><ThumbsUp size={11} /></button>
                      <button className={`${styles.feedbackBtn} ${msg.feedback === 'down' ? styles.feedbackActive : ''}`} onClick={() => handleFeedback(msg.id, 'down')}><ThumbsDown size={11} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className={`${styles.msgRow} ${styles.msgRowAi}`}>
                <div className={`${styles.msgAvatar} ${styles.avatarAi}`}><Bot size={14} /></div>
                <div className={styles.typing}><span /><span /><span /></div>
              </div>
            )}
          </div>
        )}

        {/* Preview — 实时游戏渲染 */}
        {mode === 'preview' && (
          <div className={styles.previewArea}>
            {activeTemplateType && gameReady ? (
              <div className={styles.previewCanvas}>
                <GameCanvas mode="preview" />
              </div>
            ) : (
              <div className={styles.previewEmpty}>
                <Gamepad2 size={28} strokeWidth={1.2} />
                <p>{activeTemplateType ? '游戏加载中...' : '在 Chat 中发送消息或 Remix 模板'}</p>
                <p className={styles.previewSub}>{activeTemplateType ? '请稍候' : '游戏将在此实时渲染'}</p>
              </div>
            )}
          </div>
        )}

        {/* 输入栏 */}
        <div className={styles.inputBar}>
          <div className={styles.templateStrip}>
            {COMMUNITY_TEMPLATES.map(tpl => (
              <div key={tpl.id} className={styles.stripCard} onClick={() => handleRemix(tpl)}>
                <img src={tpl.poster} alt={tpl.title} className={styles.stripImg} loading="lazy" />
                <div className={styles.stripOverlay}>
                  <Repeat2 size={10} />
                  <span>{tpl.title}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.switchRow}>
            <div className={`${styles.iosToggle} ${inspirationOn ? styles.iosToggleOn : ''}`} onClick={handleToggle} role="switch" aria-checked={inspirationOn}>
              <div className={styles.iosThumb}><Lightbulb size={13} strokeWidth={2} /></div>
            </div>
            <div className={styles.assetRow}>
              {ASSET_CHIPS.map(a => (
                <button key={a.label} className={styles.assetChip} aria-label={a.label}><a.icon size={13} strokeWidth={1.5} /><span>{a.label}</span></button>
              ))}
            </div>
          </div>
          <div className={styles.inputRow}>
            <textarea
              className={styles.chatInput}
              placeholder="描述你的游戏创意..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={1}
            />
            <div className={styles.inputBtns}>
              <button className={`${styles.iconBtn} ${listening ? styles.iconBtnDanger : ''}`} onClick={toggleVoice} aria-label="语音">
                {listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
              <button className={`${styles.iconBtn} ${styles.iconBtnPrimary}`} disabled={!input.trim()} onClick={() => handleSend()} aria-label="发送">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 灵感广场 */}
        {inspirationOn && (
          <section className={styles.galleryArea} ref={galleryRef}>
            <div className={styles.galleryHeader}>
              <Lightbulb size={14} strokeWidth={1.8} />
              <span className={styles.galleryLabel}>灵感广场</span>
              <span className={styles.galleryHint}>自定义关键词</span>
            </div>
            <div className={styles.inspirList}>
              {INSPIRATION_PROMPTS.map(p => {
                const Icon = PROMPT_ICON_MAP[p.id] || Target;
                return (
                  <div key={p.id} className={styles.inspirCard}>
                    <div className={styles.inspirHead}>
                      <div className={styles.inspirIcon} style={{ background: p.color + '14', color: p.color }}>
                        <Icon size={16} strokeWidth={1.8} />
                      </div>
                      <span className={styles.inspirTitle}>{p.title}</span>
                      <span className={styles.inspirHot}><TrendingUp size={10} /> {fmt(p.hot)}</span>
                    </div>
                    <div className={styles.slotRow}>
                      {Object.entries(p.slots).map(([key, slot]) => (
                        <div key={key} className={styles.slotGroup}>
                          <span className={styles.slotLabel}>{slot.label}</span>
                          <select className={styles.slotSelect} value={(slotSelections[p.id] || {})[key] || slot.options[0]} onChange={e => handleSlotChange(p.id, key, e.target.value)}>
                            {slot.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    <button className={styles.inspirUseBtn} onClick={() => handleInspirationSend(p)}>
                      <Send size={12} strokeWidth={2} /> 生成
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {showPublish && (
        <div className={styles.publishOverlay}>
          <div className={styles.publishCard}>
            <div className={styles.publishIcon}><Gamepad2 size={32} strokeWidth={1.5} /></div>
            <h3 className={styles.publishTitle}>发布成功</h3>
            <p className={styles.publishDesc}>你的游戏已发布到社区</p>
            <div className={styles.publishBtns}>
              <button className={styles.publishBtnSecondary} onClick={() => setShowPublish(false)}>继续编辑</button>
              <button className={styles.publishBtnPrimary} onClick={() => navigate('/m/')}>查看</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
