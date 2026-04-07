import { TourStep } from './TooltipTour'

export const dashboardTourSteps: TourStep[] = [
  {
    target: '[data-tour="stats-cards"]',
    title: 'Key Metrics',
    content: 'These four cards show your most important numbers at a glance: active projects, completed tasks, monthly revenue, and upcoming meetings.',
    position: 'top',
  },
  {
    target: '[data-tour="quick-actions"]',
    title: 'Quick Actions',
    content: 'Create new projects, tasks, meetings, or invoices directly from these shortcut buttons. Saves you time!',
    position: 'bottom',
  },
  {
    target: '[data-tour="revenue-chart"]',
    title: 'Revenue Trends',
    content: 'This chart shows your revenue over the last 6 months. Compare month-to-month to track your financial performance.',
    position: 'top',
  },
  {
    target: '[data-tour="project-status"]',
    title: 'Project Distribution',
    content: 'See how your projects are distributed across statuses: active, on hold, completed, and archived.',
    position: 'top',
  },
  {
    target: '[data-tour="active-projects"]',
    title: 'Active Projects',
    content: 'Your 5 most recently updated active projects. Click any project to view its details and progress.',
    position: 'top',
  },
  {
    target: '[data-tour="overdue-tasks"]',
    title: 'Overdue Tasks',
    content: 'Tasks past their due date that need attention. Check this regularly to stay on top of deliverables.',
    position: 'top',
  },
  {
    target: '[data-tour="recent-activity"]',
    title: 'Activity Feed',
    content: 'See what everyone on the team has been working on. Shows recent actions with timestamps.',
    position: 'top',
  },
  {
    target: '[data-tour="upcoming-meetings"]',
    title: 'Upcoming Meetings',
    content: 'Your scheduled meetings for the coming days. Includes date, time, duration, and project association.',
    position: 'top',
  },
]

export const projectsTourSteps: TourStep[] = [
  {
    target: '[data-tour="new-project"]',
    title: 'Create Project',
    content: 'Click here to create a new project. You\'ll need a project name, and can optionally add a client, description, dates, and budget.',
    position: 'bottom',
  },
  {
    target: '[data-tour="view-toggle"]',
    title: 'View Modes',
    content: 'Switch between Grid View (cards) and List View (table) depending on how you like to browse projects.',
    position: 'bottom',
  },
  {
    target: '[data-tour="project-filters"]',
    title: 'Filter Projects',
    content: 'Filter by status: All, Active, On Hold, Completed, or Archived. Use this to focus on specific project types.',
    position: 'bottom',
  },
  {
    target: '[data-tour="project-search"]',
    title: 'Search',
    content: 'Search projects by name or description. Results update as you type.',
    position: 'bottom',
  },
]

export const tasksTourSteps: TourStep[] = [
  {
    target: '[data-tour="new-task"]',
    title: 'Create Task',
    content: 'Click to create a new task. Required: title and project. Optional: description, priority, assignee, due date.',
    position: 'bottom',
  },
  {
    target: '[data-tour="kanban-columns"]',
    title: 'Kanban Board',
    content: 'Four columns organize your workflow: To Do, In Progress, Review, and Done. Drag tasks between columns to update status.',
    position: 'top',
  },
  {
    target: '[data-tour="task-card"]',
    title: 'Task Card',
    content: 'Each card shows: title, priority (color-coded), due date, assignee, and project. Red = overdue or urgent.',
    position: 'right',
  },
  {
    target: '[data-tour="task-filters"]',
    title: 'Filters',
    content: 'Filter tasks by project, assignee, or priority. Combine filters for focused views.',
    position: 'bottom',
  },
]

export const meetingsTourSteps: TourStep[] = [
  {
    target: '[data-tour="new-meeting"]',
    title: 'Schedule Meeting',
    content: 'Create a new meeting. Add a video link (Zoom, Meet) for quick access, and associate it with a project.',
    position: 'bottom',
  },
  {
    target: '[data-tour="meeting-filters"]',
    title: 'View Filters',
    content: 'Switch between Upcoming, Past, or All meetings. Filter by project to see related meetings.',
    position: 'bottom',
  },
  {
    target: '[data-tour="meeting-card"]',
    title: 'Meeting Card',
    content: 'Shows date, time, duration, title, and any video link. Click Join to jump to the video call.',
    position: 'right',
  },
]

