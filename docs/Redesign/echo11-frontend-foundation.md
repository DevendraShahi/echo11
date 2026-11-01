# Echo11 frontend foundation

**Status:** Draft for repository audit · **Version:** 0.1 · **Date:** 2026-10-01  
**Audience:** Frontend engineers, designers, and coding agents.  
**Scope:** Public-facing Echo11 website and its shared presentation system. This is not a specification for every internal SaaS screen.

> This document defines conventions and candidate defaults, not a claim that the existing site already implements them. Do not overwrite a working Echo11 design from this draft. Inspect the current repository and deployed pages before promoting any candidate value to an approved token.

## 1. Source-of-truth policy

### 1.1 Evidence labels
- **VERIFIED:** Confirmed by repository file, running UI, or direct measurement; record file path, commit, viewport, and date.
- **KNOWN CONTEXT:** Previously stated by the owner but not confirmed against the current repository.
- **PROPOSED:** An engineering or design-system recommendation awaiting review.
- **REFERENCE:** A property of a studied website or learning resource; never silently treat as Echo11 code or a requirement.
- **OPEN:** Must be resolved by audit or product decision.

Repository code and the current running interface outrank old design documents; the owner's current direction outranks past drafts. Record intentional exceptions rather than forcing every composition into generic components. No CSS value attributed to PRODUX is measured here. A third-party stack report is not proof of its component implementation.

### 1.2 Before editing the codebase
- [ ] Locate the actual repository, default branch, `AGENTS.md`, package manifest, routes, styles, fonts, and asset sources.
- [ ] Capture screenshots of current Home, Work, Services, About, Lab, Contact, and relevant responsive states.
- [ ] Inventory present tokens and compare their computed values with documentation.
- [ ] Record active styling technique and animation dependencies; retain good existing UI.
- [ ] Run baseline build, lint, tests, accessibility checks, and performance captures.
- [ ] Confirm brand positioning, services, approved copy, rights to media, and published case studies.

**Audit record format:** `Decision | evidence URL or repository path | observed value | owner | date | status`. Missing information remains OPEN, not guessed.

## 2. Product and visual constraints

**KNOWN CONTEXT:** Echo11 is a web/agency and SaaS-oriented platform concerned with proposals, client delivery, deployments, and ongoing maintenance. Its owner likes much of the current design, while `/lab` remains an area for development. Past preferences include a dark-first technical aesthetic, sharp/rectangular controls, and considered motion. Verify present product messaging and UI before changing it.

**PROPOSED principles:**
1. Content and actions work before animation or canvas loads.
2. Every page has a clear primary action and semantic content order.
3. High-impact motion is concentrated in selected narrative moments; forms and reading surfaces stay calm.
4. Editorial variation occurs inside a stable typographic, spacing, and alignment system.
5. A light mode, alternate language, or reduced-motion mode may not depend on a specific background image, line break, or shader.
6. Performance, accessibility, and maintainability are part of visual quality.

**Non-goals:** Recreating PRODUX, mandating its fonts, mandating Lenis/Three.js site-wide, swapping styling frameworks without reason, or fabricating case-study outcomes.

## 3. Frontend architecture

### 3.1 Application boundaries
**KNOWN CONTEXT, verify:** The Echo11 project has used Next.js, TypeScript, shadcn-style UI, Framer Motion, and Three.js. GSAP has been considered in design discussions; do not assume it is currently installed. Styling conventions, framework versions, and Tailwind use are OPEN until the repository is checked.

**PROPOSED boundary:** Server-rendered layouts and content by default; small client islands for menu state, forms, pointer input, timeline animation, and WebGL. Avoid making the entire marketing route a client component merely because one section animates. Keep content data and route metadata outside animation components.

Suggested responsibilities, **not a mandate to rename existing folders**:

```text
app/                     route composition, layouts, metadata, error/loading states
components/ui/           accessible primitives and stable controls
components/layout/       header, footer, page container, section wrapper
components/editorial/    work feature, project chapter, reading block, media frame
components/motion/       reveal, transition shell, scroll scene, canvas boundary
content/                 typed project/service/article data or CMS adapters
styles/                  tokens, reset, typography, layout, utilities
lib/                     formatting, content helpers, feature detection
public/                  optimized media with rights/source records
```

A component is shared when its semantic purpose and behavior recur, not because two sections look vaguely alike. Separate content props from effects props. Avoid a single component with dozens of boolean flags that encode entire page layouts.

### 3.2 State and data
- URL owns navigable state: routes, filters where useful, anchors. Accessible DOM owns readable content.
- Local component state owns transient UI: menu open, media playback, form progress.
- Motion state is derived from interaction/scroll state; never be the only source of truth for content availability.
- Reusable content types should include `id`, `slug`, `title`, `summary`, `media`, `alt`, `status`, and optional verified outcomes. Do not invent testimonials or numeric results.
- Cases needing drafts, complex publishing, or multiple editors can justify a CMS later. Local typed content is sufficient until workflow demands more.

