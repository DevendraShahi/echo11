# Current Project Status

> Last Updated: May 20, 2026
> Session Focus: Unified architecture baseline rollout (DB-first, API v1 cutover)

## Active Work
- **API v1 Cutovers:** Moving server actions from direct `supabase` mutations to internal `/api/v1` fetches (e.g., `teams`, `projects`, `tasks`, `finance`, `CRM`).
- **Outbox Dispatcher:** Polling/refreshing projections (`activity_projection`, `client_dashboard_projection`, `team_workload_projection`, `unread_counts_projection`) using outbox events.
- **Pending Tasks:**
  - Run pending Supabase migrations in linked project (`npx supabase db push`).
  - Add policy matrix tests for critical tables and role combinations.
  - Add OpenAPI contract conformance tests for `/api/v1`.
  - Wire recurring scheduler + alerting for outbox retry saturation/failures.
  - Remove legacy direct-write compatibility code after validation window.

> Note: The massive historical progress logs spanning April to May have been moved to `docs/archive/status-logs/onprogress-history.md`.
