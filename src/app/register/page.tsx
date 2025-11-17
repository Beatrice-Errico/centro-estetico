import { registerStaff } from './actions'

export const metadata = {
  title: 'Registra staff',
}

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-xl font-semibold mb-4">Crea account staff</h1>

      <form action={registerStaff} className="space-y-3">
        <div>
          <label className="label">Nome e cognome</label>
          <input name="full_name" className="input" required />
        </div>

        <div>
          <label className="label">Email</label>
          <input name="email" type="email" className="input" autoComplete="username" required />
        </div>

        <div>
          <label className="label">Password</label>
          <input name="password" type="password" className="input" autoComplete="new-password" required />
        </div>

        <div>
          <label className="label">Codice invito</label>
          <input name="code" className="input" placeholder="*****" required />
        </div>

        <button className="btn" type="submit">Crea account</button>
      </form>

      <p className="text-xs text-gray-600 mt-3">
        Per motivi di sicurezza, la registrazione staff richiede un <strong>codice invito</strong>.
      </p>
    </div>
  )
}
