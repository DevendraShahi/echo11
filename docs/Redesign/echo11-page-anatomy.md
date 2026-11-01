# Echo11 page anatomy

**Status:** Proposed information architecture; requires content and repository audit  
**Version:** 0.1 · **Date:** 2026-10-01  
**Companion:** `echo11-frontend-foundation.md`. This document references its token roles; it does not supersede current Echo11 code.

> This document maps every public page and section to its content purpose, layout relationship, interaction states, and engineering responsibilities. It is not a design imitation of PRODUX and does not claim that any proposed effect currently exists in Echo11. Prioritize actual published offerings and real projects; omit empty sections.

## 1. Scope and release gates

### 1.1 Site versus platform
Echo11 has both an agency-facing web presence and SaaS/client-delivery ambitions. **OPEN:** Verify which routes are public marketing pages and which belong to authenticated product flows. Do not force dashboard UI into the marketing page system or treat public conversion sections as product features.

**KNOWN CONTEXT:** The owner likes most of the present UI; `/lab` is under development. Preserve working composition after a live/code audit. References to services, projects, and operational capabilities below are content candidates, not claims that Echo11 currently sells every item.

### 1.2 Priority tiers
- **Tier A:** Shared shell, Home, Work index, at least one substantive case study, Services, Contact, and legal/privacy links. Ship only pages with real content.
- **Tier B:** Process, About, second case study, accessibility page, and pricing/engagement explanation if commercial terms are settled.
- **Tier C:** Lab, Insights, expanded case studies, interactive experiments. Lab can be developed independently without blocking contact or service clarity.
- **Conditional:** Separate service detail routes, pricing configurator, multilingual routes, client portal entry points. Add only after product and content validation.

### 1.3 Definition of a finished page
Every route needs a real user question it answers, semantic heading structure, useful internal links, mobile reading order, page metadata/social preview, loading/error/empty states where relevant, working primary action, focus treatment, and tested reduced-motion behavior. No fabricated performance results, testimonials, collaborators, or client approvals.

## 2. Shared page shell

### Header and navigation
**Content:** Brand link, primary routes, clear contact action; optional client sign-in if actual product and authentication flows require it.  
**Anatomy:** Stable top edge and page gutter; active route indicator; menu button on constrained widths; skip link; explicit open/close state.  
**Behavior:** Keyboard/focus management, Escape close, pointer/touch parity, no hover-only destination. Scrolling behavior must not obscure anchors.  
**States:** Default, scroll/contrast variant if needed, menu opening/open/closing, route change, focus.  
**Avoid:** Animation that delays route activation or a canvas-only navigation layer.  
**Contracts:** `SiteHeader`, `PrimaryNav`, `MobileMenu`; use existing equivalents if they already work.

### Footer
**Content:** Short positioning line, contact route, relevant social/source links, service/work links, legal pages, copyright. Newsletter only if consent and actual publishing workflow exist.  
**Anatomy:** Distinct closing section with consistent outer alignment, not a crowded secondary homepage.  
**Behavior:** All links real and maintained; external destinations clearly identifiable where useful.

### Global media and transitions
Page backgrounds, visual treatments, and route transitions are optional layers. The DOM and content must render before they initialize. Any project-to-project color change must preserve contrast. See the separate future motion document for timeline details.

## 3. Home `/`

**Question answered:** What does Echo11 do, can I trust the work, and what should I do next?  
**Primary action:** View selected work or start a project, based on the actual commercial goal.  
**Sequence rule:** Each section must add evidence or clarity rather than repeating the hero proposition.

### H1. Hero
- **Content:** One concise positioning statement, one explanatory sentence, one principal action, optional secondary action. Avoid a wall of services in the opening screen.
- **Layout:** Dominant display type in a defined safe area; explanation in a narrower reading measure; clear control placement. Visual layer may bleed, but must not dictate reading order.
- **Visual function:** A single signature system or media artifact can establish technical craft; static poster/fallback carries the same essential message.
- **Interaction:** Optional user-initiated reel/scene; pause and audio controls if media demands them. The heading must not wait for scene initialization.
- **States:** Initial, settled, motion reduced, media unavailable, narrow viewport.
- **Data:** Copy, links, media/poster, captions/transcript as relevant; all approved.

