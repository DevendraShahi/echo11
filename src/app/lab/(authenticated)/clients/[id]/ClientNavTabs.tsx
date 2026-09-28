'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Building2, FileText, FolderKanban, MessageSquare, NotebookPen, Receipt, ScrollText } from 'lucide-react'

interface ClientTab {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

export function ClientNavTabs({ clientId }: { clientId: string }) {
  const pathname = usePathname()

  const tabs: ClientTab[] = [
    { label: 'Overview', href: `/lab/clients/${clientId}`, icon: Building2 },
    { label: 'Projects', href: `/lab/clients/${clientId}/projects`, icon: FolderKanban },
    { label: 'Invoices', href: `/lab/clients/${clientId}/invoices`, icon: Receipt },
    { label: 'Contracts', href: `/lab/clients/${clientId}/contracts`, icon: ScrollText },
    { label: 'Documents', href: `/lab/clients/${clientId}/documents`, icon: FileText },
    { label: 'Notes', href: `/lab/clients/${clientId}/notes`, icon: NotebookPen },
    { label: 'Messages', href: `/lab/clients/${clientId}/messages`, icon: MessageSquare },
  ]

  return (
    <nav className="sticky top-0 z-20 border border-white/10 bg-[linear-gradient(180deg,rgba(0,229,255,0.06),rgba(0,0,0,0)_70%),rgba(0,0,0,0.72)] backdrop-blur-md">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                'group relative flex min-w-[132px] items-center justify-between border-r border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.13em] font-mono transition-colors',
                isActive ? 'bg-accent/10 text-accent' : 'text-white/55 hover:bg-white/5 hover:text-white'
              )}
            >
              <span className="inline-flex items-center gap-2">
                <tab.icon className={cn('h-3.5 w-3.5', isActive ? 'text-accent' : 'text-white/45 group-hover:text-white')} />
                {tab.label}
              </span>
              {isActive ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-accent" /> : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
