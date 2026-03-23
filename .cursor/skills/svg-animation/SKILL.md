---
name: svg-animation
description: Use this skill whenever creating, editing, or improving SVG animations. Trigger on any mention of "SVG animation", "animate element", "SMIL", "animateTransform",  "animateMotion", "SVG keyframes", "morphing SVG", "SVG path animation", "SVG loading spinner",  "SVG illustration animate", "SVG icon animation", "SVG hover effect", or requests to "animate an SVG", "make an SVG move", "create a beautiful SVG", "animate a logo", or "draw-on animation". Also trigger for any inline SVG that should come to life with motion, looping effects, transitions, or storytelling through animation. Applies to both  SMIL-based (`<animate>`, `<animateTransform>`, `<animateMotion>`) and CSS-in-SVG animations.
metadata:
  - https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animate
  - https://css-tricks.com/guide-svg-animations-smil/
  - https://www.w3schools.com/graphics/svg_animation.asp
  - https://www.svgator.com/blog/cool-svg-animation-examples-to-inspire/
---

# SVG Animation Skill — Rules, Patterns & Best Practices

This skill covers creating **beautiful, production-quality SVG animations** using SMIL elements,
CSS-in-SVG, and hybrid approaches. Apply these rules every time you generate or modify an
animated SVG — whether it's a looping illustration, a dashboard icon, a path draw-on effect,
or a full animated scene.

---

## 1. ANIMATION TECHNIQUE SELECTION

### Rule: Choose the right technique for the job

| Technique | Best For | Notes |
|---|---|---|
| **SMIL** (`<animate>`, `<animateTransform>`, `<animateMotion>`) | Self-contained SVGs, works as `<img>`, path morphing, motion paths | Most portable; works without JS |
| **CSS animations** (`@keyframes` inside `<style>`) | Transform, opacity, color, stroke-dash effects | Clean, familiar syntax; cannot morph paths |
| **CSS + SMIL hybrid** | Complex scenes needing both path morph AND CSS convenience | Best of both worlds inside one SVG |
| **JS (GSAP / Web Animations API)** | Interactive, reactive, scroll-driven, sequenced timelines | Most powerful but requires JS context |

**Default to SMIL + CSS hybrid** for self-contained SVG artifacts. Use JS only when the
SVG is embedded in an HTML document context and you need interactivity or timelines.

---

## 2. CORE SMIL ANIMATION ELEMENTS

### `<animate>` — Scalar attribute animation

Animates a single numeric or color attribute over time.

```xml
<circle cx="50" cy="50" r="10" fill="#4F8EF7">
  <animate
    attributeName="r"
    from="10" to="30"
    dur="1.2s"
    repeatCount="indefinite"
    calcMode="spline"
    keySplines="0.42 0 0.58 1"
    keyTimes="0;1"
  />
</circle>
```

**Key attributes:**
- `attributeName` — the attribute to animate (e.g., `cx`, `r`, `opacity`, `fill`, `stroke-width`)
- `from` / `to` — start and end values
- `values` — semicolon-separated keyframe values (use instead of `from`/`to` for multi-step)
- `dur` — duration (e.g., `2s`, `500ms`)
- `repeatCount` — `"indefinite"` for looping or a number
- `fill` — `"freeze"` to hold final state; `"remove"` (default) to snap back
- `begin` — `"0s"`, `"click"`, `"other-anim.end"`, `"2s"` (chaining)
- `calcMode` — `"linear"` (default), `"spline"`, `"discrete"`, `"paced"`

### `<animateTransform>` — Transform animations

Animates SVG transform attributes: `translate`, `scale`, `rotate`, `skewX`, `skewY`.

```xml
<rect x="40" y="40" width="20" height="20" fill="#FF6B6B">
  <!-- Continuous rotation around own center -->
  <animateTransform
    attributeName="transform"
    type="rotate"
    from="0 50 50"
    to="360 50 50"
    dur="3s"
    repeatCount="indefinite"
  />
</rect>
```

