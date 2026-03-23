/* ═══════════════════════════════════════════════════════
   mazePromptParser.js — AI 提示词意图识别与动态解析引擎
   
   将用户的自然语言描述解析为迷宫配置参数：
   风格（style）、主角（character）、终点（goal）、装饰元素（decoKeys）
   
   工作流程：
   1. 文本预处理（分词 + 标准化）
   2. 关键词匹配（多维度关键词库）
   3. 置信度评分（多个关键词命中 → 更高置信度）
   4. 联合推理（根据已确定维度推断其他维度）
   5. 输出配置对象
   ═══════════════════════════════════════════════════════ */

/* ── 风格意图词库 ── */
const STYLE_INTENTS = [
  {
    key: 'forest',
    keywords: ['森林', '树林', '丛林', '绿色', '林中', '林间', '树', '大树', '松树', '草地', '草原', '自然'],
    weight: 1,
  },
  {
    key: 'autumn',
    keywords: ['秋天', '秋季', '秋日', '金秋', '落叶', '枫叶', '橙色', '金色', '丰收'],
    weight: 1,
  },
  {
    key: 'winter',
    keywords: ['冬天', '冬季', '冰雪', '雪', '雪地', '冰', '寒冷', '冰冻', '雪花', '白雪'],
    weight: 1,
  },
  {
    key: 'candy',
    keywords: ['糖果', '甜点', '蛋糕', '甜蜜', '棒棒糖', '巧克力', '饼干', '甜', '樱桃', '奶油', '华夫饼'],
    weight: 1,
  },
  {
    key: 'city',
    keywords: ['城市', '都市', '街道', '楼', '建筑', '市场', '商店', '城镇', '马路', '高楼'],
    weight: 1,
  },
  {
    key: 'village',
    keywords: ['村庄', '乡村', '农村', '小镇', '村子', '田园', '田野', '农场', '小屋'],
    weight: 1,
  },
  {
    key: 'racing',
    keywords: ['赛车', '赛道', '汽车', '越野', '沙漠', '竞速', '公路', '车', '飙车', '拉力赛', '沙地', '沙丘'],
    weight: 1,
  },
];

/* ── 角色意图词库 ── */
const CHARACTER_INTENTS = [
  { key: 'duck',       keywords: ['鸭子', '小鸭', '鸭', '嘎嘎', '黄鸭', '鸭鸭'] },
  { key: 'bee',        keywords: ['蜜蜂', '小蜜蜂', '蜂', '嗡嗡'] },
  { key: 'frog',       keywords: ['青蛙', '蛙', '小青蛙', '呱呱'] },
  { key: 'ladybug',    keywords: ['瓢虫', '小瓢虫', '七星瓢虫'] },
  { key: 'snail',      keywords: ['蜗牛', '小蜗牛'] },
  { key: 'mouse',      keywords: ['老鼠', '小老鼠', '鼠', '耗子', '小鼠'] },
  { key: 'worm',       keywords: ['毛毛虫', '虫子', '虫', '小虫'] },
  { key: 'charMan',    keywords: ['男孩', '小男孩', '男人', '小人', '男生', '少年'] },
  { key: 'charWoman',  keywords: ['女孩', '小女孩', '女人', '女生', '公主', '少女'] },
  { key: 'charWizard', keywords: ['巫师', '魔法师', '法师', '魔法'] },
  { key: 'npcGreen',   keywords: ['绿色小人', '外星人', '小绿人'] },
  { key: 'npcPink',    keywords: ['粉色小人', '粉红'] },
  { key: 'carRed',     keywords: ['赛车', '汽车', '小汽车', '红色赛车', '红车', '车', '小车', '跑车'] },
  { key: 'carBlue',    keywords: ['蓝色赛车', '蓝车', '蓝色汽车'] },
];

/* ── 终点意图词库 ── */
const GOAL_INTENTS = [
  { key: 'pool',     keywords: ['水池', '池塘', '湖', '水', '河', '泳池', '水塘', '池子'] },
  { key: 'treasure', keywords: ['宝箱', '宝藏', '金币', '财宝', '宝物'] },
  { key: 'castle',   keywords: ['城堡', '城门', '城', '宫殿', '王国'] },
  { key: 'house',    keywords: ['房子', '家', '小屋', '房屋', '小房子', '住所', '终点站', '车库'] },
  { key: 'heart',    keywords: ['爱心', '心', '爱', '红心'] },
  { key: 'cupcake',  keywords: ['蛋糕', '纸杯蛋糕', '甜品', '甜点'] },
  { key: 'flag',     keywords: ['旗帜', '旗子', '终点旗', '旗', '终点线'] },
];

/* ── 装饰元素意图词库 ── */
const DECO_INTENTS = [
  { key: 'treePine',   keywords: ['松树', '大松树'] },
  { key: 'flower',     keywords: ['花', '红花', '花朵', '鲜花'] },
  { key: 'animalBee',  keywords: ['蜜蜂'] },
  { key: 'animalFrog', keywords: ['青蛙'] },
  { key: 'heart',      keywords: ['爱心'] },
  { key: 'lollipopRed', keywords: ['棒棒糖'] },
  { key: 'blockBoxTreasure', keywords: ['宝箱'] },
  { key: 'rockSmall',  keywords: ['石头', '岩石', '小石头'] },
  { key: 'bush',       keywords: ['灌木', '草丛'] },
  { key: 'raceCone',   keywords: ['路锥', '锥桶'] },
];