export const invoicesTourSteps: TourStep[] = [
  {
    target: '[data-tour="new-invoice"]',
    title: 'Create Invoice',
    content: 'Create invoices for clients. Add line items with quantity and rate. Generate PDFs to send to clients.',
    position: 'bottom',
  },
  {
    target: '[data-tour="invoice-filters"]',
    title: 'Status Filters',
    content: 'Filter by status: Draft, Sent, Paid, Overdue, or Cancelled. Quick view of your financial status.',
    position: 'bottom',
  },
  {
    target: '[data-tour="invoice-stats"]',
    title: 'Revenue Stats',
    content: 'Track total revenue, paid invoices, pending payments, and overdue amounts at a glance.',
    position: 'top',
  },
  {
    target: '[data-tour="invoice-download"]',
    title: 'Download PDF',
    content: 'Click the download icon to generate a professional PDF invoice to send to clients.',
    position: 'left',
  },
]

export const contractsTourSteps: TourStep[] = [
  {
    target: '[data-tour="new-contract"]',
    title: 'Create Contract',
    content: 'Create new contracts with clients. Upload documents, set dates and values, track signing status.',
    position: 'bottom',
  },
  {
    target: '[data-tour="contract-filters"]',
    title: 'Status Filters',
    content: 'Filter by status: Draft, Pending, Signed, Expired, or Terminated.',
    position: 'bottom',
  },
]

export const clientsTourSteps: TourStep[] = [
  {
    target: '[data-tour="add-client"]',
    title: 'Add Client',
    content: 'Add new client companies. Include contact info, industry, source, and optionally send them a portal invitation.',
    position: 'bottom',
  },
  {
    target: '[data-tour="client-filters"]',
    title: 'Client Filters',
    content: 'Filter by lifecycle status: Lead, Prospect, Active, At Risk, Inactive. Or filter by portal access.',
    position: 'bottom',
  },
  {
    target: '[data-tour="client-stats"]',
    title: 'Client Stats',
    content: 'See total clients, active count, at-risk clients, total revenue, and pending amounts.',
    position: 'top',
  },
  {
    target: '[data-tour="client-search"]',
    title: 'Search',
    content: 'Search clients by company name or contact. Results update as you type.',
    position: 'bottom',
  },
]

export const teamsTourSteps: TourStep[] = [
  {
    target: '[data-tour="new-team"]',
    title: 'Create Team',
    content: 'Create new teams (admin only). Assign a lead and optional color for visual identification.',
    position: 'bottom',
  },
  {
    target: '[data-tour="team-card"]',
    title: 'Team Card',
    content: 'Shows team name, lead, member count, and project count. Click to manage members and projects.',
    position: 'right',
  },
]

export const settingsTourSteps: TourStep[] = [
  {
    target: '[data-tour="profile-section"]',
    title: 'Your Profile',
    content: 'Update your name and avatar. Your email is read-only from authentication.',
    position: 'right',
  },
  {
    target: '[data-tour="notifications-section"]',
    title: 'Notifications',
    content: 'Control email notifications, task reminders, and meeting reminders with toggle switches.',
    position: 'right',
  },
  {
    target: '[data-tour="appearance-section"]',
    title: 'Theme',
    content: 'Choose your preferred theme: Dark (default), Light, or System (follows your device).',
    position: 'right',
  },
  {
    target: '[data-tour="security-section"]',
    title: 'Security',
    content: 'Change your password from the Security section. Keep your account secure!',
    position: 'right',
  },
  {
    target: '[data-tour="admin-section"]',
    title: 'Admin Features',
    content: 'If you\'re an admin: invite team members, assign users to teams, and update roles here.',
    position: 'right',
  },
]

export const pageTours: Record<string, TourStep[]> = {
  dashboard: dashboardTourSteps,
  projects: projectsTourSteps,
  tasks: tasksTourSteps,
  meetings: meetingsTourSteps,
  invoices: invoicesTourSteps,
  contracts: contractsTourSteps,
  clients: clientsTourSteps,
  teams: teamsTourSteps,
  settings: settingsTourSteps,
}
