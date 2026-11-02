import { CheckCircle2 } from 'lucide-react'
import { PageHero } from '../../components/marketing/MarketingLayout'
import { LeadForm } from './LeadForm'

export default function RequestDemo() {
  return (
    <>
      <PageHero eyebrow="Request a Demo" title="See Drevantix in Action" text="Get a personalized walkthrough of our live tracking portal, tailored to your fleet and industry." />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div>
          <h2 className="text-xl font-semibold text-navy-900">In your 30-minute demo</h2>
          <ul className="mt-5 space-y-4">
            {['Live fleet map & real-time alerts', 'Trip history and route playback', 'Geofences, drivers and reports', 'Hardware options & installation', 'Pricing tailored to your fleet'].map((t) => (
              <li key={t} className="flex gap-3 text-sm text-slate-700">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-500" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 shadow-sm md:p-8">
          <LeadForm kind="demo" />
        </div>
      </section>
    </>
  )
}
