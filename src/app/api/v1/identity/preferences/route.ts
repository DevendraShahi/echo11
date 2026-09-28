import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

interface UpdatePreferencesBody {
  email_notifications?: boolean
  task_reminders?: boolean
  meeting_reminders?: boolean
  theme?: string | null
}

export async function PATCH(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const body = (await request.json()) as UpdatePreferencesBody

  if (
    body.email_notifications === undefined &&
    body.task_reminders === undefined &&
    body.meeting_reminders === undefined &&
    body.theme === undefined
  ) {
    return apiError(400, 'invalid_request', 'At least one preference field is required')
  }

  const route = '/identity/preferences'
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ user_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('user_preferences')
    .select('user_id, email_notifications, task_reminders, meeting_reminders, theme')
    .eq('user_id', context.userId)
    .maybeSingle()

  const { data: after, error: upsertError } = await context.supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: context.userId,
        ...(body.email_notifications !== undefined ? { email_notifications: body.email_notifications } : {}),
        ...(body.task_reminders !== undefined ? { task_reminders: body.task_reminders } : {}),
        ...(body.meeting_reminders !== undefined ? { meeting_reminders: body.meeting_reminders } : {}),
        ...(body.theme !== undefined ? { theme: body.theme } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('user_id, email_notifications, task_reminders, meeting_reminders, theme')
    .single()

  if (upsertError || !after) {
    const payload = failure('internal_error', upsertError?.message || 'Failed to update preferences') as ApiResponse<{ user_id: string }>
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

  const changedFields = Object.keys(body).filter((key) => (body as Record<string, unknown>)[key] !== undefined)
  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'user_preference',
    aggregateId: context.userId,
    eventType: 'identity.preferences_updated',
    action: 'update_preferences',
    payload: {
      user_id: context.userId,
      changed_fields: changedFields,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: (after || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      user_id: context.userId,
    },
    mutationMeta(context.userId, null, artifacts.eventId, artifacts.correlationId)
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
