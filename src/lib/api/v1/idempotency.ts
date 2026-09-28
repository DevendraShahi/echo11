import { createClient } from '@/lib/supabase/server'
import { ApiResponse } from './contracts'
import { isMissingRelationOrColumnError } from './compat'

type SupabaseLike = Awaited<ReturnType<typeof createClient>>

interface BeginIdempotencyArgs {
  supabase: SupabaseLike
  actorId: string
  route: string
  idempotencyKey: string | null
}

export interface BeginIdempotencyResult<T> {
  replay?: ApiResponse<T>
  active: boolean
}

export async function beginIdempotency<T>({
  supabase,
  actorId,
  route,
  idempotencyKey,
}: BeginIdempotencyArgs): Promise<BeginIdempotencyResult<T>> {
  if (!idempotencyKey) {
    return { active: false }
  }

  const { data: existing, error: existingError } = await supabase
    .from('request_dedup')
    .select('response_body')
    .eq('actor_id', actorId)
    .eq('route', route)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle()

  if (existingError && !isMissingRelationOrColumnError(existingError)) {
    return { active: false }
  }

  if (existing?.response_body) {
    return {
      active: true,
      replay: existing.response_body as ApiResponse<T>,
    }
  }

  const { error: insertError } = await supabase
    .from('request_dedup')
    .insert({
      actor_id: actorId,
      route,
      idempotency_key: idempotencyKey,
    })

  if (insertError && !isMissingRelationOrColumnError(insertError)) {
    const conflict = insertError.code === '23505'
    if (conflict) {
      const { data: concurrent } = await supabase
        .from('request_dedup')
        .select('response_body')
        .eq('actor_id', actorId)
        .eq('route', route)
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle()

      if (concurrent?.response_body) {
        return {
          active: true,
          replay: concurrent.response_body as ApiResponse<T>,
        }
      }
    }

    return { active: false }
  }

  return { active: true }
}

interface FinalizeIdempotencyArgs<T> {
  supabase: SupabaseLike
  actorId: string
  route: string
  idempotencyKey: string | null
  response: ApiResponse<T>
  statusCode: number
}

export async function finalizeIdempotency<T>({
  supabase,
  actorId,
  route,
  idempotencyKey,
  response,
  statusCode,
}: FinalizeIdempotencyArgs<T>): Promise<void> {
  if (!idempotencyKey) return

  const { error } = await supabase
    .from('request_dedup')
    .update({
      response_status: statusCode,
      response_body: response,
      finalized_at: new Date().toISOString(),
    })
    .eq('actor_id', actorId)
    .eq('route', route)
    .eq('idempotency_key', idempotencyKey)

  if (error && !isMissingRelationOrColumnError(error)) {
    console.error('Failed to finalize idempotency record:', error)
  }
}
