# Echo11 Lab — Development Changelog

> Last Updated: April 7, 2026
> Session Focus: Onboarding Tour Polish, Team + Client Invitation Flows, Security Audit

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
