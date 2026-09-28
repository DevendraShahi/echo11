import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canAccessClientThread, getAuthenticatedAgencyMessageContext } from '@/lib/api/v1/messages-access'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const agency = await getAuthenticatedAgencyMessageContext(context.supabase, context.userId)
  if (!agency) return apiError(403, 'forbidden', 'Only agency team members can mark thread read')

  const { clientId } = await params
  const hasAccess = await canAccessClientThread(context.supabase, agency, clientId)
  if (!hasAccess) {
    return apiError(403, 'forbidden', 'You do not have access to this client conversation')
  }

  const route = `/messages/team/${clientId}/read`
  const idempotencyKey = request.headers.get('idempotency-key')

  const idempotency = await beginIdempotency<{ client_id: string; updated_count: number }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: unreadRows, error: unreadError } = await context.supabase
    .from('client_messages')
    .select('id')
    .eq('client_id', clientId)
    .eq('sender_type', 'client')
    .eq('read_by_team', false)

  if (unreadError) {
    const payload = failure('internal_error', unreadError.message) as ApiResponse<{ client_id: string; updated_count: number }>
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

  const unreadIds = (unreadRows || []).map((row) => row.id)

  if (unreadIds.length > 0) {
    const { error: updateError } = await context.supabase
      .from('client_messages')
      .update({ read_by_team: true })
      .in('id', unreadIds)

    if (updateError) {
      const payload = failure('internal_error', updateError.message) as ApiResponse<{ client_id: string; updated_count: number }>
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
  }

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'client_message_thread',
    aggregateId: clientId,
    eventType: 'message.team_marked_read',
    action: 'mark_team_messages_read',
    payload: {
      client_id: clientId,
      updated_count: unreadIds.length,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      client_id: clientId,
      updated_count: unreadIds.length,
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
