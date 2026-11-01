# Echo11 Phase 3 — route-by-route refinement plan

**Date:** 2026-10-01 · **Status:** in progress
**Basis:** `echo11-page-anatomy.md` judged against a live DOM survey of each route (section sequence, heading outline, links, images), not against the doc's proposed IA wholesale.

**Ground rules:** preserve the dark/cyan identity, hero wave field, Work accordion, sticky process engine, contact wizard, Make It Yours tabs. Targeted edits only; no new libraries, placeholder content, metrics, or testimonial material. Every slice ends with `npm run lint`, `npx tsc --noEmit`, and browser checks (375/768/1280 where changed, plus 200% zoom and reduced-motion for refined routes).

## Correctness gaps (Slice A — done)

| Route | Gap | Fix |
| --- | --- | --- |
| `/methodology`, `/manifesto`, `/work/[slug]` | no `<main>` | wrapped page children in `<main>` (checked: no nesting, mains = 1) |
| `/services` vs `/process` | five-phase chips vs four real stages | chips + heading now use `ProcessTimeline.steps` (01–04, same titles); heading "Four-Phase Delivery Model" |
| `/methodology` | unverified "50+ Projects Shipped" | replaced with nonnumeric, verifiable "Live / Products in Production"; no numeric claim remains |

## Route plan

### 1. `/process` — clearest gaps (first refinement slice)
- No `<main>`, no `<h1>` (page starts at `h2 "The Engine."`).
- No next-step CTA inside the page (anatomy P5).
- **Keep:** the sticky engine, stage content, orbs.
- **Do:** add `<main>` in `process/page.tsx`; render `h1` when `standalone`; add one concise contact CTA after the engine.

### 2. `/work` — thin page, no bridge
- 61 words in `main`; no `/contact` or services bridge (anatomy W4); no intro framing (W1).
- Heading skip: `h1` → project `h3` with no `h2`.
- **Do:** one factual intro line under the H1; project titles become `h2` in standalone mode; closing CTA bridge to `/contact` (reuse existing CTA language, no new claims).

### 3. `/services` — hierarchy polish
- `h2` offer → `h4 "Deliverables"` skips `h3` (×4).
- **Do:** `h4` → `h3`; verify FAQ questions are keyboard-operable; keep offer content, four-phase band, tech stack.

### 4. `/work/trueluxe` (template for case studies)
- Verify "Outcomes We Tracked" metrics — pre-existing numeric results in `caseStudies.ts` without in-repo provenance → **owner decision, flag; do not silently edit**.
- Check reading width, media alt, empty second section, prev/next keyboard access.

### 5. `/contact`
- Privacy link missing near submission (anatomy CT4); mailto fallback exists.
- **Do:** add privacy link by the submit step; preserve the wizard exactly otherwise.

### 6. Home `/`
- Structurally sound (hero → marquee → expertise → work → engine → make-it-yours → CTA).
- **Do:** verify accordion keyboard operation, section rhythm consistency, 200% zoom; only edit where a measured defect exists.

### 7. `/about`
- h1 → terminal → architecture; hierarchy OK; one contact CTA.
- **Do:** minimal — a11y/zoom checks only unless a defect appears.

### 8. `/make-it-yours` (owner's new page)
- Strong: 7 sections, clean h1→h2→h3, tab semantics present, reduce-motion handled.
- **Do:** verification only (tabs keyboard, zoom, reduced motion) unless a defect appears.

## Cross-cutting checks per refined route
Keyboard nav + visible focus · touch where relevant · reduced-motion content availability · heading/landmark structure · 200% zoom · media/no-WebGL fallbacks (hero waves have a reduced-motion/static path).

## Environment
Single `next dev` on :3000; an external terminal has repeatedly spawned a competing `next dev` against this checkout (4× so far) — `_next/static/chunks` 404 storms mean shared-`.next` conflict: kill the duplicate, `rm -rf .next`, restart, re-verify. Production build stays blocked at prerender by missing Supabase env (compilation + types pass).
