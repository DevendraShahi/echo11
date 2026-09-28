import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageProject } from '@/lib/api/v1/permissions'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; tagId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { projectId, tagId } = await params
  const allowed = await canManageProject(context.supabase, context.userId, projectId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'You cannot update tags for this project')
  }

  const route = `/projects/${projectId}/tags/${tagId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ project_id: string; tag_id: string; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: existingTag } = await context.supabase
    .from('project_tags')
    .select('id')
    .eq('id', tagId)
    .maybeSingle()

  if (!existingTag) {
    return apiError(404, 'not_found', 'Project tag not found')
  }

  const { error: assignError } = await context.supabase
    .from('project_tag_assignments')
    .upsert(
      {
        project_id: projectId,
        tag_id: tagId,
      },
      {
        onConflict: 'project_id,tag_id',
        ignoreDuplicates: true,
      }
    )

  if (assignError) {
    const payload = failure('internal_error', assignError.message) as ApiResponse<{
      project_id: string
      tag_id: string
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
    aggregateType: 'project',
    aggregateId: projectId,
    eventType: 'project.tag_assigned',
    action: 'assign_tag_to_project',
    payload: {
      project_id: projectId,
      tag_id: tagId,
    },
    afterState: {
      project_id: projectId,
      tag_id: tagId,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      project_id: projectId,
      tag_id: tagId,
      lock_version: null,
    },
    mutationMeta(projectId, null, artifacts.eventId, artifacts.correlationId)
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
  { params }: { params: Promise<{ projectId: string; tagId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { projectId, tagId } = await params
  const allowed = await canManageProject(context.supabase, context.userId, projectId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'You cannot update tags for this project')
  }

  const route = `/projects/${projectId}/tags/${tagId}/delete`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ project_id: string; tag_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('project_tag_assignments')
    .select('project_id, tag_id')
    .eq('project_id', projectId)
    .eq('tag_id', tagId)
    .maybeSingle()

  const { error: removeError } = await context.supabase
    .from('project_tag_assignments')
    .delete()
    .eq('project_id', projectId)
    .eq('tag_id', tagId)

  if (removeError) {
    const payload = failure('internal_error', removeError.message) as ApiResponse<{ project_id: string; tag_id: string }>
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
    aggregateType: 'project',
    aggregateId: projectId,
    eventType: 'project.tag_removed',
    action: 'remove_tag_from_project',
    payload: {
      project_id: projectId,
      tag_id: tagId,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      project_id: projectId,
      tag_id: tagId,
    },
    mutationMeta(projectId, null, artifacts.eventId, artifacts.correlationId)
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
