'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { revalidateClientSurface, revalidateLegacyPortalSurface } from './client-surface-revalidate'

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
  const supabase = await createClient()
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    return { success: false, error: 'Message cannot be empty' }
  }
  const context = await getAuthenticatedClientContext(supabase)
  if (!context) {
    return { success: false, error: 'Client not found' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', context.userId)
    .single()

  const senderName = profile?.full_name || context.companyName || 'Client'

  const { data: message, error } = await supabase
    .from('client_messages')
    .insert({
      client_id: context.clientId,
      sender_type: 'client',
      sender_name: senderName,
      content: normalizedContent,
      read_by_client: true,
      read_by_team: false,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/client/messages')
  revalidatePath('/client/messages')
  revalidatePath('/lab/clients')
  revalidatePath(`/lab/clients/${context.clientId}`)
  revalidateClientSurface()
  revalidateLegacyPortalSurface()
  return { success: true, message: message as ClientMessage }
}

export async function markClientMessagesRead(): Promise<void> {
  const supabase = await createClient()
  const context = await getAuthenticatedClientContext(supabase)
  if (!context) return

  await supabase
    .from('client_messages')
    .update({ read_by_client: true })
    .eq('client_id', context.clientId)
    .eq('sender_type', 'team')
    .eq('read_by_client', false)
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

export async function sendTeamMessage(
  clientId: string,
  content: string
): Promise<{ success: boolean; message?: ClientMessage; error?: string }> {
  const supabase = await createClient()
  const normalizedContent = content.trim()

  if (!normalizedContent) {
    return { success: false, error: 'Message cannot be empty' }
  }

  const agency = await getAuthenticatedAgencyContext(supabase)
  if (!agency) {
    return { success: false, error: 'Only agency team members can send messages' }
  }
  const hasAccess = await canAccessClientThread(supabase, agency, clientId)
  if (!hasAccess) {
    return { success: false, error: 'You do not have access to this client conversation' }
  }

  const senderName = agency.fullName || 'Echo11 Team'

  const { data: message, error } = await supabase
    .from('client_messages')
    .insert({
      client_id: clientId,
      sender_type: 'team',
      sender_name: senderName,
      content: normalizedContent,
      read_by_client: false,
      read_by_team: true,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error sending team message:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/lab/clients')
  revalidatePath(`/lab/clients/${clientId}`)
  revalidatePath('/client/messages')
  revalidatePath('/client/messages')
  revalidateClientSurface()
  revalidateLegacyPortalSurface()

  return { success: true, message: message as ClientMessage }
}

export async function markTeamMessagesRead(clientId: string): Promise<void> {
  const supabase = await createClient()
  const agency = await getAuthenticatedAgencyContext(supabase)
  if (!agency) return
  const hasAccess = await canAccessClientThread(supabase, agency, clientId)
  if (!hasAccess) return

  await supabase
    .from('client_messages')
    .update({ read_by_team: true })
    .eq('client_id', clientId)
    .eq('sender_type', 'client')
    .eq('read_by_team', false)

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
