export type User = {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt: string
}

export type TransactionType = 'income' | 'expense'

export type Category = {
  id: string
  name: string
  color: string
  icon?: string
  type: TransactionType
  userId: string
}

export type Transaction = {
  id: string
  amount: number
  description: string
  date: string
  type: TransactionType
  categoryId: string
  userId: string
  createdAt: string
}

export type Theme = 'dark' | 'light' | 'system'
