import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckSquare, DollarSign, Calendar } from 'lucide-react'
import { format } from 'date-fns'

type ProjectDetail = {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  color: string
  deadline: string | null
  start_date: string | null
  budget: number | null
  link: string | null
}

type Milestone = {
  id: string
  name: string
  weight: number
  completed: boolean
  due_date: string | null
}

type Task = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
}

async function getProjectDetail(projectId: string, userId: string) {
  const supabase = await createClient()
  
  // Verify client owns this project
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!client) return null

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('client_id', client.id)
    .single()

  if (!project) return null

  const [milestones, tasks] = await Promise.all([
    supabase.from('milestones').select('*').eq('project_id', projectId).order('created_at'),
    supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  ])

  return {
    project: project as ProjectDetail,
    milestones: (milestones.data || []) as Milestone[],
    tasks: (tasks.data || []) as Task[]
  }
}

export default async function PortalProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: projectId } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/portal/auth/login')
  }

  const data = await getProjectDetail(projectId, user.id)

  if (!data) {
    notFound()
  }

  const { project, milestones, tasks } = data
  
  const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0)
  const completedWeight = milestones.filter(m => m.completed).reduce((sum, m) => sum + m.weight, 0)
  const completedTasks = tasks.filter(t => t.status === 'done')

  return (
    <div className="space-y-6">
      <Link href="/portal/projects" className="inline-flex">
        <span className="text-white/50 hover:text-white text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </span>
      </Link>

      {/* Project Header */}
      <div className="flex items-start gap-4">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center border"
          style={{ backgroundColor: `${project.color}20`, borderColor: `${project.color}30` }}
        >
          <span className="text-3xl font-bold" style={{ color: project.color }}>
            {project.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white font-sans">{project.name}</h1>
            <span className={`px-2 py-0.5 text-xs rounded ${
              project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
              project.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
              project.status === 'on_hold' ? 'bg-amber-500/10 text-amber-400' :
              'bg-white/10 text-white/50'
            }`}>
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="text-white/50 max-w-2xl">{project.description}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span className="text-white/50 text-xs">Milestones</span>
          </div>
          <p className="text-xl font-bold text-white font-sans">{completedWeight}% / {totalWeight}%</p>
        </div>
        
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-white/50 text-xs">Tasks</span>
          </div>
          <p className="text-xl font-bold text-white font-sans">{completedTasks.length}/{tasks.length}</p>
        </div>
        
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-white/50 text-xs">Start Date</span>
          </div>
          <p className="text-lg font-medium text-white font-mono">
            {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'Not set'}
          </p>
        </div>
        
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-white/50 text-xs">Deadline</span>
          </div>
          <p className="text-lg font-medium text-white font-mono">
            {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'Not set'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium">Overall Progress</span>
          <span className="text-white/70 font-mono">{project.progress}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all"
            style={{ width: `${project.progress}%`, backgroundColor: project.color }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Milestones</h2>
        
        {milestones.length === 0 ? (
          <p className="text-white/40 text-center py-4">No milestones yet</p>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div 
                key={milestone.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  milestone.completed 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                  milestone.completed 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'border-white/30'
                }`}>
                  {milestone.completed && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${
                    milestone.completed ? 'text-white/50 line-through' : 'text-white'
                  }`}>
                    {milestone.name}
                  </p>
                  {milestone.due_date && (
                    <p className="text-xs text-white/40">
                      Due {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  milestone.completed 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  {milestone.weight}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Tasks</h2>
        
        {tasks.length === 0 ? (
          <p className="text-white/40 text-center py-4">No tasks yet</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
              >
                <div className={`w-4 h-4 rounded border ${
                  task.status === 'done' 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : task.status === 'in_progress'
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-white/20'
                }`}>
                  {task.status === 'done' && (
                    <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${
                    task.status === 'done' ? 'text-white/40 line-through' : 'text-white'
                  }`}>
                    {task.title}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  task.priority === 'urgent' ? 'bg-red-500/10 text-red-400' :
                  task.priority === 'high' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-white/10 text-white/50'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
