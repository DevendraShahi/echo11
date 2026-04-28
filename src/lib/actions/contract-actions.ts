'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Contract, ContractTemplate, ContractStatus, ClientLifecycleStatus } from '@/types/lab'
import { generateContractPDFBlob } from '@/lib/contract-pdf'
import { substituteVariables, getDefaultVariables } from '@/lib/contract-template-engine'
import { sendContractEmail } from '@/lib/email'
import { createNotification } from './notification-actions'
import { requireAdminOrLead } from './role-helpers'
import { revalidateClientSurface, revalidateLegacyPortalSurface } from './client-surface-revalidate'

export interface CreateContractParams {
  client_id: string
  title: string
  template_id?: string
  status?: ContractStatus
  value?: number
  start_date?: string
  end_date?: string
  notes?: string
}

export interface UpdateContractParams {
  title?: string
  status?: ContractStatus
  value?: number
  start_date?: string
  end_date?: string
  notes?: string
}

const CONTRACTS_BUCKET = 'contracts'
const CONTRACTS_PUBLIC_PREFIX = '/storage/v1/object/public/contracts/'
const CONTRACTS_SIGNED_PREFIX = '/storage/v1/object/sign/contracts/'

function extractStoragePathFromContractUrl(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null

  const [urlWithoutQuery] = fileUrl.split('?')

  if (urlWithoutQuery.includes(CONTRACTS_PUBLIC_PREFIX)) {
    return decodeURIComponent(urlWithoutQuery.split(CONTRACTS_PUBLIC_PREFIX)[1] || '')
  }

  if (urlWithoutQuery.includes(CONTRACTS_SIGNED_PREFIX)) {
    return decodeURIComponent(urlWithoutQuery.split(CONTRACTS_SIGNED_PREFIX)[1] || '')
  }

  return null
}

async function resolveContractAccessUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fileUrl: string | null | undefined
): Promise<string | null> {
  if (!fileUrl) return null

  const storagePath = extractStoragePathFromContractUrl(fileUrl)
  if (!storagePath) return fileUrl

  const { data: signedData } = await supabase.storage
    .from(CONTRACTS_BUCKET)
    .createSignedUrl(storagePath, 60 * 60)

  if (signedData?.signedUrl) {
    return signedData.signedUrl
  }

  const { data: publicData } = supabase.storage
    .from(CONTRACTS_BUCKET)
    .getPublicUrl(storagePath)

  return publicData.publicUrl || fileUrl
}

async function hydrateContractFileUrls<T extends { file_url: string | null }>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contracts: T[]
): Promise<T[]> {
  if (contracts.length === 0) return contracts

  return Promise.all(
    contracts.map(async (contract) => ({
      ...contract,
      file_url: await resolveContractAccessUrl(supabase, contract.file_url),
    }))
  )
}

async function generateContractNumber(): Promise<string> {
  const supabase = await createClient()
  const year = new Date().getFullYear()
  
  const { count } = await supabase
    .from('contracts')
    .select('*', { count: 'exact', head: true })
    .ilike('contract_number', `CTR-${year}-%`)

  const nextNum = (count || 0) + 1
  return `CTR-${year}-${String(nextNum).padStart(3, '0')}`
}

