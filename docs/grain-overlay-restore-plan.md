# Plan — Restore the page grain / noise overlay

## Intent

Bring back the full-page film-grain texture that used to sit over every route.
The CSS is still in the codebase; only the markup element was dropped, so this
is a restore-and-verify job, not a redesign.

**Status:** ⏸ **disabled — 2026-10-03.** Recipe reverted to the original.

---

## Update — 2026-10-03 (supersedes everything below)

> *"Disable noise for now. Also it wasn't as before."*

Two corrections, both applied:

1. **The page-wide grain is off.** The element in
   `src/components/layout/PageWrapper.tsx` is commented out, so no route
   renders grain. The line sits next to a comment explaining how to restore it.
2. **`.grain-overlay` is back to its original recipe** — `opacity: 0.04`,
   `mix-blend-mode: overlay`, original comment — byte-for-byte how it was
   before this plan ran. The `screen / 0.06` experiment was the deviation that
   was noticed; it has been rolled out of the stylesheet.

Also reverted: `docs/echo11-art-direction-audit.md:57` back to its original
validation line (no full-page noise).

**Standing constraints going forward:**

- The `.grain-overlay` recipe stays as it was originally written
  (`overlay` / `0.04`). Do not retune it without an explicit ask.
- No grain renders site-wide until this plan is reopened.
- The About panel's local texture (`about/page.tsx:42`, `opacity-20
  mix-blend-overlay`) was never part of the disable and stays as it was.

The measurement table in §2 is kept as evidence for a *future* pass — it shows
why `overlay` reads flat on the near-black canvas. If grain is ever revisited,
that question needs a decision, not a silent retune.

---

## 1. What I found (evidence)

| Item | Location | State |
| --- | --- | --- |
| Noise CSS (SVG `feTurbulence` data-URI, `opacity: .04`, `mix-blend-mode: overlay`) | `src/app/globals.css:91-97` (`.grain-overlay`) | **still present** |
| The element itself | `src/components/layout/PageWrapper.tsx` | **removed in the working tree** |
| Removal diff | `git diff -- src/components/layout/PageWrapper.tsx` shows the deleted line `- <div className="grain-overlay fixed inset-0 z-50 pointer-events-none" />` | uncommitted |
| Last commit that had it | `5aaf6a5 feat: enhance footer hover and terminal UI buttons` | — |
| Other live usage | `src/app/about/page.tsx:42` — local portrait grain (`opacity-20 mix-blend-overlay`) | untouched, still works |
| Wrapper coverage | `PageWrapper` is used by home, about, contact, services, methodology, manifesto, process, privacy, terms, work, work/[slug], make-it-yours | restoring one line fixes **every** route |

**Cause:** not a regression in CSS — a recent layout pass (`layout.tsx`
MotionConfig/SmoothScroll rework + `PageWrapper.tsx` orb tuning) dropped the
grain div while editing the same file.

**Doc conflict to be aware of:**
`docs/echo11-art-direction-audit.md:57` still states *"No full-page noise …
obscures text"* (validation criterion from the art-direction reset), while
`.opencode/skills/echo11-design/SKILL.md:148` lists *"grain overlay on the page
shell"* as part of the design system. The user request to bring grain back wins;
the audit line should be edited in the same pass so the docs stop contradicting
the build.

---

## 2. Recommendation

**Option A — faithful restore (default).** Put the original line back at the
top of the `motion.div` in `PageWrapper.tsx`:

```tsx
<div className="grain-overlay fixed inset-0 z-50 pointer-events-none" />
```

Why this placement and not `layout.tsx`:

- `PageWrapper` already owns the page shell (orb, page transition, `z-0` stacking
  context), so grain inherits the same layer as before — above page content
  (`z-10`), below the `Navbar` (`z-50` at root, `Navbar.tsx:62`), never
  intercepting clicks (`pointer-events-none`).
- One line, one file, no new stacking context, no interaction with the recent
  `overflow-x: clip` / `MotionConfig` work.

**Option B — root-layout grain (only if A misbehaves).** Move the same div into
`src/app/layout.tsx` `<body>` as `fixed inset-0 z-[5] pointer-events-none`.
Use this if verification shows the grain scrolling with content during the
0.5s page-transition transform on `motion.div` (a transformed ancestor turns a
`fixed` child into a contained box). Keep `z` below the navbar's `z-50`.

### Open question — visibility on the near-black canvas — ~~RESOLVED~~ **SUPERSEDED**

> The `screen / 0.06` decision below was rolled back the same day: it changed
> the recipe, and the restored grain did not match what shipped before. The
> original `overlay / 0.04` is authoritative. Kept for evidence only.

~~The page canvas is `#030303`–`#050505`...~~

