# Evidence: PRODUX homepage live SSR markup and shipped stylesheet

**Status:** REFERENCE evidence · **Date:** 2026-10-02
**Cited by:** `../echo11-reference-research.md` §1 (tier A2) and throughout, as `E1`–`E12`
**Subject:** https://www.produx.design/ (route `/` only)

> Every claim below is a **declared** value read from a served response. Nothing here is a
> computed style, a runtime trace, or a screenshot. A class name is a class name, not a
> behavior. This file exists so a reader can check the dossier instead of trusting it.

## Provenance

| Field | Value |
|---|---|
| Fetch date | 2026-10-02 |
| URL | `https://www.produx.design/` |
| Method | `curl`, following redirects, `--compressed` |
| User agent | Chrome 140 on macOS, desktop string, sent as a `User-Agent` header |
| Referer sent with asset fetches | `https://www.produx.design/` |
| HTML response | HTTP 200, **233,449 bytes** across **54 lines** (minified) |
| HTML style | one `<style>`-free document; all styling is Tailwind utility classes plus inline `style` attributes |

### Re-serialization and fidelity trail

The raw response is 233KB spread over 54 lines with a single ~200KB line, which defeats
line-oriented search and truncating readers. It was therefore re-serialized for reading by
inserting a newline between every adjacent `><` pair (233,329 → 236,299 characters, 3,025
lines). The raw HTML is **not** archived in this repository: at that size and line shape it is
unreviewable in most editors and breaks repository-wide search.

Before any proxied copy was trusted, four markers were counted in the **original unproxied
bytes** and re-counted in the re-serialized copy:

| Marker | Raw bytes | Re-serialized | Match |
|---|---|---|---|
| `bg-outer-space` | 4 | 4 | yes |
| `font-AtAero` | 38 | 38 | yes |
| `service-word` | 14 | 14 | yes |
| `page-transition-overlay` | 1 | 1 | yes |

Counts are identical before and after, so the re-serialization is lossless for these markers.

### Asset fetches

| Asset | Result |
|---|---|
| `/_next/static/chunks/0hcp-p.-qpzyg.css?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc` | **HTTP 200 — readable.** 67,892 bytes, 13,209 compressed, a single 67,891-character line. Read successfully. See `E12`. |
| `/_next/static/chunks/10yl.ldr8v2a8.js?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc` | HTTP 200 — readable. 7,481 bytes, 30 lines. **Sampled only.** Contains zero occurrences of `gsap`, `ScrollTrigger`, `three`, `THREE`, `lenis`, `Lenis`, `requestAnimationFrame`, `getContext`. |
| The other 18 `<script src>` chunks | **Not fetched.** Out of scope for this pass. |

The HTML references **19** `<script src>` chunks. Only the one named by
`<link rel="preload" as="script">` was sampled. This is why the dossier's detected-stack row
does not move: a chunk that was not read cannot confirm or deny a library, and one chunk that
was read and did not contain a library does not disprove the others.

## Method limits

- No DevTools, no browser, no JavaScript execution.
- **No computed styles.** Every style below is either an authored class name or a literal in an
  inline `style` attribute or stylesheet.
- No screenshots at any viewport.
- No pointer, hover, focus, keyboard, touch, or scroll testing.
- No runtime performance, frame timing, or Core Web Vitals.
- No network waterfall; the 19 chunk requests were not individually observed firing.
- Route `/` only. No other PRODUX route was fetched.

## Reading rules

- **Observed (declared)** — present in the served HTML or the shipped stylesheet.
- **Observed (computed)** — read from a browser's computed style. **Nothing in this file is.**
- A declared class does not establish that a rule matching it exists, that the rule wins the
  cascade, or that it ever takes effect.
- Per-word, per-line, and per-glyph hooks are named in the markup. Their easing, duration,
  trigger, and scrub range are not.

---

## E1 — Section order

One `<header>`, one `<main>`, one `<footer>`, and **7** `<section>` elements, in document order.
Byte offsets are from the start of the re-serialized document.

```
<header>
<main>
<section class="hero-section sticky top-0 left-0 z-100 -mb-[17.5vh] h-fit w-full max-lg:mb-0">
<section class="project-section text-white-smoke px-[5.55vw] pb-[11.67vh] max-lg:px-[4.10vw] max-lg:pb-0 max-sm:px-[5.97vw]">
<section class="about-section relative overflow-hidden pt-[15.625vh] pb-[8vh] max-lg:pt-[8.85vh] max-lg:pb-0 max-sm:pt-[10.5vh]">
<section class="contribution-section text-white-smoke font-AtAero relative mt-[10vh] px-[5.5vw] pb-[8vh] max-lg:px-[4.10vw] max-lg:pb-0 max-sm:mt-[11.2vh] max-sm:px-[5.97vw]">
<section class="services-section" style="height:600vh;position:relative;width:100%;background-color:transparent">
<section class="testimonials-section relative w-full pt-[16.6vh] pb-[14.35vh] max-lg:pt-[6vh] max-lg:pb-[10vh] max-sm:pt-[4vh]">
<section class="journal-section relative z-10 px-[5.5vw] pt-[15.625vh] pb-[15.625vh] transition-colors duration-500 max-lg:px-[4.10vw] max-lg:pt-0 max-lg:pb-[9vh] max-sm:pb-[6.97vh]">
<footer style="background-color:#0e0e0e" class="footer text-white-smoke font-DM-mono w-screen overflow-hidden px-[5.5vw] pt-[11.7vh] pb-[3.9vh] max-lg:px-[4.10vw] max-lg:pt-[9vh] max-sm:px-[5.97vw]">
```

Heading inventory: **1** `h1`, **2** `h2`, **5** `h3`, **15** `h4`. Heading text, in order:

