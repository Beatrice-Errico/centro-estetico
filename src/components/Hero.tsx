'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function Hero() {
  const headerWrapRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  // Scroll dolce verso la sezione successiva
  function scrollDown() {
    const next = document.getElementById('after-hero')
    if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Observer che farà scattare la classe visibile (per futuri effetti, se vuoi usarlo)
  useEffect(() => {
    const el = headerWrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  

  return (
    <section className="relative min-h-screen w-full isolate overflow-hidden">
      {/* Background image full-bleed */}
      <div className="absolute inset-0 grid grid-cols-3 group">
        {/* sinistra */}
        <div className="relative overflow-hidden">
          <Image
            src="/hero-1.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center transition-transform duration-[2000ms] ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* centro */}
        <div className="relative overflow-hidden">
          <Image
            src="/hero-2.jpg"
            alt=""
            fill
            className="object-cover object-center transition-transform duration-[2000ms] ease-out group-hover:scale-[1.05]"
          />
        </div>

        {/* destra */}
        <div className="relative overflow-hidden">
          <Image
            src="/hero-3.jpg"
            alt=""
            fill
            className="object-cover object-center transition-transform duration-[2000ms] ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      {/* Overlay radiale + verticale */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 60% at 50% 35%, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 65%, rgba(0,0,0,.55) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/65" />
      </div>

      {/* Fade di aggancio in fondo */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-night-900" />

      {/* Titolo + descrizione */}
      <div className="relative z-10 h-full flex items-center">
        <div
          ref={headerWrapRef}
          className={`w-full px-6 max-w-6xl mx-auto translate-y-10 md:translate-y-16 text-center md:text-left md:pl-[6%] ${
            visible ? 'opacity-100 translate-y-0 transition-all duration-700' : 'opacity-0'
          }`}
        >
          <h1
            className="text-silver-100 font-light tracking-[0.08em]
                       text-[clamp(28px,4.5vw,56px)] leading-[1.05]"
          >
            Cura, eleganza, risultati.
          </h1>

          <p
            className="mt-3 max-w-xl text-silver-300/90
                       text-[clamp(14px,1.6vw,18px)] leading-relaxed tracking-[0.04em]"
          >
            Trattamenti professionali per il tuo benessere.
          </p>
        </div>
      </div>

      {/* CTA in basso */}
      <div className="absolute left-0 right-0 bottom-16 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center h-11 px-6
               bg-[#b58963] text-white font-medium tracking-[0.06em]
               border border-[#b58963]
               hover:bg-transparent hover:text-[#f3c89a]
               focus:outline-none focus:ring-0 active:opacity-90 select-none
               transition-colors duration-200"
            >
              Prenota ora   
            </Link>
            <Link
              href="/listino"
              className="inline-flex items-center justify-center h-11 px-6
               bg-transparent text-[#f3c89a] font-medium tracking-[0.06em]
               border border-[#b58963]
               hover:bg-[#b58963]/10
               focus:outline-none focus:ring-0 select-none
               transition-colors duration-200"
            >
              Vedi listino
            </Link>
          </div>
        </div>
      </div>

      {/* Hint di scroll minimale */}
      <button
        aria-label="Scorri giù"
        onClick={scrollDown}
        className="group absolute bottom-6 left-1/2 -translate-x-1/2 z-10
                   inline-flex flex-col items-center text-silver-300/80 hover:text-silver-100"
      >
        <span className="h-6 w-px bg-silver-300/40 group-hover:bg-silver-100 transition-colors" />
        <svg
          className="mt-1 h-5 w-5 animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  )
}
