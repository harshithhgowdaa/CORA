'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LoginButton() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const handleLogin = async () => {
    setLoading(true); setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (authError) { setLoading(false); setError(authError.message) }
  }
  return <div className="space-y-3"><Button onClick={handleLogin} disabled={loading} className="w-full">{loading ? 'Redirecting...' : 'Continue with Google Workspace'}</Button>{error && <p className="text-sm text-red-600" role="alert">{error}</p>}</div>
}