**Rotation syntax:** `from="angle cx cy"` — always specify the pivot point, otherwise rotation
is around the SVG origin (top-left) which almost never looks right.

**Scale with additive stacking:**
```xml
<!-- Pulse: scale up then back, centered -->
<animateTransform
  attributeName="transform"
  type="scale"
  values="1;1.15;1"
  dur="1s"
  repeatCount="indefinite"
  additive="sum"
/>
```

### `<animateMotion>` — Path-following motion

Moves an element along an arbitrary SVG path.

```xml
<circle r="6" fill="#FFD93D">
  <animateMotion
    dur="4s"
    repeatCount="indefinite"
    rotate="auto"
  >
    <mpath xlink:href="#motion-path"/>
  </animateMotion>
</circle>

<!-- Define the path separately -->
<path id="motion-path" d="M10,80 Q50,10 90,80" fill="none" stroke="none"/>
```

- `rotate="auto"` — aligns the element's x-axis with the path tangent (essential for arrows/vehicles)
- `rotate="auto-reverse"` — same but facing backwards
- `keyPoints` + `keyTimes` — fine-grained velocity control along the path

### `<set>` — Discrete value switching

Instantly sets an attribute at a given time. Useful for visibility toggles.

```xml
<text opacity="0">
  <set attributeName="opacity" to="1" begin="1.5s"/>
</text>
```

---

## 3. CSS-IN-SVG ANIMATIONS

### Rule: Use `<style>` blocks inside SVG for transform/opacity/color

CSS animations work on SVG elements exactly like HTML. Always place the `<style>` tag
as the **first child of `<svg>`** for clarity.

```xml
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <style>
    .dot {
      animation: bounce 1s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite alternate;
      transform-origin: 50px 50px; /* Must be in px matching element center */
    }
    @keyframes bounce {
      from { transform: translateY(0); }
      to   { transform: translateY(-15px); }
    }
  </style>
  <circle class="dot" cx="50" cy="50" r="8" fill="#6BCB77"/>
</svg>
```

### ⚠️ transform-origin in SVG

CSS `transform-origin` in SVG works differently from HTML. Always specify it in **absolute
pixel coordinates** matching the element's visual center, not as percentages.

```css
/* ✅ Correct — explicit pixel coordinates */
.spinner { transform-origin: 50px 50px; }

/* ❌ Wrong in SVG — percentages are relative to the SVG viewport, not the element */
.spinner { transform-origin: center; }
/* (Works only if the element is centered in the SVG viewport) */
```

**Safe workaround:** Wrap the element in a `<g>` translated so its center is at (0,0),
then apply the rotation CSS to the `<g>`:

```xml
<g style="animation: spin 2s linear infinite;">
  <g transform="translate(50,50)"> <!-- move origin to element center -->
    <rect x="-10" y="-10" width="20" height="20" fill="#845EC2"/>
  </g>
</g>
<style>
  @keyframes spin { to { transform: rotate(360deg); } }
  g { transform-origin: 0 0; } /* origin is already the center after translate */
</style>
```

---

## 4. STROKE DRAW-ON EFFECT (The Signature SVG Technique)

One of the most striking SVG animation effects: making paths appear to draw themselves.

```xml
<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <style>
    .draw {
      stroke-dasharray: 300;   /* >= total path length */
      stroke-dashoffset: 300;  /* start fully hidden */
      animation: draw-line 2s ease forwards;
    }
    @keyframes draw-line {
      to { stroke-dashoffset: 0; }
    }
  </style>
  <path class="draw"
    d="M10,50 C50,10 150,90 190,50"
    fill="none" stroke="#FF6B6B" stroke-width="3"
    stroke-linecap="round"
  />
</svg>
```

**Finding path length:** Use `path.getTotalLength()` in JS, or estimate generously.
If unsure, set `stroke-dasharray` to `9999` — it will work fine for any path shorter than that.

**Staggered multi-path draw-on:**
```css
.line-1 { animation-delay: 0s; }
.line-2 { animation-delay: 0.4s; }
.line-3 { animation-delay: 0.8s; }
```

