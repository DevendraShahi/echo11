-- Tighten lab visibility:
-- - Members only see their own team
-- - Members only see projects/tasks assigned to them
-- - Leads/admins retain broader operational access

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Teams
DROP POLICY IF EXISTS "Team members can view teams" ON teams;
DROP POLICY IF EXISTS "Authenticated can manage teams" ON teams;
DROP POLICY IF EXISTS "Anyone can read teams" ON teams;
DROP POLICY IF EXISTS "Users can read teams" ON teams;
DROP POLICY IF EXISTS "Users can insert teams" ON teams;
DROP POLICY IF EXISTS "Users can update teams" ON teams;
DROP POLICY IF EXISTS "Users can delete teams" ON teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON teams;
DROP POLICY IF EXISTS "Admins can update teams" ON teams;
DROP POLICY IF EXISTS "Admins can delete teams" ON teams;

CREATE POLICY "Scoped team read" ON teams
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR lead_id = auth.uid()
    OR id IN (SELECT p.team_id FROM profiles p WHERE p.id = auth.uid() AND p.team_id IS NOT NULL)
  );

CREATE POLICY "Admin team create" ON teams
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Lead or admin team update" ON teams
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR lead_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR lead_id = auth.uid()
  );

CREATE POLICY "Admin team delete" ON teams
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Projects
DROP POLICY IF EXISTS "Projects readable by all authenticated" ON projects;
DROP POLICY IF EXISTS "Scoped project read" ON projects;
DROP POLICY IF EXISTS "Lead/admin project write" ON projects;

CREATE POLICY "Scoped project read" ON projects
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR team_id IN (SELECT tm.id FROM teams tm WHERE tm.lead_id = auth.uid())
    OR id IN (
      SELECT t.project_id
      FROM tasks t
      WHERE t.assignee_id = auth.uid()
        AND t.project_id IS NOT NULL
    )
  );

CREATE POLICY "Lead/admin project write" ON projects
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR team_id IN (SELECT tm.id FROM teams tm WHERE tm.lead_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR team_id IN (SELECT tm.id FROM teams tm WHERE tm.lead_id = auth.uid())
  );

-- Tasks
DROP POLICY IF EXISTS "Tasks readable by all authenticated" ON tasks;
DROP POLICY IF EXISTS "Scoped task read" ON tasks;
DROP POLICY IF EXISTS "Lead/admin/assignee task update" ON tasks;
DROP POLICY IF EXISTS "Lead/admin task create" ON tasks;
DROP POLICY IF EXISTS "Lead/admin/assignee task delete" ON tasks;

CREATE POLICY "Scoped task read" ON tasks
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM teams tm WHERE tm.lead_id = auth.uid())
    OR assignee_id = auth.uid()
  );

CREATE POLICY "Lead/admin task create" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM teams tm WHERE tm.lead_id = auth.uid())
  );

CREATE POLICY "Lead/admin/assignee task update" ON tasks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM teams tm WHERE tm.lead_id = auth.uid())
    OR assignee_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM teams tm WHERE tm.lead_id = auth.uid())
    OR assignee_id = auth.uid()
  );

CREATE POLICY "Lead/admin/assignee task delete" ON tasks
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM teams tm WHERE tm.lead_id = auth.uid())
    OR assignee_id = auth.uid()
  );

-- Project expenses
DROP POLICY IF EXISTS "Allow all authenticated" ON project_expenses;
DROP POLICY IF EXISTS "Scoped project expenses read" ON project_expenses;
DROP POLICY IF EXISTS "Lead/admin project expenses write" ON project_expenses;

CREATE POLICY "Scoped project expenses read" ON project_expenses
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT p.id
      FROM projects p
    )
  );

CREATE POLICY "Lead/admin project expenses write" ON project_expenses
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role = 'admin')
    OR project_id IN (
      SELECT p.id
      FROM projects p
      WHERE p.team_id IN (SELECT tm.id FROM teams tm WHERE tm.lead_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role = 'admin')
    OR project_id IN (
      SELECT p.id
      FROM projects p
      WHERE p.team_id IN (SELECT tm.id FROM teams tm WHERE tm.lead_id = auth.uid())
    )
  );

-- Task comments
DROP POLICY IF EXISTS "Task comments viewable by all" ON task_comments;
DROP POLICY IF EXISTS "Task comments insertable by authenticated" ON task_comments;
DROP POLICY IF EXISTS "Task comments deletable by owner" ON task_comments;
DROP POLICY IF EXISTS "Task comments scoped read" ON task_comments;
DROP POLICY IF EXISTS "Task comments scoped write" ON task_comments;

CREATE POLICY "Task comments scoped read" ON task_comments
  FOR SELECT TO authenticated
  USING (
    task_id IN (SELECT t.id FROM tasks t)
  );

CREATE POLICY "Task comments scoped write" ON task_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND task_id IN (SELECT t.id FROM tasks t)
  );

CREATE POLICY "Task comments owner delete" ON task_comments
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Task attachments
DROP POLICY IF EXISTS "Task attachments viewable by all" ON task_attachments;
DROP POLICY IF EXISTS "Task attachments insertable by authenticated" ON task_attachments;
DROP POLICY IF EXISTS "Task attachments deletable by owner" ON task_attachments;
DROP POLICY IF EXISTS "Task attachments scoped read" ON task_attachments;
DROP POLICY IF EXISTS "Task attachments scoped insert" ON task_attachments;
DROP POLICY IF EXISTS "Task attachments scoped delete" ON task_attachments;

CREATE POLICY "Task attachments scoped read" ON task_attachments
  FOR SELECT TO authenticated
  USING (
    task_id IN (SELECT t.id FROM tasks t)
  );

CREATE POLICY "Task attachments scoped insert" ON task_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND task_id IN (SELECT t.id FROM tasks t)
  );

CREATE POLICY "Task attachments scoped delete" ON task_attachments
  FOR DELETE TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM teams tm WHERE tm.lead_id = auth.uid())
  );

-- Time logs
DROP POLICY IF EXISTS "Time logs viewable by team" ON time_logs;
DROP POLICY IF EXISTS "Time logs insertable by authenticated" ON time_logs;
DROP POLICY IF EXISTS "Time logs updatable by owner" ON time_logs;
DROP POLICY IF EXISTS "Time logs deletable by owner" ON time_logs;
DROP POLICY IF EXISTS "Time logs scoped read" ON time_logs;
DROP POLICY IF EXISTS "Time logs scoped insert" ON time_logs;
DROP POLICY IF EXISTS "Time logs scoped update" ON time_logs;
DROP POLICY IF EXISTS "Time logs scoped delete" ON time_logs;

CREATE POLICY "Time logs scoped read" ON time_logs
  FOR SELECT TO authenticated
  USING (
    task_id IN (SELECT t.id FROM tasks t)
  );

CREATE POLICY "Time logs scoped insert" ON time_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND task_id IN (SELECT t.id FROM tasks t)
  );

CREATE POLICY "Time logs scoped update" ON time_logs
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Time logs scoped delete" ON time_logs
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
