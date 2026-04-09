'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getInviteDetails, acceptTeamInvite } from '@/lib/actions/settings-actions'
import { Lock, User, Loader2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react'

function TeamSignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteId = searchParams.get('invite')

  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [success, setSuccess] = useState(false)

  // Verify invite token
  useEffect(() => {
    async function verifyInvite() {
      if (!inviteId) {
        setError("No invitation code provided.")
        setValidating(false)
        setLoading(false)
        return
      }

      try {
        const details = await getInviteDetails(inviteId)
        if (!details) {
          setError("This invitation is invalid or has expired.")
        } else {
          setInviteEmail(details.email)
          setInviteRole(details.role)
        }
      } catch {
        setError("Failed to verify invitation.")
      } finally {
        setValidating(false)
        setLoading(false)
      }
    }

    verifyInvite()
  }, [inviteId])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteId || !inviteEmail) return
    
    setSubmitting(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    
    // Create the auth user with the pre-verified email
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: inviteEmail,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://echo11.tech'}/lab/auth/callback?next=/lab/auth/login`,
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setSubmitting(false)
      return
    }

    if (authData.user) {
      // Finalize invite acceptance via server action
      const acceptanceResult = await acceptTeamInvite(inviteId, authData.user.id, fullName)
      
      if (!acceptanceResult.success) {
        setError(acceptanceResult.error || "Failed to accept invite.")
        setSubmitting(false)
        return
      }

      setSuccess(true)
    }
  }

  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-white/50 font-mono text-sm uppercase tracking-wider">Verifying Invitation...</p>
        </div>
      </div>
    )
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2 font-sans">Invalid Invitation</h1>
          <p className="text-white/50 font-mono text-sm mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => router.push('/lab/auth/login')}
            className="text-accent hover:text-accent/80 transition-colors font-mono text-sm border border-accent/20 px-6 py-2 hover:bg-accent/10"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-10 text-center shadow-2xl relative z-10 backdrop-blur-sm">
          <div className="w-16 h-16 bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 font-sans">Welcome to echo11!</h1>
          <p className="text-white/60 mb-8 font-mono text-sm leading-relaxed">
            Your account has been successfully created. We&apos;ve sent an email confirmation link.
            <br/><br/>
            Please confirm your email before signing in!
          </p>
          <button
            onClick={() => router.push('/lab/auth/login')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-black font-medium font-mono uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Background glow specific to team invites */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-accent flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,229,255,0.3)]">
            <span className="text-black font-bold text-2xl font-mono tracking-tighter">e11</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-sans tracking-tight mb-2">Join the Agency</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <p className="text-white/70 font-mono text-xs uppercase tracking-wider">
              Invited as <span className="text-white font-bold">{inviteRole}</span>
            </p>
          </div>
        </div>

        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 flex gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-rose-400 text-sm font-mono leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-white/50">
                  Email Address
                </label>
                <span className="text-[10px] uppercase font-mono text-accent/70 bg-accent/10 px-2 py-0.5">Verified</span>
              </div>
              <input
                type="email"
                value={inviteEmail}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/60 font-mono text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
                Your Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-accent focus:bg-white/10 focus:outline-none font-mono text-sm transition-all disabled:opacity-50"
                  placeholder="John Doe"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
                Choose a Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-accent focus:bg-white/10 focus:outline-none font-mono text-sm transition-all disabled:opacity-50"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-[11px] text-white/30 mt-2 font-mono uppercase tracking-wider">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-accent focus:bg-white/10 focus:outline-none font-mono text-sm transition-all disabled:opacity-50"
                  placeholder="Match the password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent text-black font-bold font-mono uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-4 relative overflow-hidden"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <span className="relative z-10">Create Profile</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

import { Suspense } from 'react'

export default function TeamSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-white/50 font-mono text-sm uppercase tracking-wider">Loading...</p>
        </div>
      }
    >
      <TeamSignupForm />
    </Suspense>
  )
}
