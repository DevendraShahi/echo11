import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRoleAndTeam } from '@/lib/actions/team-actions'
import NewInvoicePageClient from './NewInvoicePageClient'

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/lab/auth/login')
  }

  const userRole = await getUserRoleAndTeam()
  const canEdit = Boolean(userRole?.isAdmin || userRole?.isLead)
  const { project } = await searchParams

  return <NewInvoicePageClient canEdit={canEdit} projectId={project} />
}
