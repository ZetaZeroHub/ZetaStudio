/* ========================================
   mazeGenerator — 基于用户画线生成迷宫
   v3: 均匀分岔 + 风格地面 + 画布尺寸 + 角色/终点
   ======================================== */
import { MAZE_ASSETS } from '../data/topDownLevels';

/* ═══════════════════════════════════════════
   画布尺寸预设
   ═══════════════════════════════════════════ */
export const CANVAS_SIZES = {
  small:  { gridW: 14, gridH: 10, cellSize: 46, label: '小' },
  medium: { gridW: 20, gridH: 16, cellSize: 32, label: '中' },
  large:  { gridW: 28, gridH: 22, cellSize: 24, label: '大' },
};

/* ═══════════════════════════════════════════
   风格 → 地面瓦片映射
   grass系 vs sand系
   ═══════════════════════════════════════════ */
const TANKS = '/assets/kenney/2.5d/kenney_top-down-tanks-redux/PNG/Default size';

const GROUND_TILES = {
  grass: {
    base1: `${TANKS}/tileGrass1.png`,
    base2: `${TANKS}/tileGrass2.png`,
    roadH: `${TANKS}/tileGrass_roadEast.png`,
    roadV: `${TANKS}/tileGrass_roadNorth.png`,
    roadCross: `${TANKS}/tileGrass_roadCrossing.png`,
    cornerUL: `${TANKS}/tileGrass_roadCornerUL.png`,
    cornerUR: `${TANKS}/tileGrass_roadCornerUR.png`,
    cornerLL: `${TANKS}/tileGrass_roadCornerLL.png`,
    cornerLR: `${TANKS}/tileGrass_roadCornerLR.png`,
    splitN: `${TANKS}/tileGrass_roadSplitN.png`,
    splitS: `${TANKS}/tileGrass_roadSplitS.png`,
    splitE: `${TANKS}/tileGrass_roadSplitE.png`,
    splitW: `${TANKS}/tileGrass_roadSplitW.png`,
    bgColor: '#4a7c3f',
  },
  sand: {
    base1: `${TANKS}/tileSand1.png`,
    base2: `${TANKS}/tileSand2.png`,
    roadH: `${TANKS}/tileSand_roadEast.png`,
    roadV: `${TANKS}/tileSand_roadNorth.png`,
    roadCross: `${TANKS}/tileSand_roadCrossing.png`,
    cornerUL: `${TANKS}/tileSand_roadCornerUL.png`,
    cornerUR: `${TANKS}/tileSand_roadCornerUR.png`,
    cornerLL: `${TANKS}/tileSand_roadCornerLL.png`,
    cornerLR: `${TANKS}/tileSand_roadCornerLR.png`,
    splitN: `${TANKS}/tileSand_roadSplitN.png`,
    splitS: `${TANKS}/tileSand_roadSplitS.png`,
    splitE: `${TANKS}/tileSand_roadSplitE.png`,
    splitW: `${TANKS}/tileSand_roadSplitW.png`,
    bgColor: '#c2a54f',
  },
};

/** 风格→地面类型映射 */
const STYLE_GROUND = {
  forest: 'grass', autumn: 'grass',
  winter: 'sand', candy: 'sand',
  city: 'sand', village: 'grass',
  racing: 'sand',
};

/* ═══════════════════════════════════════════
   可选主角角色
   ═══════════════════════════════════════════ */
