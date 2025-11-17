'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '../lib/supabaseClient'
import LaserHeading from './LaserHeading'

type Service = {
  id: string
  name: string
  duration_minutes: number
  price_cents: number
}

export default function ListinoLive() {
  const supabase = createClient()
  const [q, setQ] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce input (300ms)
  const debouncedQ = useMemo(() => q.trim(), [q])
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('services')
        .select('id,name,duration_minutes,price_cents')
        .eq('active', true)
        .order('name', { ascending: true })

      if (debouncedQ) {
        query = query.ilike('name', `%${debouncedQ}%`)
      }

      const { data, error } = await query
      if (error) throw error
      setServices(data ?? [])
    } catch (e: any) {
      setError(e.message ?? 'Errore di caricamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // primo caricamento

  return (
    <div className="card mt-24">
      <LaserHeading>Listino Prezzi</LaserHeading>

      {/* Ricerca live */}
      <div className="mb-6 mt-6">
        <label htmlFor="q" className="sr-only">Cerca trattamento</label>
        <div className="flex gap-2">
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca un trattamento (es. massaggio, manicure, viso…)"
            className="input w-full text-base h-12"
          />
          <button
            type="button"
            className="btn h-12 px-6"
            onClick={load}
            disabled={loading}
          >
            {loading ? 'Carico…' : 'Cerca'}
          </button>
        </div>
        {q && (
          <p className="text-silver-400 text-xs mt-2">
            Risultati per: <span className="text-silver-100">“{q}”</span>
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">Errore: {error}</p>}

      {loading && services.length === 0 ? (
        <p className="text-sm text-silver-400">Caricamento…</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-silver-400">Nessun servizio trovato.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="th">Servizio</th>
              <th className="th">Durata</th>
              <th className="th">Prezzo</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="tr">
                <td className="td">{s.name}</td>
                <td className="td">{s.duration_minutes} min</td>
                <td className="td">€ {(s.price_cents / 100).toFixed(2)}</td>
                <td className="td text-right">
                  <a
                    href={`/booking?serviceId=${encodeURIComponent(s.id)}`}
                    className="btn"
                    title="Prenota questo servizio"
                  >
                    Prenota
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-6 flex gap-3 justify-end">
        <a className="btn inline-block" href="/booking">
          Prenota ora
        </a>
      </div>
    </div>
  )
}
