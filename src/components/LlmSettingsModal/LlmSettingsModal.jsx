/**
 * LlmSettingsModal — LLM供应商配置弹窗
 * 支持添加/编辑/删除/切换供应商，配置API Key，测试连接
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useLlmStore from '../../stores/llmStore';
import { testConnection } from '../../services/aiService';
import styles from './LlmSettingsModal.module.css';

export default function LlmSettingsModal({ open, onClose }) {
  const {
    providers, activeProviderId, activeModel,
    addProvider, updateProvider, removeProvider,
    setActiveProvider, setActiveModel,
  } = useLlmStore();

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', protocol: 'openai', apiBase: '', apiKey: '', models: '', defaultModel: '' });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const startAdd = () => {
    setEditingId('new');
    setForm({ name: '', protocol: 'openai', apiBase: '', apiKey: '', models: 'Qwen/Qwen2.5-7B-Instruct', defaultModel: 'Qwen/Qwen2.5-7B-Instruct' });
    setTestResult(null);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name, protocol: p.protocol, apiBase: p.apiBase,
      apiKey: p.apiKey, models: p.models.join(', '), defaultModel: p.defaultModel,
    });
    setTestResult(null);
  };

  const saveProvider = () => {
    const data = {
      name: form.name, protocol: form.protocol,
      apiBase: form.apiBase, apiKey: form.apiKey,
      models: form.models.split(',').map(m => m.trim()).filter(Boolean),
      defaultModel: form.defaultModel,
    };
    if (editingId === 'new') {
      const id = addProvider(data);
      setActiveProvider(id);
    } else {
      updateProvider(editingId, data);
    }
    setEditingId(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const r = await testConnection();
      setTestResult(r);
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    }
    setTesting(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <h3 className={styles.title}>⚙️ AI 模型配置</h3>

          {/* Provider list */}
          {providers.map(p => (
            <div key={p.id} className={`${styles.providerCard} ${p.id === activeProviderId ? styles.providerCardActive : ''}`}>
              <div className={styles.providerName}>{p.name}</div>
              <div className={styles.providerMeta}>
                {p.protocol} · {p.apiKey ? '🔑 已配置' : '⚠️ 未配置Key'}
              </div>
              <div className={styles.providerActions}>
                {p.id !== activeProviderId && (
                  <button className={`${styles.actionBtn} ${styles.selectBtn}`}
                    onClick={() => setActiveProvider(p.id)}>选用</button>
                )}
                <button className={`${styles.actionBtn} ${styles.testBtn}`}
                  onClick={() => { startEdit(p); }}>编辑</button>
                {providers.length > 1 && (
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => removeProvider(p.id)}>删除</button>
                )}
              </div>
            </div>
          ))}

          {/* Edit / Add form */}
          {editingId && (
            <>
              <div className={styles.divider} />
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>名称</label>
                <input className={styles.formInput} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="如: DeepSeek" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>协议</label>
                <select className={styles.formSelect} value={form.protocol}
                  onChange={e => setForm(f => ({ ...f, protocol: e.target.value }))}>
                  <option value="openai">OpenAI 兼容</option>
                  <option value="ollama">Ollama</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>API Base URL</label>
                <input className={styles.formInput} value={form.apiBase}
                  onChange={e => setForm(f => ({ ...f, apiBase: e.target.value }))}
                  placeholder="https://api.siliconflow.cn/v1" />
              </div>
              {form.protocol !== 'ollama' && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>API Key</label>
                  <input className={styles.formInput} type="password" value={form.apiKey}
                    onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                    placeholder="sk-xxx" />
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>模型（默认）</label>
                <input className={styles.formInput} value={form.defaultModel}
                  onChange={e => setForm(f => ({ ...f, defaultModel: e.target.value, models: e.target.value }))}
                  placeholder="Qwen/Qwen2.5-7B-Instruct" />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className={styles.addBtn} onClick={saveProvider}>
                  {editingId === 'new' ? '添加供应商' : '保存修改'}
                </button>
                <button className={`${styles.actionBtn} ${styles.testBtn}`}
                  style={{ padding: '10px 16px', fontSize: '0.82rem' }}
                  onClick={handleTest} disabled={testing}>
                  {testing ? '测试中...' : '测试连接'}
                </button>
              </div>

              {testResult && (
                <div className={`${styles.testResult} ${testResult.success ? styles.testSuccess : styles.testFail}`}>
                  {testResult.success ? `✅ 连接成功 — ${testResult.message}` : `❌ ${testResult.message}`}
                </div>
              )}
            </>
          )}

          {!editingId && (
            <button className={styles.addBtn} onClick={startAdd} style={{ marginTop: 10 }}>
              + 添加新供应商
            </button>
          )}

          {/* Model selector for active provider */}
          {!editingId && (
            <>
              <div className={styles.divider} />
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>当前模型</label>
                <input className={styles.formInput} value={activeModel}
                  onChange={e => setActiveModel(e.target.value)}
                  placeholder="模型名称" />
              </div>
            </>
          )}

          <button className={styles.closeBtn} onClick={onClose}>关闭</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
