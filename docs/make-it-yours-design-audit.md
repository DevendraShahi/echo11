# Make It Yours: design and flow audit

Reviewed 9 October 2026. This is an audit and proposed direction, not an implemented redesign.

## Scope and evidence

Reviewed the rendered `/make-it-yours` page at 1440 × 1000, 390 × 844, and 320 × 740; the fit menu, default recommendation, online-store recommendation, inquiry steps, and empty-form validation. Checked `?path=custom` and the homepage's `?path=foundation&reference=commerce-story` entry. Compared its components and content with the homepage, Services, Contact, shared navigation, and published offer data.

The active route renders `FoundationsExperience.tsx`, not the older `MakeItYoursPageClient.tsx`. Findings below concern the active experience. An empty submit was used only to trigger local validation; no inquiry was sent. Successful delivery, real server failures, a physical mobile keyboard, and screen-reader announcement behavior were not tested. Accessibility and failure-handling observations marked **Code** are source findings, not claimed browser reproductions.

**Assessment:** the page already has Echo11's visual foundation. Its weakest part is the buying sequence: a visitor sees an assumed recommendation, makes the same choices again, then completes a long form. Improve the decision structure before adding decoration.

## Issue register

**P1:** fix before shipping the revised flow. **P2:** material clarity, layout, or accessibility improvement. **P3:** polish. **Observed:** browser or rendered-content evidence. **Code:** implementation evidence. **Design:** judgment rather than a broken behavior.

