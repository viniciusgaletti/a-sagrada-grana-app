import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  onAuthStateChange,
} from '@/services/auth.service'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthAction<TArgs extends unknown[]> = (
  ...args: TArgs
) => Promise<{ error: string | null }>

export type UseAuthReturn = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: AuthAction<[email: string, password: string]>
  signUp: AuthAction<[email: string, password: string, nickname: string]>
  signOut: () => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Sync with Supabase auth state changes (login, logout, token refresh)
    const { unsubscribe } = onAuthStateChange((nextUser) => {
      setUser(nextUser)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = useCallback<AuthAction<[string, string]>>(async (email, password) => {
    const result = await authSignIn(email, password)
    return { error: result.error }
  }, [])

  const signUp = useCallback<AuthAction<[string, string, string]>>(
    async (email, password, nickname) => {
      const result = await authSignUp(email, password, nickname)
      return { error: result.error }
    },
    [],
  )

  const signOut = useCallback(async () => {
    await authSignOut()
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signIn,
    signUp,
    signOut,
  }
}
