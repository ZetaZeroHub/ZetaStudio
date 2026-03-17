/* ========================================
   游戏梦想家 — 素材加载器
   解析 Kenney XML spritesheet → PixiJS
   ======================================== */

import * as PIXI from 'pixi.js';

const KENNEY_BASE = '/assets/kenney';
const PLATFORMER = `${KENNEY_BASE}/kenney_new-platformer-pack-1.1`;
const TINY_TOWN = `${KENNEY_BASE}/kenney_tiny-town`;

// Cache parsed spritesheets
const _cache = {};

/**
 * Parse Kenney XML TextureAtlas → PixiJS Spritesheet JSON format
 */
function parseKenneyXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const frames = {};
  doc.querySelectorAll('SubTexture').forEach(sub => {
    frames[sub.getAttribute('name')] = {
      frame: {
        x: +sub.getAttribute('x'),
        y: +sub.getAttribute('y'),
        w: +sub.getAttribute('width'),
        h: +sub.getAttribute('height'),
      },
      sourceSize: {
        w: +sub.getAttribute('width'),
        h: +sub.getAttribute('height'),
      },
      spriteSourceSize: {
        x: 0, y: 0,
        w: +sub.getAttribute('width'),
        h: +sub.getAttribute('height'),
      },
    };
  });
  return frames;
}

/**
 * Load a Kenney XML spritesheet and return a parsed PIXI.Spritesheet
 * @param {string} pngPath - path to .png
 * @param {string} xmlPath - path to .xml
 * @returns {Promise<PIXI.Spritesheet>}
 */
async function loadXMLSpritesheet(pngPath, xmlPath) {
  const cacheKey = pngPath;
  if (_cache[cacheKey]) return _cache[cacheKey];

  // Load XML
  const xmlText = await fetch(xmlPath).then(r => r.text());
  const frames = parseKenneyXML(xmlText);

  // Load texture
  const texture = await PIXI.Assets.load(pngPath);

  // Build spritesheet data
  const sheetData = {
    frames,
    meta: {
      image: pngPath,
      size: { w: texture.width, h: texture.height },
      scale: 1,
    },
  };

  const sheet = new PIXI.Spritesheet(texture, sheetData);
  await sheet.parse();

  _cache[cacheKey] = sheet;
  return sheet;
}

// ─── Platformer Pack Loaders ───

/**
 * Load all character textures (5 colors × 9 states)
 * Returns: { beige: { idle, walk_a, walk_b, jump, duck, hit, ... }, green: {...}, ... }
 */
export async function loadCharacters() {
  const sheet = await loadXMLSpritesheet(
    `${PLATFORMER}/Spritesheets/spritesheet-characters-default.png`,
    `${PLATFORMER}/Spritesheets/spritesheet-characters-default.xml`,
  );

  const colors = ['beige', 'green', 'pink', 'purple', 'yellow'];
  const states = ['climb_a', 'climb_b', 'duck', 'front', 'hit', 'idle', 'jump', 'walk_a', 'walk_b'];
  const result = {};

  for (const color of colors) {
    result[color] = {};
    for (const state of states) {
      const key = `character_${color}_${state}`;
      if (sheet.textures[key]) {
        result[color][state] = sheet.textures[key];
      }
    }
    // Build animation arrays
    result[color].animations = {
      idle: [result[color].idle],
      walk: [result[color].walk_a, result[color].walk_b],
      jump: [result[color].jump],
      duck: [result[color].duck],
      hit: [result[color].hit],
      climb: [result[color].climb_a, result[color].climb_b],
    };
  }

  return result;
}

/**
 * Load all enemy textures with animation arrays
 * Returns: { slime_normal: { animations: { walk, rest, ... } }, bee: {...}, ... }
 */
