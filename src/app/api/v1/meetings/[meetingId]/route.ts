import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageProject, requireAdminOrLead } from '@/lib/api/v1/permissions'

interface UpdateMeetingBody {
  title?: string
  description?: string | null
  project_id?: string | null
  scheduled_at?: string
  duration_minutes?: number
  video_link?: string | null
  location?: string | null
  notes?: string | null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { meetingId } = await params
  const { data, error } = await context.supabase
    .from('meetings')
    .select(`
      *,
      project:projects(id, name)
    `)
    .eq('id', meetingId)
    .single()

  if (error || !data) return apiError(404, 'not_found', 'Meeting not found')
  return apiOk(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { meetingId } = await params
  const body = (await request.json()) as UpdateMeetingBody

  if (body.title !== undefined && !body.title.trim()) {
    return apiError(400, 'invalid_request', 'Meeting title cannot be empty')
  }

  if (body.duration_minutes !== undefined && body.duration_minutes <= 0) {
    return apiError(400, 'invalid_request', 'duration_minutes must be greater than 0')
  }

  const route = `/meetings/${meetingId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ meeting_id: string; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('meetings')
    .select('id, title, description, project_id, scheduled_at, duration_minutes, video_link, location, notes')
    .eq('id', meetingId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Meeting not found')
  }

  const targetProjectId = body.project_id !== undefined ? body.project_id : before.project_id
  const allowed = targetProjectId
    ? await canManageProject(context.supabase, context.userId, targetProjectId)
    : await requireAdminOrLead(context.supabase, context.userId)

  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can update this meeting')
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.title !== undefined) updateData.title = body.title.trim()
  if (body.description !== undefined) updateData.description = body.description
  if (body.project_id !== undefined) updateData.project_id = body.project_id
  if (body.scheduled_at !== undefined) updateData.scheduled_at = body.scheduled_at
  if (body.duration_minutes !== undefined) updateData.duration_minutes = body.duration_minutes
  if (body.video_link !== undefined) updateData.video_link = body.video_link
  if (body.location !== undefined) updateData.location = body.location
  if (body.notes !== undefined) updateData.notes = body.notes

  const { data: updated, error: updateError } = await context.supabase
    .from('meetings')
    .update(updateData)
    .eq('id', meetingId)
    .select('id, title, description, project_id, scheduled_at, duration_minutes, video_link, location, notes')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
      meeting_id: string
      lock_version: null
    }>

    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 500,
    })

    return Response.json(payload, { status: 500 })
  }

  if (!updated) {
    const payload = failure('not_found', 'Meeting not found') as ApiResponse<{
      meeting_id: string
      lock_version: null
    }>

    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 404,
    })

    return Response.json(payload, { status: 404 })
  }

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'meeting',
    aggregateId: meetingId,
    eventType: 'meeting.updated',
    action: 'update_meeting',
    payload: {
      changed_fields: Object.keys(body),
      project_id: updated.project_id || null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: (updated || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      meeting_id: meetingId,
      lock_version: null,
    },
    mutationMeta(meetingId, null, artifacts.eventId, artifacts.correlationId)
  )

  await finalizeIdempotency({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
    response: payload,
    statusCode: 200,
  })

  return apiOk(payload.data, { meta: payload.meta })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { meetingId } = await params
  const route = `/meetings/${meetingId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ meeting_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('meetings')
    .select('id, title, project_id, scheduled_at')
    .eq('id', meetingId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Meeting not found')
  }

  const allowed = before.project_id
    ? await canManageProject(context.supabase, context.userId, before.project_id)
    : await requireAdminOrLead(context.supabase, context.userId)

  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can delete this meeting')
  }

  const { error: deleteError } = await context.supabase
    .from('meetings')
    .delete()
    .eq('id', meetingId)

  if (deleteError) {
    const payload = failure('internal_error', deleteError.message) as ApiResponse<{ meeting_id: string }>
    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 500,
    })

    return Response.json(payload, { status: 500 })
  }

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'meeting',
    aggregateId: meetingId,
    eventType: 'meeting.deleted',
    action: 'delete_meeting',
    payload: {
      title: before.title,
      project_id: before.project_id || null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      meeting_id: meetingId,
    },
    mutationMeta(meetingId, null, artifacts.eventId, artifacts.correlationId)
  )

  await finalizeIdempotency({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
    response: payload,
    statusCode: 200,
  })

  return apiOk(payload.data, { meta: payload.meta })
}
