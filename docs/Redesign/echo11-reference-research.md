# Echo11 reference research: PRODUX and frontend craft

**Status:** Research dossier; not an Echo11 implementation specification  
**Version:** 0.2 · **Date:** 2026-10-02  
**Companions:** `echo11-frontend-foundation.md`, `echo11-page-anatomy.md`, `echo11-motion-and-interactions.md` (delivered separately).  
**Evidence file:** `evidence/produx-home-ssr-2026-10-02.md` — verbatim markup and stylesheet quotes, cited below as `E1`–`E12`.  
**Subject:** https://www.produx.design/

> Read this as a source ledger and skill map. It distinguishes verified page text, third-party reports, creator statements, transferable techniques, and unmeasured visual hypotheses.
>
> **v0.2 note.** Version 0.1 was prepared from page-text extraction only and carried a broad
> disclaimer that no DOM or runtime traces existed. A live SSR capture of `/` on 2026-10-02
> falsified parts of that disclaimer, so tier A2 was added and the affected claims were
> corrected in place with a dated correction rather than silently rewritten. **Still no computed
> CSS, no source files, and no runtime animation traces.** Declared values are now known;
> computed values, design-token provenance, and library identity are not. Section 12 records
> site drift observed between the 2026-10-01 dossier and the 2026-10-02 capture.

## 1. Method and confidence model

### Evidence tiers
- **A — Primary page content:** Fetched pages establish published text, routes, broad information architecture, and some control/state labels. A text extractor cannot faithfully represent spatial layout, hover, scrolling, or animation.
- **A2 — Live SSR markup:** DOM order, authored class names, inline `style` attributes, `<link rel=preload>` hints, and asset paths read from the HTML the server actually returned. Added in v0.2. Source of record: `evidence/produx-home-ssr-2026-10-02.md`, anchors `E1`–`E12`. Covers route `/` only, at one moment, on 2026-10-02.
- **B — Creator/collaborator statement:** Attributable public description of a particular effect. Still not equivalent to source code or measured runtime behavior.
- **C — Third-party detector/award page:** Useful signals for technologies, credits, categories, and editorial recognition. Detection can be stale, incomplete, or overbroad.
- **D — Related educational resource:** Explains how an effect *can* be built, not how this site *was* built.
- **U — Unknown:** No adequate evidence. Never fill with a plausible-looking exact value.

### A2 guardrails
A2 is a stronger source than A and a much richer document to misread. It is still one fetch of one
route, and it is **not** computed styles. Four rules govern every A2 claim in this dossier.

1. **Declared is not computed.** Class names and inline `style` attributes are *authored*
   values. Anything read from a browser's computed style is *Observed (computed)* — **nothing in
   this pass is.** The two labels are used explicitly wherever the distinction matters.
2. **A class name is not a behavior.** `-splitWord` (`E7`) proves a split-text hook exists. It
   proves nothing about easing, duration, scrub, or trigger, none of which appear in the
   capture.
3. **The detected stack stays tier C.** `save.design` reporting GSAP/Three.js/Lenis is not
   upgraded by markup that contains none of those names (`E10`: 0 occurrences of `gsap`,
   `ScrollTrigger`, `three`, `lenis`, `getContext`, `webgl`). Nineteen script chunks are
   referenced by `/`; one was sampled and contained no library markers. Do not restate tier C
   as verified.
4. **The U-list is recorded, and it shrank only where a file was actually read.** The v0.1
   preparation could not read the stylesheet; on 2026-10-02 the CSS chunk returned HTTP 200 and
   was readable, which resolved the palette token values, the `@font-face` declarations, and the
   type-scale steps (`E3`, `E4`, `E12`). That is the only reason those items moved. **Nothing that
   required execution moved** — every computed value, duration, easing, trigger, and library
   identity stays **U**, and §1.1 is the authoritative list. Do not extend a U-item to a value on
   the strength of a plausible class name.

### 1.1 What remains unknown after the A2 pass
- Every computed style: rendered font, resolved size, used weight, used line-height, used
  color, actual element bounds, actual grid gap in pixels. *Cause: no browser or DevTools.*
- Which At Aero face binds to which element at which viewport, and the cascade outcome. *The
  class-name mapping in §3 is a mapping of declared classes only.*
- At Aero licensing terms. *Out of scope for a markup capture.*
- Easing, duration, scrub, and trigger for every split-text hook. *No values in the markup; the
  readable stylesheet contains exactly two `@keyframes`, both view-transition fades (`E12`).*
- Animation library identity, and which of the four canvases is WebGL. *The libraries live in
  script chunks that were not read (`E10`, `U5`); canvases are empty in SSR (`U6`).*
- Runtime scroll physics. *`--bg-progress` and `--bg-softness` are referenced by an inline
  style but defined nowhere in the readable stylesheet, so they are set at runtime by an unread
  chunk (`E6`, `U7`).*
- Reduced-motion behavior. *`prefers-reduced-motion` occurs 0 times in the markup and 0 times in
  the readable stylesheet; JavaScript accommodation cannot be excluded (`E12`, `U8`).*
- Font weights as rendered, and the accessibility-tree treatment of the 272 ghost/character
  spans (`E7`, `U9`).
- Breakpoint behavior, rewrap, zoom, reflow, focus order, keyboard operation, and performance.

### Research boundaries
The browser page being viewed is known, but this research environment did not provide DevTools DOM inspection, computed styles, network waterfall, screenshots across viewports, screen recordings, or hands-on pointer/scroll testing. Repository searches did not locate an attributable public repository for the complete site.

