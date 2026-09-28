# Design System

## Core Aesthetic
- **Theme**: Dark-first (black background), premium, sharp edges.
- **Accent Color**: Cyan `#00E5FF`
- **Typography**: 
  - Sans: `Syne` (headings, body, navigation)
  - Mono: `JetBrains Mono` (meta info, dates, counts, labels)

## Component Rules
- **Buttons**: `LabButton` supports 7 variants (default, destructive, danger, outline, secondary, ghost, glass, glow). Use uppercase mono for text.
- **Cards**: `LabCard` uses glassmorphism: `bg-white/5 backdrop-blur-md border border-white/10`.
- **Forms**: Managed by React Hook Form + Zod for validation.
- **Icons**: Lucide React.
- **Animations**: Managed by Framer Motion, centralized in `src/lib/animations.ts`. Micro-interactions (hover states, glow shadows) are critical for the premium feel.

> Note: The original architectural exploratory notes for echo11Lab have been archived in `docs/archive/design-echo11Lab-full.md`.