export const PLAYER_CHARACTERS = [
  { key: 'duck', name: '小鸭子', img: MAZE_ASSETS.duckDown,
    frames: {
      down: [MAZE_ASSETS.duckDown, MAZE_ASSETS.duckDown1, MAZE_ASSETS.duckDown2],
      up: [MAZE_ASSETS.duckUp, MAZE_ASSETS.duckUp1, MAZE_ASSETS.duckUp2],
      left: [MAZE_ASSETS.duckLeft, MAZE_ASSETS.duckLeft1, MAZE_ASSETS.duckLeft2],
      right: [MAZE_ASSETS.duckRight, MAZE_ASSETS.duckRight1, MAZE_ASSETS.duckRight2],
      upLeft: [MAZE_ASSETS.duckUpLeft], upRight: [MAZE_ASSETS.duckUpRight],
      downLeft: [MAZE_ASSETS.duckDownLeft], downRight: [MAZE_ASSETS.duckDownRight],
    }
  },
  { key: 'bee', name: '蜜蜂', img: MAZE_ASSETS.animalBee, single: true },
  { key: 'frog', name: '青蛙', img: MAZE_ASSETS.animalFrog, single: true },
  { key: 'ladybug', name: '瓢虫', img: MAZE_ASSETS.animalLadybug, single: true },
  { key: 'snail', name: '蜗牛', img: MAZE_ASSETS.animalSnail, single: true },
  { key: 'mouse', name: '小老鼠', img: MAZE_ASSETS.animalMouse, single: true },
  { key: 'worm', name: '毛毛虫', img: MAZE_ASSETS.animalWorm, single: true },
  { key: 'charMan', name: '小男人', img: MAZE_ASSETS.blockCharMan, single: true },
  { key: 'charWoman', name: '小女人', img: MAZE_ASSETS.blockCharWoman, single: true },
  { key: 'charWizard', name: '巫师', img: MAZE_ASSETS.blockCharWizard, single: true },
  { key: 'npcGreen', name: '绿色小人', img: MAZE_ASSETS.npcGreen, single: true },
  { key: 'npcPink', name: '粉色小人', img: MAZE_ASSETS.npcPink, single: true },
  { key: 'carRed', name: '红色赛车', img: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Cars/car_red_1.png', single: true, rotate: true, baseDir: 'up', scale: 0.55, anchor: 'center' },
  { key: 'carBlue', name: '蓝色赛车', img: '/assets/kenney/2.5d/kenney_racing-pack/PNG/Cars/car_blue_1.png', single: true, rotate: true, baseDir: 'up', scale: 0.55, anchor: 'center' },
];

/* ═══════════════════════════════════════════
   可选终点目标
   ═══════════════════════════════════════════ */
export const GOAL_TYPES = [
  { key: 'pool', name: '水池', render: 'pool' },
  { key: 'treasure', name: '宝箱', img: MAZE_ASSETS.blockBoxTreasure, render: 'sprite' },
  { key: 'castle', name: '城门', img: MAZE_ASSETS.blockCastleGate, render: 'sprite' },
  { key: 'house', name: '房子', img: MAZE_ASSETS.bgHouse1, render: 'sprite' },
  { key: 'heart', name: '爱心', img: MAZE_ASSETS.heart, render: 'sprite' },
  { key: 'cupcake', name: '蛋糕', img: MAZE_ASSETS.cupCake, render: 'sprite' },
  { key: 'flag', name: '旗帜', img: '/assets/kenney/kenney_board-game-icons/PNG/Default (64px)/flag_triangle.png', render: 'sprite' },
];

/**
 * Style → decoration type keys (must match MAZE_ASSETS keys)
 */
const STYLE_DECORATIONS = {
  forest: [
    'treePine', 'treeRound', 'treeBig', 'treeSlim', 'treeTall', 'treeBroad',
    'bush', 'bushSmall', 'bushBig', 'flower', 'flowerWhite', 'grassTuft',
    'trunk1', 'trunk2', 'rockSmall', 'rockBig',
    'animalBee', 'animalFrog', 'animalLadybug', 'animalSnail', 'animalMouse',
    'bgTreePine', 'bgFence',
  ],
  candy: [
    'candyBlue', 'candyRed', 'candyGreen', 'candyYellow',
    'lollipopRed', 'lollipopGreen', 'lollipopFruitRed', 'lollipopFruitGreen', 'lollipopFruitYellow',
    'cherry', 'cookieBrown', 'cookieChoco', 'cookiePink', 'cupCake', 'heart',
    'canePink', 'canePinkSmall', 'waffleChoco', 'wafflePink',
    'creamChoco', 'creamPink', 'gummyWormGreen', 'gummyWormRed',
  ],
  city: [
    'blockTreeGreen', 'blockTreeOrange', 'blockTreeRed',
    'blockBushLarge', 'blockBushSmall',
    'blockMarketBlue', 'blockMarketRed',
    'blockFenceSingle', 'blockFenceDouble',
    'blockCart', 'blockCartHorse', 'blockBox', 'blockBoxWide', 'blockBoxTreasure',
    'blockDoor', 'blockDoorOpen', 'blockDoorGlass',
    'blockLadderLarge', 'blockLadderSmall',
    'blockHouseBlue', 'blockHouseRed', 'blockCastle', 'blockCastleGate', 'blockBridge',
    'blockCharMan', 'blockCharWoman', 'blockCharWizard',
    'bgHouse1', 'bgHouse2', 'bgHouseSmall1', 'bgCastleSmall', 'bgTower',
    'npcGreen', 'npcPink',
  ],
  racing: [
    'raceTreeLarge', 'raceTreeSmall',
    'raceRock1', 'raceRock2', 'raceRock3',
    'raceTentBlue', 'raceTentRed',
    'raceBarrelBlue', 'raceBarrelRed', 'raceCone',
    'bgFence', 'blockFenceSingle',
    'npcYellow', 'npcPurple',
  ],
  village: [
    'blockTreeGreen', 'blockTreeRed', 'blockBushLarge', 'blockBushSmall',
    'blockFenceSingle', 'blockFenceDouble',
    'blockHouseBlue', 'blockHouseRed', 'blockCastleGate',
    'blockCart', 'blockCartHorse', 'blockBox', 'blockBoxTreasure',
    'blockCharMan', 'blockCharWoman', 'blockCharHorse',
    'bgHouse1', 'bgHouseSmall1', 'bgHouseSmall2',
    'animalFrog', 'animalSnail', 'animalMouse',
    'flower', 'flowerWhite', 'bush', 'treePine', 'treeRound',
    'bgFence', 'rockSmall',
  ],
  autumn: [
    'treeOrange1', 'treeOrange2', 'treeOrange3', 'treeOrangeRound', 'treeOrangeBig',
    'treeOrangeBroad', 'treeOrangeTall',
    'bush', 'bushBig', 'flower', 'grassTuft', 'trunk1', 'trunk2',
    'rockSmall', 'rockBig',
    'animalSnail', 'animalMouse', 'animalLadybug',
    'bgTreeOrange', 'bgFence',
  ],
  winter: [
    'treeSnowPine1', 'treeSnowPine2', 'treeSnowPine3',
    'treeIcePine1', 'treeIcePine2',
    'rockSmall', 'rockBig', 'bushSmall',
    'bgTreeFrozen',
    'animalMouse', 'animalFly',
  ],
};

/** Decorations for the infinite world area outside the maze */
const WORLD_DECORATIONS = {
  forest: ['treePine', 'treeRound', 'treeBig', 'treeSlim', 'bush', 'bushSmall', 'flower', 'flowerWhite', 'grassTuft', 'rockSmall'],
  candy: ['candyBlue', 'candyRed', 'lollipopRed', 'lollipopGreen', 'cherry', 'cookieBrown', 'cupCake', 'heart', 'canePinkSmall'],
  city: ['blockTreeGreen', 'blockBushSmall', 'blockFenceSingle', 'bgHouseSmall1', 'bgHouseSmall2', 'bgFence', 'blockBox'],
  racing: ['raceTreeSmall', 'raceRock1', 'raceRock2', 'raceCone', 'bgFence'],
  village: ['treePine', 'treeRound', 'bush', 'flower', 'bgFence', 'blockFenceSingle', 'bgHouseSmall1', 'rockSmall'],
  autumn: ['treeOrange1', 'treeOrange2', 'treeOrangeRound', 'bush', 'grassTuft', 'trunk1', 'rockSmall'],
  winter: ['treeSnowPine1', 'treeSnowPine2', 'treeIcePine1', 'rockSmall', 'rockBig', 'bushSmall'],
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a complex maze from a user-drawn path.
 * v3: Uniform branch distribution + style ground tiles + canvas sizes + character/goal
 *
 * @param {Array<{gx:number,gy:number}>} userPath
 * @param {number} gridW
 * @param {number} gridH
 * @param {string} style
 * @param {object} options - { character, goalType, extraDecoKeys }
 * @returns {object} MazePathGame-compatible level
 */
/* ═══════════════════════════════════════════
   自动生成随机路径（当用户未绘制路线时使用）
   入口：左上角附近  出口：右下角附近
   路线带有弯曲和绕行，增加复杂度
   ═══════════════════════════════════════════ */
function generateRandomPath(gridW, gridH) {
  const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // right, down, left, up
  const minLen = Math.max(10, gridW + gridH); // longer paths for complexity
  const maxAttempts = 30;

  // Fixed start: upper-left corner area
  const sx = 1 + Math.floor(Math.random() * 2);
  const sy = 1 + Math.floor(Math.random() * 2);
  // Fixed exit target: lower-right corner area
  const ex = gridW - 2 - Math.floor(Math.random() * 2);
  const ey = gridH - 2 - Math.floor(Math.random() * 2);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const path = [{ gx: sx, gy: sy }];
    const visited = new Set();
    visited.add(`${sx},${sy}`);
    let cx = sx, cy = sy;

    const targetLen = minLen + Math.floor(Math.random() * Math.floor(minLen * 0.6));

    for (let step = 0; step < targetLen * 4; step++) {
      if (path.length >= targetLen) break;

      // Weight directions: 60% bias toward exit, 40% random detour
      const distX = ex - cx, distY = ey - cy;
      let weighted;
      if (Math.random() < 0.6) {
        // Prefer moving toward exit
        const towards = [];
        if (distX > 0) towards.push([1, 0]);
        if (distX < 0) towards.push([-1, 0]);
        if (distY > 0) towards.push([0, 1]);
        if (distY < 0) towards.push([0, -1]);
        // Shuffle the towards directions + add remaining as fallback
        const rest = dirs.filter(d => !towards.some(t => t[0] === d[0] && t[1] === d[1]));
        weighted = [...towards.sort(() => Math.random() - 0.5), ...rest.sort(() => Math.random() - 0.5)];
      } else {
        // Random detour — perpendicular directions preferred for winding
        const perp = (distX !== 0) ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
        weighted = [...perp.sort(() => Math.random() - 0.5), ...dirs.sort(() => Math.random() - 0.5)];
      }

      let advanced = false;
      for (const [dx, dy] of weighted) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 1 || nx >= gridW - 1 || ny < 1 || ny >= gridH - 1) continue;
        if (visited.has(`${nx},${ny}`)) continue;

        path.push({ gx: nx, gy: ny });
        visited.add(`${nx},${ny}`);
        cx = nx; cy = ny;
        advanced = true;
        break;
      }
      if (!advanced) break;
    }

    // Check quality: path should be long enough AND end near the exit
    const lastP = path[path.length - 1];
    const endDist = Math.abs(lastP.gx - ex) + Math.abs(lastP.gy - ey);
    if (path.length >= minLen && endDist <= 4) {
      console.log('[mazeGenerator] Random path: attempt', attempt + 1,
        'len:', path.length, 'start:', `(${sx},${sy})`, 'end:', `(${lastP.gx},${lastP.gy})`);
      return path;
    }
  }

  // Fallback: Z-shaped path from upper-left to lower-right
  const path = [];
  const midY = Math.floor(gridH / 2);
  for (let x = 1; x <= gridW - 2; x++) path.push({ gx: x, gy: 1 });
  for (let y = 2; y <= midY; y++) path.push({ gx: gridW - 2, gy: y });
  for (let x = gridW - 3; x >= 1; x--) path.push({ gx: x, gy: midY });
  for (let y = midY + 1; y <= gridH - 2; y++) path.push({ gx: 1, gy: y });
  for (let x = 2; x <= gridW - 2; x++) path.push({ gx: x, gy: gridH - 2 });
  console.log('[mazeGenerator] Random path fallback Z-shape, len:', path.length);
  return path;
}

