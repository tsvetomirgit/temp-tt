# Visual regression testing with Playwright (Angular)

Playwright's `toHaveScreenshot()` gives you pass/fail pixel comparison. This setup adds:

1. **Stable screenshots**: Docker, frozen time, mocked API, disabled animations.
2. **Highlighted diffs**: semi-transparent boxes drawn over every changed region.
3. **Interactive viewer**: a standalone HTML file with overlay, swipe slider and a region list.

It is still a pixel-based comparison, not AI-based like Applitools Eyes. Stabilization (section 3) matters more than any viewer.

---

## 1. Install

```bash
npm i -D pngjs pixelmatch@5 @types/pngjs @types/pixelmatch
```

`pixelmatch@5` is used because it works with CommonJS/TypeScript without ESM setup.

## 2. File layout

```
playwright.config.ts
e2e/
  fixtures.ts                      # auto-generates highlighted diff + viewer on failure
  hide-dynamic.css                 # hides spinners, carets, animations
  utils/
    diff-overlay.ts                # finds changed regions, draws translucent boxes
    diff-viewer.ts                 # builds the interactive HTML viewer
  visual/
    dashboard.visual.spec.ts       # example visual test
```

## 3. Rules that keep tests stable

- **Run in the official Docker image** locally and in CI. Baselines depend on OS, browser and fonts. This is the biggest win.
- **Freeze time** with `page.clock.install(...)`.
- **Mock API responses** with `page.route(...)` so data never changes.
- **Wait for readiness**, not just load: wait for the component, wait for spinners to disappear, wait for `document.fonts.ready`.
- **Prefer element screenshots** (`locator.toHaveScreenshot()`) over full pages. Small areas give fewer false positives.
- **Mask only what you cannot control** (third-party widgets, live charts, avatars). A masked area is not compared at all. Mock and freeze first.
- **Use a fixed viewport** so layout is identical.

## 4. Code

### 4.1 `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,        // tolerate tiny anti-aliasing noise
      threshold: 0.2,                 // per-pixel colour tolerance (0 to 1)
      animations: 'disabled',
      caret: 'hide',
      stylePath: './e2e/hide-dynamic.css',
      maskColor: '#FF00FF',           // visible mask colour so reviewers see masked areas
    },
  },
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  use: {
    // testIdAttribute: 'data-qa',    // uncomment if your templates use another attribute
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'visual',
      testMatch: /.*\.visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    // ...your normal e2e projects
  ],
  reporter: [['html', { open: 'never' }]],
});
```

### 4.2 `e2e/hide-dynamic.css`

```css
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}
.spinner, .progress { visibility: hidden !important; }
```

Adjust the selectors to your app (for Clarity, for example `.spinner`, `clr-spinner`).

### 4.3 `e2e/visual/dashboard.visual.spec.ts`

Import `test` and `expect` from the fixtures file, not from `@playwright/test`.

```ts
import { test, expect } from '../fixtures';

test.describe('@visual dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Freeze time
    await page.clock.install({ time: new Date('2026-01-15T10:00:00Z') });

    // 2. Mock the API
    await page.route('**/api/migrations*', route =>
      route.fulfill({
        json: [
          { id: 1, name: 'Web tier', status: 'Completed' },
          { id: 2, name: 'Database', status: 'In progress' },
        ],
      })
    );

    await page.goto('/dashboard');

    // 3. Wait until the app is really ready
    await expect(page.locator('clr-datagrid')).toBeVisible();
    await expect(page.locator('.spinner')).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
  });

  test('full page', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      // Only mask what you cannot control. Time is frozen, so this is just an example.
      mask: [page.getByTestId('last-updated')],
    });
  });

  test('data table only', async ({ page }) => {
    await expect(page.locator('clr-datagrid')).toHaveScreenshot('datagrid.png');
  });
});
```

For masks, add `data-testid="last-updated"` to the element in the Angular template.

### 4.4 `e2e/utils/diff-overlay.ts`

Compares expected and actual with `pixelmatch`, groups changed pixels into regions, and paints a translucent box over each region on a copy of the actual image.

```ts
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export interface Box { x: number; y: number; w: number; h: number }

