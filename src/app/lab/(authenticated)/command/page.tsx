import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckSquare,
  CircleDollarSign,
  FolderKanban,
  MessageSquare,
  Plus,
  Receipt,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ActionRail } from '@/components/lab/primitives/ActionRail'
import { DataState } from '@/components/lab/primitives/DataState'
import { LabPageHeader } from '@/components/lab/primitives/LabPageHeader'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { LabButton } from '@/components/ui/LabButton'

type ProjectStreamItem = {
  id: string
  name: string
  status: string
  updated_at: string
  deadline: string | null
  client?: { company_name?: string } | null
}

type OverdueTaskItem = {
  id: string
  title: string
  due_date: string | null
  project_id: string | null
  project?: { name?: string } | null
}

type PendingInvoiceItem = {
  id: string
  invoice_number: string | null
  status: string
  total: number | null
  due_date: string | null
  client?: { company_name?: string } | null
  project?: { name?: string } | null
}

type MessagePulseItem = {
  id: string
  client_id: string
  content: string
  created_at: string
  sender_type: 'client' | 'team'
  read_by_team: boolean
  client?: { company_name?: string } | null
}

type UpcomingMeetingItem = {
  id: string
  title: string
  scheduled_at: string
  duration_minutes: number
}

function formatDateLabel(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Not set'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

function formatDateTimeLabel(value: string): string {
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

function formatRelativeFromNow(value: string): string {
  const parsed = new Date(value).getTime()
  if (Number.isNaN(parsed)) return 'just now'
  const diffMs = parsed - Date.now()
  const absSec = Math.round(Math.abs(diffMs) / 1000)
  const absMin = Math.round(absSec / 60)
  const absHour = Math.round(absMin / 60)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), 'second')
  if (absMin < 60) return rtf.format(Math.round(diffMs / (1000 * 60)), 'minute')
  if (absHour < 24) return rtf.format(Math.round(diffMs / (1000 * 60 * 60)), 'hour')
  return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24)), 'day')
}

function getDeadlineMeta(deadline: string | null) {
  if (!deadline) return { label: 'No deadline', tone: 'text-white/45' }

  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, tone: 'text-rose-300' }
  if (diff === 0) return { label: 'Due today', tone: 'text-amber-300' }
  if (diff <= 3) return { label: `${diff}d left`, tone: 'text-amber-300' }
  return { label: `${diff}d left`, tone: 'text-emerald-300' }
}

async function getCommandData() {
  const supabase = await createClient()

  const [
    projectsRes,
    tasksRes,
    invoicesRes,
    meetingsRes,
    clientsRes,
    messagesRes,
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, status, updated_at, deadline, client:clients(company_name)')
      .order('updated_at', { ascending: false })
      .limit(10),
    supabase
      .from('tasks')
      .select('id, title, status, due_date, project_id, project:projects(name)')
      .neq('status', 'done')
      .order('due_date', { ascending: true })
      .limit(80),
    supabase
      .from('invoices')
      .select('id, invoice_number, status, total, due_date, client:clients(company_name), project:projects(name)')
      .order('created_at', { ascending: false })
      .limit(60),
    supabase
      .from('meetings')
      .select('id, title, scheduled_at, duration_minutes')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(6),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase
      .from('client_messages')
      .select('id, client_id, content, created_at, sender_type, read_by_team, client:clients(company_name)')
      .order('created_at', { ascending: false })
      .limit(120),
  ])

  const projects = (projectsRes.data || []) as ProjectStreamItem[]
  const tasks = (tasksRes.data || []) as OverdueTaskItem[]
  const invoices = (invoicesRes.data || []) as PendingInvoiceItem[]
  const meetings = (meetingsRes.data || []) as UpcomingMeetingItem[]
  const messages = (messagesRes.data || []) as MessagePulseItem[]

  const overdueTasks = tasks.filter((task) => task.due_date && new Date(task.due_date) < new Date())
  const dueSoonTasks = tasks.filter((task) => {
    if (!task.due_date) return false
    const diff = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 3
  })

  const pendingInvoices = invoices.filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
  const pendingInvoiceAmount = pendingInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
  const paidRevenue = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0)

  const unreadMessages = messages.filter((message) => message.sender_type === 'client' && !message.read_by_team)

  const latestUnreadByClient = new Map<string, MessagePulseItem>()
  for (const message of unreadMessages) {
    if (!latestUnreadByClient.has(message.client_id)) {
      latestUnreadByClient.set(message.client_id, message)
    }
  }

  return {
    stats: {
      activeProjects: projects.filter((project) => project.status === 'active').length,
      totalProjects: projects.length,
      openTasks: tasks.length,
      overdueTasks: overdueTasks.length,
      dueSoonTasks: dueSoonTasks.length,
      pendingInvoiceAmount,
      paidRevenue,
      unreadMessages: unreadMessages.length,
      clients: clientsRes.count || 0,
      upcomingMeetings: meetings.length,
    },
    projects,
    overdueTasks: overdueTasks.slice(0, 8),
    pendingInvoices: pendingInvoices.slice(0, 8),
    unreadConversations: Array.from(latestUnreadByClient.values()).slice(0, 8),
    meetings,
  }
}

