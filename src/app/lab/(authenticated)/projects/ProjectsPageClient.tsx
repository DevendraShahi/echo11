'use client'

import { useState, useEffect } from 'react'
import { LabCard as Card, LabCardContent } from '@/components/ui/LabCard'
import { LabBadge } from '@/components/ui/LabBadge'
import { LabButton } from '@/components/ui/LabButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterTabs, FilterTab } from '@/components/ui/FilterTabs'
import { ViewToggle } from '@/components/ui/ViewToggle'
import { EmptyState } from '@/components/ui/EmptyState'
import { Project, Client, ProjectStatus, Milestone, TaskPriority } from '@/types/lab'
import { Plus, MoreHorizontal, ExternalLink, Calendar, Trash2, Edit, FolderKanban, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { deleteProject } from '@/lib/actions/project-actions'

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

export default function ProjectsPageClient({ initialProjects, canEdit = false }: ProjectsPageClientProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [projects, setProjects] = useState(initialProjects)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      // Close if click is outside any element with data-project-menu
      if (!(target as Element).closest?.('[data-project-menu]')) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const calculateProgress = (project: ProjectWithClient) => {
    const tasks = project.tasks
    if (tasks && tasks.length > 0) {
      const weightMap: Record<TaskPriority, number> = {
        low: 0.5,
        medium: 1,
        high: 2,
        urgent: 3
      }
      const totalWeight = tasks.reduce((sum, t) => sum + (weightMap[t.priority as TaskPriority] || 0), 0)
      const completedWeight = tasks
        .filter(t => t.status === 'done')
        .reduce((sum, t) => sum + (weightMap[t.priority as TaskPriority] || 0), 0)
      return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
    }

    return project.progress || 0
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteProject(id)
    if (result.success) {
      setProjects(projects.filter(p => p.id !== id))
      setDeleteConfirmId(null)
    } else {
      setDeleteError(result.error || 'Failed to delete project')
    }
    setDeleting(false)
  }

  const statusCounts = {
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    on_hold: projects.filter(p => p.status === 'on_hold').length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'archived').length,
  }

  const tabsWithCounts = statusTabs.map(tab => ({
    ...tab,
    count: statusCounts[tab.id as keyof typeof statusCounts]
  }))

  return (
    <div className="space-y-6 font-sans">
      <PageHeader 
        title="Projects" 
        description="Manage all your client projects"
        icon={FolderKanban}
        action={canEdit ? (
          <Link href="/lab/projects/new" data-tour="new-project">
            <LabButton>
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </LabButton>
          </Link>
        ) : undefined}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchInput 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search projects..."
          className="max-w-xs"
          data-tour="project-search"
        />
        <div data-tour="view-toggle">
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      <div data-tour="project-filters">
        <FilterTabs 
          tabs={tabsWithCounts} 
          activeTab={statusFilter} 
          onChange={(id) => setStatusFilter(id as ProjectStatus | 'all')} 
        />
      </div>

      {filteredProjects.length === 0 ? (
        <EmptyState 
          icon={FolderKanban}
          title={searchQuery || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
          description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Create your first project to get started'}
          action={canEdit && !searchQuery && statusFilter === 'all' ? {
            label: 'Create Project',
            onClick: () => window.location.href = '/lab/projects/new'
          } : undefined}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const status = statusConfig[project.status]
            
            return (
              <Card key={project.id} className="group hover:bg-white/[0.07] hover:border-accent/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.08)] relative">
                <div className="absolute top-0 left-0 w-1 h-full group-hover:w-1.5 transition-all duration-300" style={{ backgroundColor: project.color }} />
                <LabCardContent className="p-5 pl-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center border"
                      style={{ backgroundColor: `${project.color}20`, borderColor: `${project.color}30` }}
                    >
                      <span className="text-lg font-bold font-sans" style={{ color: project.color }}>
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {canEdit && (
                      <div className="relative" data-project-menu>
                        <button
                          data-project-menu
                          className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}
                        >
                          <MoreHorizontal className="w-5 h-5 text-white/30" />
                        </button>

                        {menuOpenId === project.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl z-50">
                            <Link
                              href={`/lab/projects/${project.id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded-t-lg"
                              onClick={() => setMenuOpenId(null)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => {
                                setMenuOpenId(null)
                                setDeleteConfirmId(project.id)
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-b-lg w-full"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground mb-1 font-sans tracking-tight">
                    {project.name}
                  </h3>
                  <p className="text-sm text-white/50 mb-4 line-clamp-2 font-sans">
                    {project.description || 'No description'}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <LabBadge variant={status.variant}>
                      {status.label}
                    </LabBadge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/50 mb-4 font-sans">
                    {project.client && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        {(project.client as { company_name: string }).company_name}
                      </span>
                    )}
                    {project.deadline && (
                      <span className="flex items-center gap-1 font-mono text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1 font-sans">
                      <span className="text-white/40">Progress</span>
                      <span className="font-medium text-foreground">{calculateProgress(project)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all"
                        style={{ width: `${calculateProgress(project)}%`, backgroundColor: project.color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Link
                      href={`/lab/projects/${project.id}`}
                      className="text-sm font-medium text-accent hover:underline font-sans"
                    >
                      View Details
                    </Link>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/30 hover:text-accent transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
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
            
            return (
              <Card key={project.id} className="group hover:bg-white/[0.07] transition-colors">
                <LabCardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center border"
                      style={{ backgroundColor: `${project.color}20`, borderColor: `${project.color}30` }}
                    >
                      <span className="text-lg font-bold font-sans" style={{ color: project.color }}>
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground font-sans tracking-tight">
                        {project.name}
                      </h3>
                      <p className="text-sm text-white/50 font-sans">
                        {project.client ? (project.client as { company_name: string }).company_name : 'No client'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <LabBadge variant={status.variant}>
                      {status.label}
                    </LabBadge>
                    {project.deadline && (
                      <span className="flex items-center gap-1 font-mono text-xs text-white/50">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs mb-1 font-sans">
                        <span className="text-white/40">{calculateProgress(project)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-lg overflow-hidden">
                        <div
                          className="h-full rounded-lg transition-all"
                          style={{ width: `${calculateProgress(project)}%`, backgroundColor: project.color }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/lab/projects/${project.id}`}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-white/50" />
                      </Link>
                      {canEdit && (
                        <>
                          <Link
                            href={`/lab/projects/${project.id}/edit`}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-white/50" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(project.id)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </LabCardContent>
              </Card>
            )
          })}
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2 font-sans">Delete Project</h3>
            <p className="text-white/50 mb-4 font-sans">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-rose-400 font-mono mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <LabButton variant="ghost" onClick={() => setDeleteConfirmId(null)} className="font-sans">
                Cancel
              </LabButton>
              <LabButton variant="danger" onClick={() => handleDelete(deleteConfirmId)} disabled={deleting} className="font-sans flex items-center gap-2">
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : 'Delete'}
              </LabButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
