import { Ambulance, BarChart3, Building2, Bus, Cloud, Cpu, Factory, Fuel, HardHat, Headphones, MapPin, Package, Route, ShieldCheck, Snowflake, Truck } from 'lucide-react'
import type { L } from '../../lib/i18n'

export const FEATURES: { icon: typeof MapPin; title: L; text: L }[] = [
  { icon: MapPin, title: { en: 'Real-Time Tracking', ar: 'تتبع لحظي' }, text: { en: 'Know where. Always.', ar: 'اعرف المكان. دائماً.' } },
  { icon: ShieldCheck, title: { en: 'Enhanced Security', ar: 'أمان معزز' }, text: { en: 'Protect your assets.', ar: 'احمِ أصولك.' } },
  { icon: BarChart3, title: { en: 'Operational Efficiency', ar: 'كفاءة تشغيلية' }, text: { en: 'Optimize your resources.', ar: 'حسّن استخدام مواردك.' } },
  { icon: Cloud, title: { en: 'Scalable Platforms', ar: 'منصات قابلة للتوسع' }, text: { en: 'Built for your growth.', ar: 'مصممة لنموك.' } },
  { icon: Headphones, title: { en: 'Reliable Support', ar: 'دعم موثوق' }, text: { en: 'Always with you.', ar: 'معك دائماً.' } },
]

export const SOLUTIONS: { id: string; icon: typeof MapPin; title: L; text: L; image: string; long: L; bullets: L[] }[] = [
  {
    id: 'vehicle-tracking',
    icon: Truck,
    title: { en: 'Vehicle Tracking', ar: 'تتبع المركبات' },
    text: { en: 'Track, monitor and manage your fleet in real time.', ar: 'تتبّع أسطولك وراقبه وأدِره لحظة بلحظة.' },
    image: '/images/card-vehicle-tracking.jpg',
    long: {
      en: 'Live GPS positions every few seconds, full trip history with playback, speed and ignition monitoring, and instant alerts for overspeeding, idling and harsh driving — all from a single, intuitive portal.',
      ar: 'مواقع GPS مباشرة كل بضع ثوانٍ، وسجل رحلات كامل مع إعادة التشغيل، ومراقبة السرعة وحالة المحرك، وتنبيهات فورية لتجاوز السرعة والتشغيل الخامل والقيادة العنيفة — كل ذلك من بوابة واحدة سهلة الاستخدام.',
    },
    bullets: [
      { en: 'Live map with second-by-second updates', ar: 'خريطة مباشرة تتحدث كل ثانية' },
      { en: 'Trip history & route playback', ar: 'سجل الرحلات وإعادة تشغيل المسار' },
      { en: 'Overspeed, idling & harsh-braking alerts', ar: 'تنبيهات تجاوز السرعة والتشغيل الخامل والفرملة الحادة' },
      { en: 'Geofences with entry / exit notifications', ar: 'مناطق جغرافية مع إشعارات الدخول والخروج' },
    ],
  },
  {
    id: 'custom-it',
    icon: Cloud,
    title: { en: 'Custom IT Platforms', ar: 'منصات تقنية مخصصة' },
    text: { en: 'Tailored solutions for your unique needs.', ar: 'حلول مصممة لاحتياجاتك الخاصة.' },
    image: '/images/card-custom-it.jpg',
    long: {
      en: 'From ERP integrations to customer-facing portals, our engineers design, build and operate secure cloud platforms tailored to the way your business works.',
      ar: 'من التكامل مع أنظمة تخطيط الموارد إلى بوابات العملاء، يصمم مهندسونا منصات سحابية آمنة ويبنونها ويشغّلونها بما يتناسب مع طريقة عمل منشأتك.',
    },
    bullets: [
      { en: 'Web & mobile application development', ar: 'تطوير تطبيقات الويب والجوال' },
      { en: 'ERP, CRM & API integrations', ar: 'التكامل مع ERP وCRM وواجهات API' },
      { en: 'Secure cloud hosting & DevOps', ar: 'استضافة سحابية آمنة وDevOps' },
      { en: 'Dashboards & business intelligence', ar: 'لوحات المعلومات وذكاء الأعمال' },
    ],
  },
  {
    id: 'fleet-management',
    icon: ShieldCheck,
    title: { en: 'Fleet Management', ar: 'إدارة الأساطيل' },
    text: { en: 'Improve safety, reduce costs and boost productivity.', ar: 'عزّز السلامة وخفّض التكاليف وارفع الإنتاجية.' },
    image: '/images/card-fleet.jpg',
    long: {
      en: 'Turn raw telematics into decisions. Driver scorecards, utilization and fuel reports, and maintenance insights help you run a safer, leaner fleet.',
      ar: 'حوّل بيانات التتبع إلى قرارات. تقييمات السائقين وتقارير الاستخدام والوقود ورؤى الصيانة تساعدك على إدارة أسطول أكثر أماناً وكفاءة.',
    },
    bullets: [
      { en: 'Driver management & behaviour scoring', ar: 'إدارة السائقين وتقييم سلوك القيادة' },
      { en: 'Fuel consumption & utilization reports', ar: 'تقارير استهلاك الوقود ونسبة الاستخدام' },
      { en: 'Scheduled reports & CSV export', ar: 'تقارير مجدولة وتصدير CSV' },
      { en: 'Role-based access for your team', ar: 'صلاحيات وصول حسب الدور لفريقك' },
    ],
  },
  {
    id: 'iot',
    icon: Cpu,
    title: { en: 'IoT & Smart Systems', ar: 'إنترنت الأشياء والأنظمة الذكية' },
    text: { en: 'Connect devices. Unlock new possibilities.', ar: 'اربط الأجهزة. وأطلق إمكانات جديدة.' },
    image: '/images/card-iot.jpg',
    long: {
      en: 'Temperature probes, fuel sensors, door sensors, cameras and more — we connect your physical assets to the cloud and make their data actionable.',
      ar: 'مجسات الحرارة وحساسات الوقود والأبواب والكاميرات وغيرها — نربط أصولك الفعلية بالسحابة ونجعل بياناتها قابلة للتنفيذ.',
    },
    bullets: [
      { en: 'Cold-chain temperature monitoring', ar: 'مراقبة درجات الحرارة لسلاسل التبريد' },
      { en: 'Fuel level & door sensors', ar: 'حساسات مستوى الوقود والأبواب' },
      { en: 'Video telematics & dashcams', ar: 'التتبع بالفيديو وكاميرات المركبات' },
      { en: 'Smart city & asset tracking', ar: 'المدن الذكية وتتبع الأصول' },
    ],
  },
]

