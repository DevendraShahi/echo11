import { createClient } from '@/lib/supabase/server'
import { Invoice, Project, Client } from '@/types/lab'
import InvoicesPageClient from './InvoicesPageClient'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { invoicesTourSteps } from '@/components/onboarding/pageTours'
import { getUserRoleAndTeam } from '@/lib/actions/team-actions'

type InvoiceWithRelations = Omit<Invoice, 'project' | 'client'> & {
  project?: Pick<Project, 'name'> | null
  client?: Pick<Client, 'company_name' | 'contact_name' | 'email' | 'address' | 'address_line2' | 'city' | 'state' | 'country' | 'postal_code'> | null
}

async function getInvoices(userTeamId?: string | null, isAdminOrLead?: boolean): Promise<InvoiceWithRelations[]> {
  const supabase = await createClient()

  // If not admin/lead and has a team, filter by team's projects
  if (!isAdminOrLead && userTeamId) {
    const { data: teamProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('team_id', userTeamId)

    const projectIds = (teamProjects || []).map(p => p.id)

    if (projectIds.length === 0) {
      // No projects in this team — only show invoices without a project
      const { data } = await supabase
        .from('invoices')
        .select(`*, project:projects(name), client:clients(company_name, contact_name, email, address, address_line2, city, state, country, postal_code)`)
        .is('project_id', null)
        .order('created_at', { ascending: false })
      return (data || []) as InvoiceWithRelations[]
    }

    const { data } = await supabase
      .from('invoices')
      .select(`*, project:projects(name), client:clients(company_name, contact_name, email, address, address_line2, city, state, country, postal_code)`)
      .or(`project_id.in.(${projectIds.join(',')}),project_id.is.null`)
      .order('created_at', { ascending: false })

    return (data || []) as InvoiceWithRelations[]
  }

  // Admin/lead: see all
  const { data } = await supabase
    .from('invoices')
    .select(`
      *,
      project:projects(name),
      client:clients(company_name, contact_name, email, address, address_line2, city, state, country, postal_code)
    `)
    .order('created_at', { ascending: false })

  return (data || []) as InvoiceWithRelations[]
}

async function getProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('id, name')
    .order('name', { ascending: true })
  
  return data || []
}

export default async function InvoicesPage() {
  const [projects, userRole] = await Promise.all([
    getProjects(),
    getUserRoleAndTeam()
  ])

  const canEdit = userRole?.isAdmin || userRole?.isLead || false
  const invoices = await getInvoices(userRole?.teamId, canEdit)

  return (
    <>
      <TooltipTour steps={invoicesTourSteps} pageId="invoices" />
      <PageVisitTracker pageId="invoices" />
      <InvoicesPageClient initialInvoices={invoices} initialProjects={projects} canEdit={canEdit} />
    </>
  )
}
