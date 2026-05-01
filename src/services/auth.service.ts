/**
 * Auth service — todo acesso ao Supabase Auth fica aqui.
 * Componentes e hooks chamam apenas estas funções.
 */
import { supabase } from '@/services/supabase'
import type { User } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthResult<T = void> =
  | { data: T; error: null }
  | { data: null; error: string }

// ─── Error message mapping ────────────────────────────────────────────────────

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'E-mail ou senha incorretos.'
  if (message.includes('Email not confirmed'))
    return 'Confirme seu e-mail antes de entrar.'
  if (message.includes('User already registered'))
    return 'Este e-mail já está cadastrado.'
  if (message.includes('Password should be at least'))
    return 'A senha deve ter pelo menos 6 caracteres.'
  if (message.includes('Unable to validate email address'))
    return 'E-mail inválido.'
  if (message.includes('Email rate limit exceeded'))
    return 'Muitas tentativas. Aguarde alguns minutos.'
  if (message.includes('network') || message.includes('fetch'))
    return 'Erro de conexão. Verifique sua internet.'
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Cria conta + persiste nickname em raw_user_meta_data
 * para o trigger handle_new_user capturar na tabela users.
 */
export async function signUp(
  email: string,
  password: string,
  nickname: string,
): Promise<AuthResult<User>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${window.location.origin}/`,
    },
  })

  if (error) return { data: null, error: translateAuthError(error.message) }
  if (!data.user) return { data: null, error: 'Não foi possível criar a conta.' }
  return { data: data.user, error: null }
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult<User>> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { data: null, error: translateAuthError(error.message) }
  if (!data.user) return { data: null, error: 'Não foi possível entrar.' }
  return { data: data.user, error: null }
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut()
  if (error) return { data: null, error: translateAuthError(error.message) }
  return { data: undefined, error: null }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}

export function onAuthStateChange(
  callback: (user: User | null) => void,
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return { unsubscribe: () => data.subscription.unsubscribe() }
}
