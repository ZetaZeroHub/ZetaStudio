import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, ArrowUp, Settings, Zap, ClipboardList, Wrench, Code2, AlertCircle } from 'lucide-react';
import useEditorStore from '../../stores/editorStore';
import useGameDraftStore from '../../stores/gameDraftStore';
import useLlmStore from '../../stores/llmStore';
import useI18nStore from '../../stores/i18nStore';
import { generateGameCode } from '../../services/aiService';
import { createNewElement } from '../../stores/editorStore';
import styles from './AiPanel.module.css';

/* ── Mock Mode: set to true for demo, false to use real AI ── */
const MOCK_ENABLED = true;
const GRID = 32;

export default function AiPanel({ theme = 'maze', initialPrompt }) {
  const [input, setInput] = useState('');
  const messagesRef = useRef(null);
  const abortRef = useRef(null);
  const initialPromptSentRef = useRef(false);
  const {
    aiMessages, aiLoading, addAiMessage, setAiLoading,
    currentProject, elements, scripts,
    addElement, updateElement, removeElement,
  } = useEditorStore();
  const {
    aiMode, setAiMode, isConfigured, getActiveProvider,
    conversationHistory, addToHistory, clearHistory,
  } = useLlmStore();
  const { t } = useI18nStore();

  const configured = isConfigured();
  const activeProvider = getActiveProvider();

  const quickPrompts = [
    '👾 在玩家面前放置怪物',
    '⭐ 在玩家前方放置一些金币和小红心',
    '🌿 场景中随机布置一些草浮台以供平台跳跃',
  ];

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  // Execute tool calls from the AI response
  const executeToolCalls = useCallback((toolCalls) => {
    const results = [];
    for (const tc of toolCalls) {
      try {
        switch (tc.name) {
          case 'update_code': {
            const scriptName = tc.args.scriptName || 'main.js';
            const state = useEditorStore.getState();
            const script = state.scripts.find(s => s.name === scriptName) || state.scripts[0];
            if (script) {
              state.updateScript(script.id, { content: tc.args.code });
              results.push(`✅ 已更新脚本 "${script.name}"`);
            } else {
              results.push(`⚠️ 未找到脚本 "${scriptName}"`);
            }
            break;
          }
          case 'add_element': {
            const elType = tc.args.type || 'graphics';
            // Derive category from element type
            const SCENE_TYPES = ['background', 'tilingBg', 'particles'];
            const EVENT_TYPES = ['keyboardEvent', 'collisionRule', 'timerEvent', 'clickEvent'];
            const DATA_TYPES = ['variable', 'uiBinding'];
            let category = 'sprite';
            if (SCENE_TYPES.includes(elType)) category = 'scene';
            else if (EVENT_TYPES.includes(elType)) category = 'event';
            else if (DATA_TYPES.includes(elType)) category = 'data';

            // Map AI's flat properties to the nested structure expected by createNewElement
            const props = tc.args.properties || {};
            const overrides = { name: tc.args.name };
            // Build transform from flat properties
            if (props.x !== undefined || props.y !== undefined || props.width !== undefined || props.height !== undefined) {
              overrides.transform = {};
              if (props.x !== undefined) overrides.transform.x = props.x;
              if (props.y !== undefined) overrides.transform.y = props.y;
              if (props.width !== undefined) overrides.transform.width = props.width;
              if (props.height !== undefined) overrides.transform.height = props.height;
            }
            // Build style from flat properties
            if (props.fillColor || props.color || props.alpha !== undefined || props.shape) {
              overrides.style = {};
              if (props.fillColor) overrides.style.fillColor = props.fillColor;
              if (props.color) overrides.style.fillColor = props.color;
              if (props.alpha !== undefined) overrides.style.alpha = props.alpha;
              if (props.shape) overrides.style.shape = props.shape;
            }
            // Pass nested objects directly if AI already structured them
            if (props.transform) overrides.transform = { ...(overrides.transform || {}), ...props.transform };
            if (props.style) overrides.style = { ...(overrides.style || {}), ...props.style };
            if (props.textContent) overrides.textContent = props.textContent;

            const el = createNewElement(category, elType, overrides);
            useEditorStore.getState().addElement(el);
            results.push(`✅ 已添加元素 "${tc.args.name}" (${elType})`);
            break;
          }
          case 'update_element': {
            const state = useEditorStore.getState();
            const target = state.elements.find(e => e.name === tc.args.elementName);
            if (target) {
              state.updateElement(target.id, tc.args.updates);
              results.push(`✅ 已更新元素 "${tc.args.elementName}"`);
            } else {
              results.push(`⚠️ 未找到元素 "${tc.args.elementName}"`);
            }
            break;
          }
          case 'remove_element': {
            const state = useEditorStore.getState();
            const target = state.elements.find(e => e.name === tc.args.elementName);
            if (target) {
              state.removeElement(target.id);
              results.push(`✅ 已删除元素 "${tc.args.elementName}"`);
            } else {
              results.push(`⚠️ 未找到元素 "${tc.args.elementName}"`);
            }
            break;
          }
          default:
            results.push(`⚠️ 未知工具: ${tc.name}`);
        }
      } catch (err) {
        results.push(`❌ 执行 ${tc.name} 失败: ${err.message}`);
      }
    }
    return results;
  }, []);

  /* ── Mock AI handler ── */
  const handleMockSend = async (text) => {
    const prompt = text || input.trim();
    if (!prompt || aiLoading) return;
    setInput('');

    addAiMessage({ role: 'user', content: prompt });
    setAiLoading(true);

    // Fake thinking delay
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const store = useGameDraftStore.getState();
    const ld = store.currentDraft?.levelData;
    if (!ld) {
      addAiMessage({ role: 'ai', content: '❌ 未找到当前关卡数据' });
      setAiLoading(false);
      return;
    }

    const px = ld.playerStart?.x || 80;
    const py = ld.playerStart?.y || 300;
    const lowerPrompt = prompt.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, '');
    let aiResponse = '';
    let placed = [];

    if (lowerPrompt.includes('怪物') || lowerPrompt.includes('敌人')) {
      // Place 3 enemies in front of player — use actual AssetLoader enemy keys
      const enemies = [
        { x: px + 160, y: py, type: 'frog', enemyType: 'frog', tileId: 'frog' },
        { x: px + 320, y: py, type: 'ladybug', enemyType: 'ladybug', tileId: 'ladybug' },
        { x: px + 480, y: py - 64, type: 'bee', enemyType: 'bee', tileId: 'bee' },
      ];
      enemies.forEach(e => store.addEnemy(e));
      aiResponse = `好的！我已在玩家前方放置了 3 个怪物：\n\n🐸 **青蛙** (x:${enemies[0].x})\n🐞 **瓢虫** (x:${enemies[1].x})\n🐝 **蜜蜂** (x:${enemies[2].x})\n\n它们会在各自位置巡逻，玩家需要跳过或击败它们才能通过！`;
      placed = ['frog', 'ladybug', 'bee'];

    } else if (lowerPrompt.includes('金币') || lowerPrompt.includes('红心') || lowerPrompt.includes('奖励')) {
      // Place coins and hearts in front of player
      const items = [
        { x: px + 128 + 16, y: py - 64 + 16, type: 'coin', tileId: 'coin_gold' },
        { x: px + 224 + 16, y: py - 96 + 16, type: 'coin', tileId: 'coin_gold' },
        { x: px + 320 + 16, y: py - 64 + 16, type: 'coin', tileId: 'coin_gold' },
        { x: px + 416 + 16, y: py - 96 + 16, type: 'coin', tileId: 'coin_gold' },
        { x: px + 512 + 16, y: py - 64 + 16, type: 'coin', tileId: 'coin_gold' },
        { x: px + 256 + 16, y: py - 160 + 16, type: 'heart', tileId: 'hud_heart' },
        { x: px + 448 + 16, y: py - 160 + 16, type: 'heart', tileId: 'hud_heart' },
      ];
      items.forEach(it => store.addItem(it));
      aiResponse = `已完成！在玩家前方放置了：\n\n🪙 **5 枚金币** — 沿路线分布，高低交错\n❤️ **2 个红心** — 在上方较高位置\n\n金币会增加分数，红心可以恢复生命值！`;
      placed = ['coin x5', 'heart x2'];

    } else if (lowerPrompt.includes('浮台') || lowerPrompt.includes('平台') || lowerPrompt.includes('草')) {
      // Place floating platforms with randomized materials
      // EditorCanvas extracts material via tileId.replace(/_block.*|_cloud.*/, '')
      // then builds texture names like terrain_${mat}_block_top, so tileId should be e.g. 'grass_block'
      const materials = ['grass_block', 'sand_block', 'stone_block', 'snow_block', 'dirt_block', 'purple_block'];
      const pickMat = () => materials[Math.floor(Math.random() * materials.length)];
      const platforms = [
        { x: px + 192, y: py - 128, w: 96, tileId: pickMat() },
        { x: px + 384, y: py - 192, w: 128, tileId: pickMat() },
        { x: px + 576, y: py - 128, w: 96, tileId: pickMat() },
        { x: px + 768, y: py - 224, w: 128, tileId: pickMat() },
        { x: px + 960, y: py - 160, w: 96, tileId: pickMat() },
      ];
      platforms.forEach(p => store.addPlatform(p));
      aiResponse = `已完成！在场景中布置了 **5 个多彩浮台**：\n\n🌿 不同材质高度交错分布在玩家前方\n📐 位置: x=${platforms.map(p => p.x).join(', ')}\n🎨 材质: ${platforms.map(p => p.tileId.replace('_block', '')).join(', ')}\n\n玩家可以跳上这些浮台进行平台跳跃挑战！`;
      placed = ['platforms x5'];

    } else {
      // Generic mock response for any other prompt
      aiResponse = `收到你的指令："${prompt}"\n\n🤖 AI 正在学习如何处理这个请求...\n目前支持以下指令：\n- 放置怪物/敌人\n- 放置金币和红心\n- 布置草浮台\n\n请点击下方预设按钮试试！`;
    }

    addAiMessage({ role: 'ai', content: aiResponse });
    if (placed.length > 0) {
      addAiMessage({ role: 'system', content: `✅ 已在画布生成: ${placed.join(', ')}` });
    }
    console.log('[AiPanel Mock] Placed:', placed);
    setAiLoading(false);
  };

  /* ── Real AI handler (commented out for mock demo) ── */
  const handleSend = async (text) => {
    // [MOCK MODE] Route to mock handler
    if (MOCK_ENABLED) {
      return handleMockSend(text);
    }

    // ── Below is the real AI service call (preserved for production) ──
    const prompt = text || input.trim();
    if (!prompt || aiLoading) return;
    setInput('');

    if (!configured) {
      addAiMessage({ role: 'system', content: '⚠️ 请先点击右上角 ⚙️ 设置按钮配置 AI 模型的 API Key' });
      return;
    }

    addAiMessage({ role: 'user', content: prompt });
    addToHistory({ role: 'user', content: prompt });
    setAiLoading(true);

    abortRef.current = new AbortController();
    let streamContent = '';

    try {
      const dimension = currentProject?.dimension || '2D';
      const templateType = currentProject?.templateType || '';

      const result = await generateGameCode(prompt, {
        templateType,
        dimension,
        elements: useEditorStore.getState().elements,
        scripts: useEditorStore.getState().scripts,
        conversationHistory,
        signal: abortRef.current.signal,
        onChunk: (chunk) => {
          if (chunk.type === 'content') {
            streamContent = chunk.fullContent;
          }
        },
      });

      const responseText = result.message || result.rawContent || '(空响应)';
      addAiMessage({ role: 'ai', content: responseText });
      addToHistory({ role: 'assistant', content: result.rawContent || responseText });

      if (result.toolCalls && result.toolCalls.length > 0) {
        const toolResults = executeToolCalls(result.toolCalls);
        for (const tr of toolResults) {
          addAiMessage({ role: 'system', content: tr });
        }
      }

      if (!result.toolCalls?.length && result.code) {
        const state = useEditorStore.getState();
        const activeScript = state.scripts.find(s => s.id === state.activeScriptId) || state.scripts[0];
        if (activeScript) {
          state.updateScript(activeScript.id, { content: result.code });
          addAiMessage({ role: 'system', content: '✅ ' + t('aiPanel.codeUpdated') });
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        addAiMessage({ role: 'system', content: '⏹️ 已中止生成' });
      } else {
        addAiMessage({ role: 'ai', content: `❌ ${e.message}` });
      }
    } finally {
      setAiLoading(false);
      abortRef.current = null;
    }
  };

  // Auto-send initialPrompt from navigation state (e.g. from pro homepage)
  useEffect(() => {
    if (initialPrompt && !initialPromptSentRef.current) {
      initialPromptSentRef.current = true;
      const timer = setTimeout(() => {
        console.log('[AiPanel] Auto-sending initial prompt:', initialPrompt);
        handleSend(initialPrompt);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt]);

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    useEditorStore.getState().clearAiMessages();
    clearHistory();
  };

  // Simple markdown rendering for code blocks in messages
  const renderMessageContent = (content) => {
    if (!content) return null;

    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3);
        const firstNewline = lines.indexOf('\n');
        const code = firstNewline >= 0 ? lines.slice(firstNewline + 1) : lines;
        return (
          <pre key={i} className={styles.codeBlock}>
            <code>{code}</code>
          </pre>
        );
      }
      // Handle line breaks
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  return (
    <div className={`${styles.aiPanel} ${styles[`theme_${theme}`] || ''}`}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <div className={styles.panelIcon}><Sparkles size={14} /></div>
          {t('aiPanel.title')}
        </div>
        <div className={styles.headerRight}>
          {/* Mode Toggle */}
          <div className={styles.modeSwitch}>
            <button
              className={`${styles.modeSwitchBtn} ${aiMode === 'act' ? styles.modeSwitchBtnActive : ''}`}
              onClick={() => setAiMode('act')}
              title="Act: 直接执行代码修改"
            >
              <Zap size={11} /> Act
            </button>
            <button
              className={`${styles.modeSwitchBtn} ${aiMode === 'plan' ? styles.modeSwitchBtnActive : ''}`}
              onClick={() => setAiMode('plan')}
              title="Plan: 先规划再执行"
            >
              <ClipboardList size={11} /> Plan
            </button>
          </div>
          {aiMessages.length > 0 && (
            <button className={styles.clearBtn} onClick={handleClearChat} title="清除对话">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Model Info Bar */}
      {configured && activeProvider && (
        <div className={styles.modelBar}>
          <span className={styles.modelName}>
            {useLlmStore.getState().activeModel}
          </span>
          <span className={styles.modelProvider}>{activeProvider.name}</span>
        </div>
      )}

      {/* Messages */}
      <div className={styles.messages} ref={messagesRef}>
        {!MOCK_ENABLED && !configured && (
          <div className={styles.configWarning}>
            <AlertCircle size={16} />
            <div>
              <strong>未配置 AI 模型</strong>
              <p>请点击右上角 ⚙️ 设置按钮，配置 API Key 后即可使用 AI 助手。</p>
            </div>
          </div>
        )}

        {(MOCK_ENABLED || configured) && aiMessages.length === 0 && (
          <div className={styles.systemMessage}>
            {MOCK_ENABLED ? '🤖 AI 关卡设计助手已就绪！点击下方预设按钮或输入指令来生成关卡内容。' : t('aiPanel.welcome')}
          </div>
        )}

        {aiMessages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.message} ${
              msg.role === 'user' ? styles.userMessage :
              msg.role === 'ai' ? styles.aiMessage :
              styles.systemMessage
            }`}
          >
            {msg.role === 'ai' ? (
              <div className={styles.aiMessageContent}>
                {renderMessageContent(msg.content)}
              </div>
            ) : (
              msg.content
            )}
          </div>
        ))}

        {aiLoading && (
          <div className={styles.loadingDots}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.quickActions}>
          {quickPrompts.map((p) => (
            <button
              key={p}
              className={styles.quickBtn}
              onClick={() => handleSend(p)}
              disabled={!MOCK_ENABLED && !configured}
            >
              {p}
            </button>
          ))}
        </div>
        <div className={styles.inputRow}>
          <textarea
            className={styles.textInput}
            placeholder={(MOCK_ENABLED || configured) ? '描述你想要的关卡修改...' : '请先配置 AI 模型...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={!MOCK_ENABLED && !configured}
          />
          {aiLoading ? (
            <button
             className={styles.stopBtn}
              onClick={handleStop}
            >
              ⏹
            </button>
          ) : (
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={aiLoading || !input.trim() || (!MOCK_ENABLED && !configured)}
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
