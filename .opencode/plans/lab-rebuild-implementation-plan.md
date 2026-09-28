# Echo11 Lab Rebuild — Implementation Plan

> **Based on:** Lab Rebuild Design Plan (`.opencode/plans/lab-rebuild-design-plan.md`)
> **Current State:** 36 pages, module-first navigation, page-by-page CRUD
> **Target State:** Workflow-first command center, 8 sections, connected experience
> **Backend:** No changes — existing API v1, projections, outbox, audit log

---

## 1. Current State Summary

### What Exists Today

| Category | Count | Notes |
|---|---|---|
| Route pages | 36 | Mix of server (28) and client (8) components |
| Layout files | 6 | Root, auth, authenticated, client-detail, project-detail, docs |
| Lab components | 17 | KanbanBoard, forms, cards, filters |
| UI primitives | 18 | LabButton, LabCard, LabBadge, PageHeader, etc. |
| Dashboard widgets | 8 | StatCard, charts, quick actions |
| Layout components | 6 | LabSidebar, LabHeader, LabFooter, ThemeProvider, CommandPalette, NotificationBell |
| Server actions | 18 files | ~5,000+ lines total |
| Type definitions | 384 lines | 20+ entity interfaces, 12+ enums |
| API v1 layer | 10 files | Internal client, permissions, idempotency, projections |

### What Works Well (Keep/Reuse)
- **API v1 layer** — idempotency, permissions, event dispatching, projection reads
- **Server actions** — all CRUD operations, role helpers
- **Type definitions** — comprehensive entity types
- **UI primitives** — LabButton, LabCard, LabBadge, PageHeader, EmptyState, SearchInput
- **Dashboard widgets** — StatCard, RevenueChart, ProjectStatusChart
- **Real-time system** — Supabase subscriptions for notifications, unread counts
- **Onboarding system** — react-joyride tours, checklist
- **AppFeedbackProvider** — toast + confirmation dialog system
- **Theme system** — ThemeProvider with dark/light/system
- **CommandPalette** — existing shell (needs enhancement)
- **NotificationBell** — working with real-time subscription

### What Needs Rebuilding
- **Navigation structure** — module-first → workflow-first
- **App shell** — sidebar + header → topbar + sidebar + workspace
- **Dashboard** → Command Center (new concept)
- **Page patterns** — isolated CRUD → connected workspaces
- **Permission model** — scattered role checks → centralized PermissionGate
- **Data patterns** — raw table reads → view models
- **Missing patterns** — drawers, action queue, entity relationship graphs, saved views
- **Missing sections** — Inbox, Reports, System health

---

## 2. Route Mapping: Current → Target

### Navigation Restructure

| Current Route | Target Route | Section | Status |
|---|---|---|---|
| `/lab/dashboard` | `/lab/command-center` | Command Center | Rebuild |
| `/lab/projects` | `/lab/work/projects` | Work | Move + enhance |
| `/lab/projects/new` | `/lab/work/projects/new` | Work | Move |
| `/lab/projects/[id]` | `/lab/work/projects/[id]` | Work | Move + redesign |
| `/lab/projects/[id]/tasks` | `/lab/work/projects/[id]/tasks` | Work | Move |
| `/lab/projects/[id]/milestones` | `/lab/work/projects/[id]/milestones` | Work | Move |
| `/lab/projects/[id]/invoices` | `/lab/work/projects/[id]/invoices` | Work | Move |
| `/lab/projects/[id]/team` | `/lab/work/projects/[id]/team` | Work | Move |
| `/lab/projects/[id]/edit` | `/lab/work/projects/[id]/edit` | Work | Move |
| `/lab/tasks` | `/lab/work/tasks` | Work | Move + enhance |
| `/lab/tasks/[id]` | `/lab/work/tasks/[id]` | Work | Move + drawer pattern |
| `/lab/meetings` | `/lab/work/meetings` | Work | Move |
| `/lab/meetings/[id]` | `/lab/work/meetings/[id]` | Work | Move |
| `/lab/clients` | `/lab/clients` | Clients | Enhance (same route) |
| `/lab/clients/[id]` | `/lab/clients/[id]` | Clients | Enhance (same route) |
| `/lab/clients/[id]/projects` | `/lab/clients/[id]/projects` | Clients | Keep |
| `/lab/clients/[id]/invoices` | `/lab/clients/[id]/invoices` | Clients | Keep |
| `/lab/clients/[id]/contracts` | `/lab/clients/[id]/contracts` | Clients | Keep |
| `/lab/clients/[id]/documents` | `/lab/clients/[id]/documents` | Clients | Keep |
| `/lab/clients/[id]/notes` | `/lab/clients/[id]/notes` | Clients | Keep |
| `/lab/clients/[id]/messages` | `/lab/clients/[id]/messages` | Clients | Keep |
| `/lab/invoices` | `/lab/finance/invoices` | Finance | Move + enhance |
| `/lab/invoices/new` | `/lab/finance/invoices/new` | Finance | Move |
| `/lab/invoices/[id]` | `/lab/finance/invoices/[id]` | Finance | Move |
| `/lab/contracts` | `/lab/finance/contracts` | Finance | Move |
| `/lab/contracts/[id]` | `/lab/finance/contracts/[id]` | Finance | Move |
| `/lab/teams` | `/lab/people/teams` | People | Move |
| `/lab/teams/[id]` | `/lab/people/teams/[id]` | People | Move |
| `/lab/teams/[id]/moodboard` | `/lab/people/teams/[id]/moodboard` | People | Move |
| `/lab/settings` | `/lab/settings` | Settings | Keep (same route) |
| `/lab/docs` | `/lab/docs` | Docs | Keep (same route) |

### New Routes to Create

