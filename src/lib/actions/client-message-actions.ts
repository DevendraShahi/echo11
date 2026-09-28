'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { revalidateClientSurface, revalidateLegacyPortalSurface } from './client-surface-revalidate'
import { callApiV1 } from '@/lib/api/v1/internal-client'
import { isApiFailure } from '@/lib/api/v1/contracts'

export interface ClientMessage {
  id: string
  client_id: string
  sender_type: 'client' | 'team'
  sender_name: string
  content: string
  read_by_client: boolean
  read_by_team: boolean
  created_at: string
}

export interface TeamClientProjectContext {
  id: string
  name: string
  status: string
  deadline: string | null
  updated_at: string
}

interface AuthenticatedClientContext {
  userId: string
  clientId: string
  companyName: string | null
}

interface AuthenticatedAgencyContext {
  userId: string
  fullName: string | null
  isAdmin: boolean
  accessibleTeamIds: string[]
}

async function getAuthenticatedClientContext(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AuthenticatedClientContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('auth_id', user.id)
    .single()

  if (!client) return null

  return {
    userId: user.id,
    clientId: client.id,
    companyName: client.company_name || null,
  }
}

async function getAuthenticatedAgencyContext(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AuthenticatedAgencyContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, team_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null
  if (profile.role !== 'admin' && profile.role !== 'member') return null

  const isAdmin = profile.role === 'admin'

  let accessibleTeamIds: string[] = []
  if (!isAdmin) {
    const { data: leadTeams } = await supabase
      .from('teams')
      .select('id')
      .eq('lead_id', user.id)

    const teamIdSet = new Set<string>()
    if (profile.team_id) {
      teamIdSet.add(profile.team_id)
    }
    for (const team of leadTeams || []) {
      if (team.id) {
        teamIdSet.add(team.id)
      }
    }
    accessibleTeamIds = [...teamIdSet]
  }

  return {
    userId: profile.id,
    fullName: profile.full_name || null,
    isAdmin,
    accessibleTeamIds,
  }
}

async function canAccessClientThread(
  supabase: Awaited<ReturnType<typeof createClient>>,
  agency: AuthenticatedAgencyContext,
  clientId: string
): Promise<boolean> {
  if (agency.isAdmin) return true
  if (!clientId) return false
  if (agency.accessibleTeamIds.length === 0) return false

  const { count } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .in('team_id', agency.accessibleTeamIds)

  return (count ?? 0) > 0
}

export async function getClientMessages(): Promise<ClientMessage[]> {
  const supabase = await createClient()
  const context = await getAuthenticatedClientContext(supabase)
  if (!context) return []

  const { data: messages } = await supabase
    .from('client_messages')
    .select('*')
    .eq('client_id', context.clientId)
    .order('created_at', { ascending: false })

  return (messages || []) as ClientMessage[]
}

export async function sendClientMessage(
  content: string
): Promise<{ success: boolean; message?: ClientMessage; error?: string }> {
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    return { success: false, error: 'Message cannot be empty' }
  }

  const response = await callApiV1<{ message: ClientMessage }>('/messages/client', {
    method: 'POST',
    body: { content: normalizedContent },
    idempotencyKey: `message-client-send-${crypto.randomUUID()}`,
  })

  if (isApiFailure(response)) {
    return { success: false, error: response.error.message }
  }

  const message = response.data.message
  revalidatePath('/client/messages')
  revalidatePath('/client/messages')
  revalidatePath('/lab/clients')
  revalidatePath(`/lab/clients/${message.client_id}`)
  revalidateClientSurface()
  revalidateLegacyPortalSurface()
  return { success: true, message }
}

export async function markClientMessagesRead(): Promise<void> {
  await callApiV1<{ client_id: string; updated_count: number }>('/messages/client/read', {
    method: 'PUT',
    idempotencyKey: `message-client-read-${crypto.randomUUID()}`,
  })
}