interface Options {
  threshold?: number;      // pixelmatch colour tolerance
  cell?: number;           // cluster size in px: bigger = fewer, larger boxes
  padding?: number;        // extra space around each box
  color?: [number, number, number];
  alpha?: number;          // fill opacity
}

export function annotateDiff(
  expectedPath: string,
  actualPath: string,
  outPath: string,
  opts: Options = {}
): { boxes: Box[]; diffPixels: number } | null {
  const { threshold = 0.1, cell = 24, padding = 6, color = [255, 0, 128], alpha = 0.35 } = opts;

  const exp = PNG.sync.read(fs.readFileSync(expectedPath));
  const act = PNG.sync.read(fs.readFileSync(actualPath));
  if (exp.width !== act.width || exp.height !== act.height) return null; // size changed, nothing to overlay

  const { width, height } = act;
  const diff = new PNG({ width, height });

  // diffMask: true leaves unchanged pixels transparent, so alpha > 0 means "changed"
  const diffPixels = pixelmatch(exp.data, act.data, diff.data, width, height, {
    threshold,
    diffMask: true,
  });

  // 1. Mark grid cells that contain changed pixels
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const hot = new Uint8Array(cols * rows);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (diff.data[(y * width + x) * 4 + 3] !== 0) {
        hot[Math.floor(y / cell) * cols + Math.floor(x / cell)] = 1;
      }
    }
  }

  // 2. Merge neighbouring hot cells (8-connectivity) into regions
  const seen = new Uint8Array(cols * rows);
  const boxes: Box[] = [];
  for (let i = 0; i < hot.length; i++) {
    if (!hot[i] || seen[i]) continue;
    let minC = cols, maxC = 0, minR = rows, maxR = 0;
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const n = stack.pop()!;
      const c = n % cols, r = Math.floor(n / cols);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c);
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nc = c + dc, nr = r + dr;
          if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
          const ni = nr * cols + nc;
          if (hot[ni] && !seen[ni]) { seen[ni] = 1; stack.push(ni); }
        }
      }
    }
    const x = Math.max(0, minC * cell - padding);
    const y = Math.max(0, minR * cell - padding);
    boxes.push({
      x, y,
      w: Math.min(width, (maxC + 1) * cell + padding) - x,
      h: Math.min(height, (maxR + 1) * cell + padding) - y,
    });
  }

  // 3. Draw semi-transparent fill + solid border on a copy of the actual image
  const out = new PNG({ width, height });
  act.data.copy(out.data);
  const blend = (px: number, py: number, a: number) => {
    const i = (py * width + px) * 4;
    for (let k = 0; k < 3; k++) out.data[i + k] = Math.round(out.data[i + k] * (1 - a) + color[k] * a);
  };
  for (const b of boxes) {
    for (let y = b.y; y < b.y + b.h; y++) {
      for (let x = b.x; x < b.x + b.w; x++) {
        const border = x - b.x < 2 || b.x + b.w - x <= 2 || y - b.y < 2 || b.y + b.h - y <= 2;
        blend(x, y, border ? 0.9 : alpha);
      }
    }
  }

  fs.writeFileSync(outPath, PNG.sync.write(out));
  return { boxes, diffPixels };
}
```

### 4.5 `e2e/utils/diff-viewer.ts`

Builds one self-contained HTML file (images embedded as base64) with overlay, swipe, expected/actual toggle and a clickable region list.

```ts
// e2e/utils/diff-viewer.ts
// Builds one self-contained HTML file (images embedded as base64) with a canvas viewer:
// overlay of changed regions, swipe slider, expected/actual toggle, region list.
import fs from 'fs';
import type { Box } from './diff-overlay';

