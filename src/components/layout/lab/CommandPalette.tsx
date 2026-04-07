'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Command, X, FileText, Users, FolderKanban, CheckSquare, Calendar, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'client' | 'project' | 'task' | 'meeting' | 'invoice' | 'contract'
  title: string
  subtitle?: string
  href: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    async function search() {
      setLoading(true)
      const supabase = createClient()
      const q = query.toLowerCase()
      const newResults: SearchResult[] = []

      const { data: clients } = await supabase
        .from('clients')
        .select('id, company_name, email')
        .ilike('company_name', `%${q}%`)
        .limit(3)
      if (clients) {
        clients.forEach(c => newResults.push({
          id: c.id,
          type: 'client',
          title: c.company_name,
          subtitle: c.email || undefined,
          href: `/lab/clients/${c.id}`
        }))
      }

      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, status')
        .ilike('name', `%${q}%`)
        .limit(3)
      if (projects) {
        projects.forEach(p => newResults.push({
          id: p.id,
          type: 'project',
          title: p.name,
          subtitle: p.status,
          href: `/lab/projects/${p.id}`
        }))
      }

      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, status')
        .ilike('title', `%${q}%`)
        .limit(3)
      if (tasks) {
        tasks.forEach(t => newResults.push({
          id: t.id,
          type: 'task',
          title: t.title,
          subtitle: t.status,
          href: `/lab/tasks/${t.id}`
        }))
      }

      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, status')
        .ilike('invoice_number', `%${q}%`)
        .limit(3)
      if (invoices) {
        invoices.forEach(i => newResults.push({
          id: i.id,
          type: 'invoice',
          title: i.invoice_number,
          subtitle: i.status,
          href: `/lab/invoices/${i.id}`
        }))
      }

      setResults(newResults)
      setSelectedIndex(0)
      setLoading(false)
    }

    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      window.location.href = results[selectedIndex].href
    }
  }, [results, selectedIndex])

  const typeIcons: Record<string, React.ReactNode> = {
    client: <Users className="w-4 h-4" />,
    project: <FolderKanban className="w-4 h-4" />,
    task: <CheckSquare className="w-4 h-4" />,
    meeting: <Calendar className="w-4 h-4" />,
    invoice: <FileText className="w-4 h-4" />,
    contract: <FileText className="w-4 h-4" />,
  }

  const typeColors: Record<string, string> = {
    client: 'text-blue-400',
    project: 'text-purple-400',
    task: 'text-amber-400',
    meeting: 'text-emerald-400',
    invoice: 'text-cyan-400',
    contract: 'text-rose-400',
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-none text-white/50 text-sm hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 font-sans cursor-pointer"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 bg-white/10 rounded text-xs font-mono">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl mx-4 bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4 border-b border-white/5">
                <Search className="w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search clients, projects, tasks..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm font-sans focus:outline-none"
                />
                <button onClick={() => setIsOpen(false)} className="p-1 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-white/30 text-sm font-mono">Searching...</div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-white/30 text-sm font-mono">
                    {query ? 'No results found' : 'Type to search...'}
                  </div>
                ) : (
                  <div className="p-2">
                    {results.map((result, index) => (
                      <Link
                        key={`${result.type}-${result.id}`}
                        href={result.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded transition-colors",
                          index === selectedIndex ? "bg-white/10" : "hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 bg-white/5 flex items-center justify-center", typeColors[result.type])}>
                            {typeIcons[result.type]}
                          </div>
                          <div>
                            <p className="text-sm text-white font-sans">{result.title}</p>
                            <p className="text-xs text-white/40 font-mono capitalize">{result.type} {result.subtitle && `· ${result.subtitle}`}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/20" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border-t border-white/5 text-xs text-white/30 font-mono">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↵</kbd>
                  <span>Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white/5 rounded">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}