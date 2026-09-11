import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../../layouts/AppLayout'
import { AuthLayout } from '../../layouts/AuthLayout'
import { ComingSoonPage } from '../../pages/ComingSoonPage'
import { HomePage } from '../../pages/home/HomePage'
import { LoginPage } from '../../pages/auth/LoginPage'
import { DashboardPage } from '../../pages/dashboard/DashboardPage'
import { MasterRegistriesPage } from '../../pages/master-registries/MasterRegistriesPage'
import { SettingsPage } from '../../pages/settings/SettingsPage'
import { SalesPage } from '../../pages/sales/SalesPage'
import { SalesHistoryPage } from '../../pages/sales/SalesHistoryPage'
import { SalesEntryPage } from '../../pages/sales/sales-entry/SalesEntryPage'
import { CollectionsPage } from '../../pages/collections/CollectionsPage'
import { PurchasesPage } from '../../pages/purchases/PurchasesPage'
import { PaymentsPage } from '../../pages/payments/PaymentsPage'
import { InventoryPage } from '../../pages/inventory/InventoryPage'
import { CashAccountsPage } from '../../pages/cash-accounts/CashAccountsPage'
import { ExpensesPage } from '../../pages/expenses/ExpensesPage'
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
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/history" element={<SalesHistoryPage />} />
            <Route path="/sales/entry" element={<SalesEntryPage />} />
            <Route path="/sales/cash-sales" element={<SalesEntryPage />} />
            <Route path="/sales/credit-sales" element={<SalesEntryPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/cash-accounts" element={<CashAccountsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
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