**Superseded in v0.2.** Version 0.1 also stated that text extraction "sometimes concatenates or
duplicates words; that is not evidence of duplicated visible typography, masking, or accessibility
behavior." The first half of that reasoning failed: a text extractor was the wrong instrument for
this site, and the duplication it showed is a real per-word and per-glyph technique (`E7`). The
accessibility half did not fail and is now the live question — see the dated correction in §4.

**Corrected in v0.2.** The v0.1 line "no live DOM structure" was also too broad. Live SSR
markup for `/` is now recorded. It is authored structure, not runtime structure: it cannot show
what a hydration pass adds, removes, or rewrites.

### Language used in this document
- **Observed (declared):** Directly supported by retrieved page content, or by authored class
  names / inline `style` values / stylesheet literals from the A2 capture.
- **Observed (computed):** Read from a browser's computed style. **No claim in this dossier is
  labelled this.** The tier exists so future passes can use it.
- **Reported:** Explicitly claimed by a third party or creator.
- **Hypothesis:** Plausible implementation/visual interpretation that requires measurement.
- **Transferable skill:** An engineering/design capability illustrated by the class of effect, regardless of how PRODUX implemented it.

## 2. Primary source ledger

| Source | Type | Supported facts | Limits |
|---|---|---|---|
| https://www.produx.design/ | A, **A2** | Homepage title, headline “You feel the brand before it speaks®,” “Play reel,” project/service-oriented public content. **A2 adds** section order and wrappers, gutters, type-scale steps, resolved palette values, grid spans, pin heights, split-text hooks, nav/footer structure, cursors, 4 canvases, 7 videos, 18 asset preloads, and 7 `@font-face` declarations (`E1`–`E12`). | **Corrected in v0.2.** The v0.1 limit read "does not provide exact live animation or CSS metrics," which overstated the gap. Declared values — authored class names, inline `style` values, and stylesheet literals — are now known. Still not known: computed styles, per-element cascade outcome, design-token provenance, animation-library identity, and all durations, easings, and triggers. |
| https://www.produx.design/work | A | Dedicated Work route, navigation/menu labels and project-browsing context. | Extracted words alone do not establish grid geometry or project hover behavior. Not fetched in the A2 pass. |
| https://www.produx.design/studio | A | Studio narrative and positioning. | Cannot measure reading widths, font weights, or reveal choreography. Not fetched in the A2 pass. |
| https://www.produx.design/journal | A | **New row, added in v0.2.** The route is live: linked from the homepage bracket navigation and the mobile footer stack. The homepage carries a Journal section with an `h2` manifesto and five `h4` cards, and five `/images/JournalImages/{1..5}.webp` preloads (`E1`, `E8`, `E11`). | Present in this ledger only because the A2 pass read it in `/`'s markup. The `/journal` page itself was not fetched, so no claim here describes its content. Exactly one `/journal/*` article link appears in the homepage markup. |
| https://www.produx.design/service/branding | A | Service detail exists and has a clear service heading and explanatory content. | Other services' structure and effects may differ. The `/service/*` family is **not linked from the homepage markup** (0 occurrences, `E8`) — it was absent from the v0.1 ledger and is added as a reachability finding, not a content claim. Not fetched in the A2 pass. |
| https://www.produx.design/lab | A | Lab presents resources/tools/experiments built by the studio. | Individual demos' technical internals not established. **A2 note:** `/lab` appears in the homepage's `sm:hidden` footer stack only, not in the desktop bracket navigation (`E8`). Whether it is deprecated upstream is unknown and left open. |
| https://www.produx.design/contact | A | Project brief and thank-you wording appear in retrieved text. | Does not prove actual validation, backend, or visibility rules for success state. |
| https://www.produx.design/service/branding | A | Service detail exists and has a clear service heading and explanatory content. | Other services' structure and effects may differ. |
| https://www.cssdesignawards.com/sites/produx/49444/ | C | Award listing credits Alex Socoloff with Yousuf Soomro and describes the site using animated/parallax/WebGL categories. | Categories are not implementation proof per section. |
| https://save.design/analyze/produx-design | C | Reports Next.js, React, GSAP, Three.js, Lenis, At Aero, and DM Mono. | Does not map dependencies to sections or expose source code. |
| https://x.com/YousufSoomroDev/status/2056355003565224437 | B | A credited collaborator describes an entry animation as a design showreel, mentions a WebGL carousel entry, and studying easing using an After Effects template. | No proof of exact shader, timeline, carousel geometry, or AE running in the browser. |
| https://www.awwwards.com/sites/produx-design | C | Listing for site of the day. | Fetch attempt did not yield full page; avoid unsourced visual claims based on it. |

**Name collision caution:** Other sites with similar “Produx” branding, including `produxdesign.com`, `produxdesign.studio`, and `produxstudio.com`, must not be conflated with `produx.design`. Search hits or GitHub projects named ProduX may be unrelated.

## 3. Reported technology: what it means and does not mean

