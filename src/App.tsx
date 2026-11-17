import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router'
import { Logo } from '@/ds/brand/Logo'
import FoundationsPage from '@/showcase/FoundationsPage'

function Placeholder({ title }: { title: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6 text-fg">
      <div className="flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-6 text-heading-xl">{title}</h1>
        <p className="mt-2 text-body-sm text-fg-subtle">Arrives in a later stage.</p>
        <nav className="mt-6 flex justify-center gap-4 text-body-sm text-fg-brand underline">
          <Link to="/">Marketing</Link>
          <Link to="/app">App</Link>
          <Link to="/design-system/foundations">Foundations</Link>
        </nav>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Placeholder title="Marketing site" />} />
        <Route path="/app/*" element={<Placeholder title="Accounting app" />} />
        <Route path="/design-system" element={<Navigate to="/design-system/foundations" replace />} />
        <Route path="/design-system/foundations" element={<FoundationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