| Route | Section | Purpose |
|---|---|---|
| `/lab/command-center` | Command Center | New landing page |
| `/lab/work` | Work | Work overview (my work, team work, blocked) |
| `/lab/work/activity` | Work | Unified activity feed |
| `/lab/finance` | Finance | Finance overview (revenue, aging, risk) |
| `/lab/finance/expenses` | Finance | Expense tracking |
| `/lab/finance/revenue` | Finance | Revenue analytics |
| `/lab/people` | People | People overview (teams, members, workload) |
| `/lab/people/members` | People | Member directory |
| `/lab/people/workload` | People | Workload view |
| `/lab/people/invites` | People | Invite management |
| `/lab/inbox` | Inbox | Unified inbox |
| `/lab/inbox/messages` | Inbox | Messages |
| `/lab/inbox/notifications` | Inbox | Notifications |
| `/lab/inbox/approvals` | Inbox | Approvals (future) |
| `/lab/reports` | Reports | Reports landing |
| `/lab/reports/projects` | Reports | Project reports |
| `/lab/reports/clients` | Reports | Client reports |
| `/lab/reports/finance` | Reports | Finance reports |
| `/lab/reports/team` | Reports | Team reports |
| `/lab/system` | System | System landing (admin) |
| `/lab/system/health` | System | System health (admin) |
| `/lab/system/audit` | System | Audit log (admin) |
| `/lab/system/events` | System | Domain events (admin) |

### Redirect Map (backward compatibility)

| Old Route | Redirects To |
|---|---|
| `/lab/dashboard` | `/lab/command-center` (301) |
| `/lab/projects` | `/lab/work/projects` (301) |
| `/lab/tasks` | `/lab/work/tasks` (301) |
| `/lab/meetings` | `/lab/work/meetings` (301) |
| `/lab/invoices` | `/lab/finance/invoices` (301) |
| `/lab/contracts` | `/lab/finance/contracts` (301) |
| `/lab/teams` | `/lab/people/teams` (301) |

---

## 3. Component Inventory

### Reuse As-Is (no changes needed)

| Component | Location | Reason |
|---|---|---|
| `LabButton` | `src/components/ui/LabButton.tsx` | Solid, all variants covered |
| `LabCard` + sub-components | `src/components/ui/LabCard.tsx` | Solid container pattern |
| `LabBadge` | `src/components/ui/LabBadge.tsx` | All status variants covered |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | Clean pattern |
| `SearchInput` | `src/components/ui/SearchInput.tsx` | Reusable |
| `AppFeedbackProvider` | `src/components/ui/AppFeedbackProvider.tsx` | Toast + confirm system works |
| `cn()` utility | `src/lib/utils.ts` | Standard clsx + tailwind-merge |
| All server actions | `src/lib/actions/` | No changes needed |
| API v1 layer | `src/lib/api/v1/` | No changes needed |
| Type definitions | `src/types/lab.ts` | No changes needed |
| Supabase clients | `src/lib/supabase/` | No changes needed |

### Refactor (enhance, keep in place)

| Component | Location | Changes Needed |
|---|---|---|
| `CommandPalette` | `src/components/layout/lab/CommandPalette.tsx` | Add quick-create actions, meetings/contracts search, recent items |
| `NotificationBell` | `src/components/layout/lab/NotificationBell.tsx` | Keep as-is, inbox will be separate page |
| `StatCard` | `src/components/dashboard/StatCard.tsx` | Add health variant, risk indicator |
| `KanbanBoard` | `src/components/lab/KanbanBoard.tsx` | Move to features/work/tasks/, enhance with saved views |
| `QuickActions` | `src/components/dashboard/QuickActions.tsx` | Replace with QuickCreate component |
| `RevenueChart` | `src/components/dashboard/RevenueChart.tsx` | Move to features/finance/ |
| `ProjectStatusChart` | `src/components/dashboard/ProjectStatusChart.tsx` | Move to features/work/ |
| `ThemeProvider` | `src/components/layout/lab/ThemeProvider.tsx` | Keep as-is |

### Rebuild (new implementations)

| Component | Target Location | Purpose |
|---|---|---|
| `LabShell` | `src/components/lab/shell/LabShell.tsx` | New app shell wrapper |
| `LabTopbar` | `src/components/lab/shell/LabTopbar.tsx` | New top command bar |
| `LabSidebar` | `src/components/lab/shell/LabSidebar.tsx` | Rebuild with new navigation |
| `QuickCreate` | `src/components/lab/shell/QuickCreate.tsx` | Universal create button + menu |
| `PermissionGate` | `src/components/lab/patterns/PermissionGate.tsx` | Centralized permission wrapper |
| `PageHeader` | `src/components/lab/patterns/PageHeader.tsx` | Enhanced page header with breadcrumbs |
| `PageTabs` | `src/components/lab/patterns/PageTabs.tsx` | Context tabs with Framer Motion |
| `ContextPanel` | `src/components/lab/patterns/ContextPanel.tsx` | Right-side context panel |
| `ActionQueue` | `src/components/lab/patterns/ActionQueue.tsx` | Priority action queue |
| `ActivityFeed` | `src/components/lab/patterns/ActivityFeed.tsx` | Unified activity timeline |
| `HealthCard` | `src/components/lab/data-display/HealthCard.tsx` | Health status card |
| `StatusBadge` | `src/components/lab/data-display/StatusBadge.tsx` | Unified status badge |
| `EntityBadge` | `src/components/lab/data-display/EntityBadge.tsx` | Entity reference badge |
| `DataTable` | `src/components/lab/data-display/DataTable.tsx` | Sortable/filterable table |
| `ConfirmDialog` | `src/components/lab/feedback/ConfirmDialog.tsx` | Enhanced confirmation (or reuse AppFeedbackProvider) |
| `Toast` | `src/components/lab/feedback/Toast.tsx` | Toast system (or reuse AppFeedbackProvider) |
| `SkeletonCard` | `src/components/lab/feedback/SkeletonCard.tsx` | Loading placeholder |

