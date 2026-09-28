import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageTeam } from '@/lib/api/v1/permissions'

interface AssignMemberBody {
  user_id?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { teamId } = await params
  const allowed = context.isAdmin || await canManageTeam(context.supabase, context.userId, teamId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'You cannot manage this team')
  }

  const body = (await request.json()) as AssignMemberBody
  if (!body.user_id) {
    return apiError(400, 'invalid_request', 'user_id is required')
  }

  const route = `/teams/${teamId}/members`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ user_id: string; team_id: string | null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('profiles')
    .select('id, team_id')
    .eq('id', body.user_id)
    .single()

  const { error } = await context.supabase
    .from('profiles')
    .update({ team_id: teamId })
    .eq('id', body.user_id)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ user_id: string; team_id: string | null }>
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
    aggregateType: 'team_membership',
    aggregateId: body.user_id,
    eventType: 'team.member_assigned',
    action: 'assign_user_to_team',
    payload: {
      user_id: body.user_id,
      team_id: teamId,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: {
      user_id: body.user_id,
      team_id: teamId,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      user_id: body.user_id,
      team_id: teamId,
    },
    mutationMeta(body.user_id, null, artifacts.eventId, artifacts.correlationId)
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

  const { teamId } = await params
  const allowed = context.isAdmin || await canManageTeam(context.supabase, context.userId, teamId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'You cannot manage this team')
  }

  const userId = request.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return apiError(400, 'invalid_request', 'user_id is required')
  }

  const route = `/teams/${teamId}/members/${userId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ user_id: string; team_id: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('profiles')
    .select('id, team_id')
    .eq('id', userId)
    .single()

  const { error } = await context.supabase
    .from('profiles')
    .update({ team_id: null })
    .eq('id', userId)
    .eq('team_id', teamId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ user_id: string; team_id: null }>
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
    aggregateType: 'team_membership',
    aggregateId: userId,
    eventType: 'team.member_removed',
    action: 'remove_user_from_team',
    payload: {
      user_id: userId,
      team_id: teamId,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: {
      user_id: userId,
      team_id: null,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      user_id: userId,
      team_id: null,
    },
    mutationMeta(userId, null, artifacts.eventId, artifacts.correlationId)
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
