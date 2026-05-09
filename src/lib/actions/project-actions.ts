'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notification-actions'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidateClientSurface, revalidateLegacyPortalSurface } from './client-surface-revalidate'

async function requireAdminOrLead(userId: string, teamId?: string | null) {
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return true
  if (!teamId) return false

  const { data: team } = await service
    .from('teams')
    .select('lead_id')
    .eq('id', teamId)
    .single()

  return team?.lead_id === userId
}

export interface ProjectUpdateData {
  name?: string
  description?: string | null
  client_id?: string | null
  status?: 'active' | 'on_hold' | 'completed' | 'archived'
  type?: 'website' | 'mobile' | 'branding' | 'consulting' | 'other'
  start_date?: string | null
  deadline?: string | null
  budget?: number | null
  progress?: number
  color?: string
  link?: string | null
}

export interface ExpenseData {
  id: string
  service_id: string | null
  description: string | null
  quantity: number
  rate: number
  amount: number
}

export interface ProjectCreateData {
  name: string
  description?: string | null
  client_id?: string | null
  team_id?: string | null
  status?: 'active' | 'on_hold' | 'completed' | 'archived'
  type?: 'website' | 'mobile' | 'branding' | 'consulting' | 'other'
  start_date?: string | null
  deadline?: string | null
  budget?: number | null
  color?: string
}

