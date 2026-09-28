import { isMissingRelationOrColumnError } from './compat'
import { createClient } from '@/lib/supabase/server'

type SupabaseLike = Awaited<ReturnType<typeof createClient>>

export async function isTeamLead(
  supabase: SupabaseLike,
  userId: string,
  teamId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('teams')
    .select('id')
    .eq('id', teamId)
    .eq('lead_id', userId)
    .single()

  if (error) return false
  return Boolean(data)
}

export async function requireAdminOrLead(
  supabase: SupabaseLike,
  userId: string,
  teamId?: string | null
): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return true
  if (!teamId) {
    const { data: ledTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('lead_id', userId)
      .limit(1)
      .maybeSingle()

    return Boolean(ledTeam)
  }

  return isTeamLead(supabase, userId, teamId)
}

export async function canManageTeam(
  supabase: SupabaseLike,
  userId: string,
  teamId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_manage_team', { check_team_id: teamId })

  if (!error) {
    return Boolean(data)
  }

  if (!isMissingRelationOrColumnError(error)) {
    return false
  }

  return requireAdminOrLead(supabase, userId, teamId)
}

export async function canReadTeam(
  supabase: SupabaseLike,
  userId: string,
  teamId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_read_team', { check_team_id: teamId })

  if (!error) {
    return Boolean(data)
  }

  if (!isMissingRelationOrColumnError(error)) {
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, team_id')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return true
  if (profile?.team_id === teamId) return true
  return isTeamLead(supabase, userId, teamId)
}

export async function canManageProject(
  supabase: SupabaseLike,
  userId: string,
  projectId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_manage_project', { check_project_id: projectId })

  if (!error) {
    return Boolean(data)
  }

  if (!isMissingRelationOrColumnError(error)) {
    return false
  }

  const { data: project } = await supabase
    .from('projects')
    .select('team_id')
    .eq('id', projectId)
    .single()

  return requireAdminOrLead(supabase, userId, (project?.team_id as string | null | undefined) || null)
}

export async function canManageTask(
  supabase: SupabaseLike,
  userId: string,
  taskId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_manage_task', { check_task_id: taskId })

  if (!error) {
    return Boolean(data)
  }

  if (!isMissingRelationOrColumnError(error)) {
    return false
  }

  const { data: task } = await supabase
    .from('tasks')
    .select('project_id, assignee_id')
    .eq('id', taskId)
    .single()

  const isAssignee = task?.assignee_id === userId
  if (isAssignee) return true

  const projectId = (task?.project_id as string | null | undefined) || null
  if (!projectId) return false

  return canManageProject(supabase, userId, projectId)
}
