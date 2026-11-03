import { MousePointerClick, Pencil, Plus, Shapes, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Circle } from 'react-leaflet'
import { FleetMap } from '../../components/portal/FleetMap'
import { PageBody } from '../../components/portal/PortalLayout'
import { Button, Card, CardHeader, EmptyState, ErrorText, Field, Input, PageHeader } from '../../components/ui'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useFleet } from '../../lib/fleet'
import { place } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import type { Geofence } from '../../lib/types'
import { useApi } from '../../lib/useApi'

const COLORS = ['#22d3ee', '#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#ef4444']
type Draft = { id?: number; name: string; lat: number; lng: number; radius_m: number; color: string }

export default function Geofences() {
  const { user } = useAuth()
  const { vehicles, scopeKey, companyId } = useFleet()
  const { t } = useI18n()
  const fences = useApi<Geofence[]>('/geofences', undefined, [scopeKey])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canEdit = user?.role === 'manager' || (user?.role === 'admin' && !!companyId)

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!draft) return
    try {
      if (draft.id) await api(`/geofences/${draft.id}`, { method: 'PUT', body: draft })
      else await api('/geofences', { method: 'POST', body: draft })
      setDraft(null)
      fences.reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }
  async function remove(g: Geofence) {
    if (!confirm(t(`Delete geofence "${g.name}"?`, `حذف المنطقة "${place(g.name)}"؟`))) return
    await api(`/geofences/${g.id}`, { method: 'DELETE' })
    fences.reload()
  }

  return (
    <PageBody>
      <PageHeader
        title={t('Geofences', 'المناطق الجغرافية')}
        subtitle={t('Get notified when vehicles enter or leave important locations.', 'احصل على إشعار عند دخول المركبات إلى المواقع المهمة أو خروجها منها.')}
        actions={canEdit && <Button onClick={() => setDraft({ name: '', lat: 24.7136, lng: 46.6753, radius_m: 500, color: COLORS[0] })}><Plus className="h-4 w-4" /> {t('New geofence', 'منطقة جديدة')}</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          {draft && (
            <div className="flex items-center gap-2 bg-cyan-50 px-5 py-2 text-xs text-cyan-800">
              <MousePointerClick className="h-4 w-4" /> {t('Click on the map to set the geofence centre.', 'انقر على الخريطة لتحديد مركز المنطقة.')}
            </div>
          )}
          <div className="h-[560px]">
            <FleetMap
              vehicles={vehicles}
              geofences={(fences.data ?? []).filter((g) => g.id !== draft?.id)}
              showLabels={false}
              onMapClick={draft ? (lat, lng) => setDraft({ ...draft, lat, lng }) : undefined}
              fitKey={scopeKey}
            >
              {draft && <Circle center={[draft.lat, draft.lng]} radius={draft.radius_m} pathOptions={{ color: draft.color, fillOpacity: 0.25, weight: 3 }} />}
            </FleetMap>
          </div>
        </Card>
        <div className="space-y-6">
          {draft && (
            <Card>
              <CardHeader title={draft.id ? t('Edit geofence', 'تعديل المنطقة') : t('New geofence', 'منطقة جديدة')} />
              <form onSubmit={save} className="space-y-4 p-5">
                <Field label={t('Name', 'الاسم')}><Input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder={t('e.g. Main warehouse', 'مثال: المستودع الرئيسي')} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('Latitude', 'خط العرض')}><Input type="number" step="any" value={draft.lat} onChange={(e) => setDraft({ ...draft, lat: Number(e.target.value) })} /></Field>
                  <Field label={t('Longitude', 'خط الطول')}><Input type="number" step="any" value={draft.lng} onChange={(e) => setDraft({ ...draft, lng: Number(e.target.value) })} /></Field>
                </div>
                <Field label={t(`Radius: ${draft.radius_m} m`, `نصف القطر: ${draft.radius_m} م`)}>
                  <input type="range" min={100} max={5000} step={50} value={draft.radius_m} onChange={(e) => setDraft({ ...draft, radius_m: Number(e.target.value) })} className="w-full accent-cyan-500" />
                </Field>
                <Field label={t('Colour', 'اللون')}>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button type="button" key={c} onClick={() => setDraft({ ...draft, color: c })} className={`h-7 w-7 rounded-full ring-offset-2 ${draft.color === c ? 'ring-2 ring-navy-800' : ''}`} style={{ background: c }} aria-label={c} />
                    ))}
                  </div>
                </Field>
                <ErrorText error={error} />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setDraft(null)}>{t('Cancel', 'إلغاء')}</Button>
                  <Button type="submit">{t('Save', 'حفظ')}</Button>
                </div>
              </form>
            </Card>
          )}
          <Card>
            <CardHeader title={t('Your geofences', 'مناطقك الجغرافية')} subtitle={t(`${fences.data?.length ?? 0} zones`, `${fences.data?.length ?? 0} منطقة`)} />
            {!fences.data?.length ? <EmptyState icon={<Shapes className="h-5 w-5" />} title={t('No geofences yet', 'لا توجد مناطق بعد')} /> : (
              <ul className="divide-y divide-slate-100">
                {fences.data.map((g) => (
                  <li key={g.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: g.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy-900">{place(g.name)}</p>
                      <p className="text-xs text-slate-500">{t(`Radius ${Math.round(g.radius_m)} m`, `نصف القطر ${Math.round(g.radius_m)} م`)}</p>
                    </div>
                    {canEdit && (
                      <>
                        <button onClick={() => setDraft(g)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-800" aria-label={t('Edit', 'تعديل')}><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(g)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={t('Delete', 'حذف')}><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </PageBody>
  )
}
