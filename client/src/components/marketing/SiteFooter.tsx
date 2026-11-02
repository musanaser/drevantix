import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../lib/i18n'
import { Logo } from '../Logo'
import { NAV } from './SiteHeader'

export function CtaBand() {
  const { t } = useI18n()
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="grid-glow absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-8 md:flex-row lg:px-8">
        <Logo light tagline />
        <div className="hidden h-12 w-px bg-white/20 md:block" />
        <div className="flex-1 text-center md:text-start">
          <p className="font-display text-lg font-semibold text-white">{t('Ready to Transform Your Business?', 'هل أنت مستعد لتطوير أعمالك؟')}</p>
          <p className="text-sm text-slate-300">{t('Let’s build a smarter, more connected future — together.', 'لنبنِ معاً مستقبلاً أذكى وأكثر ترابطاً.')}</p>
        </div>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-3 text-sm font-semibold text-navy-900 transition hover:bg-cyan-300">
          {t('Contact Us', 'تواصل معنا')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  )
}

export function SiteFooter() {
  const { t, tx } = useI18n()
  return (
    <footer className="bg-navy-950 text-slate-400">
      <CtaBand />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {t(
              'Advanced IT solutions and custom platforms, including real-time vehicle tracking, built in Saudi Arabia for the region.',
              'حلول تقنية متقدمة ومنصات مخصصة، تشمل التتبع اللحظي للمركبات، مطوّرة في المملكة العربية السعودية لخدمة المنطقة.',
            )}
          </p>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">{t('Company', 'الشركة')}</p>
          <ul className="space-y-2 text-sm">
            {NAV.slice(1).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-cyan-300">{tx(n.label)}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">{t('Platform', 'المنصة')}</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/solutions#vehicle-tracking" className="hover:text-cyan-300">{t('Vehicle Tracking', 'تتبع المركبات')}</Link></li>
            <li><Link to="/solutions#fleet-management" className="hover:text-cyan-300">{t('Fleet Management', 'إدارة الأساطيل')}</Link></li>
            <li><Link to="/solutions#custom-it" className="hover:text-cyan-300">{t('Custom IT Platforms', 'منصات تقنية مخصصة')}</Link></li>
            <li><Link to="/solutions#iot" className="hover:text-cyan-300">{t('IoT & Smart Systems', 'إنترنت الأشياء والأنظمة الذكية')}</Link></li>
            <li><Link to="/login" className="hover:text-cyan-300">{t('Customer Portal', 'بوابة العملاء')}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">{t('Get in touch', 'تواصل معنا')}</p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-cyan-400" /> {t('King Fahd Road, Riyadh, Saudi Arabia', 'طريق الملك فهد، الرياض، المملكة العربية السعودية')}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-cyan-400" /> <span dir="ltr">+966 11 000 0000</span></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-cyan-400" /> info@drevantix.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs">
        © {new Date().getFullYear()} Drevantix. {t('All rights reserved.', 'جميع الحقوق محفوظة.')}
      </div>
    </footer>
  )
}
