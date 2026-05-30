import type { Request, Response } from 'express'
import { AuthError, loginUser, registerUser } from '../services/authService.ts'

const sendError = (response: Response, error: unknown) => {
  if (error instanceof AuthError) {
    response.status(error.statusCode).json({ message: error.message })
    return
  }

  console.error(error)
  response.status(500).json({ message: 'Internal server error.' })
}

export const register = async (request: Request, response: Response) => {
  try {
    const result = await registerUser(request.body)
    response.status(201).json(result)
  } catch (error) {
    sendError(response, error)
  }
}

export const login = async (request: Request, response: Response) => {
  try {
    const result = await loginUser(request.body)
    response.status(200).json(result)
  } catch (error) {
    sendError(response, error)
  }
}
