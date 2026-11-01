# Make it yours sizing refinement

The active route uses `FoundationsExperience.tsx`; the older `MakeItYoursPageClient.tsx` is not mounted by this page.

The existing showroom and project-fit flow are preserved. The page now follows the sizing and spacing of the updated About and Process routes:

- Hero: clamp(3.1rem, 8vw, 7rem), with a finite house word reveal.
- Section headings: one shared clamp(2.1rem, 4.5vw, 3.8rem), consistent weight, leading, and tracking.
- Labels: 10px mono with consistent tracking and contrast.
- Section spacing: 64px on smaller screens, 96px from sm; matched header spacing.
- Direction preview: 1.4fr/1fr split, giving the description more space beside the image.
- Prices wrap on narrow screens; recommendation actions fit within a 320px viewport.
- FAQ disclosures have consistent ruled rows, heading semantics, and visible actions.
- A compact showcase entry is merged beneath the direction preview, before the approach ledger. FORGE, LALTIN, and pizzaslice use the existing showcase imagery, with three columns from sm and stacked previews on mobile. One main link opens `/showcase`; each preview links to its corresponding section. A finite rule reveal and preference-aware hover motion keep the entry restrained. Concepts remain clearly labelled.

Changed: `src/app/make-it-yours/FoundationsExperience.tsx` and `.opencode/skills/echo11-design/SKILL.md`.

Validation: lint, TypeScript, and production build pass, with the three existing unrelated image warnings in `LaltinApp.tsx`. Browser checks cover desktop 1280×900, mobile 320×740, and tablet 768×1024. Mobile direction selection, the four fit steps, recommendation, and brief transition were verified without sending an inquiry. No horizontal overflow was observed in those states. Motion preference handling is implemented but was not simulated.

No dependencies, database changes, or migration work are required.
