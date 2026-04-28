'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LabButton } from '@/components/ui/LabButton'
import { ClientFormModal } from '@/components/lab/ClientFormModal'
import { ContractFormModal } from '@/components/lab/ContractFormModal'
import { ClientContact, ClientNote, ClientDocument, Contract, Project, Invoice, Activity, ContactRole } from '@/types/lab'
import { createContact, deleteContact, setPrimaryContact, updateContact } from '@/lib/actions/contact-actions'
import { uploadDocument, deleteDocument, getClientDocuments } from '@/lib/actions/document-actions'
import { createNote, deleteNote, getClientNotes, updateNote } from '@/lib/actions/note-actions'
import { deleteContract } from '@/lib/actions/contract-actions'
import { deleteClient, ClientWithRelations, sendClientPortalInvite } from '@/lib/actions/client-actions'
import {
  getClientMessagesForTeam,
  markTeamMessagesRead,
  sendTeamMessage,
  ClientMessage
} from '@/lib/actions/client-message-actions'
import {
  ArrowLeft, Mail, Phone, Building,
  Trash2, AlertCircle, Edit3, Plus, FolderKanban, FileText,
  TrendingUp, File, Download,
  Upload, X,
  Globe, Tags, Star, StarOff, ExternalLink,
  Send, Loader2, CheckCircle, MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAppFeedback } from '@/components/ui/AppFeedbackProvider'

interface ClientPageProps {
  params: Promise<{ id: string }>
}

interface ClientDataWithRelations extends ClientWithRelations {
  contacts: ClientContact[]
}

function isClientDataWithRelations(data: unknown): data is ClientDataWithRelations {
  return data !== null && typeof data === 'object' && 'contacts' in data
}

type ContractWithTemplate = Contract & { template: { name: string } | null }
type NoteWithUser = ClientNote & { user?: { full_name: string | null; avatar_url: string | null } | null }
type ActivityWithUser = Activity & { user: { full_name: string | null } | null }
type TabType = 'overview' | 'contacts' | 'projects' | 'invoices' | 'contracts' | 'documents' | 'messages' | 'notes' | 'activity'

