import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

const schema = `
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'member', 'client')) default 'member',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clients table
create table if not exists clients (
  id uuid default uuid_generate_v4() primary key,
  company_name text not null,
  contact_name text,
  email text not null,
  phone text,
  address text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects table
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  status text check (status in ('active', 'on_hold', 'completed', 'archived')) default 'active',
  client_id uuid references clients(id) on delete set null,
  budget decimal(12,2),
  start_date date,
  deadline date,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  color text default '#6366F1',
  link text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Milestones table
create table if not exists milestones (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  description text,
  due_date date,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Tasks table
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text check (status in ('todo', 'in_progress', 'review', 'done')) default 'todo',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  assignee_id uuid references profiles(id) on delete set null,
  due_date date,
  sort_order integer default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Meetings table
create table if not exists meetings (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  duration_minutes integer default 60,
  video_link text,
  location text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Meeting Attendees table
create table if not exists meeting_attendees (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  unique(meeting_id, profile_id)
);

-- Invoices table
create table if not exists invoices (
  id uuid default uuid_generate_v4() primary key,
  invoice_number text unique not null,
  project_id uuid references projects(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  status text check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')) default 'draft',
  subtotal decimal(12,2) not null,
  tax_rate decimal(5,2) default 0,
  tax_amount decimal(12,2) default 0,
  total decimal(12,2) not null,
  due_date date,
  paid_date date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoice Items table
create table if not exists invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references invoices(id) on delete cascade,
  description text not null,
  quantity decimal(10,2) default 1,
  rate decimal(12,2) not null,
  amount decimal(12,2) not null,
  sort_order integer default 0
);

-- Activity Feed table
create table if not exists activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Comments table
create table if not exists comments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

-- Notifications table
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);
`

async function setupDatabase() {
  console.log('Setting up database...')
  console.log('Project URL:', supabaseUrl)

  const statements = schema.split(';').filter(s => s.trim())
  
  for (const sql of statements) {
    if (sql.trim()) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql })
        if (error) {
          console.log('RPC error (may not exist yet):', error.message)
        }
      } catch (e) {
        console.log('Error:', e.message)
      }
    }
  }
  
  // Try creating tables directly via POST
  console.log('\nTrying direct table creation...')
  
  // Create profiles table
  const { error: profileError } = await supabase.from('profiles').select('*').limit(1)
  if (profileError && profileError.code === '42P01') {
    console.log('Creating tables manually...')
    
    // Use pg_catalog to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS profiles (
        id uuid references auth.users on delete cascade primary key,
        email text unique not null,
        full_name text,
        avatar_url text,
        role text check (role in ('admin', 'member', 'client')) default 'member',
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );`
    })
    
    if (error) console.log('Profile table creation:', error.message)
    else console.log('Profile table created!')
  } else {
    console.log('Tables already exist!')
  }
  
  // Create indexes
  console.log('\nCreating indexes...')
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id)',
    'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id)',
    'CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id)',
    'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
    'CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
  ]
  
  for (const idx of indexes) {
    try {
      await supabase.rpc('exec_sql', { sql: idx })
    } catch (e) {
      // Ignore errors
    }
  }
  
  console.log('Done!')
}

setupDatabase().catch(console.error)
