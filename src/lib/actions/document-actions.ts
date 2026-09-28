'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { ClientDocument, DocumentCategory } from '@/types/lab'
import { randomBytes } from 'crypto'
import { callApiV1 } from '@/lib/api/v1/internal-client'
import { isApiFailure } from '@/lib/api/v1/contracts'
import { requireAdminOrLead } from './role-helpers'

export interface UploadDocumentParams {
  client_id: string
  file: File
  category?: DocumentCategory
  name?: string
}

function nextIdempotencyKey(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export async function uploadDocument(
  params: UploadDocumentParams
): Promise<{ success: boolean; document?: ClientDocument; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can upload documents' }
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

    const createResponse = await callApiV1<{ document_id: string; client_id: string; lock_version: number | null }>(
      `/clients/${params.client_id}/documents`,
      {
        method: 'POST',
        body: {
          name: params.name || params.file.name,
          file_url: publicUrl,
          file_type: params.file.type,
          file_size: params.file.size,
          storage_path: storagePath,
          category: params.category || 'other',
        },
        idempotencyKey: nextIdempotencyKey('document-create'),
      }
    )

    if (isApiFailure(createResponse)) {
      await browserClient.storage.from('client-documents').remove([storagePath])
      return { success: false, error: createResponse.error.message }
    }

    const { data: document } = await supabase
      .from('client_documents')
      .select('*')
      .eq('id', createResponse.data.document_id)
      .single()

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

  const allowed = await requireAdminOrLead(user.id)
  if (!allowed) {
    return { success: false, error: 'Only admins or team leads can delete documents' }
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

    const deleteResponse = await callApiV1<{ document_id: string; client_id: string; storage_path: string | null }>(
      `/clients/${clientId}/documents/${documentId}`,
      {
        method: 'DELETE',
        idempotencyKey: nextIdempotencyKey('document-delete'),
      }
    )

    if (isApiFailure(deleteResponse)) {
      return { success: false, error: deleteResponse.error.message }
    }

    const browserClient = createBrowserClient()
    const storagePath = deleteResponse.data.storage_path || document.storage_path

    if (storagePath) {
      const { error: storageRemoveError } = await browserClient.storage
        .from('client-documents')
        .remove([storagePath])

      if (storageRemoveError) {
        console.warn('Document row deleted but storage cleanup failed:', storageRemoveError)
      }
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