| Tag | Text (tags stripped) | Note |
|---|---|---|
| `h1` | `You feel the brand before it speaks®` | hero |
| `h3` ×5 | `Edgerun Industries` · `Gather AI` · `Jurni AI` · `Parker AI` · `Payy Network` | project names |
| `h4` ×4 | `Brand Strategy and Identity` · `Web Design and Development` · `Product UX/UI Design` · `Motion Design and Content` | contribution list |
| `h2` | `In 14 days, we shape a complete brand identity that moves with confidence.` | services pin |
| `h4` ×6 | `Jimmy Slage` · `Ty Zamkow` · `Nathan Graville` · `Delbert Ty` · `Arianna Armelli` · `Fawaz Buqammaz` | testimonials |
| `h2` | `A A b b r r a a n n d d …` | journal manifesto; doubling is `E7`, not a text-extraction artifact |
| `h4` ×5 | `Strategy matters` · `Alex Socoloff` · `Creative Development` · `Digital Flow` · `Future Proof` | journal cards |

Element counts across the whole document: `<canvas>` **4**, `<video>` **7**, `<img>` **40**,
`<svg>` **24**, `<section>` **7**, `<main>` **1**, `<header>` **1**, `<footer>` **1**,
`<nav>` **0**, `<form>` **0**, `<button>` **0**, `<input>` **1**.

---

## E2 — Gutters and vertical rhythm

Declared padding utilities, by frequency:

| Utility | Count |
|---|---|
| `px-[5.97vw]` | 12 |
| `px-[5.5vw]` | 10 |
| `px-[4.10vw]` | 9 |
| `px-[4.1vw]` | 3 |
| `px-[5.55vw]` | 1 |
| `px-[1.94vw]` | 6 |
| `px-[2.9vw]` | 6 |
| `px-[1.11vw]` | 5 |
| `px-[0.83vw]` | 3 |
| `px-[0.55vw]` | 1 |

Three distinct horizontal padding values are paired across breakpoints in a consistent way:
`5.5vw` / `5.55vw` on desktop, `4.10vw` at `max-lg`, `5.97vw` at `max-sm`. `5.55vw` and
`5.5vw` are not the same value; both appear.

Vertical rhythm is declared in `vh`, e.g. `pt-[16.6vh] pb-[14.35vh]`, `pt-[15.625vh]
pb-[15.625vh]`, `mt-[8.4vh]`, `-mb-[17.5vh]`.

Sizing is driven by raw viewport units. Across the document there are **193 distinct** `vw`/`vh`
arbitrary values across **962 occurrences**, e.g. `[1.56vw]` ×68, `[0.97vw]` ×55, `[1vw]` ×28,
`[2.4vw]` ×26, `[5.97vw]` ×24, `[14.3vw]` ×24, `[4.88vh]` ×24, `[20.1vw]` ×24, `[32.3vw]` ×24.

**`clamp()` appears 0 times in the markup.** There is no `clamp()`-based fluid interpolation and
no container/measure primitive in the served HTML. Sizing intent is carried by Tailwind
`max-lg:` / `max-sm:` variants over `vw`/`vh` values.

Aspect ratios declared: `aspect-[1.784/1]`, `aspect-[0.97/1]`, `aspect-[0.95/1]`,
`aspect-[0.93/1]`, `aspect-[0.8/1]`.

---

## E3 — Type scale steps and font roles

### Font utility declarations (Observed (declared))

Utility → stylesheet mapping, quoted from `E12`:

```css
.font-AtAero{font-family:At Aero}
.font-AtAero-Medium{font-family:At Aero Medium}
.font-AtAero-Regular{font-family:At Aero Regular}
.font-DM-mono{font-family:DM Mono}
```

Frequency in the markup: `font-DM-mono` ×126; `font-AtAero` ×16; `font-AtAero-Regular` ×16;
`font-AtAero-Medium` ×6. Weight utilities present: `font-normal` ×11, `font-light` ×11,
`font-extralight` ×8, `font-medium` ×1.

### Role mapping (Observed (declared) — from class names on the elements)

| Element | Declared class | Quoted |
|---|---|---|
| `h1` | `font-AtAero` | `class="font-AtAero hero-main-heading text-h2/[1.1] flex max-w-[40vw] flex-wrap …"` |
| `h2` (services) | `font-AtAero` | `class="font-AtAero flex flex-col gap-0 text-[2.9vw]/[1.15] …"` |
| `h2` (journal) | `font-AtAero` | `class="font-AtAero text-white-smoke text-[3.18vw]/[1.25] …"` |
| `h3` (project names) | `font-AtAero` | `class="font-AtAero text-body-text-1 leading-tight max-lg:text-[2.34vw] …"` |
| `h4` (testimonials) | `font-AtAero-Medium` | `class="font-AtAero-Medium text-Darkslate-grey text-[1.1vw] …"` |
| `h4` (journal cards) | `font-AtAero-Regular` | `class="font-AtAero-Regular text-white-smoke max-lg:font-DM-mono flex gap-[.4vw] text-[1.67vw] whitespace-nowrap …"` |
| `<footer>` | `font-DM-mono` | `class="footer text-white-smoke font-DM-mono w-screen overflow-hidden …"` |
| Project meta labels | `font-DM-mono` | `class="text-slate font-DM-mono text-body-text-3 leading-[1.3] uppercase …"` |
| Scroll-down indicator | `font-DM-mono` | `class="scroll-down-indicator font-DM-mono text-white-smoke … uppercase mix-blend-difference …"` |
| Cursor labels | `font-DM-mono` | `class="font-DM-mono text-outer-space text-body-text-3 … uppercase"` and `class="font-DM-mono text-slate about-section-paragraph text-body-text-2/[1.4] …"` |
| Newsletter input | `font-DM-mono` | `class="bg-white-smoke/5 border-white-smoke/15 font-DM-mono text-body-text-3/[1] w-full border p-[0.83vw] outline-none …"` |

