---
name: threejs-topology-diagram
description: >
  Use this skill when building isometric 3D network/topology/architecture diagrams using
  Three.js inside an Angular project. Triggers on: "topology diagram", "network diagram",
  "architecture diagram", "infrastructure diagram", "isometric diagram", "3D network map",
  "node graph", "system diagram", "cloud architecture diagram", "data flow diagram",
  "blockchain diagram", "IT infrastructure", "isometric nodes", "connected nodes",
  "diagram with arrows", "flow diagram 3D". Always combine with the threejs skill for
  Angular integration patterns (NgZone, AfterViewInit, OnDestroy, forceContextLoss).
depends_on: threejs (Angular Edition)
version: "1.0.0"
visual_reference: "Isometric topology diagrams — dark navy platform nodes, connecting
  arrows, floating icons above platforms, gold/orange accent coins/highlights,
  white background, orthographic isometric camera"
knowledge_cutoff: "March 2026"
---

# Three.js Isometric Topology Diagram Skill

This skill defines how to build interactive isometric topology/network/architecture diagrams
in Three.js + Angular that match the visual style of the reference images:
dark navy blue floating platform nodes, connector lines with directional arrows,
floating 3D icons on platforms, orthographic isometric camera, clean white background.

Always read the threejs skill alongside this one for Angular lifecycle rules.

---

## 1. VISUAL DESIGN LANGUAGE — The Exact Style

### 1.1 Color Palette

```typescript
const PALETTE = {
  platformTop:      0x1a3a6e,  // Deep navy blue — top face
  platformSide:     0x0f2347,  // Darker navy — side faces (shadow)
  platformEdge:     0x2a4f8f,  // Lighter navy — front-left edge highlight
  background:       0xffffff,  // Pure white
  backgroundGrid:   0xf0f4f8,  // Very light blue-grey for subtle grid
  connectorDefault: 0x1a3a6e,  // Navy — solid lines
  connectorActive:  0xf5a623,  // Warm orange/gold — highlighted flow paths
  connectorDashed:  0xe8388a,  // Pink/magenta — dashed secondary connections
  accentGold:       0xf5c842,  // Gold coins / highlights
  accentOrange:     0xf5a623,  // Orange accent — active flows, cloud icons
  accentCyan:       0x00d4ff,  // Cyan/teal — glowing tech icons
  accentRed:        0xe53935,  // Red — alert nodes / important hubs
  iconBgBlue:       0x1565c0,
  iconBgOrange:     0xf57c00,
  iconBgRed:        0xc62828,
  cubeNavy:         0x1a3a6e,
  cubeWhite:        0xf0f4f8,
  cubeYellow:       0xfdd835,
};
```

### 1.2 Platform Node Geometry

```typescript
const PLATFORM = {
  width:  2.4,   height: 0.35,  depth:  2.4,   // standard
  hubWidth:  3.2, hubHeight: 0.45, hubDepth:  3.2,
  miniWidth: 1.6, miniHeight: 0.25, miniDepth: 1.6,
};

function createPlatform(width = 2.4, height = 0.35, depth = 2.4): THREE.Group {
  const group = new THREE.Group();

  // Top face — bright navy
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(width, height * 0.15, depth),
    new THREE.MeshLambertMaterial({ color: PALETTE.platformTop })
  );
  top.position.y = height * 0.425;

  // Main body — darker
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.98, height * 0.85, depth * 0.98),
    new THREE.MeshLambertMaterial({ color: PALETTE.platformSide })
  );

  // Front-left edge highlight
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.04, height, depth),
    new THREE.MeshLambertMaterial({ color: PALETTE.platformEdge })
  );
  edge.position.set(-width / 2 + 0.04, 0, 0);

  // Drop shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 1.1, depth * 1.1),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.08, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -height / 2 - 0.01;

  group.add(top, body, edge, shadow);
  return group;
}
```

### 1.3 Camera — Isometric Orthographic

