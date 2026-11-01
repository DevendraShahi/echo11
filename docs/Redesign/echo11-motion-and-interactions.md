# Echo11 motion and interactions

**Status:** Proposed technical specification; audit actual Echo11 implementation before adoption  
**Version:** 0.1 · **Date:** 2026-10-01  
**Companions:** `echo11-frontend-foundation.md` and `echo11-page-anatomy.md` (delivered separately).  
**Purpose:** Define how motion, input, scroll, route changes, video, and graphics work as a coherent, accessible system. This is not a copy of PRODUX's effects or a claim about its source code.

## 1. Provenance and constraints

**KNOWN CONTEXT:** Echo11 has used React/Next.js, Framer Motion, and Three.js; older planning mentions GSAP. Verify the current package manifest and app before implementing. Its current design is largely liked by its owner; preserve functioning interactions.  
**REFERENCE:** Third-party detection reports Next.js, React, GSAP, Three.js, and Lenis for PRODUX, while a credited developer discusses a WebGL carousel entry and easing study. These findings motivate skills to investigate but do not establish specific animation code, shader formulas, scroll timings, or Echo11 requirements.  
**OPEN:** Actual Echo11 dependencies; motion patterns; current menu implementation; client-side navigation behavior; WebGL usage; performance baseline; whether the public pages use smooth scrolling.

**Non-negotiable principle:** Meaning and navigation exist in semantic HTML before motion. Effects may explain structure, establish continuity, or create a purposeful demo; they cannot be required to discover or read content.

## 2. Motion classification

| Tier | Purpose | Typical implementation | Duration guide, candidate only | Failure mode |
|---|---|---|---|---|
| 0: Native | Focus, hover, pressed, expanded, validation | CSS, HTML, existing accessible primitive | Immediate to ~250 ms | Controls feel laggy or status is color-only |
| 1: Component | Local panels, media captions, one-time reveals | CSS or existing React motion library | ~200–600 ms | Everything enters in the same generic stagger |
| 2: Narrative | Section handoffs, process progression, project continuity | Timeline library if justified | Content-dependent; do not set universal duration | Scroll hostage, unreadable intermediate states |
| 3: Immersive | A controlled WebGL scene, experimental Lab demo, optional visual entry | Three.js/canvas isolated from content DOM | Governed by interaction and device, not a universal timer | Heavy asset loading, accessibility loss, GPU churn |

The ranges are **PROPOSED evaluation ranges**, not measured PRODUX timings or hard limits. Optical timing matters more than a number: the next state must become usable when the user expects it.

### Motion budget by route
- **Home:** One signature motion moment; selected work and process can have subordinate, comprehensible motion.
- **Work:** Navigability and scan speed dominate; project preview optional.
- **Case study:** Calm reading interspersed with one or two genuinely explanatory interactive artifacts.
- **Services/Process:** Progressive information reveal may aid structure; never hide core scope behind motion.
- **About:** Editorial pacing without constant transformation.
- **Lab:** More expressive experiments permitted, accompanied by explanation, safe fallback, and clear status.
- **Insights/legal/contact:** Prioritize readability and input; local feedback only.

## 3. Ownership and lifecycle

### 3.1 One owner per animated property
For each element, document which layer owns `transform`, `opacity`, `clip-path`, and scroll progress. Do not animate the same `transform` concurrently in CSS, Framer Motion, GSAP, and imperative WebGL projection. Use nested wrappers if two different transformations must coexist: e.g. outer wrapper owns scroll translation and inner image owns hover scale.

### 3.2 React/Next.js boundary
- Keep semantic content, route metadata, case-study descriptions, and static images in server-rendered composition where practical.
- Put timelines, pointer listeners, WebGL, playback controllers, and imperative scroll coordination in narrowly scoped client components.
- On mount initialize only when target DOM exists; on unmount revert timelines and inline styles, remove event/resize/scroll listeners, cancel `requestAnimationFrame`, dispose WebGL geometries/materials/textures/render targets, and restore altered body styles.
- In development, test mount/unmount and route changes for duplicated listeners or canvases. React development lifecycle may expose incorrect setup/cleanup.
- Lazy-load noncritical scene code and assets; poster and HTML content must work while loading or on failure.

