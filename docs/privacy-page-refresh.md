# Privacy page refresh — October 11, 2026

## Scope
Preserved the existing hero, horizon, introduction copy and spacing. Only its revision date changed. Rebuilt the policy below it with an overview, desktop contents rail, native mobile contents disclosure, numbered sections, readable sans body text, a responsive browser-storage ledger and direct privacy contact links. Essential policy content is visible HTML without scroll-triggered reveals.

## Content basis
Inspected website-inquiry-actions.ts, website-region.ts, CurrencySwitcher.tsx, Supabase clients, workspace persistence and SplashScreen.tsx. The policy describes inquiry fields, campaign/source/country context, workspace records, Supabase, Resend, browser storage and processing outside Canada. Removed unsupported newsletter language and universal rights claims.

Primary guidance consulted:
- https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/
- https://www.priv.gc.ca/en/privacy-topics/airports-and-borders/gl_dab_090127/

## Operational facts to confirm before publishing
The repository cannot establish the operator's registered legal name and postal address, actual hosting/log-retention settings, processor regions, contractual privacy arrangements, or retention/deletion schedules. Confirm those details with the studio owner and update the policy where necessary. No specific deletion deadline, data residency, security certification or full legal-compliance guarantee has been invented. Any analytics or advertising added through infrastructure outside this repository must also be included.

## Verification
Lint, production build and TypeScript checks passed. Lint/build report only the three existing LALTIN image warnings. Browser checks covered desktop at 1280px and mobile at 390px/320px, contents navigation, keyboard disclosure, focus recovery, heading structure and no horizontal overflow. Section links synchronise with Lenis and respect reduced motion. Browser error log was empty. No inquiry or privacy request was submitted.

## Mobile index refinement
The shared mobile section disclosure sticks 60px below the primary header throughout the document. Its expanded list is bounded to the available dynamic viewport, supports independent scrolling, and closes before destination measurement on selection. Verified sticky placement on both routes and 128px destination clearance; lint, build and TypeScript pass.
