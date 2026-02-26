# ECHO11 — DESIGN SYSTEM & BUILD PROMPT
## Industry-Level Design Documentation v1.0

***

```
╔══════════════════════════════════════════════════════════════════╗
║  ECHO11 — MASTER BUILD PROMPT + DESIGN SYSTEM DOCUMENTATION     ║
║  Version: 1.0 | Date: Feb 2026 | Stack: Next.js 16 + GSAP       ║
║  Primary: #38BDF8 | Base: #050709 | Font: Geist + Geist Mono     ║
╚══════════════════════════════════════════════════════════════════╝
```

***

## PART 0 — skills.sh AGENT PROMPT BLOCK

Paste this at the top of any AI agent / Cursor / v0 prompt session:

```md
---skills.sh---
@vercel/react-best-practices
@vercel/next-cache-components
@vercel/composition-patterns
@vercel/web-design-guidelines
@vercel/core-web-vitals
---end-skills---

AGENTS.md CONTEXT:
You are building echo11, a premium SaaS web studio platform.
Stack: Next.js 16 (App Router), React 19, TypeScript (strict),
Tailwind CSS v4, GSAP 3.14, Three.js 0.183, Motion (motion.dev),
Radix UI primitives, Zustand state.

HARD RULES — NEVER VIOLATE:
1. NO gradient fills on backgrounds or hero sections.
2. NO rounded pill badges (border-radius max: 2px on labels).
3. NO 3-column symmetric feature card grids.
4. NO generic floating cards with soft drop shadows.
5. NO pastel or muted color schemes — high contrast only.
6. NO arbitrary infinite looping animations without user intent.
7. NO glassmorphism panels outside the sticky header.
8. NO generic CTA copy ("Learn More", "Get Started" is banned).
9. ALL animations MUST respect prefers-reduced-motion.
10. ALL motion MUST be tied to scroll position or user interaction.

REQUIRED PATTERNS:
- Use chassis-panel geometry (clip-path chamfer, 1px edge borders).
- Use asymmetric column splits (62/38, 57/43, 70/30 vw ratios).
- Use SVG path lights with GSAP DrawSVG + ScrollTrigger.scrub.
- Use editorial service rails over card grids.
- Use monospaced Geist Mono for metrics, code, timestamps.
- Parallelise all server data fetching via RSC boundaries.
- Lazy-load Three.js canvas with React Suspense.
- Emit analytics events on every CTA click.
```

***

## PART 1 — DESIGN PHILOSOPHY

### Core Thesis

> Echo11 operates as a **Technical Luxury** digital architecture firm. Every pixel must signal engineering mastery, not marketing polish. The interface is a product demo — it IS the proof of capability.

### Reference Matrix

| Reference Site | Pattern to Steal | Adaptation for Echo11 |
|---|---|---|
| `linear.app` | Precision dark UI, purposeful whitespace, speed as design | Structural seams, status-line language, zero-decoration layout |
| `raycast.com` | Cmd+K palette, interaction density, dark/light toggle | CmdK site navigation, hover reveal states |
| `vite.dev` | Dev-grade clarity, minimal hero, fast CTA | Simple high-contrast nav, code-first messaging |
| `vercel.com` | Edge-speed perception, trust hierarchy | Lighthouse metrics as design elements |
| `github.com` | Code typography, technical credibility, contribution graph motifs | Stack display, commit-style process timeline |
| `paper.design` | Consultancy thesis framing, editorial hierarchy | Opening copy reads like a strategic POV |
| `osmo.supply` | Motion as craft signal, intentional interaction layer | One signature animation (path light), restrained elsewhere |
| `basedash.com` | Data confidence, metrics-first hero | Hard outcome numbers before feature lists |
| `payloadcms.com` | Technical trust copy, architecture transparency | Stack callouts near service rails |
| `dreamcut.ai` | Bold first viewport, rapid social proof | Tight hero → proof ribbon in <200ms scroll |
| `index.app` | Operational UI (seams, rails, status lines) | Hairline dividers, rail separators, metric chassis |
| `am-arc.com` | Architectural precision, spatial layout | 3D depth in hero only, sharp panel geometry |
| `webflow.com` | Feature marketing at scale, product tour | Interactive capability demos per service |
| `qu.ai` | Bold typographic presence, dark dominance | Display headline weight as key visual element |

***

## PART 2 — DESIGN TOKENS (PRODUCTION)

### 2.1 Color System

```css
/* ─── ECHO11 COLOR TOKENS ─────────────────────────────────────── */
:root {
  /* Base */
  --bg:           #050709;   /* OLED-safe near-black               */
  --bg-2:         #080C10;   /* Slightly lifted base               */
  --surface:      #0D1117;   /* GitHub-dark panel surface          */
  --surface-2:    #111820;   /* Elevated surface                   */
  --surface-3:    #162130;   /* Highest elevation chassis          */

  /* Lines & Borders */
  --line:         #1A2638;   /* Hairline dividers                  */
  --line-mid:     #243348;   /* Medium seam borders                */
  --line-strong:  #2E4460;   /* Active/hover border                */

  /* Typography */
  --text:         #F2F7FF;   /* Primary text, near-white           */
  --text-2:       #CBD5E1;   /* Secondary body copy                */
  --muted:        #8B98A9;   /* Timestamps, captions, metadata     */
  --ghost:        #4A5568;   /* Placeholder, disabled              */

  /* Brand Accent */
  --accent:       #38BDF8;   /* PRIMARY — Sky blue                 */
  --accent-dim:   #1E8FC4;   /* Hover-darker accent                */
  --accent-glow:  rgba(56, 189, 248, 0.15);  /* Glow backdrop     */
  --accent-trace: rgba(56, 189, 248, 0.08);  /* Path light trail  */

  /* Semantic */
  --success:      #34D399;   /* Metrics, upward arrows             */
  --warning:      #FBBF24;   /* SLA warnings, alerts               */
  --error:        #F87171;   /* Error states                       */

  /* Shadows */
  --shadow-xs:    0 1px 3px rgba(0,0,0,0.5);
  --shadow-panel: 0 20px 56px rgba(2, 6, 14, 0.7);
  --shadow-glow:  0 0 40px rgba(56, 189, 248, 0.12);
  --shadow-lift:  0 8px 32px rgba(0,0,0,0.6);
}
```

**Color Distribution Rule:**
- `--bg` covers 65% of all surfaces
- `--surface` / `--surface-2` covers 25%
- `--accent` covers no more than 8% (CTAs, metrics, active states, path lights only)
- `--text` / `--text-2` all copy
- Lines and borders enforce depth hierarchy, not shadows

### 2.2 Typography System

