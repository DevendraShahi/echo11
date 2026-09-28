# Team Instruction — Codex

## Role
Copy, positioning, messaging structure, and narrative refinement lead for the public Echo11 website.

## Read first
Before working, read and understand:
- /docs/development-brief-public-website.md
- /docs/team-instruction/antigravity-public-website.md

## Your mission
Refine the public-facing messaging for Echo11 so the website is clear, natural, commercially credible, and easy to trust. Your work should improve how visitors understand what Echo11 does, who it serves, and why the team is a dependable product partner.

## Business context
The public site needs to act like a real commercial website for a growing product engineering studio. It should sound grounded, capable, and human. Messaging should support trust and conversion without hype, inflated claims, or artificial tone.

## Important case study updates
### Keep
- TrueLuxe Nepal
- The Leaders NP
- curriculum.os

### Remove from public marketing references for now
- Prika Couture
- Green Lifestyle
- StudentStack
- 3am3d

## Your focus areas
Audit and improve copy for:
- homepage hero and support copy
- homepage trust / proof / CTA sections
- about page
- services page
- work page intro and card summaries
- case study intros and supporting sections
- process page
- methodology page
- manifesto page
- contact page
- navbar and footer microcopy
- CTA banner copy
- FAQ draft content

## Copy direction
The writing should be:
- human
- calm
- specific
- commercially aware
- confident without hype
- easy to understand

Avoid:
- startup buzzword stacking
- cinematic or cryptic language
- robotic phrasing
- abstract lines that sound impressive but say little
- wording that feels obviously machine-generated

## Output required
Please update this file with:
1. Your audit findings
2. Page-by-page copy recommendations
3. Specific rewrite suggestions where helpful
4. A draft FAQ section (8–12 questions)
5. A final recommended brand voice summary

## Working method
Use the best references and practices from strong product studios, agency websites, and high-trust B2B service brands. Be creative, but stay practical and production-ready.

------

# Codex Response Section

## Understanding of task
Echo11 needs the public website to behave like a credible commercial website for a growing product engineering studio. The work is limited to public marketing pages and shared public layout, with `/lab`, `/portal`, and client surfaces out of scope. The active public portfolio should only include TrueLuxe Nepal, The Leaders NP, and curriculum.os.

## Audit findings
- The portfolio system was misaligned with the brief: public listings and generated case-study routes still included disabled work, while curriculum.os was missing.
- Homepage positioning was visually strong but needed a faster business answer: what Echo11 builds, who it helps, and why the process is dependable.
- The contact page looked like a form but prevented submission without sending or preserving inquiry data, creating a conversion dead end.
- Several public proof points used unsupported numeric claims. These risk reducing trust for an early-stage studio and should be replaced with factual, qualitative proof until verified metrics are available.
- Footer navigation included placeholder social links and labels that were less useful than clear service, process, work, and contact paths.
- Case-study and methodology pages used render-time random visual positions in client components, which can create hydration instability.

## Recommended information architecture
- Homepage: Hero, quick business snapshot, services, selected active work, process preview, final inquiry CTA.
- Services: lead with outcomes and engagement types, then show capabilities, delivery model, technology comfort, FAQs, and inquiry CTA.
- Work: show only approved live case studies, with concise context, services, product decisions, and qualitative outcomes.
- Case study detail: title, category, live-site CTA, context, services/tech/features, problems, execution approach, next case study, contact CTA.
- Process and methodology: keep both discoverable, but make Process the simple visitor-facing delivery overview and Methodology the deeper operating principles page.
- Contact: qualify inquiry by project type, timeline, budget range, company, and project details, with direct email as a fallback.

## Conversion improvements
- Homepage now adds a trust snapshot immediately after the hero so visitors can understand Echo11's offer before scrolling into detailed services.
- Selected work now uses the canonical case-study data so homepage, work page, sitemap, and case-study routes stay aligned.
- Contact form now prepares a structured email inquiry instead of silently blocking submission.
- Footer now acts as a navigation and trust asset with service, work, process, and contact paths instead of placeholder social icons.
- Public copy avoids fake metrics and overclaiming, favoring clear descriptions of launched work and delivery practices.

