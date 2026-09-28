import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DollarSign, FileText, Receipt } from 'lucide-react'
import { DataState } from '@/components/lab/primitives/DataState'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { LabButton } from '@/components/ui/LabButton'
import { getProjectAccess, getProjectContracts, getProjectExpenses, getProjectInvoices, getProjectWorkspace } from '@/features/lab/workspace/data'
import { ProjectSectionHeader } from '../ProjectSectionHeader'
import { ProjectSubpageShell } from '../ProjectSubpageShell'

function formatDateLabel(value: string | null | undefined): string {
  if (!value) return 'not set'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'not set'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed)
}

export default async function ProjectFinancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectWorkspace(id)

  if (!project) {
    notFound()
  }

  const access = await getProjectAccess(id, project.team_id)
  if (!access.canAccess) {
    notFound()
  }

  const [invoices, contracts, expenses] = await Promise.all([
    getProjectInvoices(id),
    getProjectContracts(project),
    getProjectExpenses(id),
  ])

  const paidRevenue = invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + (invoice.total || 0), 0)
  const pendingRevenue = invoices
    .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0)
  const signedContractValue = contracts
    .filter((contract) => contract.status === 'signed')
    .reduce((sum, contract) => sum + (contract.value || 0), 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)

  return (
    <ProjectSubpageShell>
      <div className="space-y-6">
        <ProjectSectionHeader
          project={project}
          title={`${project.name} Finance`}
          subtitle="Invoices, contracts, and expense flow in one financial cockpit"
          icon={DollarSign}
        />

        <MetricStrip
          items={[
            { label: 'Paid Revenue', value: `$${paidRevenue.toLocaleString()}`, tone: 'success' },
            { label: 'Pending Revenue', value: `$${pendingRevenue.toLocaleString()}`, tone: 'warning' },
            { label: 'Signed Contracts', value: `$${signedContractValue.toLocaleString()}`, tone: 'accent' },
            { label: 'Tracked Expenses', value: `$${totalExpenses.toLocaleString()}`, tone: 'danger' },
          ]}
        />

        <PanelSection
          title="Invoices"
          description="Billing records tied directly to this project"
          action={
            <Link href={`/lab/invoices/new?project=${id}`}>
              <LabButton size="sm">
                <Receipt className="mr-1.5 h-4 w-4" />
                New Invoice
              </LabButton>
            </Link>
          }
        >
          {invoices.length === 0 ? (
            <DataState
              title="No invoices for this project"
              description="Issue your first invoice from this panel to keep billing in project context."
              icon={Receipt}
            />
          ) : (
            <div className="space-y-px border border-white/10 bg-white/5">
              {invoices.map((invoice) => (
                <article key={invoice.id} className="grid grid-cols-1 gap-2 bg-black/60 px-4 py-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <Link href={`/lab/invoices/${invoice.id}`} className="text-sm text-foreground hover:text-accent font-mono">
                      {invoice.invoice_number}
                    </Link>
                    <p className="mt-1 text-[11px] text-white/45 font-mono">
                      Due {formatDateLabel(invoice.due_date)}
                    </p>
                  </div>
                  <span className="justify-self-start text-sm text-white font-mono md:justify-self-end">${(invoice.total || 0).toLocaleString()}</span>
                  <span className="justify-self-start border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/65 font-mono md:justify-self-end">
                    {invoice.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </PanelSection>

        <PanelSection title="Contracts" description="Client agreements linked by this project’s client account">
          {contracts.length === 0 ? (
            <DataState
              title="No contracts linked"
              description="Generate or attach contracts for this client to keep legal and billing aligned."
              icon={FileText}
            />
          ) : (
            <div className="space-y-px border border-white/10 bg-white/5">
              {contracts.map((contract) => (
                <article key={contract.id} className="grid grid-cols-1 gap-2 bg-black/60 px-4 py-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <Link href={`/lab/contracts/${contract.id}`} className="text-sm text-foreground hover:text-accent font-sans">
                      {contract.title}
                    </Link>
                    <p className="mt-1 text-[11px] text-white/45 font-mono">{contract.contract_number || 'Draft contract number pending'}</p>
                  </div>
                  <span className="justify-self-start text-sm text-white font-mono md:justify-self-end">${(contract.value || 0).toLocaleString()}</span>
                  <span className="justify-self-start border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-white/65 font-mono md:justify-self-end">
                    {contract.status || 'draft'}
                  </span>
                </article>
              ))}
            </div>
          )}
        </PanelSection>

        <PanelSection title="Expense Ledger" description="Service and operational costs tracked against project budget">
          {expenses.length === 0 ? (
            <DataState
              title="No expenses logged"
              description="Add expenses in project overview to keep margin visibility current."
              icon={DollarSign}
            />
          ) : (
            <div className="space-y-px border border-white/10 bg-white/5">
              {expenses.map((expense) => (
                <article key={expense.id} className="grid grid-cols-1 gap-2 bg-black/60 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm text-foreground font-sans">{expense.description || expense.service?.name || 'Expense item'}</p>
                    <p className="mt-1 text-[11px] text-white/45 font-mono">
                      {expense.quantity} × ${expense.rate.toLocaleString()} {expense.service?.unit ? `/${expense.service.unit}` : ''}
                    </p>
                  </div>
                  <span className="justify-self-start text-sm text-rose-300 font-mono md:justify-self-end">${(expense.amount || 0).toLocaleString()}</span>
                </article>
              ))}
            </div>
          )}
        </PanelSection>
      </div>
    </ProjectSubpageShell>
  )
}
