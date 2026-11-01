# Hero headline and CTA refinement — 10 October 2026

Scope: headline size, wrapping, supporting copy and action arrangement. The existing horizon CSS, PageWrapper, hero top offset, fonts, project spread, service articles, stage journey, About ledger and showroom selection flow are preserved.

- Work: shorter “Work with a clear purpose.” headline; 40–84px fluid type; copy and CTA beside the headline on desktop, natural reading order on mobile.
- Services: “A better website for your business.”; 40–73.6px type with a wider measure; supporting copy and actions form a separate row.
- Process: 44–92px headline with an inset lead/action column on desktop; shorter “Discuss your project” action. Stage journey unchanged.
- About: 40–92px two-part statement with a modest desktop indent on the second line; studio copy right and work link left below the title. Existing promise ledger unchanged.
- Make it yours: 48–96px title beside the lead; actions in their own row. Direction controls, previews, pricing and fit flow unchanged.
- Contact: 40–72px heading, readable sans supporting copy, consistent line rhythm.
- Manifesto and Methodology: fluid heading scales and sans prose instead of oversized mono descriptions.
- Case studies: fluid project title, safe wrapping for long names, readable sans tagline.
- Home: supporting copy at 16–18px and closer action spacing; kinetic wordmark and scene unchanged.

Hero actions retain their existing destinations and handlers. Text/action layouts stack below desktop; controls keep at least 48px height. GSAP owns the headline word reveal; Framer owns sibling lead/action entrances. A trailing line-height class prevents Tailwind Merge from dropping the heading rhythm when a route supplies its own font size.

Verification: lint, TypeScript, production build and live desktop/mobile inspection. Existing LALTIN image lint warnings remain unrelated to this change. Screenshots accompany this note.
