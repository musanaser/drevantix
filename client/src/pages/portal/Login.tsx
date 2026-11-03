import { ArrowLeft, Lock, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { Button, ErrorText, Field, Input } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useI18n } from '../../lib/i18n'
import { LangToggle } from '../../components/LangToggle'

const DEMO_ACCOUNTS = [
  { label: { en: 'Fleet manager', ar: 'مدير الأسطول' }, email: 'demo@drevantix.com', password: 'demo123' },
  { label: { en: 'Read-only viewer', ar: 'مشاهد فقط' }, email: 'viewer@drevantix.com', password: 'viewer123' },
  { label: { en: 'Drevantix admin', ar: 'مدير دريفانتكس' }, email: 'admin@drevantix.com', password: 'admin123' },
]

export default function Login() {
  const { user, login } = useAuth()
  const { t, tx } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const from = (location.state as { from?: string } | null)?.from ?? '/portal'

  if (user) return <Navigate to={from} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-900 lg:block">
        <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('/images/hero-scene.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/60 to-navy-900/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/">
            <Logo light tagline />
          </Link>
          <div>
            <h2 className="text-4xl leading-tight font-bold text-white">
              {t('Real-Time Visibility.', 'رؤية لحظية.')}
              <br />
              <span className="text-cyan-400">{t('Smarter', 'قرارات')}</span> {t('Decisions.', 'أذكى.')}
            </h2>
            <p className="mt-4 max-w-md text-slate-300">{t('Track every vehicle, receive instant alerts and turn fleet data into savings — all from one secure portal.', 'تتبّع كل مركبة، واستقبل التنبيهات فوراً، وحوّل بيانات أسطولك إلى توفير — من بوابة واحدة آمنة.')}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-800">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('Back to website', 'العودة إلى الموقع')}
            </Link>
            <LangToggle />
          </div>
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-navy-900">{t('Sign in to your portal', 'تسجيل الدخول إلى البوابة')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('Welcome back. Enter your credentials to access your fleet.', 'مرحباً بعودتك. أدخل بيانات الدخول للوصول إلى أسطولك.')}</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label={t('Email', 'البريد الإلكتروني')}>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-2.5 start-3 h-4 w-4 text-slate-400" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="ps-9" placeholder="you@company.com" autoComplete="email" />
              </div>
            </Field>
            <Field label={t('Password', 'كلمة المرور')}>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-2.5 start-3 h-4 w-4 text-slate-400" />
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="ps-9" placeholder="••••••••" autoComplete="current-password" />
              </div>
            </Field>
            <ErrorText error={error} />
            <Button type="submit" loading={loading} className="w-full py-2.5">
              {t('Sign in', 'تسجيل الدخول')}
            </Button>
          </form>
          <div className="mt-10 rounded-xl border border-dashed border-slate-300 p-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{t('Demo accounts', 'حسابات تجريبية')}</p>
            <div className="mt-3 space-y-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => {
                    setEmail(a.email)
                    setPassword(a.password)
                  }}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-start text-xs hover:bg-cyan-50"
                >
                  <span className="font-medium text-navy-900">{tx(a.label)}</span>
                  <span className="text-slate-500">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
