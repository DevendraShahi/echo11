import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string; documentId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can delete documents')
  }

  const { clientId, documentId } = await params
  const route = `/clients/${clientId}/documents/${documentId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{
    document_id: string
    client_id: string
    storage_path: string | null
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
    .from('client_documents')
    .select('id, client_id, name, storage_path, file_url')
    .eq('id', documentId)
    .eq('client_id', clientId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Document not found')
  }

  const { error: deleteError } = await context.supabase
    .from('client_documents')
    .delete()
    .eq('id', documentId)
    .eq('client_id', clientId)

  if (deleteError) {
    const payload = failure('internal_error', deleteError.message) as ApiResponse<{
      document_id: string
      client_id: string
      storage_path: string | null
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
    aggregateType: 'client_document',
    aggregateId: documentId,
    eventType: 'client.document_deleted',
    action: 'delete_client_document',
    payload: {
      client_id: clientId,
      document_id: documentId,
      storage_path: before.storage_path || null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      document_id: documentId,
      client_id: clientId,
      storage_path: before.storage_path || null,
    },
    mutationMeta(documentId, null, artifacts.eventId, artifacts.correlationId)
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
