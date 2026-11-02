import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import { api, getToken, setCompanyScope } from './api'
import { useAuth } from './auth'
import type { Alert, Company, LiveUpdate, Vehicle } from './types'

interface FleetState {
  vehicles: Vehicle[]
  loading: boolean
  refresh: () => Promise<void>
  openAlerts: number
  refreshAlertCount: () => void
  liveAlerts: Alert[]
  dismissAlert: (id: number) => void
  connected: boolean
  companyId: number | null
  setCompanyId: (id: number | null) => void
  companies: Company[]
  scopeKey: string
}

const FleetContext = createContext<FleetState | null>(null)

export function FleetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [openAlerts, setOpenAlerts] = useState(0)
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([])
  const [connected, setConnected] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyId, setCompanyIdState] = useState<number | null>(() => {
    const saved = isAdmin ? sessionStorage.getItem('drevantix_scope') : null
    const id = saved ? Number(saved) : null
    setCompanyScope(id)
    return id
  })
  const scopeRef = useRef(companyId)

  const setCompanyId = useCallback((id: number | null) => {
    setCompanyScope(id)
    scopeRef.current = id
    if (id) sessionStorage.setItem('drevantix_scope', String(id))
    else sessionStorage.removeItem('drevantix_scope')
    setCompanyIdState(id)
  }, [])

  const refresh = useCallback(async () => {
    const list = await api<Vehicle[]>('/vehicles')
    setVehicles(list)
    setLoading(false)
  }, [])

  const refreshAlertCount = useCallback(() => {
    api<{ open: number }>('/alerts', { query: { limit: 1 } }).then((r) => setOpenAlerts(r.open))
  }, [])

  useEffect(() => {
    setLoading(true)
    refresh()
    refreshAlertCount()
  }, [companyId, refresh, refreshAlertCount])

  useEffect(() => {
    if (isAdmin) api<Company[]>('/admin/companies').then(setCompanies)
  }, [isAdmin])

  useEffect(() => {
    const socket: Socket = io({ auth: { token: getToken() } })
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('vehicles:update', ({ companyId: cid, updates }: { companyId: number; updates: LiveUpdate[] }) => {
      if (scopeRef.current && scopeRef.current !== cid) return
      const byId = new Map(updates.map((u) => [u.id, u]))
      setVehicles((prev) => prev.map((v) => (byId.has(v.id) ? { ...v, ...byId.get(v.id)! } : v)))
    })
    socket.on('alert', (a: Alert) => {
      if (scopeRef.current && scopeRef.current !== a.company_id) return
      setOpenAlerts((n) => n + 1)
      if (a.severity !== 'info') setLiveAlerts((prev) => [a, ...prev].slice(0, 4))
    })
    return () => {
      socket.disconnect()
    }
  }, [])

  const dismissAlert = useCallback((id: number) => setLiveAlerts((prev) => prev.filter((a) => a.id !== id)), [])

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        loading,
        refresh,
        openAlerts,
        refreshAlertCount,
        liveAlerts,
        dismissAlert,
        connected,
        companyId,
        setCompanyId,
        companies,
        scopeKey: String(companyId ?? 'all'),
      }}
    >
      {children}
    </FleetContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFleet() {
  const ctx = useContext(FleetContext)
  if (!ctx) throw new Error('useFleet must be used inside FleetProvider')
  return ctx
}
