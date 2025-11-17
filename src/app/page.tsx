'use client'

import Image from 'next/image'
import Hero from '../components/Hero'
import LaserHeading from '../components/LaserHeading'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const categories = [
    {
      title: 'Benessere & Relax',
      desc: 'Massaggi, rituali corpo e percorsi sensoriali per riequilibrare corpo e mente.',
      img: '/macro-relax.jpg',
      accent: 'from-amber-600/30 to-amber-800/60',
      href: '/categoria/benessere',
    },
    {
      title: 'Cura & Bellezza',
      desc: 'Trattamenti viso, mani e corpo per una bellezza naturale e luminosa.',
      img: '/macro-bellezza.jpg',
      accent: 'from-rose-400/30 to-rose-700/60',
      href: '/categoria/bellezza',
    },
    {
      title: 'Forma & Vitalità',
      desc: 'Tecnologie avanzate per tonificare, rimodellare e riscoprire energia e fiducia.',
      img: '/macro-vitalita.jpg',
      accent: 'from-lime-500/25 to-emerald-700/60',
      href: '/categoria/vitalita',
    },
  ]

  return (
    <main>
      <Hero />

      <section id="after-hero" className="relative bg-night-900 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          {/* Titolo introduttivo con effetto laser */}
          <header className="space-y-3">
            <LaserHeading>Scopri i nostri trattamenti</LaserHeading>
            <p className="max-w-2xl mx-auto text-silver-400 text-[clamp(14px,1.5vw,17px)] leading-relaxed">
              Dalla cura del viso al benessere del corpo, fino alle più raffinate tecniche di estetica avanzata.
            </p>
          </header>

          {/* Le tre categorie principali */}
          <div className="grid grid-cols-3 gap-6 max-md:grid-cols-3 max-md:gap-3">
            {categories.map((cat, idx) => (
              <a
                key={cat.title}
                href={cat.href}
                className="relative group overflow-hidden shadow-flat focus:outline-none focus-visible:ring-2 focus-visible:ring-silver-300/40"
              >
                {/* immagine con next/image, caricata in anticipo */}
                <div className="relative w-full h-44 sm:h-64 md:h-80">
                  <Image
                    src={cat.img}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 33vw, 33vw"
                    priority  // queste tre sono importantissime per la first impression
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${cat.accent} opacity-60 group-hover:opacity-40 transition-opacity`}
                  />
                </div>

                {/* testo */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-silver-100 text-xs sm:text-base md:text-lg font-medium">
                      {cat.title}
                    </h3>
                    {/* su mobile solo titolo + CTA, niente testo lungo */}
                    <p className="hidden sm:block text-silver-300 text-sm mt-1 max-w-xs mx-auto">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center px-3 h-8 sm:h-9 border border-silver-300/40 text-[11px] sm:text-sm text-silver-100 tracking-wide2 hover:bg-white/10">
                      Esplora
                      <svg
                        className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