| # | Priority / evidence | Issue and consequence | Recommended change |
|---|---|---|---|
| 1 | P1 · Observed + Code | **Hero CTA goes to the wrong section.** “Start the fit check” calls `moveToInquiry`, which scrolls to `#inquiry`. The final settled destination was inquiry at 112px below the viewport top. It skips both questions and the result. | Send this action to `#fit-check`; keep the result action going to the brief. |
| 2 | P1 · Observed + Code | **The visitor's answers are invented on first load.** All five inputs have defaults and the result immediately says “Your answers fit…” without a visitor making any choice. | Use unanswered states, or explicitly label a default as an example. Reveal a recommendation only after enough answers are confirmed. |
| 3 | P1 · Observed + Code | **The Custom entry invents a private-account requirement.** `?path=custom` presets “Sign in, manage an account, or use a private workflow,” even when someone wants an original public marketing site. | Keep requested route and functional requirements as separate state. Never fabricate a requirement to force a route. |
| 4 | P1 · Observed + Code | **Homepage direction does not initialize project type.** Commerce arrives with its name attached but the questionnaire still selects “Service or marketing website” and recommends Foundation. | Carry the direction's actual `projectType`, display a readable reference, and let the visitor confirm it. |
| 5 | P1 · Observed + Code | **Commerce promises disagree across pages.** Home introduces all three directions as Foundation starting points, including Commerce and a path to purchase. Here selecting any online store forces Custom. | Establish one offer policy. If Foundation is marketing-only, clarify that Commerce is product storytelling without checkout; otherwise define when a standard store qualifies. Update both surfaces together. |
| 6 | P1 · Observed + Code | **Out-of-scope applications inherit website pricing and timing.** Web app/platform yields Custom's published starting price and 6–10 weeks, followed by a disclaimer that a full application is outside these routes. | Show “Needs a scoped conversation” for an application; avoid attaching website estimates to a different engagement. |
| 7 | P1 · Code | **The form and recommendation can disagree.** The brief has independent route/type controls. “Continue with Foundation” only scrolls; after a manual Custom choice it does not confirm Foundation in the brief. | Use one shared selection state, with an explicit override and explanation if changing the suggested route is allowed. |
| 8 | P1 · Code | **Upstream edits silently reset form choices.** The form synchronization effect overwrites route/type whenever recommendation inputs/reference change; it can also clear budget. | Preserve deliberate overrides or visibly ask the visitor to reconcile them. Explain when an edit invalidates an estimate. |
| 9 | P2 · Code | **Submission recovery has a gap.** The client awaits the action without `try/catch/finally`; an unexpected rejected transport/action promise can leave “Sending” active. The server does catch normal internal failures. | Add client failure recovery and preserve the brief. This is a resilience risk, not an observed outage. |
| 10 | P2 · Design | **Foundation and Custom are explained too late.** The visitor is asked technical questions before seeing a plain comparison of the two delivery models. | Put a concise comparison before the fit check: proven structure adapted to the brand versus an original scope built around requirements. |
| 11 | P2 · Design | **The opening headline creates tension with the offer.** “Not a template” leads with an objection, while Foundation explicitly reuses a proven page system. | Lead with the positive promise: “A starting point. Made yours.” Explain reuse plainly rather than sounding defensive. |
| 12 | P2 · Observed / Design | **Copy is unnecessarily abstract.** “Scope-fit guide,” “price frame,” “opening page of your scope,” and “the two numbers every scope is confirmed against” make a simple decision harder to understand. “Answer honestly” feels judgmental. | Use “Find the right website approach,” “starting price,” “Tell us what you need,” and “We confirm scope, cost, and timing with you.” |
| 13 | P2 · Observed / Design | **The questionnaire assumes technical certainty.** Custom data structures, role-specific content, connected systems, and URL restructuring have no examples or “Not sure” route. | Add short examples and an uncertainty option. Uncertainty should invite review, not automatically mean a more expensive route. |
| 14 | P2 · Observed + Code | **Catalogue options have unclear scope.** “Modest” and “larger” have no boundaries, and every store becomes Custom regardless of the catalogue answer. | Use understandable ranges or complexity examples; condition questions on previous answers and agreed offer policy. |
| 15 | P2 · Code / Design | **Conflicting answers are possible.** Online store can coexist with an information/contact-only journey, and SaaS marketing can be confused with an authenticated product. | Explain website versus product scope and flag contradictory choices without silently changing them. |
| 16 | P2 · Observed + Code | **The read-back misstates integration needs.** “None or one standard integration” becomes “One integration.” | Preserve the actual meaning: “No integration or one standard connection,” or collect these separately. |
| 17 | P2 · Code / Design | **Custom reasoning is mostly generic.** Except commerce, it says “At least one requirement…” without naming the answer that triggered the route. | Show a short reason list derived from the actual selected requirements. |
| 18 | P2 · Observed / Design | **The recommendation is remote from the questions.** The visitor can change a selection without seeing the result update because it sits in the following full section. | Use a compact sticky desktop summary or an explicit “See my recommendation” action after confirmed answers. Mobile should advance intentionally to the result. |
| 19 | P2 · Observed / Design | **The inquiry asks for route and project type again.** These were already chosen and used to produce a recommendation; the additional step feels like restarting. | Replace it with an editable summary. Continue directly into the useful brief fields. |
| 20 | P2 · Observed / Design | **There are two competing progress systems.** Page sections 01–03 are followed by another 01 of 02 / 02 of 02. “Next: budget and timing” actually reveals contact fields first. | Use one decision sequence and accurate step names; rename the action “Continue to your brief” if that is what appears. |
| 21 | P2 · Observed / Design | **The field order puts identity ahead of purpose.** Name, email, company, website, budget, timeline appear before “What has to change?” | Prefer outcome first, budget/timing second, then contact. Keep only fields needed to reply and scope. |
| 22 | P2 · Observed + Code | **Internal reference syntax appears in the form.** `fit:service:public:pages:simple:light:none` is visible beneath “Attached from the fit check.” | Render human-readable answers/direction; keep the serialized tracking string internal. |
| 23 | P2 · Code | **Success wording overstates approval.** “Route confirmed” appears immediately after receipt, although scope is still subject to review. | Say “Brief received” and “Requested route.” Explain that final scope and timing are confirmed after review. |
| 24 | P2 · Design | **There is little decision support near the price.** The page lists broad inclusions but not clear boundaries for page count, content preparation, third-party costs, migration, ongoing support, or ownership. | Add concise scope notes using approved commercial facts. Mark unsettled items as confirmed during discovery; do not invent inclusions. |
| 25 | P2 · Design | **Evidence and visual direction disappear after Home.** The only large visual is abstract spokes, with no practical example of what a Foundation adapts or the carried direction. | Keep a compact relevant project/direction preview using existing `ProjectMedia`; explain that reference work is evidence, not a design for sale. |
| 26 | P2 · Design | **Common objections interrupt the inquiry.** There is no short FAQ explaining reuse, Custom differences, commerce eligibility, ownership, or when timing starts. | Add four or five useful questions before the brief, following Services' question/answer rows. |
| 27 | P2 · Observed / Design | **Mobile opening is too long for a task-led page.** At 390px the hero alone measured about 1084px; artwork and the stacked three-link index precede the questions. | Shorten the introduction, move or reduce the decorative figure, and use one compact progress row. Keep the primary action early. |
| 28 | P2 · Observed / Design | **Mobile cumulative height obscures the sequence.** A details/error state measured about 6523px total; fit, result, and inquiry were roughly 1150px, 1019px, and 1989px. These are state-dependent measurements, not fixed dimensions. | Remove duplicated selection and introductions; show one focused step at a time, with deliberate header-offset alignment on advance/back. |
| 29 | P3 · Observed / Design | **Utility type receives too much responsibility.** Important labels, route explanations, form values, and consent use small muted mono text; some are 9–11px. Contrast compliance was not numerically tested. | Use readable sans for decisions and prose; retain mono for numbers, prices, and compact labels. Increase essential label size/contrast and measure it. |
| 30 | P2 · Observed + Code | **Validation does not guide recovery.** Empty submit leaves focus on “Send the brief,” produces six errors, and every invalid field lacks `aria-describedby`. Required fields also lack programmatic required semantics. | Associate errors with inputs, announce a short error summary, move focus to the first invalid field, and make required/optional status explicit. |
| 31 | P2 · Code | **Result accessibility is too broad and incomplete.** The entire result section is a polite live region, while its useful answer receipt is `aria-hidden`. Announcement verbosity requires screen-reader testing. | Keep the summary accessible; announce only a concise route-change message in a separate status region. |
| 32 | P2 · Observed + Code | **Shared copy changes between Home and this page.** Navigation switches from “Start a project” to “Book Discovery,” while the destination is an inquiry. Footer labels switch from Services/Contact/Our work to Execution/Network/Archive. Page naming also alternates between Make It Yours, Foundations, and a guide. | Use one navigation CTA and naming system across public pages. Choose a clear page title and explain Foundation/Custom beneath it. |

