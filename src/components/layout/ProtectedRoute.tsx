import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase'
import { useEffect, useState } from 'react'

// ─── Onboarding check ─────────────────────────────────────────────────────────

type OnboardingStatus = 'loading' | 'pending' | 'complete'

function useOnboardingStatus(userId: string | undefined): OnboardingStatus {
  const [status, setStatus] = useState<OnboardingStatus>('loading')

  useEffect(() => {
    if (!userId) return

    supabase
      .from('users')
      .select('onboarding_completed_at')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.onboarding_completed_at) {
          setStatus('complete')
        } else {
          setStatus('pending')
        }
      })
      .catch(() => {
        // Row not yet created (trigger may be async) — treat as pending
        setStatus('pending')
      })
  }, [userId])

  return status
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function FullPageSpinner() {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="h-8 w-8 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────

/**
 * Guards all app routes.
 *
 * Flow:
 * 1. Auth loading  → full-page spinner
 * 2. Not authenticated → /login
 * 3. Onboarding loading → full-page spinner
 * 4. Onboarding pending → /onboarding
 * 5. Onboarding complete → render <Outlet />
 */
export function ProtectedRoute() {
  const { user, isLoading: authLoading } = useAuth()
  const location = useLocation()

  const onboardingStatus = useOnboardingStatus(authLoading || !user ? undefined : user.id)

  // Step 1 — waiting for Supabase session
  if (authLoading) return <FullPageSpinner />

  // Step 2 — not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Step 3 — waiting for onboarding check
  if (onboardingStatus === 'loading') return <FullPageSpinner />

  // Step 4 — onboarding not completed
  if (onboardingStatus === 'pending') {
    return <Navigate to="/onboarding" replace />
  }

  // Step 5 — fully authenticated and onboarded
  return <Outlet />
}
