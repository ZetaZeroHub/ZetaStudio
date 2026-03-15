/* ========================================
   策略类 (Strategy) — 2 个新模板
   坦克大战 / 愤怒的小鸟
   ======================================== */

// 31. 坦克大战 — FC 经典
export const tankBattle = {
  name: '坦克大战',
  description: '保卫基地，消灭全部敌军坦克!',
  templateType: 'tankBattle',
  dimension: '2D',
  category: 'strategy',
  icon: '🪖',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#111', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 5, anchorX: 0.5 }, textContent: { text: '🪖 坦克大战', fontSize: 18, color: '#FFD54F', bold: true, align: 'center' } },
    { id: 'score', name: '信息', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 580, anchorX: 0.5 }, textContent: { text: '❤️3 | 🪖0 | 波:1/3', fontSize: 13, color: '#FFD54F', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 坦克大战 — FC 经典风格
const scoreText = elements['score'];
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);

const COLS = 26, ROWS = 20, C = 24;
const OX = (800 - COLS*C) / 2, OY = 24;
// 0=空 1=砖 2=钢 3=水 9=鹰
const mapData = [
  '00000000000000000000000000',
  '00110011001100110011001100',
  '00110011001100110011001100',
  '00110011001100110011001100',
  '00110011002200110011001100',
  '00110011000000110011001100',
  '00000000001111000000000000',
  '22000011001111001100002200',
  '00000011000000001100000000',
  '00000000000000000000000000',
  '00000011000000001100000000',
  '00110011001100110011001100',
  '00110011001100110011001100',
  '00110000001100000011001100',
  '00000011001100110000000000',
  '00110011000000001100110000',
  '00110000000000000000110000',
  '00000000001111000000000000',
  '00000000001991000000000000',
  '00000000001111000000000000',
];
let map = mapData.map(r => r.split('').map(Number));

let lives = 3, score = 0, wave = 0, gameOver = false;
let player = { x: 5, y: 18, dir: 0, cooldown: 0, shield: 60 };
const enemies = [], pBullets = [], eBullets = [], explosions = [];
let spawnTimer = 0, spawnCount = 0, totalEnemies = 0;
const dx = [0,1,0,-1], dy = [-1,0,1,0];

const waves = [
  { count: 4, speed: 0.03, shootRate: 120, hp: 1, color: 0xCCCCCC },
  { count: 6, speed: 0.04, shootRate: 80,  hp: 1, color: 0xFF9800 },
  { count: 5, speed: 0.025, shootRate: 100, hp: 2, color: 0xF44336 },
];

function startWave() { spawnCount = 0; totalEnemies = waves[wave].count; spawnTimer = 0; }
startWave();

function spawnEnemy() {
  const w = waves[wave];
  const sp = [[1,0],[12,0],[24,0]][spawnCount % 3];
  enemies.push({
    x: sp[0], y: sp[1], dir: 2, speed: w.speed, hp: w.hp,
    color: w.color, cooldown: 60+Math.random()*60,
    shootRate: w.shootRate, turnTimer: 30+Math.random()*60
  });
}

function canMove(x, y) {
  if (x < 0 || x >= COLS-1 || y < 0 || y >= ROWS-1) return false;
  const cx = Math.floor(x), cy = Math.floor(y);
  for (let r = cy; r <= Math.min(cy+1, ROWS-1); r++)
    for (let c = cx; c <= Math.min(cx+1, COLS-1); c++)
      if (map[r] && (map[r][c]===1||map[r][c]===2||map[r][c]===3||map[r][c]===9)) return false;
  return true;
}

function fireBullet(x, y, dir, isPlayer) {
  const arr = isPlayer ? pBullets : eBullets;
  arr.push({ x: x+0.5+dx[dir]*0.6, y: y+0.5+dy[dir]*0.6, dir, speed: 0.15 });
}

const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.code] = false; });

