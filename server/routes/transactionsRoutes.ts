import { Router } from 'express'
import { listAll, create, remove } from '../controllers/transactionsController'
import { requireAuth } from '../middleware/authMiddleware'

export const transactionsRouter = Router()

transactionsRouter.get('/', requireAuth, listAll)
transactionsRouter.post('/', requireAuth, create)
transactionsRouter.delete('/:id', requireAuth, remove)
