import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'
import { requireAdminOrLead } from '@/lib/api/v1/permissions'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

interface CreateClientBody {
  company_name?: string
  contact_name?: string | null
  email?: string
  phone?: string | null
  address?: string | null
  notes?: string | null
  auth_id?: string | null
  invitation_sent_at?: string | null
  invitation_token?: string | null
  invitation_token_expires_at?: string | null
  created_by?: string | null
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
}

export async function GET() {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const { data, error } = await context.supabase
    .from('clients')
    .select('id, company_name, contact_name, email, auth_id, lock_version, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) return apiError(500, 'internal_error', error.message)
  return apiOk(data || [])
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')

  const allowed = await requireAdminOrLead(context.supabase, context.userId)
  if (!allowed) {
    return apiError(403, 'forbidden', 'Only admins or team leads can create clients')
  }

  const body = (await request.json()) as CreateClientBody
  const companyName = body.company_name?.trim()
  const email = body.email?.trim().toLowerCase()

  if (!companyName) return apiError(400, 'invalid_request', 'company_name is required')
  if (!email) return apiError(400, 'invalid_request', 'email is required')

  const route = '/clients'
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

  let insert = await context.supabase
    .from('clients')
    .insert({
      company_name: companyName,
      contact_name: body.contact_name || null,
      email,
      phone: body.phone || null,
      address: body.address || null,
      notes: body.notes || null,
      auth_id: body.auth_id || null,
      invitation_sent_at: body.invitation_sent_at || null,
      invitation_token: body.invitation_token || null,
      invitation_token_expires_at: body.invitation_token_expires_at || null,
      created_by: body.created_by || context.userId,
      website: body.website || null,
      industry: body.industry || null,
      source: body.source || null,
      tags: body.tags || null,
      default_hourly_rate: body.default_hourly_rate || null,
      address_line2: body.address_line2 || null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || null,
      postal_code: body.postal_code || null,
      timezone: body.timezone || null,
      social_links: body.social_links || null,
      organization_id: context.organizationId,
    })
    .select('id, lock_version')
    .single()

  if (insert.error && isMissingRelationOrColumnError(insert.error)) {
    insert = await context.supabase
      .from('clients')
      .insert({
        company_name: companyName,
        contact_name: body.contact_name || null,
        email,
        phone: body.phone || null,
        address: body.address || null,
        notes: body.notes || null,
        auth_id: body.auth_id || null,
        invitation_sent_at: body.invitation_sent_at || null,
        invitation_token: body.invitation_token || null,
        invitation_token_expires_at: body.invitation_token_expires_at || null,
        created_by: body.created_by || context.userId,
        website: body.website || null,
        industry: body.industry || null,
        source: body.source || null,
        tags: body.tags || null,
        default_hourly_rate: body.default_hourly_rate || null,
        address_line2: body.address_line2 || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || null,
        postal_code: body.postal_code || null,
        timezone: body.timezone || null,
        social_links: body.social_links || null,
      })
      .select('id')
      .single()
  }

  if (insert.error || !insert.data) {
    const payload = failure('internal_error', insert.error?.message || 'Failed to create client') as ApiResponse<{
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

  const artifacts = await recordMutationArtifacts({
    supabase: context.supabase,
    organizationId: context.organizationId,
    actorId: context.userId,
    aggregateType: 'client',
    aggregateId: insert.data.id,
    eventType: 'client.created',
    action: 'create_client',
    payload: {
      company_name: companyName,
      email,
    },
    afterState: {
      id: insert.data.id,
      company_name: companyName,
      email,
    },
    idempotencyKey,
  })

  const lockVersion = (insert.data as { lock_version?: number }).lock_version ?? 0
  const payload = success(
    {
      client_id: insert.data.id,
      lock_version: lockVersion,
    },
    mutationMeta(insert.data.id, lockVersion, artifacts.eventId, artifacts.correlationId)
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
