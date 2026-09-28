'use server'

import { createClient } from '@/lib/supabase/server'
import { Notification } from '@/types/lab'
import { callApiV1 } from '@/lib/api/v1/internal-client'
import { isApiFailure } from '@/lib/api/v1/contracts'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

function nextIdempotencyKey(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
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
      console.error('Failed to load unread notification projection:', projectionError)
    }
    return null
  }

  if (!projection || typeof projection.unread_notifications !== 'number') {
    return null
  }

  return projection.unread_notifications
}

export async function getNotifications(unreadOnly = true): Promise<Notification[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data } = await query

  return (data || []) as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const projectedCount = await getProjectedUnreadNotificationCount(supabase, user.id)
  if (typeof projectedCount === 'number') {
    return projectedCount
  }

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return count || 0
}

export async function createNotification(params: {
  userId: string
  type?: string
  title: string
  message?: string
  link?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await callApiV1<{ notification_id: string; user_id: string; lock_version: number | null }>('/notifications', {
      method: 'POST',
      body: {
        user_id: params.userId,
        type: params.type || 'info',
        title: params.title,
        message: params.message || null,
        link: params.link || null,
      },
      idempotencyKey: nextIdempotencyKey('notification-create'),
    })

    if (isApiFailure(response)) {
      console.error('Error creating notification:', response.error)
      return { success: false, error: response.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{ notification_id: string; read: true; lock_version: number | null }>(
      `/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        idempotencyKey: nextIdempotencyKey('notification-read'),
      }
    )

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{ updated_count: number; lock_version: number | null }>(
      '/notifications/read-all',
      {
        method: 'PUT',
        idempotencyKey: nextIdempotencyKey('notification-read-all'),
      }
    )

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{ notification_id: string }>(`/notifications/${notificationId}`, {
      method: 'DELETE',
      idempotencyKey: nextIdempotencyKey('notification-delete'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
