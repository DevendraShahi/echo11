'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Receipt } from 'lucide-react'
import { InvoiceFormModal } from '@/components/lab/InvoiceForm'
import { DataState } from '@/components/lab/primitives/DataState'
import { EntityHeader } from '@/components/lab/primitives/EntityHeader'

interface NewInvoicePageClientProps {
  canEdit: boolean
  projectId?: string
}

export default function NewInvoicePageClient({ canEdit, projectId }: NewInvoicePageClientProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const backHref = useMemo(() => (projectId ? `/lab/projects/${projectId}/finance` : '/lab/projects'), [projectId])

  const closeAndReturn = () => {
    setIsOpen(false)
    router.push(backHref)
    router.refresh()
  }

  if (!canEdit) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <DataState
          title="Invoice creation restricted"
          description="Only admin and lead roles can create invoices."
          icon={Receipt}
          action={
            <Link href={backHref} className="text-accent hover:text-accent/80 transition-colors font-mono text-sm uppercase tracking-[0.13em]">
              Back to finance
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-4">
      <EntityHeader
        title="Create Invoice"
        subtitle={projectId ? 'Project-scoped invoice creation' : 'Create a new invoice'}
        backHref={backHref}
        backLabel="Back to finance"
      />

      <InvoiceFormModal
        isOpen={isOpen}
        onClose={closeAndReturn}
        onSuccess={closeAndReturn}
      />
    </div>
  )
}
