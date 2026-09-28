import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

interface UpdatePasswordBody {
  current_password?: string
  new_password?: string
}

export async function PUT(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const body = (await request.json()) as UpdatePasswordBody
  const currentPassword = body.current_password || ''
  const newPassword = body.new_password || ''

  if (!currentPassword || !newPassword) {
    return apiError(400, 'invalid_request', 'current_password and new_password are required')
  }

  if (newPassword.length < 6) {
    return apiError(400, 'invalid_request', 'New password must be at least 6 characters')
  }

  const route = '/identity/password'
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

  const {
    data: { user },
  } = await context.supabase.auth.getUser()

  if (!user?.email) {
    const payload = failure('invalid_request', 'Authenticated user email is missing') as ApiResponse<{ user_id: string }>
    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 400,
    })
    return Response.json(payload, { status: 400 })
  }

  const { error: verifyError } = await context.supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (verifyError) {
    const payload = failure('invalid_request', 'Current password is incorrect') as ApiResponse<{ user_id: string }>
    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 400,
    })

    return Response.json(payload, { status: 400 })
  }

  const { error: updateError } = await context.supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{ user_id: string }>
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
    aggregateType: 'identity_credential',
    aggregateId: context.userId,
    eventType: 'identity.password_changed',
    action: 'change_password',
    payload: {
      user_id: context.userId,
      credential: 'password',
    },
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
