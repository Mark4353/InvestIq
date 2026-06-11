import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Transaction, TransactionType } from '../types'
import { apiBase } from '../utils/api'

const localTransactionsKey = 'investiq_transactions'

export const normalizeTransaction = (value: unknown): Transaction => {
  const item = value as Partial<Transaction> & { amount?: unknown }

  return {
    id: String(item.id ?? crypto.randomUUID()),
    date: String(item.date ?? ''),
    description: String(item.description ?? ''),
    category: String(item.category ?? ''),
    amount: Number(item.amount ?? 0),
    type: item.type === 'income' ? 'income' : 'expense',
  }
}

export const readLocalTransactions = (): Transaction[] => {
  try {
    const storedValue = localStorage.getItem(localTransactionsKey)
    if (!storedValue) return []

    const parsedValue = JSON.parse(storedValue) as unknown[]
    return parsedValue.map(normalizeTransaction)
  } catch {
    return []
  }
}

const saveLocalTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(localTransactionsKey, JSON.stringify(transactions))
  } catch {
    return
  }
}

export const createLocalTransaction = (
  type: TransactionType,
  date: string,
  description: string,
  amount: number,
  category: string,
): Transaction => ({
  id: crypto.randomUUID(),
  date,
  description,
  category: type === 'expense' ? category || 'Інше' : category || 'Дохід',
  amount,
  type,
})

const fetchRemoteTransactions = async (token?: string | null) => {
  const headers: HeadersInit | undefined = token
    ? { Authorization: `Bearer ${token}` }
    : undefined
  const response = await fetch(`${apiBase}/api/transactions`, { headers })

  if (!response.ok) return null

  const data = await response.json()
  return (data.transactions ?? []).map(normalizeTransaction)
}

const createRemoteTransaction = async (transaction: Transaction, token: string) => {
  const response = await fetch(`${apiBase}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(transaction),
  })

  if (!response.ok) {
    throw new Error('Failed to create transaction')
  }

  const data = await response.json()
  return normalizeTransaction(data.transaction)
}

export const useTransactions = (
  token?: string | null,
  initialTransactions: Transaction[] = [],
) => {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions.length > 0 ? initialTransactions : readLocalTransactions,
  )
  const [isRefreshing, setIsRefreshing] = useState(false)

  const balance = useMemo(
    () =>
      transactions.reduce(
        (total, transaction) =>
          transaction.type === 'income'
            ? total + transaction.amount
            : total - transaction.amount,
        0,
      ),
    [transactions],
  )

  const loadTransactions = useCallback(async () => {
    setIsRefreshing(true)

    try {
      const nextTransactions = await fetchRemoteTransactions(token)

      if (!nextTransactions) {
        setTransactions(readLocalTransactions())
        return null
      }

      setTransactions(nextTransactions)
      saveLocalTransactions(nextTransactions)
      return nextTransactions
    } catch (error) {
      console.error('Failed to load transactions', error)
      setTransactions(readLocalTransactions())
      return null
    } finally {
      setIsRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTransactions()
  }, [loadTransactions])

  const persistTransaction = useCallback((transaction: Transaction) => {
    setTransactions((currentTransactions) => {
      const nextTransactions = [transaction, ...currentTransactions]
      saveLocalTransactions(nextTransactions)
      return nextTransactions
    })
  }, [])

  const saveTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!token) {
        persistTransaction(transaction)
        return transaction
      }

      const savedTransaction = await createRemoteTransaction(transaction, token)
      persistTransaction(savedTransaction)
      return savedTransaction
    },
    [persistTransaction, token],
  )

  return {
    balance,
    isRefreshing,
    loadTransactions,
    persistTransaction,
    saveTransaction,
    setTransactions,
    transactions,
  }
}