The journal `h4` cards switch to mono at `max-lg` inside the same class list
(`font-AtAero-Regular … max-lg:font-DM-mono`), so the role mapping is breakpoint-conditional
for that element and must not be stated as a universal rule.

### Semantic type-scale utilities (Observed (declared) — stylesheet literals)

```css
.text-h2\/\[1\.1\]{font-size:4.44vw;line-height:1.1}
.text-h2\/\[1\.2\]{font-size:4.44vw;line-height:1.2}
.text-subtitle-2{font-size:1.67vw}
.text-body-text-1{font-size:1.67vw}
.text-button{font-size:1.38vw}
.text-body-text-2{font-size:1.11vw}
.text-subtitle-4{font-size:.84vw}
.text-body-text-3{font-size:.97vw}
.text-label{font-size:.69vw}
```

The `h1` carries `text-h2/[1.1]`, so the hero headline is declared at the `text-h2` step, not a
separate display step. Base heading rule from the same stylesheet:

```css
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}
```

so heading size and weight come entirely from utility classes.

Which face actually renders for a given element, at a given viewport, is not established by any
of the above. At Aero licensing is not established by anything in the markup or stylesheet.

---

## E4 — Color literals and token names

### Token names → resolved utility values (Observed (declared) — stylesheet literals)

The compiled stylesheet resolves the palette names. These are utility definitions, i.e.
*declared* values, not computed output:

| Token name | Utility | Declared value |
|---|---|---|
| `outer-space` | `bg-`/`text-`/`border-` | `#0e0e0e` |
| `Hoki` | `bg-`/`text-` | `#545e54` |
| `apple-green` | `bg-`/`text-` | `#303930` |
| `valhalla` | `bg-` | `#6e6554` |
| `periwinkle` | `bg-`/`text-` | `#d4cccc` |
| `white-smoke` | `bg-`/`text-`/`border-` | `#f2f2f2` (with `/5`, `/15`, `/30` alpha variants) |
| `Darkslate-grey` | `text-`/`border-` | `#303539` |
| `red-wood` | `text-` | `#cddbc0` |
| `silver` | `text-` | `#c7cec4` |
| `grey` | `text-` | `#a9a9a9` |
| `olive-green` | `text-` | `#cfff6a` |

`#0e0e0e` is the body surface: `<body class="bg-outer-space overflow-x-hidden" …>`.

### Hex literals occurring in the markup

| Literal | Count | Where it appears |
|---|---|---|
| `#C6C6C6` | 46 | text utilities |
| `#2F2F2F` | 24 | border utilities |
| `#141414` | 24 | — |
| `#F2F2F2` | 21 | equals `white-smoke` |
| `#FFF` | 13 | gradient text fill |
| `#f2f2f2` | 6 | SVG `fill` on the morphing wordmark |
| `#303030` | 5 | — |
| `#111111` | 5 | — |
| `#5F5136` | 5 | — |
| `#191919` | 5 | footer link underline `border-color` |
| `#505050` | 4 | contribution `h4` text |
| `#3B3B3B` | 4 | contribution divider |
| `#0e0e0e` | 2 | footer background; radial gradient stop — equals `outer-space` |
| `#303930` | 1 | `.green-segment` — equals `apple-green` |
| `#cddbc0` | 1 | equals `red-wood` |

### Inline styles carrying color

```html
style="background-color:#0e0e0e"                                  <!-- <footer> -->
style="background-color:#303930"                                  <!-- .green-segment -->
style="border-color:#191919"                                      <!-- footer links -->
style="color:transparent"                                         <!-- ghost copies -->
```

The Journal manifesto uses a gradient clipped to the text, declared four times at different
background positions, on a transparent fill:

```html
style="background-image:linear-gradient(180deg, #FFF -28.18%, rgba(255, 255, 255, 0.00) 113.64%);background-position:0% 0%;background-size:100% 400%;background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent"
```

with sibling copies at `background-position:0% 100%`, `0% 33%`, and `0% 66%`.

---

## E5 — Grid spans

Four grid containers are declared on `/`:

```html
<div class="grid grid-cols-12 gap-[1.39vw] max-lg:grid-cols-8 max-lg:gap-[4.7vh]">
<div class="grid grid-cols-12">
<div class="grid grid-cols-12 gap-[1.39vw] max-lg:grid-cols-8 max-lg:gap-[4.7vh]">
<div class="grid grid-cols-12 max-lg:grid-cols-8">
```

Project cards, quoted (all five share the `single-project-card` base):

```html
class="group/main single-project-card flex cursor-pointer flex-col gap-[1.67vw] max-lg:gap-[3.074vw] max-sm:gap-[3.48vh] col-span-7 max-lg:col-span-6 max-sm:col-span-8"
class="group/main single-project-card flex cursor-pointer flex-col gap-[1.67vw] max-lg:gap-[3.074vw] max-sm:gap-[3.48vh] col-span-7 col-end-13 max-lg:col-span-6 max-lg:col-end-9 max-sm:col-span-8"
class="group/main single-project-card flex cursor-pointer flex-col gap-[1.67vw] max-lg:gap-[3.074vw] max-sm:gap-[3.48vh] col-span-4 col-end-13 mt-auto h-fit max-lg:col-span-6 max-lg:col-end-9 max-sm:col-span-8"
class="group/main single-project-card flex cursor-pointer flex-col gap-[1.67vw] max-lg:gap-[3.074vw] max-sm:gap-[3.48vh] col-span-10 col-start-2 max-lg:col-span-12 max-sm:col-span-12"
class="group/main single-project-card flex cursor-pointer flex-col gap-[1.67vw] max-lg:gap-[3.074vw] max-sm:gap-[3.48vh] col-span-4 h-fit max-lg:col-span-6 max-sm:col-span-8"
```

