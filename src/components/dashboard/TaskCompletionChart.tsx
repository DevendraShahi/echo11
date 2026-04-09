'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfWeek } from 'date-fns'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'

interface TaskData {
  week: string
  created: number
  completed: number
}

interface TaskCompletionChartProps {
  data?: TaskData[]
}

export function TaskCompletionChart({ data: initialData }: TaskCompletionChartProps) {
  const data = useMemo(() => {
    if (initialData && initialData.length > 0) return initialData
    
    const weeks: TaskData[] = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(now, i * 7))
      weeks.push({
        week: format(weekStart, 'MMM d'),
        created: Math.floor(Math.random() * 15) + 5,
        completed: Math.floor(Math.random() * 12) + 2,
      })
    }
    
    return weeks
  }, [initialData])

  const totalCreated = data.reduce((sum, d) => sum + d.created, 0)
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0)
  const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 text-white p-3 rounded-none">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'created' ? 'Created' : 'Completed'}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <LabCard className="h-full">
      <LabCardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <LabCardTitle className="text-lg font-semibold">Task Activity</LabCardTitle>
          <p className="text-sm text-white/50 mt-1">
            <span className="font-semibold text-emerald-400">{completionRate}%</span> completion rate
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-none bg-accent" />
            <span className="text-white/50">Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-none bg-emerald-500" />
            <span className="text-white/50">Completed</span>
          </div>
        </div>
      </LabCardHeader>
      <LabCardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar 
                dataKey="created" 
                fill="#00E5FF" 
                radius={[0, 0, 0, 0]} 
                maxBarSize={32}
              />
              <Bar 
                dataKey="completed" 
                fill="#10b981" 
                radius={[0, 0, 0, 0]} 
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </LabCardContent>
    </LabCard>
  )
}
