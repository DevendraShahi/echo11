# Echo11 homepage — designer review brief

Reviewed October 9, 2026. Surface: `/`, served locally at http://localhost:3000/.

This describes the current working-tree implementation, including existing uncommitted changes. It is a review handoff, not a proposed redesign. No application code was changed.

## Review scope and evidence

The homepage route, all eight following content sections, hero, global navigation/footer, shared media components, typography/color/layout tokens, and motion infrastructure were inspected. Browser observations covered 1440 × 900 desktop, 390 × 844 mobile-width, and a 320 × 700 narrow-width hero check. The mobile navigation was opened and closed; the direction selector was switched from Commerce to Service and back.

Viewport resizing does not simulate a touch device. Actual phone performance, touch behavior, browser chrome changes, landscape orientation, zoom, screen-reader usability, and reduced-motion rendering still need dedicated validation. Reduced-motion behavior below is based on source inspection. Screenshots of a motion-based page can capture transient states; review the live page as well.

## What the page is trying to communicate

Echo11 is a Canada-based website studio offering a senior team across strategy, design, and engineering. The page moves from an expressive brand entrance to work evidence, then to an understandable starting offer and delivery process. Its primary conversion is **Book Discovery → `/contact`**. Secondary paths are the work archive, individual case studies, services, and a direction-specific brief through `/make-it-yours`.

Sequence: navigation → hero → client/concept strip → statement → delivery facts → capabilities → featured work → website directions → process → closing CTA → footer.

The content combines real client work and Echo11-owned concepts. That distinction is part of the information design and should remain visible when evaluating credibility.

## Shared visual system

| Element | Current implementation | Designer review focus |
| --- | --- | --- |
| Palette | Black `#000000`, off-white `#FCFCFC`, secondary gray `#A1A1A1`, cyan `#00E5FF`. Many captions use white at 30–60% opacity. | Check text contrast on the actual rendered surface, especially small captions. |
| Typography | Syne for display headings and most body copy; JetBrains Mono for navigation, labels, metadata and footer copy. | Check whether the expressive sans and technical mono support the same brand voice. |
| Headings | Fluid sizes, compact line heights near 1.02–1.08, negative tracking. Typical section heading range is about 32–58px; statement/closing headings are larger. | Review line breaks and letter spacing at each width. |
| Body | Generally 15–17px with generous line height; metadata often 10–12px uppercase with wide tracking. | Small technical labels are the weakest readability tier. |
| Layout | Container maximum 1280px including padding; 24px gutters below 1024px and 32px above. At 1440px, content starts around x=112px. | Review alignment across header, sections and footer. Header mobile gutter is 16px, compared with 24px for body content. |
| Geometry | Sharp buttons/media frames, subtle hairlines, mostly open layouts rather than card grids. | Preserve editorial rhythm while checking that links remain recognizable. |
| Atmosphere | Animated cyan hero signal, translucent scrolled header, low cyan bloom at the closing CTA/footer. | Avoid relying on ambience to explain the offer. Page-wide grain is currently disabled. |
| Interaction | Underlined text links, arrow movement, cyan focus/active states, custom waveform cursor on fine pointers. | Check affordance without hover. The custom cursor is supplementary, not a touch interaction. |

Most principal content bands have 96px top/bottom padding on mobile and 144px at 768px upward. The statement, CTA, work-entry gaps and footer use their own spacing. This creates a spacious presentation but also a long reading journey.

## 0. Arrival / splash

**Design:** A first-session animated cyan signal/circle canvas with Echo11 branding and a website strategy/design/engineering subtitle. Optional sound requires user interaction. The normal duration is 1.7 seconds with a 650ms exit; reduced motion shortens the display. A session flag prevents repeating it on every visit within the session.

**Responsive:** The animation changes circle count, radius and point density for mobile, tablet and desktop. The brand treatment remains centered.

**Feedback prompts:** Does the arrival animation earn its delay? Is the optional sound control understandable? Judge a fresh session separately: the splash was already dismissed in the inspected browser session, so these details are source-derived.

