import type { Metadata } from 'next'
import './globals.css'
// ❌ rimuoviamo la navbar
// import Nav from '../components/Nav'
import { Manrope } from 'next/font/google'
import Header from '../components/Header'

export const metadata: Metadata = {
  title: 'Centro Estetico',
  description: 'Gestione base clienti, servizi, appuntamenti',
}

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300','400','500','600'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={manrope.className} suppressHydrationWarning>
        {/* niente navbar */}
        {/* rimuovi "container" qui per permettere sezioni full-bleed */}
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
  
}
