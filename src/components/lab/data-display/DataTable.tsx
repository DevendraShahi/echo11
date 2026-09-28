'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown } from 'lucide-react'

export type Column<T> = {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  idKey?: keyof T
  emptyMessage?: string
  className?: string
  rowClassName?: string
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  idKey = 'id' as keyof T,
  emptyMessage = 'No data',
  className,
  rowClassName,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return sortDir === 'asc' ? -1 : 1
    if (bVal == null) return sortDir === 'asc' ? 1 : -1
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    const comparison = String(aVal).localeCompare(String(bVal))
    return sortDir === 'asc' ? comparison : -comparison
  })

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map(col => (
              <th
                key={col.key}
                className={cn(
                  'text-left pb-3 text-xs font-semibold text-white/50 uppercase font-sans',
                  col.sortable && 'cursor-pointer hover:text-white/70 transition-colors select-none',
                  col.className
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-white/30 font-mono text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((item, i) => (
              <tr key={String(item[idKey]) || i} className={cn('hover:bg-white/5 transition-colors', rowClassName)}>
                {columns.map(col => (
                  <td key={col.key} className={cn('py-3 text-sm text-white/70 font-sans', col.className)}>
                    {col.render ? col.render(item) : String(item[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
