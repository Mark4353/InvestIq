import type { NextFunction, Request, Response } from 'express'
import { getUserByToken } from '../services/authService.ts'

export interface AuthRequest extends Request {
  user?: {
    userId: string
  }
}

export const requireAuth = async (
  request: AuthRequest,
  response: Response,
  next: NextFunction,
) => {
  const authorization = request.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({ message: 'Authorization required.' })
    return
  }

  const token = authorization.slice('Bearer '.length)
  const user = await getUserByToken(token)

  if (!user) {
    response.status(401).json({ message: 'Invalid token.' })
    return
  }

  request.user = {
    userId: user.id,
  }
  next()
}