```typescript
function createIsometricCamera(width: number, height: number, frustumSize = 20): THREE.OrthographicCamera {
  const aspect = width / height;
  const camera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2,
     frustumSize * aspect / 2,
     frustumSize / 2,
    -frustumSize / 2,
    0.1, 1000
  );
  // TRUE isometric: equal distance on X, Y, Z from origin
  camera.position.set(20, 16, 20);
  camera.lookAt(0, 0, 0);
  return camera;
}

// Resize — update frustum planes, NOT position
function resizeOrthographic(camera: THREE.OrthographicCamera, w: number, h: number, fs = 20): void {
  const aspect = w / h;
  camera.left = -fs * aspect / 2;  camera.right = fs * aspect / 2;
  camera.top  =  fs / 2;           camera.bottom = -fs / 2;
  camera.updateProjectionMatrix();
}
```

### 1.4 Connector Lines & Arrows

```typescript
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

type ConnectorStyle = 'solid' | 'dashed' | 'highlighted';

function createConnector(config: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  style: ConnectorStyle;
  animated?: boolean;
  bidirectional?: boolean;
}): THREE.Group {
  const { from, to, style } = config;
  const group = new THREE.Group();

  // L-shaped elbow routing — never diagonal
  const mid = new THREE.Vector3(to.x, from.y, from.z);

  const color = style === 'highlighted' ? PALETTE.connectorActive
              : style === 'dashed'      ? PALETTE.connectorDashed
              : PALETTE.connectorDefault;

  if (style === 'dashed') {
    [from, mid, to].forEach((p, i, arr) => {
      if (i === 0) return;
      const pts = [arr[i - 1], p];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.2, gapSize: 0.15 });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      group.add(line);
    });
  } else {
    // Thick lines via Line2
    const lineWidth = style === 'highlighted' ? 3 : 1.5;
    [[from, mid], [mid, to]].forEach(([a, b]) => {
      const geo = new LineGeometry();
      geo.setPositions([a.x, a.y, a.z, b.x, b.y, b.z]);
      const mat = new LineMaterial({
        color, linewidth: lineWidth,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      });
      group.add(new Line2(geo, mat));
    });
  }

  // Arrowhead cone at destination
  const dir = new THREE.Vector3().subVectors(to, mid).normalize();
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.25, 6),
    new THREE.MeshLambertMaterial({ color })
  );
  cone.position.copy(to);
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  group.add(cone);

  if (config.bidirectional) {
    const dir2 = new THREE.Vector3().subVectors(from, mid).normalize();
    const cone2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.25, 6),
      new THREE.MeshLambertMaterial({ color })
    );
    cone2.position.copy(from);
    cone2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir2);
    group.add(cone2);
  }

  return group;
}
```

---

## 2. NODE TYPES — Icon Implementations

