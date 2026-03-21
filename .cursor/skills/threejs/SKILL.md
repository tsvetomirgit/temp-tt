---
name: threejs
description: >
  Use this skill whenever working with Three.js — creating 3D scenes, animations, visualizations,
  games, interactive experiences, WebGL/WebGPU renderers, shaders (GLSL/TSL), materials, geometries,
  cameras, lights, loaders (GLTF/GLB/OBJ), physics integrations, post-processing effects, or
  particle systems. Trigger on any mention of "three.js", "Three", "WebGL", "WebGPU", "3D scene",
  "GLTF", "GLB", "mesh", "shader", "BufferGeometry", "PerspectiveCamera", "OrbitControls",
  "InstancedMesh", "TSL", "MeshStandardMaterial", "AnimationMixer", or "renderer.render".
  Also triggers when building any browser-based 3D graphics, real-time visualizations, or
  immersive web experiences with JavaScript.
version: "1.0.0"
sources:
  - https://threejs.org/docs/
  - https://github.com/mrdoob/three.js/
  - https://threejs.org/manual/
knowledge_cutoff: "March 2026 (r171+)"
---

# Three.js Skill — Deep Rules & Best Practices

This skill covers Three.js from fundamentals to production-grade patterns based on the current
library (r171+), including the modern WebGPU renderer, TSL shaders, Node Materials, and
performance optimization. Always apply these rules when generating or reviewing Three.js code.

---

## 1. RENDERER SELECTION — Modern Default

### Rule: Prefer WebGPURenderer over WebGLRenderer for new projects

Since r171, `WebGPURenderer` is the recommended renderer. It auto-falls back to WebGL 2:

```js
// ✅ CORRECT — Modern (r171+)
import { WebGPURenderer } from 'three/webgpu';

const renderer = new WebGPURenderer({ antialias: true });
await renderer.init(); // MANDATORY — fails silently without this
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Use setAnimationLoop (not requestAnimationFrame) with WebGPURenderer
renderer.setAnimationLoop(animate);
```

```js
// ✅ STILL VALID — WebGL-only, smaller bundle
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
  stencil: false,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

```js
// ❌ WRONG — No await renderer.init()
const renderer = new WebGPURenderer();
renderer.render(scene, camera); // Fails silently!
```

### Key Renderer Settings

```js
// Output encoding (always set for correct colors)
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better quality

// Tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
```

---

## 2. SCENE SETUP — Canonical Boilerplate

Every Three.js project needs the same core four objects:

```js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.02); // optional

// Camera
const camera = new THREE.PerspectiveCamera(
  75,                                    // FOV
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1,                                   // Near clipping plane
  1000                                   // Far clipping plane
);
camera.position.set(0, 2, 5);

// Renderer (see above)

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;    // Smooth inertia
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  controls.update(); // Required when damping is enabled
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
// OR for WebGLRenderer:
// function animate() { requestAnimationFrame(animate); ... }; animate();
```

---

## 3. GEOMETRY — Rules & Patterns

### Use BufferGeometry (never deprecated Geometry)

```js
// ✅ BufferGeometry — all built-in geometries are already BufferGeometry
const box = new THREE.BoxGeometry(1, 1, 1);
const sphere = new THREE.SphereGeometry(0.5, 32, 16);
const plane = new THREE.PlaneGeometry(10, 10, 50, 50);
const torus = new THREE.TorusKnotGeometry(0.5, 0.15, 128, 16);
const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
const capsule = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
```

### Custom BufferGeometry

```js
const geometry = new THREE.BufferGeometry();