## 1. Global navigation

**Purpose:** Persistent access to the studio's core pages and the discovery CTA.

**Desktop design:** Fixed 64px header; logo left, centered mono navigation, cyan outline Book Discovery button right. Links are Home, Work, Services, Foundations, Process and About. The current homepage link is cyan. The header becomes translucent black with blur and a fine bottom border after scrolling.

**Mobile and intermediate widths:** Below 1280px, navigation becomes a hamburger menu, including on smaller laptops and tablets. Opening expands a dark glass panel underneath the header with stacked links and a full-width cyan CTA. It is an expanding non-modal region, rather than a full-screen menu. Opening moves focus into the menu; Escape closes it and restores toggle focus.

**Feedback prompts:** Is switching to a menu below 1280px appropriate? Does the small logo have sufficient presence? The toggle has a 24px icon and no explicit enlarged hit area in its class list; evaluate its touch target. Compare header/body gutter alignment on mobile.

## 2. Hero — “Make your brand echo.”

**Purpose:** Establish a distinctive identity while clearly stating the studio's offer.

**Design:** “Make your brand” sits above a huge cyan `echo.` wordmark. Canvas signal waves paint the visible letterforms and extend faintly across the black stage. Supporting copy reads: “One senior team for strategy, design, and build. Sites that turn visitors into customers.” A cyan Book Discovery button and underlined See the work link provide the two routes. A small top metadata rail and three-part bottom service rail frame the composition.

**Desktop:** The wordmark dominates the center. Body copy sits left below it and actions align to the right. The secondary top rail reads “Strategy · Design · Engineering.” The wordmark size is constrained by both viewport width and height.

**Mobile:** The top descriptive rail disappears below 640px. Copy and actions stack below the wordmark. Actions remain beside one another if space allows and wrap at narrower widths; at 320px, See the work falls below the primary button. The three-column service rail stays horizontal.

**Motion:** Sticky full-height stage within a 160vh section; the next content plane overlaps by 60vh, so the logo strip begins at roughly one viewport height. Hero content fades and lifts during early scroll. Clicking open stage space produces a cyan ping through the wordmark. Reduced motion uses a static field and suppresses the hero fade/lift.

**Feedback prompts:** Is the offer legible quickly enough beneath the artwork? Does the empty space above/below the mobile content feel intentional? Confirm CTA visibility on short screens. **Observed issue:** at 320px, Engineering reaches approximately x=344px and clips outside the viewport. Document width remains 320px because overflow is clipped; absence of horizontal scrolling does not mean all content fits.

## 3. Client and concept strip

**Purpose:** Introduce recognizable examples immediately after the brand entrance.

**Design:** A hairline-bordered horizontal band with a centered uppercase label: “Selected client work and Echo11-owned concepts.” The Leaders and Green Lifestyle use monochrome image marks; Morrow Ritual, Stanza, Formline Optical, Signal Fuel and CurriculumOS use typographic wordmarks. Muted marks brighten on hover. The band is static, not a scrolling marquee.

**Desktop:** Seven marks form a centered wide row when space permits, with generous optical spacing.

**Mobile:** Flex wrapping creates several centered rows and increases band height. The marks are not navigation links.

**Feedback prompts:** Do marks carry similar optical weight? Is client work clearly distinguishable from studio concepts? Does the small low-contrast label explain the mixed provenance sufficiently?

## 4. Statement — “Your website should pull its weight.”

**Purpose:** Translate the visual brand into a business proposition.

**Design:** A centered bold heading in a narrow measure, with “Too many are expensive brochures. We build the ones that bring in work.” below. There is no image or CTA, making this a deliberate pause between the logo band and denser information.

**Desktop:** Heading scales to about 74px; 176px top/bottom padding creates a large breathing space.

**Mobile:** Heading has a roughly 38px minimum, balanced line wrapping and 112px vertical padding. Supporting text remains centered.

**Motion:** Word-by-word masked lift/blur reveal, followed by supporting copy.

