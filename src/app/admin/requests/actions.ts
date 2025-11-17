'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '../../../lib/supabaseClient'

/** APPROVA: crea appuntamento (eventuale cliente), poi segna la richiesta approved */
export async function approveRequestAction(formData: FormData) {
  const id = String(formData.get('id') || '')
  if (!id) throw new Error('ID richiesta mancante')

  const supabase = createServiceRoleClient()

  // 1) prendi la richiesta
  const { data: req, error: reqErr } = await supabase
    .from('booking_requests')
    .select('id, full_name, phone, email, service_id, requested_start, requested_end, status')
    .eq('id', id)
    .single()
  if (reqErr) throw new Error(reqErr.message)
  if (!req) throw new Error('Richiesta non trovata')
  if (req.status !== 'pending') throw new Error('Richiesta già gestita')

  // 2) trova/crea cliente
  let customer_id: string | null = null
  const email = (req.email || '').trim()
  const phone = (req.phone || '').trim()

  if (email) {
    const { data } = await supabase.from('customers').select('id').eq('email', email).maybeSingle()
    if (data?.id) customer_id = data.id
  }
  if (!customer_id && phone) {
    const { data } = await supabase.from('customers').select('id').eq('phone', phone).maybeSingle()
    if (data?.id) customer_id = data.id
  }
  if (!customer_id && (req.full_name?.trim() || email || phone)) {
    const { data, error } = await supabase
      .from('customers')
      .insert({ full_name: req.full_name || 'Cliente', email: email || null, phone: phone || null })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    customer_id = data.id
  }

  // 3) crea appuntamento
  const { error: apptErr } = await supabase.from('appointments').insert({
    customer_id,
    service_id: req.service_id,
    starts_at: req.requested_start,
    ends_at: req.requested_end,
    status: 'booked',
  })
  if (apptErr) throw new Error(apptErr.message)

  // 4) aggiorna richiesta → approved
  const { error: updErr } = await supabase
    .from('booking_requests')
    .update({ status: 'approved' })
    .eq('id', id)
  if (updErr) throw new Error(updErr.message)

  // 5) refresh pagina richieste
  revalidatePath('/admin/requests')
}

/** RIFIUTA: solo update di stato */
export async function rejectRequestAction(formData: FormData) {
  const id = String(formData.get('id') || '')
  if (!id) throw new Error('ID richiesta mancante')

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('booking_requests')
    .update({ status: 'rejected' })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/requests')
}
