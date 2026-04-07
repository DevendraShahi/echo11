'use client'

import { cn } from '@/lib/utils'

export interface FilterTab {
  id: string
  label: string
  count?: number
}

interface FilterTabsProps {
  tabs: FilterTab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function FilterTabs({ tabs, activeTab, onChange, className }: FilterTabsProps) {
  return (
    <div className={cn("flex gap-1 border-b border-white/10 pb-0", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 font-sans relative",
            "hover:text-white/80",
            activeTab === tab.id
              ? 'text-accent border-accent'
              : 'text-white/50 border-transparent'
          )}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                activeTab === tab.id 
                  ? "bg-accent/20 text-accent" 
                  : "bg-white/10 text-white/40"
              )}>
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/50 blur-sm" />
          )}
        </button>
      ))}
    </div>
  )
}
