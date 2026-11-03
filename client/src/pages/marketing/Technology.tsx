import { Cloud, Cpu, Database, Lock, Radio, Satellite, Server, Smartphone } from 'lucide-react'
import { PageHero, SectionTitle } from '../../components/marketing/MarketingLayout'
import { useI18n } from '../../lib/i18n'

const STACK = [
  { icon: Satellite, title: { en: 'GNSS Tracking Devices', ar: 'أجهزة تتبع GNSS' }, text: { en: 'Multi-constellation GPS/GLONASS trackers with 4G LTE connectivity, CAN-bus support and internal backup battery.', ar: 'أجهزة تتبع متعددة الأنظمة GPS/GLONASS باتصال 4G LTE ودعم CAN-bus وبطارية احتياطية داخلية.' } },
  { icon: Radio, title: { en: 'Real-Time Streaming', ar: 'بث لحظي' }, text: { en: 'Positions stream every few seconds over encrypted channels and are pushed instantly to the portal over WebSockets.', ar: 'تُرسل المواقع كل بضع ثوانٍ عبر قنوات مشفرة وتصل فوراً إلى البوابة عبر WebSockets.' } },
  { icon: Cloud, title: { en: 'Cloud Platform', ar: 'منصة سحابية' }, text: { en: 'Horizontally scalable services hosted in-Kingdom, designed for millions of messages per day.', ar: 'خدمات قابلة للتوسع مستضافة داخل المملكة، مصممة لملايين الرسائل يومياً.' } },
  { icon: Database, title: { en: 'Historical Data', ar: 'البيانات التاريخية' }, text: { en: 'Every position, trip and event is stored for fast playback, reporting and audit.', ar: 'يُحفظ كل موقع ورحلة وحدث لإعادة التشغيل السريع وإعداد التقارير والتدقيق.' } },
  { icon: Lock, title: { en: 'Security & Privacy', ar: 'الأمان والخصوصية' }, text: { en: 'TLS everywhere, hashed credentials, role-based access control and full tenant isolation.', ar: 'تشفير TLS شامل، وكلمات مرور مشفرة، وصلاحيات حسب الدور، وعزل كامل لبيانات كل عميل.' } },
  { icon: Cpu, title: { en: 'IoT Sensors', ar: 'حساسات إنترنت الأشياء' }, text: { en: 'Temperature, fuel, door, driver ID and camera integrations via BLE and wired inputs.', ar: 'تكامل حساسات الحرارة والوقود والأبواب وهوية السائق والكاميرات عبر BLE والمداخل السلكية.' } },
  { icon: Smartphone, title: { en: 'Any Device', ar: 'أي جهاز' }, text: { en: 'A responsive web portal that works beautifully on desktop, tablet and phone.', ar: 'بوابة ويب متجاوبة تعمل بسلاسة على الحاسوب والجهاز اللوحي والجوال.' } },
  { icon: Server, title: { en: 'Open APIs', ar: 'واجهات برمجة مفتوحة' }, text: { en: 'REST and WebSocket APIs to integrate tracking data into your ERP, TMS or BI tools.', ar: 'واجهات REST وWebSocket لدمج بيانات التتبع مع أنظمة ERP وTMS وأدوات ذكاء الأعمال.' } },
]

export default function Technology() {
  const { t, tx } = useI18n()
  return (
    <>
      <PageHero
        eyebrow={t('Our Technology', 'تقنياتنا')}
        title={t('Engineered for Real-Time, Built for Scale', 'مصممة للزمن الحقيقي، ومبنية للتوسع')}
        text={t('From the device on your dashboard to the dashboard on your screen, every layer of the Drevantix platform is designed for speed, accuracy and security.', 'من الجهاز في مركبتك إلى لوحة التحكم على شاشتك، صُممت كل طبقة في منصة دريفانتكس للسرعة والدقة والأمان.')}
      />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionTitle center eyebrow={t('The platform', 'المنصة')} title={t('End-to-End Telematics Stack', 'منظومة تليماتية متكاملة')} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s) => (
            <div key={s.title.en} className="rounded-2xl border border-slate-200 p-6">
              <s.icon className="h-8 w-8 text-brand" />
              <p className="mt-4 font-display font-semibold text-navy-900">{tx(s.title)}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{tx(s.text)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="relative overflow-hidden bg-navy-900">
        <div className="grid-glow absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-5 py-20 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-white">{t('How Data Flows', 'كيف تتدفق البيانات')}</h2>
          <div className="mt-12 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {[
              [t('Vehicle', 'المركبة'), t('Tracker & sensors', 'جهاز التتبع والحساسات')],
              [t('Drevantix Cloud', 'سحابة دريفانتكس'), t('Ingest · Process · Alert', 'استقبال · معالجة · تنبيه')],
              [t('Your Team', 'فريقك'), t('Portal · Reports · APIs', 'البوابة · التقارير · الواجهات البرمجية')],
            ].map(([title, d], i) => (
              <div key={title} className="contents">
                <div className="rounded-2xl border border-cyan-400/30 bg-white/5 p-6 text-center">
                  <p className="font-display text-lg font-semibold text-white">{title}</p>
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
