import { Cloud, Cpu, Database, Lock, Radio, Satellite, Server, Smartphone } from 'lucide-react'
import { PageHero, SectionTitle } from '../../components/marketing/MarketingLayout'

const STACK = [
  { icon: Satellite, title: 'GNSS Tracking Devices', text: 'Multi-constellation GPS/GLONASS trackers with 4G LTE connectivity, CAN-bus support and internal backup battery.' },
  { icon: Radio, title: 'Real-Time Streaming', text: 'Positions stream every few seconds over encrypted channels and are pushed instantly to the portal over WebSockets.' },
  { icon: Cloud, title: 'Cloud Platform', text: 'Horizontally scalable services hosted in-Kingdom, designed for millions of messages per day.' },
  { icon: Database, title: 'Historical Data', text: 'Every position, trip and event is stored for fast playback, reporting and audit.' },
  { icon: Lock, title: 'Security & Privacy', text: 'TLS everywhere, hashed credentials, role-based access control and full tenant isolation.' },
  { icon: Cpu, title: 'IoT Sensors', text: 'Temperature, fuel, door, driver ID and camera integrations via BLE and wired inputs.' },
  { icon: Smartphone, title: 'Any Device', text: 'A responsive web portal that works beautifully on desktop, tablet and phone.' },
  { icon: Server, title: 'Open APIs', text: 'REST and WebSocket APIs to integrate tracking data into your ERP, TMS or BI tools.' },
]

export default function Technology() {
  return (
    <>
      <PageHero
        eyebrow="Our Technology"
        title="Engineered for Real-Time, Built for Scale"
        text="From the device on your dashboard to the dashboard on your screen, every layer of the Drevantix platform is designed for speed, accuracy and security."
      />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionTitle center eyebrow="The platform" title="End-to-End Telematics Stack" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 p-6">
              <s.icon className="h-8 w-8 text-brand" />
              <p className="mt-4 font-display font-semibold text-navy-900">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="relative overflow-hidden bg-navy-900">
        <div className="grid-glow absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-5 py-20 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-white">How Data Flows</h2>
          <div className="mt-12 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {[
              ['Vehicle', 'Tracker & sensors'],
              ['Drevantix Cloud', 'Ingest · Process · Alert'],
              ['Your Team', 'Portal · Reports · APIs'],
            ].map(([t, d], i) => (
              <div key={t} className="contents">
                <div className="rounded-2xl border border-cyan-400/30 bg-white/5 p-6 text-center">
                  <p className="font-display text-lg font-semibold text-white">{t}</p>
                  <p className="mt-1 text-sm text-slate-300">{d}</p>
                </div>
                {i < 2 && <div className="mx-auto h-8 w-0.5 bg-cyan-400 md:h-0.5 md:w-12" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