```css
/* ─── TYPOGRAPHY TOKENS ─────────────────────────────────────── */
:root {
  --font-sans:    'Geist', system-ui, -apple-system, sans-serif;
  --font-mono:    'Geist Mono', 'JetBrains Mono', monospace;

  /* Display (Hero headlines only) */
  --text-d1:      clamp(52px, 6.5vw, 96px);   /* Hero H1          */
  --text-d2:      clamp(40px, 5vw, 72px);     /* Section H1       */

  /* Headings */
  --text-h1:      clamp(36px, 4vw, 56px);
  --text-h2:      clamp(28px, 3vw, 44px);
  --text-h3:      clamp(22px, 2.4vw, 32px);
  --text-h4:      clamp(18px, 1.8vw, 24px);

  /* Body */
  --text-lg:      clamp(17px, 1.4vw, 20px);
  --text-base:    clamp(15px, 1.2vw, 17px);
  --text-sm:      clamp(13px, 1vw, 15px);
  --text-xs:      clamp(11px, 0.85vw, 13px);

  /* Weights (tokenized only — no arbitrary weights) */
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-semi:    600;
  --weight-bold:    700;
  --weight-black:   900;

  /* Letter spacing */
  --tracking-tight:  -0.03em;   /* Display headlines         */
  --tracking-normal: -0.01em;   /* Body copy                 */
  --tracking-wide:    0.08em;   /* Labels, markers (ALLCAPS) */
  --tracking-wider:   0.12em;   /* Section markers           */

  /* Line heights */
  --leading-tight:  1.1;   /* Headlines                      */
  --leading-snug:   1.3;   /* Subheadlines                   */
  --leading-normal: 1.55;  /* Body paragraphs                */
  --leading-loose:  1.75;  /* Small captions, legal          */
}
```

### 2.3 Spacing System

```css
/* ─── SPACING TOKENS (8px base grid) ─────────────────────────── */
:root {
  --space-1:   4px;
  --space-2:   8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
  --space-40: 160px;

  /* Section vertical rhythm (intentional variation) */
  --section-sm:   clamp(64px, 8vw,  96px);
  --section-md:   clamp(88px, 10vw, 128px);
  --section-lg:   clamp(112px, 12vw, 160px);
  --section-xl:   clamp(128px, 14vw, 200px);

  /* Container */
  --container:    min(1280px, calc(100% - 2.8rem));
  --container-sm: min(960px, calc(100% - 2.8rem));
  --container-xs: min(720px, calc(100% - 2.8rem));
}
```

### 2.4 Shape Language

```css
/* ─── BORDER RADIUS TOKENS ─────────────────────────────────── */
:root {
  --radius-0: 0px;   /* Chassis panels, hard edges             */
  --radius-1: 1px;   /* Micro chamfer on button edges          */
  --radius-2: 2px;   /* Labels, inline tags (NEVER pill shape) */
  --radius-3: 4px;   /* Input fields, small cards              */
  --radius-4: 6px;   /* Max allowed radius for any component   */
}

/* Chamfer technique — preferred over border-radius */
.chassis-panel {
  clip-path: polygon(
    0 0,
    calc(100% - 12px) 0,
    100% 12px,
    100% 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
}

.metric-chassis {
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
}
```

***

## PART 3 — LAYOUT SYSTEM

### 3.1 Grid Architecture

```css
/* ─── GRID SYSTEM ───────────────────────────────────────────── */

/* Desktop: 14-column composition grid */
.grid-14 {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: var(--space-6);
}

/* Asymmetric split patterns */
.split-62-38 { grid-template-columns: 62fr 38fr; }
.split-57-43 { grid-template-columns: 57fr 43fr; }
.split-70-30 { grid-template-columns: 70fr 30fr; }
.split-38-62 { grid-template-columns: 38fr 62fr; } /* Alternating */

/* Tablet: 8-column with 5/3 and 3/5 dominance */
@media (max-width: 1024px) {
  .split-62-38, .split-57-43 {
    grid-template-columns: 5fr 3fr;
  }
}

/* Mobile: single column, full-bleed media breaks */
@media (max-width: 768px) {
  .split-62-38, .split-57-43, .split-70-30 {
    grid-template-columns: 1fr;
  }
}
```

### 3.2 Section Scaffold Rules

- **NEVER** centre every headline/body/CTA in the same pattern
- **ALWAYS** alternate left/right text dominance between sections
- **NEVER** use the same section scaffold twice consecutively
- **INJECT** a full-bleed breakout every 3rd project/content band
- **USE** hairline horizontal rules (1px, `--line`) as rhythm separators

***

## PART 4 — ANIMATION SYSTEM

### 4.1 Motion Tiers

```
TIER 0 (Always On)
  → Micro fades: opacity 0→1, 200-300ms ease
  → Focus rings: 180ms transition
  → Button lift: translateY(-2px) + accent border, 150ms

TIER 1 (Scroll-Triggered)
  → Section reveals: staggered opacity + translateY(24px→0)
  → Stagger delay: 60ms per item, 400-600ms total timeline
  → Rail wipes: scaleX(0→1) on section entry
  → Metric count-up: Geist Mono, triggered by IntersectionObserver

TIER 2 (Hero Signature)
  → Three.js wave field: pointer-reactive, sinusoidal Y-axis
  → SVG path light: stroke-dashoffset scrubbed to scroll position
  → Canvas motion glyphs: per-project media areas

TIER 3 (CTA / Interactive)
  → WebGL configurator: scroll-jacked, lazy-loaded
  → Hover state particles: small burst (30 particles max)
  → CmdK palette: spring physics open/close
```

### 4.2 SVG Path Light System (CORE ANIMATION)

```javascript
// ─── SVG PATH LIGHT — PRODUCTION IMPLEMENTATION ─────────────────
// Reference: GSAP DrawSVGPlugin + MotionPathPlugin + ScrollTrigger
// Source: https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/

import { gsap } from 'gsap';
import { DrawSVGPlugin, MotionPathPlugin, ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin, ScrollTrigger);

export function initPathLight(containerRef: React.RefObject<HTMLElement>) {
  const paths = containerRef.current?.querySelectorAll('[data-light-path]');
  const traveler = containerRef.current?.querySelector('[data-traveler]');

  if (!paths || !traveler) return;

  // Debounce resize handler — prevents viewport-break alignment failures
  let resizeTween: gsap.core.Tween | null = null;
  let savedProgress = 0;

  const buildTween = () => {
    if (resizeTween) {
      savedProgress = resizeTween.progress();
      resizeTween.kill();
    }

    resizeTween = gsap.to(traveler, {
      motionPath: {
        path: '[data-light-path-primary]',
        align: '[data-light-path-primary]',
        alignOrigin: [0.5, 0.5],
        autoRotate: false,
      },
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=3000',
        scrub: 1.2,
        onUpdate: (self) => savedProgress = self.progress,
      },
    });

    // Draw reveal per path section
    paths.forEach((path, i) => {
      gsap.fromTo(path, { drawSVG: '0%' }, {
        drawSVG: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: `top+=${i * 600} top`,
          end: `top+=${(i + 1) * 600} top`,
          scrub: 1,
        },
      });
    });
  };

  buildTween();

  const debouncedResize = debounce(() => {
    ScrollTrigger.refresh();
    buildTween();
  }, 150);

  window.addEventListener('resize', debouncedResize);
  return () => window.removeEventListener('resize', debouncedResize);
}
```