---

## 5. TIMING & EASING — MAKING MOTION FEEL ALIVE

### Rule: Never use linear easing for organic animations

| Effect | Best easing |
|---|---|
| Bounce / physics | `cubic-bezier(0.36, 0.07, 0.19, 0.97)` |
| Elastic snap | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` |
| Smooth in-out | `cubic-bezier(0.42, 0, 0.58, 1)` (ease-in-out) |
| Fast-out, slow-in (natural deceleration) | `cubic-bezier(0, 0, 0.2, 1)` |
| Anticipation (wind-up) | `cubic-bezier(0.55, -0.55, 0.45, 1.55)` |
| Mechanical / gears | `steps(8, end)` |

For SMIL `calcMode="spline"`, specify matching `keySplines` (one per interval):
```xml
<animate
  values="0;80;100"
  keyTimes="0;0.8;1"
  calcMode="spline"
  keySplines="0.42 0 0.58 1;  0.42 0 0.58 1"
  dur="1.5s"
/>
```

### Staggered delays for group animations

```xml
<!-- Three dots loading indicator with stagger -->
<circle cx="30" cy="50" r="6" fill="#4F8EF7">
  <animate attributeName="cy" values="50;35;50" dur="0.9s" repeatCount="indefinite" begin="0s"/>
</circle>
<circle cx="50" cy="50" r="6" fill="#4F8EF7">
  <animate attributeName="cy" values="50;35;50" dur="0.9s" repeatCount="indefinite" begin="0.15s"/>
</circle>
<circle cx="70" cy="50" r="6" fill="#4F8EF7">
  <animate attributeName="cy" values="50;35;50" dur="0.9s" repeatCount="indefinite" begin="0.3s"/>
</circle>
```

---

## 6. PATH MORPHING

SVG paths can morph between shapes — but both paths **must have the exact same number of
commands and the same command types** in the same order.

```xml
<!-- Morph from circle-like to star-like — must match point count -->
<path fill="#FF6B6B" d="M50,20 L61,40 L83,40 L67,55 L73,77 L50,64 L27,77 L33,55 L17,40 L39,40 Z">
  <animate
    attributeName="d"
    values="
      M50,20 L61,40 L83,40 L67,55 L73,77 L50,64 L27,77 L33,55 L17,40 L39,40 Z;
      M50,10 L55,45 L90,45 L62,65 L72,95 L50,72 L28,95 L38,65 L10,45 L45,45 Z;
      M50,20 L61,40 L83,40 L67,55 L73,77 L50,64 L27,77 L33,55 L17,40 L39,40 Z
    "
    dur="3s"
    repeatCount="indefinite"
    calcMode="spline"
    keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
    keyTimes="0;0.5;1"
  />
</path>
```

**Morphing constraint checklist:**
- ✅ Same number of path commands
- ✅ Same command types in same order (all `L`, or all `C`, etc.)
- ✅ Same winding direction (both clockwise or both counter-clockwise)
- ❌ Mixing `L` with `C` commands = broken morph

---

## 7. BEAUTIFUL DESIGN RULES

### Color palettes that animate well

High-contrast, harmonious palettes with smooth color transitions:

```xml
<!-- Gradient that shifts hue — aurora / glow effect -->
<defs>
  <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#845EC2">
      <animate attributeName="stop-color"
        values="#845EC2;#FF6B6B;#FFD93D;#6BCB77;#4F8EF7;#845EC2"
        dur="6s" repeatCount="indefinite"/>
    </stop>
    <stop offset="100%" stop-color="#4F8EF7">
      <animate attributeName="stop-color"
        values="#4F8EF7;#845EC2;#FF6B6B;#FFD93D;#6BCB77;#4F8EF7"
        dur="6s" repeatCount="indefinite"/>
    </stop>
  </linearGradient>
</defs>
```

### Filter effects for depth and glow

```xml
<defs>
  <!-- Soft glow -->
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
    <feMerge>
      <feMergeNode in="coloredBlur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  
  <!-- Drop shadow -->
  <filter id="shadow">
    <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#00000033"/>
  </filter>
