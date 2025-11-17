'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '../../../lib/supabaseClient'

/** Crea un appuntamento (admin) */
export async function addAppointment(formData: FormData) {
  const customer_id = (formData.get('customer_id') as string | null)?.trim() || ''
  const service_id  = (formData.get('service_id')  as string | null)?.trim() || ''
  const starts_at_s = (formData.get('starts_at')   as string | null)?.trim() || ''
  const ends_at_s   = (formData.get('ends_at')     as string | null)?.trim() || ''

  if (!customer_id || !service_id || !starts_at_s || !ends_at_s) {
    throw new Error('Compila tutti i campi.')
  }

  const starts_at = new Date(starts_at_s)
  const ends_at   = new Date(ends_at_s)
  if (!isFinite(starts_at.getTime()) || !isFinite(ends_at.getTime())) {
    throw new Error('Date/ore non valide.')
  }
  if (ends_at <= starts_at) {
    throw new Error("L'orario di fine deve essere successivo all'inizio.")
  }

  const supabase = createServiceRoleClient()

  // Overlap base su stati bloccanti
  const { data: conflicts, error: confErr } = await supabase
    .from('appointments')
    .select('id')
    .in('status', ['booked', 'confirmed', 'done'])
    .lt('starts_at', ends_at.toISOString())
    .gt('ends_at', starts_at.toISOString())

  if (confErr) throw new Error(confErr.message)
  if ((conflicts ?? []).length > 0) {
    throw new Error('Esiste già un appuntamento sovrapposto in quell’orario.')
  }

  const { error } = await supabase.from('appointments').insert({
    customer_id,
    service_id,
    starts_at: starts_at.toISOString(),
    ends_at: ends_at.toISOString(),
    status: 'booked',
  })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/appointments')
  revalidatePath('/admin/agenda')
}

/** Annulla appuntamento (via FormData hidden id) */
export async function cancelAppointmentAction(formData: FormData) {
  const id = (formData.get('id') as string | null)?.trim() || ''
  if (!id) throw new Error('ID mancante')

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/appointments')
  revalidatePath('/admin/agenda')
}

/** (Compat) se vuoi ancora chiamarla passando direttamente l’ID */
export async function cancelAppointment(id: string) {
  if (!id) throw new Error('ID mancante')
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/appointments')
  revalidatePath('/admin/agenda')
}
