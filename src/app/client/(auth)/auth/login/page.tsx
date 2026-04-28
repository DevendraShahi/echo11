'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'

export default function ClientLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function routeByRole(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profile?.role === 'admin' || profile?.role === 'member') {
      router.push('/lab/dashboard')
      router.refresh()
      return true
    }

    if (profile?.role === 'client') {
      router.push('/client')
      router.refresh()
      return true
    }

    return false
  }

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await routeByRole(user.id)
    }
    void checkUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (userId) {
      const routed = await routeByRole(userId)
      if (routed) {
        setLoading(false)
        return
      }
    }

    await supabase.auth.signOut()
    setError('This account does not have client access.')
    setLoading(false)
  }

  const handleMagicLink = async () => {
    setLoading(true)
    setError(null)

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://echo11.tech'}/client/auth/callback`,
      }
    })

    if (magicError) {
      setError(magicError.message)
    } else {
      setError(null)
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-3xl font-mono">e</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-sans">echo11 Client Area</h1>
          <p className="text-white/50 mt-2 font-mono text-sm">Sign in to view your projects</p>
        </div>

        {/* Login Form */}
        <div className="p-8 bg-[#0a0a0a] border border-white/10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-sans text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-mono uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-accent focus:outline-none font-sans text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-sans">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent/90 text-black font-sans uppercase tracking-wider text-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0a0a] text-white/30 font-mono text-xs">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading || !email}
            className="w-full py-3 border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-sans text-sm uppercase tracking-wider transition-all disabled:opacity-50"
          >
            Send Magic Link
          </button>
        </div>

        <p className="text-center text-white/30 text-sm mt-6 font-sans">
          Contact echo11 if you do not have login credentials
        </p>
      </div>
    </div>
  )
}
