---

# Echo11 — Industrial-Level Development Documentation

**Version 1.0 | Next.js SaaS Digital Agency**

***

## 1. Project Identity

Echo11 is a full-service digital agency building web experiences for businesses, startups, politicians, celebrities, athletes, and creators. It is not merely a portfolio site — it is a **live product showcase** that itself demonstrates the studio's craft. Every pixel, motion, and interaction serves as proof of work.

**Brand Tone:** Bold. Minimal. Intentional. Machine-precise with human warmth.
**Design Language:** Industrial editorial — sharp geometry, disciplined typography, and purposeful motion.

***

## 2. Core Design Philosophy

The design is pulled from patterns observed across Raycast, Linear, Osmo Supply, Payload CMS, Basedash, index.app, and Paper.design — all of which share: 

- **Dark-dominant canvases** with near-black bases (`#0A0A0A` or `#080808`) and near-white text (`#F2F2F0`)
- **No gradients.** Color transitions use opacity, layering, and contrast — not color blending
- **No rounded badge components.** Tags are sharp-edged rectangular labels or plain inline text
- **No generic icon sets** (no Heroicons/FontAwesome). Use custom SVG paths and drawn line marks
- **Single coherent background** per page — animated scroll context lives within that background, not over color changes
- **Noise/grain texture overlay** (`opacity: 0.03–0.05`) applied globally for analog tactility
- **Minimal palette:** Black, White, and one structural accent — recommended Steel White (`#E8E8E0`) or Cool Concrete (`#B8B8B4`)

***

## 3. Tech Stack & Architecture

### Core Framework

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | GSAP (ScrollTrigger, SplitText, DrawSVG) + Framer Motion |
| 3D / Canvas | Three.js (React Three Fiber) for hero canvas effects |
| CMS | Payload CMS (self-hosted, co-located in Next.js) |
| Deployment | Vercel (Edge Runtime for dynamic routes) |
| State | Zustand (lightweight, no Redux overhead) |
| Forms | React Hook Form + Zod validation |

### Project Structure

```
echo11/
├── app/
│   ├── (marketing)/         # Public-facing pages
│   │   ├── page.tsx         # Homepage
│   │   ├── services/
│   │   ├── work/
│   │   ├── stories/
│   │   ├── about/
│   │   ├── pricing/
│   │   ├── blog/
│   │   ├── contact/
│   │   └── careers/
│   ├── (legal)/             # Terms, Privacy, Accessibility
│   └── layout.tsx
├── components/
│   ├── ui/                  # Atomic design tokens
│   ├── sections/            # Page-specific section blocks
│   ├── canvas/              # Three.js / WebGL components
│   ├── svg/                 # Animated SVG path components
│   └── layout/              # Nav, Footer, Cursor
├── lib/
│   ├── animations/          # GSAP presets, scroll configs
│   ├── hooks/               # useScrollProgress, useCursor
│   └── constants/
├── payload/                 # CMS collections, fields
├── public/
│   └── fonts/               # Self-hosted variable fonts
└── styles/
    └── globals.css
```

***

## 4. Global Design System

### 4.1 Typography

Typography is the most powerful design tool in this system. Avoid system fonts.

- **Primary Display Font:** A modern geometric sans with variable weight axis — e.g., *Neue Montreal*, *PP Mori*, *Aktiv Grotesk*, or open alternatives like *Geist* or *Inter Display*
- **Body Font:** Same family, weight 300–400, tracking `-0.01em`
- **Mono / Label Font:** JetBrains Mono or Geist Mono for code snippets, stat labels, metadata

**Type Scale (clamp-based, fluid):**
```css
--text-display: clamp(3.5rem, 8vw, 9rem);
--text-headline: clamp(2rem, 4.5vw, 5rem);
--text-subhead: clamp(1.25rem, 2.5vw, 2rem);
--text-body: clamp(0.9rem, 1.2vw, 1.1rem);
--text-label: clamp(0.65rem, 0.9vw, 0.8rem);
```

