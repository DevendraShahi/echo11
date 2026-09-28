import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditProjectForm } from './EditProjectForm'
import { Client } from '@/types/lab'
import { getProjectAccess, getProjectExpenses, getProjectWorkspace, getServices } from '@/features/lab/workspace/data'
import { ProjectSubpageShell } from '../ProjectSubpageShell'

async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('clients')
    .select('*')
    .order('company_name')

  return (data || []) as Client[]
}

export default async function EditProjectPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const project = await getProjectWorkspace(id)
  
  if (!project) {
    notFound()
  }

  const access = await getProjectAccess(id, project.team_id)
  if (!access.canManage) {
    notFound()
  }

  const [clients, services, expenses] = await Promise.all([
    getClients(),
    getServices(),
    getProjectExpenses(id)
  ])

  return (
    <ProjectSubpageShell contentClassName="p-0">
      <EditProjectForm
        project={project}
        clients={clients}
        services={services}
        expenses={expenses}
      />
    </ProjectSubpageShell>
  )
}
