import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can delete project tags')
  }

  const { tagId } = await params
  const route = `/project-tags/${tagId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ tag_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('project_tags')
    .select('id, name, color')
    .eq('id', tagId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Project tag not found')
  }

  const { error: deleteError } = await context.supabase
    .from('project_tags')
    .delete()
    .eq('id', tagId)

  if (deleteError) {
    const payload = failure('internal_error', deleteError.message) as ApiResponse<{ tag_id: string }>
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
    aggregateType: 'project_tag',
    aggregateId: tagId,
    eventType: 'project_tag.deleted',
    action: 'delete_project_tag',
    payload: {
      tag_id: tagId,
      name: before.name,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      tag_id: tagId,
    },
    mutationMeta(tagId, null, artifacts.eventId, artifacts.correlationId)
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
