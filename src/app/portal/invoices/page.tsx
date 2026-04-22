import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortalInvoicesClient } from './PortalInvoicesClient'

type Invoice = {
  id: string
  invoice_number: string
  status: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  due_date: string | null
  paid_date: string | null
  created_at: string
}

async function getClientInvoices(userId: string) {
  const supabase = await createClient()
  
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('auth_id', userId)
    .single()

  if (!client) return []

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return (invoices || []) as Invoice[]
}

export default async function PortalInvoicesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/portal/auth/login')
  }

  const invoices = await getClientInvoices(user.id)

  return <PortalInvoicesClient initialInvoices={invoices} />
}
