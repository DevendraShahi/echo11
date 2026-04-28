import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientInvoicesClient } from './ClientInvoicesClient'

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
  client?: {
    company_name: string | null
    contact_name: string | null
    email: string | null
    address: string | null
    address_line2: string | null
    city: string | null
    state: string | null
    country: string | null
    postal_code: string | null
  } | null
}

async function getClientInvoices(clientId: string) {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(company_name, contact_name, email, address, address_line2, city, state, country, postal_code)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  return (invoices || []) as Invoice[]
}

export default async function ClientInvoicesPage() {
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
  const invoices = viewerClient ? await getClientInvoices(viewerClient.id) : []

  return <ClientInvoicesClient initialInvoices={invoices} />
}
