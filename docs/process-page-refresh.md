# Process page refresh

The process route now speaks to a prospective website client: a clear direction, visible decisions, practical deliverables, and ownership at handover.

## Structure

1. “A clear way forward” hero with a conversation action and four linked stages.
2. Collaboration principles: scope, input, ownership.
3. Discovery, Design, Build, Launch articles with deliverables, client input, and a decision checkpoint.
4. Foundation / Custom timeline ledger using the shared offer data.
5. Native, keyboard-operable FAQs about readiness, feedback, scope changes, and ongoing care.
6. Closing invitation with contact and portfolio destinations.

Wide stages use two columns. Below lg, the introduction, house artwork, and deliverables stack in reading order. Small screens use a two-column stage index. Hairlines, Syne headings, mono metadata, and selective cyan carry the established site identity.

Finite word reveals, line draws, artwork entrances, and content lifts respect reduced motion. No scroll locks or stage content hidden behind tabs. Essential section headings stay visible. Existing licensed artwork is reused; no new library or asset dependency.

## Files

- `src/app/process/page.tsx`: route and updated metadata.
- `src/app/process/ProcessExperience.tsx`: new page composition, content, motion, and FAQs.
- `.opencode/skills/echo11-design/SKILL.md`: process page design guidance.

## Verification

- Production build, lint, and TypeScript checks pass; lint retains the three pre-existing image warnings in `LaltinApp.tsx`.
- Browser checks at 1280×900, 768×1024, and 320×740 found no horizontal overflow.
- Desktop Design and mobile Launch anchors settle approximately 112px below the viewport top, clear of the fixed navbar.
- All four artwork resources load; the first FAQ opens with Enter.
- Reduced-motion handling is implemented but was not simulated in the browser.

No database, dependency, or migration work is required.
