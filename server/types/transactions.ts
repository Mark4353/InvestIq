export interface TransactionRow {
  id: string
  date: string
  description: string | null
  category: string | null
  amount: string
  type: 'income' | 'expense'
}

export interface CreateTransactionPayload {
  date: string
  description?: string
  category?: string
  amount: number
  type: 'income' | 'expense'
}
