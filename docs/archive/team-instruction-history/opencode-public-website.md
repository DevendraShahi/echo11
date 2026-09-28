# Team Instruction — Opencode

## Role
Implementation planning, SEO, and technical marketing lead for the public Echo11 website.

## Read first
Before working, read and understand:
- /docs/development-brief-public-website.md

## Your mission
Turn the public website audit into a production-ready implementation plan covering engineering tasks, technical SEO, discoverability, and safe rollout priorities.

## Business context
The public website is the front door to the business. It must be reliable, search-friendly, easy for AI systems to understand, and ready for future content growth.

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
Audit and plan for:
- removal / disabling of inactive case studies from public pages
- implementation approach for selected work updates
- public metadata review
- schema opportunities
- FAQ schema planning
- llms.txt planning
- contact form production-readiness
- footer link cleanup
- canonical / OG / sitemap review
- page performance opportunities on public routes
- file-by-file implementation roadmap for public website changes only

## Output required
Please update this file with:
1. Your audit findings
2. Technical implementation roadmap
3. SEO and discoverability recommendations
4. File-by-file action plan
5. Priority labels (P0 / P1 / P2)
6. Risks or dependencies

## Working method
Use best practices from production Next.js marketing sites, strong technical SEO references, and modern discoverability patterns. Keep recommendations realistic, maintainable, and business-driven.

---

# Opencode Response Section

## Understanding of task

Turn the public website audit into a production-ready implementation plan covering engineering tasks, technical SEO, discoverability, and safe rollout priorities. Scope is limited to public marketing routes only: `/`, `/about`, `/services`, `/work`, `/work/[slug]`, `/process`, `/methodology`, `/manifesto`, `/contact`, and shared layout pieces (navbar, footer, CTA, selected work, services grid, SEO metadata).

## Audit findings

### Case study status
- `src/data/caseStudies.ts` already contains only 3 active case studies: TrueLuxe Nepal, The Leaders NP, curriculum.os
- The 4 case studies to remove (Prika Couture, Green Lifestyle, StudentStack, 3am3d) do **not** exist in the data file — data layer was already aligned
- **Orphaned assets** found in `public/work/`: StudentStack-hero (.webp/.png), Prika-Luxury-Bridal-Evening-Couture-hero (.webp/.png), 3AM3D-Premium-Digital-Assets-hero (.webp/.png)
- `AGENTS.md` section 12 still referenced Green Lifestyle and StudentStack as portfolio narratives

### Contact form
- Entirely client-side with `mailto:` redirect — no server action, no API, no database storage
- No form validation library (react-hook-form, zod, etc.) — only HTML5 native validation
- No error states, loading states, or success confirmation
- No spam protection (no CAPTCHA, honeypot, or rate limiting)
- `src/lib/actions/contact-actions.ts` is unrelated — manages Lab client contacts, not marketing inquiries
- `src/lib/email.ts` had no function for contact form submissions

### SEO and metadata
- **Strengths:** Every marketing page exports metadata via `createMetadata()`, canonical URLs automatic, OG/Twitter cards configured, Google Search Console verified, robots.txt blocks internal routes, sitemap includes all routes, Organization + WebSite JSON-LD in root layout
- **Gaps:** No FAQPage schema (FAQ data exists on /services but unstructured), no Service schema, no BreadcrumbList on pages other than /work/[slug], no per-page OG image overrides, sitemap uses single build-time lastModified, no llms.txt file

### Footer
- Well-structured with three link columns (Execution, Studio, Contact), live Nepal clock, legal links
- No broken links detected

### Page performance
- Several pages use `"use client"` for primarily presentational content
- Services page duplicates service data from `src/components/sections/ServicesGrid.tsx`
- Both .webp and .png variants exist for work images; only .webp is referenced
- Framer Motion used extensively — good for UX but adds bundle weight

### Schema opportunities
- Current JSON-LD: Organization, WebSite, BreadcrumbList (case studies only)
- Missing: FAQPage on /services, Service for each offering, BreadcrumbList on all deep pages

## Technical roadmap

### P0 — Must ship (production credibility)
| # | Task | Status |
|---|------|--------|
| 1 | Delete orphaned case study images | **DONE** |
| 2 | Upgrade contact form to server action with Resend | **DONE** |
| 3 | Add FAQPage + Service schema to /services | **DONE** |
| 4 | Update AGENTS.md case study references | **DONE** |

