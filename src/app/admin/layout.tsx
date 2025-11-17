'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabaseClient'
import AdminHeader from './_components/AdminHeader'


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    let alive = true
    const supabase = createClient()

    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!alive) return
      if (!user) { router.replace('/login'); return }

      // opzionale: check ruolo da profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const ok = profile?.role === 'staff' || !profile
      if (!alive) return
      setAllowed(!!ok)
      setReady(true)
      if (!ok) router.replace('/login')
    })()

    return () => { alive = false }
  }, [router])

  if (!ready) return <div className="min-h-screen bg-[#0a0a0b] text-silver-100 px-6 py-8">Controllo accesso…</div>
  if (!allowed) return null

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-silver-100">
      <AdminHeader />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
