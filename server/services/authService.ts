import { randomUUID } from 'node:crypto'

interface AuthPayload {
  email?: string
  password?: string
}

interface MockUserRecord {
  id: string
  email: string
  password: string
  createdAt: string
}

export class AuthError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

const usersByEmail = new Map<string, MockUserRecord>()
const usersByToken = new Map<string, MockUserRecord>()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateCredentials = ({ email, password }: AuthPayload) => {
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
    throw new AuthError(400, 'Enter a valid email.')
  }

  if (!password || password.length < 6) {
    throw new AuthError(400, 'Password must be at least 6 characters.')
  }

  return {
    email: normalizedEmail,
    password,
  }
}

const createToken = (user: MockUserRecord) => {
  const token = `mock_${randomUUID()}`
  usersByToken.set(token, user)

  return token
}

const serializeUser = (user: MockUserRecord) => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
})

export const registerUser = async (payload: AuthPayload) => {
  const { email, password } = validateCredentials(payload)
  const existingUser = usersByEmail.get(email)

  if (existingUser) {
    throw new AuthError(409, 'Email is already registered.')
  }

  const user: MockUserRecord = {
    id: randomUUID(),
    email,
    password,
    createdAt: new Date().toISOString(),
  }

  usersByEmail.set(email, user)

  return {
    token: createToken(user),
    user: serializeUser(user),
  }
}

export const loginUser = async (payload: AuthPayload) => {
  const { email, password } = validateCredentials(payload)
  const user = usersByEmail.get(email)

  if (!user || user.password !== password) {
    throw new AuthError(401, 'Invalid email or password.')
  }

  return {
    token: createToken(user),
    user: serializeUser(user),
  }
}

export const getUserByToken = (token: string) => {
  return usersByToken.get(token)
}
