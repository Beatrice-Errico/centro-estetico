'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  addDays,
  addMinutes,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  isBefore,
  isAfter,
  isEqual,
} from 'date-fns'
import { it } from 'date-fns/locale'
import { createClient as createBrowserClient } from '../../../lib/supabaseClient'

/** ---------- Config ---------- */
const SLOT_MINUTES = 30
const BLOCKING_STATUSES = new Set(['booked', 'confirmed', 'done'])
// 0=Dom ... 6=Sab (orari di apertura esempio)
const OPENING_HOURS: Record<number, { start: string; end: string }[]> = {
  0: [],
  1: [
    { start: '09:00', end: '13:00' },
    { start: '14:00', end: '19:00' },
  ],
  2: [
    { start: '09:00', end: '13:00' },
    { start: '14:00', end: '19:00' },
  ],
  3: [
    { start: '09:00', end: '13:00' },
    { start: '14:00', end: '19:00' },
  ],
  4: [
    { start: '09:00', end: '13:00' },
    { start: '14:00', end: '19:00' },
  ],
  5: [
    { start: '09:00', end: '13:00' },
    { start: '14:00', end: '19:00' },
  ],
  6: [{ start: '09:00', end: '13:00' }],
}

/** ---------- Tipi ---------- */
type Appt = {
  id: string
  customer_id: string | null
  service_id: string
  starts_at: string
  ends_at: string
  status: 'booked' | 'confirmed' | 'done' | 'cancelled'
  // Supabase ti restituisce array di relazioni, non singolo oggetto
  customers?: { full_name: string }[] | null
  services?: { name: string; duration_minutes: number }[] | null
}

/** ---------- Utils ---------- */
const pad = (n: number) => n.toString().padStart(2, '0')
const withTime = (date: Date, hhmm: string) => {
  const [hh, mm] = hhmm.split(':').map(Number)
  const d = new Date(date)
  d.setHours(hh, mm, 0, 0)
  return d
}
const toUTCISO = (d: Date) => new Date(d).toISOString()
const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  isBefore(aStart, bEnd) && isAfter(aEnd, bStart)

