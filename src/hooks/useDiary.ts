import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  getMonthTransactions,
  getSnapshotBefore,
  upsertTransaction,
  updateTransactionStatus,
} from '@/services/transactions.service'
import { calcMonthBalance, sumByType } from '@/utils/balance'
import { daysInMonth } from '@/utils'
import type { Transaction, TransactionType } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DayData = {
  /** ISO date string, e.g. "2026-05-01" */
  date: string
  dayNumber: number
  weekday: string
  isFuture: boolean
  isToday: boolean
  /** Saldo acumulado calculado para este dia */
  balance: number
  /** Totais por tipo para exibição */
  entrada: number
  saida: number
  investimento: number
  /** Soma de todas as transactions type='diario' do dia */
  diario: number
  /** Raw transactions — usadas pelo painel de detalhamento futuro */
  transactions: Transaction[]
}

// ─── Weekday formatting ───────────────────────────────────────────────────────

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function formatWeekday(date: Date): string {
  return WEEKDAYS[date.getDay()]
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDiary(year: number, month: number) {
  const { user } = useAuth()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [snapshotBalance, setSnapshotBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track last edited timestamp in localStorage
  const [lastEdit, setLastEdit] = useState<string | null>(() => {
    try {
      return localStorage.getItem('diary_last_edit')
    } catch {
      return null
    }
  })

  // Abort controller ref for cleanup
  const abortRef = useRef<AbortController | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!user) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const [txs, snapshot] = await Promise.all([
        getMonthTransactions(user.id, year, month),
        getSnapshotBefore(user.id, year, month),
      ])
      setTransactions(txs)
      setSnapshotBalance(snapshot)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar dados.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [user, year, month])

  useEffect(() => {
    fetchData()
    return () => abortRef.current?.abort()
  }, [fetchData])

  // ── Derived data ───────────────────────────────────────────────────────────

  const total = daysInMonth(year, month)
  const todayISO = new Date().toISOString().split('T')[0]

  // Compute balances for all days
  const balances = calcMonthBalance(snapshotBalance, transactions, total)

  // Build DayData array
  const days: DayData[] = Array.from({ length: total }, (_, i) => {
    const d = i + 1
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    const dateObj = new Date(`${dateStr}T12:00:00`)

    const dayTxs = transactions.filter((tx) => tx.date === dateStr)

    return {
      date: dateStr,
      dayNumber: d,
      weekday: formatWeekday(dateObj),
      isFuture: dateStr > todayISO,
      isToday: dateStr === todayISO,
      balance: balances[i],
      entrada: sumByType(dayTxs, 'entrada'),
      saida: sumByType(dayTxs, 'saida'),
      investimento: sumByType(dayTxs, 'investimento'),
      diario: sumByType(dayTxs, 'diario'),
      transactions: dayTxs,
    }
  })

  // ── updateField ────────────────────────────────────────────────────────────

  const updateField = useCallback(
    async (date: string, type: TransactionType, amount: number) => {
      if (!user) return

      // Find existing transaction of this type for this day
      const existing = transactions.find((tx) => tx.date === date && tx.type === type)

      let updated: Transaction

      if (existing && existing.status === 'estimado') {
        // Confirm estimated transaction
        updated = await updateTransactionStatus(existing.id, amount)
      } else {
        // Upsert (create or update confirmed)
        updated = await upsertTransaction({
          userId: user.id,
          date,
          type,
          amount,
          status: 'confirmado',
        })
      }

      // Optimistic local update
      setTransactions((prev) => {
        const without = prev.filter(
          (tx) =>
            tx.id !== updated.id &&
            !(tx.date === date && tx.type === type && tx.status === 'confirmado'),
        )
        return [...without, updated].sort((a, b) => a.date.localeCompare(b.date))
      })

      // Persist last edit timestamp
      const ts = new Date().toLocaleString('pt-BR')
      setLastEdit(ts)
      try {
        localStorage.setItem('diary_last_edit', ts)
      } catch {
        // ignore
      }
    },
    [user, transactions],
  )

  return {
    days,
    isLoading,
    error,
    lastEdit,
    refetch: fetchData,
    /** Saldo do mês anterior (ponto de partida) */
    snapshotBalance,
    /** Raw transactions for summary calculation */
    transactions,
    /** Function to update transaction values directly */
    updateField,
  }
}
