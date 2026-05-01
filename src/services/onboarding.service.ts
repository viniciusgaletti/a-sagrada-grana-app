import { supabase } from '@/lib/supabase/client'

export type OnboardingData = {
  nickname: string
  initialBalance: number
  fixedAccounts: Array<{
    description: string
    amount: number
    dueDay: number
    category: string
  }>
  variableExpenses: number
  dailyAverageExpense: number
}

export const onboardingService = {
  async checkOnboardingStatus(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data?.onboarding_completed ?? false
  },

  async completeOnboarding(userId: string, data: OnboardingData) {
    const { error: userError } = await supabase.from('users').upsert({
      id: userId,
      nickname: data.nickname,
      daily_average_expense: data.dailyAverageExpense,
      onboarding_completed: true,
    })

    if (userError) throw userError

    const defaultCategories = [
      { name: 'Alimentação', type: 'expense', color: '#EF4444', icon: 'utensils' },
      { name: 'Transporte', type: 'expense', color: '#F59E0B', icon: 'car' },
      { name: 'Saúde', type: 'expense', color: '#10B981', icon: 'heart-pulse' },
      { name: 'Lazer', type: 'expense', color: '#8B5CF6', icon: 'gamepad-2' },
      { name: 'Mercado', type: 'expense', color: '#3B82F6', icon: 'shopping-cart' },
      { name: 'Assinaturas', type: 'expense', color: '#EC4899', icon: 'play-square' },
      { name: 'Vestuário', type: 'expense', color: '#6366F1', icon: 'shirt' },
      { name: 'Educação', type: 'expense', color: '#14B8A6', icon: 'book' },
      { name: 'Outros', type: 'expense', color: '#64748B', icon: 'layout-grid' },
      { name: 'Saldo Inicial', type: 'income', color: '#22C55E', icon: 'wallet' },
    ]

    const { error: catError } = await supabase.from('categories').upsert(
      defaultCategories.map((c) => ({ ...c, user_id: userId })),
      { onConflict: 'user_id, name' },
    )

    if (catError && catError.code !== '23505') {
      console.warn(catError)
    }

    const { data: allCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)

    if (data.fixedAccounts.length > 0) {
      const accountsToInsert = data.fixedAccounts.map((account) => {
        const categoryId =
          allCategories?.find((c) => c.name.toLowerCase() === account.category.toLowerCase())?.id ||
          null

        return {
          user_id: userId,
          description: account.description,
          amount: account.amount,
          due_day: account.dueDay,
          category_id: categoryId,
          category_name: account.category,
        }
      })

      const { error: fixedError } = await supabase.from('fixed_accounts').insert(accountsToInsert)

      if (fixedError) throw fixedError
    }

    const initialCategory = allCategories?.find((c) => c.name === 'Saldo Inicial')?.id
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: userId,
      amount: data.initialBalance,
      description: 'Saldo inicial',
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      status: 'confirmado',
      category_id: initialCategory || null,
    })

    if (txError) throw txError
  },
}
