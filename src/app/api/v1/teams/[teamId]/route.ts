import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageTeam } from '@/lib/api/v1/permissions'

interface UpdateTeamBody {
  name?: string
  description?: string | null
  lead_id?: string | null
  color?: string
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { teamId } = await params
  const allowed = context.isAdmin || await canManageTeam(context.supabase, context.userId, teamId)
  if (!allowed) return apiError(403, 'forbidden', 'You do not have access to this team')

  const { data, error } = await context.supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  if (error) return apiError(404, 'not_found', 'Team not found')
  return apiOk(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { teamId } = await params
  const allowed = context.isAdmin || await canManageTeam(context.supabase, context.userId, teamId)
  if (!allowed) return apiError(403, 'forbidden', 'You cannot update this team')

  const body = (await request.json()) as UpdateTeamBody
  if (body.name !== undefined && !body.name.trim()) {
    return apiError(400, 'invalid_request', 'Team name cannot be empty')
  }

  const route = `/teams/${teamId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ team_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('teams')
    .select('id, name, description, lead_id, color')
    .eq('id', teamId)
    .single()

  const { error } = await context.supabase
    .from('teams')
    .update({
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.lead_id !== undefined ? { lead_id: body.lead_id } : {}),
      ...(body.color !== undefined ? { color: body.color } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ team_id: string }>
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

  const { data: after } = await context.supabase
    .from('teams')
    .select('id, name, description, lead_id, color')
    .eq('id', teamId)
    .single()

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'team',
    aggregateId: teamId,
    eventType: 'team.updated',
    action: 'update_team',
    payload: {
      changed_fields: Object.keys(body),
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: (after || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    { team_id: teamId },
    mutationMeta(teamId, null, artifacts.eventId, artifacts.correlationId)
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
  { params }: { params: Promise<{ teamId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  if (!context.isAdmin) {
    return apiError(403, 'forbidden', 'Only admins can delete teams')
  }

  const { teamId } = await params
  const route = `/teams/${teamId}`
  const idempotencyKey = request.headers.get('idempotency-key')

  const idempotency = await beginIdempotency<{ team_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('teams')
    .select('id, name')
    .eq('id', teamId)
    .single()

  await context.supabase.from('profiles').update({ team_id: null }).eq('team_id', teamId)
  await context.supabase.from('projects').update({ team_id: null }).eq('team_id', teamId)

  const { error } = await context.supabase
    .from('teams')
    .delete()
    .eq('id', teamId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ team_id: string }>
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
    aggregateId: teamId,
    eventType: 'team.deleted',
    action: 'delete_team',
    payload: {
      team_name: before?.name || null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    { team_id: teamId },
    mutationMeta(teamId, null, artifacts.eventId, artifacts.correlationId)
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
