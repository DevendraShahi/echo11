'use client'

import { useState } from 'react'
import { FileText, Download, Clock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { downloadInvoicePDF } from '@/lib/invoice-pdf'
import { InvoiceWithRelations } from '@/lib/actions/invoice-actions'

type InvoiceClient = {
  id: string
  invoice_number: string
  status: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  due_date: string | null
  paid_date: string | null
  created_at: string
}

interface PortalInvoicesClientProps {
  initialInvoices: InvoiceClient[]
}

export function PortalInvoicesClient({ initialInvoices }: PortalInvoicesClientProps) {
  const [invoices] = useState(initialInvoices)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const paidInvoices = invoices.filter(i => i.status === 'paid')
  const pendingInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.total, 0)
  const totalPending = pendingInvoices.reduce((sum, i) => sum + i.total, 0)

  const handleDownload = async (invoice: InvoiceClient) => {
    setDownloadingId(invoice.id)
    try {
      await downloadInvoicePDF(invoice as unknown as InvoiceWithRelations)
    } catch (error) {
      console.error('Failed to download invoice:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-sans">Invoices</h1>
          <p className="text-white/50 mt-1">View and track your invoices</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#0a0a0a] border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-accent" />
            <span className="text-white/50 text-xs font-mono uppercase tracking-wider">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">${totalPaid.toLocaleString()}</p>
          <p className="text-white/40 text-sm font-mono">{paidInvoices.length} invoice{paidInvoices.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="p-5 bg-[#0a0a0a] border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-white/50 text-xs font-mono uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">${totalPending.toLocaleString()}</p>
          <p className="text-white/40 text-sm font-mono">{pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="p-5 bg-[#0a0a0a] border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-white/50 text-xs font-mono uppercase tracking-wider">Total Invoiced</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            ${(totalPaid + totalPending).toLocaleString()}
          </p>
          <p className="text-white/40 text-sm font-mono">{invoices.length} total</p>
        </div>
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <div className="p-12 bg-[#0a0a0a] border border-white/10 text-center">
          <div className="w-16 h-16 bg-white/5 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No invoices yet</h3>
          <p className="text-white/40">Your invoices will appear here once generated.</p>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-4 text-white/50 text-xs font-mono uppercase tracking-wider">Invoice</th>
                <th className="text-left px-5 py-4 text-white/50 text-xs font-mono uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-4 text-white/50 text-xs font-mono uppercase tracking-wider">Due Date</th>
                <th className="text-right px-5 py-4 text-white/50 text-xs font-mono uppercase tracking-wider">Amount</th>
                <th className="text-center px-5 py-4 text-white/50 text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-4 text-white/50 text-xs font-mono uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-white font-medium font-mono">{invoice.invoice_number}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-white/70 font-mono text-sm">
                      {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-white/70 font-mono text-sm">
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-white font-mono">${invoice.total.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider ${
                      invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                      invoice.status === 'sent' ? 'bg-accent/10 text-accent' :
                      invoice.status === 'overdue' ? 'bg-rose-500/10 text-rose-400' :
                      invoice.status === 'draft' ? 'bg-white/10 text-white/50' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => handleDownload(invoice)}
                      disabled={downloadingId === invoice.id}
                      className="p-2 hover:bg-white/5 transition-colors text-white/40 hover:text-accent disabled:opacity-50"
                    >
                      {downloadingId === invoice.id ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
