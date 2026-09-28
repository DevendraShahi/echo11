'use client'

import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  count?: number
  className?: string
}

export function SkeletonCard({ count = 1, className }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('p-4 bg-white/5 border border-white/10 animate-pulse', className)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 w-3/4" />
              <div className="h-3 bg-white/10 w-1/2" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-white/10 w-full" />
            <div className="h-3 bg-white/10 w-5/6" />
          </div>
        </div>
      ))}
    </>
  )
}

export function SkeletonRow({ count = 3, className }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('flex items-center gap-3 p-3 border-b border-white/5 animate-pulse', className)}>
          <div className="w-8 h-8 bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/10 w-2/3" />
            <div className="h-2 bg-white/10 w-1/3" />
          </div>
          <div className="w-16 h-6 bg-white/10" />
        </div>
      ))}
    </>
  )
}

export function SkeletonStat({ count = 4, className }: SkeletonCardProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white/5 border border-white/10 animate-pulse">
          <div className="h-3 bg-white/10 w-1/2 mb-3" />
          <div className="h-8 bg-white/10 w-2/3 mb-2" />
          <div className="h-2 bg-white/10 w-1/3" />
        </div>
      ))}
    </div>
  )
}
