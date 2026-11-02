import { Download } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageBody } from '../../components/portal/PortalLayout'
import { Button, Card, CardHeader, PageHeader, Select, Spinner } from '../../components/ui'
import { useFleet } from '../../lib/fleet'
import { ALERT_LABEL, downloadCsv, fmtKm } from '../../lib/format'
import type { AlertType } from '../../lib/types'
import { useApi } from '../../lib/useApi'

interface Summary {
  days: number
  daily: { day: string; distance_km: number; trips: number; driving_hours: number }[]
  perVehicle: { id: number; name: string; plate: string; type: string; trips: number; distance_km: number; max_speed: number; driving_hours: number; alerts: number; fuel_l: number; utilization_pct: number }[]
  alertsByType: { type: AlertType; count: number }[]
}

const PIE = ['#1d4ed8', '#1cc8ee', '#f59e0b', '#ef4444', '#10b981', '#a855f7']

export default function Reports() {
  const { scopeKey } = useFleet()
  const [days, setDays] = useState(7)
  const { data, loading } = useApi<Summary>('/reports/summary', { days }, [scopeKey])
  const totals = data?.perVehicle.reduce((t, v) => ({ distance: t.distance + v.distance_km, trips: t.trips + v.trips, hours: t.hours + v.driving_hours, fuel: t.fuel + v.fuel_l }), { distance: 0, trips: 0, hours: 0, fuel: 0 })

  return (
    <PageBody>
      <PageHeader
        title="Reports"
        subtitle="Fleet performance, utilization and safety"
        actions={
          <>
            <Select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-40">
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </Select>
            <Button variant="secondary" onClick={() => data && downloadCsv(`fleet-report-${days}d.csv`, data.perVehicle)}><Download className="h-4 w-4" /> Export CSV</Button>
          </>
        }
      />
      {loading && !data ? <Spinner /> : data && totals && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ['Total distance', fmtKm(totals.distance)],
              ['Trips', totals.trips.toLocaleString()],
              ['Driving hours', `${Math.round(totals.hours)} h`],
              ['Est. fuel used', `${totals.fuel.toLocaleString()} L`],
            ].map(([l, v]) => (
              <Card key={l} className="p-5"><p className="text-2xl font-bold text-navy-900">{v}</p><p className="text-xs text-slate-500">{l}</p></Card>
            ))}
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader title="Daily distance & trips" />
              <div className="h-72 p-4">
                <ResponsiveContainer>
                  <BarChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" tickFormatter={(d: string) => d.slice(5)} fontSize={12} stroke="#94a3b8" />
                    <YAxis yAxisId="l" fontSize={12} stroke="#94a3b8" />
                    <YAxis yAxisId="r" orientation="right" fontSize={12} stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="l" dataKey="distance_km" name="Distance (km)" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="r" dataKey="trips" name="Trips" fill="#1cc8ee" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Alerts by type" />
              <div className="h-72 p-4">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.alertsByType.map((a) => ({ ...a, name: ALERT_LABEL[a.type] }))} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {data.alertsByType.map((a, i) => <Cell key={a.type} fill={PIE[i % PIE.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <Card className="mt-6">
            <CardHeader title="Driving hours per day" />
            <div className="h-60 p-4">
              <ResponsiveContainer>
                <LineChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tickFormatter={(d: string) => d.slice(5)} fontSize={12} stroke="#94a3b8" />
                  <YAxis fontSize={12} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="driving_hours" name="Driving hours" stroke="#0891b2" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="mt-6">
            <CardHeader title="Vehicle summary" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Trips</th><th className="px-4 py-3">Distance</th><th className="px-4 py-3">Driving</th><th className="px-4 py-3">Utilization</th><th className="px-4 py-3">Max speed</th><th className="px-4 py-3">Est. fuel</th><th className="px-4 py-3">Alerts</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.perVehicle.map((v) => (
                    <tr key={v.id}>
                      <td className="px-4 py-3"><p className="font-semibold text-navy-900">{v.name}</p><p className="text-xs text-slate-500">{v.plate}</p></td>
                      <td className="px-4 py-3 text-slate-600">{v.trips}</td>
                      <td className="px-4 py-3 text-slate-600">{fmtKm(v.distance_km)}</td>
                      <td className="px-4 py-3 text-slate-600">{v.driving_hours} h</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-cyan-500" style={{ width: `${v.utilization_pct}%` }} /></div>
                          <span className="text-xs text-slate-500">{v.utilization_pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{v.max_speed} km/h</td>
                      <td className="px-4 py-3 text-slate-600">{v.fuel_l.toLocaleString()} L</td>
                      <td className="px-4 py-3 text-slate-600">{v.alerts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </PageBody>
  )
}
