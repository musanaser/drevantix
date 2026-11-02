import { Activity, AlertTriangle, Car, Gauge, PauseCircle, Route, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FleetMap } from '../../components/portal/FleetMap'
import { PageBody } from '../../components/portal/PortalLayout'
import { Badge, Card, CardHeader, EmptyState, PageHeader } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useFleet } from '../../lib/fleet'
import { SEVERITY_BADGE, alertLabel, alertMessage, fmtKm, timeAgo } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import type { Alert, Geofence } from '../../lib/types'
import { useApi } from '../../lib/useApi'

interface Stats {
  last24h: { trips: number; distance_km: number; alerts24h: number; open: number }
}
interface Summary {
  daily: { day: string; distance_km: number; trips: number }[]
}

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { vehicles, scopeKey, openAlerts } = useFleet()
  const navigate = useNavigate()
  const stats = useApi<Stats>('/stats', undefined, [scopeKey, openAlerts])
  const summary = useApi<Summary>('/reports/summary', { days: 7 }, [scopeKey])
  const alerts = useApi<{ alerts: Alert[] }>('/alerts', { limit: 8 }, [scopeKey, openAlerts])
  const geofences = useApi<Geofence[]>('/geofences', undefined, [scopeKey])
  const [, setNow] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])

  const count = (s: string) => vehicles.filter((v) => v.status === s).length
  const kpis = [
    { label: t('Total vehicles', 'إجمالي المركبات'), value: vehicles.length, icon: Car, color: 'text-navy-800 bg-slate-100' },
    { label: t('Moving', 'متحركة'), value: count('moving'), icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { label: t('Idle', 'خاملة'), value: count('idle'), icon: Gauge, color: 'text-amber-600 bg-amber-50' },
    { label: t('Stopped', 'متوقفة'), value: count('stopped'), icon: PauseCircle, color: 'text-blue-600 bg-blue-50' },
    { label: t('Offline', 'غير متصلة'), value: count('offline'), icon: WifiOff, color: 'text-slate-500 bg-slate-100' },
  ]
  const s = stats.data?.last24h

  return (
    <PageBody>
      <PageHeader title={t(`Welcome back, ${user?.name.split(' ')[0]}`, `مرحباً بعودتك، ${user?.name.split(' ')[0]}`)} subtitle={t('Here is what is happening with your fleet right now.', 'إليك ما يحدث في أسطولك الآن.')} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold text-navy-900">{k.value}</p>
                <p className="text-xs text-slate-500">{k.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader title={t('Live fleet map', 'خريطة الأسطول المباشرة')} subtitle={t('Updated in real time', 'تتحدث لحظياً')} action={<Link to="/portal/live" className="text-xs font-semibold text-brand hover:underline">{t('Open full map →', 'فتح الخريطة الكاملة ←')}</Link>} />
          <div className="h-[420px]">
            <FleetMap vehicles={vehicles} geofences={geofences.data ?? []} onSelect={(id) => navigate(`/portal/vehicles/${id}`)} showLabels={false} fitKey={scopeKey} />
          </div>
        </Card>
        <div className="grid gap-4">
          {[
            { label: t('Distance (24h)', 'المسافة (24 ساعة)'), value: s ? fmtKm(s.distance_km) : '—', icon: Route },
            { label: t('Trips (24h)', 'الرحلات (24 ساعة)'), value: s?.trips ?? '—', icon: Activity },
            { label: t('Open alerts', 'تنبيهات مفتوحة'), value: openAlerts, icon: AlertTriangle },
          ].map((k) => (
            <Card key={k.label} className="flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-600 text-cyan-300">
                <k.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-2xl font-bold text-navy-900">{k.value}</p>
                <p className="text-xs text-slate-500">{k.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title={t('Distance driven', 'المسافة المقطوعة')} subtitle={t('Last 7 days (km)', 'آخر 7 أيام (كم)')} />
          <div className="h-64 p-4">
            <ResponsiveContainer>
              <BarChart data={summary.data?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis reversed={t("", "rtl") === "rtl"} dataKey="day" tickFormatter={(d: string) => d.slice(5)} fontSize={12} stroke="#94a3b8" />
                <YAxis orientation={t("left", "right") as "left" | "right"} fontSize={12} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="distance_km" name={t('Distance (km)', 'المسافة (كم)')} fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title={t('Recent alerts', 'أحدث التنبيهات')} action={<Link to="/portal/alerts" className="text-xs font-semibold text-brand hover:underline">{t('View all →', 'عرض الكل ←')}</Link>} />
          {alerts.data?.alerts.length ? (
            <ul className="divide-y divide-slate-100">
              {alerts.data.alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <Badge className={SEVERITY_BADGE[a.severity]}>{alertLabel(a.type)}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-slate-700">{alertMessage(a)}</p>
                    <p className="text-[11px] text-slate-400">{timeAgo(a.ts)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<AlertTriangle className="h-5 w-5" />} title={t('No alerts', 'لا توجد تنبيهات')} />
          )}
        </Card>
      </div>
    </PageBody>
  )
}
