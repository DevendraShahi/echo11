import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageProject } from '@/lib/api/v1/permissions'

interface UpdateProjectBody {
  name?: string
  description?: string | null
  client_id?: string | null
  team_id?: string | null
  status?: 'active' | 'on_hold' | 'completed' | 'archived'
  type?: 'website' | 'mobile' | 'branding' | 'consulting' | 'other'
  start_date?: string | null
  deadline?: string | null
  budget?: number | null
  progress?: number
  color?: string | null
  link?: string | null
  expected_lock_version?: number
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { projectId } = await params
  const { data, error } = await context.supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) return apiError(404, 'not_found', 'Project not found')
  return apiOk(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { projectId } = await params
  const allowed = await canManageProject(context.supabase, context.userId, projectId)
  if (!allowed) return apiError(403, 'forbidden', 'You cannot update this project')

  const body = (await request.json()) as UpdateProjectBody
  if (body.name !== undefined && !body.name.trim()) {
    return apiError(400, 'invalid_request', 'Project name cannot be empty')
  }

  const route = `/projects/${projectId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ project_id: string; lock_version: number | null }>({
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
    .select('id, name, status, lock_version, team_id, client_id')
    .eq('id', projectId)
    .single()

  if (!before) {
    return apiError(404, 'not_found', 'Project not found')
  }

  const expectedLockVersion = body.expected_lock_version
  if (typeof expectedLockVersion === 'number' && before.lock_version !== expectedLockVersion) {
    const payload = failure('conflict', 'Project has been modified by another update', {
      expected_lock_version: expectedLockVersion,
      current_lock_version: before.lock_version,
    }) as ApiResponse<{ project_id: string; lock_version: number | null }>

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
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.client_id !== undefined ? { client_id: body.client_id } : {}),
      ...(body.team_id !== undefined ? { team_id: body.team_id } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.start_date !== undefined ? { start_date: body.start_date } : {}),
      ...(body.deadline !== undefined ? { deadline: body.deadline } : {}),
      ...(body.budget !== undefined ? { budget: body.budget } : {}),
      ...(body.progress !== undefined ? { progress: body.progress } : {}),
      ...(body.color !== undefined ? { color: body.color } : {}),
      ...(body.link !== undefined ? { link: body.link } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (typeof expectedLockVersion === 'number') {
    updateQuery = updateQuery.eq('lock_version', expectedLockVersion)
  }

  const { data: updated, error: updateError } = await updateQuery
    .select('id, lock_version, name, status, team_id, client_id')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{ project_id: string; lock_version: number | null }>
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
    eventType: 'project.updated',
    action: 'update_project',
    payload: {
      changed_fields: Object.keys(body).filter((field) => field !== 'expected_lock_version'),
      lock_version: updated.lock_version ?? null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: (updated || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const lockVersion = updated.lock_version ?? null
  const payload = success(
    {
      project_id: projectId,
      lock_version: lockVersion,
    },
    mutationMeta(projectId, lockVersion, artifacts.eventId, artifacts.correlationId)
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
  { params }: { params: Promise<{ projectId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { projectId } = await params
  const allowed = await canManageProject(context.supabase, context.userId, projectId)
  if (!allowed) return apiError(403, 'forbidden', 'You cannot delete this project')

  const route = `/projects/${projectId}`
  const idempotencyKey = request.headers.get('idempotency-key')

  const idempotency = await beginIdempotency<{ project_id: string }>({
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
    .select('id, name, lock_version')
    .eq('id', projectId)
    .single()

  const { error } = await context.supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ project_id: string }>
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
    eventType: 'project.deleted',
    action: 'delete_project',
    payload: {
      project_name: before?.name || null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      project_id: projectId,
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
