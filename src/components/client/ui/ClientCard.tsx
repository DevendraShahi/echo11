import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ClientCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export function ClientCard({ className, interactive = false, ...props }: ClientCardProps) {
  return (
    <div
      className={cn(
        'border border-white/10 bg-white/5',
        interactive && 'transition-all hover:border-white/20 hover:bg-white/[0.07]',
        className
      )}
      {...props}
    />
  )
}
