import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, ArrowRight, FolderKanban } from 'lucide-react'
import { format } from 'date-fns'

type ProjectWithClient = {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  color: string
  deadline: string | null
  start_date: string | null
}

async function getClientProjects(userId: string) {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!client) return []

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return (projects || []) as ProjectWithClient[]
}

export default async function PortalProjectsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/portal/auth/login')
  }

  const projects = await getClientProjects(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-sans">Your Projects</h1>
          <p className="text-white/50 mt-1">View and track all your projects</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 bg-white/5 border border-white/10 rounded-xl text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
          <p className="text-white/40">Your projects will appear here once echo11 starts working on them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/portal/projects/${project.id}`}
              className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${project.color}20` }}
                >
                  <span className="font-bold text-lg" style={{ color: project.color }}>
                    {project.name.charAt(0)}
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                  project.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                  project.status === 'on_hold' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-white/10 text-white/50'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {project.name}
              </h3>
              
              {project.description && (
                <p className="text-white/50 text-sm line-clamp-2 mb-4">{project.description}</p>
              )}
              
              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-white/50">Progress</span>
                  <span className="text-white font-mono">{project.progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                {project.start_date && (
                  <p className="text-white/30 text-xs flex items-center gap-1">
                    Started {format(new Date(project.start_date), 'MMM d')}
                  </p>
                )}
                {project.deadline && (
                  <p className="text-white/30 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due {format(new Date(project.deadline), 'MMM d, yyyy')}
                  </p>
                )}
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-indigo-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
