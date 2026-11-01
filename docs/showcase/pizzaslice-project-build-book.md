# PIZZASLICE — Brand, Digital Experience & Production Build Book

**Version:** 1.0  
**Project:** pizzaslice  
**Deliverable:** Responsive restaurant website, interactive 3D pizza hero, ordering-ready UI, scalable design system  
**Status:** Creative and technical specification; restaurant-specific facts, prices, menu and fulfillment integrations require confirmation.

## 1. Creative North Star

**pizzaslice** should feel like a modern neighborhood pizza institution with the confidence of an editorial food brand and the delight of a polished interactive product. The site must make visitors hungry within three seconds and make ordering effortless.

**Experience arc:** first craving → product spectacle → menu discovery → customization → ordering → repeat visits.

**Brand attributes:** hot, playful, crafted, tactile, generous, sharp, urban, welcoming. Avoid generic Italian flags, excessive checkerboard patterns, clip-art chefs, floating emoji and overused red/yellow gradients.

**Core design principle:** *one theatrical moment, then ruthless usability*. The 3D hero is the signature; the menu and checkout should be exceptionally fast and clear.

## 2. Brand Identity

### Name and logo

- Customer-facing wordmark: **pizzaslice** (lowercase); optional uppercase campaign variant **PIZZASLICE**.
- Build a custom wordmark with slightly compressed, friendly geometric letterforms; test a subtly angled `i` dot or slice-shaped negative space, without sacrificing legibility.
- Secondary mark: a simple triangular slice silhouette constructed from three geometric shapes; must work at 16px favicon size.
- Logo lockups: horizontal, compact, monochrome, reversed, and one-color packaging stamp.
- Clear space: at least the height of the `p` stem; minimum on-screen wordmark width 100px.

### Palette

| Token | Hex | Usage |
|---|---|---|
| `--ps-ink` | `#171715` | Headlines, dark sections |
| `--ps-cream` | `#FFF6E8` | Main background |
| `--ps-paper` | `#F6E9D7` | Cards and packaging |
| `--ps-tomato` | `#D93B2B` | Primary action, brand accent |
| `--ps-chili` | `#A92920` | Pressed/hover accent |
| `--ps-basil` | `#27634A` | Dietary tags, secondary accents |
| `--ps-cheese` | `#F2BE54` | Controlled highlights |
| `--ps-muted` | `#716A60` | Supporting text |
| `--ps-line` | `#D9CBBB` | Dividers |

Aim for cream/ink dominance with tomato as a focused conversion color. Do not put tomato on every surface. Ensure accessible contrast, especially for small text.

### Typography

- **Display:** `Bricolage Grotesque` (bold/extrabold) or a properly licensed expressive display face.
- **Body/UI:** `Geist Sans` or `Inter`.
- **Technical labels:** `IBM Plex Mono` sparingly for product numbers, sizes and order status.
- Hero: `clamp(4.5rem, 12vw, 12rem)`, line-height `0.82–0.92`, optical tracking tuned per word.
- Section title: `clamp(2.75rem, 6vw, 6.5rem)`.
- Body: `clamp(1rem, 1.1vw, 1.125rem)`, line-height `1.5–1.65`.
- Price and action labels must be legible at mobile sizes; never use display lettering for forms.

### Visual motif

The **slice angle** is the recurring geometry: diagonal crop edges, triangular separators, selective image masks and a subtle arrow motif. Use on at most one dominant element per section. Supporting visual vocabulary: hand-drawn ingredient diagrams, flour texture, oil sheen, warm paper and close-up macro food photography.

## 3. Art Direction & Reference Research Brief

Gather licensed/permissioned references in these categories before implementation:

1. **Premium food CGI:** photorealistic cheese, sauce, crust blistering, basil translucency and physically correct oily highlights.
2. **Editorial restaurant sites:** bold typography, restrained layouts, distinctive product art direction.
3. **Interactive product configurators:** clear selected states, instant feedback, reversible interactions.
4. **Contemporary packaging:** pizza boxes, tissue, stickers, takeaway bags, loyalty cards.
5. **Motion reference:** short, purposeful camera moves and material transitions rather than endless floating objects.

