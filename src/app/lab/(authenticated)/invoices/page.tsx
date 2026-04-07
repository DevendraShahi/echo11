import { createClient } from '@/lib/supabase/server'
import { Invoice, Project, Client } from '@/types/lab'
import InvoicesPageClient from './InvoicesPageClient'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { invoicesTourSteps } from '@/components/onboarding/pageTours'

type InvoiceWithRelations = Omit<Invoice, 'project' | 'client'> & {
  project?: Pick<Project, 'name'> | null
  client?: Pick<Client, 'company_name'> | null
}

async function getInvoices(): Promise<InvoiceWithRelations[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('invoices')
    .select(`
      *,
      project:projects(name),
      client:clients(company_name)
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
  const [invoices, projects] = await Promise.all([
    getInvoices(),
    getProjects()
  ])

  return (
    <>
      <TooltipTour steps={invoicesTourSteps} pageId="invoices" />
      <PageVisitTracker pageId="invoices" />
      <InvoicesPageClient initialInvoices={invoices} initialProjects={projects} />
    </>
  )
}