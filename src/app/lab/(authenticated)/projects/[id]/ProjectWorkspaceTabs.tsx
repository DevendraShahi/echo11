'use client'

import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Activity, Briefcase, Building2, CheckSquare, ChevronDown, DollarSign, LayoutDashboard, Users } from 'lucide-react'

interface ProjectWorkspaceTabsProps {
  projectId: string
}

interface WorkspaceTab {
  key: string
  label: string
  icon: ComponentType<{ className?: string }>
  suffix: string
  aliases?: string[]
}

const tabs: WorkspaceTab[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, suffix: '', aliases: ['/edit'] },
  { key: 'delivery', label: 'Delivery', icon: CheckSquare, suffix: '/delivery', aliases: ['/tasks', '/milestones'] },
  { key: 'finance', label: 'Finance', icon: DollarSign, suffix: '/finance', aliases: ['/invoices'] },
  { key: 'client', label: 'Client', icon: Building2, suffix: '/client' },
  { key: 'team', label: 'Team', icon: Users, suffix: '/team' },
  { key: 'activity', label: 'Activity', icon: Activity, suffix: '/activity' },
]

function isPathMatch(pathname: string, targetPath: string): boolean {
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`)
}

export function ProjectWorkspaceTabs({ projectId }: ProjectWorkspaceTabsProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)
  const basePath = `/lab/projects/${projectId}`

  const tabItems = tabs.map((tab) => {
    const href = `${basePath}${tab.suffix}`
    const active = tab.suffix
      ? isPathMatch(pathname, href) || (tab.aliases?.some((alias) => isPathMatch(pathname, `${basePath}${alias}`)) ?? false)
      : pathname === href || (tab.aliases?.some((alias) => isPathMatch(pathname, `${basePath}${alias}`)) ?? false)

    return { ...tab, href, active }
  })

  const activeTab = tabItems.find((tab) => tab.active) || tabItems[0]

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (!mobileMenuRef.current?.contains(target)) {
        setMobileMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    if (!mobileMenuOpen) return

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [mobileMenuOpen])

  return (
    <nav className="relative z-40 border border-white/10 bg-[#030913]/95 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px] opacity-20" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-[128%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.32)_0%,rgba(0,229,255,0.1)_46%,rgba(0,0,0,0)_72%)] blur-xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,229,255,0.1),rgba(0,0,0,0)_52%,rgba(0,0,0,0.7)_100%)]" />

      <div className="relative border-b border-white/10 px-3 py-2.5 sm:hidden">
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.15em] text-white/55 font-mono">Project Section</label>
        <div ref={mobileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={cn(
              'flex w-full items-center justify-between border px-3.5 py-3 text-left text-xs uppercase tracking-[0.14em] font-mono transition-colors',
              mobileMenuOpen
                ? 'border-accent/60 bg-[#071521] text-accent'
                : 'border-white/20 bg-[#060d16] text-white/90 hover:border-accent/30'
            )}
            aria-expanded={mobileMenuOpen}
            aria-haspopup="menu"
          >
            <span className="inline-flex items-center gap-2.5">
              <activeTab.icon className="h-3.5 w-3.5 text-accent" />
              {activeTab.label}
            </span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                mobileMenuOpen ? 'rotate-180 text-accent' : 'text-white/45'
              )}
            />
          </button>

          {mobileMenuOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[90] border border-white/20 bg-[#050c14] shadow-[0_18px_48px_rgba(0,0,0,0.72)]">
              {tabItems.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    router.push(tab.href)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 border-b border-white/10 px-3.5 py-3 text-xs uppercase tracking-[0.13em] font-mono transition-colors last:border-b-0',
                    tab.active
                      ? 'bg-accent/12 text-accent'
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  )}
                  role="menuitem"
                >
                  <tab.icon className={cn('h-3.5 w-3.5', tab.active ? 'text-accent' : 'text-white/45')} />
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative hidden overflow-x-auto sm:flex">
        {tabItems.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              'group relative flex min-w-[132px] flex-1 items-center justify-between border-r border-white/10 px-4 py-3 text-xs uppercase tracking-[0.13em] font-mono transition-colors last:border-r-0',
              tab.active ? 'bg-accent/16 text-accent' : 'text-white/60 hover:bg-white/5 hover:text-white'
            )}
          >
            <span className="inline-flex items-center gap-2">
              <tab.icon className={cn('h-3.5 w-3.5', tab.active ? 'text-accent' : 'text-white/45 group-hover:text-white')} />
              {tab.label}
            </span>
            {tab.active ? <Briefcase className="h-3 w-3 text-accent" /> : null}
            {tab.active ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-accent" /> : null}
          </Link>
        ))}
      </div>
    </nav>
  )
}
