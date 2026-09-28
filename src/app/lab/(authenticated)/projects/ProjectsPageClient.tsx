'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Building2,
  CheckSquare,
  DollarSign,
  Edit,
  ExternalLink,
  FolderKanban,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react'
import { LabCard as Card, LabCardContent } from '@/components/ui/LabCard'
import { LabBadge } from '@/components/ui/LabBadge'
import { LabButton } from '@/components/ui/LabButton'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterTabs, FilterTab } from '@/components/ui/FilterTabs'
import { ViewToggle } from '@/components/ui/ViewToggle'
import { EmptyState } from '@/components/ui/EmptyState'
import { LabPageHeader } from '@/components/lab/primitives/LabPageHeader'
import { deleteProject } from '@/lib/actions/project-actions'
import { Client, Milestone, Project, ProjectStatus } from '@/types/lab'
import { getCountByKey, matchesQuery } from '@/features/lab/listing/filtering'
import { calculateWeightedTaskProgress } from '@/features/lab/projects/progress'
import { useListViewModel } from '@/features/lab/listing/useListViewModel'

type ProjectWithClient = Omit<Project, 'client'> & {
  client?: Pick<Client, 'company_name' | 'contact_name'> | null
  milestones?: Milestone[]
  tasks?: { status: string; priority: string }[]
}

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'ghost' | 'accent' }> = {
  active: { label: 'Active', variant: 'accent' },
  on_hold: { label: 'On Hold', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  archived: { label: 'Archived', variant: 'ghost' },
}

interface ProjectsPageClientProps {
  initialProjects: ProjectWithClient[]
  initialClients: { id: string; company_name: string }[]
  canEdit?: boolean
}

const statusTabs: FilterTab[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'on_hold', label: 'On Hold' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
]

function getDaysLeftLabel(deadline: string | null | undefined) {
  if (!deadline) return { label: 'No deadline', tone: 'text-white/55' }

  const now = Date.now()
  const end = new Date(deadline).getTime()
  const dayDiff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))

  if (dayDiff < 0) return { label: `${Math.abs(dayDiff)}d overdue`, tone: 'text-rose-300' }
  if (dayDiff === 0) return { label: 'Due today', tone: 'text-amber-300' }
  if (dayDiff <= 3) return { label: `${dayDiff}d left`, tone: 'text-amber-300' }
  return { label: `${dayDiff}d left`, tone: 'text-emerald-300' }
}

