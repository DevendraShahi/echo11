# Echo11 Lab Rebuild Design Plan

> **Status:** Proposed
> **Scope:** Full frontend rebuild — agency operating system
> **Backend:** Existing API v1, projections, outbox, audit log (no changes needed)

---

## Core Product Idea

Echo11 Lab should become an **agency operating system** for managing:

```
Clients
Projects
Tasks
Teams
Invoices
Contracts
Meetings
Messages
Files
Activity
System health
```

Not as separate modules, but as one connected command center.

The new frontend should answer:

```
What is happening?
What needs action?
Who owns it?
What is blocked?
What is risky?
What changed?
What can I do next?
```

The current frontend feels like a collection of pages. The rebuilt version should feel like a **control room**.

---

# 1. New Frontend Philosophy

## Old Mental Model

```
Dashboard
Projects
Tasks
Clients
Invoices
Contracts
Teams
Settings
```

This is module-first.

## Better Mental Model

```
Command Center
Work
Clients
Finance
People
Communication
System
```

This is workflow-first.

### Recommended Primary Navigation

```
Command Center
Work
Clients
Finance
People
Inbox
Reports
System
Settings
```

Then each section contains the relevant entities.

### Navigation Structure

```
Command Center
  (landing page)

Work
  Projects
  Tasks
  Meetings
  Files
  Activity

Clients
  Client Directory
  Client Detail
  Portal Access
  Client Activity
  Client Documents

Finance
  Invoices
  Expenses
  Revenue
  Payments
  Financial Risk

People
  Teams
  Members
  Workload
  Invites
  Moodboard

Inbox
  Messages
  Notifications
  Mentions
  Approvals

Reports
  Projects
  Clients
  Finance
  Team

System
  Health
  Audit
  Events
```

---

# 2. New App Shell

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Top Command Bar                                               │
│ Org / Search / Quick Create / Notifications / Profile         │
├───────────────┬──────────────────────────────────────────────┤
│ Primary Nav   │ Active Workspace                              │
│               │                                               │
│ Command       │ Page Header                                   │
│ Work          │ Context Tabs                                  │
│ Clients       │ Main Content                                  │
│ Finance       │ Right Context Panel                           │
│ People        │                                               │
│ Inbox         │                                               │
│ Reports       │                                               │
│ System        │                                               │
└───────────────┴──────────────────────────────────────────────┘
```

## Top Command Bar

Should include:

```
Organization switcher
Global command search
Quick create
Notifications
Sync health indicator
User profile
```

Global search should be central, not hidden.

Shortcut: `⌘K`

Search should find:

```
Projects
Clients
Tasks
Invoices
Contracts
Meetings
Messages
Documents
Team members
```

---

# 3. Product-Level Navigation

## 3.1 Command Center

Replaces the basic dashboard.

**Purpose:** Daily operating view for the whole business.

### Sections

```
Today
Priority Queue
Business Health
Project Health
Financial Health
Client Risk
Team Load
Recent Activity
System Sync
```

### Command Center Layout

```
Header
  "Good morning, Devendra"
  "12 actions need attention today"

Action Queue
  - 4 overdue tasks
  - 2 invoices overdue
  - 1 client invite expired
  - 3 unread client messages
  - 1 contract awaiting review

Business Snapshot
  Active projects
  Open tasks
  Pending invoices
  Revenue this month
  At-risk clients

Workload
  Team capacity
  Overdue by member
  Blocked work

Activity Timeline
  Latest domain events from activity_projection

System Health
  Projection freshness
  Outbox status
```

This should become the most-used page.

---

## 3.2 Work

The operational workspace.

### Routes

```
/lab/work
/lab/work/projects
/lab/work/tasks
/lab/work/meetings
/lab/work/activity
```

### Work Overview

A unified view of current work:

```
Active projects
My tasks
Blocked tasks
Upcoming meetings
Recently changed items
```

### Project Experience

Project detail should become a full workspace.

```
Project Header
  Name
  Client
  Status
  Health
  Progress
  Owner
  Quick actions

