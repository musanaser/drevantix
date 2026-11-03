import { getLang } from './i18n'
import type { AlertType, VehicleStatus } from './types'

const ar = () => getLang() === 'ar'
const locale = () => (ar() ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB')

export const fmtNum = (n: number, digits = 0) => n.toLocaleString(locale(), { maximumFractionDigits: digits })
export const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit', hour12: true })
export const fmtDateTime = (ts: number) =>
  new Date(ts).toLocaleString(locale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
export const fmtDate = (ts: number) => new Date(ts).toLocaleDateString(locale(), { month: 'short', day: 'numeric', year: 'numeric' })
export const fmtKm = (km: number) => `${fmtNum(km, km < 100 ? 1 : 0)} ${ar() ? 'كم' : 'km'}`
export const fmtSpeed = (kmh: number) => `${Math.round(kmh)} ${ar() ? 'كم/س' : 'km/h'}`

export function fmtDuration(ms: number) {
  const m = Math.round(ms / 60000)
  if (m < 60) return ar() ? `${m} د` : `${m} min`
  const h = Math.floor(m / 60)
  return ar() ? `${h} س ${m % 60} د` : `${h}h ${m % 60}m`
}

export function timeAgo(ts: number | null) {
  const a = ar()
  if (!ts) return a ? 'أبداً' : 'never'
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (s < 10) return a ? 'الآن' : 'just now'
  if (s < 60) return a ? `منذ ${s} ث` : `${s}s ago`
  if (s < 3600) return a ? `منذ ${Math.floor(s / 60)} د` : `${Math.floor(s / 60)} min ago`
  if (s < 86400) return a ? `منذ ${Math.floor(s / 3600)} س` : `${Math.floor(s / 3600)}h ago`
  return a ? `منذ ${Math.floor(s / 86400)} يوم` : `${Math.floor(s / 86400)}d ago`
}

export const STATUS_META: Record<VehicleStatus, { en: string; ar: string; color: string; badge: string }> = {
  moving: { en: 'Moving', ar: 'متحركة', color: '#10b981', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  idle: { en: 'Idle', ar: 'خاملة', color: '#f59e0b', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  stopped: { en: 'Stopped', ar: 'متوقفة', color: '#3b82f6', badge: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  offline: { en: 'Offline', ar: 'غير متصلة', color: '#94a3b8', badge: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
}
export const statusLabel = (s: VehicleStatus) => STATUS_META[s][getLang()]

const ALERT_LABELS: Record<AlertType, { en: string; ar: string }> = {
  overspeed: { en: 'Overspeed', ar: 'تجاوز السرعة' },
  geofence_enter: { en: 'Geofence entry', ar: 'دخول منطقة' },
  geofence_exit: { en: 'Geofence exit', ar: 'خروج من منطقة' },
  low_fuel: { en: 'Low fuel', ar: 'وقود منخفض' },
  idling: { en: 'Excessive idling', ar: 'تشغيل خامل مطوّل' },
  harsh_braking: { en: 'Harsh braking', ar: 'فرملة حادة' },
}
export const ALERT_TYPES = Object.keys(ALERT_LABELS) as AlertType[]
export const alertLabel = (t: AlertType) => ALERT_LABELS[t][getLang()]

const SEVERITY_LABELS = { info: { en: 'info', ar: 'معلومة' }, warning: { en: 'warning', ar: 'تحذير' }, critical: { en: 'critical', ar: 'حرج' } }
export const severityLabel = (s: keyof typeof SEVERITY_LABELS) => SEVERITY_LABELS[s][getLang()]

/** Riyadh place names used by routes and geofences. */
const PLACES: Record<string, string> = {
  Olaya: 'العليا',
  KAFD: 'مركز الملك عبدالله المالي',
  'Kingdom Centre': 'برج المملكة',
  'King Saud University': 'جامعة الملك سعود',
  'King Khalid Airport': 'مطار الملك خالد',
  'Princess Nourah University': 'جامعة الأميرة نورة',
  'Al Malaz': 'الملز',
  'Al Rawdah': 'الروضة',
  'Al Dirah': 'الديرة',
  'Al Nakheel': 'النخيل',
  'Al Qirawan': 'القيروان',
  'Al Shifa': 'الشفا',
  Granada: 'غرناطة',
  'Al Faisaliah': 'الفيصلية',
  'Al Sulay': 'السلي',
  'Al Yarmouk': 'اليرموك',
  'Diplomatic Quarter': 'الحي الدبلوماسي',
  'Riyadh Park': 'الرياض بارك',
  'Olaya Hub': 'مركز العليا',
  'Granada Hub': 'مركز غرناطة',
  'Sulay Site': 'موقع السلي',
  '2nd Industrial City': 'المدينة الصناعية الثانية',
  'Riyadh Dry Port': 'الميناء الجاف بالرياض',
  'Main Depot – Dry Port': 'المستودع الرئيسي – الميناء الجاف',
  '2nd Industrial City Warehouse': 'مستودع المدينة الصناعية الثانية',
  'KAFD Client Site': 'موقع العميل – المركز المالي',
  'Airport Cargo Terminal': 'مبنى الشحن بالمطار',
}
export const place = (name: string | null | undefined) => (!name ? '' : ar() ? (PLACES[name] ?? name) : name)
export const PLACE_NAMES = PLACES

/** Localizes server-generated alert messages (stored in English). */
export function alertMessage(a: { type: AlertType; message: string }) {
  if (!ar()) return a.message
  const m = a.message
  const num = (re: RegExp) => m.match(re)?.slice(1) ?? []
  const vehicle = m.match(/^(.+?) (overspeeding|harsh braking|entered|exited|low fuel|idling|has been idling)/)?.[1] ?? ''
  switch (a.type) {
    case 'overspeed': {
      const [s, lim] = num(/(\d+) km\/h \(limit (\d+)/)
      return `${vehicle} تجاوزت السرعة: ${s} كم/س (الحد ${lim} كم/س)`
    }
    case 'harsh_braking': {
      const [s] = num(/at (\d+) km\/h/)
      return `فرملة حادة لـ ${vehicle} على سرعة ${s} كم/س`
    }
    case 'geofence_enter':
    case 'geofence_exit': {
      const [g] = num(/"(.+)"/)
      return `${vehicle} ${a.type === 'geofence_enter' ? 'دخلت' : 'خرجت من'} المنطقة "${place(g)}"`
    }
    case 'low_fuel': {
      const [p] = num(/(\d+)%/)
      return `وقود منخفض في ${vehicle}: متبقٍ ${p}%`
    }
    case 'idling': {
      const [mins] = num(/(\d+) min/)
      return mins ? `${vehicle} في وضع التشغيل الخامل منذ ${mins} دقيقة` : `${vehicle} في وضع التشغيل الخامل لفترة طويلة`
    }
  }
  return m
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
  const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
