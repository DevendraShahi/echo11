'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { FileText, Plus, Receipt, WalletCards } from 'lucide-react'
import { Invoice, Project, Client, Contract } from '@/types/lab'
import { LabButton } from '@/components/ui/LabButton'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterTabs, FilterTab } from '@/components/ui/FilterTabs'
import { LabPageHeader } from '@/components/lab/primitives/LabPageHeader'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { InvoiceFormModal } from '@/components/lab/InvoiceForm'
import { ContractFormModal } from '@/components/lab/ContractFormModal'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type InvoiceWithRelations = Omit<Invoice, 'project' | 'client'> & {
  project?: Pick<Project, 'name'> | null
  client?: Pick<Client, 'company_name' | 'contact_name'> | null
}

type ContractWithRelations = Contract & {
  client?: Pick<Client, 'company_name' | 'contact_name'> | null
  template?: { name: string } | null
}

interface FinancePageClientProps {
  initialInvoices: InvoiceWithRelations[]
  initialContracts: ContractWithRelations[]
  initialProjects: { id: string; name: string }[]
  canEdit?: boolean
}

const invoiceStatusStyles: Record<string, string> = {
  draft: 'border-white/20 bg-white/5 text-white/60',
  sent: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  overdue: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  cancelled: 'border-white/20 bg-white/5 text-white/45',
}

const contractStatusStyles: Record<string, string> = {
  draft: 'border-white/20 bg-white/5 text-white/60',
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  signed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  expired: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  terminated: 'border-white/20 bg-white/5 text-white/45',
}