## What should stay

- Black/near-black surfaces, Syne display type, JetBrains Mono utility type, and deliberate cyan.
- Shared `Container`, horizon atmosphere, fine rules, and restrained geometry.
- Existing licensed artwork and finite motion; the problem does not require another visual library.
- Starting-price and typical-timing language, with final scope subject to review.
- The two delivery routes, regional currency control, optional current website, and privacy link.
- Responsive stacking: there was no document-width overflow at 320px or 390px in the inspected states. Long select values wrapped rather than being clipped. The page is not fundamentally broken on mobile.

## Recommended direction: an editorial decision studio

This is the strongest fit with the current site: **the homepage's direction selector and focused process panel, combined with Services' clear scope rows and Contact's next-step reassurance.** It should feel like one purposeful conversation, with one active decision at a time.

### Proposed content order

1. **Promise and first action.** “A starting point. Made yours.” Supporting copy: “Choose a proven website foundation or an original build. We shape the design, content, and experience around your business.” Primary action: “Find my approach.” A quiet alternative can let visitors compare both routes. Keep one modest shape in the desktop composition.
2. **See the two approaches.** Two open editorial columns on desktop, stacked rows on mobile. Foundation: adapted proven structure. Custom: original scope for specific requirements. Each gets who it fits, starting price, typical timing, and a few important boundaries. Currency belongs beside prices.
3. **Choose or confirm a direction.** Reuse Home's Commerce / Service / Product interaction, with one preview and explanation. If a direction came from Home, show that selection first instead of restarting. This band depends on resolving Commerce policy; do not sell checkout under a marketing-only Foundation.
4. **Check requirements.** A compact indexed questionnaire. Desktop: question rail and active answer panel, with a restrained summary alongside. Mobile: one expanded question at a time; on explicit advance, align its heading below the measured header, using the homepage process's established Lenis/reduced-motion behavior. Include “Not sure.” Avoid forcing scroll while someone is merely reading.
5. **Show one clear recommendation.** Route name → actual reasons → starting price/timing → inclusions and boundaries → “Continue with this approach.” Offer a visible edit action. For unsupported applications, show a scoped-conversation path without published website estimates. Update shared state once.
6. **Answer useful questions.** Four or five ruled FAQ rows: what gets adapted, what needs Custom, ownership, commerce eligibility, and how delivery timing is confirmed. No new card system.
7. **Send one short brief.** Editable selection summary, outcome, budget/timing, then name/email/company as needed. No repeated route selection stage. Include “What happens next” and an email alternative, as Contact already does. End with an accurate receipt message.

