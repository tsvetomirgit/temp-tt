# Chart Code Templates

## Bar Chart (Horizontal)

```svg
<!-- Horizontal bar chart: 5 items, max value = 100 -->
<g transform="translate(40, 200)">
  <!-- Gridlines -->
  <line x1="120" y1="0" x2="700" y2="0" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="120" y1="55" x2="700" y2="55" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="120" y1="110" x2="700" y2="110" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  
  <!-- Bar 1 -->
  <text x="110" y="32" text-anchor="end" font-size="13" fill="#aaa">Category A</text>
  <rect x="120" y="18" width="420" height="28" rx="4" fill="#FF6B35"/>
  <text x="548" y="36" font-size="13" font-weight="700" fill="white">72%</text>

  <!-- Bar 2 -->
  <text x="110" y="87" text-anchor="end" font-size="13" fill="#aaa">Category B</text>
  <rect x="120" y="73" width="320" height="28" rx="4" fill="#4ECDC4"/>
  <text x="448" y="91" font-size="13" font-weight="700" fill="white">55%</text>

  <!-- Bar 3 -->
  <text x="110" y="142" text-anchor="end" font-size="13" fill="#aaa">Category C</text>
  <rect x="120" y="128" width="210" height="28" rx="4" fill="#45B7D1"/>
  <text x="338" y="146" font-size="13" font-weight="700" fill="white">36%</text>
</g>
```

## Bar Chart (Vertical)

```svg
<g transform="translate(60, 100)">
  <!-- Y axis -->
  <line x1="40" y1="0" x2="40" y2="300" stroke="#444" stroke-width="1"/>
  
  <!-- Gridlines -->
  <line x1="40" y1="0" x2="660" y2="0" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="40" y1="75" x2="660" y2="75" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="40" y1="150" x2="660" y2="150" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="40" y1="225" x2="660" y2="225" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  
  <!-- Y labels -->
  <text x="30" y="4" text-anchor="end" font-size="11" fill="#777">100</text>
  <text x="30" y="79" text-anchor="end" font-size="11" fill="#777">75</text>
  <text x="30" y="154" text-anchor="end" font-size="11" fill="#777">50</text>
  <text x="30" y="229" text-anchor="end" font-size="11" fill="#777">25</text>
  <text x="30" y="304" text-anchor="end" font-size="11" fill="#777">0</text>
  
  <!-- Bar 1: value=80, bar height = 80% of 300 = 240 -->
  <rect x="80" y="60" width="60" height="240" rx="4" fill="#FF6B35"/>
  <text x="110" y="50" text-anchor="middle" font-size="13" font-weight="700" fill="#FF6B35">80</text>
  <text x="110" y="320" text-anchor="middle" font-size="12" fill="#aaa">Jan</text>

  <!-- Bar 2: value=65 -->
  <rect x="190" y="105" width="60" height="195" rx="4" fill="#4ECDC4"/>
  <text x="220" y="95" text-anchor="middle" font-size="13" font-weight="700" fill="#4ECDC4">65</text>
  <text x="220" y="320" text-anchor="middle" font-size="12" fill="#aaa">Feb</text>

  <!-- Bar 3: value=90 -->
  <rect x="300" y="30" width="60" height="270" rx="4" fill="#FF6B35"/>
  <text x="330" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#FF6B35">90</text>
  <text x="330" y="320" text-anchor="middle" font-size="12" fill="#aaa">Mar</text>

  <!-- X axis -->
  <line x1="40" y1="300" x2="660" y2="300" stroke="#444" stroke-width="1"/>
</g>
```

## Donut Chart (stroke-dasharray technique)

```svg
<!-- 
  Circle circumference for r=80: 2π×80 ≈ 502.65
  For 68%: stroke-dasharray = "341.80 160.85"  (502.65 × 0.68 = 341.80)
  Rotate -90deg to start from top: transform="rotate(-90 150 150)"
-->
<g transform="translate(100, 100)">
  <!-- Track -->
  <circle cx="150" cy="150" r="80" fill="none" stroke="#222" stroke-width="28"/>
  
  <!-- Segment 1: 68% -->
  <circle cx="150" cy="150" r="80" fill="none" 
          stroke="#FF6B35" stroke-width="28"
          stroke-dasharray="341.80 160.85"
          stroke-linecap="round"
          transform="rotate(-90 150 150)"/>
  
  <!-- Segment 2: 22% (starts at 68% = 244.48 deg offset) -->
  <circle cx="150" cy="150" r="80" fill="none"
          stroke="#4ECDC4" stroke-width="28"
          stroke-dasharray="110.58 392.07"
          stroke-linecap="round"
          transform="rotate(154.8 150 150)"/>
  
  <!-- Center label -->
  <text x="150" y="142" text-anchor="middle" font-size="36" font-weight="900" fill="white">68%</text>
  <text x="150" y="165" text-anchor="middle" font-size="12" fill="#888" letter-spacing="1">PRIMARY</text>
  
  <!-- Legend -->
  <rect x="0" y="320" width="12" height="12" rx="2" fill="#FF6B35"/>
  <text x="18" y="331" font-size="13" fill="#aaa">Category A — 68%</text>
  <rect x="0" y="345" width="12" height="12" rx="2" fill="#4ECDC4"/>
  <text x="18" y="356" font-size="13" fill="#aaa">Category B — 22%</text>
  <rect x="0" y="370" width="12" height="12" rx="2" fill="#333"/>
  <text x="18" y="381" font-size="13" fill="#aaa">Other — 10%</text>
</g>
```

