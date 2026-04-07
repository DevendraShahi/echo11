import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewProjectForm } from './NewProjectForm'
import { Client, Service } from '@/types/lab'

async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/lab/auth/login')
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('company_name')

  if (error) {
    console.error('Error fetching clients:', error)
  }
  return (data || []) as Client[]
}

async function getServices(): Promise<Service[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching services:', error)
  }
  return (data || []) as Service[]
}

export default async function NewProjectPage() {
  const [clients, services] = await Promise.all([
    getClients(),
    getServices()
  ])

  return (
    <div className="py-6">
      <NewProjectForm clients={clients} services={services} />
    </div>
  )
}