Suggested reference discovery: [Awwwards — food websites](https://www.awwwards.com/websites/food-drink/), [Behance — pizza branding](https://www.behance.net/search/projects/pizza%20branding), [Dribbble — restaurant website](https://dribbble.com/search/restaurant-website), [Spline examples](https://spline.design/), [Three.js examples](https://threejs.org/examples/). These are research starting points, not verified endorsements of any particular design. Document each approved reference with URL, what principle to borrow, what not to copy, and licensing status.

**Asset policy:** Use genuine menu photography for actual products. Never show CGI toppings or ingredient quantities that misrepresent the purchasable pizza. Obtain commercial rights for all photography, 3D models, fonts and audio.

## 4. Experience Architecture

### Routes

```text
/
/menu
/menu/[slug]
/build-your-pizza        (only if customization is supported)
/deals                   (only with actual offers)
/locations
/locations/[slug]        (if multi-location)
/about
/ingredients
/contact
/cart
/checkout               (or approved hosted checkout)
/order-status/[id]       (only with integrated order provider)
/legal/privacy
/legal/terms
/legal/allergens
```

Header: logo left, `Menu`, `Our Story`, `Locations` center, `Order Now` and cart count right. On mobile use compact logo, order action, cart and accessible menu drawer. Sticky order action should not obscure content.

### Homepage sections and distinct composition

| Order | Section | Layout signature | Main action |
|---|---|---|---|
| 00 | Hero | Full-bleed editorial type + centered interactive 3D pizza | Order pizza |
| 01 | The first bite | Macro cinematic strip with brief ingredient narrative | Explore menu |
| 02 | Best sellers | Asymmetric product gallery: one feature, two supporting | View pizza |
| 03 | Made fresh | Three-stage horizontal process on desktop; vertical story mobile | Our ingredients |
| 04 | Menu explorer | Category tabs + dense accessible product list | Add to cart |
| 05 | Build yours | Guided stepper / product configurator, only if supported | Customize |
| 06 | Social proof | Real review quotes with attribution and permission | Read reviews |
| 07 | Locations & hours | Practical address/hours module with map link | Directions |
| 08 | Final craving | Bold type, close-up imagery, fixed clear CTA | Start order |
| 09 | Footer | Compact utility, social, contact, legal, allergens | Contact |

Avoid reusing identical three-card grids across consecutive sections. Alternate dark/light surfaces, image-led/text-led layouts, and full-bleed/contained composition.

## 5. Signature 3D Hero — Production Specification

### Creative direction

The hero features one **hero pizza**, viewed from a premium three-quarter/top-down angle against a warm cream background. It is an appetizing, believable pizza, not a plastic-looking spinning disc. Typography sits partly behind the pizza using controlled layering. The hero pizza is not the entire page background; preserve ample readable negative space.

**Proposed heading:** `A LITTLE SLICE OF HAPPY.`  
**Supporting copy:** `Hot from the oven, made for the moment. Find your next favorite slice.`  
**CTA:** `Explore the menu` / `Order now`.

These are campaign/page copy, not a required permanent tagline. Replace product-specific claims with verified restaurant details.

### Camera and animation storyboard

| Phase | Time | Visual | Implementation |
|---|---:|---|---|
| Poster | 0 ms | Pre-rendered sharp hero still | `<picture>`/`next/image` |
| Entrance | 0.2–1.4 s | Pizza rotates 8–12° into final pose, settles with restrained depth | R3F/GSAP |
| Ingredient detail | 1.4–2.4 s | Small parallax on toppings and shadow; subtle lighting shift | Shader/material/light controls |
| Pointer | ongoing | Max 3–5° tilt, spring/damped interpolation; no free spinning | pointer normalized to bounds |
| Scroll exit | first ~50vh | Pizza shifts/zooms modestly as heading exits behind mask | ScrollTrigger with cleanup |
| Interaction | on user action | Optional “Lift a slice” controlled sequence with believable cheese stretch | authored animation / morphs |

The **slice lift** must be user-initiated and skippable. It is a promotional interaction, not a prerequisite to ordering. If believable geometry/physics is not achievable, use a carefully rendered short film instead of an obviously fake live simulation.

### Asset pipeline (Blender → web)

1. Build pizza with high-quality crust silhouette, blister variation, irregular sauce coverage, believable cheese, and individually modeled toppings.
2. Use physically based materials, baked normals/AO where appropriate, and calibrated roughness. Avoid overly uniform circles or repeated topping clones.
3. Author high-quality lighting and camera in Blender; create a matching poster render and optional short WebM/MP4 fallback.
4. Separate interactive meshes only when needed: crust, sauce/cheese, toppings, slice group, plate/shadow.
5. Export optimized `GLB`; inspect scale, pivot, normals, texture orientation and animation clips.
6. Use KTX2/Basis compressed textures where supported; Draco or Meshopt geometry compression if warranted; verify real loading tradeoffs.
7. Provide 1× and 2× poster images in AVIF/WebP; separate portrait crop for mobile.
8. Test on midrange Android and iPhone before enabling interactive effects by default.

**Starting budgets (validate on actual devices):** hero GLB compressed transfer ≤ 2–4 MB where practical; keep textures modest, draw calls low, and avoid excessive transparent meshes. These are design targets, not guaranteed performance thresholds. Target 60fps on capable desktop, degrade gracefully to 30fps or static on constrained devices.

### Technical strategy

- Render SEO-critical heading, copy and CTAs as semantic HTML **outside the WebGL canvas**.
- Canvas is decorative and `aria-hidden`; keyboard users still access all real actions.
- Lazy-load R3F/Three only when client, viewport and device capability permit; SSR delivers poster.
- Respect `prefers-reduced-motion`, `Save-Data`, low memory and WebGL context failure.
- Pause rendering when tab is hidden or scene is offscreen; avoid an always-running 60fps loop when static.
- Avoid scroll-jacking and autoplay audio.
- If the 3D experience fails, show poster and retain every conversion action.

### Hero layer order

```text
Hero section
  ├── semantic headline and decorative oversized text
  ├── poster image (visible until canvas ready)
  ├── WebGL canvas (pointer interactions only within scene bounds)
  ├── accessible descriptive copy
  ├── Order / Explore CTA
  └── subtle scroll cue
```

## 6. Full Page UX Specifications

### Menu listing

- Categories: show only actual menu groups, e.g. Signature, Classics, Sides, Drinks, Desserts.
- Desktop: featured category image with compact product rows; mobile: sticky category selector and full-width product rows.
- Each item: photo, real name, concise ingredients, verified price, size/variant, dietary/allergen disclosures where applicable, `Customize`/`Add` action.
- Filters must not conceal items unexpectedly; preserve category context and support direct links.
- Show sold-out/unavailable states from real inventory or operational data, not guessed availability.

### Pizza detail

Large real product photo; title, price by size, ingredient description, crust/size choices, modifiers, quantity, allergen notice, and sticky add-to-cart action. Recalculate price immediately when options change. Explicitly mark mandatory vs optional choices and show cart confirmation.

### Build-your-pizza (conditional)

Steps: `Size → Base → Cheese → Toppings → Review`. Show progress and price changes, make steps reversible, preserve choices on navigation, enforce kitchen-supported combinations, and allow removal of every optional topping. 3D topping visualization is optional; correctness of selected ingredients and prices is mandatory.

### Cart / checkout

Use a dedicated accessible flow with editable line items, fulfillment choice (pickup/delivery where offered), timing, address validation, fees/tax, promo code if available, final total and explicit confirmation. Never claim payment is complete until provider confirmation. Prefer a compliant hosted payment solution to avoid handling raw card data. Show allergy/contact notice, refund/cancellation policy and clear order status.

### Locations

Show only verified addresses, hours, phone, pickup/delivery zones and links to directions. Display holiday hours and closure exceptions from structured data. If location count is one, keep the page focused rather than building an unnecessary store locator.

### About / Ingredients

Tell the real founder/kitchen story and actual preparation methods. Use documentary photography, process diagrams and staff profiles with consent. Avoid invented “since” dates, imported ingredient claims, oven types, awards or sourcing promises.

## 7. Content & Marketing Copy System

**Voice:** vivid, friendly, slightly cheeky, concrete and short. Sensory descriptions are welcome; empty superlatives are not.

| Placement | Draft copy | Validation |
|---|---|---|
| Hero | `A little slice of happy.` | Brand-level, usable |
| Hero lead | `Hot from the oven, made for the moment.` | Confirm hot-made-to-order positioning |
| Menu intro | `The hardest part? Picking just one.` | Usable |
| Best sellers | `The ones people come back for.` | Requires sales data if framed as factual ranking |
| Ingredients | `Good pizza starts long before the first bite.` | Usable |
| Process | `From dough to delicious.` | Usable as editorial section heading |
| CTA | `Your next pizza is waiting.` | Usable |
| Empty cart | `Nothing in the box yet.` | Usable |
| Add success | `Added to your box.` | Usable |
| Order confirmation | `Order received. We'll keep you posted.` | Only after backend confirmation |

### SEO/content framework

- Unique title/description per real menu item and location.
- JSON-LD `Restaurant`/`LocalBusiness`, `Menu`, opening hours, address, and appropriate offers **only when accurate**.
- Semantic `<h1>` once per page; meaningful headings; canonical URLs; sitemap; robots policy.
- Local discovery pages should contain real location details, not keyword-stuffed generic copy.
- Optional editorial: ingredient stories, kitchen process, new menu drops and community collaborations.
- Social production ratios: 4:5 feed, 9:16 reels/stories, 1:1 packaging details; maintain safe cropping around food.

## 8. Layout & Responsive System

| Viewport | Grid | Outer padding | Composition |
|---|---|---|---|
| ≥1440 | 12 columns | `clamp(32px,4vw,72px)` | Layered editorial, 3D dominant |
| 1024–1439 | 12 columns | 32px | Condensed editorial |
| 768–1023 | 8 columns | 24px | Fewer overlaps, simplified hero |
| 360–767 | 4 columns | 16–20px | Portrait hero, stacked product rows |
| 320–359 | 4 columns | 16px | Strict overflow checks |

**Max content width:** 1440–1600px. **Reading width:** 640–720px. **Touch targets:** at least 44×44px. Use CSS `clamp()` for headings and section spacing; use container queries for reusable product modules.

### Spacing scale

`4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128, 160px`

```css
:root {
  --ps-page-gutter: clamp(1rem, 4vw, 4.5rem);
  --ps-section-space: clamp(5rem, 10vw, 10rem);
  --ps-content-max: 96rem;
  --ps-reading-max: 45rem;
  --ps-radius-xs: 4px;
  --ps-radius-sm: 8px;
  --ps-radius-media: 16px;
  --ps-radius-pill: 999px;
}
```

Radius should reflect component purpose: slightly rounded product imagery, near-square editorial blocks, pill only for small tags/segmented controls. Avoid applying the same radius to every element.

## 9. Components & Interaction Contracts

| Component | States | Motion | Mobile / accessibility |
|---|---|---|---|
| `PSButton` | default, hover, focus, loading, disabled | 160–240ms background + arrow shift | 44px min; clear label |
| `PSProductCard` | default, hover, selected, unavailable | image scale 1→1.035; metadata reveal | no hover dependency |
| `PSCategoryTabs` | active, inactive, overflow | sliding underline 200ms | horizontal scroll with visible affordance |
| `PSQuantityStepper` | min, max, updating | restrained value crossfade | named increment/decrement buttons |
| `PSPizzaConfigurator` | step, validation, saving | short step transitions | persistent price/next action |
| `PSCartDrawer` | empty, populated, updating, error | 250–350ms slide | focus trap, escape, focus return |
| `PSGallery` | loading, active, error | 300–500ms crossfade | swipe plus visible controls |
| `PSAccordion` | open, closed | 180–260ms height | keyboard and ARIA semantics |
| `PSLocationBlock` | open, closed, exception | minimal | factual hours and address |
| `PSHero3D` | loading, ready, interacting, fallback | authored sequence | static poster when needed |

**Motion hierarchy:** L0 static utility; L1 200–350ms micro-interaction; L2 500–900ms media reveals; L3 1.0–2.0s hero choreography. No bouncing buttons or gratuitous letter-by-letter animation. For reduced motion, use immediate state changes or subtle opacity only.

### Tokens

```ts
export const pizzaMotion = {
  duration: { micro: 0.18, ui: 0.28, reveal: 0.72, hero: 1.35 },
  ease: { standard: [0.22, 1, 0.36, 1], emphasis: [0.16, 1, 0.3, 1] },
} as const;

export const pizzaLayout = {
  contentMax: '96rem',
  readingMax: '45rem',
  touchMin: '44px',
} as const;
```

## 10. Icons, Illustration & Media

- Use [Lucide React](https://lucide.dev/) for utility icons: `ArrowUpRight`, `ArrowRight`, `Menu`, `X`, `ShoppingBag`, `Plus`, `Minus`, `MapPin`, `Clock3`, `ChevronDown`, `Check`, `AlertCircle`, `Instagram`.
- Default icon sizes: 16px compact, 20px UI, 24px feature. Stroke 1.75–2px, consistent optical weight.
- Build a tiny custom icon family for verified dietary attributes, crust styles and heat levels; do not use arbitrary emojis for product specifications.
- Use 3D renders for campaign storytelling; actual photography for purchasable menu accuracy.
- Keep decorative textures low contrast; test on mobile for visual noise.

## 11. Technology & Libraries

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js App Router + TypeScript | SEO, routing, server rendering |
| Styling | Tailwind CSS | tokenized responsive styling |
| UI primitives | shadcn/ui + Radix | accessible dialogs, tabs, forms |
| Icons | lucide-react | coherent iconography |
| 3D | Three.js + React Three Fiber + Drei | authored interactive hero |
| Cinematic motion | GSAP + ScrollTrigger | hero and editorial choreography |
| Small UI motion | CSS transitions; Motion only if necessary | avoid duplicate animation systems |
| Forms | React Hook Form + Zod | validated booking/checkout data |
| Content | Typed local content first; Payload/Sanity if editorial workflow requires | avoid premature CMS complexity |
| Data | Supabase/Postgres or existing commerce provider | real products, options, availability |
| Payments | Stripe Checkout or existing POS/order platform | provider-managed payment flow |
| Monitoring | Vercel Analytics + Speed Insights / error monitoring | production visibility |
| Tests | Vitest + Testing Library + Playwright | components, ordering flows, accessibility |

**Integration rule:** confirm POS, inventory, tax, delivery and payment requirements before designing checkout logic. Never create two conflicting sources of truth for prices/orders.

Official references: [Next.js](https://nextjs.org/docs), [Tailwind](https://tailwindcss.com/docs), [shadcn/ui](https://ui.shadcn.com/docs), [R3F](https://r3f.docs.pmnd.rs/), [Drei](https://drei.docs.pmnd.rs/), [Three.js](https://threejs.org/docs/), [GSAP](https://gsap.com/docs/v3/), [Lucide](https://lucide.dev/), [Stripe](https://docs.stripe.com/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## 12. Project Structure

```text
src/
  app/
    (marketing)/page.tsx
    menu/page.tsx
    menu/[slug]/page.tsx
    locations/page.tsx
    about/page.tsx
    cart/page.tsx
    checkout/page.tsx
    api/...
    globals.css
  components/
    brand/PSLogo.tsx
    layout/Header.tsx
    layout/Footer.tsx
    sections/Hero.tsx
    sections/BestSellers.tsx
    sections/MenuExplorer.tsx
    sections/ProcessStory.tsx
    sections/FinalCTA.tsx
    product/PSProductCard.tsx
    product/PSPizzaConfigurator.tsx
    cart/PSCartDrawer.tsx
    three/PizzaHeroScene.tsx
    three/PizzaModel.tsx
    motion/Reveal.tsx
    ui/...
  content/
    marketing.ts
  lib/
    commerce/
    validation/
    seo/
    motion/
  styles/
    tokens.css
    typography.css
  types/
    menu.ts
    order.ts
public/
  models/pizza-hero.glb
  images/hero-poster.avif
  images/hero-mobile.avif
  images/menu/...
  video/hero-fallback.webm
```

## 13. Content Data Contracts

```ts
export type MenuItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  image: { src: string; alt: string };
  available: boolean;
  variants: Array<{ id: string; label: string; priceMinor: number }>;
  allergens: string[];
  dietaryTags: string[];
};

export type CartLine = {
  id: string;
  menuItemId: string;
  variantId: string;
  quantity: number;
  modifierIds: string[];
};
```

Use integer minor currency units, not floating-point dollar calculations. Server recomputes authoritative totals from catalog/price rules; never trust browser-submitted totals. Tax, discounts, tips and delivery fees require region/provider-specific validation.

## 14. Conversion & Marketing Design

- Primary KPI: completed orders / eligible sessions.
- Supporting metrics: menu views, add-to-cart, cart-to-checkout, checkout completion, click-to-call, directions taps, repeat order usage.
- Place one clear primary CTA in hero and maintain persistent ordering access.
- Show actual price, portion/size and dietary information before adding to cart.
- Consider first-party consent-aware analytics; do not block ordering behind marketing consent.
- Track hero 3D load success and fallback rates separately from conversions to prove the experience helps rather than harms ordering.
- Use real reviews only; obtain permission for customer photos and quotes.
- Campaign templates: new pizza launch, limited special, ingredient close-up, behind-the-scenes oven clip, neighborhood/community event.

## 15. Accessibility, Performance & Reliability

**Acceptance targets:** LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms at the 75th percentile where measurable. Test real-world mobile, not just a fast developer laptop.

- Semantic HTML and visible keyboard focus; contrast WCAG AA where applicable.
- Product images have meaningful alt text; decorative canvas hidden from assistive technology.
- Ensure cart quantity, error summaries and price changes are announced appropriately.
- All interactive controls work without WebGL, hover, sound or scroll animations.
- Use responsive images, appropriate preload priority, lazy loading and a hero poster.
- Add loading, unavailable, payment failure, inventory change, network retry and duplicate-submit states.
- Webhook/order processing must be idempotent; verify payment provider signatures.
- Never display “order confirmed” before trusted backend confirmation.
- Cache static marketing content; keep stock/price/order state authoritative and fresh.

## 16. Build Phases and Definition of Done

### Phase A — Discovery and verified content

**Inputs:** real menu, prices, modifiers, location(s), hours, fulfillment rules, photos, brand preferences, ordering/POS provider.  
**Output:** approved content inventory, page map, integration plan, no invented facts.

### Phase B — Brand and design tokens

Build wordmark directions, palette, type scale, spacing, component states and responsive art direction.  
**Approval gate:** desktop/mobile hero and two contrasting interior sections approved.

### Phase C — 3D proof of concept

Model hero pizza, optimize GLB, implement poster fallback, measure FPS/LCP on target devices.  
**Approval gate:** appetizing realism, no visible material artifacts, acceptable mobile performance.

### Phase D — Marketing site

Implement hero, menu teasers, process story, brand/about, locations, footer, SEO and responsive motion.  
**Approval gate:** all viewport QA and keyboard/reduced-motion QA pass.

### Phase E — Commerce

Integrate catalog, customization, cart, fulfillment, checkout and provider webhooks.  
**Approval gate:** test orders and payment failure/refund scenarios pass in sandbox; business owner approves pricing/tax/fulfillment.

### Phase F — Launch

Production asset audit, image rights, legal policies, structured data, analytics, error monitoring, backups, redirect plan, smoke tests and rollback procedure.  
**Approval gate:** business owner signs off on live ordering and operational readiness.

## 17. Detailed QA Matrix

| Area | Required checks |
|---|---|
| Responsive | 320, 360, 390, 768, 1024, 1440, 1920px; no overflow or broken crop |
| 3D | slow connection, WebGL failure, low-power device, reduced motion, page hidden |
| Menu | long names, no image, missing price, sold out, allergens, variants |
| Cart | quantity limits, option edits, duplicate clicks, refresh persistence |
| Checkout | invalid address, taxes, payment decline, retry, provider outage |
| Navigation | keyboard, focus, drawer close, deep links, back button |
| SEO | unique metadata, canonical, structured data accuracy, sitemap |
| Visual | type hierarchy, contrast, spacing, photography crop, icon consistency |
| Performance | real-device LCP/INP/CLS, asset transfer size, memory, 3D frame budget |

## 18. Non-Negotiable Design Rules

1. One memorable 3D spectacle; all other interactions serve clarity.
2. Food must look edible, warm and physically believable.
3. Real menu information always outranks decorative layout.
4. Never repeat the same card grid more than once in a row.
5. One dominant focal point per section.
6. Reuse tokens and component contracts; do not invent arbitrary radii or spacing.
7. Animation must have a purpose and an accessible fallback.
8. Mobile is art-directed separately, not just a cropped desktop.
9. Avoid fabricated claims, prices, locations, reviews or ingredient origins.
10. Every important path ends with an obvious next action.

## 19. Immediate Inputs Needed Before Production

- Restaurant city/address and whether pizzaslice is an existing operating business or new concept.
- Actual menu, prices, pizza sizes, modifiers, allergens and food photography.
- Pickup, delivery, dine-in and reservation capabilities.
- Existing POS/order platform, payment processor and preferred admin workflow.
- Hero pizza selection, toppings and visual authenticity requirements.
- Brand tone preference: playful neighborhood, upscale artisan, or energetic fast-casual.

**Final principle:** **pizzaslice** should be remembered for its cinematic pizza, but chosen because the food looks real, the menu is clear, and ordering feels effortless.
