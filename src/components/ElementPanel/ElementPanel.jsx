import { useState, useRef } from 'react';
import { 
  LayoutTemplate, Component, Zap, Database, 
  PaintBucket, Repeat, Sparkles, Shapes, Image as ImageIcon,
  Type, Clapperboard, MousePointerClick, Box, Keyboard,
  Swords, Timer, Pointer, Hash, Link, Copy, Trash2, Eye, EyeOff, Plus,
  Camera, Sun, Circle, FileBox, Cylinder, PackageOpen, Lightbulb, CloudSun, Globe
} from 'lucide-react';
import useEditorStore, { createNewElement } from '../../stores/editorStore';
import useI18nStore from '../../stores/i18nStore';
import PRESET_MODELS, { MODEL_CATEGORIES, PRESET_SPRITES, SPRITE_CATEGORIES } from '../../data/assetLibrary';
import styles from './ElementPanel.module.css';

const TABS = [
  { key: 'scene', labelKey: 'scene', icon: <LayoutTemplate size={16} /> },
  { key: 'sprite', labelKey: 'sprite', icon: <Component size={16} /> },
  { key: 'assets', labelKey: 'assets', icon: <PackageOpen size={16} /> },
  { key: 'event', labelKey: 'event', icon: <Zap size={16} /> },
  { key: 'data', labelKey: 'data', icon: <Database size={16} /> },
];

const TABS_3D = [
  { key: 'scene', labelKey: 'scene', icon: <LayoutTemplate size={16} /> },
  { key: 'sprite', labelKey: 'sprite', icon: <Component size={16} /> },
  { key: 'assets', labelKey: 'assets', icon: <PackageOpen size={16} /> },
  { key: 'event', labelKey: 'event', icon: <Zap size={16} /> },
  { key: 'data', labelKey: 'data', icon: <Database size={16} /> },
];

const ADD_OPTIONS_2D = {
  scene: [
    { type: 'background', labelKey: 'background', icon: <PaintBucket size={14} /> },
    { type: 'tilingBg', labelKey: 'tilingBg', icon: <Repeat size={14} /> },
    { type: 'particles', labelKey: 'particles', icon: <Sparkles size={14} /> },
  ],
  sprite: [
    { type: 'graphics', labelKey: 'graphics', icon: <Shapes size={14} /> },
    { type: 'image', labelKey: 'image', icon: <ImageIcon size={14} /> },
    { type: 'text', labelKey: 'text', icon: <Type size={14} /> },
    { type: 'animatedSprite', labelKey: 'animatedSprite', icon: <Clapperboard size={14} /> },
    { type: 'button', labelKey: 'button', icon: <MousePointerClick size={14} /> },
    { type: 'container', labelKey: 'container', icon: <Box size={14} /> },
  ],
  event: [
    { type: 'keyboardEvent', labelKey: 'keyboardEvent', icon: <Keyboard size={14} /> },
    { type: 'collisionRule', labelKey: 'collisionRule', icon: <Swords size={14} /> },
    { type: 'timerEvent', labelKey: 'timerEvent', icon: <Timer size={14} /> },
    { type: 'clickEvent', labelKey: 'clickEvent', icon: <Pointer size={14} /> },
  ],
  data: [
    { type: 'variable', labelKey: 'variable', icon: <Hash size={14} /> },
    { type: 'uiBinding', labelKey: 'uiBinding', icon: <Link size={14} /> },
  ],
};

const ADD_OPTIONS_3D = {
  scene: [
    { type: 'perspectiveCamera', labelKey: 'perspectiveCamera', icon: <Camera size={14} /> },
    { type: 'ambientLight', labelKey: 'ambientLight', icon: <Sun size={14} /> },
    { type: 'directionalLight', labelKey: 'directionalLight', icon: <Sun size={14} /> },
    { type: 'pointLight', labelKey: 'pointLight', icon: <Lightbulb size={14} /> },
    { type: 'spotLight', labelKey: 'spotLight', icon: <Lightbulb size={14} /> },
    { type: 'hemisphereLight', labelKey: 'hemisphereLight', icon: <CloudSun size={14} /> },
    { type: 'skybox', labelKey: 'skybox', icon: <Globe size={14} /> },
  ],
  sprite: [
    { type: 'box', labelKey: 'box', icon: <Box size={14} /> },
    { type: 'sphere', labelKey: 'sphere', icon: <Circle size={14} /> },
    { type: 'plane', labelKey: 'plane', icon: <Component size={14} /> },
    { type: 'cylinder', labelKey: 'cylinder', icon: <Cylinder size={14} /> },
    { type: 'importedModel', labelKey: 'importedModel', icon: <FileBox size={14} /> },
  ],
  event: ADD_OPTIONS_2D.event,
  data: ADD_OPTIONS_2D.data,
};

