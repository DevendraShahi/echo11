'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ClientNote } from '@/types/lab'
import { callApiV1 } from '@/lib/api/v1/internal-client'
import { isApiFailure } from '@/lib/api/v1/contracts'

export type NoteWithUser = ClientNote & { user?: { full_name: string | null; avatar_url: string | null } | null }

export interface CreateNoteParams {
  client_id: string
  content: string
}

function nextIdempotencyKey(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
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
    const createResponse = await callApiV1<{ note_id: string; client_id: string; lock_version: number | null }>(
      `/clients/${params.client_id}/notes`,
      {
        method: 'POST',
        body: { content: params.content },
        idempotencyKey: nextIdempotencyKey('note-create'),
      }
    )

    if (isApiFailure(createResponse)) {
      return { success: false, error: createResponse.error.message }
    }

    const { data: note } = await supabase
      .from('client_notes')
      .select('*, user:profiles(full_name, avatar_url)')
      .eq('id', createResponse.data.note_id)
      .single()

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
    const response = await callApiV1<{ note_id: string; client_id: string }>(`/clients/${clientId}/notes/${noteId}`, {
      method: 'DELETE',
      idempotencyKey: nextIdempotencyKey('note-delete'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
    const response = await callApiV1<{ note_id: string; client_id: string; lock_version: number | null }>(
      `/clients/${clientId}/notes/${noteId}`,
      {
        method: 'PATCH',
        body: { content },
        idempotencyKey: nextIdempotencyKey('note-update'),
      }
    )

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
