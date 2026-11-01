# Echo11 — horizon art direction

Research and proposal, 10 October 2026. Application pages are unchanged. The companion prototype explores composition and motion; it is not a finished replacement site.

## Diagnosis from current source and Work preview

`PageWrapper` places a circular blurred glow above every inner marketing page. `studio-intro` reserves navbar + 38% of the circle diameter + ground gap. At desktop this approaches 488px before the first metadata row. The light has become an empty preface rather than part of a composition. `PageHero` then repeats metadata, pulse, large title, a drawn cyan line, lead/actions, and delayed fixture. Services, Process, About, Work and Make it yours inherit this sequence. Contact, case studies, Manifesto, Methodology and legal pages inherit the same geometric spacing even when they do not use PageHero. The cyan hero divider remains in PageHero despite the earlier request to remove the horizontal line.

The problem is hierarchy and composition before it is animation. A blur moving behind disconnected text cannot establish a story. Removing the gap alone would restore the former crowding. The hero needs page-specific content and a defined relationship to the light.

## Recommended concept: a signal becomes something real

Echo11 starts with a business intent; strategy gives it direction, design makes it visible, engineering carries it into the world. The horizon is the moment an idea begins to become visible. This is proposed creative interpretation, not an established brand claim.

Keep the original circular cyan atmosphere as a recognizable ingredient, but compose it locally. Light should reveal actual work, focus attention on a decision, or connect delivery stages. No horizontal ground line. No mandatory empty sky. No common page-wide cyan divider. No replacement fonts. No generic floating objects.

## Route inventory and compositions

| Route | Desktop composition and horizon role | Mobile composition | Motion story |
|---|---|---|---|
| `/` | Preserve the kinetic EchoField wordmark and original homepage sequence; its wave field is the source of the signal. | Keep visible readable wordmark and normal low-height fallback. | Existing glyph wave and intentional interaction, no second orb added. |
| `/work` | Short title upper left, explanatory copy upper right; large full-bright project plate immediately underneath. Cyan curve sits behind the lower edge of the plate, separate from text. Replace the duplicate statement inside StackSpread with direct project evidence. | Title, lead, one project preview, provenance and archive link. Light occupies the image zone; no horizontal carousel prerequisite. | Project revealed through a curved mask that resolves to the complete rectangle; curve recedes as work becomes visible. No image floating loop. |
| `/services` | Left title and offer; right existing licensed geometry, given its own space. A low cyan light underneath that geometry leads into the discipline index. Keep THE SERVICES article layouts and updated content. | Copy and CTA first, compact discipline index below. Decorative artwork can be omitted. | Geometry resolves once, then discipline labels become available in sequence; light settles. Preserve guarded SVG fallback. |
| `/process` | Headline and concise promise left; four-stage arc diagram right with visible deliverables below each stage. First stage article begins directly below the hero. | Compact title and lead followed by an ordered vertical journey. Arc becomes a small local diagram, not a giant background. | A signal travels Discover → Design → Build → Launch once; each checkpoint settles before the next. The sequence expresses progress, not random looping. |
| `/about` | Large type left, an original signal-source diagram right; a concise studio statement sits under the diagram. Three disciplines converge at one source. Actual work is the evidence below. | Title, studio statement, compact signal artwork, then proof. No invented team portraits or office imagery. | Three paths arrive at a common source, then one outward wave. This represents coordination across strategy, design and engineering. |
| `/make-it-yours` | Preserve the project-led showroom and selection logic. Title and lead are compact; active project imagery supplies the visual energy. Cyan aperture behind media responds to the selected direction. | Title, direction controls, preview, details and action. Selection does not move the page unexpectedly. | A controlled image-mask transition between actual directions; persistent selection and clear focus. No rotating spokes. |
| `/contact` | Short invitation left; usable brief/form right begins in the first screen. Small quiet glow beside the invitation. | Heading, helpful lead, first form fields immediately. | One brief light arrival then stillness. Never animate the input or require a cinematic scroll before typing. |
| `/work/[slug]` | Project title, provenance and scope; wide project media follows without an agency atmospheric preface. | Title, factual metadata, complete preview and case-study story. | Image reveal in the project's own visual language. Full-bright readable media; no badge overlays or constant distortion. |
| `/manifesto` | Type-led editorial opening with one quiet cyan aperture in a margin. Beliefs are the subject. | Compact title and prose, light at outer edge. | A single restrained text entrance, followed by static readable prose. |
| `/methodology` | Intro plus a clear visual system showing principles and their practical consequences. Distinguish it from the chronological Process route. | Title, lead, ordered principle/outcome rows. | Highlight the relationship between a principle and its outcome; no second delivery timeline or duplicated hero parallax. |
| `/privacy`, `/terms` | Compact document header, readable measure, date and navigation. No reserved horizon band. | Readable document immediately after header. | Static. Brand connection comes from type and color. |
| `/showcase` | Preserve the project-first immersive experience. Light can connect transitions, but actual projects stay dominant and accurately sized. | Respect the existing horizontal exploration mode with explicit navigation and useful project info. | Project transitions, not another agency hero. Assess separately from this review. |
| `/showcase/forge`, `/laltin`, `/pizzaslice` | Standalone project identities retain their own art direction. | Their own responsive layouts. | Their own brand motion; don't impose Echo11 cyan. |
| `/preview-invite`, not-found, `/lab/**`, `/client/**`, `/portal/**` | Utility and workspace surfaces: no marketing horizon. | Task-focused. | Functional feedback only. |

