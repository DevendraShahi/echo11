# Phase 4 art-direction reset

Sprint 1 was rejected as a generic AI-agency/system-dashboard look. This replaces it.

**Design read:** a redesign of an independent product studio's public site for founders evaluating a build partner, with a cinematic editorial language, leaning toward Tailwind + Syne/JetBrains Mono + Motion + a Three.js signal field.

**Dials (redesign, overhaul):** DESIGN_VARIANCE 9, MOTION_INTENSITY 8, VISUAL_DENSITY 3.

**Brand lock:** dark surfaces, cyan `#00E5FF` as punctuation only, Syne + JetBrains Mono, sharp geometry (`rounded-none`), one accent, one theme.

## Principles to borrow (not copy)

- A hero that is a **full-viewport statement integrated into an atmosphere**, not a card or a two-column template.
- **Large expressive type** carrying the composition, with media around it rather than beside a slogan.
- **Work as curated storytelling**: each project gets a large, full-colour, project-specific composition and a direct route to its case study.
- **Pacing**: hook, then substance, then proof, then confidence, then one invitation. Vary density instead of repeating one block.
- **One signature effect** doing the heavy lifting; the rest stays quiet.
- Restraint in labels: no numbering, no mono rails, no status chrome.

## Rejected patterns (removed in this reset)