Tabs
  Overview
  Tasks
  Timeline
  Files
  Expenses
  Invoices
  Contracts
  Meetings
  Activity
  Settings

Right Panel
  Client
  Team
  Budget
  Deadlines
  Risk
  Related records
```

Project page should not feel like a form page. It should feel like a mission control panel.

---

## 3.3 Clients

### Routes

```
/lab/clients
/lab/clients/[clientId]
/lab/clients/[clientId]/portal
/lab/clients/[clientId]/activity
```

### Client Directory

Show clients as business accounts, not just records.

```
Client
Status
Primary contact
Active projects
Open invoices
Revenue
Last activity
Portal status
Risk
```

### Client Detail

**Tabs:**

```
Overview
Projects
Contacts
Notes
Documents
Invoices
Contracts
Messages
Activity
Portal
```

**Right panel:**

```
Primary contact
Portal status
Outstanding invoice amount
Active project count
Last message
Client risk signals
```

### Client Risk Signals

New frontend concept:

```
Client Risk
```

**Risk inputs:**

```
Overdue invoices
No recent activity
Open blockers
Contract expiring
Unanswered messages
Inactive portal invite
```

This can initially be computed in the frontend/server action, then later projection-backed.

---

## 3.4 Finance

### Routes

```
/lab/finance
/lab/finance/invoices
/lab/finance/expenses
/lab/finance/revenue
```

Invoices should not be just a table. Finance should show money state.

### Finance Overview

```
Revenue this month
Pending amount
Overdue amount
Draft invoices
Paid invoices
Client payment risk
```

### Invoice UX

Invoice actions should follow the state machine already added. Do not show invalid actions.

```
Draft invoice:
  Send
  Edit
  Cancel

Sent invoice:
  Mark paid
  Mark overdue
  Cancel

Paid invoice:
  View
  Download
  Duplicate

Cancelled invoice:
  Restore as draft
```

The current backend added invoice transition rules. The frontend should mirror those rules visually.

---

## 3.5 People

### Routes

```
/lab/people
/lab/people/teams
/lab/people/members
/lab/people/workload
/lab/people/invites
```

### People Overview

```
Teams
Members
Open invites
Workload
Overdue tasks by person
Current team load
```

### Workload View

Use `team_workload_projection`.

Show:

```
Member
Open tasks
Overdue tasks
In progress
Blocked
Assigned projects
Capacity indicator
```

This turns the team system into something operational, not just administrative.

---

## 3.6 Inbox

### Routes

```
/lab/inbox
/lab/inbox/messages
/lab/inbox/notifications
/lab/inbox/approvals
```

Inbox should combine:

```
Client messages
Team messages
Notifications
Mentions
Approvals
System alerts
```

The notification bell can remain, but the full Inbox should be the real triage center.

---

## 3.7 Reports

### Routes

```
/lab/reports
/lab/reports/projects
/lab/reports/clients
/lab/reports/finance
/lab/reports/team
```

Start simple. Initial reports:

```
Project delivery status
Overdue tasks
Revenue summary
Client activity
Team workload
Invoice aging
```

---

## 3.8 System

### Routes

```
/lab/system
/lab/system/health
/lab/system/audit
/lab/system/events
```

Admin-only. Because the backend now has outbox metrics and health endpoints, the frontend should expose that as a real system panel.

### System Health Page

Show:

```
Outbox status
Pending events
Failed events
Retry saturated events
Oldest pending event age
Projection staleness
Last dispatch result
```

**Status language:**

```
Healthy
Delayed
Degraded
Action required
```

**Important UX message:**

```
Core writes are safe. Some dashboard numbers may be delayed.
```

---

# 4. New Frontend Architecture

## Recommended Folder Structure

```
src/
  app/
    lab/
      (app)/
        command-center/
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
    projects/
    tasks/
    clients/
    finance/
    people/
    inbox/
    reports/
    system/

  components/
    lab/
      shell/
      primitives/
      patterns/
      feedback/
      data-display/

  lib/
    frontend/
      permissions/
      api-result/
      idempotency/
      filters/
      status/
      dates/
      money/
