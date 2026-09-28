import { cookies, headers } from 'next/headers'
import { ApiResponse, failure } from './contracts'

interface CallApiV1Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  idempotencyKey?: string
}

function resolveBaseUrl(host: string | null, protocolHint: string | null): string | null {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  if (!host) return null

  const protocol = protocolHint || (host.includes('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}

export async function callApiV1<T>(path: string, options: CallApiV1Options = {}): Promise<ApiResponse<T>> {
  try {
    const headerStore = await headers()
    const cookieStore = await cookies()

    const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host')
    const protocol = headerStore.get('x-forwarded-proto')
    const baseUrl = resolveBaseUrl(host, protocol)

    if (!baseUrl) {
      return failure('invalid_request', 'Could not resolve API base URL from request context') as ApiResponse<T>
    }

    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    const response = await fetch(`${baseUrl}/api/v1${path}`, {
      method: options.method || 'GET',
      cache: 'no-store',
      headers: {
        'content-type': 'application/json',
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...(options.idempotencyKey ? { 'idempotency-key': options.idempotencyKey } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const payload = (await response.json()) as ApiResponse<T>
    return payload
  } catch (error) {
    console.error('API v1 call failed:', error)
    return failure('internal_error', 'Failed to call API v1') as ApiResponse<T>
  }
}
