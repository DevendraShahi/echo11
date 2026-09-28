interface ErrorLike {
  code?: string
  message?: string
}

export function isMissingRelationOrColumnError(error: ErrorLike | null | undefined): boolean {
  if (!error) return false

  if (error.code === '42P01' || error.code === '42703') {
    return true
  }

  if (error.code === 'PGRST204' || error.code === 'PGRST205') {
    return true
  }

  const message = error.message?.toLowerCase() || ''
  return (
    message.includes('does not exist') ||
    message.includes('column') ||
    message.includes('relation') ||
    message.includes('schema cache')
  )
}
