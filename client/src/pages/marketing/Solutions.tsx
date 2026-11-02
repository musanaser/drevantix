import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SOLUTIONS } from '../../components/marketing/content'
import { PageHero } from '../../components/marketing/MarketingLayout'

export default function Solutions() {
  return (
    <>
      <PageHero
        eyebrow="Our Solutions"
        title="Integrated Technology for a Smarter Future"
        text="From vehicle tracking to custom IT platforms, we build intelligent solutions that connect, protect and empower your business."
      />
      <div className="mx-auto max-w-7xl space-y-20 px-5 py-20 lg:px-8">
        {SOLUTIONS.map((s, i) => (
          <section key={s.id} id={s.id} className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-2">
            <div className={i % 2 ? 'lg:order-2' : ''}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-brand">
                <s.icon className="h-6 w-6 text-brand" />
              </span>
              <h2 className="mt-5 text-3xl font-bold text-navy-900">{s.title}</h2>
              <p className="mt-2 text-lg text-cyan-600">{s.text}</p>
              <p className="mt-4 leading-relaxed text-slate-600">{s.long}</p>
              <ul className="mt-6 space-y-3">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" /> {b}
                  </li>
                ))}
              </ul>
              <Link to="/request-demo" className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-cyan-300">
                Request a Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-cyan-100 to-blue-100" />
              <img src={s.image} alt={s.title} className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" />
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
