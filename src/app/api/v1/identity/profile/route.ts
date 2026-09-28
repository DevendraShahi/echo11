import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

interface UpdateProfileBody {
  full_name?: string | null
  avatar_url?: string | null
}

export async function PATCH(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const body = (await request.json()) as UpdateProfileBody

  if (body.full_name === undefined && body.avatar_url === undefined) {
    return apiError(400, 'invalid_request', 'At least one profile field is required')
  }

  const route = '/identity/profile'
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

  const { data: before, error: beforeError } = await context.supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', context.userId)
    .single()

  if (beforeError || !before) {
    const payload = failure('not_found', 'Profile not found') as ApiResponse<{ user_id: string }>
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

  const { data: after, error: updateError } = await context.supabase
    .from('profiles')
    .update({
      ...(body.full_name !== undefined ? { full_name: body.full_name } : {}),
      ...(body.avatar_url !== undefined ? { avatar_url: body.avatar_url } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', context.userId)
    .select('id, full_name, avatar_url')
    .single()

  if (updateError || !after) {
    const payload = failure('internal_error', updateError?.message || 'Failed to update profile') as ApiResponse<{ user_id: string }>
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
    aggregateType: 'profile',
    aggregateId: context.userId,
    eventType: 'identity.profile_updated',
    action: 'update_profile',
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
