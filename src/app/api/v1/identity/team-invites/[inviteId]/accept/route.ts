import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

interface AcceptTeamInviteBody {
  user_id?: string
  full_name?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { inviteId } = await params
  const body = (await request.json()) as AcceptTeamInviteBody
  const userId = body.user_id?.trim()

  if (!userId) {
    return apiError(400, 'invalid_request', 'user_id is required')
  }

  if (userId !== context.userId) {
    return apiError(403, 'forbidden', 'You can only accept invites for your own account')
  }

  const route = `/identity/team-invites/${inviteId}/accept`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ invite_id: string; user_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('team_invites')
    .select('id, email, role, status, expires_at')
    .eq('id', inviteId)
    .maybeSingle()

  const { data: accepted, error: acceptError } = await context.supabase.rpc('accept_team_invite', {
    p_invite_id: inviteId,
    p_user_id: userId,
    p_full_name: body.full_name || '',
  })

  if (acceptError) {
    const payload = failure('internal_error', acceptError.message) as ApiResponse<{ invite_id: string; user_id: string }>
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
    const payload = failure('not_found', 'Invite not found or expired') as ApiResponse<{ invite_id: string; user_id: string }>
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
    aggregateType: 'team_invite',
    aggregateId: inviteId,
    eventType: 'identity.team_invite_accepted',
    action: 'accept_team_invite',
    payload: {
      invite_id: inviteId,
      user_id: userId,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: {
      invite_id: inviteId,
      user_id: userId,
      status: 'accepted',
    },
    idempotencyKey,
  })

  const payload = success(
    {
      invite_id: inviteId,
      user_id: userId,
    },
    mutationMeta(inviteId, null, artifacts.eventId, artifacts.correlationId)
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
