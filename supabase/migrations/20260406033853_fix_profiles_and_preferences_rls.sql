-- Fix RLS policies for profiles table
-- Add UPDATE policy so users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Fix RLS policies for user_preferences table  
-- Add INSERT policy so users can create their own preferences
CREATE POLICY "User can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also add DELETE policy for completeness
CREATE POLICY "User can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Create user_preferences for existing user if not exists
INSERT INTO user_preferences (user_id) 
SELECT id FROM profiles 
WHERE id = 'bcfc855c-1c5f-41d4-b556-9e5364df5d2e'
ON CONFLICT (user_id) DO NOTHING;;
