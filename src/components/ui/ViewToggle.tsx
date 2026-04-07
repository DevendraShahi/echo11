'use client'

import { Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  view: ViewMode
  onChange: (view: ViewMode) => void
  className?: string
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 bg-white/[0.03] rounded-none p-1 border border-white/10", className)}>
      <button
        onClick={() => onChange('grid')}
        className={cn(
          "p-2 rounded-none transition-all duration-200",
          view === 'grid' 
            ? "bg-accent/20 text-accent" 
            : "text-white/40 hover:text-white hover:bg-white/5"
        )}
        title="Grid view"
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('list')}
        className={cn(
          "p-2 rounded-none transition-all duration-200",
          view === 'list' 
            ? "bg-accent/20 text-accent" 
            : "text-white/40 hover:text-white hover:bg-white/5"
        )}
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  )
}
