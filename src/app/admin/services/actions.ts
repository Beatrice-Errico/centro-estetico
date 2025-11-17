'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '../../../lib/supabaseClient'

export async function addService(formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim() || ''
  const duration_minutes = Number(formData.get('duration_minutes') ?? 0)
  const price = Number(formData.get('price') ?? 0)
  const price_cents = Math.round(price * 100)
  const category = (formData.get('category') as string | null)?.trim().toLowerCase() as
    | 'benessere' | 'bellezza' | 'vitalita' | null

  if (!name) throw new Error('Il nome è obbligatorio')
  if (!Number.isFinite(duration_minutes) || duration_minutes <= 0) throw new Error('Durata non valida')
  if (!Number.isFinite(price) || price < 0) throw new Error('Prezzo non valido')

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('services')
    .insert({
      name,
      duration_minutes,
      price_cents,
      active: true,
      category: category ?? 'benessere', // default coerente col DB
    })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
}
export async function deleteServiceAction(formData: FormData) {
  'use server'

  const id = formData.get('id') as string | null
  if (!id) return

  const supabase = createServiceRoleClient()

  await supabase
    .from('services')
    .delete()
    .eq('id', id)
}
