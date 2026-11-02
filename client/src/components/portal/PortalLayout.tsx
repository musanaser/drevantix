import {
  AlertTriangle, BarChart3, Bell, Building2, Car, ChevronDown, Inbox, LayoutDashboard, LogOut, Map, Menu, Route, Settings, Shapes, Users, X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { FleetProvider, useFleet } from '../../lib/fleet'
import { ALERT_LABEL } from '../../lib/format'
import { Logo } from '../Logo'
import { Spinner } from '../ui'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner className="h-screen" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <FleetProvider>
      <PortalShell />
    </FleetProvider>
  )
}

function PortalShell() {
  const { user, logout } = useAuth()
  const { openAlerts, connected, companies, companyId, setCompanyId } = useFleet()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setMobileOpen(false), [location.pathname])

  const nav = [
    { to: '/portal', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/portal/live', label: 'Live Map', icon: Map },
    { to: '/portal/vehicles', label: 'Vehicles', icon: Car },
    { to: '/portal/trips', label: 'Trips', icon: Route },
    { to: '/portal/alerts', label: 'Alerts', icon: Bell, badge: openAlerts },
    { to: '/portal/geofences', label: 'Geofences', icon: Shapes },
    { to: '/portal/drivers', label: 'Drivers', icon: Users },
    { to: '/portal/reports', label: 'Reports', icon: BarChart3 },
    { to: '/portal/settings', label: 'Settings', icon: Settings },
  ]
  const adminNav = [
    { to: '/portal/admin/customers', label: 'Customers', icon: Building2 },
    { to: '/portal/admin/leads', label: 'Leads & Demos', icon: Inbox },
  ]

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-900">
      <div className="flex h-16 items-center px-5">
        <Link to="/">
          <Logo light />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
            <n.icon className="h-[18px] w-[18px]" />
            <span className="flex-1">{n.label}</span>
            {!!n.badge && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white">{n.badge > 99 ? '99+' : n.badge}</span>}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <>
            <p className="px-3 pt-6 pb-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Platform admin</p>
            {adminNav.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkCls}>
                <n.icon className="h-[18px] w-[18px]" />
                {n.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-semibold text-white">
            {user?.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-400 capitalize">{user?.role === 'admin' ? 'Drevantix admin' : `${user?.role} · ${user?.company?.name}`}</p>
          </div>
          <button onClick={logout} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" title="Sign out" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-[1500] lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64">{sidebar}</div>
          <button className="absolute top-4 left-68 rounded-lg bg-white/10 p-2 text-white" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-8">
          <button className="rounded-lg p-2 text-slate-600 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          {user?.role === 'admin' ? (
            <div className="relative">
              <select
                value={companyId ?? ''}
                onChange={(e) => setCompanyId(e.target.value ? Number(e.target.value) : null)}
                className="appearance-none rounded-lg border-0 bg-slate-100 py-2 pr-9 pl-3 text-sm font-medium text-navy-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                aria-label="Customer scope"
              >
                <option value="">All customers</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-slate-500" />
            </div>
          ) : (
            <p className="truncate font-display text-sm font-semibold text-navy-900">{user?.company?.name}</p>
          )}
          <div className="ml-auto flex items-center gap-4">
            <span className={`hidden items-center gap-2 text-xs font-medium sm:flex ${connected ? 'text-emerald-600' : 'text-slate-400'}`}>
              <span className={`h-2 w-2 rounded-full ${connected ? 'animate-pulse bg-emerald-500' : 'bg-slate-300'}`} />
              {connected ? 'Live' : 'Connecting…'}
            </span>
            <Link to="/portal/alerts" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Alerts">
              <Bell className="h-5 w-5" />
              {openAlerts > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
            </Link>
          </div>
        </header>
        <main className="relative flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <AlertToasts />
    </div>
  )
}

function AlertToasts() {
  const { liveAlerts, dismissAlert } = useFleet()
  useEffect(() => {
    if (!liveAlerts.length) return
    const t = setTimeout(() => dismissAlert(liveAlerts[liveAlerts.length - 1].id), 7000)
    return () => clearTimeout(t)
  }, [liveAlerts, dismissAlert])
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[1800] flex w-80 flex-col gap-2">
      {liveAlerts.map((a) => (
        <div key={a.id} className="pointer-events-auto flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <AlertTriangle className={`h-5 w-5 shrink-0 ${a.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900">{ALERT_LABEL[a.type]}</p>
            <p className="text-xs text-slate-600">{a.message}</p>
          </div>
          <button onClick={() => dismissAlert(a.id)} className="self-start text-slate-400 hover:text-slate-600" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1400px] p-4 lg:p-8">{children}</div>
}
