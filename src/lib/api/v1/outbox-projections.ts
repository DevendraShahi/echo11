import { createServiceClient } from '@/lib/supabase/service'

export interface DomainEventRow {
  id: string
  organization_id: string
  actor_id: string | null
  aggregate_type: string
  aggregate_id: string | null
  event_type: string
  payload: Record<string, unknown> | null
  created_at: string
  dispatch_attempts: number
}

type ServiceSupabase = ReturnType<typeof createServiceClient>

interface ProjectionOutcome {
  activityInserted: boolean
  refreshedClients: number
  refreshedTeams: number
  refreshedUnreadUsers: number
}

export async function applyEventProjections(
  supabase: ServiceSupabase,
  event: DomainEventRow
): Promise<ProjectionOutcome> {
  const outcome: ProjectionOutcome = {
    activityInserted: false,
    refreshedClients: 0,
    refreshedTeams: 0,
    refreshedUnreadUsers: 0,
  }

  outcome.activityInserted = await appendActivityProjection(supabase, event)

  const payload = event.payload || {}
  const candidateClientIds = new Set<string>()
  const candidateTeamIds = new Set<string>()

  const aggregateId = event.aggregate_id
  if (event.aggregate_type === 'client' && aggregateId) candidateClientIds.add(aggregateId)
  if (event.aggregate_type === 'project' && aggregateId) {
    const projectTeamId = await getProjectTeamId(supabase, aggregateId)
    const projectClientId = await getProjectClientId(supabase, aggregateId)
    if (projectTeamId) candidateTeamIds.add(projectTeamId)
    if (projectClientId) candidateClientIds.add(projectClientId)
  }
  if (event.aggregate_type === 'task' && aggregateId) {
    const projectId = await getTaskProjectId(supabase, aggregateId)
    if (projectId) {
      const projectTeamId = await getProjectTeamId(supabase, projectId)
      const projectClientId = await getProjectClientId(supabase, projectId)
      if (projectTeamId) candidateTeamIds.add(projectTeamId)
      if (projectClientId) candidateClientIds.add(projectClientId)
    }
  }

  const payloadClientId = parsePayloadUuid(payload.client_id)
  if (payloadClientId) candidateClientIds.add(payloadClientId)

  const payloadTeamId = parsePayloadUuid(payload.team_id)
  if (payloadTeamId) candidateTeamIds.add(payloadTeamId)

  for (const clientId of candidateClientIds) {
    const refreshed = await rebuildClientDashboardProjection(supabase, event.organization_id, clientId)
    if (refreshed) outcome.refreshedClients += 1

    const inferredTeamIds = await getTeamIdsForClient(supabase, clientId)
    for (const teamId of inferredTeamIds) {
      candidateTeamIds.add(teamId)
    }
  }

  for (const teamId of candidateTeamIds) {
    const refreshed = await rebuildTeamWorkloadProjection(supabase, event.organization_id, teamId)
    if (refreshed) outcome.refreshedTeams += 1
  }

  const refreshUnread =
    event.aggregate_type === 'notification' ||
    event.aggregate_type === 'client_message' ||
    event.aggregate_type === 'client_message_thread' ||
    event.event_type.startsWith('message.')

  if (refreshUnread) {
    const refreshedUsers = await rebuildUnreadCountsForOrganization(supabase, event.organization_id)
    outcome.refreshedUnreadUsers = refreshedUsers
  }

  return outcome
}

async function appendActivityProjection(supabase: ServiceSupabase, event: DomainEventRow): Promise<boolean> {
  const payload = {
    event_type: event.event_type,
    aggregate_type: event.aggregate_type,
    aggregate_id: event.aggregate_id,
    actor_id: event.actor_id,
    domain_payload: event.payload || {},
  }

  const { error } = await supabase.from('activity_projection').insert({
    organization_id: event.organization_id,
    entity_type: event.aggregate_type,
    entity_id: event.aggregate_id,
    payload,
    occurred_at: event.created_at,
  })

  if (error) {
    console.error('Failed to append activity projection:', error)
    return false
  }

  return true
}

