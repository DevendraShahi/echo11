'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-sans">Check your email</h1>
          <p className="text-white/50 mb-6 font-mono text-sm">
            We&apos;ve sent a confirmation link to <span className="text-white/70">{email}</span>
          </p>
          <button
            onClick={() => router.push('/lab/auth/login')}
            className="text-accent hover:text-accent/80 transition-colors font-mono text-sm"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-lg font-mono">e11</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-sans">Create your account</h1>
          <p className="text-white/50 mt-2 font-mono text-sm">Join echo11Lab to manage your projects</p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-mono">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/50 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-mono text-sm"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-white/30 mt-1 font-mono">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent/90 text-black font-mono uppercase tracking-wider text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/50 font-mono">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/lab/auth/login')}
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-white/50 mt-6 font-mono">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-white/70 hover:text-white transition-colors"
          >
            ← Back to echo11
          </button>
        </p>
      </div>
    </div>
  )
}
