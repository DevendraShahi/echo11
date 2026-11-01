# Navigation and footer audit — October 11, 2026

## Decisions
- `/process`: **How we work**. A direct, visitor-facing description of the delivery journey; clearer than Methodology.
- `/about`: **About us**. Studio identity, capabilities, principles and ownership; clearer than a separate Manifesto.
- `/work`: **Our work**. Case studies and project context.
- `/showcase`: **Showcase**. Interactive project browsing and live concepts, distinct from written case studies. Retained and added to the sitemap/footer.
- `/make-it-yours`: **Make it yours**. Retained: describes the established approach-selection and fit experience.
- `/contact`: **Start a project**. Matches the actual brief flow and navigation action. Normalised competing page/layout metadata titles.
- Privacy and Terms retain their specific legal names.

`src/data/navigation.ts` supplies the shared header/footer labels; About, Process and Work metadata use it too. The footer retains its existing visual composition and now offers Services, Studio and Contact groups, named navigation landmarks, a project action and email.

## Duplicate content and old URLs
Methodology's six-stage delivery narrative duplicated Process and used broader technical claims. Useful scope/success-criteria and technical-dependency planning was folded into Process Discovery; integration/data/access boundaries were folded into Build. Manifesto's clarity, usefulness, craft and transparent decisions were already represented in About standards. Its maintainable-tool principle is now explicit in About's engineering discipline. No extra repetitive sections were added.

`/methodology` permanently redirects (308) to `/process`; `/manifesto` permanently redirects (308) to `/about`. Their canonical metadata points to the retained pages and redirect URLs are omitted from the sitemap. Existing bookmarks remain useful.

## Other link conflicts corrected
The old footer advertised four disciplines but all four links went to the top of Services, whose actual offers are Business websites, Website redesigns and Online stores. New links use those real names and IDs. The shared route-scroll controller now honours cross-route fragments instead of forcibly resetting the destination to the page top. The static Showcase generator uses About us consistently.

## Verification
Lint, production build and TypeScript passed (only three existing LALTIN image warnings). Browser checks confirmed 1280px desktop and 390px mobile footer/header labels, no horizontal overflow, working mobile menu, both legacy URL redirects, and Services anchors across routes and within Services. Route scrolling honours the destination’s scroll margin as well as header clearance. No external site publication or account changes.

## Country-affiliation removal
Removed studio location wording from About, Contact, Work, Services, the homepage stack-spread caption, footer, metadata, Privacy/Terms and the invoice sender. Removed the entire footer country/status badge. Legal text retains international-processing and applicable-law explanations without presenting a specific studio location. Source audit leaves only the functional CAD currency name; no public studio-affiliation labels remain.
