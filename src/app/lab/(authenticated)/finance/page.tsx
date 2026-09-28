import { createClient } from '@/lib/supabase/server'
import { Invoice, Project, Client, Contract } from '@/types/lab'
import { FinancePageClient } from './FinancePageClient'
import { getUserRoleAndTeam } from '@/lib/actions/team-actions'

type InvoiceWithRelations = Omit<Invoice, 'project' | 'client'> & {
  project?: Pick<Project, 'name'> | null
  client?: Pick<Client, 'company_name' | 'contact_name'> | null
}

type ContractWithRelations = Contract & {
  client?: Pick<Client, 'company_name' | 'contact_name'> | null
  template?: { name: string } | null
}

async function getInvoices(userTeamId?: string | null, isAdminOrLead?: boolean): Promise<InvoiceWithRelations[]> {
  const supabase = await createClient()

  if (!isAdminOrLead && userTeamId) {
    const { data: teamProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('team_id', userTeamId)

    const projectIds = (teamProjects || []).map(p => p.id)

    if (projectIds.length === 0) {
      const { data } = await supabase
        .from('invoices')
        .select(`*, project:projects(name), client:clients(company_name, contact_name)`)
        .is('project_id', null)
        .order('created_at', { ascending: false })
      return (data || []) as InvoiceWithRelations[]
    }

    const { data } = await supabase
      .from('invoices')
      .select(`*, project:projects(name), client:clients(company_name, contact_name)`)
      .or(`project_id.in.(${projectIds.join(',')}),project_id.is.null`)
      .order('created_at', { ascending: false })

    return (data || []) as InvoiceWithRelations[]
  }

  const { data } = await supabase
    .from('invoices')
    .select(`*, project:projects(name), client:clients(company_name, contact_name)`)
    .order('created_at', { ascending: false })

  return (data || []) as InvoiceWithRelations[]
}

async function getContracts(userTeamId?: string | null, isAdminOrLead?: boolean): Promise<ContractWithRelations[]> {
  const supabase = await createClient()

  if (!isAdminOrLead && userTeamId) {
    const { data: teamProjects } = await supabase
      .from('projects')
      .select('id, client_id')
      .eq('team_id', userTeamId)

    const clientIds = [...new Set((teamProjects || []).map(p => p.client_id).filter(Boolean))] as string[]

    if (clientIds.length === 0) return []

    const { data } = await supabase
      .from('contracts')
      .select(`*, client:clients(company_name, contact_name), template:contract_templates(name)`)
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })

    return (data || []) as ContractWithRelations[]
  }

  const { data } = await supabase
    .from('contracts')
    .select(`*, client:clients(company_name, contact_name), template:contract_templates(name)`)
    .order('created_at', { ascending: false })

  return (data || []) as ContractWithRelations[]
}

async function getProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('id, name')
    .order('name', { ascending: true })
  return data || []
}

export default async function FinancePage() {
  const [projects, userRole] = await Promise.all([
    getProjects(),
    getUserRoleAndTeam()
  ])

  const canEdit = userRole?.isAdmin || userRole?.isLead || false
  const [invoices, contracts] = await Promise.all([
    getInvoices(userRole?.teamId, canEdit),
    getContracts(userRole?.teamId, canEdit)
  ])

  return (
    <FinancePageClient
      initialInvoices={invoices}
      initialContracts={contracts}
      initialProjects={projects}
      canEdit={canEdit}
    />
  )
}
