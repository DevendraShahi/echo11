# ADR-003: Outbox, Audit, And Projection Baseline

## Status
Accepted

## Context
Realtime dashboards and notifications were coupled to mutable domain tables and ad-hoc activity writes.

## Decision
- Add `domain_events` outbox table for domain event emission.
- Add immutable `audit_log` for actor/action/entity before/after tracking.
- Add projection tables:
  - `client_dashboard_projection`
  - `team_workload_projection`
  - `unread_counts_projection`
  - `activity_projection`
- API mutations must emit correlation IDs and write event/audit artifacts.

## Consequences
- Read models can be rebuilt and validated independently.
- Observability and incident forensics become materially stronger.
- A dispatcher/projection worker is still needed for full async propagation (next phase).
