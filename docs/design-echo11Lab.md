# echo11Lab - System Design Document

> **Project:** echo11Lab - Internal Project Management Platform  
> **Date:** March 30, 2026  
> **Status:** Design Validated (SD5 → SD6)  
> **Version:** 1.0

---

## Table of Contents

1. [Design Context Brief](#design-context-brief)
2. [Architecture Decision Records (ADRs)](#architecture-decision-records-adrs)
3. [Component Map](#component-map)
4. [Walking Skeleton](#walking-skeleton)
5. [Database Schema](#database-schema)
6. [API & Integration Points](#api--integration-points)
7. [Risk Assessment](#risk-assessment)
8. [Implementation Checklist](#implementation-checklist)

---

## Design Context Brief

### Problem Statement

echo11 needs an internal project management platform to organize, track, and manage all client projects with integrated billing and client communication capabilities. The platform must provide a premium, industry-level experience that reflects echo11's brand identity.

### Quality Attributes That Matter

| Priority | Attribute | Description |
|----------|-----------|-------------|
| 1 | **Simplicity** | Must be intuitive for small team (2-5 people) |
| 2 | **Real-time** | Live updates for task changes across all connected clients |
| 3 | **Client Portal** | Secure access for clients to view progress and invoices |
| 4 | **Speed** | Fast page loads, responsive UI with smooth animations |
| 5 | **Premium Feel** | Industry-level aesthetics matching echo11 brand |

### Hard Constraints

| Constraint | Impact |
|------------|--------|
| Next.js 15 (App Router) | Must use server actions, App Router patterns |
| Supabase | Auth, Database, Realtime, Storage - all from one provider |
| Single codebase | No microservices - everything in one Next.js app |
| Vercel deployment | Must work with Vercel's serverless model |
| Existing tech stack | React 19, Tailwind CSS, Framer Motion, Lucide icons |

### V1 Scope (What's Being Built)

**Must Have (MVP):**
- User authentication (Supabase Auth)
- Project CRUD with status tracking
- Kanban task board with drag-and-drop
- Dashboard with analytics charts
- Client management
- Client portal with limited view
- Meeting scheduling with calendar
- Invoice generation with PDF export
- Activity feed

**Can Defer (V2):**
- Time tracking
- Slack/Email notifications
- Gantt charts
- Recurring invoices
- Payment gateway integration
- Team chat

---

## Architecture Decision Records (ADRs)

### ADR 1: UI Component Library
**Date:** 2026-03-30  
**Status:** Approved

**Context:** Need premium, accessible components quickly. Already using Tailwind CSS in the ecosystem.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| Custom components | Full control | Time-consuming, inconsistent |
| Headless UI + Tailwind | Flexible | More work, less polished |
| Material UI / AntD | Feature-rich | Overly complex, hard to customize |
| **ShadCN UI + Tailwind** | Premium look, copy-paste ownership | Learning curve |

**Decision:** Use ShadCN UI + Tailwind CSS

**Rationale:** ShadCN provides copy-paste components that we own, excellent accessibility, matches premium aesthetic goal. Uses Radix UI primitives under the hood - battle-tested.

**Reversal Cost:** Low - components are just React code we control

---

### ADR 2: Drag and Drop Library
**Date:** 2026-03-30  
**Status:** Approved

**Context:** Need accessible, performant Kanban board for task management.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| react-beautiful-dnd | Familiar API | Maintenance concerns, deprecated-feeling |
| react-dnd | Powerful | Steep learning curve, complex |
| @hello-pangea/dnd | Drop-in replacement | Still essentially maintenance fork |
| **@dnd-kit/core** | Modern, accessible, modular | Newer, smaller ecosystem |

**Decision:** Use @dnd-kit/core

**Rationale:** Modern, accessible by default, modular architecture (can use only what needed), actively maintained. Better TypeScript support than alternatives.

**Reversal Cost:** Medium - would need to rewrite Kanban component

---

### ADR 3: Form Handling
**Date:** 2026-03-30  
**Status:** Approved

**Context:** Need robust form validation with TypeScript for all CRUD operations.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| Controlled components | Full control | More boilerplate, unnecessary re-renders |
| Formik | Mature | Older, larger bundle size |
| **React Hook Form + Zod** | Industry standard, excellent TS | Minimal - just more code to write |

**Decision:** Use React Hook Form + Zod

**Rationale:** Industry standard combination, excellent TypeScript support, minimal bundle impact. Zod provides runtime validation that matches TypeScript types.

**Reversal Cost:** Low - can migrate incrementally

---

### ADR 4: Calendar/Scheduling
**Date:** 2026-03-30  
**Status:** Approved

**Context:** Meeting scheduling with month/week/day views.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| FullCalendar | Feature-rich | Expensive license for commercial use |
| Custom implementation | Full control | Time-consuming to build |
| react-calendar | Simple | Too basic, missing features |
| **React Big Calendar** | Free, flexible | Date handling can be tricky |

**Decision:** Use React Big Calendar

**Rationale:** Free (unlike FullCalendar), flexible with custom renderers, good React integration, actively maintained.

**Reversal Cost:** Medium - would need to rebuild meeting views

---

### ADR 5: PDF Generation
**Date:** 2026-03-30  
**Status:** Approved

**Context:** Invoice PDF generation - needs to look professional and match brand.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| html2canvas + jsPDF | Easy to start | Poor quality, blurry text |
| Server-side PDF (Puppeteer) | Perfect rendering | Adds server complexity |
| Third-party services | No dev work | Ongoing costs per PDF |
| **@react-pdf/renderer** | Generates actual PDFs, type-safe | Client-side rendering limits |

**Decision:** Use @react-pdf/renderer

**Rationale:** Generates actual vector PDFs (not images), type-safe template definitions, works client-side without server. Templates are React components we fully control.

**Reversal Cost:** Low - invoice templates are isolated components

---

### ADR 6: Charts/Analytics
**Date:** 2026-03-30  
**Status:** Approved

**Context:** Dashboard charts for project metrics, revenue, task completion rates.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| Tremor | Beautiful, React-native | Opinionated, limited customization |
| Chart.js | Popular | Older API, canvas-based |
| Custom SVG | Full control | Too much work for basic charts |
| **Recharts** | React-native feel, highly customizable | Can be complex for simple needs |

**Decision:** Use Recharts

**Rationale:** Composable, component-based like React should be, highly customizable, good defaults. Matches premium aesthetic goal with smooth animations.

**Reversal Cost:** Low - chart components are isolated

---

### ADR 7: Authentication Strategy
**Date:** 2026-03-30  
**Status:** Approved

**Context:** Need auth for internal team + client portal access.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| NextAuth.js | Flexible, popular | Need separate provider setup |
| Clerk | Excellent DX, ready-made UI | Additional service, costs at scale |
| **Supabase Auth** | Already using Supabase, unified | Less UI polish than Clerk |

**Decision:** Use Supabase Auth

**Rationale:** Already committed to Supabase, reduces number of services. Auth integrates directly with RLS for seamless security. Can build custom UI with Auth UI components.

**Reversal Cost:** Medium - would need to migrate users

---

### ADR 8: Real-time Strategy
**Date:** 2026-03-30  
**Status:** Approved

**Context:** Need live updates for Kanban board and activity feed.

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| Polling | Simple | Not truly real-time, wasteful |
| WebSocket server | Full control | Additional infrastructure |
| **Supabase Realtime** | Already using Supabase, built-in | Requires subscription management |

**Decision:** Use Supabase Realtime

**Rationale:** Built into Supabase, zero additional infrastructure, works seamlessly with database changes via Broadcast or Postgres Changes.

**Reversal Cost:** Low - can add/drop subscriptions without code changes

---

## Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         echo11Lab                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EXTERNAL INTEGRATIONS                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   SUPABASE   │  │    STRIPE    │  │    VIDEO SERVICES    │ │
│  │              │  │   (Future)   │  │    (Zoom/Meet)        │ │
│  │  • Auth      │  │              │  │                      │ │
│  │  • Database  │  │  • Payments  │  │  • Meeting links     │ │
│  │  • Realtime  │  │  • Invoicing │  │  • One-click join     │ │
│  │  • Storage   │  │              │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CORE LAYOUT COMPONENTS                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   AppShell   │  │   Sidebar    │  │       Header         │ │
│  │              │  │              │  │                      │ │
│  │  • Auth      │  │  • Nav items │  │  • Search (cmd+k)    │ │
│  │    wrapper   │  │  • Collaps   │  │  • User menu         │ │
│  │  • Providers │  │  • Icons     │  │  • Notifications    │ │
│  │  • Theme     │  │  • Active    │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FEATURE MODULES                                                │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │   DASHBOARD    │  │   PROJECTS    │  │      TASKS         │ │
│  │                │  │                │  │                    │ │
│  │  • Stats cards │  │  • List/Grid   │  │  • Kanban board    │ │
│  │  • Charts      │  │  • CRUD        │  │  • Drag & Drop     │ │
│  │  • Activity    │  │  • Detail view │  │  • Filtering       │ │
│  │  • Quick acts  │  │  • Milestones  │  │  • Assignees       │ │
│  │                │  │  • Files       │  │  • Priorities      │ │
│  └────────────────┘  └────────────────┘  └────────────────────┘ │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │   MEETINGS     │  │    INVOICES    │  │     CLIENTS        │ │
│  │                │  │                │  │                    │ │
│  │  • Calendar    │  │  • List        │  │  • Directory       │ │
│  │  • Schedule    │  │  • Create      │  │  • CRUD            │ │
│  │  • Video links │  │  • PDF export  │  │  • Portal view     │ │
│  │  • Notes       │  │  • Status      │  │  • Project assoc.  │ │
│  │  • Recurrence  │  │  • Payments    │  │                    │ │
│  └────────────────┘  └────────────────┘  └────────────────────┘ │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐                         │
│  │     TEAM       │  │    SETTINGS    │                         │
│  │                │  │                │                         │
│  │  • Members     │  │  • Profile     │                         │
│  │  • Roles       │  │  • Team config │                         │
│  │  • Invites     │  │  • Notifs      │                         │
│  │  • Permissions │  │  • Integrations│                         │
│  └────────────────┘  └────────────────┘                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SHARED UTILITIES                                               │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │     HOOKS      │  │     TYPES      │  │      UTILS         │ │
│  │                │  │                │  │                    │ │
│  │  • useAuth     │  │  • Schema defs │  │  • cn()            │ │
│  │  • useRealtime │  │  • API types   │  │  • formatters      │ │
│  │  • useProjects │  │  • Component   │  │  • validators      │ │
│  │  • useTasks    │  │    props       │  │  • calculations    │ │
│  └────────────────┘  └────────────────┘  └────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Walking Skeleton

### Phase 1: Foundation (Week 1)
**Goal:** User can log in and see dashboard shell

```
✓ Supabase project setup
  - Create new Supabase project: echo11lab
  - Enable Auth, Database, Realtime, Storage
  
✓ Next.js route structure
  - Create /lab routes
  - /lab, /lab/dashboard, /lab/projects, /lab/tasks, /lab/meetings, /lab/invoices, /lab/clients, /lab/settings
  - /lab/auth/login, /lab/auth/signup
  
✓ Basic layout
  - AppShell component
  - Sidebar navigation (static initially)
  - Header with user menu
  
✓ Authentication
  - Supabase Auth integration
  - Login page
  - Protected routes via middleware
  - User session management

DELIVERABLE: User can sign up, log in, see dashboard with sidebar
```

### Phase 2: Projects Module (Week 2)
**Goal:** Can create and view projects

```
✓ Database schema
  - projects table
  - clients table
  - User permissions via RLS
  
✓ Project CRUD
  - Project list page (grid view)
  - Project create modal
  - Project edit modal
  - Project detail page
  
✓ Client management
  - Client list
  - Client create/edit
  - Associate clients with projects

DELIVERABLE: Full project lifecycle management
```

### Phase 3: Tasks Module (Week 3)
**Goal:** Kanban board with drag-and-drop works

```
✓ Database schema
  - tasks table with status, priority, order
  - Foreign key to projects
  
✓ Kanban board
  - Columns: To Do, In Progress, Review, Done
  - @dnd-kit integration
  - Drag and drop between columns
  - Reorder within columns
  
✓ Task management
  - Create task inline/modal
  - Edit task details
  - Assign to team members
  - Set due dates
  - Set priorities (Low, Medium, High, Urgent)

DELIVERABLE: Fully functional Kanban task board
```

### Phase 4: Dashboard & Real-time (Week 4)
**Goal:** Live updates and analytics

```
✓ Dashboard components
  - Stats cards (active projects, tasks, revenue, meetings)
  - Charts (project progress, task completion, revenue trend)
  - Activity feed (recent actions across all projects)
  
✓ Real-time subscriptions
  - Supabase Realtime for tasks
  - Supabase Realtime for projects
  - Activity feed auto-updates
  
✓ Quick actions
  - Create project from dashboard
  - Create task from dashboard
  - Quick meeting scheduler

DELIVERABLE: Live-updating dashboard with analytics
```

### Phase 5: Meetings Module (Week 5)
**Goal:** Calendar and meeting management

```
✓ Database schema
  - meetings table
  - Meeting participants
  
✓ Calendar views
  - React Big Calendar integration
  - Month, Week, Day, Agenda views
  - Drag to create meetings
  
✓ Meeting management
  - Create meeting modal
  - Video link integration (Zoom/Meet)
  - Agenda and notes
  - Attendee management
  - Recurring meetings (future)

DELIVERABLE: Full meeting and calendar functionality
```

### Phase 6: Billing Module (Week 6)
**Goal:** Invoice creation and PDF generation

```
✓ Database schema
  - invoices table
  - invoice_items table
  
✓ Invoice management
  - Invoice list with filters
  - Create invoice from project
  - Add line items
  - Tax calculation
  - Status tracking (Draft, Sent, Paid, Overdue)
  
✓ PDF generation
  - @react-pdf/renderer templates
  - Professional invoice layout
  - Company branding
  - Download as PDF

DELIVERABLE: Complete invoicing system
```

### Phase 7: Client Portal (Week 7)
**Goal:** Clients can access their projects

```
✓ Role-based access
  - Roles: Admin, Member, Client
  - RLS policies for data access
  
✓ Client dashboard
  - Simplified view for clients
  - See assigned projects only
  - See their invoices
  - Meeting schedule
  
✓ Client experience
  - Separate login flow
  - Limited navigation
  - Project progress view
  - Invoice payment status

DELIVERABLE: Client portal with secure access
```

### Phase 8: Polish & Extras (Week 8)
**Goal:** Premium finishing touches

```
✓ Dark mode
  - System preference detection
  - Manual toggle
  - Smooth transitions
  
✓ Notifications
  - In-app notifications
  - Toast messages
  - Unread indicators
  
✓ UX improvements
  - Keyboard shortcuts (cmd+k search)
  - Skeleton loaders
  - Empty states
  - Error boundaries
  
✓ Mobile responsive
  - Sidebar collapses to hamburger
  - Touch-friendly interactions
  - Responsive tables and grids

DELIVERABLE: Production-ready, polished platform
```

---

## Database Schema

### Core Tables

```sql
-- Users (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'member', 'client')) default 'member',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clients (external contacts)
create table clients (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  contact_name text,
  email text not null,
  phone text,
  address text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  status text check (status in ('active', 'on_hold', 'completed', 'archived')) default 'active',
  client_id uuid references clients(id),
  budget decimal(12,2),
  start_date date,
  deadline date,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  color text default '#6366F1',
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Milestones
create table milestones (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  description text,
  due_date date,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text check (status in ('todo', 'in_progress', 'review', 'done')) default 'todo',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  assignee_id uuid references profiles(id),
  due_date date,
  sort_order integer default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Meetings
create table meetings (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  duration_minutes integer default 60,
  video_link text,
  location text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Meeting Attendees
create table meeting_attendees (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references meetings(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  unique(meeting_id, profile_id)
);

-- Invoices
create table invoices (
  id uuid default gen_random_uuid() primary key,
  invoice_number text unique not null,
  project_id uuid references projects(id),
  client_id uuid references clients(id),
  status text check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')) default 'draft',
  subtotal decimal(12,2) not null,
  tax_rate decimal(5,2) default 0,
  tax_amount decimal(12,2) default 0,
  total decimal(12,2) not null,
  due_date date,
  paid_date date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoice Items
create table invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id) on delete cascade,
  description text not null,
  quantity decimal(10,2) default 1,
  rate decimal(12,2) not null,
  amount decimal(12,2) not null,
  sort_order integer default 0
);

-- Activity Feed
create table activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Comments (on tasks)
create table comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references profiles(id),
  content text not null,
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
alter table profiles enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table meetings enable row level security;
alter table invoices enable row level security;
alter table activities enable row level security;

-- Profiles: users can read their own, admins can read all
create policy "Users read own profile" on profiles
  for select using (auth.uid() = id);

-- Clients: team members can read all, clients can read their own
create policy "Team read all clients" on clients
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- Projects: team can read all, clients can read their projects
create policy "Team read all projects" on projects
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

create policy "Clients read own projects" on projects
  for select using (
    client_id in (select id from clients where created_by = auth.uid())
  );

-- Tasks: similar pattern
create policy "Team manage tasks" on tasks
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- Invoices: sensitive - only team members
create policy "Team manage invoices" on invoices
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );
```

---

## API & Integration Points

### Server Actions (Next.js)

```typescript
// lib/actions/projects.ts
export async function createProject(formData: ProjectFormData)
export async function updateProject(id: string, formData: ProjectFormData)
export async function deleteProject(id: string)
export async function getProjects(filters?: ProjectFilters)

// lib/actions/tasks.ts
export async function createTask(formData: TaskFormData)
export async function updateTask(id: string, formData: Partial<TaskFormData>)
export async function deleteTask(id: string)
export async function updateTaskStatus(id: string, status: TaskStatus, order: number)
export async function reorderTasks(projectId: string, tasks: ReorderItem[])

// lib/actions/invoices.ts
export async function createInvoice(formData: InvoiceFormData)
export async function sendInvoice(id: string)
export async function markInvoicePaid(id: string)

// lib/actions/meetings.ts
export async function createMeeting(formData: MeetingFormData)
export async function updateMeeting(id: string, formData: MeetingFormData)
export async function deleteMeeting(id: string)
```

### Supabase Realtime Subscriptions

```typescript
// hooks/useRealtimeTasks.ts
subscribe('tasks', {
  event: '*',
  schema: 'public',
  table: 'tasks',
  filter: `project_id=eq.${projectId}`
}, (payload) => {
  // Update local state based on payload
})
```

### External Integrations

| Service | Integration | Status |
|---------|-------------|--------|
| Supabase | Auth, DB, Realtime, Storage | Required |
| Stripe | Payment processing | Future (V2) |
| Zoom | Video meeting links | Manual entry (V1), API (V2) |
| Google Meet | Video meeting links | Manual entry (V1), API (V2) |
| Resend | Email notifications | Future (V2) |
| Slack | Team notifications | Future (V2) |

---

## Risk Assessment

### High Priority Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Client data leakage** | Low | Critical | Strict RLS policies, test regularly |
| **Realtime performance** | Medium | Medium | Add debouncing, pagination |
| **PDF generation failures** | Low | Medium | Server-side fallback |

### Medium Priority Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Auth issues** | Medium | Medium | Proper error handling, session refresh |
| **Mobile UX** | Medium | Low | Test on real devices, responsive design |
| **Complex Kanban state** | Medium | Low | Thorough testing, optimistic updates |

### Low Priority Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **ShadCN updates breaking changes** | Low | Low | Pin versions, review changelog |
| **Supabase pricing at scale** | Low | Low | Monitor usage, optimize queries |

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create Supabase project
- [ ] Set up Next.js routes
- [ ] Configure Tailwind + ShadCN
- [ ] Build AppShell layout
- [ ] Implement Supabase Auth
- [ ] Create protected route middleware

### Phase 2: Projects
- [ ] Create database tables
- [ ] Set up RLS policies
- [ ] Build ProjectList component
- [ ] Create ProjectForm modal
- [ ] Build ProjectDetail page
- [ ] Implement Client CRUD

### Phase 3: Tasks
- [ ] Create tasks table
- [ ] Build KanbanBoard component
- [ ] Integrate @dnd-kit
- [ ] Implement task CRUD
- [ ] Add filtering/search
- [ ] Build task detail modal

### Phase 4: Dashboard
- [ ] Create stats components
- [ ] Build chart components
- [ ] Implement activity feed
- [ ] Set up Supabase Realtime
- [ ] Add quick actions

### Phase 5: Meetings
- [ ] Create meetings table
- [ ] Integrate React Big Calendar
- [ ] Build meeting CRUD
- [ ] Add video link field
- [ ] Implement notes feature

### Phase 6: Billing
- [ ] Create invoices table
- [ ] Build invoice CRUD
- [ ] Create PDF template
- [ ] Implement PDF download
- [ ] Add status tracking

### Phase 7: Client Portal
- [ ] Set up roles
- [ ] Create client dashboard
- [ ] Build restricted views
- [ ] Test RLS policies

### Phase 8: Polish
- [ ] Add dark mode
- [ ] Build notification system
- [ ] Add keyboard shortcuts
- [ ] Mobile responsive check
- [ ] Performance optimization

---

## Appendix

### Tech Stack Summary

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS + ShadCN UI |
| Animation | Framer Motion |
| Icons | Lucide React |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Forms | React Hook Form + Zod |
| Drag & Drop | @dnd-kit/core |
| Calendar | React Big Calendar |
| Charts | Recharts |
| PDF | @react-pdf/renderer |

### File Structure

```
src/
├── app/
│   └── lab/
│       ├── page.tsx (redirect)
│       ├── layout.tsx (dashboard layout)
│       ├── dashboard/
│       ├── projects/
│       ├── tasks/
│       ├── meetings/
│       ├── invoices/
│       ├── clients/
│       ├── settings/
│       └── auth/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ui/ (ShadCN)
│   ├── dashboard/
│   ├── projects/
│   ├── tasks/
│   │   └── KanbanBoard.tsx
│   ├── meetings/
│   ├── invoices/
│   └── clients/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── actions/
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── invoices.ts
│   │   └── meetings.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRealtime.ts
│   │   └── useProjects.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── data/
    └── seed.ts
```

### Color Palette

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary | Indigo | #6366F1 |
| Primary Dark | Indigo 600 | #4F46E5 |
| Success | Emerald | #10B981 |
| Warning | Amber | #F59E0B |
| Danger | Rose | #F43F5E |
| Background | Slate 50 | #F8FAFC |
| Surface | White | #FFFFFF |
| Text Primary | Slate 900 | #0F172A |
| Text Secondary | Slate 500 | #64748B |

---

> **Document Status:** Ready for Implementation  
> **Next Step:** Begin Phase 1 - Foundation Setup  
> **Estimated Timeline:** 8 weeks  
> **Team:** echo11