### Domain Components (new)

| Component | Target Location | Purpose |
|---|---|---|
| `ProjectCard` | `src/features/work/projects/ProjectCard.tsx` | Project card with health badge |
| `ProjectHealthBadge` | `src/features/work/projects/ProjectHealthBadge.tsx` | Health indicator |
| `ProjectTimeline` | `src/features/work/projects/ProjectTimeline.tsx` | Timeline view |
| `TaskCard` | `src/features/work/tasks/TaskCard.tsx` | Task card for lists |
| `TaskDrawer` | `src/features/work/tasks/TaskDrawer.tsx` | Slide-in task detail drawer |
| `ClientCard` | `src/features/clients/ClientCard.tsx` | Client card with risk badge |
| `ClientRiskBadge` | `src/features/clients/ClientRiskBadge.tsx` | Risk indicator |
| `InvoiceStatusActions` | `src/features/finance/invoices/InvoiceStatusActions.tsx` | State-machine-aware actions |
| `ContractLifecycle` | `src/features/finance/contracts/ContractLifecycle.tsx` | Contract status workflow |
| `TeamWorkloadTable` | `src/features/people/TeamWorkloadTable.tsx` | Workload view table |
| `NotificationItem` | `src/features/inbox/NotificationItem.tsx` | Inbox notification item |
| `MessageThread` | `src/features/inbox/MessageThread.tsx` | Message thread view |
| `OutboxHealthPanel` | `src/features/system/OutboxHealthPanel.tsx` | System health panel |

---

## 4. New Library Modules

### `src/lib/frontend/` — Frontend utilities

| File | Purpose |
|---|---|
| `permissions.ts` | Centralized permission map type + resolver |
| `api-result.ts` | API result type helpers (isOk, isError, unwrap) |
| `idempotency.ts` | Idempotency key generator for mutations |
| `filters.ts` | Filter state management helpers |
| `status.ts` | Status config maps (colors, labels, icons) for all entities |
| `dates.ts` | Date formatting utilities (relative, range, business days) |
| `money.ts` | Currency formatting utilities |
| `view-models.ts` | View model type definitions |

### View Model Types (new)

```typescript
// src/lib/frontend/view-models.ts

type CommandCenterViewModel = {
  user: { name: string; role: string }
  actionQueue: ActionItem[]
  businessMetrics: BusinessMetrics
  projectHealth: ProjectHealthSummary[]
  clientRisk: ClientRiskSummary[]
  teamWorkload: TeamWorkloadSummary[]
  recentActivity: ActivityItem[]
  systemHealth: SystemHealthStatus
  permissions: LabPermissions
}

type ProjectDetailViewModel = {
  project: ProjectSummary
  client: ClientSummary
  team: TeamSummary
  stats: ProjectStats
  health: ProjectHealth
  tasks: TaskSummary[]
  financials: ProjectFinancialSummary
  activity: ActivityItem[]
  permissions: ProjectPermissions
}

type ClientDetailViewModel = {
  client: ClientSummary
  contacts: ClientContactSummary[]
  projects: ProjectSummary[]
  invoices: InvoiceSummary[]
  contracts: ContractSummary[]
  messages: MessageSummary[]
  documents: DocumentSummary[]
  notes: NoteSummary[]
  risk: ClientRiskScore
  portal: PortalStatus
  activity: ActivityItem[]
  permissions: ClientPermissions
}

type FinanceViewModel = {
  revenue: RevenueSummary
  invoices: InvoiceSummary[]
  aging: InvoiceAgingBucket[]
  expenses: ExpenseSummary[]
  clientBalances: ClientBalanceSummary[]
  permissions: FinancePermissions
}

type PeopleViewModel = {
  teams: TeamSummary[]
  members: MemberSummary[]
  invites: InviteSummary[]
  workload: WorkloadSummary[]
  permissions: TeamPermissions
}
```

---

## 5. Phase-by-Phase Implementation Plan

### Phase 1 — Foundation (Week 1-2)

**Goal:** New app shell, shared primitives, permission system, view models.

#### 1.1 New Folder Structure
```
src/
  app/lab/(workspace)/          # New route group
    layout.tsx                  # New workspace layout
    command-center/page.tsx     # New landing page
    work/
    clients/
    finance/
    people/
    inbox/
    reports/
    system/
    settings/

  features/
    command-center/
    work/
    clients/
    finance/
    people/
    inbox/
    reports/
    system/

  components/lab/
    shell/                      # LabShell, LabTopbar, LabSidebar
    primitives/                 # Reusable UI primitives
    patterns/                   # PermissionGate, PageHeader, PageTabs, ContextPanel
    feedback/                   # ConfirmDialog, Toast, SkeletonCard
    data-display/               # HealthCard, StatusBadge, EntityBadge, DataTable

  lib/frontend/
    permissions.ts
    api-result.ts
    idempotency.ts
    filters.ts
    status.ts
    dates.ts
    money.ts
    view-models.ts
```

#### 1.2 Files to Create

