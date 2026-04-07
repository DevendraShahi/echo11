'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserPreferences, Theme } from '@/types/lab'
import { sendTeamInvitation } from '@/lib/email'

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
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: params.full_name,
        avatar_url: params.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
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
    const { error } = await supabase
      .from('user_preferences')
      .update({
        email_notifications: params.email_notifications,
        task_reminders: params.task_reminders,
        meeting_reminders: params.meeting_reminders,
        theme: params.theme,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating preferences:', error)
      return { success: false, error: error.message }
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
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password: currentPassword
    })

    if (verifyError) {
      return { success: false, error: 'Current password is incorrect' }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      console.error('Error changing password:', updateError)
      return { success: false, error: updateError.message }
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
  if (!user) {
    return []
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', user.id)
    .single()

  if (!currentProfile || currentProfile.role !== 'admin') {
    return []
  }

  const { data: members } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, team_id, created_at')
    .order('created_at', { ascending: true })

  return members || []
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

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', memberId)

    if (error) {
      console.error('Error updating member role:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/settings')
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
    .eq('invited_by', user.id)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (data || []) as TeamInvite[]
}

export async function inviteTeamMember(
  email: string,
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
    return { success: false, error: 'Only admins can invite team members' }
  }

  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return { success: false, error: 'A user with this email already exists' }
    }

    const { data: existingInvite } = await supabase
      .from('team_invites')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvite) {
      return { success: false, error: 'An invitation is already pending for this email' }
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data: newInvite, error } = await supabase.from('team_invites').insert({
      email: email.toLowerCase(),
      role,
      invited_by: user.id,
      status: 'pending',
      expires_at: expiresAt.toISOString()
    }).select('id').single()

    if (error) {
      console.error('Error creating invite:', error)
      return { success: false, error: error.message }
    }

    // Send the actual email
    await sendTeamInvitation({
      to: email.toLowerCase(),
      role,
      inviteId: newInvite.id,
      invitedByEmail: user.email || 'A team member'
    })

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
    const { error } = await supabase
      .from('team_invites')
      .delete()
      .eq('id', inviteId)
      .eq('invited_by', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

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
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { error } = await supabase
      .from('team_invites')
      .update({ expires_at: expiresAt.toISOString(), created_at: new Date().toISOString() })
      .eq('id', inviteId)
      .eq('invited_by', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error resending invite:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function getInviteDetails(inviteId: string) {
  // We use the admin client because the user is not authenticated yet and RLS blocks them
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    const { data: invite, error } = await supabaseAdmin
      .from('team_invites')
      .select('email, role, status, expires_at')
      .eq('id', inviteId)
      .single()

    if (error || !invite) return null

    if (invite.status !== 'pending' || new Date(invite.expires_at) < new Date()) {
      return null
    }

    return { email: invite.email, role: invite.role }
  } catch (err) {
    return null
  }
}

export async function acceptTeamInvite(inviteId: string, userId: string, fullName: string) {
  // Use admin client because standard newly-created user might not have permissions to accept invites
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data: invite } = await supabaseAdmin
      .from('team_invites')
      .select('role')
      .eq('id', inviteId)
      .single()

    if (!invite) return { success: false, error: 'Invite not found' }

    // Update their profile role based on the invite
    await supabaseAdmin.from('profiles').update({
      role: invite.role,
      full_name: fullName
    }).eq('id', userId)

    // Mark invite as accepted
    await supabaseAdmin.from('team_invites').update({
      status: 'accepted'
    }).eq('id', inviteId)

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Server error accepting invite' }
  }
}