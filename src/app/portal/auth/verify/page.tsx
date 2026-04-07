'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getClientInviteDetails, acceptClientInvite } from '@/lib/actions/client-actions'
import { Lock, User, Loader2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react'

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

  // Verify invite token
  useEffect(() => {
    async function verifyInvite() {
      if (!token) {
        setError("No verification token provided.")
        setValidating(false)
        setLoading(false)
        return
      }

      try {
        const details = await getClientInviteDetails(token)
        if (!details) {
          setError("This portal invitation is invalid or has expired.")
        } else {
          setClientId(details.id)
          setInviteEmail(details.email)
          setCompanyName(details.companyName)
        }
      } catch (err) {
        setError("Failed to verify invitation.")
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
    
    // Create the auth user with the pre-verified email
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: inviteEmail,
      password,
      options: {
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

    if (authData.user) {
      // Finalize invite acceptance via server action
      const acceptanceResult = await acceptClientInvite(clientId, authData.user.id, fullName)
      
      if (!acceptanceResult.success) {
        setError(acceptanceResult.error || "Failed to set up portal access.")
        setSubmitting(false)
        return
      }

      setSuccess(true)
    }
  }

  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-white/50 font-mono text-sm uppercase tracking-wider">Verifying Portal Access...</p>
        </div>
      </div>
    )
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
        <div className="w-full max-w-md bg-[#111116] border border-white/10 p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2 font-sans">Invalid Link</h1>
          <p className="text-white/50 font-mono text-sm mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => router.push('/portal/auth/login')}
            className="text-indigo-400 hover:text-indigo-300 transition-colors font-mono text-sm border border-indigo-500/20 px-6 py-2 hover:bg-indigo-500/10"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#111116] border border-white/10 p-10 text-center shadow-2xl relative z-10 backdrop-blur-sm">
          <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 font-sans">Account Created!</h1>
          <p className="text-white/60 mb-8 font-mono text-sm leading-relaxed">
            Your client portal is just about ready. We've sent a final confirmation link to your email.
            <br/><br/>
            Please confirm your email address to log in!
          </p>
          <button
            onClick={() => router.push('/portal/auth/login')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-medium font-mono uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
          >
            Go to Login <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 relative overflow-hidden">
      {/* Background glow specific to portal invites */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
            <span className="text-white font-bold text-2xl font-mono tracking-tighter">e11</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-sans tracking-tight mb-2">Client Portal</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <p className="text-white/70 font-mono text-xs uppercase tracking-wider truncate max-w-[200px]">
              {companyName}
            </p>
          </div>
        </div>

        <div className="bg-[#111116]/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
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
                <span className="text-[10px] uppercase font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20">Verified</span>
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
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 focus:bg-white/10 focus:outline-none font-mono text-sm transition-all"
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
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 focus:bg-white/10 focus:outline-none font-mono text-sm transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-[11px] text-white/30 mt-2 font-mono uppercase tracking-wider">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold font-mono uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-4 relative overflow-hidden"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <span className="relative z-10">Access Portal</span>
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

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-white/50 font-mono text-sm uppercase tracking-wider">Loading...</p>
        </div>
      }
    >
      <ClientVerifyForm />
    </Suspense>
  )
}
