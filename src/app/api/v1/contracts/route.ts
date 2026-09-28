import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

type ContractStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'terminated'

interface CreateContractBody {
  client_id?: string
  title?: string
  template_id?: string | null
  status?: ContractStatus
  value?: number | null
  start_date?: string | null
  end_date?: string | null
  notes?: string | null
}

export async function GET() {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { data, error } = await context.supabase
    .from('contracts')
    .select('id, client_id, title, contract_number, status, value, start_date, end_date, lock_version, created_at')
    .order('created_at', { ascending: false })

  if (error) return apiError(500, 'internal_error', error.message)
  return apiOk(data || [])
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can create contracts')
  }

  const body = (await request.json()) as CreateContractBody

  if (!body.client_id) return apiError(400, 'invalid_request', 'client_id is required')
  if (!body.title?.trim()) return apiError(400, 'invalid_request', 'title is required')

  const route = '/contracts'
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

  const year = new Date().getFullYear()
  const { count } = await context.supabase
    .from('contracts')
    .select('*', { count: 'exact', head: true })
    .ilike('contract_number', `CTR-${year}-%`)
  const contractNumber = `CTR-${year}-${String((count || 0) + 1).padStart(3, '0')}`

  const insertPayload = {
    client_id: body.client_id,
    title: body.title.trim(),
    contract_number: contractNumber,
    template_id: body.template_id || null,
    status: body.status || 'draft',
    value: body.value || null,
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    notes: body.notes || null,
    created_by: context.userId,
    organization_id: context.organizationId,
  }

  let insertResult = await context.supabase
    .from('contracts')
    .insert(insertPayload)
    .select('id, lock_version, contract_number')
    .single()

  if (insertResult.error && isMissingRelationOrColumnError(insertResult.error)) {
    const legacyInsertPayload = { ...insertPayload }
    delete (legacyInsertPayload as Record<string, unknown>).organization_id
    insertResult = await context.supabase
      .from('contracts')
      .insert(legacyInsertPayload)
      .select('id, contract_number')
      .single()
  }

  if (insertResult.error || !insertResult.data) {
    const payload = failure('internal_error', insertResult.error?.message || 'Failed to create contract') as ApiResponse<{
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

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'contract',
    aggregateId: insertResult.data.id,
    eventType: 'contract.created',
    action: 'create_contract',
    payload: {
      title: body.title,
      contract_number: contractNumber,
      client_id: body.client_id,
      status: body.status || 'draft',
    },
    afterState: {
      id: insertResult.data.id,
      title: body.title,
      status: body.status || 'draft',
      contract_number: contractNumber,
    },
    idempotencyKey,
  })

  const lockVersion = (insertResult.data as { lock_version?: number }).lock_version ?? 0

  const payload = success(
    {
      contract_id: insertResult.data.id,
      lock_version: lockVersion,
    },
    mutationMeta(insertResult.data.id, lockVersion, artifacts.eventId, artifacts.correlationId)
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