export function writeDiffViewer(opts: {
  expectedPath: string;
  actualPath: string;
  boxes: Box[];
  outPath: string;
  title?: string;
}): void {
  const b64 = (p: string) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  const data = {
    expected: b64(opts.expectedPath),
    actual: b64(opts.actualPath),
    boxes: opts.boxes,
  };
  const html = TEMPLATE
    .split('__TITLE__').join(escapeHtml(opts.title ?? 'Visual diff'))
    // "<" is escaped so the JSON can never close the script tag
    .split('__DATA__').join(JSON.stringify(data).replace(/</g, '\\u003c'));
  fs.writeFileSync(opts.outPath, html);
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

const TEMPLATE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
  :root {
    --bg: #f5f6f8; --panel: #ffffff; --ink: #1c2230; --muted: #667085;
    --line: #d9dde5; --accent: #d6246e; --accent-ink: #ffffff;
    color-scheme: light dark;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #13161c; --panel: #1b1f27; --ink: #e8ebf0; --muted: #8f98a8; --line: #2e3440; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink);
         font: 14px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; }
  header { display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center;
           padding: 12px 20px; background: var(--panel); border-bottom: 1px solid var(--line);
           position: sticky; top: 0; z-index: 5; }
  h1 { font-size: 15px; font-weight: 600; margin: 0 8px 0 0; }
  .group { display: flex; align-items: center; gap: 8px; }
  .seg { display: inline-flex; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
  .seg button { border: 0; background: transparent; color: var(--ink); padding: 6px 12px;
                font: inherit; cursor: pointer; }
  .seg button + button { border-left: 1px solid var(--line); }
  .seg button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); }
  button:focus-visible, input:focus-visible, li:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  label { color: var(--muted); display: inline-flex; align-items: center; gap: 6px; }
  main { display: grid; grid-template-columns: minmax(0, 1fr) 240px; gap: 16px; padding: 16px 20px; align-items: start; }
  .stage { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 8px; overflow: auto; }
  canvas { display: block; max-width: 100%; height: auto; cursor: crosshair; }
  aside { background: var(--panel); border: 1px solid var(--line); border-radius: 6px;
          padding: 12px; position: sticky; top: 64px; max-height: calc(100vh - 80px); overflow: auto; }
  aside h2 { font-size: 13px; margin: 0 0 8px; font-weight: 600; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { padding: 6px 8px; border-radius: 4px; cursor: pointer; color: var(--muted);
       font-variant-numeric: tabular-nums; }
  li:hover { background: var(--bg); }
  li[aria-selected="true"] { background: var(--accent); color: var(--accent-ink); }
  .hint { color: var(--muted); font-size: 12px; margin-top: 10px; }
  @media (max-width: 800px) { main { grid-template-columns: 1fr; } aside { position: static; max-height: none; } }
</style>
</head>
<body>
<header>
  <h1>__TITLE__</h1>
  <div class="group seg" role="group" aria-label="View mode">
    <button data-mode="overlay" aria-pressed="true">Overlay</button>
    <button data-mode="swipe" aria-pressed="false">Swipe</button>
    <button data-mode="expected" aria-pressed="false">Expected</button>
    <button data-mode="actual" aria-pressed="false">Actual</button>
  </div>
  <div class="group">
    <label><input type="checkbox" id="show" checked> Regions</label>
    <label>Opacity <input type="range" id="alpha" min="5" max="80" value="35"></label>
  </div>
  <span id="count" style="color:var(--muted)"></span>
</header>
<main>
  <div class="stage"><canvas id="c"></canvas></div>
  <aside>
    <h2>Changed regions</h2>
    <ul id="list"></ul>
    <p class="hint">Click a region to highlight it. In Swipe mode, drag on the image to move the divider. Keys: 1-4 switch mode.</p>
  </aside>
</main>
<script id="payload" type="application/json">__DATA__</script>
<script>
(function () {
  var data = JSON.parse(document.getElementById('payload').textContent);
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var mode = 'overlay', selected = -1, split = 0.5;
  var showEl = document.getElementById('show');
  var alphaEl = document.getElementById('alpha');
  var listEl = document.getElementById('list');
  var modes = ['overlay', 'swipe', 'expected', 'actual'];

  function load(src) {
    return new Promise(function (res, rej) {
      var im = new Image(); im.onload = function () { res(im); }; im.onerror = rej; im.src = src;
    });
  }

  Promise.all([load(data.expected), load(data.actual)]).then(function (imgs) {
    var exp = imgs[0], act = imgs[1];
    // Sizes can differ when the layout height changed: use the larger canvas.
    canvas.width = Math.max(exp.naturalWidth, act.naturalWidth);
    canvas.height = Math.max(exp.naturalHeight, act.naturalHeight);
    document.getElementById('count').textContent =
      data.boxes.length + ' region' + (data.boxes.length === 1 ? '' : 's') +
      (exp.naturalWidth !== act.naturalWidth || exp.naturalHeight !== act.naturalHeight
        ? ' (image sizes differ)' : '');

    function drawBoxes() {
      if (!showEl.checked) return;
      var a = alphaEl.value / 100;
      data.boxes.forEach(function (b, i) {
        var sel = i === selected;
        ctx.fillStyle = 'rgba(255, 0, 128, ' + (sel ? Math.min(a + 0.25, 0.9) : a) + ')';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.lineWidth = sel ? 4 : 2;
        ctx.strokeStyle = sel ? '#ffd400' : 'rgba(255, 0, 128, 0.95)';
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mode === 'expected') { ctx.drawImage(exp, 0, 0); }
      else if (mode === 'actual') { ctx.drawImage(act, 0, 0); }
      else if (mode === 'overlay') { ctx.drawImage(act, 0, 0); drawBoxes(); }
      else {
        var x = Math.round(canvas.width * split);
        ctx.drawImage(act, 0, 0);
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, x, canvas.height); ctx.clip();
        ctx.drawImage(exp, 0, 0);
        ctx.restore();
        drawBoxes();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, 0, 3, canvas.height);
        ctx.fillStyle = '#d6246e'; ctx.fillRect(x - 3, 0, 2, canvas.height);
      }
    }

    function setMode(m) {
      mode = m;
      document.querySelectorAll('[data-mode]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.mode === m));
      });
      draw();
    }

    function select(i) {
      selected = i;
      Array.prototype.forEach.call(listEl.children, function (li, k) {
        li.setAttribute('aria-selected', String(k === i));
      });
      draw();
      var b = data.boxes[i];
      if (b) {
        var r = canvas.getBoundingClientRect(), s = r.width / canvas.width;
        window.scrollBy({ top: r.top + b.y * s - 140, behavior: 'smooth' });
      }
    }

    data.boxes.forEach(function (b, i) {
      var li = document.createElement('li');
      li.tabIndex = 0;
      li.setAttribute('aria-selected', 'false');
      li.textContent = '#' + (i + 1) + '  x ' + b.x + ', y ' + b.y + '  ' + b.w + '\\u00d7' + b.h;
      li.onclick = function () { select(i); };
      li.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); } };
      listEl.appendChild(li);
    });
    if (!data.boxes.length) listEl.innerHTML = '<li>No differences found</li>';

    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.onclick = function () { setMode(b.dataset.mode); };
    });
    showEl.onchange = draw; alphaEl.oninput = draw;
    document.addEventListener('keydown', function (e) {
      var k = parseInt(e.key, 10);
      if (k >= 1 && k <= 4 && e.target.tagName !== 'INPUT') setMode(modes[k - 1]);
    });

    function moveSplit(e) {
      if (mode !== 'swipe' || !(e.buttons & 1)) return;
      var r = canvas.getBoundingClientRect();
      split = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      draw();
    }
    canvas.addEventListener('pointerdown', function (e) { moveSplit({ buttons: 1, clientX: e.clientX }); });
    canvas.addEventListener('pointermove', moveSplit);

    draw();
  });
})();
</script>
</body>
</html>`;
```

