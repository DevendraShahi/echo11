import Link from 'next/link'
import { Mail, Phone, ExternalLink, FolderKanban, DollarSign, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/lab/data-display/StatusBadge'
import { ClientRiskBadge } from './ClientRiskBadge'

interface ClientCardProps {
  id: string
  companyName: string
  contactName?: string
  email: string
  phone?: string
  website?: string
  industry?: string
  tags?: string[]
  projectsCount?: number
  totalRevenue?: number
  unreadMessages?: number
  portalStatus?: 'none' | 'pending' | 'active'
  status?: string
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  riskScore?: number
  riskSignalCount?: number
  variant?: 'grid' | 'list'
}

const gradients = [
  'from-accent to-cyan-400',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-fuchsia-500',
]

function getGradient(name: string) {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function ClientCard({
  id,
  companyName,
  contactName,
  email,
  phone,
  tags,
  projectsCount = 0,
  totalRevenue = 0,
  unreadMessages = 0,
  portalStatus = 'none',
  status,
  riskLevel,
  riskScore,
  riskSignalCount,
  variant = 'grid',
}: ClientCardProps) {
  if (variant === 'list') {
    return (
      <Link href={`/lab/clients/${id}`} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-accent/20 transition-all duration-200">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={cn('w-10 h-10 flex items-center justify-center bg-gradient-to-br shadow-lg', getGradient(companyName))}>
            <span className="text-sm font-bold text-black">{getInitials(companyName)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground font-sans truncate">{companyName}</p>
            <p className="text-xs text-white/40 font-mono">{contactName || email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {status && <StatusBadge status={status} entityType="client" />}
          {riskLevel && riskLevel !== 'low' && (
            <ClientRiskBadge level={riskLevel} score={riskScore || 0} compact />
          )}
          <div className="text-right">
            <p className="text-xs text-white/40 font-mono">{projectsCount} projects</p>
            <p className="text-xs text-emerald-400 font-mono">${totalRevenue.toLocaleString()}</p>
          </div>
          {unreadMessages > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-accent/10 border border-accent/30 text-accent">
              <MessageSquare className="w-2.5 h-2.5" />
              {unreadMessages}
            </span>
          )}
          {portalStatus === 'active' && (
            <span className="text-[10px] text-white/30 font-mono">Portal</span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/lab/clients/${id}`} className="group relative bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-accent/20 transition-all duration-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 flex items-center justify-center bg-gradient-to-br shadow-lg', getGradient(companyName))}>
          <span className="text-lg font-bold text-black">{getInitials(companyName)}</span>
        </div>

        <div className="flex items-center gap-2">
          {portalStatus === 'active' && (
            <ExternalLink className="w-3.5 h-3.5 text-white/30" />
          )}
          {unreadMessages > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-accent/10 border border-accent/30 text-accent">
              <MessageSquare className="w-2.5 h-2.5" />
              {unreadMessages}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-white group-hover:text-accent transition-colors truncate font-sans mb-1">
        {companyName}
      </h3>
      {contactName && (
        <p className="text-sm text-white/40 truncate font-mono mb-3">{contactName}</p>
      )}

      <div className="space-y-1.5 text-xs mb-4">
        <div className="flex items-center gap-2 text-white/50">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate font-mono">{email}</span>
        </div>
        {phone && (
          <div className="flex items-center gap-2 text-white/50">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="font-mono">{phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-white/40">
          <FolderKanban className="w-3 h-3" />
          <span className="text-xs font-mono">{projectsCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/40">
          <DollarSign className="w-3 h-3" />
          <span className="text-xs font-mono">${totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        {status && <StatusBadge status={status} entityType="client" />}
        {riskLevel && riskLevel !== 'low' && (
          <ClientRiskBadge level={riskLevel} score={riskScore || 0} signalCount={riskSignalCount} compact />
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-mono bg-white/5 text-white/40 border border-white/5">
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] font-mono text-white/30">+{tags.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  )
}
