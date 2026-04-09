'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProject, deleteProject } from '@/lib/actions/project-actions'
import { LabButton } from '@/components/ui/LabButton'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { ClientSelect } from '@/components/lab/ClientSelect'
import { ExpenseForm } from '@/components/lab/ExpenseForm'
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown'
import { ArrowLeft, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Client, Service, Project, ProjectStatus, ProjectType, ProjectExpense } from '@/types/lab'

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

const STATUS_OPTIONS: DropdownOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'mobile', label: 'Mobile App' },
  { value: 'branding', label: 'Branding' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
]

interface ExpenseItem {
  id: string
  service_id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface EditProjectFormProps {
  project: Project & { client?: Client | null }
  clients: Client[]
  services: Service[]
  expenses: ProjectExpense[]
}

export function EditProjectForm({ project, clients, services, expenses: initialExpenses }: EditProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    client_id: project.client_id || '',
    status: project.status,
    type: project.type || 'website',
    start_date: project.start_date || '',
    deadline: project.deadline || '',
    progress: project.progress,
    color: project.color,
    link: project.link || '',
  } as { name: string; description: string; client_id: string; status: ProjectStatus; type: ProjectType; start_date: string; deadline: string; progress: number; color: string; link: string })

  const [expenses, setExpenses] = useState<ExpenseItem[]>(
    initialExpenses.map(e => ({
      id: e.id,
      service_id: e.service_id || '',
      description: e.description || '',
      quantity: e.quantity,
      rate: e.rate,
      amount: e.amount,
    }))
  )
  const statusOptions: DropdownOption[] = STATUS_OPTIONS

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await updateProject(project.id, {
      name: formData.name,
      description: formData.description || null,
      client_id: formData.client_id || null,
      status: formData.status,
      start_date: formData.start_date || null,
      deadline: formData.deadline || null,
      progress: formData.progress,
      color: formData.color,
      link: formData.link || null,
    }, expenses)

    if (result.success) {
      router.push(`/lab/projects/${project.id}`)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update project')
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteProject(project.id)
    
    if (result.success) {
      router.push('/lab/projects')
      router.refresh()
    } else {
      setError(result.error || 'Failed to delete project')
      setShowDeleteConfirm(false)
    }
    setDeleting(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/lab/projects/${project.id}`} className="inline-flex mb-6">
        <LabButton variant="ghost" size="sm" className="font-sans">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project
        </LabButton>
      </Link>

      <LabCard>
        <LabCardHeader className="flex flex-row items-center justify-between">
          <LabCardTitle className="font-sans">Edit Project</LabCardTitle>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
              <Link href={`/lab/projects/${project.id}`}>
                <LabButton type="button" variant="ghost" className="font-sans">
                  Cancel
                </LabButton>
              </Link>
              <LabButton type="submit" disabled={loading} className="font-sans">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </LabButton>
            </div>
          </form>
        </LabCardContent>
      </LabCard>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          
          <div className="relative w-full max-w-md mx-4 bg-[#1a1a1a] border border-red-500/20 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white font-sans">Delete Project</h3>
            </div>
            
            <p className="text-white/60 mb-6 font-sans">
              Are you sure you want to delete <strong className="text-white">{project.name}</strong>? 
              This will also delete all milestones, tasks, and expenses. This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <LabButton 
                type="button" 
                variant="ghost" 
                onClick={() => setShowDeleteConfirm(false)}
                className="font-sans"
              >
                Cancel
              </LabButton>
              <LabButton 
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
                className="font-sans"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Project'
                )}
              </LabButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
