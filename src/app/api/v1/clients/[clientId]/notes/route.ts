import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

interface CreateNoteBody {
  content?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { clientId } = await params
  const body = (await request.json()) as CreateNoteBody
  const content = body.content?.trim()

  if (!content) return apiError(400, 'invalid_request', 'Note content is required')

  const route = `/clients/${clientId}/notes`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ note_id: string; client_id: string; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: note, error: createError } = await context.supabase
    .from('client_notes')
    .insert({
      client_id: clientId,
      content,
      created_by: context.userId,
    })
    .select('id, client_id, content, created_by')
    .single()

  if (createError || !note) {
    const payload = failure('internal_error', createError?.message || 'Failed to create note') as ApiResponse<{
      note_id: string
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
    aggregateType: 'client_note',
    aggregateId: note.id,
    eventType: 'client.note_created',
    action: 'create_client_note',
    payload: {
      client_id: clientId,
      note_id: note.id,
    },
    afterState: (note || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      note_id: note.id,
      client_id: clientId,
      lock_version: null,
    },
    mutationMeta(note.id, null, artifacts.eventId, artifacts.correlationId)
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
