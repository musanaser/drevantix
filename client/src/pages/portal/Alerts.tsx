import { Bell, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageBody } from '../../components/portal/PortalLayout'
import { Badge, Button, Card, EmptyState, PageHeader, Select, Spinner } from '../../components/ui'
import { api } from '../../lib/api'
import { useFleet } from '../../lib/fleet'
import { ALERT_LABEL, SEVERITY_BADGE, fmtDateTime, timeAgo } from '../../lib/format'
import type { Alert, AlertType } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export default function Alerts() {
  const { scopeKey, openAlerts, refreshAlertCount } = useFleet()
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
        title="Alerts"
        subtitle={`${openAlerts} open alerts`}
        actions={<Button variant="secondary" onClick={ackAll} disabled={!openAlerts}><CheckCheck className="h-4 w-4" /> Acknowledge all</Button>}
      />
      <Card className="mb-4 flex flex-wrap gap-3 p-4">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="">All statuses</option>
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-52">
          <option value="">All types</option>
          {(Object.keys(ALERT_LABEL) as AlertType[]).map((t) => <option key={t} value={t}>{ALERT_LABEL[t]}</option>)}
        </Select>
      </Card>
      <Card>
        {data.loading && !data.data ? <Spinner /> : !data.data?.alerts.length ? (
          <EmptyState icon={<Bell className="h-5 w-5" />} title="All clear" text="No alerts match these filters." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.data.alerts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                <Badge className={SEVERITY_BADGE[a.severity]}>{a.severity}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-900">{ALERT_LABEL[a.type]}</p>
                  <p className="text-xs text-slate-600">{a.message}</p>
                </div>
                <Link to={`/portal/vehicles/${a.vehicle_id}`} className="text-xs font-medium text-brand hover:underline">{a.vehicle_name}</Link>
                <span className="w-32 text-right text-xs text-slate-400" title={fmtDateTime(a.ts)}>{timeAgo(a.ts)}</span>
                {a.acknowledged ? (
                  <span className="w-24 text-right text-xs text-slate-400">Acknowledged</span>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => ack(a.id)} className="w-24">Acknowledge</Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageBody>
  )
}
