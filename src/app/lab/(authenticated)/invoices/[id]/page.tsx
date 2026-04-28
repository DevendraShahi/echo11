'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Invoice, Project, Client, InvoiceItem } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
import { ArrowLeft, Calendar, DollarSign, User, Folder, Send, CheckCircle, Trash2, Loader2, AlertCircle, Download } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { deleteInvoice, updateInvoiceStatus, emailInvoiceAction } from '@/lib/actions/invoice-actions'
import { downloadInvoicePDF, generateInvoicePDF } from '@/lib/invoice-pdf'
import { Mail } from 'lucide-react'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'

interface InvoicePageProps {
  params: Promise<{ id: string }>
}

type InvoiceWithRelations = Invoice & {
  project?: Pick<Project, 'name'> | null
  client?: Pick<Client, 'company_name' | 'contact_name' | 'email' | 'address' | 'address_line2' | 'city' | 'state' | 'country' | 'postal_code'> | null
  items?: InvoiceItem[]
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

export default function InvoiceDetailPage({ params }: InvoicePageProps) {
  const { id: invoiceId } = use(params)
  const { confirmAction } = useAppFeedback()
  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [emailing, setEmailing] = useState(false)

  useEffect(() => {
    if (invoiceId) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId])

  async function loadData() {
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data: invoiceData, error } = await supabase
        .from('invoices')
        .select(`
          *,
          project:projects(id, name),
          client:clients(id, company_name, contact_name, email, address, address_line2, city, state, country, postal_code)
        `)
        .eq('id', invoiceId)
        .single()

      if (error || !invoiceData) {
        console.error('Error fetching invoice:', error)
        setLoading(false)
        return
      }

      // Fetch invoice items
      const { data: itemsData } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order', { ascending: true })

      setInvoice({
        ...invoiceData,
        items: itemsData || []
      } as InvoiceWithRelations)
    } catch (error) {
      console.error('Error loading invoice:', error)
    }
    setLoading(false)
  }

  async function handleStatusChange(newStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') {
    setUpdating(true)
    const result = await updateInvoiceStatus(invoiceId, newStatus)
    
    if (result.success) {
      loadData()
    }
    setUpdating(false)
  }

  async function handleDelete() {
    const confirmed = await confirmAction('Are you sure you want to delete this invoice?', {
      title: 'Delete Invoice',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!confirmed) return
    
    setDeleting(true)
    const result = await deleteInvoice(invoiceId)
    
    if (result.success) {
      window.location.href = '/lab/invoices'
    }
    setDeleting(false)
  }

  async function handleEmailToClient() {
    if (!invoice?.client?.email) {
      alert('Client has no email address configured.')
      return
    }
    
    setEmailing(true)
    try {
      const blob = await generateInvoicePDF(invoice as Invoice & {
        client?: Pick<Client, 'company_name' | 'contact_name' | 'email' | 'address' | 'address_line2' | 'city' | 'state' | 'country' | 'postal_code'> | null
        project?: Pick<Project, 'name'> | null
        items?: InvoiceItem[]
      })

      if (!blob) {
        throw new Error('Failed to generate PDF Blob');
      }

      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1]
        
        const clientName = invoice.client?.contact_name || invoice.client?.company_name || 'Client'
        const clientEmail = invoice.client?.email || ''
        
        const result = await emailInvoiceAction({
          invoiceId: invoice.id,
          clientName,
          clientEmail,
          invoiceNumber: invoice.invoice_number,
          totalAmount: `$${invoice.total.toFixed(2)}`,
          dueDate: invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'Upon Receipt',
          pdfBase64: base64data
        })

        if (result.success) {
          alert('Invoice emailed successfully to ' + clientEmail)
          loadData()
        } else {
          alert('Failed to email invoice: ' + result.error)
        }
        setEmailing(false)
      }
} catch (e) {
       console.error('Error preparing email payload', e)
       alert('Error preparing invoice payload')
       setEmailing(false)
     }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-rose-400 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Invoice not found</span>
          </div>
          <Link href="/lab/invoices" className="text-accent hover:text-accent/80 transition-colors">
            Back to Invoices
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/lab/invoices"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        {invoice.status === 'overdue' && (
          <div className="flex items-center gap-3 p-4 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-sans">This invoice is overdue. Due {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'date unknown'}.</span>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-sans">{invoice.invoice_number}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className={cn("px-3 py-1 text-sm font-medium rounded", statusColors[invoice.status])}>
                  {statusLabels[invoice.status]}
                </span>
                <span className="text-white/50 font-sans">
                  Created {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <LabButton
                onClick={() => {
                  setGeneratingPdf(true)
                  downloadInvoicePDF(invoice as Invoice & {
                    client?: Pick<Client, 'company_name' | 'contact_name' | 'email' | 'address' | 'address_line2' | 'city' | 'state' | 'country' | 'postal_code'> | null
                    project?: Pick<Project, 'name'> | null
                    items?: InvoiceItem[]
                  })
                  setGeneratingPdf(false)
                }}
                disabled={generatingPdf}
              >
                {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PDF
              </LabButton>
              {(invoice.status === 'draft' || invoice.status === 'sent' || invoice.status === 'overdue') && (
                <LabButton
                  onClick={handleEmailToClient}
                  disabled={emailing || updating}
                >
                  {emailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Email & Send
                </LabButton>
              )}
              {invoice.status === 'draft' && (
                <LabButton 
                  onClick={() => handleStatusChange('sent')}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Mark as Sent
                </LabButton>
              )}
              {invoice.status === 'sent' && (
                <LabButton 
                  onClick={() => handleStatusChange('paid')}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Mark as Paid
                </LabButton>
              )}
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <LabButton 
                  variant="ghost"
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updating}
                >
                  Cancel
                </LabButton>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-rose-400 transition-colors"
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-white/50 font-sans">Client</p>
                {invoice.client_id ? (
                  <Link href={`/lab/clients/${invoice.client_id}`} className="text-sm text-accent hover:text-accent/80 transition-colors font-sans">
                    {(invoice.client as { company_name: string } | null)?.company_name || '-'}
                  </Link>
                ) : (
                  <p className="text-sm text-white font-sans">-</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 flex items-center justify-center">
                <Folder className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-white/50 font-sans">Project</p>
                {invoice.project_id ? (
                  <Link href={`/lab/projects/${invoice.project_id}`} className="text-sm text-accent hover:text-accent/80 transition-colors font-sans">
                    {(invoice.project as { name: string } | null)?.name || '-'}
                  </Link>
                ) : (
                  <p className="text-sm text-white font-sans">-</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-white/50 font-sans">Due Date</p>
                <p className="text-sm text-white font-sans">
                  {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white/50" />
              </div>
              <div>
                <p className="text-xs text-white/50 font-sans">Issued</p>
                <p className="text-sm text-white font-sans">
                  {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/50 font-sans">Total</p>
                <p className="text-sm font-bold text-emerald-400 font-sans">
                  ${(invoice.total ?? 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 mb-6">
          <h3 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wide font-sans">Line Items</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-3 text-xs font-semibold text-white/50 uppercase font-sans">Description</th>
                <th className="text-center pb-3 text-xs font-semibold text-white/50 uppercase font-sans">Qty</th>
                <th className="text-right pb-3 text-xs font-semibold text-white/50 uppercase font-sans">Rate</th>
                <th className="text-right pb-3 text-xs font-semibold text-white/50 uppercase font-sans">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {(invoice.items && invoice.items.length > 0) ? invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-3 text-white/70 font-sans">{item.description}</td>
                  <td className="py-3 text-center text-white/70 font-sans">{item.quantity}</td>
                  <td className="py-3 text-right text-white/70 font-sans">${(item.rate ?? 0).toFixed(2)}</td>
                  <td className="py-3 text-right text-white font-medium font-sans">${(item.amount ?? 0).toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td className="py-3 text-white/50 font-sans">Service</td>
                  <td className="py-3 text-center text-white/50 font-sans">1</td>
                  <td className="py-3 text-right text-white/50 font-sans">${invoice.subtotal?.toFixed(2) || 0}</td>
                  <td className="py-3 text-right text-white font-medium font-sans">${invoice.subtotal?.toFixed(2) || 0}</td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50 font-sans">Subtotal</span>
                <span className="text-white font-sans">${invoice.subtotal?.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50 font-sans">Tax ({invoice.tax_rate}%)</span>
                <span className="text-white font-sans">${invoice.tax_amount?.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                <span className="text-white font-sans">Total</span>
                <span className="text-emerald-400 font-sans">${invoice.total?.toFixed(2) || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="bg-white/5 border border-white/10 p-6">
            <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wide font-sans">Notes</h3>
            <p className="text-white/70 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {invoice.paid_date && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium font-sans">
                Paid on {format(new Date(invoice.paid_date), 'MMMM d, yyyy')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
