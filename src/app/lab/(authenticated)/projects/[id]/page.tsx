import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LabCard as Card, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { LabBadge } from '@/components/ui/LabBadge'
import { LabButton } from '@/components/ui/LabButton'
import { Project, Client, Task, Meeting, Invoice, ProjectStatus, Milestone, ProjectExpense, Service } from '@/types/lab'
import { 
  ArrowLeft, 
  DollarSign, 
  CheckSquare, 
  Clock,
  Edit,
  ExternalLink,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ProjectDetailClient } from './ProjectDetailClient'
import { ToggleTaskButton } from './ToggleTaskButton'
import { ProjectActions } from '@/components/lab/ProjectActions'

type ProjectWithRelations = Project & {
  client?: Client | null
}

type TaskWithProject = Task & {
  project?: Project
}

type MeetingWithProject = Meeting & {
  project?: Project
}

type InvoiceWithProject = Invoice & {
  project?: Project
  client?: Client | null
}

async function getProject(id: string): Promise<ProjectWithRelations | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*),
      tasks:tasks(status, priority)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching project:', error)
    return null
  }

  return data as ProjectWithRelations
}

async function getProjectTeamMembers(projectId: string) {
  const supabase = await createClient()
  
  // Get tasks assigned to this project and get unique assignees
  const { data: tasks } = await supabase
    .from('tasks')
    .select('assignee_id')
    .eq('project_id', projectId)
    .not('assignee_id', 'is', null)

  if (!tasks || tasks.length === 0) return []

  const assigneeIds = [...new Set(tasks.map(t => t.assignee_id).filter(Boolean))]
  
  if (assigneeIds.length === 0) return []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .in('id', assigneeIds)

  return profiles || []
}

async function getProjectTasks(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return (data || []) as TaskWithProject[]
}

async function getProjectMeetings(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('meetings')
    .select('*')
    .eq('project_id', projectId)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(3)
  
  return (data || []) as MeetingWithProject[]
}

async function getProjectInvoices(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return (data || []) as InvoiceWithProject[]
}

async function getProjectActivity(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activities')
    .select('*, user:profiles(full_name, avatar_url)')
    .eq('entity_id', projectId)
    .order('created_at', { ascending: false })
    .limit(10)
  
  return data || []
}

async function getProjectMilestones(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  
  return (data || []) as Milestone[]
}

