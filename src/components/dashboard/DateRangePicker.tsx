'use client'

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'

type DateRange = '7d' | '30d' | '90d' | 'thisMonth' | 'lastMonth' | 'custom'

interface DateRangePickerProps {
  onChange?: (range: { start: Date; end: Date }) => void
}

export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<DateRange>('30d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const getDateRange = (): { start: Date; end: Date; label: string } => {
    const now = new Date()
    switch (selected) {
      case '7d':
        return { start: subDays(now, 7), end: now, label: 'Last 7 days' }
      case '30d':
        return { start: subDays(now, 30), end: now, label: 'Last 30 days' }
      case '90d':
        return { start: subDays(now, 90), end: now, label: 'Last 90 days' }
      case 'thisMonth':
        return { start: startOfMonth(now), end: now, label: 'This Month' }
      case 'lastMonth':
        const lastMonth = subMonths(now, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth), label: 'Last Month' }
      case 'custom':
        return { 
          start: customStart ? new Date(customStart) : subDays(now, 30), 
          end: customEnd ? new Date(customEnd) : now, 
          label: 'Custom Range' 
        }
      default:
        return { start: subDays(now, 30), end: now, label: 'Last 30 days' }
    }
  }

  const handleSelect = (range: DateRange) => {
    setSelected(range)
    setIsOpen(false)
    if (onChange) {
      const { start, end } = getDateRange()
      onChange({ start, end })
    }
  }

  const { label } = getDateRange()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-none hover:bg-white/10 hover:border-white/20 transition-all duration-200"
      >
        <Calendar className="w-4 h-4 text-white/50" />
        <span className="text-white/70">{label}</span>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-black/80 backdrop-blur-md border border-white/10 rounded-none shadow-lg z-20 overflow-hidden">
            <div className="p-2">
              {(['7d', '30d', '90d', 'thisMonth', 'lastMonth'] as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => handleSelect(range)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-none transition-colors ${
                    selected === range
                      ? 'bg-accent/10 text-accent'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {range === '7d' && 'Last 7 days'}
                  {range === '30d' && 'Last 30 days'}
                  {range === '90d' && 'Last 90 days'}
                  {range === 'thisMonth' && 'This Month'}
                  {range === 'lastMonth' && 'Last Month'}
                </button>
              ))}
              <div className="border-t border-white/10 mt-2 pt-2">
                <p className="px-3 py-1 text-xs text-white/30">Custom</p>
                <div className="px-3 py-2 space-y-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-none text-white/70"
                    placeholder="Start"
                  />
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-none text-white/70"
                    placeholder="End"
                  />
                  <button
                    onClick={() => handleSelect('custom')}
                    className="w-full text-xs px-2 py-1 bg-accent text-black rounded-none hover:bg-accent/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
