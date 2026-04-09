# Echo11 Lab — Development Changelog

> Last Updated: April 8, 2026
> Session Focus: Auth redirect hardening, mention notifications, task permissions, domain cleanup

---

## 0. New Changes (April 8, 2026)

### Supabase Auth Redirect Hardening
- Added explicit callback handlers to keep email confirmations on product surfaces:
  - `/lab/auth/callback` verifies Supabase email OTP and redirects to `/lab/auth/login`.
  - `/portal/auth/callback` already existed; invite flows now point at it with `next=/portal/auth/login`.
- Updated all Supabase `emailRedirectTo` values to use production domain (`https://echo11.tech`) with correct callback paths:
  - Team invites: `/lab/auth/callback?next=/lab/auth/login`
  - Client portal invites: `/portal/auth/callback?next=/portal/auth/login`
  - Portal magic link login: `/portal/auth/callback`
- Removed localhost fallbacks from invite emails, contract links, and portal signout redirects. Default domain is now echo11.tech unless env overrides.
- Self-signup disabled: `/lab/auth/signup` now shows “self-signup is disabled” notice and routes users to login; only invitation flows remain.
- Login guard: if a user signs in with an unverified email, we sign them out and surface “Email not verified”.

Key files:  
- `src/app/lab/auth/callback/route.ts` (new)  
- `src/app/lab/(auth)/auth/team-signup/page.tsx`  
- `src/app/portal/auth/verify/page.tsx`  
- `src/app/portal/auth/login/page.tsx`  
- `src/app/portal/auth/signout/route.ts`  
- `src/lib/actions/contract-actions.ts`, `src/lib/email.ts`, `src/app/preview-invite/page.tsx`

### Moodboard Mentions & Notifications
- Moodboard chat now supports @mentions of team members with a dropdown picker.
- Mentions trigger per-user notifications linking back to the team moodboard.
- Team members are fetched to power suggestions; mention parsing is regex-based and trims duplicates.

Key files:  
- `src/app/lab/(authenticated)/teams/[id]/moodboard/page.tsx`  
- `src/lib/actions/team-moodboard-actions.ts`

### Task Permissions & Filters
- Kanban board enforces: only admins or team leads can move tasks into “Done”; members are blocked with client+server validation and optimistic rollback.
- “My Tasks” toggle removed (existing assignee filter remains); project selection restored to required dropdown.
- Status updates validated server-side in `updateTaskStatus`.

Key files:  
- `src/components/lab/KanbanBoard.tsx`  
- `src/lib/actions/task-actions.ts`

### Domain & URL Cleanup
- Default app/lab/portal URLs now point to `https://echo11.tech` in all generated links (contracts, emails, preview invite, portal signout).
- README/AGENTS updated to reference the production domain instead of localhost.

### What’s Left / Known Warnings
- Current lint/type warnings unrelated to these changes still exist (see latest `npm run build` output: unused vars, missing hook deps, several `any` usages, alt text warnings).
- Ensure production env vars are set: `NEXT_PUBLIC_APP_URL=https://echo11.tech`, `NEXT_PUBLIC_LAB_URL`, `NEXT_PUBLIC_PORTAL_URL`, Supabase keys, Resend keys.
- Supabase dashboard must list allowed redirect URLs:  
  - `https://echo11.tech/lab/auth/callback` (and `?next=/lab/auth/login`)  
  - `https://echo11.tech/portal/auth/callback` (and `?next=/portal/auth/login`)

---

## 1. Onboarding Tour Improvements

### Problems Fixed
- Tour was freezing after step 1 due to nested scroll containers conflicting with react-joyride.
- Beacon (pulsing indicator) was invisible -- black-on-black background.

