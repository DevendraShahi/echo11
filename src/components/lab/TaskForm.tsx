'use client'

import { useState, useEffect } from 'react'
import { createTask, getProjectsForTaskForm, getTeamMembers } from '@/lib/actions/task-actions'
import { LabButton } from '@/components/ui/LabButton'
import { X, Loader2, CheckCircle, Projector, User, Calendar, Flag, AlignLeft } from 'lucide-react'
import { Project, Profile, TaskStatus, TaskPriority } from '@/types/lab'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultProjectId?: string
  defaultStatus?: TaskStatus
}

export function TaskFormModal({ isOpen, onClose, onSuccess, defaultProjectId, defaultStatus }: TaskFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([])
  const [members, setMembers] = useState<Pick<Profile, 'id' | 'full_name'>[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: defaultProjectId || '',
    status: defaultStatus || 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee_id: '',
    due_date: '',
  })

  useEffect(() => {
    if (isOpen) {
      async function loadData() {
        const [projectsData, membersData] = await Promise.all([
          getProjectsForTaskForm(),
          getTeamMembers()
        ])
        setProjects(projectsData)
        setMembers(membersData)
      }
      loadData()
    }
  }, [isOpen])

  useEffect(() => {
    if (defaultProjectId) {
      setFormData(prev => ({ ...prev, project_id: defaultProjectId }))
    }
    if (defaultStatus) {
      setFormData(prev => ({ ...prev, status: defaultStatus }))
    }
  }, [defaultProjectId, defaultStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createTask({
      title: formData.title,
      description: formData.description || null,
      project_id: formData.project_id,
      status: formData.status,
      priority: formData.priority,
      assignee_id: formData.assignee_id || null,
      due_date: formData.due_date || null,
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setFormData({
          title: '',
          description: '',
          project_id: defaultProjectId || '',
          status: defaultStatus || 'todo',
          priority: 'medium',
          assignee_id: '',
          due_date: '',
        })
        onSuccess?.()
        onClose()
      }, 1500)
    } else {
      setError(result.error || 'Failed to create task')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-black border border-white/10 rounded-none shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-semibold text-white font-sans">Create New Task</h2>
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
            <h3 className="text-xl font-semibold text-white mb-2 font-sans">Task Created!</h3>
            <p className="text-white/50">Your task has been added to the board.</p>
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
                placeholder="Task title"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2 font-sans">
                <AlignLeft className="w-4 h-4 inline mr-1.5" />
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all resize-none font-sans"
                placeholder="Add more details..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2 font-sans">
                <Projector className="w-4 h-4 inline mr-1.5" />
                Project *
              </label>
              <select
                required
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
              >
                <option value="" className="bg-black">Select a project</option>
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
                  <Flag className="w-4 h-4 inline mr-1.5" />
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
                >
                  <option value="low" className="bg-black">Low</option>
                  <option value="medium" className="bg-black">Medium</option>
                  <option value="high" className="bg-black">High</option>
                  <option value="urgent" className="bg-black">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">
                  <User className="w-4 h-4 inline mr-1.5" />
                  Assignee
                </label>
                <select
                  value={formData.assignee_id}
                  onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
                >
                  <option value="" className="bg-black">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id} className="bg-black">
                      {member.full_name || 'Unnamed'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-sans"
                >
                  <option value="todo" className="bg-black">To Do</option>
                  <option value="in_progress" className="bg-black">In Progress</option>
                  <option value="review" className="bg-black">Review</option>
                  <option value="done" className="bg-black">Done</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <LabButton type="button" variant="ghost" onClick={onClose}>
                Cancel
              </LabButton>
              <LabButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </LabButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}