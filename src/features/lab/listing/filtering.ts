export function normalizeText(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase()
}

export function matchesQuery(query: string, values: Array<string | null | undefined>): boolean {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) {
    return true
  }

  return values.some((value) => normalizeText(value).includes(normalizedQuery))
}

export function getCountByKey<TItem, TKey extends string>(
  items: TItem[],
  keys: readonly TKey[],
  getKey: (item: TItem) => TKey
): Record<TKey, number> {
  const initial = keys.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {} as Record<TKey, number>)

  return items.reduce((acc, item) => {
    const key = getKey(item)
    if (key in acc) {
      acc[key] += 1
    }
    return acc
  }, initial)
}