**Feedback prompts:** Is the claim memorable and clear? Does this pause add emphasis, or delay seeing concrete work? Judge its spacing together with the adjoining sections.

## 5. Delivery facts — “Clear ways to begin.”

**Purpose:** Make engagement options and delivery expectations tangible.

**Design:** Six large-number cells divided by subtle hairlines. Current facts: two starting paths; Foundation in 3–5 weeks; Custom in 6–10 weeks; four delivery stages; 13 case studies including seven client builds; three pricing currencies, USD/CAD/NPR. Small metadata clarifies each figure and a footnote identifies their source.

**Desktop:** Three columns × two rows from 768px upward.

**Mobile:** Two columns × three rows. Numbers remain prominent, with wrapped descriptions underneath. It intentionally retains some information density rather than using one column.

**Motion:** Simple numeric values count up once; compound ranges such as 3–5 stay literal. Cell entrances are staggered. Reduced motion shows final values.

**Feedback prompts:** Are these useful purchase facts at this point in the journey? Can the caption hierarchy be read without strain? Despite the component name Results, this band describes delivery and portfolio facts; it does not supply measured client business outcomes.

## 6. Capabilities — “Website strategy, design, and build in one team.”

**Purpose:** Explain the integrated service offer.

**Design:** A small “One team · four disciplines” kicker precedes the headline, supporting paragraph and services cue. Below is a wall of large outline titles: Website Strategy & UX, Website Design & Build, Performance & SEO, and Maintenance Retainer. Each has a mono scope line, short paragraph and arrow. Rows have no boxed cards or separating rules.

**Desktop:** Header uses a 7/5 split at 1024px upward; disciplines remain full-width stacked rows. Hover/focus fills the current outline heading white, makes scope/arrow cyan and dims sibling rows.

**Mobile:** Header stacks. Large outline headings wrap to multiple lines; supporting scope/body stays below each heading. All four rows link to `/services`.

**Motion:** Staggered row entrances with blur/lift plus word reveals. Reduced-motion policy renders rows statically.

**Feedback prompts:** Is outline type readable without hover? Is it obvious the entire row is clickable? Does dimming siblings make comparison harder? Check whether the visual emphasis communicates four disciplines while the prose emphasizes strategy/design/build as three.

## 7. Featured work — “Shipped, and documented.”

**Purpose:** Demonstrate visual range and provide documented evidence of decisions.

**Design:** Three spacious editorial entries with large project imagery, sector/provenance metadata, title, explanation, three service credits, and Read the case study. Morrow Ritual and Stanza are labeled Echo11 concepts; The Leaders NP is a client publishing platform. A verified live-site destination is included for The Leaders NP.

**Desktop:** Morrow Ritual image left, text right; Stanza mirrors with text left/image right. These use approximately 8/4 columns. The Leaders NP closes with a full-width plate and a split read/credits block below. Entry gaps are 144px from 768px upward.

**Mobile:** Every entry becomes image first, then metadata/title/body/credits/links. Stanza's mirrored desktop order resets. Featured plates change from 7:4 at 768px upward to 5:4 below; the narrower ratio crops the desktop screenshots. Entries have 96px gaps.

**Motion:** Plate, description and credits enter in sequence. The image layer pans slightly with scroll and lifts/brightens on hover; reduced-motion CSS disables image transforms. Images also act as pointer links, while named text links provide keyboard/screen-reader navigation.

**Feedback prompts:** Can a visitor tell what was delivered from the imagery and copy? Are important screenshot details preserved in the mobile crop? Is the amount of work evidence sufficient without overwhelming the page? **Content mismatch:** the bridge paragraph says “three of twelve builds,” while the metric/data count is 13 case studies. Confirm intended terminology and reconcile the wording. The bridge mentions a work archive without a direct archive link in that paragraph.

## 8. Website directions — “Start from a proven direction.”

**Purpose:** Offer a concrete starting point and route a visitor toward a brief.

