import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { notificationId } = await params
  const route = `/notifications/${notificationId}/read`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ notification_id: string; read: true; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('notifications')
    .select('id, user_id, read, title')
    .eq('id', notificationId)
    .eq('user_id', context.userId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Notification not found')
  }

  const { error: updateError } = await context.supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', context.userId)

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
      notification_id: string
      read: true
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
    aggregateId: notificationId,
    eventType: 'notification.read',
    action: 'mark_notification_read',
    payload: {
      notification_id: notificationId,
      user_id: context.userId,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: {
      id: notificationId,
      user_id: context.userId,
      read: true,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      notification_id: notificationId,
      read: true as const,
      lock_version: null,
    },
    mutationMeta(notificationId, null, artifacts.eventId, artifacts.correlationId)
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
