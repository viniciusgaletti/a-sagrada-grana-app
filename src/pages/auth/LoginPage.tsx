import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Insira um e-mail válido.'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.')
    .min(6, 'A senha deve ter pelo menos 6 caracteres.'),
})

type LoginForm = z.infer<typeof loginSchema>

// ─── LoginPage ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginForm) {
    setServerError(null)
    const { error } = await signIn(values.email, values.password)
    if (error) {
      setServerError(error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-4xl" aria-hidden>🌿</span>
          <h1
            className="font-serif text-3xl mt-3"
            style={{ color: 'var(--foreground)' }}
          >
            A Sagrada Grana
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Entre na sua conta
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-[var(--radius)] p-6 shadow-sm"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 rounded-[var(--radius)] text-sm outline-none transition-colors focus:ring-2"
                style={{
                  background: 'var(--background)',
                  border: `1px solid ${errors.email ? 'var(--destructive)' : 'var(--border)'}`,
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--ring)',
                } as React.CSSProperties}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs" style={{ color: 'var(--destructive)' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-[var(--radius)] text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    background: 'var(--background)',
                    border: `1px solid ${errors.password ? 'var(--destructive)' : 'var(--border)'}`,
                    color: 'var(--foreground)',
                  } as React.CSSProperties}
                  {...register('password')}
                />
                <button
                  type="button"
                  id="login-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted-foreground)' }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs" style={{ color: 'var(--destructive)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <p
                className="text-sm text-center px-3 py-2 rounded-lg"
                style={{
                  color: 'var(--destructive)',
                  background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                }}
              >
                {serverError}
              </p>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-full text-sm font-medium transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Link para cadastro */}
        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted-foreground)' }}>
          Não tem uma conta?{' '}
          <Link
            to="/register"
            id="login-goto-register-link"
            className="font-medium transition-opacity hover:opacity-75"
            style={{ color: 'var(--primary)' }}
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
