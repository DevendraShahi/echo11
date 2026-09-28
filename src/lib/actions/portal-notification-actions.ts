'use server'

import { createClient } from '@/lib/supabase/server'
import { callApiV1 } from '@/lib/api/v1/internal-client'
import { isApiFailure } from '@/lib/api/v1/contracts'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

export interface ClientNotification {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  read: boolean
  created_at: string
}

async function getAuthenticatedClientProfileId(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!client) return null

  return user.id
}

async function getProjectedUnreadNotificationCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<number | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .maybeSingle()

  if (profileError && !isMissingRelationOrColumnError(profileError)) {
    return null
  }

  let query = supabase
    .from('unread_counts_projection')
    .select('unread_notifications, refreshed_at')
    .eq('user_id', userId)
    .order('refreshed_at', { ascending: false })
    .limit(1)

  if (profile?.organization_id) {
    query = query.eq('organization_id', profile.organization_id)
  }

  const { data: projection, error: projectionError } = await query.maybeSingle()
  if (projectionError) {
    if (!isMissingRelationOrColumnError(projectionError)) {
      console.error('Failed to load portal unread notification projection:', projectionError)
    }
    return null
  }

  if (!projection || typeof projection.unread_notifications !== 'number') {
    return null
  }

  return projection.unread_notifications
}

export async function getClientNotifications(): Promise<ClientNotification[]> {
  const supabase = await createClient()
  const profileId = await getAuthenticatedClientProfileId(supabase)
  if (!profileId) return []

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })
    .limit(20)

  return (notifications || []) as ClientNotification[]
}

export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const profileId = await getAuthenticatedClientProfileId(supabase)
  if (!profileId) {
    return { success: false }
  }

  const response = await callApiV1<{ notification_id: string; read: true; lock_version: number | null }>(
    `/notifications/${notificationId}/read`,
    {
      method: 'PUT',
      idempotencyKey: `portal-notification-read-${crypto.randomUUID()}`,
    }
  )

  if (isApiFailure(response)) {
    return { success: false }
  }

  return { success: true }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient()
  const profileId = await getAuthenticatedClientProfileId(supabase)
  if (!profileId) return 0

  const projectedCount = await getProjectedUnreadNotificationCount(supabase, profileId)
  if (typeof projectedCount === 'number') {
    return projectedCount
  }

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profileId)
    .eq('read', false)

  return count || 0
}
