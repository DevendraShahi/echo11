import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

interface InvoiceItemInput {
  description: string
  quantity: number
  rate: number
}

interface CreateInvoiceBody {
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
}

export async function GET() {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { data, error } = await context.supabase
    .from('invoices')
    .select('id, invoice_number, client_id, project_id, status, total, due_date, lock_version, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) return apiError(500, 'internal_error', error.message)
  return apiOk(data || [])
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can create invoices')
  }

  const body = (await request.json()) as CreateInvoiceBody

  if (!body.client_id) return apiError(400, 'invalid_request', 'client_id is required')
  if (!body.due_date) return apiError(400, 'invalid_request', 'due_date is required')

  const items = body.items || []
  if (items.length === 0) {
    return apiError(400, 'invalid_request', 'At least one invoice item is required')
  }

  const invalidItem = items.find((item) => !item.description?.trim() || item.quantity <= 0 || item.rate < 0)
  if (invalidItem) {
    return apiError(400, 'invalid_request', 'Each item requires description, positive quantity, and non-negative rate')
  }

  const route = '/finance/invoices'
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

  const { count } = await context.supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })

  const invoiceNumber = `INV-${String((count || 0) + 1).padStart(4, '0')}`
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const taxRate = body.tax_rate ?? 0
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const insertPayload = {
    invoice_number: invoiceNumber,
    client_id: body.client_id,
    project_id: body.project_id || null,
    status: 'draft',
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total,
    due_date: body.due_date,
    notes: body.notes || null,
    created_by: context.userId,
    target_currency: body.target_currency || null,
    exchange_rate: body.exchange_rate || null,
    converted_total: body.converted_total || null,
    conversion_date: body.conversion_date || null,
    organization_id: context.organizationId,
  }

  let insertResult = await context.supabase
    .from('invoices')
    .insert(insertPayload)
    .select('id, lock_version, invoice_number, project_id, client_id')
    .single()

  if (insertResult.error && isMissingRelationOrColumnError(insertResult.error)) {
    const legacyInsertPayload = { ...insertPayload }
    delete (legacyInsertPayload as Record<string, unknown>).organization_id
    insertResult = await context.supabase
      .from('invoices')
      .insert(legacyInsertPayload)
      .select('id, invoice_number, project_id, client_id')
      .single()
  }

  if (insertResult.error || !insertResult.data) {
    const payload = failure('internal_error', insertResult.error?.message || 'Failed to create invoice') as ApiResponse<{
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

  const itemsToInsert = items.map((item, index) => ({
    invoice_id: insertResult.data.id,
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
    await context.supabase.from('invoices').delete().eq('id', insertResult.data.id)

    const payload = failure('internal_error', itemsError.message) as ApiResponse<{
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

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'invoice',
    aggregateId: insertResult.data.id,
    eventType: 'invoice.created',
    action: 'create_invoice',
    payload: {
      invoice_number: invoiceNumber,
      total,
      client_id: body.client_id,
      project_id: body.project_id || null,
      item_count: items.length,
    },
    afterState: {
      id: insertResult.data.id,
      invoice_number: invoiceNumber,
      status: 'draft',
      total,
    },
    idempotencyKey,
  })

  const lockVersion = (insertResult.data as { lock_version?: number }).lock_version ?? 0

  const payload = success(
    {
      invoice_id: insertResult.data.id,
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
