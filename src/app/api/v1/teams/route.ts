import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

interface CreateTeamBody {
  name?: string
  description?: string | null
  lead_id?: string | null
  color?: string
}

export async function GET() {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  let query = context.supabase
    .from('teams')
    .select('id, name, description, lead_id, color, created_at, updated_at')
    .order('name', { ascending: true })

  if (!context.isAdmin && context.teamId) {
    query = query.eq('id', context.teamId)
  }

  if (!context.isAdmin && !context.teamId) {
    return apiOk([])
  }

  const { data, error } = await query

  if (error) {
    return apiError(500, 'internal_error', error.message)
  }

  return apiOk(data || [])
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  if (!context.isAdmin) {
    return apiError(403, 'forbidden', 'Only admins can create teams')
  }

  const body = (await request.json()) as CreateTeamBody
  const name = body.name?.trim()
  if (!name) return apiError(400, 'invalid_request', 'Team name is required')

  const idempotencyKey = request.headers.get('idempotency-key')
  const route = '/teams'

  const idempotency = await beginIdempotency<{ team_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  let insert = await context.supabase
    .from('teams')
    .insert({
      name,
      description: body.description || null,
      lead_id: body.lead_id || null,
      color: body.color || '#6366f1',
      organization_id: context.organizationId,
    })
    .select('id')
    .single()

  if (insert.error && isMissingRelationOrColumnError(insert.error)) {
    insert = await context.supabase
      .from('teams')
      .insert({
        name,
        description: body.description || null,
        lead_id: body.lead_id || null,
        color: body.color || '#6366f1',
      })
      .select('id')
      .single()
  }

  if (insert.error || !insert.data) {
    const payload = failure('internal_error', insert.error?.message || 'Failed to create team') as ApiResponse<{ team_id: string }>
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
    aggregateType: 'team',
    aggregateId: insert.data.id,
    eventType: 'team.created',
    action: 'create_team',
    payload: { name },
    afterState: { id: insert.data.id, name },
    idempotencyKey,
  })

  const payload = success(
    { team_id: insert.data.id },
    mutationMeta(insert.data.id, null, artifacts.eventId, artifacts.correlationId)
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
