import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageProject } from '@/lib/api/v1/permissions'

interface AssignProjectTeamBody {
  team_id?: string | null
  expected_lock_version?: number | null
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { projectId } = await params
  const allowed = await canManageProject(context.supabase, context.userId, projectId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'You cannot update this project')
  }

  const body = (await request.json()) as AssignProjectTeamBody
  const expectedLockVersion = body.expected_lock_version

  const route = `/projects/${projectId}/team`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ project_id: string; team_id: string | null; lock_version: number | null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('projects')
    .select('id, team_id, lock_version')
    .eq('id', projectId)
    .single()

  if (typeof expectedLockVersion === 'number' && before && before.lock_version !== expectedLockVersion) {
    const payload = failure('conflict', 'Project has been modified by another update', {
      expected_lock_version: expectedLockVersion,
      current_lock_version: before.lock_version,
    }) as ApiResponse<{ project_id: string; team_id: string | null; lock_version: number | null }>

    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 409,
    })

    return Response.json(payload, { status: 409 })
  }

  let updateQuery = context.supabase
    .from('projects')
    .update({
      team_id: body.team_id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (typeof expectedLockVersion === 'number') {
    updateQuery = updateQuery.eq('lock_version', expectedLockVersion)
  }

  const { data: updated, error } = await updateQuery
    .select('id, team_id, lock_version')
    .maybeSingle()

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ project_id: string; team_id: string | null; lock_version: number | null }>
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
    const payload = failure('conflict', 'Project update was rejected due to version mismatch') as ApiResponse<{
      project_id: string
      team_id: string | null
      lock_version: number | null
    }>

    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 409,
    })

    return Response.json(payload, { status: 409 })
  }

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'project',
    aggregateId: projectId,
    eventType: 'project.team_assigned',
    action: 'assign_project_team',
    payload: {
      project_id: projectId,
      team_id: body.team_id ?? null,
      lock_version: updated.lock_version,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: (updated || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      project_id: projectId,
      team_id: updated.team_id,
      lock_version: updated.lock_version ?? null,
    },
    mutationMeta(projectId, updated.lock_version ?? null, artifacts.eventId, artifacts.correlationId)
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
