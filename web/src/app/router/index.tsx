import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../../layouts/AppLayout'
import { AuthLayout } from '../../layouts/AuthLayout'
import { ComingSoonPage } from '../../pages/ComingSoonPage'
import { HomePage } from '../../pages/home/HomePage'
import { LoginPage } from '../../pages/auth/LoginPage'
import { DashboardPage } from '../../pages/dashboard/DashboardPage'
import { MasterRegistriesPage } from '../../pages/master-registries/MasterRegistriesPage'
import { SettingsPage } from '../../pages/settings/SettingsPage'
import { allNavigationItems } from '../../routes/navigation'
import { ProtectedRoute, PublicOnlyRoute } from './guards'

const comingSoonItems = allNavigationItems.filter((item) => item.isComingSoon)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/master-registries" element={<MasterRegistriesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {comingSoonItems
              .filter((item) => item.path !== '/')
              .map((item) => (
                <Route element={<ComingSoonPage />} key={item.path} path={item.path} />
              ))}
          </Route>
        </Route>

        <Route path="*" element={<Navigate replace to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}
