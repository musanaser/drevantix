import { CheckCircle2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button, ErrorText, Field, Input, Select, Textarea } from '../../components/ui'
import { api } from '../../lib/api'
import { useI18n } from '../../lib/i18n'

export function LeadForm({ kind }: { kind: 'demo' | 'contact' }) {
  const { t } = useI18n()
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', fleet_size: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const body = Object.fromEntries(Object.entries({ kind, ...form }).filter(([, v]) => v !== ''))
      await api('/public/leads', { method: 'POST', body })
      setDone(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (done)
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        <p className="mt-4 font-display text-xl font-semibold text-navy-900">{t(`Thank you, ${form.name.split(' ')[0]}!`, `شكراً لك يا ${form.name.split(' ')[0]}!`)}</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          {kind === 'demo' ? t('Our team will contact you within one business day to schedule your personalized demo.', 'سيتواصل معك فريقنا خلال يوم عمل واحد لتحديد موعد العرض التجريبي.') : t('We received your message and will get back to you shortly.', 'استلمنا رسالتك وسنرد عليك قريباً.')}
        </p>
      </div>
    )

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label={t('Full name *', 'الاسم الكامل *')}>
        <Input required value={form.name} onChange={set('name')} placeholder={t('Your name', 'اسمك')} />
      </Field>
      <Field label={t('Work email *', 'البريد الإلكتروني للعمل *')}>
        <Input required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />
      </Field>
      <Field label={t('Company', 'الشركة')}>
        <Input value={form.company} onChange={set('company')} placeholder={t('Company name', 'اسم الشركة')} />
      </Field>
      <Field label={t('Phone', 'الجوال')}>
        <Input value={form.phone} onChange={set('phone')} placeholder="+966 5x xxx xxxx" dir="ltr" />
      </Field>
      {kind === 'demo' && (
        <Field label={t('Fleet size', 'حجم الأسطول')}>
          <Select value={form.fleet_size} onChange={set('fleet_size')}>
            <option value="">{t('Select…', 'اختر…')}</option>
            <option>1-10</option>
            <option>11-50</option>
            <option>51-200</option>
            <option>200+</option>
          </Select>
        </Field>
      )}
      <div className="sm:col-span-2">
        <Field label={kind === 'demo' ? t('What would you like to see?', 'ما الذي تود رؤيته؟') : t('Message *', 'الرسالة *')}>
          <Textarea required={kind === 'contact'} rows={4} value={form.message} onChange={set('message')} placeholder={t('Tell us about your needs…', 'أخبرنا عن احتياجاتك…')} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <ErrorText error={error} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant="accent" loading={loading} className="w-full rounded-full py-3 sm:w-auto sm:px-8">
          {kind === 'demo' ? t('Request My Demo', 'اطلب العرض التجريبي') : t('Send Message', 'إرسال الرسالة')}
        </Button>
      </div>
    </form>
  )
}
