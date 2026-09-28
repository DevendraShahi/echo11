'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notification-actions'
import { revalidateClientSurface, revalidateLegacyPortalSurface } from './client-surface-revalidate'
import { callApiV1 } from '@/lib/api/v1/internal-client'
import { isApiFailure } from '@/lib/api/v1/contracts'

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

function nextIdempotencyKey(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export async function createMeeting(data: MeetingFormData): Promise<{ success: boolean; error?: string; meetingId?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const createResponse = await callApiV1<{ meeting_id: string; lock_version: number | null }>('/meetings', {
      method: 'POST',
      body: data,
      idempotencyKey: nextIdempotencyKey('meeting-create'),
    })

    if (isApiFailure(createResponse)) {
      return { success: false, error: createResponse.error.message }
    }

    const meetingId = createResponse.data.meeting_id

    try {
      await supabase.from('activities').insert({
        user_id: userId,
        action: 'created meeting',
        entity_type: 'meeting',
        entity_id: meetingId,
        metadata: { title: data.title }
      })
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError)
    }

    if (data.project_id) {
      try {
        const { data: project } = await supabase
          .from('projects')
          .select('team_id, name')
          .eq('id', data.project_id)
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
    revalidateClientSurface({ projectId: data.project_id || null })
    revalidateLegacyPortalSurface()

    return { success: true, meetingId }
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
    const { data: existing, error: existingError } = await supabase
      .from('meetings')
      .select('project_id, title')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return { success: false, error: 'Meeting not found' }
    }

    const targetProjectId = data.project_id ?? existing.project_id ?? null

    const updateResponse = await callApiV1<{ meeting_id: string; lock_version: number | null }>(`/meetings/${id}`, {
      method: 'PATCH',
      body: data,
      idempotencyKey: nextIdempotencyKey('meeting-update'),
    })

    if (isApiFailure(updateResponse)) {
      return { success: false, error: updateResponse.error.message }
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
    revalidateClientSurface({ projectId: targetProjectId })
    revalidateLegacyPortalSurface()

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
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('project_id, title')
      .eq('id', id)
      .single()

    if (meetingError || !meeting) {
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

    const deleteResponse = await callApiV1<{ meeting_id: string }>(`/meetings/${id}`, {
      method: 'DELETE',
      idempotencyKey: nextIdempotencyKey('meeting-delete'),
    })

    if (isApiFailure(deleteResponse)) {
      return { success: false, error: deleteResponse.error.message }
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
    revalidateClientSurface({ projectId: meeting.project_id })
    revalidateLegacyPortalSurface()

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
