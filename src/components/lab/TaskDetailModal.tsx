'use client'
/* eslint-disable jsx-a11y/alt-text */

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateTask, deleteTask, addTaskComment, deleteTaskComment, logTime, getTeamMembers, uploadTaskAttachment, deleteTaskAttachment } from '@/lib/actions/task-actions'
import { LabButton } from '@/components/ui/LabButton'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'
import { X, Loader2, Trash2, Clock, MessageSquare, User, Projector, Send, Plus, Paperclip, Download, File, Image, FileText, Eye } from 'lucide-react'
import { Task, TaskStatus, TaskPriority, TaskComment, TimeLog, Profile, TaskAttachment } from '@/types/lab'
import { format } from 'date-fns'

interface TaskDetailModalProps {
  taskId: string
  isOpen: boolean
  onClose: () => void
  onDelete?: () => void
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done'
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  high: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
  urgent: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400',
}

export function TaskDetailModal({ taskId, isOpen, onClose, onDelete }: TaskDetailModalProps) {
  const { confirmAction } = useAppFeedback()
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'time' | 'files'>('details')
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee_id: '',
    due_date: '',
  })
  
  const [newComment, setNewComment] = useState('')
  const [newTimeLog, setNewTimeLog] = useState({ hours: '', date: '', notes: '' })
  const [members, setMembers] = useState<Pick<Profile, 'id' | 'full_name'>[]>([])

  useEffect(function() {
    if (isOpen && taskId) {
      loadData() // eslint-disable-line react-hooks/exhaustive-deps
    }
  }, [isOpen, taskId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true)
    console.log('Starting loadData for taskId:', taskId)
    try {
      const supabase = createClient()
      
      const [taskResult, commentsData, timeLogsData, attachmentsData] = await Promise.all([
        supabase.from('tasks').select('*, project:projects(id, name), assignee:profiles(id, full_name, avatar_url)').eq('id', taskId).single(),
        supabase.from('task_comments').select('*, user:profiles(id, full_name, avatar_url)').eq('task_id', taskId).order('created_at', { ascending: false }),
        supabase.from('time_logs').select('*, user:profiles(id, full_name, avatar_url)').eq('task_id', taskId).order('date', { ascending: false }),
        supabase.from('task_attachments').select('*, user:profiles(id, full_name, avatar_url)').eq('task_id', taskId).order('created_at', { ascending: false })
      ])

      console.log('Task query result:', taskResult)

      if (taskResult.data) {
        console.log('Setting task data:', taskResult.data)
        setTask(taskResult.data)
        setFormData({
          title: taskResult.data.title || '',
          description: taskResult.data.description || '',
          status: taskResult.data.status || 'todo',
          priority: taskResult.data.priority || 'medium',
          assignee_id: taskResult.data.assignee_id || '',
          due_date: taskResult.data.due_date ? taskResult.data.due_date.split('T')[0] : '',
        })
      } else if (taskResult.error) {
        console.error('Task query error:', taskResult.error)
      }

      setComments(commentsData.data || [])
      setTimeLogs(timeLogsData.data || [])
      setAttachments(attachmentsData.data || [])

      const membersData = await getTeamMembers()
      setMembers(membersData)
    } catch (error) {
      console.error('Error loading task:', error)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const result = await updateTask(taskId, {
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      assignee_id: formData.assignee_id || null,
      due_date: formData.due_date || null,
    })

    if (result.success) {
      setIsEditing(false)
      loadData()
    }
    setSaving(false)
  }

  async function handleDelete() {
    const confirmed = await confirmAction('Are you sure you want to delete this task?', {
      title: 'Delete Task',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!confirmed) return
    
    const result = await deleteTask(taskId)
    if (result.success) {
      onDelete?.()
      onClose()
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return
    
    const result = await addTaskComment({
      task_id: taskId,
      content: newComment
    })

    if (result.success) {
      setNewComment('')
      loadData()
    }
  }

  async function handleDeleteComment(commentId: string) {
    const result = await deleteTaskComment(commentId)
    if (result.success) {
      loadData()
    }
  }

  async function handleAddTimeLog() {
    if (!newTimeLog.hours || !newTimeLog.date) return
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const result = await logTime({
      task_id: taskId,
      user_id: user.id,
      hours: parseFloat(newTimeLog.hours),
      date: newTimeLog.date,
      notes: newTimeLog.notes || null
    })

    if (result.success) {
      setNewTimeLog({ hours: '', date: '', notes: '' })
      loadData()
    }
  }

  if (!isOpen) return null

  const totalHours = timeLogs.reduce((sum, log) => sum + (log.hours || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl mx-4 bg-[#1a1a1a] border border-white/10 rounded-none shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white font-sans">Task Details</h2>
            {task && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-none transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-white/10 px-5 flex-shrink-0">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details' 
                    ? 'border-accent-500 text-white' 
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'comments' 
                    ? 'border-accent-500 text-white' 
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Comments ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('time')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'time' 
                    ? 'border-accent-500 text-white' 
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                Time ({totalHours.toFixed(1)}h)
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'files' 
                    ? 'border-accent-500 text-white' 
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Paperclip className="w-4 h-4" />
                Files ({attachments.length})
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
                </div>
              ) : !task ? (
                <div className="text-center py-12">
                  <p className="text-white/50">Task not found</p>
                  <p className="text-white/30 text-sm mt-2">Task ID: {taskId}</p>
                </div>
              ) : activeTab === 'details' && task && (
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm text-white/70 mb-1.5">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-1.5">Description</label>
                        <textarea
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent-500 focus:outline-none resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/70 mb-1.5">Status</label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent-500 focus:outline-none [&>option]:bg-[#1a1a1a]"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-white/70 mb-1.5">Priority</label>
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent-500 focus:outline-none [&>option]:bg-[#1a1a1a]"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/70 mb-1.5">Assignee</label>
                          <select
                            value={formData.assignee_id}
                            onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent-500 focus:outline-none [&>option]:bg-[#1a1a1a]"
                          >
                            <option value="">Unassigned</option>
                            {members.map(m => (
                              <option key={m.id} value={m.id}>{m.full_name || 'Unnamed'}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-white/70 mb-1.5">Due Date</label>
                          <input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <LabButton variant="ghost" onClick={() => setIsEditing(false)}>Cancel</LabButton>
                        <LabButton onClick={handleSave} disabled={saving}>
                          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Save Changes
                        </LabButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                          {task.project && (
                            <p className="text-sm text-white/50 mt-1 flex items-center gap-2">
                              <Projector className="w-4 h-4" />
                              {(task.project as { name: string }).name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1.5 text-sm bg-accent-600 hover:bg-accent-700 text-white rounded-none transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={handleDelete}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-none transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {task.description && (
                        <div className="p-4 bg-white/5 rounded-none">
                          <p className="text-white/70 whitespace-pre-wrap">{task.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-none">
                          <p className="text-xs text-white/50 mb-1">Status</p>
                          <p className="text-white font-medium">{statusLabels[task.status]}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-none">
                          <p className="text-xs text-white/50 mb-1">Priority</p>
                          <p className="text-white font-medium capitalize">{task.priority}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-none">
                          <p className="text-xs text-white/50 mb-1">Assignee</p>
                          <p className="text-white font-medium">
                            {task.assignee ? (task.assignee as { full_name: string }).full_name : 'Unassigned'}
                          </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-none">
                          <p className="text-xs text-white/50 mb-1">Due Date</p>
                          <p className="text-white font-medium">
                            {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}
                          </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-none">
                          <p className="text-xs text-white/50 mb-1">Created</p>
                          <p className="text-white font-medium">
                            {task.created_at ? format(new Date(task.created_at), 'MMM d, yyyy') : 'Unknown'}
                          </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-none">
                          <p className="text-xs text-white/50 mb-1">Last Updated</p>
                          <p className="text-white font-medium">
                            {task.updated_at ? format(new Date(task.updated_at), 'MMM d, yyyy') : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {/* Project Info */}
                      {task.project && (
                        <div className="p-4 bg-white/5 rounded-none">
                          <p className="text-xs text-white/50 mb-2">Project</p>
                          <div className="flex items-center gap-2">
                            <Projector className="w-4 h-4 text-accent-400" />
                            <span className="text-white font-medium">
                              {(task.project as { name: string }).name}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-white/5 rounded-none">
                        <p className="text-xs text-white/50 mb-2">Progress</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent-500 rounded-full transition-all"
                              style={{ width: task.status === 'done' ? '100%' : task.status === 'in_progress' ? '50%' : task.status === 'review' ? '75%' : '0%' }}
                            />
                          </div>
                          <span className="text-white text-sm font-medium">
                            {task.status === 'done' ? 'Complete' : 
                             task.status === 'in_progress' ? 'In Progress' :
                             task.status === 'review' ? 'In Review' : 'Not Started'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Add comment */}
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={2}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 focus:border-accent-500 focus:outline-none resize-none"
                      />
                    </div>
                    <LabButton onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4" />
                    </LabButton>
                  </div>

                  {/* Comments list */}
                  {comments.length === 0 ? (
                    <p className="text-center text-white/50 py-8">No comments yet</p>
                  ) : (
                    <div className="space-y-3">
                      {comments.map(comment => (
                        <div key={comment.id} className="p-4 bg-white/5 rounded-none">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-accent-500/20 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-accent-400" />
                              </div>
                              <span className="text-white text-sm font-medium">
                                {comment.user ? (comment.user as { full_name: string }).full_name : 'Unknown'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white/50 text-xs">
                                {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                              </span>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1 text-white/30 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-white/70 text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'time' && (
                <div className="space-y-4">
                  {/* Add time log */}
                  <div className="p-4 bg-white/5 rounded-none space-y-3">
                    <p className="text-sm text-white/70 font-medium">Log Time</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Hours</label>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={newTimeLog.hours}
                          onChange={(e) => setNewTimeLog({ ...newTimeLog, hours: e.target.value })}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 focus:border-accent-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Date</label>
                        <input
                          type="date"
                          value={newTimeLog.date}
                          onChange={(e) => setNewTimeLog({ ...newTimeLog, date: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Notes</label>
                        <input
                          type="text"
                          value={newTimeLog.notes}
                          onChange={(e) => setNewTimeLog({ ...newTimeLog, notes: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 focus:border-accent-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <LabButton onClick={handleAddTimeLog} disabled={!newTimeLog.hours || !newTimeLog.date} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Time Entry
                    </LabButton>
                  </div>

                  {/* Time logs list */}
                  {timeLogs.length === 0 ? (
                    <p className="text-center text-white/50 py-8">No time logged yet</p>
                  ) : (
                    <div className="space-y-2">
                      {timeLogs.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-none">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent-500/20 rounded-none flex items-center justify-center">
                              <Clock className="w-4 h-4 text-accent-400" />
                            </div>
                            <div>
                              <p className="text-white text-sm">{log.hours}h</p>
                              <p className="text-white/50 text-xs">
                                {format(new Date(log.date), 'MMM d, yyyy')}
                                {log.notes && ` • ${log.notes}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white/70 text-xs">
                              {log.user ? (log.user as { full_name: string }).full_name : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  <div className="p-4 bg-accent-500/10 border border-accent-500/20 rounded-none flex items-center justify-between">
                    <p className="text-white font-medium">Total Time</p>
                    <p className="text-accent-400 font-bold text-xl">{totalHours.toFixed(1)}h</p>
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-4">
                  {/* Upload file */}
                  <div className="p-4 bg-white/5 rounded-none">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={async (e) => {
                        const files = e.target.files
                        if (!files || files.length === 0) return
                        
                        setUploading(true)
                        for (const file of files) {
                          const result = await uploadTaskAttachment(taskId, file)
                          if (!result.success) {
                            alert(result.error || 'Failed to upload file')
                          }
                        }
                        setUploading(false)
                        loadData()
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white rounded-none transition-colors"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Files
                        </>
                      )}
                    </button>
                    <p className="text-xs text-white/50 mt-2 text-center">
                      Upload documents, images, or other files
                    </p>
                  </div>

                  {/* Files list */}
                  {attachments.length === 0 ? (
                    <p className="text-center text-white/50 py-8">No files attached yet</p>
                  ) : (
                    <div className="space-y-2">
                      {attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-none group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center">
                              {attachment.file_type?.startsWith('image/') ? (
                                <Image className="w-5 h-5 text-accent-400" />
                              ) : attachment.file_type?.includes('pdf') ? (
                                <FileText className="w-5 h-5 text-red-400" />
                              ) : (
                                <File className="w-5 h-5 text-white/50" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm truncate max-w-[200px]">{attachment.file_name}</p>
                              <p className="text-white/50 text-xs">
                                {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : ''}
                                {' • '}
                                {format(new Date(attachment.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                              href={attachment.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white/10 rounded-none"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-white/70" />
                            </a>
                            <a
                              href={attachment.file_path}
                              download={attachment.file_name}
                              className="p-2 hover:bg-white/10 rounded-none"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-white/70" />
                            </a>
                            <button
                              onClick={async () => {
                                const confirmed = await confirmAction('Delete this file?', {
                                  title: 'Delete Attachment',
                                  confirmLabel: 'Delete',
                                  tone: 'danger',
                                })
                                if (!confirmed) return

                                const result = await deleteTaskAttachment(attachment.id)
                                if (result.success) {
                                  loadData()
                                } else {
                                  alert(result.error)
                                }
                              }}
                              className="p-2 hover:bg-red-500/10 rounded-none"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
