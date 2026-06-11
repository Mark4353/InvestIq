export * from './auth'

export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'expense' | 'income'
}

export type Transactions = Transaction[]
export type TransactionType = Transaction['type']

export type CategoryTotal = {
  name: string
  amount: number
}
