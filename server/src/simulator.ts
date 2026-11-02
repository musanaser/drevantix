import { readFileSync } from 'node:fs';
import { db } from './db.js';
import { buildPath, distanceM, pointAt, type LatLng, type Path } from './geo.js';

interface Leg {
  from: string;
  to: string;
  path: Path;
}
export interface Route {
  id: number;
  name: string;
  legs: Leg[];
}

const rawRoutes = JSON.parse(readFileSync(new URL('./data/routes.json', import.meta.url), 'utf8')) as {
  id: number;
  name: string;
  legs: { from: string; to: string; points: LatLng[] }[];
}[];

export const ROUTES = new Map<number, Route>(
  rawRoutes.map((r) => [r.id, { id: r.id, name: r.name, legs: r.legs.map((l) => ({ ...l, path: buildPath(l.points) })) }]),
);

export const TYPE_PROFILE: Record<string, { cruise: number; fuelCapacity: number; lPerKm: number }> = {
  truck: { cruise: 74, fuelCapacity: 400, lPerKm: 0.33 },
  van: { cruise: 86, fuelCapacity: 80, lPerKm: 0.12 },
  car: { cruise: 94, fuelCapacity: 60, lPerKm: 0.08 },
  bus: { cruise: 70, fuelCapacity: 300, lPerKm: 0.3 },
};

export type VehicleStatus = 'moving' | 'idle' | 'stopped' | 'offline';
export const OFFLINE_AFTER_MS = 10 * 60 * 1000;

export function vehicleStatus(v: { last_update: number | null; ignition: number; speed: number }, now = Date.now()): VehicleStatus {
  if (!v.last_update || now - v.last_update > OFFLINE_AFTER_MS) return 'offline';
  if (v.ignition && v.speed > 3) return 'moving';
  if (v.ignition) return 'idle';
  return 'stopped';
}

interface VehicleRow {
  id: number;
  company_id: number;
  driver_id: number | null;
  name: string;
  plate: string;
  type: string;
  speed_limit: number;
  route_id: number | null;
  odometer_km: number;
  lat: number | null;
  lng: number | null;
  ignition: number;
  fuel_pct: number;
}

interface Geofence {
  id: number;
  company_id: number;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
}

export interface SimState {
  v: VehicleRow;
  route: Route;
  leg: number;
  dist: number;
  phase: 'driving' | 'parked' | 'idling';
  phaseStart: number;
  phaseUntil: number;
  speed: number;
  heading: number;
  pos: LatLng;
  fuel: number;
  odometer: number;
  speedingUntil: number;
  speedingTarget: number;
  trafficUntil: number;
  tripId: number | null;
  tripDist: number;
  tripMax: number;
  overspeed: boolean;
  idleAlerted: boolean;
  lowFuelAlerted: boolean;
  inside: Set<number>;
  geoInit: boolean;
  lastPersist: number;
}

export interface AlertInput {
  company_id: number;
  vehicle_id: number;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  lat: number;
  lng: number;
  ts: number;
}

export interface Sink {
  position(s: SimState, ts: number): void;
  startTrip(s: SimState, ts: number): number;
  updateTrip(s: SimState): void;
  endTrip(s: SimState, ts: number): void;
  alert(a: AlertInput): void;
}