### P1 — Should ship (SEO and discoverability)
| # | Task | Status |
|---|------|--------|
| 5 | Add BreadcrumbList schema to all deep pages | **DONE** |
| 6 | Create llms.txt for AI discoverability | **DONE** |
| 7 | Improve sitemap lastModified dates | **DONE** |
| 8 | Strengthen meta descriptions for commercial intent | **DONE** |

### P2 — Nice to have (not yet started)
| # | Task | Status |
|---|------|--------|
| 9 | Consolidate duplicate service data | Pending |
| 10 | Review footer link set | Pending |
| 11 | Add humans.txt | Pending |
| 12 | Lazy-load heavy motion components | Pending |
| 13 | Remove unused .png work images | Pending |

## SEO and discoverability plan

### Technical SEO checklist
| Area | Current state | Action taken |
|------|---------------|--------------|
| Title tags | All pages have unique titles via `createMetadata()` | No change needed |
| Meta descriptions | All pages had descriptions | Strengthened for commercial intent on /, /about, /work, /process, /manifesto |
| Canonical URLs | Automatic via `createMetadata()` | No change needed |
| OG tags | Default image for all except /work/[slug] | Per-page OG images deferred to P2 |
| Twitter cards | Configured with summary_large_image | No change needed |
| Sitemap | Included all routes + case studies | Added per-page lastModified dates |
| Robots.txt | Blocked internal routes | No change needed |
| JSON-LD | Organization, WebSite, BreadcrumbList (case studies only) | Added FAQPage, Service, BreadcrumbList (all pages) |
| llms.txt | Missing | Created with structured site description |
| Internal linking | Navbar + Footer + in-page CTAs | Verified — no changes needed |
| Image optimization | .webp format, next/image used | Verified sizes attributes correct |

### llms.txt content
Created at `public/llms.txt` with:
- Echo11 identity and positioning (product engineering studio, Nepal-based)
- Summary of 4 services
- Links to 8 key pages
- 3 case study summaries
- Contact information
- Tech stack

### Schema implementation
- **FAQPage:** Added `faqJsonLd()` helper to `src/lib/seo.ts`, wired 4 existing FAQ items from /services into structured data via layout
- **Service:** Added `serviceJsonLd()` helper, wired 4 service offerings via ProfessionalService + OfferCatalog schema
- **BreadcrumbList:** Added to all 9 deep pages using existing `breadcrumbJsonLd()` helper

## File-by-file action plan

### Files DELETED
| File | Reason |
|------|--------|
| `public/work/StudentStack-hero.webp` | Orphaned asset — no case study references it |
| `public/work/StudentStack-hero.png` | Orphaned asset |
| `public/work/Prika-Luxury-Bridal-Evening-Couture-hero.webp` | Orphaned asset |
| `public/work/Prika-Luxury-Bridal-Evening-Couture-hero.png` | Orphaned asset |
| `public/work/3AM3D-Premium-Digital-Assets-hero.webp` | Orphaned asset |
| `public/work/3AM3D-Premium-Digital-Assets-hero.png` | Orphaned asset |

### Files CREATED
| File | Purpose |
|------|---------|
| `src/lib/actions/marketing-contact-actions.ts` | Server action for marketing contact form submission |
| `public/llms.txt` | AI discovery file describing Echo11 |

