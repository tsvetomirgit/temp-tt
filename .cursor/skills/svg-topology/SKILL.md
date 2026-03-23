---
name: svg-topology
description:  Create beautiful isometric SVG topology diagrams — network maps, infrastructure diagrams, system architecture, cloud topology, blockchain/data flow, and any technical diagram with  connected nodes. Use this skill whenever the user asks to draw, design, visualize, or  diagram: networks, servers, cloud infrastructure, system architecture, data pipelines,  blockchain flows, IoT topology, office/campus maps, or any set of connected components.  Trigger on keywords like: topology, network diagram, infrastructure diagram, architecture  diagram, SVG diagram, isometric diagram, system map, connection map. Always use this skill  when visuals would communicate structure better than words — don't just describe, DRAW IT.
---

# SVG Topology Diagram Skill

This skill produces stunning **isometric SVG topology diagrams** — richly styled, spatially
composed, visually memorable technical diagrams that look like polished design work, not
auto-generated boxes and arrows.

---

## Visual Style Reference

The target aesthetic (derived from reference images):

| Attribute | Target Style |
|---|---|
| **Projection** | True isometric (30° / `skewX(-30) scaleY(0.866)` or cabinet projection) |
| **Node bases** | 3D platform "tiles" — dark navy top face, medium navy right face, deep navy left face |
| **Accent colors** | Gold/amber `#F5A623`, electric blue `#4A9EFF`, cyan `#00D4FF`, red `#E63946` |
| **Connections** | Directional arrows; **orthogonal (Manhattan) polylines** along SVG **x/y** by default — only horizontal + vertical segments; dashed/solid by flow type |
| **Icons** | Flat or slightly 3D glyphs on top face of each tile (server rack, laptop, cloud, shield…) |
| **Labels** | Clean sans-serif below/beside each node; white or dark on light backgrounds |
| **Background** | White or very light grey (`#F8F9FC`); no heavy gradients |
| **Shadows** | Subtle `drop-shadow` filters on tiles for lift |
| **Animation** | Signal pulses along connections (see animation skill) |

---

## Geometry Fundamentals

### Isometric Tile (the base platform)

Each node sits on a hexagonal "tile" made of three rhombus faces:

```svg
<!-- Top face (lighter navy) -->
<polygon points="0,-H  W/2,0  0,H  -W/2,0" fill="#1E3A5F"/>
<!-- Right face (medium navy) -->
<polygon points="W/2,0  W/2,H+D  0,H+D  0,H" fill="#152C4A"/>
<!-- Left face (darkest navy) -->
<polygon points="0,H  0,H+D  -W/2,H+D  -W/2,0" fill="#0D1E30"/>
```

Typical tile sizes:
- **Small** node: W=60, H=20, D=14
- **Medium** node: W=90, H=28, D=18
- **Large** hub: W=120, H=36, D=22

### Isometric Coordinate Mapping

Place nodes on an isometric grid. Convert grid (col, row) to SVG (x, y):

```js
function isoPos(col, row, tileW=90, tileH=28) {
  const x = (col - row) * (tileW / 2);
  const y = (col + row) * (tileH / 2);
  return { x, y };
}
```

Offset the entire diagram with a `transform="translate(cx, cy)"` to center in the viewport.

---

## Node Types & Icons

Use `<symbol>` + `<use>` for reusable icons. Place each icon centered over the top face.

### Icon Library (inline SVG symbols)