**Kinetic Text Animations (global):**
- Stagger-reveal using `clip-path: inset(0 100% 0 0)` → `inset(0 0% 0 0)` per word
- Line-by-line SplitText reveal on scroll entry (GSAP `ScrollTrigger`)
- Counter animations for stat numbers (`gsap.to({ val: 0 }, { val: target })`)

### 4.2 Color Tokens

```css
--color-bg:       #080808;
--color-surface:  #111111;
--color-border:   #1F1F1F;
--color-text:     #F2F2F0;
--color-muted:    #666660;
--color-accent:   #E8E8E0;   /* structural white */
--color-mark:     #FFFFFF;
```

**Strict rules:**
- No gradient between any two of these values
- Hover states use border stroke reveal or opacity shifts — not color fills
- Selection highlight: `background: #FFFFFF; color: #080808;`

### 4.3 Spacing System

Use a base-8 spacing grid. All layout gaps, margins, padding mapped to multiples of 8px. Sections use `clamp(5rem, 10vw, 12rem)` vertical padding.

### 4.4 Border & Surface Language

- Borders: `1px solid var(--color-border)` — subtle, structural, never decorative
- Cards use `background: var(--color-surface)` with a border, no box-shadow
- On hover: border becomes `var(--color-muted)` + subtle `translateY(-2px)` + scanline overlay pseudo-element

***

## 5. Global Components

### 5.1 Cursor

A custom cursor replaces the default pointer sitewide.

- **Default state:** Small circle `12px` diameter, `mix-blend-mode: difference`
- **Hover over links/CTA:** Expands to `48px`, label appears inside (e.g., "View →")
- **Hover over images/cards:** Expands to `80px` with inner text "Open" or "Drag"
- **Magnetic behavior:** On interactive elements, cursor is magnetically pulled 12–20px toward center
- Implementation: custom `useMagneticCursor` hook using `requestAnimationFrame` + lerp smoothing

### 5.2 Navigation

- Fixed top bar, full width
- Left: `ECHO11` wordmark in mono caps — not a logo image, typographic mark
- Right: Nav links in label font, spaced, no underlines by default
- On hover: a thin `1px` underline draws left-to-right (SVG `stroke-dashoffset` animation)
- Mobile: Full-screen overlay nav with staggered link reveal using `clip-path` animation
- On scroll past `80px`: nav background becomes `rgba(8,8,8,0.85)` with `backdrop-filter: blur(12px)`

### 5.3 Footer

- Full-width, dark surface
- Four columns: Brand + mission, Services links, Social links, Legal links
- Bottom bar: copyright left, "Built with precision" right
- Animated SVG "ECHO11" outline text — draws itself on scroll into view (`stroke-dashoffset` → 0)
- No icons for social — plain text links ("X", "LinkedIn", "GitHub")

### 5.4 Page Transitions

Inspired by Osmo Supply's page transition patterns: 

- A black panel `scaleY(0 → 1 → 0)` with `transform-origin: bottom` on exit and `top` on enter
- Duration: `600ms ease-in-out`
- During transition: `ECHO11` monogram center-screen
- Implemented via a root-level `<AnimatePresence>` wrapper in `layout.tsx` with Framer Motion variants

***

## 6. Page-by-Page Documentation

***

### 6.1 Homepage (`/`)

**Purpose:** First impression, brand authority, capability signal, conversion trigger.

**Background:** Single static dark canvas. A `<canvas>` element renders a reactive **wave/fluid simulation** that responds to cursor position — inspired by Raycast's hero motion feel.  The wave is monochrome (near-white strokes on black). No color. Wave amplitude increases on cursor hover.

#### Sections

