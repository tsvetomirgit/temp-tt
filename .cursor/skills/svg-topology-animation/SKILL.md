---
name: svg-topology-animation
description: >
  Add animated network signals, data flow pulses, and connection animations to SVG topology
  diagrams. Use this skill whenever the user wants to animate a topology diagram, show data
  flowing between nodes, visualize network traffic, add moving signals along connections,
  or make any static topology diagram "come alive". Trigger on: "animate", "animated diagram",
  "show data flow", "network signals", "moving connections", "pulse", "flowing lines",
  "traffic animation", or when the user asks to add motion to a topology. Always combine
  with the svg-topology skill for new diagrams. Also use when the user says "I want to see
  animated network signals between connected objects."
---

# SVG Topology Animation Skill

This skill adds **animated network signals and data flow effects** to SVG topology diagrams.
Animations use pure SVG/CSS — no JavaScript dependencies. They work in all modern browsers
and within Cursor artifacts.

---

## Animation Philosophy

Good topology animations:
- **Communicate meaning** — signal direction shows data flow direction
- **Don't distract** — subtle, looping, background motions
- **Are layer-safe** — animated elements never obscure node labels or icons
- **Are performant** — CSS `animation` over JS timers; `will-change: transform` on moving elements

---

## Core Animation: Signal Pulse Along Path

The primary animation is a **small dot/packet that travels along a `<path>`** using
`animateMotion`. This creates the illusion of network packets or signals moving between nodes.

### Basic Signal Pulse

```svg
<!-- 1. Define the connection path with an ID -->
<path id="conn-web-db"
      d="M 340,180 C 380,160 420,200 460,220"
      fill="none" stroke="#F5A623" stroke-width="2"
      marker-end="url(#arrow-gold)"/>

<!-- 2. Add animated signal dot that follows the path -->
<circle r="4" fill="#F5A623" opacity="0.9">
  <animateMotion dur="1.8s" repeatCount="indefinite" rotate="auto">
    <mpath href="#conn-web-db"/>
  </animateMotion>
</circle>

<!-- Optional: second offset pulse for "busy" connection -->
<circle r="3" fill="#F5A623" opacity="0.5">
  <animateMotion dur="1.8s" begin="0.9s" repeatCount="indefinite" rotate="auto">
    <mpath href="#conn-web-db"/>
  </animateMotion>
</circle>
```

### Signal Types by Connection Color

| Connection type | Signal color | Signal size | Duration | Count |
|---|---|---|---|---|
| Primary/data flow (gold) | `#F5A623` | r=4 | 1.6s | 2 pulses, offset 0.8s |
| Secondary/control (blue) | `#4A9EFF` | r=3 | 2.2s | 1 pulse |
| Alert/blocked (red) | `#E63946` | r=3 | 1.0s | 3 rapid pulses |
| IoT/sensor (purple) | `#9F7AEA` | r="2.5" | 3.0s | 1 slow pulse |
| Healthy/OK (green) | `#38A169` | r=3 | 2.5s | 1 pulse |

---

## Animation 2: Pulsing Node Glow

Makes active nodes "breathe" — a radial glow that fades in and out.

```svg
<!-- Place INSIDE the node <g>, on the tile top face -->
<ellipse cx="0" cy="0" rx="30" ry="14"
         fill="#4A9EFF" opacity="0">
  <animate attributeName="opacity"
           values="0;0.25;0"
           dur="2.4s"
           repeatCount="indefinite"
           calcMode="ease-in-out"/>
  <animate attributeName="rx"
           values="30;38;30"
           dur="2.4s"
           repeatCount="indefinite"
           calcMode="ease-in-out"/>
</ellipse>
```

Use different colors per node role:
- Server: `#4A9EFF` (blue glow)
- Security node: `#00D4FF` (cyan glow)
- Alert node: `#E63946` (red glow)
- IoT: `#9F7AEA` (purple glow)

---

## Animation 3: Dashed Line March ("Marching Ants")

Alternative to dot pulses — the dashed stroke offset scrolls, creating a flowing line effect.
Works well for secondary/passive connections.

```svg
<path d="M x1,y1 L x2,y2"
      fill="none" stroke="#4A9EFF" stroke-width="1.5"
      stroke-dasharray="8,6" opacity="0.7">
  <animate attributeName="stroke-dashoffset"
           from="0" to="-28"
           dur="1s"
           repeatCount="indefinite"/>
</path>
```

Direction:
- `from="0" to="-28"` → flow left-to-right / top-to-bottom (positive direction)
- `from="0" to="28"` → flow right-to-left / bottom-to-top (reverse)

---

## Animation 4: Ring Ripple (broadcast / event emission)

A ring expands outward from a node to indicate it is broadcasting or emitting events.

```svg
<!-- Place inside a node <g> on the top face -->
<circle cx="0" cy="-6" r="0" fill="none"
        stroke="#00D4FF" stroke-width="2" opacity="0.8">
  <animate attributeName="r"     values="0;28;28"  dur="2s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0.8;0;0" dur="2s" repeatCount="indefinite"/>
</circle>
<!-- Second ring, offset by 1s for continuous effect -->
<circle cx="0" cy="-6" r="0" fill="none"
        stroke="#00D4FF" stroke-width="2" opacity="0.8">
  <animate attributeName="r"     values="0;28;28"  dur="2s" begin="1s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0.8;0;0" dur="2s" begin="1s" repeatCount="indefinite"/>
</circle>
```

---

## Animation 5: Status LED Blink

Small colored dot on a tile blinks to show device status.

