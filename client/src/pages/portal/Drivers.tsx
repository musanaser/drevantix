import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { PageBody } from '../../components/portal/PortalLayout'
import { Button, Card, EmptyState, ErrorText, Field, Input, Modal, PageHeader, Spinner } from '../../components/ui'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useFleet } from '../../lib/fleet'
import { fmtKm } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import type { Driver } from '../../lib/types'
import { useApi } from '../../lib/useApi'

function score(d: Driver) {
  if (!d.distance_7d) return null
  return Math.max(0, Math.round(100 - (d.events_7d / Math.max(d.distance_7d, 1)) * 400))
}

export default function Drivers() {
  const { user } = useAuth()
  const { scopeKey, companyId, refresh } = useFleet()
  const { t } = useI18n()
  const drivers = useApi<Driver[]>('/drivers', undefined, [scopeKey])
  const [editing, setEditing] = useState<Partial<Driver> | null>(null)
  const canEdit = user?.role === 'manager' || (user?.role === 'admin' && !!companyId)

  async function remove(d: Driver) {
    if (!confirm(t(`Delete driver ${d.name}?`, `حذف السائق ${d.name}؟`))) return
    await api(`/drivers/${d.id}`, { method: 'DELETE' })
    drivers.reload()
    refresh()
  }

  return (
    <PageBody>
      <PageHeader title={t('Drivers', 'السائقون')} subtitle={t('Driver assignments and 7-day performance', 'تعيينات السائقين والأداء خلال 7 أيام')} actions={canEdit && <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> {t('Add driver', 'إضافة سائق')}</Button>} />
      <Card>
        {drivers.loading && !drivers.data ? <Spinner /> : !drivers.data?.length ? <EmptyState icon={<Users className="h-5 w-5" />} title={t('No drivers yet', 'لا يوجد سائقون بعد')} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>{[t('Driver', 'السائق'), t('License', 'الرخصة'), t('Vehicle', 'المركبة'), t('Trips (7d)', 'الرحلات (7 أيام)'), t('Distance (7d)', 'المسافة (7 أيام)'), t('Safety events', 'أحداث السلامة'), t('Safety score', 'تقييم السلامة')].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}{canEdit && <th />}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.data.map((d) => {
                  const s = score(d)
                  return (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3"><p className="font-semibold text-navy-900">{d.name}</p><p className="text-xs text-slate-500">{d.phone ?? '—'}</p></td>
                      <td className="px-4 py-3 text-slate-600">{d.license_no ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{d.vehicle_name ? `${d.vehicle_name} (${d.plate})` : t('Unassigned', 'غير معيّن')}</td>
                      <td className="px-4 py-3 text-slate-600">{d.trips_7d}</td>
                      <td className="px-4 py-3 text-slate-600">{fmtKm(d.distance_7d)}</td>
                      <td className="px-4 py-3 text-slate-600">{d.events_7d}</td>
                      <td className="px-4 py-3">
                        {s == null ? <span className="text-xs text-slate-400">—</span> : (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s >= 85 ? 'bg-emerald-50 text-emerald-700' : s >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{s}</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setEditing(d)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-800" aria-label={t('Edit', 'تعديل')}><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => remove(d)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={t('Delete', 'حذف')}><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {editing && <DriverForm driver={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); drivers.reload() }} />}
    </PageBody>
  )
}

function DriverForm({ driver, onClose, onSaved }: { driver: Partial<Driver>; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n()
  const [form, setForm] = useState({ name: driver.name ?? '', phone: driver.phone ?? '', license_no: driver.license_no ?? '' })
  const [error, setError] = useState<string | null>(null)
  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      if (driver.id) await api(`/drivers/${driver.id}`, { method: 'PUT', body: form })
      else await api('/drivers', { method: 'POST', body: form })
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    }
  }
  return (
    <Modal open onClose={onClose} title={driver.id ? t('Edit driver', 'تعديل السائق') : t('Add driver', 'إضافة سائق')}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t('Full name *', 'الاسم الكامل *')}><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label={t('Phone', 'الجوال')}><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label={t('License number', 'رقم الرخصة')}><Input value={form.license_no} onChange={(e) => setForm({ ...form, license_no: e.target.value })} /></Field>
        <ErrorText error={error} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t('Cancel', 'إلغاء')}</Button>
          <Button type="submit">{t('Save', 'حفظ')}</Button>
        </div>
      </form>
    </Modal>
  )
}
