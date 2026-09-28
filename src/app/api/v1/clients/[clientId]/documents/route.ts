import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

interface CreateDocumentMetadataBody {
  name?: string
  file_url?: string
  file_type?: string | null
  file_size?: number | null
  storage_path?: string
  category?: 'contract' | 'invoice' | 'brief' | 'asset' | 'other'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can upload documents')
  }

  const { clientId } = await params
  const body = (await request.json()) as CreateDocumentMetadataBody

  const name = body.name?.trim()
  const fileUrl = body.file_url?.trim()
  const storagePath = body.storage_path?.trim()

  if (!name) return apiError(400, 'invalid_request', 'Document name is required')
  if (!fileUrl) return apiError(400, 'invalid_request', 'file_url is required')
  if (!storagePath) return apiError(400, 'invalid_request', 'storage_path is required')

  const route = `/clients/${clientId}/documents`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ document_id: string; client_id: string; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: created, error: createError } = await context.supabase
    .from('client_documents')
    .insert({
      client_id: clientId,
      name,
      file_url: fileUrl,
      file_type: body.file_type || null,
      file_size: body.file_size ?? null,
      storage_path: storagePath,
      category: body.category || 'other',
      uploaded_by: context.userId,
    })
    .select('id, client_id, name, file_url, file_type, file_size, storage_path, category, uploaded_by')
    .single()

  if (createError || !created) {
    const payload = failure('internal_error', createError?.message || 'Failed to create document metadata') as ApiResponse<{
      document_id: string
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
    aggregateType: 'client_document',
    aggregateId: created.id,
    eventType: 'client.document_created',
    action: 'create_client_document',
    payload: {
      client_id: clientId,
      document_id: created.id,
      storage_path: created.storage_path,
    },
    afterState: (created || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      document_id: created.id,
      client_id: clientId,
      lock_version: null,
    },
    mutationMeta(created.id, null, artifacts.eventId, artifacts.correlationId)
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
