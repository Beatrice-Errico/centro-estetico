import Link from 'next/link'
import { createServiceRoleClient } from '../../../lib/supabaseClient'
import { approveRequestAction, rejectRequestAction } from './actions'
import FormatDate from '../../../components/FormatDate'

export const dynamic = 'force-dynamic'

type BookingRequest = {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  service_id: string
  requested_start: string
  requested_end: string
  note: string | null
  status: 'pending' | 'approved' | 'rejected'
  services?: { name: string } | null
}

export default async function AdminRequestsPage() {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('booking_requests')
    .select(
      'id, full_name, phone, email, service_id, requested_start, requested_end, note, status, services(name)'
    )
    .order('created_at', { ascending: false })
    .returns<BookingRequest[]>()

  if (error) throw new Error(error.message)

  const reqs: BookingRequest[] = data ?? []
  const pending = reqs.filter((r) => r.status === 'pending')
  const processed = reqs.filter((r) => r.status !== 'pending')

  return (
    <div className="min-h-screen px-6 py-8 space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href="/admin" className="btn-ghost">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-silver-100 tracking-wide">
          Richieste Clienti
        </h1>
        <div className="w-24" />{/* spacer */}
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-3">
        <span className="text-xs px-2.5 py-1 border border-pink-400/40 text-pink-300 bg-pink-500/10">
          {pending.length} in attesa
        </span>
        <span className="text-xs px-2.5 py-1 border border-silver-400/30 text-silver-300 bg-white/5">
          {processed.length} gestite
        </span>
        <span className="text-xs px-2.5 py-1 border border-white/10 text-silver-300 bg-white/5">
          {reqs.length} totali
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl">
        {/* In attesa */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-silver-100 tracking-wide">
              Richieste in attesa
            </h2>
            <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-300 border border-pink-500/40">
              {pending.length}
            </span>
          </div>

          {pending.length === 0 ? (
            <p className="text-sm text-silver-400">Nessuna richiesta in attesa.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((r) => (
                <li key={r.id} className="border border-white/10 rounded-none p-4 hover:bg-white/5 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm space-y-1">
                      <div className="font-medium text-silver-100">
                        {r.full_name ?? '—'} • {r.services?.name ?? '—'}
                      </div>
                      <div className="text-silver-400">
                        <FormatDate iso={r.requested_start} /> → <FormatDate iso={r.requested_end} />
                      </div>
                      <div className="text-silver-400">
                        {r.phone || '-'} {r.email ? `• ${r.email}` : ''}
                      </div>
                      {r.note && (
                        <div className="text-silver-300/90">
                          <span className="text-silver-400">Note:</span> {r.note}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <form action={approveRequestAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="btn" type="submit">Approva</button>
                      </form>
                      <form action={rejectRequestAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="btn-ghost" type="submit">Rifiuta</button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Gestite */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-silver-100 tracking-wide">
              Richieste gestite
            </h2>
            <span className="text-xs px-2 py-0.5 bg-silver-500/10 text-silver-300 border border-white/10">
              {processed.length}
            </span>
          </div>

          {processed.length === 0 ? (
            <p className="text-sm text-silver-400">Nessuna richiesta già gestita.</p>
          ) : (
            <ul className="space-y-3">
              {processed.map((r) => (
                <li key={r.id} className="border border-white/10 rounded-none p-4 hover:bg-white/5 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm">
                      <div className="font-medium text-silver-100">
                        {r.full_name ?? '—'} • {r.services?.name ?? '—'} • {r.status}
                      </div>
                      <div className="text-silver-400">
                        <FormatDate iso={r.requested_start} /> → <FormatDate iso={r.requested_end} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