const touchState = { dir: -1, shoot: false };
const btns = [
  {label:'▲',x:70,y:490,w:40,h:34,dir:0},{label:'▶',x:110,y:520,w:40,h:34,dir:1},
  {label:'▼',x:70,y:550,w:40,h:34,dir:2},{label:'◀',x:30,y:520,w:40,h:34,dir:3},
  {label:'🔥',x:700,y:520,w:60,h:40,dir:-1,isShoot:true},
];
app.stage.eventMode = 'static';
app.stage.on('pointerdown', e => {
  const px = e.data.global.x, py = e.data.global.y;
  btns.forEach(b => {
    if (px>b.x&&px<b.x+b.w&&py>b.y&&py<b.y+b.h) {
      if (b.isShoot) touchState.shoot = true; else touchState.dir = b.dir;
    }
  });
});
app.stage.on('pointerup', () => { touchState.dir = -1; touchState.shoot = false; });
app.stage.on('pointermove', e => {
  if (touchState.dir===-1&&!touchState.shoot) return;
  const px = e.data.global.x, py = e.data.global.y;
  let found = false;
  btns.forEach(b => {
    if (!b.isShoot&&px>b.x&&px<b.x+b.w&&py>b.y&&py<b.y+b.h) { touchState.dir=b.dir; found=true; }
  });
  if (!found&&!touchState.shoot) touchState.dir = -1;
});

function addExplosion(x, y, big) { explosions.push({x,y,timer:big?15:8,big}); }

function hitBullet(bx, by) {
  const cx = Math.floor(bx), cy = Math.floor(by);
  if (cx<0||cx>=COLS||cy<0||cy>=ROWS) return true;
  if (map[cy]&&map[cy][cx]===1) { map[cy][cx]=0; addExplosion(cx+0.5,cy+0.5,false); return true; }
  if (map[cy]&&map[cy][cx]===2) return true;
  if (map[cy]&&map[cy][cx]===9) {
    gameOver=true; elements['title'].text='💔 基地被摧毁! 击杀: '+score;
    addExplosion(cx+0.5,cy+0.5,true); return true;
  }
  return false;
}

