/* ========================================
   editorAssets.js — 编辑器素材目录
   从 kenney_new-platformer-pack-1.1 中分类整理
   所有路径使用 Double (2x) 尺寸版本
   ========================================
   分类逻辑:
   1. 🟫 普通地形    — 草地/泥土/沙地/雪地/石头/紫色 (可连续绘制)
   2. 🌊 特殊地形    — 岩浆/水/传送带/坡道 (有物理效果)
   3. 🧱 建筑砖块    — 砖墙/方块/桥板 (装饰性建筑)
   4. ⭐ 可收集(加分) — 金币/宝石/星星 (拾取加分)
   5. 🎒 可拾取(道具) — 钥匙/爱心/蘑菇/火球 (拾取获得效果)
   6. ⚙️ 机关(互动)  — 弹簧/问号砖/开关/拉杆/炸弹/锯齿/尖刺/锁 (有交互逻辑)
   7. 🚪 门/出入口   — 门/旗帜/路标/出口
   8. 👾 敌人        — 各类敌人
   9. 🧑 角色        — 可选玩家角色(设出生点)
   10. 🌿 装饰/场景  — 植物/石头/围栏/草丛 (纯装饰)
   11. 🏞️ 背景       — 关卡背景
   ======================================== */

const BASE = '/assets/kenney/kenney_new-platformer-pack-1.1/Sprites';
const T = `${BASE}/Tiles/Double`;
const C = `${BASE}/Characters/Double`;
const E = `${BASE}/Enemies/Double`;
const BG = `${BASE}/Backgrounds`;

/* ══════════════════════════════════════════
   1. 🟫 普通地形 — 可连续绘制的基础地形块
   ══════════════════════════════════════════ */
export const TERRAIN = {
  label: '🟫 普通地形',
  items: [
    // 草地系
    { id: 'grass_block', name: '草地', src: `${T}/terrain_grass_block.png` },
    { id: 'grass_block_top', name: '草顶', src: `${T}/terrain_grass_block_top.png` },
    { id: 'grass_block_left', name: '草左', src: `${T}/terrain_grass_block_left.png` },
    { id: 'grass_block_right', name: '草右', src: `${T}/terrain_grass_block_right.png` },
    { id: 'grass_block_center', name: '草中', src: `${T}/terrain_grass_block_center.png` },
    { id: 'grass_block_bottom', name: '草底', src: `${T}/terrain_grass_block_bottom.png` },
    { id: 'grass_cloud', name: '草浮台', src: `${T}/terrain_grass_cloud.png` },
    { id: 'grass_cloud_left', name: '草浮台左', src: `${T}/terrain_grass_cloud_left.png` },
    { id: 'grass_cloud_middle', name: '草浮台中', src: `${T}/terrain_grass_cloud_middle.png` },
    { id: 'grass_cloud_right', name: '草浮台右', src: `${T}/terrain_grass_cloud_right.png` },
    // 泥土系
    { id: 'dirt_block', name: '泥土', src: `${T}/terrain_dirt_block.png` },
    { id: 'dirt_block_top', name: '泥顶', src: `${T}/terrain_dirt_block_top.png` },
    { id: 'dirt_block_left', name: '泥左', src: `${T}/terrain_dirt_block_left.png` },
    { id: 'dirt_block_right', name: '泥右', src: `${T}/terrain_dirt_block_right.png` },
    { id: 'dirt_block_center', name: '泥中', src: `${T}/terrain_dirt_block_center.png` },
    { id: 'dirt_cloud', name: '泥浮台', src: `${T}/terrain_dirt_cloud.png` },
    // 沙地系
    { id: 'sand_block', name: '沙地', src: `${T}/terrain_sand_block.png` },
    { id: 'sand_block_top', name: '沙顶', src: `${T}/terrain_sand_block_top.png` },
    { id: 'sand_block_left', name: '沙左', src: `${T}/terrain_sand_block_left.png` },
    { id: 'sand_block_right', name: '沙右', src: `${T}/terrain_sand_block_right.png` },
    { id: 'sand_block_center', name: '沙中', src: `${T}/terrain_sand_block_center.png` },
    { id: 'sand_cloud', name: '沙浮台', src: `${T}/terrain_sand_cloud.png` },
    // 雪地系
    { id: 'snow_block', name: '雪地', src: `${T}/terrain_snow_block.png` },
    { id: 'snow_block_top', name: '雪顶', src: `${T}/terrain_snow_block_top.png` },
    { id: 'snow_block_left', name: '雪左', src: `${T}/terrain_snow_block_left.png` },
    { id: 'snow_block_right', name: '雪右', src: `${T}/terrain_snow_block_right.png` },
    { id: 'snow_block_center', name: '雪中', src: `${T}/terrain_snow_block_center.png` },
    { id: 'snow_cloud', name: '雪浮台', src: `${T}/terrain_snow_cloud.png` },
    // 石头系
    { id: 'stone_block', name: '石块', src: `${T}/terrain_stone_block.png` },
    { id: 'stone_block_top', name: '石顶', src: `${T}/terrain_stone_block_top.png` },
    { id: 'stone_block_left', name: '石左', src: `${T}/terrain_stone_block_left.png` },
    { id: 'stone_block_right', name: '石右', src: `${T}/terrain_stone_block_right.png` },
    { id: 'stone_block_center', name: '石中', src: `${T}/terrain_stone_block_center.png` },
    { id: 'stone_cloud', name: '石浮台', src: `${T}/terrain_stone_cloud.png` },
    // 紫色系
    { id: 'purple_block', name: '紫块', src: `${T}/terrain_purple_block.png` },
    { id: 'purple_block_top', name: '紫顶', src: `${T}/terrain_purple_block_top.png` },
    { id: 'purple_block_left', name: '紫左', src: `${T}/terrain_purple_block_left.png` },
    { id: 'purple_block_right', name: '紫右', src: `${T}/terrain_purple_block_right.png` },
    { id: 'purple_block_center', name: '紫中', src: `${T}/terrain_purple_block_center.png` },
    { id: 'purple_cloud', name: '紫浮台', src: `${T}/terrain_purple_cloud.png` },
  ],
};