export interface StepConfig {
  stopRange: [number, number];
  persistEveryS: number;
  idleAlertAfterS: number;
  workHours: boolean;
  idleChance: number;
  geofences: Map<number, Geofence[]>;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const RIYADH_OFFSET = 3 * 3600 * 1000;
const riyadhHour = (ts: number) => new Date(ts + RIYADH_OFFSET).getUTCHours();
function nextMorning(ts: number): number {
  const d = new Date(ts + RIYADH_OFFSET);
  d.setUTCDate(d.getUTCDate() + (d.getUTCHours() >= 6 ? 1 : 0));
  d.setUTCHours(6, 0, 0, 0);
  return d.getTime() - RIYADH_OFFSET + rand(0, 90) * 60_000;
}

function startDriving(s: SimState, now: number, sink: Sink) {
  s.phase = 'driving';
  s.phaseStart = now;
  s.idleAlerted = false;
  s.tripDist = 0;
  s.tripMax = 0;
  s.tripId = sink.startTrip(s, now);
}

function checkGeofences(s: SimState, now: number, cfg: StepConfig, sink: Sink) {
  const fences = cfg.geofences.get(s.v.company_id) ?? [];
  if (!s.geoInit) {
    s.geoInit = true;
    for (const g of fences) if (distanceM(s.pos, [g.lat, g.lng]) <= g.radius_m) s.inside.add(g.id);
    return;
  }
  for (const g of fences) {
    const inside = distanceM(s.pos, [g.lat, g.lng]) <= g.radius_m;
    const was = s.inside.has(g.id);
    if (inside === was) continue;
    if (inside) s.inside.add(g.id);
    else s.inside.delete(g.id);
    sink.alert({
      company_id: s.v.company_id,
      vehicle_id: s.v.id,
      type: inside ? 'geofence_enter' : 'geofence_exit',
      severity: 'info',
      message: `${s.v.name} ${inside ? 'entered' : 'exited'} geofence "${g.name}"`,
      lat: s.pos[0],
      lng: s.pos[1],
      ts: now,
    });
  }
}

export function step(s: SimState, now: number, dt: number, cfg: StepConfig, sink: Sink) {
  const profile = TYPE_PROFILE[s.v.type] ?? TYPE_PROFILE.truck;
  const base = { company_id: s.v.company_id, vehicle_id: s.v.id, lat: s.pos[0], lng: s.pos[1], ts: now };

  if (s.phase !== 'driving') {
    s.speed = 0;
    if (s.phase === 'idling') {
      s.fuel = Math.max(0, s.fuel - (dt / 3600) * (2.5 / profile.fuelCapacity) * 100);
      if (!s.idleAlerted && now - s.phaseStart > cfg.idleAlertAfterS * 1000) {
        s.idleAlerted = true;
        sink.alert({ ...base, type: 'idling', severity: 'info', message: `${s.v.name} idling with engine on for over ${Math.round(cfg.idleAlertAfterS / 60)} min` });
      }
    }
    if (now >= s.phaseUntil) startDriving(s, now, sink);
    else {
      if (now - s.lastPersist >= 300_000) {
        s.lastPersist = now;
        sink.position(s, now);
      }
      return;
    }
  }

  const leg = s.route.legs[s.leg];
  const remaining = leg.path.length - s.dist;
  const wave = 0.5 + 0.5 * Math.sin(now / 1000 / 75 + s.v.id * 1.7);
  let target = profile.cruise * (0.82 + 0.28 * wave);

  if (now < s.speedingUntil) target = s.speedingTarget;
  else if (Math.random() < dt / 9000) {
    s.speedingUntil = now + rand(20, 70) * 1000;
    s.speedingTarget = s.v.speed_limit + rand(6, 32);
  }
  if (now < s.trafficUntil) target = 0;
  else if (Math.random() < dt / 1500) {
    s.trafficUntil = now + rand(15, 80) * 1000;
    if (s.speed > 65 && Math.random() < 0.1) {
      sink.alert({ ...base, type: 'harsh_braking', severity: 'warning', message: `${s.v.name} harsh braking detected at ${Math.round(s.speed)} km/h` });
    }
  }
  if (remaining < 220) target = Math.min(target, 8 + (remaining / 220) * 45);

  const delta = target - s.speed;
  s.speed = Math.max(0, s.speed + Math.max(-6 * dt, Math.min(2.5 * dt, delta)));

  const moved = (s.speed / 3.6) * dt;
  s.dist += moved;
  const km = moved / 1000;
  s.odometer += km;
  s.tripDist += km;
  s.tripMax = Math.max(s.tripMax, s.speed);
  s.fuel = Math.max(0, s.fuel - ((km * profile.lPerKm) / profile.fuelCapacity) * 100);

  const p = pointAt(leg.path, s.dist);
  s.pos = p.pos;
  if (s.speed > 1) s.heading = p.heading;
  base.lat = s.pos[0];
  base.lng = s.pos[1];

  if (s.speed > s.v.speed_limit + 3 && !s.overspeed) {
    s.overspeed = true;
    const over = s.speed - s.v.speed_limit;
    sink.alert({
      ...base,
      type: 'overspeed',
      severity: over > 20 ? 'critical' : 'warning',
      message: `${s.v.name} overspeeding: ${Math.round(s.speed)} km/h (limit ${s.v.speed_limit} km/h)`,
    });
  } else if (s.overspeed && s.speed < s.v.speed_limit - 2) s.overspeed = false;

  if (s.fuel < 15 && !s.lowFuelAlerted) {
    s.lowFuelAlerted = true;
    sink.alert({ ...base, type: 'low_fuel', severity: 'warning', message: `${s.v.name} low fuel: ${Math.round(s.fuel)}% remaining` });
  }

  checkGeofences(s, now, cfg, sink);

  if (s.dist >= leg.path.length) {
    s.speed = 0;
    sink.position(s, now);
    s.lastPersist = now;
    sink.endTrip(s, now);
    s.tripId = null;
    s.leg = (s.leg + 1) % s.route.legs.length;
    s.dist = 0;
    s.phaseStart = now;
    s.phase = Math.random() < cfg.idleChance ? 'idling' : 'parked';
    s.phaseUntil = now + rand(cfg.stopRange[0], cfg.stopRange[1]) * 1000;
    if (cfg.workHours && riyadhHour(now) >= 20) {
      s.phase = 'parked';
      s.phaseUntil = nextMorning(now);
    }
    if (s.fuel < 25) {
      s.fuel = rand(88, 100);
      s.lowFuelAlerted = false;
    }
    return;
  }

  if (now - s.lastPersist >= cfg.persistEveryS * 1000) {
    s.lastPersist = now;
    sink.position(s, now);
    sink.updateTrip(s);
  }
}

export function loadGeofences(): Map<number, Geofence[]> {
  const map = new Map<number, Geofence[]>();
  for (const g of db.prepare('SELECT id, company_id, name, lat, lng, radius_m FROM geofences').all() as Geofence[]) {
    if (!map.has(g.company_id)) map.set(g.company_id, []);
    map.get(g.company_id)!.push(g);
  }
  return map;
}

export function initialState(v: VehicleRow, route: Route, opts: { leg: number; dist: number; now: number }): SimState {
  const p = pointAt(route.legs[opts.leg].path, opts.dist);
  const profile = TYPE_PROFILE[v.type] ?? TYPE_PROFILE.truck;
  return {
    v,
    route,
    leg: opts.leg,
    dist: opts.dist,
    phase: 'parked',
    phaseStart: opts.now,
    phaseUntil: opts.now,
    speed: 0,
    heading: p.heading,
    pos: p.pos,
    fuel: v.fuel_pct,
    odometer: v.odometer_km,
    speedingUntil: 0,
    speedingTarget: profile.cruise,
    trafficUntil: 0,
    tripId: null,
    tripDist: 0,
    tripMax: 0,
    overspeed: false,
    idleAlerted: false,
    lowFuelAlerted: v.fuel_pct < 15,
    inside: new Set(),
    geoInit: false,
    lastPersist: 0,
  };
}

function nearestOnRoute(route: Route, pos: LatLng): { leg: number; dist: number } {
  let best = { leg: 0, dist: 0, d: Infinity };
  route.legs.forEach((leg, li) => {
    leg.path.points.forEach((pt, pi) => {
      const d = distanceM(pt, pos);
      if (d < best.d) best = { leg: li, dist: leg.path.cumulative[pi], d };
    });
  });
  return best;
}

export function vehicleRows(): VehicleRow[] {
  return db
    .prepare(
      'SELECT id, company_id, driver_id, name, plate, type, speed_limit, route_id, odometer_km, lat, lng, ignition, fuel_pct FROM vehicles WHERE route_id IS NOT NULL',
    )
    .all() as VehicleRow[];
}

const insertPosition = db.prepare(
  'INSERT INTO positions (vehicle_id, ts, lat, lng, speed, heading, ignition) VALUES (?, ?, ?, ?, ?, ?, ?)',
);
const insertTrip = db.prepare(
  'INSERT INTO trips (vehicle_id, driver_id, start_ts, start_label, end_label, start_lat, start_lng) VALUES (?, ?, ?, ?, ?, ?, ?)',
);
const updateTripStmt = db.prepare('UPDATE trips SET distance_km = ?, max_speed = ? WHERE id = ?');
const endTripStmt = db.prepare(
  'UPDATE trips SET end_ts = ?, end_lat = ?, end_lng = ?, distance_km = ?, max_speed = ? WHERE id = ?',
);
const deleteTripStmt = db.prepare('DELETE FROM trips WHERE id = ?');
const insertAlert = db.prepare(
  'INSERT INTO alerts (company_id, vehicle_id, type, severity, message, lat, lng, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
);

export function dbSink(onAlert?: (a: AlertInput & { id: number }) => void): Sink {
  return {
    position(s, ts) {
      insertPosition.run(s.v.id, ts, s.pos[0], s.pos[1], Math.round(s.speed * 10) / 10, Math.round(s.heading), s.phase === 'parked' ? 0 : 1);
      if (s.tripId) updateTripStmt.run(Math.round(s.tripDist * 100) / 100, Math.round(s.tripMax), s.tripId);
    },
    startTrip(s, ts) {
      const leg = s.route.legs[s.leg];
      return Number(insertTrip.run(s.v.id, s.v.driver_id, ts, leg.from, leg.to, s.pos[0], s.pos[1]).lastInsertRowid);
    },
    updateTrip(s) {
      if (s.tripId) updateTripStmt.run(Math.round(s.tripDist * 100) / 100, Math.round(s.tripMax), s.tripId);
    },
    endTrip(s, ts) {
      if (s.tripId && s.tripDist < 0.1) deleteTripStmt.run(s.tripId);
      else if (s.tripId) endTripStmt.run(ts, s.pos[0], s.pos[1], Math.round(s.tripDist * 100) / 100, Math.round(s.tripMax), s.tripId);
    },
    alert(a) {
      const id = Number(insertAlert.run(a.company_id, a.vehicle_id, a.type, a.severity, a.message, a.lat, a.lng, a.ts).lastInsertRowid);
      onAlert?.({ ...a, id });
    },
  };
}

const saveLive = db.prepare(
  'UPDATE vehicles SET lat = ?, lng = ?, speed = ?, heading = ?, ignition = ?, fuel_pct = ?, odometer_km = ?, last_update = ? WHERE id = ?',
);

export function saveLiveState(s: SimState, ts: number) {
  saveLive.run(
    s.pos[0],
    s.pos[1],
    Math.round(s.speed * 10) / 10,
    Math.round(s.heading),
    s.phase === 'parked' ? 0 : 1,
    Math.round(s.fuel * 10) / 10,
    Math.round(s.odometer * 10) / 10,
    ts,
    s.v.id,
  );
}

/** Generates `days` of historical positions, trips and alerts so the portal has data on first run. */
export function backfill(days: number) {
  const end = Date.now();
  const start = end - days * 86400_000;
  const dt = 15;
  const cfg: StepConfig = { stopRange: [600, 2400], persistEveryS: 30, idleAlertAfterS: 900, workHours: true, idleChance: 0.12, geofences: loadGeofences() };
  const sink = dbSink();
  const states = vehicleRows().map((v) => {
    const route = ROUTES.get(v.route_id!)!;
    const leg = Math.floor(Math.random() * route.legs.length);
    const s = initialState(v, route, { leg, dist: Math.random() * route.legs[leg].path.length * 0.5, now: start });
    s.phaseUntil = nextMorning(start);
    return s;
  });
  db.transaction(() => {
    for (let t = start; t < end; t += dt * 1000) for (const s of states) step(s, t, dt, cfg, sink);
    for (const s of states) {
      if (s.tripId) sink.updateTrip(s);
      saveLiveState(s, end);
    }
    db.prepare('UPDATE alerts SET acknowledged = 1 WHERE ts < ?').run(end - 6 * 3600_000);
  })();
}

export interface LiveUpdate {
  id: number;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  ignition: number;
  fuel_pct: number;
  odometer_km: number;
  status: VehicleStatus;
  last_update: number;
}

export class LiveSimulator {
  private states = new Map<number, SimState>();
  private timer?: NodeJS.Timeout;
  private cfg: StepConfig = { stopRange: [40, 150], persistEveryS: 10, idleAlertAfterS: 120, workHours: false, idleChance: 0.2, geofences: new Map() };
  private sink: Sink;

