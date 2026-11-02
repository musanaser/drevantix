import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useI18n, type L } from '../../lib/i18n'
import { LangToggle } from '../LangToggle'
import { Logo } from '../Logo'

export const NAV: { to: string; label: L }[] = [
  { to: '/', label: { en: 'Home', ar: 'الرئيسية' } },
  { to: '/about', label: { en: 'About Us', ar: 'من نحن' } },
  { to: '/solutions', label: { en: 'Solutions', ar: 'الحلول' } },
  { to: '/industries', label: { en: 'Industries', ar: 'القطاعات' } },
  { to: '/technology', label: { en: 'Our Technology', ar: 'تقنياتنا' } },
  { to: '/contact', label: { en: 'Contact', ar: 'تواصل معنا' } },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { t, tx } = useI18n()
  const loginLabel = user ? t('Open Portal', 'فتح البوابة') : t('Customer Login', 'دخول العملاء')
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" aria-label="Drevantix">
          <Logo light />
        </Link>
        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `relative px-3.5 py-2 text-sm transition ${
                  isActive ? 'text-cyan-300 after:absolute after:inset-x-4 after:-bottom-[13px] after:h-0.5 after:rounded after:bg-cyan-300' : 'text-slate-200 hover:text-white'
                }`
              }
            >
              {tx(n.label)}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <LangToggle dark />
          <Link to={user ? '/portal' : '/login'} className="text-sm font-medium text-slate-200 hover:text-white">
            {loginLabel}
          </Link>
          <Link to="/request-demo" className="rounded-full border border-cyan-400 px-5 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400 hover:text-navy-900">
            {t('Request a Demo', 'اطلب عرضاً تجريبياً')}
          </Link>
        </div>
        <div className="flex items-center gap-2 xl:hidden">
          <LangToggle dark />
          <button className="rounded-lg p-2 text-white" onClick={() => setOpen(!open)} aria-label={t('Toggle menu', 'القائمة')}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-navy-900 px-5 pb-5 xl:hidden">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block border-b border-white/5 py-3 text-sm ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}
            >
              {tx(n.label)}
            </NavLink>
          ))}
          <div className="mt-4 flex gap-3">
            <Link onClick={() => setOpen(false)} to={user ? '/portal' : '/login'} className="flex-1 rounded-full border border-white/20 py-2 text-center text-sm text-white">
              {loginLabel}
            </Link>
            <Link onClick={() => setOpen(false)} to="/request-demo" className="flex-1 rounded-full bg-cyan-400 py-2 text-center text-sm font-medium text-navy-900">
              {t('Request a Demo', 'اطلب عرضاً تجريبياً')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
