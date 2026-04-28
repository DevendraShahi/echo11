'use server'

import { createClient } from '@/lib/supabase/server'

export interface ClientActivityItem {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
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

export async function getClientActivityFeed(limit = 20): Promise<ClientActivityItem[]> {
  const supabase = await createClient()
  const boundedLimit = clampLimit(limit)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!client) return []

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('client_id', client.id)

  const projectIds = (projects || []).map((project) => project.id)

  const [tasksResult, invoicesResult, contractsResult, meetingsResult] = await Promise.all([
    projectIds.length > 0
      ? supabase.from('tasks').select('id').in('project_id', projectIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
    supabase.from('invoices').select('id').eq('client_id', client.id),
    supabase.from('contracts').select('id').eq('client_id', client.id),
    projectIds.length > 0
      ? supabase.from('meetings').select('id').in('project_id', projectIds)
      : Promise.resolve({ data: [] as { id: string }[] }),
  ])

  const taskIds = (tasksResult.data || []).map((task) => task.id)
  const invoiceIds = (invoicesResult.data || []).map((invoice) => invoice.id)
  const contractIds = (contractsResult.data || []).map((contract) => contract.id)
  const meetingIds = (meetingsResult.data || []).map((meeting) => meeting.id)

  const projectIdSet = new Set(projectIds)
  const taskIdSet = new Set(taskIds)
  const invoiceIdSet = new Set(invoiceIds)
  const contractIdSet = new Set(contractIds)
  const meetingIdSet = new Set(meetingIds)

  const { data: recentActivities } = await supabase
    .from('activities')
    .select('id, action, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(250)

  const filtered = (recentActivities || []).filter((activity) => {
    const entityId = activity.entity_id

    if (metadataContainsClientId(activity.metadata as Record<string, unknown> | null, client.id)) {
      return true
    }

    switch (activity.entity_type) {
      case 'client':
        return entityId === client.id
      case 'project':
        return !!entityId && projectIdSet.has(entityId)
      case 'task':
        return !!entityId && taskIdSet.has(entityId)
      case 'invoice':
        return !!entityId && invoiceIdSet.has(entityId)
      case 'contract':
        return !!entityId && contractIdSet.has(entityId)
      case 'meeting':
        return !!entityId && meetingIdSet.has(entityId)
      default:
        return false
    }
  })

  return filtered.slice(0, boundedLimit) as ClientActivityItem[]
}
