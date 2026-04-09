export type UserRole = 'admin' | 'member' | 'client'

export type Theme = 'light' | 'dark' | 'system'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  team_id: string | null
  job_title?: string | null
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  task_reminders: boolean
  meeting_reminders: boolean
  theme: Theme
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  company_name: string
  contact_name: string | null
  email: string
  phone: string | null
  address: string | null
  notes: string | null
  auth_id: string | null
  profile_id: string | null
  invitation_sent_at: string | null
  invitation_token: string | null
  invitation_token_expires_at: string | null
  invitation_accepted_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  website: string | null
  industry: string | null
  source: string | null
  tags: string[] | null
  default_hourly_rate: number | null
  address_line2: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  timezone: string | null
  social_links: Record<string, string> | null
  contacts?: ClientContact[]
  current_status?: ClientStatus
}

export type ClientLifecycleStatus = 'lead' | 'prospect' | 'active' | 'at_risk' | 'inactive'
export type ClientSource = 'referral' | 'cold_outreach' | 'website' | 'marketplace' | 'other'
export type ContactRole = 'decision_maker' | 'stakeholder' | 'technical' | 'billing' | 'other'

export interface ClientContact {
  id: string
  client_id: string
  name: string
  email: string | null
  phone: string | null
  role: ContactRole | null
  is_primary: boolean
  notes: string | null
  created_at: string
}

export interface ClientStatus {
  id: string
  client_id: string
  status: ClientLifecycleStatus
  changed_at: string
  notes: string | null
  changed_by: string | null
}

export interface ClientNote {
  id: string
  client_id: string
  content: string
  created_by: string | null
  created_at: string
  user?: Profile
}

export type DocumentCategory = 'proposal' | 'contract' | 'invoice' | 'other'

export interface ClientDocument {
  id: string
  client_id: string
  name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  storage_path: string | null
  category: DocumentCategory
  uploaded_by: string | null
  created_at: string
  user?: Profile
}

export type ContractStatus = 'draft' | 'pending' | 'signed' | 'expired' | 'terminated'
export type ContractCategory = 'nda' | 'service_agreement' | 'sow' | 'retainer' | 'custom'

export interface ContractTemplate {
  id: string
  name: string
  category: ContractCategory
  content: string
  variables: string[]
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface Contract {
  id: string
  client_id: string
  title: string
  contract_number: string | null
  status: ContractStatus | null
  value: number | null
  start_date: string | null
  end_date: string | null
  document_url: string | null
  file_url: string | null
  file_name: string | null
  generated_content: string | null
  template_id: string | null
  notes: string | null
  sent_at: string | null
  signed_at: string | null
  shared_token: string | null
  created_by: string | null
  created_at: string
  client?: Client
  template?: ContractTemplate
}

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived'
export type ProjectType = 'website' | 'mobile' | 'branding' | 'consulting' | 'other'

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  type?: ProjectType
  client_id: string | null
  budget: number | null
  start_date: string | null
  deadline: string | null
  progress: number
  color: string
  link: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  client?: Client
  tags?: ProjectTag[]
}

export interface Milestone {
  id: string
  project_id: string
  name: string
  description: string | null
  weight: number
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
}

export type ServiceCategory = 'Development' | 'Design' | 'Domain & Hosting' | 'Maintenance' | 'Other'
export type ServiceUnit = 'hour' | 'month' | 'fixed' | 'item'

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  description: string | null
  default_rate: number
  unit: ServiceUnit
  created_at: string
}

export interface ProjectExpense {
  id: string
  project_id: string
  service_id: string | null
  description: string | null
  quantity: number
  rate: number
  amount: number
  created_at: string
  service?: Service
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  due_date: string | null
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
  assignee?: Profile
  project?: Project
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string | null
  content: string
  created_at: string
  user?: Profile
}

export interface TaskAttachment {
  id: string
  task_id: string
  file_name: string
  file_path: string
  file_type: string | null
  file_size: number | null
  uploaded_by: string | null
  created_at: string
  user?: Profile
}

export interface TimeLog {
  id: string
  task_id: string
  user_id: string | null
  hours: number
  date: string
  notes: string | null
  created_at: string
  user?: Profile
}

export interface Team {
  id: string
  name: string
  description: string | null
  lead_id: string | null
  color: string | null
  created_at: string
  updated_at: string | null
  lead?: Profile
  members?: Profile[]
  projects?: Project[]
}

export interface ProjectTag {
  id: string
  name: string
  color: string
}

export interface Meeting {
  id: string
  project_id: string | null
  title: string
  description: string | null
  scheduled_at: string
  duration_minutes: number
  video_link: string | null
  location: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  project?: Project
  attendees?: MeetingAttendee[]
}

export interface MeetingAttendee {
  id: string
  meeting_id: string
  profile_id: string
  status: 'pending' | 'accepted' | 'declined'
  profile?: Profile
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoice_number: string
  project_id: string | null
  client_id: string | null
  status: InvoiceStatus
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  due_date: string | null
  paid_date: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  target_currency?: string | null
  exchange_rate?: number | null
  converted_total?: number | null
  conversion_date?: string | null
  project?: Project
  client?: Client
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  rate: number
  amount: number
  sort_order: number
}

export interface Activity {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  user?: Profile
}

export interface ClientActivity extends Activity {
  user?: Profile
}

export interface Comment {
  id: string
  task_id: string
  user_id: string | null
  content: string
  created_at: string
  user?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  link: string | null
  read: boolean
  created_at: string
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  totalRevenue: number
  pendingInvoices: number
  upcomingMeetings: number
}
