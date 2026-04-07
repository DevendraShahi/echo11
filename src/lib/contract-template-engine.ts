import { format } from 'date-fns'

export interface TemplateVariables {
  company_name: string
  client_name: string
  client_email: string
  client_address: string
  client_phone: string
  contract_title: string
  project_name: string
  date: string
  start_date: string
  end_date: string
  value: string
  notes: string
}

export function getDefaultVariables(): TemplateVariables {
  return {
    company_name: '',
    client_name: '',
    client_email: '',
    client_address: '',
    client_phone: '',
    contract_title: '',
    project_name: '',
    date: format(new Date(), 'MMMM d, yyyy'),
    start_date: '',
    end_date: '',
    value: '0',
    notes: ''
  }
}

export function substituteVariables(
  templateContent: string,
  variables: Partial<TemplateVariables>
): string {
  let result = templateContent

  const replacements: Record<string, string> = {
    '{{company_name}}': variables.company_name || '[Company Name]',
    '{{client_name}}': variables.client_name || '[Client Name]',
    '{{client_email}}': variables.client_email || '[client@email.com]',
    '{{client_address}}': variables.client_address || '[Address]',
    '{{client_phone}}': variables.client_phone || '[Phone]',
    '{{contract_title}}': variables.contract_title || '[Contract Title]',
    '{{project_name}}': variables.project_name || '[Project Name]',
    '{{date}}': variables.date || format(new Date(), 'MMMM d, yyyy'),
    '{{start_date}}': variables.start_date ? format(new Date(variables.start_date), 'MMMM d, yyyy') : '[Start Date]',
    '{{end_date}}': variables.end_date ? format(new Date(variables.end_date), 'MMMM d, yyyy') : '[End Date]',
    '{{value}}': variables.value ? Number(variables.value).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00',
    '{{notes}}': variables.notes || '[Additional Terms]'
  }

  for (const [placeholder, replacement] of Object.entries(replacements)) {
    result = result.split(placeholder).join(replacement)
  }

  return result
}

export function extractVariablesFromTemplate(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g)
  if (!matches) return []
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))]
}