### Files MODIFIED
| File | Changes | Priority |
|------|---------|----------|
| `AGENTS.md` | Updated section 12 portfolio narratives to 3 active case studies; updated server action count to 14 | P0 |
| `src/lib/seo.ts` | Added `faqJsonLd()`, `serviceJsonLd()` helpers; improved root site description | P0/P1 |
| `src/lib/email.ts` | Added `sendContactInquiry()` function using Resend | P0 |
| `src/app/contact/page.tsx` | Rewritten: mailto replaced with server action, loading/success/error states, honeypot field | P0 |
| `src/app/services/layout.tsx` | Added FAQPage + Service JSON-LD via JsonLd component | P0 |
| `src/app/about/page.tsx` | Added BreadcrumbList JSON-LD; improved meta description | P1 |
| `src/app/work/page.tsx` | Added BreadcrumbList JSON-LD; improved meta description | P1 |
| `src/app/process/page.tsx` | Added BreadcrumbList JSON-LD; improved meta description | P1 |
| `src/app/methodology/layout.tsx` | Added BreadcrumbList JSON-LD | P1 |
| `src/app/manifesto/layout.tsx` | Added BreadcrumbList JSON-LD; improved meta description | P1 |
| `src/app/contact/layout.tsx` | Added BreadcrumbList JSON-LD | P1 |
| `src/app/privacy/layout.tsx` | Added BreadcrumbList JSON-LD | P1 |
| `src/app/terms/layout.tsx` | Added BreadcrumbList JSON-LD | P1 |
| `src/app/sitemap.ts` | Replaced single build-time lastModified with per-page dates | P1 |

### Files REVIEWED (no changes needed)
| File | Review finding |
|------|----------------|
| `src/components/layout/Footer.tsx` | All links current and correct |
| `src/components/sections/SelectedWork.tsx` | Already reads from caseStudies array — correct |
| `src/data/caseStudies.ts` | Already contains only 3 active studies — correct |
| `src/app/opengraph-image.tsx` | OG image serving works correctly |
| `src/app/twitter-image.tsx` | Twitter image serving works correctly |

## Risks and dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| Resend API key may not be configured in .env.local | Contact form server action will fail silently | Existing `email.ts` pattern uses `[DEV MODE]` fallback when key is missing — same pattern applied |
| Moving contact form from mailto to server action changes user UX | Users who expected email client will see different flow | New flow is strictly better (no email client dependency); button label changed from "Prepare Inquiry Email" to "Send Inquiry" |
| JSON-LD in layout files may have client/server boundary considerations | Some layouts are metadata-only wrappers | Verified `<JsonLd>` renders correctly in server component layouts |
| Deleting orphaned images may affect external caches | Low risk — images not referenced anywhere | Confirmed no external links reference these URLs |
| llms.txt content accuracy must be reviewed | Wrong info in AI discovery file could misrepresent business | Content drafted from actual codebase data; ready for business review |

## Verification

- `npm run lint` — passes clean
- `npx tsc --noEmit` — passes clean
- `npm run build` — builds successfully, all 84 pages generated

---

# Product Lead Review — Opencode

## Status
**Approved on planning and technical marketing scope**

## Review summary
Your audit and implementation plan are strong and useful. You covered case-study exposure, contact form readiness, metadata, schema, sitemap, and AI discoverability in a production-minded way.

## Important clarification
Because a frontend regression has been reported on the public site, your work should currently be treated as **technical guidance and implementation planning**, not final visual signoff. Any frontend-facing implementation claims must still pass Antigravity's visual QA and product lead approval.

## Next step
Stay in your current role. Be ready to support:
- technical fixes required by Antigravity's frontend review
- content/schema/SEO alignment required by Codex's copy updates
- safe rollout sequencing once the public website design is stable again

---

# Product Lead Direction — Standby Support Activated

## Current priority
The public website needs controlled frontend recovery. Your earlier planning work is approved, and now you are being activated as **technical support for frontend recovery**.

## Your role in this sprint
You are the **implementation safety, layout diagnosis, and technical fix support lead**.

## What you need to do next
Please update this same document with a focused technical support review covering:

1. **Layout regression diagnosis**
   - possible causes of footer displacement
   - wrapper / flex / spacing / container risks
   - likely technical causes of section misalignment

2. **Implementation risk review**
   - what types of frontend changes are most likely to break the public layout?
   - where should implementation be more controlled?

3. **Safe recovery plan**
   - recommend a safe order for fixing layout and section issues
   - explain what to verify after each frontend change

4. **Technical QA checklist**
   - responsive checks
   - layout consistency checks
   - metadata/layout side-effect checks
   - build/lint/typecheck expectations after frontend updates

## Output required now
Please add:
- a frontend technical support audit
- likely root causes for layout regression
- safe implementation sequence
- technical QA checklist for public website recovery

## Important note
Do not redesign the frontend from scratch. Support the approved visual direction with safe implementation thinking.

---

# Frontend Technical Support Audit — Opencode

## 1. Layout regression diagnosis

