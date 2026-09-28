# Lab Frontend Documentation

Complete UI layout, components, data flow, and state reference for every page in `/lab`.

---

## Table of Contents

1. [Route Structure](#route-structure)
2. [Layout Hierarchy](#layout-hierarchy)
3. [Authentication Pages](#authentication-pages)
4. [Dashboard](#dashboard)
5. [Clients](#clients)
6. [Projects](#projects)
7. [Tasks](#tasks)
8. [Invoices](#invoices)
9. [Contracts](#contracts)
10. [Meetings](#meetings)
11. [Teams](#teams)
12. [Settings](#settings)
13. [Documentation](#documentation)
14. [Shared Components Reference](#shared-components-reference)
15. [Data Tables Reference](#data-tables-reference)
16. [Type Definitions Used](#type-definitions-used)
17. [Server Actions Reference](#server-actions-reference)
18. [Design System Notes](#design-system-notes)

---

## Route Structure

```
/lab
├── page.tsx                              # Redirects to /lab/dashboard
├── layout.tsx                            # Pass-through layout (children only)
│
├── (auth)/                               # Unauthenticated route group
│   ├── layout.tsx                        # Client-side layout, redirects if logged in
│   └── auth/
│       ├── login/page.tsx                # Login form
│       ├── signup/page.tsx               # Signup (disabled, shows warning)
│       └── team-signup/page.tsx          # Team invitation signup
│
├── (authenticated)/                      # Authenticated route group
│   ├── layout.tsx                        # Server-side auth check, provides sidebar/header/footer
│   ├── dashboard/page.tsx                # Main dashboard
│   │
│   ├── clients/
│   │   ├── page.tsx                      # Clients list
│   │   └── [id]/
│   │       ├── layout.tsx                # EntityHeader + ClientNavTabs
│   │       ├── page.tsx                  # Client overview
│   │       ├── ClientNavTabs.tsx         # Tab navigation component
│   │       ├── ClientOverviewActions.tsx # Edit actions component
│   │       ├── projects/page.tsx         # Client projects
│   │       ├── invoices/page.tsx         # Client invoices
│   │       ├── contracts/page.tsx        # Client contracts
│   │       ├── documents/page.tsx        # Client documents
│   │       ├── notes/page.tsx            # Client notes
│   │       └── messages/page.tsx         # Client messages
│   │
│   ├── projects/
│   │   ├── page.tsx                      # Projects list
│   │   ├── new/page.tsx                  # Create new project
│   │   └── [id]/
│   │       ├── layout.tsx                # EntityHeader + ProjectNavTabs
│   │       ├── page.tsx                  # Project overview
│   │       ├── ProjectNavTabs.tsx        # Tab navigation with Framer Motion
│   │       ├── ProjectDetailClient.tsx   # Client portal status component
│   │       ├── ToggleTaskButton.tsx      # Task toggle component
│   │       ├── edit/page.tsx             # Edit project
│   │       ├── tasks/page.tsx            # Project tasks
│   │       ├── milestones/page.tsx       # Project milestones
│   │       ├── invoices/page.tsx         # Project invoices
│   │       └── team/page.tsx             # Project team members
│   │
│   ├── tasks/
│   │   ├── page.tsx                      # Tasks kanban (client component)
│   │   ├── new/page.tsx                  # Redirects to /lab/tasks
│   │   └── [id]/page.tsx                 # Task detail (client component)
│   │
│   ├── invoices/
│   │   ├── page.tsx                      # Invoices list
│   │   ├── new/page.tsx                  # Create invoice (reuses list with modal open)
│   │   └── [id]/page.tsx                 # Invoice detail (client component)
│   │
│   ├── contracts/
│   │   ├── page.tsx                      # Contracts list
│   │   └── [id]/page.tsx                 # Contract detail (client component)
│   │
│   ├── meetings/
│   │   ├── page.tsx                      # Meetings list
│   │   └── [id]/page.tsx                 # Meeting detail (client component)
│   │
│   ├── teams/
│   │   ├── page.tsx                      # Teams list (client component)
│   │   └── [id]/
│   │       ├── page.tsx                  # Team detail (client component)
│   │       └── moodboard/page.tsx        # Team moodboard chat+notes (client component)
│   │
│   └── settings/page.tsx                 # User settings (client component)
│
└── docs/
    ├── layout.tsx                        # Docs-specific layout
    └── page.tsx                          # Static documentation
```

---

## Layout Hierarchy

### 1. Root Lab Layout (`/lab/layout.tsx`)
- **Type:** Pass-through
- **Behavior:** Simply renders `{children}` — no wrapper, no auth check
- **Inherits from:** Root app layout which applies `Cursor`, `Navbar`, `Footer` globally

### 2. Authenticated Layout (`/lab/(authenticated)/layout.tsx`)
- **Type:** Server component
- **Auth:** Checks `supabase.auth.getUser()`, redirects to `/lab/auth/login` if unauthenticated
- **Theme:** Fetches `user_preferences.theme` from Supabase
- **Provides:**
  - Full-screen dark layout (`min-h-screen bg-background flex`)
  - `LabSidebar` — collapsible side navigation with route links
  - `LabHeader` — sticky top header with search, notification bell, user menu
  - `LabFooter` — bottom footer
  - `ThemeProvider` — context provider for theme state
  - `CommandPalette` — keyboard shortcut command palette (Cmd+K)
  - `NotificationBell` — unread notification indicator
  - Main content area with padding: `<main className="flex-1 overflow-y-auto p-6">`

### 3. Auth Layout (`/lab/(auth)/layout.tsx`)
- **Type:** Client component
- **Auth:** Checks `supabase.auth.getUser()` on mount, redirects to `/lab/dashboard` if already logged in
- **Layout:** Minimal — no sidebar/header/footer, just `{children}` on black background

### 4. Client Detail Layout (`/lab/(authenticated)/clients/[id]/layout.tsx`)
- **Type:** Server component
- **Data:** Fetches client from `clients` table by ID
- **Components:**
  - `EntityHeader` — standardized header with:
    - `title`: `client.company_name`
    - `subtitle`: `client.industry ? "${industry} • ${email}" : email`
    - `icon`: `Building2`
    - `backLink`: `/lab/clients`
    - `backLabel`: "Back to Clients"
  - `ClientNavTabs` — horizontal tab bar
- **Nav Tabs (7):** Overview, Projects, Invoices, Contracts, Documents, Notes, Messages
- **Spacing:** `space-y-6` wrapper, `mt-6` before children

### 5. Project Detail Layout (`/lab/(authenticated)/projects/[id]/layout.tsx`)
- **Type:** Server component
- **Data:** Fetches project with `client:clients(*)` relation from `projects` table
- **Components:**
  - `EntityHeader` — standardized header with:
    - `title`: `project.name`
    - `subtitle`: `project.client ? "Client: ${company_name}" : "Internal Project"`
    - `icon`: `FolderKanban`
    - `backLink`: `/lab/projects`
    - `backLabel`: "Back to Projects"
  - `ProjectNavTabs` — sticky tab bar with Framer Motion active indicator
- **Nav Tabs (5):** Overview, Tasks, Milestones, Invoices, Team
- **Styling:** Tabs are `sticky top-[60px] z-30` with `bg-black/20 backdrop-blur-md`
- **Spacing:** `space-y-6` wrapper, `mt-6` before children

---

## Authentication Pages

### `/lab/auth/login` — Login Page

| Attribute | Detail |
|---|---|
| **Type** | Client component (`'use client'`) |
| **File** | `src/app/lab/(auth)/auth/login/page.tsx` |
| **Lines** | 198 |

#### Components Used
- Custom form elements (no external form library)
- Lucide icons: `Mail`, `Lock`, `Loader2`, `AlertCircle`, `Eye`, `EyeOff`

#### State Variables
```typescript
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [checkingAuth, setCheckingAuth] = useState(true)
const [error, setError] = useState<string | null>(null)
const [showPassword, setShowPassword] = useState(false)
```

#### Data Flow
1. **On mount:** `useEffect` calls `checkUser()` → `supabase.auth.getUser()` → if user exists, calls `routeByRole(userId)` which queries `profiles.role` and redirects:
   - `client` → `/client`
   - `admin` or `member` → `/lab/dashboard`
   - No matching role → sets `checkingAuth = false`
2. **On submit:** `handleLogin()` → `supabase.auth.signInWithPassword({ email, password })`
3. **Post-login validation:**
   - Checks `data.session.user.email_confirmed_at` — if null, signs out and shows "Email not verified" error
   - Calls `routeByRole()` to redirect by role
   - If no role match, signs out and shows "This account does not have lab access"

#### Layout Structure
```
min-h-screen flex items-center justify-center bg-black px-4
└── w-full max-w-md
    ├── Header (text-center mb-8)
    │   ├── e11 logo (w-12 h-12 bg-accent)
    │   ├── h1: "Welcome to echo11Lab"
    │   └── p: "Sign in to manage your projects"
    └── Form Card (bg-[#0a0a0a] border border-white/10 p-8)
        ├── Error banner (conditional, rose colored)
        ├── Email input (with Mail icon)
        ├── Password input (with Lock icon + Eye/EyeOff toggle)
        ├── Submit button (full-width, accent bg)
        └── Footer text: "Need access? Use your team invitation link..."
    └── "← Back to echo11" link
```

#### Styling Details
- Inputs: `bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent`
- Labels: `text-xs font-mono uppercase text-white/50`
- Submit button: `bg-accent hover:bg-accent/90 text-black font-mono uppercase tracking-wider`
- Error banner: `bg-rose-500/10 border border-rose-500/20 text-rose-400`
- Loading state: spinner replaces button text

---

### `/lab/auth/signup` — Signup Page

| Attribute | Detail |
|---|---|
| **Type** | Client component |
| **File** | `src/app/lab/(auth)/auth/signup/page.tsx` |
| **Lines** | 54 |

#### Components Used
- `AlertCircle` icon
- Self-signup is **disabled** — shows warning banner

#### Layout Structure
```
min-h-screen flex items-center justify-center bg-black px-4
└── w-full max-w-md
    ├── Header (same as login)
    └── Card (bg-[#0a0a0a] border border-white/10 p-8)
        ├── Warning banner (amber): "Self-signup is disabled"
        │   └── "Please use your team invitation link..."
        └── "Go to Login" button
    └── "← Back to echo11" link
```

---

### `/lab/auth/team-signup` — Team Invitation Signup

| Attribute | Detail |
|---|---|
| **Type** | Client component (wrapped in `Suspense`) |
| **File** | `src/app/lab/(auth)/auth/team-signup/page.tsx` |
| **Lines** | 319 |

#### Components Used
- `TeamSignupForm` (inner component), `TeamSignupPage` (outer with Suspense)
- Lucide icons: `Lock`, `User`, `Loader2`, `Sparkles`, `AlertCircle`, `ArrowRight`, `Eye`, `EyeOff`
- Server actions: `getInviteDetails`, `acceptTeamInvite` from `@/lib/actions/settings-actions`

#### State Variables
```typescript
const [loading, setLoading] = useState(true)
const [validating, setValidating] = useState(true)
const [submitting, setSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)
const [inviteEmail, setInviteEmail] = useState('')
const [inviteRole, setInviteRole] = useState('')
const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [fullName, setFullName] = useState('')
const [success, setSuccess] = useState(false)
const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)
```

#### Data Flow
1. **On mount:** Extracts `invite` query param from URL → calls `getInviteDetails(inviteId)` → sets `inviteEmail` and `inviteRole`
2. **Validation states:**
   - Invalid/missing invite → shows error page with "Invalid Invitation"
   - Valid invite → shows signup form with pre-filled email (disabled)
3. **On submit:** `handleSignup()` → validates password match → `supabase.auth.signUp()` with email redirect → `acceptTeamInvite(inviteId, userId, fullName)` → shows success page

#### Layout States
- **Loading:** Centered spinner with "Verifying Invitation..." text
- **Error:** Card with rose top border, `AlertCircle` icon, "Invalid Invitation" title, back to login link
- **Success:** Card with `Sparkles` icon, "Welcome to echo11!" title, email confirmation message, "Go to Login" button
- **Form:**
  ```
  min-h-screen with background glow effects (2 decorative blurred circles)
  └── w-full max-w-md
      ├── Header
      │   ├── e11 logo (w-16 h-16 with glow shadow)
      │   ├── h1: "Join the Agency"
      │   └── Role badge: "Invited as [role]" (pill with pulse dot)
      └── Form Card (bg-[#0a0a0a]/80 backdrop-blur-xl)
          ├── Error banner (conditional)
          ├── Email (disabled, "Verified" badge)
          ├── Full Name (with User icon)
          ├── Password (with Lock icon, Eye toggle, "6 chars minimum" hint)
          ├── Confirm Password (with Lock icon, Eye toggle)
          └── Submit button: "Create Profile" (with hover shine effect)
  ```

#### Styling Details
- Background glow: `absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[100px]`
- Logo shadow: `shadow-[0_0_40px_rgba(0,229,255,0.3)]`
- Button hover: `hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]`
- Button shine effect: `absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0`

---

## Dashboard

### `/lab/dashboard` — Main Dashboard

| Attribute | Detail |
|---|---|
| **Type** | Server component (async) |
| **File** | `src/app/lab/(authenticated)/dashboard/page.tsx` |
| **Lines** | 635 |

#### Components Used
- **Dashboard widgets:** `StatCard`, `RevenueChart`, `ProjectStatusChart`, `QuickActions`, `ActiveProjects`, `OverdueTasks`, `DateRangePicker`
- **UI primitives:** `LabCard`, `LabCardHeader`, `LabCardTitle`, `LabCardContent`
- **Onboarding:** `TooltipTour`, `PageVisitTracker`
- **Icons:** `TrendingUp`, `Clock`, `Calendar`
- **Utility:** `cn()` from `@/lib/utils`, `format`/`subDays`/`addDays` from `date-fns`

#### Data Functions (7 async fetchers)

| Function | Returns | Tables Queried |
|---|---|---|
| `getDashboardViewerScope()` | `{ role, teamId, organizationId, isAdmin }` | `profiles`, `organization_memberships` |
| `getWorkloadStatsFromProjection()` | `WorkloadProjectionSummary` or null | `team_workload_projection` |
| `getStats()` | Aggregated stats object | `invoices`, `meetings`, `projects`, `tasks` |
| `getRecentActivities()` | Activity array (max 8) | `activities` or `activity_projection` + `profiles` |
| `getUpcomingMeetings()` | Meeting array (max 5) | `meetings` + `projects` |
| `getActiveProjects()` | Project array (max 5) | `projects` + `clients` + `tasks` |
| `getOverdueTasks()` | Task array (max 5) | `tasks` + `projects` |
| `getRevenueData()` | `{ month, revenue }[]` (6 months) | `invoices` |
| `getProjectStatusData()` | `{ status, count }[]` (4 statuses) | `projects` |

#### Stats Object Shape
```typescript
{
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  totalTaskWeight: number    // weighted by priority: low=0.5, medium=1, high=2, urgent=3
  completedTaskWeight: number
  totalRevenue: number
  monthlyRevenue: number     // last 30 days paid invoices
  upcomingMeetings: number   // next 7 days
  overdueTasks: number
  taskCompletionRate: number // percentage
  trends: {
    projects: number   // active/total percentage
    tasks: number      // completion rate
    revenue: number    // month-over-month change percentage
    meetings: number   // count
  }
}
```

#### Stat Cards Configuration
- **Always shown (3):** Active Projects, Tasks Completed, Upcoming Meetings
- **Admin only (+1):** Revenue (Monthly) — shows monthly + total revenue
- **Card shape:** `{ title, value, subtitle, icon, color, trend: { value, isPositive, label } }`
- **Colors:** indigo, emerald, amber, rose, sky, violet, accent

#### Layout Structure
```
div.space-y-6
├── TooltipTour + PageVisitTracker (invisible)
├── Page Header Section
│   ├── h1: "Dashboard" with accent bar
│   ├── p: "SYSTEM // COMMAND CENTER"
│   ├── DateRangePicker
│   └── Current date display
├── Stat Cards Grid
│   ├── Admin: 4 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
│   └── Non-admin: 3 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
├── QuickActions component
├── Charts Row
│   ├── Admin: RevenueChart + ProjectStatusChart (2 columns)
│   └── Non-admin: ProjectStatusChart only (1 column)
├── Active Projects + Overdue Tasks (2 columns)
└── Recent Activity + Upcoming Meetings (2 columns)
    ├── Recent Activity: LabCard with activity list (avatar, action, timestamp)
    └── Upcoming Meetings: LabCard with meeting cards (date badge, title, time, project)
```

#### Role-Based Differences
- **Admin:** Sees 4 stat cards (including revenue), revenue chart, all data
- **Non-admin:** Sees 3 stat cards (no revenue), no revenue chart, data scoped to team/organization via `team_workload_projection` and `activity_projection`

#### Data Fallback Logic
- `getStats()`: Tries `team_workload_projection` first; if unavailable, falls back to direct `projects`/`tasks` queries
- `getRecentActivities()`: Tries `activity_projection` first; if unavailable or empty, falls back to `activities` table
- Both use `isMissingRelationOrColumnError()` to gracefully handle missing tables/columns

---

## Clients

### `/lab/clients` — Clients List

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **File** | `src/app/lab/(authenticated)/clients/page.tsx` |
| **Lines** | 32 |

#### Data Sources
- `getClientsWithStats()` — from `@/lib/actions/client-actions`, returns clients with project/invoice counts
- `getClientStats()` — aggregate statistics
- `getUserRoleAndTeam()` — returns `{ isAdmin, isLead, role, teamId }`

#### Layout
- Delegates to `ClientsPageContent` client component
- Props: `initialClients`, `initialStats`, `canEdit` (admin or lead)
- Includes `TooltipTour` and `PageVisitTracker`

---

### `/lab/clients/[id]` — Client Overview

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **File** | `src/app/lab/(authenticated)/clients/[id]/page.tsx` |
| **Lines** | 164 |
| **Layout** | Wrapped by `ClientLayout` (EntityHeader + ClientNavTabs) |

#### Data Functions

| Function | Returns | Query |
|---|---|---|
| `getClientStats(id)` | `{ totalRevenue, pendingAmount, activeProjects, totalProjects, totalInvoices, paidInvoices }` | `projects` (status), `invoices` (status, total) |
| `getClientData(id)` | `ClientWithRelations` | `clients` with `contacts:client_contacts(*)`, `current_status:client_statuses(*)` |
| `getUserRole()` | `{ canEdit: boolean }` | `profiles.role`, `teams` (lead check) |

#### Layout Structure
```
div.space-y-6
├── ClientOverviewActions (conditional, right-aligned)
├── Stats Grid (4 columns, 2x2 on mobile)
│   ├── Total Revenue (emerald-400, formatted $)
│   ├── Pending (amber-400, formatted $)
│   ├── Active Projects (white, count)
│   └── Invoices (white, paid/total)
├── Contact Info Grid (4 columns)
│   ├── Email (Mail icon, mailto link)
│   ├── Phone (Phone icon)
│   ├── Website (Globe icon, external link, strips protocol)
│   └── Industry (Building icon)
└── Tags Section (conditional)
    ├── Tags icon
    └── Tag pills (bg-white/5, border, rounded)
```

#### Styling Details
- Stats grid: `gap-px bg-white/5 border border-white/5` (creates grid lines)
- Each stat cell: `p-4 bg-[#0a0a0a]`
- Contact cells: icon in `w-10 h-10` box with `border border-white/10 bg-white/5`
- Tags: `px-2 py-0.5 text-xs font-mono bg-white/5 text-white/50 border border-white/5 rounded`

---

### `/lab/clients/[id]/projects` — Client Projects

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 54 |

#### Data Sources
- `getClientProjects(id)` — `projects` with `tasks:tasks(status, priority)`, filtered by `client_id`
- `getUserRole()` — admin or team lead check

#### Layout
- "Add Project" button (links to `/lab/projects/new?client=${id}`) — conditional on canEdit
- `ProjectList` component with `showClient={false}`

---

### `/lab/clients/[id]/invoices` — Client Invoices

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 54 |

#### Data Sources
- `getClientInvoices(id)` — `invoices` table filtered by `client_id`
- `getUserRole()` — admin or team lead check

#### Layout
- "Create Invoice" button (links to `/lab/invoices/new?client=${id}`) — conditional on canEdit
- `InvoiceList` component with `showClient={false}`

---

### `/lab/clients/[id]/contracts` — Client Contracts

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 43 |

#### Data Sources
- `getClientContracts(id)` — `contracts` with `template:contract_templates(name)`, filtered by `client_id`
- `getUserRole()` — admin or team lead check

#### Layout
- `ClientContractsClient` component with `initialContracts`, `canEdit`, `clientId` props

---

### `/lab/clients/[id]/documents` — Client Documents

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 32 |

#### Data Sources
- `getClientDocuments(id)` — from `@/lib/actions/document-actions`
- `getUserRole()` — admin or team lead check

#### Layout
- `ClientDocumentsClient` component with `initialDocuments`, `canEdit`, `clientId` props

---

### `/lab/clients/[id]/notes` — Client Notes

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 32 |

#### Data Sources
- `getClientNotes(id)` — from `@/lib/actions/note-actions`
- `getUserRole()` — admin or team lead check

#### Layout
- `ClientNotesClient` component with `initialNotes`, `canEdit`, `clientId` props

---

### `/lab/clients/[id]/messages` — Client Messages

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 9 |

#### Data Sources
- Passes `clientId` to client component

#### Layout
- `ClientMessagesClient` component with `clientId` prop

---

## Projects

### `/lab/projects` — Projects List

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **File** | `src/app/lab/(authenticated)/projects/page.tsx` |
| **Lines** | 142 |

#### Data Functions

| Function | Returns | Role Scoping |
|---|---|---|
| `getProjects()` | `ProjectWithMilestones[]` | Admin: all; Lead: team projects; Member: assigned projects only |
| `getClients()` | `{ id, company_name }[]` | Same scoping as projects |
| `getUserRoleAndTeam()` | `{ isAdmin, isLead, role, teamId }` | — |

#### Role-Based Project Scoping
- **Admin:** `SELECT * FROM projects` — no filter
- **Lead:** `WHERE team_id = userTeamId`
- **Member:** Finds projects via `tasks WHERE assignee_id = userId`, then filters by `team_id`

#### Layout
- Delegates to `ProjectsPageClient` with `initialProjects`, `initialClients`, `canEdit` props
- Includes `TooltipTour` and `PageVisitTracker`

---

### `/lab/projects/new` — New Project

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 51 |

#### Data Sources
- `getClients()` — all clients ordered by `company_name`
- `getServices()` — services ordered by `category`, then `name`

#### Layout
- `NewProjectForm` with `clients` and `services` as props
- Wrapped in `div.py-6`

---

### `/lab/projects/[id]` — Project Overview

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **File** | `src/app/lab/(authenticated)/projects/[id]/page.tsx` |
| **Lines** | 448 |
| **Layout** | Wrapped by `ProjectLayout` (EntityHeader + ProjectNavTabs) |

#### Data Functions

| Function | Returns | Tables |
|---|---|---|
| `getProject(id)` | `ProjectWithRelations` | `projects` with `client:clients(*)`, `tasks:tasks(status, priority)` |
| `getProjectAccess(id, teamId)` | `{ canAccess, canManage }` | `profiles`, `teams`, `tasks` (assignee check) |
| `getProjectExpenses(id)` | `ProjectExpense[]` | `project_expenses` with `service:services(*)` |
| `getServices()` | `Service[]` | `services` |
| `getProjectSummaryStats(id)` | Stats object | `tasks`, `milestones`, `invoices` |
| `getRecentActivity(id)` | Activity array | `activities` or `activity_projection` + `profiles` |

#### Access Control Logic
1. Admin → `canAccess: true, canManage: true`
2. Team lead of project's team → `canAccess: true, canManage: true`
3. Member assigned to any task in project → `canAccess: true, canManage: false`
4. Otherwise → `notFound()`

#### Stats Object Shape
```typescript
{
  totalTasks: number
  completedTasks: number
  taskProgress: number        // weighted percentage
  totalMilestones: number
  completedMilestones: number
  totalInvoices: number
  paidRevenue: number
  pendingRevenue: number
}
```

#### Layout Structure
```
div.space-y-6
├── Action Bar (right-aligned, gap-2)
│   ├── Edit Project button (glass, conditional on canManage)
│   ├── Visit button (ghost, conditional on project.link)
│   └── ProjectActions (delete/status change, conditional on canManage)
├── Main Content Grid (3 columns, 2:1 ratio)
│   ├── Main Column (col-span-2)
│   │   └── Project Card
│   │       ├── Header: Project initial avatar (colored), name, status badge
│   │       └── Content: Description, metadata grid (6 fields)
│   │           ├── Type, Status, Client
│   │           └── Start Date, Deadline, Created
│   └── Sidebar
│       ├── Budget Overview Card
│       │   ├── Total Budget
│       │   ├── Revenue Collected (emerald)
│       │   └── Pending Payment (amber)
│       └── ProjectDetailClient component
├── At-a-Glance Stats Grid (4 columns)
│   ├── Tasks card → links to /tasks (progress bar)
│   ├── Milestones card → links to /milestones (progress bar)
│   ├── Invoices card → links to /invoices
│   └── Team card → links to /team
└── Recent Activity Card (conditional)
    └── Activity list with dot indicators
```

#### Status Configuration
```typescript
const statusConfig = {
  active:    { label: 'Active',    variant: 'accent' },
  on_hold:   { label: 'On Hold',   variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  archived:  { label: 'Archived',  variant: 'ghost' },
}
```

#### Budget Calculation
- `calculatedBudget` = sum of `project_expenses.amount`
- `displayBudget` = `calculatedBudget > 0 ? calculatedBudget : project.budget`

---

### `/lab/projects/[id]/edit` — Edit Project

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 117 |

#### Data Sources
- `getProject(id)` — with access check (admin or team lead only)
- `getClients()` — all clients
- `getServices()` — all services
- `getProjectExpenses(id)` — expenses with service relations

#### Layout
- `EditProjectForm` with `project`, `clients`, `services`, `expenses` props
- Returns `notFound()` if user lacks access

---

### `/lab/projects/[id]/tasks` — Project Tasks

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 94 |
| **Layout** | Wrapped by `ProjectLayout` |

#### Data Sources
- `getProjectTasks(id)` — `tasks` table filtered by `project_id`, ordered by `created_at DESC`

#### Layout Structure
```
div.space-y-6
├── Summary Row (3 columns)
│   ├── To Do (white/70)
│   ├── In Progress (amber-400)
│   └── Done (emerald-400)
├── In Progress Card (conditional — only if tasks exist)
│   └── TaskList
├── To Do Card (always shown)
│   └── TaskList
└── Completed Card (conditional — only if tasks exist)
    └── TaskList
```

Each card has a colored dot indicator next to the title.

---

### `/lab/projects/[id]/milestones` — Project Milestones

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 60 |
| **Layout** | Wrapped by `ProjectLayout` |

#### Data Sources
- `getMilestones(id)` — `milestones` table filtered by `project_id`

#### Computed Values
- `completed` = count where `completed = true`
- `total` = total count
- `totalWeight` = sum of all `weight` values
- `completedWeight` = sum of `weight` where `completed = true`
- `weightedProgress` = `Math.round((completedWeight / totalWeight) * 100)`

#### Layout Structure
```
div.space-y-6
├── Stats Grid (3 columns)
│   ├── Total (white/70)
│   ├── Completed (emerald-400)
│   └── Progress (accent, percentage)
└── LabCard
    └── MilestonesPageClient (projectId, initialMilestones)
```

---

### `/lab/projects/[id]/team` — Project Team

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 104 |
| **Layout** | Wrapped by `ProjectLayout` |

#### Data Sources
- `getProjectTeam(id)` — derives from task assignees:
  1. Gets all `assignee_id` from `tasks` where `project_id = id`
  2. Fetches `profiles` for those IDs
  3. Counts tasks per member
  4. Sorts by `task_count DESC`

#### Layout
- **Empty state:** Centered icon + "No team members assigned" message
- **Team grid:** 3-column grid of member cards
  - Avatar (image or initials in accent-colored circle)
  - Name, role, task count

---

### `/lab/projects/[id]/invoices` — Project Invoices

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 67 |
| **Layout** | Wrapped by `ProjectLayout` |

#### Data Sources
- `getProjectInvoices(id)` — `invoices` with `client:clients(company_name)`, filtered by `project_id`

#### Computed Values
- `paid` = invoices where `status = 'paid'`
- `pending` = invoices where `status IN ('sent', 'overdue')`
- `totalRevenue` = sum of paid invoice totals
- `pendingRevenue` = sum of pending invoice totals

#### Layout Structure
```
div.space-y-6
├── Finance Summary (3 columns)
│   ├── Total Invoices (white/70)
│   ├── Collected (emerald-400)
│   └── Pending (amber-400)
└── LabCard
    └── InvoiceList (showClient=true, showProject=false)
```

---

## Tasks

### `/lab/tasks` — Tasks Kanban

| Attribute | Detail |
|---|---|
| **Type** | Client component (`'use client'`) |
| **File** | `src/app/lab/(authenticated)/tasks/page.tsx` |
| **Lines** | 278 |

#### Components Used
- `PageHeader`, `LabButton`, `KanbanBoard`, `TaskFormModal`
- Icons: `FolderKanban`, `CheckSquare`, `ArrowLeft`, `ArrowRight`

#### State Variables
```typescript
const [projects, setProjects] = useState<Project[]>([])
const [loading, setLoading] = useState(true)
const [filter, setFilter] = useState<string>('all')
const [selectedProjectId, setSelectedProjectId] = useState<string>('')
const [selectedProjectData, setSelectedProjectData] = useState<Project | null>(null)
const [isModalOpen, setIsModalOpen] = useState(false)
const [refreshKey, setRefreshKey] = useState(0)
const [canCreateTasks, setCanCreateTasks] = useState(false)
```

#### Data Flow
1. **On mount:** `loadProjects()` — role-scoped project fetch:
   - Admin: all projects
   - Lead: team projects
   - Member: projects where user has assigned tasks
2. **Filter:** `all`, `active`, `on_hold`, `completed` — filters displayed project cards
3. **Project selection:** Clicking a project card sets `selectedProjectId` → switches to kanban view
4. **Back navigation:** Resets selection, increments `refreshKey` to reload kanban
5. **Task creation:** Opens `TaskFormModal` with `defaultProjectId`

#### Layout States
- **Loading:** Centered spinner
- **Project selector view:**
  ```
  PageHeader (title: "Tasks", description, filter dropdown)
  └── Project cards grid (3 columns)
      └── Each card: colored initial avatar, name, client, status badge, "View Tasks" button
  ```
- **Kanban view:**
  ```
  Back button + project header + "Add Task" button
  └── KanbanBoard (key={refreshKey}, defaultProjectId)
  └── TaskFormModal (isOpen, defaultProjectId)
  ```

#### Project Card Styling
- `bg-white/5 border border-white/10 hover:border-white/20`
- Colored avatar: `backgroundColor: ${project.color}20`
- Status badge: dynamic color class based on status

---

### `/lab/tasks/[id]` — Task Detail

| Attribute | Detail |
|---|---|
| **Type** | Client component |
| **File** | `src/app/lab/(authenticated)/tasks/[id]/page.tsx` |
| **Lines** | 832 |

#### Components Used
- `LabButton`, `AppFeedbackProvider` (confirmAction)
- `NextImage` for avatars
- Icons: 18 different icons (see full list in route structure section)

#### State Variables
```typescript
const [task, setTask] = useState<Task | null>(null)
const [comments, setComments] = useState<TaskComment[]>([])
const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
const [attachments, setAttachments] = useState<TaskAttachment[]>([])
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [uploading, setUploading] = useState(false)
const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'time' | 'files'>('details')
const [isEditing, setIsEditing] = useState(false)
const [formData, setFormData] = useState({ title, description, status, priority, assignee_id, due_date })
const [newComment, setNewComment] = useState('')
const [newTimeLog, setNewTimeLog] = useState({ hours, date, notes })
const [teamMembers, setTeamMembers] = useState<{ id, full_name }[]>([])
const [currentUserId, setCurrentUserId] = useState<string | null>(null)
const [canEdit, setCanEdit] = useState(false)
const [saveError, setSaveError] = useState<string | null>(null)
```

#### Data Loading
- `loadData()` fetches:
  - Task from `tasks` table
  - Project info from `projects` table (id, name, team_id)
  - Assignee profile from `profiles` table
  - Comments from `task_comments` with user profiles
  - Time logs from `time_logs` with user profiles
  - Attachments from `task_attachments` with user profiles
  - Team members from `profiles` (filtered by team if not admin)
- **Access check:** admin, team lead, or assignee — otherwise shows "Task not found"

#### Server Actions Used
- `updateTask()`, `deleteTask()`, `addTaskComment()`, `deleteTaskComment()`
- `logTime()`, `uploadTaskAttachment()`, `deleteTaskAttachment()`

#### Layout Structure
```
div.p-6
└── max-w-6xl mx-auto
    ├── Back link
    └── 3-column grid (2:1 ratio)
        ├── Main Column (col-span-2)
        │   ├── Task Card (title/description, editable inline)
        │   └── Tabbed Section (4 tabs)
        │       ├── Details: Description, Project link, Assignee with avatar
        │       ├── Comments: Input + Send, comment list with avatars, timestamps, delete
        │       ├── Time: Time log form (hours/date/notes), total hours bar, time log list
        │       └── Files: Upload button, file list with icons, download/delete
        └── Sidebar
            ├── Status card (colored badge)
            ├── Priority card (colored badge with Flag icon)
            ├── Due Date card (Calendar icon, rose if overdue)
            ├── Project card (Folder icon, link)
            ├── Time Logged card (Clock icon, total hours)
            └── Delete Task card (danger button, conditional on canEdit)
```

#### Status/Priority Colors
```typescript
const statusColors = {
  todo:        'bg-slate-500/20 text-slate-400',
  in_progress: 'bg-amber-500/20 text-amber-400',
  review:      'bg-indigo-500/20 text-indigo-400',
  done:        'bg-emerald-500/20 text-emerald-400',
}

const priorityColors = {
  low:    'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high:   'bg-amber-500/20 text-amber-400',
  urgent: 'bg-rose-500/20 text-rose-400',
}
```

#### File Upload Constraints
- Max file size: 10MB
- Storage bucket: `task-attachments`
- Download: generates blob URL, triggers browser download

---

## Invoices

### `/lab/invoices` — Invoices List

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 83 |

#### Data Sources
- `getInvoices(teamId, isAdminOrLead)` — role-scoped invoice fetch:
  - Admin/Lead: all invoices
  - Member with team: invoices for team's projects + invoices without project
- `getProjects()` — all projects for dropdown
- `getUserRoleAndTeam()` — role and team info

#### Layout
- Delegates to `InvoicesPageClient` with `initialInvoices`, `initialProjects`, `canEdit` props
- Includes `TooltipTour` and `PageVisitTracker`

---

### `/lab/invoices/new` — New Invoice

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 50 |

#### Data Sources
- `getInvoices()` — all invoices with project/client relations
- `getProjects()` — all projects

#### Layout
- Reuses `InvoicesPageClient` with `forceOpenModal` prop → opens create modal immediately

---

### `/lab/invoices/[id]` — Invoice Detail

| Attribute | Detail |
|---|---|
| **Type** | Client component |
| **File** | `src/app/lab/(authenticated)/invoices/[id]/page.tsx` |
| **Lines** | 431 |

#### Components Used
- `LabButton`, `AppFeedbackProvider`
- Icons: `ArrowLeft`, `Calendar`, `DollarSign`, `User`, `Folder`, `Send`, `CheckCircle`, `Trash2`, `Loader2`, `AlertCircle`, `Download`, `Mail`

#### State Variables
```typescript
const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null)
const [loading, setLoading] = useState(true)
const [updating, setUpdating] = useState(false)
const [deleting, setDeleting] = useState(false)
const [generatingPdf, setGeneratingPdf] = useState(false)
const [emailing, setEmailing] = useState(false)
```

#### Data Loading
- Invoice from `invoices` with `project:projects(id, name)`, `client:clients(...)`
- Invoice items from `invoice_items` ordered by `sort_order`

#### Server Actions Used
- `updateInvoiceStatus()`, `deleteInvoice()`, `emailInvoiceAction()`
- `downloadInvoicePDF()`, `generateInvoicePDF()` — client-side PDF generation

#### Layout Structure
```
div.p-6
└── max-w-4xl mx-auto
    ├── Back link
    ├── Overdue Warning Banner (conditional, rose colored)
    ├── Header Card
    │   ├── Invoice number, status badge, created date
    │   └── Action buttons: PDF, Email & Send, Mark as Sent/Paid, Cancel, Delete
    ├── Info Grid (5 columns)
    │   ├── Client (link to client)
    │   ├── Project (link to project)
    │   ├── Due Date
    │   ├── Issued
    │   └── Total (emerald, bold)
    ├── Line Items Table
    │   ├── Headers: Description, Qty, Rate, Amount
    │   └── Rows: item data or fallback single row
    ├── Summary (right-aligned)
    │   ├── Subtotal
    │   ├── Tax (rate%)
    │   └── Total (emerald, bold, larger)
    ├── Notes Section (conditional)
    └── Paid Date Banner (conditional, emerald)
```

#### Status Workflow Actions
- `draft` → "Mark as Sent" button
- `sent` → "Mark as Paid" button, "Cancel" button
- `sent` or `overdue` → "Cancel" button
- `draft`, `sent`, or `overdue` → "Email & Send" button
- All states → PDF download, Delete

#### Email Invoice Flow
1. Generates PDF via `generateInvoicePDF()` → creates Blob
2. Converts Blob to base64 via FileReader
3. Calls `emailInvoiceAction()` with base64 PDF, client details
4. Shows success/error alert

---

## Contracts

### `/lab/contracts` — Contracts List

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 27 |

#### Data Sources
- `getContractsWithClients()` — from `@/lib/actions/contract-actions`
- `getUserRoleAndTeam()` — role and team info

#### Layout
- Delegates to `ContractsPageClient` with `initialContracts`, `canEdit` props
- Includes `TooltipTour` and `PageVisitTracker`

---

### `/lab/contracts/[id]` — Contract Detail

| Attribute | Detail |
|---|---|
| **Type** | Client component |
| **File** | `src/app/lab/(authenticated)/contracts/[id]/page.tsx` |
| **Lines** | 449 |

#### Components Used
- `LabButton`, `ContractAgreementPreview`, `AppFeedbackProvider`
- Icons: 17 different icons (see route structure)

#### State Variables
```typescript
const [contract, setContract] = useState<Contract | null>(null)
const [loading, setLoading] = useState(true)
const [actionLoading, setActionLoading] = useState<string | null>(null)
const [previewContent, setPreviewContent] = useState('')
const [showSendModal, setShowSendModal] = useState(false)
const [sendEmail, setSendEmail] = useState('')
```

#### Data Loading
- `getContractDetail(id)` — from contract actions
- On load: if `generated_content` exists, uses it; otherwise substitutes template variables with client data
- Template engine: `substituteVariables(template.content, variables)` with defaults from `getDefaultVariables()`

#### Server Actions Used
- `updateContractStatus()`, `uploadContractFile()`, `generateContractFromTemplate()`
- `sendContractToClient()`, `deleteContract()`
- `downloadContractPDF()` — client-side PDF generation

#### Layout Structure
```
div.space-y-6
├── Header Row
│   ├── Back link, title, contract number, client link, status badge
│   └── Action buttons: Download, Send, Delete
├── Status Workflow Bar
│   └── 4-step progress: draft → pending → signed → expired
│       (completed steps highlighted in accent)
├── 3-column grid (2:1)
│   ├── Main Column (col-span-2)
│   │   └── Contract Content Card
│   │       ├── Header: "Contract Content" title, Upload PDF + Generate PDF buttons
│   │       ├── If file_url: attachment info + iframe preview (600px height)
│   │       ├── If previewContent: ContractAgreementPreview component
│   │       └── Empty: "No contract content yet" message
│   └── Sidebar
│       ├── Details Card: Value, Start Date, End Date, Template, Sent At, Signed At
│       ├── Client Contact Card (if email exists)
│       └── Notes Card (if notes exist)
└── Send Contract Modal (conditional)
    ├── Email input (pre-filled with client email)
    └── Cancel/Send buttons
```

#### Status Configuration
```typescript
const statusColors = {
  draft:      'bg-white/5 border-white/10 text-white/40',
  pending:    'bg-amber-500/10 border-amber-500/20 text-amber-400',
  signed:     'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  expired:    'bg-rose-500/10 border-rose-500/20 text-rose-400',
  terminated: 'bg-white/5 border-white/10 text-white/30',
}
```

#### File Upload Constraints
- Only PDF files accepted (`file.type === 'application/pdf'`)
- Uploaded files displayed via iframe preview

---

## Meetings

### `/lab/meetings` — Meetings List

| Attribute | Detail |
|---|---|
| **Type** | Server component |
| **Lines** | 48 |

#### Data Sources
- `getMeetings()` — meetings with `project:projects(name)`, ordered by `scheduled_at ASC`
- `getProjects()` — projects with id, name, status

#### Layout
- Delegates to `MeetingsPageClient` with `initialMeetings`, `initialProjects` props
- Includes `TooltipTour` and `PageVisitTracker`

---

### `/lab/meetings/[id]` — Meeting Detail

| Attribute | Detail |
|---|---|
| **Type** | Client component |
| **File** | `src/app/lab/(authenticated)/meetings/[id]/page.tsx` |
| **Lines** | 374 |

#### Components Used
- `LabButton`, `AppFeedbackProvider`
- Icons: `ArrowLeft`, `Calendar`, `Clock`, `Video`, `MapPin`, `Users`, `Edit3`, `Trash2`, `Loader2`, `AlertCircle`

#### State Variables
```typescript
const [meeting, setMeeting] = useState<Meeting | null>(null)
const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([])
const [loading, setLoading] = useState(true)
const [isEditing, setIsEditing] = useState(false)
const [saving, setSaving] = useState(false)
const [saveError, setSaveError] = useState<string | null>(null)
const [deleting, setDeleting] = useState(false)
const [formData, setFormData] = useState({ title, description, project_id, scheduled_at, duration_minutes, video_link, location, notes })
```

#### Data Loading
- Meeting from `meetings` with `project:projects(id, name)`
- Projects from `getProjectsForMeetingForm()` action

#### Server Actions Used
- `updateMeeting()`, `deleteMeeting()`, `getProjectsForMeetingForm()`

#### Layout Structure
```
div.p-6
└── max-w-4xl mx-auto
    ├── Back link
    └── Main Card
        ├── Edit Mode:
        │   ├── Title input
        │   ├── Description textarea
        │   ├── Project select + Duration select (2 columns)
        │   ├── Date & Time datetime-local input
        │   ├── Video Link + Location (2 columns)
        │   ├── Notes textarea
        │   ├── Error banner (conditional)
        │   └── Save/Cancel buttons
        └── View Mode:
            ├── Past meeting warning (conditional, amber)
            ├── Title, Edit button, Delete button
            ├── Description
            ├── Info Grid (4 columns)
            │   ├── Date
            │   ├── Time
            │   ├── Duration
            │   └── Project (link)
            └── Action Links: Join Meeting (video_link), Location
    └── Notes Section (conditional)
```

---

## Teams

### `/lab/teams` — Teams List

| Attribute | Detail |
|---|---|
| **Type** | Client component |
| **File** | `src/app/lab/(authenticated)/teams/page.tsx` |
| **Lines** | 465 |

#### Components Used
- `PageHeader`, `LabButton`, `EmptyState`, `TeamFormModal`, `TooltipTour`, `PageVisitTracker`
- Icons: `Plus`, `Settings`, `Mail`, `X`, `Users`

#### State Variables
```typescript
const [teams, setTeams] = useState<Team[]>([])
const [userTeam, setUserTeam] = useState<Team | null>(null)
const [loading, setLoading] = useState(true)
const [isAdmin, setIsAdmin] = useState(false)
const [view, setView] = useState<'all' | 'my'>('all')
const [activeTab, setActiveTab] = useState<'teams' | 'moodboard' | 'members'>('teams')
const [showCreateModal, setShowCreateModal] = useState(false)
const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
const [pendingInvites, setPendingInvites] = useState<TeamInvite[]>([])
const [showInviteModal, setShowInviteModal] = useState(false)
const [inviteEmail, setInviteEmail] = useState('')
const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'client'>('member')
const [inviteJobTitle, setInviteJobTitle] = useState('')
const [inviteLoading, setInviteLoading] = useState(false)
const [inviteError, setInviteError] = useState<string | null>(null)
const [inviteSuccess, setInviteSuccess] = useState(false)
```

#### Data Loading
- `getAllTeams()` — all teams
- `getUserTeam(userId)` — current user's team
- `getTeamMembers()` — admin-only, all team members with roles
- `getPendingInvites()` — admin-only, pending invitations

#### Server Actions Used
- `assignUserToTeam()`, `inviteTeamMember()`, `cancelInvite()`, `updateMemberRole()`

#### Layout Structure
```
div.space-y-6
├── TooltipTour + PageVisitTracker
├── PageHeader (title: "Teams", action: New Team or Invite button)
├── Tab Navigation (3 tabs)
│   ├── Teams
│   ├── Moodboard
│   └── Team Members (admin only)
├── View Filter (admin only, Teams tab): All Teams / My Team
├── Loading State
├── Teams Tab Content
│   ├── Empty State (or)
│   └── Team Cards Grid (3 columns)
│       └── Each card: colored initial avatar, name, description, lead, member count
├── Moodboard Tab Content
│   ├── Empty State (or)
│   └── Team Cards Grid (3 columns)
│       └── Each card: avatar, name, lead, description, "Open Moodboard" + "Team Details" buttons
├── Team Members Tab Content (admin only)
│   ├── Pending Invitations List (email, job title, cancel button)
│   └── Team Members List (name, email, role dropdown, team dropdown)
├── Create Team Modal (TeamFormModal)
└── Invite Modal (email, job title, role, send button)
```

---

### `/lab/teams/[id]` — Team Detail

| Attribute | Detail |
|---|---|
| **Type** | Client component |
| **File** | `src/app/lab/(authenticated)/teams/[id]/page.tsx` |
| **Lines** | 491 |

#### Components Used
- `LabButton`, `LabCard`, `TeamFormModal`, `AppFeedbackProvider`
- Icons: `ArrowLeft`, `Users`, `FolderKanban`, `Plus`, `X`, `UserPlus`, `Crown`, `Settings`

#### State Variables
```typescript
const [team, setTeam] = useState<Team | null>(null)
const [members, setMembers] = useState<Profile[]>([])
const [projects, setProjects] = useState<ProjectWithClient[]>([])
const [loading, setLoading] = useState(true)
const [isAdmin, setIsAdmin] = useState(false)
const [isLead, setIsLead] = useState(false)
const [allProfiles, setAllProfiles] = useState<ProfileSelect[]>([])
const [allProjects, setAllProjects] = useState<ProjectWithClient[]>([])
const [showAddMember, setShowAddMember] = useState(false)
const [showAddProject, setShowAddProject] = useState(false)
const [showEditModal, setShowEditModal] = useState(false)
```

#### Data Loading
- `getTeam(teamId)` — team with members and projects relations
- Unassigned profiles: `profiles WHERE team_id != teamId OR team_id IS NULL`
- Unassigned projects: `projects WHERE team_id != teamId OR team_id IS NULL`

#### Server Actions Used
- `assignUserToTeam()`, `removeUserFromTeam()`, `setTeamLead()`
- `assignProjectToTeam()`, `removeProjectFromTeam()`

#### Layout Structure
```
div.space-y-6
├── Header Row
│   ├── Back link, team avatar, name, description
│   └── Moodboard link, Edit Team button (admin/lead)
├── 3-column grid (2:1)
│   ├── Main Column (col-span-2)
│   │   └── Team Members Card
│   │       ├── Add button (admin/lead)
│   │       └── Member list: avatar, name, email, crown (if lead), set lead/remove buttons
│   └── Sidebar
│       └── Team Lead Card (avatar, name)
├── Team Projects Card
│   ├── Add button (admin/lead)
│   └── Project list: name, client, status badge, remove button
├── Add Member Modal (list of available users)
├── Add Project Modal (list of available projects)
└── Edit Team Modal (TeamFormModal with editTeam prop)
```

---

### `/lab/teams/[id]/moodboard` — Team Moodboard

| Attribute | Detail |
|---|---|
| **Type** | Client component |
| **File** | `src/app/lab/(authenticated)/teams/[id]/moodboard/page.tsx` |
| **Lines** | 218 |

#### Components Used
- `LabButton`
- Icons: `ArrowLeft`

#### State Variables
```typescript
const [messages, setMessages] = useState<TeamMessage[]>([])
const [notes, setNotes] = useState<TeamNote[]>([])
const [teamMembers, setTeamMembers] = useState<Profile[]>([])
const [newMessage, setNewMessage] = useState('')
const [newNote, setNewNote] = useState('')
const [loading, setLoading] = useState(true)
const [showMentions, setShowMentions] = useState(false)
const [mentionResults, setMentionResults] = useState<Profile[]>([])
```

#### Data Loading
- Team members from `profiles WHERE team_id = teamId`
- Messages from `getTeamMessages(teamId)`
- Notes from `getTeamNotes(teamId)`

#### Server Actions Used
- `postTeamMessage(teamId, content, mentions)` — creates message with @mention notifications
- `addTeamNote(teamId, content)` — creates note

#### @Mention System
- Detects `@` followed by text in message input
- Filters team members by name/email match
- Shows dropdown with matching members
- On select: replaces `@query` with `@FullName` in input

#### Layout Structure
```
div.space-y-6
├── Header: Back link, "Team Moodboard" title
├── Chat Section
│   ├── h2: "Chat"
│   ├── Message list (scrollable, max-h-64)
│   │   └── Each message: username, timestamp, content
│   └── Message form
│       ├── Input with @mention autocomplete dropdown
│       └── Send button
└── Notes Section
    ├── h2: "Notes"
    ├── Note list
    │   └── Each note: username, timestamp, content
    └── Note form
        ├── Textarea
        └── Add button
```

---

## Settings

### `/lab/settings` — User Settings

| Attribute | Detail |
|---|---|
| **Type** | Client component |
| **File** | `src/app/lab/(authenticated)/settings/page.tsx` |
| **Lines** | 425 |

#### Components Used
- `PageHeader`, `LabButton`, `LabCard`, `ToggleSwitch` (inline), `ThemeSelector` (inline)
- `TooltipTour`, `PageVisitTracker`
- Icons: `User`, `Bell`, `Shield`, `Palette`, `Key`, `Check`, `Loader2`

#### State Variables
```typescript
const [profile, setProfile] = useState<Profile | null>(null)
const [fullName, setFullName] = useState('')
const [avatarUrl, setAvatarUrl] = useState('')
const [emailNotifications, setEmailNotifications] = useState(true)
const [taskReminders, setTaskReminders] = useState(true)
const [meetingReminders, setMeetingReminders] = useState(true)
const [theme, setTheme] = useState<Theme>('dark')
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
const [teams, setTeams] = useState<Team[]>([])
const [showPasswordChange, setShowPasswordChange] = useState(false)
const [currentPassword, setCurrentPassword] = useState('')
const [newPassword, setNewPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [passwordLoading, setPasswordLoading] = useState(false)
```

#### Data Loading
- `getUserProfile()` — user profile data
- `getUserPreferences()` — theme, notification preferences
- `getAllTeams()` — admin-only, for team name lookup

#### Server Actions Used
- `updateProfile({ full_name, avatar_url })`
- `updatePreferences({ email_notifications, task_reminders, meeting_reminders, theme })`
- `changePassword(currentPassword, newPassword)`

#### Layout Structure
```
div.space-y-6 max-w-4xl
├── TooltipTour + PageVisitTracker
├── PageHeader (title: "Settings")
├── Success/Error Message Banner (conditional)
├── Profile Card
│   ├── Avatar preview (gradient bg, initials)
│   ├── Avatar URL input
│   ├── Full Name input + Email (disabled, 2 columns)
│   ├── Role badge + Team badge
│   └── Save Profile button
├── Notifications Card
│   ├── ToggleSwitch: Email Notifications
│   ├── ToggleSwitch: Task Reminders
│   ├── ToggleSwitch: Meeting Reminders
│   └── Save Preferences button
├── Appearance Card
│   ├── ThemeSelector (Dark/Light/System buttons)
│   └── Save Theme button
└── Security Card
    ├── "Change Password" link (or)
    └── Password form: Current, New, Confirm + Cancel/Update buttons
```

#### ToggleSwitch Component (inline)
- Custom toggle: `w-11 h-6` track, `w-5 h-5` thumb
- Checked: `bg-accent`, thumb translates right
- Unchecked: `bg-white/10 border border-white/10`

#### ThemeSelector Component (inline)
- Three buttons: Dark, Light, System
- Selected: `bg-accent text-black border-accent`
- Unselected: `text-white/60 border-white/10 hover:border-white/20`

#### Password Validation
- Must match confirmation
- Minimum 6 characters
- Requires current password

---

## Documentation

### `/lab/docs` — Documentation Page

| Attribute | Detail |
|---|---|
| **Type** | Server component (static) |
| **File** | `src/app/lab/docs/page.tsx` |
| **Lines** | 198 |
| **Metadata** | title: "Team Onboarding | echo11Lab" |

#### Components Used
- `PageHeader`, `LabCard`
- Icons: `CheckSquare`, `Briefcase`, `FileSignature`, `BookOpen`, `Users`, `Settings`, `LayoutDashboard`

#### Layout Structure
```
div.space-y-16
├── Intro Section
│   ├── PageHeader
│   └── Tagline (border-l-4 border-accent pl-6)
├── Section 1: Dashboard & Feed
│   ├── Stats & Charts card
│   └── Activity & Actions card
├── Section 2: Clients & Teams
│   ├── Client Lifecycle card
│   └── Team Hierarchy card
├── Section 3: Projects & Milestones
│   ├── Project Board Output card
│   └── Internal Tracking card
├── Section 4: Tasks & Meetings
│   ├── Tasks & Sorting card
│   └── Meeting Calendar card
├── Section 5: Invoices & Contracts
│   ├── Invoicing Logic card
│   └── Contracts card
├── Section 6: Settings & Profile
│   └── Single card with profile/notifications/appearance
└── Footer icon (BookOpen, opacity-30)
```

---

## Shared Components Reference

### Layout Components

| Component | Location | Props | Purpose |
|---|---|---|---|
| `EntityHeader` | `@/components/lab/unified/EntityHeader` | `title`, `subtitle`, `icon`, `backLink`, `backLabel` | Standardized header for entity detail pages |
| `ClientNavTabs` | `clients/[id]/ClientNavTabs.tsx` | `clientId` | Horizontal tab bar for client sub-pages (7 tabs) |
| `ProjectNavTabs` | `projects/[id]/ProjectNavTabs.tsx` | `projectId` | Sticky tab bar with Framer Motion active indicator (5 tabs) |

### Dashboard Widgets

| Component | Props | Description |
|---|---|---|
| `StatCard` | `title`, `value`, `subtitle`, `trend`, `icon`, `color` | Metric card with trend indicator |
| `RevenueChart` | `data: { month, revenue }[]` | 6-month revenue line chart |
| `ProjectStatusChart` | `data: { status, count }[]` | Project status donut chart (4 statuses) |
| `QuickActions` | — | Buttons: New Project, New Task, New Meeting, New Invoice |
| `ActiveProjects` | `projects: Project[]` | List of 5 most recently updated active projects |
| `OverdueTasks` | `tasks: Task[]` | List of overdue incomplete tasks |
| `DateRangePicker` | — | Date range selection for dashboard filtering |

### UI Primitives

| Component | Variants/Props | Description |
|---|---|---|
| `LabButton` | `variant`: default, ghost, glass, danger, outline; `size`: sm, default | Primary button component |
| `LabCard` | `className` | Card container with border and background |
| `LabCardHeader` | `className` | Card header section |
| `LabCardTitle` | `className` | Card title text |
| `LabCardContent` | `className` | Card body section |
| `LabBadge` | `variant`: default, warning, success, ghost, accent | Status badge component |
| `PageHeader` | `title`, `description`, `icon`, `action` | Page-level header with optional action slot |
| `EmptyState` | `icon`, `title`, `description`, `action` | Empty state placeholder |
| `SearchInput` | `value`, `onChange`, `placeholder` | Search input with clear button |
| `FilterTabs` | `tabs`, `activeTab`, `onTabChange` | Filter tabs with optional counts |

### Onboarding Components

| Component | Props | Description |
|---|---|---|
| `TooltipTour` | `steps`, `pageId` | React Joyride tour steps for a specific page |
| `PageVisitTracker` | `pageId` | Tracks page visits for onboarding progress |

### Form/Modal Components

| Component | Location | Props | Purpose |
|---|---|---|---|
| `TaskFormModal` | `@/components/lab/TaskForm` | `isOpen`, `onClose`, `onSuccess`, `defaultProjectId` | Create/edit task modal |
| `TeamFormModal` | `@/components/lab/TeamForm` | `isOpen`, `onClose`, `onSuccess`, `onDelete`, `editTeam` | Create/edit team modal |
| `KanbanBoard` | `@/components/lab/KanbanBoard` | `defaultProjectId` | Drag-and-drop task kanban board |
| `ProjectList` | `@/components/lab/unified/ProjectList` | `projects`, `showClient` | Reusable project list table/cards |
| `InvoiceList` | `@/components/lab/unified/InvoiceList` | `invoices`, `showClient`, `showProject` | Reusable invoice list |
| `TaskList` | `@/components/lab/unified/TaskList` | `tasks` | Reusable task list |
| `ClientsPageContent` | `@/components/lab/ClientsPageContent` | `initialClients`, `initialStats`, `canEdit` | Full clients list UI |
| `ProjectsPageClient` | `@/components/lab/ProjectsPageClient` | `initialProjects`, `initialClients`, `canEdit` | Full projects list UI |
| `InvoicesPageClient` | `@/components/lab/InvoicesPageClient` | `initialInvoices`, `initialProjects`, `canEdit`, `forceOpenModal` | Full invoices list UI |
| `MeetingsPageClient` | `@/components/lab/MeetingsPageClient` | `initialMeetings`, `initialProjects` | Full meetings list UI |
| `ContractsPageClient` | `@/components/contracts/ContractsPageClient` | `initialContracts`, `canEdit` | Full contracts list UI |

### Client-Specific Components

| Component | Location | Props |
|---|---|---|
| `ClientOverviewActions` | `clients/[id]/ClientOverviewActions.tsx` | `client` |
| `ClientContractsClient` | `clients/[id]/contracts/ClientContractsClient.tsx` | `initialContracts`, `canEdit`, `clientId` |
| `ClientDocumentsClient` | `clients/[id]/documents/ClientDocumentsClient.tsx` | `initialDocuments`, `canEdit`, `clientId` |
| `ClientNotesClient` | `clients/[id]/notes/ClientNotesClient.tsx` | `initialNotes`, `canEdit`, `clientId` |
| `ClientMessagesClient` | `clients/[id]/messages/ClientMessagesClient.tsx` | `clientId` |

### Project-Specific Components

| Component | Location | Props |
|---|---|---|
| `ProjectDetailClient` | `projects/[id]/ProjectDetailClient.tsx` | `projectId`, `milestones`, `expenses`, `services`, `client` |
| `ProjectActions` | `@/components/lab/ProjectActions` | `projectId`, `projectStatus`, `onDelete` |
| `MilestonesPageClient` | `projects/[id]/milestones/MilestonesPageClient.tsx` | `projectId`, `initialMilestones` |
| `ToggleTaskButton` | `projects/[id]/ToggleTaskButton.tsx` | — |
| `NewProjectForm` | `projects/new/NewProjectForm.tsx` | `clients`, `services` |
| `EditProjectForm` | `projects/[id]/edit/EditProjectForm.tsx` | `project`, `clients`, `services`, `expenses` |

---

## Data Tables Reference

| Table | Pages Using It | Primary Queries |
|---|---|---|
| `profiles` | All authenticated pages | Auth checks, user data, role, team_id, organization_id |
| `user_preferences` | Dashboard, Settings | theme, email_notifications, task_reminders, meeting_reminders |
| `clients` | Clients list, client detail, projects, invoices, contracts | CRUD, company_name, industry, email, phone, website, tags |
| `client_contacts` | Client overview | Contact list per client |
| `client_statuses` | Client overview | Current client lifecycle status |
| `client_documents` | Client documents | Document list per client |
| `client_messages` | Client messages | Client-team messaging |
| `projects` | Projects list, project detail, tasks, meetings, invoices, dashboard | CRUD, name, status, budget, start_date, deadline, team_id, client_id |
| `milestones` | Project milestones | name, weight, completed, completed_at, project_id |
| `project_expenses` | Project overview, edit | amount, service_id, project_id |
| `tasks` | Tasks kanban, task detail, project tasks, dashboard | CRUD, title, status, priority, due_date, assignee_id, project_id |
| `task_comments` | Task detail | content, task_id, user_id |
| `task_attachments` | Task detail | file_name, file_path, file_type, task_id, uploaded_by |
| `time_logs` | Task detail | hours, date, notes, task_id, user_id |
| `invoices` | Invoices list, invoice detail, dashboard | CRUD, invoice_number, status, total, subtotal, tax_rate, tax_amount, due_date, paid_date, project_id, client_id |
| `invoice_items` | Invoice detail | description, quantity, rate, amount, sort_order, invoice_id |
| `contracts` | Contracts list, contract detail | CRUD, title, status, value, start_date, end_date, file_url, generated_content, template_id, client_id |
| `contract_templates` | Contract detail | name, content |
| `meetings` | Meetings list, meeting detail, dashboard | CRUD, title, scheduled_at, duration_minutes, video_link, location, notes, project_id |
| `teams` | Teams list, team detail, settings | CRUD, name, description, color, lead_id |
| `services` | New/edit project, project expenses | name, category, rate |
| `activities` | Dashboard, project overview | action, entity_id, user_id, created_at |
| `activity_projection` | Dashboard, project overview | organization_id, entity_type, entity_id, payload, occurred_at |
| `team_workload_projection` | Dashboard | organization_id, team_id, payload (projects/tasks stats) |
| `organization_memberships` | Dashboard | user_id, organization_id, status |
| `notifications` | NotificationBell | unread count, notification data |

---

## Type Definitions Used

All types are imported from `@/types/lab`. Key types used across pages:

| Type | Key Fields | Used In |
|---|---|---|
| `Client` | id, company_name, contact_name, email, phone, website, industry, tags, status | Clients pages |
| `Project` | id, name, description, status, type, budget, start_date, deadline, color, link, client_id, team_id | Projects pages |
| `Task` | id, title, description, status, priority, due_date, assignee_id, project_id | Tasks pages |
| `Invoice` | id, invoice_number, status, total, subtotal, tax_rate, tax_amount, due_date, paid_date, notes, project_id, client_id | Invoices pages |
| `InvoiceItem` | id, description, quantity, rate, amount, sort_order, invoice_id | Invoice detail |
| `Contract` | id, title, contract_number, status, value, start_date, end_date, file_url, generated_content, notes, template_id, client_id | Contracts pages |
| `Meeting` | id, title, description, scheduled_at, duration_minutes, video_link, location, notes, project_id | Meetings pages |
| `Team` | id, name, description, color, lead_id | Teams pages |
| `Profile` | id, full_name, email, avatar_url, role, team_id, organization_id | All pages |
| `Milestone` | id, name, weight, completed, completed_at, project_id | Project milestones |
| `ProjectExpense` | id, amount, service_id, project_id | Project budget |
| `Service` | id, name, category, rate | Project forms |
| `TaskComment` | id, content, task_id, user_id, created_at | Task detail |
| `TimeLog` | id, hours, date, notes, task_id, user_id | Task detail |
| `TaskAttachment` | id, file_name, file_path, file_type, task_id, uploaded_by, created_at | Task detail |
| `Theme` | 'dark' \| 'light' \| 'system' | Settings |
| `UserRole` | 'admin' \| 'member' \| 'client' | Teams, auth |
| `ProjectStatus` | 'active' \| 'on_hold' \| 'completed' \| 'archived' | Projects |
| `TaskStatus` | 'todo' \| 'in_progress' \| 'review' \| 'done' | Tasks |
| `TaskPriority` | 'low' \| 'medium' \| 'high' \| 'urgent' | Tasks |

---

## Server Actions Reference

| Action File | Exported Functions | Used By Pages |
|---|---|---|
| `client-actions.ts` | `getClientsWithStats`, `getClientStats` | Clients list, client overview |
| `project-actions.ts` | `deleteProject` | Project overview |
| `task-actions.ts` | `updateTask`, `deleteTask`, `addTaskComment`, `deleteTaskComment`, `logTime`, `uploadTaskAttachment`, `deleteTaskAttachment` | Task detail |
| `invoice-actions.ts` | `updateInvoiceStatus`, `deleteInvoice`, `emailInvoiceAction` | Invoice detail |
| `contract-actions.ts` | `getContractsWithClients`, `getContractDetail`, `updateContractStatus`, `uploadContractFile`, `generateContractFromTemplate`, `sendContractToClient`, `deleteContract` | Contracts list, contract detail |
| `meeting-actions.ts` | `updateMeeting`, `deleteMeeting`, `getProjectsForMeetingForm` | Meeting detail |
| `team-actions.ts` | `getUserRoleAndTeam`, `getAllTeams`, `getUserTeam`, `assignUserToTeam`, `removeUserFromTeam`, `setTeamLead`, `assignProjectToTeam`, `removeProjectFromTeam`, `getTeam` | Teams pages, dashboard, projects list |
| `note-actions.ts` | `getClientNotes` | Client notes |
| `document-actions.ts` | `getClientDocuments` | Client documents |
| `settings-actions.ts` | `getUserProfile`, `getUserPreferences`, `updateProfile`, `updatePreferences`, `changePassword`, `getInviteDetails`, `acceptTeamInvite`, `getTeamMembers`, `updateMemberRole`, `getPendingInvites`, `inviteTeamMember`, `cancelInvite` | Settings, team signup, teams list |
| `team-moodboard-actions.ts` | `getTeamMessages`, `postTeamMessage`, `getTeamNotes`, `addTeamNote` | Team moodboard |

---

## Design System Notes

### Color Palette
- **Background:** `#000000` (pure black)
- **Card background:** `#0a0a0a`
- **Accent:** `#00E5FF` (cyan)
- **Text primary:** `text-white` / `text-foreground`
- **Text secondary:** `text-white/50`, `text-white/40`, `text-white/30`
- **Borders:** `border-white/10`, `border-white/5`
- **Glass:** `bg-white/5 backdrop-blur-md border border-white/10`

### Typography
- **Sans:** `Syne` (font-sans) — headings, body text
- **Mono:** `JetBrains Mono` (font-mono) — labels, data values, tags
- **Tracking:** `tracking-wider`, `tracking-widest`, `tracking-tighter` for uppercase labels

### Common Patterns
- **Grid lines:** `gap-px bg-white/5 border border-white/5` with `bg-[#0a0a0a]` cells
- **Icon boxes:** `w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5`
- **Status badges:** colored bg/border/text combinations (e.g., `bg-emerald-500/10 border-emerald-500/20 text-emerald-400`)
- **Section labels:** `text-xs font-mono uppercase text-white/40 tracking-wider`
- **Sharp edges:** No `rounded` classes unless specified (no rounded corners by default)

### Responsive Breakpoints
- Mobile: 1 column default
- `md:` (768px): 2 columns
- `lg:` (1024px): 3-4 columns

### Motion
- **Framer Motion:** Used in `ProjectNavTabs` for active tab indicator (`layoutId="projectActiveTab"`)
- **CSS transitions:** `transition-colors`, `transition-all`, `transition-transform` on interactive elements
- **Loading spinners:** `animate-spin` on `Loader2` or custom border spinners
