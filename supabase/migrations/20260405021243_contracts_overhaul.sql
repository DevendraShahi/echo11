-- Add missing columns to contracts table
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_number text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS generated_content text;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_at timestamptz;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS shared_token text;

-- Create contract_templates table if not exists
CREATE TABLE IF NOT EXISTS contract_templates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('nda', 'service_agreement', 'sow', 'retainer', 'custom')),
  content text NOT NULL,
  variables jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active templates" ON contract_templates
  FOR SELECT USING (is_active = true);

-- Seed realistic contract templates
INSERT INTO contract_templates (name, category, content, variables) VALUES
(
  'Non-Disclosure Agreement',
  'nda',
  'NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of {{date}}, by and between:

{{company_name}} ("Disclosing Party")
and
{{client_name}} ("Receiving Party")

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any information, technical data, or know-how, including but not limited to research, product plans, products, services, customers, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information disclosed by the Disclosing Party.

2. OBLIGATIONS
The Receiving Party agrees to:
a) Hold the Confidential Information in strict confidence;
b) Not disclose the Confidential Information to any third parties without prior written consent;
c) Not use the Confidential Information for any purpose other than evaluating a potential business relationship;
d) Take reasonable precautions to protect the Confidential Information.

3. TERM
This Agreement shall remain in effect for a period of two (2) years from the date of execution, unless otherwise agreed upon in writing.

4. VALUE
The total value associated with this engagement is ${{value}}.

5. ADDITIONAL TERMS
{{notes}}

6. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the applicable jurisdiction.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

___________________________          ___________________________
{{company_name}}                     {{client_name}}
Date: {{date}}                       Date: {{date}}',
  '["company_name", "client_name", "client_email", "date", "value", "notes"]'::jsonb
),
(
  'Service Agreement',
  'service_agreement',
  'SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of {{start_date}}, by and between:

{{company_name}} ("Service Provider")
Address: {{client_address}}
and
{{client_name}} ("Client")
Email: {{client_email}}

1. SERVICES
The Service Provider agrees to provide the following services to the Client:
- Professional consulting and development services
- Project management and delivery
- Ongoing support and maintenance as agreed upon

2. TERM
This Agreement shall commence on {{start_date}} and continue until {{end_date}}, unless terminated earlier in accordance with the terms herein.

3. COMPENSATION
The Client agrees to pay the Service Provider the total amount of ${{value}} for the services rendered. Payment terms shall be as follows:
- 30% upon execution of this Agreement
- 40% upon completion of milestone deliverables
- 30% upon final delivery and acceptance

4. OBLIGATIONS OF SERVICE PROVIDER
a) Perform services in a professional and workmanlike manner;
b) Meet all agreed-upon deadlines and deliverables;
c) Provide regular progress reports;
d) Maintain confidentiality of all Client information.

5. OBLIGATIONS OF CLIENT
a) Provide all necessary information and access required for service delivery;
b) Make timely payments as specified herein;
c) Designate a single point of contact for project communications.

6. INTELLECTUAL PROPERTY
All work product, deliverables, and intellectual property created under this Agreement shall become the property of the Client upon full payment.

7. TERMINATION
Either party may terminate this Agreement with thirty (30) days written notice.

8. ADDITIONAL TERMS
{{notes}}

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

___________________________          ___________________________
{{company_name}}                     {{client_name}}
Date: {{start_date}}                 Date: {{start_date}}',
  '["company_name", "client_name", "client_email", "client_address", "start_date", "end_date", "value", "notes"]'::jsonb
),
(
  'Statement of Work',
  'sow',
  'STATEMENT OF WORK

Project: {{project_name}}
Date: {{start_date}}

This Statement of Work ("SOW") is entered into by and between:

{{company_name}} ("Contractor")
and
{{client_name}} ("Client")

1. PROJECT SCOPE
The Contractor shall provide the following services for the {{project_name}} project:
- Requirements analysis and documentation
- Design and architecture
- Development and implementation
- Testing and quality assurance
- Deployment and launch

2. DELIVERABLES
The following deliverables shall be provided:
a) Project requirements document
b) Design specifications
c) Working software/product
d) User documentation
e) Training materials

3. TIMELINE
Project Start Date: {{start_date}}
Project End Date: {{end_date}}

Key Milestones:
- Phase 1: Requirements & Design (Week 1-2)
- Phase 2: Development (Week 3-8)
- Phase 3: Testing & QA (Week 9-10)
- Phase 4: Deployment & Launch (Week 11-12)

4. COMPENSATION
Total Project Value: ${{value}}