### 3.3 Interaction state machine
Every nontrivial interaction lists states and transitions explicitly. Example menu:

```text
closed → opening → open → closing → closed
                 ↘ navigating → route ready
```

Input while opening or closing must have defined behavior. Visibility state, `aria-expanded`, focus location, scroll lock, and visual state must agree. A timeline is an implementation detail, not the state model.

## 4. Global interaction contracts

### 4.1 Navigation menu
**Goal:** Expose routes clearly on all inputs.  
**Trigger:** Button activation; not hover alone.  
**Elements:** Real links and button; menu heading/label; skip link; focus-visible states.  
**Expanded state:** `aria-expanded` reflects actual state; focus enters the menu when appropriate; focus is contained only if the menu functions as a modal overlay; background interaction follows that modal/nonmodal choice.  
**Exit:** Close button, Escape, route activation; return focus appropriately. Handle resize across navigation modes.  
**Motion:** A single opening/closing choreography may coordinate background and link groups. Avoid delaying menu usability until every text character finishes animating.  
**Reduced motion:** Immediately show/hide usable content with little or no spatial transition.  
**Failure checks:** Multiple taps, route change mid-close, browser back, virtual keyboard, and scroll restoration.

### 4.2 Links and controls
Hover is supplemental; focus and pressed states convey equivalent affordance. Avoid custom cursors as the only sign of clickability. Control text stays legible throughout transitions. Links are not wrapped around other interactive controls. Touch targets and focus indicators are checked on actual devices.

### 4.3 Route transitions
**Default:** Immediate navigation with functional route state.  
**Optional enhancement:** Short visual continuity between an activated work preview and case-study hero. Coordinate page readiness and media loading; never hold the old route indefinitely while waiting for assets. Respect browser back/forward, scroll restoration, focus on new route, deep-link anchors, and prefers-reduced-motion.  
**Implementation gate:** Only adopt a shared-element-like effect after static destination navigation works and after testing interrupted navigation and mismatched image aspect ratios.

### 4.4 Forms
Field focus, validation, submission, success, and failure are explicit states. Do not move or mask input labels while people type. No theatrical transition between submit and confirmation; announce status accessibly. Preserve entered values on recoverable error. Avoid continuously animated borders that obscure focus/error states.

## 5. Section-level motion contracts

The following are **candidate behaviors for Echo11**, not descriptions of the exact deployed PRODUX animation. Each can be omitted if it does not improve the real section.

### H1. Homepage opening and hero
**Purpose:** Establish narrative emphasis without withholding H1, CTA, and supporting explanation.  
**Content baseline:** Immediately rendered DOM heading, actions, and media poster.  
**Potential enhancement:** A brief sequence of a brand motif or media composition resolving into a settled state; visual timeline can coordinate opacity/translation of explanatory text.  
**Timing relations:** The H1 may lead or follow an accent visual, but text must become readable promptly. Avoid an unskippable intro.  
**Input:** Optional user-controlled reel with explicit play/pause and audio controls if relevant.  
**Responsive:** Design a separate narrow-viewport composition; do not simply scale down a desktop WebGL camera.  
**Reduced motion:** Static hero with complete statement and primary action.  
**Performance:** Determine whether scene is necessary above fold; reserve media dimensions and do not block first useful paint on shaders or textures.

### H2. Credibility and service labels
**Purpose:** Mark change of topic and associate small metadata with related content.  
**Behavior:** Simple opacity or restrained translation once in view; no continuous marquee required.  
**Trigger:** Viewport intersection or section entry.  
**Risk:** Tiny labels with low contrast, or repeated movement competing with evidence.

