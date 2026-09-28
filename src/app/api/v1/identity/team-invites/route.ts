import { NextRequest } from 'next/server'
import { beginIdempotency, finalizeIdempotency } from '@/lib/api/v1/idempotency'
import { ApiResponse, failure, success } from '@/lib/api/v1/contracts'
import { getApiActorContext } from '@/lib/api/v1/context'
import { apiError, apiOk, mutationMeta, statusFromResponse } from '@/lib/api/v1/response'
import { recordMutationArtifacts } from '@/lib/api/v1/events'

type TeamInviteRole = 'admin' | 'member' | 'client'

interface CreateTeamInviteBody {
  email?: string
  role?: TeamInviteRole
  job_title?: string | null
}

export async function POST(request: NextRequest) {
  const context = await getApiActorContext()
  if (!context) return apiError(401, 'unauthorized', 'You must be logged in')
  if (!context.isAdmin) return apiError(403, 'forbidden', 'Only admins can invite team members')

  const body = (await request.json()) as CreateTeamInviteBody
  const normalizedEmail = body.email?.trim().toLowerCase()

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return apiError(400, 'invalid_request', 'A valid email is required')
  }

  if (!body.role || !['admin', 'member', 'client'].includes(body.role)) {
    return apiError(400, 'invalid_request', 'A valid role is required')
  }

  const route = '/identity/team-invites'
  const idempotencyKey = request.headers.get('idempotency-key')
  const idempotency = await beginIdempotency<{
    invite_id: string
    email: string
    role: TeamInviteRole
    job_title: string | null
    expires_at: string
  }>({
    supabase: context.supabase,
    actorId: context.userId,
    route,
    idempotencyKey,
  })

  if (idempotency.replay) {
    return Response.json(idempotency.replay, { status: statusFromResponse(idempotency.replay) })
  }

  const { data: existingProfile } = await context.supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingProfile) {
    const payload = failure('invalid_request', 'A user with this email already exists') as ApiResponse<{
      invite_id: string
      email: string
      role: TeamInviteRole
      job_title: string | null
      expires_at: string
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

  const { data: existingInvite } = await context.supabase
    .from('team_invites')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (existingInvite) {
    const payload = failure('invalid_request', 'An invitation is already pending for this email') as ApiResponse<{
      invite_id: string
      email: string
      role: TeamInviteRole
      job_title: string | null
      expires_at: string
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

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: created, error: createError } = await context.supabase
    .from('team_invites')
    .insert({
      email: normalizedEmail,
      role: body.role,
      job_title: body.job_title || null,
      invited_by: context.userId,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select('id, email, role, job_title, expires_at')
    .single()

  if (createError || !created) {
    const payload = failure('internal_error', createError?.message || 'Failed to create invite') as ApiResponse<{
      invite_id: string
      email: string
      role: TeamInviteRole
      job_title: string | null
      expires_at: string
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
    aggregateType: 'team_invite',
    aggregateId: created.id,
    eventType: 'identity.team_invite_created',
    action: 'create_team_invite',
    payload: {
      invite_id: created.id,
      email: created.email,
      role: created.role,
    },
    afterState: (created || null) as Record<string, unknown> | null,
    idempotencyKey,
  })

  const payload = success(
    {
      invite_id: created.id,
      email: created.email,
      role: created.role as TeamInviteRole,
      job_title: created.job_title,
      expires_at: created.expires_at,
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