### 3.3 Asset strategy
- Record rights and source for fonts, photographs, video, and 3D files.
- Define responsive image crops/art direction per slot; reserve aspect ratio to prevent layout shifts.
- Treat video/reel as optional enhancement: poster image, captions/transcript where relevant, explicit playback control, no essential information exclusively in video.
- Put heavy 3D assets behind dynamic loading and a meaningful poster/fallback; test touch, low-power devices, and context loss.

## 4. CSS token architecture

Use **primitive** tokens for palette and scale; **semantic** tokens for usage. Component styles consume semantic tokens. Never use a raw hex or magic section gap repeatedly when the value conveys a system-level meaning. A special editorial exception may be local and documented.

### 4.1 Token classes
| Class | Examples | Meaning |
|---|---|---|
| Primitive color | `--palette-ink-900`, `--palette-blue-500` | Raw color, not a UI role. |
| Semantic color | `--color-surface`, `--color-text-primary`, `--color-border`, `--color-focus` | Theme-aware functional role. |
| Typography | `--font-display`, `--type-display-size`, `--type-body-leading` | Font families and role-based metrics. |
| Spacing | `--space-1`…`--space-8`, `--space-section` | Base scale and context-specific aliases. |
| Layout | `--page-gutter`, `--width-reading`, `--width-content`, `--grid-gap` | Width and alignment contracts. |
| Motion | `--duration-fast`, `--duration-section`, `--ease-emphasis` | Shared motion language. |
| Shape/layer | `--radius-control`, `--border-width`, `--z-nav`, `--z-modal` | Geometry and stacking order. |

### 4.2 Candidate CSS contract
The following is **PROPOSED sample CSS**, not measured existing values. Reconcile names and values with current tokens before adopting it. The `clamp()` bounds are examples to evaluate at real viewport widths and with approved fonts.

```css
:root {
  --palette-ink-900: #0d1b2a; /* historical brand context; verify */
  --palette-ink-800: #1b263b; /* historical surface context; verify */
  --palette-blue-500: #3a86ff; /* historical accent context; verify */

  --color-surface: var(--palette-ink-900);
  --color-surface-raised: var(--palette-ink-800);
  --color-text-primary: #f4f5f6; /* candidate; contrast test */
  --color-text-secondary: #b8c0c9; /* candidate; contrast test */
  --color-border: #475568; /* candidate; contrast test */
  --color-accent: var(--palette-blue-500);
  --color-focus: var(--palette-blue-500);

  --font-display: system-ui, sans-serif; /* replace only with licensed/verified font */
  --font-body: system-ui, sans-serif;
  --font-meta: ui-monospace, monospace;
  --type-display-size: clamp(3rem, 7vw, 7.5rem);
  --type-section-size: clamp(2.25rem, 4.5vw, 5rem);
  --type-lead-size: clamp(1.2rem, 1.7vw, 1.65rem);
  --type-body-size: 1rem;
  --type-body-leading: 1.55;

  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-section: clamp(4rem, 9vw, 10rem);
  --page-gutter: clamp(1rem, 3vw, 4rem);
  --grid-gap: clamp(1rem, 2vw, 2rem);
  --width-reading: 68ch;
  --width-content: 90rem;
  --radius-control: 0;
  --duration-fast: 160ms;
  --duration-interface: 280ms;
  --duration-section: 700ms;
  --ease-emphasis: cubic-bezier(.22, 1, .36, 1);
}

[data-theme="light"] {
  --color-surface: #f6f6f3;
  --color-surface-raised: #ffffff;
  --color-text-primary: #17212b;
  --color-text-secondary: #485563;
  --color-border: #8b939b;
  --color-focus: #175fd1;
}
```

Do not publish these candidate colors without testing contrast on actual surfaces and media. Existing tokens may have different semantics; map rather than overwrite. Use a distinct focus treatment in both themes. Semantic success/error/warning colors need separate tokens and contrast validation; never reuse the brand accent for every status.

### 4.3 Token governance
- Token names state purpose, not appearance (`--color-text-secondary`, not `--gray-400` in components).
- Component aliases are acceptable when a recurring component needs a distinct role (`--project-caption-color`).
- Change a shared token only after checking all consumers in both themes and narrow/wide layouts.
- Do not put local art-direction colors in global primitives unless they recur across pages.
- Record approved values and usage examples in this document; generated token files, if adopted, should have one authoritative source.

## 5. Typography standards

