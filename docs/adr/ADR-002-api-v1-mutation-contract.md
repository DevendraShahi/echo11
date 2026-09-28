# ADR-002: API v1 Mutation Contract

## Status
Accepted

## Context
Server actions previously mutated tables directly with inconsistent permission checks and response shapes. That made conflict handling and retries unsafe.

## Decision
- Standardize mutations behind `/api/v1` endpoints.
- All write endpoints support idempotency via `idempotency-key` and `request_dedup`.
- All write responses include mutation metadata:
  - `resource_id`
  - `lock_version`
  - `event_id`
  - `correlation_id`
- Add optimistic concurrency checks on versioned entities (`projects`, `tasks`, `clients`, `invoices`, `contracts`) using `expected_lock_version`.

## Consequences
- Retries become safe and duplicate writes are suppressed.
- Clients can reliably detect and handle write conflicts.
- Existing server actions can be migrated incrementally as thin wrappers over API v1.
