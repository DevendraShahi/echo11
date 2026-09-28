import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

export async function PUT(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) {
    return Response.json(
      { ok: false, error: { code: 'unauthorized', message: 'You must be logged in' } },
      { status: 401 }
    )
  }

  const route = '/notifications/read-all'
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ updated_count: number; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { count: unreadBeforeCount } = await context.supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', context.userId)
    .eq('read', false)

  const { error: updateError } = await context.supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', context.userId)
    .eq('read', false)

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
      updated_count: number
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

  const updatedCount = unreadBeforeCount || 0

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'notification_inbox',
    aggregateId: context.userId,
    eventType: 'notification.read_all',
    action: 'mark_all_notifications_read',
    payload: {
      user_id: context.userId,
      updated_count: updatedCount,
    },
    beforeState: {
      unread_count: unreadBeforeCount || 0,
    },
    afterState: {
      unread_count: 0,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      updated_count: updatedCount,
      lock_version: null,
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
