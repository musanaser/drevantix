import { Car, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PageBody } from '../../components/portal/PortalLayout'
import { Button, Card, EmptyState, ErrorText, Field, Input, Modal, PageHeader, Select, Spinner, StatusBadge } from '../../components/ui'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useFleet } from '../../lib/fleet'
import { timeAgo } from '../../lib/format'
import type { Driver, Vehicle } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export default function Vehicles() {
  const { user } = useAuth()
  const { vehicles, loading, refresh, companyId } = useFleet()
  const canEdit = user?.role !== 'viewer'
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Partial<Vehicle> | null>(null)
  const list = vehicles.filter((v) => `${v.name} ${v.plate} ${v.driver_name ?? ''} ${v.make ?? ''}`.toLowerCase().includes(query.toLowerCase()))

  async function remove(v: Vehicle) {
    if (!confirm(`Delete ${v.name}? Its history will be removed.`)) return
    await api(`/vehicles/${v.id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <PageBody>
      <PageHeader
        title="Vehicles"
        subtitle={`${vehicles.length} vehicles in your fleet`}
        actions={
          canEdit && (
            <Button onClick={() => setEditing({ type: 'truck', speed_limit: 90 })} disabled={user?.role === 'admin' && !companyId} title={user?.role === 'admin' && !companyId ? 'Select a customer first' : undefined}>
              <Plus className="h-4 w-4" /> Add vehicle
            </Button>
          )
        }
      />
      <Card>
        <div className="border-b border-slate-100 p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vehicles" className="pl-9" />
          </div>
        </div>
        {loading ? (
          <Spinner />
        ) : !list.length ? (
          <EmptyState icon={<Car className="h-5 w-5" />} title="No vehicles found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  {user?.role === 'admin' && <th className="px-4 py-3">Customer</th>}
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Speed</th>
                  <th className="px-4 py-3">Fuel</th>
                  <th className="px-4 py-3">Odometer</th>
                  <th className="px-4 py-3">Last update</th>
                  {canEdit && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/portal/vehicles/${v.id}`} className="font-semibold text-navy-900 hover:text-brand">
                        {v.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {v.plate} · {v.make} {v.model} {v.year}
                      </p>
                    </td>
                    {user?.role === 'admin' && <td className="px-4 py-3 text-slate-600">{v.company_name}</td>}
                    <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{v.driver_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{Math.round(v.speed)} km/h</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                          <div className={`h-full ${v.fuel_pct < 20 ? 'bg-red-500' : v.fuel_pct < 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${v.fuel_pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{Math.round(v.fuel_pct)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{Math.round(v.odometer_km).toLocaleString()} km</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(v.last_update)}</td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setEditing(v)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-800" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => remove(v)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {editing && <VehicleForm vehicle={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh() }} />}
    </PageBody>
  )
}

function VehicleForm({ vehicle, onClose, onSaved }: { vehicle: Partial<Vehicle>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: vehicle.name ?? '',
    plate: vehicle.plate ?? '',
    type: vehicle.type ?? 'truck',
    make: vehicle.make ?? '',
    model: vehicle.model ?? '',
    year: vehicle.year ? String(vehicle.year) : '',
    device_imei: vehicle.device_imei ?? '',
    speed_limit: String(vehicle.speed_limit ?? 90),
    driver_id: vehicle.driver_id ? String(vehicle.driver_id) : '',
    route_id: vehicle.route_id ? String(vehicle.route_id) : '',
  })
  const drivers = useApi<Driver[]>('/drivers', vehicle.company_id ? { companyId: vehicle.company_id } : undefined)
  const routes = useApi<{ id: number; name: string }[]>('/routes')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })
  useEffect(() => setError(null), [form])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        ...form,
        year: form.year ? Number(form.year) : null,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
        route_id: form.route_id ? Number(form.route_id) : null,
        speed_limit: Number(form.speed_limit),
      }
      if (vehicle.id) await api(`/vehicles/${vehicle.id}`, { method: 'PUT', body })
      else await api('/vehicles', { method: 'POST', body })
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={vehicle.id ? `Edit ${vehicle.name}` : 'Add vehicle'}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *"><Input required value={form.name} onChange={set('name')} placeholder="Truck 09" /></Field>
        <Field label="Plate number *"><Input required value={form.plate} onChange={set('plate')} placeholder="ABC 1234" /></Field>
        <Field label="Type">
          <Select value={form.type} onChange={set('type')}>
            <option value="truck">Truck</option>
            <option value="van">Van</option>
            <option value="car">Car</option>
            <option value="bus">Bus</option>
          </Select>
        </Field>
        <Field label="Speed limit (km/h)"><Input type="number" min={20} max={200} value={form.speed_limit} onChange={set('speed_limit')} /></Field>
        <Field label="Make"><Input value={form.make} onChange={set('make')} /></Field>
        <Field label="Model"><Input value={form.model} onChange={set('model')} /></Field>
        <Field label="Year"><Input type="number" value={form.year} onChange={set('year')} /></Field>
        <Field label="Device IMEI"><Input value={form.device_imei} onChange={set('device_imei')} /></Field>
        <Field label="Assigned driver">
          <Select value={form.driver_id} onChange={set('driver_id')}>
            <option value="">— None —</option>
            {drivers.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </Field>
        <Field label="Demo route (simulated GPS)" hint="Real devices report their own position.">
          <Select value={form.route_id} onChange={set('route_id')}>
            <option value="">— No simulation —</option>
            {routes.data?.map((r) => <option key={r.id} value={r.id}>{r.id}. {r.name}</option>)}
          </Select>
        </Field>
        <div className="sm:col-span-2"><ErrorText error={error} /></div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{vehicle.id ? 'Save changes' : 'Add vehicle'}</Button>
        </div>
      </form>
    </Modal>
  )
}
