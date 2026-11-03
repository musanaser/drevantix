import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function MarketingLayout() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700">
      <div className="grid-glow absolute inset-0" />
      <div className="absolute -end-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <p className="text-xs font-medium tracking-[0.25em] text-cyan-300 uppercase">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white md:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-300">{text}</p>
      </div>
    </section>
  )
}

export function SectionTitle({ eyebrow, title, text, center }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="text-xs font-semibold tracking-[0.22em] text-brand uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-navy-900 md:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-relaxed text-slate-600">{text}</p>}
    </div>
  )
}
