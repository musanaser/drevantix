import { INDUSTRIES } from '../../components/marketing/content'
import { PageHero } from '../../components/marketing/MarketingLayout'

export default function Industries() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Built for the Sectors That Keep the Kingdom Moving"
        text="Every industry moves differently. Our platforms are configured around your operations, compliance needs and goals."
      />
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-20 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {INDUSTRIES.map((i) => (
          <div key={i.title} className="group rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-800 to-navy-600 text-cyan-300 transition group-hover:from-cyan-500 group-hover:to-sky-600 group-hover:text-white">
              <i.icon className="h-7 w-7" />
            </span>
            <p className="mt-5 font-display text-lg font-semibold text-navy-900">{i.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{i.text}</p>
          </div>
        ))}
      </section>
    </>
  )
}