So: a 12-track grid with an `8`-track `max-lg` fallback, a declared `1.39vw` column gap that
becomes `4.7vh` at `max-lg`, and an irregular span distribution — `7`, `7 col-end-13`, `4
col-end-13`, `10 col-start-2`, `4`. Editorial asymmetry, not a uniform template. Other declared
spans: `col-span-12` ×2, `col-span-8` ×7, `col-span-6` ×4, `col-span-3` ×1, `col-span-2` ×3
(contribution numbering), `col-start-3`, `col-start-4`, `col-start-7`, `col-end-9`.

There is **no `clamp()` and no measure/container primitive** anywhere in the markup; the
mobile reading measure is expressed as `max-lg:max-w-[47.3vw]`, `max-sm:max-w-none`, and
similar, i.e. breakpoint-swapped `vw` maxima.

---

## E6 — Pin heights

Scroll-pin candidates are named wrappers with a tall height and a `sticky` child:

| Wrapper | Declared height | Sticky child |
|---|---|---|
| `<div class="heroSection-Sticky-wrapper" style="height:650vh">` | `650vh` | `<section class="hero-section sticky top-0 left-0 z-100 -mb-[17.5vh] h-fit w-full max-lg:mb-0">` |
| `<section class="services-section" style="height:600vh;position:relative;width:100%;background-color:transparent">` | `600vh` | `<div style="position:sticky;top:0;height:100vh;width:100%;overflow:hidden;…">` |
| `<div class="testimonials-spacer" style="height:320vh">` | `320vh` | `<div class="testimonials-sticky-wrapper sticky max-lg:top-[8vh]!">` |

Full `services-section` sticky child, quoted:

```html
<div style="position:sticky;top:0;height:100vh;width:100%;overflow:hidden;background-color:transparent;background-image:radial-gradient(circle at center, transparent 0%, transparent var(--bg-progress, -150%), #0e0e0e calc(var(--bg-progress, -150%) + var(--bg-softness, 150%)))">
```

`--bg-progress` and `--bg-softness` appear **nowhere** in the shipped stylesheet
(`0` occurrences each). They are referenced only here, with fallbacks. Something therefore sets
them at runtime. That is an observed fact about a CSS-variable hand-off; it does not identify
what sets them, and it does not establish a library.

Non-pin fixed-height media containers use `style="height:48.8vh"` (×5, project media) with an
oversized inner layer for scale:

```html
<div class="relative w-full overflow-hidden" style="height:48.8vh">
<div class="absolute inset-0 w-full will-change-transform" style="height:110%;top:-5%;transform:scale(1.025)">
```

---

## E7 — Split-text hooks and ghost-copy states

This is the anchor that falsifies the dossier v0.1 duplication warning.

### Per-word hook, hero

```html
<h1 class="font-AtAero hero-main-heading text-h2/[1.1] flex max-w-[40vw] flex-wrap max-lg:max-w-[62vw] max-lg:text-[7.25vw]/[1.1] max-sm:max-w-none max-sm:text-[11.9vw]/[1.1]">
  <span class="relative inline-block overflow-hidden">
    <span class="absolute top-0 left-0 h-full w-full"> </span>
    <span class="heroSection-splitWord block translate-y-full opacity-10">You<!-- --> </span>
  </span>
  <span class="relative inline-block overflow-hidden">
    <span class="absolute top-0 left-0 h-full w-full"> </span>
    <span class="heroSection-splitWord block translate-y-full opacity-10">feel<!-- --> </span>
  </span>
  <span class="relative inline-block overflow-hidden">
    <span class="absolute top-0 left-0 h-full w-full"> </span>
    <span class="heroSection-splitWord block translate-y-full opacity-10">the<!-- --> </span>
  </span>
  <span class="relative inline-block overflow-hidden">
    <span class="absolute top-0 left-0 h-full w-full"> </span>
    <span class="heroSection-splitWord block translate-y-full opacity-10">brand<!-- --> </span>
  </span>
```

Structure: a per-word `overflow-hidden` mask wrapper, an empty `absolute` sibling inside it
(empty in SSR — a destination for a later copy, not a duplicate character), and the real word
carrying a `translate-y-full` pre-state.

### Per-glyph ghost copy, Journal manifesto

```html
<div class="journal-section-text flex flex-wrap">
<span class="float-start h-1 w-[12.64vw] max-lg:hidden"> </span>
<div class="overflow-hidden">
  <span class="journal-section-text-words mr-[1vw] inline-block translate-y-full rotate-6 opacity-0 max-sm:mr-[2.4vw]">
    <span class="relative inline-block">
      <span class="absolute top-0 left-0 text-white/20">A</span>
      <span class="char relative opacity-0">A</span>
    </span>
  </span>
</div>
<div class="overflow-hidden">
  <span class="journal-section-text-words mr-[1vw] inline-block translate-y-full rotate-6 opacity-0 max-sm:mr-[2.4vw]">
    <span class="relative inline-block">
      <span class="absolute top-0 left-0 text-white/20">b</span>
      <span class="char relative opacity-0">b</span>
    </span>
    <span class="relative inline-block">
      <span class="absolute top-0 left-0 text-white/20">r</span>
      <span class="char relative opacity-0">r</span>
    </span>
    … "a" "a" · "n" "n" · "d" "d" …
  </span>
</div>
```

Each glyph appears **twice**: once as a static 20%-white ghost
(`.absolute.top-0.left-0.text-white/20`) and once as the animated character
(`.char.relative.opacity-0`). Counts across the document: **136** ghost spans and **136**
`.char` spans, **all 272 inside the journal section**, distributed across **26** per-word
`overflow-hidden` wrappers. The two lists were extracted and compared element by element: they
are identical and in the same order, so every ghost is paired with its own character.

