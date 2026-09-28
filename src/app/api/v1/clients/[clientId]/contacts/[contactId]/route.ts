import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'

interface UpdateContactBody {
  name?: string
  email?: string
  phone?: string
  role?: 'decision_maker' | 'stakeholder' | 'technical' | 'billing'
  is_primary?: boolean
  notes?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string; contactId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can update contacts')
  }

  const { clientId, contactId } = await params
  const body = (await request.json()) as UpdateContactBody

  if (body.name !== undefined && !body.name.trim()) {
    return apiError(400, 'invalid_request', 'Contact name cannot be empty')
  }

  const route = `/clients/${clientId}/contacts/${contactId}`
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

  const { data: before, error: beforeError } = await context.supabase
    .from('client_contacts')
    .select('id, client_id, name, email, phone, role, is_primary, notes')
    .eq('id', contactId)
    .eq('client_id', clientId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Contact not found')
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

  const { data: updated, error: updateError } = await context.supabase
    .from('client_contacts')
    .update({
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.email !== undefined ? { email: body.email || null } : {}),
      ...(body.phone !== undefined ? { phone: body.phone || null } : {}),
      ...(body.role !== undefined ? { role: body.role || null } : {}),
      ...(body.is_primary !== undefined ? { is_primary: body.is_primary } : {}),
      ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
    })
    .eq('id', contactId)
    .eq('client_id', clientId)
    .select('id, client_id, name, email, phone, role, is_primary, notes')
    .maybeSingle()

  if (updateError) {
    const payload = failure('internal_error', updateError.message) as ApiResponse<{
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

  if (!updated) {
    return apiError(404, 'not_found', 'Contact not found')
  }

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'client_contact',
    aggregateId: contactId,
    eventType: 'client.contact_updated',
    action: 'update_client_contact',
    payload: {
      client_id: clientId,
      contact_id: contactId,
      changed_fields: Object.keys(body),
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: (updated || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      contact_id: contactId,
      client_id: clientId,
      lock_version: null,
    },
    mutationMeta(contactId, null, artifacts.eventId, artifacts.correlationId)
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
  { params }: { params: Promise<{ clientId: string; contactId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can delete contacts')
  }

  const { clientId, contactId } = await params
  const route = `/clients/${clientId}/contacts/${contactId}/delete`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ contact_id: string; client_id: string }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: before, error: beforeError } = await context.supabase
    .from('client_contacts')
    .select('id, client_id, name, is_primary')
    .eq('id', contactId)
    .eq('client_id', clientId)
    .single()

  if (beforeError || !before) {
    return apiError(404, 'not_found', 'Contact not found')
  }

  if (before.is_primary) {
    const { count } = await context.supabase
      .from('client_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)

    if ((count ?? 0) > 1) {
      const payload = failure(
        'invalid_request',
        'Cannot delete the primary contact while other contacts exist. Assign a new primary first.'
      ) as ApiResponse<{ contact_id: string; client_id: string }>

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
  }

  const { error: deleteError } = await context.supabase
    .from('client_contacts')
    .delete()
    .eq('id', contactId)
    .eq('client_id', clientId)

  if (deleteError) {
    const payload = failure('internal_error', deleteError.message) as ApiResponse<{ contact_id: string; client_id: string }>
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
    aggregateId: contactId,
    eventType: 'client.contact_deleted',
    action: 'delete_client_contact',
    payload: {
      client_id: clientId,
      contact_id: contactId,
      name: before.name,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: null,
    idempotencyKey,
  })

  const payload = success(
    {
      contact_id: contactId,
      client_id: clientId,
    },
    mutationMeta(contactId, null, artifacts.eventId, artifacts.correlationId)
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
