'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = {
  base: "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  variants: {
    variant: {
      default: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_var(--accent-glow)]",
      destructive: "bg-red-500 text-white hover:bg-red-500/90",
      danger: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40",
      outline: "border border-white/20 text-foreground hover:bg-white/10 hover:border-white/40",
      secondary: "bg-white/10 text-foreground hover:bg-white/20 border border-white/5",
      ghost: "hover:bg-white/10 hover:text-foreground text-white/70",
      glass: "bg-white/5 backdrop-blur-md border border-white/10 text-foreground hover:bg-white/10 hover:border-white/20",
      glow: "bg-accent text-accent-foreground shadow-[0_0_30px_var(--accent-glow)] hover:shadow-[0_0_40px_var(--accent-glow)]",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-none px-3",
      lg: "h-11 rounded-none px-8",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
}

export interface LabButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variants.variant;
  size?: keyof typeof buttonVariants.variants.size;
}

const LabButton = forwardRef<HTMLButtonElement, LabButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const classes = cn(
      buttonVariants.base,
      buttonVariants.variants.variant[variant],
      buttonVariants.variants.size[size],
      className
    )
    
    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)
LabButton.displayName = "LabButton"

export { LabButton, buttonVariants }
