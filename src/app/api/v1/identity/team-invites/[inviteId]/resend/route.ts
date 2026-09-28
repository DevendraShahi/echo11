import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

type TeamInviteRole = 'admin' | 'member' | 'client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')
  if (!context.isAdmin) return apiError(403, 'forbidden', 'Only admins can resend invites')

  const { inviteId } = await params

  const route = `/identity/team-invites/${inviteId}/resend`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{
    invite_id: string
    email: string
    role: TeamInviteRole
    job_title: string | null
    expires_at: string
  }>({
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
    .select('id, email, role, job_title, status, invited_by, expires_at')
    .eq('id', inviteId)
    .eq('invited_by', context.userId)
    .eq('status', 'pending')
    .single()

  if (beforeError || !before) {
    const payload = failure('not_found', 'Invite not found') as ApiResponse<{
      invite_id: string
      email: string
      role: TeamInviteRole
      job_title: string | null
      expires_at: string
    }>
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

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: after, error: updateError } = await context.supabase
    .from('team_invites')
    .update({
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })
    .eq('id', inviteId)
    .eq('invited_by', context.userId)
    .eq('status', 'pending')
    .select('id, email, role, job_title, expires_at')
    .single()

  if (updateError || !after) {
    const payload = failure('internal_error', updateError?.message || 'Failed to refresh invite') as ApiResponse<{
      invite_id: string
      email: string
      role: TeamInviteRole
      job_title: string | null
      expires_at: string
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
    aggregateType: 'team_invite',
    aggregateId: inviteId,
    eventType: 'identity.team_invite_resent',
    action: 'resend_team_invite',
    payload: {
      invite_id: inviteId,
      email: after.email,
      role: after.role,
      expires_at: after.expires_at,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: (after || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      invite_id: inviteId,
      email: after.email,
      role: after.role as TeamInviteRole,
      job_title: after.job_title,
      expires_at: after.expires_at,
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
