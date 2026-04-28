'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getClientInviteDetails, acceptClientInvite } from '@/lib/actions/client-actions'
import { AlertCircle, ArrowRight, CheckCircle, Loader2, Lock, User } from 'lucide-react'

function ClientVerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [companyName, setCompanyName] = useState('')

  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function verifyInvite() {
      if (!token) {
        setError('No verification token provided.')
        setValidating(false)
        setLoading(false)
        return
      }

      try {
        const details = await getClientInviteDetails(token)
        if (!details) {
          setError('This client invitation is invalid or has expired.')
        } else {
          setClientId(details.id)
          setInviteEmail(details.email)
          setCompanyName(details.companyName)
        }
      } catch {
        setError('Failed to verify invitation.')
      } finally {
        setValidating(false)
        setLoading(false)
      }
    }

    verifyInvite()
  }, [token])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !inviteEmail || !clientId) return

    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: inviteEmail,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://echo11.tech'}/client/auth/callback?next=/client/auth/login`,
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setSubmitting(false)
      return
    }

    if (!authData.user?.id) {
      setError('Could not create or resolve your account. Please try again.')
      setSubmitting(false)
      return
    }

    const acceptanceResult = await acceptClientInvite(clientId, authData.user.id, fullName, inviteEmail)

    if (!acceptanceResult.success) {
      setError(acceptanceResult.error || 'Failed to set up client access.')
      setSubmitting(false)
      return
    }

    setSuccess(true)

    setSubmitting(false)
  }

  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-white/50 font-sans text-sm uppercase tracking-wider">Verifying Client Access...</p>
        </div>
      </div>
    )
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-rose-500/30 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2 font-sans">Invalid Link</h1>
          <p className="text-white/50 font-sans text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push('/client/auth/login')}
            className="text-accent hover:text-accent/80 transition-colors font-sans text-sm border border-accent/20 px-6 py-2 hover:bg-accent/10"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-10 text-center">
          <div className="w-16 h-16 bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 font-sans">Account Created</h1>
          <p className="text-white/60 mb-8 font-sans text-sm leading-relaxed">
            Your client account is ready. If your project requires email confirmation, check your inbox and then sign in.
          </p>
          <button
            onClick={() => router.push('/client/auth/login')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-black font-medium font-sans uppercase tracking-widest text-sm transition-colors"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-accent flex items-center justify-center mx-auto mb-6">
            <span className="text-black font-bold text-2xl font-mono tracking-tighter">e11</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-sans tracking-tight mb-2">Client Setup</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10">
            <span className="w-2 h-2 bg-accent animate-pulse" />
            <p className="text-white/70 font-mono text-xs uppercase tracking-wider truncate max-w-[220px]">{companyName}</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 flex gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-rose-400 text-sm font-sans leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-white/50">Email Address</label>
                <span className="text-[10px] uppercase font-mono text-accent bg-accent/10 px-2 py-0.5 border border-accent/20">Verified</span>
              </div>
              <input
                type="email"
                value={inviteEmail}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/60 font-sans text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-2">Your Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-accent focus:bg-white/10 focus:outline-none font-sans text-sm transition-all"
                  placeholder="John Doe"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/50 mb-2">Choose a Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-accent focus:bg-white/10 focus:outline-none font-sans text-sm transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-[11px] text-white/30 mt-2 font-sans uppercase tracking-wider">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-black font-bold font-sans uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Access Client Area
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4 font-sans">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-white/50 font-sans text-sm uppercase tracking-wider">Loading...</p>
        </div>
      }
    >
      <ClientVerifyForm />
    </Suspense>
  )
}
