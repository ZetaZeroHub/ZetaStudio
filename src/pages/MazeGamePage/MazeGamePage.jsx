import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, ArrowRight, ChevronLeft, ChevronRight, Heart, Coins } from 'lucide-react';
import * as PIXI from 'pixi.js';
import { getLevelById, getTheme } from '../../data/mazeLevels';
import { ELEMENTS, getUnlockedElements } from '../../data/elements';
import { drawKnight, drawEnemy, drawItem, drawDoor, drawBubble, drawPortal, drawLockedDoor, drawWaterPit, drawInteractable } from './engine/renderer';
import { PHYSICS, applyInput, applyGravity, moveX, moveY, checkFallDeath, updateCamera, initInteractables, updateInteractables } from './engine/physics';
import { createEnemySprite, updateEnemyAI, fireProjectile, updateProjectiles, checkEnemyCollisions, collectItems, WEAPON_MODES, WEAPON_ORDER, cycleWeapon } from './engine/combat';
import { loadAllPlatformerAssets } from '../../engine/AssetLoader';
import { createCharacterAnimator, createEnemyAnimator, getCharacterState } from '../../engine/SpriteAnimator';
import { playSound, preloadSounds } from './engine/audioManager';
import styles from './MazeGamePage.module.css';

/* ===== Merchant Items ===== */
const MERCHANT_ITEMS = [
  { id: 'shield',   name: '🛡️ 护盾',     cost: 2, desc: '抵挡1次伤害', icon: '🛡️' },
  { id: 'speed',    name: '⚡ 疾风靴',   cost: 3, desc: '移速+50% 15秒', icon: '⚡' },
  { id: 'magnet',   name: '🧲 金币磁铁', cost: 2, desc: '自动吸引金币', icon: '🧲' },
  { id: 'djump',    name: '🦘 二段跳',   cost: 4, desc: '空中再跳一次', icon: '🦘' },
  { id: 'life',     name: '💗 额外生命', cost: 3, desc: '+1生命值',    icon: '💗' },
];

