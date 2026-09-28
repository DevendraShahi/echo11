'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientDocument } from '@/types/lab'
import { uploadDocument, deleteDocument } from '@/lib/actions/document-actions'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'
import { File, Upload, Trash2, ExternalLink } from 'lucide-react'

interface ClientDocumentsClientProps {
  initialDocuments: ClientDocument[]
  canEdit: boolean
  clientId: string
}

export function ClientDocumentsClient({ initialDocuments, canEdit, clientId }: ClientDocumentsClientProps) {
  const router = useRouter()
  const { confirmAction } = useAppFeedback()
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      alert('File size must be under 10MB')
      e.target.value = ''
      return
    }
    
    setUploading(true)
    const result = await uploadDocument({ client_id: clientId, file })
    setUploading(false)
    
    if (!result?.success && result?.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirmAction('Delete document?', {
      title: 'Delete Document',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!confirmed) return
    
    const result = await deleteDocument(id, clientId)
    if (!result.success) {
      alert(result.error || 'Failed to delete document')
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <label className="cursor-pointer">
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.txt" 
              onChange={handleUpload} 
              disabled={uploading}
            />
            <span className={`inline-flex items-center gap-2 px-4 py-2 border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-colors font-mono text-xs uppercase tracking-wider ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="w-3 h-3" />
              {uploading ? 'Uploading...' : 'Upload'}
            </span>
          </label>
        </div>
      )}
      
      {initialDocuments.length === 0 ? (
        <div className="text-center py-12 text-white/30 font-mono text-sm border border-white/5 bg-[#0a0a0a]">
          No documents yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {initialDocuments.map(doc => (
            <div key={doc.id} className="p-4 bg-[#0a0a0a]">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                    <File className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-mono text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-white/30 font-mono">
                      {doc.file_type?.split('/')[1] || 'file'} · {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}
                    </p>
                  </div>
                </div>
                {canEdit && (
                  <button 
                    onClick={() => handleDelete(doc.id)} 
                    className="p-1 border border-white/10 hover:border-rose-500/30 text-white/40 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <a 
                href={doc.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-accent hover:text-accent/80 font-mono uppercase tracking-wider flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
