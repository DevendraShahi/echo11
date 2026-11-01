---
name: echo11-design
description: Use this skill when designing or updating Echo11 frontend experiences. It captures the current implemented UI theme, layout system, color logic, typography, motion language, and component rules based on the actual codebase, while staying flexible for future refinement.
---

# Echo11 design skill

This skill describes the **current real design system** of Echo11 based on the implemented codebase, not an abstract or idealized style guide.

## Purpose

Use this skill when:
- Designing new pages or sections for the marketing site
- Refining components or layouts in the existing frontend
- Extending the visual system into portal or lab surfaces
- Making UI decisions that should stay aligned with Echo11's current identity
- Reviewing whether a new UI direction fits the product's existing visual language

This is a **flexible guideline**, not a rigid brand law. Echo11 can evolve. The goal is to preserve the current design DNA while allowing stronger refinement over time.

## Core design identity

Echo11 is currently a **dark-first premium digital studio interface** with a cinematic and technical feel.

It is defined by:
- near-black and black surfaces
- white and off-white type
- one electric cyan accent
- subtle glow and translucent glass layering
- sharp geometry instead of soft rounded UI
- expressive headlines with technical mono support text
- motion-led presentation and atmospheric visual depth

This is **not** generic SaaS UI, soft startup pastel design, or bubbly dashboard styling.

## Theme and color system

Current global tokens come from `src/app/globals.css` and `tailwind.config.ts`.

### Primary colors
- Background: `#000000`
- Foreground: `#fcfcfc`
- Border: `#222222`
- Muted surface: `#1a1a1a`
- Muted text: `#a1a1a1`
- Card: `#111111`
- Accent: `#00E5FF`
- Accent glow: `rgba(0, 229, 255, 0.4)`

### Color rules
- Use black and near-black as the visual foundation.
- Use white and soft white for primary readability.
- Use muted gray only for support text and low-priority information.
- Use cyan as the **single high-energy accent** for focus, active states, links, highlighted nav states, buttons, icons, and glow effects.
- Avoid introducing additional strong accent colors unless a specific feature truly requires it.
- Accent should feel surgical and luminous, not decorative everywhere.

### What to avoid
- Random gradient-heavy rainbow UI
- Purple/indigo replacing cyan as primary brand accent
- Warm beige or soft product palettes that break the current identity
- Colorful dashboard cards unless explicitly part of a data-viz requirement

## Typography system

Echo11 uses a split typography voice.

### Current implementation
- Sans family: `var(--font-syne)`
- Mono family: `var(--font-geist-mono)`

### Usage rules
- Use the sans family for headlines, feature titles, major content headings, and expressive statements.
- Use mono for nav items, labels, metadata, CTA button labels, utility copy, secondary descriptions, and system-feeling interface text.
- Headings should feel assertive, compact, and high-contrast.
- Mono text should feel controlled, technical, and slightly editorial.

### Typography feel
- Marketing pages should feel premium, deliberate, and contemporary.
- Supporting text should feel systematic and product-aware, not casual.
- Avoid overly playful type treatments.
- Avoid mixing too many font personalities.

## Shape language

Echo11 currently prefers **sharp edges**.

### Rules
- Default to `rounded-none` or very restrained geometry.
- Buttons, cards, icon containers, and panels should feel precise and architectural.
- Sharp corners are part of the product personality.
- If rounded corners are used later, they should be subtle and intentional, not soft or bubbly.

### Avoid
- Pill-heavy UI everywhere
- Overly soft cards
- Consumer-app rounded styling that weakens the current technical/studio tone

## Layout system

The public-facing site uses a wide, spacious, presentation-led structure.

### Current layout characteristics
- Main container width: `max-w-7xl`
- Horizontal padding: `px-6 lg:px-8`
- Strong vertical breathing room
- Large hero-first composition
- Storytelling sequence through homepage sections

### Page composition rules
- Build pages as editorial/product narratives, not as template blocks.
- Favor confident sectional pacing: hero, evidence, capabilities, work, process, CTA.
- Give content room to breathe.
- Use asymmetry only when it strengthens rhythm.
- Keep section hierarchy very clear.
- Inner pages keep their root transparent: `PageWrapper` renders the shared top semi-radius horizon glow (`studio-horizon`) behind the content, and an opaque `bg` on `<main>` buries it. Never paint a page-root background over the horizon light.

