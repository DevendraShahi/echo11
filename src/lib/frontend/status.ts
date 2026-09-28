import type { LucideIcon } from 'lucide-react'
import {
  Circle,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Send,
  DollarSign,
  Ban,
  Users,
  FolderKanban,
  CheckSquare,
  Calendar,
  Receipt,
  FileSignature,
  MessageSquare,
  Shield,
} from 'lucide-react'

export type StatusConfig = {
  label: string
  color: string
  bg: string
  border: string
  icon: LucideIcon
}

export const taskStatusConfig: Record<string, StatusConfig> = {
  todo: {
    label: 'To Do',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    icon: Circle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  review: {
    label: 'Review',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    icon: AlertCircle,
  },
  done: {
    label: 'Done',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
}

export const taskPriorityConfig: Record<string, StatusConfig> = {
  low: {
    label: 'Low',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    icon: Circle,
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: AlertCircle,
  },
  high: {
    label: 'High',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertTriangle,
  },
  urgent: {
    label: 'Urgent',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: XCircle,
  },
}

export const projectStatusConfig: Record<string, StatusConfig> = {
  active: {
    label: 'Active',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
    icon: FolderKanban,
  },
  on_hold: {
    label: 'On Hold',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  archived: {
    label: 'Archived',
    color: 'text-white/40',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: FileText,
  },
}

export const invoiceStatusConfig: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    icon: FileText,
  },
  sent: {
    label: 'Sent',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: Send,
  },
  paid: {
    label: 'Paid',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: DollarSign,
  },
  overdue: {
    label: 'Overdue',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: AlertTriangle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-white/40',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: Ban,
  },
}

export const contractStatusConfig: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'text-white/40',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: FileText,
  },
  pending: {
    label: 'Pending',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  signed: {
    label: 'Signed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  expired: {
    label: 'Expired',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: AlertTriangle,
  },
  terminated: {
    label: 'Terminated',
    color: 'text-white/30',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: Ban,
  },
}

export const clientStatusConfig: Record<string, StatusConfig> = {
  lead: {
    label: 'Lead',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: Users,
  },
  prospect: {
    label: 'Prospect',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    icon: Users,
  },
  active: {
    label: 'Active',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  at_risk: {
    label: 'At Risk',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: AlertTriangle,
  },
  inactive: {
    label: 'Inactive',
    color: 'text-white/40',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: Ban,
  },
}

export const meetingStatusConfig: Record<string, StatusConfig> = {
  scheduled: {
    label: 'Scheduled',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
    icon: Calendar,
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-white/40',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: Ban,
  },
}

export const healthStatusConfig: Record<string, StatusConfig> = {
  healthy: {
    label: 'Healthy',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  at_risk: {
    label: 'At Risk',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Critical',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: XCircle,
  },
}

export const riskLevelConfig: Record<string, StatusConfig> = {
  low: {
    label: 'Low Risk',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: Shield,
  },
  medium: {
    label: 'Medium Risk',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertCircle,
  },
  high: {
    label: 'High Risk',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Critical',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: XCircle,
  },
}

export const systemHealthConfig: Record<string, StatusConfig> = {
  healthy: {
    label: 'Healthy',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  delayed: {
    label: 'Delayed',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  degraded: {
    label: 'Degraded',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: AlertTriangle,
  },
  action_required: {
    label: 'Action Required',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: XCircle,
  },
}

export const capacityConfig: Record<string, StatusConfig> = {
  normal: {
    label: 'Normal',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  high: {
    label: 'High',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertCircle,
  },
  overloaded: {
    label: 'Overloaded',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: AlertTriangle,
  },
  blocked: {
    label: 'Blocked',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: XCircle,
  },
}

export const entityTypeConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  project: { label: 'Project', icon: FolderKanban, color: 'text-purple-400' },
  task: { label: 'Task', icon: CheckSquare, color: 'text-amber-400' },
  client: { label: 'Client', icon: Users, color: 'text-blue-400' },
  invoice: { label: 'Invoice', icon: Receipt, color: 'text-cyan-400' },
  contract: { label: 'Contract', icon: FileSignature, color: 'text-rose-400' },
  meeting: { label: 'Meeting', icon: Calendar, color: 'text-emerald-400' },
  message: { label: 'Message', icon: MessageSquare, color: 'text-indigo-400' },
  system: { label: 'System', icon: AlertCircle, color: 'text-white/40' },
}

export function getStatusConfig(status: string, entityType: string): StatusConfig {
  const configs: Record<string, Record<string, StatusConfig>> = {
    task: taskStatusConfig,
    taskPriority: taskPriorityConfig,
    project: projectStatusConfig,
    invoice: invoiceStatusConfig,
    contract: contractStatusConfig,
    client: clientStatusConfig,
    meeting: meetingStatusConfig,
    health: healthStatusConfig,
    risk: riskLevelConfig,
    systemHealth: systemHealthConfig,
    capacity: capacityConfig,
  }

  return configs[entityType]?.[status] ?? {
    label: status,
    color: 'text-white/40',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: Circle,
  }
}
