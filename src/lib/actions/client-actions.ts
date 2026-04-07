'use server'

import { createClient } from '@/lib/supabase/server'
import { sendClientInvitation } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { getUserRoleAndTeam } from './team-actions'

export interface CreateClientParams {
  company_name: string
  contact_name?: string
  email: string
  phone?: string
  address?: string
  notes?: string
  sendInvitation?: boolean
  website?: string
  industry?: string
  source?: string
  tags?: string[]
  default_hourly_rate?: number
  address_line2?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  timezone?: string
  social_links?: Record<string, string>
}

export interface CreateClientResult {
  success: boolean
  client?: {
    id: string
    company_name: string
    email: string
    auth_id: string | null
    invitation_sent_at: string | null
  }
  error?: string
}

export async function createClientWithAuth(
  params: CreateClientParams
): Promise<CreateClientResult> {
  const supabase = await createClient()
  
  // Check if user is authenticated (agency team member)
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return { success: false, error: 'You must be logged in to create a client' }
  }

  try {
    // Check if email already exists
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id, email')
      .eq('email', params.email.toLowerCase())
      .single()

    if (existingClient) {
      return { success: false, error: 'A client with this email already exists' }
    }

    let invitationSentAt: string | null = null
    const invitationToken = params.sendInvitation ? randomBytes(32).toString('hex') : null

    // If sendInvitation is true, send email
    if (params.sendInvitation && invitationToken) {
      const emailResult = await sendClientInvitation({
        to: params.email.toLowerCase(),
        contactName: params.contact_name || '',
        companyName: params.company_name,
        projectName: undefined,
        token: invitationToken
      })

      if (emailResult.success) {
        invitationSentAt = new Date().toISOString()
      }
    }

    // Create client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        company_name: params.company_name,
        contact_name: params.contact_name || null,
        email: params.email.toLowerCase(),
        phone: params.phone || null,
        address: params.address || null,
        notes: params.notes || null,
        auth_id: null,
        invitation_sent_at: invitationSentAt,
        invitation_token: params.sendInvitation ? invitationToken : null,
        created_by: authUser.id,
        website: params.website || null,
        industry: params.industry || null,
        source: params.source || null,
        tags: params.tags || null,
        default_hourly_rate: params.default_hourly_rate || null,
        address_line2: params.address_line2 || null,
        city: params.city || null,
        state: params.state || null,
        country: params.country || null,
        postal_code: params.postal_code || null,
        timezone: params.timezone || null,
        social_links: params.social_links ? JSON.stringify(params.social_links) : null
      })
      .select('*, contacts:client_contacts(*), current_status:client_statuses(*)')
      .single()

    if (clientError) {
      console.error('Client insert error:', clientError)
      return { success: false, error: clientError.message }
    }

    // Log activity
    await supabase.from('activities').insert({
      user_id: authUser.id,
      action: params.sendInvitation 
        ? 'created client with portal access' 
        : 'created a new client',
      entity_type: 'client',
      entity_id: client.id,
      metadata: { 
        company_name: params.company_name,
        email: params.email,
        invitation_sent: !!invitationSentAt
      }
    })

    revalidatePath('/lab/clients')
    revalidatePath('/lab/projects')

    return {
      success: true,
      client: client
    }

  } catch (error) {
    console.error('Unexpected error creating client:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function sendClientPortalInvite(clientId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    // Get client details
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (fetchError || !client) {
      return { success: false, error: 'Client not found' }
    }

    // Check if client already has auth account
    if (client.auth_id) {
      return { success: false, error: 'Client already has portal access' }
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex')
    const now = new Date().toISOString()

    // Send invitation email
    await sendClientInvitation({
      to: client.email,
      contactName: client.contact_name || '',
      companyName: client.company_name,
      token: invitationToken
    })

    // Update client record
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        invitation_sent_at: now,
        invitation_token: invitationToken
      })
      .eq('id', clientId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Log activity
    await supabase.from('activities').insert({
      user_id: authUser.id,
      action: 'invited client to portal',
      entity_type: 'client',
      entity_id: clientId,
      metadata: { company_name: client.company_name }
    })

    revalidatePath('/lab/clients')
    revalidatePath(`/lab/projects/${clientId}`)

    return { success: true }

  } catch (error) {
    console.error('Error sending invite:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export interface UpdateClientParams {
  company_name?: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  website?: string
  industry?: string
  source?: string
  tags?: string[]
  default_hourly_rate?: number
  address_line2?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  timezone?: string
  social_links?: Record<string, string>
}

export async function updateClient(
  clientId: string,
  params: UpdateClientParams
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('clients')
      .update({
        company_name: params.company_name,
        contact_name: params.contact_name || null,
        email: params.email?.toLowerCase(),
        phone: params.phone || null,
        address: params.address || null,
        notes: params.notes || null,
        website: params.website || null,
        industry: params.industry || null,
        source: params.source || null,
        tags: params.tags || null,
        default_hourly_rate: params.default_hourly_rate || null,
        address_line2: params.address_line2 || null,
        city: params.city || null,
        state: params.state || null,
        country: params.country || null,
        postal_code: params.postal_code || null,
        timezone: params.timezone || null,
        social_links: params.social_links ? JSON.stringify(params.social_links) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)

    if (error) {
      return { success: false, error: error.message }
    }

    await supabase.from('activities').insert({
      user_id: authUser.id,
      action: 'updated client details',
      entity_type: 'client',
      entity_id: clientId
    })

    revalidatePath('/lab/clients')
    revalidatePath(`/lab/clients/${clientId}`)

    return { success: true }

  } catch (error) {
    console.error('Error updating client:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteClient(clientId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('company_name, auth_id')
      .eq('id', clientId)
      .single()

    if (fetchError || !client) {
      return { success: false, error: 'Client not found' }
    }

    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    await supabase.from('activities').insert({
      user_id: authUser.id,
      action: 'deleted client',
      entity_type: 'client',
      entity_id: clientId,
      metadata: { company_name: client.company_name }
    })

    revalidatePath('/lab/clients')

    return { success: true }

  } catch (error) {
    console.error('Error deleting client:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export interface ClientWithRelations {
  id: string
  company_name: string
  contact_name: string | null
  email: string
  phone: string | null
  address: string | null
  notes: string | null
  auth_id: string | null
  profile_id: string | null
  invitation_sent_at: string | null
  invitation_token: string | null
  invitation_accepted_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  website: string | null
  industry: string | null
  source: string | null
  tags: string[] | null
  default_hourly_rate: number | null
  address_line2: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  timezone: string | null
  social_links: Record<string, string> | null
  contacts?: { id: string; name: string; email: string | null; phone: string | null; role: string | null; is_primary: boolean }[]
  current_status?: { status: string }
  projects_count?: number
  total_revenue?: number
  active_invoices?: number
}

export async function getClientsWithStats(): Promise<ClientWithRelations[]> {
  const supabase = await createClient()
  const userRoleAndTeam = await getUserRoleAndTeam()
  const isAdmin = userRoleAndTeam?.isAdmin ?? false

  let clientIds: string[] | null = null

  if (!isAdmin && userRoleAndTeam?.teamId) {
    const { data: teamProjects } = await supabase
      .from('projects')
      .select('client_id')
      .eq('team_id', userRoleAndTeam.teamId)
    
    clientIds = [...new Set((teamProjects || []).map(p => p.client_id).filter(Boolean))]
    
    if (clientIds.length === 0) {
      return []
    }
  }

  let query = supabase
    .from('clients')
    .select(`
      *,
      contacts:client_contacts(id, name, email, phone, role, is_primary),
      current_status:client_statuses(status)
    `)
    .order('created_at', { ascending: false })

  if (clientIds) {
    query = query.in('id', clientIds)
  }

  const { data } = await query
  const clients = (data || []) as ClientWithRelations[]

  for (const client of clients) {
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id')
      .eq('client_id', client.id)
    
    client.projects_count = projectsData?.length || 0

    const { data: invoicesData } = await supabase
      .from('invoices')
      .select('total, status')
      .eq('client_id', client.id)
    
    client.total_revenue = invoicesData
      ?.filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0) || 0
    
    client.active_invoices = invoicesData
      ?.filter(i => i.status === 'sent' || i.status === 'overdue')
      .length || 0
  }

  return clients
}

export interface ClientStats {
  total: number
  active: number
  at_risk: number
  leads: number
  prospects: number
  inactive: number
  totalRevenue: number
  pendingAmount: number
}

export async function getClientStats(): Promise<ClientStats> {
  const supabase = await createClient()
  const userRoleAndTeam = await getUserRoleAndTeam()
  const isAdmin = userRoleAndTeam?.isAdmin ?? false

  let clientIds: string[] | null = null

  if (!isAdmin && userRoleAndTeam?.teamId) {
    const { data: teamProjects } = await supabase
      .from('projects')
      .select('client_id')
      .eq('team_id', userRoleAndTeam.teamId)
    
    clientIds = [...new Set((teamProjects || []).map(p => p.client_id).filter(Boolean))]
  }

  let clientsQuery = supabase.from('clients').select('id')
  if (clientIds) {
    clientsQuery = clientsQuery.in('id', clientIds)
  }
  const { data: clients } = await clientsQuery

  let invoicesQuery = supabase.from('invoices').select('total, status')
  if (clientIds) {
    invoicesQuery = invoicesQuery.in('client_id', clientIds)
  }
  const { data: invoices } = await invoicesQuery

  let statusesQuery = supabase.from('client_statuses').select('status')
  if (clientIds) {
    statusesQuery = statusesQuery.in('client_id', clientIds)
  }
  const { data: statuses } = await statusesQuery

  const total = clients?.length || 0
  
  const statusCounts = (statuses || []).reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const clientsWithoutStatus = total - Object.values(statusCounts).reduce((a, b) => a + b, 0)

  return {
    total,
    active: statusCounts['active'] || clientsWithoutStatus,
    at_risk: statusCounts['at_risk'] || 0,
    leads: statusCounts['lead'] || 0,
    prospects: statusCounts['prospect'] || 0,
    inactive: statusCounts['inactive'] || 0,
    totalRevenue: (invoices || [])
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0),
    pendingAmount: (invoices || [])
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + (i.total || 0), 0)
  }
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function getClientInviteDetails(token: string) {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('id, email, company_name')
      .eq('invitation_token', token)
      .single()

    if (error || !client || !client.email) return null

    return { id: client.id, email: client.email, companyName: client.company_name }
  } catch (err) {
    return null
  }
}

export async function acceptClientInvite(clientId: string, authUserId: string, fullName: string) {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Update the 'profiles' role to 'client'
    await supabaseAdmin.from('profiles').update({
      role: 'client',
      full_name: fullName
    }).eq('id', authUserId)

    // 2. Link the auth_id to the clients record and clear the token
    const { error: clientUpdateError } = await supabaseAdmin.from('clients').update({
      auth_id: authUserId,
      invitation_token: null,
      invitation_accepted_at: new Date().toISOString()
    }).eq('id', clientId)

    if (clientUpdateError) throw new Error(clientUpdateError.message)

    return { success: true }
  } catch (err: any) {
    console.error('Error accepting client invite:', err)
    return { success: false, error: err.message || 'Server error accepting invite' }
  }
}