| File | Lines (est) | Priority |
|---|---|---|
| `src/lib/frontend/permissions.ts` | 120 | P0 |
| `src/lib/frontend/api-result.ts` | 60 | P0 |
| `src/lib/frontend/idempotency.ts` | 40 | P0 |
| `src/lib/frontend/status.ts` | 150 | P0 |
| `src/lib/frontend/dates.ts` | 80 | P1 |
| `src/lib/frontend/money.ts` | 40 | P1 |
| `src/lib/frontend/view-models.ts` | 200 | P0 |
| `src/lib/frontend/filters.ts` | 100 | P1 |
| `src/components/lab/shell/LabShell.tsx` | 80 | P0 |
| `src/components/lab/shell/LabTopbar.tsx` | 150 | P0 |
| `src/components/lab/shell/LabSidebar.tsx` | 200 | P0 |
| `src/components/lab/shell/QuickCreate.tsx` | 180 | P0 |
| `src/components/lab/patterns/PermissionGate.tsx` | 60 | P0 |
| `src/components/lab/patterns/PageHeader.tsx` | 100 | P0 |
| `src/components/lab/patterns/PageTabs.tsx` | 120 | P0 |
| `src/components/lab/patterns/ContextPanel.tsx` | 80 | P1 |
| `src/components/lab/patterns/ActionQueue.tsx` | 150 | P0 |
| `src/components/lab/patterns/ActivityFeed.tsx` | 120 | P0 |
| `src/components/lab/data-display/HealthCard.tsx` | 80 | P1 |
| `src/components/lab/data-display/StatusBadge.tsx` | 60 | P0 |
| `src/components/lab/data-display/EntityBadge.tsx` | 60 | P1 |
| `src/components/lab/data-display/DataTable.tsx` | 200 | P1 |
| `src/components/lab/feedback/SkeletonCard.tsx` | 40 | P1 |
| `src/app/lab/(workspace)/layout.tsx` | 100 | P0 |

#### 1.3 Key Decisions

**Permission System:**
```typescript
// src/lib/frontend/permissions.ts

type LabPermissions = {
  project: { create: boolean; update: boolean; delete: boolean; assignTeam: boolean; manageTags: boolean }
  task: { create: boolean; update: boolean; delete: boolean; markDone: boolean; assign: boolean }
  client: { create: boolean; update: boolean; delete: boolean; invitePortal: boolean; viewFinancials: boolean }
  finance: { view: boolean; createInvoice: boolean; sendInvoice: boolean; markPaid: boolean; deleteInvoice: boolean }
  team: { invite: boolean; removeMember: boolean; setLead: boolean }
  system: { viewHealth: boolean; viewAudit: boolean }
}

// Server-side resolver (in layout)
async function resolvePermissions(): Promise<LabPermissions> {
  const { role, isAdmin, isLead } = await getUserRoleAndTeam()
  return {
    project: {
      create: isAdmin || isLead,
      update: isAdmin || isLead,
      delete: isAdmin,
      assignTeam: isAdmin || isLead,
      manageTags: isAdmin || isLead,
    },
    // ... etc
  }
}

// Usage in components
<PermissionGate allowed={permissions.finance.sendInvoice}>
  <SendInvoiceButton />
</PermissionGate>
```

**App Shell Pattern:**
```typescript
// src/app/lab/(workspace)/layout.tsx

export default async function WorkspaceLayout({ children }) {
  const permissions = await resolvePermissions()
  const user = await getCurrentUser()

  return (
    <PermissionsContext.Provider value={permissions}>
      <LabShell>
        <LabTopbar user={user} />
        <LabSidebar permissions={permissions} />
        <main>{children}</main>
      </LabShell>
    </PermissionsContext.Provider>
  )
}
```

#### 1.4 Acceptance Criteria
- [ ] New `(workspace)` route group exists with layout
- [ ] LabShell renders with topbar, sidebar, main content area
- [ ] Sidebar has new navigation structure (Command, Work, Clients, Finance, People, Inbox, Reports, System)
- [ ] Topbar has org switcher, search, quick create, notifications, profile
- [ ] PermissionGate component works with centralized permissions
- [ ] All existing UI primitives are accessible from new shell
- [ ] Old routes still work (no breaking changes yet)

---

### Phase 2 — Command Center (Week 2-3)

**Goal:** New landing page that validates the new architecture.

#### 2.1 Files to Create

| File | Lines (est) | Priority |
|---|---|---|
| `src/app/lab/(workspace)/command-center/page.tsx` | 300 | P0 |
| `src/features/command-center/ActionQueueSection.tsx` | 150 | P0 |
| `src/features/command-center/BusinessMetricsSection.tsx` | 120 | P0 |
| `src/features/command-center/ProjectHealthBoard.tsx` | 180 | P0 |
| `src/features/command-center/ClientRiskPanel.tsx` | 150 | P0 |
| `src/features/command-center/TeamWorkloadSection.tsx` | 120 | P0 |
| `src/features/command-center/ActivityTimeline.tsx` | 100 | P0 |
| `src/features/command-center/SystemSyncStatus.tsx` | 100 | P1 |
| `src/lib/actions/command-center-actions.ts` | 200 | P0 |

#### 2.2 Data Requirements

```typescript
// command-center-actions.ts
async function getCommandCenterData(): Promise<CommandCenterViewModel> {
  // Read from projections:
  // - team_workload_projection
  // - activity_projection
  // - unread_counts_projection
  // - client_dashboard_projection (if exists, else fallback)
  // - outbox health endpoint
}
```

#### 2.3 Layout

```
Command Center
├── Today Header
│   ├── "Good morning, [name]"
│   ├── "[N] actions need attention today"
│   └── Date display
├── Action Queue (priority)
│   ├── Overdue tasks
│   ├── Overdue invoices
│   ├── Expired invites
│   ├── Unread messages
│   └── Contracts awaiting review
├── Business Metrics (4-5 stat cards)
│   ├── Active projects
│   ├── Open tasks
│   ├── Pending invoices
│   ├── Revenue this month
│   └── At-risk clients
├── Project Health Board
│   ├── Active projects with health indicators
│   └── Progress bars
├── Client Risk Panel
│   ├── Clients with risk signals
│   └── Risk reasons
├── Team Workload
│   ├── Capacity by member
│   └── Overdue by member
├── Recent Activity
│   └── Timeline from activity_projection
└── System Sync Status
    ├── Projection freshness
    └── Outbox status
```

