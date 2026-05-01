/**
 * Onboarding service — todas as escritas do fluxo de onboarding ficam aqui.
 * NUNCA acesse o Supabase fora de src/services/.
 */
import { supabase } from '@/services/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FixedAccountInput = {
  description: string
  amount: number
  dueDay: number
  /** 'entrada' | 'saida' */
  type: 'entrada' | 'saida'
}

export type OnboardingPayload = {
  nickname: string
  initialBalance: number
  fixedAccounts: FixedAccountInput[]
  variableExpenses: number
  dailyAverage: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Generates ISO date strings for every day across `months` months starting
 * from the first day of the current month.
 */
function generateDates(months: number): string[] {
  const dates: string[] = []
  const now = new Date()
  const startYear = now.getFullYear()
  const startMonth = now.getMonth() // 0-indexed

  for (let m = 0; m < months; m++) {
    const year = startYear + Math.floor((startMonth + m) / 12)
    const month = (startMonth + m) % 12
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      dates.push(`${year}-${mm}-${dd}`)
    }
  }

  return dates
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * 1. Atualiza o profile do usuário com nickname e daily_average.
 */
export async function updateProfile(
  userId: string,
  nickname: string,
  dailyAverage: number,
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, nickname, daily_average_expense: dailyAverage })

  if (error) throw new Error(`Erro ao salvar perfil: ${error.message}`)
}

/**
 * 2. Chama a função do banco seed_default_categories(user_id).
 *    Se a função não existir, faz upsert manual das categorias padrão.
 */
export async function seedCategories(userId: string): Promise<void> {
  // Tenta a RPC primeiro
  const { error: rpcError } = await supabase.rpc('seed_default_categories', {
    p_user_id: userId,
  })

  if (!rpcError) return

  // Fallback: upsert manual
  const defaults = [
    { name: 'Alimentação', color: '#EF4444', icon: 'utensils' },
    { name: 'Transporte', color: '#F59E0B', icon: 'car' },
    { name: 'Saúde e Farmácia', color: '#10B981', icon: 'heart-pulse' },
    { name: 'Lazer e Entretenimento', color: '#8B5CF6', icon: 'gamepad-2' },
    { name: 'Mercado', color: '#3B82F6', icon: 'shopping-cart' },
    { name: 'Assinaturas e Serviços', color: '#EC4899', icon: 'play-square' },
    { name: 'Vestuário', color: '#6366F1', icon: 'shirt' },
    { name: 'Educação', color: '#14B8A6', icon: 'book' },
    { name: 'Outros', color: '#64748B', icon: 'layout-grid' },
  ]

  const { error } = await supabase.from('categories').upsert(
    defaults.map((c) => ({ ...c, user_id: userId, archived: false })),
    { onConflict: 'user_id,name' },
  )

  if (error) console.warn('seedCategories fallback error:', error.message)
}

/**
 * 3. Insere as contas fixas cadastradas na etapa 3.
 *    Ignora lista vazia silenciosamente.
 */
export async function createFixedAccounts(
  userId: string,
  accounts: FixedAccountInput[],
): Promise<void> {
  if (accounts.length === 0) return

  const rows = accounts.map((a) => ({
    user_id: userId,
    description: a.description,
    amount: a.amount,
    due_day: a.dueDay,
    type: a.type,
  }))

  const { error } = await supabase.from('fixed_accounts').insert(rows)
  if (error) throw new Error(`Erro ao salvar contas fixas: ${error.message}`)
}

/**
 * 4. Insere o saldo inicial como transaction de entrada confirmada.
 */
export async function createInitialBalance(userId: string, amount: number): Promise<void> {
  const { error } = await supabase.from('transactions').insert({
    user_id: userId,
    date: todayISO(),
    type: 'entrada',
    amount,
    status: 'confirmado',
    is_initial_balance: true,
    description: 'Saldo inicial',
  })

  if (error) throw new Error(`Erro ao registrar saldo inicial: ${error.message}`)
}

/**
 * 5. Gera transactions estimadas de gasto diário para os próximos 12 meses.
 *    Uma transaction type='diario', status='estimado' por dia.
 *    Usa insert em batches de 500 para evitar limites do PostgREST.
 */
export async function createEstimatedDailyTransactions(
  userId: string,
  dailyAverage: number,
): Promise<void> {
  if (dailyAverage <= 0) return

  const dates = generateDates(12)

  const rows = dates.map((date) => ({
    user_id: userId,
    date,
    type: 'diario',
    amount: dailyAverage,
    status: 'estimado',
    description: null,
    is_initial_balance: false,
  }))

  const BATCH = 500
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from('transactions').insert(rows.slice(i, i + BATCH))
    if (error) throw new Error(`Erro ao gerar estimativas: ${error.message}`)
  }
}

/**
 * 6. Marca onboarding como concluído.
 */
export async function markOnboardingComplete(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw new Error(`Erro ao finalizar onboarding: ${error.message}`)
}
