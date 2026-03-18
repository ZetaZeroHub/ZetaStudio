import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, ArrowUp, Settings, Zap, ClipboardList, Wrench, Code2, AlertCircle } from 'lucide-react';
import useEditorStore from '../../stores/editorStore';
import useLlmStore from '../../stores/llmStore';
import useI18nStore from '../../stores/i18nStore';
import { generateGameCode } from '../../services/aiService';
import { createNewElement } from '../../stores/editorStore';
import styles from './AiPanel.module.css';

export default function AiPanel() {
  const [input, setInput] = useState('');
  const messagesRef = useRef(null);
  const abortRef = useRef(null);
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
    '🏰 帮我在森林关卡的中间增加3个悬浮平台',
    '👾 在第一关添加2个巡逻的史莱姆敌人',
    '⭐ 在高处平台上放置金币和宝石奖励',
    '🚪 把出口门移到地图最右上角的悬崖上',
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

  const handleSend = async (text) => {
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

    // Create abort controller
    abortRef.current = new AbortController();

    // Streaming content state
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

      // Add the AI response message
      const responseText = result.message || result.rawContent || '(空响应)';
      addAiMessage({ role: 'ai', content: responseText });
      addToHistory({ role: 'assistant', content: result.rawContent || responseText });

      // Handle tool calls
      if (result.toolCalls && result.toolCalls.length > 0) {
        const toolResults = executeToolCalls(result.toolCalls);
        for (const tr of toolResults) {
          addAiMessage({ role: 'system', content: tr });
        }
      }

      // Handle inline code (fallback when model doesn't use tools)
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
    <div className={styles.aiPanel}>
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
        {!configured && (
          <div className={styles.configWarning}>
            <AlertCircle size={16} />
            <div>
              <strong>未配置 AI 模型</strong>
              <p>请点击右上角 ⚙️ 设置按钮，配置 API Key 后即可使用 AI 助手。</p>
            </div>
          </div>
        )}

        {configured && aiMessages.length === 0 && (
          <div className={styles.systemMessage}>
            {t('aiPanel.welcome')}
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
        <div className={styles.inputRow}>
          <textarea
            className={styles.textInput}
            placeholder={configured ? '描述你想要的关卡修改...' : '请先配置 AI 模型...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={!configured}
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
              disabled={aiLoading || !input.trim() || !configured}
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <div className={styles.quickActions}>
          {quickPrompts.map((p) => (
            <button
              key={p}
              className={styles.quickBtn}
              onClick={() => handleSend(p)}
              disabled={!configured}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
