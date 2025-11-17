// src/app/booking/page.tsx
import { createServiceRoleClient } from '../../lib/supabaseClient'
import { createBooking } from './actions'
import BookingWizard from './BookingWizard'

export const dynamic = 'force-dynamic'

type Service = {
  id: string
  name: string
  duration_minutes: number
}

type BookingPageProps = {
  searchParams?: Promise<{
    serviceId?: string
  }>
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('services')
    .select('id,name,duration_minutes')
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)

  const services: Service[] = data ?? []

  // Next in questa versione ti passa searchParams come Promise,
  // quindi li "risolviamo" qui
  const resolvedSearchParams = (await searchParams) ?? {}
  const initialServiceId = (resolvedSearchParams.serviceId ?? '').toString()

  return (
    <div className="min-h-screen bg-night-900">
      <form
        id="booking-form"
        action={createBooking}
        className="max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-10"
      >
        <BookingWizard services={services} initialServiceId={initialServiceId} />
      </form>
    </div>
  )
}
