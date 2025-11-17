'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

function LoginContent() {
  const supabase = createClient()
  const router = useRouter()
  const qp = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mounted, setMounted] = useState(false)
  const [alreadyLogged, setAlreadyLogged] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isStaff, setIsStaff] = useState<boolean | null>(null)

  // Controllo sessione esistente
  useEffect(() => {
    setMounted(true)
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setAlreadyLogged(true)
        setUserEmail(user.email ?? null)

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        setIsStaff(profile?.role === 'staff' || !profile)
      }
    })()
  }, [supabase])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    const next = qp.get('next') || '/admin/services'
    router.replace(next)
  }

  function handleGoAdmin() {
    const next = qp.get('next') || '/admin'
    router.replace(next)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setAlreadyLogged(false)
    setUserEmail(null)
    setIsStaff(null)
  }

  if (!mounted) return null

  // UI se sei già loggata
  if (alreadyLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night-900">
        <div className="card max-w-md w-full">
          <h1 className="text-xl font-semibold mb-2 text-silver-100">Sei già autenticato</h1>
          <p className="text-sm text-silver-300 mb-4">
            {userEmail ? (
              <>
                Accesso come <strong>{userEmail}</strong>.
              </>
            ) : (
              'Accesso attivo.'
            )}
          </p>

          <div className="flex flex-wrap gap-2 items-center">
            {isStaff !== false && (
              <button className="btn" onClick={handleGoAdmin}>
                Vai all’area admin
              </button>
            )}

            {isStaff === false && (
              <p className="text-sm text-red-400">
                Il tuo account non ha i permessi staff.
              </p>
            )}

            <button className="btn-ghost" onClick={handleLogout}>
              Esci
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Form login standard
  return (
    <div className="min-h-screen flex items-center justify-center bg-night-900">
      <div className="card max-w-md w-full">
        <h1 className="text-xl font-semibold mb-4 text-silver-100">Login staff</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button className="btn w-full" type="submit" disabled={loading}>
            {loading ? 'Accesso…' : 'Entra'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-night-900">
          <div className="card max-w-md w-full text-center text-silver-100">
            Caricamento login…
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
