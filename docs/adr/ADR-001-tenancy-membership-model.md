# ADR-001: Tenancy Spine And Membership Model

## Status
Accepted

## Context
Echo11 previously mixed profile roles, team links, and client links without a strict tenancy key. This caused authorization drift and cross-domain visibility conflicts.

## Decision
- Introduce `organizations` as the tenancy root.
- Add `organization_id` to all core business tables (`teams`, `clients`, `projects`, `tasks`, `invoices`, `contracts`, `meetings`, `profiles`).
- Replace role-only auth with explicit memberships:
  - `organization_memberships`
  - `team_memberships`
  - `client_memberships`
- Keep `profiles` for display metadata and compatibility during transition.

## Consequences
- Authorization logic can be expressed with stable DB helpers and RLS policies.
- Cross-tenant leakage risk is reduced because every domain row is org-scoped.
- Migration requires backfill and phased compatibility handling.