app.ticker.add((ticker) => {
  const dt = ticker.deltaTime;
  if (gameOver) { drawAll(); return; }

  if (spawnCount<totalEnemies) { spawnTimer-=dt; if(spawnTimer<=0){spawnEnemy();spawnCount++;spawnTimer=90;} }

  player.cooldown = Math.max(0, player.cooldown-dt);
  if (player.shield>0) player.shield-=dt;
  let pDir = -1;
  if (keys['ArrowUp']||keys['KeyW']) pDir=0;
  else if (keys['ArrowRight']||keys['KeyD']) pDir=1;
  else if (keys['ArrowDown']||keys['KeyS']) pDir=2;
  else if (keys['ArrowLeft']||keys['KeyA']) pDir=3;
  if (touchState.dir!==-1) pDir=touchState.dir;
  if (pDir!==-1) {
    player.dir=pDir;
    const nx=player.x+dx[pDir]*0.06*dt, ny=player.y+dy[pDir]*0.06*dt;
    if (canMove(nx,ny)) { player.x=nx; player.y=ny; }
  }
  player.x=Math.max(0,Math.min(COLS-2,player.x));
  player.y=Math.max(0,Math.min(ROWS-2,player.y));

  if ((keys['Space']||keys['KeyJ']||touchState.shoot)&&player.cooldown<=0) {
    fireBullet(player.x,player.y,player.dir,true); player.cooldown=15;
  }

  enemies.forEach(en => {
    en.cooldown-=dt; en.turnTimer-=dt;
    if (en.turnTimer<=0) {
      en.turnTimer=60+Math.random()*80;
      if (Math.random()<0.4) {
        const ddx=player.x-en.x, ddy=player.y-en.y;
        if (Math.abs(ddx)>Math.abs(ddy)) en.dir=ddx>0?1:3; else en.dir=ddy>0?2:0;
      } else en.dir=Math.floor(Math.random()*4);
    }
    const nx=en.x+dx[en.dir]*en.speed*dt, ny=en.y+dy[en.dir]*en.speed*dt;
    let blocked=!canMove(nx,ny);
    if (!blocked) enemies.forEach(o=>{if(o!==en&&Math.abs(nx-o.x)<1.5&&Math.abs(ny-o.y)<1.5)blocked=true;});
    if (!blocked) { en.x=nx; en.y=ny; } else en.turnTimer=0;
    en.x=Math.max(0,Math.min(COLS-2,en.x)); en.y=Math.max(0,Math.min(ROWS-2,en.y));
    if (en.cooldown<=0) { fireBullet(en.x,en.y,en.dir,false); en.cooldown=en.shootRate+Math.random()*40; }
  });

  function updateBullets(arr, isP) {
    for (let i=arr.length-1;i>=0;i--) {
      const b=arr[i];
      b.x+=dx[b.dir]*b.speed*dt; b.y+=dy[b.dir]*b.speed*dt;
      if (b.x<0||b.x>=COLS||b.y<0||b.y>=ROWS) { arr.splice(i,1); continue; }
      if (hitBullet(b.x,b.y)) { arr.splice(i,1); continue; }
      if (isP) {
        for (let j=enemies.length-1;j>=0;j--) {
          const en=enemies[j];
          if (Math.abs(b.x-en.x-0.5)<1&&Math.abs(b.y-en.y-0.5)<1) {
            en.hp--; if(en.hp<=0){addExplosion(en.x+0.5,en.y+0.5,true);enemies.splice(j,1);score++;}
            arr.splice(i,1); break;
          }
        }
      } else {
        if (Math.abs(b.x-player.x-0.5)<1&&Math.abs(b.y-player.y-0.5)<1) {
          if (player.shield<=0) {
            lives--; addExplosion(player.x+0.5,player.y+0.5,true);
            if(lives<=0){gameOver=true;elements['title'].text='💔 阵亡! 击杀: '+score;}
            else{player.x=5;player.y=18;player.shield=60;}
          }
          arr.splice(i,1);
        }
      }
    }
  }
  updateBullets(pBullets,true); updateBullets(eBullets,false);

  for(let i=explosions.length-1;i>=0;i--){explosions[i].timer-=dt;if(explosions[i].timer<=0)explosions.splice(i,1);}

  for(let i=pBullets.length-1;i>=0;i--) for(let j=eBullets.length-1;j>=0;j--)
    if(pBullets[i]&&eBullets[j]&&Math.abs(pBullets[i].x-eBullets[j].x)<0.5&&Math.abs(pBullets[i].y-eBullets[j].y)<0.5)
      {pBullets.splice(i,1);eBullets.splice(j,1);break;}

  if (spawnCount>=totalEnemies&&enemies.length===0) {
    wave++;
    if(wave>=3){gameOver=true;elements['title'].text='🏆 胜利! 击杀: '+score+' 坦克!';}
    else{map=mapData.map(r=>r.split('').map(Number));player.x=5;player.y=18;player.shield=60;
      pBullets.length=0;eBullets.length=0;elements['title'].text='⚔️ 第'+(wave+1)+'波!';startWave();}
  }
  scoreText.text='❤️'+lives+' | 🪖'+score+' | 波:'+(wave+1)+'/3 | 敌:'+enemies.length;
  drawAll();
});

