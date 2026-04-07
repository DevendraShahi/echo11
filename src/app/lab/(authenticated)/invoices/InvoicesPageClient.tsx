'use client'

import { useState } from 'react'
import { Invoice, Project, Client } from '@/types/lab'
import { LabCard as Card, LabCardContent, LabCardHeader, LabCardTitle } from '@/components/ui/LabCard'
import { LabButton } from '@/components/ui/LabButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterTab } from '@/components/ui/FilterTabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, FileText, Download, Send, MoreHorizontal, DollarSign, AlertCircle, Receipt } from 'lucide-react'
import { InvoiceFormModal } from '@/components/lab/InvoiceForm'
import { downloadInvoicePDF } from '@/lib/invoice-pdf'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type InvoiceWithRelations = Omit<Invoice, 'project' | 'client'> & {
  project?: Pick<Project, 'name'> | null
  client?: Pick<Client, 'company_name'> | null
}

interface InvoicesPageProps {
  initialInvoices: InvoiceWithRelations[]
  initialProjects: { id: string; name: string }[]
  forceOpenModal?: boolean
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-400',
  sent: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-emerald-500/20 text-emerald-400',
  overdue: 'bg-rose-500/20 text-rose-400',
  cancelled: 'bg-white/10 text-white/40',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

export default function InvoicesPageClient({ initialInvoices, initialProjects, forceOpenModal }: InvoicesPageProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [isModalOpen, setIsModalOpen] = useState(forceOpenModal || false)
  const [view, setView] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const router = useRouter()

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    pending: invoices.filter((i) => i.status === 'sent').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
    totalRevenue: invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0),
  }

  const filteredInvoices = invoices.filter(invoice => {
    const clientName = invoice.client ? (invoice.client as { company_name: string }).company_name : ''
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProject = !projectFilter || invoice.project_id === projectFilter
    
    let matchesView = true
    if (view !== 'all') {
      matchesView = invoice.status === view
    }
    
    return matchesSearch && matchesProject && matchesView
  })

  function refreshInvoices() {
    router.refresh()
  }

  const statusTabs: FilterTab[] = [
    { id: 'all', label: 'All', count: invoices.length },
    { id: 'draft', label: 'Draft', count: invoices.filter(i => i.status === 'draft').length },
    { id: 'sent', label: 'Sent', count: invoices.filter(i => i.status === 'sent').length },
    { id: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
    { id: 'overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Invoices" 
        description="Manage billing and invoices"
        icon={Receipt}
        action={
          <LabButton onClick={() => setIsModalOpen(true)} data-tour="new-invoice">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </LabButton>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-tour="invoice-stats">
        <Card className="p-4 hover:border-accent/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 font-sans">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-400 font-sans">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:border-accent/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 font-sans">Paid</p>
              <p className="text-2xl font-bold text-white font-sans">{stats.paid}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:border-accent/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 font-sans">Pending</p>
              <p className="text-2xl font-bold text-white font-sans">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:border-accent/20 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 font-sans">Overdue</p>
              <p className="text-2xl font-bold text-rose-400 font-sans">{stats.overdue}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchInput 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Search invoices..."
          className="max-w-xs"
        />
        {initialProjects.length > 0 && (
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-black">All Projects</option>
            {initialProjects.map(p => (
              <option key={p.id} value={p.id} className="bg-black">{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {filteredInvoices.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title={searchQuery || view !== 'all' ? 'No invoices found' : 'No invoices yet'}
          description={searchQuery || view !== 'all' ? 'Try adjusting your search or filters' : 'Create your first invoice to get started'}
          action={!searchQuery && view === 'all' ? {
            label: 'Create Invoice',
            onClick: () => setIsModalOpen(true)
          } : undefined}
        />
      ) : (
        <div className="bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                  Invoice #
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                  Client
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                  Project
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                  Due Date
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/lab/invoices/${invoice.id}`} className="text-sm font-medium text-white hover:text-accent transition-colors font-sans">
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70 font-sans">
                    {invoice.client ? (invoice.client as { company_name: string }).company_name : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70 font-sans">
                    {invoice.project ? (invoice.project as { name: string }).name : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white font-sans">
                    ${invoice.total?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 text-xs font-medium", statusColors[invoice.status])}>
                      {statusLabels[invoice.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70 font-sans">
                    {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => downloadInvoicePDF(invoice as Invoice)}
                        className="p-2 hover:bg-white/10 rounded-none text-white/50 hover:text-accent transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link 
                        href={`/lab/invoices/${invoice.id}`}
                        className="p-2 hover:bg-white/10 rounded-none text-white/50 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InvoiceFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refreshInvoices}
      />
    </div>
  )
}