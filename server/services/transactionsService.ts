import { randomUUID } from 'node:crypto'
import { query } from '../db'
import type { TransactionRow, CreateTransactionPayload } from '../types/transactions'

export const listTransactions = async (userId: string): Promise<TransactionRow[]> => {
  const { rows } = await query(
    "SELECT id, to_char(date, 'YYYY-MM-DD') as date, description, category, amount, type FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC",
    [userId]
  )
  return rows
}

export const createTransaction = async (userId: string, payload: CreateTransactionPayload) => {
  const id = randomUUID()
  const { rows } = await query(
    "INSERT INTO transactions(id, user_id, date, description, category, amount, type) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id, to_char(date, 'YYYY-MM-DD') as date, description, category, amount, type",
    [id, userId, payload.date, payload.description ?? null, payload.category ?? null, payload.amount, payload.type]
  )
  return rows[0]
}

export const deleteTransaction = async (userId: string, id: string) => {
  await query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId])
}
