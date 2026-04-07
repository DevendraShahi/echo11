'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

      console.log('Updating expenses:', expenseData)

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
      
      if (totalWeight > 0) {
        const calculatedProgress = Math.round((completedWeight / totalWeight) * 100)
        await supabase
          .from('projects')
          .update({ progress: calculatedProgress })
          .eq('id', projectId)
      }
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
      .select('name')
      .eq('id', projectId)
      .single()

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

    // Get project_id to revalidate the correct path
    const { data: task } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single()

    if (task?.project_id) {
      revalidatePath(`/lab/projects/${task.project_id}`)
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
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating project progress:', error)
    return { success: false }
  }
}
