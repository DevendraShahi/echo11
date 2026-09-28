'use server'

import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'
import type {
  ActionItem,
  BusinessMetrics,
  ProjectHealthSummary,
  ClientRiskSummary,
  TeamWorkloadSummary,
  ActivityItem,
  SystemHealthStatus,
} from '@/lib/frontend/view-models'
import type { LabPermissions } from '@/lib/frontend/permissions'

interface CommandCenterData {
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

async function getUserInfo() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { name: 'User', role: 'member', isAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, team_id, organization_id')
    .eq('id', user.id)
    .maybeSingle()

  return {
    name: profile?.full_name || user.email?.split('@')[0] || 'User',
    role: profile?.role || 'member',
    isAdmin: profile?.role === 'admin',
    teamId: profile?.team_id || null,
    organizationId: profile?.organization_id || null,
  }
}

async function getActionQueue(): Promise<ActionItem[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const actions: ActionItem[] = []

  const [overdueTasks, overdueInvoices, expiringContracts] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, due_date, priority, project:projects(name)')
      .lt('due_date', now)
      .neq('status', 'done')
      .order('due_date', { ascending: true })
      .limit(10),
    supabase
      .from('invoices')
      .select('id, invoice_number, due_date, total, status')
      .in('status', ['sent', 'overdue'])
      .lt('due_date', now)
      .order('due_date', { ascending: true })
      .limit(10),
    supabase
      .from('contracts')
      .select('id, title, end_date, status')
      .eq('status', 'signed')
      .order('end_date', { ascending: true })
      .limit(10),
  ])

  for (const task of overdueTasks.data || []) {
    const priority = task.priority === 'urgent' ? 'urgent' : task.priority === 'high' ? 'high' : 'medium'
    actions.push({
      id: `task-${task.id}`,
      title: task.title,
      reason: `Overdue${task.project && Array.isArray(task.project) && task.project.length > 0 ? ` in ${task.project[0].name}` : ''}`,
      entityType: 'task',
      entityId: task.id,
      priority: priority as ActionItem['priority'],
      dueDate: task.due_date ? format(new Date(task.due_date), 'MMM d') : undefined,
      actionLabel: 'Review',
      actionHref: `/lab/tasks/${task.id}`,
    })
  }

  for (const invoice of overdueInvoices.data || []) {
    actions.push({
      id: `invoice-${invoice.id}`,
      title: `Invoice ${invoice.invoice_number}`,
      reason: `$${(invoice.total || 0).toLocaleString()} ${invoice.status === 'overdue' ? 'overdue' : 'due today'}`,
      entityType: 'invoice',
      entityId: invoice.id,
      priority: 'high',
      dueDate: invoice.due_date ? format(new Date(invoice.due_date), 'MMM d') : undefined,
      actionLabel: 'Send',
      actionHref: `/lab/invoices/${invoice.id}`,
    })
  }

  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  for (const contract of expiringContracts.data || []) {
    if (contract.end_date && new Date(contract.end_date) <= thirtyDaysFromNow) {
      actions.push({
        id: `contract-${contract.id}`,
        title: contract.title,
        reason: `Expires ${format(new Date(contract.end_date), 'MMM d, yyyy')}`,
        entityType: 'contract',
        entityId: contract.id,
        priority: 'medium',
        dueDate: format(new Date(contract.end_date), 'MMM d'),
        actionLabel: 'Review',
        actionHref: `/lab/contracts/${contract.id}`,
      })
    }
  }

  return actions.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  }).slice(0, 15)
}