| Technology | Report | Skills it points toward | Not established |
|---|---|---|---|
| Next.js / React | Third-party stack detection | Route architecture, component boundaries, server/client separation, media and metadata practices. | Exact version, hosting, CMS, or whether every page is client rendered. |
| GSAP | Third-party stack detection | Authored timeline sequencing, scroll choreography, React lifecycle cleanup. | Specific plugins, selectors, triggers, values, or that all motion uses GSAP. |
| Three.js / WebGL | Detector + award category + collaborator entry-animation statement | GPU-rendered imagery, textures, scene setup, interpolation, potential custom shaders. | React Three Fiber, shader code, carousel geometry, or WebGL on every page. **One sub-item closed in v0.2:** the canvas count is 4 on `/`, Observed (declared), all empty in SSR with three at `pointer-events:none` and one declaring a `mask-image` (`E10`). Which of them is WebGL remains U — `webgl` and `getContext(` occur 0 times in the markup. |
| Lenis | Third-party stack detection | Smooth-scroll integration, scroll synchronization, input/accessibility testing. | Site-wide usage, configuration, or necessity for individual effects. |
| At Aero / DM Mono | Third-party font detection, **now with A2 role mapping** | Display/meta typographic contrast, variable styles, licensing, font loading. | **Role mapping is now Observed (declared)** — see below. Still not established: which face binds to which element at which viewport, rendered weights, letter spacing, or license terms held by the studio. |

#### Font role mapping — Observed (declared), 2026-10-02

This answers the open question in §5.2. The mapping below is read from class names on the
elements in the served markup, and from the shipped stylesheet's own `@font-face` and utility
declarations (`E3`, `E12`). It is a mapping of **declared** classes, not of computed styles.

| Role | Declared class | Resolves to (stylesheet) | Frequency in `/` |
|---|---|---|---|
| `h1`, both `h2`, all `h3` | `font-AtAero` | `font-family:At Aero` | ×16 |
| Testimonial names (`h4`) | `font-AtAero-Medium` | `font-family:At Aero Medium` | ×6 |
| Journal cards (`h4`) | `font-AtAero-Regular` | `font-family:At Aero Regular` | ×16 |
| Footer, labels, cursors, newsletter input | `font-DM-mono` | `font-family:DM Mono` | ×126 |

The mono row includes all three declared custom cursor layers — the scroll-down indicator, the
project cursor, and the "Trusted by" cursor — while the showreel cursor is an icon-only
`mix-blend-exclusion` disc (`E9`).

So the hypothesis in §5.2 — display face on headings, mono reserved for labels and metadata —
is **supported as a declared mapping** for `/`. Two qualifications keep it short of a rule:

- The journal `h4` cards switch families inside one class list, `font-AtAero-Regular …
  max-lg:font-DM-mono`. The mapping is breakpoint-conditional for that element, so it cannot be
  stated universally.
- The `@font-face` block declares **4** At Aero faces (Retina, Regular, Medium, Light) as static
  `.otf` and **3** DM Mono faces as `.ttf` with `format("truetype-variations")` at weights
  300/400/500, all with `font-display:swap` (`E12`). The At Aero faces each declare
  `font-weight:100 900` over a static `.otf`; that is a declaration, not evidence of a variable
  axis. Which face actually renders for a given element is unverified. **Weights as rendered
  and At Aero licensing remain U.**

Older founder discussion about no-code/Webflow services cannot be used to conclude this *specific* live site is Webflow. Avoid treating marketing services as evidence of deployed stack.

**The A2 pass did not move the GSAP, Three.js, or Lenis rows, and must not be cited as doing so.**
The markup contains 0 occurrences of `gsap`, `ScrollTrigger`, `three`, `THREE`, `lenis`, and
`Lenis`. `/` references 19 `<script src>` chunks; the single preloaded chunk was sampled and
contained none of them, and the other 18 were not read. A negative result in a file that was not
read is not a negative result about the site (`E10`, `U5`). These three rows stay **tier C**.

## 4. Page and section observation matrix

| Area | Observed content | Effects supported by evidence | Open questions for a browser audit |
|---|---|---|---|
| Opening/home hero | “Play reel” and a dominant statement. | Creator post specifically references WebGL carousel entry and studied easing. | **Partly closed for `/` in v0.2** — see the closed-questions table below. Remain OPEN: what is interactive once loaded, time to usable text/CTA. |
| Home work showcase | Named projects and project-led content. | Site categorized as animated/WebGL overall. **A2:** 5 `h3` project names, 7 `<video>`, 40 `<img>`, `will-change-transform`, media in `height:48.8vh` boxes with a `scale(1.025)` oversizing layer. | Is the project gallery itself WebGL? Hover behavior? Media transition geometry? |
| Home service/content flow | Service offerings and editorial narrative. | **A2:** contribution list of 4 `h4` items; `services-section` pinned at `600vh` with a `100vh` sticky child and 2 canvases; its `h2` split into 14 `service-word` spans with a `max-width:640px` inline gradient fallback. | Which sections pin, parallax, reveal, or remain static — beyond the three named in `E6`? |
| Work index | Dedicated route with project-oriented navigation. | No measured hover/filter/transition behavior. | Grid tracks, gaps, typography, breakpoints, focus/touch equivalents? |
| Studio | Philosophy and positioning text. | No verified text-reveal technique. | Text width, line wrapping, alternating layout, animation triggers? |
| Service detail | Clear service title and explanatory paragraphs. | No verified effect mapping. | Reading measure, hierarchy, media relation, CTA placement? |
| Lab | Tools/resources/experiments framing. | Content implies experimental work, but not any specific front-end technique. **A2:** linked only from the `sm:hidden` mobile footer stack (`E8`). | Which items are live demos? How do loading/fallbacks behave? Is `/lab` still maintained upstream? |
| Contact | Project brief and thank-you copy retrieved. | State wording exists; actual state logic unverified. | Form fields, validation, success visibility, server handling, consent? |
| Navigation | Work/Lab extracts include menu/close labels. | Interactive menu state indicated by labels. | **Partly closed for `/` in v0.2.** Remain OPEN: focus behavior, Escape, scroll locking, opening motion. |
| Journal *(row added in v0.2)* | A Journal section with an `h2` manifesto and five `h4` cards. | **A2:** the manifesto is per-glyph split with static 20%-white ghost copies (`E7`); 5 `JournalImages` preloads. | Reveal timing, scroll linkage, and the accessibility-tree treatment of its 272 char/ghost spans. |