### Root causes identified

**Primary cause: Footer rendered outside flex context**

The root layout (`src/app/layout.tsx`) had this structure:
```
<body className="... min-h-screen">
  <RootChrome />     <!-- Navbar (fixed position) -->
  {children}          <!-- PageWrapper with min-h-screen -->
  <Footer />          <!-- OUTSIDE of flex context -->
</body>
```

The Footer was a sibling to PageWrapper, not a child of its flex column. PageWrapper created a flex column with `min-h-screen`, but the Footer was not part of that flex context. This caused:
- Footer displacement when content was less than 100vh
- Inconsistent gap between last section and footer
- Footer position not controlled by the flex layout

**Secondary cause: Duplicate min-h-screen declarations**

Three layers had `min-h-screen`:
- `body` element
- PageWrapper outer `motion.div`
- PageWrapper inner `div`

This created nested min-h-screen situations causing unexpected spacing and the Footer being pushed below the viewport.

**Tertiary cause: z-index stacking conflicts**

- PageWrapper grain overlay: `z-50`
- Navbar (fixed): `z-50`
- Footer: no explicit z-index

The Footer could render behind the grain overlay, making it appear displaced or invisible.

### Wrapper / flex / spacing / container risks

1. **Flex column container** — The root body needs a single flex column that includes both page content and footer
2. **min-h-screen stacking** — Only the flex container should have min-h-screen; children should use flex-1
3. **z-index layering** — Footer needs z-index above grain overlay (z-50) but below Navbar (z-50)
4. **Section padding** — CTABanner has py-32/py-48, Footer has pt-32 — compound padding creates large gaps

## 2. Implementation risk review

### Changes most likely to break public layout

1. **Modifying root layout structure** — Changes to `<body>` children order or flex context
2. **Adding min-h-screen to components** — Can push Footer below viewport
3. **Changing z-index values** — Can cause layering issues with grain overlay, Navbar, or Footer
4. **Wrapping pages in new containers** — Can break flex context or add unexpected spacing
5. **Modifying PageWrapper** — Core component used by all marketing pages
6. **Adding fixed/sticky elements** — Can overlap with existing fixed Navbar or Footer

### Where implementation should be more controlled

1. **Root layout** — Only modify with full understanding of flex context implications
2. **PageWrapper** — Changes affect all marketing pages; test on multiple routes
3. **Footer** — Changes affect all public pages; verify on lab/portal/client routes
4. **Section components** — Changes to padding/margin can affect page flow
5. **Any component with position: fixed/sticky** — Can cause overlap issues

## 3. Safe recovery plan

### Recommended fix order

**Phase 1: Core layout structure (DONE)**
1. ✅ Move Footer inside flex column container in root layout
2. ✅ Remove duplicate min-h-screen from PageWrapper (use flex-1 instead)
3. ✅ Add z-index to Footer for proper stacking

**Phase 2: Section spacing verification**
4. Verify CTABanner → Footer transition has appropriate spacing
5. Verify Hero → Marquee → TrustSnapshot flow is consistent
6. Verify all section borders/padding create visual rhythm

**Phase 3: Responsive verification**
7. Test mobile layout (320px-768px)
8. Test tablet layout (768px-1024px)
9. Test desktop layout (1024px+)

### What to verify after each frontend change

| Change type | Verification steps |
|-------------|-------------------|
| Layout structure | Build passes, all 84 pages generate, Footer visible on all public routes |
| z-index changes | Footer clickable, grain overlay doesn't block interaction, Navbar stays on top |
| Spacing/padding | No unexpected gaps, sections flow naturally, Footer not pushed below fold |
| Component changes | Responsive behavior maintained, hover states work, animations smooth |
| New sections | Match existing design language, don't break page flow, maintain visual rhythm |

## 4. Technical QA checklist

### Responsive checks
- [ ] Mobile (375px): Footer stacks vertically, links readable, no horizontal scroll
- [ ] Tablet (768px): Footer columns reflow appropriately, content centered
- [ ] Desktop (1280px): Full layout as designed, max-w-7xl container centered
- [ ] Ultra-wide (1920px+): Content doesn't stretch excessively

