import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '../../../lib/supabaseClient'

// stessi status "bloccanti" dell'agenda
const BLOCKING = ['booked', 'confirmed', 'done'] as const

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') // YYYY-MM-DD (locale Rome)
  const serviceId = searchParams.get('serviceId') // opzionale (per durate diverse)

  if (!date) {
    return NextResponse.json({ error: 'Missing date' }, { status: 400 })
  }

  // finestra [00:00, 24:00) di quel giorno in Europa/Roma → convertiamo in UTC ISO
  const dayStartLocal = new Date(`${date}T00:00:00+02:00`) // l’offset reale varierà con DST, ma per UX basta
  const dayEndLocal = new Date(`${date}T23:59:59+02:00`)
  const from = new Date(dayStartLocal).toISOString()
  const to = new Date(dayEndLocal).toISOString()

  const supabase = createServiceRoleClient()

  // appuntamenti che toccano il giorno (qualsiasi overlap)
  const { data, error } = await supabase
    .from('appointments')
    .select('starts_at, ends_at, status')
    .in('status', BLOCKING as any)
    .lt('starts_at', to)
    .gt('ends_at', from)
    .order('starts_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    busy: (data ?? []).map(a => ({
      starts_at: a.starts_at,
      ends_at: a.ends_at,
      status: a.status,
    })),
  })
}
