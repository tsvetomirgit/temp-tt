# Claude Rules: Beautiful SVG Animations

These rules govern how Claude approaches every SVG animation task.
Apply them in addition to the SKILL.md technical reference.

---

## PHILOSOPHY

SVG animations should be **intentional, elegant, and purposeful**. Motion should
communicate — not just decorate. Every animated element should serve the story,
guide the eye, or provide meaningful feedback. "Still" is a valid choice; don't
animate for its own sake.

Think like an animator: ease in, ease out, give weight to objects, let things
breathe between loops. A single well-crafted animation beats ten noisy ones.

---

## RULE 1 — Always produce working, self-contained SVG

Every SVG artifact must render correctly on its own, without external dependencies.

- Include all `<defs>` (gradients, filters, clip-paths) inline
- Do not reference external files, fonts (unless system fonts), or scripts
- Use `viewBox` for scalability — never hardcode `width`/`height` as the only sizing
- Declare `xmlns="http://www.w3.org/2000/svg"` on the root `<svg>`
- Declare `xmlns:xlink="http://www.w3.org/1999/xlink"` if using `xlink:href`

---

## RULE 2 — Default to SMIL + CSS hybrid

Unless the user explicitly requests JavaScript:

- Use SMIL (`<animate>`, `<animateTransform>`, `<animateMotion>`) for path morphing,
  motion paths, and attribute-level animations
- Use CSS `@keyframes` (in a `<style>` block) for transform, opacity, and color animations
  on individual elements — they're cleaner and benefit from GPU compositing
- Avoid JavaScript inside SVG — it bloats the file and breaks when SVG is used as `<img>`

---

## RULE 3 — Make easing feel alive

**Never use linear easing for organic, natural, or character animations.**

- Default to `ease-in-out` or a custom `cubic-bezier` for smooth, natural motion
- Use `ease-in` for things falling, accelerating, or disappearing
- Use `ease-out` for things landing, decelerating, or appearing
- Use spring-like cubic-bezier `(0.68, -0.55, 0.27, 1.55)` for bouncy/playful effects
- Use `steps()` only for mechanical, frame-by-frame, or typewriter effects
- For SMIL, use `calcMode="spline"` with `keySplines` to replicate cubic-bezier

---

## RULE 4 — Respect the transform-origin SVG quirk

This is the single most common source of broken SVG animations.

- CSS `transform-origin: center` does NOT work like in HTML — it references the SVG
  viewport center, not the element's own center
- Always specify `transform-origin` in absolute pixel coordinates matching the element's
  visual center: `transform-origin: 50px 50px`
- Alternatively, use the `<g transform="translate(cx,cy)">` wrapping trick so the
  center is at (0,0)
- For SMIL `<animateTransform type="rotate">`, always include the pivot: `from="0 cx cy"`

---

## RULE 5 — Layer thoughtfully

Compose scenes in depth layers for visual richness:

1. Background (sky, fill, gradient)
2. Far background (mountains, silhouettes, depth elements)
3. Mid-ground shapes
4. Main focal elements
5. Foreground overlays
6. Highlight/sheen layers (low-opacity white)
7. Text and labels

Animate each layer at a slightly different speed/phase to create parallax depth.

---

## RULE 6 — Choreograph, don't dump

Multiple elements should animate in **sequence or stagger**, not all at once.

- Use `begin="0s"`, `begin="0.2s"`, `begin="0.4s"` etc. for stagger effects
- Use `begin="prev-anim-id.end"` to chain animations in sequence
- Give the scene a story arc: intro → main action → outro / idle loop
- Use `fill="freeze"` to hold end states; use `fill="remove"` (default) for loops that reset

---

## RULE 7 — Design with intentional color

Beautiful SVG animations need beautiful color. Apply these defaults:

- Prefer a **limited palette** of 3–5 colors plus neutrals
- Use gradients for backgrounds, glows, and depth
- Animate gradient stop-colors for aurora/shimmer effects
- For dark themes: deep navy/indigo backgrounds + bright accent colors
- For light themes: off-white/cream backgrounds + saturated but not neon accents
- Always pair vibrant colors with their shadows/tints for depth
- Accessible contrast: animated text or UI indicators must meet WCAG AA contrast ratios

**Suggested palettes:**
- Cosmic: `#1a1a2e`, `#16213e`, `#FFD93D`, `#4F8EF7`, `#FF6B6B`
- Nature: `#2d6a4f`, `#40916c`, `#74c69d`, `#FFD93D`, `#F4A261`
- Candy: `#FF6B6B`, `#FFD93D`, `#6BCB77`, `#4F8EF7`, `#845EC2`
- Minimal: `#f8f9fa`, `#212529`, `#4F8EF7`, `#FF6B6B`

---

## RULE 8 — Use filters for richness, not performance cost

SVG filters (`feGaussianBlur`, `feDropShadow`, `feMerge`) add depth and polish.
Apply them selectively:

- Use `feGaussianBlur` to create glow halos behind bright elements (keep `stdDeviation` ≤ 4)
- Use `feDropShadow` for grounded objects
- Apply filters via `filter="url(#id)"` on the element, not the group containing everything
- Animate `stdDeviation` sparingly (on keyframes, not continuous) — it's expensive
- Always define filters in `<defs>` with generous `x`, `y`, `width`, `height` margins
  (`x="-50%" y="-50%" width="200%" height="200%"`) so blur doesn't get clipped

---

## RULE 9 — Loop seamlessly

For `repeatCount="indefinite"` animations:

- Make the first and last keyframe identical: `values="A;B;A"`
- Use symmetrical easing: same curve in and out
- Offset sibling element loops with `begin` delays so they feel independent
- Keep loop durations between **0.6s and 6s** — shorter feels jittery, longer feels broken

---

## RULE 10 — Accessibility always

- Add `role="img"` and `aria-label="…"` to the `<svg>` root
- Include `<title>` as first child for screen readers
- Add `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }`
  for any SVG that will be embedded in an HTML page
- Don't convey critical information through animation alone (e.g., a state change that
  is only visible as motion — also change color, shape, or add a label)

---

## RULE 11 — Code quality

- Use meaningful `id` values for animated elements (not `rect1`, `circle2`)
- Group related elements with `<g id="scene-name">` and add comments
- Keep path `d` data readable — break long `d` values across lines
- Consolidate repeated animation parameters using CSS classes
- Round coordinates to 1 decimal place maximum — SVG paths don't need 10 decimal places

---

## RULE 12 — Test mentally before delivering

Before outputting an animated SVG, mentally trace through:

1. Does it render at time=0? (No invisible elements that only appear via animation)
2. Does it loop cleanly? (First frame ≈ last frame)
3. Are all `url(#...)` references defined in `<defs>`?
4. Do all `<animate>` `attributeName` values match actual attribute names on the target?
5. Do path morphs have identical command counts?
6. Is rotation pivot specified?
7. Does the animation communicate something, or is it just noise?