### H3. Selected work panels
**Purpose:** Clarify which project is active and preserve link continuity.  
**Behavior candidates:** Hover image shift, crossfade between project visuals, caption entry, or an opt-in WebGL visual layer. Choose the simplest effect that satisfies the actual artifact.  
**Interaction model:** Link remains semantic and clickable; hover state has equivalent focus state; touch has visible destination. Scrolling should not unexpectedly replace the project a user is reading.  
**Media loading:** Preload only adjacent/likely assets where justified. Unavailable media leaves title, summary, and link intact.  
**Reduced motion:** Instant image selection or gentle crossfade; no distortion.  
**Performance:** Bound decoded textures, image dimensions, GPU memory, and video playback; do not run all project previews at once.

### H4. Process spine
**Purpose:** Connect stages and deliverables, not merely add a decorative progress bar.  
**Behavior:** Scroll position may fill a visual connector; clicking/focusing a stage reveals its detail. Connector is `aria-hidden` because actual stage order is already in the document.  
**Trigger:** Visible section progress or explicit stage selection.  
**Responsive:** May become a simple vertical ordered list on narrow screens.  
**Reduced motion:** Fully visible ordered steps with selection still working.

### H5. Final contact CTA
**Purpose:** Close narrative and clarify action.  
**Behavior:** Minimal appearance, perhaps opacity and short translation; no canvas, mandatory cursor tracking, or prolonged reveal.  
**Reduced motion:** All content present immediately.

### W1. Work index interactions
**Goal:** Fast browsing and meaningful selection.  
**Behavior:** Optional preview update on hover/focus; filtering transitions should preserve keyboard focus and announce result count if results change.  
**State:** `all`, category filter, no results, pending media, active preview.  
**Do not:** Auto-cycle selection while someone reads, or animate item order in ways that imply a different DOM order than the accessible reading order.

### C1. Case-study media and diagrams
**Goal:** Explain decisions and demonstrate actual work.  
**Behavior:** Image sequence, controlled before/after, or diagram node selection may be appropriate. Each needs descriptive caption and a noninteractive summary.  
**State:** Loading, ready, error, poster/fallback, selected comparison state.  
**Risk:** Scroll-pinned imagery can make explanation hard to read or trap mobile users. Do not make pinning the default case-study template.

### L1. Lab demos
**Goal:** Make a technical experiment observable and interpretable.  
**Behavior:** Explicit activate/pause/reset where appropriate; instrument frame rate and loading.  
**Accessibility:** Static demonstration, explanatory text, controls outside canvas, keyboard alternatives when feasible.  
**Safety:** Communicate flashing/motion risks if relevant; provide reduced-motion and WebGL-unavailable paths.  
**Lifecycle:** Dispose resources on leaving route and after tab visibility changes.

## 6. Typography animation details

**Baseline:** Text is real selectable DOM text with meaningful heading level and stable reading order. A visual clone used for masks should be hidden from assistive technologies. Beware libraries that split text into spans: visual splitting must not duplicate speech, corrupt selection, break localization, or leave orphaned inline styles after resize.

### Methods and appropriate use
| Method | Good for | Technical attention |
|---|---|---|
| Opacity/short translation | Section title entry | Do not start with essential content invisible for long; avoid hidden-but-focusable text |
| Line mask | One display statement | Recalculate on font load, viewport changes, localization; never clip at text zoom |
| Word stagger | Short expressive copy | Preserve reading order and cap total sequence time |
| Per-character effect | Short logo or art-directed accent | Rarely suitable for paragraphs; avoid excessive DOM and auditory duplication |
| Scale/variable-font axis | A deliberate display moment | Check glyph quality, reflow, CPU cost, and font licensing |
| Scroll-linked scrub | Illustrative title/media relationship | Avoid making text dwell in unreadable mid-states |

**Evaluation:** Observe line breaks on 320–400 px screens, at 200% zoom, with user-adjusted text spacing, and in any target translation. Prefer explicit static fallbacks over trying to resize a complex mask at every scroll tick.

## 7. Scroll system

### 7.1 Native first
Use native document scrolling unless a defined design/engineering requirement is unmet. If a smooth-scroll layer is adopted, identify which subsystem owns scroll position, how anchors and focus navigation work, how browser back/forward restores position, and how ScrollTrigger or equivalent gets consistent updates. Do not add a smooth-scroll package just to imitate a reference site's perceived feel.

