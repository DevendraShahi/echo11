'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Building, Phone, Globe, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

type ClientData = {
  id: string
  company_name: string
  contact_name: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
}

type ProfileData = {
  full_name: string | null
  email: string
}

interface PortalSettingsFormProps {
  client: ClientData
  profile: ProfileData | null
}

export function PortalSettingsForm({ client, profile }: PortalSettingsFormProps) {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [contactName, setContactName] = useState(client.contact_name || '')
  const [phone, setPhone] = useState(client.phone || '')
  const [address, setAddress] = useState(client.address || '')
  const [website, setWebsite] = useState(client.website || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        contact_name: contactName || null,
        phone: phone || null,
        address: address || null,
        website: website || null,
      })
      .eq('id', client.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <p className="text-rose-400 text-sm font-mono">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400 text-sm font-mono">Settings saved successfully!</p>
          </div>
        )}

        {/* Email (read-only) */}
        <div>
          <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white/60 font-mono text-sm cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-white/30 mt-1 font-mono">Contact echo11 to change your email</p>
        </div>

        {/* Contact Name */}
        <div>
          <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
            Contact Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm transition-all"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
            Address
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-3 w-5 h-5 text-white/30" />
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm transition-all resize-none"
              placeholder="123 Business Ave, Suite 100&#10;City, State 12345"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
            Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm transition-all"
              placeholder="https://yourcompany.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-black font-mono uppercase tracking-wider text-sm transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  )
}