async function rebuildClientDashboardProjection(
  supabase: ServiceSupabase,
  organizationId: string,
  clientId: string
): Promise<boolean> {
  const [{ data: client }, { data: projects }, { data: invoices }, { data: statuses }] = await Promise.all([
    supabase
      .from('clients')
      .select('id, company_name, contact_name, email, industry')
      .eq('id', clientId)
      .eq('organization_id', organizationId)
      .maybeSingle(),
    supabase
      .from('projects')
      .select('id, status')
      .eq('client_id', clientId),
    supabase
      .from('invoices')
      .select('total, status')
      .eq('client_id', clientId),
    supabase
      .from('client_statuses')
      .select('status')
      .eq('client_id', clientId)
      .maybeSingle(),
  ])

  if (!client) {
    return false
  }

  const projectStatusCounts = (projects || []).reduce<Record<string, number>>((acc, project) => {
    const key = project.status || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const paidRevenue = (invoices || [])
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)

  const outstandingRevenue = (invoices || [])
    .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)

  const openInvoicesCount = (invoices || []).filter(
    (invoice) => invoice.status === 'sent' || invoice.status === 'overdue'
  ).length

  const payload = {
    client: {
      id: client.id,
      company_name: client.company_name,
      contact_name: client.contact_name,
      email: client.email,
      industry: client.industry,
      status: statuses?.status || 'active',
    },
    projects: {
      total: (projects || []).length,
      by_status: projectStatusCounts,
    },
    invoices: {
      total: (invoices || []).length,
      paid_revenue: paidRevenue,
      outstanding_revenue: outstandingRevenue,
      open_count: openInvoicesCount,
    },
  }

  const { error } = await supabase
    .from('client_dashboard_projection')
    .upsert(
      {
        organization_id: organizationId,
        client_id: clientId,
        payload,
        refreshed_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id,client_id' }
    )

  if (error) {
    console.error('Failed to update client dashboard projection:', error)
    return false
  }

  return true
}

async function rebuildTeamWorkloadProjection(
  supabase: ServiceSupabase,
  organizationId: string,
  teamId: string
): Promise<boolean> {
  const [{ data: team }, { data: projects }] = await Promise.all([
    supabase
      .from('teams')
      .select('id, name, lead_id')
      .eq('id', teamId)
      .eq('organization_id', organizationId)
      .maybeSingle(),
    supabase
      .from('projects')
      .select('id, status')
      .eq('team_id', teamId),
  ])

  if (!team) {
    return false
  }

  const projectIds = (projects || []).map((project) => project.id).filter(Boolean) as string[]
  let tasks: { id: string; status: string | null; due_date: string | null }[] = []
  if (projectIds.length > 0) {
    const { data: taskRows } = await supabase
      .from('tasks')
      .select('id, status, due_date')
      .in('project_id', projectIds)

    tasks = (taskRows || []) as { id: string; status: string | null; due_date: string | null }[]
  }

  const now = new Date()
  const taskStatusCounts = (tasks || []).reduce<Record<string, number>>((acc, task) => {
    const key = task.status || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const overdue = (tasks || []).filter((task) => {
    if (!task.due_date) return false
    return new Date(task.due_date) < now && task.status !== 'done'
  }).length

  const payload = {
    team: {
      id: team.id,
      name: team.name,
      lead_id: team.lead_id,
    },
    projects: {
      total: (projects || []).length,
      active: (projects || []).filter((project) => project.status === 'active').length,
    },
    tasks: {
      total: (tasks || []).length,
      by_status: taskStatusCounts,
      overdue,
    },
  }

  const { error } = await supabase
    .from('team_workload_projection')
    .upsert(
      {
        organization_id: organizationId,
        team_id: teamId,
        payload,
        refreshed_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id,team_id' }
    )

  if (error) {
    console.error('Failed to update team workload projection:', error)
    return false
  }

  return true
}

async function rebuildUnreadCountsForOrganization(
  supabase: ServiceSupabase,
  organizationId: string
): Promise<number> {
  const { data: memberships, error: membershipsError } = await supabase
    .from('organization_memberships')
    .select('user_id')
    .eq('organization_id', organizationId)
    .eq('status', 'active')

  if (membershipsError) {
    console.error('Failed to load org memberships for unread projection:', membershipsError)
    return 0
  }

  let updated = 0

  for (const membership of memberships || []) {
    const userId = membership.user_id
    if (!userId) continue

    const refreshed = await rebuildUnreadCountsForUser(supabase, organizationId, userId)
    if (refreshed) updated += 1
  }

  return updated
}

async function rebuildUnreadCountsForUser(
  supabase: ServiceSupabase,
  organizationId: string,
  userId: string
): Promise<boolean> {
  const [{ data: profile }, { count: unreadNotifications, error: notifError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('role, team_id')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false),
  ])

  if (notifError) {
    console.error('Failed to count unread notifications:', notifError)
    return false
  }

  let unreadClientMessages = 0

  if (profile?.role === 'client') {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('auth_id', userId)
      .maybeSingle()

    if (client?.id) {
      const { count } = await supabase
        .from('client_messages')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .eq('sender_type', 'team')
        .eq('read_by_client', false)

      unreadClientMessages = count || 0
    }
  } else if (profile?.role === 'admin') {
    const { data: orgClientIds } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', organizationId)

    const clientIds = (orgClientIds || []).map((client) => client.id)
    if (clientIds.length > 0) {
      const { count } = await supabase
        .from('client_messages')
        .select('*', { count: 'exact', head: true })
        .in('client_id', clientIds)
        .eq('sender_type', 'client')
        .eq('read_by_team', false)

      unreadClientMessages = count || 0
    }
  } else if (profile?.team_id) {
    const { data: teamClientIds } = await supabase
      .from('projects')
      .select('client_id')
      .eq('team_id', profile.team_id)

    const clientIds = [...new Set((teamClientIds || []).map((project) => project.client_id).filter(Boolean))] as string[]
    if (clientIds.length > 0) {
      const { count } = await supabase
        .from('client_messages')
        .select('*', { count: 'exact', head: true })
        .in('client_id', clientIds)
        .eq('sender_type', 'client')
        .eq('read_by_team', false)

      unreadClientMessages = count || 0
    }
  }

  const { error: upsertError } = await supabase
    .from('unread_counts_projection')
    .upsert(
      {
        organization_id: organizationId,
        user_id: userId,
        unread_notifications: unreadNotifications || 0,
        unread_client_messages: unreadClientMessages,
        payload: {
          role: profile?.role || null,
          team_id: profile?.team_id || null,
        },
        refreshed_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id,user_id' }
    )

  if (upsertError) {
    console.error('Failed to update unread counts projection:', upsertError)
    return false
  }

  return true
}

async function getTaskProjectId(supabase: ServiceSupabase, taskId: string): Promise<string | null> {
  const { data } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', taskId)
    .maybeSingle()

  return data?.project_id || null
}

async function getProjectTeamId(supabase: ServiceSupabase, projectId: string): Promise<string | null> {
  const { data } = await supabase
    .from('projects')
    .select('team_id')
    .eq('id', projectId)
    .maybeSingle()

  return data?.team_id || null
}

async function getProjectClientId(supabase: ServiceSupabase, projectId: string): Promise<string | null> {
  const { data } = await supabase
    .from('projects')
    .select('client_id')
    .eq('id', projectId)
    .maybeSingle()

  return data?.client_id || null
}

async function getTeamIdsForClient(supabase: ServiceSupabase, clientId: string): Promise<string[]> {
  const { data } = await supabase
    .from('projects')
    .select('team_id')
    .eq('client_id', clientId)

  return [...new Set((data || []).map((project) => project.team_id).filter(Boolean))] as string[]
}

function parsePayloadUuid(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const candidate = value.trim()
  if (!candidate) return null
  return candidate
}
