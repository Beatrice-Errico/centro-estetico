'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CalendarDays, ClipboardList, Scissors, Users } from 'lucide-react'
import { createClient } from '../../lib/supabaseClient'
import { startOfDay, endOfDay } from 'date-fns'

export default function AdminDashboard() {
  const supabase = createClient()
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [todayCount, setTodayCount] = useState<number | null>(null)

  async function loadCounts() {
    // richieste in attesa
    const { count: pending } = await supabase
      .from('booking_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    // appuntamenti di oggi
    const start = startOfDay(new Date()).toISOString()
    const end = endOfDay(new Date()).toISOString()
    const { count: today } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .in('status', ['booked', 'confirmed'])
      .gte('starts_at', start)
      .lt('starts_at', end)

    setPendingCount(pending ?? 0)
    setTodayCount(today ?? 0)
  }

  useEffect(() => {
    let active = true
    loadCounts()

    // realtime listener
    const ch1 = supabase
      .channel('dashboard_booking_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => {
        if (active) loadCounts()
      })
      .subscribe()

    const ch2 = supabase
      .channel('dashboard_appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        if (active) loadCounts()
      })
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(ch1)
      supabase.removeChannel(ch2)
    }
  }, [])

  return (
    <div className="min-h-screen px-6 py-10 space-y-10">
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-semibold text-silver-100 tracking-wide">
          Pannello Amministratore
        </h1>
        <p className="text-silver-400 text-sm">
          Gestisci servizi, appuntamenti e richieste in tempo reale
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* 🔹 Agenda */}
        <Link
          href="/admin/agenda"
          className="group card flex flex-col items-center justify-center h-40 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
        >
          <CalendarDays className="w-10 h-10 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-2">
            <h2 className="text-silver-100 font-medium tracking-wide">
              Agenda
            </h2>
            {typeof todayCount === 'number' && (
              <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {todayCount} oggi
              </span>
            )}
          </div>
          <p className="text-silver-400 text-xs mt-1">
            Visualizza gli appuntamenti in calendario
          </p>
        </Link>

        {/* 🔹 Appuntamenti */}
        <Link
          href="/admin/appointments"
          className="group card flex flex-col items-center justify-center h-40 border border-white/10 hover:border-blue-400/40 hover:bg-blue-400/5 transition-all"
        >
          <ClipboardList className="w-10 h-10 text-blue-300 mb-2 group-hover:scale-110 transition-transform" />
          <h2 className="text-silver-100 font-medium tracking-wide">
            Gestione Appuntamenti
          </h2>
          <p className="text-silver-400 text-xs mt-1">
            Crea, modifica o annulla appuntamenti
          </p>
        </Link>

        {/* 🔹 Richieste clienti */}
        <Link
          href="/admin/requests"
          className="group card flex flex-col items-center justify-center h-40 border border-white/10 hover:border-pink-400/40 hover:bg-pink-400/5 transition-all"
        >
          <Users className="w-10 h-10 text-pink-300 mb-2 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-2">
            <h2 className="text-silver-100 font-medium tracking-wide">
              Richieste Clienti
            </h2>
            {typeof pendingCount === 'number' && (
              <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-300 border border-pink-500/40">
                {pendingCount} nuove
              </span>
            )}
          </div>
          <p className="text-silver-400 text-xs mt-1">
            Approva o rifiuta nuove prenotazioni
          </p>
        </Link>

        {/* 🔹 Servizi */}
        <Link
          href="/admin/services"
          className="group card flex flex-col items-center justify-center h-40 border border-white/10 hover:border-violet-400/40 hover:bg-violet-400/5 transition-all"
        >
          <Scissors className="w-10 h-10 text-violet-300 mb-2 group-hover:scale-110 transition-transform" />
          <h2 className="text-silver-100 font-medium tracking-wide">
            Servizi
          </h2>
          <p className="text-silver-400 text-xs mt-1">
            Aggiungi, modifica o disattiva trattamenti
          </p>
        </Link>
      </div>

      <footer className="text-center text-silver-500 text-xs mt-12">
        © {new Date().getFullYear()} Centro Estetico — Pannello Admin
      </footer>
    </div>
  )
}
