'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserPreferences, Theme } from '@/types/lab'
import { callApiV1 } from '@/lib/api/v1/internal-client'
import { isApiFailure } from '@/lib/api/v1/contracts'

export interface UpdateProfileParams {
  full_name?: string
  avatar_url?: string
}

export interface UpdatePreferencesParams {
  email_notifications?: boolean
  task_reminders?: boolean
  meeting_reminders?: boolean
  theme?: Theme
}

function nextIdempotencyKey(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export async function getUserProfile() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!preferences) {
    const { data: newPrefs } = await supabase
      .from('user_preferences')
      .insert({ user_id: user.id })
      .select()
      .single()
    
    return newPrefs as UserPreferences | null
  }

  return preferences as UserPreferences
}

export async function updateProfile(
  params: UpdateProfileParams
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{ user_id: string }>('/identity/profile', {
      method: 'PATCH',
      body: {
        full_name: params.full_name ?? null,
        avatar_url: params.avatar_url ?? null,
      },
      idempotencyKey: nextIdempotencyKey('profile-update'),
    })

    if (isApiFailure(response)) {
      console.error('Error updating profile:', response.error)
      return { success: false, error: response.error.message }
    }

    revalidatePath('/lab/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updatePreferences(
  params: UpdatePreferencesParams
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{ user_id: string }>('/identity/preferences', {
      method: 'PATCH',
      body: {
        email_notifications: params.email_notifications,
        task_reminders: params.task_reminders,
        meeting_reminders: params.meeting_reminders,
        theme: params.theme,
      },
      idempotencyKey: nextIdempotencyKey('preferences-update'),
    })

    if (isApiFailure(response)) {
      console.error('Error updating preferences:', response.error)
      return { success: false, error: response.error.message }
    }

    revalidatePath('/lab/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating preferences:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{ user_id: string }>('/identity/password', {
      method: 'PUT',
      body: {
        current_password: currentPassword,
        new_password: newPassword,
      },
      idempotencyKey: nextIdempotencyKey('password-change'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getTeamMembers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentProfile?.role !== 'admin') return []
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, team_id, job_title, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load team members', error)
    return []
  }

  return profiles || []
}

export async function updateMemberRole(
  memberId: string,
  role: 'admin' | 'member' | 'client'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'admin') {
    return { success: false, error: 'Only admins can manage roles' }
  }

  if (memberId === user.id) {
    return { success: false, error: 'You cannot change your own role' }
  }

  if (role !== 'admin') {
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
    const otherAdmins = (admins || []).filter(a => a.id !== memberId)
    if (otherAdmins.length === 0) {
      return { success: false, error: 'Cannot demote the last admin' }
    }
  }

  try {
    const response = await callApiV1<{ member_id: string; role: 'admin' | 'member' | 'client' }>(
      `/identity/memberships/${memberId}/role`,
      {
        method: 'PUT',
        body: { role },
        idempotencyKey: `member-role-${crypto.randomUUID()}`,
      }
    )

    if (isApiFailure(response)) {
      console.error('Error updating member role:', response.error)
      return { success: false, error: response.error.message }
    }

    revalidatePath('/lab/settings')
    revalidatePath('/lab/teams')
    return { success: true }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export interface TeamInvite {
  id: string
  email: string
  role: string
  job_title?: string | null
  status: string
  invited_by: string | null
  expires_at: string
  created_at: string
}

export async function getPendingInvites(): Promise<TeamInvite[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.role !== 'admin') {
    return []
  }

  const { data } = await supabase
    .from('team_invites')
    .select('*')
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (data || []) as TeamInvite[]
}

export async function inviteTeamMember(
  email: string,
  role: 'admin' | 'member' | 'client',
  jobTitle?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{
      invite_id: string
      email: string
      role: 'admin' | 'member' | 'client'
      job_title: string | null
      expires_at: string
    }>('/identity/team-invites', {
      method: 'POST',
      body: {
        email: email.toLowerCase(),
        role,
        job_title: jobTitle || null,
      },
      idempotencyKey: nextIdempotencyKey('team-invite-create'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    // Send the actual email
    const { sendTeamInvitation } = await import('@/lib/email')
    await sendTeamInvitation({
      to: email.toLowerCase(),
      role,
      inviteId: response.data.invite_id,
      invitedByEmail: user.email || 'A team member',
      jobTitle
    })

    revalidatePath('/lab/teams')
    revalidatePath('/lab/settings')
    return { success: true }
  } catch (error) {
    console.error('Error creating invite:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function cancelInvite(inviteId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{ invite_id: string }>(`/identity/team-invites/${inviteId}`, {
      method: 'DELETE',
      idempotencyKey: nextIdempotencyKey('team-invite-cancel'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    revalidatePath('/lab/teams')
    revalidatePath('/lab/settings')
    return { success: true }
  } catch (error) {
    console.error('Error canceling invite:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function resendInvite(inviteId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{
      invite_id: string
      email: string
      role: 'admin' | 'member' | 'client'
      job_title: string | null
      expires_at: string
    }>(`/identity/team-invites/${inviteId}/resend`, {
      method: 'PUT',
      idempotencyKey: nextIdempotencyKey('team-invite-resend'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    const { sendTeamInvitation } = await import('@/lib/email')
    await sendTeamInvitation({
      to: response.data.email,
      role: response.data.role,
      inviteId: response.data.invite_id,
      invitedByEmail: user.email || 'A team member',
      jobTitle: response.data.job_title || undefined,
    })

    revalidatePath('/lab/teams')
    revalidatePath('/lab/settings')
    return { success: true }
  } catch (error) {
    console.error('Error resending invite:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getInviteDetails(inviteId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc('get_team_invite_details', {
      p_invite_id: inviteId
    })

    if (error) return null

    const invite = Array.isArray(data) ? data[0] : data
    if (!invite) {
      return null
    }

    return { email: invite.email, role: invite.role, job_title: invite.job_title }
  } catch {
    return null
  }
}

export async function acceptTeamInvite(inviteId: string, userId: string, fullName: string) {
  try {
    const response = await callApiV1<{ invite_id: string; user_id: string }>(`/identity/team-invites/${inviteId}/accept`, {
      method: 'PUT',
      body: {
        user_id: userId,
        full_name: fullName,
      },
      idempotencyKey: nextIdempotencyKey('team-invite-accept'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Server error accepting invite' }
  }
}
