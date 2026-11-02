import { Bus, Building2, Cloud, Cpu, Factory, Fuel, HardHat, Headphones, MapPin, Package, Route, ShieldCheck, BarChart3, Truck, Snowflake, Ambulance } from 'lucide-react'

export const FEATURES = [
  { icon: MapPin, title: 'Real-Time Tracking', text: 'Know where. Always.' },
  { icon: ShieldCheck, title: 'Enhanced Security', text: 'Protect your assets.' },
  { icon: BarChart3, title: 'Operational Efficiency', text: 'Optimize your resources.' },
  { icon: Cloud, title: 'Scalable Platforms', text: 'Built for your growth.' },
  { icon: Headphones, title: 'Reliable Support', text: 'Always with you.' },
]

export const SOLUTIONS = [
  {
    id: 'vehicle-tracking',
    icon: Truck,
    title: 'Vehicle Tracking',
    text: 'Track, monitor and manage your fleet in real time.',
    image: '/images/card-vehicle-tracking.jpg',
    long: 'Live GPS positions every few seconds, full trip history with playback, speed and ignition monitoring, and instant alerts for overspeeding, idling and harsh driving — all from a single, intuitive portal.',
    bullets: ['Live map with second-by-second updates', 'Trip history & route playback', 'Overspeed, idling & harsh-braking alerts', 'Geofences with entry / exit notifications'],
  },
  {
    id: 'custom-it',
    icon: Cloud,
    title: 'Custom IT Platforms',
    text: 'Tailored solutions for your unique needs.',
    image: '/images/card-custom-it.jpg',
    long: 'From ERP integrations to customer-facing portals, our engineers design, build and operate secure cloud platforms tailored to the way your business works.',
    bullets: ['Web & mobile application development', 'ERP, CRM & API integrations', 'Secure cloud hosting & DevOps', 'Dashboards & business intelligence'],
  },
  {
    id: 'fleet-management',
    icon: ShieldCheck,
    title: 'Fleet Management',
    text: 'Improve safety, reduce costs and boost productivity.',
    image: '/images/card-fleet.jpg',
    long: 'Turn raw telematics into decisions. Driver scorecards, utilization and fuel reports, and maintenance insights help you run a safer, leaner fleet.',
    bullets: ['Driver management & behaviour scoring', 'Fuel consumption & utilization reports', 'Scheduled reports & CSV export', 'Role-based access for your team'],
  },
  {
    id: 'iot',
    icon: Cpu,
    title: 'IoT & Smart Systems',
    text: 'Connect devices. Unlock new possibilities.',
    image: '/images/card-iot.jpg',
    long: 'Temperature probes, fuel sensors, door sensors, cameras and more — we connect your physical assets to the cloud and make their data actionable.',
    bullets: ['Cold-chain temperature monitoring', 'Fuel level & door sensors', 'Video telematics & dashcams', 'Smart city & asset tracking'],
  },
]

export const INDUSTRIES = [
  { icon: Package, title: 'Logistics & Delivery', text: 'Optimize last-mile routes, prove delivery times and keep customers informed with live ETAs.' },
  { icon: HardHat, title: 'Construction', text: 'Track heavy equipment and tippers across sites, reduce unauthorized use and idle time.' },
  { icon: Snowflake, title: 'Cold Chain', text: 'Monitor temperature-sensitive cargo end-to-end with instant excursion alerts.' },
  { icon: Bus, title: 'Passenger Transport', text: 'Keep staff buses and school transport safe, on schedule and accountable.' },
  { icon: Fuel, title: 'Oil, Gas & Energy', text: 'Protect high-value assets in remote areas with geofences and safety monitoring.' },
  { icon: Ambulance, title: 'Emergency Services', text: 'Dispatch the nearest unit faster with real-time visibility of every vehicle.' },
  { icon: Building2, title: 'Government', text: 'Secure, compliant platforms for municipal fleets and public services.' },
  { icon: Factory, title: 'Manufacturing', text: 'Connect plants, warehouses and distribution fleets into one operational view.' },
  { icon: Route, title: 'Car Rental & Leasing', text: 'Know where every car is, monitor mileage and recover vehicles quickly.' },
]
