import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientsPageContent } from '@/components/lab/ClientsPageContent'
import { getClientsWithStats, getClientStats } from '@/lib/actions/client-actions'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { clientsTourSteps } from '@/components/onboarding/pageTours'

export default async function ClientsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/lab/auth/login')
  }

  const clients = await getClientsWithStats()
  const stats = await getClientStats()

  return (
    <>
      <TooltipTour steps={clientsTourSteps} pageId="clients" />
      <PageVisitTracker pageId="clients" />
      <ClientsPageContent initialClients={clients} initialStats={stats} />
    </>
  )
}
