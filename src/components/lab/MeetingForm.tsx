'use client'

import { useState, useEffect } from 'react'
import { createMeeting, getProjectsForMeetingForm } from '@/lib/actions/meeting-actions'
import { LabButton } from '@/components/ui/LabButton'
import { X, Loader2, CheckCircle, Projector, Calendar, Clock, Video, MapPin, AlignLeft } from 'lucide-react'
import { Project } from '@/types/lab'

interface MeetingFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultProjectId?: string
}

export function MeetingFormModal({ isOpen, onClose, onSuccess, defaultProjectId }: MeetingFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: defaultProjectId || '',
    scheduled_at: '',
    duration_minutes: 30,
    video_link: '',
    location: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      async function loadData() {
        const projectsData = await getProjectsForMeetingForm()
        setProjects(projectsData)
      }
      loadData()
    }
  }, [isOpen])

  useEffect(() => {
    if (defaultProjectId) {
      setFormData(prev => ({ ...prev, project_id: defaultProjectId }))
    }
  }, [defaultProjectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createMeeting({
      title: formData.title,
      description: formData.description || null,
      project_id: formData.project_id || null,
      scheduled_at: formData.scheduled_at,
      duration_minutes: formData.duration_minutes,
      video_link: formData.video_link || null,
      location: formData.location || null,
      notes: formData.notes || null,
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setFormData({
          title: '',
          description: '',
          project_id: defaultProjectId || '',
          scheduled_at: '',
          duration_minutes: 30,
          video_link: '',
          location: '',
          notes: '',
        })
        onSuccess?.()
        onClose()
      }, 1500)
    } else {
      setError(result.error || 'Failed to create meeting')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-black border border-white/10 rounded-none shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-semibold text-white font-sans">Schedule Meeting</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-none text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-none flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-sans">Meeting Scheduled!</h3>
            <p className="text-white/50">Your meeting has been created.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-none text-rose-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-white/70 mb-2 font-sans">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
                placeholder="Meeting title"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2 font-sans">
                <AlignLeft className="w-4 h-4 inline mr-1.5" />
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all resize-none font-sans"
                placeholder="Meeting agenda..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2 font-sans">
                <Projector className="w-4 h-4 inline mr-1.5" />
                Project
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
              >
                <option value="" className="bg-black">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id} className="bg-black">
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans
                    [&::-webkit-calendar-picker-indicator]:filter:brightness-0
                    [&::-webkit-calendar-picker-indicator]:invert
                    [&::-webkit-calendar-picker-indicator]:opacity-60
                    [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">
                  <Clock className="w-4 h-4 inline mr-1.5" />
                  Duration
                </label>
                <select
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
                >
                  <option value="15" className="bg-black">15 min</option>
                  <option value="30" className="bg-black">30 min</option>
                  <option value="45" className="bg-black">45 min</option>
                  <option value="60" className="bg-black">1 hour</option>
                  <option value="90" className="bg-black">1.5 hours</option>
                  <option value="120" className="bg-black">2 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2 font-sans">
                <Video className="w-4 h-4 inline mr-1.5" />
                Video Link
              </label>
              <input
                type="url"
                value={formData.video_link}
                onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2 font-sans">
                <MapPin className="w-4 h-4 inline mr-1.5" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
                placeholder="Conference room or address"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <LabButton type="button" variant="ghost" onClick={onClose}>
                Cancel
              </LabButton>
              <LabButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Meeting'
                )}
              </LabButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}