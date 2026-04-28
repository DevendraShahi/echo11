import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckSquare, Clock, DollarSign, FolderKanban, MessageSquare, ReceiptText } from 'lucide-react'
import { ClientCard } from '@/components/client/ui/ClientCard'
import { ClientProjectsGrid } from '@/components/client/ui/ClientProjectsGrid'
import { ClientSectionHeader } from '@/components/client/ui/ClientSectionHeader'
import { ClientStatCard } from '@/components/client/ui/ClientStatCard'
import { ClientActivityFeed } from './ClientActivityFeed'

interface ClientRecord {
  id: string
  company_name: string
  contact_name: string | null
}

interface ProjectRecord {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  color: string
  deadline: string | null
  start_date: string | null
  created_at: string | null
}

interface InvoiceRecord {
  id: string
  status: string
  total: number
  invoice_number: string
}

interface TaskRecord {
  id: string
  status: string
}

async function getClientDashboardData(clientId: string): Promise<{
  projects: ProjectRecord[]
  invoices: InvoiceRecord[]
  tasks: TaskRecord[]
}> {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, status, progress, color, deadline, start_date, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  const projectIds = (projects || []).map((project) => project.id)

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status')
    .in('project_id', projectIds.length > 0 ? projectIds : ['empty'])
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, status, total, invoice_number')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    projects: (projects || []) as ProjectRecord[],
    tasks: (tasks || []) as TaskRecord[],
    invoices: (invoices || []) as InvoiceRecord[],
  }
}

export default async function ClientDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/client/auth/login')
  }

  const { data: clientData } = await supabase
    .from('clients')
    .select('id, company_name, contact_name')
    .eq('auth_id', user.id)
    .single()

  const client = clientData as ClientRecord | null

  if (!client) {
    return (
      <ClientCard className="py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">Welcome to echo11 Client Area</h1>
        <p className="mb-8 text-white/50">Your account is not linked to any client yet.</p>
        <p className="text-sm text-white/40">Please contact echo11 to get access to your projects.</p>
      </ClientCard>
    )
  }

  const { projects, tasks, invoices } = await getClientDashboardData(client.id)

  const activeProjects = projects.filter((project) => project.status === 'active')
  const completedTasks = tasks.filter((task) => task.status === 'done')
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== 'paid' && invoice.status !== 'cancelled')
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const latestInvoice = invoices[0]

  return (
    <div className="space-y-8">
      <ClientSectionHeader
        title={`Welcome back${client.contact_name ? `, ${client.contact_name}` : ''}`}
        description="Here is what is happening with your projects."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ClientStatCard icon={FolderKanban} label="Active Projects" value={String(activeProjects.length)} tone="info" />
        <ClientStatCard
          icon={CheckSquare}
          label="Tasks Done"
          value={`${completedTasks.length}/${tasks.length}`}
          tone="success"
        />
        <ClientStatCard
          icon={DollarSign}
          label="Total Invoiced"
          value={`$${totalInvoiced.toLocaleString()}`}
          tone="warning"
        />
        <ClientStatCard icon={Clock} label="Pending Invoices" value={String(pendingInvoices.length)} tone="accent" />
      </div>

      <section className="space-y-4">
        <ClientSectionHeader
          title="Your Projects"
          action={
            <Link href="/client/projects" className="flex items-center gap-1 text-sm text-accent hover:text-accent/80">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {projects.length === 0 ? (
          <ClientCard className="p-8 text-center">
            <p className="text-white/40">No projects yet.</p>
          </ClientCard>
        ) : (
          <ClientProjectsGrid
            projects={projects}
            basePath="/client/projects"
            showStatusFilter={false}
            showSortControl
            showStartDate={false}
            limit={6}
          />
        )}
      </section>

      <section className="space-y-4">
        <ClientSectionHeader title="Quick Actions" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href="/client/projects">
            <ClientCard interactive className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono uppercase tracking-wider text-white/40">Projects</p>
                  <p className="mt-1 text-white">View all projects</p>
                </div>
                <FolderKanban className="h-5 w-5 text-accent" />
              </div>
            </ClientCard>
          </Link>

          <Link href="/client/invoices">
            <ClientCard interactive className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono uppercase tracking-wider text-white/40">Latest Invoice</p>
                  <p className="mt-1 text-white">{latestInvoice ? latestInvoice.invoice_number : 'No invoices yet'}</p>
                </div>
                <ReceiptText className="h-5 w-5 text-accent" />
              </div>
            </ClientCard>
          </Link>

          <Link href="/client/messages">
            <ClientCard interactive className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono uppercase tracking-wider text-white/40">Contact Team</p>
                  <p className="mt-1 text-white">Open messages</p>
                </div>
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
            </ClientCard>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <ClientSectionHeader title="Recent Activity" />
        <ClientActivityFeed />
      </section>
    </div>
  )
}