**Hero**
- Full viewport height
- Large display text, two lines: first line static weight, second line in thin weight — creates editorial contrast
- Example copy direction: *"We build digital presence / that doesn't whisper."*
- Below headline: one-line descriptor `[DIGITAL AGENCY — EST. 2024]` in mono label font
- CTA: Two sharp rectangular buttons — `[Start a Project]` and `[View Work]`
- Animated wave canvas sits behind as `position: absolute, z-index: 0`
- On page load: hero text animates in with staggered word-clip reveal over `1.2s`
- Scroll indicator: thin vertical line with a dot that pulses, `position: absolute bottom-8`

**Marquee Strip**
- Full-width horizontally scrolling ticker, auto-play + pause on hover
- Content: client types / industries served — `STARTUPS · POLITICIANS · ATHLETES · BRANDS · CREATORS ·`
- Font: mono uppercase, size `--text-label`, color `--color-muted`
- Implementation: CSS `animation: marquee linear infinite`

**Services Overview**
- Headline reveal on scroll
- 4–5 service cards in a horizontal grid
- Card anatomy: number label top-left `[01]`, service name in headline size, one-line descriptor, animated SVG stroke illustration in card background (faint, appears on hover)
- Hover: border brighten + SVG illustration draws itself over `400ms`

**Work Showcase**
- Full-width project feature: alternating left/right image + text layout
- Images: sharp-cornered, no border-radius
- On scroll into view: image slides in from right (`translateX(60px) → 0`) while text fades up
- Project label in rectangular tag: `[WEB DESIGN]` `[CAMPAIGN]`
- Max 3 featured works with a `[View All Work →]` CTA at section end

**Capabilities / Why Echo11**
- Dark surface section
- Three columns with bold stat numbers: `42+ Projects`, `5 Platforms Built`, `3 Countries`
- Numbers animate up on scroll entry
- Below: short paragraph on mission/approach

**Platforms Section**
- Showcases Echo11's own products: The Leaders NP, StudentStack, 3AM3D, StepOutInStyle, ExpressSocialNP
- Horizontal scroll container (Lenis smooth scroll) — card per platform
- Each card: platform name large, short purpose line, sharp CTA arrow link

**Social Proof**
- 2–3 client quotes in large editorial format
- Quote mark is a drawn SVG — no quotation mark character
- Attribution: name + role in small mono text

**CTA Banner**
- Full-width section, minimal
- Headline: *"Ready to build something real?"*
- Single button + email field side by side on desktop, stacked on mobile

***

### 6.2 Services (`/services`)

**Purpose:** Establish authority across service verticals with clarity and no ambiguity.

**Background:** Same dark base. Thin animated SVG horizontal rule draws across the page as scroll progresses.

#### Sections

**Page Hero**
- Headline: `[Services]` in large mono, full-width
- Sub: one sentence positioning statement
- Page-entry animation: horizontal rule SVG draws left-to-right on load

**Service Verticals**
Full-page each, stacked:

1. Web Design & Development
2. Digital Platforms & Products
3. Brand Identity & Visual Design
4. Campaign & Content Strategy
5. Political & Personal Branding

Each service block:
- Service number `[01 /]` left column (sticky on desktop as you scroll the right column)
- Right column: headline, 2-paragraph description, deliverables as a sharp list, one featured work reference
- SVG illustration: abstract line-drawn representation of the service — animated to draw on scroll entry

**Process Timeline**
- Horizontal scroll on desktop, vertical on mobile
- 5 phases: Discovery → Strategy → Design → Build → Launch
- Each phase: phase label in mono, headline, 2-line desc
- Connecting line between phases is a drawn SVG path

***

### 6.3 Work / Projects (`/work`)

**Purpose:** Portfolio — proof of craft, diversity, and depth.

**Layout:** Asymmetric masonry grid, not a uniform 3-column layout

#### Sections

**Page Hero**
- Simple: `[Work]` headline + project count `[24 Projects]` in muted small text
- Filter bar: horizontal rectangular filter buttons — `All / Web / Platform / Brand / Campaign` — no dropdown

**Grid Layout**
- Mix of full-width, half-width, and quarter-width cards
- No uniform spacing — deliberate negative space creates hierarchy
- Card: project thumbnail (sharp corners), project name, category rectangular tag, year
- Hover: image scale `1.03`, overlay with arrow and project title centered