Concatenating the 136 `.char` values reconstructs the manifesto text, with spaces supplied by
the word wrappers:

> A brand is recognized before it is understood. Your visual identity shapes how people
> recognize you, trust you, and remember you. We help define that difference.

This is the concrete demonstration that the v0.1 "apparent text duplication in extraction" was
reading a real doubling in the source, not an artifact of the extraction tool.

Hook families and counts:

| Hook | Count | Where |
|---|---|---|
| `ProjectsSection-splitWord` | 89 | project showcase |
| `servicePoint-splitWord` | 32 | contribution list |
| `heroSection-splitWord` | 7 | hero `h1` |
| `label-splitLine` | 4 | labels |
| `heroSection-splitLine` | 3 | hero |
| `mobile-splitLine` | 2 | mobile-specific |
| `journal-section-text-words` / `text-words` | 26 / 26 | journal manifesto word wrappers |
| `service-word` | 14 | services `h2` word spans, each gradient-filled |

Totals: **128** occurrences of the `-splitWord` substring, **9** of `-splitLine`. No
`-splitChar` and no `splitText`/`SplitText` substring occurs. The names are semantic per
section, not generic, so a hook's presence indicates a section-specific mechanism rather than one
shared utility.

The services `h2` word spans carry a richer pre-state than the other hooks —
`class="service-word inline-block translate-y-[110%] rotate-[-5deg] opacity-0 blur-sm"` with
the gradient applied inline — which is the same element targeted by the `max-width:640px`
fallback quoted below.

### Pre-states and reveal hooks, by frequency

| Token | Count |
|---|---|
| `opacity-0` | 398 |
| `overflow-hidden` | 327 |
| `translate-y-full` | 169 |
| `will-change-transform` | 55 |
| `blur-sm` | 33 |
| `text-transparent` | 2 |
| `mix-blend-difference` | 3 |

Distinct inline style values carrying pre-state, by frequency:

| Inline style | Count |
|---|---|
| `line-height:1.2` | 32 |
| `color:transparent` | 24 |
| `clip-path:circle(0% at 100% 100%)` | 8 |
| gradient + `background-clip:text` at `0% 0%` | 6 |
| `transform:translateY(-10%) scale(1.25)` | 5 |
| `opacity:0;transform:translateY(-10%) scale(1.25)` | 5 |
| `transform-origin:left center;transform:scaleX(0)` | 3 |
| `scale:0;opacity:0` | 3 |
| `scale:0;opacity:0;filter:blur(8px)` | 3 |

A contribution divider, quoted: `<div class="contribution-divider h-px w-full scale-x-0 bg-[#3B3B3B]">`.

The services pin carries an inline media query for small screens:

```html
<style>
@media (max-width: 640px) {
  .service-word {
    background: none !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
    -webkit-text-fill-color: white !important;
    color: white !important;
  }
}
</style>
```

This is a responsive *fallback* for the gradient-filled services type. It says what happens
below 640px in CSS; it says nothing about a motion preference query.

### Accessibility-tree treatment of the ghost copies — OPEN

- `aria-hidden` occurs **18** times in the document and `role=` occurs **0** times.
- **0** of the 136 ghost spans and **0** of the 136 `.char` spans carry `aria-hidden` or a
  `role`. Regex check: `class="char…"[^>]*aria-hidden` → 0 matches.
- Where the site *does* hide decorative copies, it does so explicitly: the two
  `text-transparent` gradient spans and the six wordmark `text-outer-space` spans each carry
  `aria-hidden="true"`.

So the duplication is real, and for these 272 spans the served markup does not exclude either
copy from the accessibility tree. Whether the copies are announced once, twice, or as
interleaved single characters requires an accessibility-tree inspection. This is the residual
open item the dossier's old warning was reaching for, and it is narrower than that warning
implied.

### Easing, duration, trigger — still unknown

`-splitWord` names a hook. The markup contains no easing, no duration, and no trigger for it.
The only transition value anywhere in the served markup is
`transition:opacity 0.15s ease` (×5) on project image layers. The stylesheet contains exactly
**two** `@keyframes` rules, `vt-fade-out` and `vt-fade-in`. Scroll-linked motion is therefore
not expressed in CSS keyframes in what was read here.

---

## E8 — Navigation and footer structure

### No navigation element

The document contains **0** `<nav>`, **0** `<form>`, and **0** `<button>` elements. The only
`<input>` is the newsletter field. Footer and header navigation are anchors.

`<header>` contains a single fixed bar with a morphing wordmark:

```html
<div class="NavbarMorphingLogo fixed top-0 left-0 z-1000 flex w-screen items-center justify-between gap-[2%] overflow-hidden bg-transparent px-[5.5vw] pt-[8vh] mix-blend-difference max-lg:overflow-x-hidden max-lg:px-[4.10vw] max-lg:pt-[9.59vh] max-sm:px-[5.97vw] max-sm:pt-[11.3vh]">
  <svg viewBox="0 0 165 201" fill="none" class="NavbarSVGMorphCharacter h-auto flex-165 translate-y-full opacity-0"><path d="M24.0112 182.325V106.861…" fill="#f2f2f2"></path></svg>
  <svg viewBox="200 0 164 201" fill="none" class="NavbarSVGMorphCharacter h-auto flex-164 translate-y-full opacity-0">…</svg>
  <svg viewBox="390 0 230 210" fill="none" class="NavbarSVGMorphCharacter h-auto flex-230 translate-y-full opacity-0">…</svg>
  …
```

**6** `NavbarSVGMorphCharacter` SVGs, each with a `translate-y-full opacity-0` pre-state. A
spacer reserves its height: `<div class="NavbarMorphingLogo-spacer bg-outer-space relative z-10 w-full" aria-hidden="true" style="height:calc(0px + 10vh)">`.

