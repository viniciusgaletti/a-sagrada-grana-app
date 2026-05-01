import { Suspense, lazy, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Shell } from '@/components/layout/Shell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

// Auth (public)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))

// Onboarding (auth required, no onboarding check)
const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage'))

// App (fully protected)
const DiaryPage = lazy(() => import('@/pages/diary/DiaryPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const EconomyPage = lazy(() => import('@/pages/economy/EconomyPage'))
const AccountsPage = lazy(() => import('@/pages/accounts/AccountsPage'))
const ReservePage = lazy(() => import('@/pages/reserve/ReservePage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))

// ─── Suspense fallback ────────────────────────────────────────────────────────

const PageLoader = () => (
  <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--background)' }}>
    <div className="flex flex-col items-center gap-3">
      <div
        className="h-8 w-8 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
      />
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Carregando...
      </p>
    </div>
  </div>
)

// ─── Global Error Boundary ────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class GlobalErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[GlobalErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4"
          style={{ background: 'var(--background)', color: 'var(--foreground)' }}
        >
          <span className="text-4xl" aria-hidden>💸</span>
          <h1 className="font-serif text-2xl">Algo deu errado</h1>
          <p className="text-sm max-w-sm" style={{ color: 'var(--muted-foreground)' }}>
            {this.state.error?.message ?? 'Erro inesperado. Recarregue a página.'}
          </p>
          <button
            id="error-boundary-reload-btn"
            className="mt-2 px-6 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

const App = () => (
  <GlobalErrorBoundary>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public auth routes (no Shell, no guard) ────────────────── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Shell wraps all navigated pages ───────────────────────── */}
            <Route element={<Shell />}>
              {/* Onboarding: requires auth but skips onboarding_completed check */}
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Protected app routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DiaryPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/economia" element={<EconomyPage />} />
                <Route path="/contas" element={<AccountsPage />} />
                <Route path="/reserva" element={<ReservePage />} />
                <Route path="/configuracoes" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </TooltipProvider>
    </BrowserRouter>
  </GlobalErrorBoundary>
)

export default App