**Load More**
- On scroll to bottom, next batch loads with fade-up stagger — no pagination buttons

***

### 6.4 Case Studies / Stories (`/stories`)

**Purpose:** Long-form, editorial project breakdowns for trust-building.

**Layout inspired by:** Linear's clean document-style layout + Raycast's content depth 

#### Sections

**Stories Index**
- Three large featured stories stacked
- Each: full-width image, story label in rectangular tag, title in display size, read time, year
- Remaining stories: compact horizontal list rows with border separators

**Individual Story (`/stories/[slug]`)**
- Full-width hero image (no border-radius)
- Sticky sidebar (desktop): table of contents, auto-highlighted based on scroll position
- Content: editorial typography, pull quotes, full-bleed images
- At bottom: next case study teaser

***

### 6.5 About (`/about`)

**Purpose:** Studio identity, team, values, and authentic narrative.

#### Sections

**Hero**
- Headline: `[Who We Are]` — display size
- Two-column: large image left, text right — image sharp-cornered, no filter

**Mission Statement**
- Full-width, single large sentence, centered, display font weight 300
- On scroll: each word reveals left to right with clip-path

**Values**
- 4–5 values as a numbered list: sharp number, bold title, descriptor sentence
- No cards — plain list on dark surface with border-top separators

**Team**
- Grid of team members: photo, name, role in mono
- Photo hover: slight desaturation lift + name reveals with underline draw

**Timeline / Studio Story**
- Vertical timeline, alternating left/right
- SVG vertical connector line draws itself on scroll progress

***

### 6.6 Pricing (`/pricing`)

**Layout inspired by:** Osmo's clean pricing tier structure 

#### Sections

**Hero**
- `[Pricing]` headline + positioning line

**Pricing Tiers**
- Three tiers: Starter / Growth / Studio
- Sharp rectangular cards, no border-radius
- Tier name + price + billing period + separator line + feature list + CTA button
- Feature items use a custom drawn checkmark SVG — not a standard ✓ icon
- Active/featured tier: white background, black text (inverted) — no color accent used

**Custom / Enterprise**
- Separate section below: full-width strip, single CTA — "Let's talk scope"

**FAQ**
- Accordion: sharp rectangular rows with `[+]` / `[-]` toggle in mono
- Open/close animation: content `height: 0 → auto` with `overflow: hidden` transition

***

### 6.7 Blog / Articles (`/blog`)

**Layout:** Editorial, inspired by high-end publication design

#### Sections

**Blog Index**
- Featured article: full-width with large thumbnail, title, excerpt, date, read time
- Grid below: 2–3 column responsive grid of article cards

**Individual Article (`/blog/[slug]`)**
- Typography-first layout: content width constrained to `720px`, centered
- Pull quotes: large, left-bordered with a `4px` solid white left border
- Images: full-width within content column, sharp corners
- Author block at end: name, role, short bio, date

***

### 6.8 Contact (`/contact`)

#### Sections

**Hero**
- Large headline: *"Let's Build Something."*
- No form above the fold

**Contact Form**
- Fields: Name, Email, Company, Project Type (custom select — sharp rectangular dropdown), Budget range, Message
- Custom select: no native `<select>` styling — fully custom with animated list reveal
- Submit button: rectangular, full-width on mobile
- On submit: animated checkmark SVG draws itself, confirmation message slides in

**Direct Contact**
- Email address in large text, click-to-copy with `[Copied]` confirmation
- Location and timezone info in mono label

***

### 6.9 Careers (`/careers`)

#### Sections

**Hero:** Headline + studio culture statement

**Open Roles**
- Listed as border-separated rows: role title, type (full-time/contract), location — all in sharp rectangular row format
- Click to expand: role details with `clip-path` reveal

**Culture / Why Echo11**
- 3-column grid: value blocks, same pattern as About values

***

### 6.10 Legal Pages

