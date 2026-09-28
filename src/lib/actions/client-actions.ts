'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { getUserRoleAndTeam } from './team-actions'
import { requireAdminOrLead } from './role-helpers'
import { revalidateClientSurface, revalidateLegacyPortalSurface } from './client-surface-revalidate'
import { callApiV1 } from '@/lib/api/v1/internal-client'
import { isApiFailure } from '@/lib/api/v1/contracts'
import { isMissingRelationOrColumnError } from '@/lib/api/v1/compat'

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

  const allowed = await requireAdminOrLead(authUser.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can create clients' }
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
    const invitationExpiresAt = params.sendInvitation
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null

    // If sendInvitation is true, send email
    if (params.sendInvitation && invitationToken) {
      const { sendClientInvitation } = await import('@/lib/email')
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

    const createResponse = await callApiV1<{ client_id: string; lock_version: number | null }>('/clients', {
      method: 'POST',
      body: {
        company_name: params.company_name,
        contact_name: params.contact_name || null,
        email: params.email.toLowerCase(),
        phone: params.phone || null,
        address: params.address || null,
        notes: params.notes || null,
        auth_id: null,
        invitation_sent_at: invitationSentAt,
        invitation_token: params.sendInvitation ? invitationToken : null,
        invitation_token_expires_at: invitationExpiresAt,
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
        social_links: params.social_links || null,
      },
      idempotencyKey: `client-create-${crypto.randomUUID()}`,
    })

    if (isApiFailure(createResponse)) {
      return { success: false, error: createResponse.error.message }
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*, contacts:client_contacts(*), current_status:client_statuses(*)')
      .eq('id', createResponse.data.client_id)
      .single()

    if (clientError || !client) {
      return { success: false, error: clientError?.message || 'Client created but failed to reload data' }
    }

    // Log activity
    await supabase.from('activities').insert({
      user_id: authUser.id,
      action: params.sendInvitation 
        ? 'created client with client access' 
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

  const allowed = await requireAdminOrLead(authUser.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can send client invitations' }
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
      return { success: false, error: 'Client already has client access' }
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex')
    const now = new Date().toISOString()

    // Send invitation email
    const { sendClientInvitation } = await import('@/lib/email')
    await sendClientInvitation({
      to: client.email,
      contactName: client.contact_name || '',
      companyName: client.company_name,
      token: invitationToken
    })

    // Token expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const response = await callApiV1<{ client_id: string; lock_version: number | null }>(`/clients/${clientId}/invite`, {
      method: 'PUT',
      body: {
        invitation_sent_at: now,
        invitation_token: invitationToken,
        invitation_token_expires_at: expiresAt,
      },
      idempotencyKey: `client-portal-invite-${crypto.randomUUID()}`,
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    // Log activity
    await supabase.from('activities').insert({
      user_id: authUser.id,
      action: 'invited client to client area',
      entity_type: 'client',
      entity_id: clientId,
      metadata: { company_name: client.company_name }
    })

    revalidatePath('/lab/clients')
    revalidatePath(`/lab/clients/${clientId}`)
    revalidatePath('/lab/projects')

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

export interface UpdateClientSelfProfileParams {
  contact_name?: string
  phone?: string
  address?: string
  website?: string
}

function normalizeOptionalText(value?: string): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function updateClientSelfProfile(
  params: UpdateClientSelfProfileParams
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const response = await callApiV1<{ client_id: string; lock_version: number | null }>('/clients/self/profile', {
      method: 'PATCH',
      body: {
        contact_name: normalizeOptionalText(params.contact_name),
        phone: normalizeOptionalText(params.phone),
        address: normalizeOptionalText(params.address),
        website: normalizeOptionalText(params.website),
      },
      idempotencyKey: `client-self-profile-update-${crypto.randomUUID()}`,
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    // Non-critical audit insert; ignore failures so profile updates still succeed.
    try {
      await supabase.from('activities').insert({
        user_id: user.id,
        action: 'updated client profile',
        entity_type: 'client',
        entity_id: response.data.client_id,
        metadata: { source: 'client' }
      })
    } catch {
      // no-op
    }

    revalidatePath('/client')
    revalidatePath('/client/settings')
    revalidatePath('/lab/clients')
    revalidatePath(`/lab/clients/${response.data.client_id}`)
    revalidateLegacyPortalSurface()

    return { success: true }
  } catch (error) {
    console.error('Error updating client self profile:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
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

  const allowed = await requireAdminOrLead(authUser.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can update clients' }
  }

  try {
    const response = await callApiV1<{ client_id: string; lock_version: number | null }>(`/clients/${clientId}`, {
      method: 'PATCH',
      body: {
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
        social_links: params.social_links || null,
      },
      idempotencyKey: `client-update-${crypto.randomUUID()}`,
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    await supabase.from('activities').insert({
      user_id: authUser.id,
      action: 'updated client details',
      entity_type: 'client',
      entity_id: clientId
    })

    revalidatePath('/lab/clients')
    revalidatePath(`/lab/clients/${clientId}`)
    revalidateClientSurface()
    revalidateLegacyPortalSurface()

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

  const allowed = await requireAdminOrLead(authUser.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can delete clients' }
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

    // Check for active projects
    const { count: activeProjectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .in('status', ['active', 'on_hold'])

    if ((activeProjectCount ?? 0) > 0) {
      return { success: false, error: 'Cannot delete client with active or on-hold projects. Archive the projects first.' }
    }

    // Check for unpaid invoices
    const { count: unpaidInvoiceCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .in('status', ['sent', 'overdue'])

    if ((unpaidInvoiceCount ?? 0) > 0) {
      return { success: false, error: 'Cannot delete client with outstanding invoices. Resolve all invoices first.' }
    }

    const response = await callApiV1<{ client_id: string }>(`/clients/${clientId}`, {
      method: 'DELETE',
      idempotencyKey: `client-delete-${crypto.randomUUID()}`,
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    await supabase.from('activities').insert({
      user_id: authUser.id,
      action: 'deleted client',
      entity_type: 'client',
      entity_id: clientId,
      metadata: { company_name: client.company_name }
    })

    revalidatePath('/lab/clients')
    revalidateClientSurface()
    revalidateLegacyPortalSurface()

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
  unread_client_messages?: number
}

interface ClientProjectionSummary {
  clientId: string
  status: string
  projectsCount: number
  paidRevenue: number
  outstandingRevenue: number
  openInvoicesCount: number
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }
  return value
}

function parseClientProjectionSummary(
  clientId: string,
  payload: unknown
): ClientProjectionSummary | null {
  if (!payload || typeof payload !== 'object') return null

  const record = payload as Record<string, unknown>
  const client = record.client as Record<string, unknown> | undefined
  const projects = record.projects as Record<string, unknown> | undefined
  const invoices = record.invoices as Record<string, unknown> | undefined

  const status = typeof client?.status === 'string' ? client.status : null
  const projectsCount = asFiniteNumber(projects?.total)
  const paidRevenue = asFiniteNumber(invoices?.paid_revenue)
  const outstandingRevenue = asFiniteNumber(invoices?.outstanding_revenue)
  const openInvoicesCount = asFiniteNumber(invoices?.open_count)

  if (!status || projectsCount === null || paidRevenue === null || outstandingRevenue === null || openInvoicesCount === null) {
    return null
  }

  return {
    clientId,
    status,
    projectsCount,
    paidRevenue,
    outstandingRevenue,
    openInvoicesCount,
  }
}

async function loadClientProjectionMap(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientIds: string[]
): Promise<Map<string, ClientProjectionSummary> | null> {
  if (clientIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('client_dashboard_projection')
    .select('client_id, payload')
    .in('client_id', clientIds)

  if (error) {
    if (!isMissingRelationOrColumnError(error)) {
      console.error('Failed to load client dashboard projections:', error)
    }
    return null
  }

  const summaries = new Map<string, ClientProjectionSummary>()
  for (const row of data || []) {
    const parsed = parseClientProjectionSummary(row.client_id, row.payload)
    if (!parsed) {
      return null
    }
    summaries.set(row.client_id, parsed)
  }

  if (summaries.size !== clientIds.length) {
    return null
  }

  return summaries
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

  if (clients.length === 0) {
    return []
  }

  const visibleClientIds = clients.map((client) => client.id)
  const projectionMap = await loadClientProjectionMap(supabase, visibleClientIds)

  if (projectionMap) {
    const { data: unreadMessagesData } = await supabase
      .from('client_messages')
      .select('client_id')
      .in('client_id', visibleClientIds)
      .eq('sender_type', 'client')
      .eq('read_by_team', false)

    const unreadMessagesByClient = new Map<string, number>()
    for (const message of unreadMessagesData || []) {
      const messageClientId = message.client_id
      if (!messageClientId) continue
      unreadMessagesByClient.set(messageClientId, (unreadMessagesByClient.get(messageClientId) || 0) + 1)
    }

    for (const client of clients) {
      const summary = projectionMap.get(client.id)
      if (!summary) continue
      client.projects_count = summary.projectsCount
      client.total_revenue = summary.paidRevenue
      client.active_invoices = summary.openInvoicesCount
      client.unread_client_messages = unreadMessagesByClient.get(client.id) || 0
    }

    return clients
  }

  const [
    { data: projectsData },
    { data: invoicesData },
    { data: unreadMessagesData },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('client_id')
      .in('client_id', visibleClientIds),
    supabase
      .from('invoices')
      .select('client_id, total, status')
      .in('client_id', visibleClientIds),
    supabase
      .from('client_messages')
      .select('client_id')
      .in('client_id', visibleClientIds)
      .eq('sender_type', 'client')
      .eq('read_by_team', false),
  ])

  const projectCounts = new Map<string, number>()
  for (const project of projectsData || []) {
    const projectClientId = project.client_id
    if (!projectClientId) continue
    projectCounts.set(projectClientId, (projectCounts.get(projectClientId) || 0) + 1)
  }

  const revenueByClient = new Map<string, number>()
  const activeInvoicesByClient = new Map<string, number>()
  for (const invoice of invoicesData || []) {
    const invoiceClientId = invoice.client_id
    if (!invoiceClientId) continue

    if (invoice.status === 'paid') {
      revenueByClient.set(invoiceClientId, (revenueByClient.get(invoiceClientId) || 0) + (invoice.total || 0))
    }

    if (invoice.status === 'sent' || invoice.status === 'overdue') {
      activeInvoicesByClient.set(invoiceClientId, (activeInvoicesByClient.get(invoiceClientId) || 0) + 1)
    }
  }

  const unreadMessagesByClient = new Map<string, number>()
  for (const message of unreadMessagesData || []) {
    const messageClientId = message.client_id
    if (!messageClientId) continue
    unreadMessagesByClient.set(messageClientId, (unreadMessagesByClient.get(messageClientId) || 0) + 1)
  }

  for (const client of clients) {
    client.projects_count = projectCounts.get(client.id) || 0
    client.total_revenue = revenueByClient.get(client.id) || 0
    client.active_invoices = activeInvoicesByClient.get(client.id) || 0
    client.unread_client_messages = unreadMessagesByClient.get(client.id) || 0
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

  const visibleClientIds = (clients || []).map((client) => client.id)
  const projectionMap = await loadClientProjectionMap(supabase, visibleClientIds)

  if (projectionMap) {
    const total = visibleClientIds.length
    const statusCounts: Record<string, number> = {}
    let totalRevenue = 0
    let pendingAmount = 0

    for (const summary of projectionMap.values()) {
      statusCounts[summary.status] = (statusCounts[summary.status] || 0) + 1
      totalRevenue += summary.paidRevenue
      pendingAmount += summary.outstandingRevenue
    }

    const clientsWithoutStatus = total - Object.values(statusCounts).reduce((a, b) => a + b, 0)

    return {
      total,
      active: statusCounts['active'] || clientsWithoutStatus,
      at_risk: statusCounts['at_risk'] || 0,
      leads: statusCounts['lead'] || 0,
      prospects: statusCounts['prospect'] || 0,
      inactive: statusCounts['inactive'] || 0,
      totalRevenue,
      pendingAmount,
    }
  }

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

  const total = visibleClientIds.length
  
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

export async function getClientInviteDetails(token: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc('get_client_invite_details', {
      p_token: token
    })

    if (error) return null

    const client = Array.isArray(data) ? data[0] : data
    if (!client || !client.email) {
      return null
    }

    return { id: client.client_id, email: client.email, companyName: client.company_name }
  } catch {
    return null
  }
}

export async function acceptClientInvite(
  clientId: string,
  authUserId: string,
  fullName: string,
  inviteEmail?: string
) {
  try {
    const response = await callApiV1<{ client_id: string; user_id: string }>('/clients/invites/accept', {
      method: 'PUT',
      body: {
        client_id: clientId,
        auth_user_id: authUserId,
        full_name: fullName,
        invite_email: inviteEmail || null,
      },
      idempotencyKey: `client-invite-accept-${crypto.randomUUID()}`,
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Error accepting client invite:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Server error accepting invite' }
  }
}
