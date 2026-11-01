# Showcase story refresh

The standalone `/showcase` rewrite remains backed by `public/showcase.html`, with styles and behavior in `public/showcase/showcase.css` and `showcase.js`. This pass replaces the previous background-depth and floating-preview treatment with an idea-to-execution story.

The direction and 20 official references are documented in [showcase-reference-study.md](showcase-reference-study.md).

## Changed

- Two frames per concept: The idea and The website.
- Distinct editorial compositions; LALTIN reverses the image/copy order on desktop.
- Specific explanations of Voice, Atmosphere, and Journey instead of generic feature lists.
- Actual homepage captures for FORGE, LALTIN, and pizzaslice, with `object-fit: contain` preserving the full preview.
- Purposeful GSAP image wipes and finite text entrances; different chapter durations, no float or pointer tilt.
- Persistent project index with two marks per chapter, manual story controls, and a finite optional Play sequence.
- Live native-dialog viewer with Desktop/Mobile sizing, full-site link, paused Observer, Escape, and focus return.
- Full-screen sequence only at desktop heights >=820px, or mobile widths 360–700px and heights >=800px. Smaller screens, reduced motion, and unavailable GSAP/Observer use natural document scrolling and instant frame changes. Without JavaScript both frames remain readable.

Concept provenance is explicit. No changes to standalone concept content, project-fit forms, business logic, or remote services.

## Validation

See the task handoff for lint, type-check, production-build, and browser verification results. Physical touch-device behavior and reduced-motion OS emulation need device-level QA; browser resizing verifies the natural document fallback.

Completed checks for this pass:

- `node --check public/showcase/showcase.js`: passed.
- `npm run lint`: passed with the three pre-existing `@next/next/no-img-element` warnings in `LaltinApp.tsx`.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; 73 routes generated.
- Browser: desktop 1280×900 and 1280×820; mobile 390×844; natural fallback at 320×740 and 768×600. No horizontal overflow in those checks; all showcase images loaded.
- Idea/website frame changes, chapter links, selectable design explanations, keyboard arrows, wheel movement over the website preview, optional sequence advancement and pause, native preview loading, mobile-width mode, Escape, and focus return were checked.
- Source captures are JPEG files with matching `.jpg` extensions. No external media was copied from reference studios.
