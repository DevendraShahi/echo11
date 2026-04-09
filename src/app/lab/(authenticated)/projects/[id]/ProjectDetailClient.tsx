'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { LabButton } from '@/components/ui/LabButton'
import { MilestoneList } from '@/components/lab/MilestoneList'
import { sendClientPortalInvite } from '@/lib/actions/client-actions'
import { Milestone, ProjectExpense, Client, Service } from '@/types/lab'
import { Plus, Trash2, Loader2, Send, CheckCircle } from 'lucide-react'
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown'
import { useRouter } from 'next/navigation'

interface ProjectDetailClientProps {
  projectId: string
  milestones: Milestone[]
  expenses: ProjectExpense[]
  client?: Client | null
  services?: Service[]
}

export function ProjectDetailClient({ 
  projectId, 
  milestones: initialMilestones, 
  expenses: initialExpenses,
  client,
  services = []
}: ProjectDetailClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [milestones, setMilestones] = useState(initialMilestones)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [loading, setLoading] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [newExpense, setNewExpense] = useState({
    service_id: '',
    description: '',
    quantity: 1,
    rate: 0
  })
  const [expenseError, setExpenseError] = useState<string | null>(null)

  useEffect(() => {
    setNewExpense(prev => ({ ...prev, service_id: '' }))
  }, [projectId])

  const totalBudget = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  const hasClient = !!client
  const clientHasPortalAccess = client?.auth_id
  const clientHasPendingInvite = client?.invitation_sent_at && !client?.invitation_accepted_at

  const serviceOptions: DropdownOption[] = [
    { value: '', label: 'Select a service...' },
    ...services.map(service => ({
      value: service.id,
      label: service.name,
      description: service.category,
    }))
  ]

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    setNewExpense({
      ...newExpense,
      service_id: serviceId,
      description: service?.name || '',
      rate: service?.default_rate || 0
    })
  }

  const addExpense = async () => {
    if (!newExpense.description.trim() && !newExpense.service_id) return
    if (newExpense.quantity <= 0 || newExpense.rate <= 0) {
      setExpenseError('Quantity and rate must both be greater than 0.')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .insert({
          project_id: projectId,
          service_id: newExpense.service_id || null,
          description: newExpense.description || null,
          quantity: newExpense.quantity,
          rate: newExpense.rate,
          amount: newExpense.quantity * newExpense.rate,
        })
        .select('*, service:services(*)')
        .single()

      if (!error && data) {
        setExpenses([...expenses, data as ProjectExpense])
        setNewExpense({ service_id: '', description: '', quantity: 1, rate: 0 })
        setShowExpenseForm(false)
        setExpenseError(null)
        router.refresh()
      } else if (error) {
        console.error('Error adding expense:', error)
        setExpenseError(error.message || 'Failed to add expense')
      }
    } catch (err) {
      console.error('Error adding expense:', err)
      setExpenseError('Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('project_expenses').delete().eq('id', id)
      if (error) {
        console.error('Error deleting expense:', error)
        setExpenseError(error.message || 'Failed to delete expense')
      } else {
        setExpenses(expenses.filter(e => e.id !== id))
        setExpenseError(null)
        router.refresh()
      }
    } catch (err) {
      console.error('Error deleting expense:', err)
      setExpenseError('Failed to delete expense')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteClient = async () => {
    if (!client) return
    setInviting(true)
    const result = await sendClientPortalInvite(client.id)
    if (result.success) {
      router.refresh()
    }
    setInviting(false)
  }

  return (
    <>
      {/* Client Portal Access Card */}
      {hasClient && (
        <LabCard>
          <LabCardHeader>
            <LabCardTitle className="font-sans">Client Portal</LabCardTitle>
          </LabCardHeader>
          <LabCardContent>
            {clientHasPortalAccess ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm text-foreground font-sans">Client has portal access</p>
                  <p className="text-xs text-white/50">They can view their project progress</p>
                </div>
              </div>
            ) : clientHasPendingInvite ? (
              <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Send className="w-5 h-5 text-amber-400" />
                <div className="flex-1">
                  <p className="text-sm text-foreground font-sans">Invitation pending</p>
                  <p className="text-xs text-white/50">Awaiting client to accept</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleInviteClient}
                disabled={inviting}
                className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 hover:border-accent rounded-lg transition-colors text-foreground"
              >
                {inviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="font-sans">Invite to Portal</span>
              </button>
            )}
          </LabCardContent>
        </LabCard>
      )}

      {/* Milestones Card */}
      <LabCard>
        <LabCardHeader className="flex flex-row items-center justify-between">
          <LabCardTitle className="font-sans">Milestones</LabCardTitle>
        </LabCardHeader>
        <LabCardContent>
          <MilestoneList
            projectId={projectId}
            milestones={milestones}
            onMilestonesChange={setMilestones}
          />
        </LabCardContent>
      </LabCard>

      {/* Expenses Card */}
      <LabCard>
        <LabCardHeader className="flex flex-row items-center justify-between">
          <LabCardTitle className="font-sans">Services & Budget</LabCardTitle>
        </LabCardHeader>
        <LabCardContent>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-4 font-sans">No services added yet</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div>
                    <p className="text-sm text-foreground font-sans">{expense.description || expense.service?.name}</p>
                    <p className="text-xs text-white/40 font-mono">
                      {expense.quantity} × ${(expense.rate ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-foreground">${(expense.amount || 0).toLocaleString()}</span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-1 hover:bg-white/5 rounded-lg text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {showExpenseForm ? (
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2">
                <Dropdown
                  options={serviceOptions}
                  value={newExpense.service_id}
                  onChange={handleServiceChange}
                  placeholder="Select a service"
                />
                {newExpense.service_id && (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={newExpense.quantity}
                        onChange={(e) => setNewExpense({ ...newExpense, quantity: parseInt(e.target.value) || 1 })}
                        placeholder="Qty"
                        className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground font-mono text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={newExpense.rate}
                        onChange={(e) => setNewExpense({ ...newExpense, rate: parseFloat(e.target.value) || 0 })}
                        placeholder="Rate"
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground font-mono text-sm"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-white/50">
                        Total: ${(newExpense.quantity * newExpense.rate).toFixed(2)}
                      </span>
                      <div className="flex gap-2">
                        <LabButton 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowExpenseForm(false)}
                          className="font-sans"
                        >
                          Cancel
                        </LabButton>
                        <LabButton 
                          size="sm" 
                          onClick={addExpense} 
                          disabled={loading || (!newExpense.description && !newExpense.service_id)}
                          className="font-sans"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                        </LabButton>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <LabButton type="button" variant="ghost" size="sm" onClick={() => setShowExpenseForm(true)} className="font-sans">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </LabButton>
            )}

            {expenseError && (
              <p className="text-sm text-rose-400 font-mono mt-2">{expenseError}</p>
            )}

            {expenses.length > 0 && (
              <div className="flex justify-between pt-3 border-t border-white/10">
                <span className="text-sm text-white/50 font-sans">Total Budget</span>
                <span className="text-lg font-bold text-foreground font-mono">${totalBudget.toLocaleString()}</span>
              </div>
            )}
          </div>
        </LabCardContent>
      </LabCard>
    </>
  )
}