```

This is better than letting every route own its own UI patterns.

---

# 5. New UI System

## 5.1 Core Components

Build these first:

```
LabShell
LabSidebar
LabTopbar
CommandSearch
QuickCreate
PermissionGate
PageHeader
PageTabs
ContextPanel
StatCard
HealthCard
ActionQueue
ActivityFeed
StatusBadge
EntityBadge
DataTable
EmptyState
ConfirmDialog
Toast
FormError
SkeletonCard
```

## 5.2 Domain Components

```
ProjectCard
ProjectHealthBadge
ProjectTimeline
TaskCard
TaskBoard
TaskDrawer
ClientCard
ClientRiskBadge
InvoiceStatusActions
ContractLifecycle
TeamWorkloadTable
NotificationItem
MessageThread
OutboxHealthPanel
```

---

# 6. Better Workflow Design

## 6.1 Quick Create Workflow

From anywhere, user can create:

```
Project
Task
Client
Invoice
Contract
Meeting
Note
Message
```

Button: `+ Create`

Command menu:

```
Create new task
Create invoice for client
Schedule meeting
Invite team member
Send client message
```

This will make the app feel fast.

---

## 6.2 Entity Drawer Workflow

Instead of navigating away for every small detail, use drawers.

Example:

```
Click task
  → right drawer opens
  → edit status, priority, assignee
  → add comment
  → upload file
  → view activity
```

Full page still exists for deep detail, but drawer improves daily usage.

**Use drawer for:**

```
Task preview
Client quick view
Invoice quick view
Contract quick view
Notification detail
```

---

## 6.3 Action Queue Workflow

This is the most important new workflow.

Every user should have a queue:

```
My Action Queue
```

For admins/leads:

```
Business Action Queue
```

Examples:

```
Approve contract
Respond to client
Review overdue invoice
Assign unowned task
Fix failed invite
Check degraded outbox
```

**Action queue items should have:**

```
Title
Reason
Entity
Priority
Due date
Action button
Dismiss/snooze
```

---

## 6.4 Approval Workflow

Add a formal approval pattern.

Approvals can include:

```
Invoice before sending
Contract before sending
Project budget change
Client deletion
Large expense
```

Even if backend approval tables are not built yet, design the UI so it can support it.

---

## 6.5 Conflict Handling Workflow

Because `lock_version` exists, the UI should support optimistic concurrency.

When update conflict happens:

```
This item was updated by someone else.
Reload the latest version before saving.
```

Buttons:

```
Reload latest
Cancel
```

Later:

```
Compare changes
Merge manually
```

This will prevent silent overwrite problems.

---

# 7. Data Flow Rules

## 7.1 Mutation Flow

```
User action
  → client validation
  → create idempotency key
  → server action
  → API v1 route
  → permission check
  → write source table
  → write domain event
  → write audit log
  → projection refresh through outbox
  → UI refresh/optimistic update
```

## 7.2 Read Flow

```
Page request
  → resolve actor/org/team/client context
  → read projection if available
  → fallback to source table
  → return typed view model
  → render UI
```

## 7.3 Frontend Rule

```
Never build UI directly around raw database tables.
Build UI around view models.
```

Example:

```ts
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
```

This keeps pages clean.

---

# 8. Permission Model in Frontend

Create a central permission object.

```ts
type LabPermissions = {
  project: {
    create: boolean
    update: boolean
    delete: boolean
    assignTeam: boolean
    manageTags: boolean
  }
  task: {
    create: boolean
    update: boolean
    delete: boolean
    markDone: boolean
    assign: boolean
  }
  client: {
    create: boolean
    update: boolean
    delete: boolean
    invitePortal: boolean
    viewFinancials: boolean
  }
  finance: {
    view: boolean
    createInvoice: boolean
    sendInvoice: boolean
    markPaid: boolean
    deleteInvoice: boolean
  }
  team: {
    invite: boolean
    removeMember: boolean
    setLead: boolean
  }
  system: {
    viewHealth: boolean
    viewAudit: boolean
  }
}
```

Every page receives permissions.

Do not scatter this:

```ts
role === "admin" || role === "lead"
```

Use:

```tsx
<PermissionGate allowed={permissions.finance.sendInvoice}>
  <SendInvoiceButton />
