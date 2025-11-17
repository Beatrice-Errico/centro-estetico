'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabaseClient'

type Appointment = {
  id: string
  // Supabase qui ti restituisce *array* di relazioni
  customers?: { full_name: string }[] | null
  services?: { name: string }[] | null
  starts_at: string
  ends_at: string
  status: string
}

type Customer = { id: string; full_name: string }
type Service = { id: string; name: string; duration_minutes: number; price_cents: number }

export default function AppointmentsPage() {
  const supabase = createClient()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // 🔹 Caricamento iniziale
  useEffect(() => {
    async function load() {
      setLoading(true)
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

      const [appts, serv, cust, today] = await Promise.all([
        supabase
          .from('appointments')
          .select(
            'id,starts_at,ends_at,status, customers(full_name), services(name)'
          )
          .order('starts_at', { ascending: true }),

        supabase.from('services').select('id,name,duration_minutes,price_cents'),
        supabase.from('customers').select('id,full_name'),

        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .gte('starts_at', start.toISOString())
          .lte('starts_at', end.toISOString()),
      ])

      if (appts.data) setAppointments(appts.data as unknown as Appointment[])
      if (serv.data) setServices(serv.data)
      if (cust.data) setCustomers(cust.data)
      setTodayCount(today.count || 0)
      setLoading(false)
    }

    load()
  }, [supabase])

  // 🔸 Realtime: aggiorna badge e lista in diretta
  useEffect(() => {
    const channel = supabase
      .channel('appointments_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        async () => {
          const { data: appts } = await supabase
            .from('appointments')
            .select(
              'id,starts_at,ends_at,status, customers(full_name), services(name)'
            )
            .order('starts_at', { ascending: true })

          if (appts) setAppointments(appts as unknown as Appointment[])

          const now = new Date()
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
          const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
          const { count } = await supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .gte('starts_at', start.toISOString())
            .lte('starts_at', end.toISOString())
          setTodayCount(count || 0)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // 🔻 Funzione per annullare un appuntamento
  async function cancelAppointment(id: string) {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancellato' })
      .eq('id', id)
    if (error) console.error(error)
  }

  if (loading) {
    return <div className="p-6 text-silver-300">Caricamento…</div>
  }

  return (
    <div className="space-y-6">
      {/* 🔹 Toolbar superiore */}
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center px-3 py-2 border border-white/15 hover:bg-white/5 transition"
          >
            ← Dashboard
          </Link>

          <Link
            href="/admin/agenda"
            className="inline-flex items-center px-3 py-2 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 transition-colors"
          >
            Vai all’agenda
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-white/90 tracking-wide">
            Gestione Appuntamenti
          </h1>

          {/* 🔸 Badge live */}
          <span className="ml-2 inline-flex items-center justify-center text-xs px-2 py-1 border border-emerald-500/40 text-emerald-300 bg-emerald-500/10 rounded-sm">
            {todayCount} {todayCount === 1 ? 'oggi' : 'oggi'}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 🔹 Form nuovo appuntamento */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-silver-100">Nuovo appuntamento</h2>
          <form
            action="/api/addAppointment"
            method="post"
            className="space-y-3"
          >
            <div>
              <label className="label">Cliente</label>
              <select name="customer_id" className="input" required>
                <option value="">Seleziona…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Servizio</label>
              <select name="service_id" className="input" required>
                <option value="">Seleziona…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Inizio</label>
                <input name="starts_at" type="datetime-local" className="input" required />
              </div>
              <div>
                <label className="label">Fine</label>
                <input name="ends_at" type="datetime-local" className="input" required />
              </div>
            </div>

            <button className="btn w-full" type="submit">
              Salva
            </button>
          </form>
        </div>

        {/* 🔹 Lista appuntamenti */}
        <div className="card">
          <h2 className="text-lg font-semibold text-silver-100 mb-3">Appuntamenti</h2>

          {appointments.length === 0 ? (
            <p className="text-silver-400 text-sm">Nessun appuntamento al momento.</p>
          ) : (
            <ul className="space-y-2">
              {appointments.map((a) => {
                const customerName = a.customers?.[0]?.full_name ?? '—'
                const serviceName = a.services?.[0]?.name ?? '—'

                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between border border-white/10 p-3 bg-black/20 hover:bg-black/30 transition"
                  >
                    <div>
                      <div className="font-medium text-white">
                        {customerName} • {serviceName}
                      </div>
                      <div className="text-sm text-silver-400">
                        {new Date(a.starts_at).toLocaleString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}{' '}
                        →{' '}
                        {new Date(a.ends_at).toLocaleString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {a.status}
                      </div>
                    </div>

                    <button
                      onClick={() => cancelAppointment(a.id)}
                      className="px-3 py-2 text-sm border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Annulla
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
