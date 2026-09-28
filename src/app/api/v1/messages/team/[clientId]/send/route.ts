import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import {
  ApiClientMessage,
  canAccessClientThread,
  getAuthenticatedAgencyMessageContext,
} from '@/lib/api/v1/messages-access'

interface SendTeamMessageBody {
  content?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const agency = await getAuthenticatedAgencyMessageContext(context.supabase, context.userId)
  if (!agency) return apiError(403, 'forbidden', 'Only agency team members can send messages')

  const { clientId } = await params
  const hasAccess = await canAccessClientThread(context.supabase, agency, clientId)
  if (!hasAccess) {
    return apiError(403, 'forbidden', 'You do not have access to this client conversation')
  }

  const body = (await request.json()) as SendTeamMessageBody
  const content = body.content?.trim()

  if (!content) {
    return apiError(400, 'invalid_request', 'Message cannot be empty')
  }

  const route = `/messages/team/${clientId}/send`
  const idempotencyKey = request.headers.get('idempotency-key')

  const idempotency = await beginIdempotency<{ message: ApiClientMessage }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const senderName = agency.fullName || 'Echo11 Team'

  const { data: message, error } = await context.supabase
    .from('client_messages')
    .insert({
      client_id: clientId,
      sender_type: 'team',
      sender_name: senderName,
      content,
      read_by_client: false,
      read_by_team: true,
    })
    .select('*')
    .single()

  if (error || !message) {
    const payload = failure('internal_error', error?.message || 'Failed to send message') as ApiResponse<{ message: ApiClientMessage }>

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
    aggregateType: 'client_message',
    aggregateId: message.id,
    eventType: 'message.team_sent',
    action: 'send_team_message',
    payload: {
      client_id: clientId,
      sender_type: 'team',
    },
    afterState: message as Record<string, unknown>,
    idempotencyKey,
  })

  const payload = success(
    { message: message as ApiClientMessage },
    mutationMeta(message.id, null, artifacts.eventId, artifacts.correlationId)
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
