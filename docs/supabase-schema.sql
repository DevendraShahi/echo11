-- echo11Lab Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'member', 'client')) default 'member',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Clients table
create table clients (
  id uuid default uuid_generate_v4() primary key,
  company_name text not null,
  contact_name text,
  email text not null unique,
  phone text,
  address text,
  notes text,
  auth_id uuid references auth.users(id) on delete set null,
  profile_id uuid references profiles(id) on delete set null,
  invitation_sent_at timestamptz,
  invitation_token text,
  invitation_accepted_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects table
create table projects (
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
create table milestones (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  description text,
  weight integer default 0 check (weight >= 0 and weight <= 100),
  due_date date,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Services catalog table
create table services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null,
  description text,
  default_rate decimal(12,2) default 0,
  unit text default 'fixed' check (unit in ('hour', 'month', 'fixed', 'item')),
  created_at timestamptz default now()
);

-- Project expenses/line items table
create table project_expenses (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  description text,
  quantity decimal(10,2) default 1,
  rate decimal(12,2) not null,
  amount decimal(12,2) not null,
  created_at timestamptz default now()
);

-- Tasks table
create table tasks (
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
create table meetings (
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
create table meeting_attendees (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  unique(meeting_id, profile_id)
);

-- Invoices table
create table invoices (
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
create table invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references invoices(id) on delete cascade,
  description text not null,
  quantity decimal(10,2) default 1,
  rate decimal(12,2) not null,
  amount decimal(12,2) not null,
  sort_order integer default 0
);

-- Activity Feed table
create table activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

-- Notifications table
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Create indexes for better performance
create index idx_projects_client_id on projects(client_id);
create index idx_projects_status on projects(status);
create index idx_tasks_project_id on tasks(project_id);
create index idx_tasks_status on tasks(status);
create index idx_tasks_assignee_id on tasks(assignee_id);
create index idx_milestones_project_id on milestones(project_id);
create index idx_meetings_scheduled_at on meetings(scheduled_at);
create index idx_invoices_client_id on invoices(client_id);
create index idx_invoices_status on invoices(status);
create index idx_activities_created_at on activities(created_at);
create index idx_notifications_user_id on notifications(user_id);
create index idx_project_expenses_project_id on project_expenses(project_id);
create index idx_services_category on services(category);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table milestones enable row level security;
alter table tasks enable row level security;
alter table meetings enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table activities enable row level security;
alter table comments enable row level security;
alter table notifications enable row level security;
alter table services enable row level security;
alter table project_expenses enable row level security;

-- RLS Policies for Profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- RLS Policies for Clients (team members can do everything)
create policy "Team can manage clients" on clients
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- RLS Policies for Projects
create policy "Team can manage projects" on projects
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- RLS Policies for Tasks
create policy "Team can manage tasks" on tasks
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- RLS Policies for Milestones
create policy "Team can manage milestones" on milestones
  for all using (
    exists (select 1 from profiles p 
      join projects pr on pr.id = milestones.project_id 
      where p.id = auth.uid() and p.role in ('admin', 'member'))
  );

-- RLS Policies for Meetings
create policy "Team can manage meetings" on meetings
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- RLS Policies for Invoices (sensitive - only team)
create policy "Team can manage invoices" on invoices
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- RLS Policies for Activities
create policy "Team can view activities" on activities
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

create policy "Team can create activities" on activities
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- RLS Policies for Comments
create policy "Team can manage comments" on comments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- RLS Policies for Notifications
create policy "Users can view own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'member')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

create trigger update_clients_updated_at
  before update on clients
  for each row execute procedure update_updated_at();

create trigger update_projects_updated_at
  before update on projects
  for each row execute procedure update_updated_at();

create trigger update_tasks_updated_at
  before update on tasks
  for each row execute procedure update_updated_at();

create trigger update_invoices_updated_at
  before update on invoices
  for each row execute procedure update_updated_at();

-- RLS Policies for Services
create policy "Team can manage services" on services
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
  );

-- RLS Policies for Project Expenses
create policy "Team can manage project_expenses" on project_expenses
  for all using (
    exists (select 1 from profiles p 
      join projects pr on pr.id = project_expenses.project_id 
      where p.id = auth.uid() and p.role in ('admin', 'member'))
  );

-- Insert default services
insert into services (name, category, description, default_rate, unit) values
('Frontend Development', 'Development', 'Frontend development services', 50, 'hour'),
('Backend Development', 'Development', 'Backend development services', 60, 'hour'),
('Full Stack Development', 'Development', 'Full stack web development', 70, 'hour'),
('API Development', 'Development', 'RESTful API development', 55, 'hour'),
('Database Design', 'Development', 'Database architecture and design', 45, 'hour'),
('UI Design', 'Design', 'User interface design', 45, 'hour'),
('UX Design', 'Design', 'User experience design', 50, 'hour'),
('Logo Design', 'Design', 'Logo and brand identity', 300, 'fixed'),
('Prototyping', 'Design', 'Interactive prototypes', 250, 'fixed'),
('Domain Purchase', 'Domain & Hosting', 'Domain name registration', 15, 'item'),
('Annual Hosting', 'Domain & Hosting', 'Web hosting (yearly)', 120, 'fixed'),
('SSL Certificate', 'Domain & Hosting', 'SSL security certificate', 50, 'fixed'),
('Server Setup', 'Domain & Hosting', 'Server configuration', 100, 'fixed'),
('Monthly Maintenance', 'Maintenance', 'Monthly website maintenance', 150, 'month'),
('Support Hours', 'Maintenance', 'Technical support hours', 40, 'hour'),
('Training', 'Other', 'Client training session', 75, 'hour'),
('Documentation', 'Other', 'Project documentation', 200, 'fixed'),
('Consultation', 'Other', 'Technical consultation', 100, 'hour');