/* ══════════════════════════════════════════
   2. 🌊 特殊地形 — 有物理效果的地形
   ══════════════════════════════════════════ */
export const SPECIAL_TERRAIN = {
  label: '🌊 特殊地形',
  items: [
    // 岩浆 (碰触掉血/死亡)
    { id: 'lava_top', name: '岩浆面', src: `${T}/lava_top.png` },
    { id: 'lava_top_low', name: '矮岩浆面', src: `${T}/lava_top_low.png` },
    { id: 'lava', name: '岩浆', src: `${T}/lava.png` },
    // 水 (减速/漂浮)
    { id: 'water_top', name: '水面', src: `${T}/water_top.png` },
    { id: 'water_top_low', name: '矮水面', src: `${T}/water_top_low.png` },
    { id: 'water', name: '水', src: `${T}/water.png` },
    // 传送带 (自动移动玩家)
    { id: 'conveyor', name: '传送带', src: `${T}/conveyor.png` },
    // 坡道 (斜面行走)
    { id: 'ramp', name: '斜坡', src: `${T}/ramp.png` },
    // 尖刺方块 (碰触掉血)
    { id: 'block_spikes', name: '尖刺方块', src: `${T}/block_spikes.png` },
  ],
};

/* ══════════════════════════════════════════
   3. 🧱 建筑砖块 — 装饰性建筑
   ══════════════════════════════════════════ */
export const BLOCKS = {
  label: '🧱 建筑砖块',
  items: [
    { id: 'brick_brown', name: '棕砖', src: `${T}/brick_brown.png` },
    { id: 'brick_grey', name: '灰砖', src: `${T}/brick_grey.png` },
    { id: 'bricks_brown', name: '棕砖墙', src: `${T}/bricks_brown.png` },
    { id: 'bricks_grey', name: '灰砖墙', src: `${T}/bricks_grey.png` },
    { id: 'brick_brown_diag', name: '棕砖斜', src: `${T}/brick_brown_diagonal.png` },
    { id: 'brick_grey_diag', name: '灰砖斜', src: `${T}/brick_grey_diagonal.png` },
    { id: 'block_plank', name: '木板', src: `${T}/block_plank.png` },
    { id: 'block_planks', name: '木板组', src: `${T}/block_planks.png` },
    { id: 'block_green', name: '绿方块', src: `${T}/block_green.png` },
    { id: 'block_blue', name: '蓝方块', src: `${T}/block_blue.png` },
    { id: 'block_brown', name: '棕方块', src: `${T}/block_brown.png` },
    { id: 'block_red', name: '红方块', src: `${T}/block_red.png` },
    { id: 'block_yellow', name: '黄方块', src: `${T}/block_yellow.png` },
    { id: 'block_empty', name: '空方块', src: `${T}/block_empty.png` },
    { id: 'bridge', name: '桥板', src: `${T}/bridge.png` },
    { id: 'bridge_logs', name: '原木桥', src: `${T}/bridge_logs.png` },
    { id: 'window', name: '窗户', src: `${T}/window.png` },
    { id: 'weight', name: '砝码', src: `${T}/weight.png` },
  ],
};

