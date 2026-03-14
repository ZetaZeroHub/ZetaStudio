import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import useEditorStore from '../../stores/editorStore';
import styles from './ScriptEditor.module.css';

export default function ScriptEditor() {
  const { scripts, activeScriptId, setActiveScriptId, addScript, updateScript, removeScript } = useEditorStore();
  const [editingId, setEditingId] = useState(null);
  const inputRef = useRef(null);

  const activeScript = scripts.find(s => s.id === activeScriptId) || scripts[0];

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleNameChange = (e, id) => {
    updateScript(id, { name: e.target.value });
  };

  const handleNameBlur = (e, id) => {
    setEditingId(null);
    let val = e.target.value.trim();
    if (!val) val = 'script.js';
    if (!val.endsWith('.js')) val += '.js';
    updateScript(id, { name: val });
  };

  const handleNameKeyDown = (e, id) => {
    if (e.key === 'Enter') handleNameBlur(e, id);
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className={styles.container}>
      {/* Left Sidebar (Script List) */}
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <span>📄 脚本列表</span>
          <button className={styles.addBtn} onClick={addScript} title="新建脚本">＋</button>
        </div>
        <div className={styles.list}>
          {scripts.map(s => (
            <div 
              key={s.id} 
              className={`${styles.item} ${activeScriptId === s.id ? styles.itemActive : ''}`}
              onClick={() => setActiveScriptId(s.id)}
              onDoubleClick={() => setEditingId(s.id)}
            >
              <div className={styles.itemName}>
                <span style={{ fontSize: '0.9rem' }}>JS</span>
                {editingId === s.id ? (
                  <input
                    ref={inputRef}
                    className={styles.nameInput}
                    value={s.name}
                    onChange={(e) => handleNameChange(e, s.id)}
                    onBlur={(e) => handleNameBlur(e, s.id)}
                    onKeyDown={(e) => handleNameKeyDown(e, s.id)}
                  />
                ) : (
                  <span>{s.name}</span>
                )}
              </div>
              <button 
                className={styles.deleteBtn} 
                onClick={(e) => { e.stopPropagation(); removeScript(s.id); }}
                title="删除"
                disabled={scripts.length <= 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area (Code Editor) */}
      <div className={styles.editorArea}>
        {activeScript ? (
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={activeScript.content}
            onChange={(val) => updateScript(activeScript.id, { content: val || '' })}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 12 },
              tabSize: 2,
              formatOnPaste: true,
            }}
          />
        ) : (
           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
             请选择或创建一个脚本
           </div>
        )}
      </div>
    </div>
  );
}
