import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientsPageContent } from '@/components/lab/ClientsPageContent'
import { getClientsWithStats, getClientStats } from '@/lib/actions/client-actions'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { clientsTourSteps } from '@/components/onboarding/pageTours'
import { getUserRoleAndTeam } from '@/lib/actions/team-actions'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/lab/auth/login')
  }

  const [clients, stats, userRole] = await Promise.all([
    getClientsWithStats(),
    getClientStats(),
    getUserRoleAndTeam()
  ])

  const canEdit = userRole?.isAdmin || userRole?.isLead || false

  return (
    <>
      <TooltipTour steps={clientsTourSteps} pageId="clients" />
      <PageVisitTracker pageId="clients" />
      <ClientsPageContent initialClients={clients} initialStats={stats} canEdit={canEdit} />
    </>
  )
}
