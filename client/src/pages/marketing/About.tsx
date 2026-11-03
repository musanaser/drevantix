import { Eye, Lightbulb, ShieldCheck, Target, Users } from 'lucide-react'
import { PageHero, SectionTitle } from '../../components/marketing/MarketingLayout'
import { useI18n } from '../../lib/i18n'

export default function About() {
  const { t } = useI18n()
  return (
    <>
      <PageHero
        eyebrow={t('About Us', 'من نحن')}
        title={t('Smarter Technology. Safer Tomorrow.', 'تقنية أذكى. غدٌ أكثر أماناً.')}
        text={t(
          'Drevantix is a Saudi technology company building intelligent platforms that help organizations see, protect and optimize their operations.',
          'دريفانتكس شركة تقنية سعودية تبني منصات ذكية تساعد المنشآت على رؤية عملياتها وحمايتها وتحسينها.',
        )}
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <SectionTitle
          eyebrow={t('Who we are', 'من نحن')}
          title={t('Engineers, Designers and Operators — Under One Roof', 'مهندسون ومصممون ومشغّلون — تحت سقف واحد')}
          text={t(
            'We combine deep expertise in telematics, cloud software and IoT to deliver solutions that work in the real world: from the busy highways of Riyadh to remote industrial sites. Our team designs, builds, installs and supports every platform we deliver, so our customers have one trusted partner from day one.',
            'نجمع بين خبرة عميقة في التتبع التليماتي والبرمجيات السحابية وإنترنت الأشياء لتقديم حلول تعمل في الواقع: من طرق الرياض المزدحمة إلى المواقع الصناعية النائية. يصمم فريقنا كل منصة ويبنيها ويركّبها ويدعمها، ليحظى عملاؤنا بشريك موثوق واحد منذ اليوم الأول.',
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            [Target, t('Our Mission', 'رسالتنا'), t('Empower businesses with real-time visibility and smart technology that makes operations safer and more efficient.', 'تمكين الشركات برؤية لحظية وتقنيات ذكية تجعل العمليات أكثر أماناً وكفاءة.')],
            [Eye, t('Our Vision', 'رؤيتنا'), t('To be the most trusted technology partner for connected fleets and smart systems in the region.', 'أن نكون الشريك التقني الأكثر ثقة للأساطيل المتصلة والأنظمة الذكية في المنطقة.')],
            [ShieldCheck, t('Security First', 'الأمان أولاً'), t('Encrypted data, role-based access and secure hosting are built into everything we ship.', 'تشفير البيانات والصلاحيات حسب الدور والاستضافة الآمنة جزء أساسي من كل ما نقدمه.')],
            [Users, t('Customer Obsessed', 'العميل محور اهتمامنا'), t('Local teams, Arabic & English support and fast response — always with you.', 'فرق محلية ودعم بالعربية والإنجليزية واستجابة سريعة — معك دائماً.')],
          ].map(([Icon, title, d]) => {
            const I = Icon as typeof Eye
            return (
              <div key={title as string} className="rounded-2xl border border-slate-200 p-6">
                <I className="h-8 w-8 text-brand" />
                <p className="mt-4 font-display font-semibold text-navy-900">{title as string}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{d as string}</p>
              </div>
            )
          })}
        </div>
      </section>
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionTitle center eyebrow={t('Our values', 'قيمنا')} title={t('What Drives Us', 'ما يحرّكنا')} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              [t('Innovation', 'الابتكار'), t('We continuously invest in new technology — AI, IoT and cloud — to keep our customers ahead.', 'نستثمر باستمرار في التقنيات الحديثة — الذكاء الاصطناعي وإنترنت الأشياء والسحابة — لنُبقي عملاءنا في المقدمة.')],
              [t('Reliability', 'الموثوقية'), t('Our platforms are engineered for 24/7 operation with redundancy and proactive monitoring.', 'منصاتنا مصممة للعمل على مدار الساعة مع أنظمة احتياطية ومراقبة استباقية.')],
              [t('Integrity', 'النزاهة'), t('Transparent pricing, honest advice and long-term partnerships over quick wins.', 'أسعار شفافة ونصيحة صادقة وشراكات طويلة الأمد بدلاً من المكاسب السريعة.')],
            ].map(([title, d]) => (
              <div key={title} className="rounded-2xl bg-white p-7 shadow-sm">
                <Lightbulb className="h-7 w-7 text-cyan-500" />
                <p className="mt-4 font-display text-lg font-semibold text-navy-900">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
