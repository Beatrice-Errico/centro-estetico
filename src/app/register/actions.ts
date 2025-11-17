'use server'

import { redirect } from 'next/navigation'
import { createServiceRoleClient } from '../../lib/supabaseClient'

export async function registerStaff(formData: FormData) {
  const code = String(formData.get('code') || '').trim()
  if (!process.env.STAFF_INVITE_CODE || code !== process.env.STAFF_INVITE_CODE) {
    throw new Error('Codice invito non valido')
  }

  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const full_name = String(formData.get('full_name') || '').trim()

  if (!email || !password || !full_name) {
    throw new Error('Compila tutti i campi')
  }

  const supabase = createServiceRoleClient()

  // 1) Crea utente Auth con email confermata (Admin API → richiede service role)
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })
  if (createErr) throw new Error(createErr.message)
  const userId = created.user?.id
  if (!userId) throw new Error('Creazione utente fallita')

  // 2) Crea il profilo staff
  const { error: profErr } = await supabase
    .from('profiles')
    .insert({ id: userId, full_name, role: 'staff' })
  if (profErr) throw new Error(profErr.message)

  // 3) Torna al login con flag
  redirect('/login?registered=1')
}