/* ===== Main Component ===== */
export default function MazeGamePage() {
  const { levelId, draftId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const gsRef = useRef(null);
  const showShopRef = useRef(false);

  const [hp, setHp] = useState(3);
  const [coins, setCoins] = useState(0);
  const [score, setScore] = useState(0);
  const [victory, setVictory] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);
  const [currentElement, setCurrentElement] = useState('none');  // tracks UI display
  const [currentWeapon, setCurrentWeapon] = useState('bubble');
  const [showShop, setShowShop] = useState(false);
  const [shopCoins, setShopCoins] = useState(0);
  const staticLevel = getLevelById(levelId);

  // Load level data: either from a specific draft (play-draft route) or official level (play route)
  // IMPORTANT: Drafts are ONLY loaded via explicit /maze/play-draft/:draftId route
  //            Official /maze/play/:levelId route ALWAYS uses the original level data
  const level = useMemo(() => {
    // Case 1: Playing a specific draft by ID
    if (draftId) {
      try {
        const raw = localStorage.getItem('game_drafts_v1');
        if (raw) {
          const drafts = JSON.parse(raw);
          const draft = drafts.find(d => d.id === draftId);
          if (draft && draft.levelData) {
            // Deep clone to ensure complete isolation
            const draftData = JSON.parse(JSON.stringify(draft.levelData));
            // Get base level for fallback properties
            const base = draftData.baseLevelId ? getLevelById(draftData.baseLevelId) : null;
            const baseClone = base ? JSON.parse(JSON.stringify(base)) : {};
            console.log('[MazeGamePage] Playing DRAFT:', draftId, 'name:', draft.name,
              'items:', draftData.items?.length, 'platforms:', draftData.platforms?.length);
            return {
              ...baseClone,
              ...draftData,
              id: draftId, // Use draft ID, not base level ID
              name: draft.name || draftData.name || baseClone.name || '自定义关卡',
              platforms: draftData.platforms || baseClone.platforms || [],
              items: draftData.items || baseClone.items || [],
              enemies: draftData.enemies || baseClone.enemies || [],
              interactables: draftData.interactables || baseClone.interactables || [],
            };
          }
        }
      } catch (e) {
        console.warn('[MazeGamePage] Failed to read draft data for', draftId, e);
      }
      // Draft not found, show error
      console.error('[MazeGamePage] Draft not found:', draftId);
      return null;
    }

    // Case 2: Playing an official level — always use original data, never load drafts
    if (staticLevel) {
      console.log('[MazeGamePage] Playing OFFICIAL level:', levelId, staticLevel.name);
      // Deep clone to prevent any mutation of the original level data
      return JSON.parse(JSON.stringify(staticLevel));
    }

    return null;
  }, [staticLevel, levelId, draftId]);

  // Determine available elements based on difficulty
  const unlockedElements = level ? getUnlockedElements(level.difficulty) : ['none'];

  // Timer
  useEffect(() => {
    if (victory || gameOver || loading) return;
    const iv = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, [victory, gameOver, loading]);

  // Calculate stars
  const calcStars = useCallback(() => {
    if (!level) return 0;
    if (score >= level.parScore && time <= level.parTime) return 3;
    if (score >= level.parScore * 0.6 || time <= level.parTime * 1.5) return 2;
    return 1;
  }, [score, time, level]);

  /* ======= Game Engine Init ======= */
  useEffect(() => {
    if (!level || !canvasRef.current) return;
    const theme = getTheme(level.theme);
    const containerEl = canvasRef.current;

    while (containerEl.firstChild) containerEl.removeChild(containerEl.firstChild);

    const W = Math.max(containerEl.clientWidth, 400);
    const H = Math.max(containerEl.clientHeight, 400);

    const app = new PIXI.Application();
    let destroyed = false;

    const initApp = async () => {
      await app.init({ width: W, height: H, antialias: true, resolution: 1 });
      if (destroyed) { app.destroy(true); return; }
      while (containerEl.firstChild) containerEl.removeChild(containerEl.firstChild);
      containerEl.appendChild(app.canvas);
      appRef.current = app;

      // ── Load Kenney assets ──
      let kenneyAssets = null;
      try {
        kenneyAssets = await loadAllPlatformerAssets();
      } catch (e) {
        console.warn('[MazeGamePage] Failed to load Kenney assets, falling back to vector', e);
      }

      // Colors (fallback if assets fail)
      const skyTop = parseInt(theme.skyTop.replace('#', ''), 16);
      const skyBot = parseInt(theme.skyBottom.replace('#', ''), 16);
      const groundC = parseInt(theme.groundColor.replace('#', ''), 16);
      const groundD = parseInt(theme.groundDark.replace('#', ''), 16);
      const platC = parseInt(theme.platformColor.replace('#', ''), 16);
      const platT = parseInt(theme.platformTop.replace('#', ''), 16);
      const mtnC = parseInt(theme.bgMountain.replace('#', ''), 16);
      const treeC = parseInt(theme.bgTree.replace('#', ''), 16);

      // Layers
      const bgLayer = new PIXI.Container();
      const worldLayer = new PIXI.Container();
      const fgLayer = new PIXI.Container();
      app.stage.addChild(bgLayer, worldLayer, fgLayer);

      // ── Background ──
      if (kenneyAssets?.backgrounds) {
        // Use Kenney background images — select by level theme
        const bgKey = level.theme === 'desert' ? 'background_color_desert'
          : level.theme === 'candy' ? 'background_color_mushrooms'
          : level.theme === 'ocean' ? 'background_color_hills'
          : 'background_color_trees';
        const bgTex = kenneyAssets.backgrounds[bgKey] || kenneyAssets.backgrounds['background_color_trees'];
        if (bgTex) {
          const bgSprite = new PIXI.Sprite(bgTex);
          bgSprite.width = W;
          bgSprite.height = H;
          bgLayer.addChild(bgSprite);
        }
        // Clouds overlay
        const cloudTex = kenneyAssets.backgrounds['background_clouds'];
        if (cloudTex) {
          const cloudSprite = new PIXI.Sprite(cloudTex);
          cloudSprite.width = W;
          cloudSprite.height = H * 0.4;
          cloudSprite.alpha = 0.5;
          bgLayer.addChild(cloudSprite);
        }
      }

      // ── Terrain (World) ──
      const TILE_SIZE = 64;
      const groundContainer = new PIXI.Container(); worldLayer.addChild(groundContainer);
      const platformContainer = new PIXI.Container(); worldLayer.addChild(platformContainer);

      // Shared tile textures (used by drawWorld, items, and interactables)
      const tiles = kenneyAssets?.tiles || {};

      function drawWorld() {
        groundContainer.removeChildren();
        platformContainer.removeChildren();
        if (!kenneyAssets?.tiles) return;

        // Choose terrain material by theme
        const material = level.theme === 'desert' ? 'sand'
          : level.theme === 'candy' ? 'purple'
          : level.theme === 'ocean' ? 'stone'
          : 'grass'; // forest default

        level.platforms.forEach(p => {
          // ── Editor-placed tile with specific tileId → layered tiling (top + center) ──
          if (p.tileId) {
            // Extract material from tileId (e.g. 'grass_block_top' → 'grass', 'sand_cloud' → 'sand')
            const mat = p.tileId.replace(/_block.*|_cloud.*/, '') || material;
            const cols = Math.max(1, Math.ceil((p.w || TILE_SIZE) / TILE_SIZE));
            const isGround = p.y >= 500;
            const rows = isGround ? Math.max(2, Math.ceil((H - p.y + 200) / TILE_SIZE)) : 1;
            const container = isGround ? groundContainer : platformContainer;
            for (let col = 0; col < cols; col++) {
              for (let row = 0; row < rows; row++) {
                let tileName;
                if (row === 0) {
                  if (cols === 1) tileName = `terrain_${mat}_block`;
                  else if (col === 0) tileName = `terrain_${mat}_block_top_left`;
                  else if (col === cols - 1) tileName = `terrain_${mat}_block_top_right`;
                  else tileName = `terrain_${mat}_block_top`;
                } else {
                  if (cols === 1) tileName = `terrain_${mat}_block_center`;
                  else if (col === 0) tileName = `terrain_${mat}_block_left`;
                  else if (col === cols - 1) tileName = `terrain_${mat}_block_right`;
                  else tileName = `terrain_${mat}_block_center`;
                }
                const tex = tiles[tileName] || tiles[`terrain_${mat}_block`] || tiles[`terrain_grass_block_center`];
                if (tex) {
                  const spr = new PIXI.Sprite(tex);
                  spr.x = p.x + col * TILE_SIZE;
                  spr.y = p.y + row * TILE_SIZE;
                  spr.width = TILE_SIZE;
                  spr.height = TILE_SIZE;
                  container.addChild(spr);
                }
              }
            }
            return; // Skip theme-based tiling for editor tiles
          }
          const isGround = p.y >= 500;
          if (isGround) {
            // Tile-based ground rendering
            const cols = Math.max(1, Math.ceil(p.w / TILE_SIZE));
            const depth = Math.max(2, Math.ceil((H - p.y + 200) / TILE_SIZE));
            for (let col = 0; col < cols; col++) {
              for (let row = 0; row < depth; row++) {
                let tileName;
                if (row === 0) {
                  if (cols === 1) tileName = `terrain_${material}_block`;
                  else if (col === 0) tileName = `terrain_${material}_block_top_left`;
                  else if (col === cols - 1) tileName = `terrain_${material}_block_top_right`;
                  else tileName = `terrain_${material}_block_top`;
                } else {
                  if (cols === 1) tileName = `terrain_${material}_block_center`;
                  else if (col === 0) tileName = `terrain_${material}_block_left`;
                  else if (col === cols - 1) tileName = `terrain_${material}_block_right`;
                  else tileName = `terrain_${material}_block_center`;
                }
                const tex = tiles[tileName] || tiles[`terrain_grass_block_center`];
                if (tex) {
                  const spr = new PIXI.Sprite(tex);
                  spr.x = p.x + col * TILE_SIZE;
                  spr.y = p.y + row * TILE_SIZE;
                  spr.width = TILE_SIZE;
                  spr.height = TILE_SIZE;
                  groundContainer.addChild(spr);
                }
              }
            }
            // Grass decoration on top
            const grassTile = material === 'grass' ? 'grass'
              : material === 'purple' ? 'grass_purple' : null;
            if (grassTile && tiles[grassTile]) {
              for (let gx = p.x + TILE_SIZE * 0.5; gx < p.x + p.w - TILE_SIZE * 0.5; gx += TILE_SIZE * 1.5 + Math.random() * TILE_SIZE) {
                const dec = new PIXI.Sprite(tiles[grassTile]);
                dec.x = gx;
                dec.y = p.y - TILE_SIZE * 0.55;
                dec.width = TILE_SIZE * 0.65;
                dec.height = TILE_SIZE * 0.65;
                groundContainer.addChild(dec);
              }
            }
          } else {
            // Platform tiles (floating)
            // Physics collision surface is at p.y — tile bottom must align with it
            const cols = Math.max(1, Math.ceil(p.w / TILE_SIZE));
            for (let col = 0; col < cols; col++) {
              let tileName;
              if (cols === 1) tileName = `terrain_${material}_cloud`;
              else if (col === 0) tileName = `terrain_${material}_cloud_left`;
              else if (col === cols - 1) tileName = `terrain_${material}_cloud_right`;
              else tileName = `terrain_${material}_cloud_middle`;
              const tex = tiles[tileName] || tiles[`terrain_${material}_horizontal_middle`];
              if (tex) {
                const spr = new PIXI.Sprite(tex);
                spr.x = p.x + col * TILE_SIZE;
                spr.y = p.y;  // Tile top = collision surface, extends downward
                spr.width = TILE_SIZE;
                spr.height = TILE_SIZE;
                platformContainer.addChild(spr);
              }
            }
          }
        });
      }
      drawWorld();

      // Exit door
      const doorGfx = new PIXI.Graphics();
      drawDoor(doorGfx);
      doorGfx.x = level.exitDoor.x;
      doorGfx.y = level.exitDoor.y;
      worldLayer.addChild(doorGfx);

      // Environment mechanisms (portals, water pits, locked doors)
      const mechSprites = [];
      if (level.mechanisms) {
        level.mechanisms.forEach(mech => {
          const g = new PIXI.Graphics();
          g.x = mech.x; g.y = mech.y;
          g._type = mech.type;
          g._data = mech;
          g._active = true;
          worldLayer.addChild(g);
          mechSprites.push(g);
        });
      }

      // Items — support tileId for editor-placed items
      const ITEM_TEX_MAP = {
        coin: 'coin_gold', heart: 'heart', star: 'star',
        gem_blue: 'gem_blue', gem_red: 'gem_red', gem_green: 'gem_green', gem_yellow: 'gem_yellow',
        key_blue: 'key_blue', key_red: 'key_red', key_green: 'key_green', key_yellow: 'key_yellow',
        mushroom_red: 'mushroom_red', mushroom_brown: 'mushroom_brown',
        fireball: 'fireball', flag_green: 'flag_green_a',
      };
      const itemSprites = level.items.map(item => {
        const texName = item.tileId || ITEM_TEX_MAP[item.type] || item.type;
        const tex = tiles[texName];
        if (tex) {
          const spr = new PIXI.Sprite(tex);
          spr.x = item.x; spr.y = item.y;
          spr.width = 28; spr.height = 28;
          spr._type = item.type;
          spr._collected = false;
          spr._isSprite = true;
          worldLayer.addChild(spr);
          return spr;
        }
        // Fallback to vector drawing
        const g = new PIXI.Graphics();
        g.x = item.x; g.y = item.y;
        g._type = item.type;
        g._collected = false;
        worldLayer.addChild(g);
        return g;
      });

       // Enemies — with sprite animations
      const enemyAnimators = [];
      const enemies = level.enemies.map(en => {
        const enemy = createEnemySprite(en);

        // Try to create Kenney sprite enemy
        const kenneyEnemyType = {
          slime: 'slime_normal', bat: 'bee', frog: 'frog',
          spider: 'ladybug', worm: 'worm_normal', turtle: 'snail',
          ghost: 'fly', mushroom: 'slime_fire',
        }[en.type] || 'slime_normal';

        const enemyData = kenneyAssets?.enemies?.[kenneyEnemyType];
        if (enemyData) {
          const eAnim = createEnemyAnimator(enemyData);
          eAnim.setPosition(en.x, en.y);
          worldLayer.addChild(eAnim.sprite);
          enemy._animator = eAnim;
          enemy.gfx = eAnim.sprite; // still used for position
          enemyAnimators.push(eAnim);
        } else {
          // Fallback to vector
          enemy.gfx = new PIXI.Graphics();
          enemy.gfx.x = en.x;
          enemy.gfx.y = en.y;
          worldLayer.addChild(enemy.gfx);
        }
        return enemy;
      });

      // ── BOSS — add from level.boss ──
      let bossEnemy = null;
      let bossHpBar = null;
      if (level.boss) {
        const boss = createEnemySprite({ ...level.boss, isBoss: true });
        boss.isBoss = true;

        // Visual: larger slime sprite or vector
        const bossKenneyType = {
          treant: 'slime_normal', crab: 'slime_normal',
          witch: 'fly', scorpion: 'slime_fire',
        }[level.boss.type] || 'slime_normal';
        const bossData = kenneyAssets?.enemies?.[bossKenneyType];
        if (bossData) {
          const bAnim = createEnemyAnimator(bossData);
          bAnim.setPosition(level.boss.x, level.boss.y);
          bAnim.sprite.scale.set(bAnim.sprite.scale.x * 2.0, bAnim.sprite.scale.y * 2.0);
          worldLayer.addChild(bAnim.sprite);
          boss._animator = bAnim;
          boss.gfx = bAnim.sprite;
          enemyAnimators.push(bAnim);
        } else {
          boss.gfx = new PIXI.Graphics();
          boss.gfx.x = level.boss.x;
          boss.gfx.y = level.boss.y;
          worldLayer.addChild(boss.gfx);
        }
        enemies.push(boss);
        bossEnemy = boss;

        // BOSS HP bar (UI layer)
        bossHpBar = new PIXI.Graphics();
        fgLayer.addChild(bossHpBar);
      }

      // ── Merchant NPC (kenney animal-pack sprite) ──
      let merchantContainer = null;
      let merchantLabel = null;
      let merchantPrompt = null;
      if (level.merchant) {
        merchantContainer = new PIXI.Container();
        // Use animal-pack sprite based on level theme
        const merchantSprites = {
          forest:  '/assets/kenney/kenney_animal-pack/PNG/Round/panda.png',
          ocean:   '/assets/kenney/kenney_animal-pack/PNG/Round/penguin.png',
          candy:   '/assets/kenney/kenney_animal-pack/PNG/Round/rabbit.png',
          desert:  '/assets/kenney/kenney_animal-pack/PNG/Round/elephant.png',
        };
        const npcTexPath = merchantSprites[level.theme] || merchantSprites.forest;
        // Async load the animal sprite to avoid Cache miss
        PIXI.Assets.load(npcTexPath).then(npcTex => {
          const npcSprite = new PIXI.Sprite(npcTex);
          npcSprite.anchor.set(0.5, 1.0);
          npcSprite.scale.set(0.45);
          merchantContainer.addChildAt(npcSprite, 0);
        }).catch(() => {
          // Fallback: draw a simple circle placeholder
          const fallback = new PIXI.Graphics();
          fallback.beginFill(0xFFAA00); fallback.drawCircle(0, -20, 20); fallback.endFill();
          merchantContainer.addChildAt(fallback, 0);
        });
        merchantContainer.x = level.merchant.x;
        merchantContainer.y = level.merchant.y;
        // Make touchable for mobile
        merchantContainer.eventMode = 'static';
        merchantContainer.cursor = 'pointer';
        merchantContainer.hitArea = new PIXI.Rectangle(-30, -60, 60, 60);
        merchantContainer.on('pointerdown', () => {
          const gs = gsRef.current;
          if (gs && gs.nearMerchant) {
            setShowShop(true);
            showShopRef.current = true;
            setShopCoins(gs.coins);
            playSound('click', 0.5);
          }
        });
        worldLayer.addChild(merchantContainer);

        merchantLabel = new PIXI.Text({ text: level.merchant.name, style: {
          fontSize: 11, fill: 0xFFFFFF, fontWeight: 'bold',
          dropShadow: true, dropShadowDistance: 1, dropShadowColor: '#000',
        }});
        merchantLabel.anchor.set(0.5, 1);
        merchantLabel.x = level.merchant.x;
        merchantLabel.y = level.merchant.y - 58;
        worldLayer.addChild(merchantLabel);

        // "Press E" prompt (hidden until near)
        merchantPrompt = new PIXI.Text({ text: '按E / 点击 打开商店', style: {
          fontSize: 10, fill: 0xFFEB3B, fontWeight: 'bold',
          dropShadow: true, dropShadowDistance: 1, dropShadowColor: '#000',
        }});
        merchantPrompt.anchor.set(0.5, 1);
        merchantPrompt.x = level.merchant.x;
        merchantPrompt.y = level.merchant.y - 70;
        merchantPrompt.visible = false;
        worldLayer.addChild(merchantPrompt);
      }

      // Preload sounds
      preloadSounds();

      // Player — Kenney sprite animator
      let playerAnimator = null;
      let playerGfx = null;
      const charColor = 'green'; // default character color
      const charData = kenneyAssets?.characters?.[charColor];
      if (charData) {
        playerAnimator = createCharacterAnimator(charData);
        playerAnimator.setPosition(level.playerStart.x, level.playerStart.y);
        worldLayer.addChild(playerAnimator.sprite);
        playerGfx = playerAnimator.sprite;
      } else {
        // Fallback to vector graphics
        playerGfx = new PIXI.Graphics();
        playerGfx.x = level.playerStart.x;
        playerGfx.y = level.playerStart.y;
        worldLayer.addChild(playerGfx);
      }

      // Projectiles container
      const projectiles = [];

      // ── Interactables (问号砖/可破砖/推箱子/传送门/开关) ──
      const interactableData = initInteractables(level);
      // Map interactable type → spritesheet texture name
      const INTER_TEX_MAP = {
        questionBlock: 'block_exclamation',
        breakBlock: 'brick_brown',
        pushBox: 'block_brown',
        portal: 'door_closed_top',
        switch: 'switch_blue',
        spring: 'spring',
        spikes: 'spikes',
        bomb: 'bomb',
        torch: 'torch_on_a',
        ladder: 'ladder',
        rope: 'rop_attached',
        block_exclamation: 'block_exclamation',
        block_exclamation_active: 'block_exclamation_active',
        block_coin: 'block_coin',
        block_strong: 'block_strong_exclamation',
        switch_blue: 'switch_blue',
        switch_red: 'switch_red',
        switch_green: 'switch_green',
        switch_yellow: 'switch_yellow',
        bomb_active: 'bomb_active',
        torch_on: 'torch_on_a',
        torch_off: 'torch_off',
      };
      const interactableGfx = interactableData.map(obj => {
        const container = new PIXI.Container();
        container.x = obj.x;
        container.y = obj.y;
        const w = obj.w || 32, h = obj.h || 32;
        // Try to find a tile texture for this interactable
        const texName = obj.tileId || INTER_TEX_MAP[obj.type];
        const tex = texName ? tiles[texName] : null;
        if (tex) {
          const sprite = new PIXI.Sprite(tex);
          sprite.width = w;
          sprite.height = h;
          container.addChild(sprite);
          container._spriteChild = sprite;
        }
        // Always add a Graphics overlay for animations (shimmer, bounce, etc.)
        const gfx = new PIXI.Graphics();
        container.addChild(gfx);
        container._gfxChild = gfx;
        // If no texture, draw vector fallback
        if (!tex) {
          drawInteractable(gfx, obj, 0);
        }
        worldLayer.addChild(container);
        return { gfx: container, data: obj };
      });

      // Game State
      const gs = {
        px: level.playerStart.x, py: level.playerStart.y,
        vx: 0, vy: 0,
        facing: 'right', onGround: false,
        hp: 3, maxHp: 3, coins: 0, score: 0, stars: 0,
        invincible: 0, hurtTimer: 0, hurtFlash: 0, attackTimer: 0,
        inWater: false, waterBubbles: false,
        inventory: [], // collected keys etc.
        frame: 0, cameraX: 0, cameraY: 0,
        keys: {},
        mBtnLeft: false, mBtnRight: false, mJump: false, mAttack: false,
        won: false, dead: false,
        currentElement: 'none',
        currentWeapon: 'bubble',
        unlockedWeapons: [],
        ammo: {},
        hasKey: false,
        bossDefeated: false,
        nearMerchant: false,
        inputLeft: false, inputRight: false, inputJump: false, inputAttack: false,
        aimAngle: 0,
        mouseWorldX: 0, mouseWorldY: 0,
        isAiming: false,
        _prevUiWeapon: 'bubble',
      };
      gsRef.current = gs;

      // Parallax — handled by static Kenney background sprites
      function drawParallax() {
        // No-op: Kenney background images replace old vector parallax
      }

      // ── Game Loop ──
      let prevOnGround = false;
      let prevJump = false;
      app.ticker.add((ticker) => {
        if (gs.won || gs.dead) return;
        // Pause when shop is open
        if (showShopRef.current) return;
        const delta = ticker.deltaTime;
        gs.frame += delta;

        // Read input into gs
        gs.inputLeft  = gs.keys['ArrowLeft']  || gs.keys['KeyA'] || gs.mBtnLeft;
        gs.inputRight = gs.keys['ArrowRight'] || gs.keys['KeyD'] || gs.mBtnRight;
        gs.inputJump  = gs.keys['ArrowUp']    || gs.keys['KeyW'] || gs.keys['Space'] || gs.mJump;
        gs.inputAttack = gs.keys['KeyJ'] || gs.keys['KeyX'] || gs.mAttack;

        // Weapon switch (1-3 keys or Q to cycle)
        if (gs.keys['Digit1']) { gs.currentWeapon = 'bubble'; gs.currentElement = 'none'; setCurrentWeapon('bubble'); setCurrentElement('none'); }
        if (gs.keys['Digit2'] && gs.unlockedWeapons?.includes('fire'))  { gs.currentWeapon = 'fire'; gs.currentElement = 'fire'; setCurrentWeapon('fire'); setCurrentElement('fire'); }
        if (gs.keys['Digit3'] && gs.unlockedWeapons?.includes('water')) { gs.currentWeapon = 'water'; gs.currentElement = 'water'; setCurrentWeapon('water'); setCurrentElement('water'); }
        if (gs.keys['KeyQ'] && !gs._qCooldown) {
          gs._qCooldown = 15;
          const newW = cycleWeapon(gs);
          gs.currentElement = WEAPON_MODES[newW].id;
          setCurrentWeapon(newW);
          setCurrentElement(WEAPON_MODES[newW].id);
        }
        if (gs._qCooldown > 0) gs._qCooldown -= delta;

        // Physics
        applyInput(gs, delta);
        applyGravity(gs, delta);
        moveX(gs, delta, level.platforms, level.worldWidth);
        moveY(gs, delta, level.platforms, H);

        // Fall death
        if (checkFallDeath(gs, level.worldHeight)) {
          gs.dead = true; setGameOver(true); return;
        }

        // Timers
        if (gs.hurtTimer > 0) gs.hurtTimer -= delta;
        if (gs.hurtFlash > 0) gs.hurtFlash -= delta;
        if (gs.invincible > 0) gs.invincible -= delta;
        if (gs.attackTimer > 0) gs.attackTimer -= delta;

        // Compute aim angle from mouse world position (desktop only)
        // Mobile touch joystick already sets gs.aimAngle directly in onStickPointerMove
        if (gs.isAiming && !gs.mAttack) {
          const dx = gs.mouseWorldX - gs.px;
          const dy = gs.mouseWorldY - (gs.py - 10);
          gs.aimAngle = Math.atan2(dy, dx);
        } else if (!gs.isAiming) {
          // Default: shoot in facing direction
          gs.aimAngle = gs.facing === 'right' ? 0 : Math.PI;
        }

        // ── Sound effects ──
        if (gs.inputJump && !prevJump && gs.onGround) {
          playSound('jump', 0.4);
        }
        prevJump = gs.inputJump;
        if (gs.onGround && !prevOnGround) {
          playSound('land', 0.2);
        }
        prevOnGround = gs.onGround;

        // Attack
        if (gs.inputAttack && gs.attackTimer <= 0) {
          gs.attackTimer = 20;
          playSound('shoot', 0.3);
          const weaponElem = WEAPON_MODES[gs.currentWeapon || 'bubble']?.id || 'none';
          const proj = fireProjectile(gs, worldLayer, weaponElem, gs.aimAngle);
          projectiles.push(proj);
        }

        // Update projectiles & enemy hits
        updateProjectiles(projectiles, enemies, gs, delta, worldLayer, setScore, level.platforms);

        // Collect items
        collectItems(itemSprites, level.items, gs, setCoins, setScore, setHp);

        // Sync weapon state: combat.js may change gs.currentWeapon
        // (e.g. unlockWeapon auto-switches, or ammo depletion reverts to bubble)
        if (gs.currentWeapon !== gs._prevUiWeapon) {
          gs._prevUiWeapon = gs.currentWeapon;
          setCurrentWeapon(gs.currentWeapon);
          setCurrentElement(WEAPON_MODES[gs.currentWeapon]?.id || 'none');
        }

        // ── Interactables update ──
        // Reset per-frame flags before interactable processing
        gs.inWater = false;
        gs.waterBubbles = false;
        updateInteractables(interactableData, gs, delta, level.platforms,
          (contents, x, y) => {
            // When a block drops an item, create it on the fly
            const newItem = { type: contents, x, y };
            const idx = level.items.push(newItem) - 1;
            const igfx = new PIXI.Graphics();
            igfx.x = x;
            igfx.y = y;
            drawItem(igfx, contents, gs.frame);
            worldLayer.addChild(igfx);
            itemSprites.push(igfx);
          },
          (targetX, targetY) => {
            gs.px = targetX;
            gs.py = targetY;
            gs.vx = 0;
            gs.vy = 0;
            playSound('star', 0.5);
          }
        );

        // HP death check (from special terrain damage)
        if (gs.hp <= 0 && !gs.dead) {
          gs.dead = true; setGameOver(true); return;
        }

        interactableGfx.forEach(({ gfx: container, data }) => {
          container.x = data.x;
          container.y = data.y;
          container.visible = data.alive !== false || (data.breakAnim > 0);
          // If we have a sprite texture, handle state changes (bounce, activated swap)
          if (container._spriteChild) {
            const sprite = container._spriteChild;
            const overlay = container._gfxChild;
            overlay.clear();
            // Bounce animation for questionBlock
            if (data.type === 'questionBlock' && data.timer > 0) {
              const bounceY = -Math.sin(data.timer / 10 * Math.PI) * 4;
              container.y = data.y + bounceY;
            }
            // Grey out activated questionBlock
            if (data.type === 'questionBlock' && data.activated) {
              sprite.tint = 0x888888;
            }
            // Break animation
            if (data.alive === false && data.breakAnim > 0) {
              sprite.visible = false;
              const t = 20 - data.breakAnim;
              for (let i = 0; i < 4; i++) {
                const bx = (i % 2 === 0 ? -1 : 1) * (4 + t * 2);
                const by = -t * 1.5 + (i < 2 ? -4 : 4);
                overlay.beginFill(0x8B4513, Math.max(0, 1 - t / 20));
                overlay.drawRect(16 + bx - 4, 16 + by - 4, 8, 8);
                overlay.endFill();
              }
            } else {
              sprite.visible = true;
            }
          } else {
            // No tile texture — use vector fallback
            drawInteractable(container._gfxChild, data, gs.frame);
          }
        });

        // Enemy AI
        enemies.forEach(en => updateEnemyAI(en, gs, delta));

        // Player-enemy collisions
        checkEnemyCollisions(enemies, gs, delta, setHp, setScore, setGameOver);

        // Environment mechanisms
        mechSprites.forEach(mech => {
          if (!mech._active) return;
          const data = mech._data;
          switch (data.type) {
            case 'portal': {
              if (Math.abs(gs.px - mech.x) < 20 && Math.abs(gs.py - mech.y) < 30) {
                gs.px = data.targetX; gs.py = data.targetY;
                gs.vx = 0; gs.vy = 0;
              }
              break;
            }
            case 'lockedDoor': {
              if (gs.hasKey && Math.abs(gs.px - mech.x) < 20) {
                mech._active = false;
                mech.visible = false;
              } else if (!gs.hasKey) {
                // Block player
                const { PLAYER_W } = PHYSICS;
                if (Math.abs(gs.px - mech.x) < 20 && gs.py > mech.y - 40) {
                  if (gs.px < mech.x) gs.px = mech.x - 20;
                  else gs.px = mech.x + 20;
                  gs.vx = 0;
                }
              }
              break;
            }
            case 'waterPit': {
              if (gs.px > data.x && gs.px < data.x + (data.width || 60) && gs.py > data.y - 10) {
                gs.vy = PHYSICS.JUMP_FORCE * 0.5;
                if (gs.hurtTimer <= 0) {
                  gs.hp--; gs.hurtTimer = 60; gs.invincible = 90;
                  setHp(h => Math.max(h - 1, 0));
                  if (gs.hp <= 0) { gs.dead = true; setGameOver(true); }
                }
              }
              break;
            }
          }
        });

        // Exit door
        if (Math.abs(gs.px - level.exitDoor.x) < 30 &&
            Math.abs(gs.py - level.exitDoor.y) < 50) {
          gs.won = true; setVictory(true);
        }

        // Camera
        const cam = updateCamera(gs, W, H, level);
        worldLayer.scale.set(cam.worldScale);
        worldLayer.x = -cam.camX * cam.worldScale;
        worldLayer.y = -cam.camY * cam.worldScale;

        // ── Draw ──
        drawParallax();

        // Player — determine animation state & update
        const playerState = getCharacterState(gs);
        if (playerAnimator) {
          playerAnimator.setState(playerState);
          playerAnimator.setFacing(gs.facing === 'left' ? 'left' : 'right');
          playerAnimator.setPosition(gs.px, gs.py);
          // Hurt blink (invincibility + hurtFlash)
          if (gs.invincible > 0) {
            playerAnimator.setAlpha(Math.sin(gs.frame * 0.5) > 0 ? 0.3 : 1);
          } else {
            playerAnimator.setAlpha(1);
          }
        } else {
          // Fallback: vector drawKnight
          drawKnight(playerGfx, 0, 0, gs.facing, gs.frame,
            gs.hurtTimer > 0, gs.attackTimer > 10, playerState, gs.vy);
          playerGfx.x = gs.px;
          playerGfx.y = gs.py;
        }

        // Aim indicator line (when aiming)
        if (gs.isAiming || gs.inputAttack) {
          if (!gs._aimGfx) {
            gs._aimGfx = new PIXI.Graphics();
            worldLayer.addChild(gs._aimGfx);
          }
          gs._aimGfx.clear();
          gs._aimGfx.visible = true;
          const aimLen = 40;
          const ax = gs.px + Math.cos(gs.aimAngle) * 20;
          const ay = gs.py - 10 + Math.sin(gs.aimAngle) * 20;
          const ax2 = gs.px + Math.cos(gs.aimAngle) * aimLen;
          const ay2 = gs.py - 10 + Math.sin(gs.aimAngle) * aimLen;
          // Dotted aim line
          for (let d = 0; d < aimLen - 18; d += 6) {
            const t = d / (aimLen - 18);
            const dx = ax + (ax2 - ax) * t;
            const dy = ay + (ay2 - ay) * t;
            gs._aimGfx.beginFill(0xFFFFFF, 0.4 - t * 0.3);
            gs._aimGfx.drawCircle(dx, dy, 1.5);
            gs._aimGfx.endFill();
          }
        } else if (gs._aimGfx) {
          gs._aimGfx.visible = false;
        }

        // Items
        itemSprites.forEach((item, i) => {
          if (item._collected) return;
          if (!item._isSprite) drawItem(item, level.items[i].type, gs.frame + i * 10);
        });

        // Enemies — update sprite animations
        enemies.forEach(en => {
          if (!en.alive) {
            if (en._animator) en._animator.setVisible(false);
            else if (en.gfx) en.gfx.visible = false;
            return;
          }
          if (en._animator) {
            // Kenney sprite enemy
            en._animator.setPosition(en.x, en.y);
            en._animator.setFacing(en.vx < 0 ? 'left' : 'right');
            // Choose animation state
            if (en.isShell) {
              en._animator.setState('rest');
            } else if (en.jumpPhase) {
              en._animator.setState('jump');
            } else if (Math.abs(en.vx) > 0.1) {
              const walkState = en._animator.animations.walk ? 'walk'
                : en._animator.animations.fly ? 'fly'
                : en._animator.animations.move ? 'move'
                : en._animator.animations.swim ? 'swim'
                : 'rest';
              en._animator.setState(walkState);
            } else {
              en._animator.setState(en._animator.animations.idle ? 'idle' : 'rest');
            }
          } else {
            // Fallback: vector drawing
            drawEnemy(en.gfx, en.type, gs.frame, en.color, {
              jumpPhase: en.jumpPhase,
              isShell: en.isShell,
            });
            en.gfx.x = en.x;
            en.gfx.y = en.y;
          }
        });

        // Mechanisms
        mechSprites.forEach(mech => {
          if (!mech._active && mech._data.type !== 'waterPit') return;
          const data = mech._data;
          switch (data.type) {
            case 'portal': drawPortal(mech, gs.frame, data.color || 0x7C4DFF); break;
            case 'lockedDoor': drawLockedDoor(mech, gs.frame, mech._active); break;
            case 'waterPit': drawWaterPit(mech, gs.frame, data.width || 60); break;
          }
        });

        // ── BOSS HP Bar (fixed on screen) ──
        if (bossEnemy && bossHpBar && bossEnemy.alive) {
          // Only show HP bar when player is near the boss
          const bossDist = Math.abs(gs.px - bossEnemy.x) + Math.abs(gs.py - bossEnemy.y);
          if (bossDist > 400) {
            bossHpBar.clear();
          } else {
            bossHpBar.clear();
            const barW = W * 0.5;
            const barH = 8;
            const barX = (W - barW) / 2;
            const barY = 60;
            const ratio = Math.max(0, bossEnemy.hp / bossEnemy.maxHp);
            // Background
            bossHpBar.beginFill(0x222222, 0.7);
            bossHpBar.drawRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 4);
            bossHpBar.endFill();
            // HP fill (red→yellow gradient effect)
            const hpColor = ratio > 0.5 ? 0xE53935 : ratio > 0.25 ? 0xFFA726 : 0xEF5350;
            bossHpBar.beginFill(hpColor);
            bossHpBar.drawRoundedRect(barX, barY, barW * ratio, barH, 3);
            bossHpBar.endFill();
            // Border
            bossHpBar.lineStyle(1, 0xFFFFFF, 0.5);
            bossHpBar.drawRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 4);
            // Play boss appear sound once
            if (!gs._bossAppearPlayed) {
              gs._bossAppearPlayed = true;
              playSound('bossAppear', 0.6);
            }
          }
        } else if (bossHpBar) {
          bossHpBar.clear();
          if (bossEnemy && !bossEnemy.alive && !gs.bossDefeated) {
            gs.bossDefeated = true;
            gs.score += bossEnemy.score;
            setScore(s => s + bossEnemy.score);
          }
        }

        // ── Merchant proximity check ──
        if (level.merchant && merchantContainer) {
          const mDist = Math.abs(gs.px - level.merchant.x) + Math.abs(gs.py - level.merchant.y);
          const wasNear = gs.nearMerchant;
          gs.nearMerchant = mDist < 80;
          if (gs.nearMerchant && !wasNear) {
            playSound('shopOpen', 0.4);
          }
          merchantContainer.y = level.merchant.y + Math.sin(gs.frame * 0.05) * 3;
          if (merchantLabel) {
            merchantLabel.y = merchantContainer.y - 58;
          }
          if (merchantPrompt) {
            merchantPrompt.visible = gs.nearMerchant;
            merchantPrompt.y = merchantContainer.y - 70;
            merchantPrompt.alpha = 0.7 + Math.sin(gs.frame * 0.1) * 0.3;
          }
          if (gs.nearMerchant && gs.keys['KeyE']) {
            gs.keys['KeyE'] = false;
            setShowShop(true);
            showShopRef.current = true;
            setShopCoins(gs.coins);
            playSound('click', 0.5);
          }
        }

        // Sync React state
        setHp(gs.hp);
        setCoins(gs.coins);
        setScore(gs.score);
      });

      // ── Canvas pointer/mouse events for 360° aiming ──
      const canvasEl = app.canvas;

      const screenToWorld = (clientX, clientY) => {
        const rect = canvasEl.getBoundingClientRect();
        const sx = (clientX - rect.left);
        const sy = (clientY - rect.top);
        const cam = updateCamera(gs, W, H, level);
        const wx = sx / cam.worldScale + cam.camX;
        const wy = sy / cam.worldScale + cam.camY;
        return { wx, wy };
      };

      // Touch on canvas = aim + shoot
      const onCanvasPointerDown = (e) => {
        if (gs.won || gs.dead) return;
        const { wx, wy } = screenToWorld(e.clientX, e.clientY);
        gs.mouseWorldX = wx;
        gs.mouseWorldY = wy;
        gs.isAiming = true;
        gs.mAttack = true;
      };
      const onCanvasPointerMove = (e) => {
        if (!gs.isAiming) return;
        const { wx, wy } = screenToWorld(e.clientX, e.clientY);
        gs.mouseWorldX = wx;
        gs.mouseWorldY = wy;
      };
      const onCanvasPointerUp = () => {
        gs.isAiming = false;
        gs.mAttack = false;
      };

      // Mouse move (desktop) — always track for aim indicator
      const onMouseMove = (e) => {
        const { wx, wy } = screenToWorld(e.clientX, e.clientY);
        gs.mouseWorldX = wx;
        gs.mouseWorldY = wy;
      };

      canvasEl.addEventListener('pointerdown', onCanvasPointerDown);
      canvasEl.addEventListener('pointermove', onCanvasPointerMove);
      canvasEl.addEventListener('pointerup', onCanvasPointerUp);
      canvasEl.addEventListener('pointerleave', onCanvasPointerUp);
      canvasEl.addEventListener('mousemove', onMouseMove);

      setLoading(false);
    };

    initApp();

    return () => {
      destroyed = true;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      while (containerEl.firstChild) containerEl.removeChild(containerEl.firstChild);
    };
  }, [level]);

  // Keyboard — support mouse click to shoot on desktop
  useEffect(() => {
    // NOTE: Must read gsRef.current INSIDE each handler, not here,
    // because the game engine initializes asynchronously after this effect runs.
    const onDown = (e) => {
      const gs = gsRef.current;
      if (!gs) return;
      gs.keys[e.code] = true;
      if (e.code === 'KeyJ' || e.code === 'KeyX') {
        gs.isAiming = true;
      }
      e.preventDefault();
    };
    const onUp = (e) => {
      const gs = gsRef.current;
      if (!gs) return;
      gs.keys[e.code] = false;
      if (e.code === 'KeyJ' || e.code === 'KeyX') {
        gs.isAiming = false;
      }
    };
    // Mouse button click on desktop = shoot
    const onMouseDown = (e) => {
      const gs = gsRef.current;
      if (gs && e.button === 0) {
        gs.mAttack = true;
        gs.isAiming = true;
      }
    };
    const onMouseUp = (e) => {
      const gs = gsRef.current;
      if (gs && e.button === 0) {
        gs.mAttack = false;
        gs.isAiming = false;
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Restart
  const restart = useCallback(() => {
    setHp(3); setCoins(0); setScore(0); setTime(0);
    setVictory(false); setGameOver(false); setCurrentElement('none');
    const gs = gsRef.current;
    if (!gs || !level) return;
    gs.px = level.playerStart.x; gs.py = level.playerStart.y;
    gs.vx = 0; gs.vy = 0; gs.hp = 3; gs.coins = 0; gs.score = 0;
    gs.invincible = 0; gs.hurtTimer = 0; gs.attackTimer = 0;
    gs.won = false; gs.dead = false; gs.cameraX = 0; gs.cameraY = 0;
    gs.currentElement = 'none'; gs.currentWeapon = 'bubble'; gs.unlockedWeapons = []; gs.ammo = {}; gs.hasKey = false;
    setCurrentWeapon('bubble');
    gs.aimAngle = 0; gs.isAiming = false;
  }, [level]);

  // Mobile controls — left/right triangle buttons
  const [btnLeftActive, setBtnLeftActive] = useState(false);
  const [btnRightActive, setBtnRightActive] = useState(false);

  const ARROW_BASE = '/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double';

  const onLeftDown = useCallback((e) => {
    e.preventDefault();
    const gs = gsRef.current;
    if (gs) gs.mBtnLeft = true;
    setBtnLeftActive(true);
  }, []);
  const onLeftUp = useCallback(() => {
    const gs = gsRef.current;
    if (gs) gs.mBtnLeft = false;
    setBtnLeftActive(false);
  }, []);

  const onRightDown = useCallback((e) => {
    e.preventDefault();
    const gs = gsRef.current;
    if (gs) gs.mBtnRight = true;
    setBtnRightActive(true);
  }, []);
  const onRightUp = useCallback(() => {
    const gs = gsRef.current;
    if (gs) gs.mBtnRight = false;
    setBtnRightActive(false);
  }, []);

  // Right joystick — 360° aim & shoot
  const [stickDir, setStickDir] = useState('none'); // tracks visual direction
  const stickCenterRef = useRef({ x: 0, y: 0 });

  const onStickPointerDown = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    stickCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const gs = gsRef.current;
    if (gs) {
      gs.mAttack = true;
      gs.isAiming = true;
    }
    updateStickAngle(e.clientX, e.clientY);
  }, []);

  const onStickPointerMove = useCallback((e) => {
    e.preventDefault();
    updateStickAngle(e.clientX, e.clientY);
  }, []);

  const onStickPointerUp = useCallback(() => {
    const gs = gsRef.current;
    if (gs) {
      gs.mAttack = false;
      gs.isAiming = false;
    }
    setStickDir('none');
  }, []);

  function updateStickAngle(clientX, clientY) {
    const gs = gsRef.current;
    if (!gs) return;
    const center = stickCenterRef.current;
    const dx = clientX - center.x;
    const dy = clientY - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;
    const angle = Math.atan2(dy, dx);
    gs.aimAngle = angle;

    // Map angle to 8 directions for stick image
    const deg = ((angle * 180 / Math.PI) + 360) % 360;
    if (deg >= 337.5 || deg < 22.5)       setStickDir('right');
    else if (deg >= 22.5 && deg < 67.5)   setStickDir('right'); // down-right → right
    else if (deg >= 67.5 && deg < 112.5)  setStickDir('down');
    else if (deg >= 112.5 && deg < 157.5) setStickDir('left');  // down-left → left
    else if (deg >= 157.5 && deg < 202.5) setStickDir('left');
    else if (deg >= 202.5 && deg < 247.5) setStickDir('left');  // up-left → left
    else if (deg >= 247.5 && deg < 292.5) setStickDir('up');
    else                                  setStickDir('right'); // up-right → right
  }

  const STICK_IMGS = {
    none:  '/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double/switch_stick_r.png',
    up:    '/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double/switch_stick_r_up.png',
    down:  '/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double/switch_stick_r_down.png',
    left:  '/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double/switch_stick_r_left.png',
    right: '/assets/kenney/kenney_input-prompts_1.4.1/Nintendo Switch 2/Double/switch_stick_r_right.png',
  };

  // Simple handlePointer for remaining uses
  const handlePointer = (key, val) => {
    const gs = gsRef.current;
    if (gs) gs[key] = val;
  };

  // Weapon switch
  const switchWeapon = (weaponKey) => {
    setCurrentWeapon(weaponKey);
    setCurrentElement(WEAPON_MODES[weaponKey].id);
    const gs = gsRef.current;
    if (gs) {
      gs.currentWeapon = weaponKey;
      gs.currentElement = WEAPON_MODES[weaponKey].id;
    }
  };

  if (!level) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>关卡未找到</div>
      </div>
    );
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const elemDef = ELEMENTS[currentElement] || ELEMENTS.none;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.gameBar}>
        <div className={styles.gameBarLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
          </button>
          <span className={styles.levelName}>{level.name}</span>
        </div>
        <div className={styles.gameBarRight}>
          <div className={styles.hpHearts}>
            {Array.from({ length: 5 }, (_, i) => (
              <Heart key={i} size={14} fill={i < hp ? '#FF1744' : 'none'}
                color={i < hp ? '#FF1744' : 'rgba(255,255,255,0.2)'} strokeWidth={2} />
            ))}
          </div>
          <div className={styles.stat}>
            <Coins size={12} /> <span className={styles.statValue}>{coins}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{score}</span>分
          </div>
          <button className={styles.backBtn} onClick={restart}>
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      {loading && <div className={styles.loading}>加载中...</div>}
      <div className={styles.canvasContainer} ref={canvasRef} />

      {/* Mobile controls */}
      {!loading && !victory && !gameOver && (
        <div className={styles.mobileControls}>
          {/* Left/Right arrow buttons handle all movement — no swipe zone needed */}
          {/* Left: L/R triangle buttons */}
          <div className={styles.arrowBtnGroup}>
            <button
              className={`${styles.arrowBtn} ${btnLeftActive ? styles.arrowBtnActive : ''}`}
              onPointerDown={onLeftDown}
              onPointerUp={onLeftUp}
              onPointerLeave={onLeftUp}
              onPointerCancel={onLeftUp}
            >
              <img
                src={`${ARROW_BASE}/${btnLeftActive ? 'switch_left.png' : 'switch_left_outline.png'}`}
                alt="left"
                className={styles.arrowBtnImg}
              />
            </button>
            <button
              className={`${styles.arrowBtn} ${btnRightActive ? styles.arrowBtnActive : ''}`}
              onPointerDown={onRightDown}
              onPointerUp={onRightUp}
              onPointerLeave={onRightUp}
              onPointerCancel={onRightUp}
            >
              <img
                src={`${ARROW_BASE}/${btnRightActive ? 'switch_right.png' : 'switch_right_outline.png'}`}
                alt="right"
                className={styles.arrowBtnImg}
              />
            </button>
          </div>

          {/* Center: Weapon selector */}
          <div className={styles.elementSelector}>
            {WEAPON_ORDER.map(wKey => {
              const wDef = WEAPON_MODES[wKey];
              const isUnlocked = wKey === 'bubble' || (gsRef.current?.unlockedWeapons || []).includes(wKey);
              if (!isUnlocked) return null;
              const el = ELEMENTS[wDef.id] || ELEMENTS.none;
              const ammoCount = wDef.hasAmmo ? (gsRef.current?.ammo?.[wKey] ?? 0) : null;
              return (
                <button key={wKey}
                  className={`${styles.elemBtn} ${currentWeapon === wKey ? styles.elemBtnActive : ''}`}
                  style={{ '--elem-color': `#${el.color.toString(16).padStart(6, '0')}` }}
                  onClick={() => switchWeapon(wKey)}>
                  <img src="/assets/kenney/kenney_input-prompts_1.4.1/Generic/Double/generic_button_square.png" alt="" className={styles.elemBtnBg} />
                  <span className={styles.elemBtnIcon}>{wDef.icon}</span>
                  {ammoCount !== null && <span className={styles.ammoCount}>{ammoCount}</span>}
                </button>
              );
            })}
          </div>

          {/* Right: JUMP button + 360° Joystick */}
          <div className={styles.rightControls}>
            <button
              className={styles.jumpBtn}
              onPointerDown={(e) => {
                e.preventDefault();
                const gs = gsRef.current;
                if (gs) gs.mJump = true;
              }}
              onPointerUp={() => {
                const gs = gsRef.current;
                if (gs) gs.mJump = false;
              }}
              onPointerLeave={() => {
                const gs = gsRef.current;
                if (gs) gs.mJump = false;
              }}
              onPointerCancel={() => {
                const gs = gsRef.current;
                if (gs) gs.mJump = false;
              }}
            >
              <span className={styles.jumpBtnLabel}>JUMP</span>
            </button>
            <div
              className={styles.stickZone}
              onPointerDown={onStickPointerDown}
              onPointerMove={onStickPointerMove}
              onPointerUp={onStickPointerUp}
              onPointerLeave={onStickPointerUp}
              onPointerCancel={onStickPointerUp}
            >
              <img src={STICK_IMGS[stickDir]} alt="aim" className={styles.stickImg} />
              <span className={styles.stickLabel}>{elemDef.icon}</span>
            </div>
          </div>
        </div>
      )}

      {/* Shop Overlay */}
      <AnimatePresence>
        {showShop && (
          <motion.div className={styles.victoryOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setShowShop(false); showShopRef.current = false; playSound('shopClose', 0.4); }}>
            <motion.div className={styles.shopCard || styles.gameOverCard}
              initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={e => e.stopPropagation()}>
              <h2 style={{ color: '#FFD54F', margin: 0, fontSize: 18, textAlign: 'center' }}>
                🏪 {level?.merchant?.name || '旅行商人'}
              </h2>
              <p style={{ color: '#aaa', fontSize: 12, textAlign: 'center', margin: '4px 0 8px' }}>
                🪙 金币: {shopCoins}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {MERCHANT_ITEMS.map(item => (
                  <button key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', background: shopCoins >= item.cost * 10 ? '#2E7D32' : '#424242',
                      border: '2px solid', borderColor: shopCoins >= item.cost * 10 ? '#4CAF50' : '#616161',
                      borderRadius: 8, color: '#fff', cursor: shopCoins >= item.cost * 10 ? 'pointer' : 'not-allowed',
                      fontSize: 13, transition: 'all 0.15s',
                    }}
                    onClick={() => {
                      const gs = gsRef.current;
                      if (!gs || gs.coins < item.cost * 10) { playSound('noBuy', 0.5); return; }
                      gs.coins -= item.cost * 10;
                      setShopCoins(gs.coins);
                      playSound('buy', 0.6);
                      switch (item.id) {
                        case 'life':   gs.hp = Math.min(5, gs.hp + 1); setHp(gs.hp); break;
                        case 'shield': gs.invincible = Math.max(gs.invincible, 300); break;
                        case 'speed':  gs._speedBoost = (gs._speedBoost || 0) + 450; break;
                        case 'magnet': gs._magnetActive = true; break;
                        case 'djump':  gs._doubleJump = true; break;
                      }
                    }}>
                    <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{item.icon}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: '#ccc' }}>{item.desc}</div>
                    </div>
                    <span style={{ color: '#FFD740', fontWeight: 'bold' }}>🪙{item.cost * 10}</span>
                  </button>
                ))}
              </div>
              <button
                style={{
                  marginTop: 10, padding: '8px 0', width: '100%',
                  background: '#C62828', border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 14, fontWeight: 'bold', cursor: 'pointer',
                }}
                onClick={() => { setShowShop(false); showShopRef.current = false; playSound('shopClose', 0.4); }}>
                关闭商店
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory */}
      <AnimatePresence>
        {victory && (
          <motion.div className={styles.victoryOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.victoryCard}
              initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}>
              <h2 className={styles.victoryTitle}>🎉 通关！</h2>
              <div className={styles.victoryStars}>
                {[1, 2, 3].map(i => (
                  <span key={i} style={{ opacity: i <= calcStars() ? 1 : 0.2 }}>⭐</span>
                ))}
              </div>
              <div className={styles.victoryStats}>
                <div className={styles.victoryStat}>
                  <div className={styles.victoryStatValue}>{score}</div>
                  <div className={styles.victoryStatLabel}>得分</div>
                </div>
                <div className={styles.victoryStat}>
                  <div className={styles.victoryStatValue}>{coins}</div>
                  <div className={styles.victoryStatLabel}>金币</div>
                </div>
                <div className={styles.victoryStat}>
                  <div className={styles.victoryStatValue}>{formatTime(time)}</div>
                  <div className={styles.victoryStatLabel}>用时</div>
                </div>
              </div>
              <div className={styles.victoryActions}>
                <button className={styles.btnVictoryPrimary} onClick={() => navigate(-1)}>
                  下一关 <ArrowRight size={16} />
                </button>
                <button className={styles.btnVictorySecondary} onClick={restart}>
                  <RotateCcw size={14} /> 再来一次
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {gameOver && (
          <motion.div className={styles.victoryOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.gameOverCard}
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <h2 className={styles.gameOverTitle}>💀 游戏结束</h2>
              <div className={styles.victoryStats}>
                <div className={styles.victoryStat}>
                  <div className={styles.victoryStatValue}>{score}</div>
                  <div className={styles.victoryStatLabel}>得分</div>
                </div>
                <div className={styles.victoryStat}>
                  <div className={styles.victoryStatValue}>{coins}</div>
                  <div className={styles.victoryStatLabel}>金币</div>
                </div>
              </div>
              <div className={styles.victoryActions}>
                <button className={styles.btnVictoryPrimary} onClick={restart}>
                  <RotateCcw size={14} /> 重新挑战
                </button>
                <button className={styles.btnVictorySecondary} onClick={() => navigate(-1)}>
                  退出
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
