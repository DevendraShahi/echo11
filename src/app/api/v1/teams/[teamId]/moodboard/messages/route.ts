import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { canReadTeam } from '@/lib/api/v1/permissions'

interface CreateTeamMessageBody {
  content?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { teamId } = await params
  const allowed = await canReadTeam(context.supabase, context.userId, teamId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'You are not a member of this team')
  }

  const body = (await request.json()) as CreateTeamMessageBody
  const content = body.content?.trim()
  if (!content) return apiError(400, 'invalid_request', 'Message content is required')

  const route = `/teams/${teamId}/moodboard/messages`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ message_id: string; team_id: string; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: created, error: createError } = await context.supabase
    .from('team_messages')
    .insert({
      team_id: teamId,
      content,
      created_by: context.userId,
    })
    .select('id, team_id, content, created_by')
    .single()

  if (createError || !created) {
    const payload = failure('internal_error', createError?.message || 'Failed to post team message') as ApiResponse<{
      message_id: string
      team_id: string
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
    aggregateType: 'team_message',
    aggregateId: created.id,
    eventType: 'team.message_created',
    action: 'create_team_message',
    payload: {
      message_id: created.id,
      team_id: teamId,
    },
    afterState: (created || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      message_id: created.id,
      team_id: teamId,
      lock_version: null,
    },
    mutationMeta(created.id, null, artifacts.eventId, artifacts.correlationId)
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