**Design:** Three selectable directions: Commerce / The considered shop, Service / The credible practice, and Product / The clear product. A currency selector supports USD/CAD/NPR. The active tab is cyan. The panel combines portfolio reference imagery/provenance with positioning, best-fit audience, adaptation list, Foundation starting price, typical delivery, a white “Make this direction yours” CTA and scope qualification. A Next button cycles directions; a separate custom-build link sits below.

**Desktop at 1280px+:** A 208px vertical tab rail sits left; portfolio proof and offer content sit side-by-side in the remaining panel. The currency control aligns to the section header's right. The rail is sticky below the header.

**1024–1279px:** Tabs remain horizontal while panel content already uses two columns. This is a distinct intermediate composition to review.

**Mobile:** Three short horizontal tabs stick below the fixed header. Portfolio reference appears above offer copy. Price/timeline wrap as needed, the CTA spans its content area, and the custom-build closing row stacks. It becomes a substantial reading section before reaching the offer action.

**Interaction:** Tab selection updates imagery, copy and destination together without forced scrolling. Arrow keys follow orientation; Home/End and roving tab focus are implemented. Price changes are announced politely. Service switching was verified in the browser; CAD C$4,900 was the observed Foundation price during review.

**Feedback prompts:** Does “direction” convey tailored work clearly? Is the white action's hierarchy consistent with cyan discovery buttons? Is enough of the offer visible before mobile users must scroll through portfolio proof? The Service direction currently references Signal Fuel, described as a beverage brand/campaign concept; evaluate whether that proof demonstrates the promised professional-service offer clearly. Test currency switching separately.

## 9. Process — “How a project runs.”

**Purpose:** Reduce uncertainty about deliverables, client effort and ownership.

**Design:** Four steps on a thin vertical spine: Discovery and architecture, Design and interaction, Website engineering, Launch and handover. Each includes what happens, a “You keep” deliverables list with plus marks, and “From you” requirements beneath a hairline. Large outline numerals light up as the drawn spine reaches each stage. Foundation/Custom timeline context accompanies the stages.

**Desktop:** From 1024px, a 272px sticky context sidebar sits left of the timeline. At 1280px, each stage's explanation and deliverables sit side-by-side. This remains a vertical process on desktop; it does not become a horizontal four-card timeline.

**Mobile:** Path context moves above the stages. Numeral column shrinks from 112px to 64px below 768px; the spine sits between numeral and text columns. Stage copy and deliverables stack. This leaves roughly 258px for stage text at 390px, and about 188px at 320px with the same gutter/rail structure.

**Motion:** Scroll draws the spine and fills reached numerals. Stages reveal in sequence. Reduced motion pre-draws the spine and lights all stages.

**Feedback prompts:** Are ownership and client responsibilities easy to scan? Does the numeral/spine allocation leave enough mobile reading width? Is the process detail appropriate for a homepage or better shortened with a route to `/process`? Evaluate cumulative page length before changing this section alone.

## 10. Closing CTA — “Tell us what you are building.”

**Purpose:** Convert interest after the proof and delivery explanation.

**Design:** Left-aligned display heading, a short discovery-call explanation, cyan Book Discovery action and broad cyan light rising from the bottom. Open composition rather than a bordered banner.

**Desktop:** 192px top/bottom padding and heading up to about 70px create a spacious close.

**Mobile:** 128px top/bottom padding; minimum heading around 35px. Copy and action remain left-aligned. The action is not a sticky mobile bottom bar.

**Feedback prompts:** Is the action clear after a long page? Does “Book Discovery” match expectations for the next route? Check the contact journey separately to establish whether the user expects scheduling or an inquiry form.

## 11. Footer

**Purpose:** Provide studio context, direct contact, secondary navigation and legal routes.

**Design:** Brand/logo and Canada-based introduction; Execution, Studio and Network link groups; email contact; “Systems Online / Canada” pill; giant low-opacity echo11. wordmark; copyright/privacy/terms. Cyan floor light is subtle. The status dot is green, an exception to the main cyan palette, and the pill is an exception to the otherwise sharp geometry.

