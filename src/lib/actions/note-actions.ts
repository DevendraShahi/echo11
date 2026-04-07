'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ClientNote } from '@/types/lab'

export type NoteWithUser = ClientNote & { user?: { full_name: string | null; avatar_url: string | null } | null }

export interface CreateNoteParams {
  client_id: string
  content: string
}

export async function createNote(
  params: CreateNoteParams
): Promise<{ success: boolean; note?: ClientNote; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { data: note, error } = await supabase
      .from('client_notes')
      .insert({
        client_id: params.client_id,
        content: params.content,
        created_by: user.id
      })
      .select('*, user:profiles(full_name, avatar_url)')
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return { success: false, error: error.message }
    }

    await supabase.from('activities').insert({
      user_id: user.id,
      action: 'added a note',
      entity_type: 'client',
      entity_id: params.client_id
    })

    revalidatePath(`/lab/clients/${params.client_id}`)

    return { success: true, note: note as ClientNote }
  } catch (error) {
    console.error('Error creating note:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteNote(
  noteId: string,
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('client_notes')
      .delete()
      .eq('id', noteId)
      .eq('created_by', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting note:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateNote(
  noteId: string,
  clientId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('client_notes')
      .update({ content })
      .eq('id', noteId)
      .eq('created_by', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating note:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getClientNotes(
  clientId: string
): Promise<NoteWithUser[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('client_notes')
    .select('*, user:profiles(full_name, avatar_url)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  return (data || []) as NoteWithUser[]
}
