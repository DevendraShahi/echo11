'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notification-actions'
import { requireAdminOrLead } from './role-helpers'

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
    let projectTeamId: string | null | undefined = null

    if (data.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('team_id')
        .eq('id', data.project_id)
        .single()

      projectTeamId = project?.team_id
      const allowed = await requireAdminOrLead(userId, projectTeamId)
      if (!allowed) {
        return { success: false, error: 'Only admins or team leads can create meetings for this project' }
      }
    } else {
      const allowed = await requireAdminOrLead(userId, null)
      if (!allowed) {
        return { success: false, error: 'Only admins or team leads can create organization-wide meetings' }
      }
    }

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

    if (meeting.project_id) {
      try {
        const { data: project } = await supabase
          .from('projects')
          .select('team_id, name')
          .eq('id', meeting.project_id)
          .single()

        if (project?.team_id) {
          const { data: members } = await supabase
            .from('profiles')
            .select('id')
            .eq('team_id', project.team_id)

          if (members) {
            await Promise.all(
              members
                .filter(m => m.id !== userId)
                .map(m => createNotification({
                  userId: m.id,
                  type: 'meeting',
                  title: 'New Meeting Scheduled',
                  message: `${data.title} (${project.name})`,
                  link: `/lab/meetings`
                }))
            )
          }
        }
      } catch (notifyErr) {
        console.warn('Failed to dispatch meeting notifications', notifyErr)
      }
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
    const { data: existing } = await supabase
      .from('meetings')
      .select('project_id, title')
      .eq('id', id)
      .single()

    const targetProjectId = data.project_id ?? existing?.project_id ?? null
    let targetTeamId: string | null | undefined = null

    if (targetProjectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('team_id')
        .eq('id', targetProjectId)
        .single()
      targetTeamId = project?.team_id
      const allowed = await requireAdminOrLead(userId, targetTeamId)
      if (!allowed) {
        return { success: false, error: 'Only admins or team leads can update this meeting' }
      }
    } else {
      const allowed = await requireAdminOrLead(userId, null)
      if (!allowed) {
        return { success: false, error: 'Only admins or team leads can update this meeting' }
      }
    }

    const { error } = await supabase
      .from('meetings')
      .update({
        title: data.title,
        description: data.description,
        project_id: targetProjectId,
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

    if (targetProjectId) {
      try {
        const { data: project } = await supabase
          .from('projects')
          .select('team_id, name')
          .eq('id', targetProjectId)
          .single()

        if (project?.team_id) {
          const { data: members } = await supabase
            .from('profiles')
            .select('id')
            .eq('team_id', project.team_id)

          if (members) {
            await Promise.all(
              members
                .filter(m => m.id !== userId)
                .map(m => createNotification({
                  userId: m.id,
                  type: 'meeting',
                  title: 'Meeting Updated',
                  message: data.title || existing?.title || 'A meeting was updated.',
                  link: `/lab/meetings`
                }))
            )
          }
        }
      } catch (notifyErr) {
        console.warn('Failed to dispatch meeting notifications', notifyErr)
      }
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
    const { data: meeting } = await supabase
      .from('meetings')
      .select('project_id, title')
      .eq('id', id)
      .single()

    if (!meeting) {
      return { success: false, error: 'Meeting not found' }
    }

    let projectTeamId: string | null | undefined = null

    if (meeting.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('team_id, name')
        .eq('id', meeting.project_id)
        .single()
      projectTeamId = project?.team_id
    }

    const allowed = await requireAdminOrLead(userId, projectTeamId || null)
    if (!allowed) {
      return { success: false, error: 'Only admins or team leads can delete this meeting' }
    }

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    try {
      if (meeting.project_id && projectTeamId) {
        const { data: members } = await supabase
          .from('profiles')
          .select('id')
          .eq('team_id', projectTeamId)

        if (members) {
          await Promise.all(
            members
              .filter(m => m.id !== userId)
              .map(m => createNotification({
                userId: m.id,
                type: 'meeting',
                title: 'Meeting Cancelled',
                message: meeting.title,
                link: `/lab/meetings`
              }))
          )
        }
      }
    } catch (notifyErr) {
      console.warn('Failed to dispatch meeting delete notifications', notifyErr)
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
