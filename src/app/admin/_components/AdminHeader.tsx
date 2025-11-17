'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabaseClient'

export default function AdminHeader() {
  const supabase = createClient()
  const router = useRouter()

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <header className="border-b border-white/10 bg-[#0a0a0b] text-silver-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <h1 className="text-[15px] md:text-base tracking-[0.10em] font-light">
          Area Admin
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-9 px-3 inline-flex items-center justify-center
                       border border-white/20 hover:bg-white/5"
          >
            Vai al sito
          </Link>
          <button
            onClick={logout}
            className="h-9 px-3 inline-flex items-center justify-center
                       bg-[#B0B7C3] text-black border border-[#B0B7C3]
                       hover:bg-transparent hover:text-[#B0B7C3]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
