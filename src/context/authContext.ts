import { createContext } from 'react'
import type { AuthUser } from '../types/auth'

export interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  setSession: (token: string, user: AuthUser) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
