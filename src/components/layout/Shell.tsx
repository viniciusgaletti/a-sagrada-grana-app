import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { BookOpen, LayoutDashboard, TrendingUp, Wallet, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

// ─── Navigation items ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { path: '/', label: 'Diário', icon: BookOpen },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/economia', label: 'Economia', icon: TrendingUp },
  { path: '/contas', label: 'Contas', icon: Wallet },
  { path: '/configuracoes', label: 'Config.', icon: Settings },
] as const

// ─── Shell ────────────────────────────────────────────────────────────────────

export function Shell() {
  const location = useLocation()

  // Onboarding route renders without navigation
  if (location.pathname === '/onboarding') {
    return <Outlet />
  }

  return (
    <div className="flex min-h-[100dvh] bg-background text-foreground">
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 border-r z-40"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 h-16 px-5 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-xl" aria-hidden>
            🌿
          </span>
          <span className="font-serif text-lg leading-none" style={{ color: 'var(--foreground)' }}>
            A Sagrada Grana
          </span>
        </div>

        {/* Nav links */}
        <nav
          className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5"
          aria-label="Navegação principal"
        >
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              id={`sidebar-nav-${label.toLowerCase().replace(/[^a-z]/g, '-')}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive ? 'text-primary-foreground' : 'hover:bg-accent',
                )
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--primary)' : undefined,
                color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              })}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle at bottom */}
        <div
          className="p-4 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Tema
          </span>
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 md:ml-60 min-h-[100dvh]">
        {/* Mobile header */}
        <header
          className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between px-4 border-b backdrop-blur-sm"
          style={{
            background: 'color-mix(in srgb, var(--background) 85%, transparent)',
            borderColor: 'var(--border)',
          }}
        >
          <span
            className="font-serif text-base leading-none"
            style={{ color: 'var(--foreground)' }}
          >
            🌿 A Sagrada Grana
          </span>
          <ThemeToggle />
        </header>

        {/* Page content — pb-20 to clear mobile nav bar */}
        <main className="flex-1 w-full pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom navigation ──────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        aria-label="Navegação inferior"
      >
        <div className="flex justify-around items-center h-16 px-2 safe-area-bottom">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              id={`bottom-nav-${label.toLowerCase().replace(/[^a-z]/g, '-')}`}
              className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors"
              style={({ isActive }) => ({
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