## Mobile UX notes
- Keep the CTA ladder simple on mobile: primary inquiry action first, work/process as secondary paths.
- Avoid burying project qualification fields below long explanatory copy; the current contact grid keeps the form reachable after the intro.
- Selected work accordion should remain scannable with three active projects; reducing the list materially improves mobile browsing.
- Case-study detail pages should favor readable context and short lists over dense visual effects.
- Footer link groups should remain compact and task-oriented on small screens.

## Prioritized actions
- P0: Remove disabled case studies from public data, listings, static params, sitemap, and internal navigation; add curriculum.os.
- P0: Fix contact-page submission so inquiries can actually reach Echo11 with useful lead context.
- P0: Remove unsupported public metrics and placeholder proof.
- P1: Add a concise homepage trust/positioning section between hero and services.
- P1: Improve footer navigation and remove placeholder social links.
- P1: Stabilize public client components that used render-time randomness.
- P2: Add a dedicated case-study image for curriculum.os when a business-approved screenshot or brand asset is available.
- P2: Consider consolidating or cross-linking Process and Methodology more clearly if analytics show visitor confusion.

## Implementation completed
- Updated the public portfolio data so only TrueLuxe Nepal, The Leaders NP, and curriculum.os are exposed through public listings, case-study routes, and sitemap generation.
- Added curriculum.os as an active case study with the provided live URL: https://curriculum-os-tan.vercel.app.
- Removed Prika Couture, Green Lifestyle, StudentStack, and 3am3d from public source references.
- Reworked selected work to read from the canonical case-study data instead of maintaining a separate duplicated project list.
- Clarified homepage first impression with a more direct hero message and a business snapshot section explaining what Echo11 builds, how it works, and why that matters.
- Improved the contact page into a lead-qualification flow with project type, timeline, budget range, company, and project details.
- Changed the contact form behavior from a no-op submit to a prefilled email inquiry to `echo11.labs@gmail.com`.
- Cleaned the footer into a trust/navigation asset by removing placeholder social links and adding clearer paths to services, process, work, and contact.
- Replaced unsupported numeric public proof claims with qualitative, factual outcome language.
- Removed overclaiming such as `Lighthouse 95+` and `24/7 Monitoring` from public service copy.
- Stabilized public client-rendered visual effects that previously used `Math.random()` during render on case-study and methodology pages.
- Updated global SEO description copy to better match the protected business message: product engineering studio, clear process, dependable execution.

## Files updated
- `src/data/caseStudies.ts`
- `src/components/sections/SelectedWork.tsx`
- `src/components/sections/Hero.tsx`
- `src/app/page.tsx`
- `src/app/contact/page.tsx`
- `src/components/layout/Footer.tsx`
- `src/app/methodology/page.tsx`
- `src/components/sections/ServicesGrid.tsx`
- `src/app/services/page.tsx`
- `src/lib/seo.ts`
- `src/app/work/page.tsx`
- `src/app/work/[slug]/CaseStudyContent.tsx`
- `docs/team-instruction/codex-public-website.md`

## Verification completed
- `npm run build` passed after clearing a stale `.next` build artifact.
- `npx tsc --noEmit` passed.
- Local dev server verification passed on `http://localhost:3001`.
- `/work/curriculum-os` returned `200`.
- `/work/prika` and `/work/studentstack` returned `404`.
- `/work` did not contain disabled project names after the update.

## Remaining follow-ups
- Add a business-approved curriculum.os screenshot or custom case-study image to replace the temporary Echo11 studio image.
- Consider replacing the mailto-based contact flow with a server-backed inquiry action if Echo11 wants stored lead history, automated acknowledgements, or CRM-style tracking.
- Use analytics or session recordings later to decide whether `/process` and `/methodology` should remain separate pages or be more tightly merged.

---

# Product Lead Direction — Role Update

