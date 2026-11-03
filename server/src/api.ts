import bcrypt from 'bcryptjs';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { requireAuth, requireRole, scopeCompany, signToken, type AuthUser } from './auth.js';
import { db } from './db.js';
import { ROUTES, TYPE_PROFILE, vehicleStatus, type LiveSimulator } from './simulator.js';

const DAY = 86400_000;

function companyClause(companyId: number | null, column = 'company_id') {
  return companyId == null ? { sql: '1 = 1', params: [] as number[] } : { sql: `${column} = ?`, params: [companyId] };
}

function targetCompany(req: Request, bodyCompanyId?: number): number {
  const scoped = scopeCompany(req);
  const id = scoped ?? bodyCompanyId;
  if (!id) throw new HttpError(400, 'companyId is required');
  return id;
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function ownsRow(table: 'vehicles' | 'drivers' | 'geofences' | 'alerts' | 'users', id: number, req: Request) {
  const row = db.prepare(`SELECT company_id FROM ${table} WHERE id = ?`).get(id) as { company_id: number | null } | undefined;
  if (!row) throw new HttpError(404, 'Not found');
  const scoped = scopeCompany(req);
  if (req.user!.role !== 'admin' && row.company_id !== scoped) throw new HttpError(404, 'Not found');
  return row;
}

const vehicleSelect = `
  SELECT v.*, d.name AS driver_name, d.phone AS driver_phone, c.name AS company_name
  FROM vehicles v
  LEFT JOIN drivers d ON d.id = v.driver_id
  JOIN companies c ON c.id = v.company_id`;

function withStatus<T extends { last_update: number | null; ignition: number; speed: number }>(v: T) {
  return { ...v, status: vehicleStatus(v) };
}

export function createApi(sim: LiveSimulator) {
  const api = Router();

  // ---------- Public ----------
  api.get('/health', (_req, res) => res.json({ ok: true }));

  api.post('/auth/login', (req, res) => {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const row = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email) as (AuthUser & { password_hash: string }) | undefined;
    if (!row || !bcrypt.compareSync(password, row.password_hash)) return res.status(401).json({ error: 'Invalid email or password' });
    const user: AuthUser = { id: row.id, company_id: row.company_id, name: row.name, email: row.email, role: row.role };
    res.json({ token: signToken(user), user: withCompany(user) });
  });

  api.post('/public/leads', (req, res) => {
    const body = z
      .object({
        kind: z.enum(['demo', 'contact']),
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email(),
        company: z.string().trim().max(160).optional(),
        phone: z.string().trim().max(40).optional(),
        fleet_size: z.string().trim().max(40).optional(),
        message: z.string().trim().max(4000).optional(),
      })
      .parse(req.body);
    const info = db
      .prepare('INSERT INTO leads (kind, name, email, company, phone, fleet_size, message) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(body.kind, body.name, body.email, body.company ?? null, body.phone ?? null, body.fleet_size ?? null, body.message ?? null);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  });

  // ---------- Authenticated ----------
  api.use(requireAuth);

  function withCompany(user: AuthUser) {
    const company = user.company_id ? db.prepare('SELECT id, name, plan FROM companies WHERE id = ?').get(user.company_id) : null;
    return { ...user, company };
  }

  api.get('/auth/me', (req, res) => res.json({ user: withCompany(req.user!) }));

  api.put('/auth/password', (req, res) => {
    const { current, next } = z.object({ current: z.string(), next: z.string().min(6) }).parse(req.body);
    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as { password_hash: string };
    if (!bcrypt.compareSync(current, row.password_hash)) throw new HttpError(400, 'Current password is incorrect');
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(next, 10), req.user!.id);
    res.json({ ok: true });
  });

  api.get('/routes', (_req, res) => {
    res.json([...ROUTES.values()].map((r) => ({ id: r.id, name: r.name })));
  });

  // Vehicles
  api.get('/vehicles', (req, res) => {
    const c = companyClause(scopeCompany(req), 'v.company_id');
    const rows = db.prepare(`${vehicleSelect} WHERE ${c.sql} ORDER BY v.name`).all(...c.params) as Parameters<typeof withStatus>[0][];
    res.json(rows.map(withStatus));
  });

  api.get('/vehicles/:id', (req, res) => {
    const id = Number(req.params.id);
    ownsRow('vehicles', id, req);
    const v = db.prepare(`${vehicleSelect} WHERE v.id = ?`).get(id) as Parameters<typeof withStatus>[0];
    const since = Date.now() - DAY;
    const today = db
      .prepare('SELECT COUNT(*) AS trips, COALESCE(SUM(distance_km), 0) AS distance_km, COALESCE(MAX(max_speed), 0) AS max_speed FROM trips WHERE vehicle_id = ? AND start_ts >= ?')
      .get(id, since);
    res.json({ ...withStatus(v), last24h: today });
  });

  const vehicleBody = z.object({
    name: z.string().trim().min(1).max(80),
    plate: z.string().trim().min(1).max(20),
    type: z.enum(['truck', 'van', 'car', 'bus']),
    make: z.string().trim().max(60).optional().nullable(),
    model: z.string().trim().max(60).optional().nullable(),
    year: z.coerce.number().int().min(1980).max(2100).optional().nullable(),
    device_imei: z.string().trim().max(30).optional().nullable(),
    speed_limit: z.coerce.number().int().min(20).max(200),
    driver_id: z.coerce.number().int().optional().nullable(),
    route_id: z.coerce.number().int().optional().nullable(),
    companyId: z.coerce.number().int().optional(),
  });

  function checkDriver(driverId: number | null | undefined, companyId: number) {
    if (!driverId) return;
    const d = db.prepare('SELECT company_id FROM drivers WHERE id = ?').get(driverId) as { company_id: number } | undefined;
    if (!d || d.company_id !== companyId) throw new HttpError(400, 'Invalid driver');
  }

  api.post('/vehicles', requireRole('admin', 'manager'), (req, res) => {
    const b = vehicleBody.parse(req.body);
    const companyId = targetCompany(req, b.companyId);
    checkDriver(b.driver_id, companyId);
    const info = db
      .prepare(
        `INSERT INTO vehicles (company_id, driver_id, name, plate, type, make, model, year, device_imei, speed_limit, route_id, fuel_pct)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 100)`,
      )
      .run(companyId, b.driver_id ?? null, b.name, b.plate, b.type, b.make ?? null, b.model ?? null, b.year ?? null, b.device_imei ?? null, b.speed_limit, b.route_id ?? null);
    sim.reloadVehicles();
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  });

  api.put('/vehicles/:id', requireRole('admin', 'manager'), (req, res) => {
    const id = Number(req.params.id);
    const row = ownsRow('vehicles', id, req);
    const b = vehicleBody.parse(req.body);
    checkDriver(b.driver_id, row.company_id!);
    db.prepare(
      `UPDATE vehicles SET name = ?, plate = ?, type = ?, make = ?, model = ?, year = ?, device_imei = ?, speed_limit = ?, driver_id = ?, route_id = ? WHERE id = ?`,
    ).run(b.name, b.plate, b.type, b.make ?? null, b.model ?? null, b.year ?? null, b.device_imei ?? null, b.speed_limit, b.driver_id ?? null, b.route_id ?? null, id);
    sim.reloadVehicles();
    res.json({ ok: true });
  });

  api.delete('/vehicles/:id', requireRole('admin', 'manager'), (req, res) => {
    const id = Number(req.params.id);
    ownsRow('vehicles', id, req);
    db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
    sim.reloadVehicles();
    res.json({ ok: true });
  });

  api.get('/vehicles/:id/history', (req, res) => {
    const id = Number(req.params.id);
    ownsRow('vehicles', id, req);
    const to = Number(req.query.to ?? Date.now());
    const from = Number(req.query.from ?? to - DAY);
    const rows = db
      .prepare('SELECT ts, lat, lng, speed, heading, ignition FROM positions WHERE vehicle_id = ? AND ts BETWEEN ? AND ? ORDER BY ts')
      .all(id, from, to) as unknown[];
    const max = 6000;
    const stride = Math.ceil(rows.length / max);
    res.json(stride > 1 ? rows.filter((_, i) => i % stride === 0 || i === rows.length - 1) : rows);
  });

  // Trips
  api.get('/trips', (req, res) => {
    const c = companyClause(scopeCompany(req), 'v.company_id');
    const to = Number(req.query.to ?? Date.now());
    const from = Number(req.query.from ?? to - 7 * DAY);
    const params: (number | string)[] = [...c.params, from, to];
    let extra = '';
    if (req.query.vehicleId) {
      extra = ' AND t.vehicle_id = ?';
      params.push(Number(req.query.vehicleId));
    }
    const rows = db
      .prepare(
        `SELECT t.*, v.name AS vehicle_name, v.plate, d.name AS driver_name
         FROM trips t JOIN vehicles v ON v.id = t.vehicle_id LEFT JOIN drivers d ON d.id = t.driver_id
         WHERE ${c.sql} AND t.start_ts BETWEEN ? AND ? AND (t.end_ts IS NULL OR t.distance_km >= 0.1)${extra}
         ORDER BY t.start_ts DESC LIMIT 1000`,
      )
      .all(...params);
    res.json(rows);
  });

  api.get('/trips/:id/path', (req, res) => {
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(Number(req.params.id)) as
      | { vehicle_id: number; start_ts: number; end_ts: number | null }
      | undefined;
    if (!trip) throw new HttpError(404, 'Not found');
    ownsRow('vehicles', trip.vehicle_id, req);
    res.json(
      db
        .prepare('SELECT ts, lat, lng, speed, heading FROM positions WHERE vehicle_id = ? AND ts BETWEEN ? AND ? ORDER BY ts')
        .all(trip.vehicle_id, trip.start_ts, trip.end_ts ?? Date.now()),
    );
  });

  // Alerts
  api.get('/alerts', (req, res) => {
    const c = companyClause(scopeCompany(req), 'a.company_id');
    const params: (number | string)[] = [...c.params];
    let where = c.sql;
    if (req.query.status === 'open') where += ' AND a.acknowledged = 0';
    if (req.query.status === 'acknowledged') where += ' AND a.acknowledged = 1';
    if (req.query.type) {
      where += ' AND a.type = ?';
      params.push(String(req.query.type));
    }
    if (req.query.vehicleId) {
      where += ' AND a.vehicle_id = ?';
      params.push(Number(req.query.vehicleId));
    }
    const limit = Math.min(Number(req.query.limit ?? 200), 1000);
    const rows = db
      .prepare(
        `SELECT a.*, v.name AS vehicle_name, v.plate FROM alerts a LEFT JOIN vehicles v ON v.id = a.vehicle_id
         WHERE ${where} ORDER BY a.ts DESC LIMIT ${limit}`,
      )
      .all(...params);
    const { open } = db.prepare(`SELECT COUNT(*) AS open FROM alerts a WHERE ${c.sql} AND a.acknowledged = 0`).get(...c.params) as { open: number };
    res.json({ alerts: rows, open });
  });

  api.post('/alerts/:id/ack', (req, res) => {
    const id = Number(req.params.id);
    ownsRow('alerts', id, req);
    db.prepare('UPDATE alerts SET acknowledged = 1 WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  api.post('/alerts/ack-all', (req, res) => {
    const c = companyClause(scopeCompany(req));
    db.prepare(`UPDATE alerts SET acknowledged = 1 WHERE ${c.sql} AND acknowledged = 0`).run(...c.params);
    res.json({ ok: true });
  });

  // Geofences
  const geofenceBody = z.object({
    name: z.string().trim().min(1).max(80),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radius_m: z.coerce.number().min(50).max(50000),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#22d3ee'),
    companyId: z.coerce.number().int().optional(),
  });

  api.get('/geofences', (req, res) => {
    const c = companyClause(scopeCompany(req));
    res.json(db.prepare(`SELECT * FROM geofences WHERE ${c.sql} ORDER BY name`).all(...c.params));
  });

  api.post('/geofences', requireRole('admin', 'manager'), (req, res) => {
    const b = geofenceBody.parse(req.body);
    const companyId = targetCompany(req, b.companyId);
    const info = db
      .prepare('INSERT INTO geofences (company_id, name, lat, lng, radius_m, color) VALUES (?, ?, ?, ?, ?, ?)')
      .run(companyId, b.name, b.lat, b.lng, b.radius_m, b.color);
    sim.reloadGeofences();
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  });

  api.put('/geofences/:id', requireRole('admin', 'manager'), (req, res) => {
    const id = Number(req.params.id);
    ownsRow('geofences', id, req);
    const b = geofenceBody.parse(req.body);
    db.prepare('UPDATE geofences SET name = ?, lat = ?, lng = ?, radius_m = ?, color = ? WHERE id = ?').run(b.name, b.lat, b.lng, b.radius_m, b.color, id);
    sim.reloadGeofences();
    res.json({ ok: true });
  });

  api.delete('/geofences/:id', requireRole('admin', 'manager'), (req, res) => {
    const id = Number(req.params.id);
    ownsRow('geofences', id, req);
    db.prepare('DELETE FROM geofences WHERE id = ?').run(id);
    sim.reloadGeofences();
    res.json({ ok: true });
  });

  // Drivers
  const driverBody = z.object({
    name: z.string().trim().min(1).max(80),
    phone: z.string().trim().max(40).optional().nullable(),
    license_no: z.string().trim().max(40).optional().nullable(),
    companyId: z.coerce.number().int().optional(),
  });

  api.get('/drivers', (req, res) => {
    const c = companyClause(scopeCompany(req), 'd.company_id');
    res.json(
      db
        .prepare(
          `SELECT d.*, v.id AS vehicle_id, v.name AS vehicle_name, v.plate,
             (SELECT COALESCE(SUM(distance_km), 0) FROM trips t WHERE t.driver_id = d.id AND t.start_ts >= ?) AS distance_7d,
             (SELECT COUNT(*) FROM trips t WHERE t.driver_id = d.id AND t.start_ts >= ?) AS trips_7d,
             (SELECT COUNT(*) FROM alerts a WHERE a.vehicle_id = v.id AND a.type IN ('overspeed', 'harsh_braking') AND a.ts >= ?) AS events_7d
           FROM drivers d LEFT JOIN vehicles v ON v.driver_id = d.id
           WHERE ${c.sql} ORDER BY d.name`,
        )
        .all(Date.now() - 7 * DAY, Date.now() - 7 * DAY, Date.now() - 7 * DAY, ...c.params),
    );
  });

  api.post('/drivers', requireRole('admin', 'manager'), (req, res) => {
    const b = driverBody.parse(req.body);
    const companyId = targetCompany(req, b.companyId);
    const info = db.prepare('INSERT INTO drivers (company_id, name, phone, license_no) VALUES (?, ?, ?, ?)').run(companyId, b.name, b.phone ?? null, b.license_no ?? null);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  });

  api.put('/drivers/:id', requireRole('admin', 'manager'), (req, res) => {
    const id = Number(req.params.id);
    ownsRow('drivers', id, req);
    const b = driverBody.parse(req.body);
    db.prepare('UPDATE drivers SET name = ?, phone = ?, license_no = ? WHERE id = ?').run(b.name, b.phone ?? null, b.license_no ?? null, id);
    res.json({ ok: true });
  });

  api.delete('/drivers/:id', requireRole('admin', 'manager'), (req, res) => {
    const id = Number(req.params.id);
    ownsRow('drivers', id, req);
    db.prepare('DELETE FROM drivers WHERE id = ?').run(id);
    sim.reloadVehicles();
    res.json({ ok: true });
  });

  // Dashboard & reports
  api.get('/stats', (req, res) => {
    const companyId = scopeCompany(req);
    const cv = companyClause(companyId, 'v.company_id');
    const since = Date.now() - DAY;
    const vehicles = db.prepare(`SELECT last_update, ignition, speed FROM vehicles v WHERE ${cv.sql}`).all(...cv.params) as Parameters<typeof vehicleStatus>[0][];
    const statusCounts = { moving: 0, idle: 0, stopped: 0, offline: 0 };
    for (const v of vehicles) statusCounts[vehicleStatus(v)]++;
    const trips = db
      .prepare(`SELECT COUNT(*) AS trips, COALESCE(SUM(t.distance_km), 0) AS distance_km FROM trips t JOIN vehicles v ON v.id = t.vehicle_id WHERE ${cv.sql} AND t.start_ts >= ?`)
      .get(...cv.params, since);
    const alerts = db
      .prepare(`SELECT COUNT(*) AS alerts24h, COALESCE(SUM(a.acknowledged = 0), 0) AS open FROM alerts a WHERE ${companyClause(companyId, 'a.company_id').sql} AND a.ts >= ?`)
      .get(...cv.params, since);
    res.json({ total: vehicles.length, status: statusCounts, last24h: { ...(trips as object), ...(alerts as object) } });
  });

  api.get('/reports/summary', (req, res) => {
    const companyId = scopeCompany(req);
    const cv = companyClause(companyId, 'v.company_id');
    const days = Math.min(Math.max(Number(req.query.days ?? 7), 1), 30);
    const since = Date.now() - days * DAY;
    const daily = db
      .prepare(
        `SELECT date((t.start_ts / 1000) + 10800, 'unixepoch') AS day, ROUND(SUM(t.distance_km), 1) AS distance_km, COUNT(*) AS trips,
           ROUND(SUM(COALESCE(t.end_ts, t.start_ts) - t.start_ts) / 3600000.0, 1) AS driving_hours
         FROM trips t JOIN vehicles v ON v.id = t.vehicle_id WHERE ${cv.sql} AND t.start_ts >= ? GROUP BY day ORDER BY day`,
      )
      .all(...cv.params, since);
    const perVehicle = (
      db
        .prepare(
          `SELECT v.id, v.name, v.plate, v.type, COUNT(t.id) AS trips, ROUND(COALESCE(SUM(t.distance_km), 0), 1) AS distance_km,
             COALESCE(MAX(t.max_speed), 0) AS max_speed,
             ROUND(COALESCE(SUM(COALESCE(t.end_ts, t.start_ts) - t.start_ts), 0) / 3600000.0, 1) AS driving_hours,
             (SELECT COUNT(*) FROM alerts a WHERE a.vehicle_id = v.id AND a.ts >= ?) AS alerts
           FROM vehicles v LEFT JOIN trips t ON t.vehicle_id = v.id AND t.start_ts >= ?
           WHERE ${cv.sql} GROUP BY v.id ORDER BY distance_km DESC`,
        )
        .all(since, since, ...cv.params) as { type: string; distance_km: number; driving_hours: number }[]
    ).map((r) => ({
      ...r,
      fuel_l: Math.round(r.distance_km * (TYPE_PROFILE[r.type] ?? TYPE_PROFILE.truck).lPerKm),
      utilization_pct: Math.min(100, Math.round((r.driving_hours / (days * 14)) * 100)),
    }));
    const alertsByType = db
      .prepare(`SELECT a.type, COUNT(*) AS count FROM alerts a WHERE ${companyClause(companyId, 'a.company_id').sql} AND a.ts >= ? GROUP BY a.type ORDER BY count DESC`)
      .all(...cv.params, since);
    res.json({ days, daily, perVehicle, alertsByType });
  });

  // Company users
  api.get('/users', requireRole('admin', 'manager'), (req, res) => {
    const c = companyClause(scopeCompany(req));
    res.json(db.prepare(`SELECT id, company_id, name, email, role, created_at FROM users WHERE ${c.sql} ORDER BY name`).all(...c.params));
  });

  api.post('/users', requireRole('admin', 'manager'), (req, res) => {
    const b = z
      .object({
        name: z.string().trim().min(1).max(80),
        email: z.string().trim().email(),
        password: z.string().min(6),
        role: z.enum(['manager', 'viewer']),
        companyId: z.coerce.number().int().optional(),
      })
      .parse(req.body);
    const companyId = targetCompany(req, b.companyId);
    if (db.prepare('SELECT 1 FROM users WHERE lower(email) = lower(?)').get(b.email)) throw new HttpError(409, 'Email already in use');
    const info = db
      .prepare('INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
      .run(companyId, b.name, b.email, bcrypt.hashSync(b.password, 10), b.role);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  });

  api.delete('/users/:id', requireRole('admin', 'manager'), (req, res) => {
    const id = Number(req.params.id);
    if (id === req.user!.id) throw new HttpError(400, 'You cannot delete yourself');
    ownsRow('users', id, req);
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ ok: true });
  });

  // ---------- Platform admin ----------
  const admin = Router();
  admin.use(requireRole('admin'));

  admin.get('/companies', (_req, res) => {
    res.json(
      db
        .prepare(
          `SELECT c.*, (SELECT COUNT(*) FROM vehicles v WHERE v.company_id = c.id) AS vehicles,
             (SELECT COUNT(*) FROM users u WHERE u.company_id = c.id) AS users,
             (SELECT COUNT(*) FROM alerts a WHERE a.company_id = c.id AND a.acknowledged = 0) AS open_alerts
           FROM companies c ORDER BY c.name`,
        )
        .all(),
    );
  });

  admin.post('/companies', (req, res) => {
    const b = z
      .object({
        name: z.string().trim().min(2).max(120),
        contact_email: z.string().trim().email(),
        phone: z.string().trim().max(40).optional(),
        plan: z.enum(['starter', 'business', 'enterprise']),
        manager_name: z.string().trim().min(1).max(80),
        manager_email: z.string().trim().email(),
        manager_password: z.string().min(6),
      })
      .parse(req.body);
    if (db.prepare('SELECT 1 FROM users WHERE lower(email) = lower(?)').get(b.manager_email)) throw new HttpError(409, 'Manager email already in use');
    const id = db.transaction(() => {
      const companyId = Number(
        db.prepare('INSERT INTO companies (name, contact_email, phone, plan) VALUES (?, ?, ?, ?)').run(b.name, b.contact_email, b.phone ?? null, b.plan).lastInsertRowid,
      );
      db.prepare('INSERT INTO users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
        companyId,
        b.manager_name,
        b.manager_email,
        bcrypt.hashSync(b.manager_password, 10),
        'manager',
      );
      return companyId;
    })();
    res.status(201).json({ id });
  });

  admin.delete('/companies/:id', (req, res) => {
    db.prepare('DELETE FROM companies WHERE id = ?').run(Number(req.params.id));
    sim.reloadVehicles();
    sim.reloadGeofences();
    res.json({ ok: true });
  });

  admin.get('/leads', (_req, res) => {
    res.json(db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all());
  });

  admin.put('/leads/:id', (req, res) => {
    const { status } = z.object({ status: z.enum(['new', 'contacted', 'won', 'lost']) }).parse(req.body);
    db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, Number(req.params.id));
    res.json({ ok: true });
  });

  api.use('/admin', admin);

  api.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) return res.status(400).json({ error: err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ') });
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return api;
}
