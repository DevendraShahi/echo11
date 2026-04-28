'use client'

import { useState, useEffect } from 'react'
import { LabButton } from '@/components/ui/LabButton'
import { getContractTemplates, createContract, uploadContractFile, generateContractFromTemplate } from '@/lib/actions/contract-actions'
import { getClientsWithStats, type ClientWithRelations } from '@/lib/actions/client-actions'
import { ContractTemplate, ContractStatus } from '@/types/lab'
import { X, Upload, FileText, Wand2, Loader2, Check, Eye, ArrowLeft } from 'lucide-react'
import { substituteVariables, getDefaultVariables } from '@/lib/contract-template-engine'
import { ContractAgreementPreview } from '@/components/contracts/ContractAgreementPreview'

interface ContractFormModalProps {
  onClose: () => void
  onSuccess: () => void
  clientId?: string
  clientData?: { company_name: string; contact_name: string; email: string; address: string; phone: string }
}

export function ContractFormModal({ onClose, onSuccess, clientId, clientData }: ContractFormModalProps) {
  const [step, setStep] = useState<'choose' | 'form' | 'upload' | 'preview'>('choose')
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [clients, setClients] = useState<ClientWithRelations[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState(clientId ?? '')
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewContent, setPreviewContent] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<ContractStatus>('draft')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    getContractTemplates().then(setTemplates)
  }, [])

  useEffect(() => {
    setSelectedClientId(clientId ?? '')
  }, [clientId])

  useEffect(() => {
    if (clientId) return

    let isMounted = true
    setClientsLoading(true)
    setErrorMessage(null)

    getClientsWithStats()
      .then((data) => {
        if (!isMounted) return
        setClients(data)
      })
      .catch((error) => {
        console.error('Failed to load clients for contract modal:', error)
        if (!isMounted) return
        setErrorMessage('Unable to load clients. Please try again.')
      })
      .finally(() => {
        if (!isMounted) return
        setClientsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [clientId])

  const resolvedClientId = clientId || selectedClientId
  const selectedClientData = clientData || clients.find((client) => client.id === selectedClientId)

  const handleTemplateSelect = (template: ContractTemplate) => {
    setErrorMessage(null)
    setSelectedTemplate(template)
    setTitle(template.name)
    setUploadedFile(null)
    setStep('form')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    if (file.type !== 'application/pdf') {
      setErrorMessage('Only PDF files are supported for contract uploads.')
      setUploadedFile(null)
      return
    }

    setErrorMessage(null)
    setSelectedTemplate(null)
    setUploadedFile(file)
    setTitle((prevTitle) => prevTitle || file.name.replace(/\.pdf$/i, ''))
  }

  const handlePreview = () => {
    if (!selectedTemplate) return
    setErrorMessage(null)
    const variables = getDefaultVariables()
    const filled = substituteVariables(selectedTemplate.content, {
      company_name: selectedClientData?.company_name || variables.company_name,
      client_name: selectedClientData?.contact_name || variables.client_name,
      client_email: selectedClientData?.email || variables.client_email,
      client_address: selectedClientData?.address || variables.client_address,
      client_phone: selectedClientData?.phone || variables.client_phone,
      contract_title: title,
      date: new Date().toISOString().split('T')[0],
      start_date: startDate,
      end_date: endDate,
      value: value,
      notes: notes
    })
    setPreviewContent(filled)
    setStep('preview')
  }

  const handleSubmit = async () => {
    setErrorMessage(null)

    if (!resolvedClientId) {
      setErrorMessage('A client is required before creating a contract.')
      return
    }

    if (!title) {
      setErrorMessage('Contract title is required.')
      return
    }

    if (step === 'upload' && !uploadedFile) {
      setErrorMessage('Please upload a PDF file before creating the contract.')
      return
    }

    setLoading(true)

    const result = await createContract({
      client_id: resolvedClientId,
      title,
      template_id: selectedTemplate?.id,
      status,
      value: value ? parseFloat(value) : undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      notes: notes || undefined
    })

    if (!result.success || !result.contract) {
      setLoading(false)
      setErrorMessage(result.error || 'Failed to create contract.')
      return
    }

    if (result.success && result.contract) {
      const contractId = result.contract.id

      let fileResult: { success: boolean; error?: string } | null = null
      if (uploadedFile) {
        fileResult = await uploadContractFile(contractId, uploadedFile)
      } else if (selectedTemplate) {
        fileResult = await generateContractFromTemplate(contractId)
      }

      if (fileResult && !fileResult.success) {
        setLoading(false)
        setErrorMessage(fileResult.error || 'Contract was created, but file generation/upload failed.')
        return
      }

      setLoading(false)
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-[#0a0a0a] border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-white/5 sticky top-0 bg-[#0a0a0a] z-10">
          <div className="flex items-center gap-3">
            {step !== 'choose' && (
              <button onClick={() => setStep('choose')} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              {step === 'choose' && 'Create Contract'}
              {step === 'form' && 'Contract Details'}
              {step === 'upload' && 'Upload PDF'}
              {step === 'preview' && 'Preview Contract'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {step === 'choose' && (
            <div className="space-y-6">
              <p className="text-sm text-white/50 font-mono">How would you like to create this contract?</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setErrorMessage(null)
                    setSelectedTemplate(null)
                    setStep('upload')
                  }}
                  className="p-6 border border-white/10 hover:border-accent/30 bg-white/5 hover:bg-accent/5 transition-all group text-left"
                >
                  <div className="w-12 h-12 border border-white/10 group-hover:border-accent/30 bg-white/5 group-hover:bg-accent/10 flex items-center justify-center mb-4 transition-colors">
                    <Upload className="w-5 h-5 text-white/40 group-hover:text-accent transition-colors" />
                  </div>
                  <p className="text-white font-mono text-sm mb-1">Upload Existing PDF</p>
                  <p className="text-xs text-white/40 font-mono">Upload a contract you already have</p>
                </button>
                <button
                  onClick={() => {
                    setErrorMessage(null)
                    if (templates.length > 0) {
                      handleTemplateSelect(templates[0])
                    }
                  }}
                  className="p-6 border border-white/10 hover:border-accent/30 bg-white/5 hover:bg-accent/5 transition-all group text-left"
                >
                  <div className="w-12 h-12 border border-white/10 group-hover:border-accent/30 bg-white/5 group-hover:bg-accent/10 flex items-center justify-center mb-4 transition-colors">
                    <Wand2 className="w-5 h-5 text-white/40 group-hover:text-accent transition-colors" />
                  </div>
                  <p className="text-white font-mono text-sm mb-1">Generate from Template</p>
                  <p className="text-xs text-white/40 font-mono">Use a pre-built contract template</p>
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-mono uppercase text-white/40">Available Templates</p>
                <div className="space-y-1">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="w-full flex items-center justify-between p-3 border border-white/5 hover:border-accent/30 bg-white/5 hover:bg-accent/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-white/30 group-hover:text-accent transition-colors" />
                        <div>
                          <p className="text-sm text-white font-mono">{template.name}</p>
                          <p className="text-xs text-white/30 font-mono">{template.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <span className="text-xs text-white/20 group-hover:text-accent transition-colors font-mono">Select →</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(step === 'form' || step === 'upload') && (
            <div className="space-y-4">
              {errorMessage && (
                <div className="border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-mono text-rose-300">
                  {errorMessage}
                </div>
              )}

              {step === 'upload' && (
                <div>
                  <label className="block text-xs font-mono uppercase text-white/50 mb-2">Contract PDF *</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono file:mr-4 file:border-0 file:bg-accent/10 file:text-accent file:px-3 file:py-1 file:font-mono file:text-xs"
                  />
                </div>
              )}

              {step === 'upload' && uploadedFile && (
                <div className="p-3 border border-accent/20 bg-accent/5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    <span className="text-sm text-white font-mono">{uploadedFile.name}</span>
                    <span className="text-xs text-white/40 font-mono">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                </div>
              )}

              {!clientId && (
                <div>
                  <label className="block text-xs font-mono uppercase text-white/50 mb-2">Client *</label>
                  {clientsLoading ? (
                    <div className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white/40 text-sm font-mono">
                      Loading clients...
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="w-full px-4 py-2.5 bg-white/5 border border-amber-500/30 text-amber-300 text-sm font-mono">
                      No clients found. Create a client first.
                    </div>
                  ) : (
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer"
                      required
                    >
                      <option value="" className="bg-black">
                        Select a client
                      </option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id} className="bg-black">
                          {client.company_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-white/50 mb-2">Contract Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Service Agreement - Q1 2026"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-white/50 mb-2">Value ($)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-white/50 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ContractStatus)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer"
                  >
                    <option value="draft" className="bg-black">Draft</option>
                    <option value="pending" className="bg-black">Pending</option>
                    <option value="signed" className="bg-black">Signed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-white/50 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none [&::-webkit-calendar-picker-indicator]:filter:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-white/50 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none [&::-webkit-calendar-picker-indicator]:filter:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/50 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Additional terms or notes..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <LabButton variant="ghost" onClick={onClose} className="flex-1 font-mono text-xs uppercase tracking-wider">Cancel</LabButton>
                {selectedTemplate && step === 'form' && (
                  <LabButton
                    variant="outline"
                    onClick={handlePreview}
                    disabled={clientsLoading || !resolvedClientId || !title}
                    className="flex-1 font-mono text-xs uppercase tracking-wider"
                  >
                    <Eye className="w-3 h-3 mr-2" />Preview
                  </LabButton>
                )}
                <LabButton
                  onClick={handleSubmit}
                  disabled={loading || clientsLoading || !resolvedClientId || !title || (step === 'upload' && !uploadedFile)}
                  className="flex-1 font-mono text-xs uppercase tracking-wider"
                >
                  {loading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Check className="w-3 h-3 mr-2" />}
                  {step === 'upload' ? 'Upload & Create' : 'Create Contract'}
                </LabButton>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {errorMessage && (
                <div className="border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-mono text-rose-300">
                  {errorMessage}
                </div>
              )}

              <div className="border border-white/10 bg-[#070707]">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <p className="text-xs font-mono uppercase tracking-wider text-white/40">Agreement Draft</p>
                  <p className="text-xs font-mono text-white/30">{title || 'Untitled Contract'}</p>
                </div>
                <div className="p-5 max-h-96 overflow-y-auto">
                  <ContractAgreementPreview content={previewContent} />
                </div>
              </div>
              <div className="flex gap-2">
                <LabButton variant="ghost" onClick={() => setStep('form')} className="flex-1 font-mono text-xs uppercase tracking-wider">Back to Edit</LabButton>
                <LabButton
                  onClick={handleSubmit}
                  disabled={loading || clientsLoading || !resolvedClientId || !title}
                  className="flex-1 font-mono text-xs uppercase tracking-wider"
                >
                  {loading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Check className="w-3 h-3 mr-2" />}
                  Generate & Save
                </LabButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
