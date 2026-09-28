import { createClient } from '@/lib/supabase/server'

export interface ApiClientMessage {
  id: string
  client_id: string
  sender_type: 'client' | 'team'
  sender_name: string
  content: string
  read_by_client: boolean
  read_by_team: boolean
  created_at: string
}

export interface AuthenticatedClientMessageContext {
  userId: string
  clientId: string
  companyName: string | null
}

export interface AuthenticatedAgencyMessageContext {
  userId: string
  fullName: string | null
  isAdmin: boolean
  accessibleTeamIds: string[]
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export async function getAuthenticatedClientMessageContext(
  supabase: SupabaseClient,
  userId: string
): Promise<AuthenticatedClientMessageContext | null> {
  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('auth_id', userId)
    .single()

  if (!client) return null

  return {
    userId,
    clientId: client.id,
    companyName: client.company_name || null,
  }
}

export async function getAuthenticatedAgencyMessageContext(
  supabase: SupabaseClient,
  userId: string
): Promise<AuthenticatedAgencyMessageContext | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, team_id')
    .eq('id', userId)
    .single()

  if (!profile) return null
  if (profile.role !== 'admin' && profile.role !== 'member') return null

  const isAdmin = profile.role === 'admin'

  let accessibleTeamIds: string[] = []
  if (!isAdmin) {
    const { data: leadTeams } = await supabase
      .from('teams')
      .select('id')
      .eq('lead_id', userId)

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

export async function canAccessClientThread(
  supabase: SupabaseClient,
  agency: AuthenticatedAgencyMessageContext,
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
