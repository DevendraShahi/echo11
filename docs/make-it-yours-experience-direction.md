# Make it yours — visual balance and showcase direction

Research and proposal, 24 October 2026. Application code is unchanged by this proposal.

## Diagnosis from the supplied full-page capture

The page has strong individual elements but weak relationships between them. The approach heading occupies the top of a left column while both expanded offers accumulate on the right. The resulting empty space is incidental, rather than composed. Making the inclusion lists public improved information access but amplified this imbalance.

The showcase is materially smaller than the work it represents. Three isolated subject photographs communicate gym, retreat, and food, but do not demonstrate the websites' typography, navigation, responsive layout, or motion. The project-direction panel already provides a more substantial visual moment, leaving the actual live concepts feeling secondary.

The fit check stretches one dropdown across most of the container, beside a tall step sidebar. Its controls have little visual weight relative to their allocated area. Generous repeated section padding, a separate FAQ, another fit-check invitation, and the large footer compound the sense of a long page with sparse activity.

Keep Echo11's black/cyan palette, Syne/mono typography, shared horizon, concept provenance, current images, pricing, and offer boundaries. Resolve the imbalance within this route; do not change the shared horizon or global footer for a local composition problem.

## Research and implications

- [Locomotive work index](https://locomotive.ca/en/work): directly inspected in a browser. Clear project names, categories, and concise project detail make browsing understandable. Borrow persistent named navigation, not its whole archive layout.
- [Codrops: Eduard Bodak portfolio breakdown](https://tympanus.net/codrops/2025/07/29/built-to-move-a-closer-look-at-the-animations-behind-eduard-bodaks-portfolio/): an author-written account of scroll-driven and pointer-responsive portfolio motion. It establishes technical possibilities, not evidence of conversion improvement. For Echo11, use a short, intentional project transition rather than adopting 3D card choreography.
- [NN/G: effective carousels](https://www.nngroup.com/articles/designing-effective-carousels/): recommends discoverable controls and legible actions. Keep all three concept names visible and let visitors choose the active project.
- [NN/G: mobile carousels](https://www.nngroup.com/articles/mobile-carousels/): highlights discoverability and sequential-access problems. Each concept must be directly reachable; swipe can supplement visible controls.
- [NN/G: progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/): frequently needed information belongs in the initial view. Keep starting prices, timelines, and core inclusions public; defer the running preview until an explicit action.

These are inputs to a design recommendation. A conversion improvement would require measurement after implementation.

## Recommended page composition

1. Existing hero and reference-direction panel, with its copy and action visually grouped.
2. Full-width approach introduction with currency control, followed by parallel Foundation and Custom columns.
3. One substantial live-concept stage with persistent named project navigation.
4. A compact four-step fit check with readable answer choices.
5. Recommendation and brief when completed, preserving existing state and validation.
6. Compact FAQ, with the return-to-fit action incorporated into it instead of a separate tall invitation section.

Use content-led section heights. Start with 64–80px between major sections on desktop and 40–56px on mobile, then tune optically. These are proposed values for this route, not changes to global spacing tokens. Allow a larger gap only when changing from exploration to decision-making.

## Approach comparison

Move the heading above both offers, placing currency at the end of the introduction row. From medium widths, Foundation and Custom share equal columns, divided by a restrained hairline. At narrow widths, stack them in reading order.

Each column follows the same structure: approach name, explanation, starting price and typical delivery, core inclusions, preference action. Align the shared content rows with CSS grid rather than fixed heights. Keep both choices visually equal except for the selected preference's accent rule and text. A preference is not a final recommendation.

This removes the empty left column without hiding the services that were just made public. There is no need to add decorative artwork to fill the hole.

## Showcase: one large stage, three visible worlds

Suggested heading: “Three worlds. Built to explore.”

Suggested lead: “Explore our studio concepts to see how layout, movement, and detail shape a website.”

Desktop composition: a compact project index on the left and a dominant 7:4 website preview on the right, approximately 24% / 76% within the existing container. Names FORGE, LALTIN, and pizzaslice remain visible together. Each index entry includes its plain category. The selected entry reveals a one-sentence description and the primary “Explore live” action.

Use existing website captures in `public/showcase/previews/` for the stage, subject to visual verification at the intended size. Retain the original source images and concept sites. This is a change in presentation, not a replacement-image production task. Keep all labels and provenance outside the media.

Project selection updates the preview and caption in a short opacity/position transition; proposed duration 300–450ms. The selected-name rule moves once and settles. No timed rotation. Under reduced motion, switch immediately. The stage should remain stable in height as projects change.

“Explore live” opens an accessible modal containing only the selected site's iframe. Its toolbar contains project name, Desktop/Mobile controls where useful, Open full site, and Close. On mobile default to the available width; never squeeze a desktop preview into an unreadable phone-sized frame. Returning from exploration restores focus and the underlying page position.

The repository already implements this behavior in the static showcase's native dialog. Reuse its interaction contract in a focused React component; do not embed the entire showcase archive or its opening showreel into this page. Only mount the live site after an explicit action and clear it on close.

Keep preview navigation separate from brief selection. Exploring a restaurant or gym must not silently change the visitor's functional fit answers. Do not suggest that a concept's booking, ordering, or operational features are automatically included in Foundation. Existing concept disclaimers remain visible.

Mobile composition: the three named project buttons above a full-width preview, with selected description and Explore live below. Use ordinary vertical page scroll. If swipe is supported, retain the named controls and avoid intercepting vertical gestures.

## Fit-check composition

Keep the four steps and recommendation logic. Replace the tall desktop sidebar with one compact step rail above a constrained question area. For the first three questions, consider visible labelled radio choices with explanatory copy, rendered as open ruled rows rather than checkbox tiles. Visitors can compare meanings before answering. Two columns work for the six project-type options on desktop; use one on mobile. Keep selection visually quiet: accent rule, tint, and text, without tick icons.

Keep Back and Next adjacent to the question area instead of opposite ends of the full page. Give the final systems/migration step enough room for its two questions. Selection alone does not scroll; explicit navigation retains the measured-header alignment behavior.

## Implementation and verification

Extract the concept stage from `FoundationsExperience.tsx` into a dedicated component. Retain the parent selection state, brief preservation, budget reconfirmation, uncertainty routing, and submission action. Use the existing stack and no new animation library. Update project guidance only where the implemented workflow changes.

Verify 320, 390, 768, 1280, and 1440px; short landscape viewports; all concept selections; keyboard navigation; modal Escape/focus restoration; preview load failure and full-site fallback; touch scroll; reduced motion; and fit-check recovery after exploration. Confirm only one iframe mounts, no page-width overflow, no cumulative preview height jump, and no automatic inquiry submission. Run lint, type-check, and production build after application changes.
