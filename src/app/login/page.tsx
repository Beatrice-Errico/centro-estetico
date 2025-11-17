'use client'

import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-night-900">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-silver-100">
          Area riservata
        </h1>
        <p className="mt-2 text-silver-400">
          Il login verrà configurato in un secondo momento.
        </p>

        <Link href="/" className="btn mt-6">
          Torna al sito
        </Link>
      </div>
    </div>
  )
}
