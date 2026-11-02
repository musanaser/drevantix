import { Inbox } from 'lucide-react'
import { PageBody } from '../../components/portal/PortalLayout'
import { Badge, Card, EmptyState, PageHeader, Select, Spinner } from '../../components/ui'
import { api } from '../../lib/api'
import { fmtDateTime } from '../../lib/format'
import type { Lead } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export default function Leads() {
  const leads = useApi<Lead[]>('/admin/leads')
  async function setStatus(id: number, status: string) {
    await api(`/admin/leads/${id}`, { method: 'PUT', body: { status } })
    leads.reload()
  }
  return (
    <PageBody>
      <PageHeader title="Leads & demo requests" subtitle="Submitted from the public website" />
      <Card>
        {leads.loading && !leads.data ? <Spinner /> : !leads.data?.length ? <EmptyState icon={<Inbox className="h-5 w-5" />} title="No leads yet" /> : (
          <ul className="divide-y divide-slate-100">
            {leads.data.map((l) => (
              <li key={l.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <Badge className={l.kind === 'demo' ? 'bg-cyan-50 text-cyan-800 ring-cyan-600/20' : 'bg-slate-100 text-slate-700 ring-slate-500/20'}>{l.kind === 'demo' ? 'Demo' : 'Contact'}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-900">{l.name} {l.company && <span className="font-normal text-slate-500">· {l.company}</span>}</p>
                  <p className="text-xs text-slate-500">{l.email}{l.phone && ` · ${l.phone}`}{l.fleet_size && ` · Fleet: ${l.fleet_size}`}</p>
                  {l.message && <p className="mt-2 text-sm text-slate-700">{l.message}</p>}
                </div>
                <span className="text-xs text-slate-400">{fmtDateTime(l.created_at)}</span>
                <Select value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} className="w-32">
                  <option value="new">New</option><option value="contacted">Contacted</option><option value="won">Won</option><option value="lost">Lost</option>
                </Select>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageBody>
  )
}