function drawAll() {
  gfx.clear();
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
    const x=OX+c*C,y=OY+r*C,v=map[r][c];
    if(v===0)continue;
    if(v===1){gfx.beginFill(0xCC6633);gfx.drawRect(x,y,C,C);gfx.endFill();
      gfx.lineStyle(1,0xAA5522,0.5);gfx.drawRect(x,y,C/2,C/2);gfx.drawRect(x+C/2,y+C/2,C/2,C/2);gfx.lineStyle(0);}
    else if(v===2){gfx.beginFill(0xAAAAAA);gfx.drawRect(x,y,C,C);gfx.endFill();
      gfx.beginFill(0xCCCCCC,0.3);gfx.drawRect(x+2,y+2,C-4,4);gfx.endFill();}
    else if(v===3){gfx.beginFill(0x2196F3,0.6);gfx.drawRect(x,y,C,C);gfx.endFill();}
    else if(v===9){gfx.beginFill(0xFFD54F);gfx.drawRect(x,y,C,C);gfx.endFill();
      gfx.beginFill(0xFF6F00);gfx.drawRect(x+4,y+4,C-8,C-8);gfx.endFill();}
  }

  function drawTank(tx,ty,dir,color) {
    const sx=OX+tx*C+C/2, sy=OY+ty*C+C/2;
    gfx.beginFill(color);gfx.drawRect(sx-10,sy-10,20,20);gfx.endFill();
    gfx.beginFill(0x444);
    if(dir===0||dir===2){gfx.drawRect(sx-12,sy-10,4,20);gfx.drawRect(sx+8,sy-10,4,20);}
    else{gfx.drawRect(sx-10,sy-12,20,4);gfx.drawRect(sx-10,sy+8,20,4);}
    gfx.endFill();
    gfx.beginFill(0x888);
    if(dir===0)gfx.drawRect(sx-2,sy-16,4,10);
    else if(dir===1)gfx.drawRect(sx+6,sy-2,10,4);
    else if(dir===2)gfx.drawRect(sx-2,sy+6,4,10);
    else gfx.drawRect(sx-16,sy-2,10,4);
    gfx.endFill();
  }

  const pBlink=player.shield>0&&Math.floor(player.shield)%4<2;
  if(!pBlink) drawTank(player.x,player.y,player.dir,0x4CAF50);
  if(player.shield>0){const sx=OX+player.x*C+C/2,sy=OY+player.y*C+C/2;
    gfx.lineStyle(1,0xFFFFFF,0.4);gfx.drawCircle(sx,sy,16);gfx.lineStyle(0);}
  enemies.forEach(en=>drawTank(en.x,en.y,en.dir,en.color));

  pBullets.forEach(b=>{gfx.beginFill(0xFFFFFF);gfx.drawRect(OX+b.x*C-2,OY+b.y*C-2,4,4);gfx.endFill();});
  eBullets.forEach(b=>{gfx.beginFill(0xFF5252);gfx.drawRect(OX+b.x*C-2,OY+b.y*C-2,4,4);gfx.endFill();});

  explosions.forEach(ex=>{const sx=OX+ex.x*C,sy=OY+ex.y*C,r=ex.big?18:10,a=ex.timer/(ex.big?15:8);
    gfx.beginFill(0xFF9800,a*0.8);gfx.drawCircle(sx,sy,r*a);gfx.endFill();
    gfx.beginFill(0xFFEB3B,a*0.5);gfx.drawCircle(sx,sy,r*a*0.5);gfx.endFill();});

  gfx.beginFill(0x333,0.6);gfx.drawRoundedRect(20,478,140,115,10);gfx.endFill();
  gfx.beginFill(0x333,0.6);gfx.drawRoundedRect(690,510,80,55,10);gfx.endFill();
  btns.forEach(b=>{gfx.beginFill(b.isShoot?0xF44336:0x555,0.7);gfx.drawRoundedRect(b.x,b.y,b.w,b.h,4);gfx.endFill();});
}

btns.forEach(b=>{
  const t=new PIXI.Text(b.label,{fontSize:b.isShoot?18:14,fill:'#fff'});
  t.anchor.set(0.5);t.x=b.x+b.w/2;t.y=b.y+b.h/2;app.stage.addChild(t);
});
` }],
};

// 32. 愤怒的小鸟
export const angryBirds = {
  name: '愤怒的小鸟',
  description: '弹弓发射小鸟，打倒所有小猪!',
  templateType: 'angryBirds',
  dimension: '2D',
  category: 'strategy',
  icon: '🐦',
  elements: [
    { id: 'bg', name: '背景', category: 'scene', type: 'background', visible: true, transform: { x: 0, y: 0, width: 800, height: 600 }, style: { fillColor: '#87CEEB', alpha: 1 } },
    { id: 'title', name: '标题', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 8, anchorX: 0.5 }, textContent: { text: '🐦 愤怒的小鸟 — 拖拽弹弓发射!', fontSize: 20, color: '#1A237E', bold: true, align: 'center' } },
    { id: 'score', name: '信息', category: 'sprite', type: 'text', visible: true, transform: { x: 400, y: 575, anchorX: 0.5 }, textContent: { text: '🐦 x3 | 第 1 关', fontSize: 16, color: '#333', bold: true } },
  ],
  scripts: [{ id: 's1', name: 'main.js', content: `// 愤怒的小鸟
const scoreText = elements['score'];
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);

const GRAVITY = 0.25, GROUND = 480, SLING_X = 140, SLING_Y = 380;
let level = 0, birdsLeft = 3, levelComplete = false, levelFailed = false;
let dragging = false, dragX = SLING_X, dragY = SLING_Y;
let bird = null, blocks = [], pigs = [];
let particles = [];
let showNextBtn = false;

