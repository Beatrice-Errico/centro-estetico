'use server'

import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '../../../lib/supabaseClient'

/** Crea un cliente (usare in <form action={addCustomer}>) */
export async function addCustomer(formData: FormData) {
  const full_name = (formData.get('full_name') as string | null)?.trim() || ''
  const phone     = (formData.get('phone') as string | null)?.trim() || null
  const email     = (formData.get('email') as string | null)?.trim() || null

  if (!full_name) throw new Error('Nome e cognome obbligatori')

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('customers')
    .insert({ full_name, phone, email })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // ricarica la lista clienti
  revalidatePath('/admin/customers')
  return { id: data?.id }
}

/** Cancella un cliente (usare in <form action={deleteCustomerAction}>) */
export async function deleteCustomerAction(formData: FormData) {
  const id = (formData.get('id') as string | null)?.trim() || ''
  if (!id) throw new Error('ID cliente mancante')

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/customers')
}

/** (facoltativa) Variante a ID diretto, se NON usi <form> */
export async function deleteCustomerById(id: string) {
  if (!id) throw new Error('ID cliente mancante')
  const supabase = createServiceRoleClient()
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/customers')
}
