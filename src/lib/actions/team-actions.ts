'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TeamFormData {
  name: string
  description?: string | null
  lead_id?: string | null
  color?: string
}

export interface TeamUpdateData {
  name?: string
  description?: string | null
  lead_id?: string | null
  color?: string
}

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export async function createTeam(data: TeamFormData): Promise<{ success: boolean; error?: string; teamId?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name: data.name,
        description: data.description || null,
        lead_id: data.lead_id || null,
        color: data.color || '#6366f1'
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/settings')
    revalidatePath('/lab/teams')

    return { success: true, teamId: team.id }

  } catch (error) {
    console.error('Error creating team:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateTeam(
  teamId: string,
  data: TeamUpdateData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('teams')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/settings')
    revalidatePath('/lab/teams')

    return { success: true }

  } catch (error) {
    console.error('Error updating team:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/settings')
    revalidatePath('/lab/teams')

    return { success: true }

  } catch (error) {
    console.error('Error deleting team:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function assignUserToTeam(
  userId: string,
  teamId: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const currentUserId = await getUserId(supabase)

  if (!currentUserId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ team_id: teamId })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/settings')

    return { success: true }

  } catch (error) {
    console.error('Error assigning user to team:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Project Tags
export interface ProjectTagFormData {
  name: string
  color?: string
}

export async function createProjectTag(data: ProjectTagFormData): Promise<{ success: boolean; error?: string; tagId?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { data: tag, error } = await supabase
      .from('project_tags')
      .insert({
        name: data.name,
        color: data.color || '#6366f1'
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/settings')

    return { success: true, tagId: tag.id }

  } catch (error) {
    console.error('Error creating project tag:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteProjectTag(tagId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('project_tags')
      .delete()
      .eq('id', tagId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/settings')

    return { success: true }

  } catch (error) {
    console.error('Error deleting project tag:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function assignTagToProject(
  projectId: string,
  tagId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('project_tag_assignments')
      .insert({
        project_id: projectId,
        tag_id: tagId
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/projects/${projectId}`)

    return { success: true }

  } catch (error) {
    console.error('Error assigning tag to project:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function removeTagFromProject(
  projectId: string,
  tagId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('project_tag_assignments')
      .delete()
      .eq('project_id', projectId)
      .eq('tag_id', tagId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/projects/${projectId}`)

    return { success: true }

  } catch (error) {
    console.error('Error removing tag from project:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Fetch helpers
export async function getAllTeams() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('teams')
    .select('*, lead:profiles(id, full_name, avatar_url)')
    .order('name', { ascending: true })

  return data || []
}

export async function getTeam(teamId: string) {
  const supabase = await createClient()
  
  const { data: team } = await supabase
    .from('teams')
    .select('*, lead:profiles(id, full_name, avatar_url)')
    .eq('id', teamId)
    .single()

  if (!team) return null

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, email')
    .eq('team_id', teamId)
    .order('full_name', { ascending: true })

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, status, client:clients(id, company_name)')
    .eq('team_id', teamId)
    .order('name', { ascending: true })

  return { ...team, members: members || [], projects: projects || [] }
}

export async function getUserTeam(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('team_id')
    .eq('id', userId)
    .single()

  if (!profile?.team_id) return null

  const { data: team } = await supabase
    .from('teams')
    .select('*, lead:profiles(id, full_name, avatar_url)')
    .eq('id', profile.team_id)
    .single()

  return team
}

export async function getProjectsByTeam(teamId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('projects')
    .select('*, client:clients(id, company_name)')
    .eq('team_id', teamId)
    .order('name', { ascending: true })

  return data || []
}

export async function assignProjectToTeam(
  projectId: string,
  teamId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('projects')
      .update({ team_id: teamId })
      .eq('id', projectId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/projects/${projectId}`)
    revalidatePath('/lab/teams')

    return { success: true }
  } catch (error) {
    console.error('Error assigning project to team:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function removeProjectFromTeam(projectId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('projects')
      .update({ team_id: null })
      .eq('id', projectId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/lab/projects/${projectId}`)
    revalidatePath('/lab/teams')

    return { success: true }
  } catch (error) {
    console.error('Error removing project from team:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function removeUserFromTeam(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const currentUserId = await getUserId(supabase)

  if (!currentUserId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ team_id: null })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/settings')
    revalidatePath('/lab/teams')

    return { success: true }
  } catch (error) {
    console.error('Error removing user from team:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function setTeamLead(
  teamId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const currentUserId = await getUserId(supabase)

  if (!currentUserId) {
    return { success: false, error: 'You must be logged in' }
  }

  try {
    const { error } = await supabase
      .from('teams')
      .update({ lead_id: userId, updated_at: new Date().toISOString() })
      .eq('id', teamId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/lab/teams')
    revalidatePath(`/lab/teams/${teamId}`)

    return { success: true }
  } catch (error) {
    console.error('Error setting team lead:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getTeamMembers(teamId: string) {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .eq('team_id', teamId)
    .order('full_name', { ascending: true })

  return data || []
}

export interface UserRoleAndTeam {
  role: string
  teamId: string | null
  isAdmin: boolean
  isLead: boolean
}

export async function getUserRoleAndTeam(): Promise<UserRoleAndTeam | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const isAdmin = profile.role === 'admin'
  const isLead = isAdmin ? false : await checkIsTeamLead(user.id)

  return {
    role: profile.role,
    teamId: profile.team_id,
    isAdmin,
    isLead
  }
}

async function checkIsTeamLead(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('lead_id', userId)
    .single()

  return !!team
}

export async function getAllProjectTags() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('project_tags')
    .select('*')
    .order('name', { ascending: true })

  return (data || []) as Array<{ id: string; name: string; color: string; created_at: string }>
}