'use server'

import { createClient } from '@/lib/supabase/server'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

export interface ClientActivityItem {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  actor_name: string | null
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

interface ClientActivityScope {
  clientId: string
  projectIds: string[]
  taskIds: string[]
  invoiceIds: string[]
  contractIds: string[]
  meetingIds: string[]
  projectIdSet: Set<string>
  taskIdSet: Set<string>
  invoiceIdSet: Set<string>
  contractIdSet: Set<string>
  meetingIdSet: Set<string>
}

function clampLimit(limit: number): number {
  if (Number.isNaN(limit) || !Number.isFinite(limit)) return 20
  return Math.max(1, Math.min(Math.trunc(limit), 50))
}

function metadataContainsClientId(metadata: Record<string, unknown> | null, clientId: string): boolean {
  if (!metadata) return false
  const value = metadata.client_id
  return typeof value === 'string' && value === clientId
}

function projectionEventToAction(payload: Record<string, unknown> | null): string {
  if (!payload) return 'performed an action'
  const eventType = payload.event_type
  if (typeof eventType === 'string' && eventType.trim()) {
    return eventType.replace(/\./g, ' ')
  }
  return 'performed an action'
}

function extractActorNameFromUserRelation(user: unknown): string | null {
  if (Array.isArray(user)) {
    const first = user[0]
    if (first && typeof first === 'object' && typeof (first as { full_name?: unknown }).full_name === 'string') {
      return (first as { full_name: string }).full_name
    }
    return null
  }

  if (user && typeof user === 'object' && typeof (user as { full_name?: unknown }).full_name === 'string') {
    return (user as { full_name: string }).full_name
  }

  return null
}

async function buildClientScope(supabase: SupabaseServerClient, clientId: string): Promise<ClientActivityScope> {
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('client_id', clientId)

  const projectIds = (projects || []).map((project) => project.id)
  const [tasksResult, invoicesResult, contractsResult, meetingsResult] = await Promise.all([
    projectIds.length > 0
      ? supabase.from('tasks').select('id').in('project_id', projectIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
    supabase.from('invoices').select('id').eq('client_id', clientId),
    supabase.from('contracts').select('id').eq('client_id', clientId),
    projectIds.length > 0
      ? supabase.from('meetings').select('id').in('project_id', projectIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
  ])

  return {
    clientId,
    projectIds,
    taskIds: (tasksResult.data || []).map((task) => task.id),
    invoiceIds: (invoicesResult.data || []).map((invoice) => invoice.id),
    contractIds: (contractsResult.data || []).map((contract) => contract.id),
    meetingIds: (meetingsResult.data || []).map((meeting) => meeting.id),
    projectIdSet: new Set(projectIds),
    taskIdSet: new Set((tasksResult.data || []).map((task) => task.id)),
    invoiceIdSet: new Set((invoicesResult.data || []).map((invoice) => invoice.id)),
    contractIdSet: new Set((contractsResult.data || []).map((contract) => contract.id)),
    meetingIdSet: new Set((meetingsResult.data || []).map((meeting) => meeting.id)),
  }
}

function entityMatchesClientScope(
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> | null,
  scope: ClientActivityScope
): boolean {
  if (metadataContainsClientId(metadata, scope.clientId)) return true
  if (!entityId && entityType !== 'client') return false

  switch (entityType) {
    case 'client':
      return entityId === scope.clientId
    case 'project':
      return !!entityId && scope.projectIdSet.has(entityId)
    case 'task':
      return !!entityId && scope.taskIdSet.has(entityId)
    case 'invoice':
      return !!entityId && scope.invoiceIdSet.has(entityId)
    case 'contract':
      return !!entityId && scope.contractIdSet.has(entityId)
    case 'meeting':
      return !!entityId && scope.meetingIdSet.has(entityId)
    default:
      return false
  }
}

async function getFallbackActivities(
  supabase: SupabaseServerClient,
  scope: ClientActivityScope,
  limit: number
): Promise<ClientActivityItem[]> {
  const { data: recentActivities } = await supabase
    .from('activities')
    .select('id, action, entity_type, entity_id, metadata, created_at, user:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(250)

  const filtered = (recentActivities || []).filter((activity) =>
    entityMatchesClientScope(
      activity.entity_type,
      activity.entity_id,
      activity.metadata as Record<string, unknown> | null,
      scope
    )
  )

  return filtered.slice(0, limit).map((activity) => ({
    id: activity.id,
    action: activity.action,
    entity_type: activity.entity_type,
    entity_id: activity.entity_id,
    metadata: (activity.metadata as Record<string, unknown> | null) || null,
    created_at: activity.created_at,
    actor_name: extractActorNameFromUserRelation(activity.user),
  }))
}

async function getClientActivityRows(
  supabase: SupabaseServerClient,
  organizationId: string | null,
  scope: ClientActivityScope,
  limit: number
): Promise<ClientActivityItem[]> {
  if (!organizationId) {
    return getFallbackActivities(supabase, scope, limit)
  }

  const { data: projectionRows, error: projectionError } = await supabase
    .from('activity_projection')
    .select('id, entity_type, entity_id, payload, occurred_at')
    .eq('organization_id', organizationId)
    .order('occurred_at', { ascending: false })
    .limit(300)

  if (projectionError) {
    if (!isMissingRelationOrColumnError(projectionError)) {
      console.error('Failed to load client activity projection:', projectionError)
    }
    return getFallbackActivities(supabase, scope, limit)
  }

  const projectionFiltered = (projectionRows || []).filter((row) => {
    const payload = (row.payload || {}) as Record<string, unknown>
    const domainPayload = (payload.domain_payload || null) as Record<string, unknown> | null
    return entityMatchesClientScope(row.entity_type, row.entity_id, domainPayload, scope)
  })

  if (projectionFiltered.length === 0) {
    return getFallbackActivities(supabase, scope, limit)
  }

  const actorIds = [...new Set(
    projectionFiltered
      .map((row) => {
        const payload = (row.payload || {}) as Record<string, unknown>
        return typeof payload.actor_id === 'string' ? payload.actor_id : null
      })
      .filter((actorId): actorId is string => Boolean(actorId))
  )]

  const actorNameById = new Map<string, string | null>()
  if (actorIds.length > 0) {
    const { data: actors } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', actorIds)

    for (const actor of actors || []) {
      actorNameById.set(actor.id, actor.full_name || null)
    }
  }

  return projectionFiltered.slice(0, limit).map((row) => {
    const payload = (row.payload || {}) as Record<string, unknown>
    const domainPayload = (payload.domain_payload || null) as Record<string, unknown> | null
    const actorId = typeof payload.actor_id === 'string' ? payload.actor_id : null

    return {
      id: row.id,
      action: projectionEventToAction(payload),
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      metadata: domainPayload,
      created_at: row.occurred_at,
      actor_name: actorId ? actorNameById.get(actorId) || null : null,
    }
  })
}

async function canReadClientForLab(
  supabase: SupabaseServerClient,
  userId: string,
  clientId: string
): Promise<boolean> {
  const { data: canRead, error } = await supabase.rpc('can_read_client', {
    check_client_id: clientId,
  })

  if (!error) {
    return Boolean(canRead)
  }

  if (!isMissingRelationOrColumnError(error)) {
    console.error('Failed to evaluate can_read_client:', error)
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', userId)
    .single()

  if (!profile) return false
  if (profile.role === 'admin') return true
  if (!profile.team_id) return false

  const { count } = await supabase
    .from('projects')
    .select('id', { head: true, count: 'exact' })
    .eq('client_id', clientId)
    .eq('team_id', profile.team_id)

  return (count || 0) > 0
}

export async function getClientActivityFeed(limit = 20): Promise<ClientActivityItem[]> {
  const supabase = await createClient()
  const boundedLimit = clampLimit(limit)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: client } = await supabase
    .from('clients')
    .select('id, organization_id')
    .eq('auth_id', user.id)
    .single()

  if (!client) return []

  const scope = await buildClientScope(supabase, client.id)
  return getClientActivityRows(supabase, client.organization_id, scope, boundedLimit)
}

export async function getLabClientActivityFeed(clientId: string, limit = 20): Promise<ClientActivityItem[]> {
  const supabase = await createClient()
  const boundedLimit = clampLimit(limit)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const canRead = await canReadClientForLab(supabase, user.id, clientId)
  if (!canRead) return []

  const { data: client } = await supabase
    .from('clients')
    .select('id, organization_id')
    .eq('id', clientId)
    .maybeSingle()

  if (!client) return []

  const scope = await buildClientScope(supabase, client.id)
  return getClientActivityRows(supabase, client.organization_id, scope, boundedLimit)
}
