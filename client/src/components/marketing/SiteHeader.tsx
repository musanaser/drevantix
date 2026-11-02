import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { Logo } from '../Logo'

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/industries', label: 'Industries' },
  { to: '/technology', label: 'Our Technology' },
  { to: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" aria-label="Drevantix home">
          <Logo light />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm transition ${
                  isActive ? 'text-cyan-300 after:absolute after:inset-x-4 after:-bottom-[13px] after:h-0.5 after:rounded after:bg-cyan-300' : 'text-slate-200 hover:text-white'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to={user ? '/portal' : '/login'} className="text-sm font-medium text-slate-200 hover:text-white">
            {user ? 'Open Portal' : 'Customer Login'}
          </Link>
          <Link
            to="/request-demo"
            className="rounded-full border border-cyan-400 px-5 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400 hover:text-navy-900"
          >
            Request a Demo
          </Link>
        </div>
        <button className="rounded-lg p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-navy-900 px-5 pb-5 lg:hidden">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block border-b border-white/5 py-3 text-sm ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}
            >
              {n.label}
            </NavLink>
          ))}
          <div className="mt-4 flex gap-3">
            <Link onClick={() => setOpen(false)} to={user ? '/portal' : '/login'} className="flex-1 rounded-full border border-white/20 py-2 text-center text-sm text-white">
              {user ? 'Open Portal' : 'Customer Login'}
            </Link>
            <Link onClick={() => setOpen(false)} to="/request-demo" className="flex-1 rounded-full bg-cyan-400 py-2 text-center text-sm font-medium text-navy-900">
              Request a Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
