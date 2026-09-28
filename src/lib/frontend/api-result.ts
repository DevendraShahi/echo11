export type ApiResult<T> = ApiSuccess<T> | ApiError

export type ApiSuccess<T> = {
  ok: true
  data: T
}

export type ApiError = {
  ok: false
  error: string
  code?: string
  status?: number
}

export function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true, data }
}

export function err(error: string, code?: string, status?: number): ApiError {
  return { ok: false, error, code, status }
}

export function isOk<T>(result: ApiResult<T>): result is ApiSuccess<T> {
  return result.ok === true
}

export function isError<T>(result: ApiResult<T>): result is ApiError {
  return result.ok === false
}

export function unwrap<T>(result: ApiResult<T>): T {
  if (result.ok) return result.data
  throw new Error(result.error)
}

export function unwrapOr<T>(result: ApiResult<T>, fallback: T): T {
  if (result.ok) return result.data
  return fallback
}

export function mapResult<T, U>(result: ApiResult<T>, fn: (data: T) => U): ApiResult<U> {
  if (result.ok) return ok(fn(result.data))
  return result
}

export async function tryCatch<T>(fn: () => Promise<T>): Promise<ApiResult<T>> {
  try {
    const data = await fn()
    return ok(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'An unexpected error occurred'
    return err(message)
  }
}

export function combineResults<T>(results: ApiResult<T>[]): ApiResult<T[]> {
  const errors = results.filter(isError)
  if (errors.length > 0) {
    return err(errors.map(e => e.error).join('; '))
  }
  return ok(results.filter(isOk).map(r => r.data))
}

export type PaginationResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export function paginate<T>(data: T[], total: number, page: number, pageSize: number): PaginationResult<T> {
  return {
    data,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  }
}
