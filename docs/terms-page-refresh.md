# Terms page refresh — October 11, 2026

## Scope
Preserved the existing Terms hero and horizon, including its introduction, typography and spacing. Updated the revision date. Rebuilt the content below it with a brief overview, numbered sections, sticky desktop contents, a keyboard-operable mobile disclosure and direct terms/privacy contact navigation.

Extracted the approved Privacy reading layout into `src/components/marketing/LegalDocument.tsx`. Both routes share the same layout and Lenis-aware anchor navigation, with focus recovery and reduced-motion support. Privacy content is unchanged.

## Content
Distinguishes a public website inquiry from an accepted paid project. Covers scope and indicative pricing, Foundation/Custom exclusions, client inputs, agreed payment milestones, change approval, review/launch, custom ownership versus pre-existing/third-party licences, handover, support, showcase concepts, confidentiality, reasonable care, mandatory protections, cancellation and agreement amendments.

Removed blanket 50% deposits, 14-day payment/termination rules, 1.5% monthly charges, automatic extra-revision billing and a universal liability cap. The accepted project agreement now controls commercial specifics. No website update purports to amend an existing signed agreement.

## Reference guidance
- Ontario consumer protections: https://www.ontario.ca/page/your-rights-under-consumer-protection-act
- CIPO copyright ownership and written agreements: https://ised-isde.canada.ca/site/canadian-intellectual-property-office/en/copyright-learn-basics/copyright-learn-basics-protect-your-original-works-learn-why-copyright-matters

## Business confirmation before publication
Confirm the operator's registered legal identity/address, intended governing province, contract precedence, ownership/licence and portfolio permissions, actual payment/cancellation/support terms and any liability clauses with the studio's agreement template and legal adviser. These are business/legal facts that cannot be established from a frontend repository. This implementation does not certify enforceability or legal compliance.

## Verification
Lint, production build and TypeScript passed, with only the existing three LALTIN image warnings. Browser checks passed at 1280px, 390px and 320px: no horizontal overflow, one main/h1, mobile keyboard disclosure, section links with focus and 128px header clearance, and Privacy anchor regression after shared-layout extraction. No form submission, agreement acceptance or external publication occurred.

## Mobile index refinement
The shared mobile section disclosure sticks 60px below the primary header throughout the document. Its expanded list is bounded to the available dynamic viewport, supports independent scrolling, and closes before destination measurement on selection. Verified sticky placement on both routes and 128px destination clearance; lint, build and TypeScript pass.
