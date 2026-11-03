import { Navigate, Route, Routes } from 'react-router-dom'
import { MarketingLayout } from './components/marketing/MarketingLayout'
import { RequireAuth } from './components/portal/PortalLayout'
import { useAuth } from './lib/auth'
import Customers from './pages/admin/Customers'
import Leads from './pages/admin/Leads'
import About from './pages/marketing/About'
import Contact from './pages/marketing/Contact'
import Home from './pages/marketing/Home'
import Industries from './pages/marketing/Industries'
import RequestDemo from './pages/marketing/RequestDemo'
import Solutions from './pages/marketing/Solutions'
import Technology from './pages/marketing/Technology'
import Alerts from './pages/portal/Alerts'
import Dashboard from './pages/portal/Dashboard'
import Drivers from './pages/portal/Drivers'
import Geofences from './pages/portal/Geofences'
import LiveMap from './pages/portal/LiveMap'
import Login from './pages/portal/Login'
import Reports from './pages/portal/Reports'
import Settings from './pages/portal/Settings'
import Trips from './pages/portal/Trips'
import VehicleDetail from './pages/portal/VehicleDetail'
import Vehicles from './pages/portal/Vehicles'

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user?.role === 'admin' ? children : <Navigate to="/portal" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="industries" element={<Industries />} />
        <Route path="technology" element={<Technology />} />
        <Route path="contact" element={<Contact />} />
        <Route path="request-demo" element={<RequestDemo />} />
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="portal" element={<RequireAuth />}>
        <Route index element={<Dashboard />} />
        <Route path="live" element={<LiveMap />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="vehicles/:id" element={<VehicleDetail />} />
        <Route path="trips" element={<Trips />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="geofences" element={<Geofences />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin/customers" element={<AdminOnly><Customers /></AdminOnly>} />
        <Route path="admin/leads" element={<AdminOnly><Leads /></AdminOnly>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