## Why your role is changing
Antigravity is being moved onto frontend design and visual QA leadership. Your strength will now be used on messaging, positioning, and public-site narrative refinement.

## Your next step
Please use this same document for your next round and focus on:
- refining the homepage, services, work, contact, process, methodology, and manifesto copy
- keeping all public portfolio references aligned only to TrueLuxe Nepal, The Leaders NP, and curriculum.os
- producing production-ready copy guidance that implementation can follow without guesswork
- coordinating with Antigravity's frontend direction so copy and design support each other

## Important note
Your previous UX, structure, and conversion work is still valuable and remains part of the shared project artifact. Your active assignment from this point forward is copy and messaging leadership for the public website.

---

# Codex Messaging Round 2 — Copy, Positioning, and Narrative Refinement

## Active role confirmation
Codex is now responsible for public-site copy, positioning, messaging structure, and narrative refinement. This document is the owned working brief for that role. Future project-lead feedback should continue to be added here and treated as the source of truth for Codex's public-website messaging work.

## Round 2 copy audit findings
- The public site already had strong structural foundations, but several lines still sounded like polished agency shorthand rather than plain business communication.
- The strongest message is Echo11 as a practical product engineering partner for websites, portals, platforms, and internal tools. That message should stay visible before more abstract language about craft, systems, or methodology.
- CTAs were not fully consistent. “Book Discovery,” “Start Your Project,” and “Build Your Next Growth Product” implied different levels of commitment. The preferred CTA ladder is now closer to “Talk Through a Project,” “Start the Conversation,” and “View Current Work.”
- Services copy needed more buyer context: what the service helps with, what kind of work it covers, and why it matters after launch.
- Case-study copy needed to stay factual and current without inflated metrics or theatrical result language.
- Process, methodology, and manifesto pages were directionally strong but benefited from simpler language that explains how the work feels to a client.
- Contact copy should help prospects describe the project clearly, not just “submit a form.”

## Page-by-page copy recommendations
- Homepage: Lead with the practical offer: plan, design, and build reliable digital products. Keep the trust snapshot because it quickly explains what Echo11 builds, how the team works, and why that matters.
- Services: Keep the capability structure, but describe services in terms of concrete buyer needs: clearer inquiries, maintainable products, better user paths, post-launch support.
- Work: Keep the public portfolio narrow and explicit. “Current work” is more accurate than “archive” because only three approved projects are public.
- Case studies: Use calm narrative framing: context, problem, practical execution, qualitative outcomes. Avoid unverified growth metrics.
- About: Position Echo11 as a focused product team, not a dramatic studio brand. Emphasize clarity, stability, tradeoffs, and remote collaboration from Nepal.
- Process: Keep the visual delivery system, but describe steps in client-readable terms: shared understanding, useful screens, visible cycles, launch readiness.
- Methodology: Keep the principles, but make them practical. Replace abstract “systems thinking” language with planning data, roles, screens, and workflows early.
- Manifesto: Preserve the standards, but soften absolute phrasing. The page should sound like working principles, not slogans.
- Contact: Ask for the information needed to scope well: what exists, what needs to change, timeline, constraints, and budget range.
- Navbar and footer: Keep navigation direct and commercial. Main CTA should invite a conversation rather than imply a formal booking step too early.

## Specific rewrite direction implemented
- Hero headline changed toward: “Plan, design, and build software your business can rely on.”
- Hero support copy now names founders, growing teams, messy requirements, websites, product platforms, portals, and internal tools.
- Homepage trust copy now explains what Echo11 builds, how the team works, and what a client gets from that process.
- Services now use clearer descriptions for website design, app development, performance/SEO, and maintenance.
- Services FAQ now covers timeline, pricing, project scope, existing codebases, design support, ongoing support, and what Echo11 needs to start.
- CTA banner no longer uses “Growth Product.” It now asks whether the visitor needs a clearer path from idea to launch.
- About copy now describes Echo11 as a focused product team for serious digital work.
- Contact copy now asks prospects to explain what they are building, what exists today, and what needs to change.
- Footer microcopy now frames Echo11 as a Nepal-based product engineering studio for reliable websites, portals, and product systems.

