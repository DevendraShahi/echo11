# Echo11 Policy Matrix v1

## Scope
- Principal roles: `admin`, `lead`, `member`, `client`
- Authorization helpers under test:
  - `can_read_team`
  - `can_manage_team`
  - `can_read_project`
  - `can_manage_project`
  - `can_read_task`
  - `can_manage_task`
  - `can_read_client`
  - `can_manage_client`

## Expected Matrix

| Helper | admin | lead | member | client |
|---|---:|---:|---:|---:|
| `can_read_team` | ✅ | ✅ | ✅ | ❌ |
| `can_manage_team` | ✅ | ✅ | ❌ | ❌ |
| `can_read_project` | ✅ | ✅ | ✅ | ❌ |
| `can_manage_project` | ✅ | ✅ | ❌ | ❌ |
| `can_read_task` | ✅ | ✅ | ✅ | ❌ |
| `can_manage_task` | ✅ | ✅ | ✅ | ❌ |
| `can_read_client` | ✅ | ✅ | ✅ | ✅ |
| `can_manage_client` | ✅ | ✅ | ❌ | ❌ |

## Commands
- Static policy coverage check (migration-level):
  - `npm run check:policy:matrix`
- Live policy matrix assertions (creates temporary fixture users/data, then cleans up):
  - `npm run check:policy:matrix:live`

## Notes
- Static check validates required helper functions, grants, and key RLS policy declarations in migration `20260520000000_unified_architecture_foundation.sql`.
- Live check requires:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  in environment (or `.env.local`).