```html
<!-- SVG PATH LIGHT MARKUP -->
<svg
  viewBox="0 0 1280 4000"
  class="path-light-canvas"
  aria-hidden="true"
  preserveAspectRatio="xMidYMid meet"
>
  <defs>
    <!-- Glow filter -->
    <filter id="traveler-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Path gradient -->
    <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0" />
      <stop offset="40%" stop-color="#38BDF8" stop-opacity="0.9" />
      <stop offset="60%" stop-color="#38BDF8" stop-opacity="1" />
      <stop offset="100%" stop-color="#38BDF8" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Ghost track (always visible, low opacity) -->
  <path
    d="M 0 400 C 400 200, 800 600, 1280 300 S 1280 1200, 640 1400 C 200 1600, 0 2000, 640 2200"
    fill="none"
    stroke="rgba(56,189,248,0.06)"
    stroke-width="1.5"
  />

  <!-- Animated draw path -->
  <path
    data-light-path
    data-light-path-primary
    d="M 0 400 C 400 200, 800 600, 1280 300 S 1280 1200, 640 1400 C 200 1600, 0 2000, 640 2200"
    fill="none"
    stroke="url(#pathGrad)"
    stroke-width="2"
  />

  <!-- Moving traveler glow node -->
  <circle
    data-traveler
    r="5"
    fill="#38BDF8"
    filter="url(#traveler-glow)"
  />
</svg>
```

### 4.3 Three.js Hero Wave Field

```typescript
// ─── THREE.JS WAVE FIELD CONFIG ─────────────────────────────────
// File: src/components/waves-background.tsx
// Current implementation reference: file:1 (CURRENT_FRONTEND_REFERENCE.md)

const WAVE_CONFIG = {
  SEPARATION: 34,          // Particle grid spacing
  AMOUNT_X: 80,            // Grid width count
  AMOUNT_Y: 58,            // Grid depth count
  COLOR: 0x38bdf8,         // Primary accent
  SIZE: 3,                 // Particle size
  AMPLITUDE: 80,           // Wave height
  FREQUENCY: 0.004,        // Wave cycle speed
  POINTER_SENSITIVITY: 0.0015,  // Mouse rotation multiplier
};

// Additive blending for luminous glow effect
// renderer.setClearColor(0x050709) to match --bg token
// Pointer reactive: rotateX/Y linked to mousemove delta
// Reduced-motion: freeze animation, keep static snapshot
// IntersectionObserver: pause render when off-screen
```

### 4.4 GSAP Hero Entrance Sequence

```javascript
// ─── HERO ENTRANCE CHOREOGRAPHY ─────────────────────────────────
// Ordered reveal timeline — DO NOT use CSS animations for this

const heroTimeline = gsap.timeline({ delay: 0.1 });

heroTimeline
  .from('[data-hero-backdrop]', {
    opacity: 0, scale: 1.04, duration: 0.9, ease: 'power2.out'
  })
  .from('[data-hero-marker]', {
    opacity: 0, y: 8, duration: 0.4, ease: 'power2.out'
  }, '-=0.3')
  .from('[data-hero-headline] .word', {
    opacity: 0, y: 32, duration: 0.7, ease: 'power3.out',
    stagger: 0.05  // 50ms per word
  }, '-=0.2')
  .from('[data-hero-body]', {
    opacity: 0, y: 16, duration: 0.5, ease: 'power2.out'
  }, '-=0.3')
  .from('[data-hero-cta-primary]', {
    opacity: 0, y: 12, duration: 0.45, ease: 'power2.out'
  }, '-=0.2')
  .from('[data-hero-cta-secondary]', {
    opacity: 0, y: 12, duration: 0.45, ease: 'power2.out'
  }, '-=0.35')
  .from('[data-hero-signal] .signal-item', {
    opacity: 0, x: -8, duration: 0.35, stagger: 0.07, ease: 'power1.out'
  }, '-=0.2');
```

### 4.5 Scroll-Triggered Reveals

```javascript
// ─── SCROLL REVEAL SYSTEM ───────────────────────────────────────
// Apply to any section element with data-reveal attribute

export function initScrollReveals() {
  const reveals = document.querySelectorAll('[data-reveal]');

  reveals.forEach((el) => {
    const type = el.getAttribute('data-reveal');

    const config = {
      fade:   { opacity: 0, duration: 0.6, ease: 'power2.out' },
      rise:   { opacity: 0, y: 40, duration: 0.7, ease: 'power3.out' },
      wipe:   { scaleX: 0, transformOrigin: 'left', duration: 0.6 },
      rail:   { opacity: 0, x: -24, duration: 0.5, ease: 'power2.out' },
    }[type || 'rise'];

    gsap.from(el, {
      ...config,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,          // Reveal once only
      },
    });
  });

  // Stagger groups
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const children = group.querySelectorAll('[data-reveal-item]');
    gsap.from(children, {
      opacity: 0,
      y: 28,
      duration: 0.6,
      stagger: 0.06,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: group,
        start: 'top 82%',
        once: true,
      },
    });
  });
}
```

### 4.6 Metric Count-Up (Geist Mono)

```javascript
// ─── METRIC COUNTER ANIMATION ───────────────────────────────────
// Triggered by IntersectionObserver — NOT scroll
// Displays: +25 Lighthouse pts, 47% bounce reduction, etc.

export function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;

      const end = parseFloat(target.getAttribute('data-counter') || '0');
      const prefix = target.getAttribute('data-prefix') || '';
      const suffix = target.getAttribute('data-suffix') || '';
      const duration = 1400; // ms

      gsap.fromTo(
        { val: 0 },
        { val: end, duration: duration / 1000, ease: 'power2.out',
          onUpdate: function() {
            target.textContent = `${prefix}${Math.round(this.targets()[0].val)}${suffix}`;
          }
        }
      );

      observer.unobserve(target);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}
```

### 4.7 CmdK Command Palette