### H2. Credibility strip (conditional)
- **Content:** Verifiable capabilities, legitimate clients, selected outcomes, or a short statement about operating model. If there are no publishable logos, omit logos.
- **Layout:** Small-scale type and close grouping establish a quieter beat after the hero.
- **Interaction:** None necessary; avoid moving logo marquees that imply more clients than exist.

### H2. Selected work
- **Content:** Two or three strongest projects, each with name, role, sector/problem, one short outcome or deliverable, media, and case-study link.
- **Layout:** Repeated alignment contract but varied media composition. Metadata sits next to its own project; caption proximity exceeds inter-project proximity.
- **Interaction:** Hover preview may enrich but not replace a text link. On touch, projects remain obviously selectable.
- **States:** Image load failure, no motion, project unpublished, different title lengths.
- **Boundary:** Summary is server-rendered; media enhancement or pointer effect is isolated.

### H2. What Echo11 does
- **Content:** Few clearly differentiated offers tied to client needs. Each says who it helps, what is produced, and where the detail lives.
- **Layout:** Editorial columns or rails; headings and summaries align predictably while their lengths vary.
- **Interaction:** Optional simple accordions only if hiding details improves comprehension; no obligatory scroll-jacking.

### H2. Proof in depth
- **Content:** One honest case study with problem, scope, decisions, artifact, and verified result if available.
- **Layout:** Wide artifact against narrow explanation to alternate the rhythm of previous sections.
- **Interaction:** Progressive diagram or before/after only when both states are genuine and keyboard operable.

### H2. Delivery and ownership
- **Content:** How work moves from discovery to launch/support; what the client receives; where responsibilities hand off.
- **Layout:** Sequence with restrained labels and clear stage boundaries; no forced equal-height cards.
- **Interaction:** Stage selection may update detail, but all stage summaries remain navigable and accessible.

### H2. Proof/testimonials (conditional)
- **Content:** Permissioned client statements with attribution, real metrics with measurement method, or concrete artifacts. If none are available, replace with delivery examples.
- **Layout:** Readable quotations or evidence panels, never anonymous filler.

### H2. Lab/insights preview (conditional)
- **Content:** Recent, maintained work that reveals capability; do not publish empty or stale teaser cards.
- **Layout:** Distinguish experiments from client projects through clear labels rather than gratuitous effects.

### H2. Final contact action
- **Content:** Specific invitation and next-step expectation. Contact details or form link must work.
- **Layout:** Visually conclusive; generous separation from footer but no duplicate full hero.
- **Interaction:** One clear action, no animated barrier.

## 4. Work `/work`

**Question:** What has Echo11 shipped, and is there a relevant example for my project?  
**Primary action:** Open a case study.

### W1. Intro and scope
Plain-language framing of what qualifies as work: commissioned delivery, independent builds, and experiments are explicitly differentiated. Intro remains concise; browsing starts quickly.

### W2. Featured project
One strong media presentation, project title, category, role, short context, and route. The whole panel need not be a giant inaccessible link; ensure a discoverable text action. Project media is aspect-ratio aware and has a proper poster/fallback.

### W3. Browseable index
- **Fields:** Title, year or status, discipline, concise result/deliverable, thumbnail, route.
- **Filters:** Add only if there are enough real projects to warrant categories. Filter state should be linkable via URL if it materially changes the view.
- **Sorting:** Clearly defined; not mysterious changing order or auto-rotating projects.
- **States:** No results, loading more if needed, keyboard focus, hover, touch, missing media.
- **Motion:** May reinforce change of selection; must not interrupt scanning or focus.

### W4. Next step
A services/contact bridge relevant to project exploration; not another identical hero.

## 5. Case study `/work/[slug]`

**Question:** What was the problem, what did Echo11 actually contribute, and what evidence supports the outcome?  
**Template rule:** Shared semantic structure with project-specific media, emphasis, and optional modules. No invented uniform metrics.

### C1. Project introduction
Name; one-sentence context; project status/date where meaningful; Echo11's actual role; scope and collaborators; hero artifact. If confidential, state limits instead of faking detail.

### C2. Brief and constraints
Problem, audience, starting point, deadlines/constraints as permitted. Use a constrained reading width; document screenshots are supporting evidence, not a replacement for explanation.

