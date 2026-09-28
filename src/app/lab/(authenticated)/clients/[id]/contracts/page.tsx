import { createClient } from '@/lib/supabase/server'
import { Contract } from '@/types/lab'
import { ClientContractsClient } from './ClientContractsClient'

async function getClientContracts(clientId: string): Promise<Contract[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contracts')
    .select('*, template:contract_templates(name)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    
  return data as Contract[] || []
}

async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { canEdit: false }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'admin') return { canEdit: true }
  
  const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true }).eq('lead_id', user.id)
  return { canEdit: (count ?? 0) > 0 }
}

export default async function ClientContractsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [contracts, { canEdit }] = await Promise.all([
    getClientContracts(id),
    getUserRole()
  ])

  return (
    <ClientContractsClient 
      initialContracts={contracts} 
      canEdit={canEdit}
      clientId={id}
    />
  )
}
