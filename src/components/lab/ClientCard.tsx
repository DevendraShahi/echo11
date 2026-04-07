'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Mail, Phone, MoreHorizontal, Send, Edit3, Trash2, ExternalLink, DollarSign, FolderKanban, Star } from 'lucide-react'
import { ClientWithRelations } from '@/lib/actions/client-actions'

interface ClientCardProps {
  client: ClientWithRelations
  onEdit?: (client: ClientWithRelations) => void
  onDelete?: (clientId: string) => void
  onSendInvite?: (clientId: string) => void
  index?: number
}

export function ClientCard({ client, onEdit, onDelete, onSendInvite, index = 0 }: ClientCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getGradient = (name: string) => {
    const gradients = [
      'from-accent to-cyan-400',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-500',
      'from-violet-500 to-fuchsia-500',
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return gradients[hash % gradients.length]
  }

  const getStatusBadge = (status: string | undefined) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string; border: string }> = {
      lead: { bg: 'bg-white/5', text: 'text-white/60', label: 'Lead', border: 'border-white/10' },
      prospect: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Prospect', border: 'border-blue-500/20' },
      active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Active', border: 'border-emerald-500/20' },
      at_risk: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'At Risk', border: 'border-amber-500/20' },
      inactive: { bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'Inactive', border: 'border-rose-500/20' }
    }
    return statusConfig[status || 'lead']
  }

  const status = client.current_status?.status
  const statusBadge = getStatusBadge(status)

  return (
    <Link href={`/lab/clients/${client.id}`}>
      <div 
        className="group relative bg-[#0a0a0a] p-5 hover:bg-white/[0.02] transition-all duration-200"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 flex items-center justify-center bg-gradient-to-br shadow-lg",
            getGradient(client.company_name)
          )}>
            <span className="text-lg font-bold text-black">
              {getInitials(client.company_name)}
            </span>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              className="p-2 border border-white/5 hover:border-white/20 hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#0a0a0a] border border-white/10 z-50">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onEdit?.(client)
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors text-left font-mono text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Client
                </button>
                {!client.invitation_sent_at && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onSendInvite?.(client.id)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors text-left font-mono text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Invite
                  </button>
                )}
                {client.invitation_accepted_at && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.open('/portal', '_blank')
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors text-left font-mono text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Portal
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (confirm('Are you sure you want to delete this client?')) {
                      onDelete?.(client.id)
                    }
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-mono text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <h3 className="font-semibold text-white group-hover:text-accent transition-colors truncate font-sans">
            {client.company_name}
          </h3>
          {client.contact_name && (
            <p className="text-sm text-white/40 mt-0.5 truncate font-mono">
              {client.contact_name}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm mb-4">
          <a
            href={`mailto:${client.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2.5 text-white/50 hover:text-accent transition-colors"
          >
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate font-mono text-xs">{client.email}</span>
          </a>
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 text-white/50 hover:text-accent transition-colors"
            >
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-mono text-xs">{client.phone}</span>
            </a>
          )}
        </div>

        <div className="flex items-center gap-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-white/40">
            <FolderKanban className="w-3 h-3" />
            <span className="text-xs font-mono">{client.projects_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <DollarSign className="w-3 h-3" />
            <span className="text-xs font-mono">${(client.total_revenue || 0).toLocaleString()}</span>
          </div>
        </div>

        {status && (
          <div className="absolute top-4 right-20">
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider border",
              statusBadge.bg,
              statusBadge.text,
              statusBadge.border
            )}>
              {status.replace('_', ' ')}
            </span>
          </div>
        )}

        {client.invitation_sent_at && !status && (
          <div className="absolute top-4 right-20">
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider border",
              client.invitation_accepted_at 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            )}>
              {client.invitation_accepted_at ? 'Active' : 'Pending'}
            </span>
          </div>
        )}

        {client.tags && client.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {client.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs font-mono bg-white/5 text-white/50 border border-white/5"
              >
                {tag}
              </span>
            ))}
            {client.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs font-mono text-white/30">
                +{client.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
