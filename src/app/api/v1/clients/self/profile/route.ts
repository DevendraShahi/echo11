import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

interface UpdateClientSelfProfileBody {
  contact_name?: string | null
  phone?: string | null
  address?: string | null
  website?: string | null
}

function normalizeOptionalText(value?: string | null): string | null | undefined {
  if (value === undefined) return undefined
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function PATCH(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const body = (await request.json()) as UpdateClientSelfProfileBody

  if (
    body.contact_name === undefined &&
    body.phone === undefined &&
    body.address === undefined &&
    body.website === undefined
  ) {
    return apiError(400, 'invalid_request', 'At least one profile field is required')
  }

  const route = '/clients/self/profile'
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ client_id: string; lock_version: number | null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: client, error: clientError } = await context.supabase
    .from('clients')
    .select('id, auth_id, contact_name, phone, address, website, lock_version')
    .eq('auth_id', context.userId)
    .single()

  if (clientError || !client) {
    const payload = failure('forbidden', 'Your account is not linked to a client profile') as ApiResponse<{
      client_id: string
      lock_version: number | null
    }>
    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 403,
    })

    return Response.json(payload, { status: 403 })
  }

  const updates = {
    ...(body.contact_name !== undefined ? { contact_name: normalizeOptionalText(body.contact_name) } : {}),
    ...(body.phone !== undefined ? { phone: normalizeOptionalText(body.phone) } : {}),
    ...(body.address !== undefined ? { address: normalizeOptionalText(body.address) } : {}),
    ...(body.website !== undefined ? { website: normalizeOptionalText(body.website) } : {}),
    updated_at: new Date().toISOString(),
  }

  const { data: after, error: updateError } = await context.supabase
    .from('clients')
    .update(updates)
    .eq('id', client.id)
    .eq('auth_id', context.userId)
    .select('id, contact_name, phone, address, website, lock_version')
    .single()

  if (updateError || !after) {
    const payload = failure('internal_error', updateError?.message || 'Failed to update client profile') as ApiResponse<{
      client_id: string
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

  const changedFields = Object.keys(body).filter((key) => (body as Record<string, unknown>)[key] !== undefined)
  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'client',
    aggregateId: client.id,
    eventType: 'client.self_profile_updated',
    action: 'update_client_self_profile',
    payload: {
      client_id: client.id,
      source: 'client',
      changed_fields: changedFields,
    },
    beforeState: (client || null) as Record<string, unknown> | null,
    afterState: (after || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const lockVersion = after.lock_version ?? null
  const payload = success(
    {
      client_id: client.id,
      lock_version: lockVersion,
    },
    mutationMeta(client.id, lockVersion, artifacts.eventId, artifacts.correlationId)
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
