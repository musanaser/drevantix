import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../Logo'
import { NAV } from './SiteHeader'

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="grid-glow absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-8 md:flex-row lg:px-8">
        <Logo light tagline />
        <div className="hidden h-12 w-px bg-white/20 md:block" />
        <div className="flex-1 text-center md:text-left">
          <p className="font-display text-lg font-semibold text-white">Ready to Transform Your Business?</p>
          <p className="text-sm text-slate-300">Let&apos;s build a smarter, more connected future — together.</p>
        </div>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-3 text-sm font-semibold text-navy-900 transition hover:bg-cyan-300">
          Contact Us <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-slate-400">
      <CtaBand />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Advanced IT solutions and custom platforms, including real-time vehicle tracking, built in Saudi Arabia for the region.
          </p>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Company</p>
          <ul className="space-y-2 text-sm">
            {NAV.slice(1).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-cyan-300">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Platform</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/solutions#vehicle-tracking" className="hover:text-cyan-300">Vehicle Tracking</Link></li>
            <li><Link to="/solutions#fleet-management" className="hover:text-cyan-300">Fleet Management</Link></li>
            <li><Link to="/solutions#custom-it" className="hover:text-cyan-300">Custom IT Platforms</Link></li>
            <li><Link to="/solutions#iot" className="hover:text-cyan-300">IoT &amp; Smart Systems</Link></li>
            <li><Link to="/login" className="hover:text-cyan-300">Customer Portal</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Get in touch</p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-cyan-400" /> King Fahd Road, Riyadh, Saudi Arabia</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-cyan-400" /> +966 11 000 0000</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-cyan-400" /> info@drevantix.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs">© {new Date().getFullYear()} Drevantix. All rights reserved.</div>
    </footer>
  )
}