```typescript
// ─── CMD+K NAVIGATION PALETTE ───────────────────────────────────
// Reference design: Raycast.com spotlight interaction
// Library: cmdk (https://cmdk.paco.me/)

import { Command } from 'cmdk';

// Animation: spring scale(0.96→1) + opacity(0→1) on open
// Keyboard: Cmd+K toggles, Esc closes, Arrow keys navigate
// Items: Pages (Home, Services, Work, Pricing, Contact)
//        Actions (Book a Call, View Projects, Get Proposal)
//        Recently viewed pages
// Styling: chassis-panel geometry, --surface-3 background
// Search: fuzzy match on page title + description
```

***

## PART 5 — COMPONENT LIBRARY

### 5.1 Chassis Panel (Core Component)

```html
<!-- CHASSIS PANEL — foundation component, used everywhere -->
<div class="chassis-panel" data-reveal="rise">
  <!-- Top-left seam accent (accent color line, 40px) -->
  <span class="chassis-seam-tl" aria-hidden="true"></span>

  <!-- Content slot -->
  <slot></slot>

  <!-- Bottom-right micro corner mark -->
  <span class="chassis-corner-br" aria-hidden="true"></span>
</div>
```

```css
.chassis-panel {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--line);
  clip-path: polygon(
    0 0,
    calc(100% - 12px) 0,
    100% 12px,
    100% 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
  padding: var(--space-8);
}

.chassis-seam-tl {
  position: absolute;
  top: -1px; left: -1px;
  width: 40px; height: 2px;
  background: var(--accent);
  opacity: 0.8;
}

.chassis-corner-br {
  position: absolute;
  bottom: 6px; right: 6px;
  width: 6px; height: 6px;
  border-right: 1px solid var(--accent);
  border-bottom: 1px solid var(--accent);
  opacity: 0.4;
}

/* Hover state */
.chassis-panel:hover {
  border-color: var(--line-mid);
  box-shadow: var(--shadow-glow);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
```

### 5.2 Metric Chassis Cell

```html
<!-- METRIC CELL — used in trust ribbon, service rails, project bands -->
<div class="metric-chassis">
  <span class="metric-value" data-counter="25" data-prefix="+" data-suffix="pts">
    — <!-- Pre-animation placeholder -->
  </span>
  <span class="metric-label">Lighthouse Score Avg. Gain</span>
  <span class="metric-delta success">↑ per project</span>
</div>
```

```css
.metric-chassis {
  position: relative;
  padding: var(--space-6) var(--space-8);
  border-left: 1px solid var(--accent);
  border-bottom: 1px solid var(--line);
}

.metric-value {
  font-family: var(--font-mono);
  font-size: var(--text-h2);
  font-weight: var(--weight-bold);
  color: var(--accent);
  letter-spacing: var(--tracking-tight);
  display: block;
  line-height: 1;
}

.metric-label {
  font-size: var(--text-sm);
  color: var(--muted);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  margin-top: var(--space-2);
}

.metric-delta.success { color: var(--success); }
```

### 5.3 Primary CTA Button

```html
<button class="btn-primary" data-cursor="hover">
  <span class="btn-text">Start Your Project</span>
  <span class="btn-arrow" aria-hidden="true">→</span>
  <!-- Scan line animation on hover -->
  <span class="btn-scan" aria-hidden="true"></span>
</button>
```

```css
.btn-primary {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-8);
  background: var(--accent);
  color: #050709;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-semi);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  border: none;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  cursor: pointer;
  overflow: hidden;
  transition: background 150ms ease, transform 150ms ease;
}

.btn-primary:hover {
  background: #7DD3FC;  /* accent-hover */
  transform: translateY(-2px);
}

/* Scan line: horizontal light sweep on hover */
.btn-scan {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%
  );
  transform: translateX(-100%);
  transition: transform 0.4s ease;
}

.btn-primary:hover .btn-scan {
  transform: translateX(100%);
}

/* Secondary variant */
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--line-mid);
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
}

.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}
```

### 5.4 Service Rail

```html
<!-- SERVICE RAIL — editorial strip, NOT a card grid -->
<div class="service-rail" data-reveal="rail">
  <div class="rail-index">
    <span class="rail-number" aria-hidden="true">01</span>
  </div>

  <div class="rail-title-block">
    <h3 class="rail-title">Website Design & Build</h3>
    <p class="rail-position">
      Headless Next.js architecture, GSAP motion, zero layout shift.
    </p>
  </div>

  <div class="rail-capability-strip">
    <!-- 3-4 small process tags -->
    <span class="cap-tag">UX Audit</span>
    <span class="cap-divider" aria-hidden="true">→</span>
    <span class="cap-tag">Component Build</span>
    <span class="cap-divider" aria-hidden="true">→</span>
    <span class="cap-tag">QA + Handover</span>
  </div>

  <div class="rail-proof">
    <span class="rail-metric" data-counter="30" data-suffix="%">—</span>
    <span class="rail-metric-label">Faster launch cycles</span>
  </div>

  <a class="rail-cta" href="/services#design-build">
    Scope this service →
  </a>
</div>
```

```css
.service-rail {
  display: grid;
  grid-template-columns: 48px 1fr 1fr auto auto;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-8) 0;
  border-bottom: 1px solid var(--line);
}

/* Accent left seam on hover */
.service-rail:hover {
  border-bottom-color: var(--line-mid);
}
.service-rail:hover .rail-number {
  color: var(--accent);
}

.rail-number {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--ghost);
  letter-spacing: var(--tracking-wider);
  transition: color 200ms ease;
}

.rail-title {
  font-size: var(--text-h4);
  font-weight: var(--weight-semi);
  color: var(--text);
  letter-spacing: var(--tracking-tight);
}

.cap-tag {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--muted);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.cap-divider {
  color: var(--line-strong);
  font-size: var(--text-xs);
}
```

### 5.5 Section Marker Label

```html
<!-- SECTION MARKER — uppercase mono label, used above every H2 -->
<div class="section-marker" aria-hidden="true">
  <span class="marker-line"></span>
  <span class="marker-text">// SERVICES</span>
</div>
```

```css
.section-marker {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.marker-line {
  width: 24px;
  height: 1px;
  background: var(--accent);
  opacity: 0.7;
}

.marker-text {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--accent);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  opacity: 0.8;
}
```

***

## PART 6 — PAGE-BY-PAGE BUILD SPECIFICATIONS

### 6.1 Global Header

```
COMPONENT: StickyHeader
FILE: src/components/header.tsx

STRUCTURE:
┌─────────────────────────────────────────────────────────────┐
│ [echo11] ←──── wordmark    [Services Work Process...] [Book a Call ↗] │
└─────────────────────────────────────────────────────────────┘

BEHAVIOR:
- position: fixed, top: 0, z-index: 100
- background: rgba(5,7,9,0.85) + backdrop-filter: blur(20px) saturate(180%)
- border-bottom: 1px solid var(--line) on scroll (hidden at top)
- height: 60px desktop / 52px mobile
- wordmark: Geist, 500 weight, --text color; accent glow on hover
- nav links: font-size: var(--text-sm), --muted color; hover → --text with
  GSAP underline draw (scaleX 0→1, 180ms, transformOrigin left)
- [Book a Call]: btn-primary style
- Cmd+K hint: right of nav, "⌘K" in Geist Mono, --ghost color
- Mobile: hamburger → full-screen chassis overlay with staggered link reveal
```

