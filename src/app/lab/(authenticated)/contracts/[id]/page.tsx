'use client'

import { useState, useEffect, use } from 'react'
import { LabButton } from '@/components/ui/LabButton'
import { Contract, ContractStatus } from '@/types/lab'
import { getContractDetail, updateContractStatus, uploadContractFile, generateContractFromTemplate, sendContractToClient, deleteContract } from '@/lib/actions/contract-actions'
import { 
  ArrowLeft, FileText, Calendar, DollarSign, Mail, Download, Send, 
  Upload, Wand2, Trash2, Loader2, Check, File, ExternalLink, X
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { downloadContractPDF } from '@/lib/contract-pdf'
import { substituteVariables, getDefaultVariables } from '@/lib/contract-template-engine'
import { ContractAgreementPreview } from '@/components/contracts/ContractAgreementPreview'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'

interface ContractPageProps {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  draft: 'bg-white/5 border-white/10 text-white/40',
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  signed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  expired: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  terminated: 'bg-white/5 border-white/10 text-white/30',
}

const statusFlow: ContractStatus[] = ['draft', 'pending', 'signed', 'expired']

export default function ContractPage({ params }: ContractPageProps) {
  const { id } = use(params)
  const { confirmAction } = useAppFeedback()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState('')
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendEmail, setSendEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function loadData() {
    setLoading(true)
    const data = await getContractDetail(id)
    setContract(data)
    
    if (data?.generated_content) {
      setPreviewContent(data.generated_content)
    } else if (data?.template?.content && data.client) {
      const client = data.client as { company_name: string; contact_name: string; email: string; address: string; phone: string }
      const variables = getDefaultVariables()
      const filled = substituteVariables(data.template.content, {
        company_name: client.company_name || variables.company_name,
        client_name: client.contact_name || variables.client_name,
        client_email: client.email || variables.client_email,
        client_address: client.address || variables.client_address,
        client_phone: client.phone || variables.client_phone,
        contract_title: data.contract_number || data.title,
        date: new Date().toISOString().split('T')[0],
        start_date: data.start_date || variables.start_date,
        end_date: data.end_date || variables.end_date,
        value: data.value?.toString() || variables.value,
        notes: data.notes || variables.notes
      })
      setPreviewContent(filled)
    }
    
    setLoading(false)
  }

  async function handleStatusChange(newStatus: ContractStatus) {
    setActionLoading(`status-${newStatus}`)
    const result = await updateContractStatus(id, newStatus)
    if (!result.success) {
      alert(result.error || 'Failed to update contract status')
      setActionLoading(null)
      return
    }
    await loadData()
    setActionLoading(null)
  }

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.')
      return
    }
    setActionLoading('upload')
    const result = await uploadContractFile(id, file)
    if (!result.success) {
      alert(result.error || 'Failed to upload contract PDF')
      setActionLoading(null)
      return
    }
    await loadData()
    setActionLoading(null)
  }

  async function handleGeneratePDF() {
    setActionLoading('generate')
    const result = await generateContractFromTemplate(id)
    if (!result.success) {
      alert(result.error || 'Failed to generate contract PDF')
      setActionLoading(null)
      return
    }
    await loadData()
    setActionLoading(null)
  }

  async function handleDownloadPDF() {
    if (!contract) return
    
    if (contract.file_url) {
      window.open(contract.file_url, '_blank')
      return
    }

    const client = contract.client as { company_name: string; contact_name: string; email: string; address: string; phone: string } | null
    await downloadContractPDF({
      contractNumber: contract.contract_number || contract.title,
      title: contract.title,
      companyName: client?.company_name || 'Echo11',
      clientName: client?.contact_name || '',
      clientEmail: client?.email || '',
      clientAddress: client?.address || '',
      clientPhone: client?.phone || '',
      startDate: contract.start_date || '',
      endDate: contract.end_date || '',
      value: contract.value || 0,
      content: previewContent,
      notes: contract.notes || ''
    }, `${contract.contract_number || 'contract'}.pdf`)
  }

  async function handleSendContract() {
    if (!sendEmail) return
    setActionLoading('send')
    const result = await sendContractToClient(id, sendEmail)
    if (!result.success) {
      alert(result.error || 'Failed to send contract email')
      setActionLoading(null)
      return
    }
    await loadData()
    setActionLoading(null)
    setShowSendModal(false)
    setSendEmail('')
  }

  async function handleDelete() {
    const confirmed = await confirmAction('Delete this contract? This cannot be undone.', {
      title: 'Delete Contract',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!confirmed) return
    if (!contract) return
    setActionLoading('delete')
    const result = await deleteContract(id, contract.client_id)
    if (!result.success) {
      alert(result.error || 'Failed to delete contract')
      setActionLoading(null)
      return
    }
    router.push('/lab/contracts')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="text-center py-12 text-white/30 font-mono text-sm">Contract not found</div>
    )
  }

  const client = contract.client as { company_name?: string; contact_name?: string; email?: string } | null
  const currentStatusIdx = statusFlow.indexOf(contract.status as ContractStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/lab/contracts" className="p-2 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-sans text-white">{contract.title}</h1>
              {contract.contract_number && (
                <span className="text-xs text-white/30 font-mono">{contract.contract_number}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Link href={`/lab/clients/${contract.client_id}`} className="text-sm text-white/50 font-mono hover:text-accent transition-colors">
                {client?.company_name || 'Unknown Client'}
              </Link>
              <span className={cn("px-2 py-0.5 text-xs font-mono uppercase tracking-wider border", statusColors[contract.status || 'draft'])}>
                {contract.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LabButton variant="ghost" size="sm" onClick={handleDownloadPDF} disabled={actionLoading !== null}>
            <Download className="w-3.5 h-3.5 mr-1.5" />Download
          </LabButton>
          <LabButton variant="ghost" size="sm" onClick={() => setShowSendModal(true)} disabled={actionLoading !== null}>
            <Send className="w-3.5 h-3.5 mr-1.5" />Send
          </LabButton>
          <LabButton variant="ghost" size="sm" onClick={handleDelete} disabled={actionLoading !== null}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
          </LabButton>
        </div>
      </div>

      {/* Status Workflow */}
      <div className="p-4 bg-white/5 border border-white/10">
        <p className="text-xs font-mono uppercase text-white/40 mb-3">Status Workflow</p>
        <div className="flex items-center gap-2">
          {statusFlow.map((status, idx) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={actionLoading !== null}
              className={cn(
                "flex-1 py-2 px-3 text-xs font-mono uppercase tracking-wider border transition-all",
                idx <= currentStatusIdx
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-white/5 border-white/10 text-white/30 hover:border-white/20 hover:text-white/50"
              )}
            >
              {idx <= currentStatusIdx && <Check className="w-3 h-3 inline mr-1" />}
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white">Contract Content</h3>
              <div className="flex items-center gap-2">
                {!contract.file_url && contract.template && (
                  <label className="cursor-pointer">
                    <input type="file" accept=".pdf" className="hidden" onChange={handleUploadFile} />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors">
                      <Upload className="w-3 h-3" />Upload PDF
                    </span>
                  </label>
                )}
                {!contract.file_url && contract.template && (
                  <LabButton variant="outline" size="sm" onClick={handleGeneratePDF} disabled={actionLoading === 'generate'}>
                    {actionLoading === 'generate' ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1.5" />}
                    Generate PDF
                  </LabButton>
                )}
              </div>
            </div>
            {contract.file_url ? (
              <div className="p-4">
                <div className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/20 mb-4">
                  <File className="w-5 h-5 text-accent" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-mono">{contract.file_name || 'Contract PDF'}</p>
                    <p className="text-xs text-white/40 font-mono">PDF document attached</p>
                  </div>
                  <a href={contract.file_url} target="_blank" className="text-xs text-accent hover:text-accent/80 font-mono uppercase tracking-wider flex items-center gap-1">
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <iframe
                  src={contract.file_url}
                  className="w-full h-[600px] border border-white/10 bg-white"
                  title="Contract PDF"
                />
              </div>
            ) : previewContent ? (
              <div className="p-6 max-h-[680px] overflow-y-auto">
                <div className="border border-white/10 bg-[#070707]">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                    <p className="text-xs font-mono uppercase tracking-wider text-white/40">Agreement Content</p>
                    <p className="text-xs font-mono text-white/30">{contract.contract_number || contract.title}</p>
                  </div>
                  <div className="p-6">
                    <ContractAgreementPreview content={previewContent} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-white/30 font-mono text-sm">
                No contract content yet. Upload a PDF or generate from template.
              </div>
            )}
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 p-4 space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">Details</h3>
            
            {contract.value && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                  <DollarSign className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-mono">Value</p>
                  <p className="text-sm text-white font-mono">${contract.value.toLocaleString()}</p>
                </div>
              </div>
            )}

            {contract.start_date && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                  <Calendar className="w-4 h-4 text-white/40" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-mono">Start Date</p>
                  <p className="text-sm text-white font-mono">{format(new Date(contract.start_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            )}

            {contract.end_date && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                  <Calendar className="w-4 h-4 text-white/40" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-mono">End Date</p>
                  <p className="text-sm text-white font-mono">{format(new Date(contract.end_date), 'MMM d, yyyy')}</p>
                </div>
              </div>
            )}

            {contract.template && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                  <FileText className="w-4 h-4 text-white/40" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-mono">Template</p>
                  <p className="text-sm text-white font-mono">{contract.template.name}</p>
                </div>
              </div>
            )}

            {contract.sent_at && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                  <Send className="w-4 h-4 text-white/40" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-mono">Sent At</p>
                  <p className="text-sm text-white font-mono">{format(new Date(contract.sent_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
            )}

            {contract.signed_at && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-mono">Signed At</p>
                  <p className="text-sm text-emerald-400 font-mono">{format(new Date(contract.signed_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
            )}
          </div>

          {client?.email && (
            <div className="bg-white/5 border border-white/10 p-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white mb-3">Client Contact</h3>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/60 font-mono">{client.email}</span>
              </div>
            </div>
          )}

          {contract.notes && (
            <div className="bg-white/5 border border-white/10 p-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white mb-2">Notes</h3>
              <p className="text-xs text-white/50 font-mono whitespace-pre-wrap">{contract.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Send Contract Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowSendModal(false)} />
          <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10">
            <div className="flex justify-between items-center p-4 border-b border-white/5">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white">Send Contract</h3>
              <button onClick={() => setShowSendModal(false)} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-white/50 mb-2">Recipient Email</label>
                <input
                  type="email"
                  value={sendEmail}
                  onChange={e => setSendEmail(e.target.value)}
                  placeholder={client?.email || 'client@email.com'}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <LabButton variant="ghost" onClick={() => setShowSendModal(false)} className="flex-1 font-mono text-xs uppercase tracking-wider">Cancel</LabButton>
                <LabButton onClick={handleSendContract} disabled={actionLoading === 'send' || !sendEmail} className="flex-1 font-mono text-xs uppercase tracking-wider">
                  {actionLoading === 'send' ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
                  Send
                </LabButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
