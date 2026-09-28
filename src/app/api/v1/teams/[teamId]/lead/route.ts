import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canManageTeam } from '@/lib/api/v1/permissions'

interface SetLeadBody {
  user_id?: string
}

export async function PUT(
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

  const body = (await request.json()) as SetLeadBody
  if (!body.user_id) {
    return apiError(400, 'invalid_request', 'user_id is required')
  }

  const route = `/teams/${teamId}/lead`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ team_id: string; lead_id: string }>({
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
    .select('id, lead_id')
    .eq('id', teamId)
    .single()

  const { error } = await context.supabase
    .from('teams')
    .update({ lead_id: body.user_id, updated_at: new Date().toISOString() })
    .eq('id', teamId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ team_id: string; lead_id: string }>
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
    eventType: 'team.lead_changed',
    action: 'set_team_lead',
    payload: {
      team_id: teamId,
      lead_id: body.user_id,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: {
      team_id: teamId,
      lead_id: body.user_id,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      team_id: teamId,
      lead_id: body.user_id,
    },
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