#### Browser-audit questions closed for `/` by the A2 pass

These are closed **for route `/`, as declared values only**. Each still needs a browser before
anything about it can be called measured.

| Was OPEN in v0.1 | Now | Anchor |
|---|---|---|
| Is there a separate loader? | A full-viewport `bg-outer-space` layer at `opacity-0`, `z-index:99999`, is present in the markup, as is a `page-transition-overlay` at `style="top:150%"`. Existence: **yes**. Sequence, progress, and dismissal: still OPEN. | `E8` |
| What is interactive in the hero? | Partly. A `#hero-showreel` video in an `opacity:0` box, a `heroSection-expanding-box` at `aspect-[1.784/1]` with `perspective:1200px`, and 2 canvases in the services pin. Runtime interactivity: still OPEN. | `E6`, `E10` |
| Are layers DOM or canvas? | Both, declared. 4 `<canvas>` (empty in SSR, three `pointer-events:none`, one with `mask-image`) alongside `h1`–`h4` and the Journal manifesto's 136 glyphs, each present twice (272 spans). Which canvases are WebGL: OPEN. | `E1`, `E7`, `E10` |
| Which sections pin? | Three named pins: `heroSection-Sticky-wrapper` at `650vh`, `services-section` at `600vh`, `testimonials-spacer` at `320vh`, each with a `sticky` child. | `E6` |
| Is the project gallery WebGL? | Gallery is 5 `<h3>` project cards using `<img>` and `<video>`, not canvas, at the declared grid spans. Whether any of it is WebGL: OPEN. | `E1`, `E5`, `E10` |

Everything else in the right-hand column above stays **OPEN**, and every row for every route
other than `/` is untouched, because no other route was fetched.

**Important — correction dated 2026-10-02. The v0.1 note in this position read:**

> *Apparent text duplication in extraction is not proof of split text, animation copies, or
> duplicate accessible content. Inspect the live DOM and accessibility tree before drawing that
> conclusion.*

**That warning was wrong about the first two claims and is retained here rather than deleted,**
because this dossier is an audit trail and a silently dropped caveat is how stale claims survive.
Specifically:

- **Falsified.** Split text and animation copies are real. `/` declares 128 `-splitWord` hooks and 9 `-splitLine` hooks, named per section rather than generically: `ProjectsSection-splitWord` (89), `servicePoint-splitWord` (32), `heroSection-splitWord` (7), `label-splitLine` (4), `heroSection-splitLine` (3), `mobile-splitLine` (2), plus 26 `journal-section-text-words` wrappers. The Journal `h2` renders each glyph twice — a static `absolute top-0 left-0 text-white/20` ghost and a `char relative opacity-0` animated twin, 136 of each, verified as a 1:1 pairing in the same order — inside per-word `overflow-hidden` masks. The doubling the extractor showed was a true reading of a real technique, not a concatenation artifact (`E7`).
- **Still open, and the real residual question.** Those ghost copies do duplicate text, and as
  served **none of the 272 char/ghost spans carries `aria-hidden` or a `role`** — the document
  uses `aria-hidden` 18 times and `role=` 0 times, and the site *does* hide its decorative copies
  explicitly elsewhere (the two gradient spans, the six wordmark spans). So duplication is
  confirmed while its accessibility-tree treatment is not. Whether the copies are announced once,
  twice, or as interleaved single characters needs an accessibility-tree inspection (`E7`, `U9`).
  This is a narrower and more concrete question than v0.1 posed, and it is a genuine open
  accessibility item.

## 5. Typography research

### 5.1 Font provenance
- **Reported At Aero:** Foundry specimen https://arillatype.studio/font/at-aero describes 20 styles and a variable option. This is a commercial font family: verify current licensing directly with the foundry before any Echo11 use. **A2 adds** the loaded file names and delivery format: 4 faces (Retina, Regular, Medium, Light) as static `.otf`, all `font-display:swap` (`E12`). Licensing remains **U** — a shipped font file is not a license grant.
- **Reported DM Mono:** https://fonts.google.com/specimen/DM+Mono and https://github.com/googlefonts/dm-mono describe a three-weight monospace family. Inspect the actual distributed license before embedding or bundling. **A2 adds** 3 loaded faces as `.ttf` with `format("truetype-variations")` at weights 300/400/500, all `font-display:swap` — which matches the reported three-weight family (`E12`).
- **Unknown (unchanged in v0.2):** PRODUX's rendered selectors, which face binds to which element at which viewport, rendered weights, optical axes, variable settings, fallback stack, language coverage, and measured size scale. The declared type-scale steps are in §5.2.

