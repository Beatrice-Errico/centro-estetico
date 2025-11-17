'use server'

import { redirect } from 'next/navigation'
import { createServiceRoleClient } from '../../lib/supabaseClient'

export async function createBooking(formData: FormData) {
  const full_name = String(formData.get('full_name') || '').trim()
  const phone = String(formData.get('phone') || '').trim() || null
  const email = String(formData.get('email') || '').trim() || null
  const service_id = String(formData.get('service_id') || '')
  const starts_at_str = String(formData.get('starts_at') || '')
  const ends_at_str = String(formData.get('ends_at') || '')
  const note = String(formData.get('note') || '').trim() || null

  if (!full_name) throw new Error('Nome e cognome obbligatori')
  if (!service_id) throw new Error('Seleziona un servizio')

  const starts_at = new Date(starts_at_str)
  const ends_at = new Date(ends_at_str)
  if (isNaN(starts_at.getTime()) || isNaN(ends_at.getTime())) {
    throw new Error('Date non valide')
  }
  if (ends_at <= starts_at) {
    throw new Error("L'orario di fine deve essere successivo all'inizio")
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from('booking_requests').insert({
    full_name,
    phone,
    email,
    service_id,
    requested_start: starts_at.toISOString(),
    requested_end: ends_at.toISOString(),
    note,
  })
  if (error) throw new Error(error.message)

  // Dopo l'invio, vai a una pagina di successo
  redirect('/booking/success')
}
