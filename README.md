# Echo11

Echo11 is a dark-first digital studio site with an internal agency workspace and a client workspace.

## Applications

- `/` — public marketing site
- `/lab` — internal agency workspace
- `/client` — current client workspace
- `/portal` — legacy client portal kept for compatibility

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Next.js (normally `http://localhost:3000`). Fill in the Supabase settings in `.env.local` before using authenticated or data-backed features or creating a production build. See [.env.example](.env.example) for the supported variables.

## Development checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

No automated test suite is currently configured. Use the checks above and manually verify the affected route or workflow.

## Project guidance

Read [AGENTS.md](AGENTS.md) before contributing. It contains the architecture, conventions, verification expectations, database rules, and routing instructions for the Echo11 project skills in `.opencode/skills/`.

## Database

Schema and RLS changes belong in [supabase/migrations](supabase/migrations). The migrations are the canonical schema history; `docs/supabase-schema.sql` is only a reference/bootstrap document and may not contain the latest changes.