</PermissionGate>
```

---

# 9. Visual Design Direction

Move Echo11 Lab toward:

```
Premium technical command center
Minimal but dense
Dark graphite base
Cyan signal color
Sharp cards
Subtle grid
No overdone glassmorphism
No decorative clutter
```

## Recommended Visual System

```
Background:    #070A0D
Panel:         #0D1117
Elevated panel:#111821
Border:        rgba(255,255,255,0.08)
Accent:        #00E5FF
Text primary:  #F8FAFC
Text secondary:#94A3B8
Muted:         #64748B
Success:       #22C55E
Warning:       #F59E0B
Danger:        #EF4444
Info:          #38BDF8
```

## Typography

```
Primary: Inter / Geist Sans
Mono:    Geist Mono / IBM Plex Mono
```

Use mono only for:

```
IDs
timestamps
status metadata
amounts
system health
logs
```

## Layout Style

```
12-column grid
Strong left alignment
Large command headers
Compact data rows
Cards with thin borders
No heavy shadows
Subtle hover states
```

---

# 10. Page-Level Rebuild Proposal

## 10.1 Command Center Page

`/lab/command-center`

Sections:

```
1. Today Header
2. Priority Queue
3. Business Metrics
4. Project Health Board
5. Client Risk Panel
6. Team Workload
7. Recent Activity
8. System Sync Status
```

This becomes the default landing page.

---

## 10.2 Work Page

`/lab/work`

Sections:

```
My Work
Team Work
Project Board
Upcoming Meetings
Recently Updated
Blocked Items
```

Views:

```
Board
Table
Timeline
Calendar
```

---

## 10.3 Project Detail

`/lab/work/projects/[id]`

Better layout:

```
Header:
  Project name
  Client
  Health
  Status
  Progress
  Due date
  Actions

Main Tabs:
  Overview
  Tasks
  Timeline
  Files
  Finance
  Contracts
  Meetings
  Activity

Right Context:
  Team
  Client
  Budget
  Risk
  Related records
```

---

## 10.4 Client Detail

`/lab/clients/[id]`

Better layout:

```
Header:
  Client name
  Status
  Portal status
  Revenue
  Risk
  Actions

Tabs:
  Overview
  Projects
  Contacts
  Messages
  Documents
  Finance
  Contracts
  Notes
  Activity
  Portal

Right Context:
  Primary contact
  Open invoices
  Active projects
  Last activity
  Invite status
