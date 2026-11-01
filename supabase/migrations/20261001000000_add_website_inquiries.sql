create table if not exists public.website_inquiries (
  id uuid primary key default gen_random_uuid(),
  offer_path text not null check (offer_path in ('foundation', 'custom')),
  project_type text not null check (project_type in ('ecommerce', 'service', 'saas', 'web-app', 'other')),
  name varchar(120) not null,
  email varchar(320) not null,
  company varchar(160) not null,
  current_website varchar(500),
  budget_range text not null check (budget_range in ('below-start', 'starting-range', 'expanded-range', 'not-sure')),
  timeline text not null check (timeline in ('as-soon-as-possible', 'one-to-two-months', 'three-to-six-months', 'flexible')),
  goals text not null check (char_length(goals) between 20 and 5000),
  reference_project varchar(80),
  source_path varchar(500) not null,
  country_code varchar(2),
  currency varchar(3) not null check (currency in ('USD', 'CAD', 'NPR')),
  utm_source varchar(160),
  utm_medium varchar(160),
  utm_campaign varchar(160),
  status text not null default 'new' check (status in ('new', 'reviewing', 'qualified', 'archived')),
  notification_sent boolean not null default false,
  notified_at timestamptz,
  notification_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_inquiries_created_at_idx
  on public.website_inquiries (created_at desc);

create index if not exists website_inquiries_email_idx
  on public.website_inquiries (lower(email), created_at desc);

alter table public.website_inquiries enable row level security;

revoke all on table public.website_inquiries from anon, authenticated;
grant all on table public.website_inquiries to service_role;

comment on table public.website_inquiries is
  'Website sales inquiries. Accessible only through trusted server-side service role operations.';
