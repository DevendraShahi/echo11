-- More permissive RLS for project_expenses
-- Run this in Supabase SQL Editor

-- Drop the existing policy
DROP POLICY IF EXISTS "Team can manage project_expenses" ON project_expenses;

-- Allow any authenticated user (simplest fix for now)
CREATE POLICY "Allow authenticated users" ON project_expenses
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Also check if profiles table has the current user
-- This should help if profile exists
SELECT 
  p.id, 
  p.email, 
  p.role,
  (SELECT COUNT(*) FROM projects WHERE client_id IN (SELECT id FROM clients WHERE profile_id = p.id)) as project_count
FROM profiles p
WHERE p.role IN ('admin', 'member')
ORDER BY p.created_at DESC
LIMIT 10;