import L from 'leaflet'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { STATUS_META, place } from '../../lib/format'
import type { Geofence, Vehicle } from '../../lib/types'

export const RIYADH: [number, number] = [24.7136, 46.6753]

const TYPE_GLYPH: Record<string, string> = {
  truck: '<path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" fill="white"/><circle cx="7" cy="17" r="1.8" fill="white"/><circle cx="17" cy="17" r="1.8" fill="white"/>',
  van: '<path d="M3 8h12l4 4v4H3z" fill="white"/><circle cx="7" cy="17" r="1.8" fill="white"/><circle cx="16" cy="17" r="1.8" fill="white"/>',
  car: '<path d="M4 13l2-5h12l2 5v4H4z" fill="white"/><circle cx="8" cy="17" r="1.8" fill="white"/><circle cx="16" cy="17" r="1.8" fill="white"/>',
  bus: '<rect x="4" y="5" width="16" height="11" rx="2" fill="white"/><circle cx="8" cy="18" r="1.8" fill="white"/><circle cx="16" cy="18" r="1.8" fill="white"/>',
}

export function vehicleIcon(v: Pick<Vehicle, 'status' | 'heading' | 'type' | 'name'>, selected = false, showLabel = true) {
  const color = STATUS_META[v.status].color
  const arrow =
    v.status === 'moving'
      ? `<div style="position:absolute;inset:-9px;transform:rotate(${v.heading}deg)"><div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:7px solid ${color}"></div></div>`
      : ''
  return L.divIcon({
    className: `vehicle-icon${selected ? ' selected' : ''}`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div style="position:relative">${arrow}<div class="pin" style="background:${color}"><svg viewBox="0 0 24 24" width="16" height="16">${
      TYPE_GLYPH[v.type] ?? TYPE_GLYPH.truck
    }</svg></div>${showLabel ? `<div class="label">${v.name}</div>` : ''}</div>`,
  })
}

function FitBounds({ points, trigger }: { points: [number, number][]; trigger: unknown }) {
  const map = useMap()
  const done = useRef<unknown>(undefined)
  useEffect(() => {
    if (!points.length || done.current === trigger) return
    done.current = trigger
    if (points.length === 1) map.setView(points[0], 14)
    else map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 })
  }, [points, trigger, map])
  return null
}

function FollowVehicle({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.panTo(target, { animate: true })
  }, [target, map])
  return null
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) })
  return null
}

function InvalidateOnResize() {
  const map = useMap()
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(map.getContainer())
    return () => ro.disconnect()
  }, [map])
  return null
}

export function BaseMap({ children, className = 'h-full w-full', center = RIYADH, zoom = 11 }: { children?: ReactNode; className?: string; center?: [number, number]; zoom?: number }) {
  return (
    <MapContainer center={center} zoom={zoom} className={className} scrollWheelZoom zoomControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <InvalidateOnResize />
      {children}
    </MapContainer>
  )
}

export function GeofenceLayer({ geofences, onSelect }: { geofences: Geofence[]; onSelect?: (g: Geofence) => void }) {
  return (
    <>
      {geofences.map((g) => (
        <Circle
          key={g.id}
          center={[g.lat, g.lng]}
          radius={g.radius_m}
          pathOptions={{ color: g.color, fillColor: g.color, fillOpacity: 0.12, weight: 2, dashArray: '6 4' }}
          eventHandlers={onSelect ? { click: () => onSelect(g) } : undefined}
        >
          <Tooltip direction="top">{place(g.name)}</Tooltip>
        </Circle>
      ))}
    </>
  )
}

interface FleetMapProps {
  vehicles: Vehicle[]
  geofences?: Geofence[]
  selectedId?: number | null
  onSelect?: (id: number) => void
  follow?: boolean
  className?: string
  showLabels?: boolean
  trail?: [number, number][]
  onMapClick?: (lat: number, lng: number) => void
  children?: ReactNode
  fitKey?: unknown
}

export function FleetMap({ vehicles, geofences = [], selectedId, onSelect, follow, className, showLabels = true, trail, onMapClick, children, fitKey = 'init' }: FleetMapProps) {
  const located = vehicles.filter((v) => v.lat != null && v.lng != null)
  const points = useMemo(() => located.map((v) => [v.lat!, v.lng!] as [number, number]), [located])
  const selected = located.find((v) => v.id === selectedId)
  return (
    <BaseMap className={className}>
      <FitBounds points={points} trigger={fitKey} />
      {follow && selected && <FollowVehicle target={[selected.lat!, selected.lng!]} />}
      {onMapClick && <ClickHandler onClick={onMapClick} />}
      <GeofenceLayer geofences={geofences} />
      {trail && trail.length > 1 && <Polyline positions={trail} pathOptions={{ color: '#1cc8ee', weight: 4, opacity: 0.85 }} />}
      {located.map((v) => (
        <Marker
          key={v.id}
          position={[v.lat!, v.lng!]}
          icon={vehicleIcon(v, v.id === selectedId, showLabels)}
          zIndexOffset={v.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect?.(v.id) }}
        />
      ))}
      {children}
    </BaseMap>
  )
}