### 6.2 Homepage

```
PAGE: / (index)
FILE: src/app/page.tsx

SECTION SEQUENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_56456336-7781-4d1d-bcc1-57c59be1ef2d/05702827-e7f4-42e2-bdac-8a4e5c2fa233/echo11-premium-saas-website-blueprint.md) HERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT: 62/38 split (left: thesis, right: WebGL canvas)
HEIGHT: 100vh

LEFT PLANE:
  - Section marker: // ECHO11 STUDIO
  - H1 (display): "Websites that load
     fast. Convert hard."
     [Word-split GSAP stagger, 50ms per word]
  - Body (max 2 lines): "We design, build, and maintain
     web platforms for SaaS teams and ambitious brands."
  - CTA row: [Start Your Project →] [See Our Work]
  - Signal row: 4 items separated by vertical hairlines
    · Avg. +25 Lighthouse
    · Edge-rendered on Vercel
    · Zero layout shift SLA
    · 48h response retainer

RIGHT PLANE:
  - Three.js wave particle field (full height, pointer-reactive)
  - SVG path light overlay connecting left→right plane
  - Floating metric chassis (position: absolute):
    ┌──────────────────┐
    │  +47%            │ ← data-counter, Geist Mono
    │  Conversion lift │
    └──────────────────┘

BACKGROUND:
  - --bg base
  - Subtle noise texture overlay (opacity: 0.03)
  - NO gradients

ANIMATION:
  - GSAP heroTimeline (see Section 4.4)
  - Three.js wave on right (Section 4.3)
  - Path light draws on hero load (DrawSVG)
  - Scroll cue: animated chevron (bounce, 2s, stops after 3 loops)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_56456336-7781-4d1d-bcc1-57c59be1ef2d/b79b447e-7782-45c1-990e-e1d4485adc2f/CURRENT_FRONTEND_REFERENCE.md) TRUST RIBBON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT: Full-width horizontal strip
HEIGHT: 80px

CONTENT: 3 metric cells separated by 1px vertical lines
  · "+25 pts avg. Lighthouse score"
  · "30-50% faster launch cycles"
  · "Long-term maintenance SLAs"

STYLE:
  - border-top: 1px solid var(--line)
  - border-bottom: 1px solid var(--line)
  - background: var(--surface)
  - Font: Geist Mono for numbers, Geist for labels
  - Kinetic: values count up when enter viewport

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_56456336-7781-4d1d-bcc1-57c59be1ef2d/8284a8cc-81eb-4cf0-b09a-67656c6ea802/Echo11-SaaS-Agency-Blueprint-Development.pdf) SERVICES — Editorial Rails
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT: Single column, stacked rails
SECTION MARKER: // CAPABILITIES

H2: "What we architect"

4 SERVICE RAILS (see component 5.4):
  01 · Website Design & Build
  02 · Performance & Core Web Vitals
  03 · SEO & Content Infrastructure
  04 · Maintenance & Growth Retainer

HOVER BEHAVIOR:
  - Rail background lifts to --surface-2
  - Left seam: 2px accent color bar animates height 0→100%
  - Capability tags slide right 4px
  - Metric counter accelerates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[04] PROJECTS — Magazine Bands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT: Alternating 57/43 splits, with full-bleed every 3rd
SECTION MARKER: // SELECTED WORK

H2: "Outcomes, shipped."

PROJECT BAND STRUCTURE:
  ┌─────────────────────────────────────────────────┐
  │ [Canvas glyph / media]   │ Industry tag          │
  │ (sphere-scan variant)    │ Challenge statement   │
  │                          │ ──────────────────    │
  │                          │ +34%  conversion      │
  │                          │ -2.1s load time       │
  │                          │ ──────────────────    │
  │                          │ View Case Study →     │
  └─────────────────────────────────────────────────┘

EVERY 3RD: Full-bleed chassis panel breakout
  - 100vw width, 480px height
  - Large metric overlay
  - Before/After split on hover

ANIMATIONS:
  - Parallax: image moves 8px slower than scroll
  - Hover: metric reveal with opacity + translateY(-8px)
  - Entry: alternating rise-left / rise-right

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[05] PROCESS — Vertical Spine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT: Centered spine, chassis milestones on alternating sides
SECTION MARKER: // HOW WE OPERATE

H2: "Four phases. Zero surprises."

SPINE:
  - Vertical SVG line, centered
  - GSAP DrawSVG scrubbed to scroll
  - Traveler dot moves down spine
  - Glow filter: feGaussianBlur stdDeviation="3"

MILESTONES:
  01 Discovery & Audit ────────── [chassis panel, right side]
  ↓
  02 UX/UI Direction ─────────── [chassis panel, left side]
  ↓
  03 Build & QA ──────────────── [chassis panel, right side]
  ↓
  04 Launch & Optimize ──────── [chassis panel, left side]

Each milestone panel:
  - Number: Geist Mono, accent color, oversized (--text-d2)
  - Title, 2-line scope description
  - Deliverable list (3 items max, hairline-separated)
  - "Client input required": mono label

Desktop: STICKY SPINE (ScrollTrigger pin: 1024px+)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[06] MAINTENANCE PLANS — Matrix Table
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT: Custom comparison matrix (NOT Stripe-style pricing cards)
SECTION MARKER: // MAINTENANCE PLANS

H2: "Own your web infrastructure."

TABLE STRUCTURE:
┌────────────────┬──────────┬──────────┬──────────┐
│ CAPABILITY     │ ESSENTIAL│  GROWTH  │  PARTNER │ ← plan-signal cells
├────────────────┼──────────┼──────────┼──────────┤
│ Response SLA   │   72h    │   24h    │   4h  ★  │
│ Updates/month  │    2     │    6     │ Unlimited│
│ Reporting      │    —     │ Monthly  │  Weekly  │
│ A/B Tests      │    —     │   incl.  │   incl.  │
│ CWV Monitoring │    —     │    —     │   incl.  │
└────────────────┴──────────┴──────────┴──────────┘

★ = accent color highlight cell

ANIMATION:
  - Row wipe: scaleX(0→1) stagger on entry, 60ms per row
  - Plan column hover: subtle --surface-2 lift + accent top border
  - Highlighted column (Partner): accent left seam always visible

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[07] TESTIMONIALS — Editorial Columns
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT: 3-column editorial (NOT boxed card grid)
  - Asymmetric heights (col 2 taller by 40px)
  - Each quote: large quotation mark in accent, body text,
    client name in Geist Mono, project outcome link below

NO: box shadows, cards, avatars in circles, star ratings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[08] FAQ — Accordion Rails
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT: Single column, max-width 840px centered
  - Radix UI Accordion primitive (accessible)
  - Open/close: GSAP height tween, 300ms ease
  - Active item: accent left border + subtle background lift

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[09] FINAL CTA DOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT: Asymmetric — 70/30 split
  - Left (70%): H2 "Let echo11 own your web presence, end-to-end."
                Sub-copy: 1 line
                [Book Strategy Call →] [Get a Proposal]
  - Right (30%): Stack signal list (Next.js, Vercel, GSAP, Three.js)
                 Each item: mono text, micro icon, hairline separator

BACKGROUND: --surface chassis panel, full-bleed
ACCENT: Top border 2px var(--accent)
PATH LIGHT: Traces through section entry from above
```

