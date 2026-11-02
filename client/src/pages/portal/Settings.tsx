import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { PageBody } from '../../components/portal/PortalLayout'
import { Button, Card, CardHeader, ErrorText, Field, Input, Modal, PageHeader, Select } from '../../components/ui'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useFleet } from '../../lib/fleet'
import { fmtDate } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import type { User } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export default function Settings() {
  const { user } = useAuth()
  const { companyId, scopeKey } = useFleet()
  const { t } = useI18n()
  const roleLabel = (r?: string) => (r === 'admin' ? t('admin', 'مدير المنصة') : r === 'manager' ? t('manager', 'مدير') : r === 'viewer' ? t('viewer', 'مشاهد') : r ?? '')
  const canManage = user?.role === 'manager' || (user?.role === 'admin' && !!companyId)
  const users = useApi<(User & { created_at: number })[]>(canManage ? '/users' : null, undefined, [scopeKey])
  const [pw, setPw] = useState({ current: '', next: '' })
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [adding, setAdding] = useState(false)

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    try {
      await api('/auth/password', { method: 'PUT', body: pw })
      setPw({ current: '', next: '' })
      setPwMsg({ ok: true, text: t('Password updated.', 'تم تحديث كلمة المرور.') })
    } catch (err) {
      setPwMsg({ ok: false, text: (err as Error).message })
    }
  }
  async function removeUser(u: User) {
    if (!confirm(t(`Remove ${u.name}?`, `إزالة ${u.name}؟`))) return
    await api(`/users/${u.id}`, { method: 'DELETE' })
    users.reload()
  }

  return (
    <PageBody>
      <PageHeader title={t('Settings', 'الإعدادات')} subtitle={t('Your account and team', 'حسابك وفريقك')} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title={t('Profile', 'الملف الشخصي')} />
          <dl className="divide-y divide-slate-100 text-sm">
            {[
              [t('Name', 'الاسم'), user?.name],
              [t('Email', 'البريد الإلكتروني'), user?.email],
              [t('Role', 'الدور'), roleLabel(user?.role)],
              [t('Company', 'الشركة'), user?.company?.name ?? 'Drevantix'],
              [t('Plan', 'الباقة'), user?.company?.plan ?? '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between px-5 py-3"><dt className="text-slate-500">{l}</dt><dd className="font-medium text-navy-900 capitalize">{v}</dd></div>
            ))}
          </dl>
        </Card>
        <Card>
          <CardHeader title={t('Change password', 'تغيير كلمة المرور')} />
          <form onSubmit={changePassword} className="space-y-4 p-5">
            <Field label={t('Current password', 'كلمة المرور الحالية')}><Input type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
            <Field label={t('New password', 'كلمة المرور الجديدة')} hint={t('At least 6 characters', '6 أحرف على الأقل')}><Input type="password" required minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
            {pwMsg && <p className={`text-sm ${pwMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{pwMsg.text}</p>}
            <Button type="submit">{t('Update password', 'تحديث كلمة المرور')}</Button>
          </form>
        </Card>
      </div>
      {canManage && (
        <Card className="mt-6">
          <CardHeader title={t('Team members', 'أعضاء الفريق')} subtitle={t('People who can access this portal', 'الأشخاص الذين يمكنهم الوصول إلى البوابة')} action={<Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> {t('Invite user', 'دعوة مستخدم')}</Button>} />
          <table className="w-full text-start text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase"><tr><th className="px-5 py-3">{t('Name', 'الاسم')}</th><th className="px-5 py-3">{t('Email', 'البريد الإلكتروني')}</th><th className="px-5 py-3">{t('Role', 'الدور')}</th><th className="px-5 py-3">{t('Added', 'تاريخ الإضافة')}</th><th /></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.data?.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-medium text-navy-900">{u.name}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3 text-slate-600 capitalize">{roleLabel(u.role)}</td>
                  <td className="px-5 py-3 text-slate-500">{fmtDate(u.created_at)}</td>
                  <td className="px-5 py-3 text-end">
                    {u.id !== user?.id && <button onClick={() => removeUser(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={t('Remove', 'إزالة')}><Trash2 className="h-4 w-4" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {adding && <AddUser onClose={() => setAdding(false)} onSaved={() => { setAdding(false); users.reload() }} />}
    </PageBody>
  )
}

function AddUser({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' })
  const [error, setError] = useState<string | null>(null)
  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      await api('/users', { method: 'POST', body: form })
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    }
  }
  return (
    <Modal open onClose={onClose} title={t('Invite user', 'دعوة مستخدم')}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t('Name', 'الاسم')}><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label={t('Email', 'البريد الإلكتروني')}><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label={t('Temporary password', 'كلمة مرور مؤقتة')}><Input required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label={t('Role', 'الدور')}>
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="viewer">{t('Viewer (read-only)', 'مشاهد (قراءة فقط)')}</option>
            <option value="manager">{t('Manager (full access)', 'مدير (صلاحيات كاملة)')}</option>
          </Select>
        </Field>
        <ErrorText error={error} />
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>{t('Cancel', 'إلغاء')}</Button><Button type="submit">{t('Create user', 'إنشاء المستخدم')}</Button></div>
      </form>
    </Modal>
  )
}
