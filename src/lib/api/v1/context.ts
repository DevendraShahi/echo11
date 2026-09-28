import { createClient } from '@/lib/supabase/server'
import { isMissingRelationOrColumnError } from './compat'

export interface ApiActorContext {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  organizationId: string | null
  role: string | null
  teamId: string | null
  isAdmin: boolean
}

interface ProfileScope {
  role: string | null
  team_id?: string | null
  organization_id?: string | null
}

async function getProfileScope(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<ProfileScope | null> {
  const initial = await supabase
    .from('profiles')
    .select('role, team_id, organization_id')
    .eq('id', userId)
    .single()

  let data = initial.data as ProfileScope | null
  let error = initial.error

  if (error && isMissingRelationOrColumnError(error)) {
    const fallback = await supabase
      .from('profiles')
      .select('role, team_id')
      .eq('id', userId)
      .single()

    data = fallback.data as ProfileScope | null
    error = fallback.error
  }

  if (error || !data) return null
  return data as ProfileScope
}

async function getOrganizationFromMembership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error && !isMissingRelationOrColumnError(error)) {
    return null
  }

  return data?.organization_id || null
}

export async function getApiActorContext(): Promise<ApiActorContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await getProfileScope(supabase, user.id)
  const organizationId = profile?.organization_id ?? await getOrganizationFromMembership(supabase, user.id)

  return {
    supabase,
    userId: user.id,
    organizationId,
    role: profile?.role || null,
    teamId: profile?.team_id || null,
    isAdmin: profile?.role === 'admin',
  }
}
