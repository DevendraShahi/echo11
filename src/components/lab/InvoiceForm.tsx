'use client'

import { useState, useEffect } from 'react'
import { createInvoice, getClientsForInvoiceForm, getProjectsForInvoiceForm, getServicesForInvoice } from '@/lib/actions/invoice-actions'
import { LabButton } from '@/components/ui/LabButton'
import { X, Loader2, CheckCircle, User, Folder, Calendar, AlignLeft, Plus, Trash2 } from 'lucide-react'
import { Client, Project, Service } from '@/types/lab'

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface LineItem {
  service_id: string
  description: string
  quantity: number
  rate: number
}

interface ServiceWithFlag extends Service {
  isProjectSpecific?: boolean
}

export function InvoiceFormModal({ isOpen, onClose, onSuccess }: InvoiceFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [clients, setClients] = useState<Pick<Client, 'id' | 'company_name' | 'contact_name'>[]>([])
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([])
  const [services, setServices] = useState<ServiceWithFlag[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    due_date: '',
    tax_rate: 0,
    notes: '',
    currency: 'USD'
  })

  const [items, setItems] = useState<LineItem[]>([
    { service_id: '', description: '', quantity: 1, rate: 0 }
  ])

  useEffect(() => {
    if (isOpen) {
      async function loadData() {
        const [clientsData, projectsData] = await Promise.all([
          getClientsForInvoiceForm(),
          getProjectsForInvoiceForm()
        ])
        setClients(clientsData)
        setProjects(projectsData)
      }
      loadData()
    }
  }, [isOpen])

  // Fetch services when project changes
  useEffect(() => {
    if (formData.project_id) {
      setLoadingServices(true)
      getServicesForInvoice(formData.project_id)
        .then(setServices)
        .finally(() => setLoadingServices(false))
    } else {
      getServicesForInvoice(null)
        .then(setServices)
        .finally(() => setLoadingServices(false))
    }
  }, [formData.project_id])

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const taxAmount = subtotal * (formData.tax_rate / 100)
  const total = subtotal + taxAmount

  function addItem() {
    setItems([...items, { service_id: '', description: '', quantity: 1, rate: 0 }])
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // When service is selected, auto-fill description and rate
    if (field === 'service_id' && value) {
      const selectedService = services.find(s => s.id === value)
      if (selectedService) {
        newItems[index].description = selectedService.name
        newItems[index].rate = selectedService.default_rate
      }
    }
    
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validItems = items.filter(item => item.description.trim() && item.rate > 0 && item.quantity > 0)
    if (validItems.length === 0) {
      setValidationError('At least one line item with a description, quantity, and rate greater than 0 is required.')
      return
    }
    setValidationError(null)

    setLoading(true)
    setError(null)

    const targetCurrency = formData.currency
    let exchangeRate = 1
    let convertedTotal = total
    let conversionDate = null

    if (targetCurrency !== 'USD') {
      try {
        const res = await fetch('https://www.floatrates.com/daily/usd.json')
        if (res.ok) {
          const ratesInfo = await res.json()
          const code = targetCurrency.toLowerCase()
          if (ratesInfo[code] && ratesInfo[code].rate) {
            exchangeRate = ratesInfo[code].rate
            convertedTotal = total * exchangeRate
            conversionDate = new Date().toISOString()
          }
        }
      } catch (err) {
        console.error('Failed to parse exchange rate', err)
      }
    }

    const result = await createInvoice({
      client_id: formData.client_id,
      project_id: formData.project_id || null,
      due_date: formData.due_date,
      items: items.filter(item => item.description && item.rate > 0),
      tax_rate: formData.tax_rate,
      notes: formData.notes || null,
      target_currency: targetCurrency !== 'USD' ? targetCurrency : undefined,
      exchange_rate: targetCurrency !== 'USD' ? exchangeRate : undefined,
      converted_total: targetCurrency !== 'USD' ? convertedTotal : undefined,
      conversion_date: targetCurrency !== 'USD' ? conversionDate : undefined,
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setFormData({
          client_id: '',
          project_id: '',
          due_date: '',
          tax_rate: 0,
          notes: '',
          currency: 'USD'
        })
        setItems([{ service_id: '', description: '', quantity: 1, rate: 0 }])
        onSuccess?.()
        onClose()
      }, 1500)
    } else {
      setError(result.error || 'Failed to create invoice')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-black border border-white/10 rounded-none shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-semibold text-white font-sans">Create Invoice</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-none text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-none flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-sans">Invoice Created!</h3>
            <p className="text-white/50">Your invoice has been created.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-none text-rose-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">
                  <User className="w-4 h-4 inline mr-1.5" />
                  Client *
                </label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                >
                  <option value="" className="bg-black">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} className="bg-black">
                      {client.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">
                  <Folder className="w-4 h-4 inline mr-1.5" />
                  Project
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                >
                  <option value="" className="bg-black">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id} className="bg-black">
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">
                  <Calendar className="w-4 h-4 inline mr-1.5" />
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans
                    [&::-webkit-calendar-picker-indicator]:filter:brightness-0
                    [&::-webkit-calendar-picker-indicator]:invert
                    [&::-webkit-calendar-picker-indicator]:opacity-60
                    [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2 font-sans">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                >
                  <option value="USD" className="bg-black">USD - US Dollar</option>
                  <option value="CAD" className="bg-black">CAD - Canadian Dollar</option>
                  <option value="INR" className="bg-black">INR - Indian Rupee</option>
                  <option value="NPR" className="bg-black">NPR - Nepalese Rupee</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm text-white/70 font-sans">Line Items</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 transition-colors font-sans"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
              
              {loadingServices && (
                <div className="text-sm text-white/40 mb-2 font-sans">Loading services...</div>
              )}
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <select
                      value={item.service_id}
                      onChange={(e) => updateItem(index, 'service_id', e.target.value)}
                      className="w-48 px-3 py-2 bg-white/5 border border-white/10 rounded-none text-white text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                    >
                      <option value="" className="bg-black">— Select Service —</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id} className="bg-black">
                          {service.name} {service.isProjectSpecific ? '(Project)' : ''}
                        </option>
                      ))}
                      <option value="custom" className="bg-black">— Custom Entry —</option>
                    </select>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-2 bg-white/5 border border-white/10 rounded-none text-white text-sm text-center focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-2 bg-white/5 border border-white/10 rounded-none text-white text-sm text-right focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-sans"
                    />
                    <div className="w-20 h-10 flex items-center justify-center text-white/40 text-sm font-sans">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="p-2 text-white/40 hover:text-rose-400 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 font-sans">Subtotal</span>
                  <span className="text-white font-sans">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 font-sans">Tax ({formData.tax_rate}%)</span>
                  <span className="text-white font-sans">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                  <span className="text-white font-sans">Total</span>
                  <span className="text-emerald-400 font-sans">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2 font-sans">
                <AlignLeft className="w-4 h-4 inline mr-1.5" />
                Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none font-sans"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {validationError && (
                <p className="text-sm text-rose-400 font-mono">{validationError}</p>
              )}
              <LabButton type="button" variant="ghost" onClick={onClose}>
                Cancel
              </LabButton>
              <LabButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Invoice'
                )}
              </LabButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}