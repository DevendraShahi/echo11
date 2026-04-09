'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LabButton } from '@/components/ui/LabButton'
import { getTeamMessages, postTeamMessage, getTeamNotes, addTeamNote } from '@/lib/actions/team-moodboard-actions'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/lab'
import { TeamMessage, TeamNote } from '@/lib/actions/team-moodboard-actions'

export default function MoodboardPage() {
  const { id: teamId } = useParams() as { id: string }

  const [messages, setMessages] = useState<TeamMessage[]>([])
  const [notes, setNotes] = useState<TeamNote[]>([])
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionResults, setMentionResults] = useState<Profile[]>([])
  const messageInputRef = useRef<HTMLInputElement>(null)

  async function loadData() {
    setLoading(true)
    const supabase = createClient()
    const [{ data: members }, msg, note] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('team_id', teamId)
        .order('full_name', { ascending: true }),
      getTeamMessages(teamId),
      getTeamNotes(teamId),
    ])
    setTeamMembers((members || []) as Profile[])
    setMessages(msg)
    setNotes(note)
    setLoading(false)
  }

  useEffect(function() {
    loadData()
  }, [teamId]) // eslint-disable-line react-hooks/exhaustive-deps

  function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function extractMentionUserIds(content: string): string[] {
    const ids = new Set<string>()
    teamMembers.forEach((member) => {
      const display = member.full_name || member.email
      if (!display) return
      const regex = new RegExp(`@${escapeRegExp(display)}(\\b|\\s|$)`, 'i')
      if (regex.test(content)) {
        ids.add(member.id)
      }
    })
    return Array.from(ids)
  }

  function handleMessageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setNewMessage(value)

    const cursorPos = e.target.selectionStart ?? value.length
    const uptoCursor = value.slice(0, cursorPos)
    const match = uptoCursor.match(/@([\w.\-]*)$/)
    if (match) {
      const query = match[1].toLowerCase()
      const filtered = teamMembers.filter((member) => {
        const name = member.full_name || ''
        const email = member.email || ''
        return name.toLowerCase().includes(query) || email.toLowerCase().includes(query)
      })
      setMentionResults(filtered)
      setShowMentions(filtered.length > 0)
    } else {
      setShowMentions(false)
    }
  }

  function handleSelectMention(member: Profile) {
    const input = messageInputRef.current
    const value = newMessage
    const cursorPos = input?.selectionStart ?? value.length
    const uptoCursor = value.slice(0, cursorPos)
    const match = uptoCursor.match(/@([\w.\-]*)$/)
    if (!match) return

    const before = uptoCursor.slice(0, match.index)
    const mentionLabel = member.full_name || member.email || 'teammate'
    const after = value.slice(cursorPos)
    const nextValue = `${before}@${mentionLabel} ${after}`.replace(/\s{2,}/g, ' ')
    setNewMessage(nextValue)
    setShowMentions(false)

    requestAnimationFrame(() => {
      const pos = (before + `@${mentionLabel} `).length
      if (input) {
        input.focus()
        input.setSelectionRange(pos, pos)
      }
    })
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return
    const mentions = extractMentionUserIds(newMessage)
    const res = await postTeamMessage(teamId, newMessage.trim(), mentions)
    if (res.success) {
      setNewMessage('')
      setShowMentions(false)
      loadData()
    } else {
      alert(res.error)
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim()) return
    const res = await addTeamNote(teamId, newNote.trim())
    if (res.success) {
      setNewNote('')
      loadData()
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/lab/teams" className="p-2 border border-white/10 hover:border-white/20 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-white">Team Moodboard</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/30 font-mono">Loading...</div>
      ) : (
        <>
          {/* Chat Section */}
          <section className="bg-[#0a0a0a] p-4 rounded border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-2">Chat</h2>
            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {messages.map((msg) => (
                <div key={msg.id} className="text-sm text-white/80">
                  <span className="font-mono text-white/60">{msg.user?.full_name || 'Anonymous'}</span>{' '}
                  <span className="text-white/40">{new Date(msg.created_at).toLocaleString()}</span>
                  <div>{msg.content}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2 relative">
              <div className="relative flex-1">
                <input
                  ref={messageInputRef}
                  type="text"
                  placeholder="Write a message… use @ to mention teammates"
                  value={newMessage}
                  onChange={handleMessageChange}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                />
                {showMentions && mentionResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-[#0f0f0f] border border-white/10 shadow-2xl z-20 max-h-48 overflow-y-auto">
                    {mentionResults.map((member) => (
                      <button
                        type="button"
                        key={member.id}
                        onClick={() => handleSelectMention(member)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="text-sm text-white">{member.full_name || member.email || 'Teammate'}</div>
                        <div className="text-xs text-white/40 font-mono uppercase">{member.role}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <LabButton type="submit">Send</LabButton>
            </form>
          </section>

          {/* Notes Section */}
          <section className="bg-[#0a0a0a] p-4 rounded border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-2">Notes</h2>
            <div className="space-y-2 mb-4">
              {notes.map((note) => (
                <div key={note.id} className="text-sm text-white/80">
                  <div className="font-mono text-white/60">{note.user?.full_name || 'Anonymous'}</div>
                  <div className="text-white/40 text-xs mb-1">{new Date(note.created_at).toLocaleString()}</div>
                  <div>{note.content}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddNote} className="flex gap-2">
              <textarea
                placeholder="Add a note…"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                rows={2}
              />
              <LabButton type="submit">Add</LabButton>
            </form>
          </section>
        </>
      )}
    </div>
  )
}
