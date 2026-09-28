'use client'

import { useMemo, useState } from 'react'

interface UseListViewModelOptions<TFilter extends string, TSort extends string, TView extends string> {
  defaultFilter: TFilter
  defaultSort?: TSort
  defaultView?: TView
  initialQuery?: string
}

export function useListViewModel<TFilter extends string, TSort extends string, TView extends string>({
  defaultFilter,
  defaultSort,
  defaultView,
  initialQuery = '',
}: UseListViewModelOptions<TFilter, TSort, TView>) {
  const [query, setQuery] = useState(initialQuery)
  const [filterBy, setFilterBy] = useState<TFilter>(defaultFilter)
  const [sortBy, setSortBy] = useState<TSort | null>(defaultSort ?? null)
  const [viewMode, setViewMode] = useState<TView | null>(defaultView ?? null)

  const hasActiveControls = useMemo(() => {
    if (query.trim().length > 0) return true
    if (filterBy !== defaultFilter) return true
    if (defaultSort && sortBy !== defaultSort) return true
    if (defaultView && viewMode !== defaultView) return true
    return false
  }, [defaultFilter, defaultSort, defaultView, filterBy, query, sortBy, viewMode])

  function resetControls() {
    setQuery(initialQuery)
    setFilterBy(defaultFilter)
    if (defaultSort !== undefined) {
      setSortBy(defaultSort)
    }
    if (defaultView !== undefined) {
      setViewMode(defaultView)
    }
  }

  return {
    query,
    setQuery,
    filterBy,
    setFilterBy,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    hasActiveControls,
    resetControls,
  }
}
