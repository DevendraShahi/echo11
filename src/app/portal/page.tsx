import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FolderKanban, CheckSquare, DollarSign, Clock, ArrowRight } from 'lucide-react'
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
  client_id: string | null
}

type InvoiceWithProject = {
  id: string
  invoice_number: string
  status: string
  total: number
  due_date: string | null
}

async function getClientPortalData(userId: string) {
  const supabase = await createClient()
  
  // First get the client record for this user
  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, contact_name')
    .eq('auth_id', userId)
    .single()

  if (!client) {
    return { client: null, projects: [], invoices: [], tasks: [] }
  }

  // Get projects for this client
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  const projectIds = projects?.map(p => p.id) || []

  // Get tasks from these projects
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .in('project_id', projectIds.length > 0 ? projectIds : ['empty'])
    .order('created_at', { ascending: false })
    .limit(10)

  // Get invoices for this client
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    client,
    projects: (projects || []) as ProjectWithClient[],
    tasks: tasks || [],
    invoices: (invoices || []) as InvoiceWithProject[]
  }
}

export default async function PortalDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/portal/auth/login')
  }

  const { client, projects, tasks, invoices } = await getClientPortalData(user.id)

  if (!client) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-white mb-4">Welcome to echo11 Portal</h1>
        <p className="text-white/50 mb-8">Your account is not linked to any client yet.</p>
        <p className="text-white/40 text-sm">Please contact echo11 to get access to your projects.</p>
      </div>
    )
  }

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedTasks = tasks.filter(t => t.status === 'done')
  const pendingInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-sans">
            Welcome back{client.contact_name ? `, ${client.contact_name}` : ''}!
          </h1>
          <p className="text-white/50 mt-1">Here is what is happening with your projects.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide">Active Projects</p>
              <p className="text-2xl font-bold text-white font-sans">{activeProjects.length}</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide">Tasks Done</p>
              <p className="text-2xl font-bold text-white font-sans">{completedTasks.length}/{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide">Total Invoiced</p>
              <p className="text-2xl font-bold text-white font-mono">${totalInvoiced.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wide">Pending Invoices</p>
              <p className="text-2xl font-bold text-white font-sans">{pendingInvoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white font-sans">Your Projects</h2>
          <Link href="/portal/projects" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 bg-white/5 border border-white/10 rounded-xl text-center">
            <p className="text-white/40">No projects yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <Link 
                key={project.id} 
                href={`/portal/projects/${project.id}`}
                className="p-5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${project.color}20` }}
                  >
                    <span className="font-bold" style={{ color: project.color }}>
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
                
                <h3 className="text-white font-medium mb-1 group-hover:text-indigo-300 transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-white/40 text-sm line-clamp-2 mb-3">{project.description}</p>
                )}
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-white/50">Progress</span>
                    <span className="text-white/70 font-mono">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>

                {project.deadline && (
                  <p className="text-white/30 text-xs mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due {format(new Date(project.deadline), 'MMM d, yyyy')}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {tasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white font-sans mb-4">Recent Tasks</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {tasks.slice(0, 5).map((task) => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-4 border-b border-white/5 last:border-0"
              >
                <div className={`w-4 h-4 rounded border ${
                  task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm ${
                    task.status === 'done' ? 'text-white/40 line-through' : 'text-white'
                  }`}>
                    {task.title}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  task.priority === 'urgent' ? 'bg-red-500/10 text-red-400' :
                  task.priority === 'high' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-white/10 text-white/50'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
