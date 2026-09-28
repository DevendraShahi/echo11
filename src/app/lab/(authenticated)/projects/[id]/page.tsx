import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  Building2,
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  Users,
} from 'lucide-react'
import { LabCard as Card, LabCardContent, LabCardHeader, LabCardTitle } from '@/components/ui/LabCard'
import { LabBadge } from '@/components/ui/LabBadge'
import { LabButton } from '@/components/ui/LabButton'
import { ProjectStatus } from '@/types/lab'
import { ProjectActions } from '@/components/lab/ProjectActions'
import { ProjectDetailClient } from './ProjectDetailClient'
import { ToggleTaskButton } from './ToggleTaskButton'
import {
  getProjectAccess,
  getProjectActivities,
  getProjectExpenses,
  getProjectInvoices,
  getProjectMeetings,
  getProjectMilestones,
  getProjectTasks,
  getProjectTeamMembers,
  getProjectWorkspace,
  getServices,
} from '@/features/lab/workspace/data'
import { calculateWeightedTaskProgress } from '@/features/lab/projects/progress'

const statusConfig: Record<ProjectStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'ghost' | 'accent' }> = {
  active: { label: 'Active', variant: 'accent' },
  on_hold: { label: 'On Hold', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  archived: { label: 'Archived', variant: 'ghost' },
}

function formatDateLabel(value: string | null | undefined): string {
  if (!value) return 'Not set'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Not set'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed)
}

function formatDateTimeLabel(value: string | null | undefined): string {
  if (!value) return 'Not set'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Not set'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parsed)
}

function getDeadlineLabel(deadline: string | null | undefined) {
  if (!deadline) return { label: 'No deadline set', tone: 'text-white/55' }

  const now = Date.now()
  const end = new Date(deadline).getTime()
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))

  if (diff < 0) return { label: `${Math.abs(diff)} days overdue`, tone: 'text-rose-300' }
  if (diff === 0) return { label: 'Due today', tone: 'text-amber-300' }
  if (diff <= 3) return { label: `${diff} days left`, tone: 'text-amber-300' }
  return { label: `${diff} days left`, tone: 'text-emerald-300' }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectWorkspace(id)

  if (!project) {
    notFound()
  }

  const access = await getProjectAccess(id, project.team_id)
  if (!access.canAccess) {
    notFound()
  }

  const [tasks, meetings, invoices, activities, milestones, expenses, services, teamMembers] = await Promise.all([
    getProjectTasks(id),
    getProjectMeetings(id),
    getProjectInvoices(id),
    getProjectActivities(id),
    getProjectMilestones(id),
    getProjectExpenses(id),
    getServices(),
    getProjectTeamMembers(id),
  ])

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 6)
  const upcomingMeetings = meetings
    .filter((meeting) => new Date(meeting.scheduled_at).getTime() >= Date.now())
    .slice(0, 4)
  const recentInvoices = invoices.slice(0, 4)
  const recentActivities = activities.slice(0, 6)
  const canToggleTask = (assigneeId: string | null | undefined) =>
    access.canManage || (Boolean(access.userId) && assigneeId === access.userId)

  const status = statusConfig[project.status]
  const weightedProgress = calculateWeightedTaskProgress(tasks, project.progress || 0)
  const completedTasks = tasks.filter((task) => task.status === 'done').length

  const paidInvoices = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0)

  const calculatedBudget = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const displayBudget = calculatedBudget > 0 ? calculatedBudget : (project.budget || 0)
  const deadlineMeta = getDeadlineLabel(project.deadline)

  return (
    <div className="space-y-5 font-sans">
      <section className="relative overflow-hidden border border-white/10 bg-[#03070d]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px] opacity-25" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[135%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.32)_0%,rgba(0,229,255,0.12)_36%,rgba(0,0,0,0)_74%)] blur-2xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(1,4,8,0.78)_72%,rgba(1,4,8,0.95)_100%)]" />

        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <Link href="/lab/projects">
            <LabButton variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </LabButton>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {access.canManage ? (
              <Link href={`/lab/projects/${id}/edit`}>
                <LabButton variant="glass" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </LabButton>
              </Link>
            ) : null}
            {project.link ? (
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <LabButton variant="ghost" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit
                </LabButton>
              </a>
            ) : null}
            {access.canManage ? (
              <ProjectActions
                projectId={id}
                projectStatus={project.status}
                onDelete={async () => {
                  'use server'
                  const { deleteProject } = await import('@/lib/actions/project-actions')
                  await deleteProject(id)
                }}
              />
            ) : null}
          </div>
        </div>

        <div className="relative grid gap-5 px-4 py-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center border border-accent/35 bg-accent/10"
              >
                <span className="text-2xl font-bold text-accent">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-[1.8rem] text-foreground font-sans tracking-tight sm:text-[2rem]">{project.name}</h1>
                <p className="mt-1 max-w-2xl text-sm text-white/70 leading-relaxed">
                  {project.description || 'No project brief has been added yet.'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <LabBadge variant={status.variant}>{status.label}</LabBadge>
              <span className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono">
                <Building2 className="h-3 w-3 text-accent/85" />
                {project.client?.company_name || 'No client linked'}
              </span>
              <span className={`inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono ${deadlineMeta.tone}`}>
                <Calendar className="h-3 w-3" />
                {deadlineMeta.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px border border-accent/20 bg-white/5">
            <Link
              href={`/lab/projects/${id}/delivery`}
              className="inline-flex items-center justify-center gap-1.5 bg-black/70 px-3 py-2 text-[11px] uppercase tracking-[0.13em] text-white/75 font-mono transition-colors hover:bg-accent/10 hover:text-accent"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Delivery
            </Link>
            <Link
              href={`/lab/projects/${id}/finance`}
              className="inline-flex items-center justify-center gap-1.5 bg-black/70 px-3 py-2 text-[11px] uppercase tracking-[0.13em] text-white/75 font-mono transition-colors hover:bg-accent/10 hover:text-accent"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Finance
            </Link>
            <Link
              href={`/lab/projects/${id}/client`}
              className="inline-flex items-center justify-center gap-1.5 bg-black/70 px-3 py-2 text-[11px] uppercase tracking-[0.13em] text-white/75 font-mono transition-colors hover:bg-accent/10 hover:text-accent"
            >
              <Building2 className="h-3.5 w-3.5" />
              Client
            </Link>
            <Link
              href={`/lab/projects/${id}/activity`}
              className="inline-flex items-center justify-center gap-1.5 bg-black/70 px-3 py-2 text-[11px] uppercase tracking-[0.13em] text-white/75 font-mono transition-colors hover:bg-accent/10 hover:text-accent"
            >
              <Activity className="h-3.5 w-3.5" />
              Activity
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px border border-white/10 bg-white/5 lg:grid-cols-4" aria-label="Project metrics">
        <div className="bg-black/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Progress</p>
          <p className="mt-1 text-2xl text-accent font-mono">{weightedProgress}%</p>
        </div>
        <div className="bg-black/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Task Completion</p>
          <p className="mt-1 text-2xl text-foreground font-mono">{completedTasks}/{tasks.length}</p>
        </div>
        <div className="bg-black/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Tracked Budget</p>
          <p className="mt-1 text-2xl text-foreground font-mono">${displayBudget.toLocaleString()}</p>
        </div>
        <div className="bg-black/70 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Collected Revenue</p>
          <p className="mt-1 text-2xl text-emerald-300 font-mono">${paidInvoices.toLocaleString()}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-[#05090f]">
            <LabCardHeader>
              <LabCardTitle className="text-sm uppercase tracking-[0.13em] text-white/70 font-mono">Project Profile</LabCardTitle>
            </LabCardHeader>
            <LabCardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/5">
                <div className="bg-black/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Type</p>
                  <p className="mt-1 text-xs text-white/80 font-sans capitalize">{project.type || 'Website'}</p>
                </div>
                <div className="bg-black/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Start Date</p>
                  <p className="mt-1 text-xs text-white/80 font-mono">
                    {formatDateLabel(project.start_date)}
                  </p>
                </div>
                <div className="bg-black/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Deadline</p>
                  <p className="mt-1 text-xs text-white/80 font-mono">
                    {formatDateLabel(project.deadline)}
                  </p>
                </div>
                <div className="bg-black/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Created</p>
                  <p className="mt-1 text-xs text-white/80 font-mono">{formatDateLabel(project.created_at)}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="mb-2 text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Assigned Team</p>
                {teamMembers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-2.5 py-1.5">
                        {member.avatar_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={member.avatar_url} alt={member.full_name || ''} className="h-5 w-5" />
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center bg-accent/20">
                            <Users className="h-3 w-3 text-accent" />
                          </div>
                        )}
                        <span className="text-xs text-white/80 font-sans">{member.full_name || 'Unknown'}</span>
                        <span className="text-[10px] uppercase tracking-[0.12em] text-white/45 font-mono">{member.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/45">No team members assigned yet.</p>
                )}
              </div>
            </LabCardContent>
          </Card>

          <Card className="border-white/10 bg-[#05090f]">
            <LabCardHeader className="flex flex-row items-center justify-between">
              <LabCardTitle className="text-sm uppercase tracking-[0.13em] text-white/70 font-mono">Task Stream</LabCardTitle>
              <Link href={`/lab/projects/${id}/delivery`}>
                <LabButton variant="ghost" size="sm">Open Delivery</LabButton>
              </Link>
            </LabCardHeader>
            <LabCardContent>
              {recentTasks.length === 0 ? (
                <p className="py-4 text-center text-sm text-white/45">No tasks yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 border border-white/10 bg-white/5 px-3 py-2.5">
                      <ToggleTaskButton
                        taskId={task.id}
                        completed={task.status === 'done'}
                        canToggle={canToggleTask(task.assignee_id)}
                        disabledMessage="You cannot update this task"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${task.status === 'done' ? 'line-through text-white/45' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                      </div>
                      <LabBadge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'ghost'}>
                        {task.priority}
                      </LabBadge>
                    </div>
                  ))}
                </div>
              )}
            </LabCardContent>
          </Card>

          <Card className="border-white/10 bg-[#05090f]">
            <LabCardHeader>
              <LabCardTitle className="text-sm uppercase tracking-[0.13em] text-white/70 font-mono">Recent Activity</LabCardTitle>
            </LabCardHeader>
            <LabCardContent>
              {recentActivities.length === 0 ? (
                <p className="py-4 text-center text-sm text-white/45">No activity yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentActivities.map((activity) => (
                    <article key={activity.id} className="flex items-start gap-3 border border-white/10 bg-white/5 px-3 py-2.5">
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center bg-white/10">
                        <Clock className="h-3 w-3 text-white/55" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/80 leading-relaxed">
                          <span className="font-medium">{(activity.user as { full_name?: string })?.full_name || 'Someone'}</span>{' '}
                          {activity.action}
                        </p>
                        <p className="mt-1 text-[10px] text-white/40 font-mono">{formatDateTimeLabel(activity.created_at)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </LabCardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-[#05090f]">
            <LabCardHeader className="flex flex-row items-center justify-between">
              <LabCardTitle className="text-sm uppercase tracking-[0.13em] text-white/70 font-mono">Upcoming Meetings</LabCardTitle>
              <Link href="/lab/meetings">
                <LabButton variant="ghost" size="sm">View All</LabButton>
              </Link>
            </LabCardHeader>
            <LabCardContent>
              {upcomingMeetings.length === 0 ? (
                <p className="py-4 text-center text-sm text-white/45">No upcoming meetings.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingMeetings.map((meeting) => (
                    <article key={meeting.id} className="border border-white/10 bg-white/5 px-3 py-2.5">
                      <p className="text-sm text-foreground">{meeting.title}</p>
                      <p className="mt-1 text-[11px] text-white/45 font-mono">
                        {formatDateTimeLabel(meeting.scheduled_at)} • {meeting.duration_minutes}m
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </LabCardContent>
          </Card>

          <Card className="border-white/10 bg-[#05090f]">
            <LabCardHeader className="flex flex-row items-center justify-between">
              <LabCardTitle className="text-sm uppercase tracking-[0.13em] text-white/70 font-mono">Invoice Pulse</LabCardTitle>
              <Link href={`/lab/projects/${id}/finance`}>
                <LabButton variant="ghost" size="sm">Open Finance</LabButton>
              </Link>
            </LabCardHeader>
            <LabCardContent>
              {recentInvoices.length === 0 ? (
                <p className="py-4 text-center text-sm text-white/45">No invoices yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentInvoices.map((invoice) => (
                    <article key={invoice.id} className="flex items-center justify-between border border-white/10 bg-white/5 px-3 py-2.5">
                      <div>
                        <p className="text-sm text-foreground font-mono">{invoice.invoice_number}</p>
                        <p className="mt-1 text-[11px] text-white/45 font-mono">${invoice.total.toLocaleString()}</p>
                      </div>
                      <LabBadge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'sent' ? 'warning' : 'ghost'}>
                        {invoice.status}
                      </LabBadge>
                    </article>
                  ))}
                </div>
              )}
            </LabCardContent>
          </Card>

          <ProjectDetailClient projectId={id} milestones={milestones} expenses={expenses} services={services} client={project.client || null} />
        </div>
      </div>
    </div>
  )
}
