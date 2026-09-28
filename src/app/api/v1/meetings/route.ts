import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageProject, requireAdminOrLead } from '@/lib/api/v1/permissions'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

interface CreateMeetingBody {
  title?: string
  description?: string | null
  project_id?: string | null
  scheduled_at?: string
  duration_minutes?: number
  video_link?: string | null
  location?: string | null
  notes?: string | null
}

export async function GET() {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { data, error } = await context.supabase
    .from('meetings')
    .select(`
      id,
      title,
      description,
      project_id,
      scheduled_at,
      duration_minutes,
      video_link,
      location,
      notes,
      created_by,
      created_at,
      updated_at,
      project:projects(name)
    `)
    .order('scheduled_at', { ascending: true })

  if (error) return apiError(500, 'internal_error', error.message)

  return apiOk(data || [])
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const body = (await request.json()) as CreateMeetingBody
  const title = body.title?.trim()

  if (!title) return apiError(400, 'invalid_request', 'Meeting title is required')
  if (!body.scheduled_at) return apiError(400, 'invalid_request', 'scheduled_at is required')
  if (!body.duration_minutes || body.duration_minutes <= 0) {
    return apiError(400, 'invalid_request', 'duration_minutes must be greater than 0')
  }

  const projectId = body.project_id || null
  const allowed = projectId
    ? await canManageProject(context.supabase, context.userId, projectId)
    : await requireAdminOrLead(context.supabase, context.userId)

  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can create meetings')
  }

  const route = '/meetings'
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

  const insertPayload = {
    title,
    description: body.description || null,
    project_id: projectId,
    scheduled_at: body.scheduled_at,
    duration_minutes: body.duration_minutes,
    video_link: body.video_link || null,
    location: body.location || null,
    notes: body.notes || null,
    created_by: context.userId,
    organization_id: context.organizationId,
  }

  let insert = await context.supabase
    .from('meetings')
    .insert(insertPayload)
    .select('id, title, project_id, scheduled_at, duration_minutes')
    .single()

  if (insert.error && isMissingRelationOrColumnError(insert.error)) {
    const legacyInsertPayload = { ...insertPayload }
    delete (legacyInsertPayload as Record<string, unknown>).organization_id

    insert = await context.supabase
      .from('meetings')
      .insert(legacyInsertPayload)
      .select('id, title, project_id, scheduled_at, duration_minutes')
      .single()
  }

  if (insert.error || !insert.data) {
    const payload = failure('internal_error', insert.error?.message || 'Failed to create meeting') as ApiResponse<{
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

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'meeting',
    aggregateId: insert.data.id,
    eventType: 'meeting.created',
    action: 'create_meeting',
    payload: {
      title,
      project_id: projectId,
      scheduled_at: body.scheduled_at,
      duration_minutes: body.duration_minutes,
    },
    afterState: {
      id: insert.data.id,
      title,
      project_id: projectId,
      scheduled_at: body.scheduled_at,
      duration_minutes: body.duration_minutes,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      meeting_id: insert.data.id,
      lock_version: null,
    },
    mutationMeta(insert.data.id, null, artifacts.eventId, artifacts.correlationId)
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
