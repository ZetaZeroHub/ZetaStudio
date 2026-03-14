export default {
  name: '3D 太阳系模型',
  description: '带有多行星公转与自转的3D宇宙场景。',
  templateType: 'solar3d',
  dimension: '3D',
  icon: '🪐',
  elements: [
    { id: 'cam_1', name: '主摄像机', category: 'scene', type: 'perspectiveCamera', visible: true, transform: { x: 0, y: 20, z: 30, targetX: 0, targetY: 0, targetZ: 0 }, style: { fov: 60, near: 0.1, far: 1000 } },
    { id: 'light_1', name: '太阳光 (点光源)', category: 'scene', type: 'pointLight', visible: true, transform: { x: 0, y: 0, z: 0 }, style: { color: '#ffffff', intensity: 2, distance: 100 } },
    { id: 'light_2', name: '全局环境光', category: 'scene', type: 'ambientLight', visible: true, style: { color: '#404040', intensity: 0.2 } },
    { id: 'sun', name: '太阳', category: 'mesh', type: 'sphere', visible: true, transform: { x: 0, y: 0, z: 0, radius: 3 }, style: { color: '#ffcc00', material: 'basic' } },
    { id: 'earth', name: '地球', category: 'mesh', type: 'sphere', visible: true, transform: { x: 10, y: 0, z: 0, radius: 1 }, style: { color: '#2266ff', material: 'standard' } },
    { id: 'moon', name: '月球', category: 'mesh', type: 'sphere', visible: true, transform: { x: 12, y: 0, z: 0, radius: 0.3 }, style: { color: '#cccccc', material: 'standard' } }
  ],
  scripts: [
    {
      id: 's_main',
      name: 'main.js',
      content: `// 行星公转与自转逻辑
const sun = elements['sun'];
const earth = elements['earth'];
const moon = elements['moon'];

let time = 0;

app.ticker.add(() => {
  time += 0.01;
  
  if (sun) sun.rotation.y += 0.005;
  
  if (earth) {
    earth.position.x = Math.cos(time) * 10;
    earth.position.z = Math.sin(time) * 10;
    earth.rotation.y += 0.02;
    
    if (moon) {
      moon.position.x = earth.position.x + Math.cos(time * 5) * 2;
      moon.position.z = earth.position.z + Math.sin(time * 5) * 2;
      moon.rotation.y += 0.05;
    }
  }
});`
    }
  ]
};