### Footer bracket navigation

Text order, tags stripped, exactly as served: `Menu/ [ Work Work ] [ Studio Studio ]
[ Journal Journal ] [ Contact Contact ] Work Studio Journal Lab Contact Headquarters/ Barcelona,
Spain Wyoming USA. Newsletter/ … Receive occasional insights on brand identity and taste.
socials/ … Privacy policy Support © 2026 PRODUX STUDIOS LLC. All rights reserved.`

Bracket items — four, and **no Lab**. Each label is doubled in markup because of a two-copy
vertical slide:

```html
<a href="/work"><div class="text-[16]! text-[0.97vw]! max-lg:text-[1.36vw]! relative flex cursor-pointer items-center justify-center"><div class=" pointer-events-none flex items-center font-normal"><span>[</span><div class="relative flex h-[16] flex-col justify-center overflow-hidden"><span class="block px-1"><div class="font-extralight">Work</div></span><span class="absolute left-0 block translate-y-[120%] px-1"><div class="font-extralight">Work</div></span></div><span>]</span></div></div></a>
```

The second copy is `absolute left-0 block translate-y-[120%]` and carries **no** `aria-hidden`.
The bracket pattern is `[` + label + `]`, with the label in `font-extralight`.

### Footer link stack — this is where `/lab` lives

```html
<div class="font-AtAero col-span-8 mb-[2.74vh] flex flex-col gap-[2.7vh] text-[7.9vw]/[1] sm:hidden">
  <a href="/work"><div style="border-color:#191919" class="border-b pb-[2.7vh]">Work</div></a>
  <a href="/studio"><div style="border-color:#191919" class="border-b pb-[2.7vh]">Studio</div></a>
  <a href="/journal"><div style="border-color:#191919" class="border-b pb-[2.7vh]">Journal</div></a>
  <a href="/lab"><div style="border-color:#191919" class="border-b pb-[2.7vh]">Lab</div></a>
  <a href="/contact"><div style="border-color:#191919" class="border-b pb-[2.7vh]">Contact</div></a>
</div>
```

The container is `sm:hidden`. `/lab` appears in this mobile-only stack and in no desktop
navigation in the served markup.

### Every internal link in the document, in order of appearance

`/work`, `/contact`, `/journal/brand-strategy-matters`, `/studio`, `/journal`, `/lab`,
`/privacy-policy`, `/support`. Plus external: a Google reviews search URL, a
`topinteractiveagencies.com` article, `x.com/produx_design`,
`linkedin.com/company/produxdesign`, `youtube.com/watch?v=QDia3e12czc`.

No `/service/*` link and no `/letswork` string appears in the homepage markup
(`/letswork` → 0 occurrences; `/contact` → 3).

### Other overlays and the entity block

```html
<div aria-hidden="true" class="page-transition-overlay bg-Hoki fixed top-0 left-0 z-9999999 grid h-screen w-screen place-items-center" style="top:150%;left:0">
```

```html
<div aria-hidden="true" class="bg-outer-space pointer-events-none fixed inset-0 opacity-0" style="z-index:99999"> </div>
```

The second is a full-viewport `outer-space` layer at `opacity-0`. Its existence in the served
markup is established; what it does on load is not.

Footer text, verbatim: `© 2026 PRODUX STUDIOS LLC. All rights reserved.` and a Headquarters
block reading `Barcelona, Spain` and `Wyoming USA.`

Newsletter field, quoted — an input with no enclosing form:

```html
<input class="bg-white-smoke/5 border-white-smoke/15 font-DM-mono text-body-text-3/[1] w-full border p-[0.83vw] outline-none max-lg:w-full max-lg:p-[1.17vw] max-lg:text-[1.36vw] max-sm:p-[2.8vw] max-sm:text-[3.48vw]" type="email" placeholder="EMAIL" …>
```

---

## E9 — Cursors

Three custom cursor layers are declared. The container is hidden from the accessibility tree;
two of the three children repeat that.

```html
<div class="site-cursor-followers" aria-hidden="true">
  <div aria-hidden="true" class="scroll-down-indicator font-DM-mono text-white-smoke px-[0.55vw] py-[0.23vw] text-[0.95vw] uppercase mix-blend-difference max-sm:flex max-sm:p-0 max-sm:text-[3.48vw]" style="position:fixed;z-index:9999;pointer-events:none;white-space:nowrap;opacity:0;top:2.78vw;left:4.86vw;right:auto;bottom:auto"><span style="display:inline-block">[</span>scroll down<span style="display:inline-block">]</span></div>
  <div aria-hidden="true" class="project-cursor-follower pointer-events-none fixed top-[4.68vh] left-[4.44vw] z-1000" style="visibility:hidden;opacity:0;transform:translate(-50%, -50%) scale(0);will-change:transform">…</div>
  <div aria-hidden="true" class="font-DM-mono text-outer-space text-body-text-3 pointer-events-none fixed top-[3vh] left-[3vw] z-50 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white px-[0.83vw] py-[0.41vw] font-normal uppercase" style="visibility:hidden;opacity:0;transform:translate(-50%, -50%) scale(0);will-change:transform">Trusted by</div>
  <div class="showreel-cursor-follower pointer-events-none fixed top-0 left-0 z-300 flex size-[8.4vw] items-center justify-center gap-[0.69vw] border bg-white/10 px-[0.83vw] mix-blend-exclusion backdrop-blur-2xl max-lg:hidden" style="visibility:hidden;opacity:0;scale:0;border-image:linear-gradient(to bottom right, rgba(255,255,255,0.5), rgba(255,255,255,0.15)) 1">…</div>
</div>
```

