'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Task, TaskStatus } from '@/types/lab'
import { Plus, Calendar, Filter, X, ExternalLink, Clock, AlertCircle, CheckSquare, Search } from 'lucide-react'
import { TaskFormModal } from './TaskForm'
import { updateTaskStatus } from '@/lib/actions/task-actions'
import { Project, Profile } from '@/types/lab'
import NextImage from 'next/image'
import Link from 'next/link'
import { LabButton } from '@/components/ui/LabButton'
import { PageHeader } from '@/components/ui/PageHeader'

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'review', title: 'Review', color: 'bg-accent' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500' },
]

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-amber-500/20 text-amber-400',
  urgent: 'bg-rose-500/20 text-rose-400',
}

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

function TaskCard({ task, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group bg-white/5 border border-white/10 p-4 cursor-grab active:cursor-grabbing',
        'hover:bg-white/10 hover:border-white/20 transition-colors',
        isDragging && 'opacity-50'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-white/90 line-clamp-2">
          {task.title}
        </h4>
        <Link 
          href={`/lab/tasks/${task.id}`}
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-white/10 rounded flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4 text-white/40" />
        </Link>
      </div>

      {task.description && (
        <p className="text-xs text-white/50 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className={cn(
          'text-xs px-2 py-0.5 rounded font-medium',
          priorityColors[task.priority]
        )}>
          {task.priority}
        </span>
        
        <div className="flex items-center gap-2">
          {task.due_date && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              new Date(task.due_date) < new Date() ? 'text-rose-400' : 'text-white/40'
            )}>
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {task.project && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <Link 
            href={`/lab/projects/${task.project.id}`}
            className="text-xs text-accent/80 hover:text-accent transition-colors"
          >
            {task.project.name}
          </Link>
        </div>
      )}

      {task.assignee && (
        <div className="mt-2 flex items-center gap-2">
          {task.assignee.avatar_url ? (
            <NextImage
              src={task.assignee.avatar_url}
              alt={`${task.assignee.full_name || 'Assignee'} avatar`}
              width={20}
              height={20}
              unoptimized
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-xs text-accent">
              {(task.assignee.full_name || 'U')[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs text-white/50">{task.assignee.full_name}</span>
        </div>
      )}
    </div>
  )
}

interface ColumnProps {
  id: TaskStatus
  title: string
  color: string
  tasks: Task[]
  onAddTask: () => void
}

function Column({ id, title, color, tasks, onAddTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  
  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-white/5 border border-white/10">
      <div className={cn(
        'p-4 border-b border-white/10',
        isOver && 'bg-accent/5'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', color)} />
            <h3 className="font-semibold text-white font-sans">{title}</h3>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={onAddTask}
            className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 overflow-y-auto min-h-[200px]',
          isOver && 'bg-accent/5'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2" data-tour="task-card">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-white/40">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No tasks</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  defaultProjectId?: string
}

interface BoardUserContext {
  userId: string
  role: string
  teamId: string | null
  isAdmin: boolean
  isLead: boolean
}

export function KanbanBoard({ defaultProjectId }: KanbanBoardProps = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo')
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || '')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    assignee_id: '',
    priority: '',
    search: '',
  })
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([])
  const [members, setMembers] = useState<Pick<Profile, 'id' | 'full_name'>[]>([])
  const [canCompleteTasks, setCanCompleteTasks] = useState(false)
  const [canCreateTasks, setCanCreateTasks] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isMemberOnly, setIsMemberOnly] = useState(false)
  const isExternalProject = Boolean(defaultProjectId)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function loadFiltersData(context: BoardUserContext) {
    const supabase = createClient()
    
    if (defaultProjectId) {
      setSelectedProjectId(defaultProjectId)
      let membersQuery = supabase
        .from('profiles')
        .select('id, full_name')
        .neq('role', 'client')
        .order('full_name', { ascending: true })

      if (!context.isAdmin && context.teamId) {
        membersQuery = membersQuery.eq('team_id', context.teamId)
      }

      const { data: membersData } = await membersQuery
      const membersRes = { data: membersData }
      setMembers(membersRes.data || [])
      return
    }

    let projectsQuery = supabase
      .from('projects')
      .select('id, name')
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (context.isAdmin) {
      // Admin sees all projects.
    } else if (context.isLead && context.teamId) {
      projectsQuery = projectsQuery.eq('team_id', context.teamId)
    } else {
      const { data: assignedTasks } = await supabase
        .from('tasks')
        .select('project_id')
        .eq('assignee_id', context.userId)
        .not('project_id', 'is', null)

      const assignedProjectIds = Array.from(
        new Set((assignedTasks || []).map((task) => task.project_id).filter(Boolean))
      ) as string[]

      if (assignedProjectIds.length === 0) {
        setProjects([])
        setMembers([])
        return
      }

      projectsQuery = projectsQuery.in('id', assignedProjectIds)
      if (context.teamId) {
        projectsQuery = projectsQuery.eq('team_id', context.teamId)
      }
    }

    let membersQuery = supabase
      .from('profiles')
      .select('id, full_name')
      .neq('role', 'client')
      .order('full_name', { ascending: true })

    if (!context.isAdmin && context.teamId) {
      membersQuery = membersQuery.eq('team_id', context.teamId)
    }

    const [projectsRes, membersRes] = await Promise.all([
      projectsQuery,
      membersQuery
    ])
    
    const fetchedProjects = projectsRes.data || []
    setProjects(fetchedProjects)
    setMembers(membersRes.data || [])
    
    if (fetchedProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(fetchedProjects[0].id)
    }
  }

  async function loadUserContext(): Promise<BoardUserContext | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, team_id')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    const isAdmin = profile?.role === 'admin'
    let isLead = false

    if (profile?.team_id) {
      const { data: team } = await supabase
        .from('teams')
        .select('lead_id')
        .eq('id', profile.team_id)
        .single()
      isLead = team?.lead_id === user.id
    }

    setCurrentUserId(user.id)
    setCanCompleteTasks(Boolean(isAdmin || isLead || profile.role === 'member'))
    setCanCreateTasks(Boolean(isAdmin || isLead))
    setIsMemberOnly(Boolean(!isAdmin && !isLead && profile.role === 'member'))

    return {
      userId: user.id,
      role: profile.role,
      teamId: profile.team_id,
      isAdmin,
      isLead
    }
  }

  async function fetchTasks() {
    try {
      const supabase = createClient()

      if (!selectedProjectId) {
        setTasks([])
        setLoading(false)
        return
      }

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('project_id', selectedProjectId)
        .order('sort_order', { ascending: true })

      if (isMemberOnly && currentUserId) {
        query = query.eq('assignee_id', currentUserId)
      }

      if (filters.assignee_id) {
        query = query.eq('assignee_id', filters.assignee_id)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }

      const { data: basicTasks, error: basicError } = await query

      if (basicError) {
        console.error('Error fetching basic tasks:', basicError)
        setError(basicError.message)
        setLoading(false)
        return
      }

      if (!basicTasks || basicTasks.length === 0) {
        setTasks([])
        setLoading(false)
        return
      }

      const projectIds = [...new Set(basicTasks.map(t => t.project_id).filter(Boolean))]
      const assigneeIds = [...new Set(basicTasks.map(t => t.assignee_id).filter(Boolean))]

      const projectMap: Record<string, { id: string; name: string }> = {}
      if (projectIds.length > 0) {
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, name')
          .in('id', projectIds)
        
        if (projectsData) {
          projectsData.forEach(p => { projectMap[p.id] = p })
        }
      }

      const assigneeMap: Record<string, { id: string; full_name: string | null; avatar_url: string | null }> = {}
      if (assigneeIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', assigneeIds)
        
        if (profilesData) {
          profilesData.forEach(p => { assigneeMap[p.id] = p })
        }
      }

      const enrichedTasks = basicTasks.map(task => ({
        ...task,
        project: task.project_id ? projectMap[task.project_id] : null,
        assignee: task.assignee_id ? assigneeMap[task.assignee_id] : null
      })) as Task[]

      let filteredTasks = enrichedTasks
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredTasks = enrichedTasks.filter(t => 
          t.title?.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
        )
      }

      setTasks(filteredTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
    setLoading(false)
  }

  useEffect(function() {
    async function bootstrapBoard() {
      const context = await loadUserContext()
      if (!context) {
        setProjects([])
        setMembers([])
        setLoading(false)
        return
      }
      await loadFiltersData(context)
    }

    bootstrapBoard() // eslint-disable-line react-hooks/exhaustive-deps
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(function() {
    fetchTasks() // eslint-disable-line react-hooks/exhaustive-deps
  }, [filters, selectedProjectId, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function refreshTasks() {
    setRefreshKey(k => k + 1)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const overColumn = columns.find(c => c.id === over.id)
    const overTask = tasks.find(t => t.id === over.id)

    let newStatus: TaskStatus = activeTask.status
    if (overColumn) {
      newStatus = overColumn.id
    } else if (overTask) {
      newStatus = overTask.status
    }

    if (newStatus === 'done' && !canCompleteTasks) {
      alert('Only a team lead or admin can move tasks to Done.')
      return
    }

    if (newStatus !== activeTask.status) {
      const previousTasks = tasks

      setTasks(tasks.map(t => 
        t.id === active.id ? { ...t, status: newStatus } : t
      ))

      const result = await updateTaskStatus(active.id as string, newStatus)
      if (!result.success) {
        alert(result.error || 'Failed to update task status')
        setTasks(previousTasks)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">Failed to load tasks</p>
        </div>
        <p className="text-sm text-white/50">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); setRefreshKey(k => k + 1); }}
          className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-none transition-colors font-sans"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="Tasks" 
        description="Manage tasks across all projects"
        icon={CheckSquare}
        action={
          <div className="flex items-center gap-3">
            {!isExternalProject && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded text-white focus:border-accent focus:outline-none transition-all font-sans min-w-[200px]"
              >
                <option value="" className="bg-black" disabled>Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-black">{p.name}</option>
                ))}
              </select>
            )}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 font-medium transition-all font-sans cursor-pointer",
                showFilters 
                  ? "bg-accent text-white" 
                  : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
              )}
              data-tour="task-filters"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filters.assignee_id || filters.priority || filters.search) && (
                <span className="w-2 h-2 bg-white rounded-full" />
              )}
            </button>
            <LabButton disabled={!selectedProjectId || !canCreateTasks} onClick={() => setIsModalOpen(true)} data-tour="new-task">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </LabButton>
          </div>
        }
      />

      {showFilters && (
        <div className="mb-6 p-4 bg-white/5 border border-white/10">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white/70 placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
            
            <select
              value={filters.assignee_id}
              onChange={(e) => setFilters({ ...filters, assignee_id: e.target.value })}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
            >
              <option value="" className="bg-black">All Assignees</option>
              {members.map(m => (
                <option key={m.id} value={m.id} className="bg-black">{m.full_name}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
            >
              <option value="" className="bg-black">All Priorities</option>
              <option value="low" className="bg-black">Low</option>
              <option value="medium" className="bg-black">Medium</option>
              <option value="high" className="bg-black">High</option>
              <option value="urgent" className="bg-black">Urgent</option>
            </select>

            {(filters.assignee_id || filters.priority || filters.search) && (
              <button
                onClick={() => setFilters({ assignee_id: '', priority: '', search: '' })}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/50 hover:text-white transition-colors font-sans"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {!selectedProjectId ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-white/5 border border-white/10 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-none flex items-center justify-center">
              <CheckSquare className="w-8 h-8 text-accent" />
            </div>
            <p className="text-white/70 mb-4 font-sans">Select a project to manage its tasks</p>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-white/5 border border-white/10 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-none flex items-center justify-center">
              <Plus className="w-8 h-8 text-accent" />
            </div>
            <p className="text-white/70 mb-4 font-sans">No tasks found</p>
            <LabButton onClick={() => setIsModalOpen(true)}>
              Create Task
            </LabButton>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4" data-tour="kanban-columns">
            {columns.map((column) => (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={tasks.filter(t => t.status === column.id)}
                onAddTask={() => {
                  setDefaultStatus(column.id)
                  setIsModalOpen(true)
                }}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (() => {
              const activeTask = tasks.find(t => t.id === activeId)
              return activeTask ? (
                <div className="w-72">
                  <TaskCard task={activeTask} isDragging />
                </div>
              ) : null
            })() : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refreshTasks}
        defaultStatus={defaultStatus}
        defaultProjectId={selectedProjectId}
      />
    </div>
  )
}