/* ══════════════════════════════════════════
   4. ⭐ 可收集(加分) — 拾取后加分
   ══════════════════════════════════════════ */
export const COLLECTIBLES = {
  label: '⭐ 可收集(加分)',
  items: [
    { id: 'coin', name: '金币', src: `${T}/coin_gold.png` },
    { id: 'coin_silver', name: '银币', src: `${T}/coin_silver.png` },
    { id: 'coin_bronze', name: '铜币', src: `${T}/coin_bronze.png` },
    { id: 'star', name: '星星', src: `${T}/star.png` },
    { id: 'gem_blue', name: '蓝宝石', src: `${T}/gem_blue.png` },
    { id: 'gem_green', name: '绿宝石', src: `${T}/gem_green.png` },
    { id: 'gem_red', name: '红宝石', src: `${T}/gem_red.png` },
    { id: 'gem_yellow', name: '黄宝石', src: `${T}/gem_yellow.png` },
  ],
};

/* ══════════════════════════════════════════
   5. 🎒 可拾取(道具) — 拾取后获得特殊效果
   ══════════════════════════════════════════ */
export const PICKUPS = {
  label: '🎒 道具(可拾取)',
  items: [
    { id: 'hud_heart', name: '❤️ 爱心(+1HP)', src: `${T}/hud_heart.png` },
    { id: 'heart', name: '大爱心', src: `${T}/heart.png` },
    { id: 'hud_key_blue', name: '🔵 蓝钥匙', src: `${T}/hud_key_blue.png` },
    { id: 'hud_key_red', name: '🔴 红钥匙', src: `${T}/hud_key_red.png` },
    { id: 'hud_key_green', name: '🟢 绿钥匙', src: `${T}/hud_key_green.png` },
    { id: 'hud_key_yellow', name: '🟡 黄钥匙', src: `${T}/hud_key_yellow.png` },
    { id: 'key_blue', name: '蓝钥匙(大)', src: `${T}/key_blue.png` },
    { id: 'key_red', name: '红钥匙(大)', src: `${T}/key_red.png` },
    { id: 'key_green', name: '绿钥匙(大)', src: `${T}/key_green.png` },
    { id: 'key_yellow', name: '黄钥匙(大)', src: `${T}/key_yellow.png` },
    { id: 'mushroom_red', name: '🍄 红蘑菇(变大)', src: `${T}/mushroom_red.png` },
    { id: 'mushroom_brown', name: '🍄 棕蘑菇(加速)', src: `${T}/mushroom_brown.png` },
    { id: 'fireball', name: '🔥 火球(攻击)', src: `${T}/fireball.png` },
  ],
};

/* ══════════════════════════════════════════
   6. ⚙️ 机关(互动) — 有交互逻辑的元素
   ══════════════════════════════════════════ */