const TYPE_ICONS = {
  background: <PaintBucket size={14} />, tilingBg: <Repeat size={14} />, particles: <Sparkles size={14} />,
  graphics: <Shapes size={14} />, image: <ImageIcon size={14} />, text: <Type size={14} />,
  animatedSprite: <Clapperboard size={14} />, button: <MousePointerClick size={14} />, container: <Box size={14} />,
  perspectiveCamera: <Camera size={14} />, ambientLight: <Sun size={14} />, directionalLight: <Sun size={14} />,
  pointLight: <Lightbulb size={14} />, spotLight: <Lightbulb size={14} />, hemisphereLight: <CloudSun size={14} />,
  skybox: <Globe size={14} />, box: <Box size={14} />, sphere: <Circle size={14} />,
  plane: <Component size={14} />, cylinder: <Cylinder size={14} />, importedModel: <FileBox size={14} />,
  keyboardEvent: <Keyboard size={14} />, collisionRule: <Swords size={14} />, timerEvent: <Timer size={14} />,
  clickEvent: <Pointer size={14} />, variable: <Hash size={14} />, uiBinding: <Link size={14} />,
};

export default function ElementPanel() {
  const {
    dimension, elements, selectedElementId, activeTab, setActiveTab,
    selectElement, addElement, removeElement, duplicateElement,
    updateElement,
    scenes, activeSceneId, addScene, removeScene, switchScene, renameScene,
    updateSceneBackground, getActiveSceneBackground,
  } = useEditorStore();
  const { t, language } = useI18nStore();
  
  const ADD_OPTIONS = dimension === '3D' ? ADD_OPTIONS_3D : ADD_OPTIONS_2D;
  const currentTabs = dimension === '3D' ? TABS_3D : TABS;

  // Select correct preset assets and categories based on dimension
  const presetAssets = dimension === '3D' ? PRESET_MODELS : PRESET_SPRITES;
  const assetCategories = dimension === '3D' ? MODEL_CATEGORIES : SPRITE_CATEGORIES;

  const [showAdd, setShowAdd] = useState(false);
  const [assetCategory, setAssetCategory] = useState('all');

  const filtered = elements.filter((el) => {
    if (activeTab === 'sprite') return el.category === 'sprite' || el.category === 'mesh';
    return el.category === activeTab;
  });

  const handleAdd = (type) => {
    if (type === 'importedModel') {
      fileInputRef.current?.click();
      setShowAdd(false);
      return;
    }
    if (type === 'image') {
      imageInputRef.current?.click();
      setShowAdd(false);
      return;
    }
    const el = createNewElement(activeTab, type);
    addElement(el);
    selectElement(el.id);
    setShowAdd(false);
  };

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleModelFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const el = createNewElement('sprite', 'importedModel');
    el.style = { ...el.style, modelUrl: url, modelFileName: file.name };
    el.name = file.name.replace(/\.[^.]+$/, '');
    addElement(el);
    selectElement(el.id);
    e.target.value = '';
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const el = createNewElement('sprite', 'image');
      el.style = { ...el.style, src: dataUrl };
      el.name = file.name.replace(/\.[^.]+$/, '');
      el.transform = { ...el.transform, width: 64, height: 64, x: 400, y: 300 };
      addElement(el);
      selectElement(el.id);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    removeElement(id);
  };

  const handleToggleVisible = (e, el) => {
    e.stopPropagation();
    updateElement(el.id, { visible: !el.visible });
  };

  const handlePresetImport = (asset) => {
    if (dimension === '3D') {
      // 3D: import as importedModel
      const el = createNewElement('sprite', 'importedModel');
      el.style = { ...el.style, modelUrl: asset.path, modelFileName: asset.path.split('/').pop() };
      el.name = language === 'zh' ? asset.nameZh : asset.name;
      addElement(el);
      selectElement(el.id);
    } else {
      // 2D: import as image sprite
      const el = createNewElement('sprite', 'image');
      el.style = { ...el.style, src: asset.path };
      el.name = language === 'zh' ? asset.nameZh : asset.name;
      el.transform = { ...el.transform, width: 64, height: 64, x: 400, y: 300 };
      addElement(el);
      selectElement(el.id);
    }
  };

  const filteredAssets = assetCategory === 'all'
    ? presetAssets
    : presetAssets.filter(a => a.category === assetCategory);

  return (
    <div className={styles.panel}>
      {/* Category Tabs */}
      <div className={styles.tabs}>
        {currentTabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {t(`elementPanel.tabs.${tab.labelKey}`)}
          </button>
        ))}
      </div>

      {/* List Header with Add Button */}
      <div className={styles.listHeader}>
        <span className={styles.listTitle}>{filtered.length}{t('elementPanel.count')}</span>
        <div className={styles.addMenu}>
          <button className={styles.addBtn} onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Add Element Drawer */}
      <div className={`${styles.drawer} ${showAdd ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerInner}>
          {(ADD_OPTIONS[activeTab] || []).map((opt) => (
            <button key={opt.type} className={styles.dropdownItem} onClick={() => handleAdd(opt.type)}>
              <span className={styles.optIcon}>{opt.icon}</span>
              <span>{t(`elementPanel.addTypes.${opt.labelKey}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ====== Scene Manager (visible on scene tab) ====== */}
      {activeTab === 'scene' && scenes.length > 0 && (
        <div className={styles.sceneManager}>
          <div className={styles.sceneManagerTitle}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
              {language === 'zh' ? '场景管理' : 'Scenes'}
            </span>
            <button
              className={styles.addBtn}
              style={{ width: 22, height: 22, padding: 0 }}
              onClick={() => addScene()}
              title={language === 'zh' ? '新增场景' : 'Add Scene'}
            >
              <Plus size={12} />
            </button>
          </div>
          <div className={styles.sceneList}>
            {scenes.map((sc, i) => (
              <div
                key={sc.id}
                className={`${styles.sceneCard} ${sc.id === activeSceneId ? styles.sceneCardActive : ''}`}
                onClick={() => switchScene(sc.id)}
              >
                <span className={styles.sceneCardName}>{sc.name}</span>
                {scenes.length > 1 && (
                  <button
                    className={styles.sceneCardDel}
                    onClick={(e) => { e.stopPropagation(); removeScene(sc.id); }}
                    title={language === 'zh' ? '删除场景' : 'Delete'}
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* Background Settings */}
          {(() => {
            const bg = getActiveSceneBackground();
            return (
              <div className={styles.sceneBgSettings}>
                <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>
                  {language === 'zh' ? '场景背景' : 'Background'}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <select
                    className={styles.select}
                    style={{ flex: 1, fontSize: 11 }}
                    value={bg.type || 'color'}
                    onChange={(e) => updateSceneBackground({ type: e.target.value })}
                  >
                    <option value="color">{language === 'zh' ? '纯色' : 'Color'}</option>
                    <option value="image">{language === 'zh' ? '图片' : 'Image'}</option>
                  </select>
                </div>
                {bg.type === 'color' || !bg.type ? (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={bg.color || '#111827'}
                      onChange={(e) => updateSceneBackground({ color: e.target.value })}
                      style={{ width: 24, height: 24, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4 }}
                    />
                    <input
                      className="input"
                      value={bg.color || '#111827'}
                      onChange={(e) => updateSceneBackground({ color: e.target.value })}
                      style={{ flex: 1, fontSize: 11, height: 24, padding: '0 6px' }}
                    />
                  </div>
                ) : (
                  <div>
                    {bg.imageUrl && (
                      <div style={{ fontSize: 10, color: 'var(--color-accent)', marginBottom: 2 }}>✅ {language === 'zh' ? '已上传' : 'Uploaded'}</div>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', fontSize: 11, height: 26 }}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.jpg,.jpeg,.png,.webp,.svg';
                        input.onchange = (ev) => {
                          const file = ev.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => updateSceneBackground({ imageUrl: reader.result });
                          reader.readAsDataURL(file);
                        };
                        input.click();
                      }}
                    >
                      {language === 'zh' ? '上传背景图' : 'Upload Image'}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === 'assets' ? (
        <div className={styles.assetLibrary}>
          <div className={styles.assetCategoryBar}>
            {assetCategories.map(cat => (
              <button
                key={cat.key}
                className={`${styles.assetCatBtn} ${assetCategory === cat.key ? styles.assetCatActive : ''}`}
                onClick={() => setAssetCategory(cat.key)}
              >
                {language === 'zh' ? cat.nameZh : cat.name}
              </button>
            ))}
          </div>
          <div className={styles.assetGrid}>
            {filteredAssets.map(asset => (
              <button
                key={asset.id}
                className={styles.assetCard}
                onClick={() => handlePresetImport(asset)}
                title={language === 'zh' ? asset.nameZh : asset.name}
              >
                <span className={styles.assetIcon}>{asset.icon}</span>
                <span className={styles.assetName}>{language === 'zh' ? asset.nameZh : asset.name}</span>
              </button>
            ))}
          </div>
          <div className={styles.assetCredit}>
            {dimension === '3D' ? 'Models: Khronos glTF Samples · CC0' : 'Sprites: AI-generated pixel art'}
          </div>
        </div>
      ) : (
      /* Element List */
      <div className={styles.elementList} onClick={() => { setShowAdd(false); }}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            {t('elementPanel.empty1')}
            {t(`elementPanel.tabs.${activeTab}`)}
            {t('elementPanel.empty2')}
          </div>
        ) : (
          filtered.map((el) => (
            <div
              key={el.id}
              className={`${styles.item} ${selectedElementId === el.id ? styles.itemActive : ''} ${!el.visible ? styles.hiddenIcon : ''}`}
              onClick={() => selectElement(el.id)}
            >
              <span className={styles.itemIcon}>{TYPE_ICONS[el.type] || <Component size={14} />}</span>
              <span className={styles.itemName}>{el.name}</span>
              <div className={styles.itemActions}>
                <button className={styles.itemBtn} onClick={(e) => handleToggleVisible(e, el)} title={el.visible ? 'Hide' : 'Show'}>
                  {el.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button className={styles.itemBtn} onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }} title="Duplicate">
                  <Copy size={13} />
                </button>
                <button className={styles.itemBtn} onClick={(e) => handleDelete(e, el.id)} title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf,.obj,.fbx"
        style={{ display: 'none' }}
        onChange={handleModelFile}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
        style={{ display: 'none' }}
        onChange={handleImageFile}
      />
    </div>
  );
}
