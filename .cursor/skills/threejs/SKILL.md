---
name: threejs
description:   Use this skill whenever working with Three.js — creating 3D scenes, animations, visualizations,  games, interactive experiences, WebGL/WebGPU renderers, shaders (GLSL/TSL), materials, geometries,  cameras, lights, loaders (GLTF/GLB/OBJ), physics integrations, post-processing effects, or
  particle systems. Trigger on any mention of "three.js", "Three", "WebGL", "WebGPU", "3D scene",  "GLTF", "GLB", "mesh", "shader", "BufferGeometry", "PerspectiveCamera", "OrbitControls",  "InstancedMesh", "TSL", "MeshStandardMaterial", "AnimationMixer", or "renderer.render".  Also triggers when building any browser-based 3D graphics, real-time visualizations, or  immersive web experiences with JavaScript or TypeScript, including Angular projects.
metadata:
  - https://threejs.org/docs/
  - https://github.com/mrdoob/three.js/
  - https://threejs.org/manual/
  - https://angular.dev/guide/components/lifecycle
---

# Three.js Skill — Deep Rules & Best Practices (Angular Edition)

This skill covers Three.js from fundamentals to production-grade patterns based on the current
library (r171+) inside **Angular projects**. It includes Angular lifecycle integration,
NgZone handling, service patterns, SSR guards, and TypeScript-first code.
Always apply these rules when generating or reviewing Three.js code in Angular.

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

## A. ANGULAR INTEGRATION — The Complete Patterns

This is the primary section for Angular projects. All Three.js work in Angular must follow
these patterns. Sections 1–20 below still apply — this section tells you HOW to fit them
into Angular's component model.

---

### A1. Project Setup

```bash
npm install three
npm install --save-dev @types/three
```

In `tsconfig.json`, ensure:
```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"],
    "skipLibCheck": true
  }
}
```

For `angular.json` — if loading Draco decoders or HDR files from `node_modules/three/examples/`,
add them to assets:
```json
"assets": [
  { "glob": "**/*", "input": "node_modules/three/examples/jsm/libs/draco/", "output": "/draco/" }
]
```

---

### A2. The Canonical Angular Component Structure

**RULE: Always use `ngAfterViewInit` to initialize Three.js — NEVER `ngOnInit`.**
The canvas `ElementRef` is `null` until after the view is rendered.

**RULE: Always run the render loop with `NgZone.runOutsideAngular()`.**
Three.js's `requestAnimationFrame` loop fires 60× per second. Without this, Angular's
change detection runs 60× per second — killing performance.

**RULE: Always implement `ngOnDestroy` to dispose GPU resources and stop the loop.**
WebGL contexts are a limited browser resource (typically 16 max). Leaking them causes
`WARNING: Too many active WebGL contexts. Oldest context will be lost.`

```typescript
// scene.component.ts — complete canonical pattern
import {
  Component, ElementRef, ViewChild,
  AfterViewInit, OnDestroy, NgZone,
  ChangeDetectionStrategy, PLATFORM_ID, inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

@Component({
  selector: 'app-scene',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Always use OnPush
  template: `
    <canvas #canvas style="display:block; width:100%; height:100%;"></canvas>
  `,
  styles: [`host { display: block; width: 100%; height: 100%; }`]
})
export class SceneComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  // Three.js objects — private, not bound to Angular templates
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private clock = new THREE.Clock();
  private animationId = 0;
  private resizeObserver!: ResizeObserver;

  // Inject Angular services
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    // ✅ Guard against SSR — Three.js needs a real browser DOM
    if (!isPlatformBrowser(this.platformId)) return;

    this.initScene();

    // ✅ Run the loop OUTSIDE Angular's zone — no change detection per frame
    this.ngZone.runOutsideAngular(() => {
      this.startRenderLoop();
      this.setupResizeObserver();
    });
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;

    // Renderer — attach to the Angular template canvas
    this.renderer = new THREE.WebGLRenderer({
      canvas,                          // ✅ Use template canvas, not domElement.appendChild
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Add lights, geometry, etc. here
    this.buildScene();
  }

  private buildScene(): void {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x4488ff })
    );
    this.scene.add(mesh);
  }

  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      const delta = this.clock.getDelta();
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private setupResizeObserver(): void {
    // ✅ ResizeObserver is better than window 'resize' — works for non-fullscreen canvases
    this.resizeObserver = new ResizeObserver(() => {
      const canvas = this.canvasRef.nativeElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false); // false = don't set CSS size
    });
    this.resizeObserver.observe(this.canvasRef.nativeElement);
  }

  ngOnDestroy(): void {
    // ✅ Stop the animation loop FIRST
    cancelAnimationFrame(this.animationId);

    // ✅ Disconnect observer
    this.resizeObserver?.disconnect();

    // ✅ Dispose all Three.js GPU resources
    this.controls?.dispose();
    this.scene?.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
    this.renderer?.dispose();
    this.renderer?.forceContextLoss(); // ✅ Release WebGL context immediately
  }
}
```