### Solutions Applied
- Disabled library-level scrolling in react-joyride config.
- Implemented manual scrollIntoView logic in the joyride callback.
- Re-colored beacon to white (#FFFFFF) with a translucent glow.

Key File: src/components/onboarding/TooltipTour.tsx

---

## 2. Team Member Invitation Flow

### Overview
Built a complete end-to-end invitation system. Previously, inviting someone only created a DB record with no email and no signup page.

### Full Flow

Admin hits "Invite" on /lab/settings
  => inviteTeamMember() creates team_invites record (expires 7 days)
  => sendTeamInvitation() sends Resend HTML email
     Link: {LAB_URL}/auth/team-signup?invite={INVITE_ID}

Invitee clicks link => /lab/auth/team-signup?invite=...
  => getInviteDetails(inviteId) [Server Action, Service Role -- bypasses RLS]
     Validates invite is pending + not expired
     Returns: { email, role }

Invitee fills form (name + password)
  => supabase.auth.signUp() runs in browser (Supabase sends verification email)
  => acceptTeamInvite(inviteId, userId, fullName) [Server Action, Service Role]
     Updates profiles.role and full_name
     Marks team_invites.status = 'accepted'

Success => /lab/auth/login

### Key Design Decisions
- No premature auth accounts: Supabase users created ONLY when invitee fills the form.
- Service role used server-side only to bypass RLS for unauthed token lookups.
- Invite ID is UUID, checked for pending + non-expired status before any data returned.

### Key Files
- src/lib/actions/settings-actions.ts  -- inviteTeamMember, getInviteDetails, acceptTeamInvite
- src/lib/email.ts                      -- sendTeamInvitation
- src/app/lab/(auth)/auth/team-signup/page.tsx -- New signup page

### UI Design
Black background + cyan (#00E5FF) accents. Three states: Loading, Form, Success.

---

## 3. Client Portal Invitation Flow

### Overview
Rebuilt client portal invitations. Old system used supabase.auth.admin.createUser at invite time,
creating passwordless ghost accounts. Replaced with same token-based pattern as team invites.

### Full Flow

Admin invites client from /lab/clients
  => Generates random 32-byte hex token
  => Saves to clients.invitation_token
  => Sends Resend HTML email
     Link: {PORTAL_URL}/auth/verify?token={TOKEN}
  => NO auth user created yet

Client clicks link => /portal/auth/verify?token=...
  => getClientInviteDetails(token) [Server Action, Service Role]
     Looks up clients table by invitation_token
     Returns: { id, email, companyName }

Client fills form (name + password)
  => supabase.auth.signUp() runs in browser
  => acceptClientInvite(clientId, authUserId, fullName) [Server Action, Service Role]
     profiles.role = 'client'
     clients.auth_id = authUserId (links auth to client record)
     clients.invitation_token = null (one-time use, cleared)
     clients.invitation_accepted_at = now()

Success => /portal/auth/login

### Key Files
- src/lib/actions/client-actions.ts         -- createClientWithAuth, sendClientPortalInvite, getClientInviteDetails, acceptClientInvite
- src/lib/email.ts                           -- sendClientInvitation
- src/app/portal/auth/verify/page.tsx        -- Rebuilt verify/setup page

### UI Design
Dark navy + Indigo/Purple accents (portal branding). Company name shown in badge. Three states: Loading, Form, Success.

---

## 4. Email Infrastructure (Resend)

All emails use hand-written HTML (no React Email dependency) for maximum compatibility.

Function                Triggered by
sendTeamInvitation      Team member invite
sendClientInvitation    Client creation / portal invite
sendWelcomeEmail        On demand
sendContractEmail       Contract send action

### Dev Mode
When RESEND_API_KEY is absent, emails are logged to terminal including the full link. No real email sent.

### Required Environment Variables
RESEND_API_KEY=re_...
FROM_EMAIL="echo11 <onboarding@echo11.tech>"
NEXT_PUBLIC_LAB_URL=https://echo11.tech/lab
NEXT_PUBLIC_PORTAL_URL=https://echo11.tech/portal
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

Note: echo11.tech must be DNS-verified in Resend dashboard before sending from @echo11.tech.

---

## 5. Security Audit and RLS Hardening

Check                                    Status    Action
SERVICE_ROLE_KEY in client bundle        Clean     None
auth.admin.* usage                       Removed   Cleaned up this session
Client-side anon key                     Safe      None
contracts table public SELECT            Fixed     Restricted to authenticated
contracts storage public download        Fixed     Restricted to authenticated
team_invites missing explicit RLS        Fixed     Added user-scoped policies

Migration: supabase/migrations/20240408000000_tighten_rls.sql

### Why Service Role Bypasses RLS Safely
getInviteDetails and getClientInviteDetails run server-side only, validate the token first,
and never expose more than email + role + company name. The invitee has no auth session
yet so RLS cannot serve them normally.

---

## 6. Architecture Notes

### Invitation Pattern (Reusable for Future Roles)
1. Generate token/ID and store in DB
2. Send email with link containing that token/ID
3. Server action (service role) validates token on landing page
4. User fills form (name + password)
5. supabase.auth.signUp() called client-side
6. Server action finalizes: update profiles, clear token, set timestamps

This can be extended to contractors, partners, or any future role needing invited access.

### Two Auth Surfaces
Surface    URL        Theme                  Auth Check
Lab        /lab       Black + Cyan           Server layout -> /lab/auth/login
Portal     /portal    Dark navy + Indigo     Server layout -> /portal/auth/login

Lab unauthenticated routes: /lab/(auth)/ -- client-side auth check
Lab authenticated routes: /lab/(authenticated)/ -- server-side auth check

### Environment Variable Rules
Variable                         Browser    Notes
NEXT_PUBLIC_SUPABASE_URL         Yes        Safe by design
NEXT_PUBLIC_SUPABASE_ANON_KEY    Yes        Safe, protected by RLS
NEXT_PUBLIC_LAB_URL              Yes        Just a URL string
NEXT_PUBLIC_PORTAL_URL           Yes        Just a URL string
RESEND_API_KEY                   No         Keep secret
SUPABASE_SERVICE_ROLE_KEY        No         Keep secret, bypasses RLS

### No middleware.ts
Auth is handled in layout components only. Do not add middleware.ts without reviewing
existing redirect logic in both lab and portal layouts.

---

## 7. Pending Work

- [ ] Run: npx supabase db push  (apply RLS hardening migration)
- [ ] Add all env vars to Vercel dashboard under Settings > Environment Variables
- [ ] Verify echo11.tech domain in Resend dashboard
- [ ] Update resendInvite action to also re-send the email (currently only refreshes expiry)
- [ ] Scope RLS on project_expenses to team_id instead of broad authenticated check
- [ ] Optionally collect more info (phone, title) on portal client signup form
- [ ] Add invite expiry countdown UI on /lab/settings team panel

---

## 8. Changes vs. GitHub (git diff HEAD)

The last commit on GitHub (5aaf6a5) is "feat: enhance footer hover and terminal UI buttons".
Everything below is uncommitted local work not yet pushed.

### Modified Files

**src/components/layout/Navbar.tsx + Footer.tsx**
- Both components now use usePathname() from next/navigation.
- Added early return (return null) when the path starts with /lab or /portal.
- This isolates the marketing Navbar and Footer from the Lab and Portal surfaces,
  which have their own dedicated LabSidebar, LabHeader, and LabFooter layouts.

**package.json**
Added 9 new production dependencies not present on GitHub:

Package                    Purpose
@dnd-kit/core              Drag-and-drop (Kanban board)
@dnd-kit/sortable          Sortable lists
@dnd-kit/utilities         DnD utility helpers
@react-pdf/renderer        PDF generation (contracts, invoices)
@supabase/ssr              Supabase SSR client (server components + actions)
@supabase/supabase-js      Supabase base client (admin/service role usage)
date-fns                   Date formatting throughout the app
react-joyride              Onboarding tour
recharts                   Dashboard revenue and task charts
resend                     Transactional email (invitations, contracts)

### New/Untracked Directories (not on GitHub)

Directory                              Contents
src/app/lab/                           Full Lab internal app (dashboard, clients, projects, tasks, meetings, invoices, contracts, teams, settings, docs, auth)
src/app/portal/                        Client portal (auth, dashboard)
src/components/contracts/              Contract-specific components
src/components/dashboard/              Dashboard widgets (StatCard, RevenueChart, ActiveProjects, etc.)
src/components/lab/                    Lab-specific components (ClientCard, KanbanBoard, forms)
src/components/layout/lab/            LabSidebar, LabHeader, LabFooter, ThemeProvider, CommandPalette, NotificationBell
src/components/onboarding/             TooltipTour, HelpModal
src/components/ui/ (additions)         LabButton, LabCard, LabBadge, PageHeader, SearchInput, FilterTabs, EmptyState, Dropdown, ViewToggle
src/lib/actions/                       12 server action files (client, project, task, invoice, contract, meeting, team, note, document, notification, settings, contact)
src/lib/supabase/                      client.ts + server.ts Supabase helpers
src/lib/email.ts                       Full Resend email library
src/lib/contract-pdf.tsx               PDF renderer for contracts
src/lib/invoice-pdf.tsx                PDF renderer for invoices
src/lib/contract-template-engine.ts    Variable substitution engine for contract templates
src/types/lab.ts                       All Lab TypeScript types (378 lines)
supabase/migrations/                   6 database migrations
docs/                                  This changelog file
AGENTS.md                              AI agent development guidelines
scripts/                               Setup scripts

---

## 9. Commit Breakdown — feat: full lab & portal build (April 7, 2026)

Commit: 8ecfaac | Branch: main | Repo: https://github.com/DevendraShahi/echo11
Total: 216 files (189 new, 4 modified)

---

### Built complete Lab internal app (/lab)
The entire agency management application was built under src/app/lab/(authenticated)/.
Includes 10 full pages: Dashboard (stats, charts, quick actions), Clients (CRM with filters
and sort), Projects (list + detail + milestones + expenses + Kanban), Tasks (board view +
detail modal), Meetings (calendar + CRUD), Invoices (list + create + detail + PDF download),
Contracts (list + generate from templates + send + sign), Teams (member management), Settings
(profile, preferences, team invites, pending invites panel), and Docs (internal documentation).
Each page is a server component that fetches data and passes it to client components.

### Built client-facing portal (/portal)
A separate read-only surface for invited clients at src/app/portal/.
Clients can log in, view their active projects and milestone progress, and download invoices.
The portal has its own layout, auth routes (/portal/auth/login, /portal/auth/verify,
/portal/auth/callback, /portal/auth/signout), and its own indigo/purple color scheme
to visually separate it from the internal Lab.

### Implemented team member invitation flow (token-based, no ghost accounts)
Previously the invite button only wrote a row to the team_invites table. No email was sent
and no signup page existed. This was rebuilt ground-up:
- inviteTeamMember() inserts the invite record and calls sendTeamInvitation().
- The email delivers a secure link containing the invite UUID.
- The new /lab/auth/team-signup page reads the invite ID, validates it server-side using
  the service role key (bypassing RLS since the invitee has no session), pre-fills their
  email, and lets them enter their name and password.
- supabase.auth.signUp() fires only after form submission — no ghost accounts.
- acceptTeamInvite() then elevates their profile role and marks the invite accepted.

### Implemented client portal invitation flow (token-based) with rebuilt /portal/auth/verify
The old flow called supabase.auth.admin.createUser() at invite time which created locked,
passwordless accounts in Supabase Auth without the client knowing. This was completely removed.
New flow generates a 32-byte random hex token, stores it in clients.invitation_token, and
sends it in the portal invite email. The client clicks the link, hits the rebuilt
/portal/auth/verify?token=... page which validates the token server-side, shows them a
setup form for their name and password, calls signUp(), and then acceptClientInvite()
links their new auth ID to the clients record and clears the one-time token.

### Integrated Resend for transactional emails
All four email types are implemented in src/lib/email.ts using hand-written HTML templates
(no React Email dependency, for maximum inbox compatibility):
- sendTeamInvitation: dark-mode email with cyan CTA button, sent on team invite.
- sendClientInvitation: indigo-gradient email with portal access CTA, sent on client invite.
- sendWelcomeEmail: simple welcome message, available for future use.
- sendContractEmail: formal contract-for-review email with contract details and a view link.
In development (no RESEND_API_KEY), all emails are logged to the terminal so links can be
tested without a real API key.

### Added 12 server action files for all CRUD operations
All database mutations happen through Next.js server actions (use server directive), never
through direct client-side queries. Each file owns one domain:
client-actions, project-actions, task-actions, invoice-actions, contract-actions,
meeting-actions, team-actions, note-actions, document-actions, notification-actions,
settings-actions, contact-actions.
All actions follow the same pattern: authenticate user, check permissions, mutate DB,
log to activities table, revalidatePath, return { success, error }.

### Added Supabase SSR client helpers (server.ts + client.ts)
src/lib/supabase/server.ts — async function using @supabase/ssr createServerClient with
cookie store. Used in server components and server actions.
src/lib/supabase/client.ts — sync function using createBrowserClient. Used in client
components for real-time reads. Neither file uses the service role key.

### Added PDF generation for contracts and invoices via @react-pdf/renderer
src/lib/contract-pdf.tsx — renders a styled contract PDF in the browser using
@react-pdf/renderer. Triggered from the contract detail page.
src/lib/invoice-pdf.tsx — renders invoice PDF with line items, totals, and branding.
Both are marked use client and use the PDFDownloadLink component pattern.

### Added contract template engine with variable substitution
src/lib/contract-template-engine.ts — takes a template string with {{variable}} placeholders
and a values map, and returns the filled document text. Used when generating contracts from
any of the 5 seeded templates (NDA, Service Agreement, SOW, Retainer, Custom).

### Added onboarding system (TooltipTour, WelcomeModal, HelpModal, Checklist)
Four onboarding components in src/components/onboarding/:
- TooltipTour: react-joyride wrapper that runs step-by-step tours on each Lab page.
  Steps target elements by ID. Beacon fixed to white for visibility on dark backgrounds.
  Manual scrollIntoView implemented to avoid nested scroll container conflicts.
- WelcomeModal: shown on first login, introduces the Lab interface.
- HelpModal: accessible from the sidebar help button at any time.
- OnboardingChecklist: tracks which key actions the user has completed.
- pageTours.ts: defines the step arrays for each page's tour.
- tourState.ts: localStorage-backed state for tracking completed tours.

### Fixed onboarding beacon visibility and scroll stability
The beacon (pulsing circle on the target element) was invisible because its default color
was black against the black Lab background. Changed to white (#FFFFFF) with a translucent
glow ring. Scroll stability was fixed by disabling react-joyride's built-in scroll and
implementing manual scrollIntoView calls in the callback instead.

### Isolated marketing Navbar and Footer from /lab and /portal routes
Both layout/Navbar.tsx and layout/Footer.tsx now use usePathname() and return null when
the pathname starts with /lab or /portal. This prevents the global marketing nav from
rendering inside the app surfaces, which have their own LabHeader and LabFooter.

### Added 10 new UI components
src/components/ui/ additions:
- LabButton: variants (default, ghost, glass, danger) with consistent sizing.
- LabCard: card wrapper with optional hover effects.
- LabBadge: status pills with semantic color mapping.
- PageHeader: page title + optional icon + optional action button slot.
- SearchInput: search field with clear button and debounce-ready interface.
- FilterTabs: horizontal tab strip with optional badge counts.
- EmptyState: icon + title + description + optional CTA for empty list states.
- Dropdown: accessible dropdown menu with keyboard support.
- ViewToggle: list/grid/kanban view switcher.
- (Plus existing: Button, Card, Badge, Container, WavesBackground)

### Added Lab layout system
src/components/layout/lab/:
- LabSidebar: collapsible left navigation with icon labels and active route highlight.
- LabHeader: sticky top bar with page title, search, notification bell, user avatar.
- LabFooter: minimal footer with version and status.
- ThemeProvider: reads user_preferences.theme from DB and applies it to the layout.
- CommandPalette: Cmd+K triggered global search and navigation palette.
- NotificationBell: badge indicator with dropdown list of recent notifications.

### Added 7 Supabase migrations including RLS hardening migration
All migrations live in supabase/migrations/:
1. 20240401000000_fix_rls.sql — fixed project_expenses RLS.
2. 20240401010000_enhance_tasks_org.sql — added task org fields.
3. 20240401020000_fix_tasks_rls.sql — task-specific policy fixes.
4. 20240401030000_task_attachments.sql — added task_attachments table.
5. 20240401040000_user_preferences.sql — user_preferences with auto-create trigger.
6. 20240401050000_contracts_overhaul.sql — contracts table columns, templates table
   with 5 seeded templates, storage bucket, and initial RLS policies.
7. 20240408000000_tighten_rls.sql — hardened contracts public SELECT to authenticated
   only, hardened contracts storage bucket from public to authenticated-only access,
   and added explicit user-scoped RLS policies on the team_invites table.

### Added AGENTS.md development guidelines
Root-level AGENTS.md defines rules for any AI agent or developer working in this repo:
build commands, tech stack, route structure, auth patterns, file organization, code style,
server action patterns, Tailwind design tokens, database client usage, migration workflow,
UI component inventory, and important gotchas.

### Added docs/CHANGELOGS.md session documentation
This file. Captures session decisions, architectural patterns, security audit results,
and pending work so future contributors have full context without needing to read all code.

### Added src/types/lab.ts (378 lines)
Single file of TypeScript interfaces and types for all Lab domain objects:
Client, Project, Task, Invoice, InvoiceItem, Contract, ContractTemplate, Meeting,
MeetingAttendee, Team, TeamMember, Notification, UserPreferences, Theme, Activity,
Milestone, ProjectExpense, TimeLog, TaskComment, TaskAttachment, TaskFilter, and more.
Imported everywhere in Lab server actions and components.

### New dependencies added
Package                Purpose
@supabase/ssr          Supabase server-side rendering client (cookie-based sessions)
@supabase/supabase-js  Direct Supabase JS client (used for admin/service role calls)
resend                 Transactional email delivery
recharts               SVG charts for dashboard (RevenueChart, TaskCompletionChart, etc.)
react-joyride          Step-by-step onboarding tour library
@react-pdf/renderer    In-browser PDF generation for contracts and invoices
@dnd-kit/core          Drag-and-drop primitives (Kanban board)
@dnd-kit/sortable      Sortable list abstraction over dnd-kit/core
@dnd-kit/utilities     CSS transform helpers for dnd-kit
date-fns               Date formatting (format, parseISO, isAfter, differenceInDays, etc.)

---

GitHub is now fully in sync with local. No uncommitted changes remain as of this push.




---

## 10. Build Error Fixes (April 8, 2026)

Fixed deployment blockers related to strict TypeScript type checking and unescaped quote strings that caused the Vercel branch to fail building and stay stale:

1. **Unescaped Quotes:** Found out React JSX dislikes raw single and double quotes (`"` and `'`). Replaced all them with `&quot;` and `&apos;` in `docs/page.tsx`, `team-signup/page.tsx` and `verify/page.tsx`.
2. **Explicit Any:** Enforced types by replacing `any` casts with `Error`/`boolean` fallbacks or using `#eslint-disable` directive locally when package utility types weren't available in standard exports.
3. **Unused Catch Variables:** Removed unused `error` and `err` assignment variables from the `catch` blocks in Actions and generic logic that strictly didn't consume it.
