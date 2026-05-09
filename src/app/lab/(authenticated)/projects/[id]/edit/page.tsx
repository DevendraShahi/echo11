import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { EditProjectForm } from './EditProjectForm'
import { Client, Service, Project, ProjectExpense } from '@/types/lab'

type ProjectWithRelations = Project & {
  client?: Client | null
}

async function getProject(id: string): Promise<ProjectWithRelations | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/lab/auth/login')
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    const teamId = (data as ProjectWithRelations & { team_id?: string | null }).team_id || null
    if (!teamId) return null

    const { data: leadTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('lead_id', user.id)
      .single()

    if (!leadTeam) return null
  }

  return data as ProjectWithRelations
}

async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('clients')
    .select('*')
    .order('company_name')

  return (data || []) as Client[]
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

async function getProjectExpenses(projectId: string): Promise<ProjectExpense[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('project_expenses')
    .select('*, service:services(*)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  return (data || []) as ProjectExpense[]
}

export default async function EditProjectPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const project = await getProject(id)
  
  if (!project) {
    notFound()
  }

  const [clients, services, expenses] = await Promise.all([
    getClients(),
    getServices(),
    getProjectExpenses(id)
  ])

  return (
    <div className="py-6">
      <EditProjectForm 
        project={project}
        clients={clients}
        services={services}
        expenses={expenses}
      />
    </div>
  )
}