```typescript
type NodeType = 'server' | 'database' | 'laptop' | 'desktop' | 'router'
  | 'cloud' | 'security' | 'document' | 'hub' | 'coin' | 'cube-cluster' | 'chart' | 'atom';

const ICON_SCALE  = 0.55;
const ICON_Y_OFFSET = 0.4;

function createServerIcon(): THREE.Group {
  const g = new THREE.Group();
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.1, 0.35),
    new THREE.MeshLambertMaterial({ color: 0xd0d8e8 })
  );
  for (let i = 0; i < 5; i++) {
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.06, 0.02),
      new THREE.MeshLambertMaterial({ color: 0x2a3550 })
    );
    slot.position.set(0, 0.35 - i * 0.18, 0.18);
    g.add(slot);
  }
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ff88 })
  );
  led.position.set(0.2, 0.45, 0.18);
  g.add(chassis, led);
  return g;
}

function createDatabaseIcon(): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const disk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16),
      new THREE.MeshLambertMaterial({ color: i === 2 ? 0x2a5090 : 0x1a3a6e })
    );
    disk.position.y = i * 0.24;
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.025, 8, 16),
      new THREE.MeshLambertMaterial({ color: 0x4a7abf })
    );
    rim.position.y = i * 0.24 + 0.1;
    rim.rotation.x = Math.PI / 2;
    g.add(disk, rim);
  }
  return g;
}

function createLaptopIcon(): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.06, 0.55),
    new THREE.MeshLambertMaterial({ color: 0x2a3550 })
  );
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.52, 0.04),
    new THREE.MeshLambertMaterial({ color: 0x1a2540 })
  );
  screen.position.set(0, 0.28, -0.22);
  screen.rotation.x = -Math.PI * 0.22;
  const content = new THREE.Mesh(
    new THREE.PlaneGeometry(0.64, 0.44),
    new THREE.MeshBasicMaterial({ color: 0x1565c0 })
  );
  content.position.set(0, 0.28, -0.2);
  content.rotation.x = -Math.PI * 0.22;
  g.add(base, screen, content);
  return g;
}

function createCloudIcon(color = PALETTE.accentOrange): THREE.Group {
  const g = new THREE.Group();
  [
    { x: 0, y: 0, r: 0.28 }, { x: -0.2, y: -0.05, r: 0.22 },
    { x: 0.2, y: -0.05, r: 0.22 }, { x: -0.1, y: 0.1, r: 0.2 }, { x: 0.1, y: 0.1, r: 0.2 },
  ].forEach(p => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(p.r, 12, 12), new THREE.MeshLambertMaterial({ color }));
    s.position.set(p.x, p.y, 0);
    g.add(s);
  });
  return g;
}

function createShieldIcon(): THREE.Group {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.4); shape.lineTo(0.3, 0.3); shape.lineTo(0.3, 0);
  shape.lineTo(0, -0.4); shape.lineTo(-0.3, 0); shape.lineTo(-0.3, 0.3);
  shape.closePath();
  const shield = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false }),
    new THREE.MeshLambertMaterial({ color: PALETTE.accentCyan })
  );
  shield.position.z = -0.05;
  const lock = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.12, 0.06),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  lock.position.set(0, -0.05, 0.08);
  g.add(shield, lock);
  return g;
}

function createHubIcon(): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: PALETTE.platformEdge });
  g.add(
    new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.2), mat),
    new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), mat),
    new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshLambertMaterial({ color: PALETTE.accentCyan }))
  );
  return g;
}

function createCubeCluster(): THREE.Group {
  const g = new THREE.Group();
  const s = 0.22;
  const colors: Record<string, number> = { navy: PALETTE.cubeNavy, white: PALETTE.cubeWhite, yellow: PALETTE.cubeYellow };
  ([
    [0, 0, 0, 'navy'], [s, 0, 0, 'white'], [0, s, 0, 'white'],
    [s, s, 0, 'navy'], [s/2, s/2, s, 'yellow'], [s*1.5, 0, 0, 'navy'], [0, s*2, 0, 'yellow'],
  ] as [number, number, number, string][]).forEach(([x, y, z, c]) => {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), new THREE.MeshLambertMaterial({ color: colors[c] }));
    cube.position.set(x - s, y, z);
    g.add(cube);
  });
  return g;
}
```

---

## 3. SCENE COMPOSITION

### Grid-Based Placement

```typescript
const GRID = { cellSize: 4.5, yBase: 0 };

function gridToWorld(gridX: number, gridZ: number): THREE.Vector3 {
  return new THREE.Vector3(gridX * GRID.cellSize, GRID.yBase, gridZ * GRID.cellSize);
}
```

### Node Label (Billboard Sprite)

```typescript
function createNodeLabel(text: string, position: THREE.Vector3): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(10,25,60,0.75)';
  ctx.roundRect(4, 4, 248, 56, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
  sprite.scale.set(2.2, 0.55, 1);
  sprite.position.copy(position);
  sprite.position.y -= 0.8;
  return sprite;
}
```

---

## 4. LIGHTING RECIPE

```typescript
// 1. Ambient — fills scene, prevents harsh shadows
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

// 2. Key light — top-right, creates three-tone platform face differentiation
const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
keyLight.position.set(10, 20, 10);
keyLight.castShadow = true;
scene.add(keyLight);

// 3. Fill light — front-left, slight blue tint, softens left platform faces
const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.3);
fillLight.position.set(-10, 5, 10);
scene.add(fillLight);

// RESULT: Top = bright navy, left = dark navy, right = medium navy
// This three-tone shading IS the isometric look.

// Never use: PointLight, SpotLight, HemisphereLight, environment maps
```

---

## 5. ANIMATION PATTERNS

```typescript
// Floating icon animation — subtle sine wave, different phase per node
const t = clock.elapsedTime;
nodeMap.forEach(group => {
  const icon = group.children[1];
  if (icon) icon.position.y = ICON_Y_OFFSET + Math.sin(t * 1.2 + group.position.x * 0.5) * 0.06;
});

// Animated connector flow — march dash offset
animatedConnectors.forEach(ac => {
  ac.offset -= delta * 0.8;
  ac.material.dashOffset = ac.offset;
});

// Hover highlight — lift + lighten
function highlightNode(group: THREE.Group, active: boolean): void {
  group.traverse(child => {
    if (child instanceof THREE.Mesh) {
      const mat = child.material as THREE.MeshLambertMaterial;
      if (active) {
        child.userData['originalColor'] = mat.color.getHex();
        mat.color.set(0x2a5090);
        group.position.y = 0.12;
      } else {
        mat.color.set(child.userData['originalColor'] ?? PALETTE.platformTop);
        group.position.y = 0;
      }
    }
  });
}
```