### 4.6 `e2e/fixtures.ts`

An auto fixture runs after every test. If Playwright wrote `-expected.png` and `-actual.png` files (a screenshot failure), it creates the highlighted image and the viewer and attaches both to the HTML report.

```ts
import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { annotateDiff } from './utils/diff-overlay';
import { writeDiffViewer } from './utils/diff-viewer';

export const test = base.extend<{ diffOverlay: void }>({
  diffOverlay: [
    async ({}, use, testInfo) => {
      await use(); // the test runs here

      if (!fs.existsSync(testInfo.outputDir)) return;
      for (const file of fs.readdirSync(testInfo.outputDir)) {
        if (!file.endsWith('-actual.png')) continue;

        const name = file.replace('-actual.png', '');
        const expected = path.join(testInfo.outputDir, `${name}-expected.png`);
        const actual = path.join(testInfo.outputDir, file);
        const highlighted = path.join(testInfo.outputDir, `${name}-highlighted.png`);
        const viewer = path.join(testInfo.outputDir, `${name}-viewer.html`);
        if (!fs.existsSync(expected)) continue;

        const result = annotateDiff(expected, actual, highlighted);
        if (!result) continue; // image sizes differ

        writeDiffViewer({
          expectedPath: expected,
          actualPath: actual,
          boxes: result.boxes,
          outPath: viewer,
          title: `${testInfo.title}: ${name}`,
        });

        await testInfo.attach(`${name}-highlighted (${result.boxes.length} regions)`, {
          path: highlighted,
          contentType: 'image/png',
        });
        await testInfo.attach(`${name}-viewer`, {
          path: viewer,
          contentType: 'text/html',
        });
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
```

