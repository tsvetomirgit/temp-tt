# Layout Skeletons

Pre-built structural shells for common infographic types. Fill in content, data, and colors.

---

## Timeline (Vertical)

```svg
<svg viewBox="0 0 800 1200" xmlns="http://www.w3.org/2000/svg">
<defs>
  <style>
    .title { font: 800 34px 'DM Sans', system-ui; }
    .year { font: 900 18px 'DM Sans', system-ui; }
    .event-title { font: 700 16px system-ui; }
    .event-body { font: 400 13px system-ui; }
    .caption { font: 400 11px system-ui; }
  </style>
  <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FF6B35"/>
    <stop offset="100%" stop-color="#4ECDC4" stop-opacity="0.3"/>
  </linearGradient>
</defs>

<!-- Background -->
<rect width="800" height="1200" fill="#0F0F14"/>

<!-- Header -->
<rect width="800" height="90" fill="#1A1A24"/>
<text x="40" y="30" class="caption" fill="#FF6B35" letter-spacing="2">TIMELINE</text>
<text x="40" y="68" class="title" fill="white">Title of the Timeline</text>

<!-- Vertical spine -->
<line x1="400" y1="110" x2="400" y2="1160" stroke="url(#line-grad)" stroke-width="2"/>

<!-- EVENT (left side) -->
<circle cx="400" cy="170" r="10" fill="#FF6B35"/>
<text x="380" y="165" class="year" fill="#FF6B35" text-anchor="end">2020</text>
<rect x="60" y="148" width="300" height="80" rx="8" fill="#1A1A24"/>
<text x="80" y="174" class="event-title" fill="white">Event Name Here</text>
<text x="80" y="194" class="event-body" fill="#888">Short description of what happened.</text>
<text x="80" y="212" class="event-body" fill="#888">Can be two lines if needed.</text>
<line x1="360" y1="170" x2="390" y2="170" stroke="#FF6B35" stroke-width="1" stroke-dasharray="3,3"/>

<!-- EVENT (right side) -->
<circle cx="400" cy="320" r="10" fill="#4ECDC4"/>
<text x="420" y="315" class="year" fill="#4ECDC4">2021</text>
<rect x="440" y="298" width="300" height="80" rx="8" fill="#1A1A24"/>
<text x="460" y="324" class="event-title" fill="white">Next Event Name</text>
<text x="460" y="344" class="event-body" fill="#888">Description of this milestone.</text>
<line x1="410" y1="320" x2="440" y2="320" stroke="#4ECDC4" stroke-width="1" stroke-dasharray="3,3"/>

<!-- Repeat alternating left/right for each event -->

<!-- Footer -->
<line x1="40" y1="1175" x2="760" y2="1175" stroke="#333" stroke-width="0.5"/>
<text x="40" y="1192" class="caption" fill="#555">SOURCE: Name your source</text>
</svg>
```

---

## Comparison (Two-Column)

```svg
<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
<defs>
  <style>
    .title { font: 800 30px system-ui; }
    .col-head { font: 800 20px system-ui; }
    .item { font: 400 14px system-ui; }
    .label { font: 700 11px system-ui; letter-spacing: 1.5px; }
  </style>
</defs>

<rect width="800" height="1000" fill="#0F0F14"/>

<!-- Header -->
<text x="400" y="60" text-anchor="middle" class="title" fill="white">Option A vs Option B</text>
<text x="400" y="85" text-anchor="middle" font-size="14" fill="#666">Subtitle explaining what's being compared</text>

<!-- VS badge -->
<circle cx="400" cy="160" r="30" fill="#FF6B35"/>
<text x="400" y="167" text-anchor="middle" font-size="16" font-weight="900" fill="white">VS</text>

<!-- Left column header -->
<rect x="40" y="110" width="330" height="100" rx="12" fill="#1E2A3A"/>
<rect x="40" y="110" width="330" height="4" rx="2" fill="#4ECDC4"/>
<text x="205" y="158" text-anchor="middle" class="col-head" fill="white">Option A</text>
<text x="205" y="182" text-anchor="middle" font-size="13" fill="#4ECDC4">Tagline or key benefit</text>

<!-- Right column header -->
<rect x="430" y="110" width="330" height="100" rx="12" fill="#2A1E1E"/>
<rect x="430" y="110" width="330" height="4" rx="2" fill="#FF6B35"/>
<text x="595" y="158" text-anchor="middle" class="col-head" fill="white">Option B</text>
<text x="595" y="182" text-anchor="middle" font-size="13" fill="#FF6B35">Tagline or key benefit</text>

<!-- Comparison rows -->
<!-- Row 1 -->
<text x="400" y="240" text-anchor="middle" class="label" fill="#555">CRITERION 1</text>
<line x1="40" y1="248" x2="760" y2="248" stroke="#222" stroke-width="1"/>
<!-- Left item -->
<circle cx="60" cy="270" r="5" fill="#4ECDC4"/>
<text x="75" y="275" class="item" fill="#ccc">Left side value or description</text>
<!-- Right item -->
<circle cx="448" cy="270" r="5" fill="#FF6B35"/>
<text x="463" y="275" class="item" fill="#ccc">Right side value or description</text>

<!-- Repeat for rows 2-8 at y+=50 intervals -->

<!-- Bottom verdict -->
<rect x="40" y="860" width="720" height="100" rx="12" fill="#1A1A24"/>
<text x="400" y="900" text-anchor="middle" class="label" fill="#888">OUR RECOMMENDATION</text>
<text x="400" y="930" text-anchor="middle" font-size="16" font-weight="700" fill="white">Verdict or summary goes here</text>

<!-- Footer -->
<text x="400" y="978" text-anchor="middle" font-size="11" fill="#444">SOURCE: Data source</text>
</svg>
```