/* ── 联合推理规则：当某些维度已确定时，推断其他维度 ── */
const INFERENCE_RULES = [
  // 赛车角色 → 赛车风格 + 房子终点
  { if: { character: ['carRed', 'carBlue'] }, then: { style: 'racing', goal: 'house' } },
  // 鸭子 → 森林 + 水池
  { if: { character: ['duck'] }, then: { style: 'forest', goal: 'pool' } },
  // 沙漠/越野 → 赛车风格
  { if: { style: ['racing'] }, then: { character: 'carRed' } },
  // 公主/女孩 → 村庄/城堡
  { if: { character: ['charWoman'] }, then: { style: 'village', goal: 'castle' } },
  // 巫师 → 冬天/城堡
  { if: { character: ['charWizard'] }, then: { style: 'winter', goal: 'castle' } },
  // 糖果风格 → 蛋糕终点
  { if: { style: ['candy'] }, then: { goal: 'cupcake' } },
];

/* ═══════════════════════════════════════════
   核心解析函数
   ═══════════════════════════════════════════ */

/**
 * 对文本进行意图匹配，返回匹配度最高的 key
 * @param {string} text - 用户输入文本
 * @param {Array} intentList - 意图词库
 * @returns {{ key: string|null, score: number, matches: string[] }}
 */
function matchIntent(text, intentList) {
  let bestKey = null;
  let bestScore = 0;
  let bestMatches = [];

  for (const intent of intentList) {
    let score = 0;
    const matches = [];
    for (const kw of intent.keywords) {
      if (text.includes(kw)) {
        // 越长的关键词权重越高（更精确）
        score += kw.length * (intent.weight || 1);
        matches.push(kw);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestKey = intent.key;
      bestMatches = matches;
    }
  }

  return { key: bestKey, score: bestScore, matches: bestMatches };
}

/**
 * 匹配多个意图（用于装饰元素，可多选）
 */
function matchMultiIntent(text, intentList) {
  const results = [];
  for (const intent of intentList) {
    for (const kw of intent.keywords) {
      if (text.includes(kw)) {
        results.push(intent.key);
        break;
      }
    }
  }
  return [...new Set(results)];
}

/**
 * 解析用户提示词，返回迷宫配置
 * 
 * @param {string} prompt - 用户输入的文本描述
 * @returns {{
 *   style: string,
 *   character: string,
 *   goal: string,
 *   decoKeys: string[],
 *   confidence: { style: number, character: number, goal: number },
 *   reasoning: string[]
 * }}
 */
export function parseMazePrompt(prompt) {
  if (!prompt || !prompt.trim()) {
    console.log('[PromptParser] Empty prompt, using defaults');
    return {
      style: 'forest',
      character: 'duck',
      goal: 'pool',
      decoKeys: [],
      confidence: { style: 0, character: 0, goal: 0 },
      reasoning: ['未输入描述，使用默认配置'],
    };
  }

  const text = prompt.trim().toLowerCase();
  const reasoning = [];

  console.log('[PromptParser] Parsing prompt:', text);

  // Step 1: 直接关键词匹配
  const styleMatch = matchIntent(text, STYLE_INTENTS);
  const charMatch = matchIntent(text, CHARACTER_INTENTS);
  const goalMatch = matchIntent(text, GOAL_INTENTS);
  const decoKeys = matchMultiIntent(text, DECO_INTENTS);

  let style = styleMatch.key;
  let character = charMatch.key;
  let goal = goalMatch.key;

  if (styleMatch.score > 0) {
    reasoning.push(`🎨 风格识别: "${styleMatch.matches.join('、')}" → ${style} (置信度:${styleMatch.score})`);
  }
  if (charMatch.score > 0) {
    reasoning.push(`🐤 角色识别: "${charMatch.matches.join('、')}" → ${character} (置信度:${charMatch.score})`);
  }
  if (goalMatch.score > 0) {
    reasoning.push(`🏁 终点识别: "${goalMatch.matches.join('、')}" → ${goal} (置信度:${goalMatch.score})`);
  }
  if (decoKeys.length > 0) {
    reasoning.push(`🌳 装饰识别: ${decoKeys.join(', ')}`);
  }

  // Step 2: 联合推理 — 用已确定的维度推断未确定的维度
  for (const rule of INFERENCE_RULES) {
    const conditions = rule.if;
    let conditionMet = true;

    for (const [dim, values] of Object.entries(conditions)) {
      const current = dim === 'style' ? style : dim === 'character' ? character : goal;
      if (!current || !values.includes(current)) {
        conditionMet = false;
        break;
      }
    }

    if (conditionMet) {
      const inferences = rule.then;
      if (inferences.style && !style) {
        style = inferences.style;
        reasoning.push(`🔗 联合推理: 由角色推断风格 → ${style}`);
      }
      if (inferences.character && !character) {
        character = inferences.character;
        reasoning.push(`🔗 联合推理: 由风格推断角色 → ${character}`);
      }
      if (inferences.goal && !goal) {
        goal = inferences.goal;
        reasoning.push(`🔗 联合推理: 推断终点 → ${goal}`);
      }
    }
  }

  // Step 3: 填充默认值
  if (!style) {
    style = 'forest';
    reasoning.push('📌 未识别风格，默认: 森林');
  }
  if (!character) {
    character = 'duck';
    reasoning.push('📌 未识别角色，默认: 小鸭子');
  }
  if (!goal) {
    goal = 'pool';
    reasoning.push('📌 未识别终点，默认: 水池');
  }

  const result = {
    style,
    character,
    goal,
    decoKeys,
    confidence: {
      style: styleMatch.score,
      character: charMatch.score,
      goal: goalMatch.score,
    },
    reasoning,
  };

  console.log('[PromptParser] Result:', result);
  return result;
}