---

## 6. USAGE EXAMPLE

```typescript
topologyData: TopologyData = {
  nodes: [
    { id: 'cloud-azure', type: 'cloud',    label: 'Azure',        gridX: 0,  gridZ: -2, size: 'hub' },
    { id: 'datacenter',  type: 'database', label: 'Data Center',  gridX: 0,  gridZ: 0  },
    { id: 'app-a',       type: 'server',   label: 'Application A', gridX: 2, gridZ: 0  },
    { id: 'remote-user', type: 'laptop',   label: 'Remote Users', gridX: -2, gridZ: 1  },
    { id: 'vpn',         type: 'security', label: 'VPN',          gridX: 0,  gridZ: 2  },
    { id: 'edge',        type: 'database', label: 'Edge Network', gridX: -2, gridZ: 3,  size: 'hub' },
  ],
  edges: [
    { from: 'cloud-azure', to: 'datacenter',  style: 'solid' },
    { from: 'datacenter',  to: 'app-a',       style: 'highlighted', animated: true },
    { from: 'remote-user', to: 'vpn',         style: 'dashed' },
    { from: 'vpn',         to: 'datacenter',  style: 'solid' },
    { from: 'edge',        to: 'datacenter',  style: 'highlighted' },
  ]
};
```

---

## 7. DO / DON'T VISUAL RULES

### Always
- OrthographicCamera — never PerspectiveCamera
- All platforms at y = 0 (same ground plane)
- Connectors routed with 90-degree elbows — never diagonal
- MeshLambertMaterial on platforms — flat shaded look
- Strict PALETTE color constants
- Floating animation on icons (sine wave, ±0.06 units)
- THREE.Sprite for labels — always faces camera
- Data-driven component via TopologyData interface
- Canvas getBoundingClientRect() for raycaster pointer, never window size
- LineMaterial.resolution update on canvas resize

### Never
- PerspectiveCamera — destroys isometric illusion
- Diagonal free connectors — always elbow routing
- Camera rotation in OrbitControls — pan + zoom only
- MeshStandardMaterial or MeshPhysicalMaterial on platforms — too shiny
- Labels inside platform boxes — always below/beside
- Colors outside PALETTE constants
- window.innerWidth/Height for pointer coords
- Skip forceContextLoss() in ngOnDestroy

---

## 8. ANGULAR INTEGRATION SPECIFICS

```typescript
// OrthographicCamera resize — update frustum planes, NOT camera position
resizeObserver = new ResizeObserver(() => {
  const { clientWidth: w, clientHeight: h } = canvas;
  const aspect = w / h; const fs = frustumSize;
  camera.left = -fs * aspect / 2;  camera.right = fs * aspect / 2;
  camera.top  =  fs / 2;           camera.bottom = -fs / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  // Update Line2 material resolution
  connectorGroup.traverse(obj => {
    if (obj instanceof Line2) (obj.material as LineMaterial).resolution.set(w, h);
  });
});

// Disable orbit rotation to preserve isometric
controls.enableRotate = false;
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };

// Use AbortController for clean event listener teardown
const controller = new AbortController();
canvas.addEventListener('pointermove', handler, { signal: controller.signal });
canvas.addEventListener('click', handler, { signal: controller.signal });
// In ngOnDestroy: controller.abort();
```

---

## 9. SKILL ACTIVATION EXAMPLES

- "Create a network topology diagram like the reference images"
- "Build an isometric infrastructure diagram in Angular Three.js"
- "Show cloud architecture with Azure and AWS nodes connected"
- "Make an IT network map with servers, laptops, VPN and firewall nodes"
- "Blockchain flow diagram with isometric platform nodes"
- "3D data flow diagram with animated connectors"
- "Topology diagram with hoverable clickable nodes"
- "Isometric diagram — dark navy platforms, white background, orange highlighted connections"
