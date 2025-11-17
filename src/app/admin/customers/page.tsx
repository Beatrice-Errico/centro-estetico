import { createServiceRoleClient } from '../../../lib/supabaseClient'
import { addCustomer, deleteCustomerAction } from './actions'

export const dynamic = 'force-dynamic'

type Customer = {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  created_at: string
}

async function getCustomers(): Promise<Customer[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, phone, email,')
    .order('created_at', { ascending: false })
    .returns<Customer[]>()
  if (error) throw new Error(error.message)
  return data ?? []
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Nuovo cliente */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Nuovo cliente</h2>
        {/* 👇 Cast "as any" elimina l'errore TS su action */}
        <form action={addCustomer as any} className="space-y-3">
          <div>
            <label className="label">Nome e Cognome</label>
            <input name="full_name" className="input" required />
          </div>
          <div>
            <label className="label">Telefono</label>
            <input name="phone" className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" />
          </div>
          <button className="btn" type="submit">Salva</button>
        </form>
      </div>

      {/* Elenco clienti */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Clienti</h2>
        <table className="table">
          <thead>
            <tr>
              <th className="th">Nome</th>
              <th className="th">Telefono</th>
              <th className="th">Email</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="tr">
                <td className="td">{c.full_name}</td>
                <td className="td">{c.phone || '-'}</td>
                <td className="td">{c.email || '-'}</td>
                <td className="td">
                  <form action={deleteCustomerAction as any}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="btn" type="submit">Elimina</button>
                  </form>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td className="td" colSpan={4}>Nessun cliente al momento.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