---

### A3. NgZone Rules for Three.js

```typescript
// ✅ RULE: Everything that fires per-frame goes OUTSIDE the zone

// The render loop — outside
this.ngZone.runOutsideAngular(() => {
  const animate = () => {
    requestAnimationFrame(animate);
    this.renderer.render(this.scene, this.camera);
  };
  animate();
});

// Mouse/pointer events used only by Three.js (raycasting) — outside
this.ngZone.runOutsideAngular(() => {
  this.canvasRef.nativeElement.addEventListener('pointermove', this.onPointerMove);
});

// ✅ RULE: Re-enter the zone ONLY when updating Angular state (signals, bindings)
this.ngZone.runOutsideAngular(() => {
  this.canvasRef.nativeElement.addEventListener('click', () => {
    const hit = this.getClickedObject(); // pure Three.js work
    if (hit) {
      this.ngZone.run(() => {
        // Update Angular state — triggers change detection once
        this.selectedObject.set(hit.object.name);
      });
    }
  });
});

// ✅ With signals (Angular 17+): signal updates re-enter zone automatically
private selectedName = signal<string | null>(null);
```

```typescript
// ❌ WRONG — render loop inside the zone (60 change detections/sec!)
ngAfterViewInit() {
  const animate = () => {
    requestAnimationFrame(animate);
    this.renderer.render(this.scene, this.camera);
  };
  animate();
}

// ✅ CORRECT — outside the zone
ngAfterViewInit() {
  this.ngZone.runOutsideAngular(() => {
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  });
}
```

---

### A4. Three.js as an Angular Service

For complex scenes, extract Three.js logic into an injectable service:

```typescript
// three-scene.service.ts
import { Injectable, NgZone, inject } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  private ngZone = inject(NgZone);

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;

  private animationId = 0;
  private clock = new THREE.Clock();

  init(canvas: HTMLCanvasElement): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 5);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.ngZone.runOutsideAngular(() => this.startLoop());
  }

  private startLoop(): void {
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  destroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
  }
}
```

```typescript
// scene.component.ts — thin component using the service
@Component({
  selector: 'app-scene',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas style="display:block;width:100%;height:100%;"></canvas>`,
  styles: [`:host { display:block; width:100%; height:100%; }`]
})
export class SceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private threeService = inject(ThreeSceneService);
  private platformId = inject(PLATFORM_ID);
  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = this.canvasRef.nativeElement;
    this.threeService.init(canvas);

    this.resizeObserver = new ResizeObserver(() => {
      this.threeService.resize(canvas.clientWidth, canvas.clientHeight);
    });
    this.resizeObserver.observe(canvas);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.threeService.destroy();
  }
}
```

---

### A5. SSR / Angular Universal Guard

Three.js requires `window`, `document`, and `WebGLRenderingContext` — none exist on the server.
Always guard with `isPlatformBrowser`:

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export class SceneComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // ✅ Skip entirely on server
    }
    this.initThreeJs();
  }
}
```

Alternatively, use Angular's `afterNextRender` (Angular 17+) which only runs in the browser:

```typescript
import { afterNextRender } from '@angular/core';

export class SceneComponent {
  constructor() {
    afterNextRender(() => {
      // ✅ Guaranteed browser-only, replaces ngAfterViewInit for DOM init
      this.initThreeJs();
    });
  }
}
```

---

### A6. Inputs & Outputs — Connecting Angular Data to Three.js

```typescript
// Pass data INTO the scene via Angular signals (preferred, Angular 17+)
@Component({ ... })
export class SceneComponent implements AfterViewInit {
  color = input<string>('#4488ff');
  rotationSpeed = input<number>(1.0);

  private mesh!: THREE.Mesh;

  constructor() {
    effect(() => {
      if (this.mesh) {
        (this.mesh.material as THREE.MeshStandardMaterial).color.set(this.color());
      }
    });
  }
}

// Emit Angular events from Three.js interactions
@Component({ ... })
export class SceneComponent implements AfterViewInit {
  objectClicked = output<string>();

  private setupRaycaster(): void {
    this.ngZone.runOutsideAngular(() => {
      this.canvasRef.nativeElement.addEventListener('click', (e: MouseEvent) => {
        const hit = this.raycast(e);
        if (hit) {
          this.ngZone.run(() => this.objectClicked.emit(hit.object.name));
        }
      });
    });
  }
}
```

---

### A7. Angular-Specific Mistake Checklist

```typescript
// ❌ Initializing Three.js in ngOnInit — canvas not available yet
ngOnInit() {
  this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement }); // NULL!
}

// ❌ Using document.body.appendChild(renderer.domElement) in Angular
renderer.domElement // never appendChild this in Angular

// ❌ Adding window resize listener without removing it
ngAfterViewInit() {
  window.addEventListener('resize', this.onResize); // leaks on component destroy
}
// ✅ Use ResizeObserver + disconnect in ngOnDestroy instead

// ❌ Not calling renderer.forceContextLoss() — leaks WebGL context
ngOnDestroy() {
  this.renderer.dispose(); // Not enough — context stays alive
}
// ✅ Always pair with: this.renderer.forceContextLoss();

// ❌ Binding Three.js objects to Angular template variables
public mesh!: THREE.Mesh;  // Don't use in template
// ✅ Keep all Three.js state private

// ❌ Running render loop inside zone (60 CD cycles/second!)
ngAfterViewInit() {
  const animate = () => { requestAnimationFrame(animate); this.renderer.render(...); };
  animate(); // inside zone!
}
// ✅ Always: this.ngZone.runOutsideAngular(() => { ... })

// ❌ Skipping isPlatformBrowser check in SSR apps
ngAfterViewInit() {
  this.renderer = new THREE.WebGLRenderer(); // Crashes on server
}
```

---

### A8. Complete Angular + Three.js File Structure

```
src/
  app/
    3d/
      scene/
        scene.component.ts      <- Thin Angular shell (AfterViewInit, OnDestroy)
        scene.component.html    <- Just <canvas #canvas>
        scene.component.scss    <- :host { display: block }
      services/
        three-scene.service.ts  <- All Three.js logic (renderer, scene, camera)
        three-loader.service.ts <- GLTF/texture loading
        three-raycaster.service.ts <- Mouse interaction
      models/
        (GLTF files in assets/)
      shaders/
        (TSL/GLSL files if custom shaders)
```

---

## 3. GEOMETRY — Rules & Patterns

### Use BufferGeometry (never deprecated Geometry)

```js
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

const vertices = new Float32Array([
   0,  1, 0,
  -1, -1, 0,
   1, -1, 0,
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.computeVertexNormals();

const uvs = new Float32Array([0.5, 1, 0, 0, 1, 0]);
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

const indices = new Uint16Array([0, 1, 2]);
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
```

### Dispose Geometry When Done

```js
// ❌ MEMORY LEAK
scene.remove(mesh);

// ✅ CORRECT
scene.remove(mesh);
mesh.geometry.dispose();
mesh.material.dispose();
mesh.material.map?.dispose();
mesh.material.normalMap?.dispose();
```

---

## 4. MATERIALS — Choosing the Right One

