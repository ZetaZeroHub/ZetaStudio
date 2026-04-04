import { useState } from 'react';
import { Heart } from 'lucide-react';
import styles from './GameCard.module.css';

export default function GameCard({ game, onClick }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const formatCount = (n) => {
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n ?? 0;
  };

  return (
    <div className={styles.card} onClick={() => onClick?.(game)}>
      <div className={styles.posterWrap}>
        {!imgLoaded && <div className={`${styles.posterSkeleton} m-skeleton`} />}
        <img
          src={game.poster}
          alt={game.title}
          className={styles.poster}
          style={{ opacity: imgLoaded ? 1 : 0, position: imgLoaded ? 'relative' : 'absolute' }}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        {game.tag && (
          <span className={`${styles.tag} ${game.authorTag === 'official' ? styles.tagOfficial : ''}`}>
            {game.tag}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{game.title}</h3>
        <div className={styles.meta}>
          <div className={styles.author}>
            <span className={styles.avatar}>{game.authorAvatar || '🎨'}</span>
            <span className={styles.authorName}>{game.author}</span>
          </div>
          <span className={styles.likes}>
            <Heart size={12} />
            {formatCount(game.likes)}
          </span>
        </div>
      </div>
    </div>
  );
}