export default function ClientDetailPage({ params }: ClientPageProps) {
  const { id: clientId } = use(params)
  const { confirmAction } = useAppFeedback()
  const [client, setClient] = useState<ClientWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null)
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteWithUser | null>(null)
  const [showAddContract, setShowAddContract] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [invitingPortal, setInvitingPortal] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  const [contacts, setContacts] = useState<ClientContact[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [contracts, setContracts] = useState<ContractWithTemplate[]>([])
  const [documents, setDocuments] = useState<ClientDocument[]>([])
  const [notes, setNotes] = useState<NoteWithUser[]>([])
  const [activities, setActivities] = useState<ActivityWithUser[]>([])
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    activeProjects: 0,
    totalProjects: 0,
    totalInvoices: 0,
    paidInvoices: 0
  })

  useEffect(() => {
    if (clientId) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const loadMessages = useCallback(async (markRead = true) => {
    if (!clientId) return

    setMessagesLoading(true)
    try {
      if (markRead) {
        await markTeamMessagesRead(clientId)
      }

      const thread = await getClientMessagesForTeam(clientId)
      setMessages(thread)
    } catch (error) {
      console.error('Error loading client messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (activeTab === 'messages') {
      void loadMessages(true)
    }
  }, [activeTab, loadMessages])

  useEffect(() => {
    if (activeTab !== 'messages') return

    const supabase = createClient()
    const channel = supabase
      .channel(`lab-client-thread-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'client_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const newMessage = payload.new as ClientMessage
          setMessages((prev) => (prev.some((item) => item.id === newMessage.id) ? prev : [newMessage, ...prev]))
          if (newMessage.sender_type === 'client' && !newMessage.read_by_team) {
            void markTeamMessagesRead(clientId)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'client_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as ClientMessage
          setMessages((prev) => prev.map((item) => (item.id === updatedMessage.id ? updatedMessage : item)))
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [activeTab, clientId])

  async function loadData() {
    setLoading(true)
    try {
      const supabase = createClient()

      // Role check (client-side)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', authUser.id).single()
        if (profile?.role === 'admin') {
          setCanEdit(true)
        } else {
          const { count } = await supabase.from('teams').select('*', { count: 'exact', head: true }).eq('lead_id', authUser.id)
          setCanEdit((count ?? 0) > 0)
        }
      }
      
      const { data: clientData } = await supabase
        .from('clients')
        .select('*, contacts:client_contacts(*), current_status:client_statuses(*)')
        .eq('id', clientId)
        .single()

      if (clientData) {
        setClient(clientData as ClientWithRelations)
        if (isClientDataWithRelations(clientData)) {
          setContacts(clientData.contacts || [])
        }
      }

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      setProjects(projectsData || [])

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      setInvoices(invoicesData || [])

      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*, template:contract_templates(name)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      setContracts(contractsData as ContractWithTemplate[] || [])

      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*, user:profiles(full_name, avatar_url)')
        .eq('entity_type', 'client')
        .eq('entity_id', clientId)
        .order('created_at', { ascending: false })
        .limit(20)

      setActivities(activitiesData as ActivityWithUser[] || [])

      const docs = await getClientDocuments(clientId)
      setDocuments(docs)

      const clientNotes = await getClientNotes(clientId)
      setNotes(clientNotes)

      const totalRevenue = (invoicesData || [])
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.total || 0), 0)

      const pendingAmount = (invoicesData || [])
        .filter(i => i.status === 'sent' || i.status === 'overdue')
        .reduce((sum, i) => sum + (i.total || 0), 0)

      setStats({
        totalRevenue,
        pendingAmount,
        activeProjects: (projectsData || []).filter(p => p.status === 'active').length,
        totalProjects: projectsData?.length || 0,
        totalInvoices: invoicesData?.length || 0,
        paidInvoices: (invoicesData || []).filter(i => i.status === 'paid').length
      })
    } catch (error) {
      console.error('Error loading client:', error)
    }
    setLoading(false)
  }

  async function handleDelete() {
    const confirmed = await confirmAction('Are you sure you want to delete this client?', {
      title: 'Delete Client',
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!confirmed) return
    
    try {
      const result = await deleteClient(clientId)
      if (result.success) {
        window.location.href = '/lab/clients'
      } else {
        alert('Error deleting client: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('An unexpected error occurred while deleting the client')
    }
  }

  async function handleSendTeamMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const content = messageInput.trim()
    if (!content || sendingMessage) return

    setSendingMessage(true)
    setMessageInput('')

    try {
      const result = await sendTeamMessage(clientId, content)
      if (!result.success) {
        setMessageInput(content)
        alert(result.error || 'Failed to send message')
        return
      }

      if (result.message) {
        setMessages((prev) => [result.message as ClientMessage, ...prev])
      } else {
        await loadMessages(false)
      }
    } finally {
      setSendingMessage(false)
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const getGradient = (name: string) => {
    const gradients = ['from-accent to-cyan-400', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500']
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return gradients[hash % gradients.length]
  }

  const getStatusBadge = (status: string | undefined) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string; border: string }> = {
      lead: { bg: 'bg-white/5', text: 'text-white/60', label: 'Lead', border: 'border-white/10' },
      prospect: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Prospect', border: 'border-blue-500/20' },
      active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Active', border: 'border-emerald-500/20' },
      at_risk: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'At Risk', border: 'border-amber-500/20' },
      inactive: { bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'Inactive', border: 'border-rose-500/20' }
    }
    return statusConfig[status || 'lead']
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'projects', label: 'Projects' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'contracts', label: 'Contracts' },
    { id: 'documents', label: 'Documents' },
    { id: 'messages', label: 'Messages' },
    { id: 'notes', label: 'Notes' },
    { id: 'activity', label: 'Activity' },
  ]

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-6 h-6 border border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8 border border-white/5 bg-[#0a0a0a]">
          <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 font-mono text-sm mb-4">Client not found</p>
          <Link href="/lab/clients" className="text-accent hover:text-accent/80 font-mono text-xs uppercase tracking-wider">← Back to Clients</Link>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(client.current_status?.status)
  const unreadClientMessages = messages.filter((message) => message.sender_type === 'client' && !message.read_by_team).length

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/lab/clients" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider">
          <ArrowLeft className="w-3 h-3" /> Back to Clients
        </Link>

        <div className="border border-white/5 bg-[#0a0a0a]">
          <div className="p-6 border-b border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className={cn("w-14 h-14 flex items-center justify-center bg-gradient-to-br shadow-lg", getGradient(client.company_name))}>
                  <span className="text-xl font-bold text-black">{getInitials(client.company_name)}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-sans tracking-tight">{client.company_name}</h1>
                  {client.contact_name && <p className="text-white/40 font-mono text-sm mt-1">{client.contact_name}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {client.current_status && (
                      <span className={cn("px-2 py-0.5 text-xs font-mono uppercase tracking-wider border", statusBadge.bg, statusBadge.text, statusBadge.border)}>
                        {statusBadge.label}
                      </span>
                    )}
                    {client.invitation_sent_at && (
                      <span className={cn("px-2 py-0.5 text-xs font-mono uppercase tracking-wider border", client.invitation_accepted_at ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400")}>
                        {client.invitation_accepted_at ? 'Client Active' : 'Pending'}
                      </span>
                    )}
                    <span className="text-white/30 text-xs font-mono">Created {format(new Date(client.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {canEdit && client.email && !client.invitation_sent_at && (
                  <LabButton variant="ghost" disabled={invitingPortal} onClick={async () => {
                    setInvitingPortal(true)
                    const result = await sendClientPortalInvite(client.id)
                    setInvitingPortal(false)
                    if (!result.success) alert(result.error || 'Failed to send invite')
                    else loadData()
                  }} className="font-mono text-xs uppercase tracking-wider">
                    {invitingPortal ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Send className="w-3 h-3 mr-2" />}
                    Invite to Client Area
                  </LabButton>
                )}
                {client.invitation_sent_at && !client.invitation_accepted_at && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-500/20 text-amber-400 font-mono text-xs">
                    <Send className="w-3 h-3" />Invite Sent
                  </span>
                )}
                {client.invitation_accepted_at && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
                    <CheckCircle className="w-3 h-3" />Client Active
                  </span>
                )}
                {canEdit && (
                  <>
                    <LabButton variant="ghost" onClick={() => setShowEditModal(true)} className="font-mono text-xs uppercase tracking-wider">
                      <Edit3 className="w-3 h-3 mr-2" />Edit
                    </LabButton>
                    <button onClick={handleDelete} className="px-4 py-2 border border-white/10 hover:border-rose-500/30 hover:text-rose-400 text-white/40 transition-colors font-mono text-xs">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
            <div className="p-4 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5">
                  <Mail className="w-4 h-4 text-white/40" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Email</p>
                  <a href={`mailto:${client.email}`} className="text-sm text-white hover:text-accent truncate block font-mono">{client.email}</a>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5">
                  <Phone className="w-4 h-4 text-white/40" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-white font-mono truncate">{client.phone || '—'}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5">
                  <Globe className="w-4 h-4 text-white/40" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Website</p>
                  {client.website ? (
                    <a href={client.website} target="_blank" className="text-sm text-accent hover:text-accent/80 truncate block font-mono">{client.website.replace(/^https?:\/\//, '')}</a>
                  ) : <p className="text-sm text-white/40 font-mono">—</p>}
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5">
                  <Building className="w-4 h-4 text-white/40" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Industry</p>
                  <p className="text-sm text-white font-mono truncate">{client.industry || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {client.tags && client.tags.length > 0 && (
            <div className="px-6 py-4 border-t border-white/5 flex flex-wrap items-center gap-2">
              <Tags className="w-3 h-3 text-white/30" />
              {client.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs font-mono bg-white/5 text-white/50 border border-white/5">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-white/5">
          <div className="flex overflow-x-auto gap-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.id ? "border-accent text-accent" : "border-transparent text-white/40 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5">
            <div className="p-4 bg-[#0a0a0a]">
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2">Total Revenue</p>
              <p className="text-xl font-bold text-emerald-400 font-sans">${(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#0a0a0a]">
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2">Pending</p>
              <p className="text-xl font-bold text-amber-400 font-sans">${(stats.pendingAmount || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#0a0a0a]">
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2">Active Projects</p>
              <p className="text-xl font-bold text-white font-sans">{stats.activeProjects}</p>
            </div>
            <div className="p-4 bg-[#0a0a0a]">
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2">Invoices</p>
              <p className="text-xl font-bold text-white font-sans">{stats.paidInvoices}/{stats.totalInvoices}</p>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {canEdit && (
              <div className="flex justify-end">
                <LabButton onClick={() => setShowAddContact(true)} className="font-mono text-xs uppercase tracking-wider">
                  <Plus className="w-3 h-3 mr-2" />Add Contact
                </LabButton>
              </div>
            )}
            {contacts.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-mono text-sm border border-white/5 bg-[#0a0a0a]">No contacts yet</div>
            ) : (
              <div className="space-y-px bg-white/5 border border-white/5">
                {contacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] hover:bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-accent to-cyan-400 font-bold text-black text-sm">
                        {getInitials(contact.name)}
                      </div>
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {contact.name}
                          {contact.is_primary && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                        </p>
                        <p className="text-sm text-white/40 font-mono">{contact.email || '—'} · {contact.role?.replace('_', ' ') || 'No role'}</p>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingContact(contact)} className="p-2 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        {!contact.is_primary && (
                          <button onClick={async () => {
                            const result = await setPrimaryContact(contact.id, clientId)
                            if (!result.success) alert(result.error || 'Failed to set primary contact')
                            else loadData()
                          }} className="p-2 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
                            <StarOff className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={async () => {
                          const confirmed = await confirmAction('Delete contact?', {
                            title: 'Delete Contact',
                            confirmLabel: 'Delete',
                            tone: 'danger',
                          })
                          if (!confirmed) return
                          const result = await deleteContact(contact.id, clientId)
                          if (!result.success) alert(result.error || 'Failed to delete contact')
                          else loadData()
                        }} className="p-2 border border-white/10 hover:border-rose-500/30 text-white/40 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            {canEdit && (
              <div className="flex justify-end">
                <Link href={`/lab/projects/new?client=${clientId}`}>
                  <LabButton className="font-mono text-xs uppercase tracking-wider">
                    <Plus className="w-3 h-3 mr-2" />Add Project
                  </LabButton>
                </Link>
              </div>
            )}
            {projects.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-mono text-sm border border-white/5 bg-[#0a0a0a]">No projects yet</div>
            ) : (
              <div className="space-y-px bg-white/5 border border-white/5">
                {projects.map(project => (
                  <Link key={project.id} href={`/lab/projects/${project.id}`} className="flex items-center justify-between p-4 bg-[#0a0a0a] hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                        <FolderKanban className="w-4 h-4 text-white/40" />
                      </div>
                      <span className="text-white font-mono text-sm">{project.name}</span>
                    </div>
                    <span className={cn("px-2 py-0.5 text-xs font-mono uppercase tracking-wider border", project.status === 'active' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/40")}>
                      {project.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {canEdit && (
              <div className="flex justify-end">
                <Link href={`/lab/invoices/new?client=${clientId}`}>
                  <LabButton className="font-mono text-xs uppercase tracking-wider">
                    <Plus className="w-3 h-3 mr-2" />Create Invoice
                  </LabButton>
                </Link>
              </div>
            )}
            {invoices.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-mono text-sm border border-white/5 bg-[#0a0a0a]">No invoices yet</div>
            ) : (
              <div className="space-y-px bg-white/5 border border-white/5">
                {invoices.map(invoice => (
                  <Link key={invoice.id} href={`/lab/invoices/${invoice.id}`} className="flex items-center justify-between p-4 bg-[#0a0a0a] hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                        <FileText className="w-4 h-4 text-white/40" />
                      </div>
                      <span className="text-white font-mono text-sm">{invoice.invoice_number}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 font-mono text-sm">${invoice.total?.toFixed(2)}</span>
                      <span className={cn("px-2 py-0.5 text-xs font-mono uppercase tracking-wider border", invoice.status === 'paid' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : invoice.status === 'overdue' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-white/5 border-white/10 text-white/40")}>
                        {invoice.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-4">
            {canEdit && (
              <div className="flex justify-end">
                <LabButton onClick={() => setShowAddContract(true)} className="font-mono text-xs uppercase tracking-wider">
                  <Plus className="w-3 h-3 mr-2" />Add Contract
                </LabButton>
              </div>
            )}
            {contracts.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-mono text-sm border border-white/5 bg-[#0a0a0a]">No contracts yet</div>
            ) : (
              <div className="space-y-px bg-white/5 border border-white/5">
                {contracts.map(contract => (
                  <div key={contract.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "w-8 h-8 flex items-center justify-center border",
                        contract.file_url ? "border-accent/30 bg-accent/10" : "border-white/10 bg-white/5"
                      )}>
                        <FileText className="w-4 h-4 text-white/40" />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/lab/contracts/${contract.id}`} className="text-white font-mono text-sm hover:text-accent transition-colors truncate block">
                          {contract.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {contract.contract_number && <span className="text-xs text-white/20 font-mono">{contract.contract_number}</span>}
                          {contract.template?.name && <span className="text-xs text-white/30 font-mono">{contract.template.name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {contract.value && <span className="text-white/60 font-mono text-sm">${contract.value.toLocaleString()}</span>}
                      <span className={cn("px-2 py-0.5 text-xs font-mono uppercase tracking-wider border", contract.status === 'signed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : contract.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-white/5 border-white/10 text-white/40")}>
                        {contract.status}
                      </span>
                      {contract.file_url && (
                        <a href={contract.file_url} target="_blank" className="p-1.5 border border-white/10 hover:border-white/20 text-white/40 hover:text-accent transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {canEdit && (
                        <button onClick={async () => {
                          const confirmed = await confirmAction('Delete contract?', {
                            title: 'Delete Contract',
                            confirmLabel: 'Delete',
                            tone: 'danger',
                          })
                          if (!confirmed) return
                          const result = await deleteContract(contract.id, clientId)
                          if (!result.success) alert(result.error || 'Failed to delete contract')
                          else loadData()
                        }} className="p-1.5 border border-white/10 hover:border-rose-500/30 text-white/40 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            {canEdit && (
              <div className="flex justify-end">
                <label className="cursor-pointer">
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.txt" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const MAX_SIZE = 10 * 1024 * 1024
                    if (file.size > MAX_SIZE) {
                      alert('File size must be under 10MB')
                      e.target.value = ''
                      return
                    }
                    setUploading(true)
                    const result = await uploadDocument({ client_id: clientId, file })
                    setUploading(false)
                    if (!result?.success && result?.error) alert(result.error)
                    else loadData()
                  }} />
                  <span className="inline-flex items-center gap-2 px-4 py-2 border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-colors font-mono text-xs uppercase tracking-wider">
                    <Upload className="w-3 h-3" />{uploading ? 'Uploading...' : 'Upload'}
                  </span>
                </label>
              </div>
            )}
            {documents.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-mono text-sm border border-white/5 bg-[#0a0a0a]">No documents yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
                {documents.map(doc => (
                  <div key={doc.id} className="p-4 bg-[#0a0a0a]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                          <File className="w-4 h-4 text-white/40" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-mono text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-white/30 font-mono">{doc.file_type?.split('/')[1] || 'file'} · {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}</p>
                        </div>
                      </div>
                      {canEdit && (
                        <button onClick={async () => {
                          const confirmed = await confirmAction('Delete document?', {
                            title: 'Delete Document',
                            confirmLabel: 'Delete',
                            tone: 'danger',
                          })
                          if (!confirmed) return
                          const result = await deleteDocument(doc.id, clientId)
                          if (!result.success) alert(result.error || 'Failed to delete document')
                          else loadData()
                        }} className="p-1 border border-white/10 hover:border-rose-500/30 text-white/40 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <a href={doc.file_url} target="_blank" className="text-xs text-accent hover:text-accent/80 font-mono uppercase tracking-wider flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border border-white/5 bg-[#0a0a0a] px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono uppercase tracking-wider text-white/60">Client Conversation</span>
              </div>
              <span className={cn(
                'px-2 py-0.5 text-xs font-mono uppercase tracking-wider border',
                unreadClientMessages > 0
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-white/5 border-white/10 text-white/40'
              )}>
                {unreadClientMessages} unread
              </span>
            </div>

            <div className="border border-white/5 bg-[#0a0a0a]">
              <div className="max-h-[420px] overflow-y-auto p-4 space-y-3 border-b border-white/5">
                {messagesLoading ? (
                  <div className="py-14 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-14 text-center text-white/30 font-mono text-sm">
                    No messages yet.
                  </div>
                ) : (
                  [...messages].reverse().map((message) => {
                    const isTeam = message.sender_type === 'team'
                    return (
                      <div key={message.id} className={cn('flex', isTeam ? 'justify-end' : 'justify-start')}>
                        <div className={cn(
                          'max-w-[80%] border px-4 py-3',
                          isTeam
                            ? 'bg-accent/10 border-accent/30'
                            : 'bg-white/5 border-white/10'
                        )}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-white/50">{message.sender_name}</span>
                            {!isTeam && !message.read_by_team && <span className="w-1.5 h-1.5 bg-accent" />}
                          </div>
                          <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
                          <p className="text-[11px] text-white/30 font-mono mt-2">
                            {format(new Date(message.created_at), 'MMM d, yyyy · h:mm a')}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={handleSendTeamMessage} className="p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Reply to client..."
                    disabled={sendingMessage}
                    className="flex-1 px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
                  />
                  <LabButton
                    type="submit"
                    disabled={sendingMessage || !messageInput.trim()}
                    className="font-mono text-xs uppercase tracking-wider"
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 mr-2" />
                        Send
                      </>
                    )}
                  </LabButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {canEdit && (
              <div className="flex justify-end">
                <LabButton onClick={() => setShowAddNote(true)} className="font-mono text-xs uppercase tracking-wider">
                  <Plus className="w-3 h-3 mr-2" />Add Note
                </LabButton>
              </div>
            )}
            {notes.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-mono text-sm border border-white/5 bg-[#0a0a0a]">No notes yet</div>
            ) : (
              <div className="space-y-px bg-white/5 border border-white/5">
                {notes.map(note => (
                  <div key={note.id} className="p-4 bg-[#0a0a0a]">
                    <p className="text-white whitespace-pre-wrap font-mono text-sm">{note.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <span className="text-xs text-white/30 font-mono">{note.user?.full_name || 'Unknown'} · {format(new Date(note.created_at), 'MMM d, yyyy')}</span>
                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingNote(note)} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button onClick={async () => {
                            const confirmed = await confirmAction('Delete note?', {
                              title: 'Delete Note',
                              confirmLabel: 'Delete',
                              tone: 'danger',
                            })
                            if (!confirmed) return
                            const result = await deleteNote(note.id, clientId)
                            if (!result.success) alert(result.error || 'Failed to delete note')
                            else loadData()
                          }} className="p-1 border border-white/10 hover:border-rose-500/30 text-white/40 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-px bg-white/5 border border-white/5">
            {activities.length === 0 ? (
              <div className="text-center py-12 text-white/30 font-mono text-sm bg-[#0a0a0a]">No activity yet</div>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-4 bg-[#0a0a0a]">
                  <div className="w-8 h-8 flex items-center justify-center border border-white/10 bg-white/5">
                    <TrendingUp className="w-4 h-4 text-white/30" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/80">
                      <span className="font-medium text-white">{activity.user?.full_name || 'Someone'}</span>
                      <span className="text-white/60"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-white/30 font-mono mt-1">{format(new Date(activity.created_at), 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ClientFormModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={loadData} editClient={client} />

      {showAddContact && <AddContactModal clientId={clientId} onClose={() => setShowAddContact(false)} onSuccess={loadData} />}
      {editingContact && <EditContactModal contact={editingContact} clientId={clientId} onClose={() => setEditingContact(null)} onSuccess={loadData} />}
      {showAddNote && <AddNoteModal clientId={clientId} onClose={() => setShowAddNote(false)} onSuccess={loadData} />}
      {editingNote && <EditNoteModal note={editingNote} clientId={clientId} onClose={() => setEditingNote(null)} onSuccess={loadData} />}
      {showAddContract && <ContractFormModal clientId={clientId} clientData={client ? { company_name: client.company_name, contact_name: client.contact_name || '', email: client.email, address: client.address || '', phone: client.phone || '' } : undefined} onClose={() => setShowAddContract(false)} onSuccess={loadData} />}
    </div>
  )
}

function AddContactModal({ clientId, onClose, onSuccess }: { clientId: string; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createContact({ client_id: clientId, name, email, phone, role: role as ContactRole, is_primary: isPrimary })
    setLoading(false)
    
    if (!result.success) {
      setError(result.error || 'Failed to add contact')
      return
    }
    
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10">
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <h3 className="text-sm font-mono uppercase tracking-wider text-white">Add Contact</h3>
          <button onClick={onClose} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono">{error}</div>}
          <input type="text" placeholder="Name *" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none" />
          <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none" />
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer appearance-none">
            <option value="" className="bg-black">Select role</option>
            <option value="decision_maker" className="bg-black">Decision Maker</option>
            <option value="stakeholder" className="bg-black">Stakeholder</option>
            <option value="technical" className="bg-black">Technical</option>
            <option value="billing" className="bg-black">Billing</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-white/60 font-mono cursor-pointer">
            <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} className="w-4 h-4 border border-white/20 bg-[#0a0a0a] accent-accent" /> Set as primary
          </label>
          <div className="flex gap-2 pt-2">
            <LabButton type="button" variant="ghost" onClick={onClose} className="flex-1 font-mono text-xs uppercase tracking-wider">Cancel</LabButton>
            <LabButton type="submit" disabled={loading} className="flex-1 font-mono text-xs uppercase tracking-wider">
              {loading ? 'Adding...' : 'Add Contact'}
            </LabButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditContactModal({ contact, clientId, onClose, onSuccess }: { contact: ClientContact; clientId: string; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(contact.name)
  const [email, setEmail] = useState(contact.email || '')
  const [phone, setPhone] = useState(contact.phone || '')
  const [role, setRole] = useState(contact.role || '')
  const [isPrimary, setIsPrimary] = useState(contact.is_primary)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await updateContact(contact.id, clientId, { name, email, phone, role: role as ContactRole, is_primary: isPrimary })
    setLoading(false)
    
    if (!result.success) {
      setError(result.error || 'Failed to update contact')
      return
    }
    
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10">
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <h3 className="text-sm font-mono uppercase tracking-wider text-white">Edit Contact</h3>
          <button onClick={onClose} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono">{error}</div>}
          <input type="text" placeholder="Name *" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none" />
          <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none" />
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono focus:border-accent focus:outline-none cursor-pointer appearance-none">
            <option value="" className="bg-black">Select role</option>
            <option value="decision_maker" className="bg-black">Decision Maker</option>
            <option value="stakeholder" className="bg-black">Stakeholder</option>
            <option value="technical" className="bg-black">Technical</option>
            <option value="billing" className="bg-black">Billing</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-white/60 font-mono cursor-pointer">
            <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} className="w-4 h-4 border border-white/20 bg-[#0a0a0a] accent-accent" /> Set as primary
          </label>
          <div className="flex gap-2 pt-2">
            <LabButton type="button" variant="ghost" onClick={onClose} className="flex-1 font-mono text-xs uppercase tracking-wider">Cancel</LabButton>
            <LabButton type="submit" disabled={loading} className="flex-1 font-mono text-xs uppercase tracking-wider">
              {loading ? 'Saving...' : 'Save Changes'}
            </LabButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddNoteModal({ clientId, onClose, onSuccess }: { clientId: string; onClose: () => void; onSuccess: () => void }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createNote({ client_id: clientId, content })
    setLoading(false)
    if (!result.success) {
      setError(result.error || 'Failed to save note')
      return
    }
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10">
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <h3 className="text-sm font-mono uppercase tracking-wider text-white">Add Note</h3>
          <button onClick={onClose} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono">{error}</div>}
          <textarea rows={4} placeholder="Write your note..." value={content} onChange={e => setContent(e.target.value)} required className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none resize-none" />
          <div className="flex gap-2 pt-2">
            <LabButton type="button" variant="ghost" onClick={onClose} className="flex-1 font-mono text-xs uppercase tracking-wider">Cancel</LabButton>
            <LabButton type="submit" disabled={loading} className="flex-1 font-mono text-xs uppercase tracking-wider">
              {loading ? 'Saving...' : 'Save Note'}
            </LabButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditNoteModal({ note, clientId, onClose, onSuccess }: { note: NoteWithUser; clientId: string; onClose: () => void; onSuccess: () => void }) {
  const [content, setContent] = useState(note.content)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await updateNote(note.id, clientId, content)
    setLoading(false)
    if (!result.success) {
      setError(result.error || 'Failed to update note')
      return
    }
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10">
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <h3 className="text-sm font-mono uppercase tracking-wider text-white">Edit Note</h3>
          <button onClick={onClose} className="p-1 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono">{error}</div>}
          <textarea rows={4} placeholder="Write your note..." value={content} onChange={e => setContent(e.target.value)} required className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none resize-none" />
          <div className="flex gap-2 pt-2">
            <LabButton type="button" variant="ghost" onClick={onClose} className="flex-1 font-mono text-xs uppercase tracking-wider">Cancel</LabButton>
            <LabButton type="submit" disabled={loading} className="flex-1 font-mono text-xs uppercase tracking-wider">
              {loading ? 'Saving...' : 'Save Changes'}
            </LabButton>
          </div>
        </form>
      </div>
    </div>
  )
}
