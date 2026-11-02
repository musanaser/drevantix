import type { AlertType, VehicleStatus } from './types'

export const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
export const fmtDateTime = (ts: number) =>
  new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
export const fmtDate = (ts: number) => new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
export const fmtKm = (km: number) => `${km.toLocaleString(undefined, { maximumFractionDigits: km < 100 ? 1 : 0 })} km`

export function fmtDuration(ms: number) {
  const m = Math.round(ms / 60000)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

export function timeAgo(ts: number | null) {
  if (!ts) return 'never'
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export const STATUS_META: Record<VehicleStatus, { label: string; color: string; badge: string }> = {
  moving: { label: 'Moving', color: '#10b981', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  idle: { label: 'Idle', color: '#f59e0b', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  stopped: { label: 'Stopped', color: '#3b82f6', badge: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  offline: { label: 'Offline', color: '#94a3b8', badge: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
}

export const ALERT_LABEL: Record<AlertType, string> = {
  overspeed: 'Overspeed',
  geofence_enter: 'Geofence entry',
  geofence_exit: 'Geofence exit',
  low_fuel: 'Low fuel',
  idling: 'Excessive idling',
  harsh_braking: 'Harsh braking',
}

export const SEVERITY_BADGE = {
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  critical: 'bg-red-50 text-red-700 ring-red-600/20',
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