#### 2.4 Acceptance Criteria
- [ ] Command Center page renders with all sections
- [ ] Data comes from projections (with fallbacks)
- [ ] Action queue shows real actionable items
- [ ] Client risk signals computed correctly
- [ ] System sync status visible (admin-only detail)
- [ ] Permission-aware (revenue only for admin/lead)
- [ ] Page loads in < 2 seconds

---

### Phase 3 — Work Section (Week 3-5)

**Goal:** Rebuild projects, tasks, meetings, activity under `/lab/work/`.

#### 3.1 Route Structure

```
src/app/lab/(workspace)/work/
  page.tsx                    # Work overview
  projects/
    page.tsx                  # Projects list
    new/page.tsx              # New project form
    [id]/
      page.tsx                # Project detail
      edit/page.tsx           # Edit project
      tasks/page.tsx          # Project tasks
      milestones/page.tsx     # Project milestones
      invoices/page.tsx       # Project invoices
      team/page.tsx           # Project team
  tasks/
    page.tsx                  # Tasks kanban
    [id]/page.tsx             # Task detail (drawer)
  meetings/
    page.tsx                  # Meetings list
    [id]/page.tsx             # Meeting detail
  activity/
    page.tsx                  # Activity feed
```

#### 3.2 Files to Create/Move

| File | Action | Lines (est) |
|---|---|---|
| `src/app/lab/(workspace)/work/page.tsx` | Create | 200 |
| `src/app/lab/(workspace)/work/projects/page.tsx` | Move + refactor | 150 |
| `src/app/lab/(workspace)/work/projects/new/page.tsx` | Move | 50 |
| `src/app/lab/(workspace)/work/projects/[id]/page.tsx` | Move + redesign | 300 |
| `src/app/lab/(workspace)/work/projects/[id]/edit/page.tsx` | Move | 120 |
| `src/app/lab/(workspace)/work/projects/[id]/tasks/page.tsx` | Move | 100 |
| `src/app/lab/(workspace)/work/projects/[id]/milestones/page.tsx` | Move | 60 |
| `src/app/lab/(workspace)/work/projects/[id]/invoices/page.tsx` | Move | 70 |
| `src/app/lab/(workspace)/work/projects/[id]/team/page.tsx` | Move | 100 |
| `src/app/lab/(workspace)/work/tasks/page.tsx` | Move + refactor | 280 |
| `src/app/lab/(workspace)/work/tasks/[id]/page.tsx` | Move + drawer | 100 |
| `src/app/lab/(workspace)/work/meetings/page.tsx` | Move | 50 |
| `src/app/lab/(workspace)/work/meetings/[id]/page.tsx` | Move | 370 |
| `src/app/lab/(workspace)/work/activity/page.tsx` | Create | 150 |
| `src/features/work/projects/ProjectCard.tsx` | Create | 120 |
| `src/features/work/projects/ProjectHealthBadge.tsx` | Create | 60 |
| `src/features/work/projects/ProjectTimeline.tsx` | Create | 150 |
| `src/features/work/tasks/TaskCard.tsx` | Create | 80 |
| `src/features/work/tasks/TaskDrawer.tsx` | Create | 250 |
| `src/features/work/WorkOverview.tsx` | Create | 180 |

#### 3.3 Project Detail Redesign

```
Project Detail (new layout)
├── Header
│   ├── Project name, initial avatar
│   ├── Client link
│   ├── Health badge (new)
│   ├── Status badge
│   ├── Progress bar
│   ├── Due date
│   └── Quick actions (Edit, Visit, Status change, Delete)
├── Tabs (sticky)
│   ├── Overview
│   ├── Tasks
│   ├── Timeline (new)
│   ├── Files (new)
│   ├── Finance (combines expenses + invoices)
│   ├── Contracts
│   ├── Meetings
│   ├── Activity
│   └── Settings
├── Main Content (tab-dependent)
└── Right Context Panel
    ├── Team members
    ├── Client info
    ├── Budget summary
    ├── Deadlines
    ├── Risk indicators
    └── Related records
```

#### 3.4 Task Drawer Pattern

Instead of navigating to `/lab/work/tasks/[id]`, clicking a task opens a right-side drawer:

```
TaskDrawer
├── Header: Title, status badge, priority badge, close button
├── Quick Edit: Status dropdown, priority dropdown, assignee dropdown, due date
├── Description: Editable text
├── Tabs: Comments, Time, Files
├── Activity: Who changed what
└── Footer: Delete button (if permitted)
```

Full page still exists for deep detail, but drawer is the default interaction.

#### 3.5 Acceptance Criteria
- [ ] Work overview shows my work, team work, blocked items
- [ ] Projects list with health badges, filtering, sorting
- [ ] Project detail with tabs and right context panel
- [ ] Tasks kanban with saved views
- [ ] Task drawer opens on click, full page for deep detail
- [ ] Meetings list with date grouping
- [ ] Activity feed from activity_projection
- [ ] Old routes redirect to new routes

---

### Phase 4 — Clients Section (Week 5-6)

**Goal:** Rebuild client directory and detail under `/lab/clients/`.

#### 4.1 Route Structure

```
src/app/lab/(workspace)/clients/
  page.tsx                    # Client directory
  [id]/
    page.tsx                  # Client detail
    projects/page.tsx         # Client projects (keep)
    invoices/page.tsx         # Client invoices (keep)
    contracts/page.tsx        # Client contracts (keep)
    documents/page.tsx        # Client documents (keep)
    notes/page.tsx            # Client notes (keep)
    messages/page.tsx         # Client messages (keep)
    portal/page.tsx           # NEW: Portal access management
    activity/page.tsx         # NEW: Client activity feed
```

