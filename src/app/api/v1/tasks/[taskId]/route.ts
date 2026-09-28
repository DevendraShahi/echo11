import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageTask } from '@/lib/api/v1/permissions'

interface UpdateTaskBody {
  title?: string
  description?: string | null
  project_id?: string
  status?: 'todo' | 'in_progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: string | null
  due_date?: string | null
  expected_lock_version?: number
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { taskId } = await params
  const { data, error } = await context.supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) return apiError(404, 'not_found', 'Task not found')
  return apiOk(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { taskId } = await params
  const allowed = await canManageTask(context.supabase, context.userId, taskId)
  if (!allowed) return apiError(403, 'forbidden', 'You cannot update this task')

  const body = (await request.json()) as UpdateTaskBody
  if (body.title !== undefined && !body.title.trim()) {
    return apiError(400, 'invalid_request', 'Task title cannot be empty')
  }

  const route = `/tasks/${taskId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ task_id: string; lock_version: number | null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('tasks')
    .select('id, title, status, assignee_id, lock_version, project_id')
    .eq('id', taskId)
    .single()

  if (!before) {
    return apiError(404, 'not_found', 'Task not found')
  }

  const expectedLockVersion = body.expected_lock_version
  if (typeof expectedLockVersion === 'number' && before.lock_version !== expectedLockVersion) {
    const payload = failure('conflict', 'Task has been modified by another update', {
      expected_lock_version: expectedLockVersion,
      current_lock_version: before.lock_version,
    }) as ApiResponse<{ task_id: string; lock_version: number | null }>

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

  let nextSortOrder: number | undefined
  if (body.status && body.status !== before.status) {
    const { data: maxOrder } = await context.supabase
      .from('tasks')
      .select('sort_order')
      .eq('status', body.status)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    nextSortOrder = (maxOrder?.sort_order || 0) + 1
  }

  let updateQuery = context.supabase
    .from('tasks')
    .update({
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.project_id !== undefined ? { project_id: body.project_id } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.assignee_id !== undefined ? { assignee_id: body.assignee_id } : {}),
      ...(body.due_date !== undefined ? { due_date: body.due_date } : {}),
      ...(nextSortOrder !== undefined ? { sort_order: nextSortOrder } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (typeof expectedLockVersion === 'number') {
    updateQuery = updateQuery.eq('lock_version', expectedLockVersion)
  }

  const { data: updated, error: updateError } = await updateQuery
    .select('id, lock_version, title, status, assignee_id, project_id')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{ task_id: string; lock_version: number | null }>
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
    const payload = failure('conflict', 'Task update was rejected due to version mismatch') as ApiResponse<{
      task_id: string
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
    aggregateType: 'task',
    aggregateId: taskId,
    eventType: 'task.updated',
    action: 'update_task',
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
      task_id: taskId,
      lock_version: lockVersion,
    },
    mutationMeta(taskId, lockVersion, artifacts.eventId, artifacts.correlationId)
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
  { params }: { params: Promise<{ taskId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { taskId } = await params
  const allowed = await canManageTask(context.supabase, context.userId, taskId)
  if (!allowed) return apiError(403, 'forbidden', 'You cannot delete this task')

  const route = `/tasks/${taskId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ task_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('tasks')
    .select('id, title, lock_version')
    .eq('id', taskId)
    .single()

  const { error } = await context.supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ task_id: string }>
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
    aggregateType: 'task',
    aggregateId: taskId,
    eventType: 'task.deleted',
    action: 'delete_task',
    payload: {
      task_title: before?.title || null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      task_id: taskId,
    },
    mutationMeta(taskId, null, artifacts.eventId, artifacts.correlationId)
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
