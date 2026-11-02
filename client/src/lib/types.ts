export type Role = 'admin' | 'manager' | 'viewer'
export type VehicleStatus = 'moving' | 'idle' | 'stopped' | 'offline'
export type VehicleType = 'truck' | 'van' | 'car' | 'bus'

export interface User {
  id: number
  company_id: number | null
  name: string
  email: string
  role: Role
  company: { id: number; name: string; plan: string } | null
}

export interface Vehicle {
  id: number
  company_id: number
  company_name: string
  driver_id: number | null
  driver_name: string | null
  driver_phone: string | null
  name: string
  plate: string
  type: VehicleType
  make: string | null
  model: string | null
  year: number | null
  device_imei: string | null
  speed_limit: number
  route_id: number | null
  odometer_km: number
  lat: number | null
  lng: number | null
  speed: number
  heading: number
  ignition: number
  fuel_pct: number
  last_update: number | null
  status: VehicleStatus
}

export interface LiveUpdate {
  id: number
  lat: number
  lng: number
  speed: number
  heading: number
  ignition: number
  fuel_pct: number
  odometer_km: number
  status: VehicleStatus
  last_update: number
}

export type AlertType = 'overspeed' | 'geofence_enter' | 'geofence_exit' | 'low_fuel' | 'idling' | 'harsh_braking'

export interface Alert {
  id: number
  company_id: number
  vehicle_id: number
  vehicle_name?: string
  plate?: string
  type: AlertType
  severity: 'info' | 'warning' | 'critical'
  message: string
  lat: number
  lng: number
  ts: number
  acknowledged?: number
}

export interface Trip {
  id: number
  vehicle_id: number
  vehicle_name: string
  plate: string
  driver_name: string | null
  start_ts: number
  end_ts: number | null
  start_label: string
  end_label: string
  distance_km: number
  max_speed: number
}

export interface Position {
  ts: number
  lat: number
  lng: number
  speed: number
  heading: number
  ignition?: number
}

export interface Geofence {
  id: number
  company_id: number
  name: string
  lat: number
  lng: number
  radius_m: number
  color: string
}

export interface Driver {
  id: number
  company_id: number
  name: string
  phone: string | null
  license_no: string | null
  vehicle_id: number | null
  vehicle_name: string | null
  plate: string | null
  distance_7d: number
  trips_7d: number
  events_7d: number
}

export interface Company {
  id: number
  name: string
  contact_email: string
  phone: string | null
  plan: string
  vehicles: number
  users: number
  open_alerts: number
  created_at: number
}

export interface Lead {
  id: number
  kind: 'demo' | 'contact'
  name: string
  email: string
  company: string | null
  phone: string | null
  fleet_size: string | null
  message: string | null
  status: 'new' | 'contacted' | 'won' | 'lost'
  created_at: number
}
