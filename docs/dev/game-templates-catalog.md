# AI Game Platform — 游戏模板完整目录

> 统计日期: 2026-04-01 | 基于通用 2D/3D 专业编辑器运行的全部游戏

## 总览

| 分类 | 数量 | 维度 | 引擎 |
|------|------|------|------|
| 独立大型游戏 | 3 | 2D | PixiJS + 自研引擎 |
| Pro 编辑器模板 | 7 | 4×2D + 3×3D | PixiJS / Three.js |
| Kids 原版模板 | 8 | 全2D | PixiJS |
| Kids 扩展模板 | 22 | 全2D | PixiJS |
| **总计** | **40** | **37×2D + 3×3D** | — |

---

## 一、独立大型游戏

### 1. 迷宫梦想家 — 横版闯关
- **维度**: 2D | **类别**: 横版动作冒险 | **代码量**: ~5,900行
- **玩法**: 多关卡横版闯关，骑士角色跑跳、元素攻击(泡泡/火焰/水流)、6种敌人AI、BOSS战、商人NPC、收集金币/星星/钥匙、传送门
- **代码位置**:
  - `src/pages/MazeGamePage/MazeGamePage.jsx` (1,522行 主页面+游戏循环)
  - `src/pages/MazeGamePage/engine/physics.js` (874行 物理引擎)
  - `src/pages/MazeGamePage/engine/combat.js` (941行 战斗系统)
  - `src/pages/MazeGamePage/engine/renderer.js` (897行 精灵渲染器)
  - `src/pages/MazeGamePage/engine/audioManager.js` (135行 音频)
  - `src/data/mazeLevels.js` (518行 关卡定义)
- **核心方法**: `applyInput` `applyGravity` `moveX/moveY` `updateCamera` `damagePlayer` `createEnemySprite` `updateEnemyAI` `fireProjectile` `updateProjectiles` `cycleWeapon` `drawKnight` `drawSlime/Bat/Worm/Frog/Turtle/Ghost`

### 2. 小鸭子找水池 — 画线迷宫
- **维度**: 2D | **类别**: 益智解谜 | **代码量**: ~2,126行
- **玩法**: 触屏画路线→小鸭子自动行走→避障到达水池，相机缩放，开场全景动画，收集金币
- **代码位置**:
  - `src/pages/MazePathGame/MazePathGame.jsx` (1,283行)
  - `src/data/topDownLevels.js` (843行 关卡地图定义)
- **核心方法**: `PHASE状态机(INTRO/DRAWING/WALKING/VICTORY)` `resolveRoadTile` `getMazeLevel`

### 3. 俯视角冒险 — TopDown RPG
- **维度**: 2D | **类别**: 俯视角RPG | **代码量**: ~1,622行
- **玩法**: Tiny Town素材Canvas渲染，推箱子、钥匙开门、NPC对话、道具收集
- **代码位置**:
  - `src/pages/TopDownGamePage/TopDownGamePage.jsx` (171行)
  - `src/pages/TopDownGamePage/engine/topDownPhysics.js` (283行)
  - `src/pages/TopDownGamePage/engine/topDownRenderer.js` (325行)
  - `src/data/topDownLevels.js` (843行)
- **核心方法**: `initTopDownState` `processTopDownInput` `updateTopDownPhysics` `tryPushBlock` `checkDoors` `preloadTiles` `renderTopDown` `renderHUD` `renderDialog`

---

## 二、Pro 编辑器模板（通用编辑器内运行）

> 脚本路径: `src/templates/{文件名}.js`，模板内嵌 scripts[0].content 为运行时代码

### 2D 模板 (4款)

| # | 游戏名 | templateType | 文件 | 行数 | 类别 | 玩法 | 核心方法 |
|---|--------|-------------|------|------|------|------|---------|
| 1 | 太空射击 | `shooter` | shooter.js | 160 | 射击 | 飞船移动+自动射击消灭敌人 | `app.ticker.add` `spawnEnemy` 碰撞检测 |
| 2 | 平台跳跃 | `platformer` | platformer.js | 129 | 动作 | 跑跳收集星星，重力物理 | `applyGravity` 平台碰撞 星星收集 |
| 3 | 知识竞赛 | `quiz` | quiz.js | 98 | 教育 | 4选1限时答题 | `showQuestion` `checkAnswer` 倒计时 |
| 4 | NPC剧情对话 | `galgame` | galgame.js | 114 | 叙事 | Galgame式对话+分支选项 | `showDialogue` `handleChoice` 打字机效果 |