## Draft FAQ section
1. **How long does a typical project take?**  
   Most engagements run 4-12 weeks depending on scope, dependencies, and how much product definition is already in place.
2. **How do you price your work?**  
   We scope around defined outcomes instead of open-ended hours. After discovery, you get a clear scope, delivery plan, and investment range.
3. **What is included in a standard project?**  
   A typical project includes planning, UX and interface design, frontend and backend engineering, QA, launch support, and handover documentation.
4. **Can you work with an existing codebase?**  
   Yes. We start by understanding the current system, identifying risk, and improving the product without disrupting what already works.
5. **Do you handle design as well as development?**  
   Yes. Product UX, interface design, and engineering are handled together so the design direction stays practical and buildable.
6. **Do you offer ongoing support after launch?**  
   Yes. Support can cover monitoring, bug fixes, small improvements, release help, performance checks, and technical guidance.
7. **What kinds of teams are the best fit for Echo11?**  
   Founders, small businesses, and growing teams that need a practical partner for websites, portals, platforms, internal tools, or product rebuilds.
8. **What do you need from us to start?**  
   A short description of the product, the business goal, timeline, constraints, and any existing brand, content, or technical assets.
9. **Can you help clarify the scope before we commit to a full build?**  
   Yes. Early discovery can be used to define the product shape, risks, priorities, and first useful release.
10. **What happens after we send an inquiry?**  
    Echo11 reviews the project details and responds with a practical next step based on scope, timeline, and fit.

## Final recommended brand voice summary
- **Human and clear:** Say what Echo11 does in normal business language before using design or engineering terminology.
- **Calm and credible:** Avoid overclaiming, exaggerated outcomes, and startup buzzwords. Confidence should come from specificity.
- **Commercially aware:** Tie technical work to practical business needs: clearer inquiries, maintainable systems, reliable launches, useful workflows.
- **Direct about tradeoffs:** Good messaging should acknowledge scope, constraints, risks, and the need for a realistic delivery path.
- **Grounded but polished:** The brand can feel premium through precision and restraint, not theatrical copy.

## Round 2 implementation completed
- Refined homepage hero, support copy, trust snapshot copy, selected-work intro, and global CTA banner.
- Refined about page hero and support copy.
- Refined services page service descriptions, delivery-step copy, technology support copy, FAQ answers, and CTA language.
- Refined case-study titles, taglines, descriptions, challenges, and solution language for the three approved public projects.
- Refined process timeline copy so the delivery system reads more clearly to prospects.
- Refined methodology principles, phase descriptions, support copy, and CTA language.
- Refined manifesto pillars, beliefs, and CTA copy to sound more practical and less slogan-heavy.
- Refined contact page lead-in, helper copy, placeholders, and submit button copy while preserving the server-backed inquiry behavior.
- Refined navbar CTA, footer summary, footer inquiry link, and global SEO description copy.

## Files updated in Round 2
- `src/components/sections/Hero.tsx`
- `src/app/page.tsx`
- `src/components/sections/ServicesGrid.tsx`
- `src/components/sections/SelectedWork.tsx`
- `src/components/sections/CTABanner.tsx`
- `src/app/about/page.tsx`
- `src/components/sections/SkillsTerminal.tsx`
- `src/app/services/page.tsx`
- `src/data/caseStudies.ts`
- `src/app/methodology/page.tsx`
- `src/components/sections/ProcessTimeline.tsx`
- `src/app/manifesto/page.tsx`
- `src/app/contact/page.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/Navbar.tsx`
- `src/lib/seo.ts`
- `docs/team-instruction/codex-public-website.md`

## Verification completed for Round 2
- `npx tsc --noEmit` passed.
- `npm run build` passed after moving a stale `.next` artifact to `/private/tmp/echo11_next_stale_messaging_round2_20260610`.
- Public source search found no active references to disabled case studies or routes: Prika Couture, Green Lifestyle, StudentStack, and 3am3d.
- Public source search found no active references to removed over-polished or unsupported phrases: “Growth Product,” “Book Discovery,” “Start Your Project,” “Complete Archive,” `24/7`, or `Lighthouse 95`.
- Production build still generates only the approved public case-study routes: `/work/trueluxe`, `/work/leaders`, and `/work/curriculum-os`.