export function generateMazeFromPath(userPath, gridW = 18, gridH = 14, style = 'forest', options = {}) {
  const { character = 'duck', goalType = 'pool', extraDecoKeys = [] } = options;
  console.log('[mazeGenerator] v3 generating', { gridW, gridH, style, character, goalType, pathLen: userPath.length });

  const grid = Array.from({ length: gridH }, () => Array(gridW).fill(0));
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];

  // ── Auto-generate path if user didn't draw one ──
  if (!userPath || userPath.length < 3) {
    console.log('[mazeGenerator] Auto-generating random path...');
    userPath = generateRandomPath(gridW, gridH);
    console.log('[mazeGenerator] Auto-generated path length:', userPath.length);
  }

  // 1. Mark user path
  userPath.forEach((p, i) => {
    if (p.gx >= 1 && p.gx < gridW - 1 && p.gy >= 1 && p.gy < gridH - 1) {
      grid[p.gy][p.gx] = (i === userPath.length - 1) ? 2 : 1;
    }
  });

  const start = userPath[0] || { gx: 1, gy: 1 };
  const gridArea = (gridW - 2) * (gridH - 2); // inner area
  const gridScale = Math.max(gridW, gridH); // scale factor for proportional adjustments

  // 2. Generate scale-aware branches that fill the canvas
  // Minimum straight steps after a turn — scales with grid size
  // small(14): 2, medium(20): 3, large(28): 4+
  const minStraightAfterTurn = Math.max(2, Math.floor(gridScale / 7));

  // ─── Helper: try to grow a branch from (sx,sy) ───
  function growBranch(sx, sy, targetLen, minReconnect) {
    let cx = sx, cy = sy;
    const cells = [];
    let prevDx = 0, prevDy = 0; // track current direction
    let straightCount = minStraightAfterTurn; // start with enough to allow first turn

    for (let step = 0; step < targetLen; step++) {
      // Sort directions: prefer continuing straight, only allow turns after minStraight
      let candidateDirs = shuffle([...dirs]);
      if (prevDx !== 0 || prevDy !== 0) {
        if (straightCount < minStraightAfterTurn) {
          // Must continue straight — only allow current direction
          candidateDirs = [[prevDx, prevDy]];
        } else {
          // Prefer straight but allow turns — put current dir first for bias
          candidateDirs = [[prevDx, prevDy], ...candidateDirs.filter(([dx, dy]) => dx !== prevDx || dy !== prevDy)];
        }
      }

      let advanced = false;
      for (const [dx, dy] of candidateDirs) {
        const nx = cx + dx, ny = cy + dy;
        if (nx <= 0 || nx >= gridW - 1 || ny <= 0 || ny >= gridH - 1) continue;

        if (grid[ny][nx] > 0) {
          // Reconnect only if walked far enough (wider loops for bigger grids)
          if (cells.length >= minReconnect) {
            cells.forEach(c => { if (grid[c.gy][c.gx] === 0) grid[c.gy][c.gx] = 1; });
            return true; // successfully formed a loop
          }
          continue;
        }

        // Density check: count adjacent roads (cardinal)
        let adjRoads = 0;
        for (const [ddx, ddy] of dirs) {
          const nnx = nx + ddx, nny = ny + ddy;
          if (nnx >= 0 && nnx < gridW && nny >= 0 && nny < gridH && grid[nny][nnx] > 0) adjRoads++;
        }
        // Strict density check: never place next to more than 1 existing road
        if (adjRoads > 1 && cells.length > 0) continue;

        // Track direction change
        const isTurn = (prevDx !== 0 || prevDy !== 0) && (dx !== prevDx || dy !== prevDy);
        if (isTurn) {
          straightCount = 0; // reset counter on turn
        } else {
          straightCount++;
        }
        prevDx = dx; prevDy = dy;

        cells.push({ gx: nx, gy: ny });
        cx = nx; cy = ny;
        advanced = true;
        break;
      }
      if (!advanced) break;
    }
    // Commit dead-end branches with probability
    if (cells.length >= 2 && Math.random() < 0.55) {
      cells.forEach(c => { if (grid[c.gy][c.gx] === 0) grid[c.gy][c.gx] = 1; });
      return true;
    }
    return false;
  }

  // ─── Pass 1: Zone-based branching from main path ───
  const roadCells = userPath.filter(p => p.gx > 1 && p.gx < gridW - 2 && p.gy > 1 && p.gy < gridH - 2);
  const zoneSize = Math.max(3, Math.ceil(gridScale / 5)); // smaller zones = more even coverage
  const zones = new Map();
  roadCells.forEach(p => {
    const zk = `${Math.floor(p.gx / zoneSize)},${Math.floor(p.gy / zoneSize)}`;
    if (!zones.has(zk)) zones.set(zk, []);
    zones.get(zk).push(p);
  });

  // Branch length scales with grid: small=4-7, medium=6-12, large=10-18
  const minBranchLen = Math.max(3, Math.floor(gridScale / 5));
  const maxBranchLen = Math.max(6, Math.floor(gridScale / 2.5));
  // Minimum reconnect distance scales with grid: small=2, medium=3-4, large=5-7
  const minReconnect = Math.max(2, Math.floor(gridScale / 6));

  const branchStarts = [];
  const bpz = Math.max(1, Math.ceil(roadCells.length / Math.max(1, zones.size * 2)));
  for (const [, cells] of zones) {
    branchStarts.push(...shuffle([...cells]).slice(0, bpz));
  }
  branchStarts.push(...shuffle([...roadCells]).slice(0, Math.max(3, Math.floor(roadCells.length * 0.15))));

  for (const bs of branchStarts) {
    const len = minBranchLen + Math.floor(Math.random() * (maxBranchLen - minBranchLen));
    growBranch(bs.gx, bs.gy, len, minReconnect);
  }

  // ─── Pass 2: Coverage fill — find empty regions and grow toward them ───
  const targetCoverage = 0.35; // aim for ~35% road coverage
  const maxFillPasses = 3;
  for (let pass = 0; pass < maxFillPasses; pass++) {
    // Count current road coverage
    let roadCount = 0;
    for (let y = 1; y < gridH - 1; y++)
      for (let x = 1; x < gridW - 1; x++)
        if (grid[y][x] > 0) roadCount++;
    if (roadCount / gridArea >= targetCoverage) break;

    // Find road cells that border empty space (frontier cells)
    const frontierCells = [];
    for (let y = 1; y < gridH - 1; y++) {
      for (let x = 1; x < gridW - 1; x++) {
        if (grid[y][x] <= 0) continue;
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (nx > 0 && nx < gridW - 1 && ny > 0 && ny < gridH - 1 && grid[ny][nx] === 0) {
            frontierCells.push({ gx: x, gy: y });
            break;
          }
        }
      }
    }

    // Grow branches from spaced-out frontier cells
    const fillStarts = shuffle(frontierCells);
    const spacing = Math.max(2, Math.floor(gridScale / 8));
    const used = new Set();
    for (const fs of fillStarts) {
      // Skip if too close to another fill start
      const sk = `${Math.floor(fs.gx / spacing)},${Math.floor(fs.gy / spacing)}`;
      if (used.has(sk)) continue;
      used.add(sk);
      const len = minBranchLen + Math.floor(Math.random() * (maxBranchLen - minBranchLen));
      growBranch(fs.gx, fs.gy, len, Math.max(2, minReconnect - 1));
    }
  }

  // ─── Pass 3: Post-generation cleanup — remove dense patterns ───
  // Build a set of protected cells (user path) that shouldn't be removed
  const protectedCells = new Set();
  userPath.forEach(p => protectedCells.add(`${p.gx},${p.gy}`));

  // Cleanup: remove road cells that form 2×2 all-road blocks
  let cleaned = true;
  let cleanIter = 0;
  while (cleaned && cleanIter < 5) {
    cleaned = false;
    cleanIter++;
    for (let y = 1; y < gridH - 2; y++) {
      for (let x = 1; x < gridW - 2; x++) {
        // Check 2×2 block: (x,y), (x+1,y), (x,y+1), (x+1,y+1)
        if (grid[y][x] > 0 && grid[y][x + 1] > 0 && grid[y + 1][x] > 0 && grid[y + 1][x + 1] > 0) {
          // Find a removable cell (not protected, not goal=2)
          const candidates = [
            { gx: x, gy: y }, { gx: x + 1, gy: y },
            { gx: x, gy: y + 1 }, { gx: x + 1, gy: y + 1 },
          ].filter(c => !protectedCells.has(`${c.gx},${c.gy}`) && grid[c.gy][c.gx] === 1);
          if (candidates.length > 0) {
            // Remove the one with the most road neighbors (least isolated)
            let best = candidates[0], bestN = 0;
            for (const c of candidates) {
              let n = 0;
              for (const [dx, dy] of dirs) {
                const nx = c.gx + dx, ny = c.gy + dy;
                if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH && grid[ny][nx] > 0) n++;
              }
              if (n > bestN) { bestN = n; best = c; }
            }
            grid[best.gy][best.gx] = 0;
            cleaned = true;
          }
        }
      }
    }
  }

  // ─── Pass 4: Connectivity audit — remove disconnected paths ───
  // BFS from the start cell to find all reachable road cells
  {
    const visited = Array.from({ length: gridH }, () => Array(gridW).fill(false));
    const queue = [{ gx: start.gx, gy: start.gy }];
    visited[start.gy][start.gx] = true;

    while (queue.length > 0) {
      const { gx, gy } = queue.shift();
      for (const [dx, dy] of dirs) {
        const nx = gx + dx, ny = gy + dy;
        if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH && !visited[ny][nx] && grid[ny][nx] > 0) {
          visited[ny][nx] = true;
          queue.push({ gx: nx, gy: ny });
        }
      }
    }

    // Remove any road cells not reachable from start (disconnected fragments)
    let removedCount = 0;
    for (let y = 1; y < gridH - 1; y++) {
      for (let x = 1; x < gridW - 1; x++) {
        if (grid[y][x] > 0 && !visited[y][x]) {
          grid[y][x] = 0;
          removedCount++;
        }
      }
    }
    if (removedCount > 0) {
      console.log('[mazeGenerator] Connectivity audit removed', removedCount, 'disconnected road cells');
    }
  }

  // 4. Ensure border is walls and re-mark user path
  for (let x = 0; x < gridW; x++) { grid[0][x] = 0; grid[gridH - 1][x] = 0; }
  for (let y = 0; y < gridH; y++) { grid[y][0] = 0; grid[y][gridW - 1] = 0; }
  userPath.forEach((p, i) => {
    if (p.gx > 0 && p.gx < gridW - 1 && p.gy > 0 && p.gy < gridH - 1) {
      grid[p.gy][p.gx] = (i === userPath.length - 1) ? 2 : 1;
    }
  });

  // 5. Generate decorations — merge style + extra user-selected keys
  let decoTypes = [...(STYLE_DECORATIONS[style] || STYLE_DECORATIONS.forest)];
  if (extraDecoKeys.length > 0) {
    // Filter to valid MAZE_ASSETS keys only
    const validExtras = extraDecoKeys.filter(k => MAZE_ASSETS[k]);
    decoTypes = [...new Set([...decoTypes, ...validExtras])];
  }
  const decorations = [];
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      if (grid[y][x] === 0 && Math.random() < 0.22) {
        decorations.push({
          type: decoTypes[Math.floor(Math.random() * decoTypes.length)],
          gx: x, gy: y,
        });
      }
    }
  }

  // 6. Generate world decorations
  const worldDecoTypes = WORLD_DECORATIONS[style] || WORLD_DECORATIONS.forest;
  const worldDecorations = [];
  const WORLD_MARGIN = 6;
  for (let y = -WORLD_MARGIN; y < gridH + WORLD_MARGIN; y++) {
    for (let x = -WORLD_MARGIN; x < gridW + WORLD_MARGIN; x++) {
      if (x >= 0 && x < gridW && y >= 0 && y < gridH) continue;
      if (Math.random() < 0.15) {
        worldDecorations.push({
          type: worldDecoTypes[Math.floor(Math.random() * worldDecoTypes.length)],
          gx: x, gy: y,
        });
      }
    }
  }

  // 7. Build ground tile set based on style
  const groundType = STYLE_GROUND[style] || 'grass';
  const groundTiles = GROUND_TILES[groundType];

  // 8. Build character info
  const charDef = PLAYER_CHARACTERS.find(c => c.key === character) || PLAYER_CHARACTERS[0];

  // 9. Build goal info
  const goalDef = GOAL_TYPES.find(g => g.key === goalType) || GOAL_TYPES[0];

  const level = {
    id: `ai_maze_${Date.now()}`,
    name: 'AI 创作迷宫',
    desc: '你画的路，你的迷宫！',
    gridW, gridH,
    tileSize: 64,
    grid,
    playerStart: { gx: start.gx, gy: start.gy },
    decorations,
    worldDecorations,
    stars: {
      s3: Math.max(15, userPath.length + 5),
      s2: Math.max(25, userPath.length + 15),
      s1: Math.max(40, userPath.length + 30),
    },
    // v3 new fields
    groundTiles,
    characterDef: charDef,
    goalDef: goalDef,
    style,
  };

  console.log('[mazeGenerator] v3 Generated level:', level.id,
    'roads:', grid.flat().filter(c => c > 0).length,
    'ground:', groundType, 'char:', character, 'goal:', goalType);
  return level;
}

