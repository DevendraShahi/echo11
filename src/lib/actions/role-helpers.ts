'use server'

import { createClient } from '@/lib/supabase/server'

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
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return true

  if (teamId) {
    const { data: team } = await supabase
      .from('teams')
      .select('lead_id')
      .eq('id', teamId)
      .single()

    return team?.lead_id === userId
  }

  // No specific team: allow if user leads any team
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('lead_id', userId)
    .limit(1)
    .maybeSingle()

  return Boolean(team)
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
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return true
  if (profile?.team_id === teamId) return true

  const { data: team } = await supabase
    .from('teams')
    .select('lead_id')
    .eq('id', teamId)
    .single()

  return team?.lead_id === userId
}