```svg
<defs>
  <!-- Server rack -->
  <symbol id="icon-server" viewBox="-16 -20 32 36">
    <rect x="-10" y="-18" width="20" height="28" rx="2" fill="#4A9EFF" opacity="0.9"/>
    <rect x="-8" y="-15" width="16" height="3" rx="1" fill="#fff" opacity="0.6"/>
    <rect x="-8" y="-10" width="16" height="3" rx="1" fill="#fff" opacity="0.6"/>
    <rect x="-8" y="-5"  width="16" height="3" rx="1" fill="#fff" opacity="0.6"/>
    <circle cx="6" cy="-14" r="1.5" fill="#00D4FF"/>
    <circle cx="6" cy="-9"  r="1.5" fill="#F5A623"/>
  </symbol>

  <!-- Laptop -->
  <symbol id="icon-laptop" viewBox="-18 -14 36 28">
    <rect x="-14" y="-12" width="28" height="18" rx="2" fill="#2C5282"/>
    <rect x="-12" y="-10" width="24" height="14" rx="1" fill="#4A9EFF" opacity="0.7"/>
    <rect x="-16" y="7"   width="32" height="3"  rx="1" fill="#1A365D"/>
  </symbol>

  <!-- Cloud -->
  <symbol id="icon-cloud" viewBox="-20 -14 40 28">
    <ellipse cx="0"  cy="2" rx="16" ry="9" fill="#4A9EFF" opacity="0.85"/>
    <ellipse cx="-6" cy="-2" rx="10" ry="8" fill="#4A9EFF"/>
    <ellipse cx="6"  cy="-4" rx="9"  ry="7" fill="#4A9EFF"/>
    <ellipse cx="0"  cy="-6" rx="8"  ry="7" fill="#60AFF5"/>
  </symbol>

  <!-- Shield (security) -->
  <symbol id="icon-shield" viewBox="-14 -16 28 32">
    <path d="M0,-14 L12,-7 L12,4 Q12,12 0,16 Q-12,12 -12,4 L-12,-7 Z"
          fill="#00D4FF" opacity="0.9"/>
    <path d="M0,-8 L5,3 L0,8 L-5,3 Z" fill="#fff" opacity="0.7"/>
  </symbol>

  <!-- Database -->
  <symbol id="icon-database" viewBox="-14 -16 28 32">
    <ellipse cx="0" cy="-10" rx="12" ry="5" fill="#F5A623"/>
    <rect x="-12" y="-10" width="24" height="16" fill="#E8940A"/>
    <ellipse cx="0" cy="6"  rx="12" ry="5" fill="#F5A623"/>
    <ellipse cx="0" cy="-2" rx="12" ry="5" fill="#F5B83A" opacity="0.7"/>
  </symbol>

  <!-- Router/switch -->
  <symbol id="icon-router" viewBox="-16 -10 32 20">
    <rect x="-14" y="-6" width="28" height="12" rx="3" fill="#E63946"/>
    <circle cx="-6" cy="0" r="2" fill="#fff" opacity="0.8"/>
    <circle cx="0"  cy="0" r="2" fill="#fff" opacity="0.8"/>
    <circle cx="6"  cy="0" r="2" fill="#fff" opacity="0.8"/>
    <line x1="-10" y1="-6" x2="-10" y2="-11" stroke="#fff" stroke-width="1.5"/>
    <line x1="0"   y1="-6" x2="0"   y2="-11" stroke="#fff" stroke-width="1.5"/>
    <line x1="10"  y1="-6" x2="10"  y2="-11" stroke="#fff" stroke-width="1.5"/>
  </symbol>

  <!-- IoT device -->
  <symbol id="icon-iot" viewBox="-14 -14 28 28">
    <circle cx="0" cy="0" r="8" fill="#9F7AEA"/>
    <path d="M-12,-8 Q-16,0 -12,8" fill="none" stroke="#9F7AEA" stroke-width="2" opacity="0.6"/>
    <path d="M12,-8  Q16,0  12,8"  fill="none" stroke="#9F7AEA" stroke-width="2" opacity="0.6"/>
    <path d="M-8,-12 Q-12,0 -8,12" fill="none" stroke="#9F7AEA" stroke-width="2" opacity="0.3"/>
    <path d="M8,-12  Q12,0  8,12"  fill="none" stroke="#9F7AEA" stroke-width="2" opacity="0.3"/>
  </symbol>

  <!-- Firewall -->
  <symbol id="icon-firewall" viewBox="-14 -16 28 32">
    <path d="M0,-14 Q8,-10 8,0 Q8,12 0,14 Q-8,12 -8,0 Q-8,-10 0,-14Z"
          fill="#E63946" opacity="0.9"/>
    <path d="M-2,-6 Q4,-4 2,4 Q-2,2 -2,-6Z" fill="#F5A623"/>
    <path d="M-5,0  Q0,-2 0,6  Q-6,4 -5,0Z" fill="#FFD166" opacity="0.8"/>
  </symbol>
</defs>
```