/** Loading preview assets */
export const LOADING_PREVIEW_ASSETS = [
  '/assets/kenney/2.5d/kenney_foliage-pack/PNG/Default size/foliagePack_005.png',
  '/assets/kenney/2.5d/kenney_foliage-pack/PNG/Default size/foliagePack_008.png',
  '/assets/kenney/2.5d/kenney_foliage-pack/PNG/Default size/foliagePack_001.png',
  '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/foliageTree_green.png',
  '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/market_stallBlue.png',
  '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/tileCastle.png',
  '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/box_treasure.png',
  '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/character_man.png',
  '/assets/kenney/2.5d/kenney_block-pack/PNG/Default (64px)/character_woman.png',
  '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/tree_large.png',
  '/assets/kenney/2.5d/kenney_racing-pack/PNG/Objects/tent_blue.png',
  '/assets/kenney/2.5d/kenney_racing-pack/PNG/Cars/car_red_1.png',
  '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/lollipopRed.png',
  '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/candyBlue.png',
  '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/cherry.png',
  '/assets/kenney/2.5d/kenney_platformer-art-candy/Tiles/cupCake.png',
  '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/bee_rest.png',
  '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/frog_idle.png',
  '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites/Enemies/Double/ladybug_rest.png',
  '/assets/custom/duck/duck_down.png',
  '/assets/custom/duck/duck_right.png',
];

/** Style options for the selector UI */
export const MAZE_STYLES = [
  { key: 'forest',  label: '森林',  color: '#2d6a4f' },
  { key: 'candy',   label: '糖果',  color: '#e63946' },
  { key: 'city',    label: '城市',  color: '#457b9d' },
  { key: 'racing',  label: '赛车',  color: '#e76f51' },
  { key: 'village', label: '村庄',  color: '#8d6e63' },
  { key: 'autumn',  label: '秋天',  color: '#cc7722' },
  { key: 'winter',  label: '冬天',  color: '#5fa8d3' },
];