async function getProjectExpenses(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('project_expenses')
    .select('*, service:services(*)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  
  return (data || []) as ProjectExpense[]
}

async function getServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })
  
  return (data || []) as Service[]
}

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'ghost' | 'accent' }> = {
  active: { label: 'Active', variant: 'accent' },
  on_hold: { label: 'On Hold', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  archived: { label: 'Archived', variant: 'ghost' },
}

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const project = await getProject(id)
  
  if (!project) {
    notFound()
  }

  const [tasks, meetings, invoices, activities, milestones, expenses, services, teamMembers] = await Promise.all([
    getProjectTasks(id),
    getProjectMeetings(id),
    getProjectInvoices(id),
    getProjectActivity(id),
    getProjectMilestones(id),
    getProjectExpenses(id),
    getServices(),
    getProjectTeamMembers(id)
  ])

  const status = statusConfig[project.status]
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const paidInvoices = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0)

  // Calculate weighted progress from tasks
  const weightMap: Record<string, number> = {
    low: 0.5,
    medium: 1,
    high: 2,
    urgent: 3,
  }
  const totalWeight = tasks.reduce((sum, t) => sum + (weightMap[t.priority] || 0), 0)
  const completedWeight = tasks
    .filter(t => t.status === 'done')
    .reduce((sum, t) => sum + (weightMap[t.priority] || 0), 0)
  const weightedProgress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0

  // Calculate budget from expenses
  const calculatedBudget = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const displayBudget = calculatedBudget > 0 ? calculatedBudget : (project.budget || 0)

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-4">
        <Link href="/lab/projects">
          <LabButton variant="ghost" size="sm" className="font-sans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </LabButton>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-none flex items-center justify-center border"
            style={{ backgroundColor: `${project.color}20`, borderColor: `${project.color}30` }}
          >
            <span className="text-2xl font-bold font-sans" style={{ color: project.color }}>
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">
              {project.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <LabBadge variant={status.variant}>
                {status.label}
              </LabBadge>
              {project.client && (
                <span className="text-sm text-white/50 font-sans">
                  {(project.client as Client).company_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/lab/projects/${id}/edit`}>
            <LabButton variant="glass" size="sm" className="font-sans">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </LabButton>
          </Link>
          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              <LabButton variant="ghost" size="sm" className="font-sans">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit
              </LabButton>
            </a>
          )}
          <ProjectActions
            projectId={id}
            projectStatus={project.status}
            onDelete={async () => {
              'use server'
              const { deleteProject } = await import('@/lib/actions/project-actions')
              await deleteProject(id)
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <LabCardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-none bg-accent/10 border border-accent/20">
                <CheckSquare className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-sans">Progress</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-foreground font-sans">{weightedProgress}%</p>
                </div>
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-white/10 rounded-none overflow-hidden">
              <div className="h-full rounded-none transition-all" style={{ width: `${weightedProgress}%`, backgroundColor: project.color }} />
            </div>
          </LabCardContent>
        </Card>

        <Card>
          <LabCardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-none bg-emerald-500/10 border border-emerald-500/20">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-sans">Tasks</p>
                <p className="text-xl font-bold text-foreground font-sans">{completedTasks}/{tasks.length}</p>
              </div>
            </div>
          </LabCardContent>
        </Card>

        <Card>
          <LabCardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-none bg-amber-500/10 border border-amber-500/20">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-sans">Budget</p>
                <p className="text-xl font-bold text-foreground font-mono">${displayBudget.toLocaleString()}</p>
              </div>
            </div>
          </LabCardContent>
        </Card>

        <Card>
          <LabCardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-none bg-blue-500/10 border border-blue-500/20">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-sans">Collected</p>
                <p className="text-xl font-bold text-foreground font-mono">${paidInvoices.toLocaleString()}</p>
              </div>
            </div>
          </LabCardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <LabCardHeader>
              <LabCardTitle className="font-sans">Overview</LabCardTitle>
            </LabCardHeader>
            <LabCardContent>
              <p className="text-white/70 font-sans leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs text-white/40 font-sans mb-1">Type</p>
                  <p className="text-sm text-foreground font-sans capitalize">
                    {project.type || 'Website'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-sans mb-1">Start Date</p>
                  <p className="text-sm text-foreground font-mono">
                    {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-sans mb-1">Deadline</p>
                  <p className="text-sm text-foreground font-mono">
                    {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-sans mb-1">Budget</p>
                  <p className="text-sm text-foreground font-mono">
                    {displayBudget > 0 ? `$${displayBudget.toLocaleString()}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 font-sans mb-1">Created</p>
                  <p className="text-sm text-foreground font-mono">
                    {format(new Date(project.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Team Members Section */}
              {teamMembers.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-white/40 font-sans mb-3">Team Members</p>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map(member => (
                      <div 
                        key={member.id} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-none"
                      >
                        {member.avatar_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img 
                            src={member.avatar_url} 
                            alt={member.full_name || ''}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-accent/20 flex items-center justify-center">
                            <Users className="w-3 h-3 text-accent" />
                          </div>
                        )}
                        <span className="text-sm text-white/70 font-sans">
                          {member.full_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-white/40 font-mono">
                          ({member.role})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {teamMembers.length === 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-white/40 font-sans mb-3">Team Members</p>
                  <p className="text-sm text-white/30 font-sans">No team members assigned yet</p>
                </div>
              )}
            </LabCardContent>
          </Card>

          <Card>
            <LabCardHeader className="flex flex-row items-center justify-between">
              <LabCardTitle className="font-sans">Tasks</LabCardTitle>
              <Link href={`/lab/tasks?project=${id}`}>
                <LabButton variant="ghost" size="sm" className="font-sans">View All</LabButton>
              </Link>
            </LabCardHeader>
            <LabCardContent>
              {tasks.length === 0 ? (
                <p className="text-white/40 text-center py-4 font-sans">No tasks yet</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-none bg-white/5 hover:bg-white/10 transition-colors">
                      <ToggleTaskButton taskId={task.id} completed={task.status === 'done'} />
                      <div className="flex-1">
                        <p className={`text-sm font-sans ${task.status === 'done' ? 'text-white/40 line-through' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                      </div>
                      <LabBadge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'ghost'} className="font-sans">
                        {task.priority}
                      </LabBadge>
                    </div>
                  ))}
                </div>
              )}
            </LabCardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <LabCardHeader className="flex flex-row items-center justify-between">
              <LabCardTitle className="font-sans">Upcoming Meetings</LabCardTitle>
              <Link href="/lab/meetings">
                <LabButton variant="ghost" size="sm" className="font-sans">View All</LabButton>
              </Link>
            </LabCardHeader>
            <LabCardContent>
              {meetings.length === 0 ? (
                <p className="text-white/40 text-center py-4 font-sans">No upcoming meetings</p>
              ) : (
                <div className="space-y-3">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="p-3 rounded-none bg-white/5">
                      <p className="text-sm font-medium text-foreground font-sans">{meeting.title}</p>
                      <p className="text-xs text-white/40 font-mono mt-1">
                        {format(new Date(meeting.scheduled_at), 'MMM d, h:mm a')} • {meeting.duration_minutes}min
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </LabCardContent>
          </Card>

          <ProjectDetailClient
            projectId={id}
            milestones={milestones}
            expenses={expenses}
            services={services}
          />

          <Card>
            <LabCardHeader className="flex flex-row items-center justify-between">
              <LabCardTitle className="font-sans">Invoices</LabCardTitle>
              <Link href="/lab/invoices">
                <LabButton variant="ghost" size="sm" className="font-sans">View All</LabButton>
              </Link>
            </LabCardHeader>
            <LabCardContent>
              {invoices.length === 0 ? (
                <p className="text-white/40 text-center py-4 font-sans">No invoices</p>
              ) : (
                <div className="space-y-3">
                  {invoices.slice(0, 3).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 rounded-none bg-white/5">
                      <div>
                        <p className="text-sm font-medium text-foreground font-mono">{invoice.invoice_number}</p>
                        <p className="text-xs text-white/40 font-sans">${invoice.total.toLocaleString()}</p>
                      </div>
                      <LabBadge 
                        variant={invoice.status === 'paid' ? 'success' : invoice.status === 'sent' ? 'warning' : 'ghost'}
                        className="font-sans"
                      >
                        {invoice.status}
                      </LabBadge>
                    </div>
                  ))}
                </div>
              )}
            </LabCardContent>
          </Card>

          <Card>
            <LabCardHeader>
              <LabCardTitle className="font-sans">Recent Activity</LabCardTitle>
            </LabCardHeader>
            <LabCardContent>
              {activities.length === 0 ? (
                <p className="text-white/40 text-center py-4 font-sans">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-none bg-white/10 flex items-center justify-center">
                        <Clock className="w-3 h-3 text-white/50" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground font-sans">
                          <span className="font-medium">{(activity.user as { full_name?: string })?.full_name || 'Someone'}</span>
                          {' '}{activity.action}
                        </p>
                        <p className="text-xs text-white/30 font-mono">
                          {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </LabCardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
