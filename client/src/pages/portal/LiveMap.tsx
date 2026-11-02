import { Crosshair, Fuel, Gauge, Search, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FleetMap } from '../../components/portal/FleetMap'
import { StatusBadge } from '../../components/ui'
import { useFleet } from '../../lib/fleet'
import { STATUS_META, timeAgo } from '../../lib/format'
import type { Geofence, VehicleStatus } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export default function LiveMap() {
  const { vehicles, scopeKey } = useFleet()
  const geofences = useApi<Geofence[]>('/geofences', undefined, [scopeKey])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<VehicleStatus | 'all'>('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [follow, setFollow] = useState(true)
  const [showFences, setShowFences] = useState(true)

  const list = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (filter === 'all' || v.status === filter) &&
          `${v.name} ${v.plate} ${v.driver_name ?? ''}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [vehicles, filter, query],
  )
  const selected = vehicles.find((v) => v.id === selectedId)

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <aside className="flex max-h-[45vh] w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:max-h-none lg:w-96 lg:border-r lg:border-b-0">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vehicle, plate or driver"
              className="w-full rounded-lg border-0 bg-slate-100 py-2 pr-3 pl-9 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'moving', 'idle', 'stopped', 'offline'] as const).map((s) => {
              const n = s === 'all' ? vehicles.length : vehicles.filter((v) => v.status === s).length
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition ${filter === s ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {s !== 'all' && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: STATUS_META[s].color }} />}
                  {s} {n}
                </button>
              )
            })}
          </div>
        </div>
        <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
          {list.map((v) => (
            <li key={v.id}>
              <button onClick={() => setSelectedId(v.id)} className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${v.id === selectedId ? 'bg-cyan-50/70' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-900">{v.name}</p>
                    <p className="text-xs text-slate-500">
                      {v.plate} · {v.driver_name ?? 'No driver'}
                    </p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
                <div className="mt-2 flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{Math.round(v.speed)} km/h</span>
                  <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{Math.round(v.fuel_pct)}%</span>
                  <span className="ml-auto">{timeAgo(v.last_update)}</span>
                </div>
              </button>
            </li>
          ))}
          {!list.length && <li className="p-6 text-center text-sm text-slate-500">No vehicles match.</li>}
        </ul>
      </aside>
      <div className="relative min-h-[400px] flex-1">
        <FleetMap vehicles={vehicles} geofences={showFences ? geofences.data ?? [] : []} selectedId={selectedId} onSelect={setSelectedId} follow={follow} fitKey={scopeKey} />
        <div className="absolute top-3 right-3 z-[1000] flex gap-2">
          <button onClick={() => setShowFences(!showFences)} className={`rounded-lg px-3 py-2 text-xs font-medium shadow ${showFences ? 'bg-navy-800 text-white' : 'bg-white text-slate-700'}`}>
            Geofences
          </button>
          <button onClick={() => setFollow(!follow)} className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium shadow ${follow ? 'bg-navy-800 text-white' : 'bg-white text-slate-700'}`}>
            <Crosshair className="h-3.5 w-3.5" /> Follow
          </button>
        </div>
        {selected && (
          <div className="absolute bottom-4 left-4 z-[1000] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display font-semibold text-navy-900">{selected.name}</p>
                <p className="text-xs text-slate-500">
                  {selected.plate} · {selected.make} {selected.model}
                </p>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ['Speed', `${Math.round(selected.speed)} km/h`],
                ['Fuel', `${Math.round(selected.fuel_pct)}%`],
                ['Odometer', `${Math.round(selected.odometer_km).toLocaleString()} km`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-slate-50 p-2">
                  <p className="text-sm font-semibold text-navy-900">{v}</p>
                  <p className="text-[11px] text-slate-500">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{selected.driver_name ?? 'No driver'}</span>
              <span>Updated {timeAgo(selected.last_update)}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Link to={`/portal/vehicles/${selected.id}`} className="flex-1 rounded-lg bg-navy-800 py-2 text-center text-xs font-semibold text-white hover:bg-navy-700">
                Details & history
              </Link>
              <button onClick={() => setSelectedId(null)} className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