export async function getClientUnreadTeamMessagesCount(): Promise<number> {
  const supabase = await createClient()
  const context = await getAuthenticatedClientContext(supabase)
  if (!context) return 0

  const { count } = await supabase
    .from('client_messages')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', context.clientId)
    .eq('sender_type', 'team')
    .eq('read_by_client', false)

  return count ?? 0
}

export async function getClientMessagesForTeam(clientId: string): Promise<ClientMessage[]> {
  const supabase = await createClient()
  const agency = await getAuthenticatedAgencyContext(supabase)
  if (!agency) return []
  const hasAccess = await canAccessClientThread(supabase, agency, clientId)
  if (!hasAccess) return []

  const { data: messages } = await supabase
    .from('client_messages')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  return (messages || []) as ClientMessage[]
}

export async function getClientProjectsForTeam(clientId: string): Promise<TeamClientProjectContext[]> {
  const supabase = await createClient()
  const agency = await getAuthenticatedAgencyContext(supabase)
  if (!agency) return []

  const hasAccess = await canAccessClientThread(supabase, agency, clientId)
  if (!hasAccess) return []

  let query = supabase
    .from('projects')
    .select('id, name, status, deadline, updated_at, team_id')
    .eq('client_id', clientId)
    .order('updated_at', { ascending: false })

  if (!agency.isAdmin) {
    query = query.in('team_id', agency.accessibleTeamIds)
  }

  const { data } = await query

  return (data || []).map((project) => ({
    id: project.id,
    name: project.name,
    status: project.status,
    deadline: project.deadline,
    updated_at: project.updated_at,
  }))
}

export async function sendTeamMessage(
  clientId: string,
  content: string
): Promise<{ success: boolean; message?: ClientMessage; error?: string }> {
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    return { success: false, error: 'Message cannot be empty' }
  }

  const response = await callApiV1<{ message: ClientMessage }>(`/messages/team/${clientId}/send`, {
    method: 'POST',
    body: { content: normalizedContent },
    idempotencyKey: `message-team-send-${crypto.randomUUID()}`,
  })

  if (isApiFailure(response)) {
    return { success: false, error: response.error.message }
  }

  const message = response.data.message
  revalidatePath('/lab/clients')
  revalidatePath(`/lab/clients/${clientId}`)
  revalidatePath('/client/messages')
  revalidatePath('/client/messages')
  revalidateClientSurface()
  revalidateLegacyPortalSurface()

  return { success: true, message }
}

export async function markTeamMessagesRead(clientId: string): Promise<void> {
  await callApiV1<{ client_id: string; updated_count: number }>(`/messages/team/${clientId}/read`, {
    method: 'PUT',
    idempotencyKey: `message-team-read-${crypto.randomUUID()}`,
  })

  revalidatePath('/lab/clients')
  revalidatePath(`/lab/clients/${clientId}`)
  revalidateClientSurface()
  revalidateLegacyPortalSurface()
}

export async function getTeamUnreadClientMessagesCount(): Promise<number> {
  const supabase = await createClient()
  const agency = await getAuthenticatedAgencyContext(supabase)
  if (!agency) return 0

  if (agency.isAdmin) {
    const { count } = await supabase
      .from('client_messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_type', 'client')
      .eq('read_by_team', false)

    return count ?? 0
  }

  if (agency.accessibleTeamIds.length === 0) {
    return 0
  }

  const { data: teamProjects } = await supabase
    .from('projects')
    .select('client_id')
    .in('team_id', agency.accessibleTeamIds)

  const visibleClientIds = [
    ...new Set(
      (teamProjects || [])
        .map((project) => project.client_id)
        .filter((clientId): clientId is string => typeof clientId === 'string' && clientId.length > 0)
    ),
  ]

  if (visibleClientIds.length === 0) {
    return 0
  }

  const { count } = await supabase
    .from('client_messages')
    .select('id', { count: 'exact', head: true })
    .in('client_id', visibleClientIds)
    .eq('sender_type', 'client')
    .eq('read_by_team', false)

  return count ?? 0
}