### 5.2 Visual hierarchy — the open question is now partly answered
**Closed in v0.2 for `/`, as a declared mapping.** The question v0.1 posed — establish whether
headings are set in display font while mono is reserved for labels, by checking actual computed
styles rather than inferring from the font list — is now answered one level down. The declared
mapping is in §3: `font-AtAero` on `h1`/`h2`/`h3`, `font-AtAero-Medium` and
`font-AtAero-Regular` on two kinds of `h4`, and `font-DM-mono` on the footer, labels, cursors,
and the newsletter input, 126 occurrences against 38 for the At Aero family. One `h4` role flips
to mono at `max-lg`. This came from class names and the stylesheet's own `font-family` literals,
**not** from computed styles, so the cascade outcome and the per-viewport result remain **U**.

Declared type-scale steps, in `vw`, read from the stylesheet (`E3`): `text-h2` **4.44vw**
(line-height 1.1 or 1.2, and the `h1` itself carries `text-h2/[1.1]`, so the hero headline sits
at the `text-h2` step rather than a separate display step); `text-subtitle-2` and
`text-body-text-1` **1.67vw**; `text-button` **1.38vw**; `text-body-text-2` **1.11vw**;
`text-body-text-3` **0.97vw**; `text-subtitle-4` **0.84vw**; `text-label` **0.69vw**. The base
rule is `h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}`, so size and weight come
entirely from utility classes.

Still unmeasured, and the substance of this section: dominance of display text against small
navigation/metadata, contrast between large statements and narrow explanation blocks, and
recurring title alignment in work and case studies.

**Audit fields per element:** route, viewport, element/role, font family/file, size, weight, line-height, letter spacing, text transform, color, max width, line breaks, alignment, and actual bounds. Capture 320px phone, intermediate tablet, desktop, 200% zoom, and reduced-motion states.

### 5.3 Typographic motion questions
**Answered by A2 for `/`, within the declared-value limit.** Masking is done with `overflow-hidden`
wrappers: 327 `overflow-hidden` occurrences, including per-word wrappers inside the hero `h1` and
per-word wrappers inside the Journal manifesto. Pre-states on the animated spans are
`translate-y-full` (169 occurrences) with `opacity-0` (398) and, on some elements, `blur-sm`
(33) and `rotate-6`. The gradient-filled headline uses `text-transparent` plus a
`background-clip:text` linear gradient declared at four background positions — `0% 0%`, `0% 33%`,
`0% 66%`, `0% 100%` — over `#FFF`, i.e. a multi-line fill mask rather than a clip-path
(`E4`, `E7`). A second pre-state idiom is `clip-path:circle(0% at 100% 100%)` (8 occurrences), and
dividers start at `transform:scaleX(0)`.

Is the text split into accessible duplicates? **The duplication is confirmed; the accessibility
answer is not.** 136 ghost spans and 136 `.char` spans carry no `aria-hidden` and no `role` as
served (`E7`, `U9`).

Is the animation tied to scroll or one-time entry? **Tied to long scroll pins, as a structural
fact:** the reveal hooks sit inside wrappers declared at `650vh`, `600vh`, and `320vh` with
`sticky` children (`E6`). Whether an individual reveal is scroll-scrubbed or plays once on entry
is **U** — no trigger, easing, or duration for any hook appears in the capture.

**Still OPEN, unchanged:** what happens when fonts load late (all faces are `font-display:swap`,
which makes a swap likely but does not establish a fallback treatment), when lines rewrap, on
browser zoom, or on language expansion; and what state shows for reduced motion. The one
reduced-motion-adjacent fact observed is an inline `@media (max-width: 640px)` block that drops
the services gradient to solid white — a **width** fallback, not a motion-preference one.
`prefers-reduced-motion` occurs 0 times in the markup and 0 times in the readable stylesheet
(`E7`, `E12`, `U8`).

These are audit questions, **not assertions** about PRODUX implementation.

**Learning sources:** https://practicaltypography.com/summary-of-key-rules.html on line length/leading; https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html on user-adjusted text spacing; https://www.w3.org/WAI/WCAG21/Techniques/css/C39 on reduced-motion accommodation.

## 6. Spatial and layout research

### 6.1 Relationships to measure
- Outer page gutters versus content maximum width.
- Hero top/bottom breathing room versus next-section entry.
- Dominant media width versus attached text width.
- Project-to-project spacing versus caption-to-media spacing.
- Reading measure in Studio, services, case studies, and Contact.
- Shared alignment lines across section boundaries.
- Fixed, sticky, or pinned elements and their scroll release points.
- Text and media order at narrow viewports.
- Footer boundary and navigation density.

**Split claim, corrected 2026-10-02.** Version 0.1 grouped two things together and dismissed both
as unsupported. They separate:

- **The 12-column grid is now Observed (declared)** (`E5`). Four grid containers are declared:
  `grid grid-cols-12 gap-[1.39vw] max-lg:grid-cols-8 max-lg:gap-[4.7vh]` (×2), `grid grid-cols-12`,
  and `grid grid-cols-12 max-lg:grid-cols-8`. The project cards use an irregular span
  distribution — `col-span-7`, `col-span-7 col-end-13`, `col-span-4 col-end-13`, `col-span-10
  col-start-2`, `col-span-4` — which is the editorial asymmetry the paragraph below warns
  against flattening into a universal grid story. A `max-lg:grid-cols-8` fallback is declared,
  and the column gap changes unit with breakpoint, `1.39vw` to `4.7vh`.
