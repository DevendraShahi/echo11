# AGENTS.md - Development Guidelines for Echo11

This file contains guidelines and commands for agentic coding agents working in this repository.

---

## 1. Build, Lint, and Test Commands

### Development
```bash
npm run dev        # Start development server (https://echo11.tech)
npm run start      # Start production server
```

### Building (ALWAYS run after changes)
```bash
npm run build      # Production build
```

### Linting & Type Checking
```bash
npm run lint       # Run ESLint
npx tsc --noEmit   # TypeScript type checking only
```

### Testing
**No test framework is configured.** There are no test files, no vitest/jest config, and no test scripts in `package.json`. Do not attempt to run tests.

---

## 2. Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode, target ES2017)
- **Styling:** Tailwind CSS v3.4
- **Database:** Supabase (PostgreSQL) — project: `hwddfqgxmdhsmjzydywz`
- **Auth:** Supabase Auth (via `@supabase/ssr`)
- **Email:** Resend
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **3D:** Three.js
- **Onboarding:** react-joyride
- **PDF:** @react-pdf/renderer (for contracts and invoices)

---

## 3. Architecture

### Route Surfaces
| Route | Purpose |
|---|---|
| `/` | Marketing site (homepage + about, contact, services, work, process, methodology, manifesto, privacy, terms) |
| `/lab` | Internal agency management app |
| `/portal` | Client-facing portal |

### Lab Auth Structure
- **NO `middleware.ts`** — Auth is handled entirely in layout components
- `/lab/(auth)/` — Unauthenticated routes (login, signup). Client-side layout redirects to dashboard if already logged in
- `/lab/(authenticated)/` — Authenticated routes (dashboard, clients, projects, tasks, contracts, invoices, meetings, teams, settings). Server-side layout checks auth, redirects to login if unauthenticated, fetches `user_preferences` for theme
- `/lab/layout.tsx` — Pass-through layout (just renders children)

### Portal Auth Structure
- `/portal/layout.tsx` — Server-side layout checks auth, redirects to `/portal/auth/login` if unauthenticated
- Checks `profiles.role` for admin/member/client access
- Portal uses indigo/purple accent; Lab uses cyan (`#00E5FF`)

### Entry Points
- Root layout (`src/app/layout.tsx`) applies `Cursor`, `Navbar`, `Footer` globally — lab and portal override with their own full-screen layouts
- Font: `Syne` (sans-serif), `JetBrains_Mono` (mono)
- Root layout forces `dark` mode on `<html>`

---

## 4. File Organization

```
src/
├── app/
│   ├── (marketing routes)       # about, contact, services, work, process, etc.
│   ├── lab/
│   │   ├── (auth)/              # login, signup (client-side auth check)
│   │   ├── (authenticated)/     # dashboard, clients, projects, tasks, etc. (server-side auth check)
│   │   └── layout.tsx           # pass-through
│   └── portal/
│       ├── auth/                # login, callback, verify, signout
│       └── layout.tsx           # server-side auth check
├── components/
│   ├── ui/                      # 17 reusable UI primitives (Button, Card, Badge, LabButton, LabCard, etc.)
│   ├── lab/                     # 16 lab-specific components (ClientCard, KanbanBoard, forms, etc.)
│   ├── layout/                  # Footer, Navbar, PageWrapper
│   │   └── lab/                 # LabSidebar, LabHeader, LabFooter, ThemeProvider, CommandPalette
│   ├── dashboard/               # Dashboard widgets (ActiveProjects, RevenueChart, StatCard, etc.)
│   ├── sections/                # Marketing page sections (Hero, ServicesGrid, ProcessTimeline, etc.)
│   ├── onboarding/              # react-joyride onboarding tours
│   └── contracts/               # Contract-specific components
├── lib/
│   ├── actions/                 # 12 server action files (client, project, task, invoice, contract, etc.)
│   ├── supabase/                # client.ts (browser), server.ts (server)
│   ├── contract-template-engine.ts
│   ├── contract-pdf.tsx / invoice-pdf.tsx
│   ├── email.ts
│   ├── animations.ts
│   └── utils.ts                 # cn() utility
├── types/
│   ├── lab.ts                   # 378 lines — all lab types (Client, Project, Task, Invoice, etc.)
│   └── index.ts                 # Marketing types (Project, Service, PricingTier, NavItem)
└── data/                        # Static data
supabase/
└── migrations/                  # Database migrations
```

### Important Type Notes
- `Project` and `Service` exist in BOTH `types/index.ts` (marketing) and `types/lab.ts` (lab) with different shapes. Import from the correct file.
- Export lab types from `@/types/lab`, marketing types from `@/types`

---

## 5. Code Style Guidelines

