'use client'

import { useState, useEffect, useRef, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateTask, deleteTask, addTaskComment, deleteTaskComment, logTime, getTeamMembers, uploadTaskAttachment, deleteTaskAttachment } from '@/lib/actions/task-actions'
import { LabButton } from '@/components/ui/LabButton'
import { X, Loader2, Trash2, Clock, MessageSquare, Calendar, Flag, Send, Plus, Paperclip, Download, FileText, ArrowLeft, Edit3, Save, Image, Folder, AlertCircle } from 'lucide-react'
import { Task, TaskStatus, TaskPriority, TaskComment, TimeLog, TaskAttachment } from '@/types/lab'
import { format } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TaskPageProps {
  params: Promise<{ id: string }>
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done'
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-slate-500/20 text-slate-400',
  in_progress: 'bg-amber-500/20 text-amber-400',
  review: 'bg-indigo-500/20 text-indigo-400',
  done: 'bg-emerald-500/20 text-emerald-400',
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-slate-500/20 text-slate-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-amber-500/20 text-amber-400',
  urgent: 'bg-rose-500/20 text-rose-400',
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export default function TaskDetailPage({ params }: TaskPageProps) {
  const { id: taskId } = use(params)
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (taskId) {
      loadData()
    }
  }, [taskId])

  async function loadData() {
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (taskError) {
        console.error('Error fetching task:', taskError)
        setLoading(false)
        return
      }

      if (!taskData) {
        setLoading(false)
        return
      }

      let projectData = null
      let assigneeData = null

      if (taskData.project_id) {
        const { data: projData } = await supabase
          .from('projects')
          .select('id, name')
          .eq('id', taskData.project_id)
          .single()
        projectData = projData
      }

      if (taskData.assignee_id) {
        const { data: profData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', taskData.assignee_id)
          .single()
        assigneeData = profData
      }

      const enrichedTask = {
        ...taskData,
        project: projectData,
        assignee: assigneeData
      } as Task

      setTask(enrichedTask)
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        assignee_id: taskData.assignee_id || '',
        due_date: taskData.due_date ? taskData.due_date.split('T')[0] : '',
      })

      const [commentsData, timeLogsData, attachmentsData, userResult] = await Promise.all([
        supabase.from('task_comments').select('*, user:profiles(id, full_name, avatar_url)').eq('task_id', taskId).order('created_at', { ascending: false }),
        supabase.from('time_logs').select('*, user:profiles(id, full_name, avatar_url)').eq('task_id', taskId).order('date', { ascending: false }),
        supabase.from('task_attachments').select('*, user:profiles(id, full_name, avatar_url)').eq('task_id', taskId).order('created_at', { ascending: false }),
        supabase.auth.getUser()
      ])

      if (userResult.data?.user) {
        setCurrentUserId(userResult.data.user.id)
      }

      setComments(commentsData.data || [])
      setTimeLogs(timeLogsData.data || [])
      setAttachments(attachmentsData.data || [])
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
    if (!confirm('Are you sure you want to delete this task?')) return
    
    const result = await deleteTask(taskId)
    if (result.success) {
      window.location.href = '/lab/tasks'
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
    if (!confirm('Delete this comment?')) return
    
    const result = await deleteTaskComment(commentId)
    if (result.success) {
      loadData()
    }
  }

  async function handleAddTimeLog() {
    if (!newTimeLog.hours || !newTimeLog.date) return
    if (!currentUserId) return

    const result = await logTime({
      task_id: taskId,
      user_id: currentUserId,
      hours: parseFloat(newTimeLog.hours),
      date: newTimeLog.date,
      notes: newTimeLog.notes || null
    })

    if (result.success) {
      setNewTimeLog({ hours: '', date: '', notes: '' })
      loadData()
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentUserId) return

    setUploading(true)
    const result = await uploadTaskAttachment(taskId, file)
    
    if (result.success) {
      loadData()
    }
    setUploading(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!confirm('Delete this file?')) return
    
    const result = await deleteTaskAttachment(attachmentId)
    if (result.success) {
      loadData()
    }
  }

  async function downloadAttachment(attachment: TaskAttachment) {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .download(attachment.file_path)
    
    if (error) {
      console.error('Download error:', error)
      return
    }

    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.file_name
    a.click()
    URL.revokeObjectURL(url)
  }

  function getFileIcon(fileType: string | null) {
    if (!fileType) return <FileText className="w-5 h-5" />
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0)

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-rose-400 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Task not found</span>
          </div>
          <Link href="/lab/tasks" className="text-accent hover:text-accent/80 transition-colors">
            Back to Tasks
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <Link 
          href="/lab/tasks"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-semibold focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans"
                  />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add description..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none font-sans"
                  />
                  <div className="flex gap-3">
                    <LabButton onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </LabButton>
                    <LabButton variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </LabButton>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="text-2xl font-bold text-white font-sans">{task.title}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </div>
                  {task.description && (
                    <p className="text-white/70 whitespace-pre-wrap leading-relaxed">{task.description}</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 overflow-hidden">
              <div className="flex border-b border-white/10">
                {(['details', 'comments', 'time', 'files'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-6 py-4 text-sm font-medium capitalize transition-colors font-sans relative",
                      activeTab === tab
                        ? "text-accent"
                        : "text-white/50 hover:text-white"
                    )}
                  >
                    {tab === 'details' ? 'Details' : tab}
                    {tab === 'comments' && ` (${comments.length})`}
                    {tab === 'files' && ` (${attachments.length})`}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide font-sans">Description</h3>
                      <p className="text-white/70 whitespace-pre-wrap leading-relaxed">
                        {task.description || 'No description added'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="text-sm font-medium text-white/50 mb-2 uppercase tracking-wide font-sans">Project</h3>
                        {task.project ? (
                          <Link 
                            href={`/lab/projects/${task.project.id}`}
                            className="text-accent hover:text-accent/80 transition-colors font-medium font-sans"
                          >
                            {task.project.name}
                          </Link>
                        ) : (
                          <span className="text-white/50">No project</span>
                        )}
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="text-sm font-medium text-white/50 mb-2 uppercase tracking-wide font-sans">Assignee</h3>
                        {task.assignee ? (
                          <div className="flex items-center gap-3">
                            {task.assignee.avatar_url ? (
                              <img 
                                src={task.assignee.avatar_url} 
                                alt={task.assignee.full_name || ''}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-sm text-accent">
                                {(task.assignee.full_name || 'U')[0].toUpperCase()}
                              </div>
                            )}
                            <span className="text-white/70 font-medium font-sans">{task.assignee.full_name || 'Unknown'}</span>
                          </div>
                        ) : (
                          <span className="text-white/50">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <LabButton onClick={handleAddComment} disabled={!newComment.trim()}>
                        <Send className="w-4 h-4" />
                      </LabButton>
                    </div>

                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                              {comment.user?.avatar_url ? (
                                <img 
                                  src={comment.user.avatar_url} 
                                  alt={comment.user.full_name || ''}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-sm text-accent">
                                  {(comment.user?.full_name || 'U')[0].toUpperCase()}
                                </div>
                              )}
                              <span className="text-white/70 font-medium font-sans">
                                {comment.user?.full_name || 'Unknown'}
                              </span>
                            </div>
                            {comment.user_id === currentUserId && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1.5 text-white/40 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-white/70 ml-11 font-sans">{comment.content}</p>
                          <p className="text-white/40 text-xs ml-11 mt-2 font-mono">
                            {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <div className="text-center py-8 text-white/40">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No comments yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'time' && (
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-white/50 block mb-1.5 uppercase tracking-wide font-sans">Hours</label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={newTimeLog.hours}
                            onChange={(e) => setNewTimeLog({ ...newTimeLog, hours: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/70 focus:outline-none focus:border-accent transition-all font-sans"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/50 block mb-1.5 uppercase tracking-wide font-sans">Date</label>
                          <input
                            type="date"
                            value={newTimeLog.date}
                            onChange={(e) => setNewTimeLog({ ...newTimeLog, date: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/70 focus:outline-none focus:border-accent transition-all font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/50 block mb-1.5 uppercase tracking-wide font-sans">Notes</label>
                          <input
                            type="text"
                            value={newTimeLog.notes}
                            onChange={(e) => setNewTimeLog({ ...newTimeLog, notes: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/70 focus:outline-none focus:border-accent transition-all font-sans"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <LabButton onClick={handleAddTimeLog} disabled={!newTimeLog.hours || !newTimeLog.date}>
                        <Plus className="w-4 h-4" />
                        Add Time
                      </LabButton>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <span className="text-white/60 font-sans">Total Time Logged</span>
                      <span className="text-2xl font-bold text-accent font-sans">{totalHours.toFixed(1)}h</span>
                    </div>

                    <div className="space-y-2">
                      {timeLogs.map((log) => (
                        <div key={log.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-white/70 font-medium font-sans">{log.hours}h</p>
                              <p className="text-white/40 text-sm font-sans">{log.user?.full_name || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white/60 font-sans">{format(new Date(log.date), 'MMM d, yyyy')}</p>
                            {log.notes && <p className="text-white/40 text-sm font-sans">{log.notes}</p>}
                          </div>
                        </div>
                      ))}
                      {timeLogs.length === 0 && (
                        <div className="text-center py-8 text-white/40">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No time logged yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <LabButton 
                        variant="ghost" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
                        {uploading ? 'Uploading...' : 'Upload File'}
                      </LabButton>
                    </div>

                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div 
                          key={attachment.id} 
                          className="bg-white/5 rounded-lg p-4 flex items-center justify-between border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                              {getFileIcon(attachment.file_type)}
                            </div>
                            <div>
                              <p className="text-white/70 font-medium font-sans">{attachment.file_name}</p>
                              <p className="text-white/40 text-sm font-mono">
                                {attachment.user?.full_name || 'Unknown'} • {format(new Date(attachment.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => downloadAttachment(attachment)}
                              className="p-2 text-white/40 hover:text-accent transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {attachment.uploaded_by === currentUserId && (
                              <button
                                onClick={() => handleDeleteAttachment(attachment.id)}
                                className="p-2 text-white/40 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {attachments.length === 0 && (
                        <div className="text-center py-8 text-white/40">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No files attached</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide font-sans">Status</h3>
              <div className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium font-sans',
                statusColors[task.status]
              )}>
                <span>{statusLabels[task.status]}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide font-sans">Priority</h3>
              <div className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium font-sans',
                priorityColors[task.priority]
              )}>
                <Flag className="w-4 h-4" />
                <span>{priorityLabels[task.priority]}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide font-sans">Due Date</h3>
              {task.due_date ? (
                <div className={cn(
                  'flex items-center gap-2 font-sans',
                  new Date(task.due_date) < new Date() ? 'text-rose-400' : 'text-white/70'
                )}>
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                </div>
              ) : (
                <span className="text-white/50">No due date</span>
              )}
            </div>

            {task.project && (
              <div className="bg-white/5 border border-white/10 p-5">
                <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide font-sans">Project</h3>
                <Link 
                  href={`/lab/projects/${task.project.id}`}
                  className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-medium font-sans"
                >
                  <Folder className="w-4 h-4" />
                  <span>{task.project.name}</span>
                </Link>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide font-sans">Time Logged</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-2xl font-bold text-white font-sans">{totalHours.toFixed(1)}h</span>
              </div>
            </div>

            <div className="bg-white/5 border border-rose-500/20 p-5">
              <LabButton 
                variant="danger" 
                className="w-full"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete Task
              </LabButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}