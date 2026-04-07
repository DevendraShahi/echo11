-- Fix RLS for project_expenses table
DROP POLICY IF EXISTS "Team can manage project_expenses" ON project_expenses;
DROP POLICY IF EXISTS "Allow authenticated users" ON project_expenses;
DROP POLICY IF EXISTS "Allow all authenticated" ON project_expenses;

CREATE POLICY "Allow all authenticated" ON project_expenses
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');