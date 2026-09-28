import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

type ContractStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'terminated'

interface UpdateContractStatusBody {
  status?: ContractStatus
  expected_lock_version?: number
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can update contract status')
  }

  const { contractId } = await params
  const body = (await request.json()) as UpdateContractStatusBody

  if (!body.status) {
    return apiError(400, 'invalid_request', 'status is required')
  }

  const route = `/contracts/${contractId}/status`
  const idempotencyKey = request.headers.get('idempotency-key')

  const idempotency = await beginIdempotency<{ contract_id: string; status: ContractStatus; lock_version: number | null }>({
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
    .select('id, status, lock_version, sent_at, signed_at')
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
    }) as ApiResponse<{ contract_id: string; status: ContractStatus; lock_version: number | null }>

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
    status: body.status,
    updated_at: new Date().toISOString(),
  }

  if (body.status === 'signed') {
    updateData.signed_at = new Date().toISOString()
  }

  if (body.status === 'pending') {
    updateData.sent_at = new Date().toISOString()
  }

  let updateQuery = context.supabase
    .from('contracts')
    .update(updateData)
    .eq('id', contractId)

  if (typeof expectedLockVersion === 'number') {
    updateQuery = updateQuery.eq('lock_version', expectedLockVersion)
  }

  const { data: updated, error: updateError } = await updateQuery
    .select('id, status, lock_version, sent_at, signed_at')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
      contract_id: string
      status: ContractStatus
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
    const payload = failure('conflict', 'Contract status update was rejected due to version mismatch') as ApiResponse<{
      contract_id: string
      status: ContractStatus
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
    eventType: 'contract.status_updated',
    action: 'update_contract_status',
    payload: {
      from_status: before.status,
      to_status: updated.status,
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
      status: updated.status as ContractStatus,
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