Declared: `cursor-pointer` ×34, `cursor-follower` ×2, `cursor-followers` ×1, `cursor-grab` ×1,
`cursor-grabbing` ×1. Blend modes `mix-blend-difference` (×3, including the wordmark and the
scroll indicator) and `mix-blend-exclusion` (showreel cursor). Pre-states are
`visibility:hidden;opacity:0;… scale(0)` and `scale:0;opacity:0;filter:blur(8px)`.

The `showreel-cursor-follower` is the only one of the four without its own `aria-hidden`; it sits
inside the `aria-hidden` container, so it is still inside a hidden subtree as served.

Whether a custom cursor replaces the native one — and what happens for keyboard or touch users —
is not established. No `@media (pointer: fine)` or `pointer: coarse` condition appears in the
markup.

---

## E10 — Canvas count and inline animation styles

**4** `<canvas>` elements, verbatim:

```html
<canvas class="max-lg:hidden" style="position:absolute;top:-12.5%;left:0;width:100%;height:150%;pointer-events:none;z-index:10000"></canvas>
<canvas style="display:block;width:100%;height:100%"></canvas>
<canvas class="top-1/2 left-[53%] w-[53vw] -translate-x-1/2 max-lg:left-1/2 max-lg:w-[83vw] max-lg:-translate-x-1/2 max-sm:w-[115vw]" style="position:absolute;transform:translate(0, -50%) translateZ(0);height:auto;display:block;pointer-events:none;z-index:3;image-rendering:-webkit-optimize-contrast"></canvas>
<canvas style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;pointer-events:none;z-index:1;mask-image:linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%);-webkit-mask-image:linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)"></canvas>
```

All four are empty in SSR. Three are `pointer-events:none`. The fourth declares a mask-image
gradient. Declared sizes include `53vw` desktop / `83vw` `max-lg` / `115vw` `max-sm`.

**7** `<video>` elements: one plain full-width `<video loop="" muted="" playsInline=""
class="h-auto w-full">`, one with `id="hero-showreel"` inside a `style="opacity:0"` box, and
**five** sharing an identical pre-state:

```html
<video id="hero-showreel" loop="" muted="" poster="" playsInline="" class="h-full w-full object-cover" style="object-fit:cover"></video>
<video class="absolute top-0 left-0 z-10 h-full w-full object-cover object-center will-change-transform" style="opacity:0;transform:translateY(-10%) scale(1.25)" loop="" muted="" playsInline="" preload="auto"></video>
```

No `src` attribute on any of the 7; sources would arrive separately.

Which canvases, if any, have a WebGL context is not established. `webgl` and `getContext(`
appear **0** times in the markup.

`requestAnimationFrame` appears **10** times in the markup, inside an inline scroll-restoration
script that also listens for `popstate` and `load`. That is scroll restoration, not an animation
loop. `gsap`, `ScrollTrigger`, `three`, `lenis`, and `smoothscroll` appear **0** times.

---

## E11 — Asset preloads

```html
<link rel="preload" as="image" href="/images/Projects/Edgerun/Edgerun.webp"/>
<link rel="preload" as="image" href="/images/FeaturedProject/GatherAI.webp"/>
<link rel="preload" as="image" href="/images/FeaturedProject/JurniAI.webp"/>
<link rel="preload" as="image" href="/images/FeaturedProject/parkerAI.webp"/>
<link rel="preload" as="image" href="/images/FeaturedProject/Payy.webp"/>
<link rel="preload" as="image" href="images/ClientHeadshots/JimmySlage.webp"/>
<link rel="preload" as="image" href="images/ClientHeadshots/TyZamkow.webp"/>
<link rel="preload" as="image" href="images/ClientHeadshots/Nathan.webp"/>
<link rel="preload" as="image" href="images/ClientHeadshots/DelbertTy.webp"/>
<link rel="preload" as="image" href="images/ClientHeadshots/AriannaArmelli.webp"/>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/10yl.ldr8v2a8.js?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc"/>
<link rel="preload" as="image" href="images/ClientHeadshots/FawazBuqammaz.webp"/>
<link rel="preload" as="image" href="/images/JournalImages/1.webp"/>
<link rel="preload" as="image" href="/images/JournalImages/2.webp"/>
<link rel="preload" as="image" href="/images/JournalImages/3.webp"/>
<link rel="preload" as="image" href="/images/JournalImages/4.webp"/>
<link rel="preload" as="image" href="/images/JournalImages/5.webp"/>
```

18 preloads. Note the mixed absolute and relative `href` forms for the client headshots, and
`fetchPriority="low"` on the single script preload.

There is exactly **1** stylesheet reference and **1** preloaded script in the served HTML, but
**19** `<script src>` chunks in total. The single stylesheet is the file read for `E12`.

Media format: every preloaded image is `.webp`. There is no `<picture>` element and there are
**2** `<source>` elements; their contents were not extracted for this pass.

---

## E12 — Shipped stylesheet (added because the chunk was readable this run)

The v0.1 preparation could not read the CSS. On 2026-10-02 the chunk referenced by `/` returned
HTTP 200 and was readable, so this anchor exists. **It is still tier A2**: these are authored
stylesheet declarations, not computed output.

Source: `/_next/static/chunks/0hcp-p.-qpzyg.css?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc`,
67,892 bytes as one 67,891-character line.

| At-rule | Present |
|---|---|
| `@layer` | 5 — `properties`, `theme`, `base`, `utilities` |
| `@property` | 59 (Tailwind transform/property registrations) |
| `@font-face` | 7 |
| `@media` | 17 |
| `@supports` | 11 |
| `@container` | 1 |
| `@keyframes` | **2** — `vt-fade-out`, `vt-fade-in` |

### Font faces, verbatim

