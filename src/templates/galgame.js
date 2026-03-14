export default {
  name: 'NPC 剧情对话',
  description: '互动叙事体验，与 NPC 对话推进剧情（类 Galgame）',
  templateType: 'galgame',
  icon: '💬',
  elements: [
    { id: 'bg', name: '场景背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600, depth: 0 }, style: { fillColor: '#1a1a3e', gradientTo: '#0d0d2b', alpha: 1 } },
    { id: 'stars', name: '萤火虫', category: 'scene', type: 'particles', visible: true, transform: { x: 0, y: 0, width: 800, height: 400, depth: 1 }, style: { fillColor: '#a3e635', particleCount: 25, particleSize: 2, alpha: 0.5 } },
    { id: 'npc_body', name: 'NPC 角色', category: 'sprite', type: 'graphics', visible: true, transform: { x: 300, y: 280, width: 120, height: 200, depth: 5 }, style: { fillColor: '#7c3aed', shape: 'rect', borderRadius: 60, hasEyes: true } },
    { id: 'npc_hat', name: 'NPC 帽子', category: 'sprite', type: 'graphics', visible: true, transform: { x: 300, y: 165, width: 80, height: 30, depth: 6 }, style: { fillColor: '#a855f7', shape: 'rect', borderRadius: 15 } },
    { id: 'dialog_box', name: '对话框', category: 'sprite', type: 'graphics', visible: true, transform: { x: 400, y: 500, width: 700, height: 140, depth: 20 }, style: { fillColor: '#1e1b4b', shape: 'rect', alpha: 0.92, borderRadius: 16, strokeColor: '#6366f1', strokeWidth: 2 } },
    { id: 'speaker_name', name: '说话者', category: 'sprite', type: 'text', visible: true, transform: { x: 90, y: 445, depth: 25 }, textContent: { text: '月灵', fontSize: 18, color: '#a78bfa', bold: true } },
    { id: 'dialog_text', name: '对话内容', category: 'sprite', type: 'text', visible: true, transform: { x: 90, y: 475, width: 620, depth: 25 }, textContent: { text: '', fontSize: 16, color: '#e2e8f0', wordWrap: true } },
    { id: 'choice_1', name: '选项 1', category: 'sprite', type: 'button', visible: false, transform: { x: 580, y: 260, width: 280, height: 42, depth: 30 }, style: { fillColor: '#312e81', borderRadius: 10 }, textContent: { text: '💬 "你能帮我找到回去的路吗？"', fontSize: 14, color: '#c4b5fd' } },
    { id: 'choice_2', name: '选项 2', category: 'sprite', type: 'button', visible: false, transform: { x: 580, y: 314, width: 280, height: 42, depth: 30 }, style: { fillColor: '#312e81', borderRadius: 10 }, textContent: { text: '⚔ "我不需要帮助！"', fontSize: 14, color: '#fca5a5' } },
    { id: 'choice_3', name: '选项 3', category: 'sprite', type: 'button', visible: false, transform: { x: 580, y: 368, width: 280, height: 42, depth: 30 }, style: { fillColor: '#312e81', borderRadius: 10 }, textContent: { text: '🔍 "这是什么地方？"', fontSize: 14, color: '#93c5fd' } },
    { id: 'title', name: '章节标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 30, depth: 50, anchorX: 0.5 }, textContent: { text: '第一章: 幻境之森', fontSize: 14, color: '#6366f1', bold: true } },
    { id: 'affinity_display', name: '好感度', category: 'sprite', type: 'text', visible: true, transform: { x: 680, y: 30, depth: 50 }, textContent: { text: '❤ 0', fontSize: 14, color: '#f472b6' } },
    { id: 'var_affinity', name: 'affinity', category: 'data', type: 'variable', visible: true, dataValue: 0 }
  ],
  scripts: [
    {
      id: 's_main',
      name: 'story.js',
      content: `// 互动剧本系统 (Galgame Logic)
const dialogText = elements['dialog_text'];
const speakerName = elements['speaker_name'];
const dialogBox = elements['dialog_box'];
const affinityUI = elements['affinity_display'];

const choices = [elements['choice_1'], elements['choice_2'], elements['choice_3']];

// 剧本节点
const story = [
  { speaker: '月灵', text: '欢迎来到幻境之森。我是这里的守护者，月灵。' },
  { speaker: '月灵', text: '你似乎迷路了...' },
  { 
    speaker: '月灵', 
    text: '你需要什么帮助吗？',
    choices: [
      { text: '💬 "帮我找到回去的路"', affinityChange: 5, nextNode: 3 },
      { text: '⚔ "我不需要帮助！"', affinityChange: -5, nextNode: 4 },
      { text: '🔍 "这是什么地方？"', affinityChange: 2, nextNode: 5 }
    ]
  },
  { speaker: '月灵', text: '我会帮你的，跟我来吧。(HE)' },
  { speaker: '月灵', text: '真是一个粗鲁的旅人。祝你好运。(BE)' },
  { speaker: '月灵', text: '这里是遗忘者的归宿，时间停滞的地方。' }
];

let currentNode = 0;
let affinity = 0;
let waitingForChoice = false;

// 更新 UI
function updateNode() {
  if (currentNode >= story.length) return;
  
  const node = story[currentNode];
  speakerName.text = node.speaker;
  dialogText.text = node.text;

  // 处理分支选项
  if (node.choices) {
    waitingForChoice = true;
    node.choices.forEach((c, idx) => {
      if (idx < choices.length) {
        choices[idx].visible = true;
        const txtChild = choices[idx].children.find(ch => ch.text);
        if (txtChild) txtChild.text = c.text;
        
        // 绑定点击事件 (旧的需要解绑我们这里用一次性的方式简化)
        choices[idx].removeAllListeners();
        choices[idx].eventMode = 'static';
        choices[idx].cursor = 'pointer';
        choices[idx].on('pointerdown', (e) => {
          e.stopPropagation(); // 防止点到底层对话框
          makeChoice(c);
        });
      }
    });
  } else {
    waitingForChoice = false;
    choices.forEach(c => c.visible = false);
  }
}

// 选项响应
function makeChoice(choiceOpt) {
  affinity += choiceOpt.affinityChange || 0;
  setVariable('affinity', affinity);
  affinityUI.text = '❤ ' + affinity;
  
  currentNode = choiceOpt.nextNode || (currentNode + 1);
  updateNode();
}

// 点击对话框进行下一句
dialogBox.eventMode = 'static';
dialogBox.cursor = 'pointer';
dialogBox.on('pointerdown', () => {
  if (waitingForChoice) return; // 必须做选择
  if (currentNode < story.length - 1 && !story[currentNode].choices) {
    currentNode++;
    updateNode();
  }
});

// 启动第一句话
updateNode();
`
    }
  ]
};
