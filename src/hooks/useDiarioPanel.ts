import { useState, useCallback, useEffect } from 'react'
import {
  getDayDiarioTransactions,
  createDiarioTransaction,
  updateDiarioTransaction,
  deleteDiarioTransaction,
} from '@/services/transactions.service'
import type { Transaction } from '@/types'

export function useDiarioPanel(userId: string | undefined, date: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!userId || !date) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await getDayDiarioTransactions(userId, date)
      setTransactions(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar os gastos do dia.')
    } finally {
      setIsLoading(false)
    }
  }, [userId, date])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const total = transactions.reduce((acc, tx) => acc + tx.amount, 0)

  const create = useCallback(
    async (amount: number, categoryId: string | null, description: string | null) => {
      if (!userId || !date) return null
      try {
        const tx = await createDiarioTransaction(userId, date, amount, categoryId, description)
        setTransactions((prev) => [tx, ...prev])
        return tx
      } catch (err: any) {
        throw new Error(err.message || 'Erro ao salvar gasto.')
      }
    },
    [userId, date],
  )

  const update = useCallback(
    async (id: string, amount: number, categoryId: string | null, description: string | null) => {
      try {
        const tx = await updateDiarioTransaction(id, amount, categoryId, description)
        setTransactions((prev) => prev.map((t) => (t.id === id ? tx : t)))
        return tx
      } catch (err: any) {
        throw new Error(err.message || 'Erro ao atualizar gasto.')
      }
    },
    [],
  )

  const remove = useCallback(async (id: string) => {
    try {
      await deleteDiarioTransaction(id)
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao excluir gasto.')
    }
  }, [])

  return {
    transactions,
    total,
    isLoading,
    error,
    create,
    update,
    remove,
    refetch: fetchTransactions,
  }
}