### 7.2 Trigger taxonomy
- **One-time intersection:** Simple reveal of a section when visible; Intersection Observer may be enough.
- **Threshold-based state:** Select active chapter or nav item; use intersection thresholds or carefully bounded scroll observation.
- **Continuous progress:** Link a visual parameter to actual scroll progress; use a dedicated timeline only when necessary.
- **Pinned storytelling:** Reserve for content whose explanatory relationship depends on a stationary frame; verify mobile reading and exit behavior.

### 7.3 Geometry and lifecycle
Images, fonts, expandable content, and route data can change geometry after animation initialization. Refresh measurements after layout stabilizes, without causing flashing or infinite reinitialization. On breakpoint changes tear down and recreate only the affected scroll interactions. Avoid accumulating listeners across route transitions.

### 7.4 Input and accessibility
Wheel, trackpad, touch, keyboard scroll, Page Up/Down, scrollbar dragging, anchor navigation, and focus movement must converge on a sensible content state. No section may demand a precise scroll velocity to become readable. Reduced-motion state must not depend on scroll animation to reveal content.

## 8. WebGL, shaders, and media

### 8.1 Render only what benefits
HTML/CSS are responsible for content, labels, buttons, headings, and focus. Canvas may render project media transformations, 3D specimens, or a decorative scene. Keep interactive overlays outside the canvas unless a fully accessible interaction model exists.

### 8.2 Conceptual pipeline for an image transition
1. Obtain approved source media at known dimensions and crop.
2. Decode textures; keep a DOM poster visible until ready.
3. Render textured planes or equivalent geometry through the scene camera.
4. Map selection/scroll/pointer state to a bounded transition parameter.
5. Animate that parameter via one timeline owner; shader samples/deforms imagery only if a genuine visual need exists.
6. Pause inactive scenes and dispose textures/materials/geometries on exit.

This describes a learnable technique, not PRODUX's recovered source. A credited developer discusses a WebGL carousel entry, and a Codrops tutorial describes a related Three.js/React Three Fiber/GSAP approach; the exact shader/geometry in PRODUX remains unknown.

### 8.3 Performance and failure paths
- Compare static DOM/CSS and WebGL versions before deciding the canvas is justified.
- Cap pixel ratio where needed; choose texture formats/sizes based on device tests.
- Avoid decoding every full-resolution project visual on initial load.
- Stop `requestAnimationFrame` when offscreen or hidden unless a transition requires completion.
- Recover from context loss if possible; fall back to DOM poster if not.
- Avoid effects that produce rapid flashing, aggressive distortion, or pointer-driven motion with no user opt-out.

## 9. Motion tokens and control plane

Foundation candidate tokens `--duration-fast`, `--duration-interface`, `--duration-section`, and `--ease-emphasis` are **starting points**. After auditing current code, define a small vocabulary based on *purpose*: `feedback`, `reveal`, `handoff`, `settle`. Each named effect may have its own authored timing; a single easing curve everywhere makes the site feel mechanical.

Example implementation concept; reconcile with actual code and accessibility strategy:

```css
[data-motion="reduce"] *,
[data-motion="reduce"] *::before,
[data-motion="reduce"] *::after {
  scroll-behavior: auto;
}

@media (prefers-reduced-motion: reduce) {
  :root { scroll-behavior: auto; }
  .decorative-motion { animation: none; transition: none; }
}
```

Do **not** blindly remove all animations with a global `* { animation-duration: 0.01ms }` rule if it hides necessary state transitions or breaks third-party widgets. Instead, design explicit static/reduced variants for each effect. If a site-level toggle is offered, it should coexist with system preference, have a clear precedence policy, persist appropriately, and be testable.

