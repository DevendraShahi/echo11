'use client'

import { useState } from 'react'
import { createClientWithAuth } from '@/lib/actions/client-actions'
import { LabButton } from '@/components/ui/LabButton'
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown'
import { Client } from '@/types/lab'
import { Plus, X, Loader2, Building2 } from 'lucide-react'

interface InlineClientFormProps {
  onClientCreated: (client: Client) => void
  onCancel: () => void
}

export function InlineClientForm({ onClientCreated, onCancel }: InlineClientFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendInvitation, setSendInvitation] = useState(false)

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
  })

  const handleSubmit = async () => {
    if (!formData.company_name || !formData.email) return
    
    setLoading(true)
    setError(null)

    const result = await createClientWithAuth({
      ...formData,
      sendInvitation,
    })

    if (result.success && result.client) {
      onClientCreated(result.client as Client)
    } else {
      setError(result.error || 'Failed to create client')
    }

    setLoading(false)
  }

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-foreground font-sans">Add New Client</h4>
        <button onClick={onCancel} className="p-1 hover:bg-white/5 rounded-lg">
          <X className="w-4 h-4 text-white/50" />
        </button>
      </div>

      <div className="space-y-3">
        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-sans">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/50 mb-1 font-sans">Company Name *</label>
            <input
              type="text"
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-white/30 focus:border-accent focus:outline-none font-sans text-sm"
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1 font-sans">Contact Name</label>
            <input
              type="text"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-white/30 focus:border-accent focus:outline-none font-sans text-sm"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/50 mb-1 font-sans">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-white/30 focus:border-accent focus:outline-none font-sans text-sm"
              placeholder="contact@company.com"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1 font-sans">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-white/30 focus:border-accent focus:outline-none font-sans text-sm"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1 font-sans">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-white/30 focus:border-accent focus:outline-none font-sans text-sm"
            placeholder="123 Main St, City, Country"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="sendInvitationInline"
            checked={sendInvitation}
            onChange={(e) => setSendInvitation(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent"
          />
          <label htmlFor="sendInvitationInline" className="text-xs text-white/50 font-sans">
            Send client invitation
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <LabButton type="button" variant="ghost" size="sm" onClick={onCancel} className="font-sans">
            Cancel
          </LabButton>
          <LabButton type="button" size="sm" onClick={handleSubmit} disabled={loading} className="font-sans">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Client'}
          </LabButton>
        </div>
      </div>
    </div>
  )
}

interface ClientSelectProps {
  clients: Client[]
  selectedClientId: string
  onChange: (clientId: string) => void
}

export function ClientSelect({ clients, selectedClientId, onChange }: ClientSelectProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  const clientOptions: DropdownOption[] = clients.map(client => ({
    value: client.id,
    label: client.company_name,
    icon: <Building2 className="w-4 h-4" />,
    description: client.contact_name || client.email,
  }))

  const handleClientCreated = (client: Client) => {
    onChange(client.id)
    setShowAddForm(false)
  }

  return (
    <div className="space-y-2">
      <Dropdown
        options={clientOptions}
        value={selectedClientId}
        onChange={onChange}
        placeholder="Select client"
        searchable
      />

      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-sm text-accent hover:underline font-sans"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </button>
      )}

      {showAddForm && (
        <InlineClientForm
          onClientCreated={handleClientCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}
