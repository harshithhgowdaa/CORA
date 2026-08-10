'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function LoginButton() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const handleLogin = async () => {
    setLoading(true); setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (authError) { setLoading(false); setError(authError.message) }
  }
  return (
    <div className="space-y-3">
      <Button 
        onClick={handleLogin} 
        disabled={loading} 
        className="w-full shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
      >
        {loading ? 'Redirecting...' : 'Continue with Google Workspace'}
      </Button>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <p className="text-center text-xs text-[#6B7280]">By continuing, you agree to the <Link className="underline" href="/privacy">Privacy Policy</Link>.</p>
    </div>
  )
}
