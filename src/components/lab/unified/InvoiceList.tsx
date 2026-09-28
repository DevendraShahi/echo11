'use client'

import { Invoice } from '@/types/lab'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Download, FileText, AlertCircle } from 'lucide-react'
import { downloadInvoicePDF } from '@/lib/invoice-pdf'

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

type InvoiceWithRelations = Partial<Invoice> & {
  project?: { name: string } | null
  client?: { company_name: string } | null
}

interface InvoiceListProps {
  invoices: InvoiceWithRelations[]
  showClient?: boolean
  showProject?: boolean
}

export function InvoiceList({ invoices, showClient = true, showProject = true }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/5 border border-white/10 rounded-lg">
        <FileText className="w-12 h-12 text-white/20 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2 font-sans">No invoices found</h3>
        <p className="text-sm text-white/50 font-sans max-w-sm">
          There are no invoices matching this view.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                Invoice #
              </th>
              {showClient && (
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                  Client
                </th>
              )}
              {showProject && (
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wide font-sans">
                  Project
                </th>
              )}
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
            {invoices.map((invoice) => {
              const status = invoice.status || 'draft'
              const isOverdue = status === 'overdue'
              return (
                <tr key={invoice.id} className={cn("transition-colors", isOverdue ? "bg-rose-500/5 hover:bg-rose-500/10" : "hover:bg-white/5")}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isOverdue && <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />}
                      <Link href={`/lab/invoices/${invoice.id}`} className="text-sm font-medium text-white hover:text-accent transition-colors font-sans">
                        {invoice.invoice_number}
                      </Link>
                    </div>
                  </td>
                  {showClient && (
                    <td className="px-6 py-4 text-sm text-white/70 font-sans whitespace-nowrap">
                      {invoice.client?.company_name || '-'}
                    </td>
                  )}
                  {showProject && (
                    <td className="px-6 py-4 text-sm text-white/70 font-sans whitespace-nowrap">
                      {invoice.project?.name || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm font-medium text-white font-sans whitespace-nowrap">
                    ${(invoice.total ?? 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn("px-2 py-1 text-xs font-medium rounded", statusColors[status])}>
                      {statusLabels[status]}
                    </span>
                  </td>
                  <td className={cn("px-6 py-4 text-sm font-sans whitespace-nowrap", isOverdue ? "text-rose-400" : "text-white/70")}>
                    {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => downloadInvoicePDF(invoice as Invoice)}
                        className="p-2 hover:bg-white/10 rounded-none text-white/50 hover:text-accent transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/lab/invoices/${invoice.id}`}
                        className="p-2 hover:bg-white/10 rounded-none text-white/50 hover:text-white transition-colors"
                        title="View details"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