---

## Process / How It Works (Steps)

```svg
<svg viewBox="0 0 800 900" xmlns="http://www.w3.org/2000/svg">
<defs>
  <style>
    .step-num { font: 900 28px system-ui; }
    .step-title { font: 700 18px system-ui; }
    .step-body { font: 400 13px system-ui; }
  </style>
  <!-- Connecting arrow marker -->
  <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L8,3 Z" fill="#333"/>
  </marker>
</defs>

<rect width="800" height="900" fill="#0F0F14"/>

<!-- Title -->
<text x="400" y="58" text-anchor="middle" font-size="30" font-weight="800" fill="white">How It Works</text>

<!-- Step 1 -->
<circle cx="80" cy="180" r="36" fill="#FF6B35" opacity="0.15"/>
<circle cx="80" cy="180" r="36" fill="none" stroke="#FF6B35" stroke-width="2"/>
<text x="80" y="188" text-anchor="middle" class="step-num" fill="#FF6B35">01</text>
<text x="140" y="170" class="step-title" fill="white">Step One Title</text>
<text x="140" y="192" class="step-body" fill="#888">Brief description of what happens in this step.</text>
<text x="140" y="210" class="step-body" fill="#888">Keep it to 2 lines max.</text>

<!-- Connector -->
<line x1="80" y1="216" x2="80" y2="274" stroke="#333" stroke-width="1.5" marker-end="url(#arrow)"/>

<!-- Step 2 -->
<circle cx="80" cy="310" r="36" fill="#4ECDC4" opacity="0.15"/>
<circle cx="80" cy="310" r="36" fill="none" stroke="#4ECDC4" stroke-width="2"/>
<text x="80" y="318" text-anchor="middle" class="step-num" fill="#4ECDC4">02</text>
<text x="140" y="300" class="step-title" fill="white">Step Two Title</text>
<text x="140" y="322" class="step-body" fill="#888">Description of step two.</text>

<!-- Connector -->
<line x1="80" y1="346" x2="80" y2="404" stroke="#333" stroke-width="1.5" marker-end="url(#arrow)"/>

<!-- Step 3 -->
<circle cx="80" cy="440" r="36" fill="#45B7D1" opacity="0.15"/>
<circle cx="80" cy="440" r="36" fill="none" stroke="#45B7D1" stroke-width="2"/>
<text x="80" y="448" text-anchor="middle" class="step-num" fill="#45B7D1">03</text>
<text x="140" y="430" class="step-title" fill="white">Step Three Title</text>
<text x="140" y="452" class="step-body" fill="#888">Description of step three.</text>

<!-- Add more steps following same pattern -->

<!-- Footer -->
<text x="400" y="875" text-anchor="middle" font-size="11" fill="#444">SOURCE: Your source here</text>
</svg>
```

---

## Statistical / Data Overview

```svg
<svg viewBox="0 0 800 1100" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#FF6B35"/>
    <stop offset="100%" stop-color="#FF6B35" stop-opacity="0"/>
  </linearGradient>
  <style>
    .eyebrow { font: 700 11px system-ui; letter-spacing: 2px; }
    .title { font: 800 34px system-ui; }
    .stat-num { font: 900 52px system-ui; }
    .stat-label { font: 600 11px system-ui; letter-spacing: 1.5px; }
    .section-head { font: 700 13px system-ui; letter-spacing: 1px; }
    .body { font: 400 13px system-ui; }
  </style>
</defs>

<rect width="800" height="1100" fill="#0F0F14"/>

<!-- Accent top bar -->
<rect width="800" height="6" fill="url(#headerGrad)"/>

<!-- Header -->
<text x="40" y="50" class="eyebrow" fill="#FF6B35">DATA REPORT · 2025</text>
<text x="40" y="90" class="title" fill="white">Main Headline</text>
<text x="40" y="118" font-size="15" fill="#666">Subtitle with context about the data</text>

<!-- Divider -->
<line x1="40" y1="135" x2="760" y2="135" stroke="#222" stroke-width="1"/>

<!-- 3 hero stats -->
<!-- See stat-cards template in charts.md -->

<!-- Main chart area (use bar/line/donut from charts.md) -->

<!-- Key insights section -->
<text x="40" y="620" class="section-head" fill="#888">KEY FINDINGS</text>
<line x1="40" y1="630" x2="200" y2="630" stroke="#FF6B35" stroke-width="2"/>

<!-- Insight 1 -->
<rect x="40" y="645" width="4" height="60" rx="2" fill="#FF6B35"/>
<text x="56" y="668" class="section-head" fill="#FF6B35">INSIGHT ONE</text>
<text x="56" y="688" class="body" fill="#bbb">Description of the first key finding from the data.</text>

<!-- Insight 2 -->
<rect x="40" y="725" width="4" height="60" rx="2" fill="#4ECDC4"/>
<text x="56" y="748" class="section-head" fill="#4ECDC4">INSIGHT TWO</text>
<text x="56" y="768" class="body" fill="#bbb">Description of the second key finding from the data.</text>

<!-- Footer -->
<line x1="40" y1="1070" x2="760" y2="1070" stroke="#222" stroke-width="0.5"/>
<text x="40" y="1088" class="eyebrow" fill="#444">SOURCE: Data organization, Year</text>
<text x="760" y="1088" class="eyebrow" fill="#444" text-anchor="end">© Author</text>
</svg>
```