**Terms & Conditions (`/legal/terms`)**
**Privacy Policy (`/legal/privacy`)**
**Cookie Policy (`/legal/cookies`)**
**Accessibility Statement (`/legal/accessibility`)**

All legal pages follow the same template:
- Left: sticky table of contents (desktop), labeled in mono, auto-scroll highlight
- Right: content in `720px` constrained column
- No hero image — clean typographic entry with section title + last updated date
- Section headers using `<h2>` in subhead size, bordered separator lines

***

### 6.11 404 Page (`/not-found`)

- Full viewport
- Large `404` in display size — animates in with a scramble text effect (characters randomize before settling)
- One-line message + `[Go Home]` button
- Background: wave canvas same as homepage — maintains brand consistency

***

## 7. Animation System

### 7.1 Principles

- **Every animation has a purpose** — it either guides attention, communicates state, or creates depth
- **No bouncy spring animations** on content — springs reserved for cursor and micro-interactions only
- **Ease:** `cubic-bezier(0.16, 1, 0.3, 1)` as the default — fast in, slow settle (Expo ease-out equivalent)
- **Duration:** UI interactions `200–300ms`, content reveals `600–900ms`, page transitions `500–700ms`

### 7.2 Scroll Animation Patterns

**Text Reveal (Clip-path Wipe):**
Each paragraph or headline uses GSAP SplitText to split into lines or words. Each segment animates from `clip-path: inset(0 100% 0 0)` → `clip-path: inset(0 0% 0 0)` with stagger `0.05s`.

**Image Reveal (Scale + Clip):**
Images enter from `clipPath: inset(100% 0 0 0)` → `inset(0% 0 0 0)` while inner image scales `1.15 → 1.0`, creating a cinematic "uncover" effect.

**SVG Path Drawing:**
All decorative SVG line illustrations use `stroke-dasharray` equal to the path length and `stroke-dashoffset` animated from full length to `0` on scroll entry.

**Counter Animations:**
Stat numbers animate from `0` to target value using GSAP `to()` with `snap: 1` for integers.

**Parallax:**
Hero images and background elements move at `0.3x` scroll speed using GSAP ScrollTrigger `scrub: 1`.

### 7.3 Scroll Engine

