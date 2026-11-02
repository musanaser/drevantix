import { ArrowRight, BellRing, CheckCircle2, Gauge, Map, Radio, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FEATURES, INDUSTRIES, SOLUTIONS } from '../../components/marketing/content'
import { SectionTitle } from '../../components/marketing/MarketingLayout'
import { useI18n } from '../../lib/i18n'

export default function Home() {
  const { t, tx } = useI18n()
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          className="absolute inset-y-0 end-0 w-full bg-cover bg-right md:w-[68%] rtl:bg-left rtl:-scale-x-100"
          style={{ backgroundImage: "url('/images/hero-scene.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-navy-900 via-navy-900/90 to-transparent md:via-navy-900/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-28 lg:px-8">
          <p className="text-xs font-medium tracking-[0.25em] text-slate-200 uppercase">{t('Vehicle Tracking & Telematics', 'تتبع المركبات والاتصالات التليماتية')}</p>
          <h1 className="mt-4 text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">
            {t('Real-Time Visibility.', 'رؤية لحظية.')}
            <br />
            <span className="text-cyan-400">{t('Smarter', 'قرارات')}</span> {t('Decisions.', 'أذكى.')}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-200 md:text-lg">
            {t(
              'Drevantix delivers advanced IT solutions and custom platforms, including vehicle tracking systems, to help businesses operate more efficiently, securely and profitably.',
              'تقدم دريفانتكس حلولاً تقنية متقدمة ومنصات مخصصة، تشمل أنظمة تتبع المركبات، لمساعدة الشركات على العمل بكفاءة وأمان وربحية أعلى.',
            )}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/solutions" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-7 py-3.5 text-sm font-semibold text-navy-900 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300">
              {t('Explore Our Solutions', 'استكشف حلولنا')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link to="/contact" className="inline-flex items-center rounded-full border border-cyan-400/80 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              {t('Get in Touch', 'تواصل معنا')}
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-9 md:grid-cols-3 lg:grid-cols-5 lg:px-8">
          {FEATURES.map((f, i) => (
            <div key={f.title.en} className={`flex items-center gap-4 px-2 lg:px-5 ${i > 0 ? 'lg:border-s lg:border-slate-200' : ''}`}>
              <f.icon className="h-9 w-9 shrink-0 text-brand" strokeWidth={2.2} />
              <div>
                <p className="text-sm font-semibold text-navy-900">{tx(f.title)}</p>
                <p className="text-xs text-slate-500">{tx(f.text)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_2fr] lg:px-8">
          <div className="lg:pt-6">
            <SectionTitle
              eyebrow={t('Our Solutions', 'حلولنا')}
              title={t('Integrated Technology for a Smarter Future', 'تقنيات متكاملة لمستقبل أذكى')}
              text={t('From vehicle tracking to custom IT platforms, we build intelligent solutions that connect, protect and empower your business.', 'من تتبع المركبات إلى المنصات التقنية المخصصة، نبني حلولاً ذكية تربط أعمالك وتحميها وتمكّنها.')}
            />
            <Link to="/solutions" className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-cyan-300">
              {t('View All Solutions', 'عرض جميع الحلول')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {SOLUTIONS.map((s) => (
              <Link
                key={s.id}
                to={`/solutions#${s.id}`}
                className="group relative flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative z-10 flex flex-1 flex-col p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-brand/80">
                    <s.icon className="h-5 w-5 text-brand" />
                  </span>
                  <p className="mt-4 font-display text-[15px] font-semibold text-navy-900">{tx(s.title)}</p>
                  <p className="mt-1 max-w-[11rem] text-xs leading-relaxed text-slate-500">{tx(s.text)}</p>
                  <ArrowRight className="mt-auto h-4 w-4 self-start pt-0 text-navy-800 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </div>
                <div className="relative w-[46%] shrink-0">
                  <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-white via-white/10 to-transparent" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden bg-navy-900">
        <div className="grid-glow absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-14 text-center md:grid-cols-4 lg:px-8">
          {[
            [t('2s', '2 ث'), t('Live position refresh', 'تحديث الموقع المباشر')],
            ['99.9%', t('Platform uptime', 'جاهزية المنصة')],
            ['24/7', t('Monitoring & support', 'مراقبة ودعم')],
            [t('30 days', '30 يوماً'), t('History retention', 'حفظ السجل')],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-3xl font-bold text-cyan-300 md:text-4xl">{v}</p>
              <p className="mt-1 text-sm text-slate-300">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portal preview */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionTitle
              eyebrow={t('Customer Portal', 'بوابة العملاء')}
              title={t('Your Entire Fleet, One Powerful Dashboard', 'أسطولك بالكامل في لوحة تحكم واحدة')}
              text={t('Every Drevantix customer gets secure access to our tracking portal — on desktop, tablet or phone.', 'يحصل كل عميل لدى دريفانتكس على وصول آمن إلى بوابة التتبع — من الحاسوب أو الجهاز اللوحي أو الجوال.')}
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [Map, t('Live fleet map', 'خريطة الأسطول المباشرة'), t('See every vehicle move in real time.', 'شاهد حركة كل مركبة لحظة بلحظة.')],
                [BellRing, t('Instant alerts', 'تنبيهات فورية'), t('Overspeed, geofence, fuel & idling.', 'السرعة والمناطق والوقود والتشغيل الخامل.')],
                [Gauge, t('Trip history', 'سجل الرحلات'), t('Replay any journey, stop by stop.', 'أعد تشغيل أي رحلة محطة بمحطة.')],
                [Smartphone, t('Anywhere access', 'وصول من أي مكان'), t('Fully responsive, secure portal.', 'بوابة آمنة تعمل على جميع الأجهزة.')],
              ].map(([Icon, t, d]) => {
                const I = Icon as typeof Map
                return (
                  <li key={t as string} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-brand">
                      <I className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-navy-900">{t as string}</span>
                      <span className="text-xs text-slate-500">{d as string}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-700">
                {t('Open Customer Portal', 'افتح بوابة العملاء')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link to="/request-demo" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-navy-800 ring-1 ring-slate-300 hover:bg-slate-50">
                {t('Request a Demo', 'اطلب عرضاً تجريبياً')}
              </Link>
            </div>
          </div>
          <PortalMockup />
        </div>
      </section>

      {/* Industries */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionTitle center eyebrow={t('Industries', 'القطاعات')} title={t('Trusted Across Industries', 'موثوقون في مختلف القطاعات')} text={t('Purpose-built tracking and IT solutions for the sectors that keep the Kingdom moving.', 'حلول تتبع وتقنية مصممة للقطاعات التي تُبقي المملكة في حركة دائمة.')} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.slice(0, 6).map((i) => (
              <div key={i.title.en} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-cyan-300 hover:shadow-md">
                <i.icon className="h-8 w-8 text-brand" />
                <p className="mt-4 font-display font-semibold text-navy-900">{tx(i.title)}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{tx(i.text)}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/industries" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
              {t('See all industries', 'عرض جميع القطاعات')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionTitle center eyebrow={t('How It Works', 'كيف نعمل')} title={t('Up and Running in Days', 'جاهز للعمل خلال أيام')} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              [Radio, t('1. Install', '١. التركيب'), t('Our certified technicians fit GPS trackers and sensors to your vehicles with minimal downtime.', 'يركّب فنيونا المعتمدون أجهزة التتبع والحساسات في مركباتك بأقل وقت توقف.')],
              [Map, t('2. Connect', '٢. الربط'), t('Devices stream encrypted data to the Drevantix cloud. Your team gets portal access instantly.', 'ترسل الأجهزة بيانات مشفرة إلى سحابة دريفانتكس، ويحصل فريقك على وصول فوري للبوابة.')],
              [CheckCircle2, t('3. Optimize', '٣. التحسين'), t('Use live tracking, alerts and reports to cut costs, improve safety and serve customers better.', 'استخدم التتبع المباشر والتنبيهات والتقارير لخفض التكاليف وتعزيز السلامة وخدمة عملائك بشكل أفضل.')],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Map
              return (
                <div key={t as string} className="relative rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-7 text-white">
                  <I className="h-8 w-8 text-cyan-300" />
                  <p className="mt-5 font-display text-lg font-semibold">{t as string}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{d as string}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

function PortalMockup() {
  const { t } = useI18n()
  const kmh = t('km/h', 'كم/س')
  const rows = [
    [t('Truck 01', 'شاحنة 01'), t('Moving', 'متحركة'), `72 ${kmh}`, 'bg-emerald-400'],
    [t('Van 02', 'فان 02'), t('Idle', 'خاملة'), `0 ${kmh}`, 'bg-amber-400'],
    [t('Truck 05', 'شاحنة 05'), t('Moving', 'متحركة'), `64 ${kmh}`, 'bg-emerald-400'],
    [t('Van 03', 'فان 03'), t('Stopped', 'متوقفة'), `0 ${kmh}`, 'bg-blue-400'],
  ]
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyan-200/50 to-blue-300/40 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-navy-900 shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ms-3 text-xs text-slate-400">portal.drevantix.com</span>
        </div>
        <div className="grid grid-cols-[40%_60%]">
          <div className="space-y-2 p-3">
            {rows.map(([n, s, sp, c]) => (
              <div key={n} className="rounded-lg bg-white/5 p-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  {n}
                  <span className={`h-2 w-2 rounded-full ${c}`} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>{s}</span>
                  <span>{sp}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="relative min-h-64 overflow-hidden bg-[#0d2a55]">
            <div className="grid-glow absolute inset-0 opacity-80" />
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full rtl:-scale-x-100">
              <path d="M10 170 C 50 150, 60 110, 100 100 S 160 60, 190 20" stroke="#22d3ee" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M20 40 C 60 60, 90 70, 120 130 S 170 170, 195 180" stroke="#60a5fa" strokeWidth="2" fill="none" strokeDasharray="4 4" />
              {[
                [100, 100, '#34d399'],
                [150, 62, '#34d399'],
                [60, 62, '#fbbf24'],
                [150, 165, '#60a5fa'],
              ].map(([x, y, c], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="9" fill={c as string} opacity="0.25" />
                  <circle cx={x} cy={y} r="4.5" fill={c as string} stroke="white" strokeWidth="1.5" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