export const INDUSTRIES: { icon: typeof MapPin; title: L; text: L }[] = [
  { icon: Package, title: { en: 'Logistics & Delivery', ar: 'الخدمات اللوجستية والتوصيل' }, text: { en: 'Optimize last-mile routes, prove delivery times and keep customers informed with live ETAs.', ar: 'حسّن مسارات الميل الأخير، وأثبت أوقات التسليم، وأبقِ عملاءك على اطلاع بأوقات الوصول المتوقعة.' } },
  { icon: HardHat, title: { en: 'Construction', ar: 'المقاولات والإنشاءات' }, text: { en: 'Track heavy equipment and tippers across sites, reduce unauthorized use and idle time.', ar: 'تتبّع المعدات الثقيلة والقلابات بين المواقع، وقلّل الاستخدام غير المصرح به ووقت التوقف.' } },
  { icon: Snowflake, title: { en: 'Cold Chain', ar: 'سلاسل التبريد' }, text: { en: 'Monitor temperature-sensitive cargo end-to-end with instant excursion alerts.', ar: 'راقب الشحنات الحساسة للحرارة من البداية للنهاية مع تنبيهات فورية عند تجاوز الحدود.' } },
  { icon: Bus, title: { en: 'Passenger Transport', ar: 'نقل الركاب' }, text: { en: 'Keep staff buses and school transport safe, on schedule and accountable.', ar: 'حافظ على سلامة حافلات الموظفين والنقل المدرسي والتزامها بالمواعيد.' } },
  { icon: Fuel, title: { en: 'Oil, Gas & Energy', ar: 'النفط والغاز والطاقة' }, text: { en: 'Protect high-value assets in remote areas with geofences and safety monitoring.', ar: 'احمِ الأصول عالية القيمة في المناطق النائية بالمناطق الجغرافية ومراقبة السلامة.' } },
  { icon: Ambulance, title: { en: 'Emergency Services', ar: 'خدمات الطوارئ' }, text: { en: 'Dispatch the nearest unit faster with real-time visibility of every vehicle.', ar: 'أرسل أقرب وحدة بشكل أسرع مع رؤية لحظية لكل مركبة.' } },
  { icon: Building2, title: { en: 'Government', ar: 'القطاع الحكومي' }, text: { en: 'Secure, compliant platforms for municipal fleets and public services.', ar: 'منصات آمنة ومتوافقة مع الأنظمة لأساطيل البلديات والخدمات العامة.' } },
  { icon: Factory, title: { en: 'Manufacturing', ar: 'التصنيع' }, text: { en: 'Connect plants, warehouses and distribution fleets into one operational view.', ar: 'اربط المصانع والمستودعات وأساطيل التوزيع في رؤية تشغيلية واحدة.' } },
  { icon: Route, title: { en: 'Car Rental & Leasing', ar: 'تأجير السيارات' }, text: { en: 'Know where every car is, monitor mileage and recover vehicles quickly.', ar: 'اعرف مكان كل سيارة، وراقب المسافات المقطوعة، واسترد المركبات بسرعة.' } },
]