| Material | Use Case | Cost |
|---|---|---|
| MeshBasicMaterial | Debug, UI, unlit objects | Cheapest |
| MeshLambertMaterial | Matte non-specular objects | Cheap |
| MeshPhongMaterial | Shiny objects, legacy | Medium |
| MeshStandardMaterial | PBR — default choice | Medium-High |
| MeshPhysicalMaterial | Advanced PBR (clearcoat, SSS) | Expensive |
| MeshToonMaterial | Cel-shading | Medium |
| ShaderMaterial | Custom GLSL shaders | Varies |
| MeshStandardNodeMaterial | PBR + TSL/node customization | Medium-High |

### Standard PBR Material

```js
const material = new THREE.MeshStandardMaterial({
  color: 0xff6600,
  metalness: 0.5,
  roughness: 0.4,
  map: colorTexture,
  normalMap: normalTexture,
  roughnessMap: roughnessTexture,
  metalnessMap: metalnessTexture,
  aoMap: aoTexture,
  envMap: envMapTexture,
  side: THREE.FrontSide,
});
```

### Share Materials Between Meshes

```js
// ✅ Share one material
const sharedMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const meshA = new THREE.Mesh(geometryA, sharedMaterial);
const meshB = new THREE.Mesh(geometryB, sharedMaterial);

// ✅ Clone only when per-instance color needed
const instanceMaterial = sharedMaterial.clone();
instanceMaterial.color.set(0xff0000);
```

---

## 5. TSL — THREE SHADER LANGUAGE (Modern Shaders)

```js
import { WebGPURenderer, MeshStandardNodeMaterial } from 'three/webgpu';
import {
  color, positionLocal, sin, cos, time, uv,
  vec2, vec3, vec4, float, uniform, Fn, mix,
  normalLocal, normalize, dot, max, min, clamp,
} from 'three/tsl';

const mat = new MeshStandardNodeMaterial();

mat.colorNode = vec3(
  sin(time).mul(0.5).add(0.5),
  cos(time.mul(2)).mul(0.5).add(0.5),
  float(0.8)
);

mat.positionNode = positionLocal.add(
  normalLocal.mul(sin(positionLocal.y.mul(10).add(time)).mul(0.1))
);
```

### TSL Uniforms (CPU-controlled parameters)

```js
const speed = uniform(1.0);

mat.colorNode = mix(
  color('#ff0000'),
  color('#0000ff'),
  uv().y.add(sin(time.mul(speed)).mul(0.1))
);

// Update from JS without recompiling shader:
speed.value = 2.0;
```

### TSL Built-in Variables

```js
positionLocal      // Object-space position (vec3)
positionWorld      // World-space position (vec3)
positionView       // Camera-space position (vec3)
normalLocal        // Object-space normal (vec3)
normalWorld        // World-space normal (vec3)
normalView         // Camera-space normal (vec3)
uv()               // UV coordinates (vec2)
uv(1)              // UV channel 2
vertexColor()      // Vertex color attribute
screenUV           // Screen UV (vec2)
time               // Elapsed seconds (float)
deltaTime          // Frame delta (float)
frameIndex         // Frame count (uint)
instanceIndex      // Current instance index (uint)
```

---

## 6. INSTANCING — Rendering Thousands of Objects

### InstancedMesh (Same Geometry + Material)

```js
const COUNT = 10_000;
const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

const matrix = new THREE.Matrix4();
const color = new THREE.Color();

for (let i = 0; i < COUNT; i++) {
  matrix.setPosition(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20
  );
  mesh.setMatrixAt(i, matrix);
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

const batched = new BatchedMesh(100, 50000, 100000, material);
const boxId = batched.addGeometry(new THREE.BoxGeometry(1, 1, 1));
const sphereId = batched.addGeometry(new THREE.SphereGeometry(0.5, 16, 8));

for (let i = 0; i < 50; i++) {
  const instanceId = batched.addInstance(i < 25 ? boxId : sphereId);
  matrix.setPosition(Math.random() * 10, 0, Math.random() * 10);
  batched.setMatrixAt(instanceId, matrix);
}
scene.add(batched);
```

---

## 7. LIGHTING — Rules & Performance

