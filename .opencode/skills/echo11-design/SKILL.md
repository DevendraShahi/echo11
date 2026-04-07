---
name: echo11-design
description: Use this skill when designing or updating Echo11 frontend experiences. It captures the current implemented UI theme, layout system, color logic, typography, motion language, and component rules based on the actual codebase, while staying flexible for future refinement.
---

# Echo11 design skill

This skill describes the **current real design system** of Echo11 based on the implemented codebase, not an abstract or idealized style guide.

## Purpose

Use this skill when:
- Designing new pages or sections for the marketing site
- Refining components or layouts in the existing frontend
- Extending the visual system into portal or lab surfaces
- Making UI decisions that should stay aligned with Echo11's current identity
- Reviewing whether a new UI direction fits the product's existing visual language

This is a **flexible guideline**, not a rigid brand law. Echo11 can evolve. The goal is to preserve the current design DNA while allowing stronger refinement over time.

## Core design identity

Echo11 is currently a **dark-first premium digital studio interface** with a cinematic and technical feel.

It is defined by:
- near-black and black surfaces
- white and off-white type
- one electric cyan accent
- subtle glow and translucent glass layering
- sharp geometry instead of soft rounded UI
- expressive headlines with technical mono support text
- motion-led presentation and atmospheric visual depth

This is **not** generic SaaS UI, soft startup pastel design, or bubbly dashboard styling.

## Theme and color system

Current global tokens come from `src/app/globals.css` and `tailwind.config.ts`.

### Primary colors
- Background: `#000000`
- Foreground: `#fcfcfc`
- Border: `#222222`
- Muted surface: `#1a1a1a`
- Muted text: `#a1a1a1`
- Card: `#111111`
- Accent: `#00E5FF`
- Accent glow: `rgba(0, 229, 255, 0.4)`

### Color rules
- Use black and near-black as the visual foundation.
- Use white and soft white for primary readability.
- Use muted gray only for support text and low-priority information.
- Use cyan as the **single high-energy accent** for focus, active states, links, highlighted nav states, buttons, icons, and glow effects.
- Avoid introducing additional strong accent colors unless a specific feature truly requires it.
- Accent should feel surgical and luminous, not decorative everywhere.

### What to avoid
- Random gradient-heavy rainbow UI
- Purple/indigo replacing cyan as primary brand accent
- Warm beige or soft product palettes that break the current identity
- Colorful dashboard cards unless explicitly part of a data-viz requirement

## Typography system

Echo11 uses a split typography voice.

### Current implementation
- Sans family: `var(--font-syne)`
- Mono family: `var(--font-geist-mono)`

### Usage rules
- Use the sans family for headlines, feature titles, major content headings, and expressive statements.
- Use mono for nav items, labels, metadata, CTA button labels, utility copy, secondary descriptions, and system-feeling interface text.
- Headings should feel assertive, compact, and high-contrast.
- Mono text should feel controlled, technical, and slightly editorial.

### Typography feel
- Marketing pages should feel premium, deliberate, and contemporary.
- Supporting text should feel systematic and product-aware, not casual.
- Avoid overly playful type treatments.
- Avoid mixing too many font personalities.

## Shape language

Echo11 currently prefers **sharp edges**.

### Rules
- Default to `rounded-none` or very restrained geometry.
- Buttons, cards, icon containers, and panels should feel precise and architectural.
- Sharp corners are part of the product personality.
- If rounded corners are used later, they should be subtle and intentional, not soft or bubbly.

### Avoid
- Pill-heavy UI everywhere
- Overly soft cards
- Consumer-app rounded styling that weakens the current technical/studio tone

## Layout system

The public-facing site uses a wide, spacious, presentation-led structure.

### Current layout characteristics
- Main container width: `max-w-7xl`
- Horizontal padding: `px-6 lg:px-8`
- Strong vertical breathing room
- Large hero-first composition
- Storytelling sequence through homepage sections

### Page composition rules
- Build pages as editorial/product narratives, not as template blocks.
- Favor confident sectional pacing: hero, evidence, capabilities, work, process, CTA.
- Give content room to breathe.
- Use asymmetry only when it strengthens rhythm.
- Keep section hierarchy very clear.

### Marketing surfaces
Current homepage flow:
- Hero
- Marquee
- Services
- Selected work
- Process timeline
- CTA banner

This means Echo11's marketing frontend should feel like a curated studio presentation.

### App surfaces
There are distinct route groups for:
- marketing/public site
- portal
- lab

These should share the same visual DNA but can vary in density and interaction complexity.

## Surface treatment

