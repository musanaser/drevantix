import { Bell, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageBody } from '../../components/portal/PortalLayout'
import { Badge, Button, Card, EmptyState, PageHeader, Select, Spinner } from '../../components/ui'
import { api } from '../../lib/api'
import { useFleet } from '../../lib/fleet'
import { ALERT_TYPES, SEVERITY_BADGE, alertLabel, alertMessage, fmtDateTime, severityLabel, timeAgo } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import type { Alert } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export default function Alerts() {
  const { scopeKey, openAlerts, refreshAlertCount } = useFleet()
  const { t } = useI18n()
  const [status, setStatus] = useState('open')
  const [type, setType] = useState('')
  const data = useApi<{ alerts: Alert[]; open: number }>('/alerts', { status, type, limit: 300 }, [scopeKey, openAlerts])

  async function ack(id: number) {
    await api(`/alerts/${id}/ack`, { method: 'POST' })
    refreshAlertCount()
    data.reload()
  }
  async function ackAll() {
    await api('/alerts/ack-all', { method: 'POST' })
    refreshAlertCount()
    data.reload()
  }

  return (
    <PageBody>
      <PageHeader
        title={t('Alerts', 'التنبيهات')}
        subtitle={t(`${openAlerts} open alerts`, `${openAlerts} تنبيه مفتوح`)}
        actions={<Button variant="secondary" onClick={ackAll} disabled={!openAlerts}><CheckCheck className="h-4 w-4" /> {t('Acknowledge all', 'تأكيد الكل')}</Button>}
      />
      <Card className="mb-4 flex flex-wrap gap-3 p-4">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="open">{t('Open', 'مفتوحة')}</option>
          <option value="acknowledged">{t('Acknowledged', 'تم تأكيدها')}</option>
          <option value="">{t('All statuses', 'جميع الحالات')}</option>
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-52">
          <option value="">{t('All types', 'جميع الأنواع')}</option>
          {ALERT_TYPES.map((k) => <option key={k} value={k}>{alertLabel(k)}</option>)}
        </Select>
      </Card>
      <Card>
        {data.loading && !data.data ? <Spinner /> : !data.data?.alerts.length ? (
          <EmptyState icon={<Bell className="h-5 w-5" />} title={t('All clear', 'لا يوجد ما يدعو للقلق')} text={t('No alerts match these filters.', 'لا توجد تنبيهات مطابقة لهذه المرشحات.')} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.data.alerts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                <Badge className={SEVERITY_BADGE[a.severity]}>{severityLabel(a.severity)}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-900">{alertLabel(a.type)}</p>
                  <p className="text-xs text-slate-600">{alertMessage(a)}</p>
                </div>
                <Link to={`/portal/vehicles/${a.vehicle_id}`} className="text-xs font-medium text-brand hover:underline">{a.vehicle_name}</Link>
                <span className="w-32 text-end text-xs text-slate-400" title={fmtDateTime(a.ts)}>{timeAgo(a.ts)}</span>
                {a.acknowledged ? (
                  <span className="w-24 text-end text-xs text-slate-400">{t('Acknowledged', 'تم التأكيد')}</span>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => ack(a.id)} className="w-24">{t('Acknowledge', 'تأكيد')}</Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageBody>
  )
}