export async function createProject(data: ProjectCreateData): Promise<{ success: boolean; error?: string; projectId?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'You must be logged in' }

  if (!data.name?.trim()) return { success: false, error: 'Project name is required' }

  const allowed = await requireAdminOrLead(user.id, data.team_id)
  if (!allowed) return { success: false, error: 'Only admins or team leads can create projects' }

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: data.name.trim(),
        description: data.description || null,
        client_id: data.client_id || null,
        team_id: data.team_id || null,
        status: data.status || 'active',
        type: data.type || 'other',
        start_date: data.start_date || null,
        deadline: data.deadline || null,
        budget: data.budget || null,
        color: data.color || null,
        created_by: user.id,
        progress: 0,
      })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    try {
      await supabase.from('activities').insert({
        user_id: user.id,
        action: 'created project',
        entity_type: 'project',
        entity_id: project.id,
        metadata: { name: data.name },
      })
    } catch { /* non-critical */ }

    revalidatePath('/lab/projects')
    revalidateClientSurface({ projectId: project.id })
    revalidateLegacyPortalSurface()
    return { success: true, projectId: project.id }
  } catch (error) {
    console.error('Error creating project:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateProject(
  projectId: string,
  data: ProjectUpdateData,
  expenses?: ExpenseData[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { data: oldProject } = await supabase
      .from('projects')
      .select('name, status, team_id')
      .eq('id', projectId)
      .single()

    const allowed = await requireAdminOrLead(user.id, oldProject?.team_id)
    if (!allowed) {
      return { success: false, error: 'Only admins or team leads can update this project' }
    }

    // Update project
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (projectError) {
      return { success: false, error: projectError.message }
    }

    // Handle expenses if provided
    if (expenses && expenses.length > 0) {
      // Delete existing expenses
      await supabase
        .from('project_expenses')
        .delete()
        .eq('project_id', projectId)

      // Insert new expenses
      const expenseData = expenses
        .filter(e => e.amount > 0)
        .map(e => ({
          project_id: projectId,
          service_id: e.service_id || null,
          description: e.description || null,
          quantity: e.quantity,
          rate: e.rate,
          amount: e.amount
        }))

      if (expenseData.length > 0) {
        const { error: expenseError } = await supabase
          .from('project_expenses')
          .insert(expenseData)
        
        if (expenseError) {
          console.error('Expense insert error:', expenseError)
          return { success: false, error: 'Failed to save expenses: ' + expenseError.message }
        }
      }

      // Recalculate budget from expenses
      const totalBudget = expenses.reduce((sum, e) => sum + e.amount, 0)
      await supabase
        .from('projects')
        .update({ budget: totalBudget })
        .eq('id', projectId)
    }

    // Calculate new progress from milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('weight, completed')
      .eq('project_id', projectId)

    if (milestones && milestones.length > 0) {
      const totalWeight = milestones.reduce((sum, m) => sum + (m.weight || 0), 0)
      const completedWeight = milestones.filter(m => m.completed).reduce((sum, m) => sum + (m.weight || 0), 0)
      const calculatedProgress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
      await supabase
        .from('projects')
        .update({ progress: calculatedProgress })
        .eq('id', projectId)
    }

    // Log activity (don't fail if this fails)
    try {
      await supabase.from('activities').insert({
        user_id: user.id,
        action: 'updated project',
        entity_type: 'project',
        entity_id: projectId,
        metadata: { name: data.name }
      })
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError)
    }

    revalidatePath(`/lab/projects/${projectId}`)
    revalidatePath('/lab/projects')
    revalidateClientSurface({ projectId })
    revalidateLegacyPortalSurface()

    // Notify team members on status change
    if (data.status && oldProject && data.status !== oldProject.status) {
      const { data: members } = await supabase
        .from('profiles')
        .select('id')
        .eq('team_id', oldProject.team_id)

      if (members) {
        await Promise.all(members
          .filter(m => m.id !== user.id)
          .map(m => createNotification({
            userId: m.id,
            type: 'project',
            title: `${oldProject.name} status updated`,
            message: `Status changed to ${data.status?.replace('_', ' ') || data.status}`,
            link: `/lab/projects/${projectId}`
          }))
        )
      }
    }

    return { success: true }

  } catch (error) {
    console.error('Error updating project:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    // Get project name for activity log
    const { data: project } = await supabase
      .from('projects')
      .select('name, team_id')
      .eq('id', projectId)
      .single()

    const allowed = await requireAdminOrLead(user.id, project?.team_id)
    if (!allowed) {
      return { success: false, error: 'Only admins or team leads can delete this project' }
    }

    // Delete project (cascades to milestones, tasks, expenses)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    // Log activity (don't fail if this fails)
    try {
      await supabase.from('activities').insert({
        user_id: user.id,
        action: 'deleted project',
        entity_type: 'project',
        metadata: { name: project?.name }
      })
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError)
    }

    revalidatePath('/lab/projects')
    revalidateClientSurface({ projectId })
    revalidateLegacyPortalSurface()

    return { success: true }

  } catch (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function toggleTaskStatus(
  taskId: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { data: task } = await supabase
      .from('tasks')
      .select('project_id, assignee_id')
      .eq('id', taskId)
      .single()

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isAssignee = task.assignee_id === user.id

    let isLead = false
    if (task.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('team_id')
        .eq('id', task.project_id)
        .single()

      if (project?.team_id) {
        const { data: leadTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('id', project.team_id)
          .eq('lead_id', user.id)
          .single()
        isLead = Boolean(leadTeam)
      }
    }

    if (!(isAdmin || isLead || isAssignee)) {
      return { success: false, error: 'You can only update tasks assigned to you' }
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        status: completed ? 'done' : 'todo',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (error) {
      return { success: false, error: error.message }
    }

    if (task?.project_id) {
      revalidatePath(`/lab/projects/${task.project_id}`)
      revalidateClientSurface({ projectId: task.project_id })
      revalidateLegacyPortalSurface()
    }

    return { success: true }

  } catch (error) {
    console.error('Error toggling task:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function canSetProjectCompleted(projectId: string): Promise<{ can: boolean; message?: string }> {
  const supabase = await createClient()
  
  const { data: milestones } = await supabase
    .from('milestones')
    .select('weight, completed')
    .eq('project_id', projectId)

  if (!milestones || milestones.length === 0) {
    return { can: true } // No milestones, allow completion
  }

  const totalWeight = milestones.reduce((sum, m) => sum + (m.weight || 0), 0)
  const completedWeight = milestones.filter(m => m.completed).reduce((sum, m) => sum + (m.weight || 0), 0)

  if (totalWeight === 0) {
    return { can: true } // No weights set, allow completion
  }

  if (completedWeight < totalWeight) {
    return { 
      can: false, 
      message: `${milestones.filter(m => !m.completed).length} milestone(s) not completed` 
    }
  }

  return { can: true }
}

export async function updateProjectProgress(projectId: string): Promise<{ success: boolean }> {
  const supabase = await createClient()
  
  try {
    const { data: milestones } = await supabase
      .from('milestones')
      .select('weight, completed')
      .eq('project_id', projectId)

    if (milestones && milestones.length > 0) {
      const totalWeight = milestones.reduce((sum, m) => sum + (m.weight || 0), 0)
      const completedWeight = milestones.filter(m => m.completed).reduce((sum, m) => sum + (m.weight || 0), 0)
      
      const calculatedProgress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
      
      await supabase
        .from('projects')
        .update({ progress: calculatedProgress, updated_at: new Date().toISOString() })
        .eq('id', projectId)

      revalidatePath(`/lab/projects/${projectId}`)
      revalidatePath('/lab/projects')
      revalidateClientSurface({ projectId })
      revalidateLegacyPortalSurface()
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating project progress:', error)
    return { success: false }
  }
}
