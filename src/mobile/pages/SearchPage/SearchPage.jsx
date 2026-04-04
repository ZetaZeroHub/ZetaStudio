import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Flame, Heart } from 'lucide-react';
import styles from './SearchPage.module.css';

const HOT_TAGS = ['打地鼠', '横版闯关', '太空射击', '记忆翻牌', '接水果', '迷宫', '俄罗斯方块', '知识问答', '涂色', '教育'];

const ALL_GAMES = [
  { id: 'featured-maze', title: '绿洲大冒险', poster: '/assets/custom/精选游戏-游戏封面-绿洲大冒险.jpeg', author: '管理员', likes: 2847 },
  { id: 'featured-duck', title: '小鸭子找水池', poster: '/assets/custom/精选游戏-游戏封面-小鸭子找水池.jpg', author: '管理员', likes: 1893 },
  { id: 'featured-tank', title: '坦克小游戏', poster: '/assets/custom/朋友们的游戏-游戏封面-坦克大战.png', author: '小明同学', likes: 1456 },
  { id: 'featured-balloon', title: '打气球', poster: '/assets/custom/朋友们的游戏-游戏封面-气球射击.png', author: '游戏小王子', likes: 980 },
  { id: 'featured-tetris', title: '俄罗斯方块', poster: '/assets/custom/朋友们的游戏-游戏封面-俄罗斯方块.png', author: '代码菜鸟', likes: 2103 },
  { id: 'featured-breakout', title: '打砖块', poster: '/assets/custom/朋友们的游戏-游戏封面-打砖块.png', author: '新手小白', likes: 756 },
  { id: 'featured-memory', title: '记忆翻牌', poster: '/assets/custom/朋友们的游戏-游戏封面-记忆翻牌.png', author: '戴眼镜的爸爸', likes: 1324 },
  { id: 'featured-whackmole', title: '打地鼠', poster: '/assets/custom/朋友们的游戏-游戏封面-打地鼠.png', author: 'AI玩家007', likes: 1890 },
  { id: 'featured-fruitcatch', title: '接水果', poster: '/assets/custom/朋友们的游戏-游戏封面-接水果.png', author: '小游戏达人', likes: 670 },
  { id: 'featured-counting', title: '宝宝学数字', poster: '/assets/custom/朋友们的游戏-游戏封面-数数乐.png', author: '妈妈程序员', likes: 2340 },
  { id: 'featured-colorbook', title: '涂色乐园', poster: '/assets/custom/朋友们的游戏-游戏封面-涂色本.png', author: '幼教小李', likes: 890 },
  { id: 'featured-animalquiz', title: '动物认知', poster: '/assets/custom/朋友们的游戏-游戏封面-动物认知.png', author: '科学小队长', likes: 560 },
];

const ALL_USERS = [
  { id: 'u1', name: '管理员', avatar: '👑', bio: '官方精选内容团队', works: 2, followers: 5200 },
  { id: 'u2', name: '小明同学', avatar: '🎯', bio: '热爱游戏开发的大学生', works: 1, followers: 890 },
  { id: 'u3', name: '游戏小王子', avatar: '🎈', bio: '每天摸鱼做小游戏', works: 1, followers: 456 },
  { id: 'u4', name: '代码菜鸟', avatar: '🐣', bio: '今天也在努力写Bug', works: 1, followers: 1230 },
  { id: 'u5', name: '戴眼镜的爸爸', avatar: '👓', bio: '工程师+暖爸', works: 1, followers: 678 },
  { id: 'u6', name: 'AI玩家007', avatar: '🤖', bio: '让AI帮我做游戏', works: 1, followers: 2100 },
  { id: 'u7', name: '妈妈程序员', avatar: '👩‍💻', bio: '给女儿做教育小游戏', works: 1, followers: 3400 },
  { id: 'u8', name: '小游戏达人', avatar: '🎮', bio: '休闲游戏爱好者', works: 1, followers: 345 },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('games');

  useEffect(() => { inputRef.current?.focus(); }, []);

  const gameResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_GAMES.filter(g => g.title.toLowerCase().includes(q) || g.author.toLowerCase().includes(q));
  }, [query]);

  const userResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_USERS.filter(u => u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q));
  }, [query]);

  const hasResults = query.trim() && (gameResults.length > 0 || userResults.length > 0);
  const showHot = !query.trim();

  return (
    <div className={styles.page}>
      <div className={styles.searchHeader}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <div className={styles.searchField}>
          <Search size={16} />
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="搜索游戏、创作者..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button className={styles.cancelBtn} onClick={() => navigate(-1)}>取消</button>
      </div>

      {showHot && (
        <div className={styles.hotSection}>
          <h3 className={styles.hotTitle}>🔥 热门搜索</h3>
          <div className={styles.hotTags}>
            {HOT_TAGS.map(tag => (
              <button key={tag} className={styles.hotTag} onClick={() => setQuery(tag)}>{tag}</button>
            ))}
          </div>
        </div>
      )}

      {query.trim() && (
        <div className={styles.resultArea}>
          <div className={styles.resultTabs}>
            <button className={`${styles.rTab} ${tab === 'games' ? styles.rTabActive : ''}`} onClick={() => setTab('games')}>
              游戏 ({gameResults.length})
            </button>
            <button className={`${styles.rTab} ${tab === 'users' ? styles.rTabActive : ''}`} onClick={() => setTab('users')}>
              创作者 ({userResults.length})
            </button>
          </div>

          <div className={styles.resultList}>
            {tab === 'games' && (
              gameResults.length > 0 ? gameResults.map(g => (
                <div key={g.id} className={styles.gameResult} onClick={() => navigate(`/m/game/${g.id}`)}>
                  <img src={g.poster} alt={g.title} className={styles.gameResultImg} loading="lazy" />
                  <div className={styles.gameResultInfo}>
                    <div className={styles.gameResultTitle}>{g.title}</div>
                    <div className={styles.gameResultMeta}>{g.author} · ❤️ {g.likes}</div>
                  </div>
                </div>
              )) : (
                <div className={styles.emptyResult}>
                  <span className={styles.emptyIcon}>🔍</span>
                  <span>未找到相关游戏</span>
                </div>
              )
            )}
            {tab === 'users' && (
              userResults.length > 0 ? userResults.map(u => (
                <div key={u.id} className={styles.userResult} onClick={() => navigate(`/m/user/${u.id}`)}>
                  <div className={styles.userAvatar}>{u.avatar}</div>
                  <div className={styles.userName}>
                    <div className={styles.userNameText}>{u.name}</div>
                    <div className={styles.userBio}>{u.bio} · {u.works}个作品 · {u.followers}粉丝</div>
                  </div>
                  <button className={styles.followSmBtn} onClick={e => e.stopPropagation()}>关注</button>
                </div>
              )) : (
                <div className={styles.emptyResult}>
                  <span className={styles.emptyIcon}>👤</span>
                  <span>未找到相关创作者</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
