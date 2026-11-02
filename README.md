# Drevantix

Vehicle tracking platform, customer portal and company website for **Drevantix** – *Smarter Technology. Safer Tomorrow.*

## What's inside

| Area | Features |
| --- | --- |
| **Website** (`/`) | Home, About, Solutions, Industries, Technology, Contact and Request-a-Demo (leads are stored and visible to admins). |
| **Customer portal** (`/portal`) | Live fleet map (real-time over WebSockets), dashboard KPIs, vehicles (CRUD), vehicle detail with route playback & speed profile, trips with map view, alerts (overspeed, harsh braking, idling, low fuel, geofence entry/exit), geofences drawn on the map, drivers with safety score, reports with CSV export, team & password settings. |
| **Platform admin** | Customer (company) management, lead/demo inbox, view any customer's fleet. |

Roles: `admin` (Drevantix staff), `manager` (full access to own company), `viewer` (read-only).

## Stack

- **Server** – Node 20+, Express 5, TypeScript (run via `tsx`), SQLite (`better-sqlite3`), JWT auth, Socket.IO.
- **Client** – Vite, React 19, TypeScript, Tailwind CSS v4, React Router, Leaflet / OpenStreetMap, Recharts.
- **GPS simulator** – vehicles drive real Riyadh road routes (pre-generated from OSRM, `server/src/data/routes.json`). On first start the DB is seeded with demo companies and 7 days of history.

## Running locally

```bash
npm run install:all     # installs root, server and client deps
npm run dev             # API on :4000 + Vite on :5173 (proxying /api and /socket.io)
```

Open http://localhost:5173.

Production-style (single port):

```bash
npm run build           # builds client/dist
JWT_SECRET=change-me npm start   # serves API + website on :4000
```

`npm run reset-db` deletes the SQLite DB; it is re-seeded on next start.

### Environment variables

| Name | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | API/website port |
| `JWT_SECRET` | dev fallback | **Set in production** |
| `DATABASE_FILE` | `server/data/drevantix.db` | SQLite file |
| `BACKFILL_DAYS` | `7` | Days of history generated on first seed |

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Fleet manager (Al Noor Logistics) | demo@drevantix.com | demo123 |
| Viewer (Al Noor Logistics) | viewer@drevantix.com | viewer123 |
| Platform admin | admin@drevantix.com | admin123 |
| Manager (Riyadh Express Couriers) | manager@rexpress.sa | courier123 |
| Manager (Najd Construction) | manager@najdcon.sa | najd123 |

## Connecting real GPS devices

The simulator writes through the same tables a device gateway would (`positions`, `trips`, `alerts`, live `vehicles` columns). To go live, add an ingestion endpoint/protocol listener (e.g. Teltonika/GT06/OsmAnd) that resolves the vehicle by `device_imei` and writes positions; vehicles without a demo route are not simulated.
