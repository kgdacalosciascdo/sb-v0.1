import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isDemoAuthenticated } from '../../features/auth/utils/demoAuth'

export function ProtectedRoute() {
  const location = useLocation()

  if (!isDemoAuthenticated()) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  if (isDemoAuthenticated()) {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}
