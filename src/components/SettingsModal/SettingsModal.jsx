import { useState, useEffect } from 'react';
import {
  Settings, Plus, Trash2, TestTube2, CheckCircle2, XCircle, X,
  Wrench, Plug, Sparkles, ToggleLeft, ToggleRight, RefreshCw,
  Link2, Unlink, Eye, EyeOff, Pencil, Save
} from 'lucide-react';
import useLlmStore from '../../stores/llmStore';
import useToolStore from '../../stores/toolStore';
import { useMcpStore, connectMcpServer, disconnectMcpServer } from '../../services/mcpService';
import { useSkillStore } from '../../services/skillsService';
import { testConnection } from '../../services/aiService';
import styles from './SettingsModal.module.css';

const PROTOCOL_OPTIONS = [
  { value: 'openai', label: 'OpenAI 兼容协议' },
  { value: 'ollama', label: 'Ollama 本地' },
];

const PRESET_PROVIDERS = [
  { name: '硅基流动 SiliconFlow', protocol: 'openai', apiBase: 'https://api.siliconflow.cn/v1', models: ['Qwen/Qwen2.5-7B-Instruct', 'Qwen/Qwen2.5-72B-Instruct', 'deepseek-ai/DeepSeek-V3'], defaultModel: 'Qwen/Qwen2.5-7B-Instruct' },
  { name: 'OpenAI', protocol: 'openai', apiBase: 'https://api.openai.com/v1', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'], defaultModel: 'gpt-4o-mini' },
  { name: 'DeepSeek', protocol: 'openai', apiBase: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-coder'], defaultModel: 'deepseek-chat' },
  { name: 'Ollama 本地', protocol: 'ollama', apiBase: 'http://localhost:11434', models: ['qwen2.5:7b', 'llama3:8b', 'codellama:7b'], defaultModel: 'qwen2.5:7b' },
];

const TABS = [
  { id: 'model', label: '模型', icon: <Settings size={14} /> },
  { id: 'tools', label: '工具', icon: <Wrench size={14} /> },
  { id: 'mcp', label: 'MCP', icon: <Plug size={14} /> },
  { id: 'skills', label: 'Skills', icon: <Sparkles size={14} /> },
];

export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('model');

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Settings size={18} />
            <span>AI 设置</span>
          </div>
          <div className={styles.tabBar}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'model' && <ModelTab />}
          {activeTab === 'tools' && <ToolsTab />}
          {activeTab === 'mcp' && <McpTab />}
          {activeTab === 'skills' && <SkillsTab />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Tab 1: Model Configuration
// ═══════════════════════════════════════════
function ModelTab() {
  const {
    providers, activeProviderId, activeModel, aiMode,
    addProvider, updateProvider, removeProvider,
    setActiveProvider, setActiveModel, setAiMode,
  } = useLlmStore();
  const [selectedId, setSelectedId] = useState(activeProviderId);
  const [testStatus, setTestStatus] = useState(null);
  const [testMessage, setTestMessage] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const selectedProvider = providers.find(p => p.id === selectedId);

  const handleFieldChange = (field, value) => {
    if (!selectedId) return;
    updateProvider(selectedId, { [field]: value });
  };

  const handleModelInputChange = (value) => {
    const models = value.split(',').map(m => m.trim()).filter(Boolean);
    updateProvider(selectedId, { models, defaultModel: models[0] || '' });
    if (selectedId === activeProviderId) setActiveModel(models[0] || '');
  };

  const handleAddPreset = (preset) => {
    const id = addProvider(preset);
    setSelectedId(id);
    setShowPresets(false);
  };

  const handleAddCustom = () => {
    const id = addProvider({ name: '自定义供应商', protocol: 'openai', apiBase: '', apiKey: '', models: [], defaultModel: '' });
    setSelectedId(id);
  };

  const handleDelete = (id) => {
    if (providers.length <= 1) return;
    removeProvider(id);
    if (selectedId === id) setSelectedId(providers.find(p => p.id !== id)?.id || '');
  };

  const handleSetActive = () => {
    if (!selectedId) return;
    setActiveProvider(selectedId);
    const provider = providers.find(p => p.id === selectedId);
    if (provider) setActiveModel(provider.defaultModel || provider.models[0] || '');
  };

  const handleTest = async () => {
    handleSetActive();
    setTestStatus('testing');
    setTestMessage('正在测试连接...');
    await new Promise(r => setTimeout(r, 100));
    const result = await testConnection();
    setTestStatus(result.success ? 'success' : 'error');
    setTestMessage(result.success ? `✅ 连接成功！(${result.model})` : `❌ ${result.message}`);
    setTimeout(() => setTestStatus(null), 5000);
  };

  return (
    <div className={styles.body}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>供应商列表</div>
        <div className={styles.providerList}>
          {providers.map(p => (
            <div key={p.id} className={`${styles.providerItem} ${selectedId === p.id ? styles.providerItemActive : ''}`} onClick={() => setSelectedId(p.id)}>
              <div className={styles.providerName}>
                {p.name}
                {p.id === activeProviderId && <span className={styles.activeBadge}>当前</span>}
              </div>
              <div className={styles.providerProtocol}>{p.protocol}</div>
            </div>
          ))}
        </div>
        <div className={styles.sidebarActions}>
          <button className={styles.addBtn} onClick={() => setShowPresets(!showPresets)}><Plus size={14} /> 添加预设</button>
          <button className={styles.addBtn} onClick={handleAddCustom}><Plus size={14} /> 自定义</button>
        </div>
        {showPresets && (
          <div className={styles.presetsDropdown}>
            {PRESET_PROVIDERS.map((preset, i) => (
              <button key={i} className={styles.presetItem} onClick={() => handleAddPreset(preset)}>
                <span>{preset.name}</span>
                <span className={styles.presetProtocol}>{preset.protocol}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.editor}>
        {selectedProvider ? (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>供应商名称</label>
              <input className={`input ${styles.input}`} value={selectedProvider.name} onChange={e => handleFieldChange('name', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>协议</label>
              <select className={`input ${styles.select}`} value={selectedProvider.protocol} onChange={e => handleFieldChange('protocol', e.target.value)}>
                {PROTOCOL_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>API Base URL</label>
              <input className={`input ${styles.input}`} value={selectedProvider.apiBase} onChange={e => handleFieldChange('apiBase', e.target.value)} placeholder={selectedProvider.protocol === 'ollama' ? 'http://localhost:11434' : 'https://api.example.com/v1'} />
            </div>
            {selectedProvider.protocol !== 'ollama' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>API Key</label>
                <input type="password" className={`input ${styles.input}`} value={selectedProvider.apiKey} onChange={e => handleFieldChange('apiKey', e.target.value)} placeholder="sk-..." />
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label}>模型 <span className={styles.labelHint}>(逗号分隔多个)</span></label>
              <input className={`input ${styles.input}`} value={selectedProvider.models.join(', ')} onChange={e => handleModelInputChange(e.target.value)} placeholder="Qwen/Qwen2.5-7B-Instruct" />
            </div>
            {selectedProvider.models.length > 1 && (
              <div className={styles.formGroup}>
                <label className={styles.label}>选择模型</label>
                <select className={`input ${styles.select}`} value={selectedId === activeProviderId ? activeModel : (selectedProvider.defaultModel || '')} onChange={e => { handleFieldChange('defaultModel', e.target.value); if (selectedId === activeProviderId) setActiveModel(e.target.value); }}>
                  {selectedProvider.models.map(m => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label}>AI 模式</label>
              <div className={styles.modeToggle}>
                <button className={`${styles.modeBtn} ${aiMode === 'act' ? styles.modeBtnActive : ''}`} onClick={() => setAiMode('act')}>⚡ Act 执行</button>
                <button className={`${styles.modeBtn} ${aiMode === 'plan' ? styles.modeBtnActive : ''}`} onClick={() => setAiMode('plan')}>📋 Plan 规划</button>
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={`btn btn-primary ${styles.actionBtn}`} onClick={handleSetActive} disabled={selectedId === activeProviderId}>{selectedId === activeProviderId ? '✅ 已启用' : '启用此供应商'}</button>
              <button className={`btn btn-secondary ${styles.actionBtn}`} onClick={handleTest} disabled={testStatus === 'testing'}><TestTube2 size={14} />{testStatus === 'testing' ? '测试中...' : '测试连接'}</button>
              {providers.length > 1 && (<button className={`btn btn-ghost ${styles.deleteBtn}`} onClick={() => handleDelete(selectedId)}><Trash2 size={14} /> 删除</button>)}
            </div>
            {testStatus && testStatus !== 'testing' && (
              <div className={`${styles.testResult} ${testStatus === 'success' ? styles.testSuccess : styles.testError}`}>
                {testStatus === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                <span>{testMessage}</span>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyEditor}><p>选择或添加一个供应商来配置 AI 模型</p></div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Tab 2: Tools Management
// ═══════════════════════════════════════════
function ToolsTab() {
  const { tools, toggleTool, removeTool, addTool } = useToolStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTool, setNewTool] = useState({ name: '', displayName: '', description: '', parametersJson: '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}' });

  const handleAddTool = () => {
    try {
      const params = JSON.parse(newTool.parametersJson);
      addTool({
        name: newTool.name,
        displayName: newTool.displayName || newTool.name,
        description: newTool.description,
        source: 'custom',
        parameters: params,
      });
      setNewTool({ name: '', displayName: '', description: '', parametersJson: '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}' });
      setShowAddForm(false);
    } catch (e) {
      alert('参数 JSON 格式错误: ' + e.message);
    }
  };

  const sourceLabel = (source) => {
    if (source === 'builtin') return '内置';
    if (source === 'custom') return '自定义';
    if (source?.startsWith('mcp:')) return 'MCP';
    if (source?.startsWith('skill:')) return 'Skill';
    return source;
  };

  return (
    <div className={styles.listPanel}>
      <div className={styles.listHeader}>
        <span>已注册工具 ({tools.length})</span>
        <button className={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}><Plus size={14} /> 自定义工具</button>
      </div>

      {showAddForm && (
        <div className={styles.inlineForm}>
          <input className={`input ${styles.input}`} placeholder="工具名称 (如 search_web)" value={newTool.name} onChange={e => setNewTool({...newTool, name: e.target.value})} />
          <input className={`input ${styles.input}`} placeholder="显示名称" value={newTool.displayName} onChange={e => setNewTool({...newTool, displayName: e.target.value})} />
          <input className={`input ${styles.input}`} placeholder="描述" value={newTool.description} onChange={e => setNewTool({...newTool, description: e.target.value})} />
          <textarea className={`input ${styles.textarea}`} placeholder="参数 JSON Schema" value={newTool.parametersJson} onChange={e => setNewTool({...newTool, parametersJson: e.target.value})} rows={4} />
          <div className={styles.inlineFormActions}>
            <button className="btn btn-primary btn-sm" onClick={handleAddTool} disabled={!newTool.name}>添加</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>取消</button>
          </div>
        </div>
      )}

      <div className={styles.toolList}>
        {tools.map(tool => (
          <div key={tool.id} className={styles.toolItem}>
            <div className={styles.toolInfo}>
              <div className={styles.toolName}>
                <Wrench size={12} />
                <code>{tool.name}</code>
                <span className={styles.sourceTag}>{sourceLabel(tool.source)}</span>
              </div>
              <div className={styles.toolDesc}>{tool.description}</div>
            </div>
            <div className={styles.toolActions}>
              <button className={styles.toggleBtn} onClick={() => toggleTool(tool.id)} title={tool.enabled ? '禁用' : '启用'}>
                {tool.enabled ? <ToggleRight size={20} className={styles.toggleOn} /> : <ToggleLeft size={20} className={styles.toggleOff} />}
              </button>
              {tool.deletable && (
                <button className={styles.iconBtn} onClick={() => removeTool(tool.id)} title="删除">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Tab 3: MCP Server Management
// ═══════════════════════════════════════════
function McpTab() {
  const { servers, addServer, removeServer, updateServer } = useMcpStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', url: '' });
  const [connectingId, setConnectingId] = useState(null);

  const handleAdd = () => {
    if (!newServer.url) return;
    addServer(newServer);
    setNewServer({ name: '', url: '' });
    setShowAddForm(false);
  };

  const handleConnect = async (id) => {
    setConnectingId(id);
    try {
      await connectMcpServer(id);
    } catch (e) {
      // Error already handled in mcpService
    }
    setConnectingId(null);
  };

  const handleDisconnect = (id) => {
    disconnectMcpServer(id);
  };

  const statusColor = (status) => {
    if (status === 'connected') return '#10b981';
    if (status === 'error') return '#ef4444';
    if (status === 'connecting') return '#eab308';
    return '#6b7280';
  };

  return (
    <div className={styles.listPanel}>
      <div className={styles.listHeader}>
        <span>MCP 服务器 ({servers.length})</span>
        <button className={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}><Plus size={14} /> 添加服务器</button>
      </div>

      {showAddForm && (
        <div className={styles.inlineForm}>
          <input className={`input ${styles.input}`} placeholder="服务器名称" value={newServer.name} onChange={e => setNewServer({...newServer, name: e.target.value})} />
          <input className={`input ${styles.input}`} placeholder="服务器 URL (如 http://localhost:3001/mcp)" value={newServer.url} onChange={e => setNewServer({...newServer, url: e.target.value})} />
          <div className={styles.inlineFormActions}>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!newServer.url}>添加</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>取消</button>
          </div>
        </div>
      )}

      {servers.length === 0 ? (
        <div className={styles.emptyList}>
          <Plug size={24} className={styles.emptyIcon} />
          <p>未配置 MCP 服务器</p>
          <p className={styles.emptyHint}>MCP (Model Context Protocol) 让 AI 能连接到外部工具和数据源</p>
        </div>
      ) : (
        <div className={styles.toolList}>
          {servers.map(srv => (
            <div key={srv.id} className={styles.toolItem}>
              <div className={styles.toolInfo}>
                <div className={styles.toolName}>
                  <span className={styles.statusDot} style={{ background: statusColor(srv.status) }} />
                  <strong>{srv.name}</strong>
                  {srv.toolCount > 0 && <span className={styles.sourceTag}>{srv.toolCount} 工具</span>}
                </div>
                <div className={styles.toolDesc}>{srv.url}</div>
                {srv.error && <div className={styles.errorText}>{srv.error}</div>}
              </div>
              <div className={styles.toolActions}>
                {srv.status === 'connected' ? (
                  <button className={`btn btn-ghost btn-sm`} onClick={() => handleDisconnect(srv.id)}>
                    <Unlink size={14} /> 断开
                  </button>
                ) : (
                  <button className={`btn btn-secondary btn-sm`} onClick={() => handleConnect(srv.id)} disabled={connectingId === srv.id}>
                    <Link2 size={14} /> {connectingId === srv.id ? '连接中...' : '连接'}
                  </button>
                )}
                <button className={styles.iconBtn} onClick={() => { handleDisconnect(srv.id); removeServer(srv.id); }} title="删除">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Tab 4: Skills Management
// ═══════════════════════════════════════════
function SkillsTab() {
  const { skills, toggleSkill, addSkill, removeSkill } = useSkillStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', description: '', icon: '🔧', systemPromptAppend: '' });

  const handleAdd = () => {
    if (!newSkill.name) return;
    addSkill(newSkill);
    setNewSkill({ name: '', description: '', icon: '🔧', systemPromptAppend: '' });
    setShowAddForm(false);
  };

  return (
    <div className={styles.listPanel}>
      <div className={styles.listHeader}>
        <span>Skills ({skills.length})</span>
        <button className={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}><Plus size={14} /> 自定义 Skill</button>
      </div>

      {showAddForm && (
        <div className={styles.inlineForm}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className={`input ${styles.input}`} style={{ width: 60 }} placeholder="图标" value={newSkill.icon} onChange={e => setNewSkill({...newSkill, icon: e.target.value})} />
            <input className={`input ${styles.input}`} style={{ flex: 1 }} placeholder="Skill 名称" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} />
          </div>
          <input className={`input ${styles.input}`} placeholder="描述" value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} />
          <textarea className={`input ${styles.textarea}`} placeholder="系统提示词追加内容（会添加到 AI 的 system prompt 末尾）" value={newSkill.systemPromptAppend} onChange={e => setNewSkill({...newSkill, systemPromptAppend: e.target.value})} rows={4} />
          <div className={styles.inlineFormActions}>
            <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={!newSkill.name}>添加</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>取消</button>
          </div>
        </div>
      )}

      <div className={styles.skillGrid}>
        {skills.map(skill => (
          <div key={skill.id} className={`${styles.skillCard} ${skill.enabled ? styles.skillCardActive : ''}`} onClick={() => toggleSkill(skill.id)}>
            <div className={styles.skillIcon}>{skill.icon}</div>
            <div className={styles.skillInfo}>
              <div className={styles.skillName}>{skill.name}</div>
              <div className={styles.skillDesc}>{skill.description}</div>
            </div>
            <div className={styles.skillToggle}>
              {skill.enabled ? <ToggleRight size={20} className={styles.toggleOn} /> : <ToggleLeft size={20} className={styles.toggleOff} />}
            </div>
            {skill.source !== 'builtin' && (
              <button className={styles.skillDelete} onClick={(e) => { e.stopPropagation(); removeSkill(skill.id); }}>
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
