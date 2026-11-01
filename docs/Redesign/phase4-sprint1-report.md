# Phase 4 - Sprint 1 report: Home & Work

> **Superseded.** This direction was rejected as a generic AI-agency/system-dashboard look. The rebuild is recorded in [phase4-art-direction-reset.md](./phase4-art-direction-reset.md). This file is kept only as a record of the rejected pass.

**Status:** rejected. Retained for reference.

**Direction:** *Signal & Structure* — see [phase4-art-direction.md](./phase4-art-direction.md). One signature moment (the hero wave framed as a bounded artifact), everything else quiet; cyan as punctuation, not atmosphere.

---

## Evidence

| Route | Before | After |
| --- | --- | --- |
| Home — desktop | [before/home-1280.png](./screenshots/before/home-1280.png) | [after/home-1280-full.png](./screenshots/after/home-1280-full.png), hero [after/home-1280-hero.png](./screenshots/after/home-1280-hero.png) |
| Home — mobile 375 | [before/home-375.png](./screenshots/before/home-375.png) | [after/home-375-full.png](./screenshots/after/home-375-full.png), hero [after/home-375-hero.png](./screenshots/after/home-375-hero.png) |
| Work — desktop | [before/work-1280.png](./screenshots/before/work-1280.png) | index [after/work-1280-index.png](./screenshots/after/work-1280-index.png), closed [after/work-1280-closed.png](./screenshots/after/work-1280-closed.png), open row [after/work-1280-open-trueluxe.png](./screenshots/after/work-1280-open-trueluxe.png) |
| Work — mobile 375 | [before/work-375.png](./screenshots/before/work-375.png) | [after/work-375-full.png](./screenshots/after/work-375-full.png) |

---

## What changed visually

### Home hero
- **Was:** fully centred stack — badge, headline, paragraph, two buttons — with the animated wave field as a full-bleed wash sitting *behind* the text, dimming contrast and reading as ambient decoration.
- **Now:** asymmetric 12-column editorial opening. Headline occupies columns 1–7 (588 px at 1280), left-aligned in three deliberate lines — "We engineer / digital products / people trust." (rendered at 73.6 px / −3.31 px tracking, exactly three lines — verified). A mono eyebrow rail sits above it; the paragraph is capped at 46ch and left-aligned under the headline.
- **Wave field** is now a **bounded artifact panel** in columns 6–12: a 16:10 object with a hairline frame, an in-frame meta bar reading `SIGNAL FIELD ······ LIVE`, and its own border. It reads as a *deliberate showpiece*, not wallpaper — ambient cyan behind the text is gone.
- **CTAs** differentiated: a cyan primary with a button-in-button arrow circle ("Start a project"), and a quieter outline secondary ("See selected work").
- **Meta rail** below the fold-line: `Focus / Engagement / Studio` in a three-column `<dl>` with mono labels — real information, not a badge.
- Headline lines animate with a masked reveal that respects `prefers-reduced-motion`.

### Section rhythm (Home)
- Marquee rebuilt from a busy scrolling strip into a **thin hairline band**: mono 11 px uppercase at 45 % white, hairline vertical separators, hairline top/bottom borders, with a new left accent label ("Sectors we ship into"). It now separates the hero from the index instead of competing with it.

### Selected work (Home + Work index)
- **Was:** a repeating card grid, project imagery dimmed/desaturated until hover, identical reveal on every card.
- **Now:** an **editorial numbered index**. Each project is a full-width hairline-separated row: cyan index numeral (`01`–`06`), large Syne title as a real link, mono category, and two controls — a `Preview/Hide` toggle (`aria-expanded`/`aria-controls`) and an external-link icon button. A persistent left meta rail reads `02 — Selected work` (Home) or `Portfolio index` (Work).
- **Expansion** is a single double-bezel framed live preview (outer hairline shell `p-1.5`, inner 16:10 frame) shown in **full colour, object-top** — the desaturation-until-hover treatment is gone. An in-frame meta bar carries `category ······ Live site ↗`, next to a `42ch` description and "View case study" / "Open live site" actions.
- **Work index** opens the first project by default so the page leads with real imagery; the radial cyan wash behind the heading is reduced to a corner gradient.