---

## Connection Lines

### Orthogonal routing (default)

For presentation-ready network and architecture diagrams, model links as **axis-aligned**
polylines in SVG user space: segments must be purely **horizontal** (constant `y`) or
**vertical** (constant `x`). This is often called **Manhattan** or **rectangular** routing.

- Use a single `<path>` with **`M`** (move) + one or more **`L`** (line) commands — no
  diagonal segments unless the user explicitly asks for curved or “shortest chord” links.
- Typical shapes: **L** (one elbow), **Z** or **U** (two or more elbows) when avoiding nodes.
- Pick **waypoints** (shared `x` or `y` values) so lines run in “channels” between tiles.
- End the path at the **destination** so `marker-end` aligns with the **last segment**
  (arrow points along the final horizontal or vertical run).
- Use `stroke-linecap="round"` and `stroke-linejoin="round"` unless a sharper corner is required.

```svg
<!-- L-shape: go horizontal first, then vertical (arrow follows last segment) -->
<path id="conn-a-b"
      d="M 520 118 L 320 118 L 320 248"
      fill="none" stroke="#1E3A5F" stroke-width="2.2"
      stroke-linecap="round" stroke-linejoin="round"
      marker-end="url(#arrow-navy)"/>

<!-- Z-shape: two bends via a shared corridor y = 360 -->
<path id="conn-c-d"
      d="M 450 398 L 450 360 L 650 360 L 650 308"
      fill="none" stroke="#F5A623" stroke-width="2"
      stroke-dasharray="8 5"
      marker-end="url(#arrow-orange)"/>
```

**When to use curves:** Cubic Béziers (`C`) are optional for sketch-style or organic maps.
If the user asks for **rectangular**, **orthogonal**, **grid**, **Manhattan**, or **axis-aligned**
links, **do not** use diagonal single-segment or Bézier shortcuts — use polylines only.

### Connection Styles (stroke semantics)

```svg
<!-- Primary flow: solid gold arrow (orthogonal example) -->
<path d="M x1 y1 L xm y1 L xm y2 L x2 y2"
      fill="none" stroke="#F5A623" stroke-width="2"
      marker-end="url(#arrow-gold)"/>

<!-- Secondary: dashed blue -->
<path d="M x1 y1 L x2 y1 L x2 y2"
      fill="none" stroke="#4A9EFF" stroke-width="1.5"
      stroke-dasharray="6,4"
      marker-end="url(#arrow-blue)"/>

<!-- Dotted red (warning/blocked) -->
<path d="M x1 y1 L x2 y1 L x2 y2"
      fill="none" stroke="#E63946" stroke-width="1.5"
      stroke-dasharray="3,4" opacity="0.8"/>
```

### Arrowhead Markers

```svg
<defs>
  <marker id="arrow-gold" markerWidth="8" markerHeight="8"
          refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L8,3 Z" fill="#F5A623"/>
  </marker>
  <marker id="arrow-blue" markerWidth="8" markerHeight="8"
          refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L8,3 Z" fill="#4A9EFF"/>
  </marker>
  <marker id="arrow-red" markerWidth="8" markerHeight="8"
          refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L8,3 Z" fill="#E63946"/>
  </marker>
</defs>
```

### Routing rules (orthogonal)

- **Same row or column**: a single horizontal or vertical segment if endpoints align; otherwise
  use one elbow (**L**): e.g. horizontal to shared `x`, then vertical to target `y` (or the reverse).
- **Different quadrants**: use **two or more segments** with waypoints on “bus” lines
  (shared `y` or `x`) so paths stay in corridors and do not cut through tile bodies.
- **Long distance**: add intermediate points so each segment remains axis-aligned; prefer
  routing **around** dense groups rather than one long diagonal.
- Attach to the **edge** of the logical node position (slightly inset from tile centers) so
  links do not originate from the middle of a platform.
- **Overlap**: offset parallel links by 8–16px on the shared bus (different `y` or `x`) so
  strokes do not sit on top of each other.

---

## Drop Shadow Filter

Apply to all tile groups for lift effect:

```svg
<defs>
  <filter id="tile-shadow" x="-20%" y="-20%" width="140%" height="150%">
    <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#00000030"/>
  </filter>
</defs>

<!-- Usage: wrap only the tile + icon — not the label plate (see Label styling section) -->
<g filter="url(#tile-shadow)">
  <!-- tile polygons + icon -->
</g>
```

---

## Label styling and legibility (required)

Labels sit **below** the isometric tile. Connection lines are drawn in a layer **under** the
whole `#nodes` group, but strokes still show **through** transparent areas — including the
band where titles sit — unless you block them.

### Rule: opaque “label plate” behind every primary label

For each node, **do not** put bare `<text>` over empty background. Add a **rounded rectangle**
behind the label (and behind any sublabel) so links and animated signal dots cannot obscure
typography:

- **Fill:** diagram background color, typically `#FFFFFF` (or match `svg` / canvas background).
- **Stroke:** very light border, e.g. `#E2E8F0` at `0.75px`, for a subtle pill edge.
- **Geometry:** `rx` / `ry` around `4–5`; width tuned per string (longer names need wider rects);
  height ~`16–20px`; position so the box wraps the cap height and descenders (baseline ~`y=56`
  for `font-size=11`).
- **Paint order:** draw the rect **after** the tile + icon, **before** the `<text>` so the
  text paints on top.

### Split tile shadow from labels

Apply **`filter="url(#tile-shadow)"` only** to the subgraph that contains the three tile
polygons and the icon — **not** to the label plate. If the outer node `<g>` has the filter,
the plate inherits a drop shadow and looks muddy. Structure:

```svg
<g transform="translate(cx, cy)">
  <g filter="url(#tile-shadow)">
    <!-- top / right / left faces, badges, icon -->
  </g>
  <rect x="-48" y="43" width="96" height="18" rx="4"
        fill="#ffffff" stroke="#e2e8f0" stroke-width="0.75"/>
  <text x="0" y="56" text-anchor="middle"
        font-family="'Segoe UI', system-ui, sans-serif"
        font-size="11" font-weight="600" fill="#1A2744">
    Node Name
  </text>
</g>
```

### Legend and titles

If the legend or title sits where links could pass, use the same idea: a **rounded rect**
(or full-width legend bar) behind sample lines + text so nothing crosses readable copy.

### Typography (unchanged)

```svg
<!-- Optional sublabel (IP, role, etc.) — extend plate height or add a second rect -->
<text x="0" y="labelY+14" text-anchor="middle"
      font-family="'Segoe UI', system-ui, sans-serif"
      font-size="9" fill="#5A7A9F">
  192.168.1.1
</text>
```

---

## Full Diagram Structure Template

```svg
<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg"
     style="background:#F8F9FC; font-family:'Segoe UI',system-ui,sans-serif;">

  <defs>
    <!-- filters, markers, symbols from above -->
  </defs>

  <!-- LAYER 1: Connection lines (drawn first, under nodes) -->
  <g id="connections">
    <!-- paths here -->
  </g>

  <!-- LAYER 2: Signals (optional — animated dots; between connections and nodes) -->
  <g id="signals" pointer-events="none">...</g>

  <!-- LAYER 3: Nodes — per node: tile+icon (with shadow), then label plate rect, then text -->
  <g id="nodes">
    <!-- Each node: inner <g filter> for tile; then <rect> label plate; then <text> -->
  </g>

  <!-- LAYER 4: Legend (optional; use opaque backing behind line swatches + text) -->
  <g id="legend" transform="translate(20, 520)">
    <!-- small colored lines + labels -->
  </g>

  <!-- LAYER 5: Title -->
  <text x="450" y="32" text-anchor="middle"
        font-size="18" font-weight="700" fill="#1A2744">
    Diagram Title
  </text>
</svg>
```

---

## Node Macro (reusable pattern)

Use this pattern for every node — just change position, icon, and label plate width:

