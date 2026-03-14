import { useRef } from 'react';
import { Settings2, Tag, Move, Palette, FileText, Activity, Zap, Trash2, Pointer, FileBox } from 'lucide-react';
import useEditorStore from '../../stores/editorStore';
import useI18nStore from '../../stores/i18nStore';
import styles from './PropertyEditor.module.css';

const SHAPE_OPTIONS = ['rect', 'circle', 'ellipse', 'triangle', 'star'];

export default function PropertyEditor() {
  const { dimension, elements, selectedElementId, updateElement, removeElement } = useEditorStore();
  const { t } = useI18nStore();
  const el = elements.find(e => e.id === selectedElementId);
  const is3D = dimension === '3D';

  if (!el) {
    return (
      <div className={styles.editor}>
        <div className={styles.empty}>
          <Pointer className={styles.emptyIcon} size={24} />
          {t('propertyEditor.empty1')}<br/>{t('propertyEditor.empty2')}
        </div>
      </div>
    );
  }

  const update = (field, value) => updateElement(el.id, { [field]: value });
  const updateNested = (group, key, value) => updateElement(el.id, { [group]: { [key]: value } });

  const isVisual = ['scene', 'sprite', 'mesh'].includes(el.category);
  const hasText = ['text', 'button'].includes(el.type);
  const hasPhysics = el.category === 'sprite' || el.category === 'mesh';
  const hasStyle = isVisual && el.type !== 'text';
  const isData = el.category === 'data';

  const typeLabel = t(`propertyEditor.typeLabels.${el.type}`) !== `propertyEditor.typeLabels.${el.type}` 
    ? t(`propertyEditor.typeLabels.${el.type}`) 
    : el.type;

  const renderBehaviorDesc = (b) => {
    let text = t('propertyEditor.behaviorDesc.default')
      .replace('{trigger}', b.trigger)
      .replace('{action}', t(`propertyEditor.actionLabels.${b.action}`) || b.action);
      
    if (b.trigger === 'keyboard') {
      text = t('propertyEditor.behaviorDesc.keyboard')
        .replace('{key}', b.key)
        .replace('{action}', t(`propertyEditor.actionLabels.${b.action}`) || b.action);
    } else if (b.trigger === 'collision') {
      text = t('propertyEditor.behaviorDesc.collision')
        .replace('{target}', b.target)
        .replace('{action}', t(`propertyEditor.actionLabels.${b.action}`) || b.action);
    } else if (b.trigger === 'timer') {
      text = t('propertyEditor.behaviorDesc.timer')
        .replace('{interval}', b.interval)
        .replace('{action}', t(`propertyEditor.actionLabels.${b.action}`) || b.action);
    } else if (b.trigger === 'physics') {
      text = t('propertyEditor.behaviorDesc.physics');
    }
    return text;
  };

  return (
    <div className={styles.editor}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Settings2 size={16} className={styles.headerIcon} />
          {typeLabel}
        </div>
      </div>

      {/* Name */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}><Tag size={14} className={styles.sectionIcon} /> {t('propertyEditor.name')}</div>
        <input className={`input ${styles.inputFull}`} value={el.name} onChange={e => update('name', e.target.value)} />
      </div>

      {/* Transform */}
      {isVisual && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Move size={14} className={styles.sectionIcon} /> {t('propertyEditor.transform')}</div>
          <div className={styles.row}>
            <span className={styles.label}>X</span>
            <input className={`input ${styles.inputSmall}`} type="number" step={is3D?"0.1":"1"} value={el.transform?.x ?? 0} onChange={e => updateNested('transform', 'x', +e.target.value)} />
            <span className={styles.label}>Y</span>
            <input className={`input ${styles.inputSmall}`} type="number" step={is3D?"0.1":"1"} value={el.transform?.y ?? 0} onChange={e => updateNested('transform', 'y', +e.target.value)} />
            {is3D && (
              <>
                <span className={styles.label}>Z</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.z ?? 0} onChange={e => updateNested('transform', 'z', +e.target.value)} />
              </>
            )}
          </div>
          
          <div className={styles.row}>
            {(!is3D || el.type === 'box' || el.type === 'plane' || el.category === 'scene' || el.category === 'sprite') && el.type !== 'sphere' && el.type !== 'cylinder' && el.type !== 'importedModel' && el.type !== 'perspectiveCamera' && el.type !== 'ambientLight' && el.type !== 'pointLight' && el.type !== 'directionalLight' && (
              <>
                <span className={styles.label}>W</span>
                <input className={`input ${styles.inputSmall}`} type="number" step={is3D?"0.1":"1"} value={el.transform?.width ?? (is3D ? 1 : 60)} onChange={e => updateNested('transform', 'width', +e.target.value)} />
                <span className={styles.label}>H</span>
                <input className={`input ${styles.inputSmall}`} type="number" step={is3D?"0.1":"1"} value={el.transform?.height ?? (is3D ? 1 : 60)} onChange={e => updateNested('transform', 'height', +e.target.value)} />
              </>
            )}
            {is3D && el.type === 'box' && (
              <>
                <span className={styles.label}>D</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.depth ?? 1} onChange={e => updateNested('transform', 'depth', +e.target.value)} />
              </>
            )}
            {is3D && el.type === 'sphere' && (
              <>
                <span className={styles.label}>R</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.radius ?? 1} onChange={e => updateNested('transform', 'radius', +e.target.value)} />
              </>
            )}
            {is3D && el.type === 'cylinder' && (
              <>
                <span className={styles.label}>RT</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.radiusTop ?? 0.5} onChange={e => updateNested('transform', 'radiusTop', +e.target.value)} />
                <span className={styles.label}>RB</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.radiusBottom ?? 0.5} onChange={e => updateNested('transform', 'radiusBottom', +e.target.value)} />
                <span className={styles.label}>H</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.height ?? 1} onChange={e => updateNested('transform', 'height', +e.target.value)} />
              </>
            )}
            {is3D && el.type === 'importedModel' && (
              <>
                <span className={styles.label}>SX</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.scaleX ?? 1} onChange={e => updateNested('transform', 'scaleX', +e.target.value)} />
                <span className={styles.label}>SY</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.scaleY ?? 1} onChange={e => updateNested('transform', 'scaleY', +e.target.value)} />
                <span className={styles.label}>SZ</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.scaleZ ?? 1} onChange={e => updateNested('transform', 'scaleZ', +e.target.value)} />
              </>
            )}
          </div>

          <div className={styles.row}>
            {is3D ? (
              <>
                <span className={styles.label}>RX</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.rotationX ?? 0} onChange={e => updateNested('transform', 'rotationX', +e.target.value)} />
                <span className={styles.label}>RY</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.rotationY ?? 0} onChange={e => updateNested('transform', 'rotationY', +e.target.value)} />
                <span className={styles.label}>RZ</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.rotationZ ?? 0} onChange={e => updateNested('transform', 'rotationZ', +e.target.value)} />
              </>
            ) : (
              <>
                <span className={styles.label}>↻</span>
                <input className={`input ${styles.inputSmall}`} type="number" value={el.transform?.rotation ?? 0} onChange={e => updateNested('transform', 'rotation', +e.target.value)} placeholder={t('propertyEditor.rotation')} />
                <span className={styles.label}>Z</span>
                <input className={`input ${styles.inputSmall}`} type="number" value={el.transform?.depth ?? 0} onChange={e => updateNested('transform', 'depth', +e.target.value)} />
              </>
            )}
          </div>

          {is3D && el.type === 'perspectiveCamera' && (
             <div className={styles.row}>
               <span className={styles.label}>TX</span>
               <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.targetX ?? 0} onChange={e => updateNested('transform', 'targetX', +e.target.value)} />
               <span className={styles.label}>TY</span>
               <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.targetY ?? 0} onChange={e => updateNested('transform', 'targetY', +e.target.value)} />
               <span className={styles.label}>TZ</span>
               <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.transform?.targetZ ?? 0} onChange={e => updateNested('transform', 'targetZ', +e.target.value)} />
             </div>
          )}
        </div>
      )}

      {/* Imported Model Info */}
      {is3D && el.type === 'importedModel' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}><FileBox size={14} className={styles.sectionIcon} /> {t('propertyEditor.modelFile')}</div>
          <div className={styles.row}>
            <span className={styles.label} style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {el.style?.modelFileName || t('propertyEditor.noModel')}
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 6 }} onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.glb,.gltf,.obj,.fbx';
            input.onchange = (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              updateNested('style', 'modelUrl', url);
              updateNested('style', 'modelFileName', file.name);
            };
            input.click();
          }}>{t('propertyEditor.replaceModel')}</button>
        </div>
      )}

      {/* Style */}
      {hasStyle && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Palette size={14} className={styles.sectionIcon} /> {t('propertyEditor.style')}</div>
          <div className={styles.colorRow}>
            {is3D && el.type === 'perspectiveCamera' ? null : (
              <>
                <input className={styles.colorInput} type="color" value={el.style?.color || el.style?.fillColor || '#ffffff'} onChange={e => { updateNested('style', 'color', e.target.value); updateNested('style', 'fillColor', e.target.value); } } />
                <input className={`input ${styles.colorHex}`} value={el.style?.color || el.style?.fillColor || '#ffffff'} onChange={e => { updateNested('style', 'color', e.target.value); updateNested('style', 'fillColor', e.target.value); } } />
                <span className={styles.label} style={{ minWidth: 'auto' }}>{t('propertyEditor.fill')}</span>
              </>
            )}
          </div>
          <div className={styles.row} style={{ marginTop: 6 }}>
            {is3D ? (
               <>
                 {el.category === 'scene' && el.type !== 'perspectiveCamera' && (
                    <>
                      <span className={styles.label}>Int</span>
                      <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.style?.intensity ?? 1} onChange={e => updateNested('style', 'intensity', +e.target.value)} />
                    </>
                 )}
                 {el.category === 'mesh' && (
                   <>
                      <span className={styles.label}>Mat</span>
                      <select className={styles.select} value={el.style?.material || 'standard'} onChange={e => updateNested('style', 'material', e.target.value)}>
                        <option value="basic">Basic (No Light)</option>
                        <option value="standard">Standard (Lit)</option>
                      </select>
                   </>
                 )}
               </>
            ) : (
              <>
                <span className={styles.label}>α</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.1" min="0" max="1" value={el.style?.alpha ?? 1} onChange={e => updateNested('style', 'alpha', +e.target.value)} />
                <span className={styles.label}>R</span>
                <input className={`input ${styles.inputSmall}`} type="number" value={el.style?.borderRadius ?? 0} onChange={e => updateNested('style', 'borderRadius', +e.target.value)} />
              </>
            )}
          </div>
          {el.type === 'graphics' && (
            <div className={styles.row} style={{ marginTop: 6 }}>
              <span className={styles.label}>{t('propertyEditor.shape')}</span>
              <select className={styles.select} value={el.style?.shape || 'rect'} onChange={e => updateNested('style', 'shape', e.target.value)}>
                {SHAPE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          {el.type === 'particles' && (
            <>
              <div className={styles.row} style={{ marginTop: 6 }}>
                <span className={styles.label}>{t('propertyEditor.particleCount')}</span>
                <input className={`input ${styles.inputSmall}`} type="number" value={el.style?.particleCount ?? 50} onChange={e => updateNested('style', 'particleCount', +e.target.value)} />
                <span className={styles.label}>{t('propertyEditor.particleSize')}</span>
                <input className={`input ${styles.inputSmall}`} type="number" step="0.5" value={el.style?.particleSize ?? 2} onChange={e => updateNested('style', 'particleSize', +e.target.value)} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Text */}
      {hasText && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}><FileText size={14} className={styles.sectionIcon} /> {t('propertyEditor.text')}</div>
          <input className={`input ${styles.inputFull}`} value={el.textContent?.text || ''} onChange={e => updateNested('textContent', 'text', e.target.value)} placeholder={t('propertyEditor.textPlaceholder')} />
          <div className={styles.row} style={{ marginTop: 6 }}>
            <span className={styles.label}>{t('propertyEditor.fontSize')}</span>
            <input className={`input ${styles.inputSmall}`} type="number" value={el.textContent?.fontSize ?? 20} onChange={e => updateNested('textContent', 'fontSize', +e.target.value)} />
            <input className={styles.colorInput} type="color" value={el.textContent?.color || '#ffffff'} onChange={e => updateNested('textContent', 'color', e.target.value)} />
          </div>
        </div>
      )}

      {/* Physics */}
      {hasPhysics && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Activity size={14} className={styles.sectionIcon} /> {t('propertyEditor.physics')}</div>
          <div className={styles.row}>
            <span className={styles.label}>Vx</span>
            <input className={`input ${styles.inputSmall}`} type="number" step="0.5" value={el.physics?.velocityX ?? 0} onChange={e => updateNested('physics', 'velocityX', +e.target.value)} />
            <span className={styles.label}>Vy</span>
            <input className={`input ${styles.inputSmall}`} type="number" step="0.5" value={el.physics?.velocityY ?? 0} onChange={e => updateNested('physics', 'velocityY', +e.target.value)} />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>G</span>
            <input className={`input ${styles.inputSmall}`} type="number" step="0.1" value={el.physics?.gravity ?? 0} onChange={e => updateNested('physics', 'gravity', +e.target.value)} />
            <span className={styles.label}>M</span>
            <input className={`input ${styles.inputSmall}`} type="number" step="0.5" value={el.physics?.mass ?? 1} onChange={e => updateNested('physics', 'mass', +e.target.value)} />
          </div>
        </div>
      )}

      {/* Behaviors */}
      {el.category !== 'data' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Zap size={14} className={styles.sectionIcon} /> {t('propertyEditor.behaviors')}</div>
          <div className={styles.behaviorList}>
            {(el.behaviors || []).map((b, i) => (
              <div key={i} className={styles.behaviorItem}>
                <span className={styles.behaviorDesc}>
                  {renderBehaviorDesc(b)}
                </span>
                <button className={styles.deleteSmall} onClick={() => {
                  const newBehaviors = [...(el.behaviors || [])];
                  newBehaviors.splice(i, 1);
                  update('behaviors', newBehaviors);
                }}>✕</button>
              </div>
            ))}
          </div>
          <button className={styles.addBehaviorBtn} onClick={() => {
            const newBeh = { trigger: 'keyboard', key: 'ArrowRight', action: 'move', params: { axis: 'x', speed: 5 } };
            update('behaviors', [...(el.behaviors || []), newBeh]);
          }}>{t('propertyEditor.addBehavior')}</button>
        </div>
      )}

      {/* Data */}
      {isData && el.type === 'variable' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Tag size={14} className={styles.sectionIcon} /> {t('propertyEditor.data')}</div>
          <input className={`input ${styles.inputFull}`} type="number" value={el.dataValue ?? 0} onChange={e => update('dataValue', +e.target.value)} />
        </div>
      )}

      {/* Delete */}
      <button className="btn btn-danger btn-sm" style={{ width: '100%', marginTop: 'var(--space-md)', gap: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        onClick={() => { if (window.confirm(t('propertyEditor.deleteConfirm'))) removeElement(el.id); }}>
        <Trash2 size={14} /> {t('propertyEditor.deleteElement')}
      </button>
    </div>
  );
}
