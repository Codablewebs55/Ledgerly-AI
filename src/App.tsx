import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ToastProvider } from '@/ds'
import { NotFoundPage, ShellPage } from '@/app/pages/ShellPage'
import { shellPages } from '@/app/pages/shell-pages'
import AppShell from '@/app/shell/AppShell'
import CreateInvoicePage from '@/app/pages/CreateInvoicePage'
import DashboardPage from '@/app/pages/DashboardPage'
import InvoicesPage from '@/app/pages/InvoicesPage'
import ComponentsPage from '@/showcase/ComponentsPage'
import DesignSystemLayout from '@/showcase/DesignSystemLayout'
import FoundationsPage from '@/showcase/FoundationsPage'
import LandingPage from '@/marketing/LandingPage'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/new" element={<CreateInvoicePage />} />
            <Route path="expenses" element={<ShellPage {...shellPages.expenses} />} />
            <Route path="transactions" element={<ShellPage {...shellPages.transactions} />} />
            <Route path="banking" element={<ShellPage {...shellPages.banking} />} />
            <Route path="reports" element={<ShellPage {...shellPages.reports} />} />
            <Route path="customers" element={<ShellPage {...shellPages.customers} />} />
            <Route path="settings" element={<ShellPage {...shellPages.settings} />} />
            <Route path="help" element={<ShellPage {...shellPages.help} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/design-system" element={<DesignSystemLayout />}>
            <Route index element={<Navigate to="foundations" replace />} />
            <Route path="foundations" element={<FoundationsPage />} />
            <Route path="components" element={<ComponentsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
