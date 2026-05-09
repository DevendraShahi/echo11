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
  const isLead = userRoleAndTeam?.isLead ?? false
  const role = userRoleAndTeam?.role ?? 'member'
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('projects')
    .select(`
      *,
      client:clients(company_name, contact_name),
      milestones(id, name, weight, completed, completed_at),
      tasks(status, priority)
    `)
    .order('created_at', { ascending: false })

  if (isAdmin) {
    // Admin sees all projects.
  } else if (isLead && userRoleAndTeam?.teamId) {
    query = query.eq('team_id', userRoleAndTeam.teamId)
  } else if (role === 'member' && user?.id) {
    const { data: assignedTasks } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('assignee_id', user.id)
      .not('project_id', 'is', null)

    const assignedProjectIds = Array.from(
      new Set((assignedTasks || []).map((task) => task.project_id).filter(Boolean))
    ) as string[]

    if (assignedProjectIds.length === 0) {
      return []
    }

    query = query.in('id', assignedProjectIds)

    if (userRoleAndTeam?.teamId) {
      query = query.eq('team_id', userRoleAndTeam.teamId)
    }
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
  const isLead = userRoleAndTeam?.isLead ?? false
  const role = userRoleAndTeam?.role ?? 'member'
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('clients')
    .select('id, company_name')
    .order('company_name')

  if (isAdmin) {
    // Admin sees all clients.
  } else if (isLead && userRoleAndTeam?.teamId) {
    const { data: teamProjects } = await supabase
      .from('projects')
      .select('client_id')
      .eq('team_id', userRoleAndTeam.teamId)

    const clientIds = [...new Set((teamProjects || []).map(p => p.client_id).filter(Boolean))]
    if (clientIds.length === 0) return []
    query = query.in('id', clientIds)
  } else if (role === 'member' && user?.id) {
    const { data: assignedTasks } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('assignee_id', user.id)
      .not('project_id', 'is', null)

    const assignedProjectIds = Array.from(
      new Set((assignedTasks || []).map((task) => task.project_id).filter(Boolean))
    ) as string[]

    if (assignedProjectIds.length === 0) return []

    const { data: assignedProjects } = await supabase
      .from('projects')
      .select('client_id, team_id')
      .in('id', assignedProjectIds)

    const scopedProjects = (assignedProjects || []).filter((project) =>
      userRoleAndTeam?.teamId ? project.team_id === userRoleAndTeam.teamId : true
    )

    const clientIds = [...new Set(scopedProjects.map((project) => project.client_id).filter(Boolean))]
    if (clientIds.length === 0) return []
    query = query.in('id', clientIds)
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
