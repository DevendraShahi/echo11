'use server'

import { createClient } from '@/lib/supabase/server'

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

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', profileId)

  return { success: true }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient()
  const profileId = await getAuthenticatedClientProfileId(supabase)
  if (!profileId) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profileId)
    .eq('read', false)

  return count || 0
}