```js
// Cheapest to Most Expensive:
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
const hemi = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.5);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
dirLight.shadow.bias = -0.001;

const pointLight = new THREE.PointLight(0xff6600, 1, 10);
const spotLight = new THREE.SpotLight(0xffffff, 1);
```

### Performance Rules for Lighting

```js
// ✅ Keep shadow-casting lights <= 3
// ✅ Environment maps for free ambient PBR lighting
const envMap = new THREE.RGBELoader().load('hdr/studio.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});

// ✅ Disable shadow auto-update for static scenes
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;

// ✅ Bake lightmaps
material.lightMap = bakedLightMap;
material.lightMapIntensity = 1.0;
```

---

## 8. TEXTURES — Loading & Optimization

```js
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/textures/color.jpg');
texture.colorSpace = THREE.SRGBColorSpace;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 4);

// GLTF + Draco
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load('/models/scene.glb', (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(gltf.scene);
});

// KTX2 compressed textures
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
const ktx2Loader = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer);
const compressedTex = await ktx2Loader.loadAsync('/textures/color.ktx2');

// Color maps: SRGBColorSpace
// Normal/roughness/metalness/AO maps: NoColorSpace
texture.dispose(); // Always dispose when removing objects
```

---

## 9. ANIMATIONS — AnimationMixer & Keyframes

```js
let mixer;
const clock = new THREE.Clock();

gltfLoader.load('/model.glb', (gltf) => {
  scene.add(gltf.scene);
  mixer = new THREE.AnimationMixer(gltf.scene);

  const walkClip = THREE.AnimationClip.findByName(gltf.animations, 'Walk');
  const walkAction = mixer.clipAction(walkClip);
  walkAction.play();

  // Crossfade to run
  const runAction = mixer.clipAction(
    THREE.AnimationClip.findByName(gltf.animations, 'Run')
  );
  walkAction.fadeOut(0.5);
  runAction.reset().fadeIn(0.5).play();
});

// In animate loop:
const delta = clock.getDelta();
mixer?.update(delta);
```

### Custom Keyframe Animation

```js
const positionKF = new THREE.VectorKeyframeTrack(
  '.position',
  [0, 1, 2],
  [0, 0, 0,  0, 2, 0,  0, 0, 0]
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
const intersects = raycaster.intersectObjects(scene.children, true);

if (intersects.length > 0) {
  const hit = intersects[0];
  console.log('Hit:', hit.object.name);
  console.log('Point:', hit.point);
  console.log('Distance:', hit.distance);
}

// ✅ Fast raycasting for large scenes: npm install three-mesh-bvh
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;
geometry.computeBoundsTree();
```

---

## 11. POST-PROCESSING

### WebGL (EffectComposer)

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, 0.4, 0.85
));
composer.addPass(new SMAAPass(window.innerWidth, window.innerHeight));
// Use composer.render() instead of renderer.render() in loop
```

### WebGPU (Node Post-Processing)

```js
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { smaa } from 'three/addons/tsl/display/SMAANode.js';
import { pass } from 'three/tsl';

const scenePass = pass(scene, camera);
const bloomPass = bloom(scenePass.getTextureNode(), 1.5, 0.4, 0.85);
const smaaPass = smaa(bloomPass);
renderer.compute(bloomPass);
```

---

## 12. PERFORMANCE RULES — Critical Checklist

```js
// Target: under 100 draw calls per frame
console.log(renderer.info.render.calls);
console.log(renderer.info.render.triangles);
console.log(renderer.info.memory.geometries);
console.log(renderer.info.memory.textures);

// ❌ New objects in hot path
function animate() { const dir = new THREE.Vector3(); }

// ✅ Allocate once
const _dir = new THREE.Vector3();
function animate() { _dir.subVectors(target, mesh.position).normalize(); }

// Toggle visibility for frequent show/hide
mesh.visible = false; // GPU-culled, no CPU work

// Cap pixel ratio
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

---

## 13. COMPUTE SHADERS (WebGPU only)

