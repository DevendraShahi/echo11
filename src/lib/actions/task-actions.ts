'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notification-actions'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidateClientSurface, revalidateLegacyPortalSurface } from './client-surface-revalidate'

export interface TaskFormData {
  title: string
  description?: string | null
  project_id: string
  status?: 'todo' | 'in_progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: string | null
  due_date?: string | null
}

export interface TaskUpdateData {
  title?: string
  description?: string | null
  project_id?: string
  status?: 'todo' | 'in_progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: string | null
  due_date?: string | null
}

export interface TimeLogData {
  task_id: string
  user_id: string
  hours: number
  date: string
  notes?: string | null
}

export interface TaskCommentData {
  task_id: string
  content: string
}

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

async function requireProjectAccess(projectId: string, userId: string): Promise<boolean> {
  if (!projectId) return false

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: profile }, { data: project }] = await Promise.all([
    service.from('profiles').select('role').eq('id', userId).single(),
    service.from('projects').select('team_id').eq('id', projectId).single()
  ])

  const isAdmin = profile?.role === 'admin'
  const isLead = project?.team_id
    ? !!(await service.from('teams').select('lead_id').eq('id', project.team_id).eq('lead_id', userId).single()).data
    : false

  return isAdmin || isLead
}

export async function createTask(data: TaskFormData): Promise<{ success: boolean; error?: string; taskId?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const hasAccess = await requireProjectAccess(data.project_id, userId)
    if (!hasAccess) {
      return { success: false, error: 'Only admins or team leads can create tasks for this project' }
    }

    // Get max sort_order for the status column
    const { data: maxOrder } = await supabase
      .from('tasks')
      .select('sort_order')
      .eq('status', data.status || 'todo')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const sortOrder = (maxOrder?.sort_order || 0) + 1

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        description: data.description || null,
        project_id: data.project_id,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        assignee_id: data.assignee_id || null,
        due_date: data.due_date || null,
        sort_order: sortOrder,
        created_by: userId
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Log activity
    try {
      await supabase.from('activities').insert({
        user_id: userId,
        action: 'created task',
        entity_type: 'task',
        entity_id: task.id,
        metadata: { title: data.title }
      })
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError)
    }

    if (data.assignee_id && data.assignee_id !== userId) {
      await createNotification({
        userId: data.assignee_id,
        type: 'task',
        title: 'New Task Assigned',
        message: `You have been assigned to: ${data.title}`,
        link: `/lab/projects/${data.project_id}`
      })
    }

    revalidatePath('/lab/tasks')
    revalidatePath(`/lab/projects/${data.project_id}`)
    revalidateClientSurface({ projectId: data.project_id })
    revalidateLegacyPortalSurface()

    return { success: true, taskId: task.id }

  } catch (error) {
    console.error('Error creating task:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateTask(
  taskId: string,
  data: TaskUpdateData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    // Get old task data for comparison
    const { data: oldTask } = await supabase
      .from('tasks')
      .select('status, project_id, title, assignee_id')
      .eq('id', taskId)
      .single()

    const projectIdToCheck = data.project_id || oldTask?.project_id
    if (projectIdToCheck) {
      const hasAccess = await requireProjectAccess(projectIdToCheck, userId)
      if (!hasAccess) {
        return { success: false, error: 'Only admins or team leads can update tasks for this project' }
      }
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Recalculate sort_order if status changed
    if (data.status && oldTask && data.status !== oldTask.status) {
      const { data: maxOrder } = await supabase
        .from('tasks')
        .select('sort_order')
        .eq('status', data.status)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      const sortOrder = (maxOrder?.sort_order || 0) + 1

      await supabase
        .from('tasks')
        .update({ sort_order: sortOrder })
        .eq('id', taskId)
    }

    // Log activity
    try {
      await supabase.from('activities').insert({
        user_id: userId,
        action: 'updated task',
        entity_type: 'task',
        entity_id: taskId,
        metadata: { title: data.title }
      })
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError)
    }

    if (data.assignee_id && oldTask && data.assignee_id !== oldTask.assignee_id && data.assignee_id !== userId) {
      await createNotification({
        userId: data.assignee_id,
        type: 'task',
        title: 'Task Assigned To You',
        message: `You are now the assignee for: ${data.title || oldTask.title}`,
        link: `/lab/projects/${data.project_id || oldTask.project_id}`
      })
    } else if (data.status && oldTask && data.status !== oldTask.status && oldTask.assignee_id && oldTask.assignee_id !== userId) {
      await createNotification({
        userId: oldTask.assignee_id,
        type: 'task',
        title: 'Task Status Updated',
        message: `${oldTask.title} was moved to ${data.status.replace('_', ' ')}.`,
        link: `/lab/projects/${data.project_id || oldTask.project_id}`
      })
    }

    // Revalidate paths
    revalidatePath('/lab/tasks')
    if (oldTask?.project_id) {
      revalidatePath(`/lab/projects/${oldTask.project_id}`)
      revalidateClientSurface({ projectId: oldTask.project_id })
    }
    if (data.project_id && data.project_id !== oldTask?.project_id) {
      revalidatePath(`/lab/projects/${data.project_id}`)
      revalidateClientSurface({ projectId: data.project_id })
    }
    revalidateLegacyPortalSurface()

    return { success: true }

  } catch (error) {
    console.error('Error updating task:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    // Get project_id before deletion for revalidation
    const { data: task } = await supabase
      .from('tasks')
      .select('project_id, title')
      .eq('id', taskId)
      .single()

    if (task?.project_id) {
      const hasAccess = await requireProjectAccess(task.project_id, userId)
      if (!hasAccess) {
        return { success: false, error: 'Only admins or team leads can delete tasks for this project' }
      }
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Log activity
    try {
      await supabase.from('activities').insert({
        user_id: userId,
        action: 'deleted task',
        entity_type: 'task',
        metadata: { title: task?.title }
      })
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError)
    }

    revalidatePath('/lab/tasks')
    if (task?.project_id) {
      revalidatePath(`/lab/projects/${task.project_id}`)
      revalidateClientSurface({ projectId: task.project_id })
      revalidateLegacyPortalSurface()
    }

    return { success: true }

  } catch (error) {
    console.error('Error deleting task:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: 'todo' | 'in_progress' | 'review' | 'done'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, team_id')
      .eq('id', userId)
      .single()

    const isAdmin = profile?.role === 'admin'
    let isLead = false

    if (profile?.team_id) {
      const { data: team } = await supabase
        .from('teams')
        .select('lead_id')
        .eq('id', profile.team_id)
        .single()
      isLead = team?.lead_id === userId
    }

    // Get old task for revalidation and assignee check
    const { data: oldTask } = await supabase
      .from('tasks')
      .select('project_id, status, assignee_id')
      .eq('id', taskId)
      .single()

    const isAssignee = oldTask?.assignee_id === userId

    if (newStatus === 'done' && !(isAdmin || isLead || isAssignee)) {
      return { success: false, error: 'Only a team lead, admin, or the task assignee can move tasks to Done' }
    }

    // Update status and recalculate sort_order
    const { data: maxOrder } = await supabase
      .from('tasks')
      .select('sort_order')
      .eq('status', newStatus)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const sortOrder = (maxOrder?.sort_order || 0) + 1

    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        sort_order: sortOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Log activity
    try {
      await supabase.from('activities').insert({
        user_id: userId,
        action: `moved task to ${newStatus.replace('_', ' ')}`,
        entity_type: 'task',
        entity_id: taskId
      })
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError)
    }

    revalidatePath('/lab/tasks')
    revalidatePath(`/lab/tasks/${taskId}`)
    if (oldTask?.project_id) {
      revalidatePath(`/lab/projects/${oldTask.project_id}`)
      revalidateClientSurface({ projectId: oldTask.project_id })
      revalidateLegacyPortalSurface()
    }

    return { success: true }

  } catch (error) {
    console.error('Error updating task status:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Time logging functions
export async function logTime(data: TimeLogData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('time_logs')
      .insert({
        task_id: data.task_id,
        user_id: data.user_id || userId,
        hours: data.hours,
        date: data.date,
        notes: data.notes || null
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/tasks')

    return { success: true }

  } catch (error) {
    console.error('Error logging time:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getTaskTimeLogs(taskId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('time_logs')
    .select('*, user:profiles(full_name, avatar_url)')
    .eq('task_id', taskId)
    .order('date', { ascending: false })

  return data || []
}

// Task comments functions
export async function addTaskComment(data: TaskCommentData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('task_comments')
      .insert({
        task_id: data.task_id,
        user_id: userId,
        content: data.content
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/tasks')

    return { success: true }

  } catch (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteTaskComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/tasks')

    return { success: true }

  } catch (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Fetch helpers for client components
export async function getProjectsForTaskForm() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('projects')
    .select('id, name, status')
    .order('name', { ascending: true })

  return data || []
}

export async function getTeamMembers() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .neq('role', 'client')
    .order('full_name', { ascending: true })

  return data || []
}

// Task Attachments
export async function uploadTaskAttachment(
  taskId: string,
  file: File
): Promise<{ success: boolean; error?: string; attachmentId?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${taskId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(fileName, file)

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(fileName)

    // Save attachment record
    const { data: attachment, error: dbError } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_path: publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    revalidatePath('/lab/tasks')

    return { success: true, attachmentId: attachment.id }

  } catch (error) {
    console.error('Error uploading attachment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteTaskAttachment(attachmentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    // Get attachment info first
    const { data: attachment } = await supabase
      .from('task_attachments')
      .select('file_path, uploaded_by')
      .eq('id', attachmentId)
      .single()

    if (!attachment) {
      return { success: false, error: 'Attachment not found' }
    }

    // Check if user can delete (owner or admin)
    if (attachment.uploaded_by !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        return { success: false, error: 'You can only delete your own attachments' }
      }
    }

    // Extract file path from URL and delete from storage
    const filePath = attachment.file_path.split('/storage/v1/object/public/')[1]
    if (filePath) {
      await supabase.storage.from('task-attachments').remove([filePath])
    }

    // Delete database record
    const { error: deleteError } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    revalidatePath('/lab/tasks')

    return { success: true }

  } catch (error) {
    console.error('Error deleting attachment:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getTaskAttachments(taskId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('task_attachments')
    .select('*, user:profiles(id, full_name, avatar_url)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  return data || []
}
