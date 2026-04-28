import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientContractsClient } from './ClientContractsClient'
import { getContractsByClientId } from '@/lib/actions/contract-actions'

type Contract = {
  id: string
  title: string
  contract_number: string | null
  status: string | null
  value: number | null
  start_date: string | null
  end_date: string | null
  file_url: string | null
  sent_at: string | null
  signed_at: string | null
  created_at: string
}

export default async function ClientContractsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/client/auth/login')
  }

  const { data: viewerClient } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', user.id)
    .single()
  const contracts = viewerClient ? await getContractsByClientId(viewerClient.id) : []

  return <ClientContractsClient initialContracts={contracts as Contract[]} />
}
