'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { ClientDocument, DocumentCategory } from '@/types/lab'
import { randomBytes } from 'crypto'

export interface UploadDocumentParams {
  client_id: string
  file: File
  category?: DocumentCategory
  name?: string
}

export async function uploadDocument(
  params: UploadDocumentParams
): Promise<{ success: boolean; document?: ClientDocument; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const browserClient = createBrowserClient()
    
    const fileExt = params.file.name.split('.').pop()
    const fileName = `${randomBytes(16).toString('hex')}.${fileExt}`
    const storagePath = `clients/${params.client_id}/${fileName}`

    const { error: uploadError } = await browserClient.storage
      .from('client-documents')
      .upload(storagePath, params.file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return { success: false, error: uploadError.message }
    }

    const { data: { publicUrl } } = browserClient.storage
      .from('client-documents')
      .getPublicUrl(storagePath)

    const { data: document, error: dbError } = await supabase
      .from('client_documents')
      .insert({
        client_id: params.client_id,
        name: params.name || params.file.name,
        file_url: publicUrl,
        file_type: params.file.type,
        file_size: params.file.size,
        storage_path: storagePath,
        category: params.category || 'other',
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving document:', dbError)
      await browserClient.storage.from('client-documents').remove([storagePath])
      return { success: false, error: dbError.message }
    }

    await supabase.from('activities').insert({
      user_id: user.id,
      action: `uploaded document ${params.name || params.file.name}`,
      entity_type: 'client',
      entity_id: params.client_id,
      metadata: { document_name: params.name || params.file.name }
    })

    revalidatePath(`/lab/clients/${params.client_id}`)

    return { success: true, document: document as ClientDocument }
  } catch (error) {
    console.error('Error uploading document:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteDocument(
  documentId: string,
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { data: document, error: fetchError } = await supabase
      .from('client_documents')
      .select('storage_path, name')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return { success: false, error: 'Document not found' }
    }

    const browserClient = createBrowserClient()
    if (document.storage_path) {
      await browserClient.storage
        .from('client-documents')
        .remove([document.storage_path])
    }

    const { error: deleteError } = await supabase
      .from('client_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    revalidatePath(`/lab/clients/${clientId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getClientDocuments(
  clientId: string
): Promise<ClientDocument[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('client_documents')
    .select('*, user:profiles(full_name, avatar_url)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  return (data || []) as ClientDocument[]
}