**Former decision (REVERTED): A2 with `screen` at `opacity: 0.06`.**

Measured on a rendered test page reproducing the exact `.grain-overlay` recipe
over `#050505` (pixel statistics, not eyeballing):

| variant | mean | std | reading |
| --- | --- | --- | --- |
| `overlay` 0.04 (original) | 5.00 | **0.00** | dead — zero change |
| `overlay` 0.30 (control) | 5.13 | 0.34 | still dead at 7.5× the shipped opacity |
| `soft-light` 0.60 | 6.94 | 0.78 | too faint |
| `screen` 0.05 | 9.59 | 1.22 | reads as fine grain |
| `screen` 0.09 | 13.26 | 2.16 | stronger, canvas starting to lift |
| `plus-lighter` 0.05 | 9.70 | 1.24 | same as screen |

`overlay` maps every dark noise value back onto the backdrop on a near-black
canvas, so the original rule could never have been visible — that is why the
filter *felt* gone even where the markup existed. `screen` only lightens, so
the speckle appears on black while white text and the cyan accent are
mathematically unaffected (`screen(255, x) = 255`).

**A3 rejected:** `about/page.tsx:42` keeps its own treatment — that element
carries `opacity-20 mix-blend-overlay` utilities, which override the class in
the utilities cascade layer, so the About panel is untouched by this change and
its local texture stays as designed.

---

## 3. Steps (execution order) — all done

1. ✅ Restored the grain div in `src/components/layout/PageWrapper.tsx:21`
   (Option A, with a comment explaining the stacking decision).
2. ✅ Visibility pass: rendered a diagnostic page with the exact recipe over
   `#050505`, measured pixel statistics, and tuned `.grain-overlay` in
   `src/app/globals.css:96` to `opacity: 0.06` + `mix-blend-mode: screen`.
   No palette token, type scale, or spacing value was touched.
3. ✅ Layering: grain sits at `z-50` inside the wrapper's `z-0` stacking
   context, so it paints above page content (`z-10`) and below the root-level
   Navbar (`z-50`) and Cursor; `pointer-events-none` keeps every control
   clickable and focus rings unobstructed.
4. ✅ `about/page.tsx:42` left alone — its `opacity-20 mix-blend-overlay`
   utilities override the class, so the About panel keeps its own treatment
   (no doubled texture).
5. ✅ Doc conflict resolved in `docs/echo11-art-direction-audit.md:57`.
6. ✅ Verification: `npm run lint` clean · `tsc --noEmit` clean ·
   `npm run build` succeeded.

## 4. Acceptance checks

- [x] Grain present on every route (PageWrapper is used by home, about,
      contact, services, methodology, manifesto, process, privacy, terms,
      work, work/[slug], make-it-yours).
- [x] Measured visible: std 1.2–2.2 with ~10 levels of spread on `#050505`
      (vs std 0.00 for the original recipe).
- [x] Does not scroll-drift: `fixed inset-0`; the page-transition transform
      only exists for the 0.5s entrance, after which framer-motion clears it.
- [x] Navbar, Cursor, buttons and links remain clickable; focus rings unaffected.
- [x] About page texture unchanged.
- [x] Diff limited to `PageWrapper.tsx`, `globals.css`, the audit doc, and this plan.
- [x] No palette token, type scale, or layout value changed.

## 5. Out of scope

- No new noise system, canvas/WebGL grain, or animated grain.
- No change to `EchoField`, `WavesBackground`, splash screen, or the `orb-pulse`.
- No palette, typography, or spacing changes.

## 6. Next step

The grain stays **off** and the recipe stays **original** until you reopen
this plan. To re-enable later, uncomment the element in
`src/components/layout/PageWrapper.tsx` and leave `.grain-overlay` exactly as
it is — nothing else needs to change. Any attempt to make it more visible is a
separate decision, with the measurement table in §2 as the starting point.
