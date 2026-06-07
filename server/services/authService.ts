import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db'
import { db as envDb } from '../config/env'

type MockUser = { id: string; email: string; password: string; created_at: string }
const mockUsers = new Map<string, MockUser>()

interface AuthPayload {
  email?: string
  password?: string
}

export class AuthError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

const validateCredentials = ({ email, password }: AuthPayload) => {
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
    throw new AuthError(400, 'Enter a valid email.')
  }

  const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/

  if (!password || !passwordPolicy.test(password)) {
    throw new AuthError(
      400,
      'Password must be at least 8 chars with upper, lower, number and symbol.'
    )
  }

  return {
    email: normalizedEmail,
    password,
  }
}

const createToken = (userId: string) => {
  const secret = envDb.jwtSecret || 'change_me'
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' })
}

const serializeUser = (row: unknown) => {
  const r = row as Record<string, unknown>
  return {
    id: String(r['id'] ?? ''),
    email: String(r['email'] ?? ''),
    createdAt: String(r['created_at'] ?? ''),
  }
}

export const registerUser = async (payload: AuthPayload) => {
  const { email, password } = validateCredentials(payload)

  if (!envDb.databaseUrl) {
    for (const u of mockUsers.values()) {
      if (u.email === email) throw new AuthError(409, 'Email already registered.')
    }

    const hashed = await bcrypt.hash(password, 10)
    const id = randomUUID()
    const created_at = new Date().toISOString()
    const user: MockUser = { id, email, password: hashed, created_at }
    mockUsers.set(id, user)

    return {
      token: createToken(id),
      user: serializeUser(user),
    }
  }

  const { rows: existing } = await query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.length > 0) {
    throw new AuthError(409, 'Email already registered.')
  }

  const hashed = await bcrypt.hash(password, 10)
  const id = randomUUID()

  const { rows } = await query(
    'INSERT INTO users(id, email, password) VALUES($1, $2, $3) RETURNING id, email, created_at',
    [id, email, hashed]
  )

  const user = rows[0]

  return {
    token: createToken(user.id),
    user: serializeUser(user),
  }
}

export const loginUser = async (payload: AuthPayload) => {
  const { email, password } = validateCredentials(payload)

  if (!envDb.databaseUrl) {
    const found = Array.from(mockUsers.values()).find((u) => u.email === email)
    if (!found) throw new AuthError(404, 'User not found.')
    const match = await bcrypt.compare(password, found.password)
    if (!match) throw new AuthError(401, 'Incorrect password.')
    return { token: createToken(found.id), user: serializeUser(found) }
  }

  const { rows } = await query('SELECT id, email, password, created_at FROM users WHERE email = $1', [email])
  if (rows.length === 0) {
    throw new AuthError(404, 'User not found.')
  }

  const user = rows[0]
  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw new AuthError(401, 'Incorrect password.')
  }

  return {
    token: createToken(user.id),
    user: serializeUser(user),
  }
}

export const getUserByToken = async (token: string) => {
  try {
    const secret = envDb.jwtSecret || 'change_me'
    const payload = jwt.verify(token, secret) as unknown
    const p = payload as Record<string, unknown>
    const userId = String(p['sub'] ?? '')
    const { rows } = await query('SELECT id, email, created_at FROM users WHERE id = $1', [userId])
    return rows[0] ?? null
  } catch {
    return null
  }
}

export const getUserById = async (id: string) => {
  if (!envDb.databaseUrl) {
    return mockUsers.get(id) ?? null
  }
  const { rows } = await query('SELECT id, email, created_at FROM users WHERE id = $1', [id])
  return rows[0] ?? null
}