/** ---------- Component ---------- */
export default function AgendaWeekPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const qp = useSearchParams()

  // settimana: ?week=YYYY-MM-DD (lunedì)
  const monday = qp.get('week')
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(monday ? new Date(`${monday}T00:00:00`) : new Date(), { weekStartsOn: 1 }),
  )
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // stato
  const [appts, setAppts] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // canali realtime
  const channelsRef = useRef<any[]>([])

  /** Fetch solo appuntamenti (per aggiornamenti) */
  async function fetchWeekAppointments() {
    const from = startOfDay(weekStart)
    const to = addDays(from, 7)
    const { data, error } = await supabase
      .from('appointments')
      .select(
        'id,customer_id,service_id,starts_at,ends_at,status, customers(full_name), services(name,duration_minutes)',
      )
      .gte('starts_at', toUTCISO(from))
      .lt('starts_at', toUTCISO(to))
      .order('starts_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      // 👇 cast esplicito così TS smette di urlare
      setAppts((data ?? []) as unknown as Appt[])
    }
    setLoading(false)
  }

  // Mount + primo fetch + realtime + poll
  useEffect(() => {
    setMounted(true)
    setLoading(true)
    setError(null)

    // chiudi eventuali canali precedenti
    channelsRef.current.forEach((ch) => supabase.removeChannel(ch))
    channelsRef.current = []

    // fetch iniziale
    fetchWeekAppointments()

    // realtime: appointments
    const chAppts = supabase
      .channel(`appointments_${format(weekStart, 'yyyyMMdd')}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchWeekAppointments()
      })
      .subscribe()
    channelsRef.current.push(chAppts)

    // realtime: booking_requests approvate → rifetch
    const chReqs = supabase
      .channel(`booking_requests_${format(weekStart, 'yyyyMMdd')}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'booking_requests' },
        (payload) => {
          const status = (payload as any)?.new?.status as string | undefined
          if (status === 'approved') fetchWeekAppointments()
        },
      )
      .subscribe()
    channelsRef.current.push(chReqs)

    // fallback poll
    const iv = setInterval(fetchWeekAppointments, 10000)

    return () => {
      clearInterval(iv)
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch))
      channelsRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart])

  function goto(deltaDays: number) {
    const next = addDays(weekStart, deltaDays)
    setWeekStart(next)
    router.push(`/admin/agenda?week=${format(next, 'yyyy-MM-dd')}`)
  }

  /** UI */
  if (!mounted || loading) return <div className="card">Caricamento agenda…</div>
  if (error) return <div className="card text-red-500">Errore: {error}</div>

  const weekLabel = `${format(days[0], 'd LLL', { locale: it })} – ${format(days[6], 'd LLL y', {
    locale: it,
  })}`

  // righe orarie dal min open al max close (per tutta la settimana)
  let minOpen = 24 * 60
  let maxClose = 0
  for (const d of days) {
    for (const w of OPENING_HOURS[d.getDay()] || []) {
      const [sh, sm] = w.start.split(':').map(Number)
      const [eh, em] = w.end.split(':').map(Number)
      minOpen = Math.min(minOpen, sh * 60 + sm)
      maxClose = Math.max(maxClose, eh * 60 + em)
    }
  }
  if (minOpen === 24 * 60 || maxClose === 0) {
    minOpen = 9 * 60
    maxClose = 19 * 60
  }
  const first = withTime(days[0], `${pad(Math.floor(minOpen / 60))}:${pad(minOpen % 60)}`)
  const mins: number[] = []
  for (let m = minOpen; m < maxClose; m += SLOT_MINUTES) mins.push(m)

  return (
    <div className="space-y-4">
      {/* Toolbar minimal con ritorno alla dashboard */}
      <div className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/admin"
            className="inline-flex items-center px-3 py-2 border border-white/15 hover:bg-white/5"
            title="Torna alla Dashboard"
          >
            ← Dashboard
          </a>

          <a
            href="/admin/appointments"
            className="inline-flex items-center px-3 py-2 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 transition-colors"
            title="Vai alla gestione appuntamenti"
          >
            Gestione appuntamenti
          </a>

          <button className="btn" onClick={() => goto(-7)}>
            ← Settimana prec
          </button>
          <button
            className="btn"
            onClick={() => {
              const now = startOfWeek(new Date(), { weekStartsOn: 1 })
              setWeekStart(now)
              router.push(`/admin/agenda?week=${format(now, 'yyyy-MM-dd')}`)
            }}
          >
            Oggi
          </button>
          <button className="btn" onClick={() => goto(+7)}>
            Settimana succ →
          </button>

          <div className="ml-3 font-medium text-white/90">{weekLabel}</div>
        </div>
      </div>

      {/* Griglia con contrasto migliorato */}
      <div className="overflow-auto">
        <div className="min-w-[980px]">
          <div className="grid" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
            <div className="p-2 text-xs uppercase tracking-wide text-white/70">Ora</div>
            {days.map((d, i) => (
              <div key={i} className="p-2 text-center font-medium text-white">
                {format(d, 'EEE dd/MM', { locale: it })}
              </div>
            ))}
          </div>

          {mins.map((m, rowIdx) => {
            const t = addMinutes(first, rowIdx * SLOT_MINUTES)
            const label = format(t, 'HH:mm')
            return (
              <div
                key={rowIdx}
                className="grid border-t border-white/10"
                style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}
              >
                <div className="p-2 text-sm text-white/80 bg-black/20">{label}</div>
                {days.map((day, colIdx) => {
                  const [hh, mm] = label.split(':').map(Number)
                  const slotStart = new Date(day)
                  slotStart.setHours(hh, mm, 0, 0)
                  const slotEnd = addMinutes(slotStart, SLOT_MINUTES)

                  // dentro apertura?
                  const windows = OPENING_HOURS[day.getDay()] || []
                  const inOpen =
                    windows.some((w) => {
                      const wStart = withTime(day, w.start)
                      const wEnd = withTime(day, w.end)
                      return (
                        (!isBefore(slotStart, wStart) && isBefore(slotEnd, wEnd)) ||
                        isEqual(slotEnd, wEnd)
                      )
                    }) || false
                  if (!inOpen) {
                    return (
                      <div
                        key={colIdx}
                        className="p-2 bg-black/30 border-l border-white/10"
                      />
                    )
                  }

                  // appuntamento sullo slot?
                  const appt = appts.find(
                    (a) =>
                      BLOCKING_STATUSES.has(a.status) &&
                      overlaps(
                        slotStart,
                        slotEnd,
                        parseISO(a.starts_at),
                        parseISO(a.ends_at),
                      ),
                  )

                  // Celle con contrasto più alto
                  if (appt) {
                    const customerName = appt.customers?.[0]?.full_name ?? 'Occupato'
                    const serviceName = appt.services?.[0]?.name ?? ''
                    const title = `${customerName} • ${serviceName} • ${format(
                      parseISO(appt.starts_at),
                      'HH:mm',
                    )}–${format(parseISO(appt.ends_at), 'HH:mm')}`

                    return (
                      <div
                        key={colIdx}
                        className="p-2 border-l border-white/10 bg-red-600/25 text-xs text-white"
                        title={title}
                      >
                        <div className="font-semibold truncate">{customerName}</div>
                        <div className="truncate text-white/90">{serviceName}</div>
                      </div>
                    )
                  }

                  // Slot libero (leggibile)
                  return (
                    <div
                      key={colIdx}
                      className="p-2 border-l border-white/10 bg-emerald-500/10 text-xs text-emerald-200"
                      title="Libero"
                    >
                      Libero
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Riepilogo appuntamenti (debug / accessibilità) */}
      <div className="card">
        <h3 className="text-base font-semibold mb-2 text-white">
          Appuntamenti (questa settimana)
        </h3>
        {appts.length === 0 ? (
          <p className="text-sm text-white/80">Nessun appuntamento.</p>
        ) : (
          <ul className="space-y-1 text-sm text-white/90">
            {appts.map((a) => {
              const customerName = a.customers?.[0]?.full_name ?? '—'
              const serviceName = a.services?.[0]?.name ?? '—'
              return (
                <li key={a.id}>
                  <strong>{customerName}</strong> • {serviceName} —{' '}
                  {new Date(a.starts_at).toLocaleString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                  {' → '}
                  {new Date(a.ends_at).toLocaleString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  • <em>{a.status}</em>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
