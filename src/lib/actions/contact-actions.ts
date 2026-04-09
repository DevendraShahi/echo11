'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ClientContact, ContactRole } from '@/types/lab'
import { requireAdminOrLead } from './role-helpers'

export interface CreateContactParams {
  client_id: string
  name: string
  email?: string
  phone?: string
  role?: ContactRole
  is_primary?: boolean
  notes?: string
}

export interface UpdateContactParams {
  name?: string
  email?: string
  phone?: string
  role?: ContactRole
  is_primary?: boolean
  notes?: string
}

export async function createContact(
  params: CreateContactParams
): Promise<{ success: boolean; contact?: ClientContact; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can add contacts' }
  }

  if (!params.name?.trim()) {
    return { success: false, error: 'Contact name is required' }
  }

  try {
    if (params.is_primary) {
      await supabase
        .from('client_contacts')
        .update({ is_primary: false })
        .eq('client_id', params.client_id)
    }

    const { data: contact, error } = await supabase
      .from('client_contacts')
      .insert({
        client_id: params.client_id,
        name: params.name.trim(),
        email: params.email || undefined,
        phone: params.phone || undefined,
        role: params.role || undefined,
        is_primary: params.is_primary || false,
        notes: params.notes || undefined
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      return { success: false, error: error.message }
    }

    await supabase.from('activities').insert({
      user_id: user.id,
      action: `added contact ${params.name}`,
      entity_type: 'client',
      entity_id: params.client_id,
      metadata: { contact_name: params.name }
    })

    revalidatePath(`/lab/clients/${params.client_id}`)
    revalidatePath('/lab/clients')

    return { success: true, contact: contact as ClientContact }
  } catch (error) {
    console.error('Error creating contact:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateContact(
  contactId: string,
  clientId: string,
  params: UpdateContactParams
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can update contacts' }
  }

  if (params.name !== undefined && !params.name.trim()) {
    return { success: false, error: 'Contact name cannot be empty' }
  }

  try {
    if (params.is_primary) {
      await supabase
        .from('client_contacts')
        .update({ is_primary: false })
        .eq('client_id', clientId)
    }

    const { error } = await supabase
      .from('client_contacts')
      .update({
        name: params.name,
        email: params.email || undefined,
        phone: params.phone || undefined,
        role: params.role || undefined,
        is_primary: params.is_primary || false,
        notes: params.notes || undefined
      })
      .eq('id', contactId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
    revalidatePath('/lab/clients')
    return { success: true }
  } catch (error) {
    console.error('Error updating contact:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteContact(
  contactId: string,
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can delete contacts' }
  }

  try {
    // Prevent deleting primary contact if others exist
    const { data: contactToDelete } = await supabase
      .from('client_contacts')
      .select('is_primary')
      .eq('id', contactId)
      .single()

    if (contactToDelete?.is_primary) {
      const { count } = await supabase
        .from('client_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)

      if ((count ?? 0) > 1) {
        return { success: false, error: 'Cannot delete the primary contact while other contacts exist. Assign a new primary first.' }
      }
    }

    const { error } = await supabase
      .from('client_contacts')
      .delete()
      .eq('id', contactId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
    revalidatePath('/lab/clients')
    return { success: true }
  } catch (error) {
    console.error('Error deleting contact:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function setPrimaryContact(
  contactId: string,
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can change primary contacts' }
  }

  try {
    await supabase
      .from('client_contacts')
      .update({ is_primary: false })
      .eq('client_id', clientId)

    const { error } = await supabase
      .from('client_contacts')
      .update({ is_primary: true })
      .eq('id', contactId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
    revalidatePath('/lab/clients')
    return { success: true }
  } catch (error) {
    console.error('Error setting primary contact:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