export async function createContract(
  params: CreateContractParams
): Promise<{ success: boolean; contract?: Contract; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can create contracts' }
  }

  try {
    const contractNumber = await generateContractNumber()

    const { data: contract, error } = await supabase
      .from('contracts')
      .insert({
        client_id: params.client_id,
        title: params.title,
        contract_number: contractNumber,
        template_id: params.template_id || null,
        status: params.status || 'draft',
        value: params.value || null,
        start_date: params.start_date || null,
        end_date: params.end_date || null,
        notes: params.notes || null,
        created_by: user.id
      })
      .select('*, client:clients(company_name, contact_name, email, address, phone), template:contract_templates(name, category, content, variables)')
      .single()

    if (error) {
      console.error('Error creating contract:', error)
      return { success: false, error: error.message }
    }

    await supabase.from('activities').insert({
      user_id: user.id,
      action: `created contract ${params.title}`,
      entity_type: 'contract',
      entity_id: contract.id,
      metadata: { client_id: params.client_id, title: params.title, contract_number: contractNumber }
    })

    // Notify team members (actor's team) about new contract
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single()

      if (profile?.team_id) {
        const { data: members } = await supabase
          .from('profiles')
          .select('id')
          .eq('team_id', profile.team_id)

        await Promise.all(
          (members || [])
            .filter(m => m.id !== user.id)
            .map(m => createNotification({
              userId: m.id,
              type: 'contract',
              title: 'New Contract Created',
              message: params.title,
              link: `/lab/contracts/${contract.id}`
            }))
        )
      }
    } catch (notifyErr) {
      console.warn('Failed to dispatch contract notifications', notifyErr)
    }

    revalidatePath(`/lab/clients/${params.client_id}`)
    revalidatePath('/lab/contracts')
    revalidateClientSurface()
    revalidateLegacyPortalSurface()
    return { success: true, contract: contract as Contract }
  } catch (error) {
    console.error('Error creating contract:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateContract(
  contractId: string,
  clientId: string,
  params: UpdateContractParams
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can update contracts' }
  }

  try {
    const { data: oldContract } = await supabase
      .from('contracts')
      .select('status, title, created_by')
      .eq('id', contractId)
      .single()

    const { error } = await supabase
      .from('contracts')
      .update({
        title: params.title,
        status: params.status,
        value: params.value,
        start_date: params.start_date,
        end_date: params.end_date,
        notes: params.notes
      })
      .eq('id', contractId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Notify creator and team on status change
    if (params.status && oldContract && params.status !== oldContract.status) {
      try {
        const targets = new Set<string>()
        if (oldContract.created_by) targets.add(oldContract.created_by)

        const { data: profile } = await supabase
          .from('profiles')
          .select('team_id')
          .eq('id', user.id)
          .single()

        if (profile?.team_id) {
          const { data: members } = await supabase
            .from('profiles')
            .select('id')
            .eq('team_id', profile.team_id)
          members?.forEach(m => targets.add(m.id))
        }

        targets.delete(user.id)

        await Promise.all(
          Array.from(targets).map(targetId =>
            createNotification({
              userId: targetId,
              type: 'contract',
              title: `${oldContract.title} status updated`,
              message: `Status changed to ${params.status}`,
              link: `/lab/contracts/${contractId}`
            })
          )
        )
      } catch (notifyErr) {
        console.warn('Failed to dispatch contract status notifications', notifyErr)
      }
    }

    revalidatePath(`/lab/clients/${clientId}`)
    revalidatePath('/lab/contracts')
    revalidateClientSurface()
    revalidateLegacyPortalSurface()
    return { success: true }
  } catch (error) {
    console.error('Error updating contract:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateContractStatus(
  contractId: string,
  status: ContractStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can update contract status' }
  }

  try {
    const updateData: Record<string, unknown> = { status }
    
    if (status === 'signed') {
      updateData.signed_at = new Date().toISOString()
    } else if (status === 'pending') {
      updateData.sent_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', contractId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/contracts/${contractId}`)
    revalidatePath('/lab/contracts')
    revalidateClientSurface()
    revalidateLegacyPortalSurface()
    return { success: true }
  } catch (error) {
    console.error('Error updating contract status:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteContract(
  contractId: string,
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can delete contracts' }
  }

  try {
    const { data: contract } = await supabase
      .from('contracts')
      .select('file_url')
      .eq('id', contractId)
      .single()

    if (contract?.file_url) {
      const storagePath = extractStoragePathFromContractUrl(contract.file_url)
      if (storagePath) {
        const { error: removeError } = await supabase.storage
          .from(CONTRACTS_BUCKET)
          .remove([storagePath])

        if (removeError) {
          console.warn('Failed to remove contract file from storage:', removeError)
        }
      }
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', contractId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
    revalidatePath('/lab/contracts')
    revalidateClientSurface()
    revalidateLegacyPortalSurface()
    return { success: true }
  } catch (error) {
    console.error('Error deleting contract:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getContractTemplates(): Promise<ContractTemplate[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  return (data || []) as ContractTemplate[]
}

export async function getContractTemplate(
  templateId: string
): Promise<ContractTemplate | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  return data as ContractTemplate | null
}

export async function uploadContractFile(
  contractId: string,
  file: File
): Promise<{ success: boolean; fileUrl?: string; fileName?: string; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can upload contract files' }
  }

  try {
    const fileExt = file.name.split('.').pop() || 'pdf'
    const storagePath = `${contractId}/${Date.now()}.${fileExt}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(CONTRACTS_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: file.type || 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(CONTRACTS_BUCKET)
      .getPublicUrl(storagePath)

    const { error: dbError } = await supabase
      .from('contracts')
      .update({ file_url: publicUrl, file_name: file.name })
      .eq('id', contractId)

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    revalidatePath(`/lab/contracts/${contractId}`)
    revalidatePath('/lab/contracts')
    revalidateClientSurface()
    revalidateLegacyPortalSurface()
    return {
      success: true,
      fileUrl: await resolveContractAccessUrl(supabase, publicUrl) || publicUrl,
      fileName: file.name,
    }
  } catch (error) {
    console.error('Error uploading contract file:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function generateContractFromTemplate(
  contractId: string
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can generate contract documents' }
  }

  try {
    const { data: contract } = await supabase
      .from('contracts')
      .select(`
        *,
        client:clients(company_name, contact_name, email, address, phone),
        template:contract_templates(name, category, content, variables)
      `)
      .eq('id', contractId)
      .single()

    if (!contract || !contract.template) {
      return { success: false, error: 'Contract or template not found' }
    }

    const client = contract.client as { company_name: string; contact_name: string; email: string; address: string; phone: string } | null

    const variables = getDefaultVariables()
    const filledVariables = {
      company_name: client?.company_name || variables.company_name,
      client_name: client?.contact_name || variables.client_name,
      client_email: client?.email || variables.client_email,
      client_address: client?.address || variables.client_address,
      client_phone: client?.phone || variables.client_phone,
      contract_title: contract.contract_number || contract.title,
      project_name: '',
      date: new Date().toISOString().split('T')[0],
      start_date: contract.start_date || variables.start_date,
      end_date: contract.end_date || variables.end_date,
      value: contract.value?.toString() || variables.value,
      notes: contract.notes || variables.notes
    }

    const filledContent = substituteVariables(contract.template.content, filledVariables)

    const { error: contentError } = await supabase
      .from('contracts')
      .update({ generated_content: filledContent })
      .eq('id', contractId)

    if (contentError) {
      return { success: false, error: contentError.message }
    }

    const pdfBlob = await generateContractPDFBlob({
      contractNumber: contract.contract_number || contract.title,
      title: contract.title,
      companyName: client?.company_name || 'Echo11',
      clientName: client?.contact_name || '',
      clientEmail: client?.email || '',
      clientAddress: client?.address || '',
      clientPhone: client?.phone || '',
      startDate: contract.start_date || '',
      endDate: contract.end_date || '',
      value: contract.value || 0,
      content: filledContent,
      notes: contract.notes || ''
    })

    const storagePath = `${contractId}/contract.pdf`
    const fileBuffer = Buffer.from(await pdfBlob.arrayBuffer())
    const { error: uploadError } = await supabase.storage
      .from(CONTRACTS_BUCKET)
      .upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(CONTRACTS_BUCKET)
      .getPublicUrl(storagePath)

    const { error: dbError } = await supabase
      .from('contracts')
      .update({ file_url: publicUrl, file_name: `${contract.title.replace(/\s+/g, '-').toLowerCase()}.pdf` })
      .eq('id', contractId)

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    revalidatePath(`/lab/contracts/${contractId}`)
    revalidatePath('/lab/contracts')
    revalidateClientSurface()
    revalidateLegacyPortalSurface()
    return {
      success: true,
      fileUrl: await resolveContractAccessUrl(supabase, publicUrl) || publicUrl,
    }
  } catch (error) {
    console.error('Error generating contract PDF:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getContractDownloadUrl(
  contractId: string
): Promise<string | null> {
  const supabase = await createClient()

  const { data: contract } = await supabase
    .from('contracts')
    .select('file_url')
    .eq('id', contractId)
    .single()

  return resolveContractAccessUrl(supabase, contract?.file_url || null)
}

export async function sendContractToClient(
  contractId: string,
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can send contracts to clients' }
  }

  try {
    const { data: contract } = await supabase
      .from('contracts')
      .select(`
        *,
        client:clients(company_name, contact_name, email)
      `)
      .eq('id', contractId)
      .single()

    if (!contract) {
      return { success: false, error: 'Contract not found' }
    }

    const client = contract.client as { company_name: string; contact_name: string; email: string } | null
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://echo11.tech'
    const clientPortalBase = process.env.NEXT_PUBLIC_CLIENT_URL || `${appBaseUrl}/client`
    const contractUrl = `${clientPortalBase}/contracts`

    const emailResult = await sendContractEmail({
      to: recipientEmail,
      clientName: client?.contact_name || 'Client',
      companyName: client?.company_name || 'Echo11',
      contractTitle: contract.title,
      contractValue: contract.value,
      contractUrl
    })

    if (!emailResult.success) {
      return { success: false, error: emailResult.error }
    }

    await supabase
      .from('contracts')
      .update({ sent_at: new Date().toISOString(), status: 'pending' })
      .eq('id', contractId)

    revalidatePath(`/lab/contracts/${contractId}`)
    revalidatePath('/lab/contracts')
    revalidateClientSurface()
    revalidateLegacyPortalSurface()
    return { success: true }
  } catch (error) {
    console.error('Error sending contract:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function autoExpireContracts(): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('contracts')
    .update({ status: 'expired' })
    .in('status', ['signed', 'pending'])
    .lt('end_date', new Date().toISOString().split('T')[0])
}

export async function getContractsWithClients(): Promise<Contract[]> {
  const supabase = await createClient()
  
  await autoExpireContracts()

  const { data } = await supabase
    .from('contracts')
    .select(`
      *,
      client:clients(company_name, contact_name, email),
      template:contract_templates(name, category)
    `)
    .order('created_at', { ascending: false })

  return hydrateContractFileUrls(supabase, (data || []) as Contract[])
}

export async function getContractDetail(contractId: string): Promise<Contract | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('contracts')
    .select(`
      *,
      client:clients(company_name, contact_name, email, address, phone),
      template:contract_templates(name, category, content, variables)
    `)
    .eq('id', contractId)
    .single()

  if (!data) return null

  const [contract] = await hydrateContractFileUrls(supabase, [data as Contract])
  return contract || null
}

export async function getContractsByClientId(clientId: string): Promise<Contract[]> {
  const supabase = await createClient()

  await autoExpireContracts()

  const { data } = await supabase
    .from('contracts')
    .select(`
      *,
      client:clients(company_name, contact_name),
      template:contract_templates(name, category)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  return hydrateContractFileUrls(supabase, (data || []) as Contract[])
}

export async function updateClientStatus(
  clientId: string,
  status: ClientLifecycleStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('client_statuses')
      .insert({
        client_id: clientId,
        status,
        notes: notes || null,
        changed_by: user.id
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
    revalidateClientSurface()
    revalidateLegacyPortalSurface()
    return { success: true }
  } catch (error) {
    console.error('Error updating client status:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getClientStatusHistory(
  clientId: string
): Promise<{ id: string; status: ClientLifecycleStatus; changed_at: string; notes: string | null }[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('client_statuses')
    .select('id, status, changed_at, notes')
    .eq('client_id', clientId)
    .order('changed_at', { ascending: false })

  return data || []
}

export async function getClientCurrentStatus(
  clientId: string
): Promise<ClientLifecycleStatus | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('client_statuses')
    .select('status')
    .eq('client_id', clientId)
    .order('changed_at', { ascending: false })
    .limit(1)
    .single()

  return data?.status || null
}