```svg
<!-- Active/online (green slow blink) -->
<circle cx="18" cy="-20" r="3" fill="#38A169">
  <animate attributeName="opacity"
           values="1;0.2;1" dur="2s" repeatCount="indefinite"/>
</circle>

<!-- Warning (amber fast blink) -->
<circle cx="18" cy="-20" r="3" fill="#F5A623">
  <animate attributeName="opacity"
           values="1;0;1" dur="0.6s" repeatCount="indefinite"/>
</circle>

<!-- Error (red solid / slow pulse) -->
<circle cx="18" cy="-20" r="3" fill="#E63946">
  <animate attributeName="r"
           values="3;4.5;3" dur="0.8s" repeatCount="indefinite"/>
</circle>
```

---

## Animation 6: Data Transfer "Flood Fill"

For a connection that is actively transferring large data, fill the path progressively using
`stroke-dasharray` + `stroke-dashoffset` animation on the connection itself.

```svg
<!-- The connection path must have a known approximate length.
     Use pathLength="100" to normalize it. -->
<path d="M 200,150 C 280,130 320,190 400,200"
      fill="none" stroke="#F5A623"
      stroke-width="3" stroke-linecap="round"
      pathLength="100"
      stroke-dasharray="100"
      stroke-dashoffset="100">
  <animate attributeName="stroke-dashoffset"
           from="100" to="0"
           dur="1.2s"
           repeatCount="indefinite"
           calcMode="ease-in-out"/>
</path>
```

---

## Animation 7: Packet Burst (high-traffic indicator)

Three rapid small signals in quick succession, then a pause. Signals high-volume traffic.

```svg
<!-- Path must have an ID -->
<circle r="3.5" fill="#4A9EFF">
  <animateMotion dur="3s" begin="0s" repeatCount="indefinite" rotate="auto">
    <mpath href="#conn-id"/>
  </animateMotion>
</circle>
<circle r="3.5" fill="#4A9EFF">
  <animateMotion dur="3s" begin="0.25s" repeatCount="indefinite" rotate="auto">
    <mpath href="#conn-id"/>
  </animateMotion>
</circle>
<circle r="3.5" fill="#4A9EFF">
  <animateMotion dur="3s" begin="0.5s" repeatCount="indefinite" rotate="auto">
    <mpath href="#conn-id"/>
  </animateMotion>
</circle>
```

---

## Animation Layering in the SVG

Animations must be placed in this order to avoid z-index issues:

```svg
<svg ...>
  <defs><!-- filters, markers, symbols --></defs>

  <!-- Layer 0: Zone backgrounds (static) -->
  <g id="zones">...</g>

  <!-- Layer 1: Connection lines (static paths WITH ids) -->
  <g id="connections">
    <path id="conn-a-b" d="..." stroke="..."/>
    <!-- more paths -->
  </g>

  <!-- Layer 2: Connection animations (moving dots on paths) -->
  <!-- IMPORTANT: Draw AFTER connection paths, BEFORE node tiles -->
  <g id="connection-animations">
    <circle r="4" fill="#F5A623">
      <animateMotion dur="1.8s" repeatCount="indefinite">
        <mpath href="#conn-a-b"/>
      </animateMotion>
    </circle>
  </g>

  <!-- Layer 3: Node tiles + icons + labels (static, on top) -->
  <g id="nodes">...</g>

  <!-- Layer 4: Node animations (glows, LEDs — inside each node g) -->
  <!-- These are embedded IN the node <g> elements above,
       but listed here for conceptual clarity -->

  <!-- Layer 5: Legend + Title -->
</svg>
```

---

## Timing Reference

| Effect | Duration | Begin offset (for multiple) |
|---|---|---|
| Fast signal pulse | 1.4–1.8s | offset by dur/2 per extra pulse |
| Normal signal pulse | 2.0–2.4s | offset by dur/2 |
| Slow/IoT pulse | 3.0–4.0s | offset by dur/2 |
| Alert/rapid blink | 0.6–0.8s | 0 |
| Node glow breathe | 2.0–3.0s | stagger by 0.3s per node |
| Ring ripple | 1.8–2.2s | offset by dur/2 for second ring |
| Marching ants | 0.8–1.2s | — |

**Stagger tip**: When multiple nodes of the same type pulse, offset each by 0.3–0.5s
using `begin="Ns"` to avoid synchronised "breathing" that looks mechanical.

---

## CSS Animation Alternative (for HTML wrappers)

When the SVG is embedded in an HTML artifact, CSS keyframes can be used instead:

```css
@keyframes signal-travel {
  0%   { offset-distance: 0%;   opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { offset-distance: 100%; opacity: 0; }
}

.signal {
  position: absolute;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #F5A623;
  offset-path: path('M 200,150 C 280,130 320,190 400,200');
  animation: signal-travel 2s linear infinite;
}
.signal.delay-1 { animation-delay: 1s; }
```

Use CSS approach when:
- The diagram is inside an `<html>` document (not pure SVG)
- You need JS-driven on/off toggle for animations
- You need `offset-path` with more complex easing per segment

---

## Quality Checklist for Animated Diagrams

- [ ] All `<animateMotion>` elements use `<mpath>` referencing a named path `id`
- [ ] Signal dot color matches its parent connection line color
- [ ] Multiple pulses per line are offset (not simultaneous)
- [ ] Animated elements are between connection layer and node layer
- [ ] Node glows use `fill` not `stroke` (fill animates cleaner)
- [ ] LED blinks use `opacity` animation (not visibility)
- [ ] Total animations ≤ 20 (beyond this, browsers may stutter)
- [ ] Alert connections pulse faster than normal connections
- [ ] Stagger applied to multiple same-type nodes (not all in sync)
- [ ] Ring ripples only on broadcast/server nodes, not all nodes