### Marketing surfaces
Current homepage flow:
- Keep the homepage hero image-free: the user rejected project previews and repeated portfolio imagery in this introduction. Develop its identity through typography and meaningful signal motion; project imagery belongs in the work sections below.
- Hero (sticky `160svh` track and `100svh` stage; content plane overlap `-60svh`. At viewport heights <=620px or reduced motion, the hero is a natural scroll block with min-height max(620px,100svh), and the following content has no negative overlap)
- Client logo strip (white-normalised marks + type wordmarks; hairline band)
- Statement (centered kinetic word reveal)
- The former Results/confidence band is removed from Home: it repeated approach timelines, scope, stage counts and handover. Keep pricing/timelines on Make it yours, stage detail on Process, and portfolio counts with the work preview.
- Capabilities (desktop display-type index of four disciplines; below `lg`, native service disclosures reveal scope and description, with direct services links)
- Featured work (numbered, ruled Challenge / Our contribution / Delivered brief rows; the wide client project pairs its introduction left with the brief and links right, stacking below lg. A ruled archive band closes with data-derived case-study/client counts and a direct work link.)
- Make it yours (restored three unboxed Commerce/Service/Product directions visible together from md, stacked below; linked ProjectMedia previews, concise outcomes, individual inquiry links, and one shared link to compare approaches; price, currency selection, and scope comparison live on Make it yours; finite staggered article lift and accent-rule draw, static reduced motion; retain this composition when refining copy or spacing)
- Process overview (`HomeProcessExperience`): a concise four-link stage index with the existing Book of Shapes artwork, one checkpoint sentence per stage, and a link to `/process`. Use two columns on mobile and four on desktop. Deliverable lists, client-input panels, and timeline comparisons belong on their canonical pages rather than repeating here.
- CTA invitation (oversized two-part headline, copy and inquiry action left; a finite SVG meridian signal sculpture right from `lg`, stacked after the action on mobile; accent rule draws once, house word reveals own the heading, and reduced motion shows a static composition)

This means Echo11's marketing frontend should feel like a curated studio presentation.

### Conversion route pages (`/make-it-yours`, `/contact`)

These share one route-page language, distinct from the homepage sections:

