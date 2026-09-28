import { cn } from '@/lib/utils'

interface FilterBarProps {
  left: React.ReactNode
  right?: React.ReactNode
  className?: string
}

export function FilterBar({ left, right, className }: FilterBarProps) {
  return (
    <section className={cn('border border-white/10 bg-black/50 px-3 py-3 md:px-4', className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">{left}</div>
        {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
      </div>
    </section>
  )
}
