import { useState, useEffect, useRef, useCallback } from 'react';
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
  const { levelId } = useParams();
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
  const [shopStars, setShopStars] = useState(0);
  const level = getLevelById(levelId);

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

      function drawWorld() {
        groundContainer.removeChildren();
        platformContainer.removeChildren();
        const tiles = kenneyAssets?.tiles;
        if (!tiles) return;

        // Choose terrain material by theme
        const material = level.theme === 'desert' ? 'sand'
          : level.theme === 'candy' ? 'purple'
          : level.theme === 'ocean' ? 'stone'
          : 'grass'; // forest default

        level.platforms.forEach(p => {
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

      // Items
      const itemSprites = level.items.map(item => {
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

      // ── Merchant NPC (pixel-redux sprite) ──
      let merchantContainer = null;
      let merchantLabel = null;
      let merchantPrompt = null;
      if (level.merchant) {
        merchantContainer = new PIXI.Container();
        // Use pixel-redux tile_0110 (yellow NPC character)
        const npcTexPath = '/assets/kenney/kenney_platformer-art-pixel-redux/Tiles/tile_0110.png';
        const npcTex = PIXI.Texture.from(npcTexPath);
        const npcSprite = new PIXI.Sprite(npcTex);
        npcSprite.anchor.set(0.5, 1.0);
        npcSprite.scale.set(2.5);
        merchantContainer.addChild(npcSprite);
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
            setShopStars(gs.stars);
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
      const interactableData = initInteractables(level.interactables || []);
      const interactableGfx = interactableData.map(obj => {
        const gfx = new PIXI.Graphics();
        gfx.x = obj.x;
        gfx.y = obj.y;
        drawInteractable(gfx, obj, 0);
        worldLayer.addChild(gfx);
        return { gfx, data: obj };
      });

      // Game State
      const gs = {
        px: level.playerStart.x, py: level.playerStart.y,
        vx: 0, vy: 0,
        facing: 'right', onGround: false,
        hp: 3, coins: 0, score: 0, stars: 0,
        invincible: 0, hurtTimer: 0, attackTimer: 0,
        frame: 0, cameraX: 0, cameraY: 0,
        keys: {},
        mLeft: false, mRight: false, mJump: false, mAttack: false,
        won: false, dead: false,
        currentElement: 'none',
        currentWeapon: 'bubble',
        unlockedWeapons: [],  // 初始只有泡泡
        ammo: {},             // 弹药计数 { fire: N, water: N }
        hasKey: false,
        bossDefeated: false,
        nearMerchant: false,
        // Input helpers (set by readInput)
        inputLeft: false, inputRight: false, inputJump: false, inputAttack: false,
        // 360° aiming
        aimAngle: 0,
        mouseWorldX: 0, mouseWorldY: 0,
        isAiming: false, // true when touch/mouse is on canvas
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
        gs.inputLeft  = gs.keys['ArrowLeft']  || gs.keys['KeyA'] || gs.mLeft;
        gs.inputRight = gs.keys['ArrowRight'] || gs.keys['KeyD'] || gs.mRight;
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
        if (gs.invincible > 0) gs.invincible -= delta;
        if (gs.attackTimer > 0) gs.attackTimer -= delta;

        // Compute aim angle from mouse/touch world position
        if (gs.isAiming) {
          const dx = gs.mouseWorldX - gs.px;
          const dy = gs.mouseWorldY - (gs.py - 10);
          gs.aimAngle = Math.atan2(dy, dx);
        } else {
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

        // ── Interactables update ──
        updateInteractables(interactableData, gs, level.platforms, delta, {
          onDrop: (contents, x, y) => {
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
          onTeleport: (targetX, targetY) => {
            gs.px = targetX;
            gs.py = targetY;
            gs.vx = 0;
            gs.vy = 0;
            playSound('star', 0.5);
          }
        });
        interactableGfx.forEach(({ gfx, data }) => {
          gfx.x = data.x;
          gfx.y = data.y;
          drawInteractable(gfx, data, gs.frame);
          gfx.visible = data.alive !== false || (data.breakAnim > 0);
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
          // Hurt blink
          if (gs.hurtTimer > 0) {
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
          drawItem(item, level.items[i].type, gs.frame + i * 10);
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
            setShopStars(gs.stars);
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

  // Mobile controls
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
          <div className={styles.controlsLeft}>
            <button className={styles.dirBtn}
              onPointerDown={() => handlePointer('mLeft', true)}
              onPointerUp={() => handlePointer('mLeft', false)}
              onPointerLeave={() => handlePointer('mLeft', false)}>
              <ChevronLeft size={28} />
            </button>
            <button className={styles.dirBtn}
              onPointerDown={() => handlePointer('mRight', true)}
              onPointerUp={() => handlePointer('mRight', false)}
              onPointerLeave={() => handlePointer('mRight', false)}>
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Weapon selector — only show unlocked weapons */}
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
                  {wDef.icon}
                  {ammoCount !== null && <span className={styles.ammoCount}>{ammoCount}</span>}
                </button>
              );
            })}
          </div>

          <div className={styles.controlsRight}>
            <button className={`${styles.actionBtn} ${styles.attackBtn}`}
              style={{ borderColor: `#${elemDef.color.toString(16).padStart(6, '0')}` }}
              onPointerDown={() => handlePointer('mAttack', true)}
              onPointerUp={() => handlePointer('mAttack', false)}
              onPointerLeave={() => handlePointer('mAttack', false)}>
              {elemDef.icon}
            </button>
            <button className={`${styles.actionBtn} ${styles.jumpBtn}`}
              onPointerDown={() => handlePointer('mJump', true)}
              onPointerUp={() => handlePointer('mJump', false)}
              onPointerLeave={() => handlePointer('mJump', false)}>
              JUMP
            </button>
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
                ⭐ 星星: {shopStars}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {MERCHANT_ITEMS.map(item => (
                  <button key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', background: shopStars >= item.cost ? '#2E7D32' : '#424242',
                      border: '2px solid', borderColor: shopStars >= item.cost ? '#4CAF50' : '#616161',
                      borderRadius: 8, color: '#fff', cursor: shopStars >= item.cost ? 'pointer' : 'not-allowed',
                      fontSize: 13, transition: 'all 0.15s',
                    }}
                    onClick={() => {
                      const gs = gsRef.current;
                      if (!gs || gs.stars < item.cost) { playSound('noBuy', 0.5); return; }
                      gs.stars -= item.cost;
                      setShopStars(gs.stars);
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
                    <span style={{ color: '#FFD740', fontWeight: 'bold' }}>⭐{item.cost}</span>
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
                  返回关卡选择
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
