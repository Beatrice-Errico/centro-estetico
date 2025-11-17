import { createServiceRoleClient } from '../../../lib/supabaseClient'
import { addService, deleteServiceAction } from './actions'

export const dynamic = 'force-dynamic'

type Service = {
  id: string
  name: string
  duration_minutes: number
  price_cents: number
  active: boolean
  category: 'benessere' | 'bellezza' | 'vitalita'
}

async function getServices(): Promise<Service[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price_cents, active, category')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as Service[]
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Nuovo servizio */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Aggiungi servizio</h2>
        <form action={addService as any} className="space-y-3">
          <div>
            <label className="label">Nome</label>
            <input name="name" className="input" placeholder="Manicure, Massaggio..." required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Durata (min)</label>
              <input name="duration_minutes" type="number" min={1} className="input" required />
            </div>
            <div>
              <label className="label">Prezzo (€)</label>
              <input name="price" type="number" step="0.01" min={0} className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Categoria</label>
            <select name="category" className="input" defaultValue="benessere" required>
              <option value="benessere">Benessere</option>
              <option value="bellezza">Bellezza</option>
              <option value="vitalita">Vitalità</option>
            </select>
          </div>
          <button className="btn" type="submit">Salva</button>
        </form>
      </div>

      {/* Elenco servizi */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Servizi</h2>
        <table className="table">
          <thead>
            <tr>
              <th className="th">Servizio</th>
              <th className="th">Categoria</th>
              <th className="th">Durata</th>
              <th className="th">Prezzo</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="tr">
                <td className="td">{s.name}</td>
                <td className="td capitalize">{s.category}</td>
                <td className="td">{s.duration_minutes} min</td>
                <td className="td">€ {(s.price_cents / 100).toFixed(2)}</td>
                <td className="td">
                  <form action={deleteServiceAction as any}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn" type="submit">Elimina</button>
                  </form>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td className="td" colSpan={5}>Nessun servizio.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
