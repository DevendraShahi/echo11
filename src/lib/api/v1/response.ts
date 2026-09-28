import { NextResponse } from 'next/server'
import { ApiMutationMeta, ApiResponse, failure, success } from './contracts'

export function mutationMeta(
  resourceId: string,
  lockVersion: number | null,
  eventId: string | null,
  correlationId: string
): ApiMutationMeta {
  return {
    resource_id: resourceId,
    lock_version: lockVersion,
    event_id: eventId,
    correlation_id: correlationId,
  }
}

export function apiOk<T>(data: T, options?: { status?: number; meta?: ApiMutationMeta }) {
  const payload = success(data, options?.meta)
  return NextResponse.json(payload, { status: options?.status || 200 })
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  const payload = failure(code, message, details)
  return NextResponse.json(payload, { status })
}

export function statusFromResponse<T>(response: ApiResponse<T>): number {
  if (response.ok) return 200

  switch (response.error.code) {
    case 'unauthorized':
      return 401
    case 'forbidden':
      return 403
    case 'not_found':
      return 404
    case 'conflict':
      return 409
    case 'invalid_request':
      return 400
    default:
      return 500
  }
}