export default async function CommandPage() {
  const { stats, projects, overdueTasks, pendingInvoices, unreadConversations, meetings } = await getCommandData()

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden border border-white/10 bg-[#04080d]">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[18rem] justify-center overflow-hidden">
          <div className="orb-pulse absolute -top-[27rem] h-[56rem] w-[92rem] opacity-75 blur-[90px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-300/10 via-cyan-300/5 to-transparent" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-[11.75rem] h-px bg-gradient-to-r from-transparent via-cyan-300/55 to-transparent shadow-[0_0_28px_var(--accent-glow)]" />
        <div className="pointer-events-none absolute inset-0 grain-overlay opacity-25" />

        <div className="relative z-10 space-y-5 px-4 py-5 md:px-5 md:py-6">
          <LabPageHeader
            title="Command"
            description="Live operations dashboard for delivery risks, client communication, and cash flow"
            icon={FolderKanban}
            className="w-full"
            action={<p className="text-xs text-white/45 font-mono">{formatDateLabel(new Date())}</p>}
          />

          <p className="max-w-3xl text-xs uppercase tracking-[0.14em] text-white/48 font-mono">
            Every request, deadline, and payment creates an echo. This horizon keeps the team aligned before noise turns into risk.
          </p>

          <MetricStrip
            className="border-white/15 bg-white/[0.07]"
            items={[
              { label: 'Active Projects', value: stats.activeProjects, hint: `${stats.totalProjects} tracked` },
              { label: 'Open Tasks', value: stats.openTasks, hint: `${stats.overdueTasks} overdue`, tone: stats.overdueTasks > 0 ? 'warning' : 'default' },
              { label: 'Unread Client Msgs', value: stats.unreadMessages, tone: stats.unreadMessages > 0 ? 'warning' : 'success' },
              { label: 'Pending Invoices', value: `$${stats.pendingInvoiceAmount.toLocaleString()}`, tone: stats.pendingInvoiceAmount > 0 ? 'accent' : 'default' },
            ]}
          />

          <ActionRail
            className="border-white/15 bg-white/[0.07]"
            items={[
              { label: 'New Project', hint: 'Create delivery cockpit', href: '/lab/projects/new', icon: Plus },
              { label: 'Clients', hint: `${stats.clients} accounts`, href: '/lab/clients', icon: Users },
              { label: 'Messages', hint: `${stats.unreadMessages} unread`, href: '/lab/messages', icon: MessageSquare },
              { label: 'Finance', hint: `${pendingInvoices.length} pending invoices`, href: '/lab/finance', icon: CircleDollarSign },
            ]}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1.15fr_1fr_1fr]">
        <PanelSection title="Project Pulse" description="Recently updated projects and deadline pressure">
          {projects.length === 0 ? (
            <DataState
              title="No projects yet"
              description="Create your first project to activate the command dashboard."
              icon={FolderKanban}
              action={
                <Link href="/lab/projects/new">
                  <LabButton>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create Project
                  </LabButton>
                </Link>
              }
            />
          ) : (
            <div className="space-y-px border border-white/10 bg-white/5">
              {projects.map((project) => {
                const deadlineMeta = getDeadlineMeta(project.deadline)
                return (
                  <article key={project.id} className="grid grid-cols-1 gap-2 bg-black/60 px-4 py-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                    <div>
                      <Link href={`/lab/projects/${project.id}`} className="text-sm text-foreground hover:text-accent font-sans">
                        {project.name}
                      </Link>
                      <p className="mt-1 text-[11px] text-white/45 font-mono">
                        {(project.client as { company_name?: string } | null)?.company_name || 'Internal client'}
                      </p>
                    </div>

                    <div className="justify-self-start md:justify-self-end">
                      <span className={`border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono ${deadlineMeta.tone}`}>
                        {deadlineMeta.label}
                      </span>
                    </div>

                    <span className="justify-self-start text-[11px] text-white/45 font-mono md:justify-self-end">
                      {formatRelativeFromNow(project.updated_at)}
                    </span>
                  </article>
                )
              })}
            </div>
          )}
        </PanelSection>

        <PanelSection title="Delivery Risk Queue" description="Overdue work that needs reprioritization">
          {overdueTasks.length === 0 ? (
            <DataState title="No overdue tasks" description="Delivery queue is currently healthy." icon={CheckSquare} />
          ) : (
            <div className="space-y-px border border-white/10 bg-white/5">
              {overdueTasks.map((task) => (
                <article key={task.id} className="grid grid-cols-1 gap-2 bg-black/60 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm text-foreground font-sans">{task.title}</p>
                    <p className="mt-1 text-[11px] text-white/45 font-mono">{task.project?.name || 'Unassigned project'}</p>
                  </div>
                  <div className="justify-self-start md:justify-self-end">
                    <span className="inline-flex items-center gap-1 border border-rose-500/25 bg-rose-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-rose-300 font-mono">
                      <AlertTriangle className="h-3 w-3" />
                      {task.due_date ? formatRelativeFromNow(task.due_date) : 'No due date'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </PanelSection>

        <div className="space-y-6">
          <PanelSection title="Client Message Queue" description="Latest unread client requests">
            {unreadConversations.length === 0 ? (
              <DataState title="No unread client messages" description="Inbox is clear right now." icon={MessageSquare} />
            ) : (
              <div className="space-y-px border border-white/10 bg-white/5">
                {unreadConversations.map((message) => (
                  <article key={message.id} className="bg-black/60 px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground font-sans">{message.client?.company_name || 'Unknown client'}</p>
                      <span className="text-[10px] text-white/35 font-mono">{formatRelativeFromNow(message.created_at)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-white/55 font-mono">{message.content}</p>
                    <Link
                      href={`/lab/messages?client=${message.client_id}`}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.13em] text-accent font-mono hover:text-accent/80"
                    >
                      Open Thread
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </PanelSection>

          <PanelSection title="Finance + Schedule" description="Pending invoices and upcoming meetings">
            <div className="space-y-3">
              <div className="border border-white/10 bg-black/55 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.13em] text-white/40 font-mono">Pending Invoice Exposure</p>
                <p className="mt-1 text-xl text-amber-300 font-mono">${stats.pendingInvoiceAmount.toLocaleString()}</p>
                <p className="text-[11px] text-white/45 font-mono">{pendingInvoices.length} invoice(s) awaiting payment</p>
              </div>

              <div className="space-y-px border border-white/10 bg-white/5">
                {meetings.length === 0 ? (
                  <div className="bg-black/60 px-4 py-4 text-sm text-white/40 font-mono">No upcoming meetings</div>
                ) : (
                  meetings.map((meeting) => (
                    <article key={meeting.id} className="grid grid-cols-1 gap-1 bg-black/60 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
                      <p className="text-sm text-foreground font-sans">{meeting.title}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-white/45 font-mono">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateTimeLabel(meeting.scheduled_at)}
                      </span>
                    </article>
                  ))
                )}
              </div>

              <Link
                href="/lab/finance"
                className="inline-flex items-center gap-1 border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.13em] text-white/70 font-mono hover:border-accent/35 hover:text-accent"
              >
                <Receipt className="h-3 w-3" />
                Open Finance
              </Link>
            </div>
          </PanelSection>
        </div>
      </div>

      {stats.paidRevenue > 0 ? (
        <p className="text-xs text-white/35 font-mono">
          Lifetime paid revenue tracked in current invoice dataset: ${stats.paidRevenue.toLocaleString()}
        </p>
      ) : null}
    </div>
  )
}
