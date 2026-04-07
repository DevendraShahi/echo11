'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { LabCard, LabCardContent } from '@/components/ui/LabCard'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string | number
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  icon: ReactNode
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'accent'
  sparkline?: number[]
}

const colorStyles = {
  indigo: {
    bg: 'bg-indigo-500/10',
    icon: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    accent: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'bg-amber-500/20',
    text: 'text-amber-400',
    accent: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  rose: {
    bg: 'bg-rose-500/10',
    icon: 'bg-rose-500/20',
    text: 'text-rose-400',
    accent: 'text-rose-400',
    border: 'border-rose-500/20',
  },
  sky: {
    bg: 'bg-sky-500/10',
    icon: 'bg-sky-500/20',
    text: 'text-sky-400',
    accent: 'text-sky-400',
    border: 'border-sky-500/20',
  },
  violet: {
    bg: 'bg-violet-500/10',
    icon: 'bg-violet-500/20',
    text: 'text-violet-400',
    accent: 'text-violet-400',
    border: 'border-violet-500/20',
  },
  accent: {
    bg: 'bg-accent/10',
    icon: 'bg-accent/20',
    text: 'text-accent',
    accent: 'text-accent',
    border: 'border-accent/20',
  },
}

export function StatCard({ title, value, subtitle, trend, icon, color, sparkline, 'data-tour': dataTour }: StatCardProps & { 'data-tour'?: string }) {
  const colors = colorStyles[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-tour={dataTour}
    >
      <LabCard className="relative overflow-hidden group hover:bg-white/[0.07] transition-colors duration-300">
        <div className={`absolute inset-0 opacity-50 ${colors.bg}`} />
        <LabCardContent className="relative p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/50">{title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {subtitle !== undefined && (
                  <span className="text-sm text-white/30">/ {subtitle}</span>
                )}
              </div>
              {trend && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? colors.accent : 'text-rose-400'}`}>
                  {trend.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-medium">{trend.value}%</span>
                  <span className="text-white/40 font-normal">{trend.label}</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-none border ${colors.icon} ${colors.border}`}>
              <div className={colors.text}>
                {icon}
              </div>
            </div>
          </div>
          
          {sparkline && sparkline.length > 0 && (
            <div className="mt-4 h-12 flex items-end gap-0.5">
              {sparkline.map((val, i) => {
                const max = Math.max(...sparkline)
                const height = max > 0 ? (val / max) * 100 : 0
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-current"
                    style={{ height: `${height}%`, opacity: 0.2 }}
                  />
                )
              })}
            </div>
          )}
        </LabCardContent>
      </LabCard>
    </motion.div>
  )
}
