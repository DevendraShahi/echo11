'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type LabCardProps = React.HTMLAttributes<HTMLDivElement>

const LabCard = React.forwardRef<HTMLDivElement, LabCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-none border border-white/5 bg-white/5 backdrop-blur-md shadow-none',
        className
      )}
      {...props}
    />
  )
)
LabCard.displayName = 'LabCard'

const LabCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
LabCardHeader.displayName = 'LabCardHeader'

const LabCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-semibold leading-none tracking-tight text-foreground font-sans',
      className
    )}
    {...props}
  />
))
LabCardTitle.displayName = 'LabCardTitle'

const LabCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-white/50', className)}
    {...props}
  />
))
LabCardDescription.displayName = 'LabCardDescription'

const LabCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
LabCardContent.displayName = 'LabCardContent'

const LabCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
LabCardFooter.displayName = 'LabCardFooter'

export { LabCard, LabCardHeader, LabCardFooter, LabCardTitle, LabCardDescription, LabCardContent }
