import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getContractsWithClients } from '@/lib/actions/contract-actions'
import { getUserRoleAndTeam } from '@/lib/actions/team-actions'
import { ContractsPageClient } from '@/components/contracts/ContractsPageClient'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { contractsTourSteps } from '@/components/onboarding/pageTours'

export default async function ContractsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/lab/auth/login')
  }

  const [contracts, userRole] = await Promise.all([getContractsWithClients(), getUserRoleAndTeam()])
  const canEdit = userRole?.isAdmin || userRole?.isLead || false

  return (
    <>
      <TooltipTour steps={contractsTourSteps} pageId="contracts" />
      <PageVisitTracker pageId="contracts" />
      <ContractsPageClient initialContracts={contracts} canEdit={canEdit} />
    </>
  )
}
