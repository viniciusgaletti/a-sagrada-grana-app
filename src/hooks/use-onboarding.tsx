import { useState } from 'react'
import { OnboardingData, onboardingService } from '@/services/onboarding.service'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export const useOnboarding = () => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [data, setData] = useState<OnboardingData>({
    nickname: '',
    initialBalance: 0,
    fixedAccounts: [{ description: '', amount: 0, dueDay: 1, category: '' }],
    variableExpenses: 0,
    dailyAverageExpense: 0,
  })

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((d) => ({ ...d, ...updates }))
    setError(null)
  }

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (data.nickname.length < 2 || data.nickname.length > 30) {
        return 'O apelido deve ter entre 2 e 30 caracteres.'
      }
    }
    if (currentStep === 2) {
      if (isNaN(data.initialBalance)) return 'Insira um valor válido.'
    }
    if (currentStep === 3) {
      if (data.fixedAccounts.length === 0) return 'Cadastre pelo menos uma conta fixa.'
      for (const acc of data.fixedAccounts) {
        if (!acc.description || !acc.amount || !acc.category)
          return 'Preencha todos os campos das contas.'
        if (acc.dueDay < 1 || acc.dueDay > 31) return 'O dia de vencimento deve ser entre 1 e 31.'
      }
    }
    if (currentStep === 4) {
      if (isNaN(data.variableExpenses) || data.variableExpenses <= 0)
        return 'Insira um valor válido maior que zero.'
    }
    return null
  }

  const nextStep = () => {
    const validationError = validateStep(step)
    if (validationError) {
      setError(validationError)
      return
    }
    if (step === 4) {
      updateData({ dailyAverageExpense: data.variableExpenses / 31 })
    }
    setStep((s) => Math.min(s + 1, 5))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const submit = async () => {
    if (!user) {
      toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' })
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onboardingService.completeOnboarding(user.id, data)
      toast({ title: 'Pronto! Bem-vindo ao A Sagrada Grana.' })
      navigate('/')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar. Tente novamente.',
        variant: 'destructive',
      })
      setError('Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return { step, loading, error, setError, data, updateData, nextStep, prevStep, submit }
}
