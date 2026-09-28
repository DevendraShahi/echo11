import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

interface InvoiceItemInput {
  description: string
  quantity: number
  rate: number
}

interface UpdateInvoiceBody {
  client_id?: string
  project_id?: string | null
  due_date?: string
  items?: InvoiceItemInput[]
  tax_rate?: number
  notes?: string | null
  target_currency?: string | null
  exchange_rate?: number | null
  converted_total?: number | null
  conversion_date?: string | null
  expected_lock_version?: number
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { invoiceId } = await params

  const { data, error } = await context.supabase
    .from('invoices')
    .select(`
      *,
      client:clients(id, company_name, contact_name, email),
      project:projects(id, name)
    `)
    .eq('id', invoiceId)
    .single()

  if (error) return apiError(404, 'not_found', 'Invoice not found')

  const { data: items } = await context.supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('sort_order', { ascending: true })

  return apiOk({
    ...data,
    items: items || [],
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can update invoices')
  }

  const { invoiceId } = await params
  const body = (await request.json()) as UpdateInvoiceBody

  const route = `/finance/invoices/${invoiceId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ invoice_id: string; lock_version: number | null }>({
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
    .select('id, status, tax_rate, lock_version, project_id, client_id, subtotal, total, due_date, notes')
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
    }) as ApiResponse<{ invoice_id: string; lock_version: number | null }>

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

  if (body.client_id !== undefined) updateData.client_id = body.client_id
  if (body.project_id !== undefined) updateData.project_id = body.project_id
  if (body.due_date !== undefined) updateData.due_date = body.due_date
  if (body.tax_rate !== undefined) updateData.tax_rate = body.tax_rate
  if (body.notes !== undefined) updateData.notes = body.notes
  if (body.target_currency !== undefined) updateData.target_currency = body.target_currency
  if (body.exchange_rate !== undefined) updateData.exchange_rate = body.exchange_rate
  if (body.converted_total !== undefined) updateData.converted_total = body.converted_total
  if (body.conversion_date !== undefined) updateData.conversion_date = body.conversion_date

  if (body.items) {
    const invalidItem = body.items.find((item) => !item.description?.trim() || item.quantity <= 0 || item.rate < 0)
    if (invalidItem) {
      return apiError(400, 'invalid_request', 'Each item requires description, positive quantity, and non-negative rate')
    }

    const subtotal = body.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
    const taxRate = body.tax_rate ?? before.tax_rate ?? 0
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    updateData.subtotal = subtotal
    updateData.tax_amount = taxAmount
    updateData.total = total
  }

  let updateQuery = context.supabase
    .from('invoices')
    .update(updateData)
    .eq('id', invoiceId)

  if (typeof expectedLockVersion === 'number') {
    updateQuery = updateQuery.eq('lock_version', expectedLockVersion)
  }

  const { data: updated, error: updateError } = await updateQuery
    .select('id, lock_version, project_id, client_id, status, total')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
      invoice_id: string
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
    const payload = failure('conflict', 'Invoice update was rejected due to version mismatch') as ApiResponse<{
      invoice_id: string
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

  if (body.items) {
    const { error: deleteItemsError } = await context.supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId)

    if (deleteItemsError) {
      return apiError(500, 'internal_error', deleteItemsError.message)
    }

    if (body.items.length > 0) {
      const itemsToInsert = body.items.map((item, index) => ({
        invoice_id: invoiceId,
        description: item.description.trim(),
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
        sort_order: index,
      }))

      const { error: itemsError } = await context.supabase
        .from('invoice_items')
        .insert(itemsToInsert)

      if (itemsError) {
        return apiError(500, 'internal_error', itemsError.message)
      }
    }
  }

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'invoice',
    aggregateId: invoiceId,
    eventType: 'invoice.updated',
    action: 'update_invoice',
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
      invoice_id: invoiceId,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can delete invoices')
  }

  const { invoiceId } = await params

  const route = `/finance/invoices/${invoiceId}`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ invoice_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before } = await context.supabase
    .from('invoices')
    .select('id, invoice_number, total, project_id, client_id')
    .eq('id', invoiceId)
    .single()

  await context.supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)

  const { error } = await context.supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{ invoice_id: string }>

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
    aggregateType: 'invoice',
    aggregateId: invoiceId,
    eventType: 'invoice.deleted',
    action: 'delete_invoice',
    payload: {
      invoice_number: before?.invoice_number || null,
      total: before?.total || null,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    { invoice_id: invoiceId },
    mutationMeta(invoiceId, null, artifacts.eventId, artifacts.correlationId)
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