export function FinancePageClient({
  initialInvoices,
  initialContracts,
  initialProjects,
  canEdit = false,
}: FinancePageClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'invoices' | 'contracts'>('invoices')
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all')
  const [contractStatusFilter, setContractStatusFilter] = useState<string>('all')
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)

  const invoices = initialInvoices
  const contracts = initialContracts

  const invoiceStats = useMemo(() => {
    const paid = invoices.filter((invoice) => invoice.status === 'paid')
    const pending = invoices.filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')

    return {
      total: invoices.length,
      paidCount: paid.length,
      overdueCount: invoices.filter((invoice) => invoice.status === 'overdue').length,
      paidValue: paid.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
      pendingValue: pending.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
    }
  }, [invoices])

  const contractStats = useMemo(() => {
    const signed = contracts.filter((contract) => contract.status === 'signed')

    return {
      total: contracts.length,
      signedCount: signed.length,
      pendingCount: contracts.filter((contract) => contract.status === 'pending').length,
      signedValue: signed.reduce((sum, contract) => sum + (contract.value || 0), 0),
    }
  }, [contracts])

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return invoices.filter((invoice) => {
      const invoiceNumber = invoice.invoice_number || ''
      const clientName = invoice.client?.company_name || ''
      const matchesSearch =
        !query ||
        invoiceNumber.toLowerCase().includes(query) ||
        clientName.toLowerCase().includes(query)
      const matchesProject = !projectFilter || invoice.project_id === projectFilter
      const matchesStatus = invoiceStatusFilter === 'all' || invoice.status === invoiceStatusFilter

      return matchesSearch && matchesProject && matchesStatus
    })
  }, [invoices, invoiceStatusFilter, projectFilter, searchQuery])

  const filteredContracts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return contracts.filter((contract) => {
      const contractNumber = contract.contract_number || ''
      const clientName = contract.client?.company_name || ''
      const matchesSearch =
        !query ||
        contractNumber.toLowerCase().includes(query) ||
        clientName.toLowerCase().includes(query)
      const matchesStatus = contractStatusFilter === 'all' || contract.status === contractStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [contracts, contractStatusFilter, searchQuery])

  const mainTabs: FilterTab[] = [
    { id: 'invoices', label: 'Invoices', count: invoices.length },
    { id: 'contracts', label: 'Contracts', count: contracts.length },
  ]

  const invoiceStatusTabs: FilterTab[] = [
    { id: 'all', label: 'All', count: invoices.length },
    { id: 'draft', label: 'Draft', count: invoices.filter((item) => item.status === 'draft').length },
    { id: 'sent', label: 'Sent', count: invoices.filter((item) => item.status === 'sent').length },
    { id: 'paid', label: 'Paid', count: invoices.filter((item) => item.status === 'paid').length },
    { id: 'overdue', label: 'Overdue', count: invoices.filter((item) => item.status === 'overdue').length },
  ]

  const contractStatusTabs: FilterTab[] = [
    { id: 'all', label: 'All', count: contracts.length },
    { id: 'draft', label: 'Draft', count: contracts.filter((item) => item.status === 'draft').length },
    { id: 'pending', label: 'Pending', count: contracts.filter((item) => item.status === 'pending').length },
    { id: 'signed', label: 'Signed', count: contracts.filter((item) => item.status === 'signed').length },
    { id: 'expired', label: 'Expired', count: contracts.filter((item) => item.status === 'expired').length },
  ]

  return (
    <div className="space-y-6 font-sans">
      <section className="relative overflow-hidden border border-white/10 bg-[linear-gradient(155deg,rgba(0,229,255,0.08),rgba(0,0,0,0)_42%),#05090f]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <LabPageHeader
            title="Finance"
            description="Invoices and contracts in one operational ledger"
            icon={WalletCards}
            className="w-full"
            action={canEdit ? (
              <LabButton onClick={() => (tab === 'invoices' ? setIsInvoiceModalOpen(true) : setIsContractModalOpen(true))}>
                <Plus className="mr-2 h-4 w-4" />
                {tab === 'invoices' ? 'New Invoice' : 'New Contract'}
              </LabButton>
            ) : undefined}
          />
        </div>

        <div className="px-4 py-3">
          <FilterTabs
            tabs={mainTabs}
            activeTab={tab}
            onChange={(id) => {
              setTab(id as 'invoices' | 'contracts')
              setSearchQuery('')
              setProjectFilter('')
              setInvoiceStatusFilter('all')
              setContractStatusFilter('all')
            }}
            className="border-none pb-0"
          />
        </div>
      </section>

      {tab === 'invoices' ? (
        <>
          <MetricStrip
            items={[
              { label: 'Invoices', value: invoiceStats.total },
              { label: 'Paid Value', value: `$${invoiceStats.paidValue.toLocaleString()}`, tone: 'success' },
              { label: 'Pending Value', value: `$${invoiceStats.pendingValue.toLocaleString()}`, tone: 'warning' },
              { label: 'Overdue Count', value: invoiceStats.overdueCount, tone: invoiceStats.overdueCount > 0 ? 'danger' : 'default' },
            ]}
          />

          <PanelSection title="Invoice Ledger" description="Search, filter, and process billing by project and status">
            <div className="space-y-4">
              <FilterTabs tabs={invoiceStatusTabs} activeTab={invoiceStatusFilter} onChange={setInvoiceStatusFilter} />

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search invoice number or client"
                  className="max-w-full md:max-w-sm"
                />

                {initialProjects.length > 0 ? (
                  <select
                    value={projectFilter}
                    onChange={(event) => setProjectFilter(event.target.value)}
                    className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white md:w-64"
                  >
                    <option value="">All Projects</option>
                    {initialProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>

              {filteredInvoices.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No invoices found"
                  description={searchQuery || invoiceStatusFilter !== 'all' ? 'Try adjusting filters or search.' : 'Create your first invoice to start tracking cash flow.'}
                  action={
                    !searchQuery && invoiceStatusFilter === 'all' && canEdit
                      ? { label: 'Create Invoice', onClick: () => setIsInvoiceModalOpen(true) }
                      : undefined
                  }
                />
              ) : (
                <div className="space-y-px border border-white/10 bg-white/5">
                  {filteredInvoices.map((invoice) => (
                    <article key={invoice.id} className="grid gap-3 bg-black/60 px-4 py-3 md:grid-cols-[1.1fr_auto_auto] md:items-center">
                      <div className="min-w-0">
                        <Link href={`/lab/invoices/${invoice.id}`} className="text-sm text-white hover:text-accent font-mono">
                          {invoice.invoice_number || 'Draft Invoice'}
                        </Link>
                        <p className="mt-1 truncate text-[11px] text-white/45 font-mono">
                          {invoice.client?.company_name || 'Unassigned client'}
                          {invoice.project?.name ? ` · ${invoice.project.name}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 md:justify-self-end">
                        <span className="text-sm text-white font-mono">${(invoice.total || 0).toLocaleString()}</span>
                        <span
                          className={cn(
                            'border px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono',
                            invoiceStatusStyles[invoice.status || 'draft'] || invoiceStatusStyles.draft
                          )}
                        >
                          {invoice.status || 'draft'}
                        </span>
                      </div>

                      <span className="text-[11px] text-white/45 font-mono md:justify-self-end">
                        {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : 'No due date'}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </PanelSection>
        </>
      ) : (
        <>
          <MetricStrip
            items={[
              { label: 'Contracts', value: contractStats.total },
              { label: 'Signed Value', value: `$${contractStats.signedValue.toLocaleString()}`, tone: 'success' },
              { label: 'Pending Review', value: contractStats.pendingCount, tone: contractStats.pendingCount > 0 ? 'warning' : 'default' },
              { label: 'Signed Count', value: contractStats.signedCount, tone: 'accent' },
            ]}
          />

          <PanelSection title="Contract Register" description="Track drafting, approvals, and signed value">
            <div className="space-y-4">
              <FilterTabs tabs={contractStatusTabs} activeTab={contractStatusFilter} onChange={setContractStatusFilter} />

              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search contract number or client"
                className="max-w-full md:max-w-sm"
              />

              {filteredContracts.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No contracts found"
                  description={searchQuery || contractStatusFilter !== 'all' ? 'Try adjusting filters or search.' : 'Create your first contract to start formalizing work.'}
                  action={
                    !searchQuery && contractStatusFilter === 'all' && canEdit
                      ? { label: 'Create Contract', onClick: () => setIsContractModalOpen(true) }
                      : undefined
                  }
                />
              ) : (
                <div className="space-y-px border border-white/10 bg-white/5">
                  {filteredContracts.map((contract) => (
                    <article key={contract.id} className="grid gap-3 bg-black/60 px-4 py-3 md:grid-cols-[1.1fr_auto_auto] md:items-center">
                      <div className="min-w-0">
                        <Link href={`/lab/contracts/${contract.id}`} className="text-sm text-white hover:text-accent font-mono">
                          {contract.contract_number || 'Draft Contract'}
                        </Link>
                        <p className="mt-1 truncate text-[11px] text-white/45 font-mono">
                          {contract.client?.company_name || 'Unassigned client'}
                          {contract.template?.name ? ` · ${contract.template.name}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 md:justify-self-end">
                        <span className="text-sm text-white font-mono">${(contract.value || 0).toLocaleString()}</span>
                        <span
                          className={cn(
                            'border px-2 py-1 text-[10px] uppercase tracking-[0.13em] font-mono',
                            contractStatusStyles[contract.status || 'draft'] || contractStatusStyles.draft
                          )}
                        >
                          {contract.status || 'draft'}
                        </span>
                      </div>

                      <span className="text-[11px] text-white/45 font-mono md:justify-self-end">
                        {contract.start_date ? format(new Date(contract.start_date), 'MMM d, yyyy') : 'No start date'}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </PanelSection>
        </>
      )}

      <InvoiceFormModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={() => {
          setIsInvoiceModalOpen(false)
          router.refresh()
        }}
      />

      {isContractModalOpen ? (
        <ContractFormModal
          onClose={() => setIsContractModalOpen(false)}
          onSuccess={() => {
            setIsContractModalOpen(false)
            router.refresh()
          }}
        />
      ) : null}
    </div>
  )
}
