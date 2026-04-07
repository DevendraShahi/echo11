-- Run this EXACT SQL in Supabase SQL Editor to fix the RLS issue

-- Step 1: Drop the existing broken policy
DROP POLICY IF EXISTS "Team can manage project_expenses" ON project_expenses;

-- Step 2: Create new permissive policy
CREATE POLICY "allow_all_authenticated" ON project_expenses
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Verify it worked - should return the new policy
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'project_expenses';