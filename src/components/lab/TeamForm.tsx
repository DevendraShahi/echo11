'use client'

import { useState, useEffect } from 'react'
import { createTeam, updateTeam, deleteTeam } from '@/lib/actions/team-actions'
import { LabButton } from '@/components/ui/LabButton'
import { Team } from '@/types/lab'
import { X, Trash2 } from 'lucide-react'

interface TeamFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onDelete?: () => void
  editTeam?: Team | null
}

const TEAM_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
]

export function TeamFormModal({ isOpen, onClose, onSuccess, onDelete, editTeam }: TeamFormModalProps) {
  const [name, setName] = useState(editTeam?.name || '')
  const [description, setDescription] = useState(editTeam?.description || '')
  const [color, setColor] = useState(editTeam?.color || '#6366F1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(editTeam?.name || '')
    setDescription(editTeam?.description || '')
    setColor(editTeam?.color || '#6366F1')
    setError(null)
  }, [editTeam])

  if (!isOpen) return null

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      let result
      if (editTeam) {
        result = await updateTeam(editTeam.id, { name, description, color })
      } else {
        result = await createTeam({ name, description, color })
      }
      setLoading(false)
      if (result?.success) {
        onSuccess()
        onClose()
      } else {
        setError(result?.error || 'Failed to save team')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
      setError('An unexpected error occurred.')
    }
  }

  async function handleDelete() {
    if (!editTeam || !confirm('Are you sure you want to delete this team?')) return
    setLoading(true)
    const result = await deleteTeam(editTeam.id)
    setLoading(false)
    if (result.success) {
      if (onDelete) onDelete()
      else onSuccess()
      onClose()
    } else {
      setError(result.error || 'Failed to delete team')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10">
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <h3 className="text-sm font-mono uppercase tracking-wider text-white">
            {editTeam ? 'Edit Team' : 'Create Team'}
          </h3>
          <button onClick={onClose} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 space-y-4" onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            if (!loading && name.trim()) handleSubmit()
          }
        }}>
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Team Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Engineering Team"
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the team..."
              className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {TEAM_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-rose-400 font-mono">{error}</p>}

          <div className="flex gap-2 pt-2">
            {editTeam && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="p-2 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <LabButton type="button" variant="ghost" onClick={onClose} className="flex-1 font-mono text-xs uppercase tracking-wider">
              Cancel
            </LabButton>
            <LabButton 
              type="button" 
              onClick={(e) => {
                e.preventDefault()
                handleSubmit()
              }} 
              disabled={loading || !name.trim()} 
              className="flex-1 font-mono text-xs uppercase tracking-wider"
            >
              {loading ? 'Saving...' : editTeam ? 'Update Team' : 'Create Team'}
            </LabButton>
          </div>
        </div>
      </div>
    </div>
  )
}