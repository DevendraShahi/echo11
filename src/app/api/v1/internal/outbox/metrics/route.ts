import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

interface OutboxMetrics {
  pending_count: number
  pending_oldest_age_seconds: number
  failed_count: number
  retry_saturated_count: number
  max_dispatch_attempts_observed: number
  projection_staleness_seconds: {
    client_dashboard: number
    team_workload: number
    unread_counts: number
    activity: number
  }
}

function resolveSecret(request: NextRequest): string | null {
  return request.headers.get('x-outbox-dispatch-secret') || null
}

function secondsSince(iso: string | null | undefined): number {
  if (!iso) return 0
  const timestampMs = new Date(iso).getTime()
  if (!Number.isFinite(timestampMs)) return 0
  return Math.max(0, Math.floor((Date.now() - timestampMs) / 1000))
}

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.OUTBOX_DISPATCH_SECRET

  if (!expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'misconfigured',
          message: 'OUTBOX_DISPATCH_SECRET is not configured',
        },
      },
      { status: 500 }
    )
  }

  const receivedSecret = resolveSecret(request)
  if (!receivedSecret || receivedSecret !== expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'unauthorized',
          message: 'Invalid outbox dispatch secret',
        },
      },
      { status: 401 }
    )
  }

  const maxAttempts = Math.max(1, Number(process.env.OUTBOX_MAX_ATTEMPTS || '5'))
  const supabase = createServiceClient()

  const [
    { count: pendingCount },
    { data: pendingOldest },
    { count: failedCount },
    { count: retrySaturatedCount },
    { data: maxAttemptsRow },
    { data: clientProjectionStale },
    { data: teamProjectionStale },
    { data: unreadProjectionStale },
    { data: activityProjectionStale },
  ] = await Promise.all([
    supabase
      .from('domain_events')
      .select('*', { count: 'exact', head: true })
      .is('dispatched_at', null),
    supabase
      .from('domain_events')
      .select('created_at')
      .is('dispatched_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('domain_events')
      .select('*', { count: 'exact', head: true })
      .is('dispatched_at', null)
      .not('last_error', 'is', null),
    supabase
      .from('domain_events')
      .select('*', { count: 'exact', head: true })
      .is('dispatched_at', null)
      .gte('dispatch_attempts', maxAttempts),
    supabase
      .from('domain_events')
      .select('dispatch_attempts')
      .order('dispatch_attempts', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('client_dashboard_projection')
      .select('refreshed_at')
      .order('refreshed_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('team_workload_projection')
      .select('refreshed_at')
      .order('refreshed_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('unread_counts_projection')
      .select('refreshed_at')
      .order('refreshed_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('activity_projection')
      .select('occurred_at')
      .order('occurred_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const metrics: OutboxMetrics = {
    pending_count: pendingCount || 0,
    pending_oldest_age_seconds: secondsSince(pendingOldest?.created_at),
    failed_count: failedCount || 0,
    retry_saturated_count: retrySaturatedCount || 0,
    max_dispatch_attempts_observed: maxAttemptsRow?.dispatch_attempts || 0,
    projection_staleness_seconds: {
      client_dashboard: secondsSince(clientProjectionStale?.refreshed_at),
      team_workload: secondsSince(teamProjectionStale?.refreshed_at),
      unread_counts: secondsSince(unreadProjectionStale?.refreshed_at),
      activity: secondsSince(activityProjectionStale?.occurred_at),
    },
  }

  return NextResponse.json({
    ok: true,
    data: metrics,
    meta: {
      generated_at: new Date().toISOString(),
      max_attempts_threshold: maxAttempts,
    },
  })
}