  constructor(
    private onUpdate: (companyId: number, updates: LiveUpdate[]) => void,
    onAlert: (a: AlertInput & { id: number }) => void,
    private tickS = 2,
  ) {
    this.sink = dbSink(onAlert);
  }

  start() {
    const now = Date.now();
    db.prepare('DELETE FROM trips WHERE distance_km < 0.1 AND (end_ts IS NULL OR end_ts - start_ts < 120000)').run();
    db.prepare(
      `UPDATE trips SET end_ts = COALESCE((SELECT MAX(ts) FROM positions p WHERE p.vehicle_id = trips.vehicle_id), start_ts),
        end_lat = (SELECT lat FROM vehicles v WHERE v.id = trips.vehicle_id), end_lng = (SELECT lng FROM vehicles v WHERE v.id = trips.vehicle_id)
       WHERE end_ts IS NULL`,
    ).run();
    this.reloadGeofences();
    this.reloadVehicles();
    for (const s of this.states.values()) s.phaseUntil = now + rand(0, 20) * 1000;
    this.timer = setInterval(() => this.tick(), this.tickS * 1000);
    setInterval(() => db.prepare('DELETE FROM positions WHERE ts < ?').run(Date.now() - 30 * 86400_000), 3600_000).unref();
  }

  stop() {
    clearInterval(this.timer);
  }

