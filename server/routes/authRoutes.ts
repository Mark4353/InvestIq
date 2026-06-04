import { Router } from 'express'
import { login, register, me } from '../controllers/authController.ts'
import { requireAuth } from '../middleware/authMiddleware.ts'

export const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', requireAuth, me)
