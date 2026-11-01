# Echo11 art-direction audit

## Direction

**Concept:** The signal becomes a system.

Echo11 should remain a dark-first, technically precise studio. The visual goal is not to reproduce PRODUX; it is to make a strong statement, show relevant proof early, and let each interaction explain a real relationship between strategy, interface, engineering, and operation.

## What stays

- Near-black foundation, warm white typography, sharp geometry, and the controlled cyan accent from `src/app/globals.css`.
- The split typography system: expressive `Syne` for statements and `JetBrains Mono` for metadata, labels, and controls.
- The existing App Router, Tailwind tokens, `Container`, `PageWrapper`, typed case-study data, image optimization, and working project-inquiry flow.
- The current routes for Home, Work, case studies, Services, Process, About, Contact, Lab, and Make It Yours.
- Motion as an enhancement with reduced-motion support—not a requirement to access content or operate controls.

## What changes

| Surface | Current risk | Production direction |
| --- | --- | --- |
| Home | The hero and early sections compete through several ambient effects and generic card patterns. | One statement-led hero, two featured projects, a concise offer, a process spine, proof, Lab preview, then contact. |
| Hero | The Three.js point field reads as visual noise instead of revealing a meaningful relationship. | A lightweight SVG/CSS “11” rails signal system, with a static/reduced-motion fallback. No ambient canvas by default. |
| Selected work | All projects share one interaction treatment, weakening the strongest evidence. | Make two priority projects editorial feature panels; retain the archive link and normal navigation fallback. |
| Services | A four-card grid explains categories but not the transformation Echo11 delivers. | Frame each offer as input → working system → outcome, with concrete deliverables and an engagement fit. |
| Process | Existing animation is visually ambitious but needs an explicit client-facing handoff and approval story. | A progressive vertical spine: discover, scope, prototype, build, test, launch, support. Each phase names deliverables and client decisions. |
| Make It Yours | The product model is now correctly separated from client work. | Keep the live coded direction catalogue, route selection, and inquiry handoff; continue to treat client sites as proof rather than inventory. |
| Contact | Conversion must remain quiet and immediate. | Preserve the working form, validation, privacy link, and success state; do not introduce scroll capture or a cinematic form transition. |

## What defers until there is real content

- Lab editorial cards, Insights, and Pricing need actual experiments, articles, or supportable scope information before being promoted as major navigation destinations.
- A WebGL carousel belongs in Lab or a single selected project only after a static version proves the story works.
- Testimonials, metrics, and claims require real permission and source material. Do not manufacture them.
- Lenis and GSAP are not baseline dependencies. Evaluate them after the static responsive architecture is stable.

## Motion contract

1. **Baseline:** CSS and Framer Motion feedback for focus, hover, navigation, and reveal.
2. **Narrative:** One authored sequence on the homepage process spine or a project transition, responsive by breakpoint.
3. **Immersive:** At most one scene in the marketing path. It must have a static fallback, respect reduced motion, and never intercept normal page reading.

All controls must work with keyboard navigation; all links must navigate without a transition; content must exist before any animation begins.

## First production milestone: Homepage editorial pass

1. Set final positioning and available project assets.
2. Build a static responsive homepage in this order: hero → two projects → offer → process → proof → Lab preview → contact.
3. Replace generic card-grid effects with project-specific art direction and the “11 rails” motif.
4. Add only the motion that clarifies the section relationship.
5. Check keyboard order, reduced motion, narrow layouts, image loading, and production build.

## Validation criteria

- A visitor understands within one screen what Echo11 does and what action to take.
- Within the first two sections, a visitor sees real project evidence rather than abstract decoration.
- Every interactive effect has a non-animated fallback.
- No full-page noise, automatic scroll smoothing, or decorative canvas obscures text.
- Marketing claims map to an actual case study, service, operating practice, or inquiry workflow.