export default function ProjectsPageClient({ initialProjects, canEdit = false }: ProjectsPageClientProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filterBy: statusFilter,
    setFilterBy: setStatusFilter,
    viewMode,
    setViewMode,
  } = useListViewModel<ProjectStatus | 'all', string, 'grid' | 'list'>({
    defaultFilter: 'all',
    defaultView: 'grid',
  })

  const view = viewMode || 'grid'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (!(target as Element).closest?.('[data-project-menu]')) {
        setMenuOpenId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const calculateProgress = (project: ProjectWithClient) =>
    calculateWeightedTaskProgress(project.tasks, project.progress || 0)

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const projectMatches = matchesQuery(searchQuery, [project.name, project.description])
        const statusMatches = statusFilter === 'all' || project.status === statusFilter
        return projectMatches && statusMatches
      }),
    [projects, searchQuery, statusFilter]
  )

  const statusCounts = useMemo(() => {
    const keys = ['active', 'on_hold', 'completed', 'archived'] as const
    const counts = getCountByKey(projects, keys, (project) => project.status)
    return {
      all: projects.length,
      ...counts,
    }
  }, [projects])

  const dashboardMetrics = useMemo(() => {
    const overdue = projects.filter((project) => {
      if (!project.deadline) return false
      return new Date(project.deadline).getTime() < Date.now() && project.status !== 'completed' && project.status !== 'archived'
    }).length

    const active = projects.filter((project) => project.status === 'active').length
    const totalTasks = projects.reduce((sum, project) => sum + (project.tasks?.length || 0), 0)
    const completedTasks = projects.reduce(
      (sum, project) => sum + (project.tasks?.filter((task) => task.status === 'done').length || 0),
      0
    )

    const avgProgress =
      projects.length > 0
        ? Math.round(projects.reduce((sum, project) => sum + calculateProgress(project), 0) / projects.length)
        : 0

    return {
      active,
      overdue,
      taskCompletionLabel: `${completedTasks}/${totalTasks}`,
      avgProgress,
    }
  }, [projects])

  const tabsWithCounts = statusTabs.map((tab) => ({
    ...tab,
    count: statusCounts[tab.id as keyof typeof statusCounts],
  }))

  const handleDelete = async (id: string) => {
    setDeleting(true)
    setDeleteError(null)

    const result = await deleteProject(id)

    if (result.success) {
      setProjects((prev) => prev.filter((project) => project.id !== id))
      setDeleteConfirmId(null)
    } else {
      setDeleteError(result.error || 'Failed to delete project')
    }

    setDeleting(false)
  }

  return (
    <div className="space-y-7 font-sans">
      <section className="relative overflow-hidden border border-white/10 bg-[#04080d]">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[20rem] justify-center overflow-hidden">
          <div className="orb-pulse absolute -top-[29rem] h-[58rem] w-[94rem] opacity-80 blur-[95px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-300/10 via-cyan-300/[0.04] to-transparent" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-[12.25rem] h-px bg-gradient-to-r from-transparent via-cyan-300/55 to-transparent shadow-[0_0_30px_var(--accent-glow)]" />
        <div className="pointer-events-none absolute inset-0 grain-overlay opacity-25" />

        <div className="relative z-10 space-y-5 px-4 py-5 md:px-5 md:py-6">
          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr] xl:items-end">
            <LabPageHeader
              title="Projects"
              description="Operational cockpit for delivery, finance, and client work"
              icon={FolderKanban}
              action={canEdit ? (
                <Link href="/lab/projects/new" data-tour="new-project">
                  <LabButton>
                    <Plus className="mr-2 h-5 w-5" />
                    New Project
                  </LabButton>
                </Link>
              ) : undefined}
              className="w-full"
            />

            <div className="grid grid-cols-2 gap-px border border-white/15 bg-white/5">
              <div className="bg-black/55 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Total Registry</p>
                <p className="mt-1 text-xl text-foreground font-mono">{projects.length}</p>
              </div>
              <div className="bg-black/55 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Shown in View</p>
                <p className="mt-1 text-xl text-accent font-mono">{filteredProjects.length}</p>
              </div>
              <div className="bg-black/55 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">On Hold</p>
                <p className="mt-1 text-xl text-amber-300 font-mono">{statusCounts.on_hold}</p>
              </div>
              <div className="bg-black/55 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Completed</p>
                <p className="mt-1 text-xl text-emerald-300 font-mono">{statusCounts.completed}</p>
              </div>
            </div>
          </div>

          <p className="max-w-3xl text-xs uppercase tracking-[0.14em] text-white/48 font-mono">
            Every project is an active echo in delivery, finance, and client trust. Keep signal clear, remove noise, and move the right work first.
          </p>

          <section className="grid grid-cols-2 gap-px border border-white/15 bg-white/[0.07] lg:grid-cols-4" aria-label="Project summary metrics">
            <div className="bg-black/60 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Active Projects</p>
              <p className="mt-1 text-2xl text-foreground font-sans">{dashboardMetrics.active}</p>
            </div>
            <div className="bg-black/60 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Overdue</p>
              <p className="mt-1 text-2xl font-sans text-rose-300">{dashboardMetrics.overdue}</p>
            </div>
            <div className="bg-black/60 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Task Completion</p>
              <p className="mt-1 text-2xl text-foreground font-mono">{dashboardMetrics.taskCompletionLabel}</p>
            </div>
            <div className="bg-black/60 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Avg Progress</p>
              <p className="mt-1 text-2xl text-accent font-mono">{dashboardMetrics.avgProgress}%</p>
            </div>
          </section>

          <section className="space-y-4 border border-white/15 bg-black/40 p-4" aria-label="Project filters and view controls">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search projects by name or description"
                className="max-w-md"
                data-tour="project-search"
              />
              <div data-tour="view-toggle">
                <ViewToggle view={view} onChange={setViewMode} />
              </div>
            </div>

            <div data-tour="project-filters">
              <FilterTabs
                tabs={tabsWithCounts}
                activeTab={statusFilter}
                onChange={(id) => setStatusFilter(id as ProjectStatus | 'all')}
              />
            </div>
          </section>
        </div>
      </section>

      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={searchQuery || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try a different keyword or filter combination.'
              : 'Create your first project to start delivery and finance tracking in one place.'
          }
          action={
            canEdit && !searchQuery && statusFilter === 'all'
              ? {
                  label: 'Create Project',
                  onClick: () => {
                    window.location.href = '/lab/projects/new'
                  },
                }
              : undefined
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const status = statusConfig[project.status]
            const progress = calculateProgress(project)
            const totalTasks = project.tasks?.length || 0
            const completedTasks = project.tasks?.filter((task) => task.status === 'done').length || 0
            const deadlineMeta = getDaysLeftLabel(project.deadline)

            return (
              <Card
                key={project.id}
                className="group relative overflow-hidden border-white/10 bg-[linear-gradient(165deg,rgba(0,229,255,0.08),rgba(8,12,18,0)_34%),#060a0f] transition-all duration-200 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(0,229,255,0.12)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent opacity-70" />
                <div className="absolute left-0 top-0 h-full w-[2px]" style={{ backgroundColor: project.color }} />

                <LabCardContent className="space-y-4 p-4 sm:p-5 sm:pl-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="inline-flex items-center border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/65 font-mono">
                          {project.type || 'Project'}
                        </span>
                        <LabBadge variant={status.variant}>{status.label}</LabBadge>
                        <span className={`hidden border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono sm:inline-flex ${deadlineMeta.tone}`}>
                          {deadlineMeta.label}
                        </span>
                      </div>

                      <h3 className="truncate text-lg text-foreground font-sans tracking-tight">{project.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/58 font-sans">
                        {project.description || 'No project brief added yet.'}
                      </p>
                    </div>

                    {canEdit ? (
                      <div className="relative" data-project-menu>
                        <button
                          data-project-menu
                          className="border border-white/15 bg-white/5 p-1.5 text-white/55 transition-colors hover:border-white/30 hover:text-white"
                          onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}
                          aria-label={`Open actions for ${project.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {menuOpenId === project.id ? (
                          <div className="absolute right-0 top-full z-50 mt-1 w-40 border border-white/10 bg-[#080d14]">
                            <Link
                              href={`/lab/projects/${project.id}/edit`}
                              className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-xs uppercase tracking-[0.13em] text-white/75 font-mono hover:bg-white/5"
                              onClick={() => setMenuOpenId(null)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                            <button
                              onClick={() => {
                                setMenuOpenId(null)
                                setDeleteConfirmId(project.id)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.13em] text-rose-300 font-mono hover:bg-white/5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-3 gap-px border border-white/10 bg-white/5">
                    <div className="bg-black/50 px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Client</p>
                      <p className="mt-1 truncate text-xs text-white/80 font-sans">{project.client?.company_name || 'Unassigned'}</p>
                    </div>
                    <div className="bg-black/50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Tasks</p>
                      <p className="mt-1 text-sm text-foreground font-mono">{completedTasks}/{totalTasks}</p>
                    </div>
                    <div className="bg-black/50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Progress</p>
                      <p className="mt-1 text-sm text-accent font-mono">{progress}%</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Execution Progress</span>
                      <span className="text-xs text-foreground font-mono">{progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden bg-white/10">
                      <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/lab/projects/${project.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-1 border border-accent/25 bg-accent/10 px-2.5 py-2 text-[10px] uppercase tracking-[0.13em] text-accent font-mono hover:bg-accent/20"
                      >
                        Open Workspace
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                      {project.link ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center border border-white/15 bg-white/5 px-2.5 py-2 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-accent/35 hover:text-accent"
                          aria-label={`Open live link for ${project.name}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.13em] font-mono">
                      <Link
                        href={`/lab/projects/${project.id}/delivery`}
                        className="inline-flex items-center gap-1 text-white/55 transition-colors hover:text-accent"
                      >
                        <CheckSquare className="h-3 w-3" />
                        Delivery
                      </Link>
                      <Link
                        href={`/lab/projects/${project.id}/finance`}
                        className="inline-flex items-center gap-1 text-white/55 transition-colors hover:text-accent"
                      >
                        <DollarSign className="h-3 w-3" />
                        Finance
                      </Link>
                      <span className={`inline-flex items-center gap-1 sm:hidden ${deadlineMeta.tone}`}>
                        <Building2 className="h-3 w-3 text-accent/75" />
                        {deadlineMeta.label}
                      </span>
                    </div>
                  </div>
                </LabCardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProjects.map((project) => {
            const status = statusConfig[project.status]
            const progress = calculateProgress(project)
            const deadlineMeta = getDaysLeftLabel(project.deadline)

            return (
              <Card key={project.id} className="border-white/10 bg-[#05090f] transition-colors hover:border-accent/35">
                <LabCardContent className="p-4">
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_0.9fr_0.8fr_0.7fr_auto] xl:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-base text-foreground font-sans">{project.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/55 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-accent/80" />
                          {project.client?.company_name || 'Unassigned'}
                        </span>
                        <span className="text-white/30">•</span>
                        <span className={deadlineMeta.tone}>{deadlineMeta.label}</span>
                      </div>
                    </div>

                    <div>
                      <LabBadge variant={status.variant}>{status.label}</LabBadge>
                    </div>

                    <div className="text-sm text-white font-mono">
                      {project.tasks?.filter((task) => task.status === 'done').length || 0}/{project.tasks?.length || 0} tasks
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-white/40 font-mono">
                        <span>Progress</span>
                        <span className="text-accent">{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden bg-white/10">
                        <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/lab/projects/${project.id}`}
                        className="inline-flex items-center justify-center border border-white/15 bg-white/5 p-2 text-white/65 transition-colors hover:border-accent/35 hover:text-accent"
                        aria-label={`Open ${project.name}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      {canEdit ? (
                        <>
                          <Link
                            href={`/lab/projects/${project.id}/edit`}
                            className="inline-flex items-center justify-center border border-white/15 bg-white/5 p-2 text-white/65 transition-colors hover:border-white/30 hover:text-white"
                            aria-label={`Edit ${project.name}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(project.id)}
                            className="inline-flex items-center justify-center border border-rose-500/25 bg-rose-500/5 p-2 text-rose-300 transition-colors hover:border-rose-400/40 hover:text-rose-200"
                            aria-label={`Delete ${project.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </LabCardContent>
              </Card>
            )
          })}
        </div>
      )}

      {deleteConfirmId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65">
          <div className="w-full max-w-md border border-white/10 bg-[#080d14] p-6">
            <h3 className="text-lg text-foreground font-sans">Delete Project</h3>
            <p className="mt-2 text-sm text-white/60 font-sans">
              This will permanently remove the project and related context from the lab workspace.
            </p>
            {deleteError ? <p className="mt-3 text-sm text-rose-300 font-mono">{deleteError}</p> : null}

            <div className="mt-5 flex justify-end gap-2">
              <LabButton variant="ghost" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </LabButton>
              <LabButton variant="danger" onClick={() => handleDelete(deleteConfirmId)} disabled={deleting}>
                {deleting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting
                  </span>
                ) : (
                  'Delete'
                )}
              </LabButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
