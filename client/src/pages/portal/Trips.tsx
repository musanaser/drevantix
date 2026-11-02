import L from 'leaflet'
import { Download, Route } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, Polyline, useMap } from 'react-leaflet'
import { BaseMap } from '../../components/portal/FleetMap'
import { PageBody } from '../../components/portal/PortalLayout'
import { Card, EmptyState, Field, Input, Modal, PageHeader, Select, Spinner, Button } from '../../components/ui'
import { useFleet } from '../../lib/fleet'
import { downloadCsv, fmtDateTime, fmtDuration, fmtKm } from '../../lib/format'
import type { Position, Trip } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export function FitPath({ path }: { path: [number, number][] }) {
  const map = useMap()
  const key = path.length ? `${path[0]}-${path[path.length - 1]}-${path.length}` : ''
  useEffect(() => {
    if (path.length === 1) map.setView(path[0], 14)
    else if (path.length > 1) map.fitBounds(L.latLngBounds(path), { padding: [30, 30] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map])
  return null
}

const dateStr = (ts: number) => new Date(ts - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

export default function Trips() {
  const { vehicles, scopeKey } = useFleet()
  const [vehicleId, setVehicleId] = useState('')
  const [from, setFrom] = useState(() => dateStr(Date.now() - 86400_000))
  const [to, setTo] = useState(() => dateStr(Date.now()))
  const range = useMemo(() => ({ from: new Date(`${from}T00:00:00`).getTime(), to: new Date(`${to}T23:59:59`).getTime(), vehicleId }), [from, to, vehicleId])
  const trips = useApi<Trip[]>('/trips', range, [scopeKey])
  const [open, setOpen] = useState<Trip | null>(null)
  const total = (trips.data ?? []).reduce((s, t) => s + t.distance_km, 0)

  return (
    <PageBody>
      <PageHeader
        title="Trips"
        subtitle={trips.data ? `${trips.data.length} trips · ${fmtKm(total)}` : 'Journey history'}
        actions={
          <Button variant="secondary" onClick={() => downloadCsv('trips.csv', (trips.data ?? []).map((t) => ({ vehicle: t.vehicle_name, plate: t.plate, driver: t.driver_name, start: new Date(t.start_ts).toISOString(), end: t.end_ts ? new Date(t.end_ts).toISOString() : '', from: t.start_label, to: t.end_label, distance_km: t.distance_km, max_speed: t.max_speed })))}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <Card className="mb-4 grid gap-4 p-4 sm:grid-cols-3">
        <Field label="Vehicle">
          <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">All vehicles</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
          </Select>
        </Field>
        <Field label="From"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="To"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
      </Card>
      <Card>
        {trips.loading ? <Spinner /> : !trips.data?.length ? <EmptyState icon={<Route className="h-5 w-5" />} title="No trips in this period" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Driver</th><th className="px-4 py-3">Start</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Distance</th><th className="px-4 py-3">Max speed</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.data.map((t) => (
                  <tr key={t.id} onClick={() => setOpen(t)} className="cursor-pointer hover:bg-cyan-50/50">
                    <td className="px-4 py-3"><p className="font-semibold text-navy-900">{t.vehicle_name}</p><p className="text-xs text-slate-500">{t.plate}</p></td>
                    <td className="px-4 py-3 text-slate-600">{t.driver_name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtDateTime(t.start_ts)}</td>
                    <td className="px-4 py-3 text-slate-700">{t.start_label} → {t.end_label}</td>
                    <td className="px-4 py-3 text-slate-600">{t.end_ts ? fmtDuration(t.end_ts - t.start_ts) : <span className="text-emerald-600">In progress</span>}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtKm(t.distance_km)}</td>
                    <td className="px-4 py-3 text-slate-600">{t.max_speed} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {open && <TripModal trip={open} onClose={() => setOpen(null)} />}
    </PageBody>
  )
}

function TripModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const path = useApi<Position[]>(`/trips/${trip.id}/path`)
  const pts = (path.data ?? []).map((p) => [p.lat, p.lng] as [number, number])
  return (
    <Modal open wide onClose={onClose} title={`${trip.vehicle_name}: ${trip.start_label} → ${trip.end_label}`}>
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {[
          ['Start', fmtDateTime(trip.start_ts)],
          ['Duration', trip.end_ts ? fmtDuration(trip.end_ts - trip.start_ts) : 'In progress'],
          ['Distance', fmtKm(trip.distance_km)],
          ['Max speed', `${trip.max_speed} km/h`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg bg-slate-50 p-3"><p className="font-semibold text-navy-900">{v}</p><p className="text-xs text-slate-500">{l}</p></div>
        ))}
      </div>
      <div className="h-96 overflow-hidden rounded-xl">
        <BaseMap>
          {pts.length > 1 && <Polyline positions={pts} pathOptions={{ color: '#1d4ed8', weight: 5 }} />}
          {pts.length > 0 && <CircleMarker center={pts[0]} radius={7} pathOptions={{ color: 'white', fillColor: '#10b981', fillOpacity: 1, weight: 2 }} />}
          {pts.length > 1 && <CircleMarker center={pts[pts.length - 1]} radius={7} pathOptions={{ color: 'white', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }} />}
          <FitPath path={pts} />
        </BaseMap>
      </div>
    </Modal>
  )
}