### Inner-page orb
- `PageWrapper`'s cyan orb reduced (h-800→h-520, w-1200→w-1000, opacity 80→35, blur 80→110) so inner pages share the quieter Home atmosphere.

---

## Files / sections substantially changed

- [src/components/sections/Hero.tsx](src/components/sections/Hero.tsx) — full rewrite (asymmetric grid, framed wave panel, masked headline reveal, meta rail).
- [src/components/sections/ServicesGrid.tsx](src/components/sections/ServicesGrid.tsx) — rewritten from 4 equal cards to a numbered editorial capability index (meta rail, hairline rows, per-row arrow).
- [src/components/sections/SelectedWork.tsx](src/components/sections/SelectedWork.tsx) — full rewrite to the editorial index with per-row preview toggle and framed media; still serves `/work` via `standalone`.
- [src/components/ui/Marquee.tsx](src/components/ui/Marquee.tsx) — restyled hairline band + `label` prop.
- [src/app/page.tsx](src/app/page.tsx) — Marquee label wired up.
- [src/components/layout/PageWrapper.tsx](src/components/layout/PageWrapper.tsx) — orb restraint.

---

## Mobile behavior (its own composition, not a shrink)

- **Hero:** eyebrow rail → headline → paragraph → **full-width stacked CTAs** → meta rail becomes a single-column stacked list. The wave artifact panel moves **below the copy** at full width, keeping the first screen text-first.
- **Capability index:** numerals dropped to a compact inline marker; rows become title + summary; the row arrow is hidden (`hidden md:block`) and the feature list truncates.
- **Work rows:** numeral + title + category stack; both `Preview` and external-link controls remain visible and reachable; the expanded media goes full width. Verified at 375 px: 6 toggles and 7 external links visible, no horizontal overflow.

---

## Checks run

- `npm run lint` — 0 problems.
- `npx tsc --noEmit` — 0 errors.
- Browser verification (Home + `/work`, 1280 / 375 / 640 reflow):
  - `main` = 1, `h1` = 1 on every route/width; horizontal overflow = 0; broken images = 0.
  - Home hero renders exactly the 3 intended lines (no accidental 4th-line wrap).
  - **All 6 Preview toggles** open/collapse correctly; panels expand to ~548 px and hero images load (`naturalWidth` 793); the one project without a hero asset shows the "Preview pending" placeholder as designed.
  - **Keyboard:** Tab traversal reaches the project title link, Preview toggle, external-link button, "View case study", and "Open live site". Every one shows a visible cyan focus ring (`box-shadow … rgb(0,229,255) …`), and nav links show the global `2px solid #00e5ff` outline.
  - **Reduced motion** (`prefers-reduced-motion: reduce`): content stays fully present and visible; no content dependency on animation.
  - **Narrow reflow (200 %-zoom proxy, 640 px):** no overflow on Home or `/work`.
  - **0 console errors, 0 failed requests** across all passes.

## Regressions

None observed. The earlier "transparent focus outline" reading was an artifact of measuring `outline` on controls that use Tailwind `ring` (box-shadow); the rings render.

---

## Remaining visual weaknesses (candidates for Sprint 2+)

- The wave panel's particle field reads more like a scatter than a flowing wave at 1280 — worth a composition/scale pass.
- Section pacing between the capability index and the work index is close; the alternation is subtle.
- Work rows: on mobile the category and controls can crowd the title at very small widths.
- Case-study metric provenance (TrueLuxe / Prika / Leaders figures) is still unresolved — must not be published as verified; a Sprint 2 decision for the owner.
