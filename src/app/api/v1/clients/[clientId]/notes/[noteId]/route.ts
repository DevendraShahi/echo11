import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'
import { createClient } from '@/lib/supabase/server'

interface UpdateNoteBody {
  content?: string
}

async function canMutateNote(
  userId: string,
  authorId: string | null,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  if (authorId && userId === authorId) return true
  return requireAdminOrLead(supabase, userId)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string; noteId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { clientId, noteId } = await params
  const body = (await request.json()) as UpdateNoteBody
  const content = body.content?.trim()

  if (!content) return apiError(400, 'invalid_request', 'Note content is required')

  const route = `/clients/${clientId}/notes/${noteId}`
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

  const { data: before, error: beforeError } = await context.supabase
    .from('client_notes')
    .select('id, client_id, content, created_by')
    .eq('id', noteId)
    .eq('client_id', clientId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Note not found')
  }

  const allowed = await canMutateNote(context.userId, before.created_by || null, context.supabase)
  if (!allowed) {
    return apiError(403, 'forbidden', 'You cannot update this note')
  }

  const { data: updated, error: updateError } = await context.supabase
    .from('client_notes')
    .update({ content })
    .eq('id', noteId)
    .eq('client_id', clientId)
    .select('id, client_id, content, created_by')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
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

  if (!updated) {
    return apiError(404, 'not_found', 'Note not found')
  }

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'client_note',
    aggregateId: noteId,
    eventType: 'client.note_updated',
    action: 'update_client_note',
    payload: {
      client_id: clientId,
      note_id: noteId,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: (updated || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      note_id: noteId,
      client_id: clientId,
      lock_version: null,
    },
    mutationMeta(noteId, null, artifacts.eventId, artifacts.correlationId)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string; noteId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { clientId, noteId } = await params
  const route = `/clients/${clientId}/notes/${noteId}/delete`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ note_id: string; client_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('client_notes')
    .select('id, client_id, content, created_by')
    .eq('id', noteId)
    .eq('client_id', clientId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Note not found')
  }

  const allowed = await canMutateNote(context.userId, before.created_by || null, context.supabase)
  if (!allowed) {
    return apiError(403, 'forbidden', 'You cannot delete this note')
  }

  const { error: deleteError } = await context.supabase
    .from('client_notes')
    .delete()
    .eq('id', noteId)
    .eq('client_id', clientId)

  if (deleteError) {
    const payload = failure('internal_error', deleteError.message) as ApiResponse<{ note_id: string; client_id: string }>
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
    aggregateId: noteId,
    eventType: 'client.note_deleted',
    action: 'delete_client_note',
    payload: {
      client_id: clientId,
      note_id: noteId,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      note_id: noteId,
      client_id: clientId,
    },
    mutationMeta(noteId, null, artifacts.eventId, artifacts.correlationId)
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