### 3D 模板 (3款)

| # | 游戏名 | templateType | 文件 | 行数 | 类别 | 玩法 | 核心方法 |
|---|--------|-------------|------|------|------|------|---------|
| 5 | 3D基础魔方 | `cube3d` | cube3d.js | 28 | 演示 | 3D交互旋转方块 | `OrbitControls` `mesh.rotation` |
| 6 | 3D太阳系 | `solar3d` | solar3d.js | 45 | 教育 | 太阳+地球+月球公转自转 | `orbitAngle` `pointLight` |
| 7 | 3D第一人称射击 | `fps3d` | fps3d.js | 162 | 射击 | WASD+鼠标瞄准射击 | `PointerLockControls` `Raycaster` 敌人AI |

---

## 三、Kids 编辑器模板（全部 2D）

### 原版 8 款 (`src/templates/kidsTemplates.js`, 746行)

| # | 游戏名 | templateType | 类别 | 玩法 | 核心方法 |
|---|--------|-------------|------|------|---------|
| 1 | 形状配对 | `shapeMatch` | 认知 | 拖拽形状到对应轮廓 | 拖拽+距离吸附+匹配计数 |
| 2 | 记忆翻牌 | `memoryCard` | 认知 | 翻转4×2卡片找相同emoji | Fisher-Yates洗牌 翻牌动画 配对锁定 |
| 3 | 数数乐 | `counting` | 数学 | 数emoji数量点正确数字 | `newRound()` 随机生成 4选项 |
| 4 | 看图识字 | `wordPicture` | 语言 | 看emoji选中文名 | `showQuestion()` 5题制 |
| 5 | 涂色本 | `colorBook` | 创意 | 选颜色点击区域涂色 | 调色板+区域填色 |
| 6 | 动物认知 | `animalQuiz` | 科学 | 看动物答栖息地 | `show()` 5题知识问答 |
| 7 | 打地鼠 | `whackMole` | 反应 | 30秒计时点击地鼠 | `popMole()` 速度递增 |
| 8 | 接水果 | `fruitCatch` | 反应 | 左右移动篮子接水果 | `ticker`循环 碰撞检测 3命制 |

### 扩展 — 认知类 (`src/templates/kids/cognitive.js`, 320行)

| # | 游戏名 | templateType | 玩法 | 核心方法 |
|---|--------|-------------|------|---------|
| 9 | 颜色分类 | `colorSort` | 彩色球拖进对应颜色篮子 | 拖拽+颜色匹配 |
| 10 | 找不同 | `spotDiff` | 找两图不同之处 | 差异坐标检测 |
| 11 | 影子配对 | `shadowMatch` | 物品拖到对应影子 | 形状匹配+吸附 |

### 扩展 — 数学类 (`src/templates/kids/math.js`, 288行)

| # | 游戏名 | templateType | 玩法 | 核心方法 |
|---|--------|-------------|------|---------|
| 12 | 加减法泡泡 | `mathBubble` | 点击正确答案泡泡 | 泡泡上浮+算式生成 |
| 13 | 数字排序 | `numberSort` | 打乱数字拖到正确位置 | 拖拽排序+位置校验 |
| 14 | 图形计数 | `shapeCount` | 数画面里特定图形数量 | 随机散布+选项按钮 |

### 扩展 — 语言类 (`src/templates/kids/language.js`, 330行)

| # | 游戏名 | templateType | 玩法 | 核心方法 |
|---|--------|-------------|------|---------|
| 15 | 字母拼图 | `letterPuzzle` | 拖拽字母拼单词 | 拖拽+吸附+拼写校验 |
| 16 | 单词拼写 | `wordSpell` | 看图点字母拼词语 | 顺序校验+多轮题 |
| 17 | 侦探破案 | `detective` | 收集线索找真凶 | 多场景推进+线索收集 |

### 扩展 — 创意类 (`src/templates/kids/creative.js`, 265行)