  reloadGeofences() {
    this.cfg.geofences = loadGeofences();
  }

  /** Syncs simulated vehicles with the DB after vehicles are created, edited or deleted. */
  reloadVehicles() {
    const now = Date.now();
    const rows = vehicleRows();
    const ids = new Set(rows.map((r) => r.id));
    for (const id of this.states.keys()) if (!ids.has(id)) this.states.delete(id);
    for (const v of rows) {
      const existing = this.states.get(v.id);
      const route = ROUTES.get(v.route_id!);
      if (!route) continue;
      if (existing && existing.route.id === route.id) {
        existing.v = v;
        continue;
      }
      const near = v.lat != null && v.lng != null ? nearestOnRoute(route, [v.lat, v.lng]) : { leg: 0, dist: 0 };
      const s = initialState(v, route, { ...near, now });
      s.phaseUntil = now + rand(2, 15) * 1000;
      this.states.set(v.id, s);
    }
  }

  private tick() {
    const now = Date.now();
    const byCompany = new Map<number, LiveUpdate[]>();
    db.transaction(() => {
      for (const s of this.states.values()) {
        step(s, now, this.tickS, this.cfg, this.sink);
        saveLiveState(s, now);
        const ignition = s.phase === 'parked' ? 0 : 1;
        const u: LiveUpdate = {
          id: s.v.id,
          lat: s.pos[0],
          lng: s.pos[1],
          speed: Math.round(s.speed * 10) / 10,
          heading: Math.round(s.heading),
          ignition,
          fuel_pct: Math.round(s.fuel * 10) / 10,
          odometer_km: Math.round(s.odometer * 10) / 10,
          status: vehicleStatus({ last_update: now, ignition, speed: s.speed }, now),
          last_update: now,
        };
        if (!byCompany.has(s.v.company_id)) byCompany.set(s.v.company_id, []);
        byCompany.get(s.v.company_id)!.push(u);
      }
    })();
    for (const [companyId, updates] of byCompany) this.onUpdate(companyId, updates);
  }
}