### C3. Approach
Critical decisions, tradeoffs, workflow, design/technical strategy. An architecture diagram may be interactive but must have a text equivalent. Identify which decisions were Echo11's versus the client's.

### C4. Execution chapters
Use project-specific chapters, for example: visual system, interface implementation, integration, deployment, automation, maintenance. Each chapter has an explanatory heading, bounded text, specific artifact, caption, and role attribution. Avoid a generic gallery of screenshots with no reasoning.

### C5. Result and ownership
Real deliverables, measurable result only if methodology/permission exists, launch link if live, what was handed off, and what ongoing work remains. An honest qualitative outcome is better than a fabricated percentage.

### C6. Next project / related service
One or two relevant routes, with a clear reason for the connection. Keep navigation usable without transitions.

**Case-study content shape (illustrative):**

```ts
type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  status: 'published' | 'draft';
  role: string[];
  services: string[];
  heroMedia: { src: string; alt: string; poster?: string };
  chapters: Array<{
    id: string;
    heading: string;
    body: string;
    media?: Array<{ src: string; alt: string; caption?: string }>;
  }>;
  outcome?: { claim: string; sourceOrMethod?: string };
  liveUrl?: string;
};
```

This type is conceptual; align to existing content architecture and validate any external URLs.

## 6. Services `/services`

**Question:** Which engagement fits my need, what do I receive, and how do we start?  
**Content gate:** Verify actual offerings, boundaries, and delivery capacity before publishing labels.

### S1. Service overview
Clear proposition and segmentation by client problem, not a long list of technologies.

### S2. Offer chapters
For each offer: audience/problem, scope, deliverables, typical collaboration pattern, relevant work, and CTA. Examples might involve web experiences, product engineering, and workflow automation **only if these are real Echo11 offers**. Use the same information order across chapters, with flexible visual treatments.

### S3. What is included versus optional
Use a simple comparison or explanatory list. State dependencies, ownership, hosting, maintenance, and third-party costs where appropriate. Do not imply guarantees that have not been agreed.

### S4. Working relationship
Connect to `/process`; describe decision-making, approvals, support, and the handoff in understandable terms.

### S5. Questions and contact
Answer genuine objections. Semantic accordion buttons may be used if helpful; content should still be crawlable and accessible.

**Optional `/services/[slug]`:** Create only when the offer can support its own distinct scope, process, deliverables, examples, FAQs, and metadata. Otherwise, keep a strong unified Services page.

## 7. Process `/process`

**Question:** What happens after I contact Echo11, and what do I need to decide?  
**Not a decorative timeline:** Each stage needs an output, owner, and decision point.

### P1. Overview
Working model and what varies by engagement; acknowledge that projects do not all follow an identical timeline.

### P2. Stages
Discovery → scope → prototype/design → implementation → validation → launch → support is an illustrative sequence, not a claim that the current operation uses all seven. For each verified stage: inputs, work performed, deliverable, client decision, and exit criteria. Stage summaries remain present in the DOM even if an interactive detail pane enhances them.

### P3. Collaboration mechanics
Meeting cadence, feedback collection, approval expectations, environments, access, and source ownership if established. Keep contractual commitments aligned with actual agreements.

### P4. Handoff and aftercare
Documentation, account/access transfer, deployment ownership, training, support boundaries, incident route if applicable.

### P5. CTA
The next action and what a visitor should send.

## 8. About `/about`

**Question:** Who is behind Echo11, what is the working philosophy, and can I trust the collaboration?**

### A1. Perspective
Personal or studio story in a concrete, concise voice. Avoid inflated size or invented team structure.

### A2. Capabilities and methods
How design, development, 3D, and automation are combined when relevant; connect claims to published work and examples rather than technology logos alone.

### A3. People and collaborators
Name real contributors and roles when permission exists. Distinguish founder, collaborator, and client.

### A4. Working principles
Few specific practices—documentation, accessibility, ownership, iterative review—backed by real process.

### A5. Next step
Relevant path to Work, Services, or Contact.

## 9. Lab `/lab`

**Question:** What is Echo11 experimenting with, and what can a visitor try or learn?  
**KNOWN CONTEXT:** This route is an active area for improvement. Audit the current version before changing the visual language.

