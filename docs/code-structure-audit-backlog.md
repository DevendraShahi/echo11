# Code Structure Audit Backlog

This backlog outlines the pending architectural and codebase-level optimizations planned for the next execution phase. These tasks involve modifying application source code and runtime structures, so they must be approached carefully to avoid regressions.

## 1. Route Surface Consolidation (`/portal` vs `/client`)
Currently, there are two distinct client-facing authenticated routes in the repository.
- **Audit Task:** Analyze usage, active components, and database queries for both `src/app/portal/` and `src/app/client/`.
- **Action Plan:** Determine which route is the canonical V2 implementation (likely `/client` based on recent ADRs/Plans) and which is the legacy surface. 
- **Execution:** Safely migrate any missing features from the legacy surface to the canonical one, implement a 301 redirect or middleware routing if needed, and delete the obsolete directory.

## 2. Animation Standardization
Motion patterns and animation configurations are scattered across multiple UI components.
- **Audit Task:** Scan `src/components/` and `src/app/` for inline `framer-motion` variants and hardcoded transition settings.
- **Action Plan:** Extract these reusable motion configurations (e.g., fade-in, slide-up, stagger children) into the central `src/lib/animations.ts` file.
- **Execution:** Refactor components to import and apply standard animation objects from the library, ensuring consistent timing and easing across the product while reducing bundle size.

## 3. API v1 Cutover & Server Action Cleanup
The codebase is currently in a transitional state moving towards a structured `/api/v1` layer.
- **Audit Task:** Identify legacy server actions that still perform direct, raw Supabase mutations outside of the formalized API contracts.
- **Action Plan:** Map these remaining raw mutations to the new `api/v1` fetch boundaries.
- **Execution:** Replace direct database writes in UI server actions with internal API calls, ensuring the Outbox Dispatcher and projection models are consistently triggered.

## 4. Component & Asset Pruning
With the documentation and static assets cleaned up, the component tree should be reviewed for dead code.
- **Audit Task:** Run a dead-code analysis (e.g., `knip` or manual search) to find orphaned React components in `src/components/` that are no longer imported by any page.
- **Action Plan:** Catalog unused components and verify they aren't dynamically loaded.
- **Execution:** Remove dead components and their specific CSS/utility dependencies.

---
*This backlog represents the next logical phase of repository optimization following the successful Documentation and Asset Cleanup phase.*
