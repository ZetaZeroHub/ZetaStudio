/* ========================================
   游戏梦想家 — Tile 注册表
   统一管理 Platformer Pack 的 tile 映射
   ======================================== */

/**
 * Terrain tile naming convention in Kenney Platformer Pack:
 * terrain_{material}_{piece}
 *
 * Materials: grass, dirt, sand, snow, stone, purple
 * Pieces: block, block_top, block_bottom, block_left, block_right,
 *         block_top_left, block_top_right, block_bottom_left, block_bottom_right,
 *         block_center, horizontal_left, horizontal_middle, horizontal_right,
 *         horizontal_overhang_left, horizontal_overhang_right,
 *         vertical_top, vertical_middle, vertical_bottom,
 *         cloud, cloud_left, cloud_middle, cloud_right, cloud_background,
 *         ramp_short_a, ramp_short_b, ramp_long_a, ramp_long_b, ramp_long_c
 */

// ─── Tile Types (for collision/behavior) ───
export const TILE_TYPE = {
  EMPTY: 0,
  SOLID: 1,       // blocks movement
  PLATFORM: 2,    // pass-through from below
  HAZARD: 3,      // damages player (spikes, lava)
  ITEM: 4,        // collectible
  DECORATION: 5,  // no collision
  LADDER: 6,      // climbable
  WATER: 7,       // slows/damages
  DOOR: 8,        // exit
  SPRING: 9,      // bouncy
};

// ─── Tile Registry ───
// Maps tile sprite name → { type, displayName }