export const INTERACTABLE_ASSETS = {
  label: '⚙️ 机关(互动)',
  items: [
    // 问号砖 (撞击出物品)
    { id: 'block_exclamation', name: '❓ 问号砖', src: `${T}/block_exclamation.png` },
    { id: 'block_coin', name: '💰 金币砖', src: `${T}/block_coin.png` },
    { id: 'block_strong', name: '坚固问号砖', src: `${T}/block_strong_exclamation.png` },
    { id: 'block_strong_coin', name: '坚固金币砖', src: `${T}/block_strong_coin.png` },
    { id: 'block_strong_danger', name: '⚠️ 危险砖', src: `${T}/block_strong_danger.png` },
    { id: 'block_empty_warning', name: '警告空砖', src: `${T}/block_empty_warning.png` },
    // 弹簧 (弹跳)
    { id: 'spring', name: '🔺 弹簧', src: `${T}/spring.png` },
    { id: 'spring_out', name: '弹簧(弹出)', src: `${T}/spring_out.png` },
    // 开关 (触发机关)
    { id: 'switch_blue', name: '蓝开关', src: `${T}/switch_blue.png` },
    { id: 'switch_red', name: '红开关', src: `${T}/switch_red.png` },
    { id: 'switch_green', name: '绿开关', src: `${T}/switch_green.png` },
    { id: 'switch_yellow', name: '黄开关', src: `${T}/switch_yellow.png` },
    // 拉杆 (触发机关)
    { id: 'lever', name: '拉杆', src: `${T}/lever.png` },
    { id: 'lever_left', name: '拉杆左', src: `${T}/lever_left.png` },
    { id: 'lever_right', name: '拉杆右', src: `${T}/lever_right.png` },
    // 锁 (需对应钥匙)
    { id: 'lock_blue', name: '🔒 蓝锁', src: `${T}/lock_blue.png` },
    { id: 'lock_red', name: '🔒 红锁', src: `${T}/lock_red.png` },
    { id: 'lock_green', name: '🔒 绿锁', src: `${T}/lock_green.png` },
    { id: 'lock_yellow', name: '🔒 黄锁', src: `${T}/lock_yellow.png` },
    // 危险机关
    { id: 'spikes', name: '⚠️ 尖刺', src: `${T}/spikes.png` },
    { id: 'saw', name: '🔴 锯齿', src: `${T}/saw.png` },
    { id: 'bomb', name: '💣 炸弹', src: `${T}/bomb.png` },
    // 攀爬
    { id: 'ladder', name: '🪜 梯子(顶)', src: `${T}/ladder_top.png` },
    { id: 'ladder_middle', name: '梯子(中)', src: `${T}/ladder_middle.png` },
    { id: 'ladder_bottom', name: '梯子(底)', src: `${T}/ladder_bottom.png` },
    { id: 'rope', name: '绳索', src: `${T}/rop_attached.png` },
    { id: 'chain', name: '锁链', src: `${T}/chain.png` },
    // 照明
    { id: 'torch_on', name: '🔥 火把', src: `${T}/torch_on_a.png` },
    { id: 'torch_off', name: '火把(灭)', src: `${T}/torch_off.png` },
  ],
};

/* ══════════════════════════════════════════
   7. 🚪 门/出入口 — 关卡出入口与路标
   ══════════════════════════════════════════ */
export const DOORS = {
  label: '🚪 门/出入口',
  items: [
    { id: 'door_closed_top', name: '关门(上)', src: `${T}/door_closed_top.png` },
    { id: 'door_closed', name: '关门', src: `${T}/door_closed.png` },
    { id: 'door_open_top', name: '开门(上)', src: `${T}/door_open_top.png` },
    { id: 'door_open', name: '开门', src: `${T}/door_open.png` },
    { id: 'flag', name: '🚩 旗帜(关)', src: `${T}/flag_off.png` },
    { id: 'flag_green', name: '🟢 绿旗', src: `${T}/flag_green_a.png` },
    { id: 'flag_red', name: '🔴 红旗', src: `${T}/flag_red_a.png` },
    { id: 'flag_blue', name: '🔵 蓝旗', src: `${T}/flag_blue_a.png` },
    { id: 'flag_yellow', name: '🟡 黄旗', src: `${T}/flag_yellow_a.png` },
    { id: 'sign_left', name: '←路牌', src: `${T}/sign_left.png` },
    { id: 'sign_right', name: '→路牌', src: `${T}/sign_right.png` },
    { id: 'sign', name: '路牌', src: `${T}/sign.png` },
    { id: 'sign_exit', name: '出口牌', src: `${T}/sign_exit.png` },
  ],
};

/* ══════════════════════════════════════════
   8. 👾 敌人 — 各类敌人
   ══════════════════════════════════════════ */