## Progress Bar

```svg
<g transform="translate(40, 300)">
  <!-- Label row -->
  <text x="0" y="0" font-size="13" font-weight="600" fill="#ccc">Metric Name</text>
  <text x="720" y="0" font-size="13" font-weight="700" fill="#FF6B35" text-anchor="end">74%</text>
  
  <!-- Track -->
  <rect x="0" y="10" width="720" height="12" rx="6" fill="#222"/>
  
  <!-- Fill (74% of 720 = 532.8) -->
  <rect x="0" y="10" width="533" height="12" rx="6" fill="url(#barGrad)"/>
</g>
```

## Line Chart

```svg
<!--
  Points: Jan(0,80) Feb(80,55) Mar(160,90) Apr(240,70) May(320,95)
  Map to SVG: x starts at 60, step=120; y inverted: value/100 * 200, bottom at y=280
  So: 80% → y=280-160=120; 55%→y=280-110=170; etc.
-->
<g transform="translate(60, 60)">
  <!-- Grid -->
  <line x1="0" y1="0" x2="580" y2="0" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="0" y1="50" x2="580" y2="50" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="0" y1="100" x2="580" y2="100" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="0" y1="150" x2="580" y2="150" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  <line x1="0" y1="200" x2="580" y2="200" stroke="#333" stroke-width="0.5" stroke-dasharray="4,4"/>
  
  <!-- Area fill (optional) -->
  <path d="M60,120 L180,170 L300,90 L420,130 L540,70 L540,200 L60,200 Z" 
        fill="#FF6B35" opacity="0.08"/>
  
  <!-- Line -->
  <polyline points="60,120 180,170 300,90 420,130 540,70"
            fill="none" stroke="#FF6B35" stroke-width="2.5" stroke-linejoin="round"/>
  
  <!-- Data points -->
  <circle cx="60" cy="120" r="5" fill="#FF6B35" stroke="#0F0F14" stroke-width="2"/>
  <circle cx="180" cy="170" r="5" fill="#FF6B35" stroke="#0F0F14" stroke-width="2"/>
  <circle cx="300" cy="90" r="5" fill="#FF6B35" stroke="#0F0F14" stroke-width="2"/>
  <circle cx="420" cy="130" r="5" fill="#FF6B35" stroke="#0F0F14" stroke-width="2"/>
  <circle cx="540" cy="70" r="5" fill="#FF6B35" stroke="#0F0F14" stroke-width="2"/>
  
  <!-- X labels -->
  <text x="60" y="225" text-anchor="middle" font-size="12" fill="#777">Jan</text>
  <text x="180" y="225" text-anchor="middle" font-size="12" fill="#777">Feb</text>
  <text x="300" y="225" text-anchor="middle" font-size="12" fill="#777">Mar</text>
  <text x="420" y="225" text-anchor="middle" font-size="12" fill="#777">Apr</text>
  <text x="540" y="225" text-anchor="middle" font-size="12" fill="#777">May</text>
</g>
```

## Stat Cards (3-col grid)

```svg
<g transform="translate(40, 180)">
  <!-- Card 1 -->
  <rect x="0" y="0" width="220" height="120" rx="12" fill="#1A1A24"/>
  <rect x="0" y="0" width="220" height="4" rx="2" fill="#FF6B35"/>
  <text x="110" y="60" text-anchor="middle" font-size="42" font-weight="900" fill="white">87%</text>
  <text x="110" y="88" text-anchor="middle" font-size="12" fill="#888" letter-spacing="1.5">SATISFACTION</text>
  <text x="110" y="108" text-anchor="middle" font-size="11" fill="#4ECDC4">↑ 12% from last year</text>

  <!-- Card 2 -->
  <rect x="240" y="0" width="220" height="120" rx="12" fill="#1A1A24"/>
  <rect x="240" y="0" width="220" height="4" rx="2" fill="#4ECDC4"/>
  <text x="350" y="60" text-anchor="middle" font-size="42" font-weight="900" fill="white">2.4M</text>
  <text x="350" y="88" text-anchor="middle" font-size="12" fill="#888" letter-spacing="1.5">TOTAL USERS</text>
  <text x="350" y="108" text-anchor="middle" font-size="11" fill="#4ECDC4">↑ 340K this quarter</text>

  <!-- Card 3 -->
  <rect x="480" y="0" width="220" height="120" rx="12" fill="#1A1A24"/>
  <rect x="480" y="0" width="220" height="4" rx="2" fill="#45B7D1"/>
  <text x="590" y="60" text-anchor="middle" font-size="42" font-weight="900" fill="white">$4.2B</text>
  <text x="590" y="88" text-anchor="middle" font-size="12" fill="#888" letter-spacing="1.5">MARKET SIZE</text>
  <text x="590" y="108" text-anchor="middle" font-size="11" fill="#4ECDC4">↑ Growing 18% YoY</text>
</g>
```