```

---

## 10.5 Finance Page

`/lab/finance`

Sections:

```
Revenue summary
Invoice aging
Overdue invoices
Draft invoices
Recently paid
Client balances
```

Invoice list views:

```
All
Draft
Sent
Overdue
Paid
Cancelled
```

---

## 10.6 People Page

`/lab/people`

Sections:

```
Teams
Members
Workload
Invites
Moodboard
```

Workload should be the star feature here.

---

## 10.7 Inbox Page

`/lab/inbox`

Unified communication:

```
Client messages
Team messages
Notifications
Approvals
System alerts
```

Each item should be actionable.

---

## 10.8 System Health Page

`/lab/system/health`

Admin-only.

Sections:

```
Outbox
Projection freshness
Failed events
Retry saturation
Audit status
Environment checks
```

This page directly uses the new observability infrastructure.

---

# 11. Recommended Build Order

## Phase 0 — Freeze Old UI Scope

Do not keep patching the existing UI except for critical bugs.

Keep current backend architecture.

Start a new frontend route group:

```
src/app/lab/(workspace)/
```

or rebuild under current routes after component system is ready.

---

## Phase 1 — Foundation

Build:

```
LabShell
Topbar
Sidebar
CommandSearch shell
QuickCreate shell
PageHeader
PageTabs
ContextPanel
PermissionGate
StatusBadge
StatCard
ActionQueue
ActivityFeed
ConfirmDialog
Toast system
```

Also add:

```
frontend permission maps
API result helpers
idempotency helpers
view model types
status config
```

---

## Phase 2 — Command Center

Build the new dashboard first.

Why? Because it validates:

```
projection reads
activity_projection
unread_counts_projection
team_workload_projection
client_dashboard_projection
outbox health
permission-aware UI
```

This is the best test of the new architecture.

---

## Phase 3 — Work Section

Rebuild:

```
Projects list
Project detail
Tasks list
Task drawer
Kanban board
Meetings
Activity
```

Focus on daily operations.

---

## Phase 4 — Clients Section

Rebuild:

```
Client directory
Client detail
Portal access
Contacts
Notes
Documents
Messages
Client activity
Client risk
```

---

## Phase 5 — Finance Section

Rebuild:

```
Finance overview
Invoice list
Invoice detail
Invoice form
Invoice state-machine actions
Expenses
Revenue summary
```

---

## Phase 6 — People + Inbox

Rebuild:

```
Teams
Members
Workload
Invites
Moodboard
Inbox
Notifications
Messages
Approvals
```

---

## Phase 7 — System + Reports

Build:

```
System health
Audit timeline
Reports
Project reports
Client reports
Finance reports
Team reports
```

---

# 12. What to Add Beyond Previous Proposals

## 12.1 Command Palette

Not optional. Add this early.

Actions:

```
Create project
Create task
Create invoice
Open client
Search invoice
Invite team member
Send client message
Open system health
```

## 12.2 Quick Create Button

One button for all common creation.

```
+ Create
  Project
  Task
  Client
  Invoice
  Contract
  Meeting
  Note
```

## 12.3 Action Queue

This is a major product differentiator.

It turns raw data into daily decisions.

## 12.4 Entity Relationship Graph

On detail pages, show linked records.

Example:

```
Client
  → Projects
  → Tasks
  → Invoices
  → Contracts
  → Meetings
  → Messages
```

This solves confusion around relationships.

## 12.5 System Confidence Indicator

Small topbar indicator:

```
Synced
Delayed
Degraded
```

Admin-only detailed view.

## 12.6 Saved Views

Examples:

```
My overdue tasks
Invoices needing action
Projects at risk
Clients with stale activity
Contracts expiring soon
```

## 12.7 Workload Capacity

Not just task count.

Add visual levels:

```
Normal
High
Overloaded
Blocked
```

## 12.8 Client Health Score

Computed from:

```
activity recency
invoice status
project status
message response
contract status
```

## 12.9 Audit Trail UX

For admin/lead:

```
Who changed what and when?
```

Use the new `audit_log`.

## 12.10 Approval Center

Future-ready for:

```
invoice send approval
contract send approval
budget change approval
client deletion approval
```

---

# 13. Final Target Experience

The rebuilt Echo11 Lab should feel like this:

```
I log in.
I immediately know what needs attention.
I can create or find anything in seconds.
Every page shows context, not isolated records.
I never see actions I cannot perform.
I can trust numbers because projections power reads.
I can trust writes because API v1 owns mutations.
I can see system sync health if something is delayed.
Clients, projects, tasks, finance, and teams feel connected.
```

That is the product-level rebuild to aim for.

---

# 14. The Best Rebuild Strategy

Do **not** redesign page by page.

Do this instead:

```
1. Build the new app shell.
2. Build shared UI primitives.
3. Build view models.
4. Build Command Center.
5. Rebuild Work.
6. Rebuild Clients.
7. Rebuild Finance.
8. Rebuild People.
9. Rebuild Inbox.
10. Add System and Reports.
```

The backend has already moved toward a robust architecture. The frontend should now become a **workflow-first command layer** over that backend, not a prettier CRUD interface.