If the page becomes too long, combine steps 3–5 into one interactive band. The sequence above defines information priority, not a requirement for seven tall sections.

### Desktop composition

Use a calm split hero rather than making it taller. Keep the display headline dominant, with the primary action near its explanation. Reuse the homepage's vertical rail / one active panel structure for the interactive band. Place the relevant preview in that panel instead of repeating decorative shapes between sections. Align numbers, answer controls, prices, and action baselines to the same container grid. Scope and FAQ rows should follow Services' ruled editorial treatment.

### Mobile composition

Show promise → short explanation → action before artwork. Collapse the approach comparison into readable rows, not narrow columns. Direction tabs can follow Home's existing mobile pattern. The fit check gets a compact progress indicator, one open question, readable answer choices, and explicit Next/Back. Preserve answers across navigation. When a step changes, align it intentionally below the actual fixed header; reduced motion uses immediate positioning. Put the result immediately after the final confirmed answer and carry it into the brief.

### Visual and motion resources

Reuse `HomeProcessExperience`, `MakeItYours`, `ProjectMedia`, Services' artwork shelf, `RevealText`, Framer Motion, Radix Select, Lucide arrows, and the existing Lenis instance. Use a short panel entrance and a single active cyan rail. Animate the decorative shape once; do not animate layout, gate critical controls on an entrance, add continuous attention-grabbing effects, or introduce elaborate arrows simply to imply a flow.

## Suggested implementation order

1. Resolve offer policy and naming, particularly Commerce, applications, and what Foundation includes.
2. Fix the CTA destination, fabricated defaults, direction carry-over, and shared selection state.
3. Remove duplicated form decisions and rewrite the copy around a single sequence.
4. Apply the editorial panel layout and mobile step alignment using existing components.
5. Add practical preview/proof, compact scope notes, and FAQ reassurance.
6. Repair validation and submission recovery; check keyboard, screen reader, reduced motion, and real mobile keyboard behavior.

Acceptance should include both Home entry paths, answer edits after a manual override, unsupported applications, currency changes, 320/390px layouts, desktop keyboard navigation, empty validation, rejected requests, and a deliberately authorized test submission. Run lint, type-check, and build when implementing. This audit changes documentation only, so application checks were not rerun.

## Source map

- `src/app/make-it-yours/page.tsx`: active component and URL input.
- `src/app/make-it-yours/FoundationsExperience.tsx`: defaults (36), routing (44), receipt labels (57), initialization (158), scroll handler (173), hero CTA (211), live result (330), scope/application note (366), brief wiring (400).
- `src/app/make-it-yours/NextStepBrief.tsx`: field presentation (55), synchronization (120), focus changes (130), validation (168), submission (183), success wording (237), repeated route/type (296 onward), details (402 onward), raw reference (512 onward).
- `src/lib/website-offers.ts`: canonical route definitions (44) and available directions (183).
- `src/components/sections/MakeItYours.tsx`: homepage promise and actual direction links (192).
- `src/components/sections/HomeProcessExperience.tsx`: focused panel and mobile alignment precedent.
- `src/app/services/ServicesExperience.tsx` and `src/app/contact/page.tsx`: scope, question rows, and conversion reassurance.
- `src/components/layout/Navbar.tsx` and `Footer.tsx`: route-dependent shared copy.

The older `docs/make-it-yours-product-brief.md` describes a direction-first experience, while the active page is fit-first. Treat that as an alignment decision to resolve, not proof that unused legacy UI is broken.
