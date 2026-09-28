import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

interface UpdateInvoiceStatusBody {
  status?: InvoiceStatus
  expected_lock_version?: number
}

const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'overdue', 'cancelled'],
  overdue: ['paid', 'cancelled'],
  paid: [],
  cancelled: ['draft'],
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can update invoice status')
  }

  const { invoiceId } = await params
  const body = (await request.json()) as UpdateInvoiceStatusBody

  if (!body.status) {
    return apiError(400, 'invalid_request', 'status is required')
  }

  const route = `/finance/invoices/${invoiceId}/status`
  const idempotencyKey = request.headers.get('idempotency-key')

  const idempotency = await beginIdempotency<{ invoice_id: string; status: InvoiceStatus; lock_version: number | null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('invoices')
    .select('id, status, lock_version, paid_date, project_id')
    .eq('id', invoiceId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Invoice not found')
  }

  const expectedLockVersion = body.expected_lock_version
  if (typeof expectedLockVersion === 'number' && before.lock_version !== expectedLockVersion) {
    const payload = failure('conflict', 'Invoice has been modified by another update', {
      expected_lock_version: expectedLockVersion,
      current_lock_version: before.lock_version,
    }) as ApiResponse<{ invoice_id: string; status: InvoiceStatus; lock_version: number | null }>

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

  const currentStatus = before.status as InvoiceStatus
  if (VALID_TRANSITIONS[currentStatus] && !VALID_TRANSITIONS[currentStatus].includes(body.status)) {
    const payload = failure('invalid_request', `Cannot change invoice status from "${currentStatus}" to "${body.status}"`) as ApiResponse<{
      invoice_id: string
      status: InvoiceStatus
      lock_version: number | null
    }>

    await finalizeIdempotency({
      supabase: context.supabase,
      actorId: context.userId,
      route,
      idempotencyKey,
      response: payload,
      statusCode: 400,
    })

    return Response.json(payload, { status: 400 })
  }

  const updateData: Record<string, unknown> = {
    status: body.status,
    updated_at: new Date().toISOString(),
  }

  if (body.status === 'paid') {
    updateData.paid_date = new Date().toISOString()
  }

  let updateQuery = context.supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)

  if (typeof expectedLockVersion === 'number') {
    updateQuery = updateQuery.eq('lock_version', expectedLockVersion)
  }

  const { data: updated, error: updateError } = await updateQuery
    .select('id, status, lock_version')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
      invoice_id: string
      status: InvoiceStatus
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
    const payload = failure('conflict', 'Invoice status update was rejected due to version mismatch') as ApiResponse<{
      invoice_id: string
      status: InvoiceStatus
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
    aggregateType: 'invoice',
    aggregateId: invoiceId,
    eventType: 'invoice.status_updated',
    action: 'update_invoice_status',
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
      invoice_id: invoiceId,
      status: updated.status as InvoiceStatus,
      lock_version: lockVersion,
    },
    mutationMeta(invoiceId, lockVersion, artifacts.eventId, artifacts.correlationId)
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
