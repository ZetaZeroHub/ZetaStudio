/**
 * ThreeJS Declarative Rendering Engine Proxy
 * Reads elements[] data → Creates/Updates Three.js objects → real-time render
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

let threeObjectMap = new Map();

export function renderAll(scene, elements, variables = {}, editMode = false) {
  destroyAll(scene);
  threeObjectMap = new Map();

  for (const el of elements) {
    const obj = createElement(el, variables);
    if (obj) {
      obj.visible = el.visible !== false;
      obj.__elementId = el.id;
      obj.__elementData = el;
      scene.add(obj);
      threeObjectMap.set(el.id, obj);
    }
  }

  return threeObjectMap;
}

export function destroyAll(scene) {
  if (!scene) return;
  for (const [id, obj] of threeObjectMap) {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
  }
  threeObjectMap.clear();
}

export function getThreeObjectMap() {
  return threeObjectMap;
}

export function syncElements(scene, elements, variables = {}, editMode = false) {
  if (!scene) return threeObjectMap;

  const currentIds = new Set(elements.map(e => e.id));
  
  // 1. Remove deleted
  for (const [id, obj] of Array.from(threeObjectMap.entries())) {
    if (!currentIds.has(id)) {
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      threeObjectMap.delete(id);
    }
  }

  // 2. Update existing or Add new
  for (const el of elements) {
    let obj = threeObjectMap.get(el.id);
    let needsRecreate = !obj;

    if (obj && obj.__elementData) {
      const old = obj.__elementData;
      // Recreate if dimensions or style changes
      const sizeChanged = old.transform?.width !== el.transform?.width || 
                          old.transform?.height !== el.transform?.height || 
                          old.transform?.depth !== el.transform?.depth ||
                          old.transform?.radius !== el.transform?.radius;
      const styleChanged = JSON.stringify(old.style || {}) !== JSON.stringify(el.style || {});
      
      if (sizeChanged || styleChanged) {
        needsRecreate = true;
        scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
        threeObjectMap.delete(el.id);
      } else {
        // Fast update
        updateElementVisual(el.id, { transform: el.transform, visible: el.visible }, variables);
        obj.__elementData = el;
      }
    }

    if (needsRecreate) {
      obj = createElement(el, variables);
      if (obj) {
        obj.__elementId = el.id;
        obj.__elementData = el;
        threeObjectMap.set(el.id, obj);
        scene.add(obj);
      }
    }

    if (obj) {
      obj.visible = el.visible !== false;
    }
  }
  
  return threeObjectMap;
}

export function updateElementVisual(elementId, updates, variables = {}) {
  const obj = threeObjectMap.get(elementId);
  if (!obj) return;

  if (updates.transform) {
    const t = updates.transform;
    if (t.x !== undefined) obj.position.x = t.x;
    if (t.y !== undefined) obj.position.y = t.y;
    if (t.z !== undefined) obj.position.z = t.z;
    if (t.rotationX !== undefined) obj.rotation.x = t.rotationX;
    if (t.rotationY !== undefined) obj.rotation.y = t.rotationY;
    if (t.rotationZ !== undefined) obj.rotation.z = t.rotationZ;
    if (t.scaleX !== undefined) obj.scale.x = t.scaleX;
    if (t.scaleY !== undefined) obj.scale.y = t.scaleY;
    if (t.scaleZ !== undefined) obj.scale.z = t.scaleZ;
  }

  if (updates.visible !== undefined) {
    obj.visible = updates.visible;
  }
}

function createElement(el, variables) {
  switch (el.type) {
    case 'box': return createBox(el);
    case 'sphere': return createSphere(el);
    case 'plane': return createPlane(el);
    case 'cylinder': return createCylinder(el);
    case 'importedModel': return createImportedModel(el);
    case 'ambientLight': return createAmbientLight(el);
    case 'directionalLight': return createDirectionalLight(el);
    case 'pointLight': return createPointLight(el);
    case 'perspectiveCamera': return createPerspectiveCamera(el);
    default: return null;
  }
}

function createBox(el) {
  const t = el.transform || {};
  const s = el.style || {};
  const geometry = new THREE.BoxGeometry(t.width || 1, t.height || 1, t.depth || 1);
  const color = parseColor(s.color || '#00ff00');
  const material = s.material === 'basic' ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  applyTransform(mesh, t);
  return mesh;
}

function createSphere(el) {
  const t = el.transform || {};
  const s = el.style || {};
  const geometry = new THREE.SphereGeometry(t.radius || 1, 32, 16);
  const color = parseColor(s.color || '#00ff00');
  const material = s.material === 'basic' ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  applyTransform(mesh, t);
  return mesh;
}

function createPlane(el) {
  const t = el.transform || {};
  const s = el.style || {};
  const geometry = new THREE.PlaneGeometry(t.width || 10, t.height || 10);
  const color = parseColor(s.color || '#808080');
  const material = s.material === 'basic' ? new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  applyTransform(mesh, t);
  return mesh;
}

function createCylinder(el) {
  const t = el.transform || {};
  const s = el.style || {};
  const geometry = new THREE.CylinderGeometry(t.radiusTop || 0.5, t.radiusBottom || 0.5, t.height || 1, 32);
  const color = parseColor(s.color || '#00ff00');
  const material = s.material === 'basic' ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  applyTransform(mesh, t);
  return mesh;
}

function createImportedModel(el) {
  const s = el.style || {};
  const t = el.transform || {};
  const group = new THREE.Group();
  applyTransform(group, t);

  // Placeholder box while loading
  const placeholder = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x888888, wireframe: true })
  );
  group.add(placeholder);

  if (s.modelUrl) {
    const url = s.modelUrl;
    const fileName = (s.modelFileName || '').toLowerCase();

    const onLoad = (obj) => {
      group.remove(placeholder);
      placeholder.geometry.dispose();
      placeholder.material.dispose();
      const model = obj.scene || obj;
      // Normalize scale
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scale = 2 / maxDim;
        model.scale.multiplyScalar(scale);
      }
      group.add(model);
    };

    const onError = (err) => {
      console.error('Model load error:', err);
      placeholder.material.color.set(0xff0000);
    };

    if (fileName.endsWith('.obj')) {
      new OBJLoader().load(url, onLoad, undefined, onError);
    } else {
      // Default: GLTF/GLB
      new GLTFLoader().load(url, onLoad, undefined, onError);
    }
  }

  return group;
}

function createAmbientLight(el) {
  const s = el.style || {};
  const color = parseColor(s.color || '#ffffff');
  const light = new THREE.AmbientLight(color, s.intensity ?? 0.5);
  return light;
}

function createDirectionalLight(el) {
  const t = el.transform || {};
  const s = el.style || {};
  const color = parseColor(s.color || '#ffffff');
  const light = new THREE.DirectionalLight(color, s.intensity ?? 1);
  applyTransform(light, t);
  light.castShadow = s.castShadow ?? false;
  return light;
}

function createPointLight(el) {
  const t = el.transform || {};
  const s = el.style || {};
  const color = parseColor(s.color || '#ffffff');
  const light = new THREE.PointLight(color, s.intensity ?? 1, s.distance ?? 0);
  applyTransform(light, t);
  return light;
}

function createPerspectiveCamera(el) {
  const t = el.transform || {};
  const s = el.style || {};
  const camera = new THREE.PerspectiveCamera(s.fov || 75, 1, s.near || 0.1, s.far || 1000);
  applyTransform(camera, t);
  if (t.targetX !== undefined) {
    camera.lookAt(t.targetX, t.targetY, t.targetZ);
  }
  return camera;
}

function applyTransform(obj, t) {
  if (t.x !== undefined) obj.position.x = t.x;
  if (t.y !== undefined) obj.position.y = t.y;
  if (t.z !== undefined) obj.position.z = t.z;
  if (t.rotationX !== undefined) obj.rotation.x = t.rotationX;
  if (t.rotationY !== undefined) obj.rotation.y = t.rotationY;
  if (t.rotationZ !== undefined) obj.rotation.z = t.rotationZ;
  if (t.scaleX !== undefined) obj.scale.x = t.scaleX;
  if (t.scaleY !== undefined) obj.scale.y = t.scaleY;
  if (t.scaleZ !== undefined) obj.scale.z = t.scaleZ;
}

function parseColor(colorStr) {
  if (typeof colorStr === 'number') return colorStr;
  return new THREE.Color(colorStr);
}

// 3D Box Selection for edit mode
export function drawSelectionBox(scene, elementId) {
  clearSelectionBox(scene);
  const obj = threeObjectMap.get(elementId);
  if (!obj || !obj.isMesh) return;

  const box = new THREE.BoxHelper(obj, 0x6366f1);
  box.__isSelectionBox = true;
  scene.add(box);
}

export function clearSelectionBox(scene) {
  if (!scene) return;
  const toRemove = scene.children.filter(c => c.__isSelectionBox);
  toRemove.forEach(c => {
    scene.remove(c);
    c.dispose && c.dispose();
  });
}