#### 4.2 Files to Create/Move

| File | Action | Lines (est) |
|---|---|---|
| `src/app/lab/(workspace)/clients/page.tsx` | Move + refactor | 150 |
| `src/app/lab/(workspace)/clients/[id]/page.tsx` | Move + redesign | 250 |
| `src/app/lab/(workspace)/clients/[id]/portal/page.tsx` | Create | 120 |
| `src/app/lab/(workspace)/clients/[id]/activity/page.tsx` | Create | 100 |
| `src/features/clients/ClientCard.tsx` | Create (refactor existing) | 120 |
| `src/features/clients/ClientRiskBadge.tsx` | Create | 80 |
| `src/features/clients/ClientDirectory.tsx` | Create | 150 |
| `src/features/clients/ClientRiskCalculator.ts` | Create | 100 |

#### 4.3 Client Risk Score

```typescript
// Client risk calculation (server-side)
function calculateClientRisk(client, projects, invoices, messages, contracts): ClientRiskScore {
  const signals: RiskSignal[] = []

  // Overdue invoices
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')
  if (overdueInvoices.length > 0) signals.push({ type: 'overdue_invoices', count: overdueInvoices.length })

  // No recent activity
  const lastActivity = getLastActivity(client.id)
  if (daysSince(lastActivity) > 30) signals.push({ type: 'stale_activity', days: daysSince(lastActivity) })

  // Open blockers
  const blockedTasks = projects.flatMap(p => p.tasks).filter(t => t.priority === 'urgent' && t.status !== 'done')
  if (blockedTasks.length > 0) signals.push({ type: 'open_blockers', count: blockedTasks.length })

  // Contract expiring
  const expiringContracts = contracts.filter(c => c.status === 'signed' && daysUntil(c.end_date) < 30)
  if (expiringContracts.length > 0) signals.push({ type: 'contract_expiring', count: expiringContracts.length })

  // Unanswered messages
  const unansweredMessages = messages.filter(m => !m.replied)
  if (unansweredMessages.length > 0) signals.push({ type: 'unanswered_messages', count: unansweredMessages.length })

  // Inactive portal invite
  if (client.invitation_sent_at && !client.invitation_accepted_at && daysSince(client.invitation_sent_at) > 7) {
    signals.push({ type: 'inactive_invite', days: daysSince(client.invitation_sent_at) })
  }

  return { score: computeScore(signals), signals, level: scoreToLevel(computeScore(signals)) }
}
```

#### 4.4 Acceptance Criteria
- [ ] Client directory with risk badges, filtering, sorting
- [ ] Client detail with tabs and right context panel
- [ ] Client risk score computed and displayed
- [ ] Portal access management page
- [ ] Client activity feed
- [ ] Old client routes still work

---

### Phase 5 — Finance Section (Week 6-7)

**Goal:** Rebuild invoices and contracts under `/lab/finance/`.

#### 5.1 Route Structure

```
src/app/lab/(workspace)/finance/
  page.tsx                    # Finance overview
  invoices/
    page.tsx                  # Invoice list
    new/page.tsx              # New invoice
    [id]/page.tsx             # Invoice detail
  contracts/
    page.tsx                  # Contract list
    [id]/page.tsx             # Contract detail
  expenses/
    page.tsx                  # Expense tracking (NEW)
  revenue/
    page.tsx                  # Revenue analytics (NEW)
```

#### 5.2 Files to Create/Move

| File | Action | Lines (est) |
|---|---|---|
| `src/app/lab/(workspace)/finance/page.tsx` | Create | 200 |
| `src/app/lab/(workspace)/finance/invoices/page.tsx` | Move + refactor | 100 |
| `src/app/lab/(workspace)/finance/invoices/new/page.tsx` | Move | 50 |
| `src/app/lab/(workspace)/finance/invoices/[id]/page.tsx` | Move | 430 |
| `src/app/lab/(workspace)/finance/contracts/page.tsx` | Move | 30 |
| `src/app/lab/(workspace)/finance/contracts/[id]/page.tsx` | Move | 450 |
| `src/app/lab/(workspace)/finance/expenses/page.tsx` | Create | 150 |
| `src/app/lab/(workspace)/finance/revenue/page.tsx` | Create | 180 |
| `src/features/finance/invoices/InvoiceStatusActions.tsx` | Create | 120 |
| `src/features/finance/contracts/ContractLifecycle.tsx` | Create | 150 |
| `src/features/finance/FinanceOverview.tsx` | Create | 200 |

#### 5.3 Invoice State Machine Actions

```typescript
// Invoice actions follow state machine rules
const invoiceActions: Record<InvoiceStatus, InvoiceAction[]> = {
  draft: [
    { action: 'send', label: 'Send', icon: Send, requires: permissions.finance.sendInvoice },
    { action: 'edit', label: 'Edit', icon: Edit, requires: permissions.finance.createInvoice },
    { action: 'cancel', label: 'Cancel', icon: X, requires: permissions.finance.deleteInvoice },
  ],
  sent: [
    { action: 'mark_paid', label: 'Mark Paid', icon: CheckCircle, requires: permissions.finance.markPaid },
    { action: 'mark_overdue', label: 'Mark Overdue', icon: AlertCircle, requires: permissions.finance.markPaid },
    { action: 'cancel', label: 'Cancel', icon: X, requires: permissions.finance.deleteInvoice },
  ],
  paid: [
    { action: 'view', label: 'View', icon: Eye },
    { action: 'download', label: 'Download PDF', icon: Download },
    { action: 'duplicate', label: 'Duplicate', icon: Copy, requires: permissions.finance.createInvoice },
  ],
  overdue: [
    { action: 'mark_paid', label: 'Mark Paid', icon: CheckCircle, requires: permissions.finance.markPaid },
    { action: 'cancel', label: 'Cancel', icon: X, requires: permissions.finance.deleteInvoice },
  ],
  cancelled: [
    { action: 'restore', label: 'Restore as Draft', icon: RotateCcw, requires: permissions.finance.createInvoice },
  ],
}
```

