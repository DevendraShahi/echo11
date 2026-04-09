'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Meeting, Project } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
import { ArrowLeft, Calendar, Clock, Video, MapPin, Users, Edit3, Trash2, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { deleteMeeting, updateMeeting, getProjectsForMeetingForm } from '@/lib/actions/meeting-actions'

interface MeetingPageProps {
  params: Promise<{ id: string }>
}

export default function MeetingDetailPage({ params }: MeetingPageProps) {
  const { id: meetingId } = use(params)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    scheduled_at: '',
    duration_minutes: 30,
    video_link: '',
    location: '',
    notes: '',
  })

  useEffect(() => {
    if (meetingId) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId])

  async function loadData() {
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data: meetingData, error } = await supabase
        .from('meetings')
        .select('*, project:projects(id, name)')
        .eq('id', meetingId)
        .single()

      if (error || !meetingData) {
        console.error('Error fetching meeting:', error)
        setLoading(false)
        return
      }

      setMeeting(meetingData)
      setFormData({
        title: meetingData.title || '',
        description: meetingData.description || '',
        project_id: meetingData.project_id || '',
        scheduled_at: meetingData.scheduled_at ? meetingData.scheduled_at.slice(0, 16) : '',
        duration_minutes: meetingData.duration_minutes || 30,
        video_link: meetingData.video_link || '',
        location: meetingData.location || '',
        notes: meetingData.notes || '',
      })

      const projectsData = await getProjectsForMeetingForm()
      setProjects(projectsData)
    } catch (error) {
      console.error('Error loading meeting:', error)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const result = await updateMeeting(meetingId, {
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
      setIsEditing(false)
      setSaveError(null)
      loadData()
    } else {
      setSaveError(result.error || 'Failed to save changes')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this meeting?')) return
    
    setDeleting(true)
    const result = await deleteMeeting(meetingId)
    
    if (result.success) {
      window.location.href = '/lab/meetings'
    }
    setDeleting(false)
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-rose-400 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Meeting not found</span>
          </div>
          <Link href="/lab/meetings" className="text-accent hover:text-accent/80 transition-colors">
            Back to Meetings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/lab/meetings"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Meetings
        </Link>

        <div className="bg-white/5 border border-white/10 p-6 mb-6">
          {isEditing ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2 font-sans">Project</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                  >
                    <option value="" className="bg-black">No project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="bg-black">{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2 font-sans">Duration</label>
                  <select
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
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
                <label className="block text-sm text-white/70 mb-2 font-sans">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans
                    [&::-webkit-calendar-picker-indicator]:filter:brightness-0
                    [&::-webkit-calendar-picker-indicator]:invert
                    [&::-webkit-calendar-picker-indicator]:opacity-60
                    [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2 font-sans">Video Link</label>
                  <input
                    type="url"
                    value={formData.video_link}
                    onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2 font-sans">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                />
              </div>
              {saveError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-mono">{saveError}</div>}
              <div className="flex gap-3">
                <LabButton onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                  Save Changes
                </LabButton>
                <LabButton variant="ghost" onClick={() => { setIsEditing(false); setSaveError(null) }}>
                  Cancel
                </LabButton>
              </div>
            </div>
          ) : (
            <div>
              {new Date(meeting.scheduled_at) < new Date() && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-sans">
                  <Clock className="w-4 h-4 shrink-0" />
                  This meeting has already taken place.
                </div>
              )}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold text-white font-sans">{meeting.title}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-rose-400 transition-colors"
                  >
                    {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {meeting.description && (
                <p className="text-white/70 whitespace-pre-wrap mb-4">{meeting.description}</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 text-white/70">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-sans">Date</p>
                    <p className="text-sm font-sans">{format(new Date(meeting.scheduled_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-white/70">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-sans">Time</p>
                    <p className="text-sm font-sans">{format(new Date(meeting.scheduled_at), 'h:mm a')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-white/70">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 font-sans">Duration</p>
                    <p className="text-sm font-sans">{meeting.duration_minutes} min</p>
                  </div>
                </div>
                
                {meeting.project && (
                  <div className="flex items-center gap-3 text-white/70">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50 font-sans">Project</p>
                      {meeting.project_id ? (
                        <Link href={`/lab/projects/${meeting.project_id}`} className="text-sm text-accent hover:text-accent/80 transition-colors font-sans">
                          {(meeting.project as { name: string }).name}
                        </Link>
                      ) : (
                        <p className="text-sm font-sans">{(meeting.project as { name: string }).name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10 flex gap-4">
                {meeting.video_link && (
                  <a
                    href={meeting.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-sans"
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                  </a>
                )}
                {meeting.location && (
                  <div className="flex items-center gap-2 text-white/70 font-sans">
                    <MapPin className="w-4 h-4" />
                    {meeting.location}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {meeting.notes && (
          <div className="bg-white/5 border border-white/10 p-6">
            <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide font-sans">Notes</h3>
            <p className="text-white/70 whitespace-pre-wrap">{meeting.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}