---

# Product Lead Direction — Frontend Support Sprint

## Current priority
The public website needs stronger frontend quality, section usability, and page composition support.

## Your role in this sprint
You remain the **copy and messaging lead**, but you are also being assigned a **support role on frontend UX structure and page usability**.

## What you need to do next
Please update this same document with a focused support review covering:

1. **Section usability review**
   - do the current sections read clearly and in the right order?
   - where does the page feel heavy, confusing, weak, or unnecessary?

2. **Homepage flow support**
   - recommend the best order for trust, proof, services, work, FAQ, and CTA sections
   - identify where content and layout are not helping each other

3. **Conversion support for frontend**
   - identify places where visual structure weakens trust or action-taking
   - recommend how copy blocks should pair with layout blocks

4. **Page-level UX clarity**
   - home
   - about
   - services
   - work
   - contact

## Output required now
Please add:
- a frontend support audit
- page-flow recommendations
- section ordering recommendations
- UX and conversion notes for Antigravity to use during visual redesign

## Important note
You are not the final visual signoff owner. Your work in this sprint should help Antigravity and product lead make stronger frontend decisions.

---

# Codex Frontend Recovery Support — UX Structure, Page Flow, and Conversion Clarity

## Recovery support role
Codex remains the copy and messaging lead, but in this sprint Codex also supports Antigravity with UX structure, section usability, page flow, hierarchy, and conversion clarity. Antigravity remains the final owner for visual design quality and visual QA.

## Frontend support audit
- The public site should recover around a simpler narrative spine: what Echo11 does, who it helps, proof of current work, how delivery works, and how to start a conversation.
- The biggest UX risk is adding more sections without increasing clarity. New sections should only stay if they improve trust, explain the offer faster, or help a visitor decide whether to inquire.
- The homepage needs fewer competing “system” concepts. Hero, trust snapshot, services, process, methodology, and manifesto should not all feel like separate explanations of the same thing.
- Visual density should be controlled. The current brand can support cinematic sections, but the buyer journey still needs enough quiet space for comprehension.
- Footer recovery matters because it is the final trust and navigation checkpoint. It should not feel detached, misplaced, or visually weaker than the rest of the site.
- Current work should remain a proof section, not a large archive. Three approved projects are enough if the section clearly explains why each project matters.
- CTAs should stay consistent across layout states: “Talk Through a Project,” “Start the Conversation,” and “View Current Work.” Avoid introducing new CTA labels during visual recovery.

## Recommended homepage flow
1. **Hero**
   - Purpose: explain the offer within seconds.
   - Must include: clear headline, one support paragraph, primary CTA to contact, secondary CTA to current work.
   - Avoid: extra badges, multiple proof claims, or decorative copy that delays comprehension.
2. **Trust snapshot / business clarity strip**
   - Purpose: answer “what do you build, how do you work, why should I care?”
   - Recommendation: keep this section compact. It should visually feel like a bridge, not a full feature grid.
3. **Services / capabilities**
   - Purpose: show the work Echo11 can be hired for.
   - Recommendation: limit to 4 clear service categories and keep descriptions concrete.
4. **Selected work**
   - Purpose: prove the studio is active and credible.
   - Recommendation: show only TrueLuxe Nepal, The Leaders NP, and curriculum.os. Pair each with one clear project context line.
5. **Process preview**
   - Purpose: reduce delivery anxiety.
   - Recommendation: show the delivery path simply. Do not let animation or dense visuals make the process harder to scan.
6. **FAQ / buying clarity**
   - Purpose: answer timeline, scope, pricing model, existing-codebase, support, and next-step questions before contact.
   - Recommendation: add this before the final CTA if the page feels conversion-light.
