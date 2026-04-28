'use client'

import { useMemo, useState } from 'react'
import { ArrowDownUp, ListFilter } from 'lucide-react'
import { ClientProjectCard } from './ClientProjectCard'

interface ClientProject {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  color: string
  deadline: string | null
  start_date: string | null
  created_at: string | null
}

type StatusFilter = 'all' | 'active' | 'completed' | 'on_hold' | 'archived'
type SortOption = 'recent' | 'progress' | 'deadline'

interface ClientProjectsGridProps {
  projects: ClientProject[]
  basePath?: string
  limit?: number
  showStatusFilter?: boolean
  showSortControl?: boolean
  showStartDate?: boolean
}

export function ClientProjectsGrid({
  projects,
  basePath = '/client/projects',
  limit,
  showStatusFilter = true,
  showSortControl = true,
  showStartDate = true,
}: ClientProjectsGridProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  const visibleProjects = useMemo(() => {
    let items = [...projects]

    if (showStatusFilter && statusFilter !== 'all') {
      items = items.filter((project) => project.status === statusFilter)
    }

    items.sort((a, b) => {
      if (sortBy === 'progress') {
        return b.progress - a.progress
      }

      if (sortBy === 'deadline') {
        if (!a.deadline && !b.deadline) return 0
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }

      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      return bTime - aTime
    })

    if (typeof limit === 'number') {
      return items.slice(0, limit)
    }

    return items
  }, [projects, showStatusFilter, statusFilter, sortBy, limit])

  return (
    <div className="space-y-4">
      {(showStatusFilter || showSortControl) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {showStatusFilter ? (
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-white/40" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white focus:border-accent focus:outline-none"
              >
                <option value="all" className="bg-black">All statuses</option>
                <option value="active" className="bg-black">Active</option>
                <option value="completed" className="bg-black">Completed</option>
                <option value="on_hold" className="bg-black">On Hold</option>
                <option value="archived" className="bg-black">Archived</option>
              </select>
            </div>
          ) : (
            <span />
          )}

          {showSortControl && (
            <div className="flex items-center gap-2">
              <ArrowDownUp className="h-4 w-4 text-white/40" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white focus:border-accent focus:outline-none"
              >
                <option value="recent" className="bg-black">Most recent</option>
                <option value="progress" className="bg-black">Highest progress</option>
                <option value="deadline" className="bg-black">Closest deadline</option>
              </select>
            </div>
          )}
        </div>
      )}

      {visibleProjects.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-8 text-center text-sm text-white/40">
          No projects match your current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ClientProjectCard
              key={project.id}
              project={project}
              href={`${basePath}/${project.id}`}
              showStartDate={showStartDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
