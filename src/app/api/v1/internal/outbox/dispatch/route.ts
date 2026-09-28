import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { applyEventProjections, DomainEventRow } from '@/lib/api/v1/outbox-projections'

interface DispatchBody {
  batch_size?: number
  max_attempts?: number
  dry_run?: boolean
}

interface DispatchResult {
  scanned: number
  claimed: number
  dispatched: number
  failed: number
  skipped: number
  max_lag_seconds: number
  errors: { event_id: string; error: string }[]
}

function resolveSecret(request: NextRequest): string | null {
  return request.headers.get('x-outbox-dispatch-secret') || null
}

function clampBatchSize(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.max(1, Math.min(200, Math.floor(value)))
}

function parseTimestampSeconds(timestamp: string): number {
  const createdAtMs = new Date(timestamp).getTime()
  if (!Number.isFinite(createdAtMs)) return 0
  return Math.max(0, Math.floor((Date.now() - createdAtMs) / 1000))
}

export async function POST(request: NextRequest) {
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

  let body: DispatchBody = {}
  try {
    body = (await request.json()) as DispatchBody
  } catch {
    body = {}
  }

  const defaultBatchSize = Number(process.env.OUTBOX_DISPATCH_BATCH_SIZE || '50')
  const batchSize = clampBatchSize(body.batch_size, Number.isFinite(defaultBatchSize) ? defaultBatchSize : 50)
  const maxAttempts = clampBatchSize(body.max_attempts, 5)
  const dryRun = Boolean(body.dry_run)

  const supabase = createServiceClient()

  const { data: events, error: eventsError } = await supabase
    .from('domain_events')
    .select('id, organization_id, actor_id, aggregate_type, aggregate_id, event_type, payload, created_at, dispatch_attempts')
    .is('dispatched_at', null)
    .lt('dispatch_attempts', maxAttempts)
    .order('created_at', { ascending: true })
    .limit(batchSize)

  if (eventsError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'query_failed',
          message: eventsError.message,
        },
      },
      { status: 500 }
    )
  }

  const result: DispatchResult = {
    scanned: events?.length || 0,
    claimed: 0,
    dispatched: 0,
    failed: 0,
    skipped: 0,
    max_lag_seconds: 0,
    errors: [],
  }

  for (const row of (events || []) as DomainEventRow[]) {
    const lagSeconds = parseTimestampSeconds(row.created_at)
    if (lagSeconds > result.max_lag_seconds) {
      result.max_lag_seconds = lagSeconds
    }

    if (dryRun) {
      result.skipped += 1
      continue
    }

    const { data: claimedRow, error: claimError } = await supabase
      .from('domain_events')
      .update({
        dispatch_attempts: row.dispatch_attempts + 1,
        last_error: null,
      })
      .eq('id', row.id)
      .is('dispatched_at', null)
      .eq('dispatch_attempts', row.dispatch_attempts)
      .select('id, organization_id, actor_id, aggregate_type, aggregate_id, event_type, payload, created_at, dispatch_attempts')
      .maybeSingle()

    if (claimError) {
      result.failed += 1
      result.errors.push({ event_id: row.id, error: claimError.message })
      continue
    }

    if (!claimedRow) {
      result.skipped += 1
      continue
    }

    result.claimed += 1

    try {
      await applyEventProjections(supabase, claimedRow as DomainEventRow)

      const { error: markError } = await supabase
        .from('domain_events')
        .update({
          dispatched_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', row.id)

      if (markError) {
        throw new Error(markError.message)
      }

      result.dispatched += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown dispatch error'

      await supabase
        .from('domain_events')
        .update({
          last_error: message,
        })
        .eq('id', row.id)

      result.failed += 1
      result.errors.push({ event_id: row.id, error: message })
    }
  }

  return NextResponse.json({
    ok: true,
    data: result,
    meta: {
      batch_size: batchSize,
      max_attempts: maxAttempts,
      dry_run: dryRun,
      generated_at: new Date().toISOString(),
    },
  })
}
