'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Contract } from '@/types/lab'
import { ContractList } from '@/components/lab/unified/ContractList'
import { LabButton } from '@/components/ui/LabButton'
import { Plus } from 'lucide-react'
import { deleteContract } from '@/lib/actions/contract-actions'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'
import { ContractFormModal } from '@/components/lab/ContractFormModal'

interface ClientContractsClientProps {
  initialContracts: Contract[]
  canEdit: boolean
  clientId: string
}

export function ClientContractsClient({ initialContracts, canEdit, clientId }: ClientContractsClientProps) {
  const router = useRouter()
  const { confirmAction } = useAppFeedback()
  const [showAddContract, setShowAddContract] = useState(false)

  async function handleDelete(id: string, cid: string) {
    const confirmed = await confirmAction('Delete this contract?', {
      title: 'Delete Contract',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!confirmed) return

    const result = await deleteContract(id, cid)
    if (!result.success) {
      alert(result.error || 'Failed to delete contract')
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <LabButton onClick={() => setShowAddContract(true)} className="font-mono text-xs uppercase tracking-wider">
            <Plus className="w-3 h-3 mr-2" />Add Contract
          </LabButton>
        </div>
      )}

      <ContractList 
        contracts={initialContracts} 
        showClient={false} 
        canEdit={canEdit}
        onDelete={handleDelete}
      />

      {showAddContract && (
        <ContractFormModal
          onClose={() => setShowAddContract(false)}
          onSuccess={() => {
            setShowAddContract(false)
            router.refresh()
          }}
          clientId={clientId}
        />
      )}
    </div>
  )
}