async function getBusinessMetrics(): Promise<BusinessMetrics> {
  const supabase = await createClient()
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30).toISOString()

  const [projectsResult, tasksResult, invoicesResult] = await Promise.all([
    supabase.from('projects').select('id, status'),
    supabase.from('tasks').select('id, status, due_date'),
    supabase.from('invoices').select('id, status, total, created_at').gte('created_at', thirtyDaysAgo),
    supabase.from('clients').select('id, status'),
  ])

  const activeProjects = projectsResult.data?.filter(p => p.status === 'active').length || 0
  const openTasks = tasksResult.data?.filter(t => t.status !== 'done').length || 0
  const pendingInvoices = invoicesResult.data?.filter(i => i.status === 'sent' || i.status === 'draft').length || 0
  const revenueThisMonth = invoicesResult.data?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0) || 0
  const atRiskClients = 0

  return {
    activeProjects,
    openTasks,
    pendingInvoices,
    revenueThisMonth,
    atRiskClients,
  }
}

async function getProjectHealth(): Promise<ProjectHealthSummary[]> {
  const supabase = await createClient()
  const now = new Date()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, status, deadline, client:clients(company_name), tasks(id, status, due_date, priority)')
    .eq('status', 'active')
    .limit(10)

  if (!projects || projects.length === 0) return []

  return projects.map(project => {
    const tasks = project.tasks || []
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done').length
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length

    let status: ProjectHealthSummary['health']['status'] = 'healthy'
    const reasons: string[] = []

    if (urgentTasks > 0) {
      status = 'critical'
      reasons.push(`${urgentTasks} urgent task${urgentTasks > 1 ? 's' : ''}`)
    } else if (overdueTasks > 2) {
      status = 'critical'
      reasons.push(`${overdueTasks} overdue tasks`)
    } else if (overdueTasks > 0) {
      status = 'at_risk'
      reasons.push(`${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`)
    } else if (progress < 30 && project.deadline && new Date(project.deadline) < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      status = 'at_risk'
      reasons.push('Deadline approaching with low progress')
    }

    return {
      projectId: project.id,
      name: project.name,
      clientName: (project.client as { company_name?: string })?.company_name || 'Unknown',
      health: { status, reasons },
      progress,
      dueDate: project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : undefined,
    }
  })
}

async function getClientRisk(): Promise<ClientRiskSummary[]> {
  const supabase = await createClient()
  const now = new Date()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name, status')
    .limit(20)

  if (!clients || clients.length === 0) return []

  const clientIds = clients.map(c => c.id)

  const [invoices, projects, messages] = await Promise.all([
    supabase.from('invoices').select('id, client_id, status, due_date').in('client_id', clientIds),
    supabase.from('projects').select('id, client_id, status, tasks(id, status, priority, due_date)').in('client_id', clientIds),
    supabase.from('client_messages').select('id, client_id, created_at, replied').in('client_id', clientIds).order('created_at', { ascending: false }).limit(50),
  ])

  return clients.map(client => {
    const clientInvoices = invoices.data?.filter(i => i.client_id === client.id) || []
    const clientProjects = projects.data?.filter(p => p.client_id === client.id) || []
    const clientMessages = messages.data?.filter(m => m.client_id === client.id) || []

    const signals: ClientRiskSummary['risk']['signals'] = []

    const overdueInvoices = clientInvoices.filter(i => i.status === 'overdue' || (i.status === 'sent' && i.due_date && new Date(i.due_date) < now))
    if (overdueInvoices.length > 0) {
      signals.push({ type: 'overdue_invoices', count: overdueInvoices.length })
    }

    const allTasks = clientProjects.flatMap(p => p.tasks || [])
    const blockedTasks = allTasks.filter(t => t.priority === 'urgent' && t.status !== 'done')
    if (blockedTasks.length > 0) {
      signals.push({ type: 'open_blockers', count: blockedTasks.length })
    }

    const unansweredMessages = clientMessages.filter(m => !m.replied)
    if (unansweredMessages.length > 0) {
      signals.push({ type: 'unanswered_messages', count: unansweredMessages.length })
    }

    const score = signals.reduce((sum, s) => {
      if (s.type === 'overdue_invoices') return sum + (s.count || 0) * 3
      if (s.type === 'open_blockers') return sum + (s.count || 0) * 2
      if (s.type === 'unanswered_messages') return sum + (s.count || 0) * 1
      return sum
    }, 0)

    let level: ClientRiskSummary['risk']['level'] = 'low'
    if (score >= 10) level = 'critical'
    else if (score >= 5) level = 'high'
    else if (score >= 2) level = 'medium'

    return {
      clientId: client.id,
      name: client.company_name,
      risk: { score, signals, level },
    }
  }).filter(c => c.risk.score > 0)
}