export const ENEMIES_ASSETS = {
  label: '👾 敌人',
  items: [
    // ── 地面敌人 ──
    { id: 'slime_normal',  name: '绿史莱姆',  src: `${E}/slime_normal_rest.png`,  enemyType: 'slime' },
    { id: 'slime_fire',    name: '火史莱姆',   src: `${E}/slime_fire_rest.png`,    enemyType: 'slime_fire' },
    { id: 'slime_spike',   name: '刺史莱姆',   src: `${E}/slime_spike_rest.png`,   enemyType: 'slime_spike' },
    { id: 'slime_block',   name: '方块史莱姆', src: `${E}/slime_block_rest.png`,   enemyType: 'slime_block' },
    { id: 'snail',         name: '蜗牛',       src: `${E}/snail_rest.png`,         enemyType: 'snail' },
    { id: 'mouse',         name: '老鼠',       src: `${E}/mouse_rest.png`,         enemyType: 'mouse' },
    { id: 'frog',          name: '青蛙',       src: `${E}/frog_idle.png`,          enemyType: 'frog' },
    { id: 'ladybug',       name: '瓢虫',       src: `${E}/ladybug_rest.png`,       enemyType: 'ladybug' },
    { id: 'worm_normal',   name: '蠕虫',       src: `${E}/worm_normal_rest.png`,   enemyType: 'worm' },
    { id: 'worm_ring',     name: '环虫',       src: `${E}/worm_ring_rest.png`,     enemyType: 'worm_ring' },
    { id: 'barnacle',      name: '藤壶',       src: `${E}/barnacle_attack_rest.png`, enemyType: 'barnacle' },
    // ── 飞行敌人 ──
    { id: 'bee',           name: '蜜蜂',       src: `${E}/bee_rest.png`,           enemyType: 'bee' },
    { id: 'fly',           name: '苍蝇',       src: `${E}/fly_rest.png`,           enemyType: 'fly_enemy' },
    // ── 机关型敌人 ──
    { id: 'saw_enemy',     name: '锯齿怪',     src: `${E}/saw_rest.png`,           enemyType: 'saw_enemy' },
    { id: 'block_enemy',   name: '石块怪',     src: `${E}/block_rest.png`,         enemyType: 'block_enemy' },
    // ── 水域敌人 ──
    { id: 'fish_blue',     name: '蓝鱼',       src: `${E}/fish_blue_rest.png`,     enemyType: 'fish' },
  ],
};

/* ══════════════════════════════════════════
   9. 🧑 角色 — 设置出生点
   ══════════════════════════════════════════ */
export const CHARACTERS = {
  label: '🧑 角色(出生点)',
  items: [
    { id: 'char_green_idle', name: '绿色玩家', src: `${C}/character_green_idle.png` },
    { id: 'char_blue_idle', name: '蓝色玩家', src: `${C}/character_blue_idle.png` },
    { id: 'char_pink_idle', name: '粉色玩家', src: `${C}/character_pink_idle.png` },
    { id: 'char_yellow_idle', name: '黄色玩家', src: `${C}/character_yellow_idle.png` },
  ],
};

/* ══════════════════════════════════════════
   10. 🌿 装饰/场景 — 纯装饰无碰撞
   ══════════════════════════════════════════ */
export const DECOR = {
  label: '🌿 装饰场景',
  items: [
    { id: 'plant', name: '植物', src: `${T}/plant.png` },
    { id: 'plant_tall', name: '高植物', src: `${T}/plant_tall.png` },
    { id: 'grass', name: '草丛', src: `${T}/grass.png` },
    { id: 'grass_purple', name: '紫草', src: `${T}/grass_purple.png` },
    { id: 'bush', name: '灌木', src: `${T}/bush.png` },
    { id: 'cactus', name: '仙人掌', src: `${T}/cactus.png` },
    { id: 'rock', name: '石头', src: `${T}/rock.png` },
    { id: 'snow', name: '积雪', src: `${T}/snow.png` },
    { id: 'fence', name: '围栏', src: `${T}/fence.png` },
    { id: 'fence_broken', name: '断围栏', src: `${T}/fence_broken.png` },
    { id: 'hill', name: '山丘', src: `${T}/hill.png` },
    { id: 'hill_top', name: '山顶', src: `${T}/hill_top.png` },
    { id: 'hill_top_smile', name: '笑脸山', src: `${T}/hill_top_smile.png` },
  ],
};

/* ══════════════════════════════════════════
   11. 🏞️ 背景 — 一键渲染背景图 + 装饰元素
   ══════════════════════════════════════════ */
const BGREDUX = '/assets/kenney/kenney_background-elements-redux';
const BGPNG = `${BGREDUX}/PNG/Default`;
const BGFULL = `${BGREDUX}/Backgrounds`;

