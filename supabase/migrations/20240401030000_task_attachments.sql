-- Task Attachments table for file uploads

-- Create task_attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for task_attachments
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task attachments viewable by all" ON task_attachments
  FOR SELECT USING (true);

CREATE POLICY "Task attachments insertable by authenticated" ON task_attachments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Task attachments deletable by owner" ON task_attachments
  FOR DELETE USING (
    uploaded_by = auth.uid() 
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_uploaded_by ON task_attachments(uploaded_by);