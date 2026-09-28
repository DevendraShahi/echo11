'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Edit3, Send, Trash2 } from 'lucide-react'
import { LabButton } from '@/components/ui/LabButton'
import { ClientFormModal } from '@/components/lab/ClientFormModal'
import { ClientWithRelations, deleteClient, sendClientPortalInvite } from '@/lib/actions/client-actions'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'

interface ClientOverviewActionsProps {
  client: ClientWithRelations
}

export function ClientOverviewActions({ client }: ClientOverviewActionsProps) {
  const router = useRouter()
  const { confirmAction, notify } = useAppFeedback()
  const [showEditModal, setShowEditModal] = useState(false)
  const [invitingPortal, setInvitingPortal] = useState(false)
  const [deletingClient, setDeletingClient] = useState(false)

  async function handleInvite() {
    setInvitingPortal(true)
    const result = await sendClientPortalInvite(client.id)
    setInvitingPortal(false)

    if (result.success) {
      notify('Client invitation sent', 'success')
      router.refresh()
      return
    }

    notify(result.error || 'Failed to send invite', 'error')
  }

  async function handleDelete() {
    const confirmed = await confirmAction('Delete this client and related client records?', {
      title: 'Delete Client',
      confirmLabel: 'Delete',
      tone: 'danger',
    })

    if (!confirmed) return

    setDeletingClient(true)

    try {
      const result = await deleteClient(client.id)
      if (result.success) {
        notify('Client deleted', 'success')
        router.push('/lab/clients')
      } else {
        notify(result.error || 'Failed to delete client', 'error')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      notify('Failed to delete client', 'error')
    } finally {
      setDeletingClient(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!client.invitation_sent_at && !client.invitation_accepted_at ? (
        <LabButton
          variant="glass"
          onClick={() => void handleInvite()}
          disabled={invitingPortal}
          className="font-mono text-[10px] uppercase tracking-[0.13em]"
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {invitingPortal ? 'Sending' : 'Invite'}
        </LabButton>
      ) : null}

      {client.invitation_sent_at && !client.invitation_accepted_at ? (
        <span className="inline-flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-amber-300 font-mono">
          <Send className="h-3 w-3" />
          Invite Pending
        </span>
      ) : null}

      {client.invitation_accepted_at ? (
        <span className="inline-flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-emerald-300 font-mono">
          <CheckCircle className="h-3 w-3" />
          Portal Active
        </span>
      ) : null}

      <LabButton
        variant="ghost"
        onClick={() => setShowEditModal(true)}
        className="font-mono text-[10px] uppercase tracking-[0.13em]"
      >
        <Edit3 className="mr-1.5 h-3.5 w-3.5" />
        Edit
      </LabButton>

      <button
        onClick={() => void handleDelete()}
        disabled={deletingClient}
        className="inline-flex items-center gap-1 border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.13em] text-rose-300 font-mono hover:bg-rose-500/15 disabled:opacity-60"
      >
        <Trash2 className="h-3 w-3" />
        {deletingClient ? 'Deleting' : 'Delete'}
      </button>

      {showEditModal ? (
        <ClientFormModal
          isOpen={showEditModal}
          editClient={client}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            router.refresh()
          }}
        />
      ) : null}
    </div>
  )
}
