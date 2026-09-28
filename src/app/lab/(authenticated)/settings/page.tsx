'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, Check, Key, Loader2, Palette, Shield, User } from 'lucide-react'
import { LabButton } from '@/components/ui/LabButton'
import { getUserProfile, getUserPreferences, updateProfile, updatePreferences, changePassword } from '@/lib/actions/settings-actions'
import { getAllTeams } from '@/lib/actions/team-actions'
import { Profile, Team, Theme } from '@/types/lab'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { settingsTourSteps } from '@/components/onboarding/pageTours'
import { LabPageHeader } from '@/components/lab/primitives/LabPageHeader'
import { MetricStrip } from '@/components/lab/primitives/MetricStrip'
import { PanelSection } from '@/components/lab/primitives/PanelSection'
import { cn } from '@/lib/utils'

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-3 border border-white/10 bg-black/50 px-3 py-2 cursor-pointer">
      <span className="text-sm text-white/75 font-sans">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 border transition-colors',
          checked ? 'border-accent/40 bg-accent/20' : 'border-white/20 bg-white/5'
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-4 w-4 bg-white transition-transform',
            checked ? 'translate-x-5 bg-accent' : 'bg-white/70'
          )}
        />
      </button>
    </label>
  )
}

function ThemeSelector({ value, onChange }: { value: Theme; onChange: (theme: Theme) => void }) {
  const themes: { id: Theme; label: string }[] = [
    { id: 'dark', label: 'Dark' },
    { id: 'light', label: 'Light' },
    { id: 'system', label: 'System' },
  ]

  return (
    <div className="grid grid-cols-3 gap-px border border-white/10 bg-white/5">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onChange(theme.id)}
          className={cn(
            'px-3 py-2 text-[10px] uppercase tracking-[0.13em] font-mono transition-colors',
            value === theme.id ? 'bg-accent/10 text-accent' : 'bg-black/55 text-white/60 hover:text-white'
          )}
        >
          {theme.label}
        </button>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [taskReminders, setTaskReminders] = useState(true)
  const [meetingReminders, setMeetingReminders] = useState(true)
  const [theme, setTheme] = useState<Theme>('dark')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [teams, setTeams] = useState<Team[]>([])

  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    void loadData()
  }, [])

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

  const securityState = useMemo(() => {
    if (showPasswordChange) return 'editing'
    return 'ready'
  }, [showPasswordChange])

  async function loadData() {
    try {
      const [profileData, prefsData] = await Promise.all([getUserProfile(), getUserPreferences()])

      if (profileData.profile) {
        setProfile(profileData.profile as Profile)
        setFullName(profileData.profile.full_name || '')
        setAvatarUrl(profileData.profile.avatar_url || '')
      }

      if (prefsData) {
        setEmailNotifications(prefsData.email_notifications)
        setTaskReminders(prefsData.task_reminders)
        setMeetingReminders(prefsData.meeting_reminders)
        setTheme(prefsData.theme as Theme)
      }

      if (profileData.profile && (profileData.profile as Profile).role === 'admin') {
        const allTeams = await getAllTeams()
        setTeams(allTeams)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    setSaving(true)
    setMessage(null)

    const result = await updateProfile({ full_name: fullName, avatar_url: avatarUrl || undefined })

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully.' })
      void loadData()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile.' })
    }

    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleSavePreferences() {
    setSaving(true)
    setMessage(null)

    const result = await updatePreferences({
      email_notifications: emailNotifications,
      task_reminders: taskReminders,
      meeting_reminders: meetingReminders,
      theme,
    })

    if (result.success) {
      setMessage({ type: 'success', text: 'Preferences saved successfully.' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to save preferences.' })
    }

    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }

    setPasswordLoading(true)
    setMessage(null)

    const result = await changePassword(currentPassword, newPassword)

    if (result.success) {
      setMessage({ type: 'success', text: 'Password changed successfully.' })
      setShowPasswordChange(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to change password.' })
    }

    setPasswordLoading(false)
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      <TooltipTour steps={settingsTourSteps} pageId="settings" />
      <PageVisitTracker pageId="settings" />

      <section className="relative overflow-hidden border border-white/10 bg-[linear-gradient(155deg,rgba(0,229,255,0.08),rgba(0,0,0,0)_45%),#05090f] px-4 py-4">
        <LabPageHeader title="Settings" description="Account, notifications, and security controls" icon={User} />
      </section>

      <MetricStrip
        items={[
          { label: 'Role', value: profile?.role || 'member', tone: profile?.role === 'admin' ? 'accent' : 'default' },
          { label: 'Email Notifications', value: emailNotifications ? 'On' : 'Off' },
          { label: 'Task Reminders', value: taskReminders ? 'On' : 'Off' },
          { label: 'Security State', value: securityState, tone: securityState === 'editing' ? 'warning' : 'success' },
        ]}
      />

      {message ? (
        <div
          className={cn(
            'border px-4 py-3 text-sm font-mono',
            message.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          )}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <PanelSection title="Profile" description="Identity and account metadata" action={
            <LabButton onClick={handleSaveProfile} disabled={saving} data-tour="profile-section">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Save Profile
            </LabButton>
          }>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center border border-accent/30 bg-accent/10">
                  <span className="text-lg font-bold text-accent">{getInitials(fullName || profile?.email || '?')}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-sans">{fullName || 'Unnamed User'}</p>
                  <p className="truncate text-[11px] text-white/45 font-mono">{profile?.email}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">Full Name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">Avatar URL</span>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="https://..."
                    className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-px border border-white/10 bg-white/5 sm:grid-cols-2">
                <div className="bg-black/55 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">Email</p>
                  <p className="mt-1 truncate text-xs text-white/80 font-mono">{profile?.email || 'Unknown'}</p>
                </div>
                <div className="bg-black/55 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">Team</p>
                  <p className="mt-1 truncate text-xs text-white/80 font-mono">
                    {profile?.team_id ? teams.find((team) => team.id === profile.team_id)?.name || 'Unknown' : 'No team'}
                  </p>
                </div>
              </div>
            </div>
          </PanelSection>

          <PanelSection title="Notifications" description="Communication and reminder preferences" action={
            <LabButton onClick={handleSavePreferences} disabled={saving} data-tour="notifications-section">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
              Save Preferences
            </LabButton>
          }>
            <div className="space-y-2.5">
              <ToggleSwitch label="Email Notifications" checked={emailNotifications} onChange={setEmailNotifications} />
              <ToggleSwitch label="Task Reminders" checked={taskReminders} onChange={setTaskReminders} />
              <ToggleSwitch label="Meeting Reminders" checked={meetingReminders} onChange={setMeetingReminders} />
            </div>
          </PanelSection>
        </div>

        <div className="space-y-6">
          <PanelSection title="Appearance" description="Theme controls for your workspace" action={
            <LabButton onClick={handleSavePreferences} disabled={saving} data-tour="appearance-section">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Palette className="mr-2 h-4 w-4" />}
              Save Theme
            </LabButton>
          }>
            <ThemeSelector value={theme} onChange={setTheme} />
          </PanelSection>

          <PanelSection title="Security" description="Password and authentication settings" data-tour="security-section">
            {!showPasswordChange ? (
              <LabButton variant="glass" onClick={() => setShowPasswordChange(true)}>
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </LabButton>
            ) : (
              <div className="space-y-3">
                <label className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">Current Password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">New Password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.13em] text-white/45 font-mono">Confirm Password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
                  />
                </label>

                <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                  <LabButton variant="ghost" onClick={() => setShowPasswordChange(false)}>
                    Cancel
                  </LabButton>
                  <LabButton onClick={handleChangePassword} disabled={passwordLoading}>
                    {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                    Update Password
                  </LabButton>
                </div>
              </div>
            )}
          </PanelSection>
        </div>
      </div>
    </div>
  )
}
