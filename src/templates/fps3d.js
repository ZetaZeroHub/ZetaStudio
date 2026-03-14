export default {
  name: '3D 第一人称射击',
  description: '第一人称视角射击游戏，WASD移动 + 鼠标瞄准射击，消灭敌人获取分数。',
  templateType: 'fps3d',
  dimension: '3D',
  icon: '🔫',
  elements: [
    { id: 'cam_fps', name: 'FPS 摄像机', category: 'scene', type: 'perspectiveCamera', visible: true, transform: { x: 0, y: 1.6, z: 5, targetX: 0, targetY: 1.6, targetZ: 0 }, style: { fov: 75, near: 0.1, far: 200 } },
    { id: 'light_amb', name: '环境光', category: 'scene', type: 'ambientLight', visible: true, style: { color: '#b0c4de', intensity: 0.6 } },
    { id: 'light_dir', name: '主方向光', category: 'scene', type: 'directionalLight', visible: true, transform: { x: 10, y: 20, z: 10 }, style: { color: '#ffffff', intensity: 1.2, castShadow: true } },
    { id: 'ground', name: '地面', category: 'mesh', type: 'plane', visible: true, transform: { x: 0, y: 0, z: 0, width: 80, height: 80, rotationX: -1.5708 }, style: { color: '#3a3a3a', material: 'standard' } },
    { id: 'wall_n', name: '北墙', category: 'mesh', type: 'box', visible: true, transform: { x: 0, y: 2, z: -40, width: 80, height: 4, depth: 0.5 }, style: { color: '#555555', material: 'standard' } },
    { id: 'wall_s', name: '南墙', category: 'mesh', type: 'box', visible: true, transform: { x: 0, y: 2, z: 40, width: 80, height: 4, depth: 0.5 }, style: { color: '#555555', material: 'standard' } },
    { id: 'wall_e', name: '东墙', category: 'mesh', type: 'box', visible: true, transform: { x: 40, y: 2, z: 0, width: 0.5, height: 4, depth: 80 }, style: { color: '#555555', material: 'standard' } },
    { id: 'wall_w', name: '西墙', category: 'mesh', type: 'box', visible: true, transform: { x: -40, y: 2, z: 0, width: 0.5, height: 4, depth: 80 }, style: { color: '#555555', material: 'standard' } },
    { id: 'obstacle_1', name: '掩体A', category: 'mesh', type: 'box', visible: true, transform: { x: -8, y: 1.5, z: -10, width: 3, height: 3, depth: 3 }, style: { color: '#6b4e3d', material: 'standard' } },
    { id: 'obstacle_2', name: '掩体B', category: 'mesh', type: 'box', visible: true, transform: { x: 10, y: 1, z: -20, width: 4, height: 2, depth: 2 }, style: { color: '#6b4e3d', material: 'standard' } },
    { id: 'obstacle_3', name: '掩体C', category: 'mesh', type: 'box', visible: true, transform: { x: 5, y: 1.5, z: 8, width: 2, height: 3, depth: 5 }, style: { color: '#6b4e3d', material: 'standard' } },
    { id: 'enemy_1', name: '敌人1', category: 'mesh', type: 'box', visible: true, transform: { x: -10, y: 1, z: -15, width: 1, height: 2, depth: 1 }, style: { color: '#cc3333', material: 'standard' } },
    { id: 'enemy_2', name: '敌人2', category: 'mesh', type: 'box', visible: true, transform: { x: 15, y: 1, z: -25, width: 1, height: 2, depth: 1 }, style: { color: '#cc3333', material: 'standard' } },
    { id: 'enemy_3', name: '敌人3', category: 'mesh', type: 'box', visible: true, transform: { x: -5, y: 1, z: 20, width: 1, height: 2, depth: 1 }, style: { color: '#cc3333', material: 'standard' } },
    { id: 'enemy_4', name: '敌人4', category: 'mesh', type: 'box', visible: true, transform: { x: 20, y: 1, z: 10, width: 1, height: 2, depth: 1 }, style: { color: '#cc3333', material: 'standard' } },
  ],
  scripts: [
    {
      id: 's_fps_main',
      name: 'main.js',
      content: `// ===== FPS 第一人称射击游戏 =====
// 操作: 点击画面锁定鼠标 → WASD移动, 鼠标瞄准, 左键射击, ESC解锁

const camera = elements['cam_fps'];
const enemies = [elements['enemy_1'], elements['enemy_2'], elements['enemy_3'], elements['enemy_4']];
const ground = elements['ground'];

let score = 0;
let yaw = 0;
let pitch = 0;
const speed = 0.15;
const keys = {};
let locked = false;

// --- Score HUD ---
const hud = document.createElement('div');
hud.style.cssText = 'position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#fff;font:bold 20px monospace;z-index:999;pointer-events:none;text-shadow:0 0 6px rgba(0,0,0,0.8)';
hud.textContent = 'SCORE: 0';
document.getElementById('game-canvas-three')?.appendChild(hud);

// --- Crosshair ---
const cross = document.createElement('div');
cross.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:24px;height:24px;z-index:999;pointer-events:none';
cross.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><line x1="12" y1="4" x2="12" y2="10" stroke="#0f0" stroke-width="2"/><line x1="12" y1="14" x2="12" y2="20" stroke="#0f0" stroke-width="2"/><line x1="4" y1="12" x2="10" y2="12" stroke="#0f0" stroke-width="2"/><line x1="14" y1="12" x2="20" y2="12" stroke="#0f0" stroke-width="2"/></svg>';
document.getElementById('game-canvas-three')?.appendChild(cross);

// --- Hit flash ---
const flash = document.createElement('div');
flash.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,50,50,0.15);z-index:998;pointer-events:none;opacity:0;transition:opacity 0.1s';
document.getElementById('game-canvas-three')?.appendChild(flash);

// --- Pointer Lock ---
const canvas = document.getElementById('game-canvas-three');
canvas?.addEventListener('click', () => {
  if (!locked) canvas.requestPointerLock?.();
});
document.addEventListener('pointerlockchange', () => {
  locked = !!document.pointerLockElement;
});
document.addEventListener('mousemove', (e) => {
  if (!locked) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch));
});

// --- Keyboard ---
document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// --- Shooting ---
const raycaster = new THREE.Raycaster();
const shootDir = new THREE.Vector2(0, 0);

function respawnEnemy(enemy) {
  enemy.position.set(
    (Math.random() - 0.5) * 60,
    1,
    (Math.random() - 0.5) * 60
  );
  enemy.visible = true;
}

canvas?.addEventListener('click', () => {
  if (!locked) return;
  raycaster.setFromCamera(shootDir, camera);
  const hits = raycaster.intersectObjects(enemies.filter(e => e && e.visible));
  if (hits.length > 0) {
    const hit = hits[0].object;
    score += 100;
    hud.textContent = 'SCORE: ' + score;
    setVariable('score', score);
    
    // Flash effect
    flash.style.opacity = '0';
    hit.visible = false;
    flash.style.background = 'rgba(50,255,50,0.15)';
    flash.style.opacity = '1';
    setTimeout(() => { flash.style.opacity = '0'; }, 120);
    
    // Respawn after delay
    setTimeout(() => respawnEnemy(hit), 1500);
  } else {
    // Miss flash
    flash.style.background = 'rgba(255,255,255,0.05)';
    flash.style.opacity = '1';
    setTimeout(() => { flash.style.opacity = '0'; }, 80);
  }
});

// --- Enemy patrol ---
const enemySpeeds = enemies.map(() => ({ dx: (Math.random() - 0.5) * 0.04, dz: (Math.random() - 0.5) * 0.04 }));

// --- Game Loop ---
app.ticker.add(() => {
  if (!camera) return;
  
  // Camera rotation
  const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);
  
  // Movement
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forward.y = 0;
  forward.normalize();
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  right.y = 0;
  right.normalize();
  
  if (keys['w']) { camera.position.add(forward.clone().multiplyScalar(speed)); }
  if (keys['s']) { camera.position.add(forward.clone().multiplyScalar(-speed)); }
  if (keys['a']) { camera.position.add(right.clone().multiplyScalar(-speed)); }
  if (keys['d']) { camera.position.add(right.clone().multiplyScalar(speed)); }
  
  // Clamp to arena bounds
  camera.position.x = Math.max(-38, Math.min(38, camera.position.x));
  camera.position.z = Math.max(-38, Math.min(38, camera.position.z));
  camera.position.y = 1.6;
  
  // Enemy patrol AI
  enemies.forEach((enemy, i) => {
    if (!enemy || !enemy.visible) return;
    const sp = enemySpeeds[i];
    enemy.position.x += sp.dx;
    enemy.position.z += sp.dz;
    // Bounce off walls
    if (enemy.position.x < -38 || enemy.position.x > 38) sp.dx *= -1;
    if (enemy.position.z < -38 || enemy.position.z > 38) sp.dz *= -1;
    // Face camera
    enemy.lookAt(camera.position.x, enemy.position.y, camera.position.z);
  });
});`
    }
  ]
};
