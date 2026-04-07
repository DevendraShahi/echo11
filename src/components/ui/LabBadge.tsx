'use client'

import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'outline' | 'ghost' | 'success' | 'warning' | 'danger' | 'accent'

interface LabBadgeProps {
  children: React.ReactNode
  className?: string
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-transparent bg-accent text-accent-foreground shadow-[0_0_10px_var(--accent-glow)]",
  outline: "border-white/20 text-white/80",
  ghost: "bg-white/10 text-white/70 border border-white/5",
  success: "border-transparent bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  warning: "border-transparent bg-amber-500/20 text-amber-400 border border-amber-500/30",
  danger: "border-transparent bg-rose-500/20 text-rose-400 border border-rose-500/30",
  accent: "border-transparent bg-accent/20 text-accent border border-accent/30",
}

export function LabBadge({ children, className, variant = 'default' }: LabBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