// Float32Array for vertices — 3 values per vertex (x, y, z)
const vertices = new Float32Array([
   0,  1, 0,   // vertex 0
  -1, -1, 0,   // vertex 1
   1, -1, 0,   // vertex 2
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

// Normals
geometry.computeVertexNormals(); // Auto-compute from positions

// UVs (for textures)
const uvs = new Float32Array([0.5, 1, 0, 0, 1, 0]);
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

// Indexed geometry (reduces vertex duplication)
const indices = new Uint16Array([0, 1, 2]);
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
```

### Dispose Geometry When Done

```js
// ❌ MEMORY LEAK — Geometry not disposed
scene.remove(mesh);

// ✅ CORRECT
scene.remove(mesh);
mesh.geometry.dispose();
mesh.material.dispose();
// If material has textures:
mesh.material.map?.dispose();
mesh.material.normalMap?.dispose();
```

---

## 4. MATERIALS — Choosing the Right One

| Material | Use Case | Cost |
|---|---|---|
| `MeshBasicMaterial` | Debug, UI, unlit objects | Cheapest |
| `MeshLambertMaterial` | Matte non-specular objects | Cheap |
| `MeshPhongMaterial` | Shiny objects, legacy | Medium |
| `MeshStandardMaterial` | PBR — default choice | Medium-High |
| `MeshPhysicalMaterial` | Advanced PBR (clearcoat, SSS) | Expensive |
| `MeshToonMaterial` | Cel-shading | Medium |
| `ShaderMaterial` | Custom GLSL shaders | Varies |
| `MeshStandardNodeMaterial` | PBR + TSL/node customization | Medium-High |

### Standard PBR Material

```js
const material = new THREE.MeshStandardMaterial({
  color: 0xff6600,
  metalness: 0.5,      // 0 = non-metal, 1 = full metal
  roughness: 0.4,      // 0 = mirror, 1 = completely matte
  map: colorTexture,
  normalMap: normalTexture,
  roughnessMap: roughnessTexture,
  metalnessMap: metalnessTexture,
  aoMap: aoTexture,    // Ambient occlusion
  envMap: envMapTexture,
  side: THREE.FrontSide,  // FrontSide | BackSide | DoubleSide
});
```

### Share Materials Between Meshes

```js
// ✅ Share one material for multiple meshes
const sharedMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const meshA = new THREE.Mesh(geometryA, sharedMaterial);
const meshB = new THREE.Mesh(geometryB, sharedMaterial);

// ✅ Clone only when per-instance color is needed
const instanceMaterial = sharedMaterial.clone();
instanceMaterial.color.set(0xff0000);
```

---

## 5. TSL — THREE SHADER LANGUAGE (Modern Shaders)

TSL is the future of Three.js shaders. Write once, compiles to WGSL (WebGPU) or GLSL (WebGL):

### Basic TSL Setup

```js
import { WebGPURenderer, MeshStandardNodeMaterial } from 'three/webgpu';
import {
  color, positionLocal, sin, cos, time, uv,
  vec2, vec3, vec4, float, uniform, Fn, mix,
  normalLocal, normalize, dot, max, min, clamp,
  texture, sampler, modelNormalMatrix, transformedNormalView
} from 'three/tsl';

// Node-based material
const mat = new MeshStandardNodeMaterial();

// Animated color node
mat.colorNode = vec3(
  sin(time).mul(0.5).add(0.5),  // Red oscillates
  cos(time.mul(2)).mul(0.5).add(0.5), // Green
  float(0.8)                     // Blue constant
);

// Displacement
mat.positionNode = positionLocal.add(
  normalLocal.mul(sin(positionLocal.y.mul(10).add(time)).mul(0.1))
);
```

### TSL Custom Functions with Fn

```js
// Define reusable TSL functions
const fbm = Fn(([p]) => {
  let value = float(0);
  let amplitude = float(0.5);
  let frequency = float(1);

  for (let i = 0; i < 5; i++) {
    value = value.add(amplitude.mul(/* noise(p.mul(frequency)) */ float(0)));
    amplitude = amplitude.mul(0.5);
    frequency = frequency.mul(2);
  }
  return value;
});

// Use uniform for CPU-controlled parameters
const myColor = uniform(new THREE.Color(0xff0000));
const speed = uniform(1.0);

// In material:
mat.colorNode = mix(
  color('#ff0000'),
  color('#0000ff'),
  uv().y.add(sin(time.mul(speed)).mul(0.1))
);

// Update uniform from JS (no material recompilation!)
speed.value = 2.0;
```

### TSL Built-in Variables

```js
// Vertex shader context
positionLocal      // Object-space position (vec3)
positionWorld      // World-space position (vec3)
positionView       // Camera-space position (vec3)
normalLocal        // Object-space normal (vec3)
normalWorld        // World-space normal (vec3)
normalView         // Camera-space normal (vec3)
uv()               // UV coordinates (vec2)
uv(1)              // UV channel 2
vertexColor()      // Vertex color attribute

// Fragment context
screenUV           // Screen UV (vec2)
screenCoordinate   // Screen position in pixels (vec2)

// Time
time               // Elapsed seconds (float)
deltaTime          // Frame delta (float)
frameIndex         // Frame count (uint)

// Instances
instanceIndex      // Current instance index (uint)
```

---

## 6. INSTANCING — Rendering Thousands of Objects

### InstancedMesh (Same Geometry + Material)

```js
const COUNT = 10_000;
const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // If updating every frame

const matrix = new THREE.Matrix4();
const color = new THREE.Color();

for (let i = 0; i < COUNT; i++) {
  // Position
  matrix.setPosition(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20
  );
  mesh.setMatrixAt(i, matrix);

  // Per-instance color
  color.setHSL(i / COUNT, 0.8, 0.5);
  mesh.setColorAt(i, color);
}

mesh.instanceMatrix.needsUpdate = true;
mesh.instanceColor.needsUpdate = true;
scene.add(mesh);
```

### BatchedMesh (Different Geometries, Same Material)

```js
import { BatchedMesh } from 'three';

const maxVertexCount = 50000;
const maxIndexCount = 100000;
const maxGeometries = 100;

const batched = new BatchedMesh(maxGeometries, maxVertexCount, maxIndexCount, material);

// Add geometries
const boxId = batched.addGeometry(new THREE.BoxGeometry(1, 1, 1));
const sphereId = batched.addGeometry(new THREE.SphereGeometry(0.5, 16, 8));

// Create instances
for (let i = 0; i < 50; i++) {
  const instanceId = batched.addInstance(i < 25 ? boxId : sphereId);
  matrix.setPosition(Math.random() * 10, 0, Math.random() * 10);
  batched.setMatrixAt(instanceId, matrix);
}
scene.add(batched);
```

---

## 7. LIGHTING — Rules & Performance

### Light Types & Cost

```js
// Cheapest → Most Expensive
const ambient = new THREE.AmbientLight(0xffffff, 0.3);    // No shadows, flat

const hemi = new THREE.HemisphereLight(           // Sky/ground, no shadows
  0x87ceeb, // Sky color
  0x8b4513, // Ground color
  0.5
);

const dirLight = new THREE.DirectionalLight(0xffffff, 1); // Best shadows
dirLight.position.set(5, 10, 7.5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;   // Power of 2: 512, 1024, 2048, 4096
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -20;      // Tune frustum to scene size
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
dirLight.shadow.bias = -0.001;          // Prevents shadow acne

const pointLight = new THREE.PointLight(0xff6600, 1, 10); // Expensive shadows
const spotLight = new THREE.SpotLight(0xffffff, 1);       // Most expensive
```

### Performance Rules for Lighting

```js
// ✅ Keep light count low (≤ 3 casting shadows)
// ✅ Use environment maps for ambient reflections (free PBR lighting)
const envMap = new THREE.RGBELoader().load('hdr/studio.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;    // Affects all PBR materials
  scene.background = texture;     // Optional: use as background
});

// ✅ Disable shadow auto-update for static scenes
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true; // Call once after scene setup

// ✅ Bake lightmaps for static geometry (zero runtime cost)
material.lightMap = bakedLightMap;
material.lightMapIntensity = 1.0;
```

---

## 8. TEXTURES — Loading & Optimization

### Texture Loading

```js
const textureLoader = new THREE.TextureLoader();

// Single texture
const texture = textureLoader.load('/textures/color.jpg');
texture.colorSpace = THREE.SRGBColorSpace; // For color maps
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 4);

// Loading manager (track progress)
const manager = new THREE.LoadingManager(
  () => console.log('All loaded'),
  (url, loaded, total) => console.log(`Loading: ${(loaded/total*100).toFixed(0)}%`),
  (url) => console.error(`Failed: ${url}`)
);

// GLTF loader (standard 3D format)
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');  // Copy from three/examples/jsm/libs/draco/

const gltfLoader = new GLTFLoader(manager);
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load('/models/scene.glb', (gltf) => {
  const model = gltf.scene;
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(model);

  // Animations
  const mixer = new THREE.AnimationMixer(model);
  const action = mixer.clipAction(gltf.animations[0]);
  action.play();

  // Update in animate loop:
  // mixer.update(deltaTime);
});
```

### Texture Optimization Rules

```js
// ✅ Use KTX2 compressed textures (GPU-native, much smaller)
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
const ktx2Loader = new KTX2Loader()
  .setTranscoderPath('/basis/')
  .detectSupport(renderer);
const compressedTex = await ktx2Loader.loadAsync('/textures/color.ktx2');

// ✅ Limit texture size — power of 2, max 2048x2048 for web
// ✅ Use texture atlases to reduce material switches
// ✅ Mipmaps auto-generated — keep enabled (default)
// ✅ Set colorSpace correctly:
//    SRGBColorSpace → color/albedo maps
//    NoColorSpace   → normal, roughness, metalness, AO maps

// ✅ Dispose textures when removing objects
texture.dispose();
```

---

## 9. ANIMATIONS — AnimationMixer & Keyframes

```js
// Load GLTF with animations
let mixer;
const clock = new THREE.Clock();

gltfLoader.load('/model.glb', (gltf) => {
  scene.add(gltf.scene);
  mixer = new THREE.AnimationMixer(gltf.scene);

  // Play specific clip
  const walkClip = THREE.AnimationClip.findByName(gltf.animations, 'Walk');
  const walkAction = mixer.clipAction(walkClip);
  walkAction.play();

  // Crossfade between animations
  const runClip = THREE.AnimationClip.findByName(gltf.animations, 'Run');
  const runAction = mixer.clipAction(runClip);

  // Transition: walk → run
  walkAction.fadeOut(0.5);
  runAction.reset().fadeIn(0.5).play();
});

// In animate loop:
function animate() {
  const delta = clock.getDelta();
  mixer?.update(delta);
  renderer.render(scene, camera);
}
```

### Custom Keyframe Animation

```js
// Animate object properties programmatically
const positionKF = new THREE.VectorKeyframeTrack(
  '.position',                       // Property path
  [0, 1, 2],                         // Times (seconds)
  [0, 0, 0,  0, 2, 0,  0, 0, 0]     // Values (xyz per keyframe)
);

const clip = new THREE.AnimationClip('move', 2, [positionKF]);
const mixer = new THREE.AnimationMixer(mesh);
mixer.clipAction(clip).play();
```

---

## 10. RAYCASTING — Mouse Picking & Interaction

```js
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// In animate loop:
raycaster.setFromCamera(pointer, camera);
const intersects = raycaster.intersectObjects(scene.children, true); // true = recursive

if (intersects.length > 0) {
  const hit = intersects[0];
  console.log('Hit:', hit.object.name);
  console.log('Point:', hit.point);      // World position of intersection
  console.log('Distance:', hit.distance);
  console.log('Face:', hit.face);        // Face normal, indices
}

// ✅ For large scenes: use three-mesh-bvh for fast raycasting
// npm install three-mesh-bvh
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;
geometry.computeBoundsTree(); // After geometry creation
```

---

## 11. POST-PROCESSING

### WebGL (Legacy EffectComposer)

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // Strength
  0.4,  // Radius
  0.85  // Threshold
));
composer.addPass(new SMAAPass(window.innerWidth, window.innerHeight));

// In animate: composer.render() instead of renderer.render()
```

### WebGPU (Modern Node Post-Processing)

```js
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { smaa } from 'three/addons/tsl/display/SMAANode.js';
import { pass } from 'three/tsl';

const scenePass = pass(scene, camera);
const bloomPass = bloom(scenePass.getTextureNode(), 1.5, 0.4, 0.85);
const smaaPass = smaa(bloomPass);

renderer.compute(bloomPass); // WebGPU post-processing is node-based
```

---

## 12. PERFORMANCE RULES — Critical Checklist

### Draw Calls
```js
// 🎯 Target: under 100 draw calls per frame
// Check with:
console.log(renderer.info.render.calls);    // Draw calls
console.log(renderer.info.render.triangles); // Triangle count
console.log(renderer.info.memory.geometries);
console.log(renderer.info.memory.textures);
```

### Object Pooling (Avoid GC Pressure)
```js
// ❌ WRONG — Creates new objects in hot path
function animate() {
  const dir = new THREE.Vector3(); // Allocates every frame!
  dir.subVectors(target, mesh.position).normalize();
}

// ✅ CORRECT — Reuse objects
const _dir = new THREE.Vector3(); // Allocated once
function animate() {
  _dir.subVectors(target, mesh.position).normalize();
}
```

### Visibility vs Disposal
```js
// ✅ For objects shown/hidden frequently
mesh.visible = false; // GPU-culled, no CPU work

// ✅ For objects removed permanently
scene.remove(mesh);
mesh.geometry.dispose();
mesh.material.dispose();
```

### Frustum Culling
```js
// Enabled by default — keep it
mesh.frustumCulled = true;

// Disable only for very large meshes that always need rendering
skybox.frustumCulled = false;
```

### Pixel Ratio
```js
// ✅ Cap at 2 — prevents excess GPU work on high-DPI displays
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

---

## 13. COMPUTE SHADERS (WebGPU only)

```js
import { WebGPURenderer } from 'three/webgpu';
import {
  compute, instancedArray, instanceIndex,
  uniform, float, vec3, Fn
} from 'three/tsl';

const COUNT = 100_000;

// GPU-persistent particle buffers
const positions = instancedArray(COUNT, 'vec3');
const velocities = instancedArray(COUNT, 'vec3');

// Compute shader — runs on GPU for all instances in parallel
const updateParticles = Fn(() => {
  const pos = positions.element(instanceIndex);
  const vel = velocities.element(instanceIndex);
  const newPos = pos.add(vel.mul(deltaTime));
  positions.element(instanceIndex).assign(newPos);
})().compute(COUNT); // Dispatch COUNT threads

// Initialize positions (run once)
await renderer.computeAsync(updateParticles);

// Animate: run each frame
function animate() {
  renderer.compute(updateParticles);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
```

---

## 14. MATH UTILITIES — Common Patterns

```js
// MathUtils
THREE.MathUtils.lerp(0, 1, 0.5);    // 0.5
THREE.MathUtils.clamp(1.5, 0, 1);   // 1
THREE.MathUtils.degToRad(90);        // π/2
THREE.MathUtils.randFloat(-1, 1);    // Random in range
THREE.MathUtils.mapLinear(0.5, 0, 1, 100, 200); // 150

// Vector3 chaining
const dir = new THREE.Vector3()
  .subVectors(targetPos, mesh.position)
  .normalize()
  .multiplyScalar(speed);

// Quaternion rotation (avoid Euler gimbal lock)
const quat = new THREE.Quaternion();
quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
mesh.quaternion.slerp(quat, 0.1); // Smooth rotation

// Box3 for bounding boxes
const box = new THREE.Box3().setFromObject(mesh);
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());
```

---

## 15. DEBUGGING TOOLS

```js
// Grid helper (visual reference)
scene.add(new THREE.GridHelper(20, 20));

// Axes helper (X=red, Y=green, Z=blue)
scene.add(new THREE.AxesHelper(5));

// Box helper (shows bounding box)
const boxHelper = new THREE.BoxHelper(mesh, 0xffff00);
scene.add(boxHelper);

// Camera helper (visualize frustum)
const cameraHelper = new THREE.CameraHelper(shadowLight.shadow.camera);
scene.add(cameraHelper);

// Stats (FPS counter)
// npm install stats.js
import Stats from 'stats.js';
const stats = new Stats();
document.body.appendChild(stats.dom);
// In animate: stats.begin(); ... render ... stats.end();

// lil-gui (live tweaking)
// npm install lil-gui
import GUI from 'lil-gui';
const gui = new GUI();
gui.add(material, 'metalness', 0, 1);
gui.add(material, 'roughness', 0, 1);
gui.addColor(material, 'color');
```

---

## 16. REACT THREE FIBER (R3F) PATTERNS

```jsx
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { useRef } from 'react';

function RotatingBox() {
  const meshRef = useRef();

  // ✅ Mutate in useFrame — don't setState for per-frame updates
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

// ✅ Toggle visibility instead of remounting
<mesh visible={isVisible}>...</mesh>

// ✅ Preload models
useGLTF.preload('/model.glb');

// ✅ Static scenes: demand rendering
<Canvas frameloop="demand">
```

---

## 17. COMMON MISTAKES TO AVOID

```js
// ❌ Using Euler for continuous rotation (gimbal lock)
mesh.rotation.y += 0.01; // OK for simple cases but avoid complex combined rotations

// ❌ Creating new THREE objects inside animate loop
function animate() {
  const v = new THREE.Vector3(0, 1, 0); // New allocation every frame!
}

// ❌ Forgetting to update instanceMatrix
mesh.setMatrixAt(i, matrix);
// mesh.instanceMatrix.needsUpdate = true; ← MISSING

// ❌ Using OrbitControls without update()
function animate() {
  renderer.render(scene, camera); // controls.update() missing → no damping
}

// ❌ Not disposing resources (memory leaks)
// Always: geometry.dispose(), material.dispose(), texture.dispose()

// ❌ Setting pixel ratio too high
renderer.setPixelRatio(window.devicePixelRatio); // Can be 3x+ on mobile → 9x pixels!
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // ✅ Cap at 2

// ❌ Not awaiting WebGPURenderer.init()
const renderer = new WebGPURenderer();
renderer.render(scene, camera); // ❌ Will fail

// ❌ Using EffectComposer with WebGPURenderer
// WebGPURenderer has its own post-processing stack — use Node-based passes

// ❌ Too many lights casting shadows
// Keep shadow-casting lights ≤ 3
```

---

## 18. IMPORT PATTERNS — Modern Three.js

```js
// ✅ Tree-shakeable imports (preferred for bundlers)
import { Scene, PerspectiveCamera, Mesh, BoxGeometry } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// ✅ WebGPU entrypoint
import { WebGPURenderer, MeshStandardNodeMaterial } from 'three/webgpu';
import { color, time, sin, uv, Fn, uniform } from 'three/tsl';

// ⚠️ Namespace import (larger bundle, OK for quick prototypes)
import * as THREE from 'three';
```

---

## 19. QUICK REFERENCE — What Class Does What

| Task | Class/Function |
|---|---|
| Scene graph root | `THREE.Scene` |
| Perspective view | `THREE.PerspectiveCamera(fov, aspect, near, far)` |
| Isometric/CAD view | `THREE.OrthographicCamera(l, r, t, b, near, far)` |
| GPU output | `WebGPURenderer` (new) or `THREE.WebGLRenderer` |
| 3D Object base | `THREE.Object3D` |
| Mesh (visible) | `THREE.Mesh(geometry, material)` |
| Line (1D) | `THREE.Line(geometry, material)` |
| Points (particles) | `THREE.Points(geometry, material)` |
| Sprite (billboard) | `THREE.Sprite(material)` |
| Group (empty) | `THREE.Group()` |
| Repeated objects | `THREE.InstancedMesh(geo, mat, count)` |
| Mouse → 3D | `THREE.Raycaster` |
| Easing/lerp | `THREE.MathUtils` |
| Animation system | `THREE.AnimationMixer` |
| Load GLTF | `GLTFLoader` (addons) |
| Load images | `THREE.TextureLoader` |
| Load HDR | `RGBELoader` (addons) |
| Camera orbit | `OrbitControls` (addons) |
| First-person | `PointerLockControls` (addons) |
| Node shader | `TSL` from `'three/tsl'` |
| GPU compute | `renderer.compute(computeNode)` |

---

## 20. SKILL ACTIVATION EXAMPLES

This skill applies to ANY of these requests:

- "Create a rotating 3D cube"
- "Build a particle system with Three.js"
- "Set up a WebGPU renderer"
- "Load and display a GLTF model"
- "Write a custom GLSL/TSL shader"
- "Make a raycasting mouse picker"
- "Optimize draw calls with InstancedMesh"
- "Add bloom post-processing"
- "Animate a skinned mesh"
- "Create procedural terrain"
- "Build a 3D product configurator"
- "Make a Three.js scene in React (R3F)"