export const BACKGROUNDS_ASSETS = {
  label: '🏞️ 背景',
  items: [
    // ── 完整背景图 (一键渲染) ──
    { id: 'bg_forest', name: '🌲 森林', src: `${BGFULL}/backgroundColorForest.png`, isBg: true },
    { id: 'bg_grass', name: '🌿 草原', src: `${BGFULL}/backgroundColorGrass.png`, isBg: true },
    { id: 'bg_desert', name: '🏜️ 沙漠', src: `${BGFULL}/backgroundColorDesert.png`, isBg: true },
    { id: 'bg_fall', name: '🍂 秋季', src: `${BGFULL}/backgroundColorFall.png`, isBg: true },
    { id: 'bg_castles', name: '🏰 城堡', src: `${BGFULL}/backgroundCastles.png`, isBg: true },
    { id: 'bg_forest_dark', name: '🌳 深林', src: `${BGFULL}/backgroundForest.png`, isBg: true },
    { id: 'bg_desert_plain', name: '☀️ 荒漠', src: `${BGFULL}/backgroundDesert.png`, isBg: true },
    { id: 'bg_empty', name: '⬜ 空白', src: `${BGFULL}/backgroundEmpty.png`, isBg: true },
    // ── 背景装饰元素 ──
    { id: 'bgd_tree', name: '绿树', src: `${BGPNG}/tree.png` },
    { id: 'bgd_tree_long', name: '高树', src: `${BGPNG}/treeLong.png` },
    { id: 'bgd_tree_pine', name: '松树', src: `${BGPNG}/treePine.png` },
    { id: 'bgd_tree_palm', name: '棕榈', src: `${BGPNG}/treePalm.png` },
    { id: 'bgd_tree_orange', name: '秋树', src: `${BGPNG}/treeOrange.png` },
    { id: 'bgd_tree_frozen', name: '冰树', src: `${BGPNG}/treeFrozen.png` },
    { id: 'bgd_tree_dead', name: '枯树', src: `${BGPNG}/treeDead.png` },
    { id: 'bgd_tree_snow', name: '雪树', src: `${BGPNG}/treeSnow.png` },
    { id: 'bgd_bush1', name: '灌木1', src: `${BGPNG}/bush1.png` },
    { id: 'bgd_bush2', name: '灌木2', src: `${BGPNG}/bush2.png` },
    { id: 'bgd_bush_orange', name: '橙灌木', src: `${BGPNG}/bushOrange1.png` },
    { id: 'bgd_cloud1', name: '云1', src: `${BGPNG}/cloud1.png` },
    { id: 'bgd_cloud2', name: '云2', src: `${BGPNG}/cloud2.png` },
    { id: 'bgd_cloud3', name: '云3', src: `${BGPNG}/cloud3.png` },
    { id: 'bgd_sun', name: '☀️ 太阳', src: `${BGPNG}/sun.png` },
    { id: 'bgd_moon', name: '🌙 月亮', src: `${BGPNG}/moon.png` },
    { id: 'bgd_moon_full', name: '满月', src: `${BGPNG}/moonFull.png` },
    { id: 'bgd_house1', name: '房屋1', src: `${BGPNG}/house1.png` },
    { id: 'bgd_house2', name: '房屋2', src: `${BGPNG}/house2.png` },
    { id: 'bgd_house_small', name: '小屋', src: `${BGPNG}/houseSmall1.png` },
    { id: 'bgd_castle', name: '小城堡', src: `${BGPNG}/castleSmall.png` },
    { id: 'bgd_castle_wall', name: '城墙', src: `${BGPNG}/castleWall.png` },
    { id: 'bgd_tower', name: '塔楼', src: `${BGPNG}/tower.png` },
    { id: 'bgd_pyramid', name: '金字塔', src: `${BGPNG}/pyramid.png` },
    { id: 'bgd_pyramid_mayan', name: '玛雅塔', src: `${BGPNG}/pyramidMayan.png` },
    { id: 'bgd_fence', name: '栅栏', src: `${BGPNG}/fence.png` },
    { id: 'bgd_fence_iron', name: '铁栅栏', src: `${BGPNG}/fenceIron.png` },
    { id: 'bgd_cactus1', name: '仙人掌1', src: `${BGPNG}/cactus1.png` },
    { id: 'bgd_cactus2', name: '仙人掌2', src: `${BGPNG}/cactus2.png` },
  ],
};

/* ═══════════ 汇总 ═══════════ */
export const ALL_CATEGORIES = [
  TERRAIN,
  SPECIAL_TERRAIN,
  BLOCKS,
  COLLECTIBLES,
  PICKUPS,
  INTERACTABLE_ASSETS,
  DOORS,
  ENEMIES_ASSETS,
  CHARACTERS,
  DECOR,
  BACKGROUNDS_ASSETS,
];

/* 根据id查找素材src */
export function getAssetSrc(assetId) {
  for (const cat of ALL_CATEGORIES) {
    const found = cat.items.find(i => i.id === assetId);
    if (found) return found.src;
  }
  return null;
}
