/**
 * Balance calculation — funções puras, sem efeitos colaterais.
 * CLAUDE.md: saldo é SEMPRE derivado das transactions. Nunca armazenado.
 *
 * Sinais:
 *   entrada      → +amount
 *   saida        → -amount
 *   investimento → -amount
 *   diario       → -amount
 */
import type { Transaction, TransactionType } from '@/types'

const SIGN: Record<TransactionType, 1 | -1> = {
  entrada: 1,
  saida: -1,
  investimento: -1,
  diario: -1,
}

/**
 * Soma o impacto de uma lista de transactions no saldo.
 * Transactions com status='estimado' são incluídas aqui para projeção
 * (o dashboard as exclui, mas o Diário exibe tudo).
 */
export function calcDayBalance(
  prevBalance: number,
  transactions: Transaction[],
): number {
  const delta = transactions.reduce(
    (acc, tx) => acc + SIGN[tx.type] * tx.amount,
    0,
  )
  return prevBalance + delta
}

/**
 * Calcula o saldo de cada dia do mês.
 * Retorna um array indexado por dia (índice 0 = dia 1).
 */
export function calcMonthBalance(
  snapshotBalance: number,
  allTransactions: Transaction[],
  daysInMonth: number,
): number[] {
  // Group transactions by date string
  const byDate = new Map<string, Transaction[]>()
  for (const tx of allTransactions) {
    const list = byDate.get(tx.date) ?? []
    list.push(tx)
    byDate.set(tx.date, list)
  }

  const balances: number[] = []
  let running = snapshotBalance

  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(d).padStart(2, '0')
    // We need year+month context: caller will supply pre-formatted date keys
    // Use a placeholder prefix — real keys are supplied by the caller via allTransactions
    // We match by day number within what was provided
    const dayTxs = allTransactions.filter((tx) => {
      const day = parseInt(tx.date.split('-')[2], 10)
      return day === d
    })
    running = calcDayBalance(running, dayTxs)
    balances.push(running)
  }

  return balances
}

/**
 * Extracts the total amount of a specific type for a day's transactions.
 */
export function sumByType(
  transactions: Transaction[],
  type: TransactionType,
): number {
  return transactions
    .filter((tx) => tx.type === type)
    .reduce((acc, tx) => acc + tx.amount, 0)
}

/**
 * Calcula o resumo financeiro do mês
 */
export function calcMonthSummary(
  snapshotBalance: number,
  transactions: Transaction[]
) {
  const totalEntradas = sumByType(transactions, 'entrada')
  const totalSaidas = sumByType(transactions, 'saida')
  const totalInvestimentos = sumByType(transactions, 'investimento')
  const totalDiario = sumByType(transactions, 'diario')
  
  const saidaTotal = totalSaidas + totalInvestimentos + totalDiario
  const performanceBruta = totalEntradas - saidaTotal
  const performanceConsumo = totalEntradas - (totalSaidas + totalDiario)
  const taxaEconomia = totalEntradas > 0 ? (totalInvestimentos / totalEntradas) * 100 : 0
  
  return {
    totalEntradas,
    totalSaidas,
    totalInvestimentos,
    totalDiario,
    saidaTotal,
    performanceBruta,
    performanceConsumo,
    taxaEconomia
  }
}