```js
import { WebGPURenderer } from 'three/webgpu';
import { compute, instancedArray, instanceIndex, Fn } from 'three/tsl';

const COUNT = 100_000;
const positions = instancedArray(COUNT, 'vec3');
const velocities = instancedArray(COUNT, 'vec3');

const updateParticles = Fn(() => {
  const pos = positions.element(instanceIndex);
  const vel = velocities.element(instanceIndex);
  positions.element(instanceIndex).assign(pos.add(vel.mul(deltaTime)));
})().compute(COUNT);

await renderer.computeAsync(updateParticles);

function animate() {
  renderer.compute(updateParticles);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
```

---

## 14. MATH UTILITIES — Common Patterns

```js
THREE.MathUtils.lerp(0, 1, 0.5);
THREE.MathUtils.clamp(1.5, 0, 1);
THREE.MathUtils.degToRad(90);
THREE.MathUtils.randFloat(-1, 1);
THREE.MathUtils.mapLinear(0.5, 0, 1, 100, 200);

const dir = new THREE.Vector3()
  .subVectors(targetPos, mesh.position)
  .normalize()
  .multiplyScalar(speed);

// Quaternion (avoids Euler gimbal lock)
const quat = new THREE.Quaternion();
quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
mesh.quaternion.slerp(quat, 0.1);

// Bounding box
const box = new THREE.Box3().setFromObject(mesh);
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());
```

---

## 15. DEBUGGING TOOLS

```js
scene.add(new THREE.GridHelper(20, 20));
scene.add(new THREE.AxesHelper(5));
scene.add(new THREE.BoxHelper(mesh, 0xffff00));
scene.add(new THREE.CameraHelper(shadowLight.shadow.camera));

// npm install stats.js
import Stats from 'stats.js';
const stats = new Stats();
document.body.appendChild(stats.dom);

// npm install lil-gui
import GUI from 'lil-gui';
const gui = new GUI();
gui.add(material, 'metalness', 0, 1);
gui.add(material, 'roughness', 0, 1);
gui.addColor(material, 'color');
```

---

## 16. ANGULAR SIGNALS + THREE.JS — Reactive Patterns

```typescript
import { Component, signal, effect, computed, inject, NgZone } from '@angular/core';

@Component({ ... })
export class SceneComponent implements AfterViewInit {
  private selectedObject = signal<string | null>(null);
  private isLoading = signal(true);
  objectCount = computed(() => this.scene?.children.length ?? 0);

  readonly selected = this.selectedObject.asReadonly();
  readonly loading = this.isLoading.asReadonly();

  private ngZone = inject(NgZone);
  private mesh!: THREE.Mesh;

  color = input<string>('#ff6600');

  constructor() {
    effect(() => {
      const mat = this.mesh?.material as THREE.MeshStandardMaterial;
      mat?.color.set(this.color());
    });
  }

  private onCanvasClick(e: MouseEvent): void {
    const hit = this.performRaycast(e);
    if (hit) {
      this.ngZone.run(() => this.selectedObject.set(hit.object.name));
    }
  }

  private async loadModel(): Promise<void> {
    this.ngZone.run(() => this.isLoading.set(true));
    try {
      const gltf = await this.gltfLoader.loadAsync('/assets/model.glb');
      this.scene.add(gltf.scene);
    } finally {
      this.ngZone.run(() => this.isLoading.set(false));
    }
  }
}
```

```html
<!-- scene.component.html -->
<div class="scene-wrapper">
  <canvas #canvas></canvas>
  @if (loading()) {
    <div class="loader">Loading 3D model...</div>
  }
  @if (selected()) {
    <div class="selection-badge">Selected: {{ selected() }}</div>
  }
</div>
```

---

## 17. COMMON MISTAKES TO AVOID

