import { ArrowLeft, Pause, Play } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Marker, Polyline } from 'react-leaflet'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BaseMap, vehicleIcon } from '../../components/portal/FleetMap'
import { PageBody } from '../../components/portal/PortalLayout'
import { Badge, Card, CardHeader, Input, PageHeader, Spinner, StatusBadge } from '../../components/ui'
import { useFleet } from '../../lib/fleet'
import { SEVERITY_BADGE, alertLabel, alertMessage, fmtDateTime, fmtDuration, fmtKm, fmtSpeed, fmtTime, place, timeAgo } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import type { Alert, Position, Trip, Vehicle } from '../../lib/types'
import { useApi } from '../../lib/useApi'
import { FitPath } from './Trips'

const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

export default function VehicleDetail() {
  const id = Number(useParams().id)
  const { vehicles } = useFleet()
  const { t } = useI18n()
  const detail = useApi<Vehicle & { last24h: { trips: number; distance_km: number; max_speed: number } }>(`/vehicles/${id}`)
  const live = vehicles.find((v) => v.id === id)
  const v = detail.data ? { ...detail.data, ...(live ?? {}) } : null
  const [day, setDay] = useState(todayStr())
  const range = useMemo(() => {
    const from = new Date(`${day}T00:00:00`).getTime()
    return { from, to: from + 86400_000 }
  }, [day])
  const history = useApi<Position[]>(`/vehicles/${id}/history`, range)
  const trips = useApi<Trip[]>('/trips', { vehicleId: id, ...range })
  const alerts = useApi<{ alerts: Alert[] }>('/alerts', { vehicleId: id, limit: 20 })
  const [cursor, setCursor] = useState(0)
  const [playing, setPlaying] = useState(false)
  const points = history.data ?? []

  useEffect(() => {
    setCursor(0)
    setPlaying(false)
  }, [history.data])
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setCursor((c) => (c >= points.length - 1 ? (setPlaying(false), c) : c + 1)), 60)
    return () => clearInterval(t)
  }, [playing, points.length])

  if (!v) return detail.error ? <PageBody><p className="text-sm text-red-600">{detail.error}</p></PageBody> : <Spinner />
  const path = points.map((p) => [p.lat, p.lng] as [number, number])
  const cur = points[cursor]
  const chart = points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 300)) === 0).map((p) => ({ t: fmtTime(p.ts), speed: Math.round(p.speed) }))

  return (
    <PageBody>
      <Link to="/portal/vehicles" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-800">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('All vehicles', 'جميع المركبات')}
      </Link>
      <PageHeader title={v.name} subtitle={`${v.plate} · ${v.make ?? ''} ${v.model ?? ''} ${v.year ?? ''}`} actions={<StatusBadge status={v.status} />} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          [t('Speed', 'السرعة'), fmtSpeed(v.speed)],
          [t('Fuel', 'الوقود'), `${Math.round(v.fuel_pct)}%`],
          [t('Odometer', 'العداد'), fmtKm(Math.round(v.odometer_km))],
          [t('Distance 24h', 'المسافة 24 ساعة'), fmtKm(detail.data!.last24h.distance_km)],
          [t('Trips 24h', 'الرحلات 24 ساعة'), String(detail.data!.last24h.trips)],
          [t('Last update', 'آخر تحديث'), timeAgo(v.last_update)],
        ].map(([l, val]) => (
          <Card key={l} className="p-4">
            <p className="text-lg font-bold text-navy-900">{val}</p>
            <p className="text-xs text-slate-500">{l}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader
            title={t('Route history & playback', 'سجل المسار وإعادة التشغيل')}
            subtitle={cur ? `${fmtDateTime(cur.ts)} · ${fmtSpeed(cur.speed)}` : t('No positions for this day', 'لا توجد مواقع لهذا اليوم')}
            action={<Input type="date" value={day} max={todayStr()} onChange={(e) => setDay(e.target.value)} className="w-40" />}
          />
          <div className="h-[420px]">
            <BaseMap>
              {path.length > 1 && <Polyline positions={path} pathOptions={{ color: '#1d4ed8', weight: 4, opacity: 0.7 }} />}
              {cursor > 0 && <Polyline positions={path.slice(0, cursor + 1)} pathOptions={{ color: '#1cc8ee', weight: 5 }} />}
              {cur && <Marker position={[cur.lat, cur.lng]} icon={vehicleIcon({ ...v, status: cur.speed > 3 ? 'moving' : 'stopped', heading: cur.heading }, true, false)} />}
              {!cur && v.lat != null && <Marker position={[v.lat, v.lng!]} icon={vehicleIcon(v, true)} />}
              <FitPath path={path.length ? path : v.lat != null ? [[v.lat, v.lng!]] : []} />
            </BaseMap>
          </div>
          <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-3">
            <button
              disabled={points.length < 2}
              onClick={() => {
                if (cursor >= points.length - 1) setCursor(0)
                setPlaying(!playing)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-white disabled:opacity-40"
              aria-label={playing ? t('Pause', 'إيقاف مؤقت') : t('Play', 'تشغيل')}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <input type="range" min={0} max={Math.max(0, points.length - 1)} value={cursor} onChange={(e) => setCursor(Number(e.target.value))} className="flex-1 accent-cyan-500" dir="ltr" />
            <span className="w-14 text-end text-xs text-slate-500">{cur ? fmtTime(cur.ts) : '--:--'}</span>
          </div>
        </Card>
        <Card>
          <CardHeader title={t('Vehicle info', 'معلومات المركبة')} />
          <dl className="divide-y divide-slate-100 text-sm">
            {[
              [t('Driver', 'السائق'), v.driver_name ?? '—'],
              [t('Driver phone', 'جوال السائق'), v.driver_phone ?? '—'],
              [t('Type', 'النوع'), ({ truck: t('Truck', 'شاحنة'), van: t('Van', 'فان'), car: t('Car', 'سيارة'), bus: t('Bus', 'حافلة') } as Record<string, string>)[v.type] ?? v.type],
              [t('Speed limit', 'حد السرعة'), fmtSpeed(v.speed_limit)],
              [t('Ignition', 'المحرك'), v.ignition ? t('On', 'يعمل') : t('Off', 'متوقف')],
              [t('Device IMEI', 'رقم IMEI للجهاز'), v.device_imei ?? '—'],
              [t('Customer', 'العميل'), v.company_name],
              [t('Position', 'الموقع'), v.lat != null ? `${v.lat.toFixed(5)}, ${v.lng!.toFixed(5)}` : '—'],
            ].map(([l, val]) => (
              <div key={l} className="flex justify-between gap-4 px-5 py-2.5">
                <dt className="text-slate-500">{l}</dt>
                <dd className={`text-end font-medium text-navy-900 capitalize`}>{val}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title={t('Speed profile', 'منحنى السرعة')} subtitle={t(`${points.length} positions`, `${points.length} موقع`)} />
          <div className="h-56 p-4">
            {history.loading ? <Spinner /> : (
              <ResponsiveContainer>
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#1cc8ee" stopOpacity={0.5} />
                      <stop offset="1" stopColor="#1cc8ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis reversed={t("", "rtl") === "rtl"} dataKey="t" fontSize={11} stroke="#94a3b8" minTickGap={40} />
                  <YAxis orientation={t("left", "right") as "left" | "right"} fontSize={11} stroke="#94a3b8" unit={t(" km/h", " كم/س")} width={60} />
                  <Tooltip />
                  <Area type="monotone" dataKey="speed" name={t("Speed", "السرعة")} stroke="#0891b2" fill="url(#sp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title={t('Recent alerts', 'أحدث التنبيهات')} />
          <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
            {alerts.data?.alerts.map((a) => (
              <li key={a.id} className="px-5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge className={SEVERITY_BADGE[a.severity]}>{alertLabel(a.type)}</Badge>
                  <span className="text-[11px] text-slate-400">{timeAgo(a.ts)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{alertMessage(a)}</p>
              </li>
            ))}
            {!alerts.data?.alerts.length && <li className="p-5 text-center text-xs text-slate-500">{t('No alerts', 'لا توجد تنبيهات')}</li>}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title={t('Trips on this day', 'رحلات هذا اليوم')} />
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr><th className="px-4 py-2">{t('Start', 'البداية')}</th><th className="px-4 py-2">{t('From → To', 'من ← إلى')}</th><th className="px-4 py-2">{t('Duration', 'المدة')}</th><th className="px-4 py-2">{t('Distance', 'المسافة')}</th><th className="px-4 py-2">{t('Max speed', 'أقصى سرعة')}</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.data?.map((tr) => (
                <tr key={tr.id}>
                  <td className="px-4 py-2 text-slate-600">{fmtTime(tr.start_ts)}</td>
                  <td className="px-4 py-2 text-navy-900">{place(tr.start_label)} {t('→', '←')} {place(tr.end_label)}</td>
                  <td className="px-4 py-2 text-slate-600">{tr.end_ts ? fmtDuration(tr.end_ts - tr.start_ts) : t('In progress', 'جارية')}</td>
                  <td className="px-4 py-2 text-slate-600">{fmtKm(tr.distance_km)}</td>
                  <td className="px-4 py-2 text-slate-600">{fmtSpeed(tr.max_speed)}</td>
                </tr>
              ))}
              {!trips.data?.length && <tr><td colSpan={5} className="p-5 text-center text-xs text-slate-500">{t('No trips', 'لا توجد رحلات')}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </PageBody>
  )
}
