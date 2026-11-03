import { CheckCircle2 } from 'lucide-react'
import { PageHero } from '../../components/marketing/MarketingLayout'
import { LeadForm } from './LeadForm'
import { useI18n } from '../../lib/i18n'

export default function RequestDemo() {
  const { t } = useI18n()
  return (
    <>
      <PageHero eyebrow={t('Request a Demo', 'اطلب عرضاً تجريبياً')} title={t('See Drevantix in Action', 'شاهد دريفانتكس أثناء العمل')} text={t('Get a personalized walkthrough of our live tracking portal, tailored to your fleet and industry.', 'احصل على جولة مخصصة في بوابة التتبع المباشر، مصممة حسب أسطولك وقطاعك.')} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div>
          <h2 className="text-xl font-semibold text-navy-900">{t('In your 30-minute demo', 'خلال العرض التجريبي (30 دقيقة)')}</h2>
          <ul className="mt-5 space-y-4">
            {[t('Live fleet map & real-time alerts', 'خريطة الأسطول المباشرة والتنبيهات الفورية'), t('Trip history and route playback', 'سجل الرحلات وإعادة تشغيل المسار'), t('Geofences, drivers and reports', 'المناطق الجغرافية والسائقون والتقارير'), t('Hardware options & installation', 'خيارات الأجهزة والتركيب'), t('Pricing tailored to your fleet', 'أسعار مناسبة لحجم أسطولك')].map((item) => (
              <li key={item} className="flex gap-3 text-sm text-slate-700">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-500" /> {item}
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