- **The 8px spacing base remains unsupported.** `/` contains **0** occurrences of `clamp()` and no
  measure or container primitive in the markup. Sizing runs on raw viewport units: 193 distinct
  `vw`/`vh` arbitrary values across 962 occurrences (`E2`). Three horizontal padding values recur
  across breakpoints — `5.5vw`/`5.55vw` desktop, `4.10vw` at `max-lg`, `5.97vw` at `max-sm` — and
  note that `5.55vw` and `5.5vw` are not the same value. Reading measures are expressed as
  breakpoint-swapped `vw` maxima such as `max-w-[47.3vw]` and `max-w-[40vw]`, not as a scale.
  Nothing here supports "a precise 8px spacing base," and the token names in `E4` are color
  tokens, not a spacing scale.

Even with declared values in hand, no computed geometry or screenshots exist. The measurements
above still have to be taken. Editorial sites often use shared tracks with deliberate exceptions;
the audit must measure both, not force each screenshot into a universal grid story.

### 6.2 Spatial skill resources
- https://every-layout.dev/layouts/ : intrinsic Stack, Cluster, Sidebar, Switcher, Cover, Grid, Frame, and related layout primitives; useful for identifying relationship-driven rather than device-named layout.
- https://utopia.fyi/ and https://www.smashingmagazine.com/2021/04/designing-developing-fluid-type-space-scales/ : linked fluid typography and spacing, using bounded interpolation rather than breakpoint-only guesses.
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout : grid placement and overlapping regions.
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid : alignment of nested content to parent tracks.

**What PRODUX actually does, for contrast (`E2`).** The observed approach is **raw `vw`/`vh`
utilities with breakpoint-swapped values**, not `clamp()` interpolation, not a spacing scale, and
not a container or measure primitive. That is the opposite of what the two fluid-typography
resources above recommend, and it is a legitimate editorial technique rather than an error — but
it is not the pattern these links teach.

These remain alternatives to hardcoded one-off CSS, and **are not evidence that PRODUX uses these
particular techniques.** The gap between the linked resources and the observed implementation is
a difference to note, not a recommendation to copy either side.

## 7. Interaction and engineering skill map

### 7.1 Entry/showreel and carousel
**Evidence:** Creator statement about WebGL carousel entry and easing study.  
**Skills:** Animation direction, easing translation from an AE prototype, timeline coordination, image sequencing, texture management, interaction state, render-loop lifecycle.  
**Related tutorial:** https://tympanus.net/codrops/2023/04/27/building-a-webgl-carousel-with-react-three-fiber-and-gsap/ demonstrates textured image planes and GSAP-controlled interaction.  
**Library detail:** https://threejs.org/docs/pages/ShaderMaterial.html explains shader uniforms and GPU materials.  
**Unknown:** Whether the production effect uses this tutorial's architecture, React Three Fiber, or custom GLSL. **Added 2026-10-02:** `/` declares **4** `<canvas>` elements, all empty in SSR, three at `pointer-events:none`, one carrying a `mask-image:linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)`; and **7** `<video>` elements, one with `id="hero-showreel"` and five sharing the pre-state `opacity:0;transform:translateY(-10%) scale(1.25)`, none with a `src` attribute. **No GSAP, Three.js, or Lenis markers appear in the markup** (0 occurrences each) — the libraries live in the 19 referenced script chunks, of which one was sampled and 18 were not read, so this neither confirms nor denies the detector report. Which canvas is WebGL, and what any of it renders, remains **U** (`E10`, `U5`, `U6`).

### 7.2 Narrative reveals and responsive scroll
**Skills:** Section trigger design, one-time versus continuous progress, establishing a static reading order, timeline cleanup, breakpoint-specific choreography.  
**Resources:** https://gsap.com/docs/v3/Plugins/ScrollTrigger/ ; https://gsap.com/resources/React/ ; https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API .  
**Unknown:** Which PRODUX section uses which tool, if any. **Partly narrowed 2026-10-02:** the reveal hooks are structurally attached to three declared scroll pins — `650vh`, `600vh`, and `320vh` wrappers with `sticky` children (`E6`) — so scroll linkage is established as a structure even though the tool is not. The tools themselves remain **U**: 0 occurrences of `gsap`, `ScrollTrigger`, or `requestAnimationFrame` in the markup, the readable stylesheet contains only two view-transition `@keyframes`, and the markup's 10 `requestAnimationFrame` calls belong to an inline scroll-restoration script, not an animation loop (`E7`, `E10`, `E12`). A text extractor could not resolve this; a markup read can narrow it but cannot name the library.

### 7.3 Motion performance
**Skills:** Separating transform/opacity effects from layout/repaint-heavy properties; measuring dropped frames, loaded fonts, asset decode and GPU texture memory; pausing inactive scenes.  
**Resource:** https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance .  
**Unknown:** PRODUX's actual Core Web Vitals and frame timings across devices. **Added 2026-10-02:** declared hints only, no measurement — 55 `will-change-transform` occurrences, 33 `blur-sm`, 398 `opacity-0`, and a `backdrop-blur-2xl` cursor layer; 4 canvases and 7 videos all declared but unloaded in SSR (`E7`, `E10`). Whether the declared promotion hints are actually held in memory at runtime is **U**.

### 7.4 Smooth scrolling
**Evidence:** Lenis reported by site analysis.  
**Resource:** https://lenis.darkroom.engineering/ .  
**Skills:** Scroll synchronization with visual timelines; maintaining anchor/focus behavior, touch parity, browser history restoration, and reduced-motion policy.  
**Unknown:** Where, how, and whether Lenis is active on each route. **Unchanged 2026-10-02:** the markup contains 0 occurrences of `lenis`, `Lenis`, or `smoothscroll`, and no scroll-behavior or overscroll declaration was observed. A negative result in a file that was not read — 18 of 19 script chunks were not read — is not evidence of absence (`E10`, `U5`).