#### 5.4 Acceptance Criteria
- [ ] Finance overview with revenue summary, invoice aging, risk
- [ ] Invoice list with state-machine-aware action buttons
- [ ] Invoice detail with PDF download, email, status changes
- [ ] Contract list with lifecycle status
- [ ] Contract detail with status workflow bar
- [ ] Expense tracking page
- [ ] Revenue analytics page
- [ ] Old routes redirect to new routes

---

### Phase 6 — People + Inbox (Week 7-8)

**Goal:** Rebuild teams, members, workload, and inbox.

#### 6.1 Route Structure

```
src/app/lab/(workspace)/people/
  page.tsx                    # People overview
  teams/
    page.tsx                  # Teams list
    [id]/page.tsx             # Team detail
    [id]/moodboard/page.tsx   # Team moodboard
  members/
    page.tsx                  # Member directory
  workload/
    page.tsx                  # Workload view
  invites/
    page.tsx                  # Invite management

src/app/lab/(workspace)/inbox/
  page.tsx                    # Inbox landing
  messages/page.tsx           # Messages
  notifications/page.tsx      # Notifications
  approvals/page.tsx          # Approvals (future)
```

#### 6.2 Files to Create/Move

| File | Action | Lines (est) |
|---|---|---|
| `src/app/lab/(workspace)/people/page.tsx` | Create | 180 |
| `src/app/lab/(workspace)/people/teams/page.tsx` | Move | 465 |
| `src/app/lab/(workspace)/people/teams/[id]/page.tsx` | Move | 490 |
| `src/app/lab/(workspace)/people/teams/[id]/moodboard/page.tsx` | Move | 220 |
| `src/app/lab/(workspace)/people/members/page.tsx` | Create | 150 |
| `src/app/lab/(workspace)/people/workload/page.tsx` | Create | 180 |
| `src/app/lab/(workspace)/people/invites/page.tsx` | Create | 120 |
| `src/app/lab/(workspace)/inbox/page.tsx` | Create | 150 |
| `src/app/lab/(workspace)/inbox/messages/page.tsx` | Create | 200 |
| `src/app/lab/(workspace)/inbox/notifications/page.tsx` | Create | 150 |
| `src/app/lab/(workspace)/inbox/approvals/page.tsx` | Create (placeholder) | 80 |
| `src/features/people/TeamWorkloadTable.tsx` | Create | 150 |
| `src/features/inbox/NotificationItem.tsx` | Create | 100 |
| `src/features/inbox/MessageThread.tsx` | Create | 180 |
| `src/features/people/PeopleOverview.tsx` | Create | 180 |

#### 6.3 Workload View

Uses `team_workload_projection`:

```
Workload View
├── Team capacity chart
├── Member table:
│   ├── Name, role, team
│   ├── Open tasks
│   ├── Overdue tasks
│   ├── In progress
│   ├── Blocked
│   ├── Assigned projects
│   └── Capacity indicator (Normal/High/Overloaded/Blocked)
└── Overdue by member breakdown
```

#### 6.4 Acceptance Criteria
- [ ] People overview with teams, members, workload summary
- [ ] Team detail with member management
- [ ] Workload view from projection data
- [ ] Invite management page
- [ ] Inbox with messages, notifications tabs
- [ ] Old routes redirect to new routes

---

### Phase 7 — System + Reports (Week 8-9)

**Goal:** System health page and basic reports.

#### 7.1 Route Structure

```
src/app/lab/(workspace)/system/
  page.tsx                    # System landing (admin)
  health/page.tsx             # System health (admin)
  audit/page.tsx              # Audit log (admin)
  events/page.tsx             # Domain events (admin)

src/app/lab/(workspace)/reports/
  page.tsx                    # Reports landing
  projects/page.tsx           # Project reports
  clients/page.tsx            # Client reports
  finance/page.tsx            # Finance reports
  team/page.tsx               # Team reports
```

#### 7.2 Files to Create

| File | Action | Lines (est) |
|---|---|---|
| `src/app/lab/(workspace)/system/page.tsx` | Create | 80 |
| `src/app/lab/(workspace)/system/health/page.tsx` | Create | 200 |
| `src/app/lab/(workspace)/system/audit/page.tsx` | Create | 150 |
| `src/app/lab/(workspace)/system/events/page.tsx` | Create | 150 |
| `src/app/lab/(workspace)/reports/page.tsx` | Create | 100 |
| `src/app/lab/(workspace)/reports/projects/page.tsx` | Create | 150 |
| `src/app/lab/(workspace)/reports/clients/page.tsx` | Create | 150 |
| `src/app/lab/(workspace)/reports/finance/page.tsx` | Create | 150 |
| `src/app/lab/(workspace)/reports/team/page.tsx` | Create | 150 |
| `src/features/system/OutboxHealthPanel.tsx` | Create | 120 |
| `src/features/system/SystemHealthPage.tsx` | Create | 200 |

#### 7.3 System Health Page

```
System Health (admin-only)
├── Outbox Status
│   ├── Pending events count
│   ├── Failed events count
│   ├── Retry saturated events
│   └── Oldest pending event age
├── Projection Freshness
│   ├── team_workload_projection
│   ├── activity_projection
│   ├── unread_counts_projection
│   └── client_dashboard_projection
├── Audit Status
│   └── Recent audit log entries
└── Environment Checks
    └── Health endpoint results
```

Status language: Healthy / Delayed / Degraded / Action required