### Effect ownership registry
| Effect ID | Route/section | Visual owner | State owner | Fallback | Review |
|---|---|---|---|---|---|
| `hero-entry` | Home hero | OPEN | OPEN | Static hero | Not approved |
| `project-preview` | Home/Work | OPEN | OPEN | Static linked image | Not approved |
| `project-handoff` | Work → case study | OPEN | Router + interaction state | Direct route | Not approved |
| `process-progress` | Home/Process | OPEN | Scroll/selection | Ordered list | Not approved |
| `lab-demo-*` | Lab | Per experiment | Explicit demo controller | Poster + explanation | Not approved |

Record exact files and tests here only after repository audit.

## 10. Verification plan

### 10.1 Instrumentation
Measure actual Core Web Vitals, long tasks, frame-time stability, and memory on representative devices. Record timings for first readable heading, first usable navigation, image/poster visibility, canvas ready, and route transition completion. Compare full-motion, reduced-motion, and WebGL-unavailable states.

### 10.2 Interaction matrix
| Scenario | Expected behavior |
|---|---|
| First visit on slow network | Headline, navigation, and CTA work before media/scene |
| Keyboard opens menu and activates route | Focus visible and restored appropriately; navigation reliable |
| Touch swipe/scroll across Work | Scroll remains native and project links accessible |
| Route changes mid-animation | No stuck overlay, ghost canvas, or scroll lock |
| Reduced-motion preference | Same content and controls, minimal unnecessary movement |
| 200% text zoom | No clipped animated heading or unreachable button |
| Tab hidden then restored | Loops pause/resume safely; no duplicated renderers |
| WebGL disabled/context lost | Poster or conventional project media remains usable |
| Form submission error | Values retained and error announced |
| Browser back to scrolled page | Sensible scroll restoration and focus behavior |

### 10.3 Review rubric
For every proposed animation, answer: (1) What does it explain? (2) What is its state owner? (3) What is the static fallback? (4) Is it accessible through every relevant input? (5) Does it remain smooth on target hardware? (6) Is it worth the bytes and maintenance? If any answer is weak, simplify or remove it.

## 11. Skill and resource map

| Skill to develop | Resource | Practical observation task |
|---|---|---|
| Timeline orchestration and React cleanup | https://gsap.com/resources/React/ | Mount/unmount a scene repeatedly and ensure no persistent inline state/listeners |
| Scroll choreography and responsive triggers | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | Compare mobile, desktop, and reduced-motion progress mappings |
| Viewport entry without continuous scroll | https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API | Implement and compare a one-time reveal to a scroll-scrub timeline |
| Text animation and browser performance | https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance | Profile transform/opacity against layout-triggering properties |
| Shader materials | https://threejs.org/docs/pages/ShaderMaterial.html | Separate UI state, uniform changes, and GPU visual output |
| WebGL carousel as related technique | https://tympanus.net/codrops/2023/04/27/building-a-webgl-carousel-with-react-three-fiber-and-gsap/ | Study textured planes, interactions, and transitions; do not assume it is PRODUX source |
| Reduced motion | https://www.w3.org/WAI/WCAG21/Techniques/css/C39 | Verify information persists after spatial motion is removed |
| Smooth-scroll evaluation | https://lenis.darkroom.engineering/ | Test anchors, focus, back navigation, touch, and forms before adoption |

## 12. Decisions needed before implementation

- [ ] Audit Echo11's current animation dependencies, routes, assets, CSS ownership, and menu state.
- [ ] Agree which Home interaction, if any, earns tier-3 rendering.
- [ ] Select exactly one primary timeline system for any section requiring authored sequences.
- [ ] Decide whether native scroll satisfies the experience before trialing a smooth-scroll layer.
- [ ] Identify target devices and actual media budgets from baseline measurements.
- [ ] Choose which Lab experiments can be published with a demo, fallback, and maintenance plan.
- [ ] Approve a motion preference policy, including override and persistence if a toggle is shipped.
- [ ] Convert each approved candidate effect to an effect contract with code owner and acceptance tests.

**Approval rule:** Nothing here authorizes replacing existing Echo11 interactions, copying PRODUX animations, or installing new dependencies without a demonstrated reason and a verified fallback.