```typescript
// ❌ ngOnInit — canvas is null here
ngOnInit() { this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement }); }
// ✅ Use ngAfterViewInit or afterNextRender

// ❌ Render loop inside zone — 60 CD cycles/second!
ngAfterViewInit() {
  const loop = () => { requestAnimationFrame(loop); this.renderer.render(this.scene, this.camera); };
  loop();
}
// ✅ this.ngZone.runOutsideAngular(() => { loop(); });

// ❌ No context cleanup — WebGL context leak
ngOnDestroy() { this.scene = null; }
// ✅ cancelAnimationFrame + renderer.dispose() + renderer.forceContextLoss()

// ❌ document.body.appendChild(renderer.domElement) — breaks SSR and Angular tree
// ✅ Use <canvas #canvas> in template, pass to WebGLRenderer({ canvas })

// ❌ window resize listener without cleanup
ngAfterViewInit() { window.addEventListener('resize', this.onResize); }
// ✅ Use ResizeObserver + disconnect in ngOnDestroy

// ❌ No SSR guard
ngAfterViewInit() { this.renderer = new THREE.WebGLRenderer(); }
// ✅ if (!isPlatformBrowser(this.platformId)) return;

// ❌ Public Three.js properties bound in templates
public mesh: THREE.Mesh; // Angular diffs this object graph — errors and lag
// ✅ All Three.js state must be private

// ❌ Allocating in the animate loop
const loop = () => { const dir = new THREE.Vector3(); };
// ✅ private _dir = new THREE.Vector3(); // outside loop

// ❌ Missing needsUpdate after setMatrixAt
mesh.setMatrixAt(i, matrix);
// ✅ mesh.instanceMatrix.needsUpdate = true;

// ❌ Not awaiting WebGPURenderer.init()
const renderer = new WebGPURenderer();
renderer.render(scene, camera); // Fails silently!

// ❌ Uncapped pixel ratio
renderer.setPixelRatio(window.devicePixelRatio);
// ✅ renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

---

## 18. IMPORT PATTERNS — Modern Three.js

```js
// ✅ Tree-shakeable (preferred)
import { Scene, PerspectiveCamera, Mesh, BoxGeometry } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// ✅ WebGPU entrypoint
import { WebGPURenderer, MeshStandardNodeMaterial } from 'three/webgpu';
import { color, time, sin, uv, Fn, uniform } from 'three/tsl';

// ⚠️ Namespace import (larger bundle, OK for prototypes)
import * as THREE from 'three';
```

---

## 19. QUICK REFERENCE — What Class Does What

| Task | Class/Function |
|---|---|
| Scene graph root | THREE.Scene |
| Perspective view | THREE.PerspectiveCamera(fov, aspect, near, far) |
| Isometric/CAD view | THREE.OrthographicCamera(l, r, t, b, near, far) |
| GPU output | WebGPURenderer (new) or THREE.WebGLRenderer |
| 3D Object base | THREE.Object3D |
| Mesh (visible) | THREE.Mesh(geometry, material) |
| Line (1D) | THREE.Line(geometry, material) |
| Points (particles) | THREE.Points(geometry, material) |
| Sprite (billboard) | THREE.Sprite(material) |
| Group (empty) | THREE.Group() |
| Repeated objects | THREE.InstancedMesh(geo, mat, count) |
| Mouse to 3D | THREE.Raycaster |
| Easing/lerp | THREE.MathUtils |
| Animation system | THREE.AnimationMixer |
| Load GLTF | GLTFLoader (addons) |
| Load images | THREE.TextureLoader |
| Load HDR | RGBELoader (addons) |
| Camera orbit | OrbitControls (addons) |
| First-person | PointerLockControls (addons) |
| Node shader | TSL from 'three/tsl' |
| GPU compute | renderer.compute(computeNode) |

---

## 20. SKILL ACTIVATION EXAMPLES

- "Create a rotating 3D cube in Angular"
- "Build a Three.js component in Angular"
- "Set up WebGPU renderer in an Angular service"
- "Load and display a GLTF model in Angular"
- "Write a custom GLSL/TSL shader"
- "Make a raycasting mouse picker in Angular"
- "Optimize draw calls with InstancedMesh"
- "Add bloom post-processing"
- "Animate a skinned mesh"
- "Create procedural terrain"
- "Build a 3D product configurator in Angular"
- "NgZone and Three.js render loop"
- "How to dispose Three.js in ngOnDestroy"
- "Three.js with Angular signals"
- "SSR-safe Three.js component"
- "Three.js service in Angular"
