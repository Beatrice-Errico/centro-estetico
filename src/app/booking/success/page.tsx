export default function BookingSuccessPage() {
  return (
    <div className="max-w-xl mx-auto card">
      <h1 className="text-xl font-semibold mb-2">Richiesta inviata ✅</h1>
      <p className="text-sm text-gray-700">
        Grazie! Ti contatteremo a breve per confermare l’orario dell’appuntamento.
      </p>
      <div className="mt-4 flex gap-3">
        <a className="btn" href="/listino">Torna al listino</a>
        <a className="btn" href="/">Vai alla home</a>
      </div>
    </div>
  )
}