export async function loadEnemies() {
  const sheet = await loadXMLSpritesheet(
    `${PLATFORMER}/Spritesheets/spritesheet-enemies-default.png`,
    `${PLATFORMER}/Spritesheets/spritesheet-enemies-default.xml`,
  );

  // Define enemy types and their animation patterns
  const enemyDefs = {
    slime_normal: {
      walk: ['slime_normal_walk_a', 'slime_normal_walk_b'],
      rest: ['slime_normal_rest'],
      hit:  ['slime_normal_flat'],
    },
    slime_fire: {
      walk: ['slime_fire_walk_a', 'slime_fire_walk_b'],
      rest: ['slime_fire_rest'],
      hit:  ['slime_fire_flat'],
    },
    slime_spike: {
      walk: ['slime_spike_walk_a', 'slime_spike_walk_b'],
      rest: ['slime_spike_rest'],
      hit:  ['slime_spike_flat'],
    },
    slime_block: {
      walk: ['slime_block_walk_a', 'slime_block_walk_b'],
      rest: ['slime_block_rest'],
      jump: ['slime_block_jump'],
    },
    bee: {
      fly: ['bee_a', 'bee_b'],
      rest: ['bee_rest'],
    },
    fly: {
      fly: ['fly_a', 'fly_b'],
      rest: ['fly_rest'],
    },
    frog: {
      idle: ['frog_idle'],
      jump: ['frog_jump'],
      rest: ['frog_rest'],
    },
    ladybug: {
      walk: ['ladybug_walk_a', 'ladybug_walk_b'],
      fly: ['ladybug_fly'],
      rest: ['ladybug_rest'],
    },
    mouse: {
      walk: ['mouse_walk_a', 'mouse_walk_b'],
      rest: ['mouse_rest'],
    },
    snail: {
      walk: ['snail_walk_a', 'snail_walk_b'],
      rest: ['snail_rest'],
      shell: ['snail_shell'],
    },
    worm_normal: {
      move: ['worm_normal_move_a', 'worm_normal_move_b'],
      rest: ['worm_normal_rest'],
    },
    worm_ring: {
      move: ['worm_ring_move_a', 'worm_ring_move_b'],
      rest: ['worm_ring_rest'],
    },
    barnacle: {
      attack: ['barnacle_attack_a', 'barnacle_attack_b'],
      rest: ['barnacle_attack_rest'],
    },
    fish_blue: {
      swim: ['fish_blue_swim_a', 'fish_blue_swim_b'],
      rest: ['fish_blue_rest'],
    },
    saw: {
      spin: ['saw_a', 'saw_b'],
      rest: ['saw_rest'],
    },
    block: {
      idle: ['block_idle'],
      fall: ['block_fall'],
      rest: ['block_rest'],
    },
  };

  const result = {};
  for (const [type, anims] of Object.entries(enemyDefs)) {
    result[type] = { textures: {}, animations: {} };
    for (const [animName, frameNames] of Object.entries(anims)) {
      const textures = frameNames
        .map(name => sheet.textures[name])
        .filter(Boolean);
      if (textures.length > 0) {
        result[type].animations[animName] = textures;
        // Also store first frame as default texture
        if (!result[type].textures.default) {
          result[type].textures.default = textures[0];
        }
      }
    }
  }

  return result;
}

/**
 * Load all tile textures as a flat map: name → Texture
 * Returns: { terrain_grass_block_top: Texture, coin_gold: Texture, ... }
 */
export async function loadTiles() {
  const sheet = await loadXMLSpritesheet(
    `${PLATFORMER}/Spritesheets/spritesheet-tiles-default.png`,
    `${PLATFORMER}/Spritesheets/spritesheet-tiles-default.xml`,
  );
  return sheet.textures;
}

/**
 * Load background textures
 * Returns: { trees: Texture, hills: Texture, desert: Texture, mushrooms: Texture, ... }
 */
export async function loadBackgrounds() {
  const names = [
    'background_color_trees', 'background_color_hills',
    'background_color_desert', 'background_color_mushrooms',
    'background_fade_trees', 'background_fade_hills',
    'background_fade_desert', 'background_fade_mushrooms',
    'background_solid_sky', 'background_solid_grass',
    'background_solid_dirt', 'background_solid_sand',
    'background_clouds',
  ];
  const textures = {};
  for (const name of names) {
    const path = `${PLATFORMER}/Sprites/Backgrounds/Default/${name}.png`;
    try {
      textures[name] = await PIXI.Assets.load(path);
    } catch (e) {
      console.warn(`[AssetLoader] Failed to load background: ${name}`, e);
    }
  }
  return textures;
}

// ─── Tiny Town Loaders ───

/**
 * Load Tiny Town tilemap as a single texture + tile cutting
 * @returns {{ texture, tileSize, columns, rows }}
 */
export async function loadTinyTownTilemap() {
  const texture = await PIXI.Assets.load(`${TINY_TOWN}/Tilemap/tilemap_packed.png`);
  return {
    texture,
    tileSize: 16,
    spacing: 1,
    columns: 12,
    rows: 11,
    totalTiles: 132,
  };
}

/**
 * Get a specific tile texture from Tiny Town tilemap by index
 * @param {PIXI.Texture} tilemapTexture - the full tilemap texture
 * @param {number} index - tile index (0-131)
 * @param {number} tileSize - 16
 * @param {number} spacing - 1
 * @param {number} columns - 12
 */
export function getTinyTownTile(tilemapTexture, index, tileSize = 16, spacing = 1, columns = 12) {
  const col = index % columns;
  const row = Math.floor(index / columns);
  const x = col * (tileSize + spacing);
  const y = row * (tileSize + spacing);

  return new PIXI.Texture({
    source: tilemapTexture.source,
    frame: new PIXI.Rectangle(x, y, tileSize, tileSize),
  });
}

/**
 * Pre-cut all Tiny Town tiles into individual textures
 */
export async function loadTinyTownTiles() {
  const { texture, tileSize, spacing, columns, totalTiles } = await loadTinyTownTilemap();
  const tiles = [];
  for (let i = 0; i < totalTiles; i++) {
    tiles.push(getTinyTownTile(texture, i, tileSize, spacing, columns));
  }
  return tiles;
}

// ─── Combined Loader ───

/**
 * Load all platformer assets at once
 */
export async function loadAllPlatformerAssets() {
  const [characters, enemies, tiles, backgrounds] = await Promise.all([
    loadCharacters(),
    loadEnemies(),
    loadTiles(),
    loadBackgrounds(),
  ]);
  return { characters, enemies, tiles, backgrounds };
}