</defs>

<circle cx="50" cy="50" r="20" fill="#FFD93D" filter="url(#glow)"/>
```

### Layering for rich scenes

Always layer SVG elements in this order (bottom to top):
1. Background fills / gradients
2. Shadow / blur layers (low opacity)
3. Main shapes
4. Highlights / sheen overlays (low opacity white)
5. Foreground decorative elements
6. Text / labels

---

## 8. ANIMATION CHOREOGRAPHY PATTERNS

### Sequence chaining with `begin="id.end"`

```xml
<rect id="box" x="10" y="40" width="20" height="20" fill="#4F8EF7">
  <!-- First: slide in -->
  <animate id="slide-in"
    attributeName="x" from="-20" to="10"
    dur="0.5s" fill="freeze"/>
  <!-- Then: color change (starts when slide-in ends) -->
  <animate id="color-change"
    attributeName="fill" from="#4F8EF7" to="#FF6B6B"
    dur="0.3s" begin="slide-in.end" fill="freeze"/>
  <!-- Then: scale up -->
  <animateTransform
    attributeName="transform" type="scale"
    from="1 1" to="1.3 1.3"
    dur="0.2s" begin="color-change.end" fill="freeze" additive="sum"/>
</rect>
```

### Breathing / pulse loop

```xml
<circle cx="50" cy="50" r="25" fill="#6BCB77" opacity="0.8">
  <animate attributeName="r" values="25;27;25" dur="2s" repeatCount="indefinite"
    calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" keyTimes="0;0.5;1"/>
  <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"
    calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" keyTimes="0;0.5;1"/>
</circle>
```

### Particle burst pattern

Animate multiple elements from a center point with varied angles:

```xml
<!-- Particle at 45 degrees -->
<circle r="4" fill="#FFD93D" opacity="0">
  <animate attributeName="cx" from="50" to="78" dur="0.8s" begin="burst.begin" fill="freeze"/>
  <animate attributeName="cy" from="50" to="22" dur="0.8s" begin="burst.begin" fill="freeze"/>
  <animate attributeName="opacity" values="0;1;0" dur="0.8s" begin="burst.begin" fill="freeze"/>
</circle>
```

---

## 9. PERFORMANCE & COMPATIBILITY

### GPU-friendly properties

Prefer animating these (composited, no layout/paint triggers):
- ✅ `transform` (translate, rotate, scale)
- ✅ `opacity`
- ✅ `filter` (with some caveats)

Avoid animating these in tight loops (triggers layout):
- ⚠️ `x`, `y`, `cx`, `cy` (acceptable for simple SVGs, costly in complex ones)
- ❌ `width`, `height` (triggers layout recalculation)

### Use CSS transforms over SMIL for smooth 60fps

For `translate` and `scale`, prefer CSS `@keyframes` over `<animateTransform>` — CSS
animations benefit from GPU compositing hints more reliably.

### `will-change` hint

```xml
<style>
  .fast-anim {
    will-change: transform, opacity;
  }
</style>
```

Use sparingly — only on elements with continuous, complex animations.

### `prefers-reduced-motion` support (accessibility)

Always respect user motion preferences in SVGs embedded in HTML:

```xml
<style>
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; }
  }
</style>
```

---

## 10. SVG STRUCTURE TEMPLATE

Every animated SVG should follow this structure:

```xml
<svg
  viewBox="0 0 200 200"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  role="img"
  aria-label="Description of animation"
>
  <!-- 1. Definitions: gradients, filters, clip-paths, masks, reusable paths -->
  <defs>
    <!-- gradients, filters etc. -->
  </defs>

  <!-- 2. Background layer -->
  <!-- ... -->

  <!-- 3. Main content layers (bottom to top) -->
  <!-- ... -->

  <!-- 4. Overlay / highlight layers -->
  <!-- ... -->

  <!-- 5. CSS animations (place at end or in <defs>) -->
  <style>
    /* @keyframes and element classes */
  </style>
