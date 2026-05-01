import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/use-auth'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Layout from '@/components/Layout'
import { ROUTES } from '@/lib/constants'

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Economia = lazy(() => import('./pages/Economia'))
const Contas = lazy(() => import('./pages/Contas'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Reserva = lazy(() => import('./pages/Reserva'))
const NotFound = lazy(() => import('./pages/NotFound'))

const LoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
)

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.ECONOMIA} element={<Economia />} />
                <Route path={ROUTES.CONTAS} element={<Contas />} />
                <Route path={ROUTES.CONFIGURACOES} element={<Configuracoes />} />
                <Route path={ROUTES.RESERVA} element={<Reserva />} />
                <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
)

export default App