const levels = [
  { birds: 3,
    blocks: [{x:550,y:GROUND-20,w:20,h:40,type:'wood'},{x:600,y:GROUND-20,w:20,h:40,type:'wood'},{x:575,y:GROUND-50,w:70,h:10,type:'wood'}],
    pigs: [{x:575,y:GROUND-65,r:12}] },
  { birds: 3,
    blocks: [{x:520,y:GROUND-20,w:20,h:40,type:'wood'},{x:600,y:GROUND-20,w:20,h:40,type:'wood'},{x:560,y:GROUND-50,w:100,h:10,type:'wood'},{x:560,y:GROUND-70,w:20,h:30,type:'stone'}],
    pigs: [{x:540,y:GROUND-65,r:12},{x:580,y:GROUND-65,r:12}] },
  { birds: 3,
    blocks: [{x:480,y:GROUND-20,w:20,h:40,type:'wood'},{x:560,y:GROUND-20,w:20,h:40,type:'stone'},{x:640,y:GROUND-20,w:20,h:40,type:'wood'},
      {x:520,y:GROUND-50,w:60,h:10,type:'wood'},{x:600,y:GROUND-50,w:60,h:10,type:'wood'},{x:560,y:GROUND-65,w:20,h:20,type:'stone'},
      {x:520,y:GROUND-75,w:100,h:10,type:'wood'},{x:560,y:GROUND-90,w:20,h:20,type:'stone'}],
    pigs: [{x:520,y:GROUND-65,r:10},{x:600,y:GROUND-65,r:10},{x:560,y:GROUND-100,r:12}] },
];

function loadLevel() {
  const L = levels[level];
  birdsLeft = L.birds;
  blocks = L.blocks.map(b => ({...b, hp: b.type==='stone'?3:1, vx:0, vy:0, settled:true}));
  pigs = L.pigs.map(p => ({...p, hp:1, vx:0, vy:0}));
  bird = null; dragging = false; dragX = SLING_X; dragY = SLING_Y;
  levelComplete = false; levelFailed = false; showNextBtn = false; particles = [];
  elements['title'].text = '🐦 第 ' + (level+1) + ' 关 — 拖拽弹弓发射!';
}
loadLevel();

app.stage.eventMode = 'static';
app.stage.on('pointerdown', (e) => {
  const px = e.data.global.x, py = e.data.global.y;
  if (levelComplete && showNextBtn && px>330&&px<470&&py>440&&py<480) { level++; loadLevel(); return; }
  if (levelFailed && px>330&&px<470&&py>440&&py<480) { loadLevel(); return; }
  if (bird || birdsLeft<=0 || levelComplete || levelFailed) return;
  if (Math.sqrt((px-SLING_X)**2+(py-SLING_Y)**2) < 60) { dragging = true; dragX = px; dragY = py; }
});
app.stage.on('pointermove', (e) => {
  if (!dragging) return;
  const px=e.data.global.x, py=e.data.global.y;
  const ddx=px-SLING_X, ddy=py-SLING_Y, dist=Math.sqrt(ddx*ddx+ddy*ddy);
  if (dist>80) { dragX=SLING_X+(ddx/dist)*80; dragY=SLING_Y+(ddy/dist)*80; }
  else { dragX=px; dragY=py; }
});
app.stage.on('pointerup', () => {
  if (!dragging) return; dragging = false;
  const ddx=SLING_X-dragX, ddy=SLING_Y-dragY;
  if (Math.sqrt(ddx*ddx+ddy*ddy)<10) return;
  birdsLeft--;
  bird = { x:SLING_X, y:SLING_Y, vx:ddx*0.15, vy:ddy*0.15, r:12, bounces:0 };
  dragX=SLING_X; dragY=SLING_Y;
});