Use **Lenis** for smooth scroll globally. Integrate with GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`. This provides the butter-smooth inertia scroll seen on Osmo Supply and Linear. 

```ts
// lib/animations/lenis.ts — concept
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})
```

### 7.4 Hover Effects

| Element | Hover Behavior |
|---|---|
| Nav links | SVG underline draws left-to-right |
| Project cards | Image scales `1.03`, overlay fades in, border brightens |
| CTA buttons | Border pulses outward (`::after` scale), text shifts `2px` up |
| Team photos | Desaturation lifts to full color (starts desaturated) |
| Service cards | SVG illustration draws on hover |

***

## 8. Responsive Design System

### 8.1 Breakpoints

```css
--bp-sm:  640px;
--bp-md:  768px;
--bp-lg:  1024px;
--bp-xl:  1280px;
--bp-2xl: 1536px;
```

### 8.2 Layout Shifts by Breakpoint

| Section | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero text | 8vw display, 2-line | 6vw | 11vw, 2-line |
| Services grid | 4 columns | 2 columns | 1 column stacked |
| Work grid | Asymmetric masonry | 2-col | 1-col |
| Nav | Inline horizontal | Inline | Hamburger overlay |
| Sticky sidebar | Visible | Hidden | Hidden |
| Marquee | Full speed | Full speed | Slower speed |

### 8.3 Touch Interactions

- All hover effects have tap-equivalent: tap triggers the hover state for `300ms` then releases
- Cursor component is hidden on touch devices
- Magnetic elements disabled on mobile

***

## 9. Performance Standards

**Target Scores:** Lighthouse ≥ 90 on all metrics. 

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| FCP | < 1.8s |
| TTI | < 3.5s |

**Implementation strategies:**
- All images: `next/image` with `priority` on above-fold, `loading="lazy"` below
- Fonts: `next/font` with `display: swap`, subset to Latin only
- GSAP and Three.js: dynamic import with `{ ssr: false }` — never server-rendered
- No layout shift from custom fonts: reserve space with `size-adjust` CSS property
- SVG animations: `will-change: transform` only on actively animating elements, removed after completion

***

## 10. Accessibility (WCAG 2.1 AA)

- All interactive elements keyboard-navigable with visible `:focus-visible` ring
- Color contrast: all text/background combinations ≥ 4.5:1
- Custom cursor does not replace focus indicators
- `prefers-reduced-motion`: all GSAP animations wrapped in a motion check — reduced-motion users get instant `opacity` transitions only
- `aria-label` on all icon-only buttons
- Skip navigation link as first DOM element
- Semantic HTML throughout: `<main>`, `<nav>`, `<article>`, `<section>`, `<aside>` used correctly

```ts
// lib/hooks/useReducedMotion.ts — concept
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
```

***

## 11. CMS Architecture (Payload)

Collections to define in Payload CMS: 

| Collection | Fields |
|---|---|
| `projects` | title, slug, category, thumbnail, full description, tags, featured boolean, client |
| `stories` | title, slug, hero image, content (rich text), client, metrics, date |
| `services` | name, description, deliverables, SVG icon path |
| `team` | name, role, bio, photo, social links |
| `blog` | title, slug, author (relation), content, tags, publish date |
| `testimonials` | quote, author name, role, company |
| `roles` (Careers) | title, type, location, description, active boolean |

All content types have `draft/publish` workflow. Media handled by Payload's built-in media collection with Vercel Blob or Cloudflare R2 as storage adapter.

***

## 12. SEO Architecture

- `generateMetadata()` per page using Next.js App Router conventions
- Dynamic OG image generation via `@vercel/og` for projects and blog posts
- `sitemap.ts` and `robots.ts` at `app/` root — dynamically generated from CMS data
- Structured data: `Organization`, `WebSite`, `Article`, and `BreadcrumbList` JSON-LD per page
- Canonical URLs on all pages

***

## 13. Development Conventions

### Code Quality
- ESLint (strict) + Prettier enforced via Husky pre-commit hook
- TypeScript strict mode — no `any`, all props typed
- Component naming: PascalCase for components, kebab-case for files
- Co-locate component styles in CSS Modules where Tailwind becomes unreadable

### Git Workflow
- `main` → production (Vercel auto-deploy)
- `develop` → staging preview
- Feature branches: `feat/homepage-hero`, `feat/services-section`
- Commit convention: Conventional Commits (`feat:`, `fix:`, `chore:`)

### Environment Variables
```
NEXT_PUBLIC_SITE_URL=
PAYLOAD_SECRET=
DATABASE_URI=
BLOB_READ_WRITE_TOKEN=
```

***

## 14. Launch Checklist

- [ ] All pages render correctly across Chrome, Firefox, Safari, Edge
- [ ] Mobile breakpoints tested on iOS Safari and Android Chrome
- [ ] Lighthouse scores ≥ 90 on all pages
- [ ] All custom SVG animations verified at `prefers-reduced-motion: reduce`
- [ ] Cursor component hidden on `pointer: coarse` devices
- [ ] All forms submit + error state verified
- [ ] Sitemap and robots.txt accessible
- [ ] OG images generated for all dynamic routes
- [ ] Lenis scroll and GSAP ScrollTrigger confirmed working together without conflicts
- [ ] Page transition animation tested on all route changes

***

This documentation is intentionally architecture-level and directive without being prescriptive at the code level — it defines the **what** and the **why** precisely enough to give developers a clear brief while leaving room for creative interpretation in the **how**. The design DNA pulled from Raycast's precision, Linear's editorial restraint, Osmo Supply's motion richness, and Payload's developer-first ethos gives Echo11 a strong, defensible visual identity that functions as its own best portfolio piece.