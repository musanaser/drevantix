import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { ROUTES, backfill, initialState, saveLiveState, vehicleRows } from './simulator.js';

interface CompanySeed {
  name: string;
  email: string;
  phone: string;
  plan: string;
  users: { name: string; email: string; password: string; role: 'manager' | 'viewer' }[];
  drivers: [string, string][];
  vehicles: [name: string, plate: string, type: string, make: string, model: string, year: number, routeId: number | null][];
  geofences: [name: string, lat: number, lng: number, radius: number, color: string][];
}

const companies: CompanySeed[] = [
  {
    name: 'Al Noor Logistics',
    email: 'ops@alnoor-logistics.sa',
    phone: '+966 11 555 0101',
    plan: 'enterprise',
    users: [
      { name: 'Faisal Al-Qahtani', email: 'demo@drevantix.com', password: 'demo123', role: 'manager' },
      { name: 'Sara Al-Harbi', email: 'viewer@drevantix.com', password: 'viewer123', role: 'viewer' },
    ],
    drivers: [
      ['Mohammed Al-Otaibi', '+966 50 111 2201'],
      ['Abdullah Al-Shehri', '+966 50 111 2202'],
      ['Khalid Al-Dosari', '+966 50 111 2203'],
      ['Omar Al-Zahrani', '+966 50 111 2204'],
      ['Yousef Al-Mutairi', '+966 50 111 2205'],
      ['Ahmed Al-Ghamdi', '+966 50 111 2206'],
      ['Saad Al-Anazi', '+966 50 111 2207'],
      ['Turki Al-Subaie', '+966 50 111 2208'],
      ['Nasser Al-Rashid', '+966 50 111 2209'],
      ['Bandar Al-Juhani', '+966 50 111 2210'],
      ['Majed Al-Shammari', '+966 50 111 2211'],
    ],
    vehicles: [
      ['Truck 01', 'RSA 4821', 'truck', 'Mercedes-Benz', 'Actros 1845', 2022, 1],
      ['Truck 02', 'RSA 4822', 'truck', 'Volvo', 'FH16', 2021, 2],
      ['Truck 03', 'RSA 4823', 'truck', 'MAN', 'TGX 18.510', 2023, 3],
      ['Truck 04', 'RSA 4824', 'truck', 'Scania', 'R500', 2020, 4],
      ['Truck 05', 'RSA 4825', 'truck', 'Isuzu', 'FVR', 2022, 5],
      ['Truck 06', 'RSA 4826', 'truck', 'Hino', '500 Series', 2021, 6],
      ['Truck 07', 'RSA 4827', 'truck', 'Mercedes-Benz', 'Axor', 2019, 7],
      ['Truck 08', 'RSA 4828', 'truck', 'Volvo', 'FM', 2023, 8],
      ['Van 01', 'KSA 7310', 'van', 'Toyota', 'Hiace', 2023, 9],
      ['Van 02', 'KSA 7311', 'van', 'Hyundai', 'H-1', 2022, 10],
      ['Van 03', 'KSA 7312', 'van', 'Ford', 'Transit', 2021, 11],
      ['Supervisor Car', 'KSA 9050', 'car', 'Toyota', 'Camry', 2024, null],
    ],
    geofences: [
      ['Main Depot – Dry Port', 24.6632, 46.751, 700, '#22d3ee'],
      ['2nd Industrial City Warehouse', 24.553, 46.86, 900, '#3b82f6'],
      ['KAFD Client Site', 24.7661, 46.64, 600, '#a855f7'],
      ['Airport Cargo Terminal', 24.9576, 46.6988, 1500, '#f59e0b'],
    ],
  },
  {
    name: 'Riyadh Express Couriers',
    email: 'fleet@rexpress.sa',
    phone: '+966 11 555 0202',
    plan: 'business',
    users: [{ name: 'Huda Al-Saud', email: 'manager@rexpress.sa', password: 'courier123', role: 'manager' }],
    drivers: [
      ['Ali Al-Harthi', '+966 55 222 3301'],
      ['Hassan Al-Malki', '+966 55 222 3302'],
      ['Fahad Al-Qarni', '+966 55 222 3303'],
      ['Ibrahim Al-Yami', '+966 55 222 3304'],
    ],
    vehicles: [
      ['Courier Van 1', 'RXP 1101', 'van', 'Toyota', 'Hiace', 2023, 12],
      ['Courier Van 2', 'RXP 1102', 'van', 'Nissan', 'Urvan', 2022, 4],
      ['Courier Van 3', 'RXP 1103', 'van', 'Hyundai', 'Staria', 2024, 6],
      ['Courier Car 1', 'RXP 2201', 'car', 'Hyundai', 'Accent', 2023, 11],
      ['Courier Car 2', 'RXP 2202', 'car', 'Kia', 'Pegas', 2024, 9],
    ],
    geofences: [
      ['Olaya Hub', 24.695, 46.684, 500, '#22d3ee'],
      ['Granada Hub', 24.781, 46.727, 500, '#3b82f6'],
    ],
  },
  {
    name: 'Najd Construction',
    email: 'equipment@najdcon.sa',
    phone: '+966 11 555 0303',
    plan: 'starter',
    users: [{ name: 'Rakan Al-Fahad', email: 'manager@najdcon.sa', password: 'najd123', role: 'manager' }],
    drivers: [
      ['Salem Al-Hajri', '+966 54 333 4401'],
      ['Mansour Al-Balawi', '+966 54 333 4402'],
      ['Waleed Al-Amri', '+966 54 333 4403'],
    ],
    vehicles: [
      ['Tipper 01', 'NJD 3301', 'truck', 'Mercedes-Benz', 'Arocs', 2021, 2],
      ['Tipper 02', 'NJD 3302', 'truck', 'Volvo', 'FMX', 2022, 7],
      ['Mixer 01', 'NJD 3303', 'truck', 'MAN', 'TGS', 2020, 10],
      ['Staff Bus', 'NJD 3304', 'bus', 'Toyota', 'Coaster', 2022, 1],
    ],
    geofences: [['Sulay Site', 24.585, 46.815, 800, '#f59e0b']],
  },
];

