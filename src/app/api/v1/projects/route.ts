import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

interface CreateProjectBody {
  name?: string
  description?: string | null
  client_id?: string | null
  team_id?: string | null
  status?: 'active' | 'on_hold' | 'completed' | 'archived'
  type?: 'website' | 'mobile' | 'branding' | 'consulting' | 'other'
  start_date?: string | null
  deadline?: string | null
  budget?: number | null
  color?: string | null
}

export async function GET() {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  let query = context.supabase
    .from('projects')
    .select('id, name, description, client_id, team_id, status, type, progress, budget, lock_version, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (!context.isAdmin && context.teamId) {
    query = query.eq('team_id', context.teamId)
  }

  const { data, error } = await query
  if (error) return apiError(500, 'internal_error', error.message)

  return apiOk(data || [])
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const body = (await request.json()) as CreateProjectBody
  const name = body.name?.trim()
  if (!name) return apiError(400, 'invalid_request', 'Project name is required')

  const allowed = await requireAdminOrLead(context.supabase, context.userId, body.team_id || null)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can create projects')
  }

  const route = '/projects'
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

  let insert = await context.supabase
    .from('projects')
    .insert({
      name,
      description: body.description || null,
      client_id: body.client_id || null,
      team_id: body.team_id || null,
      status: body.status || 'active',
      type: body.type || 'other',
      start_date: body.start_date || null,
      deadline: body.deadline || null,
      budget: body.budget || null,
      color: body.color || null,
      progress: 0,
      created_by: context.userId,
      organization_id: context.organizationId,
    })
    .select('id, lock_version')
    .single()

  if (insert.error && isMissingRelationOrColumnError(insert.error)) {
    insert = await context.supabase
      .from('projects')
      .insert({
        name,
        description: body.description || null,
        client_id: body.client_id || null,
        team_id: body.team_id || null,
        status: body.status || 'active',
        type: body.type || 'other',
        start_date: body.start_date || null,
        deadline: body.deadline || null,
        budget: body.budget || null,
        color: body.color || null,
        progress: 0,
        created_by: context.userId,
      })
      .select('id')
      .single()
  }

  if (insert.error || !insert.data) {
    const payload = failure('internal_error', insert.error?.message || 'Failed to create project') as ApiResponse<{
      project_id: string
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
    aggregateType: 'project',
    aggregateId: insert.data.id,
    eventType: 'project.created',
    action: 'create_project',
    payload: {
      name,
      team_id: body.team_id || null,
      client_id: body.client_id || null,
      status: body.status || 'active',
    },
    afterState: {
      id: insert.data.id,
      name,
    },
    idempotencyKey,
  })

  const lockVersion = (insert.data as { lock_version?: number }).lock_version ?? 0
  const payload = success(
    {
      project_id: insert.data.id,
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
