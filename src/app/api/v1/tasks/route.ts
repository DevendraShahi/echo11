import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageProject } from '@/lib/api/v1/permissions'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

interface CreateTaskBody {
  title?: string
  description?: string | null
  project_id?: string
  status?: 'todo' | 'in_progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: string | null
  due_date?: string | null
}

export async function GET() {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { data, error } = await context.supabase
    .from('tasks')
    .select('id, title, project_id, status, priority, assignee_id, due_date, lock_version, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) return apiError(500, 'internal_error', error.message)
  return apiOk(data || [])
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const body = (await request.json()) as CreateTaskBody
  if (!body.title?.trim()) return apiError(400, 'invalid_request', 'Task title is required')
  if (!body.project_id) return apiError(400, 'invalid_request', 'project_id is required')

  const allowed = await canManageProject(context.supabase, context.userId, body.project_id)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can create tasks for this project')
  }

  const route = '/tasks'
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

  const status = body.status || 'todo'
  const { data: maxOrder } = await context.supabase
    .from('tasks')
    .select('sort_order')
    .eq('status', status)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sortOrder = (maxOrder?.sort_order || 0) + 1

  let insert = await context.supabase
    .from('tasks')
    .insert({
      title: body.title.trim(),
      description: body.description || null,
      project_id: body.project_id,
      status,
      priority: body.priority || 'medium',
      assignee_id: body.assignee_id || null,
      due_date: body.due_date || null,
      sort_order: sortOrder,
      created_by: context.userId,
      organization_id: context.organizationId,
    })
    .select('id, lock_version')
    .single()

  if (insert.error && isMissingRelationOrColumnError(insert.error)) {
    insert = await context.supabase
      .from('tasks')
      .insert({
        title: body.title.trim(),
        description: body.description || null,
        project_id: body.project_id,
        status,
        priority: body.priority || 'medium',
        assignee_id: body.assignee_id || null,
        due_date: body.due_date || null,
        sort_order: sortOrder,
        created_by: context.userId,
      })
      .select('id')
      .single()
  }

  if (insert.error || !insert.data) {
    const payload = failure('internal_error', insert.error?.message || 'Failed to create task') as ApiResponse<{
      task_id: string
      lock_version: number | null
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
    aggregateType: 'task',
    aggregateId: insert.data.id,
    eventType: 'task.created',
    action: 'create_task',
    payload: {
      title: body.title,
      project_id: body.project_id,
      assignee_id: body.assignee_id || null,
      status,
    },
    afterState: {
      id: insert.data.id,
      title: body.title,
      status,
    },
    idempotencyKey,
  })

  const lockVersion = (insert.data as { lock_version?: number }).lock_version ?? 0
  const payload = success(
    {
      task_id: insert.data.id,
      lock_version: lockVersion,
    },
    mutationMeta(insert.data.id, lockVersion, artifacts.eventId, artifacts.correlationId)
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
