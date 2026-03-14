export default {
  name: '3D 基础魔方',
  description: '简单的3D交互物理块，包含基础的光照和摄像机控制。',
  templateType: 'cube3d',
  dimension: '3D',
  icon: '📦',
  elements: [
    { id: 'cam_1', name: '摄像机', category: 'scene', type: 'perspectiveCamera', visible: true, transform: { x: 0, y: 5, z: 10, targetX: 0, targetY: 0, targetZ: 0 }, style: { fov: 75, near: 0.1, far: 1000 } },
    { id: 'light_1', name: '环境光', category: 'scene', type: 'ambientLight', visible: true, style: { color: '#ffffff', intensity: 0.5 } },
    { id: 'light_2', name: '平行光', category: 'scene', type: 'directionalLight', visible: true, transform: { x: 5, y: 10, z: 5 }, style: { color: '#ffffff', intensity: 1, castShadow: true } },
    { id: 'cube_1', name: '玩家方块', category: 'mesh', type: 'box', visible: true, transform: { x: 0, y: 0, z: 0, width: 1, height: 1, depth: 1 }, style: { color: '#00ff00', material: 'standard' } }
  ],
  scripts: [
    {
      id: 's_main',
      name: 'main.js',
      content: `// 3D 旋转控制逻辑
const cube = elements['cube_1'];

app.ticker.add(() => {
  if (cube) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }
});`
    }
  ]
};