app.ticker.add((ticker) => {
  const dt = ticker.deltaTime;
  if (levelComplete || levelFailed) { drawAll(); return; }
  if (bird) {
    bird.vy += GRAVITY*dt; bird.x += bird.vx*dt; bird.y += bird.vy*dt;
    if (bird.y > GROUND-bird.r) { bird.y=GROUND-bird.r; bird.vy*=-0.3; bird.vx*=0.7; bird.bounces++; }
    if (bird.x>850||bird.bounces>3||(bird.bounces>0&&Math.abs(bird.vx)<0.3)) { bird=null; checkWinLose(); }
    if (bird) {
      blocks.forEach(b => {
        if (b.hp<=0) return;
        const cx=Math.max(b.x-b.w/2,Math.min(bird.x,b.x+b.w/2));
        const cy=Math.max(b.y-b.h/2,Math.min(bird.y,b.y+b.h/2));
        if (Math.sqrt((bird.x-cx)**2+(bird.y-cy)**2)<bird.r) {
          b.hp -= Math.sqrt(bird.vx**2+bird.vy**2)>3?2:1;
          bird.vx*=-0.5; bird.vy*=-0.3;
          if (b.hp<=0) { spawnP(b.x,b.y,b.type==='stone'?0x9E9E9E:0x8D6E63,6);
            blocks.forEach(ob=>{if(ob.hp>0&&ob!==b&&Math.abs(ob.x-b.x)<b.w&&ob.y<b.y){ob.settled=false;ob.vy=0;}});
          }
        }
      });
      pigs.forEach(p => {
        if (p.hp<=0) return;
        if (Math.sqrt((bird.x-p.x)**2+(bird.y-p.y)**2)<bird.r+p.r) {
          p.hp=0; spawnP(p.x,p.y,0x4CAF50,8); bird.vx*=0.7; bird.vy*=0.7;
        }
      });
    }
  }
  blocks.forEach(b => {
    if (b.hp<=0||b.settled) return;
    b.vy+=GRAVITY*0.5*dt; b.y+=b.vy*dt;
    if (b.y+b.h/2>=GROUND) { b.y=GROUND-b.h/2; b.vy=0; b.settled=true; }
    blocks.forEach(ob=>{if(ob===b||ob.hp<=0)return;
      if(Math.abs(b.x-ob.x)<(b.w+ob.w)/2&&b.y+b.h/2>ob.y-ob.h/2&&b.y<ob.y){b.y=ob.y-ob.h/2-b.h/2;b.vy=0;b.settled=true;}});
  });
  blocks.forEach(b=>{if(b.hp<=0)return;pigs.forEach(p=>{if(p.hp<=0)return;
    if(Math.abs(b.x-p.x)<(b.w/2+p.r)&&Math.abs(b.y-p.y)<(b.h/2+p.r)&&(!b.settled||b.vy>1)){p.hp=0;spawnP(p.x,p.y,0x4CAF50,5);}});});
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=0.1*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
  drawAll();
});

function spawnP(x,y,color,n) {
  for(let i=0;i<n;i++) particles.push({x,y,vx:(Math.random()-0.5)*4,vy:(Math.random()-1)*3,color,life:20+Math.random()*15,size:2+Math.random()*3});
}
function checkWinLose() {
  setTimeout(()=>{
    if(pigs.every(p=>p.hp<=0)){levelComplete=true;showNextBtn=level<2;
      elements['title'].text='⭐ 第'+(level+1)+'关 通关!'+(level<2?'':' 🏆 全部通关!');}
    else if(birdsLeft<=0){levelFailed=true;elements['title'].text='😢 失败! 点击重试';}
  },500);
}