### Import Order
```typescript
import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Client, Project } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
```
**Use `@/` path aliases for all internal imports.**

### TypeScript Rules
- Strict mode enabled
- **Avoid `any`** — use proper types or `unknown` with type guards
- Use interfaces for object shapes, `type` for unions

### Naming Conventions
- **Components:** PascalCase
- **Files:** PascalCase for components, kebab-case for Next.js conventions (`page.tsx`, `layout.tsx`)
- **Variables/functions:** camelCase
- **Types/Interfaces:** PascalCase

### Server Actions Pattern
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function doSomething(param: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in' }

  try {
    const { error } = await supabase.from('table').insert({ ... })
    if (error) {
      console.error('Error:', error)
      return { success: false, error: error.message }
    }
    revalidatePath('/lab/some-page')
    return { success: true }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
```

### Server Action Files (12 total)
- `client-actions.ts` — Client CRUD, portal invites
- `project-actions.ts` — Project CRUD, task toggling, milestone-based progress
- `task-actions.ts` — Task CRUD
- `invoice-actions.ts` — Invoice CRUD
- `contract-actions.ts` — Contract CRUD, generation, sending
- `meeting-actions.ts` — Meeting CRUD
- `team-actions.ts` — Team management
- `note-actions.ts` — Client notes
- `document-actions.ts` — Document management
- `notification-actions.ts` — Notifications
- `settings-actions.ts` — User preferences
- `contact-actions.ts` — Contact form

### Tailwind CSS
- Use design tokens: `accent`, `background`, `foreground`, `card`, `muted`, `border`
- Use `cn()` utility for conditional classes
- `font-sans` = Syne, `font-mono` = JetBrains Mono
- Dark-first: black background, cyan accent (`#00E5FF`) for lab, indigo/purple for portal
- Sharp edges (no rounded corners unless specified)
- Glassmorphism: `bg-white/5 backdrop-blur-md border border-white/10`

---

## 6. Database & Supabase

### Client/Server Pattern
- **Server Components:** `import { createClient } from '@/lib/supabase/server'` — async function, uses `@supabase/ssr` `createServerClient`
- **Client Components:** `import { createClient } from '@/lib/supabase/client'` — sync function, uses `createBrowserClient`
- Both use the anon key (not service role key)

### Migrations
- Applied via `npx supabase db push` or Supabase MCP tools
- 7 migrations covering: RLS fixes, tasks/org enhancements, task attachments, user preferences (with auto-creation trigger), contracts overhaul (5 seeded templates)

### Common RLS Patterns
```sql
CREATE POLICY "Users can read" ON table_name FOR SELECT USING (true);
CREATE POLICY "Users can insert" ON table_name FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update" ON table_name FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete" ON table_name FOR DELETE USING (auth.uid() = user_id);
```

### Storage
- `contracts` bucket: public read, authenticated write/delete

### Key Tables
`profiles`, `user_preferences`, `clients`, `client_contacts`, `client_documents`, `activities`, `projects`, `milestones`, `project_expenses`, `tasks`, `task_comments`, `task_attachments`, `time_logs`, `teams`, `meetings`, `meeting_attendees`, `contracts`, `contract_templates`, `invoices`, `invoice_items`, `services`, `notifications`

---

## 7. UI Components

### Lab UI (`src/components/ui/`)
- `LabButton` — variants: default, ghost, glass, danger
- `LabCard`, `LabBadge`
- `PageHeader` — page title with icon and action button
- `SearchInput` — search with clear button
- `FilterTabs` — filter tabs with optional counts
- `EmptyState` — empty state with icon, title, description, action

### Layout (`src/components/layout/lab/`)
- `LabSidebar` — side navigation
- `LabHeader` — top header (sticky)
- `LabFooter` — bottom footer
- `ThemeProvider` — theme context provider
- `CommandPalette` — command palette
- `NotificationBell` — notification indicator

### Dashboard Widgets (`src/components/dashboard/`)
- `ActiveProjects`, `OverdueTasks`, `QuickActions`, `StatCard`
- `ProjectStatusChart`, `RevenueChart`, `TaskCompletionChart`
- `DateRangePicker`

---

## 8. Important Notes

- **Always run `npm run build`** after meaningful changes
- **Remove `console.log`** before committing
- Use `Link` from `next/link` for internal navigation
- Use `format()` from `date-fns` for dates
- Check existing components before creating new ones
- Server actions log to `activities` table after mutations
- `user_preferences` table auto-creates on profile insert (trigger-based)
- `src/lib/hooks/` directory exists but is empty
- `.env.local` is gitignored; see `.env.example` for required vars

---

## 9. Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-only (not currently used by server client)
```

---

Update this file when codebase conventions change.
