import { createClient } from '@/lib/supabase/server'
import { Client, Contract, Invoice, Milestone, Project, ProjectExpense, Service, Task } from '@/types/lab'

export type ProjectWorkspaceProject = Project & {
  team_id?: string | null
  client?: Client | null
  tasks?: Pick<Task, 'id' | 'status' | 'priority' | 'assignee_id' | 'due_date' | 'title'>[]
  milestones?: Pick<Milestone, 'id' | 'completed'>[]
}

export async function getProjectWorkspace(projectId: string): Promise<ProjectWorkspaceProject | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*),
      tasks(id, status, priority, assignee_id, due_date, title),
      milestones(id, completed)
    `)
    .eq('id', projectId)
    .single()

  if (error || !data) {
    return null
  }

  return data as ProjectWorkspaceProject
}

export async function getProjectAccess(projectId: string, projectTeamId: string | null | undefined) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { canAccess: false, canManage: false, role: 'member' as const, userId: null as string | null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { canAccess: false, canManage: false, role: 'member' as const, userId: user.id }
  }

  if (profile.role === 'admin') {
    return { canAccess: true, canManage: true, role: 'admin' as const, userId: user.id }
  }

  let isLeadOfTeam = false
  if (projectTeamId) {
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', projectTeamId)
      .eq('lead_id', user.id)
      .single()
    isLeadOfTeam = Boolean(team)
  }

  if (isLeadOfTeam) {
    return { canAccess: true, canManage: true, role: 'lead' as const, userId: user.id }
  }

  const { count: assignedTaskCount } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('assignee_id', user.id)

  const canAccess = (assignedTaskCount ?? 0) > 0
  return { canAccess, canManage: false, role: 'member' as const, userId: user.id }
}

export async function getProjectTeamMembers(projectId: string) {
  const supabase = await createClient()
  const { data: tasks } = await supabase
    .from('tasks')
    .select('assignee_id')
    .eq('project_id', projectId)
    .not('assignee_id', 'is', null)

  const assigneeIds = [...new Set((tasks || []).map((task) => task.assignee_id).filter(Boolean))] as string[]
  if (assigneeIds.length === 0) {
    return []
  }

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, email')
    .in('id', assigneeIds)
    .order('full_name', { ascending: true })

  return data || []
}

export async function getProjectActivities(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activities')
    .select('id, action, created_at, user:profiles(full_name, avatar_url)')
    .eq('entity_id', projectId)
    .order('created_at', { ascending: false })
    .limit(20)

  return data || []
}

export type ProjectTaskRow = Task & {
  assignee?: Pick<Client, 'id'> | null
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })

  return (data || []) as Task[]
}

export async function getProjectMeetings(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('meetings')
    .select('id, title, description, scheduled_at, duration_minutes')
    .eq('project_id', projectId)
    .order('scheduled_at', { ascending: true })
    .limit(12)

  return data || []
}

export type ProjectInvoiceWithClient = Invoice & {
  client?: Pick<Client, 'company_name' | 'contact_name'> | null
}

export async function getProjectInvoices(projectId: string): Promise<ProjectInvoiceWithClient[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invoices')
    .select('*, client:clients(company_name, contact_name)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  return (data || []) as ProjectInvoiceWithClient[]
}

export type ProjectContractWithClient = Contract & {
  client?: Pick<Client, 'company_name' | 'contact_name'> | null
}

export async function getProjectContracts(project: ProjectWorkspaceProject): Promise<ProjectContractWithClient[]> {
  if (!project.client_id) {
    return []
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('contracts')
    .select('*, client:clients(company_name, contact_name)')
    .eq('client_id', project.client_id)
    .order('created_at', { ascending: false })

  return (data || []) as ProjectContractWithClient[]
}

export async function getProjectExpenses(projectId: string): Promise<ProjectExpense[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('project_expenses')
    .select('*, service:services(*)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  return (data || []) as ProjectExpense[]
}

export async function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  return (data || []) as Milestone[]
}

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return (data || []) as Service[]
}

export async function getClientProjectSummary(clientId: string) {
  const supabase = await createClient()

  const [
    { data: projects },
    { data: invoices },
    { data: contracts },
  ] = await Promise.all([
    supabase.from('projects').select('id, status').eq('client_id', clientId),
    supabase.from('invoices').select('status, total').eq('client_id', clientId),
    supabase.from('contracts').select('status, value').eq('client_id', clientId),
  ])

  const paidInvoices = (invoices || []).filter((invoice) => invoice.status === 'paid')
  const pendingInvoices = (invoices || []).filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')

  return {
    projectCount: (projects || []).length,
    activeProjects: (projects || []).filter((project) => project.status === 'active').length,
    totalRevenue: paidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
    pendingRevenue: pendingInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
    signedContracts: (contracts || []).filter((contract) => contract.status === 'signed').length,
    contractValue: (contracts || [])
      .filter((contract) => contract.status === 'signed')
      .reduce((sum, contract) => sum + (contract.value || 0), 0),
  }
}