### 5.1 Roles, not arbitrary heading sizes
| Role | Purpose | Candidate range | Notes |
|---|---|---|---|
| Display | One dominant page statement | `clamp(3rem, 7vw, 7.5rem)` | Optical review required; roughly 0.95–1.1 line-height for suitable display face. |
| Section | Major narrative shift | `clamp(2.25rem, 4.5vw, 5rem)` | Do not repeat at full display emphasis everywhere. |
| Project | Project identity | `clamp(2rem, 3.8vw, 4.5rem)` | Keep names readable over variable media. |
| Lead | Framing explanation | `clamp(1.2rem, 1.7vw, 1.65rem)` | Constrain line measure. |
| Body | Case study and service detail | `1–1.125rem` | Approx. 1.45–1.65 line-height, adjusted for face and measure. |
| Metadata | Dates, disciplines, indices | `0.75–0.875rem` | Never encode information by faint color alone. |

The ranges are exploratory **PROPOSED** values, not site measurements. Use semantic HTML headings in logical order even if visual sizes differ. Set reading columns by `ch` measure and inspect actual glyphs, translations, zoom, and long words. Avoid forcing headlines into fixed-height clipping containers that break under increased spacing or localization.

### 5.2 Pairing and loading
- One display family, one practical reading family, optional mono for sparse metadata. A single family with varied weights may be better than adding a third download.
- Verify license and permitted web embedding for every purchased font. Reference-site fonts are not automatically available to Echo11.
- Load locally when permitted, with explicit fallbacks; inspect layout shift caused by font swap and metrics.
- Preserve real text beneath effects; if text is visually duplicated for masking, ensure assistive technology encounters it once.
- Establish line-break rules for brand statements per locale. Do not hardcode `<br>` simply to match one screenshot.

### 5.3 Animation of text
- Animate transform and opacity of wrappers where appropriate, not font-size every frame.
- Separate narrative reveal from reading content: paragraph text must become available promptly.
- Document trigger, duration, easing, stagger, replay, and reduced-motion behavior for each effect.
- Test 200% zoom and user-adjusted text spacing to catch clipped words and inaccessible height constraints.

## 6. Spacing and responsive layout

### 6.1 Rhythm hierarchy
1. **Inline:** icon-to-label and adjacent metadata; smallest spaces.
2. **Component:** title-to-description, image-to-caption, label-to-field.
3. **Group:** between service items or project entries.
4. **Section:** between narrative chapters; uses `--space-section` as a default, not a mandate.
5. **Page:** hero breathing room, section transitions, footer separation.

A child should generally sit closer to the content it explains than to the next group. Avoid giving all repeated elements identical margins regardless of meaning. Remember *temporal spacing*: staggered entrances and pauses affect perceived density just as CSS gaps do.

### 6.2 Grid rules
- Start with a shared page gutter and content width; align headings, media edges, indexes, and captions where appropriate.
- Use CSS Grid for page-region composition; Flexbox for single-axis control groups; intrinsic patterns for content-driven components. Use `subgrid` when nested alignment must inherit parent tracks.
- Set prose measure independently of media width. A full-width image does not imply full-width body text.
- Allow intentional bleed and asymmetry only when outer edges and reading order remain coherent.
- Use container queries for components whose layout depends on available slot width, not viewport labels.
- Define narrow-screen order in the DOM. Never use CSS order to create a visual sequence that conflicts with keyboard/reading sequence.
- Re-evaluate headline wrapping, captions, menu, motion, and touch affordances at narrow widths; do not simply scale desktop values down.

### 6.3 Layout primitives and exceptions
Useful patterns to evaluate: Stack for vertical content rhythm, Cluster for navigation/tag wrapping, Sidebar for metadata/content relationships, Switcher for panels that collapse when space runs out, Cover for a hero with controlled alignment, Frame for media aspect ratios. These are layout concepts, not dependencies to install blindly. Project-specific compositions may override the defaults if documented and tested.

## 7. Motion and rendering boundary

This document sets **standards**, not page-specific choreography; detailed scenes belong in `echo11-motion-and-interactions.md`.

- CSS transitions for local feedback and uncomplicated state changes.
- Existing React motion library, if verified, for component entrances and layout transitions.
- GSAP only where explicit timeline or scroll choreography justifies it; prevent duplicate ownership of the same property by multiple animation systems.
- Three.js/canvas only for a clear visual function with fallback and cleanup. Do not render ordinary headings or basic navigation in WebGL.
- Lenis or any smooth-scroll library is optional, not a quality requirement. Validate anchors, forms, touch, back navigation, and scroll restoration before adoption.
- Unmount must remove listeners, cancel animation frames, dispose WebGL resources, and revert timeline-created styles.
- Treat reduced motion as an alternate designed state: retain information and navigation while removing unnecessary movement.

**Motion contract template:** `name | purpose | section | trigger | DOM/canvas owner | initial/final states | duration/ease | touch behavior | reduced-motion state | cleanup | performance risk`.