- display h1 on a fluid clamp (`text-[clamp(3rem,7.4vw,7rem)]`-family) spanning the container; section h2s on one page-wide clamp so heading scale is consistent top to bottom
- split typography in long-form routes: sans for every paragraph, answer, and list item; mono only for kickers, labels, prices, timeline facts, and CTA labels
- section kickers sit on the house `LABEL` (mono 10 / white-60); cyan stays for the hero kicker, the route-result kicker, active tab fills, checks, focus rings, and hover states
- `RevealText` owns the h1 and every section heading (GSAP); framer-motion only owns block entrances and the tab-panel swap — never the same node
- selects are the shadcn `Select` (`src/components/ui/select.tsx`, Radix-based) restyled to house tokens (zero radius, hairline, accent rail instead of a tick); pass its label as `SelectValue` children — Radix only resolves item text while content is mounted, so bare `<SelectValue />` renders empty when closed
- never wrap a Radix Select in `<label>`: label activation sends a synthetic `click` with no `pointerdown`, and Radix Select opens on `pointerdown` (its `onClick` opens only while `pointerTypeRef` is not `"mouse"`) — the click works once then silently stops. Use a plain row + `aria-labelledby` on the trigger (see `FitRow` / `BriefField`); keep `SelectValue` children labels for the same mount reason
- `/make-it-yours` opens with a project-led showroom: a full-width “Make it yours.” title (stacked on mobile), a concise lead/action row, horizontal direction index, and a large ProjectMedia reference beside direction copy. Approach prices use a compact split ledger; the fit check has one active panel without an empty-answer sidebar; FAQs use a split heading/accordion. Result and brief retain the shared selection model. Avoid adding separate tall bands for every piece of explanation.
- Its sizing follows About and Process: hero clamp(3.1rem,8vw,7rem), shared section headings clamp(2.1rem,4.5vw,3.8rem), mono 10px labels, 16/24 vertical section spacing, and a 1.4fr/1fr showroom split. Keep this measured refinement and the existing selection flow; pricing wraps on narrow screens and recommendation actions fit at 320px.
- Fit answers begin unanswered; a carried direction seeds only its genuine project type. A preferred Custom route never invents account requirements. Foundation covers public marketing and product storytelling; checkout is separately scoped Custom. Applications/private tools and unknown requirements need review without website estimates.
- Direction and question tabs use roving focus, arrows, Home/End, responsive orientation, and labelled panels. Explicit question changes align the rail 12px below the measured header through Lenis, using numeric coordinates to avoid doubling CSS scroll margins; native fallback and reduced motion are supported. Answer selection alone does not force scrolling.
- The result explains actual triggers, provides an accessible answer summary, and uses a separate concise status announcer. Upstream edits require reconfirmation but retain the written brief. `NextStepBrief` has no duplicate route/type selection: goals, budget/timing, then contact; changed budget basis is clearly invalidated rather than silently reset. Errors have descriptions and focus recovery; submission has a finally block and email fallback.
- On `/make-it-yours`, essential headings are plain visible HTML, not scroll-gated RevealText. Direction media uses ProjectMedia gallery treatment with priority loading and animateEntrance=false so previews render in full-page captures. Finite Framer motion remains on question transitions. The decorative spokes are retired from this route.
- proof/evidence cards use `ProjectMedia` (`surface="feature"`) rather than raw `Image`, so plates keep the shared lift-on-hover treatment
- section leads sit at `text-base sm:text-[17px]` (the hero lead's tier), body prose at `text-[15px]`→`text-base`, and prose paragraphs carry `text-pretty` so lines don't orphan a single word
- comparison/spec tables never scroll sideways: stacked `<dl>` rows under `sm`, the table from `sm` up with `min-w` tuned to fit the container at each breakpoint

This means Echo11's route pages should read as one editorial surface with the same restraint as Home, not as a stack of boxed modules.

### `/showcase` page

- The static hub is a continuous scrolling portfolio generated by `scripts/generate-showcase.cjs` from `src/data/caseStudies.ts`, plus LALTIN and pizzaslice. `npm run build` regenerates its HTML through prebuild. Client, concept and owned provenance stays explicit; only verified outbound links are offered.
- `public/showcase/showcase.css` and `.js` provide a persistent studio frame with desktop Vertical/Grid and mobile Horizontal/Grid modes (700px breakpoint). Unsupported modes are hidden and disabled; resizing preserves the current project. A desktop project index and a reading-progress dock track the work. Mobile uses a native scrolling gallery with large plates and persistent project details; Horizontal accepts sideways gestures and vertical wheel input. All work remains available without JavaScript.
- Local GSAP Flip morphs gallery modes and reveals active metadata. Three.js renders scroll-velocity image distortion, sleeping when idle and falling back to DOM images if unavailable. Reduced motion remains static. Avoid ambient float, invented claims, or copying a reference site's assets.
- Preserve `/showcase#forge`, `#laltin`, and `#pizzaslice`, alongside archive-project anchors. Native live dialogs for these three concepts have device controls, default to Mobile on narrow screens, clear the iframe on close, and restore focus. Restaurant details remain illustrative.
- Horizontal gallery gestures use one initiating axis per drag and settle after release through the shared JavaScript alignment. Keep CSS scroll snapping disabled so it does not compete with pointer updates. Project descriptions accept gallery swipes; buttons and form controls remain independently interactive.
- The cinematic showreel starts only after an explicit Sound on / Keep it muted choice in a compact centered native dialog. Use a small studio mark and gentle sound-wave icon, a welcoming heading, short copy, and two side-by-side choices; avoid oversized artwork, dramatic headlines, HUD labels, and a landing-page-sized prompt. Keep autoplay and timed prompt dismissal disabled; media-ready events and stage/keyboard controls cannot bypass the choice. Replay resets the video and requests the choice again. The dialog supports native focus containment, Escape/skip to projects, mobile sizing, and reduced motion. Without JavaScript, visitors can access the archive directly.
- Keep the reel player quiet: preserve the full video with object-fit contain, especially on mobile; no REC labels, crosshairs, chapter HUD, external grain, neon framing, or full-width skip button. Use a small Close action and compact Play/Pause, Sound, and elapsed-time bar with a white hairline progress indicator. Desktop controls fade when playing and idle, but remain available on focus/hover and when paused. Space toggles playback; Escape closes the reel.

### `/about` page

- About artwork uses original black/off-white/cyan colours at rest, with a duplicate colour-blend layer appearing only on fine-pointer hover: blue for perspective, amber for Strategy, violet for Design, green for Engineering, coral for the standards banner. Preserve neutral linework, transparent backgrounds and static original colours on touch; reduced motion removes the transition. The perspective uses `echo11-connected-workshop-v1.png` at 4:3; the three disciplines retain their respective illustrations and the standards section opens with its 4K banner above the heading and principles in a compact responsive frame capped at 360px high, with object-contain preserving the complete artwork.
- `AboutExperience` uses a studio introduction, perspective with a transparent conceptual workshop illustration, three open discipline columns (without the duplicate hero promise strip), numbered standards with a full-width banner, client-fit guidance, and a conversation CTA. Artwork remains uncropped with reduced-motion-aware entrances.
- The client example and studio concept use shared `ProjectMedia` and data-backed project names. Keep provenance visible. Do not invent people, office photography, awards, years of operation, testimonials, or performance claims.
- Preserve the transparent page root, house hero word reveal, visible section headings, finite reduced-motion-aware entrances, generous hairlines, and mobile stacking. The About story explains why the studio works this way; the Process route explains project delivery.

### `/process` page

- Below lg, the campus overview and collaboration intro use the full container width, with the unpadded 16:9 master selected through picture/source. Desktop retains the 21:9 master. The mobile icon rail starts only beside the four stage articles, not beside the overview or collaboration content; desktop retains its existing sidebar.

- Scope (#project-scope) opens with `echo11-process-scope-panorama-v1-21x9.webp`, a full-container 5040×2160 Foundation/Custom office panorama above scheduling guidance about content readiness, review windows, and technical dependencies; approach comparison and typical timeline details link to `/make-it-yours`. Preserve its 21:9 aspect ratio with intrinsic dimensions and auto height, no crop, no viewport-height wrapper. Keep its studio-illustration caption and lazy loading; the export is upscaled from the generated source.

- After the four project stages and outside the sticky rail, handover uses a compact split heading followed by an icon-led deliverable index left and an unboxed document right. Each selection explains example contents and the practical use of that deliverable; Expanded documents have no enclosing border, tinted background, or inset padding; retain only internal content rules and spacing. Mobile uses native details grouped by name="process-handover" with content directly under each summary. Opening an item closes the previous one, and the open item can be collapsed; all start closed. Keep native keyboard behavior. After opening, align the item 16px below the measured fixed header using a post-layout frame and Lenis (native fallback; instant reduced motion). Closing alone does not scroll. Both desktop and mobile item headers use the matching Phosphor duotone code-block, book-open-text, keyhole, and rocket-launch SVGs at 36px in unboxed 40px slots (vendored with MIT license, rendered through HandoverIcons.tsx); cyan marks the selected or expanded item, and text labels stay visible. Desktop uses native pressed buttons and a labelled shared region. Stack the four documents in the same CSS grid cell, with inactive content invisible and aria-hidden, so the tallest document reserves space without fixed heights or clipping. Desktop selection keeps the page stationary; use opacity-only transitions and reduced motion. Keep the four project stages intact and avoid fake downloads or app-window chrome. The introduction pairs its copy with `echo11-process-handover-campus-v1.webp`, a landscape close-up of the recurring founder walking the two clients through their website, guide, and checklist in the same office; preserve its natural aspect ratio and label it as a studio illustration.

- Launch uses `echo11-process-04-launch-campus-v2.webp`, a 4:3 close view of the campus launch platform, recurring five-person cast, WE ARE LIVE screen, responsive website and handover binder. It shares Design and Build’s restrained warm hover blend.
- Build uses `echo11-process-03-build-campus-v3.webp`, a 4:3 close view of the same campus workspace with the founder and teammate reviewing working desktop/mobile UI and code. It shares Design’s restrained warm hover blend.
- Design uses `echo11-process-02-design-campus-v2.webp`, a 4:3 close view of the campus creative studio with the founder and a designer wearing glasses. Its duplicate image layer uses a restrained champagne-amber colour blend on hover, complementing the oak and warm lighting without a green cast; original colours stay visible at rest and on touch, with no transition under reduced motion.
- Discovery uses `echo11-process-01-discovery-campus-v4.webp`, a 4:3 close view of the same campus lounge, with the founder listening to two clients over a brief and page map. Preserve the campus furniture, characters, and lighting continuity.
- “One shared direction” includes the full 21:9 campus master (`echo11-master-campus-v4-team-ultrawide-21x9.webp`) beside a full-viewport vertical left-hand stage sidebar. The sidebar remains sticky through the collaboration copy and all four stage articles, releases before the scope section, and follows the active stage during scrolling. No stage is selected before reaching the stage articles or after leaving them. Below lg, links show accessible labelled icons only; desktop shows the stage names and numbers. The campus introduction has zero margin and padding, no minimum viewport height, and no extra grid gap around its 21:9 image frame; the kicker remains above it. Stage links smoothly scroll to the matching article through Lenis with fixed-header clearance, native fallback, focus transfer, and instant reduced-motion navigation. Keep the complete scene uncropped, preserve the accessible stage navigation, and treat the office and team as a conceptual illustration.

- A standalone client-facing narrative in `ProcessExperience`: display hero, linked four-stage journey rail, collaboration principles, four open stage articles, scope/timeline ledger, native FAQ disclosures, and a conversation CTA.
- Stage articles pair the brief and licensed house artwork with “You receive”, “Your input”, and a decision checkpoint; they stack below lg. Stage anchors have a fixed-header scroll margin. All content remains available without expanding tabs.
- Timelines come from `OFFERS`; copy distinguishes website estimates, Custom checkout scope, separately reviewed applications, and separately scoped ongoing care. Do not imply guaranteed business results or unlimited revisions.
- House hero word reveal, finite rail draw, artwork settlement, and block entrances respect reduced motion. Section headings are visible HTML. Keep the page root transparent to the shared horizon light.

### `/services` sections

- The refined Services hero has generous top and column spacing, separate desktop artwork, and the customer journey rail below the introduction. Mobile keeps text and actions first without decorative hero artwork.
- At the user's request, The Services retains compact illustrated navigation and uniform copy-left/artwork-right articles, with current service wording. Its existing artwork glow is scoped to this section.
- Selected work keeps explicit client/owned provenance. Delivery uses readable stage labels and a two-column ownership inventory that stacks on mobile. Structural borders and illustrative context colors use theme tokens.
- Your next chapter is a full-width editorial invitation: visible two-line headline, brief-preparation copy beside a large ruled Start a project link, and a quieter work link below. Mobile stacks naturally; finite Framer entrances and arrow hover respect reduced motion. The decorative bloom and split artwork/action rows are retired.
- Preserve finite, reduced-motion-aware geometry. ServiceArtwork renders complete transparent SVG geometry and uses scoped GSAP attribute timelines, with cleanup restoring original attributes; do not reintroduce native SMIL startup (`beginElementAt`), which failed in Firefox.

### App surfaces
There are distinct route groups for:
- marketing/public site
- portal
- lab

These should share the same visual DNA but can vary in density and interaction complexity.

## Surface treatment

Echo11 uses translucency and atmosphere selectively.

### Existing patterns
- `.glass`
- `.lab-glass`
- subtle white borders at very low opacity
- blur-backed overlays
- grain overlay on the page shell
- radial cyan lighting/orb treatment on inner pages

### Rules
- Use glass effects for headers, overlays, and emphasis surfaces.
- Keep glass restrained; it should feel premium, not gimmicky.
- Use dark cards and low-opacity borders for depth.
- Use glow as atmosphere, not as noise.

### Avoid
- Frosted-glass on every single surface
- Heavy glow on too many components
- Overusing blur until readability suffers
- Graph-paper grid backgrounds (vertical-line or 2D `linear-gradient` line overlays) behind page sections; atmosphere comes from the horizon orb, blooms, and the signal field

## Component styling

### Buttons
Current button language is:
- sharp-edged
- compact but premium
- often mono uppercase or technical-feeling text
- accent fill or accent outline
- subtle glow when interactive
- glass variant for secondary actions

Use these patterns:
- primary action: accent background, dark text, clear emphasis
- outline action: accent border and accent text
- glass action: translucent secondary emphasis

### Cards and panels
- Dark fill or translucent fill
- Fine border treatment
- Hover states through contrast and border changes, not exaggerated transforms
- Sharp or nearly sharp corners
- High readability first
- No floating badges or label chips over media (kind/category stamps, disclaimer captions); provenance and kind live in typographic meta lines beside or below the content, and plates stay at full brightness (no darkening scrims for badges)

### Inputs
Existing input style favors:
- dark translucent fields
- low-opacity borders
- accent-focused border or ring on focus
- subdued placeholder text

### Icons
- Use icons in structured containers, usually dark with subtle borders
- Accent icon color is appropriate when emphasis is needed
- Keep icon usage precise, not playful or noisy
- No checkbox design, anywhere on the marketing site: no tick-icon lists, no checked/unchecked boxes, no check tiles in success states. Selection reads through border, tint, and accent typography (accent text for the selected menu item)

## Motion language

Motion is a core part of Echo11's design identity.

### Existing motion patterns
- GSAP + Lenis smooth scroll, wired through one ticker (`src/lib/gsap.ts`, `src/components/layout/SmoothScroll.tsx`)
- House word reveal (`RevealText`): every word in an overflow-hidden mask, GSAP-lifted; used by the hero, statement, all homepage section headings, and the h1 + section headings of `/make-it-yours`
- letter-by-letter hero entrance gated on the splash handoff
- scroll-based fade and translate in the hero (sticky stack)
- pinned-capabilities scroll track: retired; Capabilities is one build with a CSS sticky column and hairline rows
- Results count-up: GSAP timeline, once, skipped under reduced motion
- animated mobile menu open/close
- CTA sheen animation
- page transition wrapper with fade/slide
- kinetic wordmark canvas (Canvas2D `EchoField`, not Three.js): the giant hero "echo." is drawn by the wave field, masked to its own glyphs
- grain and lighting overlays for atmosphere

### Motion rules
- Motion should feel elegant, restrained, and cinematic.
- Use it to create presentation and clarity, not novelty.
- Entrance animations should feel smooth and intentional.
- Hover states should feel precise.
- Ambient motion can exist in the background if it improves emotional tone.
- Respect reduced-motion preferences.
- GSAP and framer-motion must never animate the same element: GSAP owns `RevealText` words, ScrollTrigger pins, and counters; framer-motion owns block entrances and hovers.

### Avoid
- Cartoonish bounce
- Overly gamified transitions
- Constant large-scale motion on every section
- Motion that distracts from reading or task flow

## Homepage-specific design observations

The hero sets the strongest visual precedent for the brand.

### Hero characteristics
- kinetic wordmark: "Make your brand / echo." where the giant `echo.` is
  transparent DOM text and the canvas below paints its visible glyphs
- the wave field lives inside the letterforms (source-atop) with a faint pass
  escaping across the stage
- meta rail on top (`echo11` | `STRATEGY · DESIGN · ENGINEERING`) and a
  numbered services rail on the bottom (`01 STRATEGY / 02 DESIGN / 03 ENGINEERING`)
- motion is a slow continuous drift (`TIME_DRIFT` in `EchoField`, roughly
  3× slower than a fast field) with scroll progress adding phase travel on top —
  it must never read as a distraction
- clicking the open stage sends a cyan ping ring through the letters;
  interactive elements keep their own behaviour
- no HUD readout, eq bars, scroll cue, or hero text-glow
- the wordmark retains a cyan DOM fallback until EchoField reports a painted glyph frame; its canvas wash has readable cyan contrast. The field sleeps at progress >=0.6, while the document is hidden, or under reduced motion; dynamic preference changes are supported. Both hero actions have at least 44px height and visible keyboard focus.
- reduced motion renders one static frame with no listeners
- mono supporting paragraph + bold dual CTA setup
- cinematic fade at the bottom of the hero

This means future hero sections should preserve:
- strong visual focus (the wordmark is the artwork)
- high contrast
- atmospheric depth
- calm ambient motion; never autoplay noise
- minimal but impactful copy hierarchy

## Philosophy grid pattern

The feature grid establishes a pattern for content-heavy studio messaging:
- dark cards
- square icon containers
- accent icon color
- low-opacity border
- hover contrast increase
- mono descriptive text

Use this as reference for capability cards, service cards, feature summaries, and value-proposition sections.

## Lab direction

The `/lab` area is still in development, so its UX can evolve more aggressively than the rest of the site.

### Constraint
Even while `/lab` evolves, it should still inherit Echo11's design DNA:
- dark-first surfaces
- restrained cyan accent
- sharp geometry
- mono utility text
- glass/dark surface language
- precision over softness

### Allowed flexibility
- denser layouts
- more utility-first components
- stronger information hierarchy
- more product-oriented navigation and controls

## Design quality test

Before shipping a new UI, ask:
- Does this still feel like Echo11, or does it look like a generic SaaS template?
- Is cyan being used intentionally, or too often?
- Are the shapes too soft?
- Does the page have enough negative space?
- Are typography roles clear between expressive headline and technical support copy?
- Does the motion add clarity or just spectacle?
- Does this fit the marketing/portal/lab surface it belongs to?

## Anti-patterns for Echo11

Do not drift into these patterns unless there is a deliberate redesign:
- soft rounded startup UI
- pastel palettes
- multi-accent rainbow branding
- excessive shadows replacing glow and contrast
- generic corporate landing-page blocks
- decorative clutter with no structural purpose
- visual inconsistency between public site and product surfaces

## Practical design direction for future work

When extending Echo11, aim for:
- premium but restrained
- technical but not cold
- cinematic but not noisy
- modern but not trendy for trend's sake
- expressive in headlines, controlled in systems
- modular enough to scale into product surfaces

## Source of truth

This skill is based on the actual implementation in:
- `src/app/globals.css`
- `tailwind.config.ts`
- `src/app/page.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/PageWrapper.tsx`
- `src/components/layout/SmoothScroll.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/ClientLogos.tsx`
- `src/components/sections/Statement.tsx`
- `src/components/sections/Results.tsx`
- `src/components/sections/Capabilities.tsx`
- `src/components/sections/PhilosophyGrid.tsx`
- `src/components/ui/RevealText.tsx`
- `src/components/ui/*`

If those files materially change, this skill should be updated.

## Signal becoming clear

- Inner-page atmosphere is a finite arrival and scroll-linked fade in PageWrapper, not an infinite pulse. The responsive half-circle stays behind content, has no input or accessibility role, and is static under reduced motion. Homepage retains its existing EchoField identity.
- Services, About, Process, Make it yours, Contact and Work share `studio-intro` spacing: the original circular horizon above a clear gap before the message. Keep roots transparent so the horizon remains visible.
- Give each section one primary message and use cyan for actions, selection, and meaningful connections. Passive numbers remain neutral. Preserve user-approved section compositions while refining hierarchy.
- Services puts its customer journey below the hero, with sequential finite entrances. The supporting hero geometry recedes; the chosen service articles and their artwork remain. Motion explains progression and stops when its job is done.

Horizon placement: `.studio-page` owns a responsive circular diameter (512–1000px), a sky height derived from that diameter, and a gap before `.studio-intro`. Preserve the original circle gradient and soft blur; do not flatten it into an ellipse or add a horizontal ground line. Legal, manifesto, methodology and case-study openings share the spacing. The finite entrance uses uniform scale, and reduced motion is static.

### Hero copy refinement (2026-10-10)

`PageHero.copyLayout` arranges only the headline, supporting lead and CTA: Work uses split, Services stacked, Process inset, About statement and Make it yours compact. Preserve the existing horizon geometry, `studio-intro` top spacing and fixtures when refining this copy. Headlines use route-specific fluid scales, balanced wrapping and explicit trailing line-height after font-size overrides; mobile stacks copy and actions in reading order. Do not expand a copy/CTA task into atmosphere or below-hero redesign.

### Public navigation

`src/data/navigation.ts` owns visitor-facing header/footer names: Our work, Services, Make it yours, How we work, About us and Start a project. `/process` and `/about` are canonical; `/methodology` and `/manifesto` are permanent legacy redirects after their useful ideas were consolidated. Work contains case studies; Showcase contains interactive previews, so both remain discoverable. Footer service links target the actual Business websites / Website redesigns / Online stores sections. Preserve the existing footer composition when refining its destinations.

### Geographic positioning

Public-facing Echo11 copy is location-neutral at the user’s request. Do not add Canada-based wording, country badges or geographic status sections to marketing, footer, metadata, legal contact copy or invoice sender identity. Currency names and actual client address data remain functional data, not studio affiliation.

## Content ownership across marketing pages

- Home introduces the studio, evidence, directions, and a concise process preview; do not duplicate long explanations from inner pages. The statement has no repeated benefit-card grid.
- Services owns the three service scopes and service-specific questions. Its former generic foundations grid, portfolio evidence section, four-stage delivery walkthrough, and ownership inventory are removed; a compact link rail points to Work, Process, and Make it yours.
- About owns studio perspective, connected disciplines, standards, and client fit. Portfolio presentations live on Work; detailed ownership and handover live on Process. Do not restore About's duplicate selected-work or ownership sections.
- Process owns stage deliverables, client input, approvals, handover, review commitment, and scope changes. Collaboration has two rows; the handover is the detailed ownership reference. Scheduling guidance explains dependencies rather than repeating the offer comparison.
- Make it yours owns Foundation/Custom comparison, pricing, fit questions, recommendations, and choice-specific FAQs. Its ownership/delivery FAQ is replaced with fit-check editing guidance.
- Contact owns inquiry preparation, confidentiality, the form, and immediate follow-up. Approach and timeline comparisons link to Make it yours instead of recurring as FAQ answers.
- Work owns the portfolio; project evidence on Home remains a selective preview. Contextual links, brief introductions, form summaries, legal scope, and page-end inquiry actions remain where useful.

### Complete public-content deduplication pass

- Fluids replaces the former Signal Fuel beverage concept (`fluids`). Keep its existing chrome/cyan can imagery, now referenced as `/work/Fluids-hero.png`, and concept provenance. The old `/work/signal-fuel` route permanently redirects to `/work/fluids`; project spread, proof references and logo text use Fluids.

- Ivision replaces the former Formline Optical concept in canonical case-study data (`ivision`). Its preview is a screenshot of `https://ivision.echo11.tech`, stored at `public/work/Ivision-hero.webp`; keep the verified site link and concept provenance. The old `/work/formline-optical` route permanently redirects to `/work/ivision`. Showcase is regenerated from this record, and the project spread/logo references use the new identity.

- Home direction references use StepOutInStyle, ExpressSocialNP, and CurriculumOS so the cards do not repeat the featured TrueLuxe/Siyo Dhaago/Leaders stories. Keep their captions and existing facts; no home price/currency ledger.
- Work's FORGE live spotlight is its sole portfolio listing when the feature is present. EditorialWork accepts excludeIds to keep the archive complete when used without the spotlight. The spread artwork uses a project-browsing introduction rather than another studio mission statement.
- Case-study taglines and Business Context serve different purposes and remain. Remove the repeating Features sidebar; Execution Strategy carries the implementation narrative, followed only by additionalFeatures that are not already explained there. Full canonical features remain in the data. Existing project claims and outcomes are not rewritten.
- Make it yours defines Foundation/Custom once in the approach comparison. Avoid repeating those definitions as FAQ answers or the result's direction label again beside the brief; retain budget/result facts, answer review, selection confirmation, and fields required to verify what is submitted.
- Process no longer has the two-row collaboration preamble that restated stage scope/input. Keep the campus overview, full stages, handover, scheduling and delivery FAQs.
- Showcase cards contain short taglines, category, provenance and links, without duplicating full service credits from the case studies; LALTIN/pizzaslice keep credits because they have no separate case-study page. Change the generator, not only generated HTML.
- Audit scope: 26 public content routes, including 13 case studies, Showcase, 3 live concepts, Privacy and Terms. Concept-specific narratives and legal explanations stay where they serve distinct visitor needs. Protected Lab/Client operational workflows are a separate surface and were not modified.

### Make it yours editorial concept spread

- `ConceptSpread` replaces the equal three-thumbnail strip on `/make-it-yours`. Desktop places a wide FORGE panel upper-left, portrait LALTIN offset right with a restrained overlap, and a broad pizzaslice panel below-left. Keep large names and provenance outside media, actual website captures, sharp geometry, and readable Explore actions. Tablet uses an offset two-column arrangement; phones stack all three in DOM order.
- The hero Explore live concepts action targets `#live-concepts`. A concept opens a native live-preview dialog with only its iframe mounted, Desktop/Mobile widths, Open full site fallback, visible loading recovery, Close/Escape, focus restoration and parent scroll preservation. Motion expands from the chosen panel and respects reduced motion. Exploration must never change the visitor’s fit answers or brief.

### Visitor release override (2026-11-01)

- The current public concept spread has two entries, FORGE and LALTIN, sourced from canonical `liveConcepts`. pizzaslice is retained unlisted and noindex; do not restore it to public lists or previews without an explicit request. Preserve the two-panel desktop composition and stack on phones.
- Showcase uses published case studies directly, including LALTIN. BudgetMate remains a draft. The existing reel is hidden because it contains withdrawn projects and obsolete names.
- Home features FORGE, LALTIN and TrueLuxe. Work leads with FORGE, followed by the LALTIN story and client work. Avoid an unsupported “newest” claim about FORGE alone.
- Missing live links are not WIP. Keep case-study imagery readable and provenance in adjacent text; Green Lifestyle's photograph must be identified as editorial imagery. Unsupported result metrics are withheld.
- Brief forms default to preparing an email, with review/copy/edit actions and explicit “nothing has been sent” wording. Hosted submission is an opt-in deployment mode after its dependencies are verified.
