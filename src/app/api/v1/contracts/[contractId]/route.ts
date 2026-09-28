import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

type ContractStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'terminated'

interface UpdateContractBody {
  title?: string
  status?: ContractStatus
  value?: number | null
  start_date?: string | null
  end_date?: string | null
  notes?: string | null
  expected_lock_version?: number
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { contractId } = await params

  const { data, error } = await context.supabase
    .from('contracts')
    .select(`
      *,
      client:clients(company_name, contact_name, email, address, phone),
      template:contract_templates(name, category, content, variables)
    `)
    .eq('id', contractId)
    .single()

  if (error) return apiError(404, 'not_found', 'Contract not found')
  return apiOk(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can update contracts')
  }

  const { contractId } = await params
  const body = (await request.json()) as UpdateContractBody

  if (body.title !== undefined && !body.title.trim()) {
    return apiError(400, 'invalid_request', 'title cannot be empty')
  }

  const route = `/contracts/${contractId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ contract_id: string; lock_version: number | null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('contracts')
    .select('id, title, status, value, start_date, end_date, notes, lock_version')
    .eq('id', contractId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Contract not found')
  }

  const expectedLockVersion = body.expected_lock_version
  if (typeof expectedLockVersion === 'number' && before.lock_version !== expectedLockVersion) {
    const payload = failure('conflict', 'Contract has been modified by another update', {
      expected_lock_version: expectedLockVersion,
      current_lock_version: before.lock_version,
    }) as ApiResponse<{ contract_id: string; lock_version: number | null }>

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

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.title !== undefined) updateData.title = body.title.trim()
  if (body.status !== undefined) updateData.status = body.status
  if (body.value !== undefined) updateData.value = body.value
  if (body.start_date !== undefined) updateData.start_date = body.start_date
  if (body.end_date !== undefined) updateData.end_date = body.end_date
  if (body.notes !== undefined) updateData.notes = body.notes

  let updateQuery = context.supabase
    .from('contracts')
    .update(updateData)
    .eq('id', contractId)

  if (typeof expectedLockVersion === 'number') {
    updateQuery = updateQuery.eq('lock_version', expectedLockVersion)
  }

  const { data: updated, error: updateError } = await updateQuery
    .select('id, lock_version, status, title, value')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
      contract_id: string
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

  if (!updated) {
    const payload = failure('conflict', 'Contract update was rejected due to version mismatch') as ApiResponse<{
      contract_id: string
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
    aggregateType: 'contract',
    aggregateId: contractId,
    eventType: 'contract.updated',
    action: 'update_contract',
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
      contract_id: contractId,
      lock_version: lockVersion,
    },
    mutationMeta(contractId, lockVersion, artifacts.eventId, artifacts.correlationId)
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
  { params }: { params: Promise<{ contractId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can delete contracts')
  }

  const { contractId } = await params
  const route = `/contracts/${contractId}`
  const idempotencyKey = request.headers.get('idempotency-key')

  const idempotency = await beginIdempotency<{ contract_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('contracts')
    .select('id, title, status, value, file_url')
    .eq('id', contractId)
    .single()

  const { error } = await context.supabase
    .from('contracts')
    .delete()
    .eq('id', contractId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ contract_id: string }>

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
    aggregateType: 'contract',
    aggregateId: contractId,
    eventType: 'contract.deleted',
    action: 'delete_contract',
    payload: {
      title: before?.title || null,
      status: before?.status || null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    { contract_id: contractId },
    mutationMeta(contractId, null, artifacts.eventId, artifacts.correlationId)
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
