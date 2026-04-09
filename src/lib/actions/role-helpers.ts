'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Returns true if the user is:
 * - an admin, OR
 * - the lead of `teamId` (when provided), OR
 * - the lead of any team (when teamId is null/undefined — used for org-level resources)
 */
export async function requireAdminOrLead(
  userId: string,
  teamId?: string | null
): Promise<boolean> {
  const service = getServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return true

  if (teamId) {
    const { data: team } = await service
      .from('teams')
      .select('lead_id')
      .eq('id', teamId)
      .single()
    return team?.lead_id === userId
  }

  // No specific team: allow if user leads any team
  const { count } = await service
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .eq('lead_id', userId)

  return (count ?? 0) > 0
}

/**
 * Returns true if the user is:
 * - an admin, OR
 * - a member of the given team (profile.team_id matches), OR
 * - the lead of the given team
 */
export async function requireTeamMember(
  userId: string,
  teamId: string
): Promise<boolean> {
  const service = getServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('role, team_id')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return true
  if (profile?.team_id === teamId) return true

  const { data: team } = await service
    .from('teams')
    .select('lead_id')
    .eq('id', teamId)
    .single()

  return team?.lead_id === userId
}
