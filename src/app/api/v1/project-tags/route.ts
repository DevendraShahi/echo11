import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

interface CreateProjectTagBody {
  name?: string
  color?: string | null
}

export async function GET() {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { data, error } = await context.supabase
    .from('project_tags')
    .select('id, name, color, created_at')
    .order('name', { ascending: true })

  if (error) return apiError(500, 'internal_error', error.message)
  return apiOk(data || [])
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can create project tags')
  }

  const body = (await request.json()) as CreateProjectTagBody
  const name = body.name?.trim()
  if (!name) return apiError(400, 'invalid_request', 'Tag name is required')

  const route = '/project-tags'
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ tag_id: string; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const insertPayload = {
    name,
    color: body.color || '#6366f1',
    organization_id: context.organizationId,
  }

  let insert = await context.supabase
    .from('project_tags')
    .insert(insertPayload)
    .select('id, name, color')
    .single()

  if (insert.error && isMissingRelationOrColumnError(insert.error)) {
    const legacyInsertPayload = { ...insertPayload }
    delete (legacyInsertPayload as Record<string, unknown>).organization_id

    insert = await context.supabase
      .from('project_tags')
      .insert(legacyInsertPayload)
      .select('id, name, color')
      .single()
  }

  if (insert.error || !insert.data) {
    const payload = failure('internal_error', insert.error?.message || 'Failed to create project tag') as ApiResponse<{
      tag_id: string
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
    aggregateType: 'project_tag',
    aggregateId: insert.data.id,
    eventType: 'project_tag.created',
    action: 'create_project_tag',
    payload: {
      name: insert.data.name,
      color: insert.data.color,
    },
    afterState: (insert.data || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      tag_id: insert.data.id,
      lock_version: null,
    },
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
