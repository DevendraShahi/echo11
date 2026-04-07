'use client'

import { Plus, Trash2 } from 'lucide-react'
import { LabButton } from '@/components/ui/LabButton'
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown'
import { Service } from '@/types/lab'

interface ExpenseItem {
  id: string
  service_id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface ExpenseFormProps {
  services: Service[]
  expenses: ExpenseItem[]
  onChange: (expenses: ExpenseItem[]) => void
}

export function ExpenseForm({ services, expenses, onChange }: ExpenseFormProps) {
  const serviceOptions: DropdownOption[] = services.map(service => ({
    value: service.id,
    label: service.name,
    description: service.category,
    icon: <span className="text-xs text-white/40">{service.unit}</span>,
  }))

  const addExpense = () => {
    const newExpense: ExpenseItem = {
      id: `temp-${Date.now()}`,
      service_id: '',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    onChange([...expenses, newExpense])
  }

  const updateExpense = (index: number, field: keyof ExpenseItem, value: string | number) => {
    const updated = [...expenses]
    const expense = updated[index]
    
    if (field === 'service_id') {
      const service = services.find(s => s.id === value)
      expense.service_id = String(value)
      expense.rate = service?.default_rate || 0
      expense.description = service?.name || ''
      expense.amount = expense.quantity * expense.rate
    } else if (field === 'quantity' || field === 'rate') {
      expense[field] = Number(value)
      expense.amount = expense.quantity * expense.rate
    } else if (field === 'description') {
      expense.description = String(value)
    }
    
    onChange(updated)
  }

  const removeExpense = (index: number) => {
    const updated = expenses.filter((_, i) => i !== index)
    onChange(updated)
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-4">
      {expenses.map((expense, index) => (
        <div key={expense.id} className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex-1 grid grid-cols-12 gap-2">
            <div className="col-span-5">
              <Dropdown
                options={serviceOptions}
                value={expense.service_id}
                onChange={(val) => updateExpense(index, 'service_id', val)}
                placeholder="Select service"
                searchable
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={expense.quantity}
                onChange={(e) => updateExpense(index, 'quantity', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-accent focus:outline-none font-mono text-sm"
                placeholder="Qty"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                step="0.01"
                min="0"
                value={expense.rate}
                onChange={(e) => updateExpense(index, 'rate', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:border-accent focus:outline-none font-mono text-sm"
                placeholder="Rate"
              />
            </div>
            <div className="col-span-2 flex items-center justify-end">
              <span className="text-sm font-mono text-foreground">
                ${expense.amount.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeExpense(index)}
            className="p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <LabButton type="button" variant="ghost" size="sm" onClick={addExpense} className="font-sans">
        <Plus className="w-4 h-4 mr-2" />
        Add Service
      </LabButton>

      {expenses.length > 0 && (
        <div className="flex justify-end pt-3 border-t border-white/10">
          <div className="text-right">
            <p className="text-xs text-white/50 font-sans">Total Budget</p>
            <p className="text-xl font-bold text-foreground font-mono">${total.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  )
}
