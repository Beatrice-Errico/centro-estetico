'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  if (pathname === '/') return null

  return (
    <div className="fixed top-6 left-7 z-50">
      <Link
        href="/"
        aria-label="Torna alla Home"
        className="inline-flex items-center justify-center
                   w-14 h-14 rounded-full
                   bg-black/40 backdrop-blur-sm
                   border border-white/10
                   text-silver-100 hover:text-white
                   hover:bg-black/55 transition
                   shadow-[0_0_10px_rgba(0,0,0,0.35)]"
      >
        <Home className="w-7 h-7" strokeWidth={1.5} />
      </Link>
    </div>
  )
}
