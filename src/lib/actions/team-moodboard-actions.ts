'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/lib/actions/notification-actions'
import { requireTeamMember } from '@/lib/actions/role-helpers'

export interface TeamMessage {
  id: string
  team_id: string
  content: string
  created_by: string
  created_at: string
  user?: { full_name: string | null; avatar_url: string | null }
}

export interface TeamNote {
  id: string
  team_id: string
  content: string
  created_by: string
  created_at: string
  user?: { full_name: string | null; avatar_url: string | null }
}

/** Fetch all messages for a team, newest first */
export async function getTeamMessages(teamId: string): Promise<TeamMessage[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const isMember = await requireTeamMember(user.id, teamId)
  if (!isMember) return []

  const { data } = await supabase
    .from('team_messages')
    .select('*, user:profiles(full_name, avatar_url)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
  return (data || []) as TeamMessage[]
}

/** Post a new chat message */
export async function postTeamMessage(
  teamId: string,
  content: string,
  mentionUserIds: string[] = []
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in' }

  const isMember = await requireTeamMember(user.id, teamId)
  if (!isMember) return { success: false, error: 'You are not a member of this team' }

  const { error } = await supabase.from('team_messages').insert({
    team_id: teamId,
    content,
    created_by: user.id,
  })

  if (error) {
    console.error('Error posting message:', error)
    return { success: false, error: error.message }
  }

  try {
    const uniqueMentions = Array.from(new Set(mentionUserIds)).filter(id => id !== user.id)
    if (uniqueMentions.length > 0) {
      const { data: authorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const authorName = authorProfile?.full_name || 'A teammate'
      const preview = content.slice(0, 120)

      await Promise.all(uniqueMentions.map((targetId) => createNotification({
        userId: targetId,
        type: 'moodboard-mention',
        title: `${authorName} mentioned you`,
        message: preview,
        link: `/lab/teams/${teamId}/moodboard`
      })))
    }
  } catch (notifyError) {
    console.error('Error creating mention notifications:', notifyError)
  }

  // Revalidate the moodboard page so UI updates instantly
  revalidatePath(`/lab/teams/${teamId}/moodboard`)
  return { success: true }
}

/** Fetch all notes for a team */
export async function getTeamNotes(teamId: string): Promise<TeamNote[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const isMember = await requireTeamMember(user.id, teamId)
  if (!isMember) return []

  const { data } = await supabase
    .from('team_notes')
    .select('*, user:profiles(full_name, avatar_url)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
  return (data || []) as TeamNote[]
}

/** Add a new note */
export async function addTeamNote(teamId: string, content: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in' }

  const isMember = await requireTeamMember(user.id, teamId)
  if (!isMember) return { success: false, error: 'You are not a member of this team' }

  const { error } = await supabase.from('team_notes').insert({
    team_id: teamId,
    content,
    created_by: user.id,
  })

  if (error) {
    console.error('Error adding note:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/lab/teams/${teamId}/moodboard`)
  return { success: true }
}
