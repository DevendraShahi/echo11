'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
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

function isMissingCreatedBySchemaError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === 'PGRST204' && error.message?.includes("'created_by' column of 'teams'") === true
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
  const supabase = await createClient()
  const userId = await getUserId(supabase)

  if (!userId) {
    return { success: false, error: 'You must be logged in' }
  }

  if (!data.name?.trim()) {
    return { success: false, error: 'Team name is required' }
  }

  try {
    const teamPayload = {
      name: data.name.trim(),
      description: data.description || null,
      lead_id: data.lead_id || null,
      color: data.color || '#6366f1',
    }

    let insertResult = await supabase
      .from('teams')
      .insert({
        ...teamPayload,
        created_by: userId,
      })
      .select()
      .single()

    // Backward compatibility for environments where the migration adding teams.created_by is pending.
    if (isMissingCreatedBySchemaError(insertResult.error)) {
      insertResult = await supabase
        .from('teams')
        .insert(teamPayload)
        .select()
        .single()
    }

    const { data: team, error } = insertResult

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

  if (data.name !== undefined && !data.name?.trim()) {
    return { success: false, error: 'Team name cannot be empty' }
  }

  const updatePayload: TeamUpdateData & { updated_at: string } = {
    ...data,
    ...(data.name ? { name: data.name.trim() } : {}),
    updated_at: new Date().toISOString()
  }

  try {
    const { error } = await supabase
      .from('teams')
      .update(updatePayload)
      .eq('id', teamId)

    if (error) {
      return { success: false, error: error.message }
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
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Clear FK references before deleting
    await supabaseAdmin.from('profiles').update({ team_id: null }).eq('team_id', teamId)
    await supabaseAdmin.from('projects').update({ team_id: null }).eq('team_id', teamId)

    const { error } = await supabaseAdmin
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
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ team_id: teamId })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Notify user of assignment
    if (teamId) {
       const { data: teamInfo } = await supabaseAdmin.from('teams').select('name').eq('id', teamId).single()
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
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
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
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
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
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
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
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
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
