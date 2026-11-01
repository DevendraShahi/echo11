# About page refresh

Replaces the previous terminal and feature grid with a client-facing studio story, while retaining Echo11’s black, white, cyan, and Syne/mono visual language.

## Page structure

- Studio hero: “Clear thinking. Distinctive work.” with a portfolio action and three concise commitments.
- Perspective: why clarity, credibility, and a clear next step matter, illustrated by three disciplines converging on one website.
- Approach: Strategy, Design, and Engineering shown as open, ruled columns.
- Evidence: The Leaders NP client build and Morrow Ritual studio concept, explicitly labelled and linked to their case studies.
- Standards: clarity, practical craft, visible decisions, and ownership.
- Client fit: relevant business situations and a link to the website starting-point flow.
- Closing conversation invitation.

The page uses a finite SVG path draw, the shared hero word reveal, finite block entrances, shared project-media hover behavior, and reduced-motion support. Essential section headings remain visible. Mobile preserves reading order with stacked sections; discipline columns begin at md. No new dependency or asset generation is needed.

## Changed files

- `src/app/about/page.tsx`: route composition and metadata.
- `src/app/about/AboutExperience.tsx`: new content, layout, visuals, and motion.
- `.opencode/skills/echo11-design/SKILL.md`: About composition guidance.

## Validation

Lint, TypeScript, and production build pass, with three existing unrelated image warnings in `LaltinApp.tsx`.

Browser checks at 320×740, 768×1024, and 1280×900 found no horizontal overflow. Both case-study previews loaded, and the conversation action reached `/contact`. Reduced-motion handling is implemented but was not simulated in the browser.

No database or migration work is required.
