import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

interface InviteClientBody {
  invitation_token?: string
  invitation_sent_at?: string | null
  invitation_token_expires_at?: string | null
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can send client invitations')
  }

  const { clientId } = await params
  const body = (await request.json()) as InviteClientBody
  const invitationToken = body.invitation_token?.trim()

  if (!invitationToken) {
    return apiError(400, 'invalid_request', 'invitation_token is required')
  }

  const route = `/clients/${clientId}/invite`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ client_id: string; lock_version: number | null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('clients')
    .select('id, auth_id, invitation_sent_at, invitation_token_expires_at, lock_version')
    .eq('id', clientId)
    .single()

  if (beforeError || !before) {
    const payload = failure('not_found', 'Client not found') as ApiResponse<{
      client_id: string
      lock_version: number | null
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

  if (before.auth_id) {
    const payload = failure('conflict', 'Client already has client access') as ApiResponse<{
      client_id: string
      lock_version: number | null
    }>
    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 409,
    })

    return Response.json(payload, { status: 409 })
  }

  const { data: after, error: updateError } = await context.supabase
    .from('clients')
    .update({
      invitation_sent_at: body.invitation_sent_at || new Date().toISOString(),
      invitation_token: invitationToken,
      invitation_token_expires_at: body.invitation_token_expires_at || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId)
    .select('id, lock_version, invitation_sent_at, invitation_token_expires_at')
    .single()

  if (updateError || !after) {
    const payload = failure('internal_error', updateError?.message || 'Failed to save invitation') as ApiResponse<{
      client_id: string
      lock_version: number | null
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
    aggregateType: 'client',
    aggregateId: clientId,
    eventType: 'client.portal_invited',
    action: 'invite_client_portal',
    payload: {
      client_id: clientId,
      invitation_token_set: true,
      invitation_token_expires_at: after.invitation_token_expires_at,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: (after || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const lockVersion = after.lock_version ?? null
  const payload = success(
    {
      client_id: clientId,
      lock_version: lockVersion,
    },
    mutationMeta(clientId, lockVersion, artifacts.eventId, artifacts.correlationId)
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
