'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
  startOfDay,
} from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Service = { id: string; name: string; duration_minutes: number }

const SLOT_MIN = 30
const OPEN: Record<number, { start: string; end: string }[]> = {
  0: [],
  1: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
  2: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
  3: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
  4: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
  5: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '19:00' }],
  6: [{ start: '09:00', end: '13:00' }],
}

function hhmm(d: Date) {
  return format(d, 'HH:mm')
}

function parseHM(date: Date, hm: string) {
  const [h, m] = hm.split(':').map(Number)
  const clone = new Date(date)
  clone.setHours(h, m, 0, 0)
  return clone
}

type BookingWizardProps = {
  services: Service[]
  /** ID del servizio pre-selezionato, es. da /booking?serviceId=... */
  initialServiceId?: string
}

export default function BookingWizard({ services, initialServiceId }: BookingWizardProps) {
  const router = useRouter()

  // form fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // servizio scelto
  const [serviceId, setServiceId] = useState<string>(initialServiceId ?? '')
  const service = services.find((s) => s.id === serviceId) || null

  // sincronizza se cambia initialServiceId
  useEffect(() => {
    if (!initialServiceId) return
    const exists = services.some((s) => s.id === initialServiceId)
    if (exists) setServiceId(initialServiceId)
  }, [initialServiceId, services])

  // calendario
  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()))
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const todayStart = startOfDay(new Date())

  // orari
  const [busy, setBusy] = useState<{ starts_at: string; ends_at: string }[]>([])
  const [loadingBusy, setLoadingBusy] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string>('') // HH:mm

  // range “pieno” del calendario (da lunedì a domenica)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  // back "intelligente"
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  // quando scelgo servizio o giorno → ricarico disponibilità
  useEffect(() => {
    async function load() {
      setBusy([])
      setSelectedTime('')
      if (!selectedDay) return
      setLoadingBusy(true)
      try {
        const date = format(selectedDay, 'yyyy-MM-dd')
        const q = new URLSearchParams({ date })
        if (serviceId) q.set('serviceId', serviceId)
        const res = await fetch(`/api/availability?${q.toString()}`, { cache: 'no-store' })
        const json = await res.json()
        if (res.ok) setBusy(json.busy ?? [])
      } finally {
        setLoadingBusy(false)
      }
    }
    load()
  }, [selectedDay, serviceId])

  // costruisci lista slots per il giorno selezionato, solo quelli prenotabili
  const slots = useMemo(() => {
    if (!selectedDay || !service) return []
    const day = selectedDay
    const windows = OPEN[day.getDay()] || []
    if (windows.length === 0) return []

    const duration = service.duration_minutes
    const out: { label: string }[] = []

    const now = new Date()
    const isTodayDate =
      day.getFullYear() === now.getFullYear() &&
      day.getMonth() === now.getMonth() &&
      day.getDate() === now.getDate()

    for (const w of windows) {
      let t = parseHM(day, w.start)
      const wEnd = parseHM(day, w.end)

      while (t < wEnd) {
        const endCandidate = new Date(t.getTime() + duration * 60000)

        // deve stare interamente nella finestra
        const fitsWindow = endCandidate <= wEnd

        // niente overlap con busy
        const startISO = t.toISOString()
        const endISO = endCandidate.toISOString()
        const overlapsBusy = busy.some(
          (b) => !(endISO <= b.starts_at || startISO >= b.ends_at),
        )

        // se oggi, non mostrare slot nel passato
        const inPast = isTodayDate && t.getTime() <= now.getTime()

        const bookable = fitsWindow && !overlapsBusy && !inPast
        if (bookable) {
          out.push({ label: hhmm(t) })
        }

        t = new Date(t.getTime() + SLOT_MIN * 60000)
      }
    }
    return out
  }, [selectedDay, service, busy])

  // helper per submit: riempie hidden inputs del form "padre"
  useEffect(() => {
    const form = document.getElementById('booking-form') as HTMLFormElement | null
    if (!form) return
    const set = (name: string, val: string) => {
      let input = form.querySelector<HTMLInputElement>(`input[name="${name}"]`)
      if (!input) {
        input = document.createElement('input')
        input.type = 'hidden'
        input.name = name
        form.appendChild(input)
      }
      input.value = val
    }
    set('full_name', fullName)
    set('phone', phone)
    set('email', email)
    set('service_id', serviceId)

    if (selectedDay && selectedTime && service) {
      const startLocal = parseHM(selectedDay, selectedTime)
      const endLocal = new Date(startLocal.getTime() + service.duration_minutes * 60000)
      set('starts_at', startLocal.toISOString())
      set('ends_at', endLocal.toISOString())
    } else {
      set('starts_at', '')
      set('ends_at', '')
    }
  }, [fullName, phone, email, serviceId, selectedDay, selectedTime, service])

  const canSubmit = !!fullName && !!service && !!selectedDay && !!selectedTime

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 py-8">
      <div className="min-h-[70vh] space-y-6">
        {/* top bar: indietro + info servizio */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-silver-300 hover:text-silver-100 underline underline-offset-4 text-sm"
          >
            <span>←</span>
            <span>Torna alla pagina precedente</span>
          </button>
          {service && (
            <div className="text-xs md:text-sm text-silver-400">
              Stai prenotando:{' '}
              <span className="text-silver-100 font-medium">{service.name}</span>
            </div>
          )}
        </div>

        {/* layout 2 colonne compatto */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] items-start">
          {/* Colonna sinistra: dati + calendario */}
          <div className="card space-y-5">
            {/* Dati personali */}
            <div>
              <h2 className="text-sm font-semibold text-silver-100 tracking-wide2 uppercase">
                I tuoi dati
              </h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="label">Nome e cognome</label>
                  <input
                    className="input h-9 text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Come comparirà in agenda"
                  />
                </div>
                <div>
                  <label className="label">Telefono</label>
                  <input
                    className="input h-9 text-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Opzionale"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input h-9 text-sm"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Per conferma prenotazione"
                  />
                </div>
              </div>
            </div>

            {/* Trattamento */}
            <div>
              <h2 className="text-sm font-semibold text-silver-100 tracking-wide2 uppercase">
                Trattamento
              </h2>
              <select
                className="input mt-2 h-9 text-sm"
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value)
                  setSelectedTime('')
                }}
              >
                <option value="">Seleziona…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration_minutes} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Calendario mensile */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-silver-100 tracking-wide2 uppercase">
                  Data
                </h2>
                <div className="flex gap-1 items-center">
                  <button
                    type="button"
                    className="btn-ghost px-2 py-1 text-xs"
                    onClick={() => setMonthStart(addMonths(monthStart, -1))}
                  >
                    ‹
                  </button>
                  <div className="text-xs text-silver-300 mx-1">
                    {format(monthStart, 'LLLL yyyy', { locale: it })}
                  </div>
                  <button
                    type="button"
                    className="btn-ghost px-2 py-1 text-xs"
                    onClick={() => setMonthStart(addMonths(monthStart, +1))}
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-[11px] text-silver-400 mb-2">
                {['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {days.map((d) => {
                  const isOutside = d.getMonth() !== monthStart.getMonth()
                  const isClosed = (OPEN[d.getDay()] || []).length === 0
                  const isPastDay = d < todayStart
                  const disabled = isOutside || isClosed || isPastDay
                  const active = selectedDay && isSameDay(d, selectedDay)

                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => !disabled && setSelectedDay(d)}
                      className={[
                        'h-8 md:h-9 border text-xs',
                        'border-night-700',
                        active
                          ? 'bg-brand-500 text-white'
                          : 'bg-night-900 text-silver-200 hover:bg-night-800',
                        disabled ? 'opacity-35 cursor-not-allowed' : '',
                        isToday(d) && !active
                          ? 'outline outline-1 outline-silver-400/30'
                          : '',
                      ].join(' ')}
                      title={format(d, 'd LLLL yyyy', { locale: it })}
                    >
                      {format(d, 'd', { locale: it })}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Colonna destra: orari del giorno */}
          <div className="card">
            <h2 className="text-sm font-semibold text-silver-100 tracking-wide2 uppercase">
              Orari disponibili
            </h2>
            {!service && (
              <p className="text-xs text-silver-400 mt-2">
                Seleziona prima un trattamento per vedere gli orari.
              </p>
            )}
            {service && !selectedDay && (
              <p className="text-xs text-silver-400 mt-2">
                Seleziona un giorno dal calendario per vedere gli slot liberi.
              </p>
            )}

            {service && selectedDay && (
              <div className="mt-3 max-h-[360px] overflow-y-auto space-y-1 pr-1">
                {loadingBusy && (
                  <div className="text-xs text-silver-400">Caricamento orari…</div>
                )}
                {slots.length === 0 && !loadingBusy && (
                  <div className="text-xs text-silver-400">
                    Nessun orario disponibile per questa giornata.
                  </div>
                )}

                {slots.map((s) => {
                  const isActive = selectedTime === s.label
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSelectedTime(s.label)}
                      className={[
                        'slot-button',
                        'w-full h-11 px-4 border text-sm text-left flex items-center justify-between',
                        isActive
                          ? 'slot-button--active bg-[#f3b38a] text-night-900 border-[#f9ba78]'
                          : 'bg-night-900/80 text-silver-100 border-night-700 hover:bg-night-800',
                      ].join(' ')}
                    >
                      <span>{s.label}</span>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-5">
              <button className="btn w-full h-11 text-sm" type="submit" disabled={!canSubmit}>
                Conferma richiesta di prenotazione
              </button>
              {!canSubmit && (
                <p className="text-[11px] text-silver-400 mt-2">
                  Compila i dati, seleziona trattamento, giorno e orario.
                </p>
              )}
            </div>

            <p className="text-[11px] text-silver-500 pt-1">
              La richiesta verrà confermata dal centro estetico. Riceverai una conferma via telefono o email.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Link href="/listino" className="text-xs text-silver-400 hover:text-silver-100 underline">
            Vuoi rivedere il listino prima di confermare?
          </Link>
        </div>
      </div>
    </div>
  )
}
