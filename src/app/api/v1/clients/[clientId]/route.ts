import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

interface UpdateClientBody {
  company_name?: string
  contact_name?: string | null
  email?: string
  phone?: string | null
  address?: string | null
  notes?: string | null
  website?: string | null
  industry?: string | null
  source?: string | null
  tags?: string[] | null
  default_hourly_rate?: number | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postal_code?: string | null
  timezone?: string | null
  social_links?: Record<string, string> | null
  expected_lock_version?: number
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { clientId } = await params
  const { data, error } = await context.supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error) return apiError(404, 'not_found', 'Client not found')
  return apiOk(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can update clients')
  }

  const { clientId } = await params
  const body = (await request.json()) as UpdateClientBody

  if (body.company_name !== undefined && !body.company_name.trim()) {
    return apiError(400, 'invalid_request', 'company_name cannot be empty')
  }

  const route = `/clients/${clientId}`
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

  const { data: before } = await context.supabase
    .from('clients')
    .select('id, company_name, email, lock_version')
    .eq('id', clientId)
    .single()

  if (!before) {
    return apiError(404, 'not_found', 'Client not found')
  }

  const expectedLockVersion = body.expected_lock_version
  if (typeof expectedLockVersion === 'number' && before.lock_version !== expectedLockVersion) {
    const payload = failure('conflict', 'Client has been modified by another update', {
      expected_lock_version: expectedLockVersion,
      current_lock_version: before.lock_version,
    }) as ApiResponse<{ client_id: string; lock_version: number | null }>

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

  let updateQuery = context.supabase
    .from('clients')
    .update({
      ...(body.company_name !== undefined ? { company_name: body.company_name.trim() } : {}),
      ...(body.contact_name !== undefined ? { contact_name: body.contact_name } : {}),
      ...(body.email !== undefined ? { email: body.email.trim().toLowerCase() } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.website !== undefined ? { website: body.website } : {}),
      ...(body.industry !== undefined ? { industry: body.industry } : {}),
      ...(body.source !== undefined ? { source: body.source } : {}),
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
      ...(body.default_hourly_rate !== undefined ? { default_hourly_rate: body.default_hourly_rate } : {}),
      ...(body.address_line2 !== undefined ? { address_line2: body.address_line2 } : {}),
      ...(body.city !== undefined ? { city: body.city } : {}),
      ...(body.state !== undefined ? { state: body.state } : {}),
      ...(body.country !== undefined ? { country: body.country } : {}),
      ...(body.postal_code !== undefined ? { postal_code: body.postal_code } : {}),
      ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
      ...(body.social_links !== undefined ? { social_links: body.social_links } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', clientId)

  if (typeof expectedLockVersion === 'number') {
    updateQuery = updateQuery.eq('lock_version', expectedLockVersion)
  }

  const { data: updated, error: updateError } = await updateQuery
    .select('id, lock_version, company_name, email')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{ client_id: string; lock_version: number | null }>
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
    const payload = failure('conflict', 'Client update was rejected due to version mismatch') as ApiResponse<{
      client_id: string
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
    aggregateType: 'client',
    aggregateId: clientId,
    eventType: 'client.updated',
    action: 'update_client',
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
      client_id: clientId,
      lock_version: lockVersion,
    },
    mutationMeta(clientId, lockVersion, artifacts.eventId, artifacts.correlationId)
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
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can delete clients')
  }

  const { clientId } = await params

  const route = `/clients/${clientId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ client_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('clients')
    .select('id, company_name, email')
    .eq('id', clientId)
    .single()

  const { error } = await context.supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ client_id: string }>
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
    aggregateType: 'client',
    aggregateId: clientId,
    eventType: 'client.deleted',
    action: 'delete_client',
    payload: {
      company_name: before?.company_name || null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      client_id: clientId,
    },
    mutationMeta(clientId, null, artifacts.eventId, artifacts.correlationId)
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
