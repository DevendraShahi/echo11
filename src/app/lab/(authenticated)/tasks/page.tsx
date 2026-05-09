'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/ui/PageHeader'
import { LabButton } from '@/components/ui/LabButton'
import { FolderKanban, CheckSquare, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KanbanBoard } from '@/components/lab/KanbanBoard'
import { TaskFormModal } from '@/components/lab/TaskForm'

interface Project {
  id: string
  name: string
  status: string
  color: string
  client?: { company_name: string } | null
}

const statusConfig: Record<string, { label: string; colorClass: string }> = {
  active: { label: 'Active', colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  on_hold: { label: 'On Hold', colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  completed: { label: 'Completed', colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  archived: { label: 'Archived', colorClass: 'bg-white/10 text-white/50 border-white/10' },
}

export default function TasksPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedProjectData, setSelectedProjectData] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [canCreateTasks, setCanCreateTasks] = useState(false)

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient()
      const { data: userResult } = await supabase.auth.getUser()
      const authUser = userResult.user
      if (!authUser) {
        setProjects([])
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, team_id')
        .eq('id', authUser.id)
        .single()

      const isAdmin = profile?.role === 'admin'
      let isLead = false
      if (profile?.team_id) {
        const { data: team } = await supabase
          .from('teams')
          .select('id')
          .eq('id', profile.team_id)
          .eq('lead_id', authUser.id)
          .single()
        isLead = Boolean(team)
      }

      setCanCreateTasks(Boolean(isAdmin || isLead))

      let query = supabase
        .from('projects')
        .select('id, name, status, color, client:clients(company_name)')
        .order('updated_at', { ascending: false })

      if (isAdmin) {
        // Admin sees all projects.
      } else if (isLead && profile?.team_id) {
        query = query.eq('team_id', profile.team_id)
      } else {
        const { data: assignedTasks } = await supabase
          .from('tasks')
          .select('project_id')
          .eq('assignee_id', authUser.id)
          .not('project_id', 'is', null)

        const assignedProjectIds = Array.from(
          new Set((assignedTasks || []).map((task) => task.project_id).filter(Boolean))
        ) as string[]

        if (assignedProjectIds.length === 0) {
          setProjects([])
          setLoading(false)
          return
        }

        query = query.in('id', assignedProjectIds)
        if (profile?.team_id) {
          query = query.eq('team_id', profile.team_id)
        }
      }

      const { data, error } = await query

      if (!error && data) {
        const projectsWithClient = data.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          status: p.status as string,
          color: p.color as string,
          client: p.client as Project['client'],
        }))
        setProjects(projectsWithClient)
      }
      setLoading(false)
    }

    loadProjects()
  }, [])

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true
    return p.status === filter
  })

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id)
    setSelectedProjectData(project)
  }

  const handleBack = () => {
    setSelectedProjectId('')
    setSelectedProjectData(null)
    setRefreshKey(k => k + 1)
  }

  const handleModalSuccess = () => {
    setRefreshKey(k => k + 1)
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (selectedProjectId && selectedProjectData) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-sans"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: `${selectedProjectData.color}20` }}
              >
                <span className="font-bold text-sm" style={{ color: selectedProjectData.color }}>
                  {selectedProjectData.name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-sans">{selectedProjectData.name}</h1>
                {selectedProjectData.client && (
                  <p className="text-xs text-white/40">{selectedProjectData.client.company_name}</p>
                )}
              </div>
            </div>
          </div>
          {canCreateTasks && (
            <LabButton onClick={() => setIsModalOpen(true)}>
              <CheckSquare className="w-4 h-4 mr-2" />
              Add Task
            </LabButton>
          )}
        </div>

        <div className="flex-1 min-h-0">
          <KanbanBoard 
            key={refreshKey}
            defaultProjectId={selectedProjectId} 
          />
        </div>

        <TaskFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          defaultProjectId={selectedProjectId}
        />
      </div>
    )
  }

  return (
    <>
      <PageHeader 
        title="Tasks" 
        description="Select a project to view and manage tasks"
        icon={CheckSquare}
        action={
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded text-white focus:border-accent focus:outline-none transition-all font-sans"
            >
              <option value="all" className="bg-black">All Projects</option>
              <option value="active" className="bg-black">Active</option>
              <option value="on_hold" className="bg-black">On Hold</option>
              <option value="completed" className="bg-black">Completed</option>
            </select>
          </div>
        }
      />

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <FolderKanban className="w-12 h-12 text-white/20" />
          <p className="text-white/50">No projects found</p>
          <p className="text-sm text-white/30">Create a project first to manage tasks</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const status = statusConfig[project.status] || statusConfig.archived
            return (
              <div
                key={project.id}
                className="bg-white/5 border border-white/10 p-5 hover:border-white/20 transition-all group cursor-pointer"
                onClick={() => handleSelectProject(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${project.color}20` }}
                    >
                      <span className="font-bold text-sm" style={{ color: project.color }}>
                        {project.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white font-sans">{project.name}</h3>
                      {project.client && (
                        <p className="text-xs text-white/40">{project.client.company_name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded border',
                    status.colorClass
                  )}>
                    {status.label}
                  </span>
                  
                  <LabButton variant="glass" size="sm" onClick={() => handleSelectProject(project)}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View Tasks
                  </LabButton>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
