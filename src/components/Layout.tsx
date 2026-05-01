import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { NAV_ITEMS, SECONDARY_NAV_ITEMS, ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PiggyBank, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { onboardingService } from '@/services/onboarding.service'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  const isAuthPage = location.pathname === ROUTES.ONBOARDING

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setCheckingOnboarding(false)
      return
    }

    onboardingService
      .checkOnboardingStatus(user.id)
      .then((completed) => {
        if (!completed && !isAuthPage) {
          navigate(ROUTES.ONBOARDING, { replace: true })
        } else if (completed && isAuthPage) {
          navigate(ROUTES.HOME, { replace: true })
        }
        setCheckingOnboarding(false)
      })
      .catch(() => {
        setCheckingOnboarding(false)
      })
  }, [user, authLoading, isAuthPage, navigate])

  if (authLoading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthPage) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r bg-card z-40">
        <div className="flex h-16 items-center gap-2 px-6 border-b">
          <PiggyBank className="h-6 w-6 text-primary" />
          <span className="font-serif font-semibold text-lg">Sagrada Grana</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}

            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Mais
              </div>
              {SECONDARY_NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <PiggyBank className="h-6 w-6 text-primary" />
            <span className="font-serif font-semibold text-lg">Sagrada Grana</span>
          </div>
          <div className="hidden md:block" /> {/* Spacer for desktop */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around p-2 pb-safe z-40">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center w-full py-1 gap-1 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'fill-primary/20')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
