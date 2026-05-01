// ─── Core domain types for A Sagrada Grana ───────────────────────────────────
// All entities map 1-to-1 to Supabase tables. snake_case fields are mapped
// to camelCase for TypeScript consumers.

// ─── User / Profile ──────────────────────────────────────────────────────────

export type Profile = {
  /** UUID — same as auth.users.id */
  id: string
  /** Apelido exibido na interface ("Olá, Vini") */
  nickname: string
  /** Gasto médio diário calculado no onboarding (R$/dia) */
  dailyAverageExpense: number
  /** Flag de conclusão do onboarding */
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

// ─── Categories ──────────────────────────────────────────────────────────────

export type CategoryType = 'income' | 'expense'

export type Category = {
  id: string
  userId: string
  name: string
  /** Hex color, e.g. "#6366f1" */
  color: string
  /** Lucide icon name, e.g. "utensils" */
  icon: string
  type: CategoryType
  /** Categorias arquivadas são ocultadas da lista mas preservam histórico */
  archived: boolean
  createdAt: string
}

// ─── Fixed Accounts (Plano de Contas) ────────────────────────────────────────

export type FixedAccountType = 'income' | 'expense'

export type FixedAccount = {
  id: string
  userId: string
  description: string
  /** Valor mensal (R$) */
  amount: number
  /** Dia do mês de vencimento/recebimento (1–31) */
  dueDay: number
  type: FixedAccountType
  categoryId: string | null
  /** Indica se essa conta está ativa ou foi cancelada */
  active: boolean
  createdAt: string
  updatedAt: string
}

// ─── Transactions (Diário Financeiro) ────────────────────────────────────────

export type TransactionType = 'entrada' | 'saida' | 'investimento' | 'diario'

/**
 * - `estimado`: gerado automaticamente pelo app (gasto médio diário),
 *   excluído de todos os cálculos analíticos.
 * - `confirmado`: editado manualmente pelo usuário, entra em relatórios.
 */
export type TransactionStatus = 'estimado' | 'confirmado'

export type Transaction = {
  id: string
  userId: string
  /** ISO date string, e.g. "2026-05-01" */
  date: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  /** Nullable — obrigatório apenas para type='diario' */
  categoryId: string | null
  /** Descrição livre (opcional) */
  description: string | null
  createdAt: string
  updatedAt: string
}

// ─── Monthly Snapshot ─────────────────────────────────────────────────────────
// Reservado para futuras otimizações de performance.
// O saldo NUNCA é armazenado: usa-se get_balance_at_date() do Supabase.

export type MonthlySnapshot = {
  id: string
  userId: string
  /** Ano do snapshot */
  year: number
  /** Mês do snapshot (1–12) */
  month: number
  totalEntradas: number
  totalSaidas: number
  totalInvestimentos: number
  totalDiario: number
  /** Saldo no último dia do mês — calculado, nunca editável */
  closingBalance: number
  createdAt: string
  updatedAt: string
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light'

// ─── UI Helpers ───────────────────────────────────────────────────────────────

/** Navigation item used by Shell / bottom nav */
export type NavItem = {
  path: string
  label: string
  /** Lucide icon component */
  icon: React.ComponentType<{ className?: string }>
}
