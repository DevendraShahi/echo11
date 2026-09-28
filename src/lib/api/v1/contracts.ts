export interface ApiErrorShape {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiMutationMeta {
  resource_id: string
  lock_version: number | null
  event_id: string | null
  correlation_id: string
}

export interface ApiSuccess<T> {
  ok: true
  data: T
  meta?: ApiMutationMeta
}

export interface ApiFailure {
  ok: false
  error: ApiErrorShape
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export function success<T>(data: T, meta?: ApiMutationMeta): ApiSuccess<T> {
  return { ok: true, data, ...(meta ? { meta } : {}) }
}

export function failure(code: string, message: string, details?: Record<string, unknown>): ApiFailure {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  }
}

export function isApiFailure<T>(value: ApiResponse<T>): value is ApiFailure {
  return !value.ok
}