### 6.3 Services Page

```
PAGE: /services
SECTION MARKER: // SERVICE ARCHITECTURE

SECTIONS:
1. Hero: "Productized web architecture" — split layout,
   right canvas: crystalline-refraction glyph

2. Service Detail Expanded (one per service):
   LAYOUT: 57/43 split, alternating direction
   - Oversized service number (Geist Mono, 120px, opacity: 0.06)
   - H2 title, positioning sentence
   - Scope list (4-6 items, hairline separated, NOT bullet points)
   - Timeline badge: "Typical: 3-6 weeks" (mono, accent-bordered)
   - Technical stack callout (e.g., "Built on: Next.js + Vercel + GSAP")
   - Right: animated process diagram or canvas glyph variant

3. Capability Diagram:
   - SVG technical diagram showing stack integration
   - Animated: nodes activate on scroll, connecting lines draw
   - NO Venn diagrams or infographic-style icons

4. CTA Section:
   "Ready to scope your project?" + calendar embed (linear-style)
```

### 6.4 Work / Projects Page

```
PAGE: /work
SECTION MARKER: // SELECTED WORK

SECTIONS:
1. Hero: "Outcomes, not aesthetics." + filter nav
   Filters: [All] [SaaS] [Agency] [E-Commerce] [Creator]
   Filter behavior: GSAP layout transition (Motion.dev)

2. Project Grid:
   - Alternating split bands (57/43)
   - Full-bleed showcase every 3rd band
   - Canvas glyph variants per project (helix-scanner, sphere-scan, etc.)
   - On hover: metric panel slides from bottom of media (translateY 0←60px)
   - On click: full-page transition (cover wipe, accent color) → /work/[slug]

3. Project Detail Page (/work/[slug]):
   - Hero: full-width media, stats bar (3 metrics)
   - Challenge: 2-column editorial (problem / approach)
   - Before/After: slider component (custom, NOT a library slider)
   - Technical Stack: mono list with version badges
   - Results: 3 oversized metric chassis cells
   - Related projects: 2-up strip at bottom
```

### 6.5 Pricing Page

```
PAGE: /pricing
SECTION MARKER: // INVESTMENT

SECTIONS:
1. Hero: "Transparent pricing. No retainer traps."
   - Annual/Monthly toggle (GSAP morph on switch)
   - Savings callout: "Save 2 months on annual"

2. Plans Matrix: (see homepage section 06 - expanded version)
   - Add: "Most chosen" accent callout on Growth column
   - Add: hover tooltip on each feature (Radix Tooltip)

3. Project Packages:
   Three chassis panels (NOT cards):
   - Starter Build: scope + timeline range + price range
   - Full Platform Build: scope + timeline + price range
   - Custom Architecture: "Schedule a scoping call" → no public price

4. Add-On Rails:
   Service rails format for: SEO Infra, Analytics, Custom 3D Scene

5. FAQ Accordion

6. CTA: "Get a scoped proposal" → form modal (Radix Dialog)
```

### 6.6 About Page

```
PAGE: /about
SECTION MARKER: // STUDIO

SECTIONS:
1. Hero: "We build the web like the tools we use were built."
   - 62/38 split, right: Three.js sphere or rotating mesh

2. Philosophy Rails:
   3 editorial rails (NOT icon cards):
   - "Technical Luxury" — definition in 2 sentences
   - "Motion with Purpose" — animation philosophy
   - "Measurable Outcomes" — business obsession

3. Team:
   - Asymmetric bio layout (NOT LinkedIn-style avatar cards)
   - Name, role in Geist Mono
   - 1 measurable contribution (e.g., "Shipped 12 Lighthouse 100 sites")

4. Stack Credibility:
   - Logo strip: Next.js, Vercel, GitHub, GSAP, Three.js, Tailwind
   - NOT pill-shaped logo cloud — use horizontal rail with hairlines

5. Open Roles (if any) or Collab CTA
```

### 6.7 Contact Page

```
PAGE: /contact
SECTION MARKER: // INITIALIZE

SECTIONS:
1. Hero: "Define your trajectory."
   - Large display headline
   - Sub: "Most projects are scoped in a single call."

2. Contact Form (chassis panel):
   FIELDS (paneled, NOT stacked vanilla):
   - Project type: [Website Build / Maintenance / Strategy Call / Other]
     (segmented control, NOT dropdown)
   - Company/context: text input
   - Timeline: [ASAP / 1-3 months / 3-6 months / Flexible]
     (same segmented control pattern)
   - Budget range: [< $2k / $2-5k / $5-15k / $15k+]
   - Message: minimal textarea, max 280 chars
   - Submit: [Initialize Protocol →]

   FORM ANIMATIONS:
   - Field focus: accent left border appears (200ms)
   - Segmented control: indicator slides (spring physics)
   - Submit: loading state with GSAP dot pulse (3 dots)
   - Success: form dissolves, confirmation chassis panel rises

3. Digital Sovereign Architect (Scroll Section):
   - Lazy-loaded WebGL configurator (see blueprint section)
   - Scroll-jacked entry at 90% of form section
   - Fallback: static proposal CTA for reduced-motion

4. Contact Details:
   - Email in Geist Mono (hover to copy, tooltip confirmation)
   - Response time SLA: "Responses within 4 business hours"
   - Location: mono text, no map embed (performance)
```

### 6.8 Legal Pages

```
PAGES: /privacy, /terms, /accessibility
SHARED LAYOUT: --container-xs (720px max-width centered)

HEADER:
  - H1 + last-updated timestamp (Geist Mono, --muted)
  - Sidebar TOC: sticky left rail (desktop), hidden mobile
    TOC items: underline draw on hover, accent dot on active

BODY:
  - H2 sections: prefixed with §01, §02 (Geist Mono marker)
  - Body copy: --text-base, --leading-loose, max 70 chars/line
  - Key terms: Geist Mono, accent color, tooltip on hover

ANIMATION (minimal by design):
  - TOC active item: smooth indicator slide (position CSS)
  - Section entry: fade only (no Y transform — legal = clarity)

/accessibility specifically adds:
  - Reduced-motion demo toggle (live preview)
  - Focus-visible demo (keyboard tab through buttons)
  - Contrast ratio display per token
  - Screen reader announcement test
```