### 7.5 Contact and navigation
**Evidence:** Menu/close labels and contact thank-you copy exist in published text.  
**Skills:** State-machine design, accessibility tree/focus management, route-state reconciliation, validation and submission feedback.  
**Unknown:** Actual form fields, backend, menu trapping behavior, and animation technique. **Added 2026-10-02, for `/`:** the document contains **0** `<nav>`, **0** `<form>`, and **0** `<button>` elements. Navigation is anchors only — four in a bracket pattern and five in a `sm:hidden` mobile stack (`E8`). The only `<input>` is a newsletter field, `type="email" placeholder="EMAIL"`, with **no enclosing form element**, so no submission or validation behavior can be read from the markup. The header is a `mix-blend-difference` bar holding a 6-SVG morphing wordmark, not a menu button. Focus behavior, Escape handling, and scroll locking therefore have no representation in the served markup at all and remain **U**.

## 8. Related repository and discussion caution

A GitHub result for `Yousuf-developer/liquid-glass-carousel` describes an infinite, scroll-driven Three.js/GSAP carousel with liquid-glass lens shader: https://github.com/Yousuf-developer/liquid-glass-carousel . This is a potentially relevant educational example, **not an established source file or production component for PRODUX**. A separate repository using the name ProduX is unrelated to this design-studio website. Do not cite a similarly named project as proof of implementation.

Search findings for awards, listings, interviews, and social posts can provide context. They should always be checked for domain identity, author attribution, and whether the date predates the live version being studied.

## 9. Browser audit protocol for exact values

A proper reverse-engineering pass needs browser access and permission to inspect the public frontend. No privileged source-code access is implied.

**Progress against this protocol, as of 2026-10-02.** The A2 capture satisfies part of Pass A
and the declared-value half of Pass B. It satisfies **nothing** that requires execution. Nothing
in this dossier may be called "measured" on the strength of it.

| Pass | Status after the A2 pass |
|---|---|
| **A — Static page map** | **Partially satisfied, for `/` only.** Section order and wrappers, heading inventory, asset paths, and 18 preload hints are recorded (`E1`, `E11`). Not done: the 375/768/1280/1600 viewports, section bounding boxes, content widths, media dimensions, sticky/fixed behavior, or screenshots. No route other than `/` was fetched. |
| **B — Computed typography and grid** | **Satisfied for declared values only.** The shipped stylesheet was readable, so `@font-face` declarations, the `vw`-based type-scale steps, resolved palette token values, and the grid/span declarations are recorded (`E3`, `E4`, `E5`, `E12`). This is **not** the pass the protocol asks for: no computed font, size, weight, leading, tracking, color, dimension, `display`, `grid-template`, column gap, padding, margin, `position`, `overflow`, or `z-index` was read from a browser, and no cascade outcome or breakpoint condition was observed at any width. |
| **C — Interaction recording** | **Untouched.** No interaction of any kind was performed. |
| **D — Animation ownership** | **Untouched.** 18 of 19 referenced script chunks were not read; no chunk was analyzed for ownership. |
| **E — Resilience and accessibility** | **Untouched.** No reduced-motion, keyboard, zoom, network, WebGL, or focus testing. The A2 pass did surface one Pass E question as an open item: the accessibility-tree treatment of 272 ghost/character spans (`E7`, `U9`). |

### Pass A: Static page map
At 375, 768, 1280, and 1600 CSS px (adjust to real device sizes): record each route, section order, H1/H2 structure, DOM reading order, assets, media dimensions, section bounding boxes, content widths, and sticky/fixed elements. Capture screenshots with animation settled; identify repeatable versus exceptional compositions.

### Pass B: Computed typography and grid
At representative elements collect computed font, size/weight/leading/tracking, colors, dimensions, `display`, grid-template, column gap, padding, margin, position, `overflow`, `z-index`, and background layers. Note stylesheet source and breakpoint conditions. Build a measured table; separate declared styles from computed outputs.

### Pass C: Interaction recording
Record short desktop/mobile interactions: first load; menu open/close; mouse/keyboard/touch Work browsing; project navigation and back; scroll through Studio, service, Lab; form validation and successful submission only with non-sensitive test data and appropriate authorization. Time with performance markers; do not infer timing from video alone when source values can be measured.

### Pass D: Animation ownership
Inspect whether effects are CSS, GSAP timelines, canvas render loop, videos, or combinations. Observe DOM mutations, canvases, loaded chunks, texture/video requests, and transition cleanup on route change. Do not assume library inclusion proves its use in a given section.

### Pass E: Resilience and accessibility
Test reduced-motion, keyboard focus, 200% zoom, no/slow network, WebGL disabled, responsive wrapping, touch interactions, form errors, and focus after navigation. Record both visual change and information parity.

**Measurement log template:**

```text
route | section | viewport | device/input | observed state | measured property |
value | CSS/file origin if available | screenshot/recording evidence |
confidence | open question | date
```

**Exit criteria:** A section may be called “measured” only when its values are captured from computed/runtime evidence. Otherwise label as reported, observed content, or hypothesis.

## 10. Translation into Echo11 decisions