- Boxed hero and the side "artifact panel"; framed/double-bezel media.
- Routine cyan numerals and section-number eyebrows (`01 — Capabilities`, `02 — Selected work`).
- Mono rails, meta rails, micro-labels, and technical status labels.
- `Preview / Hide` disclosures as the primary way to browse work.
- Hairlines on every row; equal service cards; bordered panels.
- Decorative status dots and glowing outline boxes.
- Em-dashes in visible copy.
- Opaque page-root backgrounds: they bury the shared top semi-radius horizon light (`PageWrapper`'s `orb-pulse`) that every inner page carries as its header atmosphere. Page roots stay transparent over the body canvas so the horizon reads.
- Floating badges and labels stamped over media (image chips, disclaimer captions). Kind, category, and provenance belong in typographic meta lines next to the content, never laid on top of it.
- Checkbox design in any form: tick-icon lists, checked/unchecked boxes, check tiles. Selection reads through border, tint, and accent typography.
- Graph-paper grid backgrounds: vertical-line or 2D grid overlays behind page sections (`linear-gradient` line patterns at 10rem or 50–80px). The atmosphere is the horizon orb, blooms, and the signal field, not ruled paper.

## Available assets and narrative sequence

Real assets: project hero imagery in `public/work/` for TrueLuxe Nepal, Prika Couture, The Leaders NP, StudentStack, 3am3d (Green Lifestyle has none), plus a studio hero render. Real services: website design and build, app development, performance and SEO, maintenance retainer. Four delivery stages in `ProcessTimeline`. Portfolio facts per `AGENTS.md`. No invented projects, metrics, or imagery.

Sequence: **hook (hero) → capability (what we make and why it matters) → featured work (media first) → process confidence → invitation.**

## Section roles

| Section | Led by |
| --- | --- |
| Hero | media / motion (full-bleed signal field, type integrated into the field) |
| Capability | typography |
| Featured work | media (three distinct compositions, one system) |
| Process | interaction (sticky step engine, retained) |
| Closing invitation | typography (one clear action) |

---

# Sprint 1 rebuild: what actually changed

Evidence (rejected state in `screenshots/before-reset/`, rebuilt state in `screenshots/after-reset/`):

| Frame | Before (rejected) | After (rebuilt) |
| --- | --- | --- |
| Home hero, desktop | [before-reset/home-1280-hero.png](./screenshots/before-reset/home-1280-hero.png) | [after-reset/home-1280-hero.png](./screenshots/after-reset/home-1280-hero.png) |
| Home hero, mobile | [before-reset/home-375-hero.png](./screenshots/before-reset/home-375-hero.png) | [after-reset/home-375-hero.png](./screenshots/after-reset/home-375-hero.png) |
| Featured work | [before-reset/home-1280-index.png](./screenshots/before-reset/home-1280-index.png) | [after-reset/home-1280-canvas.png](./screenshots/after-reset/home-1280-canvas.png) |
| Work index, desktop | [before-reset/work-1280-index.png](./screenshots/before-reset/work-1280-index.png) | [after-reset/work-1280-seg1.png](./screenshots/after-reset/work-1280-seg1.png) |
| Work index, mobile | [before-reset/work-375-full.png](./screenshots/before-reset/work-375-full.png) | [after-reset/work-375-seg0.png](./screenshots/after-reset/work-375-seg0.png) |
| Closing | [before-reset/home-1280-full.png](./screenshots/before-reset/home-1280-full.png) | [after-reset/home-1280-seg5.png](./screenshots/after-reset/home-1280-seg5.png) |

## Home

- **Hero**: the boxed artifact panel is gone. The signal field is now the full-bleed stage (viewport height), the headline sits inside the field in two lines at `clamp(2.1rem, 7vw, 6rem)`, and a rising cyan bloom plus a deepened floor keep the type clean. The eyebrow rail, meta rail, nested-button arrow, and framed `SIGNAL FIELD / LIVE` bar are removed. One quiet primary action plus one text link.
- **Signal field**: rebuilt as a receding horizon. The camera moved low and the look target moved up, density roughly doubled, points moved from a flat grid to a depth-graded cyan-to-white field. Same single effect, more presence, still pointer-reactive and reduced-motion safe.
- **Capability** (`Capabilities`): the numbered index with a mono rail is replaced by a typography-led statement and a two-column set of four real capabilities, no numbering, no hairlines, no cards.
- **Featured work** (`FeaturedWork` + `ProjectFeature`): three projects in three distinct compositions (full-bleed overlay, asymmetric split, wide image with text below) that share one type scale, one media treatment, and one call to action. `Preview / Hide` is gone.
- **Pacing**: the marquee band is removed from Home, so the sequence is hook, substance, proof, process, offer, invitation. The offer section lost its second step grid (it duplicated the process engine) and its mono labels and borders.

## Work

- The collapsible utility index is replaced by a curated gallery: a large editorial heading, then all six projects as media-led compositions in a repeating three-variant rhythm. Every project links straight to its case study.

## Mobile

Its own composition: the hero headline sits on clean dark beneath the field, the capability set becomes one column, and every project composition collapses to a full-width image with the title and action beneath or overlaid. No horizontal overflow at 375.

## Files changed

- New: [Capabilities.tsx](../src/components/sections/Capabilities.tsx), [FeaturedWork.tsx](../src/components/sections/FeaturedWork.tsx), [ProjectFeature.tsx](../src/components/work/ProjectFeature.tsx).
- Rebuilt: [Hero.tsx](../src/components/sections/Hero.tsx), [WavesBackground.tsx](../src/components/ui/WavesBackground.tsx), [SelectedWork.tsx](../src/components/sections/SelectedWork.tsx), [CTABanner.tsx](../src/components/sections/CTABanner.tsx).
- Focused pass: [MakeItYours.tsx](../src/components/sections/MakeItYours.tsx), [ProcessTimeline.tsx](../src/components/sections/ProcessTimeline.tsx).
- Recomposed: [page.tsx](../src/app/page.tsx), [work/page.tsx](../src/app/work/page.tsx).
- Removed: `ServicesGrid.tsx`.

## Checks

`npm run lint` 0, `npx tsc --noEmit` 0. Browser at 1280 and 375 on Home and Work: one `main`, one `h1`, zero horizontal overflow, zero broken images, zero console errors, zero failed requests, zero em-dashes in visible copy, no image missing `alt`. Full keyboard traversal reaches every project link and control with a visible cyan focus ring. Under `prefers-reduced-motion: reduce` no section is left hidden.

---

# Pass 2: wave hero and the narrative spine

- **Hero.** `WavesBackground` (Three.js points) is replaced by [SineWaveField](../src/components/ui/SineWaveField.tsx), which follows the reference sine-wave experiment: one shared axis, a sine envelope pinching every wave to that axis at both edges, flat tails, `time -= 0.007` per frame, `speed = 10`, 8px segments, and per-wave `timeModifier`, amplitude and wavelength. Adapted for Echo11 with a cyan palette, hairline strokes, and an edge fade so the shared tail never reads as a stray rule. `Hero.tsx` rebalances its overlays around the new axis (0.36 of the stage) and drops the `max-w` on the headline so the mobile break is a deliberate three lines.
- **Order.** `page.tsx` now runs hero, capability, work, offer, process, invitation, so the commercial decision follows the proof and the reliability story closes before the ask.
- **Argument.** Each section now hands off to the next: work ends on the prepared directions, the offer ends on the four stages, and the process ends on the conversation. Headings changed from labels to claims (`Shipped, and still running.`, `Start from a proven direction.`, `How a project runs.`).
- **Truthfulness.** The fabricated deployment telemetry (friendly status, 200 OK, global latency, 12ms) and the fake code window are removed; the step visuals are now abstract and claim nothing. Home publishes no invented numbers.
- **Mobile.** Project features resolve to image first, then the read, at every variant; the offer tabs become a scroll strip; process steps no longer ghost at 15% opacity on touch.

## Still weak

- Case-study metrics remain unverified and must not be presented as measured results.
- The case study, Services, About, and Contact routes still carry the previous treatment.
- `Marquee.tsx` is now unused on Home (left in place for other surfaces).
- Contact copy still contains an em-dash.
- `MakeItYours` tablist still does not move selection with `ArrowRight` (no roving tabindex).

---

# Pass 3: hero type, hero copy, and a calmer field

Supersedes the hero specifics in Pass 2 where they disagree.

- **Copy.** The headline is now `We design and build / digital products / people trust.` on three deliberate lines at every breakpoint. `engineer` was doing trade work the visitor does not need; `design and build` says the same thing in plainer language and covers both halves of the practice. The subhead became `A small, senior team for strategy, design, and engineering. You work directly with the people building it, and it stays fast and reliable long after launch.` It keeps one concrete promise (who you talk to) and drops `maintainable`, which was jargon.
- **Type scale.** `clamp(1.7rem, 7.6vw, 5.5rem)` with `leading-[0.96]` and `tracking-[-0.035em]`. The three lines are explicit blocks, so they never reflow into ragged orphans: verified unwrapped at 320, 375, 414, 768, 1024, 1280, 1366, 1440, and 1920.
- **Field.** [SineWaveField](../src/components/ui/SineWaveField.tsx) was retuned from a set of thin wires into a luminous ribbon band: five long ribbons with nested vertical offsets, `speed = 5` (half the reference), and a two-pass stroke that lays down a wide additive halo before the crisp line. Both scales are computed from the live stage, so crest count stays steady from phone to desktop and amplitudes never crowd the headline. `IntersectionObserver` idles the loop when the hero scrolls away.
- **Overlays.** The previous second bloom was drawn in a `h-[26%]` box, and its top edge cut a hard horizontal seam across the stage. All atmosphere layers now span the full stage, so none of them can draw an edge.

## Verified

`npm run lint` 0, `npx tsc --noEmit` 0. Canvas paints and the signature changes between samples at 1280 and 375. Under `prefers-reduced-motion: reduce` the field holds one static frame and no element is left hidden. Home keeps one `main`, one `h1`, zero horizontal overflow, zero broken images, zero em-dashes in visible copy, zero console errors, zero failed requests. The primary action stays inside the first mobile viewport down to 320 wide.

---

# Pass 4: the Shipped section becomes evidence

- **The plates were destroying the assets.** Every screenshot in `public/work` is a 7:4 capture of one desktop fold. The section was drawing them into `aspect-[21/9]` and `aspect-[16/10]` frames with `object-cover`, so a quarter of each product's own hero was cropped away and what remained read as an arbitrary slice of somebody else's interface. Home now renders all three at the asset's own ratio, inside the content column: 695px tall at 1280, which displays a 1500px capture at 0.81x and makes the products legible. On phones the plate takes a `5/4` centre crop instead, which keeps each site's headline and its calls to action and shows them at roughly 0.31x rather than shrinking the whole fold into a 214px strip. Nothing is stretched and nothing is cut on desktop.
- **Copy stopped sitting on the product.** The old `canvas` variant set the title, the tagline and the cue inside the screenshot over a gradient. On TrueLuxe that landed the type on a product grid and pushed the heading past the frame edge. The caption now sits under the plate as a two-column editorial row: sector and year, the project name, one plain sentence on the left; a credits line and the project's two real destinations on the right.
- **Three layout systems became one.** `canvas`, `split` and `stacked` were meant to give the section rhythm, but together they read as three unrelated treatments with a different void in each. One plate treatment plus a consistent caption gives the section a single voice, and the rhythm now comes from the work itself: two light products, then a dark one.
- **Language.** The intro was `not a layout to fill`, which is a dig rather than a claim. Each project leads with what was designed and built, taken from that project's own record: TrueLuxe's short checkout comes from its checkout integration problem, Prika's no-shift layout comes from its layout-shift problem, The Leaders NP names its draft/review/publish workflow. The closing line counts the archive and hands off to the offer section. The first version of this copy also claimed `all three live in production` and `you can open every one`, which the next pass removed as unsupported. See below.
- **Metadata.** Each entry gained the facts the data already held but never showed: category and year, and the first three services as a credits line, plus a `Live site` link where the destination actually resolves.
- **Sharing.** `Media` became `ProjectMedia`, exported from [ProjectFeature.tsx](../src/components/work/ProjectFeature.tsx) with a note that the ratio you pass decides how much of the capture survives. Home no longer uses the variant system.
- **Accessibility.** The plate is a pointer-only duplicate (`aria-hidden` plus `tabIndex={-1}`), so keyboard users get two clearly named links per project instead of three links to the same page.

## Verified

`npm run lint` 0, `npx tsc --noEmit` 0. Plates render at 1216x695 (1440), 960x549 (1024) and 720x411 (768), all the asset's own 7:4, and the served image matches the display box exactly. Home at 1280 and 375: one `h1`, one `main`, zero horizontal overflow, zero broken images, zero em-dashes, no invented numbers, zero console errors, zero failed requests.

---

# Pass 5: the section stops claiming products are up

An audit of Pass 4 opened every URL the section published. Five of the six builds in `caseStudies.ts` are offline, so Pass 4 had shipped a false claim on the homepage.

| Project | URL | Result |
| --- | --- | --- |
| TrueLuxe Nepal | trueluxe-nepal.vercel.app | 404 `DEPLOYMENT_NOT_FOUND` |
| Prika Couture | prika.vercel.app | 503, paused by the owner |
| The Leaders NP | the-leadersnp.com | 200 |
| Green Lifestyle | devendrashahi.pythonanywhere.com | 404, untouched placeholder |
| StudentStack | studentstack.vercel.app | 503, paused |
| 3am3d | 3am3d.vercel.app | 503, paused |

- **Heading.** `Shipped, and still running.` became `Shipped, and documented.` The phrase `still running` is a claim about uptime, and it was false for two of the three featured projects. `documented` says what the section can actually support: three builds with a written record behind each one, which is what the case study links lead to.
- **Intro.** `Commerce, couture, and civic media, all three live in production. None of them is a mockup, and you can open every one.` became `Commerce, couture, and civic media. Three products we designed and built, each with a written record of the decisions behind it.` No liveness, uptime, or reachability assertion survives.
- **Live links.** A `Live site` action now renders only when the destination was opened and answered. The gate is `LIVE_LINKS_VERIFIED` in [FeaturedWork.tsx](../src/components/sections/FeaturedWork.tsx), which holds `leaders` and records the check date and the status of every URL that is not in it. Two dead outbound links are gone rather than pointed at replacements.
- **Project lines.** Rewritten into the record, because the earlier versions asserted present-tense behaviour of products that are not reachable: Prika's `holds perfectly still while you read` is now `built so image-heavy collection pages load without shifting the layout`, and The Leaders NP now names its draft, review, and publish workflow instead of a general consistency claim.
- **Reverted.** Pass 4 also renamed the shared plate in a way that rewrote all six alt strings on `/work`, which was outside its scope and made Green Lifestyle's stock-photo alt more confidently wrong. The alts are back to `{title}, live site`.

## Pass 6: one owner for the liveness fact, and an alt that describes the picture

Pass 5 left two problems an audit caught. The Home plates still rendered `ProjectMedia`'s shared caption `<name>, live site`, which asserts reachability for two products whose URLs return 404 and 503; it was only invisible because the plate link carries `aria-hidden`. And whether a URL answers lived in a `Set` inside the section, while the URL itself lived in the case-study data, so editing a URL gave no signal that a separate list gated its link.

- **Alt.** `ProjectMedia` takes an optional `alt`, and Home passes `${title} homepage screenshot`, which describes the image and claims nothing about the site. The old string is now a named `LEGACY_ALT` used only by `/work`, with a comment saying not to reuse it.
- **Ownership.** The fact moved into the data as `CaseStudy.linkVerifiedOn`, an optional date that is present only when the URL was opened and answered, with the rule and the sweep date in its doc comment and the status of each dead URL recorded on its own `link` line. `FeaturedWork` now gates on `project.link && project.linkVerifiedOn`, and the `LIVE_LINKS_VERIFIED` set is gone.
- **`/work` untouched.** `SelectedWork` and `ProjectFeature` never read the new field, so all six rendered alt strings are unchanged, and no URL in the data changed.

## Pass 7: both guards stop failing open

An audit found that the two guards Pass 6 added were advisory. `ProjectMedia`'s `alt` was optional and defaulted to `<name>, live site`, so any new call site that forgot it would reintroduce the false claim, and the `linkVerifiedOn` doc comment claimed no surface links out on `link` alone while `/work/[slug]` did exactly that.

- **Alt is required.** `ProjectMedia` now takes `alt: string`, so the compiler, not a comment, makes every caller decide. Asked for it by leaving the prop off and confirming the result: `error TS2741: Property 'alt' is missing ... but required`.
- **The legacy wording moved to its only consumer.** `LEGACY_ALT` is deleted; `ProjectFeature` builds `galleryAlt` once and passes it at its three plate call sites, with a comment recording that the string asserts reachability, is false for five of six projects, and survives only because `/work`'s captions are out of scope.
- **The comment now describes the code.** `linkVerifiedOn` says what it means, that nothing enforces it, that `link` stays a plain string any surface can render, that only `FeaturedWork` checks it today, and that `CaseStudyContent.tsx` does not.

## Pass 8: the plates get a load state, a staged reveal, and a calmer hover

- **Staged reveal.** Each project now reveals in three steps: the plate settles from `scale 0.985` and `y 26`, then the read, then the credits, staggered by 0.12s. Measured opacity through the sequence: `0.43/0.00/0.00` then `0.70/0.30/0.00` then `0.85/0.70/0.01`, settling at `1/1/1`. One viewport trigger sits on the article and the steps inherit it through `staggerChildren`; giving each step its own `whileInView` was the first attempt and it left the caption at opacity `0` on screen, because with an inset root a caption low in a tall article never crosses the threshold.
- **Load state.** A light screenshot used to appear out of a near-black void, so the plate now waits on a surface derived from the project's own brand colour (`tint()`, the colour darkened to 42%). In flight the frame is `rgb(82, 70, 53)` for TrueLuxe instead of black. Next's `placeholder="blur"` was tried first and reverted: with `blurDataURL` applied the frame still rendered black in the browser.
- **Hover.** The Home plate uses `scale-[1.03]` over `700ms` instead of `scale-[1.04]` over `1400ms`, which reads as a response rather than a lag, and promotes a layer only while hovered.
- **Gating.** Every new transform is behind `motion-safe:`, and the reveal's timing moves onto the elements rather than into the variants so reduced motion can set it to a single frame. Measured under `prefers-reduced-motion: reduce`: transforms `none` throughout, all three steps at `1.00` within one sample, no stagger, and the hover transform never leaves `none`. The plate hover that previously fired under reduced motion no longer does.
- **Invariants.** `/work` is byte-identical, checked attribute by attribute against a recording taken before this pass (alt, sizes, loading, style, image class, frame class, measured box, all six images). Home keeps its three plate alts, its single outbound link, `1216x695` at 1280 and `327x262` at 375, and 0 horizontal overflow.
- **Motion owner.** `EASE_OUT` now lives in [animations.ts](../src/lib/animations.ts) and the section imports it instead of declaring a fourteenth copy.

## Pass 9: the plate gets an owner, and the motion gate becomes one decision

Structure only. No capability, no UI, no copy, no rendered output changed.

- **The plate moved to [ProjectMedia.tsx](../src/components/work/ProjectMedia.tsx).** `ProjectMedia` used to live in [ProjectFeature.tsx](../src/components/work/ProjectFeature.tsx), a module named after the three-variant component Home stopped using in Pass 4, while `FeaturedWork` imported the plate across that boundary. The plate plus both media treatments plus `tint()` now own their own file, which is 93 lines and imports only `next/image`, the `CaseStudy` type, and `cn`. `ProjectFeature` dropped from 241 to 169 lines and no longer imports `next/image`.
- **`showcase: boolean` became `surface: "gallery" | "feature"`.** A named variant rather than a flag, and required rather than defaulted, so a caller has to say which surface it renders on and a third surface cannot inherit a treatment by omission. `ProjectFeature` passes `surface="gallery"` at its three call sites; `FeaturedWork` passes `surface="feature"`. The treatments themselves are a `Record<PlateSurface, ...>` lookup instead of a ternary.
- **The reduced-motion gate is two one-line functions in [FeaturedWork.tsx](../src/components/sections/FeaturedWork.tsx).** `reduce ? still : { ... }` was written out inline four times and `initial={reduce ? false : { ... }}` three times; both are now `whenMoving(reduce, transition)` and `startsAt(reduce, value)`, with the policy documented once. Zero inline `reduce ?` gates remain outside those two functions, and the nine call sites route through them.
- **Verified unchanged.** `/work` byte-identical to the pre-pass recording (`identical to baseline: true`, all six images, alt, sizes, loading, style, image class, frame class, measured box) with the six legacy alts; Home's three plate alts (`<name> homepage screenshot`), ratios `1.750` at 1280 and `1.250` at 375, one outbound link (`https://the-leadersnp.com` -> 200), staging order and timing (`0.43/0.00/0.00` then `0.70/0.30/0.00`), hover `matrix(1.03)` on the hovered project only and `none` on leave, reduced motion instant with transforms `none` and no hover, 0 hidden after a full scroll, 0 overflow, no console messages. Lint 0, typecheck 0.

## Pass 10: the hover becomes a response, and the reveal gains a finer step

- **Hover.** The Home plate's hover was a bare `scale-[1.03]`. It is now a composed response at the same 700ms: `scale-[1.04]` with a `-translate-y-[1.2%]` lift, `brightness-105` and `saturate-[1.06]`. The lift is a percentage because a percentage is measured against the image's own height, and a 1.04 scale returns 2% of that height as overflow on each edge, so a 1.2% lift can never pull an edge clear of the frame at any viewport. Measured: `matrix(1.04, 0, 0, 1.04, 0, -8.33813)` with `brightness(1.05) saturate(1.06)` at 1280 (6px of overlap left at the bottom edge, 22px at the top), `-3.13913` at 375 (2px of overlap). A fixed 4px lift was tried first and read as imperceptible at 1280 while having no safe margin at 375.
- **The entry answers wherever the pointer is.** Hovering the caption fires the same image response as hovering the plate, verified by hovering an `h3` rather than the image.
- **The content comes forward instead of only the picture.** On hover the read line moves `0.60` to `0.75` and the credits line `0.40` to `0.55`, on top of the title that already went to white. That is the "content reads better" half of the request: the whole entry sharpens, so the copy is more legible exactly while it is being read.
- **A finer load.** The reveal is now five steps rather than three: plate, read, credits, services, actions, with the credits block staggering its own two children by `0.08`. Measured through one article's reveal: `0.12/0/0/0/0`, `0.54/0/0/0/0`, `0.76/0.47/0/0/0`, `0.88/0.77/0.23/0.27/0`, `0.94/0.90/0.67/0.73/0.29`, settling at `1/1/0.98/0.99/0.96`.
- **Gating.** Under `prefers-reduced-motion: reduce` the image never moves and never takes a filter (`none | filter:none`), and the five steps appear in a single frame. The text brightening still applies, since a colour change is not motion.
- **Verified unchanged.** `/work` byte-identical to the recording (`identical to baseline: true`, six images, six legacy alts), Home's three plate alts, ratios `1.750` at 1280 and `1.250` at 375, one outbound link resolving 200, 0 overflow, no console messages. Lint 0, typecheck 0. Evidence: [shipped-hover-1280.png](screenshots/after-reset/shipped-hover-1280.png), [shipped-hover-375.png](screenshots/after-reset/shipped-hover-375.png).

## Pass 11: the section becomes a spread instead of three stacks

Layout only. No copy change, no new claim, no new dependency, `/work` untouched.

- **The shape changed.** Every entry used to be the same object three times: a full-width plate with a caption row beneath it, which read as a list rather than a composition. The section is now a spread. The header splits into two columns, heading left and intro right. TrueLuxe runs side by side with its read, plate left. Prika mirrors it, read left and plate right. The Leaders NP takes the whole content column and closes the section at full size. Measured at 1280: plates of `789x451` at `left 32`, `789x451` at `left 459`, then `1216x695` full width, with titles at 29px beside the plates and 46px on the closing build.
- **The read column carries the entry.** Beside a plate the sector, title, line, services, and both actions stack in a four-column reading column rather than sitting in a caption row under the image. Mobile is unchanged in shape: the plate first, then the read, then the credits, all full width.
- **The plate now says it is clickable.** A hover affordance appears at the plate's bottom left, reading `Read the case study`. It is decorative (`aria-hidden`, `pointer-events-none`) so the named link in the credits is still the only one a screen reader announces, and it is revealed by opacity alone, so it still appears when motion is reduced.
- **The hover answers visibly.** `scale-[1.06]` with a `-translate-y-[2%]` lift, `brightness-[1.06]` and `saturate-[1.08]` over 600ms, up from a `1.04` scale with a `1.2%` lift. The percentage lift scales with the plate and the 6% scale returns 3% of the image's height as overflow on each edge, so the 2% lift can never expose the frame behind it.
- **Verified.** Measured: hover `matrix(1.06, 0, 0, 1.06, 0, -9.02063)` with `brightness(1.06) saturate(1.08)` and the affordance at opacity `1.00`, from `none | filter:none` and `0.00` at rest. Under `prefers-reduced-motion: reduce` the plate stays `none | filter:none` while the affordance still appears. Home keeps its three plate alts, ratios `1.750` at 1280 and `1.250` at 375, one outbound link resolving 200, 0 overflow, and the reveal cascades in five steps. The only elements left at opacity 0 after a full scroll are the three affordances. `/work` byte-identical to the recording. Lint 0, typecheck 0, no console messages. Evidence: [shipped-magazine-1280.png](screenshots/after-reset/shipped-magazine-1280.png), [shipped-magazine-1280-mirrored.png](screenshots/after-reset/shipped-magazine-1280-mirrored.png), [shipped-magazine-375.png](screenshots/after-reset/shipped-magazine-375.png), [shipped-hover-1280.png](screenshots/after-reset/shipped-hover-1280.png).

## Pass 12: the cursor carries a label, and the plates pan

The reference's signature move is that the work itself is alive: media moves, and the pointer tells you what a thing is before you click. Three effects, no new dependency.

- **The cursor becomes a label over project media.** [Cursor.tsx](../src/components/ui/Cursor.tsx) already drew a dot and a ring site-wide. It now reads a `data-cursor` attribute from whatever is under the pointer and, when one is present, replaces the dot and ring with a cyan label plate naming the thing. The section declares `data-cursor="View project"` on each plate and knows nothing about how the cursor is drawn; the cursor knows nothing about what exists on the page. Measured over the plate: `rgb(0, 229, 255)` ground, black text, uppercase, 11px, gone on leave.
- **The plates pan as you scroll past them.** Each Home plate's screenshot sits in a `PlatePan` layer inside its frame and moves `-3%` to `+3%` over the traversal, under a `1.12` scale that gives it room, so the frame keeps its clip and the plate keeps its geometry. Measured across the first plate: `-13.53`, `-4.76`, `+4.26`, `+13.27`, `+13.53` as the frame crossed the viewport.
- **Why it is not a CSS `view()` timeline.** That was the first attempt, and it silently did nothing: the site gives `body` `overflow-x: clip`, which makes body a scroll container that never scrolls, so the timeline resolved to body and its progress stayed pinned at `0.75` while the plate traversed the viewport. `useScroll({ target })` measures against the viewport instead.
- **Why the reduced-motion gate is CSS.** The motion library caches the user's preference in module state on first call and never updates it, so a server-rendered component can carry the wrong answer. The scale is a `motion-safe:` class and the pan is stood down by a `.plate-pan-layer { transform: none !important }` rule in the existing reduced-motion block, which also applies before first paint instead of after hydration. Measured under `prefers-reduced-motion: reduce`: both layers `transform: none` at every scroll position and the plate back at its exact frame size, `789x451`.
- **Verified.** Home keeps its three plate alts, ratios `1.750` at 1280 and `1.250` at 375, one outbound link, and 0 overflow; the cursor label still appears under reduced motion, since it is a colour and a position, not an animation. `/work` is byte-identical to the recording, every one of its images still a direct child of its frame, and it renders no pan layer and ships no pan component. Lint 0, typecheck 0, no console messages. Evidence: [shipped-cursor-label-1280.png](screenshots/after-reset/shipped-cursor-label-1280.png).

## Pass 13: "Start from a proven direction" starts showing what it was proven on

The section's heading made a claim the section did not back. It listed three reusable directions with coded studies, the section above it showed three real builds, and nothing connected the two, so "proven" was a word the reader had to take on trust.

- **The direction record now carries its provenance.** `WebsiteDirection` in [website-offers.ts](../src/lib/website-offers.ts) gained `proof: string[]`: the ids of the case studies the direction was drawn from. Ids rather than imported records, so the offer data stays independent of the portfolio data and the surface skips any id it cannot resolve. Commerce is `TrueLuxe Nepal` and `Prika Couture`, service is `3am3d`, product is `StudentStack` and `Green Lifestyle`.
- **The panel shows one real build per direction.** Below the read and its action, the same panel now carries a band: a real screenshot of the leading project, its sector and year from its own record, its first three services, a `Read the case study` link, and the remaining projects credited by name. Everything in the band is read from `caseStudies.ts`; nothing is invented, so there are no new claims to defend. The tab swaps it with the rest of the panel.
- **The leading project has to have a real capture.** The record documents that the first entry is the one shown as a picture, and that Green Lifestyle's thumbnail is a stock photograph, so it can be credited by name but must not lead a list. It is the second entry under product, which is why its tile shows `StudentStack`.
- **The picture and the copy name the same destination once.** The tile carries `data-cursor="View project"` and links to the case study like the Home plates do, but it is `aria-hidden` with `tabIndex={-1}`, so the named text link in the band is the only one a screen reader announces.
- **The previews stay coded studies.** [WebsiteDirectionPreview.tsx](../src/components/marketing/WebsiteDirectionPreview.tsx) and the product brief both say the direction previews are deliberately not client screenshots, and the band does not change that: the real builds sit outside the preview frame as evidence, labelled `Proven on`, next to the direction rather than in place of it.
- **The tabs became a real tablist.** Selection previously could not move by keyboard. The tabs now use roving tabindex with one tab in the page order, and `ArrowRight`/`ArrowLeft` move along the strip, `ArrowUp`/`ArrowDown` along the stack it becomes from `lg` up, with `Home` and `End` for the ends. Measured: from the third tab, `ArrowRight` wraps to the first, which ends up focused with `aria-selected="true"` and `tabindex="0"`.
- **The claim narrows to what is true.** The intro moved from `Three website directions we keep ready` to `Three directions, each drawn from work we have already shipped`. The band links only to `/work/<slug>`; no build in it links out, and a check for `live site`, `visit live`, `uptime`, and `still running` in the panel returns false for all three directions.
- **Verified.** Each direction proves the right project, credits the right remainder, and lists only internal destinations. 1280: tile `288x180` from a real `3000x1718` capture, `scrollWidth` equal to `innerWidth`, hover giving the cyan `View project` cursor label and `matrix(1.03, 0, 0, 1.03, 0, 0)` on the image. 375: the band stacks picture then copy, `scrollWidth` equal to `innerWidth`, nothing overflowing. Under `prefers-reduced-motion: reduce` the band is present in one frame, no element below `0.9` opacity, image transform `none`. 0 console messages, 0 failed requests. `/make-it-yours` and `/work` both still render clean, since the shared direction data only gained a field. Lint 0, typecheck 0. Evidence: [direction-proof-1280.png](screenshots/after-reset/direction-proof-1280.png), [direction-proof-1280-service.png](screenshots/after-reset/direction-proof-1280-service.png), [direction-proof-375.png](screenshots/after-reset/direction-proof-375.png).

## Pass 14: the direction panel shows real work instead of a study

The coded study was the wrong instrument for the claim. It demonstrated a direction with a page nobody had built for a client, which is the opposite of what the heading promises, and every tab showed a variation of the same invented screen while three real builds sat directly above it.

- **The panel's picture is a shipped build.** The left column of the panel now renders the leading project through the same `ProjectMedia` plate the Home feature uses (`surface="feature"`), so the plate keeps the pan, the hover response, the tinted waiting surface, and the accessible pattern that were already verified above. The direction's eyebrow, title, outcome, three adapted areas, price, and action are unchanged beside it.
- **The caption states provenance, not performance.** `Drawn from`, the project title, its sector and year read from its own record, a `Read the case study` link, and any remaining projects as `Also drawn from`. Nothing in the panel links out to a live site, so no reachability claim was added for a build whose URL is paused or missing.
- **The picture names one destination once.** The plate is the pointer target with `data-cursor="View project"`, and it is `aria-hidden` with `tabIndex={-1}`, so the named link under it is the only destination a screen reader announces. The rule is the one the Home plates already follow.
- **The Pass 13 proof band is gone.** With the real build now in the panel's picture, the band would have shown the same capture twice inside one panel. The panel is a single row again: the build on the left, the direction on the right, and nothing after it.
- **The coded previews still run on `/make-it-yours`.** [WebsiteDirectionPreview.tsx](../src/components/marketing/WebsiteDirectionPreview.tsx) keeps its consumer on that route; only the Home section stopped using it.
- **Verified.** Commerce shows `TrueLuxe Nepal` and credits `Prika Couture`, service shows `3am3d`, product shows `StudentStack` and credits `Green Lifestyle`, each plate a real capture with the alt `<name> homepage screenshot`, each named link internal to `/work/<id>`. 1280: plate frame `458x262` at 7:4, caption label, project, and sector present, `scrollWidth` equal to `innerWidth`. 375: frame `295x236` at 5:4, the panel stacks picture, caption, then the read, `scrollWidth` equal to `innerWidth`. Keyboard: from the third tab, `ArrowRight` wraps to the first with `aria-selected="true"` and `tabindex="0"`. Hover: `VIEW PROJECT` cursor label with `matrix(1.06, 0, 0, 1.06, 0, -5.23187)`, `brightness(1.06) saturate(1.08)`, back to `none | filter:none` on leave. Under `prefers-reduced-motion: reduce` the plate takes `transform: none` and `filter: none`, all four pan layers are `none`, and no text leaf is left faded. A search for `Direction study`, `live site`, and `visit live` inside the panel returns false for all three directions. `/work` still renders its six legacy `, live site` alts and no pan layer. 0 console messages, 0 failed requests. Lint 0, typecheck 0, build compiles. Evidence: [direction-built-1280.png](screenshots/after-reset/direction-built-1280.png), [direction-built-1280-product.png](screenshots/after-reset/direction-built-1280-product.png), [direction-built-375.png](screenshots/after-reset/direction-built-375.png).

## Pass 15: one side nav for every screen, and a response you can see

The navigation was the last piece of the section still built for a wide window. On a phone it was a horizontal scroller: three cards 224px wide with a 96px minimum height, sliding under a native scrollbar, and a selection changed something that began below the fold, so the reader had to scroll to find out what had happened.

- **One vertical list replaces the strip and the rail.** The tablist is a single column at every width: `flex flex-col`, no scroller, no negative gutter, no minimum row size. An inactive row is a title in `white/55` with a hover ground; the selected row is the cyan plate with black text, the accent the section already used, so nothing new entered the palette.
- **Sized by the screen rather than by the card.** At 1280 a row is `240x77` and carries its `direction` label above the title. At 375 a row is `327x43` and carries the title only, three rows above the panel, so the list costs about 140px instead of a 224px-wide horizontal track.
- **The response comes to the reader.** Below `lg` the panel sits under the list, so a selection made from the bottom of it brings the panel into view: the section scrolls it to `scroll-mt-28`, measured at `panelTop 112`. It does nothing when the panel is already on screen (`panelTop 451` in an 812px viewport, `scrollY 4814` both before and after) and nothing at all from `lg` up, where the list and the panel sit side by side. The scroll is instant rather than smooth under `prefers-reduced-motion: reduce`.
- **Focus no longer moves the page.** `selectTab` focuses with `preventScroll: true`, so a click never nudges the section under the pointer. A click dispatched at 1280 measured `moved: 0`.
- **The panel lines up on a phone.** Both panel columns share one gutter below `sm`, and the build column stops centering its contents below `lg`, which removes the dead space that used to sit above the plate there.
- **Still a tablist.** `aria-orientation="vertical"`, roving tabindex, `Up` and `Down` (and `Left` and `Right`) with wrap, `Home` and `End`, and the panel is now named by the selected tab through `aria-labelledby="direction-tab-<id>"` instead of being unnamed.
- **Verified.** 1280: rows `240x77`, the list's `scrollWidth` equal to its `clientWidth`, page `scrollWidth` equal to `innerWidth`. 375: rows `327x43`, no scroller (`327 = 327`), page `scrollWidth` equal to `innerWidth`. The panel still shows the real build per direction, still claims nothing about liveness, and still links only to `/work/<id>`. Under `prefers-reduced-motion: reduce` the plate stays `transform: none` and nothing is left faded. 0 console messages, 0 failed requests. Lint 0, typecheck 0, build compiles. Evidence: [direction-nav-1280.png](screenshots/after-reset/direction-nav-1280.png), [direction-nav-375.png](screenshots/after-reset/direction-nav-375.png).

## Pass 16: the currency control stops being a system widget

The pricing switcher was a native `<select>`. Its closed box could be styled, but the menu it opened was the browser's own: a light system list dropped into a dark, sharp-edged page, following the operating system instead of the design system.

- **A real listbox replaces it.** [CurrencySwitcher.tsx](../src/components/marketing/CurrencySwitcher.tsx) is now a trigger plus a list: `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, and a panel named by the visible `Pricing` text, with the trigger itself labelled by that text and the current code. The menu uses the raised card surface and border from the tokens (`bg-card`, `border-border`) and closes on `Escape`, on a click outside, on `Tab`, and on choosing.
- **The keyboard behaves like a select.** Opening focuses the current option; `ArrowUp` and `ArrowDown` move with wrap, `Home` and `End` jump to the ends, `Enter` and `Space` choose, and both `Escape` and a choice return focus to the trigger. An arrow key on the closed trigger opens it. Measured: open focuses `USD`, `ArrowDown` reaches `CAD` then `NPR`, `Home` returns to `USD`, `End` to `NPR`, `Enter` commits `NPR` and restores focus to the button, `ArrowUp` opens onto `NPR`, `Escape` closes onto the button, and a click outside closes with the trigger left alone.
- **The selection still costs what it always cost.** Choosing still writes the year-long `echo11_currency` cookie and calls `onChange`, so the price beside it moves: `NPR` renders `Rs 475,000` and `CAD` renders `C$4,900`, both read back from the panel.
- **The pointer does not drive focus.** The list is keyboard-driven, so hovering an option only changes its colour and never moves the focus ring while the menu is open.
- **It opens rather than appears.** A four-pixel rise and a fade live in `.dropdown-enter` in [globals.css](../src/app/globals.css), listed with the other CSS animations in the reduced-motion block, so under `prefers-reduced-motion: reduce` the list is simply there (`animationName: none`, every option at opacity 1).
- **Verified.** The menu stays inside the viewport at both ends, `1104..1248` at 1280 and `207..351` at 375, with the page still at `scrollWidth` `375` on a phone. The other two surfaces that render the control, `/make-it-yours` and `/contact`, each show one trigger and each opens. 0 console messages, 0 failed requests. Lint 0, typecheck 0. Evidence: [currency-dropdown-1280.png](screenshots/after-reset/currency-dropdown-1280.png), [currency-dropdown-375.png](screenshots/after-reset/currency-dropdown-375.png).

## Pass 17: the switcher is always in reach, and `sticky` works again

The mobile reader still had to travel back up to the switcher to move on, and every `position: sticky` on the site was silently doing nothing.

- **The root cause of the dead stickies.** [layout.tsx](../src/app/layout.tsx) put `overflow-x-hidden` on `<html>` and `<body>`, and a utility wins over the `overflow-x: clip` the base layer sets on both. `hidden` on one axis computes the other to `auto`, which makes the body a scroll container that never scrolls, so a sticky element resolves against a scrollport with nothing to stick to. Measured before the fix on a `sticky top-16` element: its top tracked the scroll exactly (`5108`, then `4404`, then `-485`). After dropping the utility it holds at `64` through the same scroll, with the panel top at `-811`. The class is gone and a comment says why; the base layer's `clip` clips the same overflow without creating a scroll container.
- **The earlier note was wrong.** Pass 12 recorded that the body had `overflow-x: clip` and was a scroll container because of it. The computed value was `hidden`, from the utility class, and `clip` is exactly the value that does not do this.
- **The switcher pins under the navbar on a phone.** Below `lg` the three directions are a pinned bar (`sticky top-16`, `z-30`, black ground, one hairline): three equal chips, `105x44` each, reading `Commerce`, `Service`, `Product`, the selected one in cyan. All three are on screen at once, so nothing scrolls sideways: the bar's `scrollWidth` equals its `clientWidth` at `375`, which the old horizontal strip could not claim. The labels come from a new `short` field on `WebsiteDirection`, the first word of the long `eyebrow`, so the short label never says anything the long one does not.
- **The grid moved to `lg` so the bar has room to stick.** The navigation and the panel were grid rows at every width, and a sticky grid item can only stick inside its own row. They are siblings in one block below `lg` and a two-column grid from `lg` up.
- **Switching brings the response with it.** The panel sits under the pinned bar, so a selection scrolls the panel back to just below it (`panelTop 128`, matching `scroll-mt-32`) unless it is already there, and does nothing from `lg` up where the two sit side by side. Measured: from deep inside the panel (`panelTop -811`) a switch lands at `128`; from the middle of the read the page does not move.
- **The end of the read offers the next direction.** The panel closes with `Next direction` and the next title, one tap away, wrapping from the last back to the first. Measured: from `Product` the cue moved the section to `Commerce` and brought it to `128` without touching the switcher.
- **Verified.** 375: chips `105x44`, the bar pinned at `64` while the panel top was `-811`, no sideways scroll inside the bar or on the page (`375 = 375`), the cue wrapping as described, and the same behaviour under `prefers-reduced-motion: reduce`. 1280: the list is `static`, rows are `240x79` with the label above the title, and a switch moves the page `0`. A sweep of `/`, `/work`, `/make-it-yours`, `/contact`, `/services`, `/process`, `/about` at both widths shows `scrollWidth` equal to `innerWidth` on every one, `/work` keeping its six legacy alts and no pan layer, and 0 console messages, 0 failed requests. Lint 0, typecheck 0, build compiles. Evidence: [direction-pinned-375.png](screenshots/after-reset/direction-pinned-375.png), [direction-side-nav-1280.png](screenshots/after-reset/direction-side-nav-1280.png).

## Pass 18: the phone switcher moves to the side

The pinned bar solved reach but not the request: on a phone the directions belong on the side of the panel, the way they sit from `lg` up.

- **One grid at every width.** The rail is `5.5rem` on a phone and `15rem` from `lg` up, with the panel beside it in both cases. Measured at 375: rail `88x156` at `x 24`, panel `227` wide at `x 124`, so the rail is left of the panel and never overlaps it. Three rows of `88x48` carry `Commerce`, `Service`, `Product`; from `lg` up the same rows carry the `direction` label over the title at `240x79`.
- **The rail stays stuck.** `sticky top-16` with `self-start`, which makes it a grid item able to move inside its own tall row: measured at `y 64` while the panel top was `-814`. That is what makes the switcher reachable from anywhere in the panel, the complaint that started this line of work.
- **The narrow column is set for itself rather than scaled down.** Below `sm` the panel's type steps down: the title at `1.35rem` (two lines in a `187px` measure instead of three), the outcome at `14px` over `1.5`, the adapted areas at `13px`, the price at `xl`, the action at `13px`, and the panel padding at `p-4`. Everything was measured inside its own box: no clipped text, the action two lines at `63px`, and the page still at `scrollWidth` `375`.
- **The reveal follows the rail.** `scroll-mt-24`, with the already-there band at `64` to `140`, so a switch puts the panel top at `96` and leaves the page alone when it is already there.
- **Verified.** 375: rail left of the panel and `sticky`, pinned at `64` under the navbar while the panel was `814` past the top, no horizontal overflow inside the rail or on the page, and the same behaviour under `prefers-reduced-motion: reduce`. 1280: rail `240x250`, panel `952` wide, plate `467x267`, and a switch moves the page `0`. The only box wider than its frame is the plate's own pan layer inside the clip, which is by design and is gone under reduced motion. 0 console messages, 0 failed requests. Lint 0, typecheck 0, build compiles. Evidence: [direction-rail-375.png](screenshots/after-reset/direction-rail-375.png), [direction-side-nav-1280.png](screenshots/after-reset/direction-side-nav-1280.png).

## Pass 19: five carried defects from the Still weak list

Fixes only. No new sections, no new claims, no dependency changes; the homepage rebuild this ran alongside (GSAP word reveals, logo strip, results band, pinned capabilities) is separate and landed earlier.

- **`/work`'s gallery hover stops under reduced motion.** `GALLERY_MEDIA` in [ProjectMedia.tsx](../src/components/work/ProjectMedia.tsx) gained the `motion-safe:` prefix on its `group-hover:scale-[1.04]`, the one-line fix the previous pass recorded but deferred because it had been told not to touch `/work`. Measured: hover gives `matrix(1.03968, 0, 0, 1.03968, 0, 0)` normally and `none` under `prefers-reduced-motion: reduce`.
- **`/work/[slug]` consults `linkVerifiedOn`.** [CaseStudyContent.tsx](../src/app/work/[slug]/CaseStudyContent.tsx) derives one `liveLink` (`link` present *and* `linkVerifiedOn` set) and gates both outbound actions on it: the `Visit Site` button and the hero circle link. An unverified URL now renders no outbound action at all rather than a link to a 404 or a paused deployment; the `WIP` mark still keys off `link` alone, so it never appears for a shipped build. The `linkVerifiedOn` doc comment in [caseStudies.ts](../src/data/caseStudies.ts) now names both consumers instead of recording that one of them ignores the field. Measured: `/work/trueluxe` has no `Visit Site` and zero outbound `http` anchors; `/work/leaders` has `Visit Site` and both anchors pointing at `https://the-leadersnp.com`.
- **`/work`'s intro stops claiming liveness.** `Each one is live, and each page walks through the decisions behind it.` became `Each page walks through the decisions behind it.` Five of the six URLs do not answer, so the sentence was false the same way the Home copy used to be. The heading (`Work that ships and stays shipped.`) is a slogan about the practice, not a reachability claim, and stays.
- **The gallery stops cropping its own assets.** The three `ProjectFeature` variants passed `aspect-[4/3]`, `aspect-[16/10] md:aspect-[2/1]`, and `aspect-[16/10] lg:aspect-[21/9]` to plates that are 7:4 captures, so every gallery entry cut the product away by a different arbitrary amount. All three now pass `aspect-[5/4] md:aspect-[7/4]`: the full capture at `md` up (measured `1.750` for all six at 1440), and the same 5:4 centre crop Home's phones use below that (measured `1.250` at 375), which keeps each site's headline and calls to action in frame.
- **The contact em-dash is gone.** `We reply with the strongest next step—not a generic pitch.` uses a comma.

## Pass 20: the portfolio becomes twelve projects

The `/work` archive is rebuilt to the project list the owner chose: `StudentStack` and `3am3d` are removed entirely, `Gravita`, `Xtreme Energy`, `DateDrop`, `CurriculumOS`, `JayVis`, `BudgetMate`, `ExpressSocialNP`, and `StepOutInStyle` are added, and every dependent surface is reconciled.

- **[caseStudies.ts](../src/data/caseStudies.ts) now holds twelve records.** The two removed projects are gone from the data, so `/work/studentstack` and `/work/3am3d` prerender as 404 (measured both `404`).
- **Dead links were replaced or withdrawn, not left to rot.** `trueluxe` points at `https://true-luxe-nepal.vercel.app/` and `prika` at `https://prika-seven.vercel.app/`, both recorded `linkVerifiedOn: "2026-10-03"` (200, titles confirmed). Projects with no real deployment (`jayvis`, `budgetmate`, `expresssocial`, `stepoutinstyle`) carry `link: null` instead of a URL that does not answer; `budgetmate`'s only deployment is the create-next-app placeholder, so it was not used. The verified set is now seven: `trueluxe`, `prika`, `leaders`, `gravita`, `xtreme`, `dropdate`, `curriculumos`. `green`'s link remains unverified and unverified-only.
- **`results` became optional and the metrics band follows it.** The interface marks `results` as optional, [CaseStudyContent.tsx](../src/app/work/[slug]/CaseStudyContent.tsx) renders `Measured Impact` only when the record carries figures, and the four original projects keep theirs. Measured: `gravita`, `jayvis`, `budgetmate`, `xtreme` show no band; `trueluxe` still shows its four metrics. The eight new records ship none rather than invented numbers.
- **Dependent surfaces reconciled.** [Results.tsx](../src/components/sections/Results.tsx) drops the `StudentStack` and `3am3d` rows (four cells, `grid-cols-2` at `md`, count-up still lands `+45%` / `98` / `5,000+` / `+180%`). [ClientLogos.tsx](../src/components/sections/ClientLogos.tsx)'s two text marks become `Gravita` and `CurriculumOS`. [website-offers.ts](../src/lib/website-offers.ts) proof remaps: the `Website` offer shows `xtreme`, the `Website + Growth Product` narrative shows `curriculumos` and `green`. `/make-it-yours`'s `proofProjects` becomes `trueluxe`, `leaders`, `curriculumos` (measured: all three render, exactly three `Visit live` actions, all gated). `AGENTS.md`'s portfolio facts lose the `StudentStack` bullet and gain `TrueLuxe Nepal`.
- **Stale counts corrected.** `/work`'s intro says `Case studies across commerce...` instead of `Six products`, Home's feature copy says `three of twelve builds`, and `ProjectFeature`'s gallery-alt comment says five of the twelve.
- **Eight new thumbnails** were generated into `public/work/` at 1500x857 (7:4), matching the unified gallery ratio.

## Verified

Lint 0, typecheck 0, build compiles (64/64 static pages, twelve `/work/[slug]` pages prerendered). `/work` lists exactly the twelve chosen titles in order, all 14 images load after scroll, `scrollWidth` equals `innerWidth` at 1440 and 375, and the removed slugs return 404. Home: the logo strip shows `Gravita` and `CurriculumOS`, the results band has four cells with final count-up values, the Service direction panel shows `Xtreme Energy` after a tab click, and neither removed project appears anywhere. Link gates: `trueluxe` renders `Visit Site` pointing at the new URL, `gravita` and `xtreme` render it, `jayvis` and `budgetmate` render no outbound action plus the `WIP` mark, and the metrics band appears only for records that carry results. Zero console errors and zero failed requests across every route checked (the only 404s are the two deliberately probed removed slugs). Note for future QA: these pages style many labels with CSS `uppercase`, and `innerText` returns text-transformed text, so content checks must compare case-insensitively or use `textContent`; two checks in this pass were false negatives for that reason. Evidence: [qa27-results.png](../../../tmp/qa27-results.png), [qa3-work.png](../../../tmp/qa3-work.png) (session copies).

## Still weak

- `EASE` is still redeclared in 12 other files, and `lib/animations.ts`'s four original variants plus `ui/Marquee.tsx` still have 0 importers.
- Case-study metrics remain unverified and must not be presented as measured results. `src/app/work/[slug]/CaseStudyContent.tsx` still maps `project.results` under `Measured Impact` / `Outcomes We Tracked`, so `/work/trueluxe` still shows `+45%`. This is an owner decision, not an edit to make silently.
- Published builds go offline without anyone noticing. Nothing in the repository re-checks the URLs in `caseStudies.ts`.
- The Services, About, and Contact routes still carry the previous treatment.
- `Marquee.tsx` is now unused on Home (left in place for other surfaces).
- The phone rail names the directions by their first word (`Commerce`, `Service`, `Product`), which fits because no two directions share a first word. Renaming the directions to two names with the same opening word breaks the rail first, and the note is here so that is findable.
- The sticky revival reaches surfaces this pass never opened, because they need a session: the lab header and footer, the authenticated lab layouts, and the `/client` navigation all asked for `sticky` and now get it. They are someone else's pass to verify.
- The currency menu is positioned inside its own container rather than portalled into the page, so an ancestor with `overflow: hidden` would clip it. None of the three surfaces that render it has one today.
- The commerce direction's picture is `TrueLuxe Nepal`, which is already the first plate in the section above. The mapping is what is true, so the repetition is deliberate rather than stretched to reach a worse-fitting project, but a stronger composition would let the two sections share one plate each.
- `/make-it-yours` does not read `proof` yet, so the three directions there still show a coded study rather than the builds the homepage now names. Its client-work section was fixed separately: `Visit live` is gated on `linkVerifiedOn`, and its three projects are `trueluxe`, `leaders`, `curriculumos`.
- Green Lifestyle's only thumbnail is a stock photograph, so the panel can credit it by name but cannot show it until a real capture exists.

## Pass 21: the hero becomes a kinetic wordmark

The hero was rebuilt after the previous HUD/eq-bar treatment read as an AI build. The direction chosen was a kinetic wordmark with the copy kept, then tuned to a slow continuous animation rather than a pure scroll-scrub (a field that only moved while scrolling tested worse than one that breathes on its own).

- **The giant `echo.` is now the artwork.** [Hero.tsx](../../src/components/sections/Hero.tsx) renders the line as transparent DOM text (`text-transparent`, `text-[min(28vw,38vh)]`); [EchoField.tsx](../../src/components/ui/EchoField.tsx) measures the span, draws each glyph as an opaque cyan-wash slab inside its line-box, then paints the wave field over it with `source-atop` so signal only shows on the letters. A faint 0.3-alpha pass escapes across the stage. The composition gained a meta rail on top (`echo11` | `STRATEGY · DESIGN · ENGINEERING`) and a numbered services rail on the bottom (`01 STRATEGY / 02 DESIGN / 03 ENGINEERING`); the HUD readout, eq bars, scroll cue, and hero `text-glow` were removed.
- **Motion is a slow continuous drift with scroll added on top.** Phase per layer is `(scrollPhase + time * TIME_DRIFT) * layer.speed` with `TIME_DRIFT = 0.25` — roughly 3× slower than the original field, measured at ~120–190 px/s on the front ribbon. The loop runs only while the hero is intersecting and renders a single static frame under reduced motion. A pure scroll-only version was tried first and looked inert at rest; the drift came back at the owner's request.
- **Ping rings work through a window-level listener.** Clicking the open stage spawns a cyan ring (`+538` ring pixels measured at r 40–80 px 150 ms after a click, `0` before); links and controls are filtered out and still navigate (hero CTA → `/contact`, hero "See the work" → `/work`, both verified by URL). Rings are drawn at full alpha on the main canvas because diluting them into the 0.3 ambient pass made them invisible to probes and nearly invisible on screen.

## Verified

Lint 0, typecheck 0, production build compiles (route table full, no errors). Behavior probes: at rest the wordmark band changes 7.8% of pixels over 1.5 s (drift alive, calm); a 300 px scroll changes 10.5% of the band (scrub still works); the ping ring appears only after a click; reduced motion renders two identical frames 1 s apart; `scrollWidth - clientWidth` is 0 at 1440 and 375; h1 reads `Make your brand echo.`; zero console errors. One dev server on :3000 (PID recorded at handoff). Note for future QA: image reads through the media tool return stale frames — verify canvas behavior with `getImageData` probes and ASCII renders only.

## Still weak

- The drift speed is a single constant (`TIME_DRIFT`); if it ever reads as too fast or too slow it is a one-number change, and there is no per-layer tuning beyond the existing `speed` field.
- Ping rings cannot be seen by keyboard-only users; they are decorative, so nothing breaks, but the interaction is pointer-only.
- The glyph wash uses fixed teal RGB stops matched to cyan-over-black; a palette change must update those stops together with the layer `rgb` values.
- `measureAnchor` re-runs on resize and webfont load only — if a layout shift happens for another reason (e.g. a late-loading font feature), the glyph masks can sit a frame off until the next resize.

## Pass 22: `/make-it-yours` rebuilt around its own route-page language

The last conversion surface still carried the pre-reset treatment: a boxed, mono-heavy stack where every section wore a cyan kicker over identical `py-24 sm:py-32` banding, and the hero statement was set at a fixed `lg:text-[7.25rem]` that is wider than its own grid column at `lg`. It was rebuilt against `docs/make-it-yours-product-brief.md` without borrowing the homepage's compositions (no Capabilities display-type index, no Results hairline band).

- **Typography.** Prose moved to sans (`text-[15px] leading-7`) everywhere — leads, panel outcomes, FAQ answers, step descriptions, comparison-table cells, inquiry copy — with mono kept for kickers, labels, prices, timeline facts, and CTA labels. The h1 is now one fluid clamp (`text-[clamp(3rem,7.4vw,7rem)]`), sized so "Choose a direction." holds one line from `lg` up; all section h2s share a single clamp.
- **Layout rhythm.** The hero statement spans the container, with the lead/CTA block and the "How it works" aside in a band beneath it. The catalogue header is a full-width split instead of a `19rem` rail. Paddings vary by role (`py-20 sm:py-28` for the dense offer and process bands, `py-24 sm:py-36` for the catalogue, `py-28 sm:py-36 lg:py-44` for the closing inquiry) instead of one repeated block. Section kickers dropped from cyan to `text-white/45`, leaving the hero kicker as the page's one accent eyebrow.
- **Evidence cards.** Raw `Image` with `opacity-70 grayscale-[25%]` at rest replaced by `ProjectMedia` (`surface="feature"`): plates sit at full brightness and lift on hover, on the shared tinted waiting surface. The bordered service chips became one `· `-separated meta line; `Visit live` keeps its `linkVerifiedOn` gate and now uses the home cue style (bordered span, accent on hover).
- **FAQ and steps.** FAQ cards lost the `0X` cyan numerals and the `Minus` icon that implied a disclosure nothing implements; each item is a top-ruled editorial entry in a two-column grid with sans answers. Step numerals are neutral white rather than accent.
- **Tabs.** Both tablists (directions, delivery routes) now implement the tabs contract: roving `tabIndex`, arrow keys on either axis plus `Home`/`End`, selection follows focus without scrolling the page, panels carry `aria-labelledby` of their active tab. This closes the keyboard gap earlier passes recorded for this surface.
- **Provenance.** The detail panel reads `proof` from the direction record and names the builds it was drawn from ("Drawn from X, Y", linking to `/work/...`), closing the "does not read `proof`" gap while keeping the coded study — the brief's interaction contract and the page's own FAQ both require the preview to stay a study rather than a client screenshot.
- **Motion.** The h1 and all six section headings are `RevealText` (GSAP's first use outside Home); framer-motion keeps the hero block entrance and the panel `AnimatePresence` swap, so no node is animated by both.

## Verified

`eslint` 0, `tsc --noEmit` 0, production build exit 0 (dev server stopped first), dev restarted with `NODE_ENV=development` — one server on :3000. SSR of `/make-it-yours` (200): 51 `reveal-word` spans across the 7 headings; 4 `tabindex="-1"` stops (3 inactive tabs + one pre-existing form radio); `aria-controls` 3 direction + 2 path tabs and both `aria-labelledby`s resolving to the active tabs; one `aspect-[16/9] md:aspect-[16/7]` lead plate and two `aspect-[4/3]` plates; `divide-y` tablist rules present; `Drawn from` linking `/work/morrow-ritual` and `/work/stanza` (both 200); 0 `grayscale`, 0 `Minus`, 0 accent section kickers, 0 service chips, and 0 em-dashes in visible body copy (the three in the HTML sit inside JSON-LD only); clamp classes present on the h1 and h2s; `/`, `/services`, `/work`, `/contact`, `/process`, `/about` all 200; dev log clean.

## Still weak

- No browser-level check: layout, hover, and the reveal motion were verified from SSR markup plus grid arithmetic, not from a rendered viewport. The owner should eyeball `/make-it-yours` near 1024 and 375 — the hero clamp is the one number derived rather than measured.
- The direction panels still show the coded study by design (the brief's interaction contract and the page's FAQ both say so); the provenance line names the real builds instead. Swapping the plates themselves would require rewriting that FAQ answer in the same pass.
- The comparison table still scrolls horizontally under `42rem` rather than reflowing to stacked rows on a phone.

## Pass 23: layout and type refinements on `/make-it-yours`

Follow-up to Pass 22 in response to "update layout and fonts." No typeface changes (Syne + JetBrains Mono stay per the brand lock); this pass is about breakpoints, column pressure, and prose sizing.

- **Comparison spec reflows instead of scrolling.** Phones now get the rows as stacked `<dl>` entries (label, then Foundation and Custom values) under `sm`; the table itself is `hidden sm:block` with `min-w-[34rem] md:min-w-[42rem]`, which fits the container at both breakpoints, so the sideways scroll Pass 22 left behind is gone at every width.
- **Foundation/Custom panel: the rail splits at `xl`, not `lg`.** Between 1024 and 1279 the investment block previously sat beside the content in a ~330px column; moving the split to `xl` gives the headline and includes list the full panel width there, with the rail below behind a top rule.
- **Direction tabs tighten on phones.** Tab rows drop to `min-h-20 py-4` under `sm` (`sm:` restores `min-h-24 py-5`), cutting 48px of tab stack before the preview panel; the two-row layout still holds one-line titles at 375.
- **Prose up one tier, widows controlled.** The four section leads (catalogue, offers, proof, inquiry) moved from `15px` to `text-base sm:text-[17px]`, matching the hero lead and the home lead scale; `text-wrap: pretty` was added across the page's prose (28 instances) so paragraphs stop orphaning single words. Body/list/label tiers are otherwise unchanged.

## Verified

`eslint` 0, `tsc --noEmit` 0, production build exit 0 (dev server stopped first), dev restarted with `NODE_ENV=development` and persisting (one server on :3000, log clean). SSR of `/make-it-yours` (200): stacked `dl` with `first:border-t-0` present; table wrapper `hidden ... sm:block` with the tuned `min-w`s; all four leads at `text-base ... sm:text-[17px]`; 28 `text-pretty`; investment rail on `xl:` grid and borders; direction tabs at `min-h-20 px-5 py-4 ... sm:min-h-24`; 0 em-dashes in visible body copy; `/`, `/contact`, `/work` all 200.

## Still weak

- Still no browser-level check — the breakpoint arithmetic (592px content at `sm`, the `xl` split at 1280, tab row height at 375) is reasoned from the CSS, not measured in a rendered viewport.
- "Fonts" was interpreted as sizing/scale, not family. If a different typeface was meant, that request is outstanding.

## Pass 24: horizon restored, badges and checkboxes removed (major node)

Raised in review of `/make-it-yours`: the page was missing the top half-radius light every other inner page shows, carried floating badge chips, and used checkbox-style lists. All three are now standing entries in **Rejected patterns** above; this pass records the fixes.

- **Horizon light.** Root cause: `<main>` painted an opaque `bg-[var(--color-surface-page)]` (`#070a0b`) directly over the shared `PageWrapper` semi-radius orb (`orb-pulse`, the "cinematic top-locked semi-radius gradient"), burying it. Only two pages did this — `/make-it-yours` and `/contact`; every other inner page (`/work`, `/services`, `/about`, …) keeps its root transparent and shows the horizon. Both offenders are now transparent over the body canvas, and the orb reads at the top of both. The page tone shifts imperceptibly from `#070a0b` to the body black every other page already uses.
- **Badges and labels removed.** The preview panel's `Live direction study · no client identity` disclaimer chip (and its reserved `top-14` gutter, now `top-5`), the proof-card image overlay chip (`bg-black/65` kind/category badge) and its bottom scrim `from-[#080b0c]` (plates now sit at full brightness per Pass 22), and the inquiry reassurance trio (`Selection recorded…`, `No generic proposal deck`, `Clear fit…`). The per-card kind distinction moved into the typographic meta line under the title: `Client work · service · service`.
- **Checkbox design removed everywhere it appeared.** Direction "what becomes yours" list, offer includes grid, the inquiry trio, the `ProjectInquiryForm` route-picker cards (the filled/empty `h-5 w-5` tick boxes are gone; selection reads through `border-accent bg-accent/[0.07]` plus an accent label), the success-state check tile, `CurrencySwitcher`'s selected-item tick (selected currency now reads in accent text), the homepage `MakeItYours` adapts list, `ProcessTimeline` "you get" lists, and `/contact`'s "What happens next" list. `Dropdown.tsx` keeps its boxes: lab-only app surface, functional multi-select, outside this art direction.
- **Graph-paper grid overlay removed.** The hero's vertical-line background (`1px` white lines every `10rem`, `rgba(255,255,255,0.025)`) and the identical overlay on `/contact` are gone; neither was a documented pattern, and `/work`, `/services`, and `/about` never had one. Note: `/methodology`, `/manifesto`, `/services`, and case-study pages still carry *2D* `60–80px` grid overlays from the pre-reset era — flagged for review, not touched in this pass.

## Verified

`eslint` 0, `tsc --noEmit` 0, production build exit 0 (dev stopped first), dev restarted (one server :3000, log clean). SSR: `/make-it-yours`, `/contact`, `/` all 200; `orb-pulse` present on both inner pages and correctly absent on `/`; zero `lucide-check` instances site-wide on these routes; zero `Live direction study` / `bg-black/65` / `No generic proposal deck` strings; both `<main>`s confirmed without the opaque surface background.

## Still weak

- Orb visibility is verified by paint order (transparent `main` over the shared `z-0` orb under `z-10` content) and by parity with `/work`, not by a screenshot — no browser tool is mounted. Eyeball the top of `/make-it-yours` and `/contact` to confirm the horizon glow reads.

## Pass 25: pre-reset 2D grid overlays removed

Follow-through on the graph-paper ban introduced in Pass 24, which ended by flagging four pages that still carried 2D grid backgrounds from before the reset. All six remaining overlays are gone:

- `/methodology` — 60px grid behind the parallax mid-section.
- `/services` — 70px grid in the hero and 60px grid behind the bordered band.
- `/manifesto` — 80px grid in the hero and 50px grid behind the bordered band.
- Case studies (`work/[slug]` metrics band) — 60px grid; the project-colour bloom in the same band stays.

Each removal takes out only the grid `<div>`; the radial blooms, hairline rules, and section structure around them are untouched. `grep transparent_1px src` now returns nothing.

## Verified

`eslint` 0, `tsc --noEmit` 0, production build exit 0 (dev stopped first), dev restarted (one server :3000, log clean). SSR: `/methodology`, `/manifesto`, `/services`, `/work/morrow-ritual`, `/make-it-yours` all 200 with zero `transparent_1px` grid patterns in the markup.

## Pass 26: `/services` delivery band rebuilt as a path, questions promoted to their own section

The *Delivery and ownership* band still carried the pre-reset treatment: four equal bordered-top cells with cyan `01`–`04` numerals (the defect logged in [home-audit.md](home-audit.md) and left open rather than half-changed), a run-on "You keep:" line, and a second job — three FAQs — crammed into the same section. The redesign plan lives in [services-delivery-section-plan.md](services-delivery-section-plan.md).

- **The path is one rule.** A single rail draws in on entry (`scaleX`/`scaleY` 0→1 over 0.9s, house `EASE`): vertical down the left below `lg`, horizontal across the top from `lg`. The four `ProcessTimeline` stages hang off it with flat tick marks, no per-cell borders, numerals now neutral `!text-white/30`.
- **Stages arrive along it.** Each stage enters via `Entrance` at `0.25 + i × 0.12`, just behind the rail; "You keep" is a labelled list per stage instead of a `". "`-joined run-on.
- **Ownership got a close.** A plain-type band — "Everything it runs on, handed over." (`RevealText` h3) over an inventory aggregated from `steps[].youGet`, `·`-separated — answers what the section name promises. It deliberately does not echo `foundations[4]` ("A website you can own"), which sits one section above; SSR confirms that string appears exactly once.
- **Questions stand alone.** The FAQ block is now its own section with its own `SectionHeading` ("Before we begin / A few useful answers."), rows as `0.7fr / 1.3fr` question–answer pairs, staggered 0.09; questions promoted from h4 to h3 so heading order stays h1 → h2 → h3.
- The two cues and every string in the section are unchanged; no new claims are made.

## Verified

`eslint` 0, `tsc --noEmit` 0, production build exit 0 (dev stopped first, restarted `NODE_ENV=development`, one server :3000, log clean). SSR `/services` 200: four stage titles once each, numerals `01`–`04` on `!text-white/30`, one rail rule, all nine ownership items present, "A website you can own" exactly once, both section labels and both cues present, 0 em-dashes in visible text (the matches in the raw HTML sit inside JSON-LD/flight scripts only), heading order h1 → h2 → h3 through the FAQ section (the trailing h4s are the footer's own groups). No browser tool is mounted — the rail draw is verified by code and SSR, not by screenshot.

## Pass 27: `/services` closing section rebuilt as claim + cross artwork + action row

Review rejected the text-only close (a two-column split of claim against paragraph and buttons). The final section now carries the page's closing statement beside the animated isometric-cross artwork — the same *Your business, ready to be discovered* figure that opens the services articles — with the actions as a full-width closing line.

- **Structure.** The accent rule still draws on entry (`scaleX` 0→1 over 0.8s, house `EASE`, `viewport` margin `0px 0px -18% 0px` so the draw lands with the heading rather than at the viewport edge). Below it, `lg:grid-cols-2` centres two columns: kicker → h2 → invitation on the left, the full `ServiceArtwork index={0}` figure on the right — its mono title, `Business · Identity · Website` stage caption, and detail line come along with it, and its cube-settle SMIL animation triggers on the artwork's own `useInView` (one observer per figure, no framer wrapper).
- **Copy as approved.** h2 "What should your website make possible?" now with `RevealText blur={5}` (the prop exists on `RevealText` natively; Pass 27's removed `SectionHeading` pass-through was never needed). The invitation stays the tightened two sentences, and the meta line is quoted verbatim from `/contact`'s "What happens next" ("We reply with the strongest next step, not a generic pitch.") — nothing invented.
- **Action row.** Primary `Button` (/contact) + `Cue` (/work) left, meta right-aligned from `lg` and stacked below it (the row never squeezes at mid widths). The button is the last arrival: `Entrance` delay 0.3 behind the paragraph's 0.1, after the rule and the heading.
- **Bookend cost, stated.** This is the page's fourth render of the cross geometry (hero compact, starting point, article 01, close). Raw SSR HTML grows by ~465 kB to ~1.99 MB; the route's gzipped wire size is 76.7 kB, so transfer stays small — the DOM weight is pre-existing in kind and was accepted as the price of the requested artwork.

## Verified

`eslint` 0, `tsc --noEmit` 0, production build exit 0 (dev stopped first, restarted `NODE_ENV=development`, one server :3000, log clean). SSR `/services` 200: artwork title ×2 and stage captions ×6 (articles + close), four non-compact figures, one drawn accent rule, action row with `lg:justify-between` and button/cue/meta each ×1, hero `1.4fr/1fr` grid exactly once (the close now uses plain `lg:grid-cols-2`), old `lg:items-end` arrangement gone, heading order unchanged (1 h1, 7 h2, 22 h3), 0 em-dashes in the close window, delivery rail and FAQ intact, close confirmed as the last section before the footer. No browser tool is mounted — the rule draw and cube settle are verified by code and SSR, not by screenshot.

## Pass 28: the close takes the shelf's `presence` artwork; cross repetition ends

Review of pass 27: the close had become a fourth render of the isometric cross (hero, starting point, article 01, close). The shelf at `public/images/services/` holds three artworks no page ever used — `presence.svg`, `converging.svg`, `network.svg` — with no provenance notes anywhere in the repo. Of the three, **presence** is the right pick for a final CTA: it draws a standing page with a clear offer and a cyan action block whose upward arrow rhymes with the close's own `ArrowUpRight`; it answers the section's h2 ("What should your website make possible?") by showing the possible; it restates the first service's promise ("establish a credible presence"); and its native 480×400 is exactly the figure's 6/5 slot. `converging` reads as mid-page transition (two windows, lateral arrow) and `network` is square, cyan-less, and outside the site's line language — both stay on the shelf.

- **The shelf is now a pipeline.** `presence.svg` was parsed into `artwork.json` (+2.4 kB): attributes camelCased for React, the file's root-level stroke inheritance baked onto every path (the renderer only forwards `viewBox` from the root). A round-trip check confirmed the minified JSON reproduced byte-for-byte before the addition.
- **`ServiceArtwork` grew a fourth `works` entry** — *Your business, present and clear* / "A clear page, a visible offer, and an obvious action your customers can take." / stages `Presence · Message · Action` — plus a direct-render branch (`index === 0 || index === 3`) so no page-system illustration wrapper sits around it, and an updated header comment (the Book of Shapes attribution now covers only cross/flow/commerce).
- **Motion follows the house pattern.** A new `ShapeGeometry` branch traces each stroke (`pathLength`/`strokeDashoffset` 1→0, house spline, 1.25s) and fades the six filled nodes on the same timing — started by the same one-observer `useInView` + `beginElement()`; reduced motion renders the plate static.
- **The close points at it.** `ClosingSection` renders `<ServiceArtwork index={3} />`. The cross now appears exactly once on the page (article 01), with its stage caption once.
- **Weight recovered.** Route HTML drops 1.99 MB → 1.53 MB and the gzipped wire 76.7 kB → 67.4 kB; the close section itself is 9,938 bytes of HTML.

## Verified

`eslint` 0, `tsc --noEmit` 0, production build exit 0 (dev stopped first, restarted `NODE_ENV=development`, one server :3000, log clean). SSR `/services` 200: presence title/stages/detail ×1 each, cross title ×1 (was ×2) with its stages ×1 each, four non-compact figures, 10 `strokeDashoffset` traces + 6 `opacity` fades matching the source's 10 paths/6 circles, action row with button/cue/meta ×1, heading order unchanged (1 h1, 7 h2, 22 h3), delivery rail and FAQ intact, close section 9,938 bytes with 0 em-dashes inside it (the window's two hits sit in the footer's JSON-LD site description, pre-existing; the second `>Action<` on the page is article 02's context-illustration label, pre-existing). No browser tool is mounted — the trace timing is verified by code and SSR, not by screenshot.

## Pass 29: the close blooms with Phyllotaxis Bloom; layout rebuilt two-row

Pass 28's figure rendered empty in the user's browser — only the six node dots appeared. Root cause found in the shipped code: the presence branch animated `attributeName="strokeDashoffset"` (camelCase), which never matches SVG's `stroke-dashoffset`, so the trace no-oped while the correctly-spelled opacity fade ran. The user redirected the pass: fetch the real SVG from bookofshapes.com, animate the source's own controls, and change the layout.

- **Pattern choice: Phyllotaxis Bloom** (https://bookofshapes.com/patterns/phyllotaxis-bloom, radial/organic). 799 seed lines placed by the golden angle; growth from seed reads as the finale's "next chapter", and the radial burst contrasts the page's rectangular browser frames.
- **Pipeline reused.** Preview fetched (226,814 bytes), copied verbatim to the shelf, parsed into `artwork.json`: presence key removed, phyllotaxis added (+274 kB raw), the file's CSS-variable stroke (`var(--stroke-color, currentColor)`) baked to the site line colour `#e8edf0`, attributes camelCased, coordinates rounded to 3 decimals, `<style>` dropped; cross/flow/commerce round-tripped byte-identical.
- **`works[3]` rewired** — *From seed to bloom* / "Each point sits the optimal distance from the last, so growth stays ordered as it scales." / stages `Seed · Structure · Scale` (detail paraphrases the source's own description).
- **Motion animates the source's controls, not decoration.** Length: each tick's `x2` runs 0 → exported length. Turn: its golden-angle `rotate` unwinds θ−24° → θ. Both carry a `data-delay` proportional to the tick's radius (0 → 0.45s, inner seeds first); the shared observer now calls `beginElementAt(delay)` instead of `beginElement()`, a no-op change for cross/flow/commerce. Geometry keeps its exported final state until the animation begins, so a failed script still shows the full plate; reduced motion renders it static. The broken presence branch is gone with the artwork.
- **Layout rebuilt two-row.** Row 1: `lg:grid-cols-[1.15fr_0.85fr] lg:items-end` — kicker + `RevealText blur={5}` h2 left, invitation right (0.1). Row 2: `lg:grid-cols-2 lg:items-center` — figure left, actions right (0.3): button + cue row with the contact-sourced meta beneath, stacked below `lg`. The accent rule and its draw are untouched.
- **Weight, honestly.** Route HTML 1.53 MB → 2.05 MB and the gzipped wire 67.4 kB → 97.4 kB: the figure now SSRs ~4,800 SMIL-bearing elements. Accepted per direction (live source SVG over the lighter placeholder).

## Verified

`eslint` 0 (changed files and full `npm run lint`), `tsc --noEmit` 0, production build exit 0 (dev stopped first, restarted `NODE_ENV=development`, one server :3000, log clean). SSR `/services` 200: 799 `attributeName="x2"` grows + 799 `type="rotate"` unwinds each carrying `data-delay` (max `0.45`), stages `Seed`/`Structure`/`Scale` ×1, title ×1, old presence strings absent, `1.15fr` layout class present, 0 em-dashes in the 520,048-byte close window, heading order unchanged (1 h1, 7 h2, 22 h3), 4 non-compact figures + 4 compact, flow's correctly-spelled `stroke-dashoffset` trace retained, `phyllotaxis` present in `app/services/page.js`. No browser tool is mounted — the bloom timing is verified by code and SSR, not by screenshot; the user should confirm the growth in their own viewport.

## Pass 30: `/make-it-yours` rebuilt on the services design language

Direction: keep the foundation page's content and logic exactly, but reformat it on the `/services` inspiration — modern, animated, with the process legible top to bottom. Everything that carries meaning (copy, select options, prices, form wiring, the unDraw figure, `recommendRoute`/`buildFitReference`/`moveToInquiry`, grain) is untouched; only layout, type scale, and motion changed.

- **The process is visible up front.** A three-step index nav sits under the hero on a drawn rule — 01 Project fit → 02 Your likely route → 03 The useful next step — reusing the existing section labels as anchors (`#fit-check`, `#route` [new id], `#inquiry`), each entering with a 0.07 stagger.
- **Every band boundary draws.** Static `border-t`/`border-b` separators were replaced by a `Rule` component: `scaleX` 0→1 over 0.8s on the house EASE, `once`, `-18%` viewport margin, white/15 — and the inquiry section closes with the accent-30% rule, the same treatment the services close uses to mark a finale.
- **Hero onto services rhythm.** Kicker row at `border-white/15`; claim/figure split on `lg:grid-cols-[1.15fr_0.85fr] lg:items-end` (the close's row-one grid); lead + direction note + jump CTA in one `Entrance` at 0.1, figure at 0.15.
- **Fit check became a ruled checklist grid.** Full-width `SectionHeading` (kicker + `RevealText` h2) with the intro beneath it, matching the services evidence pattern; the four `FitQuestion` fieldsets sit in a 2-column ruled grid (question 04 spans both columns) with `Entrance` staggers 0.08 → 0.32. Fieldsets, legends, selects, and every option string are unchanged.
- **Route reads like the close's two-row band.** Row 1: accent kicker + offer label left (kept a plain `<h2>` — it changes live, and `RevealText` owns static headings only), `routeReason` right, items-end. Row 2: stats promoted to a `<dl>`, includes as the services' `border-l` 2-column list, caveats + CTA in the bordered right panel; the whole block is keyed on `path`, so a route flip re-runs its `Entrance` while `aria-live` keeps announcing.
- **Inquiry got the closing treatment.** Accent rule, kicker + `RevealText blur={5}` close-scale h2 left (`0.85fr`), the form right (`1.15fr`, `min-w-0`).
- **House button.** The bespoke accent CTA became `<Button size="lg">` + `ArrowUpRight` — the component the services close uses.
- **Type aligned to services:** `HEADING` clamp(2rem,4.3vw,3.7rem) semibold, house `LABEL` (mono 10 / white-60) for kickers, close-scale clamp(2.5rem,5.7vw,5.2rem) for the route and inquiry h2s, `font-bold` → `font-semibold` on section headings, uniform `py-16 md:py-24` bands with `scroll-mt-28`.

## Verified

`eslint` 0 (file + full `npm run lint`), `tsc --noEmit` 0, production build exit 0 (dev stopped first, restarted `NODE_ENV=development`, one server :3000, log clean; rebuilt again after two post-review class fixes). SSR `/make-it-yours` 200 (59,078 B): full content-string audit reports zero missing (h1, lead, direction note, jump CTA, all four question titles and every `<option>`, all three `routeReason` variants, stats labels, both caveats, inquiry copy, form heading/description); 4 `origin-left` drawn rules; step-index nav + `id="route"`; heading set unchanged (1 h1, 4 h2, 0 h3); 5 selects; `aria-live="polite"` retained. Two review fixes held: the figure's `lg:justify-self-end` moved onto the grid item (the `Entrance` wrapper had swallowed it), and the strip's `sm:first:pl-0` moved from each `<a>` (always `:first-child` of its own `<li>`) to the `<li>` where it actually discriminates. No browser tool is mounted — the rule draws and staggers are verified by code and SSR, not by screenshot.


## Pass 31: `/make-it-yours` given a life — presence plate, alive route, rewritten copy

Direction: the user verdicted the page "Very trash and very unpleasant design and content please make this page meaningful not jut another page. Give it a life." Unlike pass 30, content was explicitly back in scope. Rule for the rewrite: every string earns its place (state a fact, a stance, or a next step), all logic untouched — `recommendRoute`, `buildFitReference`, fit answers, currency, form wiring, `aria-live`, tracking.

- **The figure is now Echo11's own.** The unDraw wireframe was replaced by `presence.svg` (the phase4-pass-28 closing study, previously unwired), converted to `src/app/make-it-yours/presence.json` and rendered by a new `FoundationPlate.tsx`. The figure sits on the services figure anatomy (ruled band, `aspect-[6/5]` matching the 480×400 viewBox, cyan glow, `inset-[6%]` art) with the stages caption `Structure · Offer · Action`.
- **Pass 28's empty-figure bug fixed at the root.** The old animation used camelCase `strokeDashoffset` in `attributeName`, which SVG silently ignores. The plate uses the dashed spelling and the house robust pattern: geometry is written in its *final* state (`strokeDasharray="1" strokeDashoffset="0"`, nodes opaque) so no-JS shows the whole study, the SMIL `animate` jumps to `values="1;0"` on begin, and a `useInView` + `beginElementAt(data-delay)` pass staggers the ten strokes at 70 ms and fades the six nodes at 700–950 ms. Reduced motion skips the animates entirely and renders the static art.
- **The route section behaves.** The result block re-runs every `Entrance` on flip (`key={path}`), and the offer heading is now a `motion.h2` with whileInView — the documented exception that framer owns dynamic headings while `RevealText` keeps static ones. A `Read back · Service site · Public journey · …` receipt strip under the heading reads the answers back in mono, derived from a `RECEIPT_LABELS` lookup, `aria-hidden` so `aria-live` stays the only announcer.
- **Copy rewritten, options and reasons kept.** Hero lead now names the actual exchange ("Four questions … a starting scope, a price frame, and the reasoning behind both, before the first call"), the jump CTA became "Start the fit check →", and the fit intro states what the signal is and is not ("Not an automated quote, a signal … we confirm every line with you before anything is fixed"). Question titles, every `<option>`, both `routeReason` variants, and the inquiry copy were deliberately kept — they were already doing honest work.
- **Selects afford interaction.** Every one of the five `<select>`s moved into a `SelectWrap` with a `ChevronDown` (right-4, pointer-events-none) and the class gained `pr-10`, so the affordance is visible instead of hidden behind the native appearance.
- **Retired honestly.** `foundation-app-wireframe.svg` stays on disk; ATTRIBUTION.md moved it under a "Retired (kept on disk, not rendered)" heading, and the shelf README now records presence as wired with the dashed-spelling lesson.

## Verified

`npx tsc --noEmit` 0 (after typing the root `strokeLinecap`/`strokeLinejoin` casts), `npx eslint` on both changed files 0, full `npm run lint` 0, production build exit 0 (ports killed first, `NPM_CONFIG_CACHE` workaround), dev restarted `NODE_ENV=development`, one server :3000. SSR `/make-it-yours` 200 (66,150 B): full content-string audit zero missing (new lead, CTA, fit intro, receipt, all question titles, all options, both reasons present — only the non-active `routeReason` variant absent, as expected for default answers); `viewBox="0 0 480 400"` plate present with 10 `stroke-dashoffset` + 6 `opacity` animates and zero `strokeDashoffset` camelCase; no wireframe/unDraw reference anywhere; heading set 1 h1 / 4 h2 / 0 h3 (fit, route offer label, inquiry RevealText, form heading); 5 selects, 5 `SelectWrap` chevrons, `aria-live="polite"` retained, zero em-dashes. No browser tool is mounted — the plate's trace timing and the receipt strip are verified by code and SSR, not by screenshot; the user should confirm the self-trace plays in their own viewport.


## Pass 32: custom art replaced by Book of Shapes "Radial Spokes", dropdowns on shadcn Select

Direction: "update the art/custom designed css replace them by the art from https://bookofshapes.com/ make sure you copy it's attribute and animate using them." Target was the page in focus, `/make-it-yours`: its figure was the hand-made `presence.svg` plate backed by a CSS `radial-gradient` glow — both the custom art and the custom CSS in one slot.

- **The pattern.** [Radial Spokes](https://bookofshapes.com/patterns/radial_spokes) (Nikolaj Sokolowski, Book of Shapes — same shelf licence as the services figures): lines at angular intervals around a centre. The verbatim preview joined the shelf as `public/images/services/radial_spokes.svg`; conversion to `src/app/make-it-yours/spokes.json` copies every source attribute — `viewBox 0 0 500 500`, 34 two-segment spokes with the dual `stroke-width` 0.4 (centre → joint) and 0.8 (joint → tip), `stroke-linecap="round"`, `vector-effect="non-scaling-stroke"`, joint/tip circles at `r 1.5`, the source `translate/scale/rotate` wrappers — with only two house adaptations: CSS-variable strokes baked to Echo11's `#e8edf0` and coordinates rounded to 3 decimals.
- **Animation comes from those attributes.** The converter ranks the 34 slots by each spoke's own `x2/y2` angle, so the entry sweeps around the wheel; each inner line animates `x2`/`y2` from `0` to its copied endpoint, each outer line continues from its copied `x1/y1` to `x2/y2` (a literal from→to of the source numbers), and the joint then tip dots fade behind their segment via `beginElementAt(data-delay)` — the same reduced-motion/static-geometry-first pattern as the other figures.
- **CSS art removed.** The `radial-gradient` glow div behind the figure is gone; the spokes carry the radial energy themselves. Figure copy updated to match the art honestly: "One center, many directions", stages `Fit · Route · Next step` (the page's three steps). `FoundationPlate.tsx` and `presence.json` were deleted with the swap — no references remain.
- **Dropdowns → shadcn (carried from the interrupted turn).** The five fit `<select>`s and the inquiry form's two became a standard shadcn `Select` (`src/components/ui/select.tsx`: Radix primitive, `SelectTrigger/Content/Item/Value`, portal, typeahead, scroll buttons, keyboard model) restyled to house tokens — zero radius, hairline borders, `bg-card` panel, accent focus ring, selected item marked by an accent hairline rail instead of a tick (bans hold), `select-in` keyframes added to the Tailwind config with `motion-reduce:animate-none`. One real Radix trap found and fixed: `SelectValue` only renders item text while content is mounted, so closed triggers SSR'd *empty* — option lists were extracted into a single `FIT_OPTIONS` source and the label is passed as `SelectValue` children (form selects do the same from `budgetOptions`/`TIMELINE_LABELS`).

## Verified

`npx tsc --noEmit` 0 (after fixing a duplicated `className` and the empty-trigger bug), changed-file `eslint` and full `npm run lint` 0, production build exit 0 (`/make-it-yours` 9.54 kB / 243 kB first load; radix added ~30 kB), dev restarted `NODE_ENV=development -p 3001` to keep the user's tab target. SSR `/make-it-yours` 200 (119,756 B): 68 `attributeName="x2"` + 68 `"y2"` + 68 `"opacity"` animates, `viewBox="0 0 500 500"`, `stroke-width` 34×0.4 / 34×0.8, 68 `non-scaling-stroke`, header and `Fit · Route · Next step` caption present, glow gradient absent, five `role="combobox"` triggers each rendering its value text ("Service or marketing website" etc.), full content-string audit (hero lead, fit h2, receipt, `aria-live`) green, 1 h1 / 4 h2 / 0 h3, zero em-dashes in visible body copy (the one in the root JSON-LD description is pre-existing site metadata). Form selects mount at form step 2 by design, so they are code-verified only. No browser tool is mounted — the spokes sweep and the select panel are verified by code and SSR, not by screenshot; please confirm both in your viewport.


## Pass 33: fit check rebuilt as an editorial ledger

Direction: "rebuild this section with better layout and better visualization of content :01 / Project fit". The old layout was four small ruled `fieldset`s in a 2×2 grid with 10px numerals — dense, form-like, no hierarchy, and the intro paragraph floating under the heading.

- **Split header**, matching the hero and route sections: kicker + `RevealText` h2 left, intro paragraph bottom-aligned right (`lg:grid-cols-[1.15fr_0.85fr]`).
- **Single-column ledger rows** (`FitRow`): `md:grid-cols-[5rem_minmax(0,1fr)_minmax(17rem,21rem)]` — a ghosted mono numeral (2xl → `clamp(2rem,3vw,2.75rem)`, brightens `group-hover`) in a fixed gutter, the question as a real editorial statement (`text-[1.0625rem] → text-xl`), and the answer in a fixed right column so all five selects share one edge. On mobile the answer cell spans both columns. Question 04 stacks its two labelled selects in that same answer column, keeping the right edge unbroken. Rows keep the ruled `border-t` language and close with a `border-b` on the container.
- **Radix label trap found and fixed**: the first cut wrapped rows 01–03 in `<label>` so clicking the question opened the select. Radix Select opens on `pointerdown` (mouse) and its `onClick` only opens when `pointerTypeRef.current !== "mouse"` (initialized to `"touch"`) — so a label-activated click (synthetic `click`, no `pointerdown`) worked once, then silently stopped after the first real pointerdown on the trigger. Rows are now plain `<div>`s; each trigger takes `aria-labelledby` pointing at the question title's `id` (question 04's triggers combine title id + their mono label ids), which also restores the grouping information the old `legend` provided.

## Pass 34: `03 / The useful next step` rewritten and redesigned from zero

Direction: "rewrite and redesign each and every component and remove the current design and content style totally from 03 / The useful next step section". The old section was a bordered card with a drop shadow (`shadow-[0_30px_90px_...]`), a boxed step strip, two equal bordered route cards, a 5-cell bordered project-type grid, boxed inputs, and the copy style "Give the recommendation some context." / "Project inquiry". Every component in the section was replaced; the shared `ProjectInquiryForm` was left untouched because `/contact` still renders it.

- **New component, new structure**: `src/app/make-it-yours/NextStepBrief.tsx` — same validation rules, honeypot, server action, tracking, and currency plumbing as before (nothing functional loosened), but the presentation is an open sheet, no card, no shadow, no boxes anywhere:
  - **Step meta**: a big accent step fraction (`01` / `02` at `clamp(2.25rem,4vw,3.25rem)`) with `of 02 · Route|Details`, the currency switcher on the right, and a two-segment progress rule below (active `bg-accent`, completed `bg-accent/40`, pending `bg-white/15`).
  - **Route choices** are two full-width ledger rows instead of equal cards: `border-l-2` rail (accent when selected, transparent otherwise) + accent offer label + `aria-pressed`; each row carries `bestFor`, typical delivery, and live `formatOfferPrice` pricing right-aligned.
  - **Project type** is five underline toggles (`border-b-2` accent when pressed) instead of a bordered grid.
  - **Step 2 fields** are a ruled two-column sheet (`BriefField`: mono micro-label, `border-b` underline inputs — no boxes; Radix triggers restyled to the same underline via `selectClass`), goals spanning full width, the fit-check reference as a sheet row, errors as `border-l-2` rails, and submit as `Send the brief`.
  - **Step transitions** animate with framer (`key={step}`, reduced-motion guarded) and focus moves to the back/next control on each change (skipped on first render); success is a `border-t-2 border-accent` editorial block: "Brief sent" / "That is everything we need for a first reply."
- **Section copy replaced entirely**: kicker kept (it is the guide's index), h2 is now "Budget, timing, and what has to change.", intro rewritten ("The fit check gave you a starting route and a price frame..."), legend "Which route are we scoping?", CTA "Next: budget and timing", back "Back to the route". No em-dashes; no old strings remain on the page.

## Verified

`npx tsc --noEmit` 0; changed-file `eslint` and full `npm run lint` 0; production build exit 0 (`/make-it-yours` 13.4 kB / 244 kB first load, `/contact` unchanged at 4.11 kB / 190 kB); both dev servers restarted (`-p 3000` for the user's tab, `-p 3001`). SSR `/make-it-yours` 200: new h2 + intro + "Which route are we scoping?" + both route labels + "Starting from"/"Delivery" + "Next: budget and timing" + step meta (`01`, `of 02 · Route`) + project-type legend and all five options present; old strings gone ("Give the recommendation some context.", "Tell us what the work needs to do.", "Project inquiry", "Choose your starting route", "What are we building?"); fit triggers carry `aria-labelledby="fit-q01..03"` and the two `fit-q04` combos; 5 comboboxes, spokes (68×`x2`) intact, 1 h1 / 3 h2 / 0 h3, zero em-dashes in body copy; `/contact` 200 still serving the untouched `ProjectInquiryForm`. CSS cascade for the underline restyle verified in the built stylesheet (`.border-0` at offset 24800 before `.border-b` at 24921; `.border-white/15` before `.border-l-accent`), so the select underline and accent rail actually render. Step-2 fields and success state are client-only, so they are code-verified (tsc + eslint + logic identity with the previous form); no browser tool is mounted — please eyeball the ledger, the two route rows, and the step flip in your viewport.