***

## PART 7 — INTERACTION SPECS

### 7.1 Cursor System

```javascript
// Custom cursor — active on desktop only
// Replaces default: 12px dot + 32px outer ring
// Hover state: outer ring morphs to accent color + scale(1.6)
// Click state: ring compresses scale(0.8) + releases
// CTA elements [data-cursor="hover"]: ring fills accent

// Reference: am-arc.com cursor interaction
// Implementation: pure CSS + JS delta tracking, NO heavy library
```

### 7.2 Hover State Specifications

```
BUTTONS:     translateY(-2px), 150ms ease. Border → accent. Scan sweep.
NAV LINKS:   underline scaleX 0→1, 180ms. --muted → --text.
SERVICE RAIL: left seam height 0→100%, 200ms. Background lift.
PROJECT BAND: metric panel rise, 250ms power2.out.
METRIC CELL: counter re-triggers. Accent glow intensifies.
CHASSIS PANEL: border-color → --line-mid. Shadow glow adds.
CTA DOCK:    path light traces towards button, 400ms.
```

### 7.3 Page Transitions

```javascript
// Inspired by: linear.app, am-arc.com
// Method: Next.js App Router + Motion (motion.dev) layout animations

// Pattern: Accent color wipe (left→right) on navigate
// Duration: 350ms cover, 250ms reveal (asymmetric)
// Fallback: opacity fade only (reduced-motion)

const pageVariants = {
  initial: { clipPath: 'inset(0 100% 0 0)' },
  animate: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.35 } },
  exit:    { clipPath: 'inset(0 0 0 100%)', transition: { duration: 0.25 } },
};
// Cover color: var(--surface)
```

***

## PART 8 — RESPONSIVE DESIGN SPEC

```
BREAKPOINTS:
  --bp-xl:   1440px  (widescreen, max container)
  --bp-lg:   1280px  (standard desktop)
  --bp-md:   1024px  (tablet landscape / collapse splits)
  --bp-sm:    768px  (tablet portrait / single column)
  --bp-xs:    480px  (mobile / compressed type)

DESKTOP (≥1280px):
  - Full asymmetric splits active (62/38, 57/43)
  - SVG path light fully active
  - Three.js wave at full resolution
  - Sticky process spine active
  - Metric chassis visible in all trust sections

TABLET (768–1279px):
  - Splits collapse to 55/45 → then single column at 1024px
  - Path light simplified (fewer nodes, lighter stroke)
  - Process spine loses sticky; scrolls naturally
  - Navigation: condensed to hamburger at 1080px

MOBILE (< 768px):
  - Single column throughout
  - Full-bleed media interruptions preserved (visual drama)
  - Three.js wave: particle count halved, no pointer reactivity
  - Service rails collapse to stacked blocks
  - Matrix table: horizontal scroll, sticky first column
  - Hero: CTA buttons stack vertically
  - CmdK: replaced by hamburger nav
  - Metric counters: still active
  - SVG path light: hidden (performance)
  - Canvas glyphs: single variant (sphere-scan only)

REDUCED MOTION (prefers-reduced-motion: reduce):
  - Remove: Three.js wave, path light animation, parallax
  - Remove: page transitions wipe, hero word stagger
  - Keep: counter animations, hover states, focus rings
  - Keep: accordion open/close (height only, no transforms)
  - All durations: max 200ms, opacity-only fallback
```

***

## PART 9 — PERFORMANCE BUDGET

```
CORE WEB VITALS TARGETS:
  LCP:  < 1.8s   (target 75th percentile, not average)
  INP:  < 150ms
  CLS:  0.00     (zero layout shift — non-negotiable)
  FID:  < 50ms
  TTFB: < 200ms  (Vercel edge deployment)

JS BUNDLE TARGETS:
  Initial JS:   < 80KB gzipped
  Three.js:     lazy-loaded, Suspense boundary, deferred by 3s
  GSAP:         code-split per page
  Total JS:     < 400KB gzipped across all chunks

IMAGE RULES:
  - next/image for ALL images (automatic WebP/AVIF)
  - Explicit width + height on all img tags (prevents CLS)
  - Blur placeholder on LCP images
  - Lazy-load all below-fold images

FONT RULES:
  - Geist: self-hosted via next/font (zero FOUT)
  - Geist Mono: subset to used characters only
  - display: swap

ANIMATION PERFORMANCE:
  - Use transform + opacity ONLY (no layout triggers)
  - will-change: transform on animated elements (selectively)
  - Three.js: pixelRatio capped at 1.5 on mobile
  - GSAP: use gsap.ticker, not requestAnimationFrame directly
  - IntersectionObserver: throttle canvas renders when off-screen
```

***

## PART 10 — CODEPEN REFERENCE LIBRARY

```
ANIMATION REFERENCES (to study and adapt — do not copy):

[SVG PATH LIGHT]
https://codepen.io/GreenSock/pen/JjByWjb
→ DrawSVG + MotionPath scroll scrub

[PARTICLE FIELD]
https://codepen.io/hakimel/pen/yoBNVq
→ Three.js particle system (adapt to wave config)

[MAGNETIC BUTTON]
https://codepen.io/nikhil8krishnan/pen/dMXgLK
→ Cursor magnet effect for CTAs

[TEXT REVEAL SPLIT]
https://codepen.io/GreenSock/pen/wvvjGgy
→ GSAP SplitText word/char stagger

[SCROLL TIMELINE SPINE]
https://codepen.io/GreenSock/pen/mdOgapG
→ Vertical progress bar + scroll scrub

[METRIC COUNTER]
https://codepen.io/chiragmandloi/pen/NWJQZPX
→ Animated number counter (adapt to Geist Mono)

[CHASSIS CLIP-PATH HOVER]
https://codepen.io/t_afif/pen/JjYwWWZ
→ Geometric clip-path hover reveal effect

[PAGE TRANSITION WIPE]
https://codepen.io/davidkpiano/pen/xLKBpM
→ Cover wipe transition (adapt to accent color)
```

***

## PART 11 — ANTI-PATTERN KILL LIST

The following patterns are **explicitly banned** in all Echo11 code. Any AI agent or developer generating these must be corrected immediately:

