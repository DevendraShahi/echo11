'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { ProjectStatus } from '@/types/lab'

interface ProjectStatusData {
  status: ProjectStatus
  count: number
  label?: string
  color?: string
}

interface ProjectStatusChartProps {
  data?: ProjectStatusData[]
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: '#00E5FF' },
  on_hold: { label: 'On Hold', color: '#f59e0b' },
  completed: { label: 'Completed', color: '#10b981' },
  archived: { label: 'Archived', color: '#64748b' },
}

export function ProjectStatusChart({ data: initialData }: ProjectStatusChartProps) {
  const data = useMemo(() => {
    if (initialData && initialData.length > 0) {
      return initialData.map(item => ({
        ...item,
        label: STATUS_CONFIG[item.status]?.label || item.status,
        color: STATUS_CONFIG[item.status]?.color || '#64748b',
      }))
    }
    
    return [
      { status: 'active' as ProjectStatus, count: 4, label: 'Active', color: '#00E5FF' },
      { status: 'on_hold' as ProjectStatus, count: 1, label: 'On Hold', color: '#f59e0b' },
      { status: 'completed' as ProjectStatus, count: 3, label: 'Completed', color: '#10b981' },
      { status: 'archived' as ProjectStatus, count: 1, label: 'Archived', color: '#64748b' },
    ]
  }, [initialData])

  const total = data.reduce((sum, d) => sum + d.count, 0)

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ProjectStatusData }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 text-white p-3 rounded-none">
          <p className="font-medium text-sm">{item.label}</p>
          <p className="text-sm" style={{ color: item.color }}>
            {item.count} projects ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <LabCard className="h-full">
      <LabCardHeader className="pb-2">
        <LabCardTitle className="text-lg font-semibold">Project Status</LabCardTitle>
        <p className="text-sm text-white/50">
          Total: <span className="font-semibold text-foreground">{total} projects</span>
        </p>
      </LabCardHeader>
      <LabCardContent>
        <div className="h-[240px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="count"
                nameKey="label"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-2">
          {data.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-none" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-white/70">{item.label}</span>
              <span className="text-sm font-medium text-foreground ml-auto">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </LabCardContent>
    </LabCard>
  )
}