Payment Schedule:
- 25% upon SOW execution
- 25% upon completion of Phase 1
- 25% upon completion of Phase 3
- 25% upon final delivery and acceptance

5. ACCEPTANCE CRITERIA
Deliverables shall be deemed accepted when the Client provides written confirmation that the deliverables meet the requirements specified herein.

6. CHANGE MANAGEMENT
Any changes to the scope, timeline, or deliverables must be documented in writing and agreed upon by both parties.

7. ADDITIONAL TERMS
{{notes}}

IN WITNESS WHEREOF, the parties have executed this Statement of Work as of the date first written above.

___________________________          ___________________________
{{company_name}}                     {{client_name}}
Date: {{start_date}}                 Date: {{start_date}}',
  '["company_name", "client_name", "project_name", "start_date", "end_date", "value", "notes"]'::jsonb
),
(
  'Retainer Agreement',
  'retainer',
  'RETAINER AGREEMENT

This Retainer Agreement ("Agreement") is entered into as of {{start_date}}, by and between:

{{company_name}} ("Service Provider")
and
{{client_name}} ("Client")
Email: {{client_email}}

1. RETAINER SERVICES
The Service Provider agrees to provide ongoing services to the Client on a retainer basis, including but not limited to:
- Strategic consulting and advisory
- Technical support and maintenance
- Priority access to resources
- Monthly reporting and reviews

2. TERM
This Agreement shall commence on {{start_date}} and continue on a month-to-month basis until terminated by either party with thirty (30) days written notice.

3. RETAINER FEE
The Client agrees to pay a monthly retainer fee of ${{value}}, payable in advance on the first day of each month.

4. SCOPE OF WORK
The retainer covers up to 40 hours of service per month. Additional hours beyond the retainer scope will be billed at the standard hourly rate.

5. RESPONSE TIME
The Service Provider commits to:
- Initial response within 4 business hours
- Resolution or status update within 24 business hours for urgent matters
- Regular monthly review meetings

6. INVOICING
Invoices shall be issued on the first business day of each month and are due within fifteen (15) days of receipt.

7. TERMINATION
Either party may terminate this Agreement with thirty (30) days written notice. Upon termination, the Client shall pay for all services rendered up to the termination date.

8. ADDITIONAL TERMS
{{notes}}

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

___________________________          ___________________________
{{company_name}}                     {{client_name}}
Date: {{start_date}}                 Date: {{start_date}}',
  '["company_name", "client_name", "client_email", "start_date", "value", "notes"]'::jsonb
),
(
  'Custom Contract',
  'custom',
  'CONTRACT AGREEMENT

Contract Number: {{contract_title}}
Date: {{date}}

This Agreement is entered into by and between:

{{company_name}} ("Party A")
and
{{client_name}} ("Party B")
Email: {{client_email}}
Address: {{client_address}}
Phone: {{client_phone}}

1. PURPOSE
The purpose of this Agreement is to establish the terms and conditions under which Party A shall provide services to Party B.

2. SCOPE OF WORK
[Describe the scope of work, deliverables, and responsibilities of each party]

3. TERM
Start Date: {{start_date}}
End Date: {{end_date}}

4. COMPENSATION
Total Value: ${{value}}

Payment Terms:
[Specify payment schedule, milestones, and conditions]

5. OBLIGATIONS
Party A agrees to:
- [List obligations]

Party B agrees to:
- [List obligations]

6. INTELLECTUAL PROPERTY
[Specify ownership of work product and intellectual property rights]

7. CONFIDENTIALITY
Both parties agree to maintain the confidentiality of all proprietary information shared during the course of this Agreement.

8. TERMINATION
[Specify termination conditions and notice period]

9. DISPUTE RESOLUTION
Any disputes arising from this Agreement shall be resolved through good faith negotiations, mediation, or arbitration as agreed upon by both parties.

10. ADDITIONAL TERMS
{{notes}}

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

___________________________          ___________________________
{{company_name}}                     {{client_name}}
Date: {{date}}                       Date: {{date}}',
  '["company_name", "client_name", "client_email", "client_address", "client_phone", "contract_title", "date", "start_date", "end_date", "value", "notes"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create contracts storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for contracts bucket
CREATE POLICY "Anyone can view contract files" ON storage.objects
  FOR SELECT USING (bucket_id = 'contracts');

CREATE POLICY "Authenticated users can upload contract files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their contract files" ON storage.objects
  FOR DELETE USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');

-- RLS policies for contracts table (if not already exists)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contracts" ON contracts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert contracts" ON contracts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update contracts" ON contracts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete contracts" ON contracts
  FOR DELETE USING (auth.role() = 'authenticated');;
