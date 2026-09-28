import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')
  if (!context.isAdmin) return apiError(403, 'forbidden', 'Only admins can cancel invites')

  const { inviteId } = await params

  const route = `/identity/team-invites/${inviteId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ invite_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('team_invites')
    .select('id, email, role, status, invited_by, expires_at')
    .eq('id', inviteId)
    .eq('invited_by', context.userId)
    .single()

  if (beforeError || !before) {
    const payload = failure('not_found', 'Invite not found') as ApiResponse<{ invite_id: string }>
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

  const { error: deleteError } = await context.supabase
    .from('team_invites')
    .delete()
    .eq('id', inviteId)
    .eq('invited_by', context.userId)

  if (deleteError) {
    const payload = failure('internal_error', deleteError.message) as ApiResponse<{ invite_id: string }>
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
    aggregateType: 'team_invite',
    aggregateId: inviteId,
    eventType: 'identity.team_invite_cancelled',
    action: 'cancel_team_invite',
    payload: {
      invite_id: inviteId,
      email: before.email,
      role: before.role,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      invite_id: inviteId,
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