function drawAll() {
  gfx.clear();
  gfx.beginFill(0x87CEEB);gfx.drawRect(0,30,800,GROUND-30);gfx.endFill();
  [120,350,600].forEach((cx,i)=>{gfx.beginFill(0xFFFFFF,0.6);gfx.drawEllipse(cx,80+i*25,35,12);gfx.drawEllipse(cx+20,75+i*25,25,10);gfx.endFill();});
  gfx.beginFill(0x8BC34A);gfx.drawRect(0,GROUND,800,120);gfx.endFill();
  gfx.beginFill(0x689F38);gfx.drawRect(0,GROUND,800,6);gfx.endFill();

  gfx.beginFill(0x5D4037);gfx.drawRect(SLING_X-4,SLING_Y-40,8,50);gfx.drawRect(SLING_X-18,SLING_Y-45,12,8);gfx.drawRect(SLING_X+6,SLING_Y-45,12,8);gfx.endFill();
  if (dragging) {
    gfx.lineStyle(3,0x795548);gfx.moveTo(SLING_X-12,SLING_Y-42);gfx.lineTo(dragX,dragY);gfx.moveTo(SLING_X+12,SLING_Y-42);gfx.lineTo(dragX,dragY);gfx.lineStyle(0);
    gfx.beginFill(0xF44336);gfx.drawCircle(dragX,dragY,12);gfx.endFill();gfx.beginFill(0xFFFFFF);gfx.drawCircle(dragX+4,dragY-3,3);gfx.endFill();
    gfx.lineStyle(1,0xFFFFFF,0.3);
    let ax=(SLING_X-dragX)*0.15,ay=(SLING_Y-dragY)*0.15,px2=SLING_X,py2=SLING_Y;
    for(let i=0;i<15;i++){px2+=ax;py2+=ay+GRAVITY*i*0.5;gfx.drawCircle(px2,py2,1.5);}gfx.lineStyle(0);
  } else if(!bird&&birdsLeft>0) {
    gfx.lineStyle(2,0x795548);gfx.moveTo(SLING_X-12,SLING_Y-42);gfx.lineTo(SLING_X,SLING_Y-30);gfx.moveTo(SLING_X+12,SLING_Y-42);gfx.lineTo(SLING_X,SLING_Y-30);gfx.lineStyle(0);
    gfx.beginFill(0xF44336);gfx.drawCircle(SLING_X,SLING_Y-30,12);gfx.endFill();gfx.beginFill(0xFFFFFF);gfx.drawCircle(SLING_X+4,SLING_Y-33,3);gfx.endFill();
  }
  for(let i=0;i<birdsLeft-(bird?0:1);i++){gfx.beginFill(0xF44336);gfx.drawCircle(50+i*25,GROUND-10,8);gfx.endFill();}

  blocks.forEach(b=>{if(b.hp<=0)return;gfx.beginFill(b.type==='stone'?0x9E9E9E:0x8D6E63,0.9);gfx.drawRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);gfx.endFill();
    gfx.lineStyle(1,0x333,0.3);gfx.drawRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);gfx.lineStyle(0);});
  pigs.forEach(p=>{if(p.hp<=0)return;gfx.beginFill(0x4CAF50);gfx.drawCircle(p.x,p.y,p.r);gfx.endFill();
    gfx.beginFill(0x81C784);gfx.drawEllipse(p.x,p.y+2,5,3);gfx.endFill();gfx.beginFill(0x333);gfx.drawCircle(p.x-3,p.y-3,2);gfx.drawCircle(p.x+3,p.y-3,2);gfx.endFill();});
  if(bird){gfx.beginFill(0xF44336);gfx.drawCircle(bird.x,bird.y,bird.r);gfx.endFill();gfx.beginFill(0xFFFFFF);gfx.drawCircle(bird.x+4,bird.y-3,3);gfx.endFill();
    gfx.beginFill(0xFFC107);gfx.moveTo(bird.x+bird.r,bird.y);gfx.lineTo(bird.x+bird.r+6,bird.y-2);gfx.lineTo(bird.x+bird.r+6,bird.y+2);gfx.closePath();gfx.endFill();}
  particles.forEach(p=>{gfx.beginFill(p.color,p.life/25);gfx.drawRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);gfx.endFill();});

  if((levelComplete&&showNextBtn)||levelFailed){
    gfx.beginFill(0x000,0.4);gfx.drawRect(0,30,800,GROUND-30);gfx.endFill();
    gfx.beginFill(levelComplete?0x4CAF50:0xF44336);gfx.drawRoundedRect(330,440,140,40,8);gfx.endFill();}
  scoreText.text='🐦 x'+birdsLeft+' | 第'+(level+1)+'关'+(pigs.filter(p=>p.hp<=0).length>0?' | 🐷'+pigs.filter(p=>p.hp<=0).length+'/'+pigs.length:'');
}

const btnText = new PIXI.Text('',{fontSize:14,fill:'#fff',fontWeight:'bold'});
btnText.anchor.set(0.5);btnText.x=400;btnText.y=460;app.stage.addChild(btnText);
app.ticker.add(()=>{
  if(levelComplete&&showNextBtn)btnText.text='▶ 下一关';
  else if(levelFailed)btnText.text='🔄 重试';
  else if(levelComplete&&!showNextBtn)btnText.text='🏆 全部通关!';
  else btnText.text='';
});
` }],
};
