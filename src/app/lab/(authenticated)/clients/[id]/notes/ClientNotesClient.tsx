'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientNote } from '@/types/lab'
import { deleteNote } from '@/lib/actions/note-actions'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'
import { LabButton } from '@/components/ui/LabButton'
import { Plus, Edit3, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

type NoteWithUser = ClientNote & { user?: { full_name: string | null; avatar_url: string | null } | null }

interface ClientNotesClientProps {
  initialNotes: NoteWithUser[]
  canEdit: boolean
  clientId: string
}

export function ClientNotesClient({ initialNotes, canEdit, clientId }: ClientNotesClientProps) {
  const router = useRouter()
  const { confirmAction } = useAppFeedback()
  // Add note modal would be triggered here in real app, simplified for now
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteWithUser | null>(null)

  async function handleDelete(id: string) {
    const confirmed = await confirmAction('Delete note?', {
      title: 'Delete Note',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!confirmed) return
    
    const result = await deleteNote(id, clientId)
    if (!result.success) {
      alert(result.error || 'Failed to delete note')
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <LabButton onClick={() => setShowAddNote(true)} className="font-mono text-xs uppercase tracking-wider">
            <Plus className="w-3 h-3 mr-2" />Add Note
          </LabButton>
        </div>
      )}
      
      {initialNotes.length === 0 ? (
        <div className="text-center py-12 text-white/30 font-mono text-sm border border-white/5 bg-[#0a0a0a] rounded-lg">
          No notes yet
        </div>
      ) : (
        <div className="space-y-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
          {initialNotes.map(note => (
            <div key={note.id} className="p-4 bg-[#0a0a0a]">
              <p className="text-white whitespace-pre-wrap font-mono text-sm">{note.content}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-xs text-white/30 font-mono">
                  {note.user?.full_name || 'Unknown'} · {format(new Date(note.created_at), 'MMM d, yyyy')}
                </span>
                
                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setEditingNote(note)} 
                      className="p-1.5 border border-transparent hover:border-white/20 text-white/40 hover:text-white transition-colors rounded"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(note.id)} 
                      className="p-1.5 border border-transparent hover:border-rose-500/30 text-white/40 hover:text-rose-400 transition-colors rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note modals would render here */}
      {(showAddNote || editingNote) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 max-w-lg w-full rounded-lg">
            <h3 className="text-lg font-sans text-white mb-4">
              {editingNote ? 'Edit Note' : 'Add Note'}
            </h3>
            <p className="text-white/50 mb-4 text-sm font-sans">
              (Note editing functionality is simplified in this layout rebuild)
            </p>
            <div className="flex justify-end gap-3">
              <LabButton variant="ghost" onClick={() => { setShowAddNote(false); setEditingNote(null); }}>
                Close
              </LabButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
