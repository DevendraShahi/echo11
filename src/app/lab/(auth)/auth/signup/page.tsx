'use client'

import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()

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

        <div className="bg-[#0a0a0a] border border-white/10 p-8 space-y-6">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm font-mono flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Self-signup is disabled</p>
              <p className="text-white/70 mt-1">
                Please use your team invitation link to create an account. If you don&apos;t have one, contact your administrator.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/lab/auth/login')}
              className="px-4 py-2 bg-accent text-black font-mono uppercase tracking-wider text-sm hover:bg-accent/90 transition-colors"
            >
              Go to Login
            </button>
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