async function getTeamWorkload(): Promise<TeamWorkloadSummary[]> {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, team_id')
    .not('role', 'eq', 'client')
    .limit(20)

  if (!profiles || profiles.length === 0) return []

  const userIds = profiles.map(p => p.id)

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status, due_date, priority, assigned_to')
    .in('assigned_to', userIds)

  const now = new Date()

  return profiles.map(profile => {
    const userTasks = tasks?.filter(t => t.assigned_to === profile.id) || []
    const openTasks = userTasks.filter(t => t.status !== 'done').length
    const overdueTasks = userTasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done').length
    const inProgress = userTasks.filter(t => t.status === 'in_progress').length
    const blocked = userTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length

    let capacity: TeamWorkloadSummary['capacity'] = 'normal'
    if (blocked > 0) capacity = 'blocked'
    else if (overdueTasks > 3 || openTasks > 10) capacity = 'overloaded'
    else if (openTasks > 5) capacity = 'high'

    return {
      memberId: profile.id,
      name: profile.full_name || 'Unknown',
      role: profile.role,
      openTasks,
      overdueTasks,
      inProgress,
      blocked,
      assignedProjects: 0,
      capacity,
    }
  })
}

async function getRecentActivity(): Promise<ActivityItem[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle()

  const organizationId = profile?.organization_id

  if (organizationId) {
    const { data: projectionRows } = await supabase
      .from('activity_projection')
      .select('id, payload, occurred_at')
      .eq('organization_id', organizationId)
      .order('occurred_at', { ascending: false })
      .limit(24)

    if (projectionRows && projectionRows.length > 0) {
      const actorIds = [...new Set(
        projectionRows
          .map(row => {
            const payload = (row.payload || {}) as Record<string, unknown>
            return typeof payload.actor_id === 'string' ? payload.actor_id : null
          })
          .filter((id): id is string => Boolean(id))
      )]

      const userMap = new Map<string, { full_name: string | null }>()
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', actorIds)

        for (const actor of profiles || []) {
          userMap.set(actor.id, { full_name: actor.full_name })
        }
      }

      return projectionRows.slice(0, 12).map(row => {
        const payload = (row.payload || {}) as Record<string, unknown>
        const eventType = typeof payload.event_type === 'string' ? payload.event_type : ''
        const actorId = typeof payload.actor_id === 'string' ? payload.actor_id : null
        const entityType = typeof payload.entity_type === 'string' ? payload.entity_type : ''
        const entityId = typeof payload.entity_id === 'string' ? payload.entity_id : ''

        return {
          id: row.id,
          action: eventType ? eventType.replace(/\./g, ' ') : 'performed an action',
          entityType,
          entityId,
          actorName: actorId ? userMap.get(actorId)?.full_name || 'Someone' : 'Someone',
          occurredAt: row.occurred_at,
        }
      })
    }
  }

  const { data } = await supabase
    .from('activities')
    .select('*, user:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(12)

  return (data || []).map(activity => ({
    id: activity.id,
    action: activity.action || 'performed an action',
    entityType: activity.entity_type || '',
    entityId: activity.entity_id || '',
    actorName: (activity.user as { full_name?: string })?.full_name || 'Someone',
    occurredAt: activity.created_at,
  }))
}

