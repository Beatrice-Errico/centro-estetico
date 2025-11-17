'use client'
import { useEffect, useRef, useState } from 'react'

export default function LaserHeading({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement | null>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setOn(true)
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <h2
      ref={ref}
      className={[
        'h2-laser',
        'text-[clamp(28px,4vw,46px)] font-light tracking-[0.08em] text-silver-100 leading-[1.1] inline-block relative',
        on ? 'is-on' : ''
      ].join(' ')}
    >
      {children}
    </h2>
  )
}
