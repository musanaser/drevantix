import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { PageHero } from '../../components/marketing/MarketingLayout'
import { LeadForm } from './LeadForm'
import { useI18n } from '../../lib/i18n'

export default function Contact() {
  const { t } = useI18n()
  return (
    <>
      <PageHero eyebrow={t('Contact', 'تواصل معنا')} title={t('Let’s Build Something Smarter, Together', 'لنبنِ معاً شيئاً أذكى')} text={t('Questions about our platforms, pricing or partnerships? Our team is ready to help.', 'لديك أسئلة حول منصاتنا أو الأسعار أو الشراكات؟ فريقنا جاهز لمساعدتك.')} />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div className="space-y-6">
          {[
            [MapPin, t('Visit us', 'زورونا'), t('King Fahd Road, Al Olaya, Riyadh 12212, Saudi Arabia', 'طريق الملك فهد، حي العليا، الرياض 12212، المملكة العربية السعودية')],
            [Phone, t('Call us', 'اتصل بنا'), '\u200E+966 11 000 0000'],
            [Mail, t('Email us', 'راسلنا'), 'info@drevantix.com'],
            [Clock, t('Working hours', 'ساعات العمل'), t('Sun – Thu, 8:00 AM – 6:00 PM · 24/7 monitoring support', 'الأحد – الخميس، 8:00 ص – 6:00 م · دعم ومراقبة على مدار الساعة')],
          ].map(([Icon, title, d]) => {
            const I = Icon as typeof Mail
            return (
              <div key={title as string} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-brand">
                  <I className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{title as string}</p>
                  <p className="text-sm text-slate-500">{d as string}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-xl font-semibold text-navy-900">{t('Send us a message', 'أرسل لنا رسالة')}</h2>
          <LeadForm kind="contact" />
        </div>
      </section>
    </>
  )
}
