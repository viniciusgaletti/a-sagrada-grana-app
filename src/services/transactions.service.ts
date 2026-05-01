/**
 * Transactions service — todo acesso à tabela transactions fica aqui.
 * CLAUDE.md: NUNCA acesse o Supabase fora de src/services/.
 */
import { supabase } from '@/services/supabase'
import type { Transaction, TransactionType, TransactionStatus } from '@/types'

// ─── Row shape from Supabase (snake_case) ────────────────────────────────────

type TxRow = {
  id: string
  user_id: string
  date: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  category_id: string | null
  description: string | null
  is_initial_balance: boolean
  created_at: string
  updated_at: string
}

function rowToTx(row: TxRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    type: row.type,
    amount: row.amount,
    status: row.status,
    categoryId: row.category_id,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Busca todas as transactions de um mês específico, ordenadas por data.
 */
export async function getMonthTransactions(
  userId: string,
  year: number,
  month: number,
): Promise<Transaction[]> {
  const mm = String(month).padStart(2, '0')
  const start = `${year}-${mm}-01`
  // Last day via date arithmetic
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Erro ao buscar transações: ${error.message}`)
  return (data as TxRow[]).map(rowToTx)
}

/**
 * Busca o closing_balance do monthly_snapshot do mês anterior.
 * Retorna 0 se não existir (primeiro mês de uso).
 */
export async function getSnapshotBefore(
  userId: string,
  year: number,
  month: number,
): Promise<number> {
  // Compute previous month
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year

  const { data, error } = await supabase
    .from('monthly_snapshots')
    .select('closing_balance')
    .eq('user_id', userId)
    .eq('year', prevYear)
    .eq('month', prevMonth)
    .maybeSingle()

  if (error) throw new Error(`Erro ao buscar snapshot: ${error.message}`)
  return (data as { closing_balance: number } | null)?.closing_balance ?? 0
}

/**
 * Insere uma nova transaction ou atualiza uma existente por (user_id, date, type).
 * Para type='diario', não usa upsert — cada transação diária é independente.
 */
export async function upsertTransaction(tx: {
  userId: string
  date: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  categoryId?: string | null
  description?: string | null
}): Promise<Transaction> {
  // For single-per-day types (entrada, saida, investimento), upsert on (user_id, date, type)
  // This requires a unique constraint on the DB. We use select+update or insert pattern.
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', tx.userId)
    .eq('date', tx.date)
    .eq('type', tx.type)
    .neq('type', 'diario') // diario transactions are never upserted this way
    .maybeSingle()

  if (existing?.id) {
    // Update
    const { data, error } = await supabase
      .from('transactions')
      .update({
        amount: tx.amount,
        status: tx.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw new Error(`Erro ao atualizar transação: ${error.message}`)
    return rowToTx(data as TxRow)
  }

  // Insert
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: tx.userId,
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      category_id: tx.categoryId ?? null,
      description: tx.description ?? null,
      is_initial_balance: false,
    })
    .select()
    .single()

  if (error) throw new Error(`Erro ao inserir transação: ${error.message}`)
  return rowToTx(data as TxRow)
}

/**
 * Atualiza amount e muda status para 'confirmado' de uma transaction existente.
 * Usado quando o usuário edita um valor pré-populado (estimado → confirmado).
 */
export async function updateTransactionStatus(
  id: string,
  amount: number,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      amount,
      status: 'confirmado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Erro ao confirmar transação: ${error.message}`)
  return rowToTx(data as TxRow)
}

// ─── Operações Específicas do Diário ──────────────────────────────────────────

export async function getDayDiarioTransactions(userId: string, date: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('type', 'diario')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao buscar gastos do dia: ${error.message}`)
  return (data || []).map((row) => rowToTx(row as TxRow))
}

export async function createDiarioTransaction(
  userId: string, 
  date: string, 
  amount: number, 
  categoryId: string | null, 
  description: string | null
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      date,
      type: 'diario',
      amount,
      status: 'confirmado',
      category_id: categoryId,
      description,
    })
    .select()
    .single()

  if (error) throw new Error(`Erro ao criar gasto: ${error.message}`)
  return rowToTx(data as TxRow)
}

export async function updateDiarioTransaction(
  id: string, 
  amount: number, 
  categoryId: string | null, 
  description: string | null
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      amount,
      category_id: categoryId,
      description,
      status: 'confirmado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Erro ao atualizar gasto: ${error.message}`)
  return rowToTx(data as TxRow)
}

export async function deleteDiarioTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Erro ao excluir gasto: ${error.message}`)
}
