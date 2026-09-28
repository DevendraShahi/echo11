import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

interface UpdateRoleBody {
  role?: 'admin' | 'member' | 'client'
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')
  if (!context.isAdmin) return apiError(403, 'forbidden', 'Only admins can manage roles')

  const { memberId } = await params
  const body = (await request.json()) as UpdateRoleBody

  if (!body.role) {
    return apiError(400, 'invalid_request', 'role is required')
  }

  if (memberId === context.userId) {
    return apiError(400, 'invalid_request', 'You cannot change your own role')
  }

  const route = `/identity/memberships/${memberId}/role`
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{ member_id: string; role: 'admin' | 'member' | 'client' }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  if (body.role !== 'admin') {
    const { data: admins } = await context.supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    const remainingAdmins = (admins || []).filter((admin) => admin.id !== memberId)
    if (remainingAdmins.length === 0) {
      const payload = failure('invalid_request', 'Cannot demote the last admin') as ApiResponse<{
        member_id: string
        role: 'admin' | 'member' | 'client'
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
  }

  const { data: before } = await context.supabase
    .from('profiles')
    .select('id, role')
    .eq('id', memberId)
    .single()

  const { error } = await context.supabase
    .from('profiles')
    .update({ role: body.role, updated_at: new Date().toISOString() })
    .eq('id', memberId)

  if (error) {
    const payload = failure('internal_error', error.message) as ApiResponse<{
      member_id: string
      role: 'admin' | 'member' | 'client'
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
    aggregateType: 'organization_membership',
    aggregateId: memberId,
    eventType: 'identity.role_updated',
    action: 'update_member_role',
    payload: {
      member_id: memberId,
      role: body.role,
    },
    beforeState: (before || null) as Record<string, unknown> | null,
    afterState: {
      member_id: memberId,
      role: body.role,
    },
    idempotencyKey,
  })

  const payload = success(
    {
      member_id: memberId,
      role: body.role,
    },
    mutationMeta(memberId, null, artifacts.eventId, artifacts.correlationId)
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