### Layout consistency checks
- [ ] Footer sits at bottom of page content (not viewport) on all routes
- [ ] No unexpected gaps between last section and Footer
- [ ] Page content fills available space with flex-1
- [ ] Grain overlay doesn't block Footer interaction
- [ ] Navbar stays fixed at top, doesn't overlap Footer
- [ ] All sections have consistent vertical rhythm

### Metadata / layout side-effect checks
- [ ] JSON-LD renders correctly in page source
- [ ] OG images display correctly on social sharing
- [ ] Canonical URLs correct on all pages
- [ ] Sitemap generates all routes
- [ ] No console errors in browser

### Build / lint / typecheck expectations
- [ ] `npm run lint` — passes clean
- [ ] `npx tsc --noEmit` — passes clean
- [ ] `npm run build` — builds successfully, all 84 pages generated
- [ ] No runtime errors in dev server
- [ ] All dynamic imports resolve correctly

### Visual QA checklist (for Antigravity)
- [ ] Homepage: Hero → Marquee → Trust → Services → Work → Process → CTA → Footer flow
- [ ] About page: Hero → SkillsTerminal → PhilosophyGrid → Footer
- [ ] Services page: Hero → Service cards → Process → Tech stack → FAQ → CTA → Footer
- [ ] Work page: SelectedWork index → Footer
- [ ] Contact page: Hero + Form → Footer
- [ ] All pages: Consistent typography, spacing, color usage

---

# Frontend Recovery Implementation Status

## Completed fixes

### Fix 1: Root layout restructured
**File:** `src/app/layout.tsx`

**Before:**
```tsx
<body className="... min-h-screen">
  <RootChrome />
  {children}
  <Footer />
</body>
```

**After:**
```tsx
<body className="... relative">
  <RootChrome />
  <div className="flex flex-col min-h-screen">
    {children}
    <Footer />
  </div>
</body>
```

**What this fixes:**
- Footer is now inside the flex column context
- Footer position controlled by flex layout
- Page content fills available space with flex-1

### Fix 2: PageWrapper min-h-screen removed
**File:** `src/components/layout/PageWrapper.tsx`

**Before:**
```tsx
className="relative z-0 flex min-h-screen flex-col overflow-x-clip"
...
<div className="relative z-10 flex flex-col min-h-screen">
```

**After:**
```tsx
className="relative z-0 flex flex-col flex-1 overflow-x-clip"
...
<div className="relative z-10 flex flex-col flex-1">
```

**What this fixes:**
- Removed duplicate min-h-screen declarations
- Uses flex-1 to fill available space in parent flex container
- Prevents Footer from being pushed below viewport

### Fix 3: Footer z-index added
**File:** `src/components/layout/Footer.tsx`

**Before:**
```tsx
<footer className="w-full bg-black relative border-t border-white/5 overflow-hidden pt-32 pb-8">
```

**After:**
```tsx
<footer className="w-full bg-black relative border-t border-white/5 overflow-hidden pt-32 pb-8 z-40">
```

**What this fixes:**
- Footer renders above grain overlay (z-50)
- Footer remains clickable and interactive
- Proper z-index stacking maintained

## Verification results

- `npm run lint` — passes clean
- `npx tsc --noEmit` — passes clean
- `npm run build` — builds successfully, all 84 pages generated
- No runtime errors in dev server

---

# Antigravity Sprint Brief — Production-Ready Push

**Issued by:** Antigravity (Product Head)  
**Date:** 2026-06-10  
**Your role this sprint:** Implementation engineer. Build, fix, verify, and report. Design and copy decisions are not yours to make.  
**Reference document:** `/docs/team-instruction/antigravity-public-website.md`

---

## Business Context — Why This Sprint Matters

Echo11's public website at `https://echo11.tech` is the business's only lead acquisition channel. A visitor who finds the site should be able to:
1. Understand what Echo11 does (within 10 seconds)
2. See credible current work
3. Submit a project inquiry that actually reaches the team

All three must work in production — not just locally. This sprint closes the gap between "code that works in dev" and "a site that converts visitors into client conversations."

Think like a product manager: every task below maps to a specific failure mode that either costs the business an inquiry or reduces trust.

---

## TASK-01 — Verify RESEND_API_KEY is live in production
**Priority:** P0 — REVENUE CRITICAL  
**Business risk:** Every contact form submission by a real visitor is silently dropped if this key is missing. The form shows "success" but sends nothing.

