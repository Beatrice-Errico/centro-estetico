// src/app/categoria/[slug]/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { createServiceRoleClient } from '../../../lib/supabaseClient'

export const dynamic = 'force-dynamic'

type Category = { id: string; slug: string; name: string }
type Service = {
  id: string
  name: string
  duration_minutes: number
  price_cents: number
  image_url: string | null
  description: string | null
}

const CATS_UI = {
  benessere: {
    title: 'Benessere & Relax',
    desc: 'Massaggi e rituali per ritrovare equilibrio e armonia. Un’esperienza sensoriale di totale distensione.',
    img: '/macro-relax.jpg',
    accent: 'from-amber-600/30 to-amber-800/60',
  },
  bellezza: {
    title: 'Cura & Bellezza',
    desc: 'Trattamenti viso e corpo per una bellezza autentica, naturale e luminosa. Dedicato a chi ama prendersi cura di sé.',
    img: '/macro-bellezza.jpg',
    accent: 'from-rose-400/30 to-rose-700/60',
  },
  vitalita: {
    title: 'Forma & Vitalità',
    desc: 'Tecnologie avanzate per tonificare, rimodellare e riscoprire energia e fiducia in sé stessi.',
    img: '/macro-vitalita.jpg',
    accent: 'from-lime-500/25 to-emerald-700/60',
  },
} as const

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const slug = (params.slug ?? '').toLowerCase() as keyof typeof CATS_UI
  const ui = CATS_UI[slug]

  if (!ui) {
    return (
      <div className="card text-center py-16 mt-24">
        <h1 className="text-2xl text-silver-100">Categoria non trovata</h1>
        <p className="text-silver-400 mt-2">La categoria richiesta non esiste o è stata rimossa.</p>
        <Link href="/listino" className="btn mt-4">Vai al listino</Link>
      </div>
    )
  }

  const supabase = createServiceRoleClient()

  // 1) prendi la categoria dal DB
  const { data: cat, error: catErr } = await supabase
    .from<Category>('categories')
    .select('id, slug, name')
    .eq('slug', slug)
    .maybeSingle()
  if (catErr) throw new Error(catErr.message)
  if (!cat) {
    return (
      <div className="card text-center py-16 mt-24">
        <h1 className="text-2xl text-silver-100">Categoria non configurata</h1>
        <p className="text-silver-400 mt-2">
          Aggiungila nella tabella <code>categories</code>.
        </p>
        <Link href="/listino" className="btn mt-4">Vai al listino</Link>
      </div>
    )
  }

  // 2) servizi collegati via FK
  const { data: svc, error: svcErr } = await supabase
    .from<Service>('services')
    .select('id, name, duration_minutes, price_cents, image_url, description')
    .eq('category_id', cat.id)
    .eq('active', true)
    .order('name', { ascending: true })
  if (svcErr) throw new Error(svcErr.message)
  const services = (svc ?? []) as Service[]

  return (
    <div className="min-h-screen">
      {/* Hero immagine */}
      <section className="relative h-[60vh] w-full overflow-hidden isolate">
        <Image
          src={ui.img}
          alt={ui.title}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${ui.accent} to-black/70`} />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-light text-silver-100 tracking-wide2">
              {ui.title}
            </h1>
            <p className="mt-3 text-silver-300 leading-relaxed">{ui.desc}</p>
          </div>
        </div>
      </section>

      {/* Lista servizi */}
      <section className="container py-16">
        {services.length === 0 ? (
          <p className="text-silver-400">Nessun servizio disponibile per questa categoria.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {services.map((s) => (
              <div
                key={s.id}
                className="group relative overflow-hidden
                           border border-[#b58963]/60 bg-[#1a1410]/90
                           p-3 sm:p-4
                           hover:border-[#f3c89a]/90 hover:bg-[#241711]
                           transition-colors duration-300"
              >
                {/* barra “wow” in alto, marrone/oro */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px]
                             bg-gradient-to-r from-[#f3c89a] via-[#ffe1bb] to-[#f3c89a]
                             opacity-0 scale-x-0 origin-center
                             transition-all duration-500
                             group-hover:opacity-100 group-hover:scale-x-100"
                />

                {/* immagine */}
                <div className="mb-3 aspect-[4/3] bg-night-900 overflow-hidden">
                  <img
                    src={s.image_url || '/placeholder-treatment.jpg'}
                    alt={s.name}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* testo */}
                <h3 className="text-silver-100 text-base sm:text-lg font-medium">{s.name}</h3>

                <p className="text-silver-400 text-xs sm:text-sm mt-1">
                  {s.duration_minutes} min
                </p>

                {/* {s.description && (
                  <p className="text-silver-300 text-xs sm:text-sm mt-2 line-clamp-3">
                    {s.description}
                  </p>
                )} */}

                <p className="text-silver-200 mt-3 font-semibold text-sm sm:text-base">
                  € {(s.price_cents / 100).toFixed(2)}
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link href={`/trattamento/${s.id}`} className="btn-ghost">
                    Dettagli
                  </Link>
                  <Link
                    href={`/booking?serviceId=${encodeURIComponent(s.id)}`}
                    className="btn"
                  >
                    Prenota
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/listino"
            className="inline-flex items-center px-6 h-11 border border-silver-300/40 text-silver-100 hover:bg:white/10 transition-colors"
          >
            Vai al listino completo
          </Link>
        </div>
      </section>
    </div>
  )
}