#### 7.4 Acceptance Criteria
- [ ] System health page with outbox, projections, audit
- [ ] Audit log viewer
- [ ] Domain events viewer
- [ ] Basic reports (project delivery, overdue tasks, revenue, client activity, team workload, invoice aging)
- [ ] Admin-only access enforcement

---

### Phase 8 — Migration & Cleanup (Week 9-10)

**Goal:** Redirect old routes, remove deprecated code, final polish.

#### 8.1 Redirect Setup

Add redirects in old route pages:

```typescript
// src/app/lab/dashboard/page.tsx
import { redirect } from 'next/navigation'
export default function DashboardPage() {
  redirect('/lab/command-center')
}

// src/app/lab/projects/page.tsx
import { redirect } from 'next/navigation'
export default function ProjectsPage() {
  redirect('/lab/work/projects')
}

// ... etc for all old routes
```

#### 8.2 Deprecated Code Removal

| File/Directory | Action | When |
|---|---|---|
| `src/app/lab/(authenticated)/dashboard/` | Replace with redirect | After Phase 2 |
| `src/app/lab/(authenticated)/projects/` | Replace with redirect | After Phase 3 |
| `src/app/lab/(authenticated)/tasks/` | Replace with redirect | After Phase 3 |
| `src/app/lab/(authenticated)/meetings/` | Replace with redirect | After Phase 3 |
| `src/app/lab/(authenticated)/invoices/` | Replace with redirect | After Phase 5 |
| `src/app/lab/(authenticated)/contracts/` | Replace with redirect | After Phase 5 |
| `src/app/lab/(authenticated)/teams/` | Replace with redirect | After Phase 6 |
| `src/components/dashboard/` | Move to features/ | After Phase 2 |
| `src/components/layout/lab/LabSidebar.tsx` | Replace with new | After Phase 1 |
| `src/components/layout/lab/LabHeader.tsx` | Replace with new | After Phase 1 |

#### 8.3 Final Polish
- [ ] Update all navigation links to new routes
- [ ] Update CommandPalette search to include new routes
- [ ] Update onboarding tours for new pages
- [ ] Update documentation (`/lab/docs`)
- [ ] Run `npm run build` — zero errors
- [ ] Run `npm run lint` — zero warnings
- [ ] Run `npx tsc --noEmit` — zero errors
- [ ] Test all redirects work correctly
- [ ] Test all permissions work correctly
- [ ] Test on mobile/tablet breakpoints

---

## 6. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Breaking existing workflows | High | Medium | Keep old routes working with redirects until all phases complete |
| Performance regression on Command Center | High | Low | Use projections, implement loading skeletons, measure load times |
| Permission bugs in new system | High | Medium | Comprehensive permission tests, PermissionGate wrapper everywhere |
| Data migration issues | Medium | Low | No data migration needed — reading from same tables |
| Component duplication during transition | Low | High | Document which components are deprecated, use clear naming |
| Timeline overrun | Medium | Medium | Phase gates, ship each phase independently, don't block on perfection |

---

## 7. Testing Strategy

### Per-Phase Testing

| Phase | Test Focus |
|---|---|
| Phase 1 | Shell renders, navigation works, permissions resolve correctly |
| Phase 2 | Command Center data loads, action queue items are accurate |
| Phase 3 | All work routes work, project detail renders, task drawer opens |
| Phase 4 | Client directory loads, risk scores compute, portal page works |
| Phase 5 | Finance overview loads, invoice actions follow state machine |
| Phase 6 | Workload data from projection, inbox shows messages |
| Phase 7 | System health page shows admin-only data, reports render |
| Phase 8 | All redirects work, no broken links, build passes |

### Build Validation (after each phase)
```bash
npm run build        # Must pass
npm run lint         # Must pass
npx tsc --noEmit     # Must pass
```

---

## 8. File Count Summary

### New Files to Create: ~85 files

| Category | Count |
|---|---|
| Route pages | 35 |
| Feature components | 25 |
| Shell components | 4 |
| Pattern components | 5 |
| Data display components | 4 |
| Library modules | 8 |
| Layout files | 4 |

### Files to Move/Refactor: ~25 files

| Category | Count |
|---|---|
| Route pages | 18 |
| Components | 7 |

### Files to Keep As-Is: ~40 files

| Category | Count |
|---|---|
| Server actions | 18 |
| UI primitives | 10 |
| API v1 layer | 10 |
| Type definitions | 1 |
| Supabase clients | 2 |

---

## 9. Estimated Timeline

| Phase | Duration | Cumulative |
|---|---|---|
| Phase 1 — Foundation | 1-2 weeks | Week 2 |
| Phase 2 — Command Center | 1 week | Week 3 |
| Phase 3 — Work Section | 2-3 weeks | Week 5-6 |
| Phase 4 — Clients Section | 1-2 weeks | Week 7-8 |
| Phase 5 — Finance Section | 1-2 weeks | Week 8-10 |
| Phase 6 — People + Inbox | 1-2 weeks | Week 9-12 |
| Phase 7 — System + Reports | 1-2 weeks | Week 10-14 |
| Phase 8 — Migration & Cleanup | 1-2 weeks | Week 11-16 |

**Total estimated: 10-16 weeks** (depending on scope decisions per phase)

---

## 10. Success Metrics

After rebuild completion:

- [ ] Command Center is the most-visited page
- [ ] Average time to find/create any entity < 5 seconds
- [ ] Zero permission bugs in production
- [ ] Command Center loads in < 2 seconds
- [ ] All old routes redirect correctly
- [ ] Build passes with zero errors/warnings
- [ ] Mobile/tablet layouts work correctly
- [ ] Onboarding tours updated for new pages
- [ ] System health page accessible to admins
- [ ] Action queue shows real actionable items daily
