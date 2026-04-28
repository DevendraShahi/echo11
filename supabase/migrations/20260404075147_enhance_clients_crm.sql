-- Enhanced Clients CRM System

-- Add new columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE clients ADD COLUMN IF NOT EXISTS default_hourly_rate decimal(12,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_line2 text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS timezone text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS social_links jsonb;

-- Client Contacts table (multiple contacts per client)
CREATE TABLE IF NOT EXISTS client_contacts (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role text check (role in ('decision_maker', 'stakeholder', 'technical', 'billing', 'other')),
  is_primary boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Client Statuses table (lifecycle tracking)
CREATE TABLE IF NOT EXISTS client_statuses (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  status text not null check (status in ('lead', 'prospect', 'active', 'at_risk', 'inactive')),
  changed_at timestamptz default now(),
  notes text,
  changed_by uuid references profiles(id) on delete set null
);

-- Client Notes table (internal notes)
CREATE TABLE IF NOT EXISTS client_notes (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  content text not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Contract Templates table
CREATE TABLE IF NOT EXISTS contract_templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null check (category in ('nda', 'service_agreement', 'sow', 'retainer', 'custom')),
  content text not null,
  variables jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  status text check (status in ('draft', 'pending', 'signed', 'expired', 'terminated')) default 'draft',
  value decimal(12,2),
  start_date date,
  end_date date,
  document_url text,
  template_id uuid references contract_templates(id) on delete set null,
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Client Documents table
CREATE TABLE IF NOT EXISTS client_documents (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  file_url text not null,
  file_type text,
  file_size int,
  storage_path text,
  category text check (category in ('proposal', 'contract', 'invoice', 'other')) default 'other',
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_statuses_client_id ON client_statuses(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON client_documents(client_id);

-- Enable RLS
ALTER TABLE client_contacts enable row level security;
ALTER TABLE client_statuses enable row level security;
ALTER TABLE client_notes enable row level security;
ALTER TABLE contract_templates enable row level security;
ALTER TABLE contracts enable row level security;
ALTER TABLE client_documents enable row level security;

-- RLS Policies
CREATE POLICY "Team can manage client_contacts" ON client_contacts for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
);

CREATE POLICY "Team can manage client_statuses" ON client_statuses for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
);

CREATE POLICY "Team can manage client_notes" ON client_notes for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
);

CREATE POLICY "Team can manage contract_templates" ON contract_templates for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
);

CREATE POLICY "Team can manage contracts" ON contracts for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
);

CREATE POLICY "Team can manage client_documents" ON client_documents for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
);

-- Insert default contract templates
INSERT INTO contract_templates (name, category, content, variables, is_active) VALUES
('Standard NDA', 'nda', 'NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{date}} between {{company_name}} ("Disclosing Party") and {{client_name}} ("Receiving Party").

1. CONFIDENTIAL INFORMATION
The Receiving Party agrees to hold in confidence all proprietary information, trade secrets, and other confidential information disclosed by the Disclosing Party.

2. OBLIGATIONS
The Receiving Party shall:
- Use the information only for the purpose of evaluating or engaging in business with the Disclosing Party
- Not disclose the information to any third party without prior written consent
- Protect the information using the same degree of care used to protect its own confidential information

3. TERM
This Agreement shall remain in effect for {{term_years}} years from the date of execution.

4. GOVERNING LAW
This Agreement shall be governed by the laws of {{jurisdiction}}.

DISCLOSING PARTY: {{company_name}}
RECEIVING PARTY: {{client_name}}
SIGNATURE: ___________________
DATE: {{date}}', '["company_name", "client_name", "date", "term_years", "jurisdiction"]', true),
('Service Agreement', 'service_agreement', 'SERVICE AGREEMENT

This Service Agreement is entered into as of {{date}} between {{company_name}} ("Provider") and {{client_name}} ("Client").

1. SERVICES
Provider agrees to perform the following services:
{{services_description}}

2. COMPENSATION
Client agrees to pay Provider {{total_value}} for the services described above.
Payment terms: {{payment_terms}}

3. TERM
This agreement begins on {{start_date}} and ends on {{end_date}}.

4. TERMINATION
Either party may terminate this agreement with {{notice_days}} days written notice.

PROVIDER: {{company_name}}
CLIENT: {{client_name}}
SIGNATURE: ___________________
DATE: {{date}}', '["company_name", "client_name", "date", "services_description", "total_value", "payment_terms", "start_date", "end_date", "notice_days"]', true),
('Statement of Work', 'sow', 'STATEMENT OF WORK

Project: {{project_name}}
Client: {{client_name}}
Date: {{date}}

1. PROJECT OVERVIEW
{{project_description}}

2. DELIVERABLES
{{deliverables}}

3. TIMELINE
Start Date: {{start_date}}
End Date: {{end_date}}

4. BUDGET
Total Budget: {{budget}}

5. ACCEPTANCE CRITERIA
{{acceptance_criteria}}

CLIENT: {{client_name}}
PROVIDER: {{company_name}}', '["project_name", "client_name", "date", "project_description", "deliverables", "start_date", "end_date", "budget", "acceptance_criteria"]', true),
('Monthly Retainer', 'retainer', 'MONTHLY RETAINER AGREEMENT

This Retainer Agreement is entered into as of {{date}} between {{company_name}} ("Provider") and {{client_name}} ("Client").

1. SERVICES
Provider agrees to provide the following services on a monthly basis:
{{monthly_services}}

2. RETAINER FEE
Client agrees to pay a monthly retainer of {{monthly_rate}}.
Payment due on the {{payment_day}} of each month.

3. TERM
This agreement begins on {{start_date}} and continues on a month-to-month basis.
Either party may terminate with {{notice_days}} days written notice.

4. HOURS INCLUDED
This retainer includes {{hours_included}} hours per month. Additional hours will be billed at {{hourly_rate}} per hour.

PROVIDER: {{company_name}}
CLIENT: {{client_name}}
SIGNATURE: ___________________
DATE: {{date}}', '["company_name", "client_name", "date", "monthly_services", "monthly_rate", "payment_day", "start_date", "notice_days", "hours_included", "hourly_rate"]', true),
('Custom Contract', 'custom', 'CUSTOM CONTRACT

This Custom Contract is entered into as of {{date}} between {{company_name}} and {{client_name}}.

TERMS AND CONDITIONS:
{{custom_terms}}

COMPANY: {{company_name}}
CLIENT: {{client_name}}
SIGNATURE: ___________________
DATE: {{date}}', '["company_name", "client_name", "date", "custom_terms"]', true);

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('client-documents', 'client-documents', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Team can upload client documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'client-documents' AND
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
);

CREATE POLICY "Team can view client documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'client-documents' AND
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
);

CREATE POLICY "Team can delete client documents" ON storage.objects FOR DELETE USING (
  bucket_id = 'client-documents' AND
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'member'))
);

-- Trigger for updated_at on new tables
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;;