const SPEED_LIMITS: Record<string, number> = { truck: 90, van: 110, car: 120, bus: 90 };

export function seedIfEmpty() {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number };
  if (n > 0) return;
  console.log('[seed] Seeding demo data…');
  const hash = (p: string) => bcrypt.hashSync(p, 10);

  db.transaction(() => {
    db.prepare('INSERT INTO users (company_id, name, email, password_hash, role) VALUES (NULL, ?, ?, ?, ?)').run(
      'Drevantix Admin',
      'admin@drevantix.com',
      hash('admin123'),
      'admin',
    );
    for (const c of companies) {
      const companyId = Number(
        db.prepare('INSERT INTO companies (name, contact_email, phone, plan) VALUES (?, ?, ?, ?)').run(c.name, c.email, c.phone, c.plan).lastInsertRowid,
      );
      for (const u of c.users)
        db.prepare('INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(companyId, u.name, u.email, hash(u.password), u.role);
      const driverIds = c.drivers.map(([name, phone], i) =>
        Number(
          db.prepare('INSERT INTO drivers (company_id, name, phone, license_no) VALUES (?, ?, ?, ?)').run(companyId, name, phone, `LIC-${companyId}${String(i + 1).padStart(4, '0')}`)
            .lastInsertRowid,
        ),
      );
      c.vehicles.forEach(([name, plate, type, make, model, year, routeId], i) => {
        const imei = `86${String(companyId).padStart(3, '0')}${String(Math.floor(Math.random() * 1e10)).padStart(10, '0')}`;
        const driverId = driverIds[i] ?? null;
        const info = db
          .prepare(
            `INSERT INTO vehicles (company_id, driver_id, name, plate, type, make, model, year, device_imei, speed_limit, route_id, odometer_km, fuel_pct)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .run(companyId, driverId, name, plate, type, make, model, year, imei, SPEED_LIMITS[type], routeId, Math.round(20000 + Math.random() * 180000), Math.round(40 + Math.random() * 60));
        if (routeId == null) {
          db.prepare('UPDATE vehicles SET lat = ?, lng = ?, last_update = ? WHERE id = ?').run(24.6632, 46.751, Date.now() - 3 * 3600_000, info.lastInsertRowid);
        }
      });
      for (const [name, lat, lng, radius, color] of c.geofences)
        db.prepare('INSERT INTO geofences (company_id, name, lat, lng, radius_m, color) VALUES (?, ?, ?, ?, ?, ?)').run(companyId, name, lat, lng, radius, color);
    }
    const now = Date.now();
    for (const v of vehicleRows()) {
      const route = ROUTES.get(v.route_id!)!;
      saveLiveState(initialState(v, route, { leg: 0, dist: 0, now }), now);
    }
  })();

  const t0 = Date.now();
  backfill(Number(process.env.BACKFILL_DAYS ?? 7));
  db.prepare("INSERT INTO leads (kind, name, email, company, phone, fleet_size, message) VALUES ('demo', ?, ?, ?, ?, ?, ?)").run(
    'Abdulrahman Al-Sulaiman',
    'a.sulaiman@example.sa',
    'Gulf Cold Chain Co.',
    '+966 50 999 1234',
    '51-200',
    'Interested in temperature monitoring and live tracking for our refrigerated trucks.',
  );
  console.log(`[seed] Done (history backfill took ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
