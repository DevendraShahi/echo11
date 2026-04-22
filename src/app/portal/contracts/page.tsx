import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, Download, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { PortalContractsClient } from './PortalContractsClient'

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

async function getClientContracts(userId: string) {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!client) return []

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return (contracts || []) as Contract[]
}

export default async function PortalContractsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/portal/auth/login')
  }

  const contracts = await getClientContracts(user.id)

  return <PortalContractsClient initialContracts={contracts} />
}
