# Client Portal V2 - Complete Development Documentation

> **Project:** echo11 Client Portal V2  
> **Date:** April 21, 2026  
> **Status:** Plan Ready  
> **Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Team Structure & Roles](#team-structure--roles)
3. [Route Architecture](#route-architecture)
4. [Phase-by-Phase Task Breakdown](#phase-by-phase-task-breakdown)
5. [Task Matrix with Assignments](#task-matrix-with-assignments)
6. [Database & RLS Requirements](#database--rls-requirements)
7. [API & Server Actions](#api--server-actions)
8. [Component Hierarchy](#component-hierarchy)
9. [Data Sync Strategy](#data-sync-strategy)
10. [Migration from Old Portal](#migration-from-old-portal)
11. [Success Criteria](#success-criteria)

---

## Overview

### Purpose

Build a modern, client-facing portal that allows clients to:
- View their projects, milestones, and tasks
- Access invoices and contracts
- See upcoming meetings
- Communicate with the agency team
- Manage their profile and notification preferences

### Why Rebuild Instead of Fix?

| Aspect | Old `/portal` | New `/client` |
|--------|---------------|---------------|
| Architecture | Basic server components | Full sync with lab |
| Meetings | ❌ Missing | ✅ Complete |
| Real-time | ❌ Basic | ✅ Supabase realtime |
| UI/UX | Generic | Premium (matching lab) |
| Scalability | Limited | Full RLS-based |

---

## Team Structure & Roles

| Name | Role | Responsibility |
|------|------|----------------|
| **Devendra Shah** | Full Stack Developer | Backend logic, server actions, database, data fetching, complex integrations |
| **Jay Pandey** | Project Leader + Full Stack | Architecture planning, code review, complex backend, integration design |
| **Anil Rana** | Junior Frontend Developer | UI components, pages, styling (with mentorship from Jay/Devendra) |

### Team Members (for task assignment reference)

| Key | Name | Role |
|-----|------|------|
| **D** | Devendra Shah | Full Stack Developer |
| **J** | Jay Pandey | Project Leader + Full Stack |
| **A** | Anil Rana | Junior Frontend Developer |

---

## Route Architecture

```
/client                           → Dashboard (redirect from /client)
/client/(auth)/login              → Client login
/client/(auth)/verify             → Invitation verification
/client/(auth)/callback           → OAuth callback
/client/(protected)/              → Main dashboard
/client/(protected)/projects      → Projects list
/client/(protected)/projects/[id] → Project detail
/client/(protected)/invoices      → Invoices list
/client/(protected)/invoices/[id] → Invoice detail + PDF
/client/(protected)/contracts    → Contracts list
/client/(protected)/contracts/[id]→ Contract detail
/client/(protected)/meetings     → Meetings list
/client/(protected)/messages    → Chat with team
/client/(protected)/settings    → Profile & preferences
```

---

## Phase-by-Phase Task Breakdown

### Phase 1: Foundation & Setup

**Duration:** 3 days  
**Lead:** Jay Pandey (J)  
**Support:** Anil Rana (A)

| # | Task | Sub-tasks | Assignee |
|---|------|-----------|----------|
| 1.1 | Create route structure | - Create `/client` directory<br>- Create auth routes `(auth)/`<br>- Create protected routes `(protected)/`<br>- Create layout files | J |
| 1.2 | Client layout component | - Header with logo, nav, user menu<br>- Sidebar navigation<br>- Footer (minimal)<br>- Responsive design | A |
| 1.3 | Auth flow setup | - Login page UI<br>- Magic link flow<br>- Session handling<br>- Logout functionality | J |
| 1.4 | RLS policies | - Create policies for client data access<br>- Filter by `client_id` or `auth_id`<br>- Test policies | J |
| 1.5 | Client UI components | - ClientCard<br>- ClientButton<br>- ClientBadge<br>- ClientInput | A |

---

### Phase 2: Dashboard

**Duration:** 3 days  
**Lead:** Devendra Shah (D)  
**Support:** Anil Rana (A)

| # | Task | Sub-tasks | Assignee |
|---|------|-----------|----------|
| 2.1 | Dashboard page setup | - Server component for data fetching<br>- Client stats queries<br>- Loading states | D |
| 2.2 | Stats cards | - Active projects count<br>- Tasks completed<br>- Pending invoices<br>- Upcoming meetings | A |
| 2.3 | Project summary cards | - Show client's projects<br>- Progress bars<br>- Status badges | A |
| 2.4 | Activity feed | - Fetch client-specific activities<br>- Display action, user, time<br>- Filter by entity | D |
| 2.5 | Quick actions | - Link to: View Projects<br>- Link to: Latest Invoice<br>- Contact team | A |

---

### Phase 3: Projects Module

**Duration:** 4 days  
**Lead:** Devendra Shah (D)  
**Support:** Anil Rana (A)

| # | Task | Sub-tasks | Assignee |
|---|------|-----------|----------|
| 3.1 | Projects list page | - Grid view of project cards<br>- Filter by status (active/completed)<br>- Sort by date/progress | A |
| 3.2 | Project detail page | - Overview section<br>- Progress visualization<br>- Team members display | D |
| 3.3 | Milestones section | - List milestones with completion %<br>- Visual progress bar<br>- Due dates | D |
| 3.4 | Tasks section | - List all project tasks<br>- Status indicators<br>- Priority badges | A |
| 3.5 | Budget tracking | - Total budget display<br>- Spent amount<br>- Visual progress | A |
| 3.6 | External links | - Project URL display<br>- Click to open | A |

---

### Phase 4: Invoices Module

**Duration:** 3 days  
**Lead:** Anil Rana (A)  
**Support:** Devendra Shah (D)

| # | Task | Sub-tasks | Assignee |
|---|------|-----------|----------|
| 4.1 | Invoices list page | - Table with invoice number, amount, status, due date<br>- Filter: All/Paid/Pending/Overdue | A |
| 4.2 | Invoice detail page | - Full invoice breakdown<br>- Line items display<br>- Tax calculation | A |
| 4.3 | PDF download | - Use existing `@react-pdf/renderer`<br>- Download button<br>- Open in new tab | D |
| 4.4 | Payment status | - Visual status badges<br>- Due date warnings<br>- Payment link button | A |

---

### Phase 5: Contracts Module

**Duration:** 2 days  
**Lead:** Anil Rana (A)  
**Support:** Devendra Shah (D)

| # | Task | Sub-tasks | Assignee |
|---|------|-----------|----------|
| 5.1 | Contracts list page | - Card layout with status<br>- Contract value<br>- Start/end dates | A |
| 5.2 | Contract detail page | - Full contract terms<br>- Document preview<br>- Signature status | A |
| 5.3 | Contract timeline | - Sent → Viewed → Signed<br>- Timestamps for each step | D |
| 5.4 | PDF download | - Download signed contract<br>- Download generated PDF | D |

---

### Phase 6: Meetings Module (NEW)

**Duration:** 3 days  
**Lead:** Devendra Shah (D)  
**Support:** Anil Rana (A)

| # | Task | Sub-tasks | Assignee |
|---|------|-----------|----------|
| 6.1 | Meetings list page | - Upcoming meetings (next 30 days)<br>- Past meetings<br>- Filter by date | D |
| 6.2 | Meeting detail | - Title, description<br>- Date/time with timezone<br>- Duration | A |
| 6.3 | Video link | - Display Zoom/Meet link<br>- One-click join button | D |
| 6.4 | Calendar export | - Add to Google Calendar<br>- Add to Outlook (.ics) | D |
| 6.5 | Meeting notes | - Display agenda<br>- Post-meeting notes | A |

---

### Phase 7: Messages Module

**Duration:** 3 days  
**Lead:** Jay Pandey (J)  
**Support:** Devendra Shah (D)

| # | Task | Sub-tasks | Assignee |
|---|------|-----------|----------|
| 7.1 | Chat UI | - Message list<br>- Input field<br>- Send button | A |
| 7.2 | Real-time messaging | - Supabase realtime subscription<br>- New message indicators | J |
| 7.3 | Unread counts | - Badge in header<br>- Mark as read | J |
| 7.4 | File sharing | - Upload files to chat<br>- Display attachments | D |

---

### Phase 8: Settings Module

**Duration:** 2 days  
**Lead:** Anil Rana (A)  
**Support:** Devendra Shah (D)

| # | Task | Sub-tasks | Assignee |
|---|------|-----------|----------|
| 8.1 | Profile settings | - Edit name, phone, address<br>- Company info (read-only) | A |
| 8.2 | Password change | - Supabase auth update<br>- Confirmation flow | A |
| 8.3 | Notification preferences | - Email notifications toggle<br>- Task reminders toggle | A |
| 8.4 | Theme preference | - Dark/Light/System | D |

---

### Phase 9: Cleanup & Testing

**Duration:** 3 days  
**Lead:** Jay Pandey (J)  
**Support:** Team

| # | Task | Sub-tasks | Assignee |
|---|------|-----------|----------|
| 9.1 | Remove old portal | - Delete `/portal` directory<br>- Or redirect via middleware | J |
| 9.2 | End-to-end testing | - Login flow<br>- All pages load<br>- Data syncs correctly | Team |
| 9.3 | Performance check | - Server component rendering<br>- Image optimization | D |
| 9.4 | Mobile responsiveness | - Test on mobile<br>- Fix responsive issues | A |
| 9.5 | Production deploy | - Deploy to Vercel<br>- Verify environment variables | J |

---

## Task Matrix with Assignments

### Legend
- **D** = Devendra Shah (Full Stack Developer)
- **J** = Jay Pandey (Project Leader + Full Stack)
- **A** = Anil Rana (Junior Frontend)

| Phase | Task | Sub-task | Assignee | Estimated Hours |
|-------|------|----------|----------|-----------------|
| **1** | 1.1 - Route structure | Create directories | J | 2h |
| **1** | 1.1 - Route structure | Layout files | J | 1h |
| **1** | 1.2 - Client layout | Header & nav | A | 4h |
| **1** | 1.2 - Client layout | Sidebar | A | 3h |
| **1** | 1.2 - Client layout | Responsive design | A | 2h |
| **1** | 1.3 - Auth flow | Login page | J | 3h |
| **1** | 1.3 - Auth flow | Magic link | J | 2h |
| **1** | 1.3 - Auth flow | Session handling | J | 2h |
| **1** | 1.4 - RLS policies | Client data policies | J | 3h |
| **1** | 1.4 - RLS policies | Test policies | J | 1h |
| **1** | 1.5 - UI components | Button, Badge, Input | A | 3h |
| **2** | 2.1 - Dashboard setup | Server component | D | 3h |
| **2** | 2.2 - Stats cards | Create 4 stat cards | A | 4h |
| **2** | 2.3 - Project summary | Project cards | A | 3h |
| **2** | 2.4 - Activity feed | Fetch & display | D | 3h |
| **2** | 2.5 - Quick actions | Navigation links | A | 1h |
| **3** | 3.1 - Projects list | Grid + filters | A | 4h |
| **3** | 3.2 - Project detail | Overview section | D | 3h |
| **3** | 3.3 - Milestones | List + progress | D | 3h |
| **3** | 3.4 - Tasks section | Task list | A | 2h |
| **3** | 3.5 - Budget tracking | Budget display | A | 2h |
| **3** | 3.6 - External links | Project URL | A | 1h |
| **4** | 4.1 - Invoices list | Table + filters | A | 3h |
| **4** | 4.2 - Invoice detail | Line items | A | 3h |
| **4** | 4.3 - PDF download | react-pdf integration | D | 3h |
| **4** | 4.4 - Payment status | Status badges | A | 2h |
| **5** | 5.1 - Contracts list | Card layout | A | 2h |
| **5** | 5.2 - Contract detail | Terms display | A | 2h |
| **5** | 5.3 - Contract timeline | Timeline view | D | 2h |
| **5** | 5.4 - PDF download | Download button | D | 1h |
| **6** | 6.1 - Meetings list | List view | D | 3h |
| **6** | 6.2 - Meeting detail | Date/time display | A | 2h |
| **6** | 6.3 - Video link | Join button | D | 1h |
| **6** | 6.4 - Calendar export | .ics generation | D | 3h |
| **6** | 6.5 - Meeting notes | Notes display | A | 1h |
| **7** | 7.1 - Chat UI | Message list | A | 3h |
| **7** | 7.2 - Real-time | Supabase subscription | J | 4h |
| **7** | 7.3 - Unread counts | Badge + state | J | 2h |
| **7** | 7.4 - File sharing | Upload + display | D | 4h |
| **8** | 8.1 - Profile settings | Edit form | A | 2h |
| **8** | 8.2 - Password change | Auth update | A | 2h |
| **8** | 8.3 - Notifications | Toggle switches | A | 2h |
| **8** | 8.4 - Theme preference | Theme selector | D | 1h |
| **9** | 9.1 - Remove old portal | Delete/redirect | J | 1h |
| **9** | 9.2 - E2E testing | Test all flows | Team | 6h |
| **9** | 9.3 - Performance | Optimization | D | 3h |
| **9** | 9.4 - Mobile check | Responsive fixes | A | 3h |
| **9** | 9.5 - Production deploy | Vercel deploy | J | 2h |

**Total Estimated Hours:** ~110 hours

---

## Database & RLS Requirements

### Required RLS Policies

```sql
-- Clients: Client can read their own record
CREATE POLICY "Clients read own record" ON clients
  FOR SELECT USING (auth.uid() = auth_id);

-- Projects: Client can read their projects
CREATE POLICY "Clients read own projects" ON projects
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_id = auth.uid())
  );

-- Tasks: Client can read tasks for their projects
CREATE POLICY "Clients read project tasks" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id IN (
        SELECT id FROM clients WHERE auth_id = auth.uid()
      )
    )
  );

-- Milestones: Client can read milestones for their projects
CREATE POLICY "Clients read project milestones" ON milestones
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id IN (
        SELECT id FROM clients WHERE auth_id = auth.uid()
      )
    )
  );

-- Invoices: Client can read their invoices
CREATE POLICY "Clients read own invoices" ON invoices
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_id = auth.uid())
  );

-- Contracts: Client can read their contracts
CREATE POLICY "Clients read own contracts" ON contracts
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE auth_id = auth.uid())
  );

-- Meetings: Client can read meetings for their projects
CREATE POLICY "Clients read project meetings" ON meetings
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id IN (
        SELECT id FROM clients WHERE auth_id = auth.uid()
      )
    )
  );

-- Client Messages: Client can read/write their messages
CREATE POLICY "Clients read own messages" ON client_messages
  FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE auth_id = auth.uid()));

CREATE POLICY "Clients insert own messages" ON client_messages
  FOR INSERT WITH CHECK (client_id IN (SELECT id FROM clients WHERE auth_id = auth.uid()));
```

---

## API & Server Actions

### New Server Actions Needed

```typescript
// lib/actions/client-dashboard.ts
export async function getClientDashboardData(userId: string) {
  // Fetch all client data for dashboard
}

export async function getClientStats(userId: string) {
  // Fetch: active projects, completed tasks, pending invoices
}

// lib/actions/client-project.ts
export async function getClientProjects(clientId: string) {
  // Fetch projects filtered by client
}

export async function getClientProjectDetail(projectId: string, clientId: string) {
  // Fetch project with milestones, tasks, team
}

// lib/actions/client-invoice.ts
export async function getClientInvoices(clientId: string) {
  // Fetch invoices filtered by client
}

// lib/actions/client-contract.ts
export async function getClientContracts(clientId: string) {
  // Fetch contracts filtered by client
}

// lib/actions/client-meeting.ts
export async function getClientMeetings(clientId: string) {
  // Fetch upcoming meetings for client's projects
}

// lib/actions/client-message.ts
export async function sendClientMessage(clientId: string, content: string) {
  // Insert message to client_messages table
}

export async function getClientMessages(clientId: string) {
  // Fetch chat history
}

// lib/actions/client-settings.ts
export async function updateClientProfile(userId: string, data: ProfileData) {
  // Update profile + client record
}
```

---

## Component Hierarchy

```
src/
├── app/
│   └── client/
│       ├── layout.tsx                    # Auth check + layout
│       ├── (auth)/
│       │   ├── login/
│       │   │   └── page.tsx
│       │   ├── verify/
│       │   │   └── page.tsx
│       │   └── callback/
│       │       └── route.ts
│       └── (protected)/
│           ├── page.tsx                  # Dashboard
│           ├── projects/
│           │   ├── page.tsx              # List
│           │   └── [id]/
│           │       └── page.tsx          # Detail
│           ├── invoices/
│           │   ├── page.tsx              # List
│           │   └── [id]/
│           │       └── page.tsx          # Detail + PDF
│           ├── contracts/
│           │   ├── page.tsx              # List
│           │   └── [id]/
│           │       └── page.tsx          # Detail
│           ├── meetings/
│           │   └── page.tsx              # List
│           ├── messages/
│           │   └── page.tsx              # Chat
│           └── settings/
│               └── page.tsx              # Profile
├── components/
│   └── client/
│       ├── layout/
│       │   ├── ClientHeader.tsx
│       │   ├── ClientSidebar.tsx
│       │   └── ClientNav.tsx
│       ├── dashboard/
│       │   ├── ClientStatsCard.tsx
│       │   ├── ClientProjectCard.tsx
│       │   └── ClientActivityFeed.tsx
│       ├── projects/
│       │   ├── ClientProjectList.tsx
│       │   ├── ClientMilestoneList.tsx
│       │   └── ClientTaskList.tsx
│       ├── invoices/
│       │   ├── ClientInvoiceTable.tsx
│       │   └── ClientInvoiceDetail.tsx
│       ├── contracts/
│       │   ├── ClientContractCard.tsx
│       │   └── ClientContractTimeline.tsx
│       ├── meetings/
│       │   ├── ClientMeetingList.tsx
│       │   └── ClientMeetingDetail.tsx
│       ├── messages/
│       │   ├── ClientChat.tsx
│       │   └── ClientMessageInput.tsx
│       ├── settings/
│       │   ├── ClientProfileForm.tsx
│       │   └── ClientNotificationSettings.tsx
│       └── ui/
│           ├── ClientButton.tsx
│           ├── ClientBadge.tsx
│           ├── ClientCard.tsx
│           └── ClientInput.tsx
└── lib/
    └── actions/
        ├── client-dashboard.ts
        ├── client-project.ts
        ├── client-invoice.ts
        ├── client-contract.ts
        ├── client-meeting.ts
        ├── client-message.ts
        └── client-settings.ts
```

---

## Data Sync Strategy

| Lab Action | Client Sees | Sync Method |
|------------|------------|-------------|
| New project created | Appears on dashboard | RLS + `revalidatePath` |
| Task status changed | Updates in project view | Server refresh |
| Milestone completed | Progress bar updates | Server refresh |
| Invoice created | Shows in invoices | RLS policies |
| Invoice paid | Status changes to "paid" | Server refresh |
| Meeting scheduled | Shows in meetings | RLS policies |
| New message sent | Real-time via subscription | Supabase realtime |

---

## Migration from Old Portal

### Step 1: Create new `/client` routes (Phase 1-8)
- Build all new pages with improved UX

### Step 2: Update client invitation flow
- Keep existing `sendClientInvitation` action
- Update email link to point to `/client/auth/verify`

### Step 3: Test with existing clients
- Use existing client accounts
- Verify RLS policies work

### Step 4: Remove old portal
```bash
# Option 1: Delete directory
rm -rf src/app/portal

# Option 2: Redirect via middleware
# Add redirects in next.config.js or middleware.ts
```

---

## Success Criteria

### Must Have (MVP)
- [ ] Client can log in with magic link or password
- [ ] Dashboard shows correct stats for client's projects
- [ ] Client can view all their projects with details
- [ ] Client can view invoices and download PDF
- [ ] Client can view contracts
- [ ] Client can see upcoming meetings
- [ ] Client can message the agency team
- [ ] Client can update their profile

### Should Have
- [ ] Real-time message updates
- [ ] Mobile-responsive design
- [ ] Calendar export for meetings
- [ ] Unread message notifications

### Nice to Have
- [ ] Dark/light theme toggle
- [ ] File sharing in chat
- [ ] Video call integration

---

## Timeline Summary

| Phase | Duration | Lead |
|-------|----------|------|
| Phase 1: Foundation | 3 days | Jay (J) |
| Phase 2: Dashboard | 3 days | Devendra (D) |
| Phase 3: Projects | 4 days | Devendra (D) |
| Phase 4: Invoices | 3 days | Anil (A) |
| Phase 5: Contracts | 2 days | Anil (A) |
| Phase 6: Meetings | 3 days | Devendra (D) |
| Phase 7: Messages | 3 days | Jay (J) |
| Phase 8: Settings | 2 days | Anil (A) |
| Phase 9: Cleanup | 3 days | Jay (J) |

**Total Duration:** ~23 working days (approximately 5 weeks)

---

> **Ready for Implementation**  
> **Next Step:** Begin Phase 1 - Foundation & Setup  
> **Documentation Version:** 1.0

---

## Client + Lab Shared Source of Truth (System Design)

### Answer First: Is `/client` and `/lab` using the same data source?

**Yes.** Both surfaces are reading and writing against the same Supabase Postgres schema (`public`) as the source of truth.

Examples from current code:
- Client dashboard reads `projects`, `tasks`, `invoices`, `clients` via `client_id` / `auth_id`.
- Lab server actions mutate the same entities (`projects`, `tasks`, `contracts`, `invoices`, `clients`, etc.).

This is good for consistency, but only if ownership and RLS boundaries are strict.

---

## Edit Ownership Matrix (Who Can Edit What)

| Domain Section | Tables | Lab (Agency) | Client | Notes |
|---|---|---|---|---|
| Client Master Profile | `clients`, `client_contacts`, `client_statuses` | Full CRUD | Limited self-service fields only | Keep `company_name`, `email`, `status`, `tags`, `auth_id` as Lab-owned |
| Delivery Plan | `projects`, `milestones`, `tasks`, `project_expenses` | Full CRUD | Read-only | Client should not change scope/progress directly |
| Financials | `invoices`, `invoice_items`, `services` | Full CRUD | Read-only | Client can view/download only |
| Legal | `contracts`, `contract_templates` | Full CRUD | Read-only | Client can view signed/pending contracts |
| Meetings | `meetings`, `meeting_attendees` | Full CRUD | Read-only (or RSVP only if added) | Keep scheduling authority in Lab |
| Messages | `client_messages` | Insert as `team`, read own threads | Insert as `client`, read own threads | Shared domain with strict row ownership checks |
| Notifications | `notifications` | Create system/team notifications | Mark own as read | User can only update own `read` state |
| Activity Feed | `activities` | System/Lab inserts | Read filtered by client scope | Treat as append-only audit/event log |
| Auth + Identity | `profiles`, `clients.auth_id` | Invite/link/unlink | Self password/login | Role changes remain Lab/admin-controlled |

---

## Current Gaps To Fix Before “Perfect Sync”

1. Broad RLS policies exist on core tables (`SELECT USING (true)` / generic authenticated).
2. `client_messages` policy currently allows broad reads and weak insert checks.
3. Client settings form currently writes directly from browser to `clients` table.
4. Some mutation logic still mixes old `/portal` and new `/client` revalidation paths.

Reference points:
- Direct client-side `clients` update in settings form.
- Client message write/read actions.
- Broad message RLS policy.
- Broad authenticated policies in earlier task/project/profile migrations.

---

## Target Industry-Grade Architecture

### 1) Single Database, Clear Command Ownership

- Keep one source of truth (Supabase Postgres).
- Define command ownership per domain:
  - **Lab-owned commands:** delivery, finance, legal, lifecycle status.
  - **Client-owned commands:** own contact preferences + client message send + notification read.
- Everything else from Client side is query/read-only.

### 2) Mutation Gateway Pattern (No direct browser table writes for sensitive entities)

- Route all writes through server actions (or RPC/Edge functions for high-risk paths).
- Validate:
  - authenticated user
  - role (`admin/member/client`)
  - row ownership (`clients.auth_id = auth.uid()` for client scope)
  - allowed field whitelist per actor/surface

### 3) Hardened RLS by Relationship, Not by “Authenticated”

- Replace broad policies with ownership checks:
  - Client rows only for linked `clients.auth_id`.
  - Team rows only for assigned team/client scope.
  - Admin gets explicit override policy.
- Make `activities` append-only for system/service paths.

### 4) Event + Sync Workflow (Outbox style)

Create `domain_events` (or `sync_events`) table:
- `id`, `event_type`, `entity_type`, `entity_id`, `client_id`, `actor_id`, `source_surface` (`lab`/`client`), `payload`, `created_at`, `processed_at`.

On every mutation:
1. Write business row in transaction.
2. Append event row.
3. Background worker/fn consumes event and:
   - writes notification(s)
   - writes activity feed entry
   - emits realtime updates (if needed)
   - triggers cache invalidation tags

This gives deterministic, debuggable sync between surfaces.

### 5) Read Model Strategy

- Keep normalized write tables.
- Add query-optimized views for client surface:
  - `client_dashboard_view` (stats + counts)
  - `client_project_summary_view`
  - `client_invoice_summary_view`
- Use these for fast, consistent dashboard rendering.

### 6) Concurrency + Audit

- Add optimistic concurrency on mutable entities (`updated_at` check).
- Track `updated_by`, `source_surface`.
- Keep immutable event/activity history for auditability.

---

## Canonical Cross-Surface Workflows

### A) Lab updates project/task/milestone
1. Lab action validates role/team ownership.
2. Writes domain table(s).
3. Recomputes derived fields (progress, budget, etc.).
4. Appends `domain_events`.
5. Worker writes notifications + activity.
6. `/client` dashboard/project pages refresh via tags/realtime.

### B) Client sends message
1. Client action validates linked `clients.auth_id`.
2. Inserts `client_messages` with `sender_type='client'`.
3. Appends `domain_events`.
4. Worker notifies assigned Lab users/team channel.
5. Lab inbox updates in realtime.

### C) Client updates own contact preferences
1. Client action validates ownership.
2. Updates only whitelisted fields.
3. Appends event + activity entry.
4. Optional Lab notification (“Client updated profile”).

---

## Implementation Plan (Practical Sequence)

### Phase A: Access + Ownership Hardening (Highest priority)
- Replace broad RLS policies on:
  - `projects`, `tasks`, `profiles`, `client_messages`, `project_expenses`, related collaboration tables.
- Add ownership-safe policies for client-linked reads.
- Add explicit admin/team policies.

### Phase B: Mutation Surface Cleanup
- Move client profile update to server action (remove direct browser table mutation).
- Standardize all `/client` writes to server actions with field whitelists.
- Remove legacy `/portal` invalidation dependencies where `/client` is canonical.

### Phase C: Event/Outbox + Notification Pipeline
- Add `domain_events` table + processor.
- Normalize activity and notification generation through events.
- Add idempotency for retried processors.

### Phase D: Read Models + Realtime
- Add SQL views for dashboard-heavy reads.
- Enable targeted realtime channels for `notifications` + `client_messages`.
- Keep all other pages server-rendered with cache tag revalidation.

### Phase E: Observability + Governance
- Add audit dashboards/logging for failed events and RLS denials.
- Add transition guards for statuses (project/invoice/contract lifecycle).
- Add integration tests for role-based access and cross-surface sync.

---

## Recommended Final Rule

> **Lab is the system-of-record editor for delivery, financial, legal, and scheduling domains.  
> Client is the system-of-record editor only for self profile preferences and client-origin communication.  
> Both read from the same source-of-truth database under strict RLS and event-driven sync.**