```css
@font-face{font-family:At Aero;src:url(../media/AtAero-Retina.0_91iicuqc4p1.otf?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc);font-weight:100 900;font-stretch:100%;font-style:normal;font-display:swap}
@font-face{font-family:At Aero Regular;src:url(../media/AtAero-Regular.0uw80pfpdnq_a.otf?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc);font-weight:100 900;font-stretch:100%;font-style:normal;font-display:swap}
@font-face{font-family:At Aero Medium;src:url(../media/AtAero-Medium.0amks-hcn-0_k.otf?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc);font-weight:100 900;font-stretch:100%;font-style:normal;font-display:swap}
@font-face{font-family:At Aero Light;src:url(../media/AtAero-Light.06o2z1-163i.7.otf?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc);font-weight:100 900;font-stretch:100%;font-style:normal;font-display:swap}
@font-face{font-family:DM Mono;src:url(../media/DMMono-Light.02.9dod98p6.u.ttf?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc)format("truetype-variations");font-weight:300;font-stretch:100%;font-style:normal;font-display:swap}
@font-face{font-family:DM Mono;src:url(../media/DMMono-Regular.0o2e964hvo05l.ttf?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc)format("truetype-variations");font-weight:400;font-stretch:100%;font-style:normal;font-display:swap}
@font-face{font-family:DM Mono;src:url(../media/DMMono-Medium.125t044ujdbxa.ttf?dpl=dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc)format("truetype-variations");font-weight:500;font-stretch:100%;font-style:normal;font-display:swap}
```

Declared, and not to be overstated: **4** At Aero faces (Retina, Regular, Medium, Light) as
static `.otf`; **3** DM Mono faces as `.ttf` with `format("truetype-variations")` at weights
300/400/500. All seven declare `font-display:swap` and `font-stretch:100%`. The At Aero faces
each declare `font-weight:100 900` over a static `.otf`, which is a declaration, not proof of a
variable font axis.

Type scale utilities, font weights, and token values are quoted under `E3` and `E4`; they are
read from this same stylesheet.

### The two keyframes, verbatim

```css
@keyframes vt-fade-out{…}
@keyframes vt-fade-in{…}
```

Both are Vercel view-transition fades. There is no `@keyframes` for the word reveals, the
split-text reveals, the pin choreography, or the cursor states.

### Reduced motion

`prefers-reduced-motion` occurs **0** times in this stylesheet. Combined with the markup
finding, this means no CSS-side motion-preference accommodation was found in either artifact
read. Runtime accommodation, if any, would have to come from JavaScript, and 18 of the 19
chunks were not read.

---

## Unresolved

Each item below is genuinely unknown, not merely unfetched, with the reason.

| # | Unresolved | Why |
|---|---|---|
| U1 | Every computed style: rendered font, resolved size, used weight, used line-height, used color, actual element bounds, actual grid gap in px | No browser and no DevTools in this environment. All values here are authored declarations. |
| U2 | Which face binds to which element, at which viewport | The `font-AtAero` / `font-AtAero-Medium` / `font-AtAero-Regular` / `font-DM-mono` mapping is read from class names. Cascade outcome was not observed. |
| U3 | At Aero and DM Mono licensing terms | Out of scope for a markup capture. Must come from the foundry and the distributed license files. |
| U4 | Easing, duration, scrub, and trigger for `-splitWord`, `-splitLine`, `service-word`, `text-words`, `.char` | Hook names only. No values in markup; only two view-transition keyframes in the stylesheet. |
| U5 | Animation library identity | The markup contains no GSAP/ScrollTrigger/Three/Lenis markers. 18 of 19 script chunks were not read; the one sampled chunk contained none. Shipped-bundle presence would still not prove use in a given section. |
| U6 | Which of the 4 canvases is WebGL, and what each renders | Canvases are empty in SSR. `getContext(` and `webgl` do not appear in the markup. |
| U7 | Runtime scroll physics and smooth-scroll behavior | No scroll testing. `--bg-progress` / `--bg-softness` are referenced in an inline style but defined nowhere in the read stylesheet, so they are set at runtime by an unread chunk. |
| U8 | Reduced-motion behavior | Zero `prefers-reduced-motion` in markup and in the readable stylesheet. JavaScript accommodation cannot be excluded and was not read. |
| U9 | Accessibility-tree treatment of the 272 ghost/char spans | Requires an accessibility-tree inspection. Zero `aria-hidden` and zero `role` on those spans as served (`E7`). |
| U10 | Loader behavior and duration | A `bg-outer-space` full-viewport layer at `opacity-0` is present in the markup; nothing about load sequence, progress, or dismissal was observed. |
| U11 | Media type of the project gallery and its hover geometry | Declared `<img>` layers with `will-change-transform` and `scale(1.025)` oversizing. No hover test was performed. |
| U12 | Breakpoint behavior, rewrap, zoom, and 200% reflow | No viewport variation was requested. Breakpoint *labels* exist in the markup; the rendered result at any width does not. |
| U13 | Performance, Core Web Vitals, frame timing, GPU texture memory | No runtime measurement of any kind. |
| U14 | Focus order, keyboard operation, focus management, scroll locking | No keyboard interaction was tested. The document contains no `<button>`, so nothing in the served markup establishes how the footer navigation or custom cursors behave for keyboard users. |
| U15 | Whether `/letswork` still resolves or redirects | Only `/` was fetched in this pass. Recorded as an unconfirmed redirect candidate, not a finding. |
| U16 | Any route other than `/` | Out of scope for this pass by design. |

## Reuse and limits of this file

- Re-fetching is cheap and the site moves; treat every dated value here as belonging to
  2026-10-02 only.
- Before quoting this file, confirm the site's build hash is unchanged. The `dpl=` deployment
  identifier observed was `dpl_DTLVDLs57BHhn9xRkD5j3m4hqpJc`.
- This is a REFERENCE observation about another company's public site. It establishes no Echo11
  requirement. See `../echo11-documentation-README.md` authority rule 5.