```
❌ BANNED PATTERNS:

VISUAL:
  - border-radius > 4px on any non-input component
  - Gradient backgrounds (linear-gradient on section BGs)
  - Glassmorphism outside the sticky header
  - Frosted glass cards (backdrop-filter on panels)
  - Pastel or low-contrast color schemes
  - Generic hero with centered headline + sub + button
  - 3-column symmetric feature card grid
  - Icon + title + body + button repeating cards
  - Floating cards with soft drop-shadows (box-shadow: 0 4px 24px rgba...)
  - Animated gradient text (background-clip: text)
  - Confetti, particle explosions, or decorative looping SVGs
  - Stock photography or generic illustrations
  - Animated blob backgrounds
  - Neon glow on large areas (only allowed on path traveler + CTAs)
  - Dark-mode as simple color-inversion (requires token system)

COPY:
  - "Learn More" CTAs
  - "Get Started" without specificity
  - "We are passionate about..." opening lines
  - Bullet points with checkmarks for features
  - Feature lists without measurable impact
  - Vague claims without numbers

MOTION:
  - Arbitrary infinite looping animations (e.g., floating blobs)
  - CSS animation: hover that doesn't respond to mouse-leave
  - Layout-triggering animations (width, height, margin, padding)
  - scroll-snap on non-controlled scroll experiences
  - Parallax that causes CLS or jitter on mobile
  - GSAP animations that don't check prefers-reduced-motion

STRUCTURE:
  - Mega-menu navigation
  - Sticky sidebar on mobile
  - Full-page scroll-jacking without accessible fallback
  - iFrames for testimonials or social proof
  - Third-party chat widget in DOM-blocking position
  - Cookie banners that block above-the-fold content on load
```

***

## PART 12 — THE MASTER BUILD PROMPT

> Copy this verbatim into Cursor, v0, Claude, or any agent with the skills.sh block prepended.

```
Build echo11.studio — a premium SaaS web studio platform using the
following exact technical and design specification.

═══ STACK ══════════════════════════════════════════════════════════
- Next.js 16.1.6 (App Router, TypeScript strict)
- React 19.2.3
- Tailwind CSS v4 (custom property token system, no Tailwind utilities
  for color — use CSS variables from the token sheet below)
- GSAP 3.14 (DrawSVGPlugin, MotionPathPlugin, ScrollTrigger, SplitText)
- Three.js 0.183 + React Three Fiber
- Motion (motion.dev) for page transitions + layout animations
- Radix UI (Dialog, Accordion, Tooltip, NavigationMenu primitives)
- Zustand (WebGL configurator state only)
- next/font: Geist + Geist Mono (self-hosted, zero FOUT)
- Vercel Analytics + Speed Insights

═══ DESIGN TOKENS ════════════════════════════════════════════════
Primary accent: #38BDF8
Background:     #050709
Surface:        #0D1117
Text:           #F2F7FF
Muted:          #8B98A9
Line:           #1A2638
Success:        #34D399
[Full token sheet: see PART 2 of Design System Documentation]

═══ VISUAL RULES ════════════════════════════════════════════════
1. NO rounded corners above 4px. Use clip-path chamfer instead.
2. NO gradient backgrounds. Depth via layered surfaces only.
3. NO symmetric 3-column card grids. Use editorial rails.
4. NO pill badges. Use inline mono text markers.
5. NO floating cards. Use chassis-panel geometry with edge borders.
6. ALL motion must respect prefers-reduced-motion.
7. Font: Geist (sans), Geist Mono (metrics, code, timestamps).
8. Layout: 14-column asymmetric grid. Splits: 62/38, 57/43.
9. One signature animation: SVG path light with GSAP DrawSVG.
10. Three.js: hero wave field only, lazy-loaded via Suspense.

═══ PAGE REQUIREMENTS ════════════════════════════════════════════

HOME (/):
  Hero: 62/38 split. Left: word-split GSAP headline stagger +
  dual CTAs + signal row. Right: Three.js wave field + SVG path
  light overlay + floating metric chassis cell.
  Sections in order: Trust Ribbon → Service Rails (4) →
  Project Bands (alternating 57/43, full-bleed every 3rd) →
  Process Spine (vertical, GSAP DrawSVG progress) →
  Maintenance Matrix Table (NOT pricing cards) →
  Editorial Testimonials → FAQ Accordion → Final CTA Dock.

SERVICES (/services):
  Expanded service rails with technical stack callouts.
  SVG capability diagram with animated node connections.

WORK (/work):
  Magazine gallery with filter nav (Motion layout transition).
  Per-project: canvas glyph variant, hover metric reveal.
  /work/[slug]: full detail with before/after slider.

PRICING (/pricing):
  Plans matrix table with signal cells. Add-on rails.
  Annual/monthly toggle with GSAP morph.

PROCESS (/process):
  Full-page vertical spine with sticky scroll choreography.

ABOUT (/about):
  Philosophy rails (NOT icon cards). Team bios asymmetric.

CONTACT (/contact):
  Paneled form (segmented controls, NOT dropdowns).
  WebGL Digital Sovereign Architect configurator (lazy).

LEGAL (/privacy, /terms, /accessibility):
  Sidebar TOC with sticky scroll tracking.
  Geist Mono section markers (§01, §02...).

═══ GLOBAL COMPONENTS ════════════════════════════════════════════
- StickyHeader: 60px, glass blur, Cmd+K palette, accent CTA
- CmdK Palette: Radix cmdk, spring animation, page + action items
- Footer: 3-column, hairline borders, SVG path trace, back-to-top
- CustomCursor: 12px dot + 32px ring, accent hover morph (desktop)
- ScrollProgress: 1px accent line at top of viewport
- PageTransition: accent cover wipe (Motion), 350ms

═══ ANIMATION SYSTEM ════════════════════════════════════════════
- Hero entrance: GSAP timeline (see Section 4.4 spec)
- Scroll reveals: [data-reveal] + [data-reveal-group] attributes
- Metric counters: IntersectionObserver + GSAP fromTo
- Path light: DrawSVG + MotionPath + ScrollTrigger.scrub
- Section markers: scaleX wipe on entry
- Hover: translateY(-2px) + border-color 150ms on all CTAs
- Page transitions: Motion clipPath wipe

═══ PERFORMANCE TARGETS ═════════════════════════════════════════
LCP < 1.8s | INP < 150ms | CLS = 0.00
Initial JS < 80KB gzip | Three.js lazy | GSAP code-split

═══ ACCESSIBILITY ════════════════════════════════════════════════
- WCAG 2.2 AA minimum (target AAA for text)
- All interactive elements: keyboard operable
- focus-visible rings: 2px accent offset ring
- aria-label on all icon-only controls
- Reduced-motion: opacity-only fallback throughout
- Min touch target: 44×44px on mobile

Generate the complete file structure, layout components, and all
sections per the spec. Begin with: tokens (globals.css), layout
shell (layout.tsx), global header,