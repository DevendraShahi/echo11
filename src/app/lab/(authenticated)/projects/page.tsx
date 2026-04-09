import { createClient } from '@/lib/supabase/server'
import { Project, Client, Milestone } from '@/types/lab'
import ProjectsPageClient from './ProjectsPageClient'
import { getUserRoleAndTeam } from '@/lib/actions/team-actions'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { projectsTourSteps } from '@/components/onboarding/pageTours'

type ProjectWithClient = Omit<Project, 'client'> & {
  client?: Pick<Client, 'company_name' | 'contact_name'> | null
}

type ProjectWithMilestones = ProjectWithClient & {
  milestones?: Milestone[]
  tasks?: { status: string; priority: string }[]
}

async function getProjects(): Promise<ProjectWithMilestones[]> {
  const supabase = await createClient()
  const userRoleAndTeam = await getUserRoleAndTeam()
  const isAdmin = userRoleAndTeam?.isAdmin ?? false

  let query = supabase
    .from('projects')
    .select(`
      *,
      client:clients(company_name, contact_name),
      milestones(id, name, weight, completed, completed_at),
      tasks(status, priority)
    `)
    .order('created_at', { ascending: false })

  if (!isAdmin && userRoleAndTeam?.teamId) {
    query = query.eq('team_id', userRoleAndTeam.teamId)
  }

  const { data: projects, error } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return (projects || []) as unknown as ProjectWithClient[]
}

async function getClients() {
  const supabase = await createClient()
  const userRoleAndTeam = await getUserRoleAndTeam()
  const isAdmin = userRoleAndTeam?.isAdmin ?? false

  let query = supabase
    .from('clients')
    .select('id, company_name')
    .order('company_name')

  if (!isAdmin && userRoleAndTeam?.teamId) {
    const { data: teamProjects } = await supabase
      .from('projects')
      .select('client_id')
      .eq('team_id', userRoleAndTeam.teamId)
    
    const clientIds = [...new Set((teamProjects || []).map(p => p.client_id).filter(Boolean))]
    
    if (clientIds.length > 0) {
      query = query.in('id', clientIds)
    } else {
      return []
    }
  }
  
  const { data } = await query
  return data || []
}

export default async function ProjectsPage() {
  const [projects, clients, userRole] = await Promise.all([
    getProjects(),
    getClients(),
    getUserRoleAndTeam()
  ])

  const canEdit = userRole?.isAdmin || userRole?.isLead || false

  return (
    <>
      <TooltipTour steps={projectsTourSteps} pageId="projects" />
      <PageVisitTracker pageId="projects" />
      <ProjectsPageClient initialProjects={projects} initialClients={clients} canEdit={canEdit} />
    </>
  )
}