async function getSystemHealth(): Promise<SystemHealthStatus> {
  const supabase = await createClient()
  const now = new Date()

  let outboxPending = 0
  let outboxFailed = 0
  let outboxOldestAge = 0

  try {
    const { data: outboxData } = await supabase
      .from('outbox_events')
      .select('id, status, created_at')
      .limit(100)

    if (outboxData) {
      outboxPending = outboxData.filter(e => e.status === 'pending').length
      outboxFailed = outboxData.filter(e => e.status === 'failed').length
      const oldestPending = outboxData.find(e => e.status === 'pending')
      if (oldestPending?.created_at) {
        outboxOldestAge = Math.floor((now.getTime() - new Date(oldestPending.created_at).getTime()) / (1000 * 60))
      }
    }
  } catch {
  }

  let twFresh = true
  let actFresh = true
  const ucFresh = true
  let twLastUpdated: string | undefined
  let actLastUpdated: string | undefined
  let ucLastUpdated: string | undefined

  try {
    const { data: twData } = await supabase
      .from('team_workload_projection')
      .select('updated_at')
      .limit(1)
    twLastUpdated = twData?.[0]?.updated_at
    if (twLastUpdated) {
      twFresh = (now.getTime() - new Date(twLastUpdated).getTime()) < 30 * 60 * 1000
    }
  } catch {
  }

  try {
    const { data: actData } = await supabase
      .from('activity_projection')
      .select('updated_at')
      .limit(1)
    actLastUpdated = actData?.[0]?.updated_at
    if (actLastUpdated) {
      actFresh = (now.getTime() - new Date(actLastUpdated).getTime()) < 30 * 60 * 1000
    }
  } catch {
  }

  let status: SystemHealthStatus['status'] = 'healthy'
  if (outboxFailed > 5 || !twFresh || !actFresh) status = 'degraded'
  if (outboxFailed > 20) status = 'action_required'

  return {
    status,
    outbox: {
      pendingCount: outboxPending,
      failedCount: outboxFailed,
      oldestPendingAge: outboxOldestAge,
    },
    projections: {
      teamWorkload: { fresh: twFresh, lastUpdated: twLastUpdated },
      activity: { fresh: actFresh, lastUpdated: actLastUpdated },
      unreadCounts: { fresh: ucFresh, lastUpdated: ucLastUpdated },
    },
  }
}

export async function getCommandCenterData(): Promise<CommandCenterData> {
  const userInfo = await getUserInfo()
  const isAdmin = userInfo.isAdmin

  const [
    actionQueue,
    businessMetrics,
    projectHealth,
    clientRisk,
    teamWorkload,
    recentActivity,
    systemHealth,
  ] = await Promise.all([
    getActionQueue(),
    getBusinessMetrics(),
    getProjectHealth(),
    getClientRisk(),
    getTeamWorkload(),
    getRecentActivity(),
    getSystemHealth(),
  ])

  const permissions: LabPermissions = {
    project: {
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin,
      assignTeam: isAdmin,
      manageTags: isAdmin,
    },
    task: {
      create: true,
      update: true,
      delete: isAdmin,
      markDone: true,
      assign: isAdmin,
    },
    client: {
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin,
      invitePortal: isAdmin,
      viewFinancials: isAdmin,
    },
    finance: {
      view: isAdmin,
      createInvoice: isAdmin,
      sendInvoice: isAdmin,
      markPaid: isAdmin,
      deleteInvoice: isAdmin,
    },
    contract: {
      create: isAdmin,
      update: isAdmin,
      delete: isAdmin,
      send: isAdmin,
    },
    meeting: {
      create: true,
      update: isAdmin,
      delete: isAdmin,
    },
    team: {
      create: isAdmin,
      invite: isAdmin,
      removeMember: isAdmin,
      setLead: isAdmin,
    },
    system: {
      viewHealth: isAdmin,
      viewAudit: isAdmin,
      viewEvents: isAdmin,
    },
    settings: {
      updateProfile: true,
      changePassword: true,
      updatePreferences: true,
    },
  }

  return {
    user: { name: userInfo.name, role: userInfo.role },
    actionQueue,
    businessMetrics,
    projectHealth,
    clientRisk,
    teamWorkload,
    recentActivity,
    systemHealth,
    permissions,
  }
}
