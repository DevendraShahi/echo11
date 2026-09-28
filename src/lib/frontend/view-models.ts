import type { LabPermissions } from './permissions'

export type ActionItem = {
  id: string
  title: string
  reason: string
  entityType: 'task' | 'invoice' | 'contract' | 'client' | 'message' | 'system'
  entityId: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  dueDate?: string
  actionLabel: string
  actionHref: string
}

export type BusinessMetrics = {
  activeProjects: number
  openTasks: number
  pendingInvoices: number
  revenueThisMonth: number
  atRiskClients: number
}

export type ProjectHealth = {
  status: 'healthy' | 'at_risk' | 'critical'
  reasons: string[]
}

export type ProjectHealthSummary = {
  projectId: string
  name: string
  clientName: string
  health: ProjectHealth
  progress: number
  dueDate?: string
}

export type ClientRiskSignal = {
  type: 'overdue_invoices' | 'stale_activity' | 'open_blockers' | 'contract_expiring' | 'unanswered_messages' | 'inactive_invite'
  count?: number
  days?: number
  detail?: string
}

export type ClientRiskScore = {
  score: number
  signals: ClientRiskSignal[]
  level: 'low' | 'medium' | 'high' | 'critical'
}

export type ClientRiskSummary = {
  clientId: string
  name: string
  risk: ClientRiskScore
  lastActivity?: string
}

export type TeamWorkloadSummary = {
  memberId: string
  name: string
  role: string
  openTasks: number
  overdueTasks: number
  inProgress: number
  blocked: number
  assignedProjects: number
  capacity: 'normal' | 'high' | 'overloaded' | 'blocked'
}

export type ActivityItem = {
  id: string
  action: string
  entityType: string
  entityId: string
  actorName: string
  actorAvatar?: string
  occurredAt: string
}

export type SystemHealthStatus = {
  status: 'healthy' | 'delayed' | 'degraded' | 'action_required'
  outbox: {
    pendingCount: number
    failedCount: number
    oldestPendingAge: number
  }
  projections: {
    teamWorkload: { fresh: boolean; lastUpdated?: string }
    activity: { fresh: boolean; lastUpdated?: string }
    unreadCounts: { fresh: boolean; lastUpdated?: string }
  }
}

export type ProjectSummary = {
  id: string
  name: string
  status: string
  type: string
  budget: number
  startDate?: string
  deadline?: string
  progress: number
  color: string
  clientId: string
  teamId?: string
}

export type ClientSummary = {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  website?: string
  industry?: string
  status: string
}

export type TeamSummary = {
  id: string
  name: string
  description?: string
  color?: string
  leadId?: string
  leadName?: string
  memberCount: number
}

export type TaskSummary = {
  id: string
  title: string
  status: string
  priority: string
  assigneeName?: string
  dueDate?: string
  projectId: string
}

export type InvoiceSummary = {
  id: string
  invoiceNumber: string
  status: string
  total: number
  dueDate?: string
  paidDate?: string
  clientId: string
  projectName?: string
}

export type ContractSummary = {
  id: string
  title: string
  contractNumber?: string
  status: string
  value?: number
  startDate?: string
  endDate?: string
  clientId: string
}

export type MessageSummary = {
  id: string
  content: string
  senderName: string
  createdAt: string
  clientId: string
  replied: boolean
}

export type DocumentSummary = {
  id: string
  name: string
  fileType: string
  category: string
  createdAt: string
}

export type NoteSummary = {
  id: string
  content: string
  createdByName: string
  createdAt: string
}

export type ProjectStats = {
  totalTasks: number
  completedTasks: number
  taskProgress: number
  totalMilestones: number
  completedMilestones: number
  totalInvoices: number
  paidRevenue: number
  pendingRevenue: number
}

export type ProjectFinancialSummary = {
  budget: number
  expenses: number
  paidRevenue: number
  pendingRevenue: number
  profitability: number
}

export type RevenueSummary = {
  thisMonth: number
  lastMonth: number
  trend: number
  pending: number
  overdue: number
  total: number
}

export type InvoiceAgingBucket = {
  label: string
  count: number
  amount: number
}

export type ExpenseSummary = {
  id: string
  projectId: string
  projectName: string
  amount: number
  serviceId: string
  serviceName: string
  createdAt: string
}

export type ClientBalanceSummary = {
  clientId: string
  clientName: string
  outstanding: number
  overdue: number
  paid: number
}

export type MemberSummary = {
  id: string
  fullName: string
  email: string
  role: string
  teamId?: string
  teamName?: string
  jobTitle?: string
}

export type InviteSummary = {
  id: string
  email: string
  role: string
  jobTitle?: string
  createdAt: string
}

export type WorkloadSummary = {
  memberId: string
  memberName: string
  role: string
  teamName?: string
  openTasks: number
  overdueTasks: number
  inProgress: number
  blocked: number
  assignedProjects: number
  capacity: 'normal' | 'high' | 'overloaded' | 'blocked'
}

export type PortalStatus = {
  invited: boolean
  accepted: boolean
  lastLogin?: string
}

export type CommandCenterViewModel = {
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

export type ProjectDetailViewModel = {
  project: ProjectSummary
  client: ClientSummary | null
  team: TeamSummary | null
  stats: ProjectStats
  health: ProjectHealth
  tasks: TaskSummary[]
  financials: ProjectFinancialSummary
  activity: ActivityItem[]
  permissions: LabPermissions['project']
}

export type ClientDetailViewModel = {
  client: ClientSummary
  contacts: { id: string; name: string; email: string; phone?: string; role: string; isPrimary: boolean }[]
  projects: ProjectSummary[]
  invoices: InvoiceSummary[]
  contracts: ContractSummary[]
  messages: MessageSummary[]
  documents: DocumentSummary[]
  notes: NoteSummary[]
  risk: ClientRiskScore
  portal: PortalStatus
  activity: ActivityItem[]
  permissions: LabPermissions['client']
}

export type FinanceViewModel = {
  revenue: RevenueSummary
  invoices: InvoiceSummary[]
  aging: InvoiceAgingBucket[]
  expenses: ExpenseSummary[]
  clientBalances: ClientBalanceSummary[]
  permissions: LabPermissions['finance']
}

export type PeopleViewModel = {
  teams: TeamSummary[]
  members: MemberSummary[]
  invites: InviteSummary[]
  workload: WorkloadSummary[]
  permissions: LabPermissions['team']
}
