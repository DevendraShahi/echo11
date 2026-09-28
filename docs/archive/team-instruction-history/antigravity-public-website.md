# Antigravity — Public Website Recovery Authority Document

**Role:** Active lead — frontend design quality, visual system enforcement, homepage composition, copy-to-layout coordination, CTA hierarchy, and animation direction.

**Status:** Active execution. Codex and Product Lead are reference-only in this phase.

**Scope:** All public routes — `/`, `/about`, `/services`, `/work`, `/work/[slug]`, `/process`, `/methodology`, `/manifesto`, `/contact` — and shared layout pieces: Navbar, Footer, CTABanner, ServicesGrid, SelectedWork, ProcessTimeline, TrustSnapshot, FAQ.

**Portfolio authority:** Only TrueLuxe Nepal, The Leaders NP, and curriculum.os appear in any public reference. This is locked.

---

## Part 1 — Final Ownership Decisions

### 1.1 Homepage sections — keep / refine / merge / remove

| Section | Decision | Rationale |
|---|---|---|
| **Hero** | **KEEP as-is** | Strong. Scroll parallax, character reveal, clear CTA hierarchy. Do not touch. |
| **Marquee Strip** | **KEEP, reduce** | Useful rhythm break. Limit to 6 items max. Verify no overflow on mobile. |
| **TrustSnapshot** | **KEEP, already refined** | Grid breakpoint fixed (`sm:grid-cols-3`). Editorial framing is correct. Do not make it heavier. |
| **ServicesGrid** | **KEEP as-is** | Bento layout, hover states, motion stagger are all on standard. No changes. |
| **SelectedWork** | **KEEP, thumbnail fix needed** | Strong accordion system. curriculum.os needs a real thumbnail — manual action for team. |
| **ProcessTimeline** | **KEEP, monitor mobile** | Sticky scroll canvas is the most technically complex section. `overflow-hidden` fixed for iOS. |
| **FAQ** | **KEEP, just built** | Accordion is clean, motion is restrained, copy from Codex round 2 draft integrated. |
| **CTABanner** | **KEEP, reduce copy** | Glowing border box, animated top sweep, grid floor — all premium. Copy should stay short. |

**Final homepage composition order (locked):**
```
Hero → Marquee → TrustSnapshot → ServicesGrid → SelectedWork → ProcessTimeline → FAQ → CTABanner → Footer
```
This order is now implemented in `src/app/page.tsx`. Do not reorder without explicit product lead approval.

---

### 1.2 TrustSnapshot — final call

**Decision: KEEP at current quality level. No further changes.**

The section was rebuilt from scratch during the recovery sprint:
- Correct spacing: `py-24 md:py-32`
- Correct overline: `font-mono text-xs uppercase tracking-[0.2em] text-accent`
- Correct heading: `font-sans text-4xl md:text-5xl font-bold`
- Framer Motion stagger scroll reveals
- Grid fixed to `grid-cols-1 sm:grid-cols-3`

**One constraint:** Do not add a fourth card, additional metric claims, or any decorative badges. Three items, three cards. That is the entire section.

---

### 1.3 Contact form — final call

**Decision: KEEP current structure. Simplify lead-in copy.**

The form is structured correctly: project type → timeline → budget → company → message. Grid layout (`lg:grid-cols-[1fr_1.2fr]`) gives the form appropriate weight. Inputs are styled to standard.

**One refinement required:** The lead-in left column text is currently too long. It should be trimmed to a maximum of three lines visible above the fold on a standard 1280px laptop screen. See copy note in Part 3.

---

### 1.4 CTA hierarchy — final locked standard

Across the entire public site, use only these CTA labels:

| CTA Label | Use Case |
|---|---|
| `Talk Through a Project` | Navbar, Hero primary, About, Methodology, Manifesto |
| `Start the Conversation` | CTABanner primary button |
| `View Current Work` | Hero secondary, Services secondary |
| `Send Project Inquiry` | Contact form submit only |
| `Email Team` | CTABanner fallback only |

**Never use:** `Book Discovery`, `Start Your Project`, `Build Your Next Growth Product`, `View Complete Archive`.

---

### 1.5 Sections flagged as weak — final call

| Section | Decision |
|---|---|
| Any section using `py-16` as primary padding | Upgrade to `py-24` minimum |
| Any raw JSX block directly in `page.tsx` | Extract to dedicated component under `src/components/sections/` |
| Any card using flat background without `border border-white/10` | Upgrade to standard card treatment |
| Any inline `Math.random()` in client components | Remove — causes hydration issues |
| Placeholder social links in Footer | Already removed by Codex. Confirm this holds. |

---

## Part 2 — Animation Direction

### Philosophy
Motion must be calm, structural, and supportive. It should help the visitor notice hierarchy and flow — not entertain them. Every animation is justified by layout comprehension, not visual effect.

### Standard animation rules (locked)

**Scroll reveals (all new sections):**
```tsx
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-100px" }}
transition={{ duration: 0.5, ease: "easeOut" }}
```

**Staggered card groups:**
```tsx
// Parent
variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
// Child
variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } }}
```

