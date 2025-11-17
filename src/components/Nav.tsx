// src/components/Nav.tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../lib/supabaseClient'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function Nav() {
  const router = useRouter()
  const pathname = usePathname()

  const supabaseRef = useRef<SupabaseClient | null>(null)

  const [logged, setLogged] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  // Istanzia client + stato auth
  useEffect(() => {
    const sb = createClient() // SOLO nel browser
    supabaseRef.current = sb
    setMounted(true)

    sb.auth.getUser().then(({ data: { user } }) => setLogged(!!user))

    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setLogged(!!session?.user)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  // Badge richieste pendenti (solo se loggato)
  useEffect(() => {
    const sb = supabaseRef.current
    if (!logged || !sb) { setPendingCount(null); return }

    let active = true

    async function loadCount(client: SupabaseClient) {
      const { count } = await client
        .from('booking_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
      if (active) setPendingCount(count ?? 0)
    }

    // prima lettura
    loadCount(sb)

    // realtime su booking_requests
    const ch = sb
      .channel('booking_requests_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => {
        loadCount(sb)
      })
      .subscribe()

    return () => {
      active = false
      sb.removeChannel(ch)
    }
  }, [logged])

  function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const active = pathname === href
    return (
      <Link href={href} className={`px-2 py-1 ${active ? 'font-semibold underline' : ''}`}>
        {children}
      </Link>
    )
  }

  async function handleLogout() {
    const sb = supabaseRef.current ?? createClient()
    await sb.auth.signOut()
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <nav className="border-b bg-white">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="font-semibold">Centro Estetico</Link>
        <div className="flex items-center gap-4 text-sm">
          <NavLink href="/listino">Listino</NavLink>
          <NavLink href="/booking">Prenota</NavLink>

          {logged ? (
            <>
              <NavLink href="/admin/services">Servizi</NavLink>
              <NavLink href="/admin/agenda">Agenda</NavLink>
              <NavLink href="/admin/requests">
                Richieste
                {typeof pendingCount === 'number' && (
                  <span className="ml-1 inline-flex items-center justify-center text-xs rounded-full px-1.5 border">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
              <button className="btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn" href="/login">Login</Link>
              <Link className="btn" href="/register">Registrati</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
