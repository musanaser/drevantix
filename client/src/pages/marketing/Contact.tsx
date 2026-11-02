import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { PageHero } from '../../components/marketing/MarketingLayout'
import { LeadForm } from './LeadForm'

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Let’s Build Something Smarter, Together" text="Questions about our platforms, pricing or partnerships? Our team is ready to help." />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div className="space-y-6">
          {[
            [MapPin, 'Visit us', 'King Fahd Road, Al Olaya, Riyadh 12212, Saudi Arabia'],
            [Phone, 'Call us', '+966 11 000 0000'],
            [Mail, 'Email us', 'info@drevantix.com'],
            [Clock, 'Working hours', 'Sun – Thu, 8:00 AM – 6:00 PM · 24/7 monitoring support'],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Mail
            return (
              <div key={t as string} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-brand">
                  <I className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{t as string}</p>
                  <p className="text-sm text-slate-500">{d as string}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-xl font-semibold text-navy-900">Send us a message</h2>
          <LeadForm kind="contact" />
        </div>
      </section>
    </>
  )
}