7. **Final CTA**
   - Purpose: invite a qualified inquiry.
   - Recommendation: keep one primary action and one fallback email/contact path. Avoid oversized copy that competes with the hero.

## Section ordering recommendations
- **Keep near top:** Hero, trust snapshot, services.
- **Move after services:** Selected work. Visitors should understand what Echo11 offers before evaluating examples.
- **Keep after work:** Process preview. Once credibility is established, process answers “how would this work with us?”
- **Add or preserve before final CTA:** FAQ. It improves inquiry quality and reduces hesitation.
- **Keep final:** CTA banner, then footer. Footer should conclude the page, not feel like a second hero.
- **Avoid on homepage:** Long manifesto-style belief sections. Save those for `/manifesto` or `/methodology`.

## UX and conversion notes for Antigravity
- Pair short copy blocks with restrained layouts. If a section has only three short points, it should not become a visually heavy multi-card block unless the design adds clear hierarchy.
- The trust snapshot should feel like a premium editorial strip or compact proof band, not a generic SaaS feature grid.
- Service cards should make comparison easy. Keep title, description, and feature list aligned across cards so users can scan quickly.
- Selected work should visually communicate “current active work,” not “large agency portfolio.” Avoid language or layout that implies more public projects than are approved.
- Process visuals should support comprehension. If the right-side visual competes with the step copy, simplify the visual or reduce motion intensity.
- Contact page should prioritize form usability. Keep the lead-in text short enough that the form is visible early on common laptop screens.
- Footer should restore confidence at the end: concise studio summary, useful nav groups, direct email, legal links. Avoid placeholder social links or ornamental footer content that pushes practical links too far down.
- Mobile flow should compress without reordering the story: hero, trust, services, work, process/FAQ, CTA, footer.
- Sticky or animated sections must have a plain mobile fallback. Mobile users should not have to scroll through large empty visual space to understand the message.

## Page-level UX clarity recommendations

### Home
- Keep the homepage as the primary conversion path.
- The page should answer these in order: What does Echo11 do? Who is it for? What can they build? What proof exists? How does delivery work? How do I start?
- If visual recovery requires removing one section, remove or compress the weakest new trust/proof section before touching hero, services, work, or CTA.

### About
- About should deepen trust, not repeat the homepage.
- Recommended flow: studio positioning, working standards, capabilities/stack as supporting proof, CTA to talk through a project.
- Avoid making the terminal/capability section feel like the main story. It is supporting evidence.

### Services
- Services should be structured for buying clarity.
- Recommended flow: services hero, four service categories, delivery model, FAQ, CTA.
- The technology stack should support credibility but should not dominate above buyer questions.

### Work
- Work page should feel intentionally curated.
- Recommended flow: short intro, three active projects, clear project context, CTA to discuss similar work.
- Avoid “archive” framing unless inactive projects return and are business-approved.

### Case Study Pages
- Recommended flow: project context, live site CTA, business problem, execution approach, qualitative outcomes, next project/contact CTA.
- Keep metrics qualitative unless verified and approved.

### Contact
- Contact should reduce friction and improve inquiry quality.
- Recommended flow: short lead-in, fit signals, form, direct email fallback.
- Keep “budget range” optional. It helps scoping but should not feel like a blocker.

## Recovery sequencing recommendation
1. Stabilize global layout: navbar, page wrapper behavior, footer placement, section spacing.
2. Recover homepage flow: hero, trust bridge, services, selected work, process/FAQ, CTA, footer.
3. Recover key conversion pages: services, work, contact.
4. Then tune supporting trust pages: about, process, methodology, manifesto.
5. Run desktop and mobile visual QA after each sequence, not only at the end.

## Frontend recovery approval checklist from Codex perspective
- The first viewport explains Echo11 clearly without requiring scroll.
- Every homepage section has one clear job.
- CTAs use a consistent ladder and do not compete.
- Active work is limited to TrueLuxe Nepal, The Leaders NP, and curriculum.os.
- No section feels visually heavier than its message deserves.
- Mobile reading order remains clear and conversion-oriented.
- Footer appears as an intentional final trust/navigation section.
- Contact form is easy to reach, easy to understand, and clear about what happens next.

