'use client'

import { useState, useEffect } from 'react'
import { createClientWithAuth, updateClient, ClientWithRelations } from '@/lib/actions/client-actions'
import { updateClientStatus } from '@/lib/actions/contract-actions'
import { LabButton } from '@/components/ui/LabButton'
import { X, Loader2, Mail, CheckCircle, User, Phone, Building, Tags, Globe, ArrowRight } from 'lucide-react'
import { ClientLifecycleStatus } from '@/types/lab'
import { cn } from '@/lib/utils'

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  editClient?: ClientWithRelations | null
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
  'Real Estate', 'Manufacturing', 'Retail', 'Consulting', 'Marketing',
  'Legal', 'Non-profit', 'Entertainment', 'Travel', 'Food & Beverage', 'Other'
]

const SOURCES: { value: string; label: string }[] = [
  { value: 'referral', label: 'Referral' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'website', label: 'Website' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'other', label: 'Other' }
]

export function ClientFormModal({ isOpen, onClose, onSuccess, editClient }: ClientFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendInvitation, setSendInvitation] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [newStatus, setNewStatus] = useState<ClientLifecycleStatus>('lead')

  const isEditing = !!editClient

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    source: '',
    tags: '',
  })

  useEffect(() => {
    if (editClient) {
      setFormData({
        company_name: editClient.company_name,
        contact_name: editClient.contact_name || '',
        email: editClient.email,
        phone: editClient.phone || '',
        website: editClient.website || '',
        industry: editClient.industry || '',
        source: editClient.source || '',
        tags: editClient.tags?.join(', ') || '',
      })
    } else {
      setFormData({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        source: '',
        tags: '',
      })
    }
  }, [editClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined

    let result
    if (isEditing) {
      result = await updateClient(editClient.id, {
        company_name: formData.company_name,
        contact_name: formData.contact_name || undefined,
        email: formData.email,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        source: formData.source || undefined,
        tags: tagsArray,
      })

      if (showStatusChange && result.success) {
        await updateClientStatus(editClient.id, newStatus)
      }
    } else {
      result = await createClientWithAuth({
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        industry: formData.industry,
        source: formData.source,
        tags: tagsArray,
        sendInvitation,
      })

      if (result.success && result.client && sendInvitation) {
        await updateClientStatus(result.client.id, 'prospect')
      }
    }

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setFormData({
          company_name: '',
          contact_name: '',
          email: '',
          phone: '',
          website: '',
          industry: '',
          source: '',
          tags: '',
        })
        setSendInvitation(false)
        onSuccess?.()
        onClose()
      }, 1500)
    } else {
      setError(result.error || `Failed to ${isEditing ? 'update' : 'create'} client`)
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <div className="relative w-full max-w-xl mx-4 bg-[#0a0a0a] border border-white/10">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white font-sans tracking-tight">
            {isEditing ? 'Edit Client' : 'New Client'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-accent/20 bg-accent/10">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-sans">
              {isEditing ? 'Client Updated' : 'Client Created'}
            </h3>
            <p className="text-white/40 font-mono text-sm">
              {sendInvitation ? 'Invitation email sent successfully.' : isEditing ? 'Client details saved.' : 'Client added successfully.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-mono">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-2 font-mono uppercase tracking-wider">Company Name *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full pl-10 py-2.5 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2 font-mono uppercase tracking-wider">Contact Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full pl-10 py-2.5 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-2 font-mono uppercase tracking-wider">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 py-2.5 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2 font-mono uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 py-2.5 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-2 font-mono uppercase tracking-wider">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full pl-10 py-2.5 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-2 font-mono uppercase tracking-wider">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="bg-black">Select industry</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind} className="bg-black">{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2 font-mono uppercase tracking-wider">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="bg-black">How did they find you?</option>
                  {SOURCES.map(src => (
                    <option key={src.value} value={src.value} className="bg-black">{src.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-2 font-mono uppercase tracking-wider">Tags (comma separated)</label>
              <div className="relative">
                <Tags className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full pl-10 py-2.5 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
                  placeholder="vip, enterprise, priority"
                />
              </div>
            </div>

            {isEditing && (
              <div className="border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStatusChange(!showStatusChange)}
                  className="text-xs text-accent hover:text-accent/80 transition-colors font-mono uppercase tracking-wider flex items-center gap-2"
                >
                  {showStatusChange ? '▼ Hide' : '▶ Change Status'}
                </button>
                {showStatusChange && (
                  <div className="mt-3 flex items-center gap-3">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ClientLifecycleStatus)}
                      className="px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono focus:border-accent"
                    >
                      <option value="lead" className="bg-black">Lead</option>
                      <option value="prospect" className="bg-black">Prospect</option>
                      <option value="active" className="bg-black">Active</option>
                      <option value="at_risk" className="bg-black">At Risk</option>
                      <option value="inactive" className="bg-black">Inactive</option>
                    </select>
                    <span className="text-xs text-white/40 font-mono">
                      Current: {editClient.current_status?.status || 'New'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {!isEditing && (
              <label className="flex items-start gap-3 p-4 bg-[#0a0a0a] border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  id="sendInvitation"
                  checked={sendInvitation}
                  onChange={(e) => setSendInvitation(e.target.checked)}
                  className="mt-0.5 w-4 h-4 border border-white/20 bg-[#0a0a0a] text-accent focus:ring-accent"
                />
                <div>
                  <span className="text-sm text-white font-mono">Send portal invitation</span>
                  <p className="text-xs text-white/40 mt-0.5 font-mono">Create a login account and send an email so the client can track their project</p>
                </div>
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <LabButton type="button" variant="ghost" onClick={onClose} className="font-mono uppercase text-xs tracking-wider">
                Cancel
              </LabButton>
              <LabButton type="submit" disabled={loading} className="font-mono uppercase text-xs tracking-wider">
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Processing
                  </>
                ) : isEditing ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 mr-2" />
                    Create Client
                  </>
                )}
              </LabButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
