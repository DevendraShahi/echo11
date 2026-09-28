import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

interface AcceptClientInviteBody {
  client_id?: string
  auth_user_id?: string
  full_name?: string
  invite_email?: string | null
}

export async function PUT(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const body = (await request.json()) as AcceptClientInviteBody
  const clientId = body.client_id?.trim()
  const authUserId = body.auth_user_id?.trim()

  if (!clientId || !authUserId) {
    return apiError(400, 'invalid_request', 'client_id and auth_user_id are required')
  }

  if (authUserId !== context.userId) {
    return apiError(403, 'forbidden', 'You can only accept invites for your own account')
  }

  const route = '/clients/invites/accept'
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ client_id: string; user_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('clients')
    .select('id, email, auth_id, invitation_token_expires_at')
    .eq('id', clientId)
    .maybeSingle()

  const { data: accepted, error: acceptError } = await context.supabase.rpc('accept_client_invite', {
    p_client_id: clientId,
    p_auth_user_id: authUserId,
    p_full_name: body.full_name || '',
    p_invite_email: body.invite_email || null,
  })

  if (acceptError) {
    const payload = failure('internal_error', acceptError.message) as ApiResponse<{ client_id: string; user_id: string }>
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

  if (!accepted) {
    const payload = failure('invalid_request', 'Invite is invalid, expired, or does not match your account') as ApiResponse<{
      client_id: string
      user_id: string
    }>

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

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'client_invite',
    aggregateId: clientId,
    eventType: 'client.invite_accepted',
    action: 'accept_client_invite',
    payload: {
      client_id: clientId,
      user_id: authUserId,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: {
      client_id: clientId,
      user_id: authUserId,
      status: 'accepted',
    },
    idempotencyKey,
  })

  const payload = success(
    {
      client_id: clientId,
      user_id: authUserId,
    },
    mutationMeta(clientId, null, artifacts.eventId, artifacts.correlationId)
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
