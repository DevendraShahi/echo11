import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { getAuthenticatedClientMessageContext, ApiClientMessage } from '@/lib/api/v1/messages-access'

interface SendClientMessageBody {
  content?: string
}

export async function GET() {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const clientContext = await getAuthenticatedClientMessageContext(context.supabase, context.userId)
  if (!clientContext) return apiError(403, 'forbidden', 'Client profile not found')

  const { data: messages, error } = await context.supabase
    .from('client_messages')
    .select('*')
    .eq('client_id', clientContext.clientId)
    .order('created_at', { ascending: false })

  if (error) return apiError(500, 'internal_error', error.message)
  return apiOk((messages || []) as ApiClientMessage[])
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const clientContext = await getAuthenticatedClientMessageContext(context.supabase, context.userId)
  if (!clientContext) return apiError(403, 'forbidden', 'Client profile not found')

  const body = (await request.json()) as SendClientMessageBody
  const content = body.content?.trim()

  if (!content) {
    return apiError(400, 'invalid_request', 'Message cannot be empty')
  }

  const route = '/messages/client'
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

  const { data: profile } = await context.supabase
    .from('profiles')
    .select('full_name')
    .eq('id', context.userId)
    .single()

  const senderName = profile?.full_name || clientContext.companyName || 'Client'

  const { data: message, error } = await context.supabase
    .from('client_messages')
    .insert({
      client_id: clientContext.clientId,
      sender_type: 'client',
      sender_name: senderName,
      content,
      read_by_client: true,
      read_by_team: false,
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
    eventType: 'message.client_sent',
    action: 'send_client_message',
    payload: {
      client_id: clientContext.clientId,
      sender_type: 'client',
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
