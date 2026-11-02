import { Download } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageBody } from '../../components/portal/PortalLayout'
import { Button, Card, CardHeader, PageHeader, Select, Spinner } from '../../components/ui'
import { useFleet } from '../../lib/fleet'
import { alertLabel, downloadCsv, fmtKm, fmtNum, fmtSpeed } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
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
  const { t, isAr } = useI18n()
  const [days, setDays] = useState(7)
  const { data, loading } = useApi<Summary>('/reports/summary', { days }, [scopeKey])
  const totals = data?.perVehicle.reduce((a, v) => ({ distance: a.distance + v.distance_km, trips: a.trips + v.trips, hours: a.hours + v.driving_hours, fuel: a.fuel + v.fuel_l }), { distance: 0, trips: 0, hours: 0, fuel: 0 })

  return (
    <PageBody>
      <PageHeader
        title={t('Reports', 'التقارير')}
        subtitle={t('Fleet performance, utilization and safety', 'أداء الأسطول ونسبة الاستخدام والسلامة')}
        actions={
          <>
            <Select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-40">
              <option value={7}>{t('Last 7 days', 'آخر 7 أيام')}</option>
              <option value={14}>{t('Last 14 days', 'آخر 14 يوماً')}</option>
              <option value={30}>{t('Last 30 days', 'آخر 30 يوماً')}</option>
            </Select>
            <Button variant="secondary" onClick={() => data && downloadCsv(`fleet-report-${days}d.csv`, data.perVehicle)}><Download className="h-4 w-4" /> {t('Export CSV', 'تصدير CSV')}</Button>
          </>
        }
      />
      {loading && !data ? <Spinner /> : data && totals && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              [t('Total distance', 'إجمالي المسافة'), fmtKm(totals.distance)],
              [t('Trips', 'الرحلات'), fmtNum(totals.trips)],
              [t('Driving hours', 'ساعات القيادة'), `${Math.round(totals.hours)} ${t('h', 'س')}`],
              [t('Est. fuel used', 'الوقود المستهلك (تقديري)'), `${fmtNum(totals.fuel)} ${t('L', 'لتر')}`],
            ].map(([l, v]) => (
              <Card key={l} className="p-5"><p className="text-2xl font-bold text-navy-900">{v}</p><p className="text-xs text-slate-500">{l}</p></Card>
            ))}
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader title={t('Daily distance & trips', 'المسافة والرحلات اليومية')} />
              <div className="h-72 p-4">
                <ResponsiveContainer>
                  <BarChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis reversed={t("", "rtl") === "rtl"} dataKey="day" tickFormatter={(d: string) => d.slice(5)} fontSize={12} stroke="#94a3b8" />
                    <YAxis yAxisId="l" orientation={isAr ? "right" : "left"} fontSize={12} stroke="#94a3b8" />
                    <YAxis yAxisId="r" orientation={isAr ? "left" : "right"} fontSize={12} stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="l" dataKey="distance_km" name={t('Distance (km)', 'المسافة (كم)')} fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="r" dataKey="trips" name={t('Trips', 'الرحلات')} fill="#1cc8ee" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title={t('Alerts by type', 'التنبيهات حسب النوع')} />
              <div className="h-72 p-4">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.alertsByType.map((a) => ({ ...a, name: alertLabel(a.type) }))} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
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
            <CardHeader title={t('Driving hours per day', 'ساعات القيادة يومياً')} />
            <div className="h-60 p-4">
              <ResponsiveContainer>
                <LineChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis reversed={t("", "rtl") === "rtl"} dataKey="day" tickFormatter={(d: string) => d.slice(5)} fontSize={12} stroke="#94a3b8" />
                  <YAxis orientation={isAr ? "right" : "left"} fontSize={12} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="driving_hours" name={t('Driving hours', 'ساعات القيادة')} stroke="#0891b2" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="mt-6">
            <CardHeader title={t('Vehicle summary', 'ملخص المركبات')} />
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>{[t('Vehicle', 'المركبة'), t('Trips', 'الرحلات'), t('Distance', 'المسافة'), t('Driving', 'القيادة'), t('Utilization', 'نسبة الاستخدام'), t('Max speed', 'أقصى سرعة'), t('Est. fuel', 'الوقود التقديري'), t('Alerts', 'التنبيهات')].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.perVehicle.map((v) => (
                    <tr key={v.id}>
                      <td className="px-4 py-3"><p className="font-semibold text-navy-900">{v.name}</p><p className="text-xs text-slate-500">{v.plate}</p></td>
                      <td className="px-4 py-3 text-slate-600">{v.trips}</td>
                      <td className="px-4 py-3 text-slate-600">{fmtKm(v.distance_km)}</td>
                      <td className="px-4 py-3 text-slate-600">{v.driving_hours} {t('h', 'س')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-cyan-500" style={{ width: `${v.utilization_pct}%` }} /></div>
                          <span className="text-xs text-slate-500">{v.utilization_pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{fmtSpeed(v.max_speed)}</td>
                      <td className="px-4 py-3 text-slate-600">{fmtNum(v.fuel_l)} {t('L', 'لتر')}</td>
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