## 8. Accessibility, performance, and resilience

### 8.1 Accessibility acceptance
- Correct heading outline and landmarks; links/buttons reflect actual semantics.
- Keyboard-operable menu, galleries, carousels, forms, and close controls, with visible focus.
- Contrast checked on both themes and against real imagery, including hover/focus states.
- Form errors tied to inputs; submission progress and success announced appropriately.
- Essential meaning available without scroll effects, hover, animation, video, or WebGL.
- Respect `prefers-reduced-motion`; test text resizing, reflow, and increased text spacing.
- Test language expansion (including any planned Nepali content) with licensed glyph coverage before declaring multilingual readiness.

### 8.2 Performance acceptance
- Collect baseline Core Web Vitals on representative pages before setting numeric budgets.
- Prefer responsive image delivery, explicit dimensions, lazy below-fold media, and sensible hero prioritization.
- Code-split high-cost motion/canvas; keep reading pages and contact lightweight.
- Measure real-device scroll smoothness and long tasks with animation enabled; do not infer speed from desktop-only tests.
- Pause hidden media/render loops; honor reduced-motion and low-capability fallbacks.
- Avoid expensive continuously animated layout properties when transform/opacity or a dedicated render layer is appropriate.

### 8.3 Test matrix
| Dimension | Minimum scenarios |
|---|---|
| Viewports | Narrow phone, large phone, tablet, laptop, wide desktop; test awkward intermediate widths. |
| Input | Keyboard, mouse, touch, screen-reader reading order. |
| Preferences | Dark/light, reduced motion, increased zoom/text spacing. |
| Network | Slow connection, blocked media, failed API submission. |
| Routes | Direct link, reload, back/forward, deep link, no-JS baseline where feasible. |
| Media | Missing poster, delayed font, WebGL unavailable, landscape/portrait imagery. |

Automated tests support but do not replace visual, keyboard, and assistive-technology review. Use the project's verified test commands from `AGENTS.md` rather than copying commands from this draft.

## 9. Documentation and decision workflow

1. Audit present repository and deployed UI; mark VERIFIED with evidence.
2. Review candidate tokens against current design; approve or replace them. Never apply the sample CSS wholesale.
3. Implement foundation changes in small reviewable batches: fonts/colors → spacing/layout → components → motion.
4. Create `echo11-page-anatomy.md` using approved foundation roles; page docs specify exceptions without redefining tokens.
5. Create `echo11-motion-and-interactions.md` with effect contracts and fallbacks.
6. Keep `echo11-reference-research.md` separate: inspiration and technical evidence are not specifications.

### 9.1 Open decisions
- [ ] Confirm actual repository and branch; current repository search did not locate `echo11-web` under the expected public GitHub account. It may be private or named differently.
- [ ] Confirm current styling approach, active Next.js version, route structure, and installed motion libraries.
- [ ] Identify current approved brand palette and whether historical token values remain in use.
- [ ] Confirm actual font families, licensing, file locations, and language coverage.
- [ ] Measure existing gutter, widths, type sizes, and spacing before approving sample defaults.
- [ ] Decide which public pages are in scope versus internal SaaS screens.
- [ ] Identify source media, rights, verified project results, and content owner.
- [ ] Decide if smooth scroll or a WebGL scene improves a particular page enough to justify cost.

## 10. Research resources

These are learning sources, not proof of Echo11 or PRODUX source code:
- PRODUX pages: https://www.produx.design/ ; https://www.produx.design/work ; https://www.produx.design/studio ; https://www.produx.design/journal ; https://www.produx.design/lab
  - `/journal` and `/studio` were added to this list on 2026-10-02. `/journal` is confirmed live by the homepage markup; `/studio` is confirmed by the homepage navigation. Neither page was fetched for the evidence pass, so this list is a route inventory, not a set of content claims.
- PRODUX homepage evidence file (verbatim markup and stylesheet quotes, 2026-10-02): `evidence/produx-home-ssr-2026-10-02.md`
- Reported PRODUX technologies: https://save.design/analyze/produx-design
- Fluid type and space: https://utopia.fyi/ ; https://www.smashingmagazine.com/2021/04/designing-developing-fluid-type-space-scales/
- Intrinsic layout patterns: https://every-layout.dev/layouts/
- Grid/subgrid: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout ; https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid
- React animation lifecycle and scroll: https://gsap.com/resources/React/ ; https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Reduced motion and text spacing: https://www.w3.org/WAI/WCAG21/Techniques/css/C39 ; https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
- Next.js assets: https://nextjs.org/docs/app/getting-started/images ; https://nextjs.org/docs/app/getting-started/fonts

---
**Approval rule:** This is a working foundation. No candidate token, library, page component, or inferred reference-site detail becomes an Echo11 requirement until compared with the current code and approved for this project.
