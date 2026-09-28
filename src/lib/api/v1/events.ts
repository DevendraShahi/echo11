import { createClient } from '@/lib/supabase/server'
import { isMissingRelationOrColumnError } from './compat'

type SupabaseLike = Awaited<ReturnType<typeof createClient>>

export interface MutationEventInput {
  supabase: SupabaseLike
  organizationId: string | null
  actorId: string
  aggregateType: string
  aggregateId: string
  eventType: string
  action: string
  payload: Record<string, unknown>
  beforeState?: Record<string, unknown> | null
  afterState?: Record<string, unknown> | null
  idempotencyKey?: string | null
  correlationId?: string
}

export interface MutationEventResult {
  eventId: string | null
  correlationId: string
}

export async function recordMutationArtifacts({
  supabase,
  organizationId,
  actorId,
  aggregateType,
  aggregateId,
  eventType,
  action,
  payload,
  beforeState,
  afterState,
  idempotencyKey,
  correlationId,
}: MutationEventInput): Promise<MutationEventResult> {
  const resolvedCorrelationId = correlationId || crypto.randomUUID()
  let eventId: string | null = null

  if (organizationId) {
    const { data: eventRow, error: eventError } = await supabase
      .from('domain_events')
      .insert({
        organization_id: organizationId,
        actor_id: actorId,
        aggregate_type: aggregateType,
        aggregate_id: aggregateId,
        event_type: eventType,
        payload,
        correlation_id: resolvedCorrelationId,
        idempotency_key: idempotencyKey || null,
      })
      .select('id')
      .maybeSingle()

    if (eventError && !isMissingRelationOrColumnError(eventError)) {
      console.error('Failed to write domain event:', eventError)
    } else {
      eventId = eventRow?.id || null
    }
  }

  const { error: auditError } = await supabase
    .from('audit_log')
    .insert({
      organization_id: organizationId,
      actor_id: actorId,
      action,
      entity_type: aggregateType,
      entity_id: aggregateId,
      before_state: beforeState || null,
      after_state: afterState || null,
      correlation_id: resolvedCorrelationId,
      metadata: payload,
    })

  if (auditError && !isMissingRelationOrColumnError(auditError)) {
    console.error('Failed to write audit log:', auditError)
  }

  return {
    eventId,
    correlationId: resolvedCorrelationId,
  }
}
