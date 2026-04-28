-- User preferences table for settings
create table if not exists user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade unique,
  email_notifications boolean default true,
  task_reminders boolean default true,
  meeting_reminders boolean default true,
  theme text default 'dark' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table user_preferences enable row level security;

-- Users can read their own preferences
create policy "User can read own preferences" on user_preferences
  for select using (user_id = auth.uid());

-- Users can update their own preferences
create policy "User can update own preferences" on user_preferences
  for update using (user_id = auth.uid());

-- Insert default preferences for existing users (will be created on first save if not exists)
-- This is a trigger to auto-create preferences on user creation
create or replace function create_user_preferences()
returns trigger as $$
begin
  insert into user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to auto-create preferences when a new profile is created
create trigger on_profile_created
  after insert on profiles
  for each row
  execute function create_user_preferences();;
