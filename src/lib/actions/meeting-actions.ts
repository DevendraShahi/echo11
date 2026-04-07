'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface MeetingFormData {
  title: string
  description?: string | null
  project_id?: string | null
  scheduled_at: string
  duration_minutes: number
  video_link?: string | null
  location?: string | null
  notes?: string | null
}

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export async function createMeeting(data: MeetingFormData): Promise<{ success: boolean; error?: string; meetingId?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        title: data.title,
        description: data.description || null,
        project_id: data.project_id || null,
        scheduled_at: data.scheduled_at,
        duration_minutes: data.duration_minutes,
        video_link: data.video_link || null,
        location: data.location || null,
        notes: data.notes || null,
        created_by: userId
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Log activity
    try {
      await supabase.from('activities').insert({
        user_id: userId,
        action: 'created meeting',
        entity_type: 'meeting',
        entity_id: meeting.id,
        metadata: { title: data.title }
      })
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError)
    }

    revalidatePath('/lab/meetings')

    return { success: true, meetingId: meeting.id }
  } catch (error) {
    console.error('Error creating meeting:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateMeeting(id: string, data: Partial<MeetingFormData>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('meetings')
      .update({
        title: data.title,
        description: data.description,
        project_id: data.project_id,
        scheduled_at: data.scheduled_at,
        duration_minutes: data.duration_minutes,
        video_link: data.video_link,
        location: data.location,
        notes: data.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/meetings')
    revalidatePath(`/lab/meetings/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating meeting:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteMeeting(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/meetings')

    return { success: true }
  } catch (error) {
    console.error('Error deleting meeting:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getProjectsForMeetingForm() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('projects')
    .select('id, name, status')
    .eq('status', 'active')
    .order('name', { ascending: true })

  return data || []
}

export async function getTeamMembersForMeeting() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .order('full_name', { ascending: true })

  return data || []
}