</svg>
```

---

## 11. COMMON BEAUTIFUL EFFECTS — QUICK REFERENCE

| Effect | Key technique |
|---|---|
| Draw-on path | `stroke-dasharray` + `stroke-dashoffset` CSS animation |
| Pulsing glow | `r` or `opacity` sine-wave + `feGaussianBlur` filter |
| Color-shifting gradient | `<animate>` on `stop-color` of gradient stops |
| Loading spinner | `animateTransform rotate` + `stroke-dashoffset` |
| Morphing blob | `<animate attributeName="d">` with matching path commands |
| Floating / levitating | `translateY` CSS keyframes with ease-in-out |
| Wave / ripple | Multiple `<circle>` expanding + fading, staggered |
| Particle burst | Multiple elements animating from center, varied angles |
| Path follower | `<animateMotion>` with `rotate="auto"` |
| Text reveal | Clip-path or `stroke-dashoffset` on text paths |
| Typewriter | Repeated `<set>` on text content or clip-rect width |

---

## 12. COMPLETE EXAMPLE — Animated Scene

Here is a complete, production-quality SVG demonstrating multiple techniques:

```xml
<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sky" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Sky background -->
  <rect width="200" height="120" fill="url(#sky)"/>

  <!-- Twinkling stars -->
  <circle cx="30" cy="20" r="1.2" fill="white" filter="url(#glow)">
    <animate attributeName="opacity" values="1;0.2;1" dur="2.1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="80" cy="12" r="1" fill="white" filter="url(#glow)">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.7s" repeatCount="indefinite"/>
  </circle>
  <circle cx="150" cy="18" r="1.5" fill="white" filter="url(#glow)">
    <animate attributeName="opacity" values="1;0.3;1" dur="2.8s" repeatCount="indefinite"/>
  </circle>

  <!-- Moon glow -->
  <circle cx="160" cy="25" r="14" fill="#FFD93D" opacity="0.15" filter="url(#glow)">
    <animate attributeName="r" values="14;16;14" dur="4s" repeatCount="indefinite"/>
  </circle>
  <!-- Moon -->
  <circle cx="160" cy="25" r="10" fill="#FFD93D" filter="url(#glow)">
    <animate attributeName="opacity" values="0.9;1;0.9" dur="4s" repeatCount="indefinite"/>
  </circle>

  <!-- Hills -->
  <ellipse cx="60" cy="130" rx="90" ry="50" fill="#0f3460"/>
  <ellipse cx="160" cy="135" rx="70" ry="45" fill="#16213e"/>

  <!-- Shooting star -->
  <line x1="0" y1="0" x2="20" y2="5" stroke="white" stroke-width="1.5"
        stroke-linecap="round" opacity="0">
    <animateTransform attributeName="transform" type="translate"
      values="-20,-5; 220,60" dur="1.5s" begin="1s;5s" fill="remove"/>
    <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" begin="1s;5s" fill="remove"/>
  </line>

  <style>
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.01ms !important; }
    }
  </style>
</svg>
```

---

## 13. QUALITY CHECKLIST

Before finalizing any animated SVG, verify:

- [ ] `viewBox` is set correctly (no fixed `width`/`height` unless intentional)
- [ ] All `<defs>` elements are defined before use
- [ ] Rotation `animateTransform` includes pivot coordinates (`from="0 cx cy"`)
- [ ] CSS `transform-origin` uses absolute px, not percentages (or uses the `<g>` centering trick)
- [ ] Path morphs have matching command counts and types
- [ ] `stroke-dasharray` value is ≥ actual path length for draw-on effects
- [ ] `xmlns:xlink` declared if using `xlink:href` (for `<mpath>`)
- [ ] Timing feels organic — avoid linear easing for organic motion
- [ ] `prefers-reduced-motion` media query included (for HTML-embedded SVGs)
- [ ] `role="img"` and `aria-label` set on the `<svg>` for accessibility
- [ ] Animation loops gracefully (last keyframe matches first for seamless looping)