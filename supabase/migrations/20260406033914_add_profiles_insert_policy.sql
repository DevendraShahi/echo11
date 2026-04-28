-- Add INSERT policy for profiles (in case users need to create their profile)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add DELETE policy for profiles (admin only typically, but let's be consistent)
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);;