| # | 游戏名 | templateType | 玩法 | 核心方法 |
|---|--------|-------------|------|---------|
| 18 | 简笔画连线 | `dotConnect` | 按数字顺序连线画图 | 节点点击+Graphics连线 |
| 19 | 音乐节拍 | `musicBeat` | 按节奏点击乐器 | 节拍时序+Web Audio |
| 20 | 画线条 | `drawLine` | 手指画指定形状 | 触屏绘制+路径匹配 |

### 扩展 — 科学类 (`src/templates/kids/science.js`, 241行)

| # | 游戏名 | templateType | 玩法 | 核心方法 |
|---|--------|-------------|------|---------|
| 21 | 食物分类 | `foodSort` | 食物分到正确类别 | 拖拽分类 |
| 22 | 天气穿衣 | `weatherDress` | 看天气选衣服 | 天气随机+校验 |
| 23 | 垃圾分类 | `trashSort` | 垃圾扔正确桶里 | 拖拽+4分类 |

### 扩展 — 反应/经典类 (`src/templates/kids/reaction.js`, 1,343行)

| # | 游戏名 | templateType | 玩法 | 核心方法 |
|---|--------|-------------|------|---------|
| 24 | 迷宫冒险 | `maze` | 键盘/触屏走出随机迷宫 | DFS迷宫生成 碰撞检测 |
| 25 | 气球射击 | `balloonPop` | 点击上浮气球得分 | 气球生成+上浮+爆破 |
| 26 | 俄罗斯方块 | `tetris` | 经典俄罗斯方块 | 7种方块 旋转 行消除 |
| 27 | 打砖块 | `breakout` | 经典打砖块 | 球反弹 砖块碰撞 挡板 |
| 28 | 摩托车冲刺 | `motorbike` | 跳跃障碍冲刺 | 无尽滚动 障碍生成 |
| 29 | 跳跃闯关 | `platformJump` | 跳平台收集星星 | 平台生成 重力跳跃 |
| 30 | 射箭大作战 | `archeryBattle` | 消灭NPC敌人闯关 | 瞄准射击 箭矢弹道 |

### 扩展 — 策略类 (`src/templates/kids/strategy.js`, 444行)

| # | 游戏名 | templateType | 玩法 | 核心方法 |
|---|--------|-------------|------|---------|
| 31 | 坦克大战 | `tankBattle` | 保卫基地消灭敌军坦克 | WASD移动 炮弹发射 敌人AI |
| 32 | 愤怒的小鸟 | `angryBirds` | 弹弓发射小鸟打小猪 | 弹弓拖拽 抛物线 碰撞 |

---

## 四、代码量统计

```
独立大型游戏           ~9,648行
  ├── 迷宫梦想家         5,900行
  ├── 小鸭子找水池        2,126行
  └── 俯视角冒险          1,622行

Pro编辑器模板            ~736行
  ├── fps3d.js            162行
  ├── shooter.js          160行
  ├── platformer.js       129行
  ├── galgame.js          114行
  ├── quiz.js              98行
  ├── solar3d.js           45行
  └── cube3d.js            28行

Kids编辑器模板         ~3,977行
  ├── kidsTemplates.js    746行 (原版8款)
  ├── reaction.js       1,343行 (7款)
  ├── strategy.js         444行 (2款)
  ├── language.js         330行 (3款)
  ├── cognitive.js        320行 (3款)
  ├── math.js             288行 (3款)
  ├── creative.js         265行 (3款)
  └── science.js          241行 (3款)

游戏逻辑代码总计:     ~14,361行
```

## 五、技术架构

```
┌───── 通用编辑器层 ─────┐
│ GameEditorPage          │
│ ├── PixiCanvas (2D)     │ ── elements[] + scripts[] → 运行时注入
│ └── ThreeCanvas (3D)    │
│ GameCanvas (2D/3D分发)   │
└─────────────────────────┘
        ↑ 读取
┌── editorStore (Zustand) ──┐
│ elements[], scripts[]     │
│ initEditor(project, tpl)  │
│ clearEditor()             │
└───────────────────────────┘
        ↑ 注入
┌───── 模板层 ──────────────┐
│ src/templates/index.js    │
│ ├── Pro模板 (7)           │
│ └── Kids模板 (30)         │
│ getTemplate(type) → {...} │
└───────────────────────────┘
```

> 独立游戏(迷宫梦想家/小鸭子/俯视角)有自研渲染引擎和物理系统，不使用通用编辑器。