### L1. Framing
Explain the distinction between experiments, reusable tools, prototypes, and client delivery. State maturity honestly.

### L2. Experiment index
Each item has title, status, concise hypothesis, technology/technique when relevant, preview/poster, and link to demo or article. Filters are conditional on catalog size.

### L3. Experiment detail (optional `/lab/[slug]`)
Purpose, interaction instruction, implementation notes, performance limitations, accessibility fallback, screenshots/recording, and source link if public. A demo can be heavy, but the containing page should still load and explain itself without WebGL.

### L4. Learning and transfer
What the experiment proved or failed to prove and whether the technique has been used in shipped work. This makes Lab credible rather than just a visual gallery.

**Lifecycle:** Draft → tested → public experiment → archived/maintained. An archived experiment should retain context and label broken dependencies rather than silently disappearing.

## 10. Insights `/insights` and article routes

**Question:** What does Echo11 know, and can I use this information?  
**Gate:** Do not ship a blog with generic filler articles.

### I1. Index
Short editorial intro; article title, topic, published/updated date, summary, and cover only when it adds information. Topic filters/search are optional at small scale. Avoid a news-site density that conflicts with a studio portfolio.

### I2. Article `/insights/[slug]`
Title, standfirst, author, accurate date, table of contents only for long pieces, constrained reading column, useful subheadings, captions/code styles, related reading, and relevant contact route. Keep effects subtle during reading.

### I3. Governance
Define author, review, update, broken-link checks, and how technical claims are sourced.

## 11. Pricing or engagement `/pricing` (conditional)

**Question:** What kind of scope or commitment should I expect?  
**Gate:** Confirm whether public rates, starting budgets, packages, or custom quotes are commercially appropriate.

### R1. Engagement models
Explain what is fixed versus variable: build, retainer, consultation, maintenance, or another verified model. Avoid false precision.

### R2. Scope drivers
Explain factors that affect effort—content readiness, integrations, design depth, accessibility, migration, and support—without implying an instant binding price.

### R3. Example scopes (conditional)
Publish only if representative, current, and explicitly framed as examples. Link to relevant work.

### R4. FAQ and brief
Address payment, ownership, changes, timelines, and next steps consistently with actual policies. A scope builder can structure an inquiry, but should not output a misleading final quote.

## 12. Contact `/contact`

**Question:** How can I start, and what happens after I submit?  
**Primary action:** Submit a project inquiry or use an explicitly available alternative contact method.

### CT1. Invitation
Specific expectation on response channel/timing only if it can be honored. Offer a short alternative for visitors who are not ready for a full brief.

### CT2. Project form
Potential fields: name, contact, organization, project type, goals, budget range, timeframe, relevant links, and optional detail. Collect only information the team will use. No mandatory file upload without clear storage/privacy arrangements.

### CT3. Form states
Idle; invalid; submitting; submitted; recoverable failure; duplicate prevention. Inputs preserve values on recoverable failure; success message says what actually happened, not that a meeting is booked unless it is. Server validation and spam protection remain necessary even with client validation.

### CT4. Privacy and alternatives
Link the actual privacy policy near submission. Accessible errors, labels, focus, and status announcements. Provide an alternative route if form submission fails.

## 13. Legal and accessibility pages

**Privacy:** What data is collected by forms/analytics, purposes, retention, processors, contact route, effective date. Must reflect actual infrastructure; review by qualified counsel as needed.  
**Terms:** Engagement versus site-use terms must not be conflated; use approved legal text.  
**Accessibility:** Statement of approach, known limitations if any, how to report issues, date and scope of review. Avoid unverified conformance claims.  
**Cookie information:** Provide only when tracking technologies and relevant consent requirements make it necessary; match real implementation.

These pages use readable article typography, restrained widths, headings, internal anchors if long, and working footer links; no cinematic gating.

## 14. Cross-page component inventory