The reference should generate **questions**, not mandates:
1. What does the effect communicate to a visitor?
2. Does Echo11 have equally strong content or media to justify it?
3. Can semantic content remain usable without it?
4. Is the visual relationship consistent with Echo11's current, well-liked UI?
5. Can the technique be maintained by the actual project team?
6. Is there a simpler technique with equivalent communication value?
7. Has it been tested at the needed widths, inputs, motion preferences, and performance tier?

An approved Echo11 effect belongs in `echo11-motion-and-interactions.md`; an approved layout belongs in `echo11-frontend-foundation.md` or `echo11-page-anatomy.md`. Research links and unanswered questions remain in this dossier. This separation prevents a third-party font detector, award tag, or attractive tutorial from silently becoming a product requirement.

## 11. Source index

**Evidence files in this repository:** `evidence/produx-home-ssr-2026-10-02.md` — verbatim SSR markup and shipped-stylesheet quotes for route `/`, anchors `E1`–`E12`, with its own provenance, method limits, and unresolved list. **Added in v0.2.** Every A2 claim in this dossier resolves to an anchor there.

**Primary pages:** https://www.produx.design/ · https://www.produx.design/work · https://www.produx.design/studio · https://www.produx.design/lab · https://www.produx.design/contact · https://www.produx.design/service/branding · https://www.produx.design/journal (route confirmed live in `/`'s markup, 2026-10-02; page not fetched)  
**Third-party/creator:** https://save.design/analyze/produx-design · https://www.cssdesignawards.com/sites/produx/49444/ · https://x.com/YousufSoomroDev/status/2056355003565224437 · https://www.awwwards.com/sites/produx-design  
**Type:** https://arillatype.studio/font/at-aero · https://fonts.google.com/specimen/DM+Mono · https://practicaltypography.com/summary-of-key-rules.html  
**Layout:** https://every-layout.dev/layouts/ · https://utopia.fyi/ · https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid  
**Motion/graphics:** https://gsap.com/resources/React/ · https://gsap.com/docs/v3/Plugins/ScrollTrigger/ · https://threejs.org/docs/pages/ShaderMaterial.html · https://tympanus.net/codrops/2023/04/27/building-a-webgl-carousel-with-react-three-fiber-and-gsap/ · https://lenis.darkroom.engineering/  
**Accessibility:** https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html · https://www.w3.org/WAI/WCAG21/Techniques/css/C39

## 12. Site change since v0.1

**Observation window: 2026-10-01 (dossier v0.1) to 2026-10-02 (A2 capture).** This is a
record of what differed between two observations of route `/`. It is **not a trend, a rate of
change, or a claim about intent.** One day is not a direction, and no motive is attributed to
anything below. The v0.1 baseline for most of these rows was page-text extraction, so some of
the difference may be a difference in instrument rather than a change on the site — the two
observation methods were not equivalent, and that limitation is not resolvable from here.

| Item | v0.1 belief | Observed 2026-10-02 |
|---|---|---|
| Top navigation | Menu/close labels implied an interactive overlay menu (v0.1 §4 "Navigation" row) | **No top nav, and no `<nav>`, `<form>`, or `<button>` element anywhere in the document.** The header is a `mix-blend-difference` fixed bar containing a morphing wordmark built from **6** per-letter SVGs (`NavbarSVGMorphCharacter`), each with a `translate-y-full opacity-0` pre-state. Navigation is anchors only. |
| Nav items | Work and Lab extracted from menu labels | **`[Work] [Studio] [Journal] [Contact]`** — four bracket items, no Lab. Each label is doubled in markup by an `absolute left-0 block translate-y-[120%]` hover twin. |
| `/lab` | Reachable, presented in the ledger as an active surface | Linked **only** from the `sm:hidden` mobile footer stack, in no desktop navigation. Whether it is being deprecated upstream is **not established** and is left open. |
| Journal | Absent | **New section** with an `h2` manifesto and five `h4` cards, `/journal` in both nav sets, five `JournalImages` preloads. |
| Services palette | Near-black throughout | A **`#303930`** green segment — `.green-segment` inside `.uniform-bg-wrapper`, declared `aria-hidden="true" style="background-color:#303930"`. That value equals the `apple-green` token (`E4`). It hosts the `600vh` pinned `h2`. |
| Footer entity | Not recorded | **`© 2026 PRODUX STUDIOS LLC. All rights reserved.`** plus a Headquarters block listing `Barcelona, Spain` and `Wyoming USA.` |
| Contact route | `/contact` in the ledger | `/contact` confirmed in the markup, 3 occurrences. The older **`/letswork`** path appears in search results and is a **redirect candidate to confirm, not asserted** — it does not occur in the homepage markup, and this pass fetched no route other than `/`, so its status is **U** (`U15`). |

**What this does and does not change.** It partly supersedes the v0.1 "Navigation" row and the
Lab-related inference in §2, and both are corrected in place above. It also means §4's matrix and
§2's ledger describe a site that is not identical to the one v0.1 described, so any re-use of a
v0.1 statement about PRODUX's information architecture should be re-checked against a fresh
capture. The deployment identifier observed on 2026-10-02 was
`dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc`; a different value means a different build and invalidates
the comparison.

**This is drift, not a signal.** A changed homepage says nothing about whether PRODUX's approach
is one Echo11 should follow, and `docs/echo11-art-direction-audit.md` — which holds the position
that Echo11 should not reproduce PRODUX — is unaffected by anything recorded here.

---
**Research rule:** Cite the source, specify what it demonstrates, and mark all unobserved runtime or CSS details as unknown until measured.
