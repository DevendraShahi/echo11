import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

interface CreateContactBody {
  name?: string
  email?: string
  phone?: string
  role?: 'decision_maker' | 'stakeholder' | 'technical' | 'billing'
  is_primary?: boolean
  notes?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can add contacts')
  }

  const { clientId } = await params
  const body = (await request.json()) as CreateContactBody
  const name = body.name?.trim()

  if (!name) return apiError(400, 'invalid_request', 'Contact name is required')

  const route = `/clients/${clientId}/contacts`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ contact_id: string; client_id: string; lock_version: null }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  if (body.is_primary) {
    const { error: resetError } = await context.supabase
      .from('client_contacts')
      .update({ is_primary: false })
      .eq('client_id', clientId)

    if (resetError) {
      const payload = failure('internal_error', resetError.message) as ApiResponse<{
        contact_id: string
        client_id: string
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
  }

  const { data: created, error: createError } = await context.supabase
    .from('client_contacts')
    .insert({
      client_id: clientId,
      name,
      email: body.email || undefined,
      phone: body.phone || undefined,
      role: body.role || undefined,
      is_primary: body.is_primary || false,
      notes: body.notes || undefined,
    })
    .select('id, client_id, name, email, phone, role, is_primary, notes')
    .single()

  if (createError || !created) {
    const payload = failure('internal_error', createError?.message || 'Failed to create contact') as ApiResponse<{
      contact_id: string
      client_id: string
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
    aggregateType: 'client_contact',
    aggregateId: created.id,
    eventType: 'client.contact_created',
    action: 'create_client_contact',
    payload: {
      client_id: clientId,
      contact_id: created.id,
      is_primary: created.is_primary,
    },
    afterState: (created || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      contact_id: created.id,
      client_id: clientId,
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