| Component contract | Reused on | Required semantics | Optional enhancement |
|---|---|---|---|
| `PageIntro` | Work, Services, About, Lab, Insights | H1 + supporting content | Controlled reveal |
| `ProjectFeature` | Home, Work | Project link, title, role, media alt | Hover/transition media |
| `ProjectMeta` | Work, case studies | Definition-list-like label/value | None |
| `MediaFrame` | Work, case studies, Lab | Media, alt/caption, fallback | Scroll depth/parallax |
| `ReadingBlock` | Case studies, services, articles | Heading, paragraphs, links | Subtle entry |
| `ProcessStep` | Home, Process | Ordered phase and deliverable | Progress indicator |
| `ServiceChapter` | Home, Services | Offer and linked detail | Diagram |
| `EvidenceBlock` | Home, Work, case studies | Claim + evidence/provenance | Optional data visualization |
| `QuestionGroup` | Services, Pricing | Button/heading and answer | Accessible accordion |
| `FinalCTA` | Most marketing pages | Distinct route-specific next action | Minimal transition |

Use existing implementations when suitable. Contracts are conceptual; no requirement to create one generic mega-component for all cases.

## 15. Content and route governance

- Keep routes stable; establish redirects before renaming published slugs.
- Draft content cannot appear in indexes or sitemaps until approved.
- Each page has unique title, description, canonical policy where needed, and meaningful social image.
- Project/client names, logos, metrics, photographs, and testimonials require approval and provenance.
- Each repeated section has a missing-content behavior: omit, replace with a legitimate alternative, or clearly mark unavailable. Never auto-generate proof.
- Prefer realistic examples over an inflated page count. If Work has only one strong item, a curated index can still be credible.

## 16. Audit and acceptance matrix

| Page | Content verified | Mobile/keyboard | Meta/share | Reduced motion | Forms/data | Status |
|---|---|---|---|---|---|---|
| Home | OPEN | OPEN | OPEN | OPEN | N/A | Proposed |
| Work | OPEN | OPEN | OPEN | OPEN | Project data OPEN | Proposed |
| Case study | OPEN | OPEN | OPEN | OPEN | Results provenance OPEN | Proposed |
| Services | OPEN | OPEN | OPEN | OPEN | Offer scope OPEN | Proposed |
| Process | OPEN | OPEN | OPEN | OPEN | Operating model OPEN | Proposed |
| About | OPEN | OPEN | OPEN | OPEN | People/claims OPEN | Proposed |
| Lab | OPEN | OPEN | OPEN | OPEN | Demo lifecycle OPEN | In development; audit first |
| Insights | OPEN | OPEN | OPEN | OPEN | Publishing workflow OPEN | Conditional |
| Pricing | OPEN | OPEN | OPEN | OPEN | Commercial approval OPEN | Conditional |
| Contact | OPEN | OPEN | OPEN | OPEN | Delivery/privacy OPEN | Proposed |
| Legal/accessibility | OPEN | OPEN | OPEN | OPEN | Policy review OPEN | Proposed |

**Review rule:** Before any page is implemented or redesigned, compare this outline with the actual route and mark sections KEEP, CHANGE, ADD, or OMIT. Approval of this document's information architecture is not approval to replace existing Echo11 UI.

## 17. Further documentation

- `echo11-frontend-foundation.md`: Approved architecture and design system after audit.
- `echo11-motion-and-interactions.md`: Effect-by-effect technical contracts, fallbacks, performance and reduced-motion details.
- `echo11-reference-research.md`: PRODUX and other reference observations, verified separately from Echo11 implementation.

**Reference context:** PRODUX's public routes include a homepage, Work, Studio, Journal, Lab, a `/service/*` family, and Contact. *Corrected 2026-10-02:* this sentence previously described that set as a navigation structure, which it is not. The live homepage carries no top navigation and no `<nav>`, `<form>`, or `<button>` element; its navigation is a four-item bracket list — `[Work] [Studio] [Journal] [Contact]` — plus a mobile-only footer stack that also links `/lab`, while the `/service/*` family is not linked from the homepage at all. The list above is therefore a **route inventory**, not a description of how the site is navigated. This informs the *questions to ask* about page purpose; it does not prescribe Echo11's visual layout or content. See https://www.produx.design/ , https://www.produx.design/work , https://www.produx.design/studio , https://www.produx.design/lab , and https://www.produx.design/contact ; for the dated observation, `echo11-reference-research.md` §12; and for the verbatim markup, `evidence/produx-home-ssr-2026-10-02.md`.