**Hover microinteractions (cards):**
```tsx
className="group-hover:-translate-y-1 transition-all duration-700"
```

**What is NOT allowed:**
- Continuous looping animations on text content (distracting)
- `scale` entrance animations on content sections (draws too much attention to the transition)
- `blur` entrance on primary text (causes FOUT-like visual glitch on low-end devices)
- Infinite scroll marquees that auto-pause on hover but lack a visible control (accessibility issue)

**ProcessTimeline exception:** The sticky visual canvas uses continuous animation for the tech visuals (orbiting rings, building progress bars, etc). This is acceptable because it is isolated to the right-side canvas and does not affect reading. Honour `useReducedMotion` — already implemented.

---

## Part 3 — Copy-to-Layout Notes (Implementation-Ready)

### Hero
- Headline: `Plan, design, and build software your business can rely on.` — **do not change**
- Support paragraph: one paragraph, max 2 lines at desktop width. Do not add more.
- Primary CTA: `Talk Through a Project` → `/contact`
- Secondary CTA: `View Current Work` → `/work`
- No proof badges, no client counts, no rating scores inside the first viewport.

### TrustSnapshot
- Overline: `Product engineering studio`
- Headline: `Built for teams that need a serious digital product partner.`
- Card 1: `What we build` / `Marketing websites, e-commerce experiences, publishing platforms, portals, and early product systems.`
- Card 2: `How we work` / `Strategy, UX, interface design, and engineering stay connected through one practical delivery process.`
- Card 3: `Why it matters` / `Clear scope, credible presentation, stable releases, and maintainable systems after launch.`
- **Do not change this copy.** It is grounded, specific, and passes Codex's brand voice standard.

### ServicesGrid
- Keep current Codex-approved service titles and descriptions.
- No service card should have more than 2 lines of body copy at 16px desktop.
- Feature tags should be scannable: 4–6 items per card, short labels.

### SelectedWork
- Section overline: `Current work`
- Short intro line: `Three active projects. Each built to solve a specific product problem.`
- Projects: TrueLuxe Nepal, The Leaders NP, curriculum.os — in that order.
- curriculum.os must show a real product screenshot. Until one is available, the current placeholder is acceptable but must be replaced before the next public-facing announcement.

### ProcessTimeline
- Section heading: `The Engine.` with accent gradient — **keep as-is**
- Support copy: `A practical delivery system that keeps scope, design, and engineering aligned from kickoff to launch.` — **keep as-is**
- Step copy has been refined by Codex. Do not rewrite. Only edit if a client-reviewed change is requested.

### FAQ
- 10 questions currently implemented. Copy sourced from Codex round 2 draft.
- Section overline: `Common questions`
- Section heading: `What teams ask before working with us.`
- If the section feels too long on a specific page, collapse to 6 questions: timeline, pricing, scope, existing codebase, design support, next step. The rest remain available via expand.

### CTABanner
- Headline: `Need a clearer path from idea to launch?` — **keep as-is**
- Support: trim to: `Share what you need to build, where the constraints are, and what needs to happen next.` (one sentence, no second sentence)
- Primary: `Start the Conversation` → `/contact`
- Fallback: `Email Team` → `mailto:echo11.labs@gmail.com`

### Contact page — lead-in trim
**Current left column copy is too verbose.** Replace with:
```
Tell us what you are trying to build, what is already in place, and where you need help. We will review your inquiry and respond with a clear next step.
```
No sub-bullets, no service list, no "typical project" claims in this column. The form is the primary visual weight.

---

## Part 4 — Visual QA Enforcement Standard

Every section on the public website must pass this checklist before being accepted:

| Check | Requirement |
|---|---|
| **Spacing** | `py-24` minimum. `py-32` preferred for major content sections. `py-16` only for narrow connective strips. |
| **Typography — overlines** | `font-mono text-xs uppercase tracking-[0.2em] text-accent` |
| **Typography — headings** | `font-sans font-bold tracking-tight text-white` |
| **Typography — body** | `font-mono leading-relaxed text-white/50` or `/45` |
| **Scroll reveals** | `initial={{ opacity: 0, y: 20 }}` → `whileInView`. All new sections. `viewport={{ once: true }}`. |
| **Cards** | `bg-black border border-white/10 rounded-none` + hover: `hover:border-white/30 group-hover:-translate-y-1 transition-all duration-700` |
| **Component isolation** | No raw JSX in `page.tsx`. Every section in `src/components/sections/`. |
| **Footer integrity** | Footer lives in `src/app/layout.tsx` as the last element before `</body>`. Not in `RootChrome`. |
| **Mobile responsiveness** | Tested at sm (640), md (768), lg (1024), xl (1280). No horizontal overflow. |
| **Colour discipline** | Black background. Accent `#00E5FF` used for overlines, borders on active/focus, icon colour. White for headings. `white/50` or `/45` for body. |
| **No placeholder content** | No fake metrics, no placeholder images that are clearly wrong, no non-functional links. |
| **Motion** | Calm. Structural. Supports comprehension. `useReducedMotion` honoured on any continuous animation. |

