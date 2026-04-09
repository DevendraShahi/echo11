'use client'

import { useState, useEffect } from 'react'
import { LabButton } from '@/components/ui/LabButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { LabCard, LabCardHeader, LabCardTitle, LabCardContent } from '@/components/ui/LabCard'
import { getUserProfile, getUserPreferences, updateProfile, updatePreferences, changePassword } from '@/lib/actions/settings-actions'
import { getAllTeams } from '@/lib/actions/team-actions'
import { Profile, Theme, Team } from '@/types/lab'
import { 
  User, Bell, Shield, Palette, Key, Check, 
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TooltipTour, PageVisitTracker } from '@/components/onboarding'
import { settingsTourSteps } from '@/components/onboarding/pageTours'

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-white/70 group-hover:text-white transition-colors font-sans">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-11 h-6 transition-colors duration-200",
          checked ? "bg-accent" : "bg-white/10 border border-white/10"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 bg-white transition-transform duration-200",
            checked && "translate-x-5"
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
    { id: 'system', label: 'System' }
  ]

  return (
    <div className="flex gap-2">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onChange(theme.id)}
          className={cn(
            "px-4 py-2 text-sm font-mono border transition-colors",
            value === theme.id 
              ? "bg-accent text-black border-accent" 
              : "text-white/60 border-white/10 hover:border-white/20"
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [profileData, prefsData] = await Promise.all([
        getUserProfile(),
        getUserPreferences(),
      ])

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
      setMessage({ type: 'success', text: 'Profile updated successfully' })
      loadData()
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
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
      theme
    })
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Preferences saved successfully' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to save preferences' })
    }
    
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setPasswordLoading(true)
    setMessage(null)
    
    const result = await changePassword(currentPassword, newPassword)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Password changed successfully' })
      setShowPasswordChange(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to change password' })
    }
    
    setPasswordLoading(false)
    setTimeout(() => setMessage(null), 3000)
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <TooltipTour steps={settingsTourSteps} pageId="settings" />
      <PageVisitTracker pageId="settings" />
      <PageHeader 
        title="Settings" 
        description="Manage your account and preferences"
        icon={User}
      />

      {message && (
        <div className={cn(
          "p-4 border text-sm font-mono",
          message.type === 'success' 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        )}>
          {message.text}
        </div>
      )}

      <LabCard data-tour="profile-section">
        <LabCardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <LabCardTitle className="font-mono text-xs uppercase tracking-wider">Profile</LabCardTitle>
          </div>
        </LabCardHeader>
        <LabCardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center">
              <span className="text-2xl font-bold text-black">{getInitials(fullName || profile?.email || '?')}</span>
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-xs font-mono uppercase text-white/50 mb-2">Avatar URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white/50 text-sm font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">Role</label>
              <span className={cn(
                "inline-block px-3 py-1.5 text-xs font-mono uppercase tracking-wider border",
                profile?.role === 'admin' 
                  ? "bg-accent/10 border-accent/20 text-accent"
                  : "bg-white/5 border-white/10 text-white/50"
              )}>
                {profile?.role || 'member'}
              </span>
            </div>
            {profile?.team_id && (
              <div>
                <label className="block text-xs font-mono uppercase text-white/50 mb-2">Team</label>
                <span className="inline-block px-3 py-1.5 text-xs font-mono uppercase tracking-wider border bg-white/5 border-white/10 text-white/50">
                  {teams.find(t => t.id === profile.team_id)?.name || 'Unknown'}
                </span>
              </div>
            )}
          </div>

          <div>
            <LabButton onClick={handleSaveProfile} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Profile
            </LabButton>
          </div>
        </LabCardContent>
      </LabCard>

      <LabCard data-tour="notifications-section">
        <LabCardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <LabCardTitle className="font-mono text-xs uppercase tracking-wider">Notifications</LabCardTitle>
          </div>
        </LabCardHeader>
        <LabCardContent className="space-y-4">
          <ToggleSwitch
            label="Email Notifications"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          <ToggleSwitch
            label="Task Reminders"
            checked={taskReminders}
            onChange={setTaskReminders}
          />
          <ToggleSwitch
            label="Meeting Reminders"
            checked={meetingReminders}
            onChange={setMeetingReminders}
          />
          <div className="pt-2">
            <LabButton onClick={handleSavePreferences} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Preferences
            </LabButton>
          </div>
        </LabCardContent>
      </LabCard>

      <LabCard data-tour="appearance-section">
        <LabCardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-accent" />
            </div>
            <LabCardTitle className="font-mono text-xs uppercase tracking-wider">Appearance</LabCardTitle>
          </div>
        </LabCardHeader>
        <LabCardContent className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-white/50 mb-3">Theme</label>
            <ThemeSelector value={theme} onChange={setTheme} />
          </div>
          <div className="pt-2">
            <LabButton onClick={handleSavePreferences} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Theme
            </LabButton>
          </div>
        </LabCardContent>
      </LabCard>

      <LabCard data-tour="security-section">
        <LabCardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <LabCardTitle className="font-mono text-xs uppercase tracking-wider">Security</LabCardTitle>
          </div>
        </LabCardHeader>
        <LabCardContent>
          {!showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-mono text-sm"
            >
              <Key className="w-4 h-4" />
              Change Password
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-white/50 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-white/50 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-white/50 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/30 focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <LabButton variant="ghost" onClick={() => setShowPasswordChange(false)}>
                  Cancel
                </LabButton>
                <LabButton onClick={handleChangePassword} disabled={passwordLoading}>
                  {passwordLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Update Password
                </LabButton>
              </div>
            </div>
          )}
        </LabCardContent>
      </LabCard>

    </div>
  )
}
