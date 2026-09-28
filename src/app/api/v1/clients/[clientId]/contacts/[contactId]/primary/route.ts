import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string; contactId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can change primary contacts')
  }

  const { clientId, contactId } = await params
  const route = `/clients/${clientId}/contacts/${contactId}/primary`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ contact_id: string; client_id: string; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('client_contacts')
    .select('id, client_id, name, is_primary')
    .eq('id', contactId)
    .eq('client_id', clientId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Contact not found')
  }

  const { error: resetError } = await context.supabase
    .from('client_contacts')
    .update({ is_primary: false })
    .eq('client_id', clientId)

  if (resetError) {
    const payload = failure('internal_error', resetError.message) as ApiResponse<{
      contact_id: string
      client_id: string
      lock_version: null
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

  const { error: updateError } = await context.supabase
    .from('client_contacts')
    .update({ is_primary: true })
    .eq('id', contactId)
    .eq('client_id', clientId)

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
      contact_id: string
      client_id: string
      lock_version: null
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
    aggregateType: 'client_contact',
    aggregateId: contactId,
    eventType: 'client.contact_primary_set',
    action: 'set_primary_contact',
    payload: {
      client_id: clientId,
      contact_id: contactId,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: {
      id: contactId,
      client_id: clientId,
      is_primary: true,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      contact_id: contactId,
      client_id: clientId,
      lock_version: null,
    },
    mutationMeta(contactId, null, artifacts.eventId, artifacts.correlationId)
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
