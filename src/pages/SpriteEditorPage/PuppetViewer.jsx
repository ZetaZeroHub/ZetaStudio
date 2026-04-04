import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import styles from './PuppetViewer.module.css';

/* ── 骨骼定义 ── */
const JOINT_DEFS = [
  { id: 'head',     pos: [0, 1.7, 0],   parent: null,      radius: 0.12 },
  { id: 'neck',     pos: [0, 1.5, 0],   parent: 'head',    radius: 0.06 },
  { id: 'spine',    pos: [0, 1.1, 0],   parent: 'neck',    radius: 0.08 },
  { id: 'hip',      pos: [0, 0.9, 0],   parent: 'spine',   radius: 0.08 },
  { id: 'shoulderL',pos: [-0.3, 1.45, 0], parent: 'neck',  radius: 0.06 },
  { id: 'shoulderR',pos: [0.3, 1.45, 0],  parent: 'neck',  radius: 0.06 },
  { id: 'elbowL',   pos: [-0.55, 1.2, 0], parent: 'shoulderL', radius: 0.05 },
  { id: 'elbowR',   pos: [0.55, 1.2, 0],  parent: 'shoulderR', radius: 0.05 },
  { id: 'handL',    pos: [-0.75, 0.95, 0], parent: 'elbowL',   radius: 0.05 },
  { id: 'handR',    pos: [0.75, 0.95, 0],  parent: 'elbowR',   radius: 0.05 },
  { id: 'hipL',     pos: [-0.15, 0.85, 0], parent: 'hip',      radius: 0.06 },
  { id: 'hipR',     pos: [0.15, 0.85, 0],  parent: 'hip',      radius: 0.06 },
  { id: 'kneeL',    pos: [-0.18, 0.45, 0], parent: 'hipL',     radius: 0.05 },
  { id: 'kneeR',    pos: [0.18, 0.45, 0],  parent: 'hipR',     radius: 0.05 },
  { id: 'footL',    pos: [-0.2, 0.05, 0],  parent: 'kneeL',    radius: 0.05 },
  { id: 'footR',    pos: [0.2, 0.05, 0],   parent: 'kneeR',    radius: 0.05 },
];

/* ── 预设动作关键帧 ── */
const ACTION_KEYFRAMES = {
  idle: [
    { t: 0,    joints: {} },
    { t: 0.5,  joints: { head: [0, 1.72, 0], handL: [-0.76, 0.97, 0], handR: [0.76, 0.97, 0] } },
    { t: 1,    joints: {} },
  ],
  walk: [
    { t: 0,    joints: { footL: [-0.2, 0.05, 0.15], footR: [0.2, 0.05, -0.15], handL: [-0.75, 0.95, -0.1], handR: [0.75, 0.95, 0.1], kneeL: [-0.18, 0.45, 0.08], kneeR: [0.18, 0.45, -0.08] } },
    { t: 0.25, joints: { footL: [-0.2, 0.1, 0.05], footR: [0.2, 0.05, -0.05] } },
    { t: 0.5,  joints: { footL: [-0.2, 0.05, -0.15], footR: [0.2, 0.05, 0.15], handL: [-0.75, 0.95, 0.1], handR: [0.75, 0.95, -0.1], kneeL: [-0.18, 0.45, -0.08], kneeR: [0.18, 0.45, 0.08] } },
    { t: 0.75, joints: { footR: [0.2, 0.1, 0.05], footL: [-0.2, 0.05, -0.05] } },
    { t: 1,    joints: { footL: [-0.2, 0.05, 0.15], footR: [0.2, 0.05, -0.15], handL: [-0.75, 0.95, -0.1], handR: [0.75, 0.95, 0.1] } },
  ],
  run: [
    { t: 0,    joints: { footL: [-0.2, 0.1, 0.25], footR: [0.2, 0.05, -0.25], handL: [-0.7, 1.0, -0.2], handR: [0.7, 1.0, 0.2], kneeL: [-0.18, 0.5, 0.15], kneeR: [0.18, 0.4, -0.12], spine: [0, 1.12, 0.04] } },
    { t: 0.5,  joints: { footL: [-0.2, 0.05, -0.25], footR: [0.2, 0.1, 0.25], handL: [-0.7, 1.0, 0.2], handR: [0.7, 1.0, -0.2], kneeL: [-0.18, 0.4, -0.12], kneeR: [0.18, 0.5, 0.15] } },
    { t: 1,    joints: { footL: [-0.2, 0.1, 0.25], footR: [0.2, 0.05, -0.25], handL: [-0.7, 1.0, -0.2], handR: [0.7, 1.0, 0.2] } },
  ],
  jump: [
    { t: 0,    joints: { kneeL: [-0.18, 0.35, 0], kneeR: [0.18, 0.35, 0], hip: [0, 0.8, 0], spine: [0, 1.0, 0], head: [0, 1.6, 0], neck: [0, 1.4, 0] } },
    { t: 0.3,  joints: { kneeL: [-0.18, 0.45, 0], kneeR: [0.18, 0.45, 0], hip: [0, 1.2, 0], spine: [0, 1.4, 0], head: [0, 2.05, 0], neck: [0, 1.85, 0], handL: [-0.8, 1.5, 0], handR: [0.8, 1.5, 0], footL: [-0.2, 0.35, 0], footR: [0.2, 0.35, 0] } },
    { t: 0.7,  joints: { hip: [0, 1.1, 0], spine: [0, 1.3, 0], head: [0, 1.9, 0], neck: [0, 1.7, 0], handL: [-0.75, 1.3, 0], handR: [0.75, 1.3, 0], footL: [-0.2, 0.2, 0], footR: [0.2, 0.2, 0] } },
    { t: 1,    joints: {} },
  ],
  attack: [
    { t: 0,    joints: {} },
    { t: 0.2,  joints: { handR: [0.5, 1.3, 0.3], elbowR: [0.5, 1.35, 0.1], spine: [0, 1.1, 0.02] } },
    { t: 0.4,  joints: { handR: [0.9, 1.1, -0.2], elbowR: [0.7, 1.2, -0.1], spine: [0, 1.08, -0.03] } },
    { t: 0.7,  joints: { handR: [0.8, 1.0, 0], elbowR: [0.6, 1.15, 0] } },
    { t: 1,    joints: {} },
  ],
  hit: [
    { t: 0,    joints: {} },
    { t: 0.3,  joints: { spine: [0.05, 1.08, -0.08], head: [0.03, 1.68, -0.05], handL: [-0.8, 1.0, 0.05], handR: [0.8, 1.0, 0.05] } },
    { t: 0.6,  joints: { spine: [-0.03, 1.1, -0.04] } },
    { t: 1,    joints: {} },
  ],
};

