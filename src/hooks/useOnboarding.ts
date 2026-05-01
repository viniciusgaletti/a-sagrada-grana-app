import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import {
  updateProfile,
  seedCategories,
  createFixedAccounts,
  createInitialBalance,
  createEstimatedDailyTransactions,
  markOnboardingComplete,
  type FixedAccountInput,
} from '@/services/onboarding.service'

// ─── Zod schemas (um por etapa) ───────────────────────────────────────────────

export const step1Schema = z.object({
  nickname: z
    .string()
    .min(2, 'O apelido deve ter pelo menos 2 caracteres.')
    .max(30, 'O apelido deve ter no máximo 30 caracteres.')
    .trim(),
})

export const step2Schema = z.object({
  initialBalance: z
    .number({ message: 'Insira um valor numérico.' })
    .min(0, 'O saldo não pode ser negativo.'),
})

const fixedAccountSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória.'),
  amount: z.number({ message: 'Valor inválido.' }).positive('O valor deve ser maior que zero.'),
  dueDay: z.number().int().min(1, 'Dia inválido.').max(31, 'Dia inválido.'),
  type: z.enum(['entrada', 'saida']),
})

export const step3Schema = z.object({
  fixedAccounts: z.array(fixedAccountSchema),
})

export const step4Schema = z.object({
  variableExpenses: z
    .number({ message: 'Insira um valor numérico.' })
    .min(0, 'O valor não pode ser negativo.'),
})

// ─── State types ──────────────────────────────────────────────────────────────

export type OnboardingData = {
  nickname: string
  initialBalance: number
  fixedAccounts: FixedAccountInput[]
  variableExpenses: number
}

const INITIAL_DATA: OnboardingData = {
  nickname: '',
  initialBalance: 0,
  fixedAccounts: [],
  variableExpenses: 0,
}

export type StepErrors = Record<string, string>

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOnboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [stepErrors, setStepErrors] = useState<StepErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dailyAverage = data.variableExpenses > 0 ? data.variableExpenses / 31 : 0

  // ── Helpers ──────────────────────────────────────────────────────────────

  function updateData(partial: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...partial }))
    setStepErrors({})
    setError(null)
  }

  function validateStep(step: number): boolean {
    let result: any

    if (step === 1) {
      result = step1Schema.safeParse({ nickname: data.nickname })
    } else if (step === 2) {
      result = step2Schema.safeParse({ initialBalance: data.initialBalance })
    } else if (step === 3) {
      result = step3Schema.safeParse({ fixedAccounts: data.fixedAccounts })
    } else {
      result = step4Schema.safeParse({ variableExpenses: data.variableExpenses })
    }

    if (!result.success) {
      const errs: StepErrors = {}
      result.error.issues.forEach((issue) => {
        const key = issue.path.join('.')
        if (!errs[key]) errs[key] = issue.message
      })
      setStepErrors(errs)
      return false
    }

    setStepErrors({})
    return true
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (!validateStep(currentStep)) return
    setCurrentStep((s) => Math.min(s + 1, 4))
  }, [currentStep, data])

  const goBack = useCallback(() => {
    setStepErrors({})
    setCurrentStep((s) => Math.max(s - 1, 1))
  }, [])

  // ── Submit (etapa 4 → concluir) ──────────────────────────────────────────

  const completeOnboarding = useCallback(async () => {
    if (!validateStep(4)) return
    if (!user) {
      setError('Usuário não autenticado.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Atualiza perfil
      await updateProfile(user.id, data.nickname.trim(), dailyAverage)

      // 2. Semeie categorias padrão
      await seedCategories(user.id)

      // 3. Contas fixas
      await createFixedAccounts(user.id, data.fixedAccounts)

      // 4. Saldo inicial
      await createInitialBalance(user.id, data.initialBalance)

      // 5. Estimativas diárias (12 meses)
      await createEstimatedDailyTransactions(user.id, dailyAverage)

      // 6. Marcar onboarding concluído
      await markOnboardingComplete(user.id)

      navigate('/', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [user, data, dailyAverage, navigate])

  return {
    currentStep,
    data,
    updateData,
    stepErrors,
    isLoading,
    error,
    dailyAverage,
    goNext,
    goBack,
    completeOnboarding,
  }
}