Echo11 uses translucency and atmosphere selectively.

### Existing patterns
- `.glass`
- `.lab-glass`
- subtle white borders at very low opacity
- blur-backed overlays
- grain overlay on the page shell
- radial cyan lighting/orb treatment on inner pages

### Rules
- Use glass effects for headers, overlays, and emphasis surfaces.
- Keep glass restrained; it should feel premium, not gimmicky.
- Use dark cards and low-opacity borders for depth.
- Use glow as atmosphere, not as noise.

### Avoid
- Frosted-glass on every single surface
- Heavy glow on too many components
- Overusing blur until readability suffers

## Component styling

### Buttons
Current button language is:
- sharp-edged
- compact but premium
- often mono uppercase or technical-feeling text
- accent fill or accent outline
- subtle glow when interactive
- glass variant for secondary actions

Use these patterns:
- primary action: accent background, dark text, clear emphasis
- outline action: accent border and accent text
- glass action: translucent secondary emphasis

### Cards and panels
- Dark fill or translucent fill
- Fine border treatment
- Hover states through contrast and border changes, not exaggerated transforms
- Sharp or nearly sharp corners
- High readability first

### Inputs
Existing input style favors:
- dark translucent fields
- low-opacity borders
- accent-focused border or ring on focus
- subdued placeholder text

### Icons
- Use icons in structured containers, usually dark with subtle borders
- Accent icon color is appropriate when emphasis is needed
- Keep icon usage precise, not playful or noisy

## Motion language

Motion is a core part of Echo11's design identity.

### Existing motion patterns
- letter-by-letter hero entrance
- scroll-based fade and translate in the hero
- animated mobile menu open/close
- CTA sheen animation
- page transition wrapper with fade/slide
- animated Three.js wave field background
- grain and lighting overlays for atmosphere

### Motion rules
- Motion should feel elegant, restrained, and cinematic.
- Use it to create presentation and clarity, not novelty.
- Entrance animations should feel smooth and intentional.
- Hover states should feel precise.
- Ambient motion can exist in the background if it improves emotional tone.
- Respect reduced-motion preferences.

### Avoid
- Cartoonish bounce
- Overly gamified transitions
- Constant large-scale motion on every section
- Motion that distracts from reading or task flow

## Homepage-specific design observations

The hero sets the strongest visual precedent for the brand.

### Hero characteristics
- giant high-contrast heading
- centered composition
- ambient animated wave field
- mono supporting paragraph
- bold dual CTA setup
- cinematic fade at the bottom of the hero

This means future hero sections should preserve:
- strong visual focus
- high contrast
- atmospheric depth
- minimal but impactful copy hierarchy

## Philosophy grid pattern

The feature grid establishes a pattern for content-heavy studio messaging:
- dark cards
- square icon containers
- accent icon color
- low-opacity border
- hover contrast increase
- mono descriptive text

Use this as reference for capability cards, service cards, feature summaries, and value-proposition sections.

## Lab direction

The `/lab` area is still in development, so its UX can evolve more aggressively than the rest of the site.

### Constraint
Even while `/lab` evolves, it should still inherit Echo11's design DNA:
- dark-first surfaces
- restrained cyan accent
- sharp geometry
- mono utility text
- glass/dark surface language
- precision over softness

### Allowed flexibility
- denser layouts
- more utility-first components
- stronger information hierarchy
- more product-oriented navigation and controls

## Design quality test

Before shipping a new UI, ask:
- Does this still feel like Echo11, or does it look like a generic SaaS template?
- Is cyan being used intentionally, or too often?
- Are the shapes too soft?
- Does the page have enough negative space?
- Are typography roles clear between expressive headline and technical support copy?
- Does the motion add clarity or just spectacle?
- Does this fit the marketing/portal/lab surface it belongs to?

## Anti-patterns for Echo11

Do not drift into these patterns unless there is a deliberate redesign:
- soft rounded startup UI
- pastel palettes
- multi-accent rainbow branding
- excessive shadows replacing glow and contrast
- generic corporate landing-page blocks
- decorative clutter with no structural purpose
- visual inconsistency between public site and product surfaces

## Practical design direction for future work

When extending Echo11, aim for:
- premium but restrained
- technical but not cold
- cinematic but not noisy
- modern but not trendy for trend's sake
- expressive in headlines, controlled in systems
- modular enough to scale into product surfaces

## Source of truth

This skill is based on the actual implementation in:
- `src/app/globals.css`
- `tailwind.config.ts`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/PageWrapper.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/PhilosophyGrid.tsx`
- `src/components/ui/*`

If those files materially change, this skill should be updated.
