import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';
import useEditorStore from '../../stores/editorStore';
import useI18nStore from '../../stores/i18nStore';
import { generateGameCode } from '../../services/aiService';
import styles from './AiPanel.module.css';

export default function AiPanel() {
  const [input, setInput] = useState('');
  const messagesRef = useRef(null);
  const { aiMessages, aiLoading, addAiMessage, setAiLoading, code, setCode, currentProject } = useEditorStore();
  const { t } = useI18nStore();

  const quickPrompts = [
    t('aiPanel.prompts.nightSky'),
    t('aiPanel.prompts.player'),
    t('aiPanel.prompts.enemies'),
    t('aiPanel.prompts.score'),
  ];

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  const handleSend = async (text) => {
    const prompt = text || input.trim();
    if (!prompt || aiLoading) return;
    setInput('');

    addAiMessage({ role: 'user', content: prompt });
    setAiLoading(true);

    try {
      const result = await generateGameCode(prompt, currentProject?.templateType);
      addAiMessage({ role: 'ai', content: result.message });

      if (result.code) {
        // Append generated code to existing code
        const newCode = code + '\n\n' + result.code;
        setCode(newCode);
        addAiMessage({
          role: 'system',
          content: t('aiPanel.codeUpdated'),
        });
      }
    } catch (e) {
      addAiMessage({ role: 'ai', content: t('aiPanel.generationFailed') + e.message });
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.aiPanel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <div className={styles.panelIcon}><Sparkles size={14} /></div>
          {t('aiPanel.title')}
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages} ref={messagesRef}>
        {aiMessages.length === 0 && (
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
            {msg.content}
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
            className={`input ${styles.textInput}`}
            placeholder={t('aiPanel.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={`btn btn-primary ${styles.sendBtn}`}
            onClick={() => handleSend()}
            disabled={aiLoading || !input.trim()}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className={styles.quickActions}>
          {quickPrompts.map((p) => (
            <button
              key={p}
              className={styles.quickBtn}
              onClick={() => handleSend(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
