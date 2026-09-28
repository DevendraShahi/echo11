import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

function resolveSecret(request: NextRequest): string | null {
  return request.headers.get('x-outbox-dispatch-secret') || null
}

function secondsSince(iso: string | null | undefined): number {
  if (!iso) return 0
  const timestampMs = new Date(iso).getTime()
  if (!Number.isFinite(timestampMs)) return 0
  return Math.max(0, Math.floor((Date.now() - timestampMs) / 1000))
}

function asThreshold(name: string, fallback: number): number {
  const parsed = Number(process.env[name] || String(fallback))
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(0, Math.floor(parsed))
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

  const maxAttempts = asThreshold('OUTBOX_MAX_ATTEMPTS', 5)
  const pendingAgeThreshold = asThreshold('OUTBOX_ALERT_PENDING_AGE_SECONDS', 300)
  const retrySaturatedThreshold = asThreshold('OUTBOX_ALERT_RETRY_SATURATED_COUNT', 1)
  const failedCountThreshold = asThreshold('OUTBOX_ALERT_FAILED_COUNT', 1)

  const supabase = createServiceClient()

  const [
    { count: pendingCount },
    { data: oldestPending },
    { count: failedCount },
    { count: retrySaturatedCount },
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
  ])

  const oldestPendingAgeSeconds = secondsSince(oldestPending?.created_at)
  const pending = pendingCount || 0
  const failed = failedCount || 0
  const saturated = retrySaturatedCount || 0

  const breached: string[] = []
  if (oldestPendingAgeSeconds >= pendingAgeThreshold) {
    breached.push('pending_age')
  }
  if (failed >= failedCountThreshold) {
    breached.push('failed_count')
  }
  if (saturated >= retrySaturatedThreshold) {
    breached.push('retry_saturated')
  }

  const healthy = breached.length === 0

  return NextResponse.json(
    {
      ok: healthy,
      data: {
        status: healthy ? 'healthy' : 'degraded',
        checks: {
          pending_count: pending,
          pending_oldest_age_seconds: oldestPendingAgeSeconds,
          failed_count: failed,
          retry_saturated_count: saturated,
        },
        thresholds: {
          pending_age_seconds: pendingAgeThreshold,
          failed_count: failedCountThreshold,
          retry_saturated_count: retrySaturatedThreshold,
          max_attempts: maxAttempts,
        },
        breached,
      },
      meta: {
        evaluated_at: new Date().toISOString(),
      },
    },
    { status: healthy ? 200 : 503 }
  )
}
