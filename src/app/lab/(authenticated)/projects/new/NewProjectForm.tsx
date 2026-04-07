'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LabButton } from '@/components/ui/LabButton'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { ClientSelect } from '@/components/lab/ClientSelect'
import { ExpenseForm } from '@/components/lab/ExpenseForm'
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Client, Service, ProjectStatus, ProjectType } from '@/types/lab'

const PROJECT_COLORS = [
  '#00E5FF',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
]

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'mobile', label: 'Mobile App' },
  { value: 'branding', label: 'Branding' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS: DropdownOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

interface ExpenseItem {
  id: string
  service_id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface NewProjectFormProps {
  clients: Client[]
  services: Service[]
}

export function NewProjectForm({ clients, services }: NewProjectFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const statusOptions: DropdownOption[] = STATUS_OPTIONS

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'active' as ProjectStatus,
    type: 'website' as ProjectType,
    start_date: '',
    deadline: '',
    progress: 0,
    color: PROJECT_COLORS[0],
    link: '',
  } as { name: string; description: string; client_id: string; status: ProjectStatus; type: ProjectType; start_date: string; deadline: string; progress: number; color: string; link: string })

  const [expenses, setExpenses] = useState<ExpenseItem[]>([])

  const totalBudget = expenses.reduce((sum, e) => sum + e.amount, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/lab/auth/login')
        return
      }

      const { data: project, error: insertError } = await supabase.from('projects').insert({
        name: formData.name,
        description: formData.description || null,
        client_id: formData.client_id || null,
        status: formData.status,
        type: formData.type,
        budget: totalBudget || null,
        start_date: formData.start_date || null,
        deadline: formData.deadline || null,
        progress: formData.progress,
        color: formData.color,
        link: formData.link || null,
        created_by: user.id,
      }).select().single()

      if (insertError) {
        setError(insertError.message)
        return
      }

      // Insert expenses
      if (expenses.length > 0 && project) {
        const expenseData = expenses
          .filter(e => (e.service_id || e.description) && e.amount > 0)
          .map(e => ({
            project_id: project.id,
            service_id: e.service_id || null,
            description: e.description || e.service_id || null,
            quantity: e.quantity,
            rate: e.rate,
            amount: e.amount,
          }))

        if (expenseData.length > 0) {
          const { error: expenseError } = await supabase.from('project_expenses').insert(expenseData)
          if (expenseError) {
            setError('Failed to save expenses: ' + expenseError.message)
            return
          }
        }
      }

      // Log activity (don't fail if this fails)
      try {
        await supabase.from('activities').insert({
          user_id: user.id,
          action: 'created a new project',
          entity_type: 'project',
        })
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError)
      }

      router.push('/lab/projects')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/lab/projects" className="inline-flex mb-6">
        <LabButton variant="ghost" size="sm" className="font-sans">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </LabButton>
      </Link>

      <LabCard>
        <LabCardHeader>
          <LabCardTitle className="font-sans">Create New Project</LabCardTitle>
        </LabCardHeader>
        <LabCardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-sans">
                {error}
              </div>
            )}

            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/50 font-sans uppercase tracking-wider">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-sans">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-sans">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans resize-none"
                  placeholder="Describe the project..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-sans">
                    Client
                  </label>
                  <ClientSelect
                    clients={clients}
                    selectedClientId={formData.client_id}
                    onChange={(clientId) => setFormData({ ...formData, client_id: clientId })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-sans">
                    Type
                  </label>
                  <Dropdown
                    options={PROJECT_TYPES.map(t => ({ value: t.value, label: t.label }))}
                    value={formData.type}
                    onChange={(val) => setFormData({ ...formData, type: val as ProjectType })}
                    placeholder="Select type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-sans">
                    Status
                  </label>
                  <Dropdown
                    options={statusOptions}
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val as ProjectStatus })}
                    placeholder="Select status"
                  />
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/50 font-sans uppercase tracking-wider">Timeline</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-sans">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2 font-sans">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Services/Expenses Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/50 font-sans uppercase tracking-wider">Services & Budget</h3>
              
              <ExpenseForm
                services={services}
                expenses={expenses}
                onChange={setExpenses}
              />
            </div>

            {/* Additional Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/50 font-sans uppercase tracking-wider">Additional</h3>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-sans">
                  Project Color
                </label>
                <div className="flex gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-sans">
                  Project Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Link href="/lab/projects">
                <LabButton type="button" variant="ghost" className="font-sans">
                  Cancel
                </LabButton>
              </Link>
              <LabButton type="submit" disabled={loading} className="font-sans">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </LabButton>
            </div>
          </form>
        </LabCardContent>
      </LabCard>
    </div>
  )
}
