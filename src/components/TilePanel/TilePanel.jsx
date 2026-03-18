/* ========================================
   TilePanel — 素材面板（分类展示真实预览图）
   ======================================== */
import { useState } from 'react';
import { ALL_CATEGORIES } from '../../data/editorAssets';
import useGameDraftStore from '../../stores/gameDraftStore';
import styles from './TilePanel.module.css';

export default function TilePanel({ templateType }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const { setSelectedTile, selectedTile, setSelectedTool } = useGameDraftStore();

  const handleSelect = (item) => {
    setSelectedTile(item);
    setSelectedTool('brush');
  };

  const cat = ALL_CATEGORIES[activeCategory];

  return (
    <div className={styles.panel}>
      {/* Category tabs — scrollable horizontally */}
      <div className={styles.categoryTabs}>
        {ALL_CATEGORIES.map((c, i) => (
          <button
            key={i}
            className={`${styles.catTab} ${activeCategory === i ? styles.catTabActive : ''}`}
            onClick={() => setActiveCategory(i)}
            title={c.label}
          >
            {c.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Category name */}
      <div className={styles.catLabel}>{cat.label}</div>

      {/* Tile grid with real image previews */}
      <div className={styles.tileGrid}>
        {cat.items.map((item) => (
          <button
            key={item.id}
            className={`${styles.tile} ${selectedTile?.id === item.id ? styles.tileActive : ''}`}
            onClick={() => handleSelect(item)}
            title={item.name}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/editor-asset', JSON.stringify(item));
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <img
              src={item.src}
              alt={item.name}
              className={styles.tileImg}
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className={styles.tileName}>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
