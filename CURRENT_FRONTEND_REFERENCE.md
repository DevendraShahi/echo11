# echo11 Frontend Reference

This document captures the current frontend implementation for `echo11-web` as it exists in code today.  
Use it as the source of truth for stack decisions, visual system consistency, and future feature additions.

## 1) Core Tech Stack

- Framework: `Next.js 16.1.6` (App Router)
- UI runtime: `React 19.2.3`
- Language: `TypeScript` (`strict: true` in `tsconfig.json`)
- Styling model: `Tailwind CSS v4` + custom global CSS system in `src/app/globals.css`
- Bundling/runtime config: `next.config.ts` with `reactCompiler: true`
- Linting: `ESLint 9` + `eslint-config-next` (`core-web-vitals` + TypeScript presets)
- PostCSS: `@tailwindcss/postcss`

## 2) Libraries in Use

- `gsap@^3.14.2`
  - Used for hero entrance choreography in `src/components/hero-stage.tsx`
  - Handles ordered reveal timeline for backdrop, copy, CTAs, and signal row
- `three@^0.183.1`
  - Used for the hero WebGL wave field in `src/components/waves-background.tsx`
  - Renders particle-grid waves with pointer-reactive rotation
- `next/image`
  - Used for optimized brand asset rendering in the header

## 3) Project Structure (Frontend-Specific)

- `src/app/layout.tsx`
  - Global layout, metadata, and font setup (`Geist`, `Geist Mono`)
- `src/app/page.tsx`
  - Homepage composition, section data models, and semantic content structure
- `src/app/globals.css`
  - Visual tokens, component classes, layout system, responsive breakpoints, and reduced-motion fallback
- `src/components/hero-stage.tsx`
  - Hero messaging, CTA blocks, and GSAP reveal sequence
- `src/components/waves-background.tsx`
  - Three.js animated background plane (wave particles)
- `src/components/circular-systems-showcase.tsx`
  - Canvas-based technical motion glyph visuals used in project preview media areas

## 4) Current Homepage UX Architecture

The homepage is a single premium narrative funnel designed around conversion + trust:

1. Sticky Header
- Brand mark
- Primary nav anchors (`Services`, `Work`, `Process`, `Plans`, `Contact`)
- High-intent CTA (`Book a Call`)

2. Hero Opening
- Full-viewport opening stage
- Three.js animated wave field
- High-impact headline and authority framing copy
- Dual CTAs (`Book Strategy Call`, `See Success Stories`)
- Supporting signal row + scroll cue

3. Trust Ribbon
- High-level credibility statement
- Three performance/proof metrics

4. Service Architecture Section
- Editorial “service rails” instead of generic feature-grid cards
- Each rail includes strategic angle, delivery detail, measurable impact, CTA

5. Project Preview Section
- Alternating split project bands
- Left/right rhythm inversion for visual tempo
- Embedded animated motion glyph visuals as technical media
- Outcome metrics shown in custom metric chassis cells

6. Operating Model Section
- Vertical process spine (`01` to `04`) with clear operational ownership narrative

7. Maintenance Plans Section
- Matrix table (not standard pricing cards)
- Custom signal cells (`muted`, `base`, `plus`, `priority`) for capability differentiation

8. Final Conversion Section
- Strong close CTA with primary + secondary actions

## 5) Visual Design System (Current)

### Color Tokens (`:root`)

- `--bg: #070b11`
- `--bg-2: #0a121d`
- `--surface: #0f1826`
- `--surface-2: #101d2e`
- `--line: #223147`
- `--line-strong: #345173`
- `--text: #e8eef7`
- `--muted: #97a6bc`
- `--accent: #3dd6ff`
- `--accent-2: #6ef2cf`
- `--shadow-panel: 0 20px 56px rgba(4, 10, 22, 0.55)`

### Typography

- Primary UI font: `Geist` (`--font-geist-sans`)
- Mono utility font: `Geist Mono` (`--font-geist-mono`)
- Headline sizing via clamp scales (`hero-headline-opening` maxes at premium display size)
- Consistent uppercase marker style for section labels (`.section-marker`)

### Shape Language and Surfaces

- Chiseled/chamfered surfaces via `clip-path` polygons (key premium motif)
- Hairline and medium-strength borders in blue-steel tones
- Layered dark gradients instead of flat fills
- No rounded badge-pill visual language
- Reusable surface archetypes:
  - `.chassis-panel`
  - `.metric-chassis`
  - `.plan-signal` variants

### Layout System

- Container rule: `width: min(1240px, calc(100% - 2.8rem))`
- Sticky glass header with blur and translucent backdrop
- Asymmetric alternating content bands
- Section rhythm built with clamp-based spacing (`.section-block`)

## 6) Motion and Interaction System (Current)

### GSAP Hero Sequence

- Timeline-driven staged reveal in `HeroStage`:
  - Background layer scale/opacity
  - Kicker
  - Headline
  - Body
  - CTA row
  - Signal list
  - Scroll cue
- Motion respects `prefers-reduced-motion`

### Three.js Hero Background

- Particle field constants:
  - `SEPARATION = 34`
  - `AMOUNT_X = 80`
  - `AMOUNT_Y = 58`
- Dynamic sinusoidal y-axis wave displacement
- Additive blending for luminous look
- Pointer movement rotates the particle plane for depth response

### Canvas Motion Glyphs (Project Media)

- Runtime-driven 2D canvas visuals with requestAnimationFrame
- IntersectionObserver throttles rendering when out of view
- Implemented variants:
  - `sphere-scan`
  - `crystalline-refraction`
  - `sonar-sweep`
  - `helix-scanner`
  - `interconnecting-waves`
  - `cylindrical-analysis`
  - `voxel-matrix-morph`
  - `phased-array-emitter`
  - `crystalline-cube-refraction`

### CSS Motion

- Hover lift interactions on action controls
- Signal sheen animation for plan cells (`@keyframes signal-glide`)
- Smooth-scroll enabled globally (`html { scroll-behavior: smooth; }`)

## 7) Responsiveness Rules in Production

- Breakpoint: `1080px`
  - Collapses major split grids to single column
  - Hides desktop nav
  - Keeps hero full-height behavior tuned for smaller header
- Breakpoint: `720px`
  - Tightens container gutters
  - Compresses hero type scale and spacing
  - Converts trust/project metric grids to single-column flow
  - Hides scroll cue for clarity
- Reduced motion mode:
  - Global animation/transition durations collapsed
  - Three.js and canvas visuals render static-safe behavior

## 8) Accessibility and Quality Controls

- Semantic landmarks: `header`, `main`, section IDs for anchor nav
- Keyboard-visible focus states on interactive elements
- `aria-label` usage for primary nav and studio signal row
- `prefers-reduced-motion` support in JS and CSS layers
- High-contrast text hierarchy on dark surfaces

## 9) Design Intent Summary

The current implementation intentionally avoids “common SaaS template” output and instead uses:

- Editorial service rails over generic feature card grids
- Asymmetric project bands over repetitive uniform blocks
- Chassis/panel geometry and technical seam language
- Purpose-driven motion for hierarchy and perceived engineering quality
- Premium dark technical aesthetic aligned with the project blueprint

## 10) Practical Extension Rules

When adding new sections/components, keep these constraints:

- Reuse current tokens before introducing new colors or shadow styles
- Preserve chamfered geometry language (not soft rounded defaults)
- Keep motion purposeful; avoid decorative infinite effects without utility
- Maintain conversion hierarchy (proof -> clarity -> CTA)
- Continue alternating composition rhythm instead of repeated identical blocks

