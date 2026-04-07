---
name: echo11-frontend
description: Use this skill when building or refining Echo11 frontend code, including routes, layouts, components, interactions, responsive behavior, and implementation patterns for the marketing site, portal, and lab surfaces.
---

# Echo11 frontend skill

Use this skill for frontend implementation in Echo11.

## Scope
Apply this skill when working on:
- Next.js App Router pages and layouts
- section components
- UI primitives
- navigation and page transitions
- responsive behavior
- portal and lab frontend interfaces

## Frontend architecture
Echo11 frontend is split across three main surfaces:
- public marketing site
- portal
- lab

They should feel related, even when interaction density differs.

## Component structure
Primary component groups currently include:
- `components/ui`
- `components/layout`
- `components/sections`
- `components/lab`
- `components/dashboard`

Prefer extending these patterns instead of creating arbitrary new structures.

## Layout guidance
- Use `Container` for consistent page width and horizontal rhythm.
- Preserve the current wide layout language on public pages.
- Use `PageWrapper` for motion and atmosphere-aware page structure where applicable.
- Keep layout hierarchy obvious and uncluttered.

## Styling rules
- Use Tailwind with project tokens from `globals.css` and `tailwind.config.ts`.
- Reuse utilities like `glass`, `lab-glass`, `lab-card`, `lab-border`, and `lab-input` where they fit.
- Keep cyan accent usage deliberate.
- Default to sharp geometry.
- Maintain dark-first contrast.

## Responsive rules
- Desktop should feel premium and spacious.
- Mobile should preserve hierarchy without collapsing into clutter.
- Navigation transitions should remain clean and readable.
- Button groups should stack naturally on smaller viewports.
- Avoid dense side-by-side grids on small screens unless clearly justified.

## Interaction rules
- Use motion for clarity and polish.
- Hover states should mostly shift contrast, border, glow, or background subtly.
- Avoid excessive scaling or novelty animation.
- Preserve the current Framer Motion tone: smooth, premium, controlled.

## Implementation rules
- Prefer existing primitives like `Button`, `LabButton`, `Card`, `LabCard`, `Container`, and page/layout wrappers.
- Keep internal links on `next/link`.
- Avoid inline styles unless needed for special visual systems.
- Keep components focused and composable.
- If a section introduces new UI language, make sure it still feels like Echo11.

## Quality check
Before finishing frontend work, ask:
- Does this match the existing Echo11 visual system?
- Is the hierarchy obvious within 3 seconds?
- Does the component look premium instead of generic?
- Does mobile remain readable and intentional?
- Is the motion helpful rather than distracting?