export const TILE_REGISTRY = {
  // ── Terrain (SOLID) ──
  // Grass
  terrain_grass_block:              { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_block_top:          { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_block_bottom:       { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_block_left:         { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_block_right:        { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_block_top_left:     { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_block_top_right:    { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_block_bottom_left:  { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_block_bottom_right: { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_block_center:       { type: TILE_TYPE.SOLID, material: 'grass' },
  // Grass platforms
  terrain_grass_horizontal_left:    { type: TILE_TYPE.PLATFORM, material: 'grass' },
  terrain_grass_horizontal_middle:  { type: TILE_TYPE.PLATFORM, material: 'grass' },
  terrain_grass_horizontal_right:   { type: TILE_TYPE.PLATFORM, material: 'grass' },
  terrain_grass_horizontal_overhang_left:  { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_horizontal_overhang_right: { type: TILE_TYPE.SOLID, material: 'grass' },
  // Grass clouds
  terrain_grass_cloud:              { type: TILE_TYPE.PLATFORM, material: 'grass' },
  terrain_grass_cloud_left:         { type: TILE_TYPE.PLATFORM, material: 'grass' },
  terrain_grass_cloud_middle:       { type: TILE_TYPE.PLATFORM, material: 'grass' },
  terrain_grass_cloud_right:        { type: TILE_TYPE.PLATFORM, material: 'grass' },
  terrain_grass_cloud_background:   { type: TILE_TYPE.DECORATION, material: 'grass' },
  // Grass vertical
  terrain_grass_vertical_top:       { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_vertical_middle:    { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_vertical_bottom:    { type: TILE_TYPE.SOLID, material: 'grass' },
  // Grass ramps
  terrain_grass_ramp_long_a:        { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_ramp_long_b:        { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_ramp_long_c:        { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_ramp_short_a:       { type: TILE_TYPE.SOLID, material: 'grass' },
  terrain_grass_ramp_short_b:       { type: TILE_TYPE.SOLID, material: 'grass' },

  // Dirt (same pattern)
  terrain_dirt_block:              { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_block_top:          { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_block_bottom:       { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_block_left:         { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_block_right:        { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_block_top_left:     { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_block_top_right:    { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_block_bottom_left:  { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_block_bottom_right: { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_block_center:       { type: TILE_TYPE.SOLID, material: 'dirt' },
  terrain_dirt_horizontal_left:    { type: TILE_TYPE.PLATFORM, material: 'dirt' },
  terrain_dirt_horizontal_middle:  { type: TILE_TYPE.PLATFORM, material: 'dirt' },
  terrain_dirt_horizontal_right:   { type: TILE_TYPE.PLATFORM, material: 'dirt' },
  terrain_dirt_cloud:              { type: TILE_TYPE.PLATFORM, material: 'dirt' },
  terrain_dirt_cloud_left:         { type: TILE_TYPE.PLATFORM, material: 'dirt' },
  terrain_dirt_cloud_middle:       { type: TILE_TYPE.PLATFORM, material: 'dirt' },
  terrain_dirt_cloud_right:        { type: TILE_TYPE.PLATFORM, material: 'dirt' },

  // Stone
  terrain_stone_block:             { type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_block_top:         { type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_block_bottom:      { type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_block_left:        { type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_block_right:       { type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_block_top_left:    { type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_block_top_right:   { type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_block_bottom_left: { type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_block_bottom_right:{ type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_block_center:      { type: TILE_TYPE.SOLID, material: 'stone' },
  terrain_stone_horizontal_left:   { type: TILE_TYPE.PLATFORM, material: 'stone' },
  terrain_stone_horizontal_middle: { type: TILE_TYPE.PLATFORM, material: 'stone' },
  terrain_stone_horizontal_right:  { type: TILE_TYPE.PLATFORM, material: 'stone' },

  // ── Interactive Blocks ──
  block_coin:                { type: TILE_TYPE.SOLID, category: 'block' },
  block_coin_active:         { type: TILE_TYPE.SOLID, category: 'block' },
  block_exclamation:         { type: TILE_TYPE.SOLID, category: 'block' },
  block_exclamation_active:  { type: TILE_TYPE.SOLID, category: 'block' },
  block_empty:               { type: TILE_TYPE.SOLID, category: 'block' },
  block_empty_warning:       { type: TILE_TYPE.SOLID, category: 'block' },
  block_strong_coin:         { type: TILE_TYPE.SOLID, category: 'block' },
  block_strong_exclamation:  { type: TILE_TYPE.SOLID, category: 'block' },
  block_spikes:              { type: TILE_TYPE.HAZARD, category: 'block' },
  block_plank:               { type: TILE_TYPE.PLATFORM, category: 'block' },
  block_planks:              { type: TILE_TYPE.PLATFORM, category: 'block' },
  brick_brown:               { type: TILE_TYPE.SOLID, category: 'block' },
  brick_grey:                { type: TILE_TYPE.SOLID, category: 'block' },
  bricks_brown:              { type: TILE_TYPE.SOLID, category: 'block' },
  bricks_grey:               { type: TILE_TYPE.SOLID, category: 'block' },

  // ── Items (COLLECTIBLE) ──
  coin_gold:      { type: TILE_TYPE.ITEM, category: 'coin' },
  coin_gold_side: { type: TILE_TYPE.ITEM, category: 'coin' },
  coin_silver:    { type: TILE_TYPE.ITEM, category: 'coin' },
  coin_bronze:    { type: TILE_TYPE.ITEM, category: 'coin' },
  gem_blue:       { type: TILE_TYPE.ITEM, category: 'gem' },
  gem_green:      { type: TILE_TYPE.ITEM, category: 'gem' },
  gem_red:        { type: TILE_TYPE.ITEM, category: 'gem' },
  gem_yellow:     { type: TILE_TYPE.ITEM, category: 'gem' },
  heart:          { type: TILE_TYPE.ITEM, category: 'health' },
  star:           { type: TILE_TYPE.ITEM, category: 'star' },
  key_blue:       { type: TILE_TYPE.ITEM, category: 'key' },
  key_green:      { type: TILE_TYPE.ITEM, category: 'key' },
  key_red:        { type: TILE_TYPE.ITEM, category: 'key' },
  key_yellow:     { type: TILE_TYPE.ITEM, category: 'key' },
  mushroom_brown: { type: TILE_TYPE.ITEM, category: 'powerup' },
  mushroom_red:   { type: TILE_TYPE.ITEM, category: 'powerup' },

  // ── Hazards ──
  spikes:          { type: TILE_TYPE.HAZARD, category: 'hazard' },
  lava:            { type: TILE_TYPE.HAZARD, category: 'hazard' },
  lava_top:        { type: TILE_TYPE.HAZARD, category: 'hazard' },
  lava_top_low:    { type: TILE_TYPE.HAZARD, category: 'hazard' },
  saw:             { type: TILE_TYPE.HAZARD, category: 'hazard' },
  fireball:        { type: TILE_TYPE.HAZARD, category: 'hazard' },
  bomb:            { type: TILE_TYPE.HAZARD, category: 'hazard' },
  bomb_active:     { type: TILE_TYPE.HAZARD, category: 'hazard' },

  // ── Special ──
  spring:       { type: TILE_TYPE.SPRING, category: 'spring' },
  spring_out:   { type: TILE_TYPE.SPRING, category: 'spring' },
  ladder_top:   { type: TILE_TYPE.LADDER, category: 'ladder' },
  ladder_middle:{ type: TILE_TYPE.LADDER, category: 'ladder' },
  ladder_bottom:{ type: TILE_TYPE.LADDER, category: 'ladder' },
  door_closed:     { type: TILE_TYPE.DOOR, category: 'door' },
  door_closed_top: { type: TILE_TYPE.DOOR, category: 'door' },
  door_open:       { type: TILE_TYPE.DOOR, category: 'door' },
  door_open_top:   { type: TILE_TYPE.DOOR, category: 'door' },
  lock_blue:    { type: TILE_TYPE.SOLID, category: 'lock' },
  lock_green:   { type: TILE_TYPE.SOLID, category: 'lock' },
  lock_red:     { type: TILE_TYPE.SOLID, category: 'lock' },
  lock_yellow:  { type: TILE_TYPE.SOLID, category: 'lock' },
  water:        { type: TILE_TYPE.WATER, category: 'water' },
  water_top:    { type: TILE_TYPE.WATER, category: 'water' },
  water_top_low:{ type: TILE_TYPE.WATER, category: 'water' },

  // ── Decoration (no collision) ──
  grass:         { type: TILE_TYPE.DECORATION, category: 'plant' },
  grass_purple:  { type: TILE_TYPE.DECORATION, category: 'plant' },
  bush:          { type: TILE_TYPE.DECORATION, category: 'plant' },
  cactus:        { type: TILE_TYPE.DECORATION, category: 'plant' },
  hill:          { type: TILE_TYPE.DECORATION, category: 'scenery' },
  hill_top:      { type: TILE_TYPE.DECORATION, category: 'scenery' },
  hill_top_smile:{ type: TILE_TYPE.DECORATION, category: 'scenery' },
  rock:          { type: TILE_TYPE.DECORATION, category: 'scenery' },
  snow:          { type: TILE_TYPE.DECORATION, category: 'scenery' },
  fence:         { type: TILE_TYPE.DECORATION, category: 'scenery' },
  fence_broken:  { type: TILE_TYPE.DECORATION, category: 'scenery' },
  bridge:        { type: TILE_TYPE.PLATFORM, category: 'scenery' },
  bridge_logs:   { type: TILE_TYPE.PLATFORM, category: 'scenery' },
  sign:          { type: TILE_TYPE.DECORATION, category: 'sign' },
  sign_exit:     { type: TILE_TYPE.DECORATION, category: 'sign' },
  sign_left:     { type: TILE_TYPE.DECORATION, category: 'sign' },
  sign_right:    { type: TILE_TYPE.DECORATION, category: 'sign' },
  flag_off:      { type: TILE_TYPE.DECORATION, category: 'flag' },
  flag_green_a:  { type: TILE_TYPE.DECORATION, category: 'flag' },
  flag_green_b:  { type: TILE_TYPE.DECORATION, category: 'flag' },
  flag_red_a:    { type: TILE_TYPE.DECORATION, category: 'flag' },
  flag_red_b:    { type: TILE_TYPE.DECORATION, category: 'flag' },
  flag_blue_a:   { type: TILE_TYPE.DECORATION, category: 'flag' },
  flag_blue_b:   { type: TILE_TYPE.DECORATION, category: 'flag' },
  flag_yellow_a: { type: TILE_TYPE.DECORATION, category: 'flag' },
  flag_yellow_b: { type: TILE_TYPE.DECORATION, category: 'flag' },
  chain:         { type: TILE_TYPE.DECORATION, category: 'scenery' },
  rope:          { type: TILE_TYPE.DECORATION, category: 'scenery' },
  rop_attached:  { type: TILE_TYPE.DECORATION, category: 'scenery' },
  torch_on_a:    { type: TILE_TYPE.DECORATION, category: 'scenery' },
  torch_on_b:    { type: TILE_TYPE.DECORATION, category: 'scenery' },
  torch_off:     { type: TILE_TYPE.DECORATION, category: 'scenery' },
  window:        { type: TILE_TYPE.DECORATION, category: 'scenery' },
  ramp:          { type: TILE_TYPE.SOLID, category: 'scenery' },
  conveyor:      { type: TILE_TYPE.SOLID, category: 'special' },

  // ── HUD elements ──
  hud_heart:       { type: null, category: 'hud' },
  hud_heart_empty: { type: null, category: 'hud' },
  hud_heart_half:  { type: null, category: 'hud' },
  hud_coin:        { type: null, category: 'hud' },
};

/**
 * Get tile collision type by name
 */
export function getTileType(tileName) {
  return TILE_REGISTRY[tileName]?.type ?? TILE_TYPE.EMPTY;
}

/**
 * Check if a tile is solid (blocks movement)
 */
export function isSolid(tileName) {
  const t = getTileType(tileName);
  return t === TILE_TYPE.SOLID;
}

/**
 * Check if a tile is a platform (can stand on top but pass through from below)
 */
export function isPlatform(tileName) {
  const t = getTileType(tileName);
  return t === TILE_TYPE.PLATFORM;
}

/**
 * Group tile names by category for editor palette
 */
export function getTilesByCategory() {
  const groups = {};
  for (const [name, info] of Object.entries(TILE_REGISTRY)) {
    const cat = info.category || info.material || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(name);
  }
  return groups;
}

/**
 * Group tile names by material for terrain auto-tiling
 */
export function getTilesByMaterial(material) {
  return Object.entries(TILE_REGISTRY)
    .filter(([, info]) => info.material === material)
    .map(([name]) => name);
}