**Desktop:** Brand block takes five of twelve columns; link groups take seven. Groups become three columns at 1024px. Legal items align horizontally from 768px.

**Mobile:** Brand block stacks above a two-column link grid; Network spans both columns below. Legal copy stacks and centers. The watermark scales at 18vw and stays very faint unless hovered.

**Feedback prompts:** Can people find contact details quickly? Does the pill fit the brand? “Systems Online” is static display copy, not a live status measurement in this component. Is the oversized nearly invisible wordmark worth its space on touch devices? Check low-contrast links and long email fit.

## Responsive contract for review

| Width | Main changes |
| --- | --- |
| Below 640px | Stacked hero support/actions, hidden hero discipline meta, stacked path summary, compact direction labels. |
| 640px+ | Hero support and actions can share a row; some body type increases; path context gains columns. |
| 768px+ | Facts become three columns; featured images use 7:4; spacing grows; footer brand/links share a row; numeral rail widens. |
| 1024px+ | Split capability/work headers, alternating work entries, two-column direction panel, sticky process sidebar, three footer link groups. |
| 1280px+ | Full desktop navigation and vertical direction rail; process explanation/deliverables share a row. |

No page-level horizontal overflow was measured at 1440px or 390px. The 320px hero still clips a label, so inspect internal content bounds as well as page width. The page before the footer measured approximately 10,349px tall at desktop and 11,346px at 390px, with Commerce selected. These are snapshot measurements, not fixed design targets; font/layout and selected panel can change height.

## Recommended feedback priorities

1. **Confirmed corrections:** hero service-rail clipping at 320px; inconsistent twelve/13 portfolio wording.
2. **Readability:** contrast of 10–13px labels, outlined capability titles, footer links, narrow timeline text measure.
3. **Page pacing:** about eleven thousand pixels of main content on mobile, followed by a substantial footer. Review section padding and repeated copy across facts, directions and process together.
4. **Proof and offer clarity:** distinguish concepts/client work, preserve useful image crops, evaluate Service proof relevance, and assess directions as tailored starting points.
5. **Conversion hierarchy:** cyan discovery actions vs white direction action; primary action prominence on mobile; suitability of menu navigation across laptop widths.
6. **Motion and access:** evaluate fresh-session splash, static/reduced-motion states, real-device smoothness, keyboard/focus visibility, sticky-header/tab overlap and touch targets. Implemented support is not a completed accessibility audit.

## Suggested designer feedback format

For each comment, record: **section → viewport → observed problem → user impact → proposed change → priority**. Separate visual preference from usability problems. For example: “Hero → 320px → Engineering clipped → service list cannot be read → wrap/reduce tracking/restructure rail → high.”

Review the whole page at 1440, 1280, 1024, 768, 390 and 320px; include a short-height/landscape phone and 200% zoom. Test the menu, all three direction tabs, keyboard arrows/Home/End, currency selector, main actions, case-study links and reduced-motion state. Real device checks are outstanding.

## Source map

- Composition: `src/app/page.tsx`
- Shared shell: `src/app/layout.tsx`, `src/components/layout/Navbar.tsx`, `Footer.tsx`, `PageWrapper.tsx`, `SmoothScroll.tsx`, `SplashScreen.tsx`
- Sections: `src/components/sections/Hero.tsx`, `ClientLogos.tsx`, `Statement.tsx`, `Results.tsx`, `Capabilities.tsx`, `FeaturedWork.tsx`, `MakeItYours.tsx`, `ProcessTimeline.tsx`, `CTABanner.tsx`
- Tokens/primitives/media: `src/app/globals.css`, `tailwind.config.ts`, `src/components/ui/Container.tsx`, `Button.tsx`, `RevealText.tsx`, `EchoField.tsx`, `Cursor.tsx`, `src/components/work/ProjectMedia.tsx`, `PlatePan.tsx`
- Content: `src/data/caseStudies.ts`, `src/lib/website-offers.ts`

Validation for this handoff: source inspection and live viewport/interaction checks. Lint, type-check and build were not run because the only new file is this documentation; there were no application changes.
