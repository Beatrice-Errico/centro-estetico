'use client'

import Link from 'next/link'

type Props = {
  id: string
  name: string
  description?: string | null
  duration_minutes: number
  price_cents: number
  image_url?: string | null
}

export default function TreatmentCard({
  id, name, description, duration_minutes, price_cents, image_url
}: Props) {
  const price = (price_cents / 100).toFixed(2)

  return (
    <article className="group bg-night-800 border border-night-700 shadow-flat overflow-hidden">
      {/* immagine */}
      <div className="relative">
        <img
          src={image_url || '/placeholder-treatment.jpg'}
          alt={name}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* chip tempo/prezzo */}
        <div className="absolute top-2 right-2 flex gap-2">
          <span className="px-2 py-1 text-xs bg-black/60 text-silver-100 border border-white/15">
            {duration_minutes} min
          </span>
          <span className="px-2 py-1 text-xs bg-black/60 text-silver-100 border border-white/15">
            € {price}
          </span>
        </div>
      </div>

      {/* testo */}
      <div className="p-4 space-y-3">
        <h3 className="text-silver-100 text-lg tracking-wide2">{name}</h3>
        {description && (
          <p className="text-silver-300 text-sm leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Link
            href={`/booking?serviceId=${encodeURIComponent(id)}`}
            className="btn"
            title="Prenota subito"
          >
            Prenota subito
          </Link>
          <Link
            href={`/trattamento/${encodeURIComponent(id)}`}
            className="btn-ghost"
            title="Dettagli trattamento"
          >
            Dettagli
          </Link>
        </div>
      </div>
    </article>
  )
}
