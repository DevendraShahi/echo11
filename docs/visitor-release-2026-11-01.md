# Visitor release — November 1, 2026

Scope: the visitor website and its portfolio only. No Lab, Client or legacy Portal implementation was changed in this pass. Existing uncommitted work was retained.

## Finished

- Canonical public portfolio now contains 13 projects, including the new LALTIN case study. FORGE and LALTIN are the two interactive concepts shared by the static Showcase and Make it yours spread.
- Home features FORGE, LALTIN and TrueLuxe. Work's first editorial story is LALTIN; FORGE no longer claims to be the single newest build.
- pizzaslice is removed from project lists/previews and retained unlisted with noindex. Its underlying route/assets remain available for future work.
- BudgetMate's unfinished record is retained as a draft and excluded from public case studies, generated routes, imagery spread and sitemap.
- The old video reel is hidden because it contains pizzaslice and obsolete names. Its media and playback implementation remain available for a later edit.
- Removed unsupported Leaders/Green Lifestyle outcome metrics. Specific technology stacks render only for FORGE/LALTIN, whose source was inspected; older data remains available for future verification.
- Missing public deployments no longer produce a false WIP watermark. Green Lifestyle is labelled as historical platform work with editorial imagery; its dead public link was removed.
- Case-study cover images retain their brightness, live-image actions have accessible names, and particle positions are deterministic to avoid server/client hydration differences.
- FORGE/LALTIN concept pages explain simulated pricing/planning and use meaningful studio inquiry links instead of unfinished contact placeholders. LALTIN's planner explicitly makes no reservation and sends no request.
- Added current live concepts to the sitemap and clarified concept metadata/canonicals. LALTIN modal images now use Next Image; lint warnings are cleared.

## Visitor inquiry behavior

The local configuration has no Resend key, and the read-only inquiry-table request did not succeed. Production environment variables could not be inspected with the available Vercel access. Therefore the default release behavior is an explicit email handoff:

1. Visitor completes a brief.
2. “Prepare email brief” shows a reviewable draft.
3. Visitor opens their email application or copies the brief, then sends it themselves.

The UI states that nothing has been sent or saved to the studio inbox. Edit preserves the entered information. Privacy copy describes this behavior. No test email or lead was submitted.

The existing hosted submission action is retained. `NEXT_PUBLIC_WEBSITE_INQUIRY_MODE=hosted` is an explicit opt-in after the deployed table and actual notification delivery have been verified. Default/unset mode prepares email. This is a build-time public setting; rebuild after changing it.

## Link evidence

Read-only HTTP checks on November 1 returned 200 and the expected site titles for:

- TrueLuxe: `https://true-luxe-nepal.vercel.app`
- Leaders: `https://the-leadersnp.com`
- Ivision: `https://ivision.echo11.tech`
- DateDrop: `https://datedrop-me.vercel.app/`
- CurriculumOS: `https://curriculum-os-tan.vercel.app/`

Green Lifestyle's previous URL returned 404. No replacement URL was invented. A 200 home page does not certify checkout, account flows, or the entire external product.

## Verification

- Lint: passed, no warnings.
- TypeScript: passed.
- Production build: passed, including Showcase regeneration with 13 projects.
- Current published records: unique IDs, local image paths, live concept IDs, draft exclusion, unsupported metric removal and generated gallery consistency passed.
- All 25 current public content pages loaded locally. All 98 checked internal destinations/fragments resolved, with no failures.
- Browser verified gallery Grid selection, 13 projects, and absence of pizzaslice, BudgetMate and the old reel.
- Browser verified Contact's complete draft-preparation path and preservation of entered details after Edit. No email application was opened and nothing was sent.
- Phone layout smoke checks at 390 × 844 passed for Home, Work, LALTIN/Green case studies, Make it yours, Contact, Showcase, LALTIN and FORGE: no document overflow or failed completed image loads observed.
- Desktop concept spread visually reviewed. No exhaustive accessibility, reduced-motion or external product transaction certification is implied.

## Deployment state

Not deployed. The connected Vercel project summary identifies `echo11` in team `team_lHOzOzOdLd35PbMpAk7roqSw`, with `echo11.tech` among its domains. Environment inspection returned 403; CLI checks using both the known team ID and the `echo11-labs` slug returned “specified scope does not exist.” The connected team list was empty.

Publishing needs a Vercel connection or CLI identity with access to the existing Echo11 team/project. Do not create a replacement project, deploy the old Git snapshot, weaken deployment protection, or claim the local working-tree changes are live. The latest recorded project deployment in the returned summary was ERROR; no deployment or promotion was performed in this pass.

## Main files

- Portfolio: `src/data/caseStudies.ts`, `scripts/generate-showcase.cjs`, generated `public/showcase.html`.
- Visitor features: `FeaturedWork.tsx`, `LiveShowcase.tsx`, `SelectedWork.tsx`, `EditorialWork.tsx`, `ProjectMedia.tsx`, `stack-spread.tsx`.
- Concepts: `ConceptSpread.tsx` and its CSS, `src/app/laltin`, `public/showcase/forge/index.html`, pizzaslice metadata.
- Brief handoff: `InquiryEmailDraft.tsx`, `ProjectInquiryForm.tsx`, `NextStepBrief.tsx`, `.env.example`.
- Supporting copy/metadata: Privacy, Terms, sitemap, AGENTS.md and the project design guidance.

## Owner link update

JayVis is confirmed at https://jayvis.echo11.tech (200, expected studio title). Its live link and the public GitHub source links for JayVis, ExpressSocialNP and StepOutInStyle now appear in case studies and the generated Showcase. The owner-supplied http://devendrashahi.me/ExpressSocialNP/ and its HTTPS version returned 404, as did the former github.io path. StepOutInStyle’s matching github.io/custom-domain paths also returned 404. Source repositories remain available; dead deployment URLs are not exposed as live-site actions.
