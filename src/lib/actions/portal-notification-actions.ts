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

export async function getClientNotifications(userId: string): Promise<ClientNotification[]> {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!client) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!profile) return []

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (notifications || []) as ClientNotification[]
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient()
  
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  return { success: true }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!client) return 0

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!profile) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('read', false)

  return count || 0
}
