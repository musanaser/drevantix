import { Eye, Lightbulb, ShieldCheck, Target, Users } from 'lucide-react'
import { PageHero, SectionTitle } from '../../components/marketing/MarketingLayout'

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Smarter Technology. Safer Tomorrow."
        text="Drevantix is a Saudi technology company building intelligent platforms that help organizations see, protect and optimize their operations."
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <SectionTitle
          eyebrow="Who we are"
          title="Engineers, Designers and Operators — Under One Roof"
          text="We combine deep expertise in telematics, cloud software and IoT to deliver solutions that work in the real world: from the busy highways of Riyadh to remote industrial sites. Our team designs, builds, installs and supports every platform we deliver, so our customers have one trusted partner from day one."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            [Target, 'Our Mission', 'Empower businesses with real-time visibility and smart technology that makes operations safer and more efficient.'],
            [Eye, 'Our Vision', 'To be the most trusted technology partner for connected fleets and smart systems in the region.'],
            [ShieldCheck, 'Security First', 'Encrypted data, role-based access and secure hosting are built into everything we ship.'],
            [Users, 'Customer Obsessed', 'Local teams, Arabic & English support and fast response — always with you.'],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Eye
            return (
              <div key={t as string} className="rounded-2xl border border-slate-200 p-6">
                <I className="h-8 w-8 text-brand" />
                <p className="mt-4 font-display font-semibold text-navy-900">{t as string}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{d as string}</p>
              </div>
            )
          })}
        </div>
      </section>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionTitle center eyebrow="Our values" title="What Drives Us" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ['Innovation', 'We continuously invest in new technology — AI, IoT and cloud — to keep our customers ahead.'],
              ['Reliability', 'Our platforms are engineered for 24/7 operation with redundancy and proactive monitoring.'],
              ['Integrity', 'Transparent pricing, honest advice and long-term partnerships over quick wins.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl bg-white p-7 shadow-sm">
                <Lightbulb className="h-7 w-7 text-cyan-500" />
                <p className="mt-4 font-display text-lg font-semibold text-navy-900">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