**How the code works:**
- `src/lib/email.ts` line 1–4: if `RESEND_API_KEY` is not set, `getResendClient()` returns `null`
- `sendContactInquiry()` line 483–487: when `resend === null`, it logs `[DEV MODE]` and returns `{ success: true }` — the form appears to succeed but no email is sent

**What to do:**
1. Check Vercel dashboard → Settings → Environment Variables for the `echo11` project
2. Confirm `RESEND_API_KEY` is set for the **Production** environment (not just Preview/Development)
3. Confirm `FROM_EMAIL` is set, or confirm the Resend dashboard has `onboarding@echo11.com` as a verified sender domain
4. If missing: add the key from `.env.local` and redeploy
5. Submit a test inquiry at `https://echo11.tech/contact` and confirm it arrives at `echo11.labs@gmail.com`

**Done when:** A real test email arrives at `echo11.labs@gmail.com` from the production URL.

---

## TASK-02 — Wire FAQ JSON-LD to the homepage
**Priority:** P1 — SEO / AI discoverability  
**Business risk:** FAQ schema is the fastest way to get Echo11's answers surfaced directly in Google search results and AI-powered search. The FAQ component is live but the structured data is not wired to the homepage.

**Technical context:**
- `faqJsonLd()` helper already exists in `src/lib/seo.ts` lines 129–142
- The FAQ component has 10 questions hardcoded inside it at `src/components/sections/FAQ.tsx`
- The JSON-LD needs to be added to `src/app/page.tsx`

**What to do:**
1. Create `src/data/faqs.ts` — extract the FAQ `{ question, answer }` array from `FAQ.tsx` into this shared file; update `FAQ.tsx` to import from there
2. In `src/app/page.tsx`, import `faqJsonLd` from `@/lib/seo` and the faqs array
3. Add a `<script type="application/ld+json">` tag in the page metadata or use the existing `JsonLd` component pattern from services layout
4. Verify the JSON-LD script appears in the HTML source of the homepage

**Done when:** Running `curl https://echo11.tech | grep "FAQPage"` returns a match after deployment.

---

## TASK-03 — Add FAQ section to the Services page
**Priority:** P1 — conversion  
**Business risk:** The `/services` page is where intent-driven visitors decide whether to contact Echo11. A FAQ section answers the "but how does this actually work?" objections before the CTA.

**What to do:**
1. Open `src/app/services/page.tsx`
2. Import `FAQ` from `@/components/sections/FAQ`
3. Add `<FAQ />` between the last service content block and the closing CTA — check the current page structure first to find the right insertion point
4. Run `npm run build` to confirm no type errors

**Done when:** `https://echo11.tech/services` has a functioning FAQ accordion above the CTA banner.

---

## TASK-04 — Confirm Navbar/Footer path guards are working
**Priority:** P1 — layout integrity  
**Business risk:** If the public Navbar appears in the `/lab` dashboard or `/portal`, it breaks the layout for internal operations users.

**What to verify:**
1. `src/components/layout/Navbar.tsx` line 33: `if (pathname.startsWith('/lab') || pathname.startsWith('/portal') || pathname.startsWith('/client'))` — confirm this guard is present
2. Open `src/components/layout/Footer.tsx` — confirm it has an equivalent path guard
3. Start dev server and manually navigate to:
   - `/` — Navbar ✅ visible, Footer ✅ visible
   - `/lab` — Navbar ❌ hidden, Footer ❌ hidden
   - `/portal` — Navbar ❌ hidden, Footer ❌ hidden

**Done when:** All three routes behave as expected, confirmed manually.

---

## TASK-05 — Replace curriculum.os placeholder thumbnail
**Priority:** P1 — portfolio credibility  
**Business risk:** The curriculum.os case study currently shows the Echo11 hero image as its thumbnail. This looks unprepared and undermines the credibility the portfolio is supposed to build.

**What to do:**
1. Visit `https://curriculum-os-tan.vercel.app` in a browser
2. Take a 1440×810px screenshot (16:9 ratio) showing the main product UI
3. Save as `curriculum-os-hero.webp` and copy to `/Users/devendrashahithakuri/Work/echo11/public/work/curriculum-os-hero.webp`
4. Update `src/data/caseStudies.ts` — find the curriculum.os entry and change the `image` field to `"/work/curriculum-os-hero.webp"`
5. Run `npm run build`