## Sizing and composition contract

- Shared primitives should supply Container, type tokens, metadata, actions and reduced-motion behavior. They should not impose one title/line/lead/fixture composition on every page.
- Desktop: start meaningful content around 140–180px from viewport top, including the fixed navbar. Target a headline, lead, primary action and meaningful visual in a 1280×800 opening view. Work can reveal its image progressively below the headline; Contact must expose form fields.
- Mobile: start meaningful content around 112–144px from viewport top. Use 24px gutters, 44–56px titles where appropriate, 16px readable body copy, and 44px minimum interactive targets. Keep 24–40px between distinct content groups. These are starting design targets, not universal fixed heights.
- Limit title width per copy instead of applying one 15-character limit everywhere. Use authored line breaks only where they hold at 320px.
- Give the arc and text separate visual zones. Text must remain readable without a black scrim over project imagery. A local 32–48px gap between the light edge and adjacent text is preferable to reserving an entire empty sky.
- No hero needs an artificial full-screen height. Low-height landscape layouts should flow naturally.

## Concrete motion specification

| Page | Sequence | Duration / extent | Mobile and reduced motion |
|---|---|---|---|
| Work | Visible title → project aperture opens → complete image → light withdraws | 0.8–1.1s reveal; optional first 180px scroll affects only the local light, not text | Short 0.55s reveal; static full rectangle for reduced motion |
| Services | Visible offer → geometry resolves → discipline sequence | 0.9s artwork; 0.12s stage spacing | No decorative artwork required; static labels for reduced motion |
| Process | Visible promise → signal visits four checkpoints | 1.4–1.8s total once | Same information vertical; static complete diagram under reduced motion |
| About | Three paths converge → one outward echo | 1.2–1.6s once | Compact diagram; static paths under reduced motion |
| Make it yours | Selected image changes with local aperture | 0.45–0.65s, interruption safe | Same controls and selection; instant swap under reduced motion |

Use the existing GSAP/ScrollTrigger/Lenis integration and Framer Motion ownership rules. GSAP owns a scene timeline; Framer does not also transform the same node. SVG is sufficient for paths and masks. Reserve Canvas2D/WebGL for a genuinely responsive signal field or image refraction with a tested static fallback. Do not introduce WebGL onto legal pages or form flows. Suspend render work offscreen and while the tab is hidden. Content must be readable if JavaScript fails.

## Research resources and proposed takeaways

These are inspiration candidates, not a ranked list or permission to copy assets. Studio descriptions were checked from primary sites; technical resources are official demos/docs. Visual execution still needs route-specific development and browser review.

| Resource | Relevant principle | Echo11 application |
|---|---|---|
| [Obys](https://obys.agency/about) | Its stated approach balances typography, grid, motion, clarity and usability. | Let page composition lead; avoid repetitive template ornaments. |
| [Lusion](https://lusion.co/) | Visual storytelling through design, motion, 3D and development. | Give the horizon a clear reveal/convergence story, rather than ambient movement alone. |
| [14islands](https://www.14islands.com/) | Connects business goals and user needs through design and technology. | Keep client purpose, useful content and routes visible within the spectacle. |
| [onformative](https://onformative.com/) | Combines art, design and technology in creative exploration. | Explore original signal behavior instead of another decorative object library. |
| [Active Theory](https://v5.activetheory.net/) | Creative digital experiences. | Candidate reference for experiential scenes; retain performance and fallback requirements. |
| [Cuberto](https://cuberto.com/) | Digital products, brands and websites. | Candidate reference for work-led agency presentation and image interactions. |
| [Codrops: Shader Image Reveal](https://tympanus.net/Tutorials/ShaderImageReveal/) | Image-reveal experiment. | Work and showroom transitions; prototype first with SVG before choosing shader cost. |
| [Codrops: Shader On Scroll](https://tympanus.net/Tutorials/ShaderOnScroll/) | Scroll-driven distortion and grain experiment. | Optional showcase transition; do not distort readable project screenshots continuously. |
| [Codrops: Sticky Grid Scroll](https://tympanus.net/Tutorials/StickyGridScroll/) | Scroll-driven layout experiment. | Investigate archive pacing, not a mandatory hero pin. |
| [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | Timelines can be tied to scroll progress or triggered once. | One controlled scene with cleanup; preserve normal touch scroll on marketing pages. |
| [web.dev: reduced motion](https://web.dev/articles/prefers-reduced-motion) | Detects the user's request for less animation. | Equivalent static composition with all content and controls intact. |

## Implementation order and acceptance

1. Implement Work and Services as two genuinely different compositions. Remove their dependency on the common hero arrangement and shared orb-derived padding, without changing THE SERVICES content/layout.
2. Review at 1440×900, 1280×720, 768×1024, 390×844 and 320×700. Check complete image dimensions, visible lead/actions, fixed-header clearance, no horizontal overflow, readable final state and no forced scroll.
3. Implement Process and About scenes after the visual language holds on those first routes.
4. Adapt showroom and case studies; simplify Contact, legal and editorial routes.
5. Update project design guidance to describe the final implementation. Run lint, TypeScript and production build, then verify motion disabled, keyboard navigation, resize, route transitions and browser console.

The review prototype contains four distinct opening compositions, responsive CSS and replayable GSAP sequences using existing project imagery. It demonstrates direction; it does not claim to implement every page or the final shader treatment.