## 5. Using it

### Run in Docker (same image locally and in CI)

Use the image tag that matches your installed `@playwright/test` version.

```bash
docker run --rm -v $(pwd):/work -w /work --ipc=host \
  mcr.microsoft.com/playwright:v1.49.0-noble \
  npx playwright test --project=visual
```

### First run: create baselines

```bash
npx playwright test --project=visual
```

With no baseline, the test "fails" once and writes the screenshot as the new baseline. Run again and it should pass. Commit the PNGs from `e2e/__screenshots__/`.

### When a feature is released

1. Run the visual project against the release branch: `npx playwright test --project=visual`.
2. If something fails, open the report: `npx playwright show-report`.
3. In the failed test, check the normal expected / actual / diff images, the `-highlighted` image, and download the `-viewer` attachment. Open it in a browser.
4. Decide:
   - **Intentional change (new feature):** update baselines, review the PNG changes in the git diff, commit.
     ```bash
     npx playwright test --project=visual --update-snapshots
     ```
   - **Bug:** fix the code and rerun.
   - **Random small diffs:** something dynamic is leaking in. Mock the data, add a mask, or screenshot a smaller element.

### Using the viewer

| Control | What it does |
|---|---|
| Overlay | Actual image with translucent magenta regions |
| Swipe | Drag on the image to move the divider (expected left, actual right) |
| Expected / Actual | Full-size view of each image |
| Regions checkbox, Opacity slider | Show/hide and tune the highlights |
| Region list | Click to highlight one region (yellow) and scroll to it |
| Keys `1` to `4` | Switch mode |

### In CI

Upload the report and viewers as build artifacts so reviewers can open them:

```yaml
# GitHub Actions example
- run: npx playwright test --project=visual
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: visual-diffs
    path: |
      playwright-report/
      test-results/**/*-viewer.html
      test-results/**/*-highlighted.png
```

Run visual tests on release branches or PRs, not on every commit.

## 6. Tuning the overlay

| Problem | Change |
|---|---|
| Too many small boxes | Raise `cell` in `annotateDiff` options (for example 40) |
| Noise from anti-aliasing | Raise `threshold` (for example 0.2) or `maxDiffPixelRatio` in the config |
| Different look | Change `color` and `alpha` in `annotateDiff` |

## 7. Limitations

- Pixel-based: it flags every visible pixel change. Applitools-style AI matching (ignoring shifts and dynamic text) is not included.
- `annotateDiff` returns `null` when expected and actual have different dimensions (for example the page got taller), so no highlighted image or viewer is generated for that case. The plain Playwright diff still appears in the report.
- Each viewer embeds both PNGs as base64. For hundreds of failures, link to the image files instead.
- Baselines in git grow over time. Consider Git LFS or external storage if the repo gets heavy.
- If you need a hosted review workflow with approve/reject and PR checks, free or open-source options built on Playwright include Argos CI, Lost Pixel and reg-suit.