const LIMB_COLOR = 0x5b6ef0;
const JOINT_COLOR = 0x8b9aff;
const JOINT_HOVER_COLOR = 0xffcc44;
const GRID_COLOR = 0x27282e;

const PuppetViewer = forwardRef(function PuppetViewer({ onPoseCapture, onActionSelect, compact = false }, ref) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const jointsRef = useRef({});
  const limbsRef = useRef([]);
  const animRef = useRef(null);
  const dragRef = useRef({ active: false, joint: null, plane: null });
  const [currentAction, setCurrentAction] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fov, setFov] = useState(45);
  const [camDist, setCamDist] = useState(3.2);

  // ── 初始化 Three.js 场景 ──
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    console.log('[PuppetViewer] mounting, container size:', container.clientWidth, 'x', container.clientHeight);

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131418);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100);
    camera.position.set(0, 1.1, camDist);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.5;
    controls.maxDistance = 6;
    controls.update();
    controlsRef.current = controls;

    // Grid
    const gridHelper = new THREE.GridHelper(4, 20, GRID_COLOR, GRID_COLOR);
    gridHelper.material.opacity = 0.4;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 1.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x5b6ef0, 0.3);
    rimLight.position.set(-2, 1, -2);
    scene.add(rimLight);

    // ── 创建骨骼关节 ──
    const joints = {};
    const jointMat = new THREE.MeshStandardMaterial({ color: JOINT_COLOR, roughness: 0.3, metalness: 0.5 });
    const jointHoverMat = new THREE.MeshStandardMaterial({ color: JOINT_HOVER_COLOR, roughness: 0.3, metalness: 0.5, emissive: JOINT_HOVER_COLOR, emissiveIntensity: 0.3 });

    JOINT_DEFS.forEach(def => {
      const geo = new THREE.SphereGeometry(def.radius, 16, 16);
      const mesh = new THREE.Mesh(geo, jointMat.clone());
      mesh.position.set(...def.pos);
      mesh.userData = { jointId: def.id, defaultPos: [...def.pos], normalMat: mesh.material, hoverMat: jointHoverMat.clone() };
      scene.add(mesh);
      joints[def.id] = mesh;
    });
    jointsRef.current = joints;

    // ── 创建肢体连接线 ──
    const limbMat = new THREE.MeshStandardMaterial({ color: LIMB_COLOR, roughness: 0.4, metalness: 0.4 });
    const limbs = [];
    JOINT_DEFS.forEach(def => {
      if (!def.parent) return;
      const parent = joints[def.parent];
      const child = joints[def.id];
      if (!parent || !child) return;
      const limbGeo = new THREE.CylinderGeometry(0.025, 0.025, 1, 8);
      const limbMesh = new THREE.Mesh(limbGeo, limbMat);
      scene.add(limbMesh);
      limbs.push({ mesh: limbMesh, from: def.parent, to: def.id });
    });
    limbsRef.current = limbs;

    // 更新肢体位置
    const updateLimbs = () => {
      limbs.forEach(limb => {
        const a = joints[limb.from].position;
        const b = joints[limb.to].position;
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        limb.mesh.position.copy(mid);
        const dir = new THREE.Vector3().subVectors(b, a);
        const length = dir.length();
        limb.mesh.scale.set(1, length, 1);
        limb.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      });
    };
    updateLimbs();

    // ── Raycaster 拖拽 ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    let hoveredJoint = null;

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (dragRef.current.active && dragRef.current.joint) {
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
          dragRef.current.joint.position.copy(intersection);
          updateLimbs();
        }
        return;
      }

      // Hover effect
      raycaster.setFromCamera(mouse, camera);
      const jointMeshes = Object.values(joints);
      const intersects = raycaster.intersectObjects(jointMeshes);
      if (hoveredJoint && (!intersects.length || intersects[0].object !== hoveredJoint)) {
        hoveredJoint.material = hoveredJoint.userData.normalMat;
        renderer.domElement.style.cursor = 'grab';
        hoveredJoint = null;
      }
      if (intersects.length) {
        hoveredJoint = intersects[0].object;
        hoveredJoint.material = hoveredJoint.userData.hoverMat;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onPointerDown = (e) => {
      if (!hoveredJoint) return;
      controls.enabled = false;
      dragRef.current.active = true;
      dragRef.current.joint = hoveredJoint;
      // 设置拖拽平面（垂直于相机方向，过关节点）
      const cameraDir = new THREE.Vector3();
      camera.getWorldDirection(cameraDir);
      dragPlane.setFromNormalAndCoplanarPoint(cameraDir, hoveredJoint.position);
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        dragRef.current.joint = null;
        controls.enabled = true;
        renderer.domElement.style.cursor = 'grab';
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // ── 动画循环 ──
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      updateLimbs();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const onResize = () => {
      const w2 = container.clientWidth;
      const h2 = container.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // ── 重置姿态 ──
  const resetPose = useCallback(() => {
    const joints = jointsRef.current;
    JOINT_DEFS.forEach(def => {
      if (joints[def.id]) joints[def.id].position.set(...def.pos);
    });
  }, []);

  // ── 播放预设动作 ──
  const playAction = useCallback((actionKey) => {
    const keyframes = ACTION_KEYFRAMES[actionKey];
    if (!keyframes) return;
    setCurrentAction(actionKey);
    setIsAnimating(true);
    if (onActionSelect) onActionSelect(actionKey);

    const joints = jointsRef.current;
    const startTime = performance.now();
    const duration = 1200; // ms per cycle
    let loopCount = 0;
    const maxLoops = 3;

    const getDefaultPos = (jointId) => {
      const def = JOINT_DEFS.find(d => d.id === jointId);
      return def ? [...def.pos] : [0, 0, 0];
    };

    const interpolate = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const totalT = (elapsed / duration) % 1;
      const totalLoops = Math.floor(elapsed / duration);

      if (totalLoops >= maxLoops) {
        setIsAnimating(false);
        setCurrentAction(null);
        return;
      }

      // 找到当前所在的关键帧区间
      let prev = keyframes[0], next = keyframes[1];
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (totalT >= keyframes[i].t && totalT < keyframes[i + 1].t) {
          prev = keyframes[i];
          next = keyframes[i + 1];
          break;
        }
      }

      const segT = (totalT - prev.t) / (next.t - prev.t || 1);
      const eased = segT * segT * (3 - 2 * segT); // smoothstep

      // 插值关节位置
      JOINT_DEFS.forEach(def => {
        const joint = joints[def.id];
        if (!joint) return;
        const prevPos = prev.joints[def.id] || getDefaultPos(def.id);
        const nextPos = next.joints[def.id] || getDefaultPos(def.id);
        const pos = interpolate(prevPos, nextPos, eased);
        joint.position.set(...pos);
      });

      animRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [onActionSelect]);

  // ── 停止动画 ──
  const stopAction = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsAnimating(false);
    setCurrentAction(null);
    resetPose();
  }, [resetPose]);

  // ── 获取当前姿态 ──
  const getCurrentPose = useCallback(() => {
    const joints = jointsRef.current;
    const pose = {};
    Object.entries(joints).forEach(([id, mesh]) => {
      pose[id] = [mesh.position.x, mesh.position.y, mesh.position.z];
    });
    return pose;
  }, []);

  // ── 捕获姿态 ──
  const capturePose = useCallback(() => {
    const pose = getCurrentPose();
    if (onPoseCapture) onPoseCapture(pose);
  }, [getCurrentPose, onPoseCapture]);

  // ── 暴露方法给父组件 ──
  useImperativeHandle(ref, () => ({
    playAction,
    stopAction,
    resetPose,
    getCurrentPose,
    capturePose,
  }), [playAction, stopAction, resetPose, getCurrentPose, capturePose]);

  const actionList = [
    { key: 'idle', label: '待机', icon: '🧍' },
    { key: 'walk', label: '行走', icon: '🚶' },
    { key: 'run',  label: '奔跑', icon: '🏃' },
    { key: 'jump', label: '跳跃', icon: '⬆️' },
    { key: 'attack', label: '攻击', icon: '⚔️' },
    { key: 'hit',  label: '受伤', icon: '💥' },
  ];

  /* ── 相机控制 ── */
  const updateFOV = useCallback((v) => {
    setFov(v);
    if (cameraRef.current) {
      cameraRef.current.fov = v;
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);
  const updateDistance = useCallback((v) => {
    setCamDist(v);
    if (controlsRef.current) {
      controlsRef.current.minDistance = v * 0.5;
      controlsRef.current.maxDistance = v * 2;
    }
    if (cameraRef.current) {
      const dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      cameraRef.current.position.copy(
        controlsRef.current.target.clone().add(dir.negate().multiplyScalar(v))
      );
    }
  }, []);
  const setCameraView = useCallback((view) => {
    const target = controlsRef.current?.target || new THREE.Vector3(0, 1, 0);
    const d = camDist;
    const positions = {
      front: [target.x, target.y, target.z + d],
      side:  [target.x + d, target.y, target.z],
      angle: [target.x + d*0.7, target.y + d*0.3, target.z + d*0.7],
      top:   [target.x, target.y + d, target.z + 0.1],
    };
    if (cameraRef.current && positions[view]) {
      cameraRef.current.position.set(...positions[view]);
      controlsRef.current?.update();
    }
  }, [camDist]);

  return (
    <div className={compact ? styles.containerCompact : styles.container}>
      <div className={styles.viewport} ref={mountRef} />
      <div className={styles.controls}>
        {/* 相机参数 */}
        <div className={styles.cameraControls}>
          <div className={styles.cameraRow}>
            <label className={styles.cameraLabel}>FOV</label>
            <input type="range" className={styles.cameraSlider} min={30} max={90} value={fov} onChange={e=>updateFOV(+e.target.value)}/>
            <span className={styles.cameraValue}>{fov}°</span>
          </div>
          <div className={styles.cameraRow}>
            <label className={styles.cameraLabel}>距离</label>
            <input type="range" className={styles.cameraSlider} min={15} max={60} value={Math.round(camDist*10)} onChange={e=>updateDistance(+e.target.value/10)}/>
            <span className={styles.cameraValue}>{camDist.toFixed(1)}</span>
          </div>
          <div className={styles.viewPresets}>
            <button className={styles.viewBtn} onClick={()=>setCameraView('front')} title="正面">⬜ 正面</button>
            <button className={styles.viewBtn} onClick={()=>setCameraView('side')} title="侧面">▶ 侧面</button>
            <button className={styles.viewBtn} onClick={()=>setCameraView('angle')} title="45°">◣ 45°</button>
            <button className={styles.viewBtn} onClick={()=>setCameraView('top')} title="俯视">▽ 俯视</button>
          </div>
        </div>
        {/* 动作预设 */}
        <div className={styles.actionRow}>
          {actionList.map(act => (
            <button
              key={act.key}
              className={`${styles.actionBtn} ${currentAction === act.key ? styles.actionBtnActive : ''}`}
              onClick={() => isAnimating ? stopAction() : playAction(act.key)}
              title={`预览 "${act.label}" 动作`}
            >
              <span>{act.icon}</span>
              <span>{act.label}</span>
            </button>
          ))}
        </div>
        <div className={styles.bottomRow}>
          <button className={styles.resetBtn} onClick={() => { stopAction(); resetPose(); }}>
            重置姿态
          </button>
          {!compact && (
            <button className={styles.captureBtn} onClick={capturePose}>
              生成到素材库
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default PuppetViewer;
