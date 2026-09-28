'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabItem {
  name: string
  href: string
  icon?: LucideIcon
  count?: number
}

interface PageTabsProps {
  tabs: TabItem[]
  className?: string
}

export function PageTabs({ tabs, className }: PageTabsProps) {
  const pathname = usePathname()

  return (
    <div className={cn('border-b border-white/10 mb-6 bg-black/20 backdrop-blur-md sticky top-14 z-30 font-sans', className)}>
      <nav className="flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'group relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'text-accent'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  style={{ boxShadow: '0 0 10px var(--accent-glow)' }}
                />
              )}
              {Icon && (
                <Icon className={cn(
                  'w-4 h-4',
                  isActive ? 'text-accent' : 'text-white/40 group-hover:text-white/60'
                )} />
              )}
              <span className="tracking-wide">{tab.name}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  'px-1.5 py-0.5 text-[10px] font-mono rounded-sm',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'bg-white/5 text-white/40'
                )}>
                  {tab.count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
