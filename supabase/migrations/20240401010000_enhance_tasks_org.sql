-- Teams, Time Logs, Task Comments, Project Tags and Types

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add team_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Time logs table
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project tags table
CREATE TABLE IF NOT EXISTS project_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project tag assignments (many-to-many)
CREATE TABLE IF NOT EXISTS project_tag_assignments (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES project_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- Add type column to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'website';

-- Add columns to tasks for enhanced tracking
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2);

-- RLS Policies

-- Teams RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view teams" ON teams FOR SELECT
  USING (true);
CREATE POLICY "Authenticated can manage teams" ON teams FOR ALL
  USING (auth.role() = 'authenticated');

-- Time logs RLS
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Time logs viewable by team" ON time_logs FOR SELECT
  USING (
    user_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Time logs insertable by authenticated" ON time_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Time logs updatable by owner" ON time_logs FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "Time logs deletable by owner" ON time_logs FOR DELETE
  USING (user_id = auth.uid());

-- Task comments RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Task comments viewable by all" ON task_comments FOR SELECT
  USING (true);
CREATE POLICY "Task comments insertable by authenticated" ON task_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Task comments deletable by owner" ON task_comments FOR DELETE
  USING (user_id = auth.uid());

-- Project tags RLS
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project tags viewable by all" ON project_tags FOR SELECT
  USING (true);
CREATE POLICY "Project tags manageable by authenticated" ON project_tags FOR ALL
  USING (auth.role() = 'authenticated');

-- Project tag assignments RLS
ALTER TABLE project_tag_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tag assignments viewable by all" ON project_tag_assignments FOR SELECT
  USING (true);
CREATE POLICY "Tag assignments manageable by authenticated" ON project_tag_assignments FOR ALL
  USING (auth.role() = 'authenticated');

-- Profiles RLS update (team_id column)
DROP POLICY IF EXISTS "Team can manage profiles" ON profiles;
CREATE POLICY "Profile updates by user or admin" ON profiles FOR UPDATE
  USING (
    id = auth.uid() 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_logs_task_id ON time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_id ON time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tag_assignments_project_id ON project_tag_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tag_assignments_tag_id ON project_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);