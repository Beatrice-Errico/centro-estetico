import Link from 'next/link'



export default function BookingSuccessPage() {
  return (
    <div className="max-w-xl mx-auto card">
      <h1 className="text-xl font-semibold mb-2">Richiesta inviata ✅</h1>
      <p className="text-sm text-gray-700">
        Grazie! Ti contatteremo a breve per confermare l’orario dell’appuntamento.
      </p>
      <div className="mt-4 flex gap-3">
        <Link  href="/listino"className="btn">Torna al listino</Link>
        <Link  href="/"className="btn">Vai alla home</Link>
      </div>
    </div>
  )
}