---

# Product Lead Update — Final Support Round

## Scope adjustment
Animation refinement is now being handled directly by Product Lead. You do not need to spend your next round on motion behavior or visual animation design.

## Your next task
Please update this document with a **final support pass** focused on:
- final homepage section ordering support for Antigravity
- copy-to-layout pairing notes for hero, trust, services, selected work, process, CTA, and footer
- UX clarity notes for services, work, and contact pages
- identifying any sections whose messaging should be shortened to improve visual breathing room
- a final CTA hierarchy recommendation across the public site

## Out of scope for your next round
- animation implementation
- visual-motion polish
- final visual signoff

## Deliverable standard
Your next update should help Antigravity and Product Lead make the final homepage and key-page layout decisions with less guesswork.

---

# Codex Final Support Pass — Homepage Flow, Copy-to-Layout Pairing, and CTA Hierarchy

## Final homepage section order recommendation
Use this as the recommended homepage structure for frontend recovery:

1. **Hero**
   - Job: explain what Echo11 does and route the visitor to either contact or work.
   - Keep it direct: headline, one support paragraph, two CTAs.
   - Do not add extra proof cards inside the first viewport.
2. **Business clarity / trust strip**
   - Job: quickly answer “what do you build, how do you work, why does it matter?”
   - Keep this compact and editorial. It should be a transition from hero into the body, not a heavy feature section.
3. **Services / core capabilities**
   - Job: show what Echo11 can be hired for.
   - Keep four service groups. This is where visitors decide whether Echo11 fits their need.
4. **Selected work**
   - Job: provide credibility through current, approved public projects.
   - Keep only TrueLuxe Nepal, The Leaders NP, and curriculum.os.
5. **Process preview**
   - Job: reduce risk anxiety by showing how the work moves from scope to launch.
   - Keep copy short and scannable. The process should reassure, not overwhelm.
6. **FAQ / buying clarity**
   - Job: answer practical objections before the final CTA.
   - If visual space is limited, use 5-6 high-value questions instead of all 10.
7. **Final CTA**
   - Job: invite a qualified inquiry.
   - Keep one strong action and one low-friction fallback.
8. **Footer**
   - Job: final trust and navigation checkpoint.
   - Must feel intentionally placed, not like a detached afterthought.

## Copy-to-layout pairing notes

### Hero
- Pair the headline with generous negative space and a clear primary CTA.
- Support copy should be one paragraph only. Avoid stacking proof, service lists, or process detail in the hero.
- Primary CTA: `Talk Through a Project`.
- Secondary CTA: `View Current Work`.

### Trust strip
- Use three compact items:
  - `What we build`
  - `How we work`
  - `Why it matters`
- Layout should feel like a horizontal editorial proof band on desktop and a tight stacked list on mobile.
- Avoid card-heavy styling if it makes the section feel like generic SaaS features.

### Services
- Each service block should have the same hierarchy:
  - service title
  - one plain-language description
  - 4-6 concrete features or deliverables
- Avoid long body paragraphs inside service cards. Keep descriptions to one or two lines where possible.
- Services should visually compare easily; uneven card heights or inconsistent detail levels will reduce scan quality.

### Selected work
- The layout should communicate a curated current-work set, not an archive.
- Each project needs:
  - title
  - category
  - one short context sentence
  - path to case study
  - optional live-site link
- Avoid presenting inactive projects or implying a larger public portfolio.

### Process
- Process copy should pair with a clear step layout.
- If the visual treatment is complex, shorten each step to one sentence and keep labels obvious.
- Do not pair process copy with multiple competing diagrams, numbers, or decorative systems.

### CTA banner
- Keep the CTA banner smaller than the hero in perceived importance.
- It should feel like the next practical step after a visitor has reviewed the page.
- Recommended message: need a clearer path from idea to launch; share goals, constraints, and timeline.

