'use server'

import { createClient } from '@/lib/supabase/server'
import { callApiV1 } from '@/lib/api/v1/internal-client'
import { isApiFailure } from '@/lib/api/v1/contracts'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notification-actions'

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

function nextIdempotencyKey(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

interface AgencyScope {
  userId: string
  role: string
  teamId: string | null
  isAdmin: boolean
}

async function getAgencyScope(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AgencyScope | null> {
  const userId = await getUserId(supabase)
  if (!userId) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', userId)
    .single()

  if (!profile) return null

  return {
    userId,
    role: profile.role,
    teamId: profile.team_id,
    isAdmin: profile.role === 'admin'
  }
}

async function isLeadOfTeam(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  teamId: string
): Promise<boolean> {
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('id', teamId)
    .eq('lead_id', userId)
    .single()

  return Boolean(team)
}

export async function createTeam(data: TeamFormData): Promise<{ success: boolean; error?: string; teamId?: string }> {
  if (!data.name?.trim()) {
    return { success: false, error: 'Team name is required' }
  }

  try {
    const response = await callApiV1<{ team_id: string }>('/teams', {
      method: 'POST',
      body: data,
      idempotencyKey: nextIdempotencyKey('team-create'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    revalidatePath('/lab/settings')
    revalidatePath('/lab/teams')

    return { success: true, teamId: response.data.team_id }

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

  if (data.name !== undefined && !data.name?.trim()) {
    return { success: false, error: 'Team name cannot be empty' }
  }

  try {
    const response = await callApiV1<{ team_id: string }>(`/teams/${teamId}`, {
      method: 'PATCH',
      body: {
        ...data,
        ...(data.name ? { name: data.name.trim() } : {}),
      },
      idempotencyKey: nextIdempotencyKey('team-update'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    // Auto-notify team members about the team update
    try {
      const { data: members } = await supabase.from('profiles').select('id').eq('team_id', teamId)
      if (members && members.length > 0) {
        for (const member of members) {
          if (member.id !== userId) { 
             await createNotification({
               userId: member.id,
               type: 'team',
               title: 'Team Updated',
               message: `Your team details have been updated.`,
               link: `/lab/teams`
             })
          }
        }
      }
    } catch(e) {
      console.error('Failed to dispatch team update notifications', e)
    }

    revalidatePath('/lab/settings')
    revalidatePath('/lab/teams')
    revalidatePath(`/lab/teams/${teamId}`)

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
    const response = await callApiV1<{ team_id: string }>(`/teams/${teamId}`, {
      method: 'DELETE',
      idempotencyKey: nextIdempotencyKey('team-delete'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
    if (!teamId) {
      return removeUserFromTeam(userId)
    }

    const response = await callApiV1<{ user_id: string; team_id: string | null }>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: { user_id: userId },
      idempotencyKey: nextIdempotencyKey('team-member-assign'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    // Notify user of assignment
    if (teamId) {
       const { data: teamInfo } = await supabase.from('teams').select('name').eq('id', teamId).single()
       if (teamInfo) {
         await createNotification({
           userId: userId, // ID of the assigned user
           type: 'team',
           title: 'Added to Team',
           message: `You have been officially added to ${teamInfo.name}.`,
           link: `/lab/teams`
         })
       }
    }

    revalidatePath('/lab/settings')
    revalidatePath('/lab/teams')

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
  try {
    const response = await callApiV1<{ tag_id: string; lock_version: number | null }>('/project-tags', {
      method: 'POST',
      body: data,
      idempotencyKey: nextIdempotencyKey('project-tag-create'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
    }

    revalidatePath('/lab/settings')

    return { success: true, tagId: response.data.tag_id }

  } catch (error) {
    console.error('Error creating project tag:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteProjectTag(tagId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await callApiV1<{ tag_id: string }>(`/project-tags/${tagId}`, {
      method: 'DELETE',
      idempotencyKey: nextIdempotencyKey('project-tag-delete'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
  try {
    const response = await callApiV1<{ project_id: string; tag_id: string; lock_version: number | null }>(
      `/projects/${projectId}/tags/${tagId}`,
      {
        method: 'PUT',
        idempotencyKey: nextIdempotencyKey('project-tag-assign'),
      }
    )

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
  try {
    const response = await callApiV1<{ project_id: string; tag_id: string }>(`/projects/${projectId}/tags/${tagId}`, {
      method: 'DELETE',
      idempotencyKey: nextIdempotencyKey('project-tag-remove'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
  const scope = await getAgencyScope(supabase)
  if (!scope) return []

  let query = supabase
    .from('teams')
    .select('*, lead:profiles!teams_lead_id_fkey(id, full_name, avatar_url), members:profiles!profiles_team_id_fkey(id)')
    .order('name', { ascending: true })

  if (!scope.isAdmin) {
    if (!scope.teamId) return []
    query = query.eq('id', scope.teamId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching all teams:', error)
  }

  return data || []
}

export async function getTeam(teamId: string) {
  const supabase = await createClient()
  const scope = await getAgencyScope(supabase)
  if (!scope) return null

  if (!scope.isAdmin) {
    const canAccessOwnTeam = scope.teamId === teamId
    const canAccessAsLead = await isLeadOfTeam(supabase, scope.userId, teamId)
    if (!canAccessOwnTeam && !canAccessAsLead) {
      return null
    }
  }
  
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*, lead:profiles!teams_lead_id_fkey(id, full_name, avatar_url)')
    .eq('id', teamId)
    .single()

  if (teamError) {
    console.error('Error fetching team by ID:', teamError)
  }

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

  const mappedProjects = (projects || []).map((p: { id: string; name: string; status: string; client: { id: string; company_name: string }[] | { id: string; company_name: string } | null }) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    client: Array.isArray(p.client) ? (p.client[0] ?? null) : (p.client ?? null),
  }))

  return { ...team, members: members || [], projects: mappedProjects }
}

export async function getUserTeam(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('team_id')
    .eq('id', userId)
    .single()

  if (!profile?.team_id) return null

  const { data: team, error } = await supabase
    .from('teams')
    .select('*, lead:profiles!teams_lead_id_fkey(id, full_name, avatar_url)')
    .eq('id', profile.team_id)
    .single()

  if (error) {
    console.error('Error fetching user team:', error)
  }

  return team
}

export async function getProjectsByTeam(teamId: string) {
  const supabase = await createClient()
  const scope = await getAgencyScope(supabase)
  if (!scope) return []

  if (!scope.isAdmin) {
    const canAccessOwnTeam = scope.teamId === teamId
    const canAccessAsLead = await isLeadOfTeam(supabase, scope.userId, teamId)
    if (!canAccessOwnTeam && !canAccessAsLead) {
      return []
    }
  }
  
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
    const response = await callApiV1<{ project_id: string; team_id: string | null }>(`/projects/${projectId}/team`, {
      method: 'PUT',
      body: { team_id: teamId },
      idempotencyKey: nextIdempotencyKey('project-team-assign'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
    const response = await callApiV1<{ project_id: string; team_id: string | null }>(`/projects/${projectId}/team`, {
      method: 'PUT',
      body: { team_id: null },
      idempotencyKey: nextIdempotencyKey('project-team-remove'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
    const { data: member } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', userId)
      .single()

    if (!member?.team_id) {
      return { success: true }
    }

    const response = await callApiV1<{ user_id: string; team_id: null }>(
      `/teams/${member.team_id}/members?user_id=${userId}`,
      {
        method: 'DELETE',
        idempotencyKey: nextIdempotencyKey('team-member-remove'),
      }
    )

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
    const response = await callApiV1<{ team_id: string; lead_id: string }>(`/teams/${teamId}/lead`, {
      method: 'PUT',
      body: { user_id: userId },
      idempotencyKey: nextIdempotencyKey('team-lead-set'),
    })

    if (isApiFailure(response)) {
      return { success: false, error: response.error.message }
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
  const scope = await getAgencyScope(supabase)
  if (!scope) return []

  if (!scope.isAdmin) {
    const canAccessOwnTeam = scope.teamId === teamId
    const canAccessAsLead = await isLeadOfTeam(supabase, scope.userId, teamId)
    if (!canAccessOwnTeam && !canAccessAsLead) {
      return []
    }
  }
  
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .eq('team_id', teamId)
    .order('full_name', { ascending: true })

  return data || []
}

export interface UserRoleAndTeam {
  userId: string
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
    userId: user.id,
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
