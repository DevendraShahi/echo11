# Echo11 Lab Onboarding Guide

This document provides comprehensive documentation of all features and functions in the Echo11 Lab section. Use this as training material for new team members.

---

## Table of Contents

1. [Dashboard](#1-dashboard-labdashboard)
2. [Projects](#2-projects-labprojects)
3. [Tasks](#3-tasks-labtasks)
4. [Meetings](#4-meetings-labmeetings)
5. [Invoices](#5-invoices-labinvoices)
6. [Contracts](#6-contracts-labcontracts)
7. [Clients](#7-clients-labclients)
8. [Teams](#8-teams-labteams)
9. [Settings](#9-settings-labsettings)

---

## 1. Dashboard (/lab/dashboard)

The Dashboard is your home base - it provides an overview of all your projects, tasks, revenue, and upcoming meetings.

### Features

#### Statistics Cards
Four key metrics displayed at the top:
- **Active Projects** - Number of projects with "active" status / total projects
- **Tasks Completed** - Number of completed tasks / total tasks
- **Revenue (Monthly)** - Total invoiced amount collected this month vs. last period
- **Upcoming Meetings** - Number of meetings scheduled in the next 7 days

#### Revenue Chart
- Line chart showing revenue over the last 6 months
- Helps track financial performance trends

#### Project Status Chart
- Donut chart showing distribution of projects by status:
  - Active (blue)
  - On Hold (yellow)
  - Completed (green)
  - Archived (gray)

#### Active Projects List
- Shows 5 most recently updated active projects
- Displays: project name, client name, progress percentage, deadline
- Click to navigate to project detail

#### Overdue Tasks List
- Shows tasks that are past due and not completed
- Displays: task title, project name, due date
- Click to navigate to task detail

#### Recent Activity Feed
- Chronological list of actions taken in the system
- Shows: user name, action description, timestamp
- Actions include: created/updated projects, tasks, clients, invoices, etc.

#### Upcoming Meetings
- Shows meetings scheduled from now onward
- Displays: date, time, duration, meeting title
- Click to navigate to meeting detail

#### Quick Actions
- Buttons for common tasks:
  - New Project - Create a new project
  - New Task - Create a new task
  - New Meeting - Schedule a meeting
  - New Invoice - Create an invoice

### Data Sources
- Stats queried from: `projects`, `tasks`, `invoices`, `meetings` tables
- Activity from: `activities` table
- Date filtering: last 30 days for revenue comparison

---

## 2. Projects (/lab/projects)

Projects are the core unit of work in Echo11. Each project belongs to a client and can contain tasks, milestones, time entries, and more.

### List View Features

#### View Toggle
- **Grid View** - Card-based layout showing project cards
- **List View** - Table-based layout with more details

#### Search
- Search projects by name or description
- Real-time filtering as you type

#### Status Filters
- **All** - Every project
- **Active** - Projects currently being worked on
- **On Hold** - Projects paused temporarily
- **Completed** - Finished projects
- **Archived** - Old projects hidden from default view

#### Project Card (Grid View)
Shows:
- Project name and color indicator
- Client name
- Status badge
- Progress bar (manual or calculated from milestones)
- Deadline date
- Link to external project (if set)

#### Project Row (List View)
Shows:
- Project name
- Client
- Status
- Progress
- Budget
- Deadline

### Create New Project

Navigate to `/lab/projects/new` or click "New Project" button.

**Required Fields:**
- `Project Name` - Name of the project

**Optional Fields:**
- `Client` - Select from existing clients
- `Description` - Detailed description of the project
- `Type` - website, mobile, branding, consulting, other
- `Status` - Default: active
- `Start Date` - When the project begins
- `Deadline` - Due date
- `Budget` - Estimated budget (can be auto-calculated from expenses)
- `Progress` - Manual percentage (0-100)
- `Color` - Visual color indicator
- `Link` - External URL to project management tool

### Project Detail (/lab/projects/[id])

The project detail page shows all information about a project in one place.

#### Header Section
- Project name (editable inline)
- Client name (clickable link)
- Status badge with color
- Edit button (pencil icon)
- Delete button (trash icon) - requires confirmation

#### Progress Section
- Progress bar (0-100%)
- Calculated from milestones if any exist
- Can be manually overridden

#### Tabs/Sections

**Overview Tab:**
- Description
- Key dates (start, deadline)
- Budget info
- External link

**Milestones Tab:**
- List of milestones with weights
- Toggle completion status
- Progress auto-calculated from milestone completion
- Add/edit milestones here

**Tasks Tab:**
- All tasks for this project
- Quick status toggle
- Create new task button

**Time Entries Tab:**
- Track time spent on project
- Add time entries with description, hours, date

**Meetings Tab:**
- Meetings related to this project
- Quick add meeting button

**Invoices Tab:**
- Invoices linked to this project
- View invoice status

**Team Tab:**
- Team members working on this project
- Add/remove members

**Expenses Tab:**
- Project expenses (services, materials, etc.)
- Auto-calculated budget from expenses

### Edit Project

Navigate to `/lab/projects/[id]/edit`

All project fields are editable. Make changes and click "Save Changes".

---

## 3. Tasks (/lab/tasks)

Tasks are the actionable work items that team members complete. Tasks can be organized in a Kanban board or list view.

### Kanban Board View

The default view with 4 columns:

#### Columns
1. **To Do** - Tasks not yet started
2. **In Progress** - Tasks currently being worked on
3. **Review** - Tasks awaiting review/approval
4. **Done** - Completed tasks

#### Drag and Drop
- Drag tasks between columns to change status
- Status auto-updates in database
- Visual feedback during drag

### Task Card

Each task card shows:
- Task title
- Priority indicator (color-coded):
  - Low - Gray
  - Medium - Blue
  - High - Orange
  - Urgent - Red
- Due date (red if overdue)
- Assignee avatar
- Project name (small badge)

### Create Task

Click "New Task" button to open modal.

**Fields:**
- `Title` (required) - Task name
- `Description` - Detailed description
- `Project` - Link to project (required)
- `Priority` - low, medium, high, urgent
- `Assignee` - Team member to assign
- `Due Date` - When task is due
- `Status` - Starting column

### Task Detail (/lab/tasks/[id])

Shows:
- Full task description
- Status with toggle
- Priority
- Due date
- Assignee
- Project link
- Created/updated timestamps

### Filters

- **By Project** - Show tasks for specific project
- **By Assignee** - Show tasks assigned to specific person
- **By Priority** - Filter by priority level
- **Search** - Search by task title

### Keyboard Shortcuts
- `Esc` - Close modals
- Click outside - Close modals

---

## 4. Meetings (/lab/meetings)

Schedule and track meetings with clients and team members.

### List View

#### Date Grouping
Meetings displayed under date headers:
- Today
- Tomorrow
- This Week
- This Month
- Later
- Past

#### Meeting Card
Shows:
- Date and time
- Meeting title
- Duration (minutes)
- Project association
- Video link (if any)
- Location (if any)

### Create Meeting

Click "New Meeting" button.

**Fields:**
- `Title` (required) - Meeting name
- `Project` - Associated project (optional)
- `Date & Time` - When the meeting occurs
- `Duration` - Length in minutes (default: 30)
- `Video Link` - Zoom/Google Meet/etc. URL
- `Location` - Physical location (optional)
- `Description` - Agenda or notes

### Meeting Detail (/lab/meetings/[id])

Shows all meeting information with:
- Join Video Call button (if link provided)
- Edit button
- Delete button

### Filters

- **View:** Upcoming / Past / All
- **Project:** Filter by associated project
- **Search:** By meeting title

---

## 5. Invoices (/lab/invoices)

Create and manage invoices for clients. Track payment status and export PDFs.

### List View

#### Stats Cards
- **Total Revenue** - All paid invoices sum
- **Paid** - Number of paid invoices
- **Pending** - Sent but unpaid
- **Overdue** - Past due date, not paid

#### Invoice Table
Shows:
- Invoice number
- Client name
- Project (if linked)
- Amount
- Status badge
- Due date
- Actions (view, download PDF)

#### Status Filters
- All
- Draft
- Sent
- Paid
- Overdue
- Cancelled

### Create Invoice

Navigate to `/lab/invoices/new` or click "New Invoice".

**Fields:**
- `Client` (required) - Select from clients
- `Project` - Optional, select from client's projects
- `Invoice Number` - Auto-generated or custom
- `Due Date` - Payment deadline
- `Status` - Draft, Sent, Paid

**Line Items:**
- Description
- Quantity
- Rate (hourly or flat)
- Amount (calculated: qty × rate)

Add multiple line items as needed.

### Invoice Detail (/lab/invoices/[id])

Shows:
- Invoice header with number and status
- Client information
- Line items table
- Subtotal, taxes (if any), total
- Notes/terms
- Action buttons:
  - Edit
  - Mark as Sent
  - Mark as Paid
  - Download PDF
  - Delete (with confirmation)

### PDF Export
Generate professional PDF invoices using `@react-pdf/renderer`.

### Status Workflow

```
Draft → Sent → Paid
              ↘ Overdue (if past due date)
                 ↘ Cancelled
```

---

## 6. Contracts (/lab/contracts)

Manage client contracts and legal agreements. Upload and track contract status.

### List View

#### Stats Row
- Total contracts
- Signed contracts
- Pending signature
- Total contract value

#### Contract Table
Shows:
- Contract number
- Title
- Client
- Value (amount)
- Status
- Start/End dates
- Actions (view, download, delete)

### Status Options

- **Draft** - Not yet sent to client
- **Pending** - Sent, awaiting signature
- **Signed** - Fully executed contract
- **Expired** - Past end date
- **Terminated** - Ended early

### Create Contract

Click "New Contract" button.

**Fields:**
- `Title` (required) - Contract name
- `Contract Number` - Unique identifier
- `Client` (required) - Select client
- `Value` - Contract monetary value
- `Status` - Starting status
- `Start Date` - When contract begins
- `End Date` - When contract expires
- `File` - Upload contract document (PDF, DOC, etc.)

### Contract Detail (/lab/contracts/[id])

Shows:
- Contract information
- Status with change option
- Download file button
- Edit/Delete options

### Search & Filter

- Search by title, number, or client
- Filter by status

---

## 7. Clients (/lab/clients)

Manage client companies and their contact information. Track client lifecycle status and revenue.

### List View

#### Stats Cards
- **Total** - All clients
- **Active** - Clients with active projects
- **At Risk** - Clients flagged as at risk
- **Revenue** - Total revenue from client invoices
- **Pending** - Outstanding invoice amount

#### Client Card (Grid View)
Shows:
- Company name
- Contact name and email
- Lifecycle status badge:
  - Lead - New potential client
  - Prospect - In discussion
  - Active - Current client
  - At Risk - May leave
  - Inactive - Former client
- Portal access indicator
- Industry
- Tags

#### Search & Filters
- Search by company name or contact
- Filter by status (lead, prospect, active, at_risk, inactive)
- Filter by portal access (has portal / no portal)
- Filter by industry
- Sort by: Recent, Name, Revenue, Projects count

### Create Client

Click "Add Client" button.

**Fields:**
- `Company Name` (required)
- `Contact Name` - Primary contact
- `Email` - Contact email
- `Phone` - Phone number
- `Website` - Company website
- `Industry` - Business industry
- `Source` - How client was acquired (referral, cold outreach, etc.)
- `Tags` - Custom tags for categorization
- `Address` - Full address
- `Default Hourly Rate` - For time tracking
- `Notes` - Additional notes
- `Send Invitation` - Checkbox to invite to portal

### Invite to Portal
If client doesn't have portal access, you can invite them:
- Creates auth account
- Sends invitation email
- Client can log in to view their projects/invoices

### Client Detail (/lab/clients/[id])

Multiple tabs:

**Overview:**
- Company information
- Contact details
- Address
- Website, industry, source
- Tags
- Notes

**Contacts:**
- Additional contacts beyond primary
- Add/edit/delete contacts
- Role assignment (decision maker, stakeholder, technical, billing)

**Projects:**
- All projects for this client
- Project status overview

**Invoices:**
- All invoices for client
- Payment status summary

**Documents:**
- Files shared with client
- Upload new files

**Activity:**
- Timeline of actions related to client

### Lifecycle Status

Update client status to track their journey:
- Lead → Prospect → Active → At Risk / Inactive

---

## 8. Teams (/lab/teams)

Organize team members into teams for better collaboration and access control.

### Team Access Control

- **Admin** - Sees all teams, can manage everything
- **Team Lead** - Sees own team only, manages team members and projects
- **Team Member** - Sees own team only
- **No Team** - Sees only own assigned tasks/clients

### List View

#### Team Card
Shows:
- Team name
- Color indicator
- Lead name
- Member count
- Project count

### Create Team (Admin Only)

Click "New Team" button.

**Fields:**
- `Name` (required) - Team name
- `Description` - What the team does
- `Color` - Visual color for the team
- `Lead` - Select team lead from members

### Team Detail (/lab/teams/[id])

**Members Section:**
- List of team members
- Add/remove members
- Assign/change team lead

**Projects Section:**
- Projects assigned to this team
- Add/remove projects from team

### Assign to Team (Admin)

Via Settings page:
- Select user
- Choose team from dropdown
- Remove from team option

---

## 9. Settings (/lab/settings)

Manage your profile, preferences, and (for admins) team members.

### Profile Section

- **Avatar** - Profile picture URL
- **Full Name** - Display name
- **Email** - Read-only (from auth)
- **Role** - admin, member, client
- **Team** - Which team you belong to

Edit and save changes.

### Notification Preferences

Toggle switches for:
- **Email Notifications** - General email updates
- **Task Reminders** - Reminders for due tasks
- **Meeting Reminders** - Reminders before meetings

### Appearance

- **Theme** options: Dark, Light, System
- Dark mode is default

### Security

- **Change Password** - Update your auth password

### Team Management (Admin Only)

#### Member List
- Shows all team members
- Display: name, email, role, team
- Edit role dropdown
- Remove from team

#### Invite Members
- Enter email address
- Select role (admin, member)
- Send invitation
- Cancel pending invitations

### Team Assignment (Admin Only)
- Assign users to teams
- Remove users from teams
- Set team lead

---

## Quick Reference

### Navigation

| Page | Path | Icon |
|------|------|------|
| Dashboard | /lab/dashboard | LayoutDashboard |
| Projects | /lab/projects | FolderKanban |
| Tasks | /lab/tasks | CheckSquare |
| Meetings | /lab/meetings | Calendar |
| Invoices | /lab/invoices | Receipt |
| Contracts | /lab/contracts | FileText |
| Clients | /lab/clients | UserCircle |
| Teams | /lab/teams | Users |
| Settings | /lab/settings | Settings |

### Status Values

**Project Status:**
- active, on_hold, completed, archived

**Task Status:**
- todo, in_progress, review, done

**Task Priority:**
- low, medium, high, urgent

**Invoice Status:**
- draft, sent, paid, overdue, cancelled

**Contract Status:**
- draft, pending, signed, expired, terminated

**Client Status:**
- lead, prospect, active, at_risk, inactive

### Common Actions

- **Create:** Click "+" or "New [Item]" button
- **Edit:** Click item to open detail, then edit button
- **Delete:** Click delete icon, confirm in modal
- **Search:** Use search input at top of lists
- **Filter:** Use filter tabs/dropdowns

---

## Tips for New Team Members

1. **Start with Dashboard** - Get familiar with overall project health
2. **Add Your Profile** - Update your name and preferences in Settings
3. **Explore Projects** - See how existing projects are structured
4. **Try Creating** - Create a test task or project to understand the flow
5. **Check Teams** - Make sure you're assigned to the correct team
6. **Review Clients** - Understand your client portfolio

---

*Last Updated: April 2026*
*For questions, contact your team lead or admin*