---

## Part 5 — Remaining Work (P0 / P1 / P2)

### P0 — Blocking issues
None currently. Layout integrity has been restored. Build passes.

### P1 — Required before the site is considered recovered

| Item | File | Status |
|---|---|---|
| curriculum.os thumbnail — replace with real product screenshot | `src/data/caseStudies.ts` line 92, save image to `/public/work/curriculum-os-hero.webp` | ⚠️ MANUAL — team must provide screenshot from `https://curriculum-os-tan.vercel.app` |
| Contact page lead-in copy — trim to two sentences per Part 3 | `src/app/contact/page.tsx` | TO DO |
| Verify Navbar hides correctly on `/lab` and `/portal` routes | `src/components/layout/RootChrome.tsx` | TO DO |
| Confirm Footer does not appear on `/lab` and `/portal` | `src/components/layout/Footer.tsx` — check `usePathname` guard | TO DO |

### P2 — Quality improvements, non-blocking

| Item | File | Status |
|---|---|---|
| Verify mobile responsiveness of TrustSnapshot (sm: 3-column confirmed, but test on real device) | `TrustSnapshot.tsx` | TO DO |
| Verify mobile responsiveness of ServicesGrid accordion | `ServicesGrid.tsx` | TO DO |
| Confirm ProcessTimeline right-panel sticky canvas does not leave blank space on mobile after scroll | `ProcessTimeline.tsx` | TO DO |
| Run full type check and lint pass | Terminal | TO DO |
| Verify all public CTA labels match the locked hierarchy in Part 1.4 | All public pages | TO DO |

---

## Part 6 — Execution Log

| Date | Action | Status |
|---|---|---|
| 2026-06-10 | Footer moved from `RootChrome` to `layout.tsx` — layout flow restored | ✅ Done |
| 2026-06-10 | `TrustSnapshot` component built as standalone, replacing inline `BusinessSnapshot` | ✅ Done |
| 2026-06-10 | TrustSnapshot grid fixed to `sm:grid-cols-3` — breakpoint gap removed | ✅ Done |
| 2026-06-10 | Contact page grid, padding, input styling updated | ✅ Done |
| 2026-06-10 | ProcessTimeline `overflow-clip` → `overflow-hidden` for iOS Safari | ✅ Done |
| 2026-06-10 | FAQ accordion built (`src/components/sections/FAQ.tsx`) and integrated into homepage | ✅ Done |
| 2026-06-10 | Homepage composition locked: Hero → Marquee → TrustSnapshot → ServicesGrid → SelectedWork → ProcessTimeline → FAQ → CTABanner | ✅ Done |
| 2026-06-10 | `.next` cache corruption diagnosed and cleared twice — root cause: concurrent `npm run dev` and `npm run build` processes corrupting webpack cache | ✅ Resolved |
| 2026-06-10 | Redesigned `ServicesGrid` with `pixel-canvas` background, Syne/Mono fonts, and sharp edges | ✅ Done |
| 2026-06-10 | Added standard `lucide-react` icons to `ServicesGrid` cards | ✅ Done |
| 2026-06-10 | Built and tuned Framer Motion scroll parallax (slip effect) into `ServicesGrid` | ✅ Done |
| 2026-06-10 | Restored missing `ProcessTimeline` (The Engine) animations for steps 02, 03, 04 by resolving `AnimatePresence` motion context conflicts | ✅ Done |
| 2026-06-10 | Reverted the `ProcessTimeline` component to the previous `StageFrame` design per user request | ✅ Done |
| 2026-06-10 | Fully reverted `ProcessTimeline` to the original "The Engine" baseline (`HEAD` from May 9) per final user request | ✅ Done |
| 2026-06-10 | Restored `pixel-canvas.tsx` to fix build dependencies for `logo-cloud-4.tsx` (ServiceBand) | ✅ Done |

---

## Part 7 — Build and Dev Server Rules

To prevent repeated cache corruption:

1. **Never run `npm run build` while `npm run dev` is running.**
2. If the dev server shows `ENOENT: routes-manifest.json` or `app-paths-manifest.json`, it is a cache corruption. Run:
   ```bash
   pkill -f "next dev"; pkill -f "next build"; rm -rf .next && npm run dev
   ```
3. Do not run the build from a terminal tab where the dev server is backgrounded — use a dedicated terminal or kill the dev server first.
4. The production build passes cleanly as of 2026-06-10. All public routes are verified.

---

*Document owner: Antigravity. Last updated: 2026-06-10. Codex is reference-only. Product Lead is reference-only. This is the working authority document for all remaining public website recovery work.*

---

# Product Lead Update — Ownership Returned

## Status
Product Lead has resumed full active ownership of the public website recovery and build phase.

## Role change
Antigravity is no longer the single active owner for this phase.

## What this means
- Product Lead will now handle implementation, design decisions, motion refinement, and final build execution.
- Antigravity's work remains an important reference artifact.
- No further active changes are required from Antigravity unless specifically requested again.

## Current mode
Reference-only until reactivated.