```svg
<!-- Node: "Web Server" at SVG position (340, 180) -->
<g transform="translate(340, 180)">
  <g filter="url(#tile-shadow)">
    <polygon points="0,-28  45,0  0,28  -45,0" fill="#1E3A5F"/>
    <polygon points="45,0  45,18  0,46  0,28" fill="#152C4A"/>
    <polygon points="0,28  0,46  -45,18  -45,0" fill="#0D1E30"/>
    <use href="#icon-server" x="0" y="-6" width="32" height="32"/>
  </g>
  <rect x="-52" y="43" width="104" height="18" rx="4"
        fill="#ffffff" stroke="#e2e8f0" stroke-width="0.75"/>
  <text x="0" y="56" text-anchor="middle"
        font-size="11" font-weight="600" fill="#1A2744">Web Server</text>
  <!-- Optional: taller plate or second row for IP -->
  <text x="0" y="72" text-anchor="middle" font-size="9" fill="#5A7A9F">10.0.1.5</text>
</g>
```

---

## Color Palette

```
Background:       #F8F9FC
Tile top face:    #1E3A5F  (navy)
Tile right face:  #152C4A  (dark navy)
Tile left face:   #0D1E30  (deepest navy)
Tile highlight:   #2A4A7F  (for selected/active)
Gold accent:      #F5A623  (primary flow)
Blue accent:      #4A9EFF  (secondary flow)
Cyan accent:      #00D4FF  (data/analytics)
Red accent:       #E63946  (alert/security)
Purple accent:    #9F7AEA  (IoT/wireless)
Green accent:     #38A169  (healthy/ok)
Label primary:    #1A2744
Label secondary:  #5A7A9F
```

---

## Zone / Group Styling

For grouping nodes into logical zones (e.g., DMZ, Internal, Cloud):

```svg
<!-- Zone background — subtle rounded rect, drawn BEFORE nodes -->
<rect x="200" y="120" width="320" height="200"
      rx="16" ry="16"
      fill="#4A9EFF08" stroke="#4A9EFF" stroke-width="1.5"
      stroke-dasharray="8,5" opacity="0.6"/>
<text x="210" y="140" font-size="10" font-weight="700"
      fill="#4A9EFF" text-transform="uppercase" letter-spacing="1">
  DMZ Zone
</text>
```

---

## Step-by-Step Workflow

When given a topology to draw:

1. **Parse components**: List all nodes (type, name, metadata like IP)
2. **Classify connections**: Primary flow (gold), secondary (blue), alerts (red)
3. **Design grid layout**: Sketch isometric grid placement — hub nodes center, leaves around
4. **Map to SVG coords**: Use `isoPos()` formula or manually place at visually balanced positions
5. **Write SVG structure**: defs → connections → (optional `#signals`) → nodes (tile + label
   plate + text) → legend with backing
6. **Apply consistent tile sizes**: larger tiles for more important/central nodes
7. **Add icon**: pick closest icon from library; if unknown, use a generic box with a letter
8. **Route connections**: orthogonal polylines (`M` + `L` only) unless the user asks for curves;
   choose waypoints so segments follow SVG **x** and **y** axes
9. **Add legend** if >2 connection types; place an **opaque rect** behind swatches + text if
   links could cross the legend band
10. **Label legibility**: every node has a **label plate** (`<rect>`) under primary text;
    `tile-shadow` applies **only** to the tile+icon group, not the plate
11. **Review balance**: ensure no cluster of overlapping nodes; adjust positions

---

## Quality Checklist

Before outputting the final SVG:

- [ ] All tiles use 3-face isometric construction (top + right + left)
- [ ] Drop shadow applied **only** to the tile+icon subgraph (not the label plate)
- [ ] **Label plates:** opaque rounded `<rect>` behind each primary label (and sublabels as
      needed) so connection lines and signal dots never obscure text
- [ ] Connection lines drawn in layer BELOW nodes
- [ ] Arrowheads use matching color to their line
- [ ] Labels are readable (min 10px, dark on light bg); legend/title backed if links cross them
- [ ] Icon is visible and correctly scaled on top face
- [ ] Connections routed around tiles, not through them; default to **orthogonal** segments
      (horizontal + vertical), not diagonals or Béziers unless requested
- [ ] Color palette is consistent with the palette table above
- [ ] viewBox sized appropriately (allow 60px padding all sides)
- [ ] Legend present if multiple connection types used