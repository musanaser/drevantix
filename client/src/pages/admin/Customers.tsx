import { Building2, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageBody } from '../../components/portal/PortalLayout'
import { Badge, Button, Card, EmptyState, ErrorText, Field, Input, Modal, PageHeader, Select, Spinner } from '../../components/ui'
import { api } from '../../lib/api'
import { useFleet } from '../../lib/fleet'
import { fmtDate } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import type { Company } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export default function Customers() {
  const companies = useApi<Company[]>('/admin/companies', { companyId: undefined })
  const { setCompanyId } = useFleet()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [adding, setAdding] = useState(false)

  return (
    <PageBody>
      <PageHeader title={t('Customers', 'العملاء')} subtitle={t('Companies using the Drevantix platform', 'الشركات التي تستخدم منصة دريفانتكس')} actions={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> {t('New customer', 'عميل جديد')}</Button>} />
      <Card>
        {companies.loading && !companies.data ? <Spinner /> : !companies.data?.length ? <EmptyState icon={<Building2 className="h-5 w-5" />} title={t('No customers yet', 'لا يوجد عملاء بعد')} /> : (
          <table className="w-full text-start text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase"><tr>{[t('Company', 'الشركة'), t('Plan', 'الباقة'), t('Vehicles', 'المركبات'), t('Users', 'المستخدمون'), t('Open alerts', 'تنبيهات مفتوحة'), t('Since', 'منذ')].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}<th /></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {companies.data.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3"><p className="font-semibold text-navy-900">{c.name}</p><p className="text-xs text-slate-500">{c.contact_email}</p></td>
                  <td className="px-5 py-3"><Badge className="bg-cyan-50 text-cyan-800 ring-cyan-600/20 capitalize">{c.plan}</Badge></td>
                  <td className="px-5 py-3 text-slate-600">{c.vehicles}</td>
                  <td className="px-5 py-3 text-slate-600">{c.users}</td>
                  <td className="px-5 py-3 text-slate-600">{c.open_alerts}</td>
                  <td className="px-5 py-3 text-slate-500">{fmtDate(c.created_at)}</td>
                  <td className="px-5 py-3 text-end">
                    <Button size="sm" variant="secondary" onClick={() => { setCompanyId(c.id); navigate('/portal') }}>{t('View fleet', 'عرض الأسطول')}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {adding && <NewCustomer onClose={() => setAdding(false)} onSaved={() => { setAdding(false); companies.reload() }} />}
    </PageBody>
  )
}

function NewCustomer({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: '', contact_email: '', phone: '', plan: 'business', manager_name: '', manager_email: '', manager_password: '' })
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      await api('/admin/companies', { method: 'POST', body: f })
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    }
  }
  return (
    <Modal open onClose={onClose} title={t('New customer', 'عميل جديد')}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label={t('Company name', 'اسم الشركة')}><Input required value={f.name} onChange={set('name')} /></Field></div>
        <Field label={t('Contact email', 'بريد التواصل')}><Input type="email" required value={f.contact_email} onChange={set('contact_email')} /></Field>
        <Field label={t('Phone', 'الجوال')}><Input value={f.phone} onChange={set('phone')} /></Field>
        <Field label={t('Plan', 'الباقة')}>
          <Select value={f.plan} onChange={set('plan')}><option value="starter">{t('Starter', 'المبتدئة')}</option><option value="business">{t('Business', 'الأعمال')}</option><option value="enterprise">{t('Enterprise', 'المؤسسات')}</option></Select>
        </Field>
        <div className="sm:col-span-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 uppercase">{t('Portal manager account', 'حساب مدير البوابة')}</div>
        <Field label={t('Manager name', 'اسم المدير')}><Input required value={f.manager_name} onChange={set('manager_name')} /></Field>
        <Field label={t('Manager email', 'بريد المدير')}><Input type="email" required value={f.manager_email} onChange={set('manager_email')} /></Field>
        <Field label={t('Temporary password', 'كلمة مرور مؤقتة')}><Input required minLength={6} value={f.manager_password} onChange={set('manager_password')} /></Field>
        <div className="sm:col-span-2"><ErrorText error={error} /></div>
        <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={onClose}>{t('Cancel', 'إلغاء')}</Button><Button type="submit">{t('Create customer', 'إنشاء العميل')}</Button></div>
      </form>
    </Modal>
  )
}
