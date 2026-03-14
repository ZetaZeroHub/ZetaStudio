export default {
  name: '知识竞赛',
  description: '互动答题游戏，回答问题获取分数',
  templateType: 'quiz',
  icon: '🧠',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600, depth: 0 }, style: { fillColor: '#1a1a2e', gradientTo: '#16213e', alpha: 1 } },
    { id: 'deco_particles', name: '装饰粒子', category: 'scene', type: 'particles', visible: true, transform: { x: 0, y: 0, width: 800, height: 600, depth: 1 }, style: { fillColor: '#6366f1', particleCount: 30, particleSize: 3, alpha: 0.3 } },
    { id: 'q_box', name: '题目框', category: 'sprite', type: 'graphics', visible: true, transform: { x: 400, y: 150, width: 600, height: 120, depth: 5 }, style: { fillColor: '#2d2b55', shape: 'rect', alpha: 0.9, borderRadius: 16, strokeColor: '#6366f1', strokeWidth: 2 } },
    { id: 'q_text', name: '题目文字', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 150, depth: 10, anchorX: 0.5, anchorY: 0.5 }, textContent: { text: '地球距离太阳有多远？', fontSize: 24, color: '#ffffff', bold: true, align: 'center' } },
    { id: 'opt_a', name: '选项 A', category: 'sprite', type: 'button', visible: true, transform: { x: 250, y: 310, width: 300, height: 50, depth: 10 }, style: { fillColor: '#374151', borderRadius: 12 }, textContent: { text: 'A. 约 1.5 亿公里', fontSize: 18, color: '#e2e8f0' } },
    { id: 'opt_b', name: '选项 B', category: 'sprite', type: 'button', visible: true, transform: { x: 550, y: 310, width: 300, height: 50, depth: 10 }, style: { fillColor: '#374151', borderRadius: 12 }, textContent: { text: 'B. 约 3.8 万公里', fontSize: 18, color: '#e2e8f0' } },
    { id: 'opt_c', name: '选项 C', category: 'sprite', type: 'button', visible: true, transform: { x: 250, y: 390, width: 300, height: 50, depth: 10 }, style: { fillColor: '#374151', borderRadius: 12 }, textContent: { text: 'C. 约 600 万公里', fontSize: 18, color: '#e2e8f0' } },
    { id: 'opt_d', name: '选项 D', category: 'sprite', type: 'button', visible: true, transform: { x: 550, y: 390, width: 300, height: 50, depth: 10 }, style: { fillColor: '#374151', borderRadius: 12 }, textContent: { text: 'D. 约 10 亿公里', fontSize: 18, color: '#e2e8f0' } },
    { id: 'score_display', name: '得分', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 530, depth: 50, anchorX: 0.5 }, textContent: { text: '🏆 得分: 0', fontSize: 20, color: '#fbbf24', bold: true } },
    { id: 'progress', name: '进度', category: 'sprite', type: 'text', visible: true, transform: { x: 700, y: 30, depth: 50 }, textContent: { text: '第 1/3 题', fontSize: 16, color: '#94a3b8' } },
    { id: 'var_score', name: 'score', category: 'data', type: 'variable', visible: true, dataValue: 0 }
  ],
  scripts: [
    {
      id: 's_main',
      name: 'main.js',
      content: `// 答题游戏主逻辑
const questions = [
  {
    text: '地球距离太阳有多远？',
    options: ['A. 约 1.5 亿公里', 'B. 约 3.8 万公里', 'C. 约 600 万公里', 'D. 约 10 亿公里'],
    answer: 0
  },
  {
    text: '下列哪个行星被称为“红色星球”？',
    options: ['A. 金星', 'B. 木星', 'C. 水星', 'D. 火星'],
    answer: 3
  },
  {
    text: '太阳系中最大的行星是？',
    options: ['A. 地球', 'B. 木星', 'C. 土星', 'D. 天王星'],
    answer: 1
  }
];

let currentIndex = 0;
let score = 0;

const qText = elements['q_text'];
const progressText = elements['progress'];
const scoreDisplay = elements['score_display'];

const btnA = elements['opt_a'];
const btnB = elements['opt_b'];
const btnC = elements['opt_c'];
const btnD = elements['opt_d'];
const buttons = [btnA, btnB, btnC, btnD];

function updateUI() {
  if (currentIndex >= questions.length) {
    qText.text = "🎉 答题结束！最终得分: " + score;
    buttons.forEach(btn => btn.visible = false);
    return;
  }
  
  const q = questions[currentIndex];
  qText.text = q.text;
  progressText.text = '第 ' + (currentIndex + 1) + '/' + questions.length + ' 题';
  
  buttons.forEach((btn, idx) => {
    // textContent is a child of the container in pixiRender for button
    const textChild = btn.children.find(c => c.text);
    if(textChild) textChild.text = q.options[idx];
  });
}

// 绑定按钮点击事件
buttons.forEach((btn, idx) => {
  btn.eventMode = 'static';
  btn.cursor = 'pointer';
  btn.on('pointerdown', () => {
    if (currentIndex >= questions.length) return;
    
    // 判断答案
    if (idx === questions[currentIndex].answer) {
      score += 10;
      setVariable('score', score);
      scoreDisplay.text = '🏆 得分: ' + score;
    }
    
    // 下一题
    currentIndex++;
    updateUI();
  });
});

// 初始化第一题
updateUI();
`
    }
  ]
};