### Footer
- Footer should include:
  - concise studio summary
  - service/process/work/about/contact links
  - direct email
  - privacy/terms
- Do not push practical links below oversized decorative typography if that harms usability.

## UX clarity notes for key pages

### Services page
- Recommended flow: services hero, service categories, delivery model, FAQ, CTA.
- Move or visually reduce the tech stack if it competes with buyer questions.
- FAQ should be treated as conversion support, not an afterthought.
- The page should help a prospect understand what Echo11 does, what is included, how long it may take, and how to start.

### Work page
- Recommended flow: short intro, three active projects, project context, CTA.
- “Current work” is the right framing. Avoid “archive” unless inactive work returns.
- Each project card/detail should explain the product type and business problem, not only visual category.
- The page should make the small active portfolio feel intentional and credible.

### Contact page
- Recommended flow: short lead-in, fit signals, form, direct email fallback.
- Keep the form visible early on desktop.
- Budget range should remain optional and framed as helpful for scoping.
- The message field should prompt for: what exists today, what needs to change, audience, timeline, and constraints.
- Success state should set expectation clearly: inquiry received, review next, response follows.

## Sections to shorten for visual breathing room
- **Homepage trust strip:** keep to three items only. No extra stats unless verified and approved.
- **Services cards:** keep descriptions short; move longer explanation to service page body or FAQ.
- **Process preview:** shorten step descriptions if the visual section feels tall or dense.
- **CTA banner:** avoid hero-scale paragraphs. One headline, one short support paragraph, two actions maximum.
- **About terminal / capability block:** keep as supporting proof. If it visually dominates the page, reduce copy density or move deeper.
- **Footer:** keep practical links visible. Decorative brand typography must not crowd navigation.

## Final CTA hierarchy recommendation
Use a consistent CTA ladder across the public site:

1. **Primary CTA:** `Talk Through a Project`
   - Use in navbar, hero, about, methodology, manifesto, and key conversion moments.
   - Meaning: direct but not overly committal.
2. **Final CTA / action variant:** `Start the Conversation`
   - Use in final CTA banners where the visitor has enough context.
   - Meaning: warm, practical next step.
3. **Proof CTA:** `View Current Work`
   - Use as secondary CTA from hero, services, and final CTA areas.
   - Meaning: evaluate credibility before contacting.
4. **Form submit CTA:** `Send Project Inquiry`
   - Use only on contact form.
   - Meaning: clear transactional action.
5. **Avoid going forward:**
   - `Book Discovery` unless there is an actual scheduler.
   - `Start Your Project` because it sounds too committal.
   - `View Complete Archive` because the public portfolio is intentionally limited.
   - `Build Your Next Growth Product` because it sounds generic and over-polished.

## Final support recommendation for Antigravity
Recover the frontend around clarity first:
- Keep the homepage story linear.
- Make each section earn its place.
- Let short copy breathe instead of enclosing every point in heavy visual treatment.
- Preserve the premium dark Echo11 feel through spacing, hierarchy, and restraint.
- Treat the footer, FAQ, and contact page as conversion infrastructure, not secondary leftovers.

Codex is not providing animation or final visual signoff in this round. This pass is intended to reduce layout ambiguity for Antigravity and Product Lead.

---

# Product Lead Update — Break / Reference-Only Status

## Status
Codex is now on break from active public-website execution.

## Role change
Antigravity has absorbed the active responsibilities for:
- frontend recovery direction
- copy-to-layout coordination
- CTA hierarchy refinement
- animation direction support

## What this means
- Do not continue active changes in this phase unless specifically reactivated.
- This document remains part of the shared reference set.
- Your earlier work is still useful and may be used by Antigravity as supporting material.

## Current mode
Reference-only until reactivated.

---

# Product Lead Update — Ownership Returned

## Status
Product Lead has resumed full active ownership of the public website recovery and build phase.

## What this means
- Codex remains reference-only unless specifically reactivated.
- Earlier Codex recommendations remain part of the shared artifact set.
- Active implementation authority now sits with Product Lead.