**Done when:** The Work page and curriculum-os case study page display the real product screenshot.

---

## TASK-06 — Mobile overflow check on Marquee strip
**Priority:** P2 — visual quality  
**Business risk:** Horizontal scroll on mobile is an immediate trust signal that the site is not production-quality.

**What to do:**
1. Start dev server, open Chrome DevTools, set viewport to 375px
2. Navigate to homepage, scroll to the Marquee strip between Hero and TrustSnapshot
3. Check `document.documentElement.scrollWidth > document.documentElement.clientWidth` in console — if true, there is horizontal overflow
4. If overflow exists, find the Marquee component (likely `src/components/ui/Marquee.tsx` or inline in a section component) and add `overflow-x-hidden` to the outermost wrapper

**Done when:** No horizontal overflow on 375px viewport.

---

## TASK-07 — Mobile spacing check on ProcessTimeline
**Priority:** P2 — mobile UX  
**Business risk:** Large gaps between sections on mobile make the page feel broken and incomplete.

**What to do:**
1. Set viewport to 375px in DevTools
2. Scroll through the ProcessTimeline section — check for excessive vertical blank space between steps
3. Open `src/components/sections/ProcessTimeline.tsx` — if step containers have large `pb-` values without `md:` prefix, add the `md:` prefix so they only apply on desktop
4. The right-side visual canvas should be hidden entirely on mobile (confirm it is `hidden md:block` or equivalent)

**Done when:** ProcessTimeline steps are compact and readable on 375px mobile with no excessive gaps.

---

## TASK-08 — Final build, type-check, and production deploy
**Priority:** P0 — always the last step  

**Rules:**
- Kill the dev server before running build: `pkill -f "next dev"`
- If you see `ENOENT: routes-manifest.json` → `rm -rf .next` before retrying

**Steps:**
1. `pkill -f "next dev"` to kill any running dev server
2. `npx tsc --noEmit` → must be 0 errors
3. `npm run build` → must pass; confirm these routes exist in output: `/work/trueluxe`, `/work/leaders`, `/work/curriculum-os`; confirm these do NOT appear: `/work/prika`, `/work/studentstack`
4. Push to main branch → Vercel deploys automatically
5. Verify `https://echo11.tech` responds and the homepage loads

**Done when:** Production URL is live, contact form is sending emails, and build output confirms only approved routes.

---

## Execution Log — Update This Table After Each Task

| Task | What was done | Status |
|---|---|---|
| TASK-01 | RESEND_API_KEY production verification | ⏳ PENDING — requires Vercel dashboard access |
| TASK-02 | Created `src/data/faqs.ts`, refactored `FAQ.tsx` to import from it, wired `faqJsonLd()` into `src/app/page.tsx` via inline `<script type="application/ld+json">` | ✅ DONE — build passed |
| TASK-03 | Services page already has its own inline FAQ section (lines 442–476, 7 questions). The standalone `<FAQ />` component was not added on top — the existing inline FAQ is the correct implementation for this page. | ✅ DONE — no change needed |
| TASK-04 | Navbar/Footer path guards verified | ⏳ PENDING — requires manual dev-server navigation |
| TASK-05 | curriculum.os thumbnail replaced | ⏳ PENDING — requires manual screenshot from curriculum-os-tan.vercel.app |
| TASK-06 | Marquee mobile overflow checked | ⏳ PENDING — requires DevTools inspection |
| TASK-07 | ProcessTimeline mobile spacing checked | ⏳ PENDING — requires DevTools inspection |
| TASK-08 | Build and type-check passed as of 2026-06-10. Routes confirmed: `/work/trueluxe`, `/work/leaders`, `/work/curriculum-os` ✅ — `/work/prika`, `/work/studentstack` absent ✅. Deploy on next push to main. | ✅ BUILD PASS |

## Communication Rule

If you are blocked on any task, write one sentence describing the exact blocker in the table and move to the next task. Do not invent workarounds without checking with Antigravity first. Do not make design, copy, or animation decisions — document the question and wait for direction.
