---
name: echo11-dev
description: Use this skill when working on the Echo11 repository. It provides repo-wide development workflow, stack context, coding conventions, validation commands, and architecture guidance for full-stack work.
---

# Echo11 development skill

Use this skill for general development work across the Echo11 repository.

## Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Auth
- Resend
- React Hook Form + Zod
- Lucide React
- @react-pdf/renderer

## Main repo areas
- `src/app` for routes and layouts
- `src/components` for UI, layout, lab, dashboard, and section components
- `src/lib` for actions, hooks, utilities, and integrations
- `src/types` for shared types
- `supabase` for database and migrations
- `docs` and `scripts` for project support material

## Required commands
Run from repo root:

```bash
npm run dev
npm run lint
npm run build
npx tsc --noEmit
```

Always run `npm run build` after meaningful changes.

## Conventions
- Use `@/` aliases for internal imports.
- Keep import order: React, external libs, internal modules.
- Avoid `any`; use explicit types.
- Use interfaces for object shapes and shared exported types where appropriate.
- Use existing UI primitives before inventing new ones.
- Follow the current dark-first Echo11 design language.

## Architecture notes
- Echo11 has separate route surfaces for marketing, portal, and lab.
- Public-facing pages are presentation-led and brand-heavy.
- Portal and lab are more app-like, but should still inherit project tokens and visual DNA.
- Do not treat `/lab` as a separate visual universe.

## Error handling
- Use try/catch for async work.
- Return structured success/error objects for actions where practical.
- Log errors with useful context.
- Keep user-facing messages clear and non-technical.

## Full-stack expectation
When making changes, think across:
- frontend UX and visual consistency
- server action behavior
- Supabase schema and access implications
- business purpose of the feature
- maintainability and future extensibility

## Source
This skill is derived from the repository structure, `AGENTS.md`, and direct inspection of the existing Echo11 codebase.
