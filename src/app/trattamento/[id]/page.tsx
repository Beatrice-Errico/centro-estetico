// src/app/trattamento/[id]/page.tsx
import { createServiceRoleClient } from '../../../lib/supabaseClient'
import LaserHeading from '../../../components/LaserHeading'
import Link from 'next/link'
import Image from 'next/image'

type Service = {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price_cents: number
  image_url: string | null
  categories?: { name: string; slug: string } | null
}

export const dynamic = 'force-dynamic'

export default async function TreatmentDetail({ params }: { params: { id: string } }) {
  const supabase = createServiceRoleClient()

  const { data: s, error } = await supabase
    .from('services')
    .select('id,name,description,duration_minutes,price_cents,image_url,categories(name,slug)')
    .eq('id', params.id)
    .maybeSingle<Service>()

  if (error) throw new Error(error.message)
  if (!s) {
    return (
      <div className="card mt-24">
        <h1 className="text-xl font-semibold text-silver-100">Trattamento non trovato</h1>
        <div className="mt-4">
          <Link href="/" className="btn">Torna alla Home</Link>
        </div>
      </div>
    )
  }

  const price = (s.price_cents / 100).toFixed(2)

  return (
    <div className="container mt-24">
      <div className="flex items-center justify-between mb-6">
        <LaserHeading>{s.name}</LaserHeading>
        <Link href="/" className="btn-ghost">← Home</Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        
<div className="bg-night-800 border border-night-700">
  <div className="relative w-full h-[320px] md:h-[420px]">
    <Image
      src={s.image_url || '/placeholder-treatment.jpg'}
      alt={s.name}
      fill
      className="object-cover"
      sizes="(min-width:1024px) 50vw, 100vw"
      priority
    />
  </div>
</div>

        <div className="card space-y-4">
          {s.categories?.name && (
            <p className="text-silver-400 text-sm">
              Categoria:{' '}
              <Link href={`/categoria/${s.categories.slug}`} className="underline underline-offset-4">
                <span className="text-silver-100">{s.categories.name}</span>
              </Link>
            </p>
          )}

          <p className="text-silver-100 text-lg">
            Durata: <span className="text-silver-300">{s.duration_minutes} minuti</span>
          </p>

          <p className="text-silver-100 text-lg">
            Prezzo: <span className="text-silver-300">€ {price}</span>
          </p>

          {s.description && (
            <div className="pt-2 text-silver-300 leading-relaxed whitespace-pre-line">
              {s.description}
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <a href={`/booking?serviceId=${encodeURIComponent(s.id)}`} className="btn">Prenota subito</a>
            <a href="/listino" className="btn-ghost">Vedi tutto il listino</a>
          </div>
        </div>
      </div>
    </div>
  )
}
