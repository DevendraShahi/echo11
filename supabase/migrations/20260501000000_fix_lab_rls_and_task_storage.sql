-- Finalize lab scoped access and storage support.
-- The helper functions are SECURITY DEFINER so RLS policies do not recursively
-- query projects/tasks through their own policies.

CREATE OR REPLACE FUNCTION public.lab_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.lab_is_team_lead(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teams
    WHERE id = check_team_id
      AND lead_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.lab_is_member_of_team(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND team_id = check_team_id
  );
$$;

CREATE OR REPLACE FUNCTION public.lab_can_access_project(check_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = check_project_id
      AND (
        public.lab_is_admin()
        OR public.lab_is_team_lead(p.team_id)
        OR EXISTS (
          SELECT 1
          FROM public.tasks t
          WHERE t.project_id = p.id
            AND t.assignee_id = auth.uid()
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.lab_can_manage_project(check_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = check_project_id
      AND (
        public.lab_is_admin()
        OR public.lab_is_team_lead(p.team_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.lab_can_create_project(check_team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.lab_is_admin()
    OR (
      check_team_id IS NOT NULL
      AND public.lab_is_team_lead(check_team_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.lab_can_access_task(check_task_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.projects p ON p.id = t.project_id
    WHERE t.id = check_task_id
      AND (
        public.lab_is_admin()
        OR t.assignee_id = auth.uid()
        OR public.lab_is_team_lead(p.team_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.lab_can_manage_task(check_task_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tasks t
    LEFT JOIN public.projects p ON p.id = t.project_id
    WHERE t.id = check_task_id
      AND (
        public.lab_is_admin()
        OR t.assignee_id = auth.uid()
        OR public.lab_is_team_lead(p.team_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.lab_can_create_task(check_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = check_project_id
      AND (
        public.lab_is_admin()
        OR public.lab_is_team_lead(p.team_id)
      )
  );
$$;

REVOKE ALL ON FUNCTION public.lab_is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lab_is_team_lead(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lab_is_member_of_team(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lab_can_access_project(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lab_can_manage_project(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lab_can_create_project(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lab_can_access_task(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lab_can_manage_task(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lab_can_create_task(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.lab_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.lab_is_team_lead(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lab_is_member_of_team(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lab_can_access_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lab_can_manage_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lab_can_create_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lab_can_access_task(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lab_can_manage_task(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lab_can_create_task(uuid) TO authenticated;

-- Teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated can manage teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can read teams" ON public.teams;
DROP POLICY IF EXISTS "Users can read teams" ON public.teams;
DROP POLICY IF EXISTS "Users can insert teams" ON public.teams;
DROP POLICY IF EXISTS "Users can update teams" ON public.teams;
DROP POLICY IF EXISTS "Users can delete teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can update teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can delete teams" ON public.teams;
DROP POLICY IF EXISTS "Scoped team read" ON public.teams;
DROP POLICY IF EXISTS "Admin team create" ON public.teams;
DROP POLICY IF EXISTS "Lead or admin team update" ON public.teams;
DROP POLICY IF EXISTS "Admin team delete" ON public.teams;

CREATE POLICY "Scoped team read" ON public.teams
  FOR SELECT TO authenticated
  USING (
    public.lab_is_admin()
    OR lead_id = auth.uid()
    OR public.lab_is_member_of_team(id)
  );

CREATE POLICY "Admin team create" ON public.teams
  FOR INSERT TO authenticated
  WITH CHECK (public.lab_is_admin());

CREATE POLICY "Lead or admin team update" ON public.teams
  FOR UPDATE TO authenticated
  USING (public.lab_is_admin() OR lead_id = auth.uid())
  WITH CHECK (public.lab_is_admin() OR lead_id = auth.uid());

CREATE POLICY "Admin team delete" ON public.teams
  FOR DELETE TO authenticated
  USING (public.lab_is_admin());

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Projects readable by all authenticated" ON public.projects;
DROP POLICY IF EXISTS "Scoped project read" ON public.projects;
DROP POLICY IF EXISTS "Lead/admin project write" ON public.projects;
DROP POLICY IF EXISTS "Lead/admin project create" ON public.projects;
DROP POLICY IF EXISTS "Lead/admin project update" ON public.projects;
DROP POLICY IF EXISTS "Lead/admin project delete" ON public.projects;

CREATE POLICY "Scoped project read" ON public.projects
  FOR SELECT TO authenticated
  USING (public.lab_can_access_project(id));

CREATE POLICY "Lead/admin project create" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (public.lab_can_create_project(team_id));

CREATE POLICY "Lead/admin project update" ON public.projects
  FOR UPDATE TO authenticated
  USING (public.lab_can_manage_project(id))
  WITH CHECK (public.lab_can_create_project(team_id));

CREATE POLICY "Lead/admin project delete" ON public.projects
  FOR DELETE TO authenticated
  USING (public.lab_can_manage_project(id));

-- Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tasks readable by all authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Scoped task read" ON public.tasks;
DROP POLICY IF EXISTS "Lead/admin task create" ON public.tasks;
DROP POLICY IF EXISTS "Lead/admin/assignee task update" ON public.tasks;
DROP POLICY IF EXISTS "Lead/admin/assignee task delete" ON public.tasks;
DROP POLICY IF EXISTS "Lead/admin task delete" ON public.tasks;

CREATE POLICY "Scoped task read" ON public.tasks
  FOR SELECT TO authenticated
  USING (public.lab_can_access_task(id));

CREATE POLICY "Lead/admin task create" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (public.lab_can_create_task(project_id));

CREATE POLICY "Lead/admin/assignee task update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (public.lab_can_manage_task(id))
  WITH CHECK (
    public.lab_is_admin()
    OR assignee_id = auth.uid()
    OR public.lab_can_create_task(project_id)
  );

CREATE POLICY "Lead/admin task delete" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    public.lab_is_admin()
    OR public.lab_can_create_task(project_id)
  );

-- Project expenses
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated" ON public.project_expenses;
DROP POLICY IF EXISTS "Scoped project expenses read" ON public.project_expenses;
DROP POLICY IF EXISTS "Lead/admin project expenses write" ON public.project_expenses;

CREATE POLICY "Scoped project expenses read" ON public.project_expenses
  FOR SELECT TO authenticated
  USING (public.lab_can_access_project(project_id));

CREATE POLICY "Lead/admin project expenses write" ON public.project_expenses
  FOR ALL TO authenticated
  USING (public.lab_can_manage_project(project_id))
  WITH CHECK (public.lab_can_manage_project(project_id));

-- Task comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Task comments viewable by all" ON public.task_comments;
DROP POLICY IF EXISTS "Task comments insertable by authenticated" ON public.task_comments;
DROP POLICY IF EXISTS "Task comments deletable by owner" ON public.task_comments;
DROP POLICY IF EXISTS "Task comments scoped read" ON public.task_comments;
DROP POLICY IF EXISTS "Task comments scoped write" ON public.task_comments;
DROP POLICY IF EXISTS "Task comments owner delete" ON public.task_comments;

CREATE POLICY "Task comments scoped read" ON public.task_comments
  FOR SELECT TO authenticated
  USING (public.lab_can_access_task(task_id));

CREATE POLICY "Task comments scoped write" ON public.task_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.lab_can_access_task(task_id));

CREATE POLICY "Task comments owner delete" ON public.task_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.lab_is_admin());

-- Task attachments
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Task attachments viewable by all" ON public.task_attachments;
DROP POLICY IF EXISTS "Task attachments insertable by authenticated" ON public.task_attachments;
DROP POLICY IF EXISTS "Task attachments deletable by owner" ON public.task_attachments;
DROP POLICY IF EXISTS "Task attachments scoped read" ON public.task_attachments;
DROP POLICY IF EXISTS "Task attachments scoped insert" ON public.task_attachments;
DROP POLICY IF EXISTS "Task attachments scoped delete" ON public.task_attachments;

CREATE POLICY "Task attachments scoped read" ON public.task_attachments
  FOR SELECT TO authenticated
  USING (public.lab_can_access_task(task_id));

CREATE POLICY "Task attachments scoped insert" ON public.task_attachments
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND public.lab_can_access_task(task_id));

CREATE POLICY "Task attachments scoped delete" ON public.task_attachments
  FOR DELETE TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.lab_is_admin()
    OR public.lab_can_manage_task(task_id)
  );

-- Time logs
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Time logs viewable by team" ON public.time_logs;
DROP POLICY IF EXISTS "Time logs insertable by authenticated" ON public.time_logs;
DROP POLICY IF EXISTS "Time logs updatable by owner" ON public.time_logs;
DROP POLICY IF EXISTS "Time logs deletable by owner" ON public.time_logs;
DROP POLICY IF EXISTS "Time logs scoped read" ON public.time_logs;
DROP POLICY IF EXISTS "Time logs scoped insert" ON public.time_logs;
DROP POLICY IF EXISTS "Time logs scoped update" ON public.time_logs;
DROP POLICY IF EXISTS "Time logs scoped delete" ON public.time_logs;

CREATE POLICY "Time logs scoped read" ON public.time_logs
  FOR SELECT TO authenticated
  USING (public.lab_can_access_task(task_id));

CREATE POLICY "Time logs scoped insert" ON public.time_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.lab_can_access_task(task_id));

CREATE POLICY "Time logs scoped update" ON public.time_logs
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.lab_is_admin())
  WITH CHECK (user_id = auth.uid() OR public.lab_is_admin());

CREATE POLICY "Time logs scoped delete" ON public.time_logs
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.lab_is_admin());

-- Storage bucket used by task attachment uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Authenticated users can view task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Owners and admins can delete task attachments" ON storage.objects;

CREATE POLICY "Authenticated users can view task attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'task-attachments');

CREATE POLICY "Authenticated users can upload task attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Owners and admins can delete task attachments" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'task-attachments'
    AND (
      owner = auth.uid()
      OR public.lab_is_admin()
    )
  );

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_project ON public.tasks(assignee_id, project_id);
CREATE INDEX IF NOT EXISTS idx_teams_lead_id ON public.teams(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON public.projects(team_id);
