'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ClientContact, ContactRole } from '@/types/lab'

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
        name: params.name,
        email: params.email || null,
        phone: params.phone || null,
        role: params.role || null,
        is_primary: params.is_primary || false,
        notes: params.notes || null
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
        email: params.email || null,
        phone: params.phone || null,
        role: params.role || null,
        is_primary: params.is_primary || false,
        notes: params.notes || null
      })
      .eq('id', contactId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
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

  try {
    const { error } = await supabase
      .from('client_contacts')
      .delete()
      .eq('id', contactId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
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
    return { success: true }
  } catch (error) {
    console.error('Error setting primary contact:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
