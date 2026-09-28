# Project File Audit & Compression Plan

## Overview
This document audits the current Echo11 repository at a file and documentation level and classifies what appears to be:
1. **Essential** — critical to product operation, business workflow, or delivery
2. **Important but compressible** — useful, but too verbose, duplicated, or can be summarized/modularized
3. **Review / archive candidates** — likely stale, duplicated, transitional, or carrying unnecessary weight
4. **Dumping Unnecessary Data** — stale caches and old dumps that need immediate deletion.

This is not a deletion script. It is a **decision document** for cleanup, consolidation, and long-term maintainability.

---

## 1. Essential Files (Do Not Remove)
These files and directories are critical to the runtime, compilation, and architecture of the product.
- `src/app/**`: Core Next.js App Router definitions.
- `src/components/**`: UI primitives, forms, and shared React components.
- `src/lib/**`: Server actions, Supabase client initializers, generic utilities (e.g., `src/lib/animations.ts` which should remain the centralized hub for motion patterns).
- `src/data/**`: Core content (e.g., `src/data/caseStudies.ts` which must remain the single canonical source of truth for portfolio data).
- `src/types/**`: TypeScript type definitions (e.g., `lab.ts`, `index.ts`).
- `supabase/migrations/**`: Immutable database schema history.
- `public/**`: Core static assets and images (ensure only referenced assets remain).
- **Essential Docs:** `docs/adr/**`, `docs/architecture/**`, `docs/supabase-schema.sql`, `docs/CHANGELOGS.md`.
- **Configuration files:** `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `.env.example`, `AGENTS.md`.

---

## 2. Dumping Unnecessary Data (Safe to Delete)
The repository has accumulated roughly **~3.8GB** of stale build caches and unnecessary generated dumps.

### Massive Stale Caches
- `.next_stale/` (~700MB)
- `.next_stale_framer_vendor_20260522_075353/` (~571MB)
- `.next_stale_permanent_fix_20260522_081419/` (~635MB)
- `.next_stale_post_svix_fix_20260522_140800/` (~653MB)
- `.next_stale_runtime_rebuild_20260522_150214/` (~618MB)
- `.next_stale_vendor_fix/` (~699MB)
**Action:** Delete these directories entirely. They are dead weight from previous build debugging.

### Generic System Junk
- `.DS_Store` files inside `docs/` and root.
**Action:** Delete immediately.

### One-Off Scripts & Plugin Dumps
- `patch.py` (12KB in root)
- `.opencode/` and `.qodo/` configuration/plan histories
**Action:** Review if they are actively used by your IDE; otherwise, add to `.gitignore` and delete from tracking.

---

## 3. Files to Compress or Summarize
These documents contain valid historical and architectural context but have grown into massive monolithic files. They should be modularized, summarized, or split into "current state" vs "archive".

### `lab-frontend.md` (~70KB)
A massive top-level markdown file containing detailed component structures, route outlines, and state documentation for the entire `/lab` system.
**Compression Strategy:** 
- Break it down into modular documents under `docs/frontend/` (e.g., `docs/frontend/auth.md`, `docs/frontend/dashboard.md`).
- Summarize the high-level routing structure into a single `docs/frontend/overview.md` and archive the extremely verbose component breakdowns.

### Active Instruction Docs (`docs/team-instruction/*.md`)
These have accumulated too much historical layering (multiple rounds of reviews, agent handoffs, old sprints).
**Compression Strategy:**
- Keep the current role, scope, output required, and next steps in the active file.
- Move historical rounds and agent transitions to `docs/archive/team-instruction-history/`.

### `docs/onprogress.md` (~44KB)
Appears to be a rolling execution log that has grown continuously.
**Compression Strategy:**
- Extract the **current status, blockers, and next steps** into a 1-page `docs/status/current-status.md`.
- Move the rest of the historical logs to `docs/archive/status-logs/`.

### `docs/design-echo11Lab.md` (~33KB)
Contains design planning, decisions, and exploratory notes.
**Compression Strategy:**
- Distill the actual design system rules (colors, fonts, tokens) into `docs/design/design-system.md`.
- Archive the historical exploratory notes.

### `docs/clients-dev-plan.md` (~28KB)
**Compression Strategy:**
- Move completed items to a changelog archive.
- Extract active tasks into your actual issue tracker or a concise `docs/status/active-tasks.md`.

---

## 4. Architectural & Route Duplication (Review Candidates)
There are duplicated structural and architectural patterns that need to be consolidated.

### Route Surface Overlap (`/portal` vs `/client`)
The repository contains multiple authenticated client-facing surfaces.
**Action:** Decide if both `/portal` and `/client` are active. Document why and who uses each. If one is transitional, archive or redirect the older surface to keep a single canonical route.

### Repeated Motion Patterns
Oversized section components are duplicating animation variants.
**Action:** Centralize shared motion helpers into `src/lib/animations.ts`.

---

## Summary of Execution Plan

### P0 — Immediate Cleanup
1. **Delete:** ~3.8GB of `.next_stale*` directories and `.DS_Store` files.
2. **Delete/Ignore:** `patch.py`, `.opencode/`, and `.qodo/` if not strictly required.

### P1 — Documentation Consolidation
1. Split `lab-frontend.md` into smaller context files.
2. Clean up `docs/team-instruction/*.md` and move history to archives.
3. Separate active logs (`onprogress.md`) from historical archives.
4. Extract pure design tokens from `docs/design-echo11Lab.md`.

### P2 — Code Structure Optimization
1. Resolve the `/portal` vs `/client` route duplication.
2. Standardize animations in `src/lib/animations.ts`.
3. Keep `src/data/caseStudies.ts` strictly canonical and compact.