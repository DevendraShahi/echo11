import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface ContextSection {
  title: string
  items: { label: string; value: ReactNode; highlight?: boolean }[]
}

interface ContextPanelProps {
  title?: string
  sections: ContextSection[]
  className?: string
}

export function ContextPanel({ title, sections, className }: ContextPanelProps) {
  return (
    <div className={cn('bg-white/5 border border-white/10', className)}>
      {title && (
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white/50">{title}</h3>
        </div>
      )}

      <div className="divide-y divide-white/5">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="p-4">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-3">{section.title}</h4>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-white/40 font-sans">{item.label}</span>
                  <span className={cn(
                    'text-xs font-mono text-right',
                    item.highlight ? 'text-accent' : 'text-white/60'
                  )}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
