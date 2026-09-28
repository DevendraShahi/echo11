import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

interface CreateNotificationBody {
  user_id?: string
  type?: string
  title?: string
  message?: string | null
  link?: string | null
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const body = (await request.json()) as CreateNotificationBody
  const userId = body.user_id?.trim()
  const title = body.title?.trim()

  if (!userId) return apiError(400, 'invalid_request', 'user_id is required')
  if (!title) return apiError(400, 'invalid_request', 'title is required')

  const route = '/notifications'
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ notification_id: string; user_id: string; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: created, error: createError } = await context.supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: body.type || 'info',
      title,
      message: body.message || null,
      link: body.link || null,
    })
    .select('id, user_id, type, title, message, link, read')
    .single()

  if (createError || !created) {
    const payload = failure('internal_error', createError?.message || 'Failed to create notification') as ApiResponse<{
      notification_id: string
      user_id: string
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
    aggregateType: 'notification',
    aggregateId: created.id,
    eventType: 'notification.created',
    action: 'create_notification',
    payload: {
      notification_id: created.id,
      user_id: userId,
      type: created.type,
      title: created.title,
    },
    afterState: (created || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      notification_id: created.id,
      user_id: userId,
      lock_version: null,
    },
    mutationMeta(created.id, null, artifacts.eventId, artifacts.correlationId)
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
