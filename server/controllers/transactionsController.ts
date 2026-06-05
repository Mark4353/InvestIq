import type { Response } from 'express'
import type { AuthRequest } from '../middleware/authMiddleware'
import { listTransactions, createTransaction, deleteTransaction } from '../services/transactionsService'
import type { CreateTransactionPayload } from '../types/transactions'

export const listAll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const rows = await listTransactions(userId)
    res.status(200).json({ transactions: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to list transactions' })
  }
}

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { date, description, category, amount, type } = req.body
    if (!date || !amount || !type) {
      res.status(400).json({ message: 'Missing fields' })
      return
    }

    const payload: CreateTransactionPayload = { date, description, category, amount: Number(amount), type }

    const t = await createTransaction(userId, payload)
    res.status(201).json({ transaction: t })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create transaction' })
  }
}

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { id } = req.params
    if (!id) {
      res.status(400).json({ message: 'Missing id' })
      return
    }
    await deleteTransaction(userId, id)
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete transaction' })
  }
}
