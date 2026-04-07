'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subMonths, startOfMonth } from 'date-fns'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'

interface RevenueData {
  month: string
  revenue: number
  invoices?: number
}

interface RevenueChartProps {
  data?: RevenueData[]
}

export function RevenueChart({ data: initialData }: RevenueChartProps) {
  const data = useMemo(() => {
    if (initialData && initialData.length > 0) return initialData
    
    const months: RevenueData[] = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      months.push({
        month: format(startOfMonth(date), 'MMM yyyy'),
        revenue: Math.floor(Math.random() * 15000) + 2000,
        invoices: Math.floor(Math.random() * 10) + 1,
      })
    }
    
    return months
  }, [initialData])

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const lastMonthRevenue = data[data.length - 1]?.revenue || 0
  const prevMonthRevenue = data[data.length - 2]?.revenue || 0
  const percentChange = prevMonthRevenue > 0 
    ? ((lastMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1)
    : '0'

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 text-white p-3 rounded-none">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-accent text-sm">
            Revenue: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <LabCard className="h-full">
      <LabCardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <LabCardTitle className="text-lg font-semibold">Revenue Trend</LabCardTitle>
          <p className="text-sm text-white/50 mt-1">
            Total: <span className="font-semibold text-foreground">${totalRevenue.toLocaleString()}</span>
          </p>
        </div>
        <div className={`text-sm font-medium ${Number(percentChange) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {Number(percentChange) >= 0 ? '+' : ''}{percentChange}%
        </div>
      </LabCardHeader>
      <LabCardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00E5FF"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </LabCardContent>
    </LabCard>
  )
}
